'use strict';

/**
 * MomCare - AI产检报告解读云函数
 * 统一模型路由器，支持 DeepSeek、Qwen、Kimi 三种大语言模型
 */

// Load environment variables from .env file
require('dotenv').config({ path: __dirname + '/.env' });

exports.main = async (event, context) => {
	const { ocrText, modelChoice = 'deepseek' } = event;

	// ==================== 参数验证 ====================

	if (!ocrText || typeof ocrText !== 'string') {
		return {
			errCode: 400,
			errMsg: '参数错误: ocrText 必须是非空字符串'
		};
	}

	if (!['deepseek', 'qwen', 'kimi'].includes(modelChoice)) {
		return {
			errCode: 400,
			errMsg: `不支持的模型: ${modelChoice}，支持的模型: deepseek, qwen, kimi`
		};
	}

	// ==================== 系统提示词 ====================

	const SYSTEM_PROMPT = `你现在是一位经验丰富、极其专业且富有同理心的妇产科主治医生。你的任务是解读用户上传的产检报告 OCR 识别文本，缓解孕妈的焦虑，并用通俗易懂的语言解释专业医学指标。

【严格工作规范】
1. 语言风格：必须极度温和、通俗易懂。
2. 绝对红线：无权进行任何疾病诊断和处方建议。
3. 异常处理：客观解释其在孕期常见的可能性。

【强制输出格式】
必须且只能输出合法的 JSON 格式：
{
	"report_type": "血常规/尿常规/B超/唐筛/糖耐等",
	"overall_summary": "整体情况的2-3句话总结，语气温暖安抚",
	"abnormal_indicators": [
		{
			"name": "指标名称",
			"value": "检测值",
			"reference_range": "参考范围",
			"explanation": "用通俗语言解释此项指标的意义",
			"severity": "normal/warning/danger"
		}
	],
	"normal_highlights": "正常指标中的亮点（如胎儿发育良好等）",
	"action_suggestions": [
		"建议1",
		"建议2",
		"建议3"
	],
	"disclaimer": "以上内容由AI生成，仅供参考，不构成医疗建议，具体情况请以主治医生意见为准。"
}`;

	// ==================== 模型配置路由 ====================

	let baseURL, apiKey, modelName;

	switch (modelChoice) {
		case 'deepseek':
			baseURL = 'https://api.siliconflow.cn/v1';
			apiKey = process.env.DEEPSEEK_API_KEY;
			modelName = 'deepseek-ai/DeepSeek-V3';
			break;
		case 'qwen':
			baseURL = 'https://dashscope.aliyuncs.com/compatible-mode/v1';
			apiKey = process.env.QWEN_API_KEY;
			modelName = 'qwen-plus';
			break;
		case 'kimi':
			baseURL = 'https://api.moonshot.cn/v1';
			apiKey = process.env.KIMI_API_KEY;
			modelName = 'moonshot-v1-8k';
			break;
		default:
			baseURL = 'https://api.siliconflow.cn/v1';
			apiKey = process.env.DEEPSEEK_API_KEY;
			modelName = 'deepseek-ai/DeepSeek-V3';
	}

	// ==================== 构建 API 请求 ====================

	const url = `${baseURL}/chat/completions`;

	const requestBody = {
		model: modelName,
		messages: [
			{ role: 'system', content: SYSTEM_PROMPT },
			{ role: 'user', content: ocrText }
		],
		temperature: 0.3,
		max_tokens: 2000,
		response_format: { type: 'json_object' }
	};

	// ==================== 调用 LLM API ====================

	let apiResponse;
	try {
		const response = await uniCloud.httpclient.request(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${apiKey}`
			},
			data: requestBody,
			dataType: 'json',
			timeout: 60000 // 60秒超时
		});

		if (response.status !== 200) {
			throw new Error(`API 调用失败: HTTP ${response.status}`);
		}

		apiResponse = response.data;
	} catch (error) {
		console.error('LLM API 调用失败:', error);
		return {
			errCode: 500,
			errMsg: `AI 分析失败: ${error.message}`
		};
	}

	// ==================== 提取 AI 响应内容 ====================

	let aiContent;
	try {
		aiContent = apiResponse.choices?.[0]?.message?.content;
		if (!aiContent) {
			throw new Error('AI 返回内容为空');
		}
	} catch (error) {
		console.error('AI 响应解析失败:', apiResponse);
		return {
			errCode: 500,
			errMsg: 'AI 响应格式异常'
		};
	}

	// ==================== 清理 Markdown 格式 ====================

	/**
	 * 清理 LLM 返回的 JSON 外围 Markdown 格式
	 * 支持以下格式：
	 * - ```json ... ```
	 * - ``` ... ```
	 * - 前后换行符
	 */
	function cleanMarkdownJson(jsonString) {
		let cleaned = jsonString.trim();

		// 移除开头的 ```json 或 ```
		cleaned = cleaned.replace(/^```json\s*/i, '');
		cleaned = cleaned.replace(/^```\s*/i, '');

		// 移除结尾的 ```
		cleaned = cleaned.replace(/```\s*$/i, '');

		// 移除可能的前后空白字符
		cleaned = cleaned.trim();

		return cleaned;
	}

	// ==================== 解析 JSON 响应 ====================

	let parsedResult;
	try {
		const cleanedContent = cleanMarkdownJson(aiContent);

		// Bulletproof JSON parsing with auto-fix retry
		try {
			parsedResult = JSON.parse(cleanedContent);
		} catch (initialError) {
			console.warn('Initial JSON parse failed, attempting auto-fix...', initialError.message);
			try {
				// Auto-fix missing opening braces in arrays: replace `[ "name":` with `[ { "name":` and `}, "name":` with `}, { "name":`
				let fixedContent = cleanedContent.replace(/\[\s*"name"/g, '[ { "name"');
				fixedContent = fixedContent.replace(/\},\s*"name"/g, '}, { "name"');
				parsedResult = JSON.parse(fixedContent);
				console.log('Auto-fix successful!');
			} catch (secondError) {
				console.error('Auto-fix failed. Raw AI output:', cleanedContent);
				return {
					errCode: 4,
					errMsg: 'AI 医生暂时无法解析这份报告，请重试。',
					rawOutput: cleanedContent
				};
			}
		}

		// 验证必需字段
		const requiredFields = ['report_type', 'overall_summary', 'abnormal_indicators', 'action_suggestions', 'disclaimer'];
		for (const field of requiredFields) {
			if (!(field in parsedResult)) {
				throw new Error(`缺少必需字段: ${field}`);
			}
		}

		// 验证 abnormal_indicators 是数组
		if (!Array.isArray(parsedResult.abnormal_indicators)) {
			throw new Error('abnormal_indicators 必须是数组');
		}

		// 验证每个异常指标的 severity 枚举值
		for (const indicator of parsedResult.abnormal_indicators) {
			if (indicator.severity && !['normal', 'warning', 'danger'].includes(indicator.severity)) {
				throw new Error(`invalid severity: ${indicator.severity}`);
			}
		}

	} catch (error) {
		console.error('JSON 解析失败:', aiContent);
		console.error('清理后内容:', cleanMarkdownJson(aiContent));
		return {
			errCode: 500,
			errMsg: `AI 返回格式错误: ${error.message}`
		};
	}

	// ==================== 返回成功结果 ====================

	return {
		errCode: 0,
		errMsg: 'success',
		data: {
			...parsedResult,
			llm_used: modelChoice,
			timestamp: new Date().toISOString(),
			usage: apiResponse.usage || null
		}
	};
};
