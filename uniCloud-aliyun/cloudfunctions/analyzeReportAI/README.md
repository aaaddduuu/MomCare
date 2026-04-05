# analyzeReportAI - AI产检报告解读云函数

## 功能描述

统一模型路由器云函数，支持调用多种大语言模型（DeepSeek、Qwen、Kimi）进行产检报告智能解读。

## 架构设计

### 模型配置工厂模式

```javascript
MODEL_CONFIGS = {
  deepseek: { baseURL, apiKeyEnv, modelName, compatible },
  qwen:     { baseURL, apiKeyEnv, modelName, compatible },
  kimi:     { baseURL, apiKeyEnv, modelName, compatible }
}
```

### API 兼容性

所有三种模型均支持 **OpenAI 兼容 API 格式**，使用统一的 REST 调用逻辑：

| 模型 | Base URL | 兼容性 |
|------|----------|--------|
| DeepSeek | `https://api.deepseek.com/v1` | ✅ 完全兼容 |
| Qwen Plus | `https://dashscope.aliyuncs.com/compatible-mode/v1` | ✅ 兼容模式 |
| Kimi | `https://api.moonshot.cn/v1` | ✅ 完全兼容 |

## 请求参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| ocr_text | String | ✅ | OCR 提取的报告文本 |
| model_choice | String | ❌ | 选择的模型 (默认: deepseek) |

**model_choice 可选值**: `deepseek`, `qwen`, `kimi`

## 响应格式

### 成功响应

```json
{
  "errCode": 0,
  "errMsg": "success",
  "data": {
    "summary": "整体情况总结",
    "overall_status": "normal | abnormal | warning",
    "abnormal_count": 2,
    "indicators": [
      {
        "name": "血红蛋白",
        "value": "95 g/L",
        "reference_range": "110-150 g/L",
        "is_abnormal": true,
        "explanation": "血红蛋白偏低，可能存在贫血情况..."
      }
    ],
    "recommendations": [
      "建议1",
      "建议2"
    ],
    "disclaimer": "以上内容由AI生成，仅供参考...",
    "llm_used": "deepseek",
    "llm_display_name": "DeepSeek",
    "model_name": "deepseek-chat",
    "timestamp": "2024-04-28T10:30:00.000Z",
    "usage": {
      "prompt_tokens": 1234,
      "completion_tokens": 567,
      "total_tokens": 1801
    }
  }
}
```

### 错误响应

```json
{
  "errCode": 400,
  "errMsg": "错误描述"
}
```

## 环境变量配置

在 uniCloud 控制台配置以下环境变量：

| 环境变量名 | 说明 | 示例 |
|-----------|------|------|
| `DEEPSEEK_API_KEY` | DeepSeek API 密钥 | `sk-xxxxxxxxxxxx` |
| `QWEN_API_KEY` | 阿里云通义千问 API 密钥 | `sk-xxxxxxxxxxxx` |
| `KIMI_API_KEY` | Moonshot (Kimi) API 密钥 | `sk-xxxxxxxxxxxx` |

### 配置步骤

1. 登录 [uniCloud 控制台](https://unicloud.dcloud.net.cn/)
2. 进入云函数 → analyzeReportAI
3. 点击「配置」→「环境变量」
4. 添加上述三个环境变量

## 系统提示词

AI 被设定为一位**富有同理心、专业可靠的妇产科医生助手**：

- 用温和、亲切的语调解释指标
- 重点标注异常指标
- 给出实用建议
- **强制包含免责声明**

## 使用示例

### 客户端调用

```javascript
// 调用云函数
const res = await uniCloud.callFunction({
  name: 'analyzeReportAI',
  data: {
    ocr_text: '血常规检查\n血红蛋白: 95 g/L\n白细胞: 8.5×10⁹/L...',
    model_choice: 'deepseek' // 或 'qwen', 'kimi'
  }
});

if (res.result.errCode === 0) {
  const { summary, indicators, recommendations } = res.result.data;
  // 处理分析结果
}
```

### 切换模型

```javascript
// 用户在设置中选择偏好的模型
const userPreference = 'qwen'; // 从 mom_users.preferred_llm 读取

const res = await uniCloud.callFunction({
  name: 'analyzeReportAI',
  data: {
    ocr_text: reportText,
    model_choice: userPreference
  }
});
```

## 云函数配置

- **内存**: 512 MB
- **超时时间**: 60 秒
- **运行时**: Node.js 16

## 错误码

| errCode | errMsg |
|---------|--------|
| 400 | 参数错误: ocr_text 必须是非空字符串 |
| 400 | 不支持的模型: xxx |
| 500 | 环境变量 xxx 未配置 |
| 500 | AI 分析失败: xxx |
| 500 | AI 返回格式错误: xxx |
