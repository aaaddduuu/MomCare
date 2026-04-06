# MomCare - 妈咪护理助手

> 智能产检报告管理小程序，基于 AI 解读和 OCR 技术为孕期妈妈提供专业的医疗报告分析服务。

## 项目简介

MomCare 是一款专为孕期女性设计的医疗报告管理应用，通过 AI 技术自动识别和解读产检报告，帮助妈妈们更好地了解检查结果和健康状况。

### 核心功能

- **快速归档**: 支持拍照或相册上传产检报告图片
- **AI 智能解读**: 基于 DeepSeek 模型的专业医疗报告分析
- **OCR 文字识别**: 自动提取报告中的关键信息
- **报告分类管理**: 支持多种产检类型分类（血常规、尿常规、唐氏筛查、糖耐量、B超等）
- **异常指标提醒**: 智能识别异常指标并分级标注
- **历史档案管理**: 时间轴展示所有历史检查记录
- **人工分类**: 支持手动分类和备注，无需 AI 解读即可归档

## 技术栈

### 前端
- **框架**: uni-app (Vue 3 + Composition API)
- **平台**: 微信小程序
- **语言**: JavaScript
- **样式**: SCSS

### 后端
- **云服务**: uniCloud (阿里云)
- **数据库**: uniCloud DB
- **云函数**:
  - `extractReportOCR`: OCR 文字识别
  - `analyzeReportAI`: AI 报告解读

### AI 能力
- **OCR**: 腾讯云文字识别
- **LLM**: DeepSeek API (可切换至其他模型)

## 项目结构

```
MomCare/
├── pages/                    # 页面目录
│   ├── index/               # 首页
│   ├── knowledge/           # 育儿知识
│   ├── profile/             # 个人中心
│   │   ├── index.vue        # 个人中心主页
│   │   └── archives.vue     # 产检档案
│   └── reports/             # 报告管理
│       ├── index.vue        # 报告列表
│       ├── classify.vue     # 报告分类
│       └── detail.vue       # 报告详情
├── uniCloud-aliyun/         # 云端代码
│   ├── cloudfunctions/      # 云函数
│   │   ├── extractReportOCR/
│   │   └── analyzeReportAI/
│   └── database/            # 数据库 Schema
│       └── momcare_reports.schema.json
├── static/                  # 静态资源
├── manifest.json           # 应用配置
└── pages.json              # 页面路由配置
```

## 数据库设计

### momcare_reports（产检报告表）

| 字段 | 类型 | 说明 |
|------|------|------|
| _id | String | 报告ID |
| user_id | String | 用户ID |
| report_type | String | 报告类型 |
| report_name | String | 报告名称 |
| file_urls | Array | 报告图片URL |
| file_type | String | 文件类型 |
| ocr_status | String | OCR状态 |
| ocr_text | String | OCR识别文本 |
| ai_status | String | AI分析状态 |
| ai_result | Object | AI分析结果 |
| is_abnormal | Boolean | 是否异常 |
| week_of_pregnancy | Number | 孕周 |
| notes | String | 备注 |
| create_time | Number | 创建时间 |

### ai_status 状态说明

- `none`: 未处理
- `processing`: 处理中
- `completed`: AI解读完成
- `manual`: 人工已归档

## 云函数说明

### extractReportOCR

**功能**: 使用腾讯云 OCR 提取报告中的文字信息

**输入**:
```json
{
  "fileID": "cloud://xxx.jpg"
}
```

**输出**:
```json
{
  "errCode": 0,
  "errMsg": "success",
  "data": {
    "text": "识别出的文字内容"
  }
}
```

### analyzeReportAI

**功能**: 使用 LLM 解读产检报告

**输入**:
```json
{
  "ocrText": "报告文字内容",
  "modelChoice": "deepseek"
}
```

**输出**:
```json
{
  "errCode": 0,
  "data": {
    "llm_used": "deepseek",
    "report_type": "blood_routine",
    "overall_summary": "总体评估",
    "normal_highlights": ["正常指标1", "正常指标2"],
    "abnormal_indicators": [
      {
        "name": "指标名称",
        "value": "检测值",
        "severity": "warning"
      }
    ],
    "action_suggestions": ["建议1", "建议2"],
    "disclaimer": "免责声明"
  }
}
```

## 环境配置

### 前置要求

1. 安装 HBuilderX 编辑器
2. 注册并登录 uniCloud 账号
3. 开通相关云服务（腾讯云 OCR、DeepSeek API）

### 环境变量配置

在 uniCloud 控制台配置以下环境变量：

```bash
# 腾讯云 OCR
TENCENT_CLOUD_SECRET_ID=your_secret_id
TENCENT_CLOUD_SECRET_KEY=your_secret_key
TENCENT_CLOUD_REGION=ap-guangzhou

# DeepSeek API
DEEPSEEK_API_KEY=your_api_key
DEEPSEEK_API_BASE=https://api.deepseek.com
```

### 本地开发

1. 克隆项目到本地
2. 使用 HBuilderX 打开项目
3. 关联 uniCloud 服务空间
4. 上传并部署云函数
5. 运行到微信开发者工具

## 主要页面说明

### 报告管理 (pages/reports/index.vue)

报告列表页，展示所有产检报告，支持按状态筛选。

### 报告分类 (pages/reports/classify.vue)

新上传的报告需要在此页面进行分类，可选择：
- **AI 智能解读**: 自动 OCR 识别 + AI 分析
- **仅保存信息**: 手动填写报告类型和备注

### 报告详情 (pages/reports/detail.vue)

展示已解读报告的完整信息，包括：
- 报告基本信息
- AI 总体评估
- 正常指标亮点
- 异常指标详情
- 行动建议

### 产检档案 (pages/profile/archives.vue)

时间轴展示所有已归档报告，支持按类型、状态、月份筛选。

## 支持的报告类型

| 类型 | 值 | 图标 |
|------|-----|------|
| 血常规 | blood_routine | 🩸 |
| 尿常规 | urine_routine | 💧 |
| 唐氏筛查 | down_screening | 🧬 |
| 糖耐量 | glucose_tolerance | 🍬 |
| B超检查 | ultrasound | 🔬 |
| 胎心监护 | cardiotocography | 💓 |
| 其他 | other | 📄 |

## 版本信息

- **当前版本**: 1.0.0
- **版本代号**: 100
- **更新日期**: 2026-04-06

## 许可证

本项目仅供学习交流使用。

## 免责声明

本应用提供的 AI 分析结果仅供参考，不能替代专业医疗诊断。如有任何健康问题，请及时咨询专业医生。

---

**开发团队**: MomCare Team
**技术支持**: uni-app + uniCloud + DeepSeek
