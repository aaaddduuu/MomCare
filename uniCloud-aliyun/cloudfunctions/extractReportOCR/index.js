'use strict';

/**
 * MomCare - 产检报告 OCR 文字提取云函数
 * 使用 SiliconFlow DeepSeek-OCR API 从图片中提取文字
 */

// Load environment variables from .env file
require('dotenv').config({ path: __dirname + '/.env' });

exports.main = async (event, context) => {
	const { fileID } = event;

	// ==================== 参数验证 ====================

	if (!fileID || typeof fileID !== 'string') {
		return {
			errCode: 400,
			errMsg: '参数错误: 必须提供 fileID'
		};
	}

	// ==================== Step A: 获取公网临时 URL ====================

	let fileUrl;
	try {
		const tempRes = await uniCloud.getTempFileURL({
			fileList: [fileID]
		});

		if (!tempRes.fileList || tempRes.fileList.length === 0) {
			throw new Error('获取临时 URL 失败');
		}

		fileUrl = tempRes.fileList[0].tempFileURL;

		if (!fileUrl) {
			throw new Error('临时 URL 为空');
		}

		console.log('临时 URL:', fileUrl);
	} catch (error) {
		console.error('获取临时 URL 失败:', error);
		return {
			errCode: 500,
			errMsg: `获取临时 URL 失败: ${error.message}`
		};
	}

	// ==================== Step B: 通过 HTTP 下载图片为 Buffer ====================

	let imageBuffer;
	try {
		const imageRes = await uniCloud.httpclient.request(fileUrl, {
			method: 'GET',
			dataType: 'buffer',
			timeout: 30000 // 30秒超时
		});

		// Image Download Check
		if (imageRes.status !== 200) {
			console.error('图片下载失败，HTTP状态:', imageRes.status);
			return {
				errCode: 1,
				errMsg: `Failed to download image from OSS. Status: ${imageRes.status}`
			};
		}

		if (!imageRes.data || !Buffer.isBuffer(imageRes.data)) {
			throw new Error('图片数据格式错误');
		}

		imageBuffer = imageRes.data;

		console.log('图片下载成功，大小:', imageBuffer.length, 'bytes');
	} catch (error) {
		console.error('下载图片失败:', error);
		return {
			errCode: 500,
			errMsg: `下载图片失败: ${error.message}`
		};
	}

	// ==================== Step C: 转换为 Base64 ====================

	let base64String;
	try {
		base64String = imageBuffer.toString('base64');
		console.log('Base64 转换成功，长度:', base64String.length);
	} catch (error) {
		console.error('Base64 转换失败:', error);
		return {
			errCode: 500,
			errMsg: `Base64 转换失败: ${error.message}`
		};
	}

	// ==================== SiliconFlow API 配置 ====================

	const SILICONFLOW_API_URL = 'https://api.siliconflow.cn/v1/chat/completions';
	const SILICONFLOW_API_KEY = process.env.SILICONFLOW_API_KEY;

	// ==================== 构建 Vision API 请求 ====================

	const requestBody = {
			model: 'PaddlePaddle/PaddleOCR-VL-1.5',
			messages: [
				{
					role: 'user',
					content: [
						{
							type: 'image_url',
							image_url: {
								url: `data:image/jpeg;base64,${base64String}`
							}
						}
					]
				}
			],
			temperature: 0,
			max_tokens: 2000
		};

	// ==================== 调用 SiliconFlow API ====================

	let sfRes;
	try {
		const response = await uniCloud.httpclient.request(SILICONFLOW_API_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${SILICONFLOW_API_KEY}`
			},
			data: requestBody,
			dataType: 'json', // 自动解析 JSON 响应
			timeout: 60000 // 60秒超时
		});

		if (response.status !== 200) {
			throw new Error(`API 调用失败: HTTP ${response.status}, ${JSON.stringify(response.data)}`);
		}

		sfRes = response;

		// SiliconFlow Response Logging
		console.log('SiliconFlow API Raw Response:', JSON.stringify(sfRes.data));

		console.log('SiliconFlow API 响应成功');
	} catch (error) {
		console.error('SiliconFlow API 调用失败:', error);
		return {
			errCode: 500,
			errMsg: `OCR 提取失败: ${error.message}`
		};
	}

	// ==================== 提取 OCR 结果 ====================

	let extractedText;
	try {
		// Fallback Buffer Parser
		let responseData = sfRes.data;
		if (Buffer.isBuffer(responseData)) {
			console.log('响应是 Buffer，解析为 JSON');
			responseData = JSON.parse(responseData.toString('utf-8'));
		}

		// SiliconFlow Error Passthrough
		if (!responseData || responseData.error || !responseData.choices || responseData.choices.length === 0) {
			console.error('SiliconFlow API 返回错误或无效响应');
			return {
				errCode: 2,
				errMsg: `SiliconFlow Error: ${JSON.stringify(responseData)}`
			};
		}

		// 提取文字内容
		if (responseData.choices && responseData.choices.length > 0) {
			extractedText = responseData.choices[0].message.content;
		} else if (responseData.text) {
			extractedText = responseData.text;
		} else if (responseData.result) {
			extractedText = responseData.result;
		} else {
			console.error('无法识别的 API 响应格式');
			throw new Error('无法从响应中提取文字');
		}

		// 检查文字内容是否为空
		if (!extractedText || typeof extractedText !== 'string' || extractedText.trim() === '') {
			console.error('OCR 返回文字为空');
			return {
				errCode: 3,
				errMsg: '未能从图片中识别到文字，请确保上传了清晰的产检报告单。'
			};
		}

		// 清理可能的 Markdown 代码块标记
		extractedText = extractedText
			.replace(/^```\w*\n?/i, '')
			.replace(/```\n?$/i, '')
			.trim();

		console.log('OCR 文字提取成功，长度:', extractedText.length);

	} catch (error) {
		console.error('OCR 结果解析失败:', sfRes.data);
		return {
			errCode: 500,
			errMsg: `OCR 结果解析失败: ${error.message}`
		};
	}

	// ==================== 返回成功结果 ====================

	return {
		errCode: 0,
		errMsg: 'success',
		data: {
			text: extractedText,
			fileID: fileID,
			model: 'deepseek-ai/DeepSeek-OCR',
			timestamp: new Date().toISOString(),
			usage: sfRes.data.usage || null
		}
	};
};
