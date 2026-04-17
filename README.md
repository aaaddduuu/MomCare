# MomCare - 孕期健康管理助手

> 智能孕期健康追踪应用，为准妈妈提供全方位的孕期记录、产检管理和健康数据分析服务。

## 项目简介

MomCare 是一款专为孕期女性设计的健康管理应用，通过简洁直观的界面帮助妈妈们记录体重、血压、胎动、心情等健康数据，提供产检提醒、待产包清单、育儿知识等实用功能。

### 核心功能

**健康记录**
- **体重追踪**: 记录孕期体重变化，智能计算增重范围，可视化体重趋势图
- **血压监测**: 记录血压数据，自动识别异常指标（收缩压≥140或舒张压≥90）
- **胎动计数**: 统计每日胎动次数，提醒12小时内少于10次及时就医
- **心情记录**: 追踪每日情绪变化，记录身体症状（腰背酸痛、水肿、气短等）
- **备注计划**: 记录每日感受、提醒事项和今日计划清单

**产检管理**
- **产检提醒**: 下次产检日期倒计时，检查项目清单，提醒设置
- **今日计划**: 查看和管理每日计划，支持勾选完成状态
- **待产包清单**: 待产物品准备进度追踪

**数据可视化**
- **孕期日历**: 直观展示整个孕期的健康记录
- **倒计时圆环**: 距离预产期的剩余天数
- **宝宝大小对比**: 用水果比喻展示当前胎儿大小
- **每周变化**: 孕期每周的身体变化和宝宝发育情况

**知识库**
- **孕期知识**: 提供专业的孕期保健、营养、运动等知识文章

## 技术栈

### 前端
- **框架**: uni-app (Vue 3 + Composition API)
- **状态管理**: Pinia
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
│   │   └── index.vue        # 首页主入口（日历、记录、每周指南）
│   ├── knowledge/           # 育儿知识
│   │   ├── index.vue        # 知识列表
│   │   └── detail.vue       # 知识详情
│   ├── archives/            # 产检档案
│   │   ├── index.vue        # 档案列表
│   │   ├── detail.vue       # 档案详情
│   │   ├── classify.vue     # 报告分类
│   │   ├── ai-result.vue    # AI解读结果
│   │   ├── batch.vue        # 批量操作
│   │   └── unarchived.vue   # 未归档报告
│   └── profile/             # 个人中心
│       ├── index.vue        # 个人中心主页
│       ├── pregnancy-info.vue    # 孕期信息
│       ├── weight-records.vue     # 体重记录
│       ├── bp-records.vue         # 血压记录
│       ├── fetal-records.vue      # 胎动记录
│       ├── checkup-reminder.vue   # 产检提醒
│       ├── daily-plan.vue         # 今日计划
│       ├── hospital-bag.vue       # 待产包清单
│       ├── privacy.vue            # 隐私设置
│       └── about.vue              # 关于
├── components/              # 组件目录
│   ├── NavBar.vue          # 导航栏组件
│   ├── common/             # 通用组件
│   │   ├── DueCountdownRing.vue    # 倒计时圆环
│   │   └── PregnancyCalendar.vue   # 孕期日历
│   ├── home/               # 首页组件
│   │   ├── HomeHero.vue           # 首页顶部
│   │   ├── DailyChanges.vue       # 每日变化卡片
│   │   ├── DayRecordPanel.vue     # 每日记录面板
│   │   ├── WeeklyGuideCard.vue    # 每周指南卡片
│   │   └── RecordEditSheet.vue    # 记录编辑弹窗
│   └── profile/            # 个人中心组件
│       ├── ProfileHero.vue        # 个人中心顶部
│       └── ProfileSection.vue     # 个人中心区块
├── stores/                  # 状态管理
│   └── health.js           # 健康数据 Store
├── utils/                   # 工具函数
│   └── navigation.js       # 导航工具
├── uniCloud-aliyun/         # 云端代码
│   ├── cloudfunctions/      # 云函数
│   │   ├── extractReportOCR/
│   │   └── analyzeReportAI/
│   └── database/            # 数据库 Schema
│       ├── health_records.schema.json    # 健康记录表
│       └── mom_users.schema.json         # 用户信息表
├── static/                  # 静态资源
├── manifest.json           # 应用配置
└── pages.json              # 页面路由配置
```

## 数据库设计

### health_records（健康记录表）

| 字段 | 类型 | 说明 |
|------|------|------|
| _id | String | 记录ID |
| user_id | String | 用户ID |
| record_type | String | 记录类型（weight/blood_pressure/mood/fetal_movement/note/combined） |
| record_date | String | 记录日期（YYYY-MM-DD） |
| weight | String | 体重（kg） |
| weight_unit | String | 体重单位 |
| systolic | Number | 收缩压（高压 mmHg） |
| diastolic | Number | 舒张压（低压 mmHg） |
| bp_text | String | 血压文本（如 118/76） |
| is_abnormal | Boolean | 是否异常 |
| mood | String | 心情表情 |
| symptoms | Array | 症状列表 |
| fetal_movement | String | 胎动次数 |
| note | String | 备注信息 |
| plans | Array | 今日计划列表 |
| week_of_pregnancy | Number | 孕周 |
| data_source | String | 数据来源（manual/device/import） |
| create_time | Timestamp | 创建时间 |
| update_time | Timestamp | 更新时间 |

### mom_users（用户信息表）

| 字段 | 类型 | 说明 |
|------|------|------|
| _id | String | 用户ID |
| openid | String | 微信OpenID |
| nickname | String | 昵称 |
| avatar | String | 头像 |
| lmp_date | Date | 末次月经日期 |
| due_date | Date | 预产期 |
| hospital | String | 产检医院 |
| doctor | String | 医生姓名 |
| baby_nickname | String | 宝宝小名 |
| pre_weight | String | 孕前体重 |
| height | String | 身高 |
| create_time | Timestamp | 创建时间 |
| update_time | Timestamp | 更新时间 |

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

### 首页 (pages/index/index.vue)

- **孕期日历**: 直观展示整个孕期的健康记录分布
- **每日记录面板**: 快速记录当天的体重、血压、胎动、心情和备注
- **每周指南**: 展示当前孕周的身体变化和宝宝发育情况

### 体重记录 (pages/profile/weight-records.vue)

- 展示最新体重和孕期增重
- 体重趋势图表（支持1月/3月/全程切换）
- 历史记录列表

### 血压记录 (pages/profile/bp-records.vue)

- 展示最新血压数据
- 血压趋势图表
- 历史记录列表

### 胎动记录 (pages/profile/fetal-records.vue)

- 展示今日胎动统计
- 胎动趋势图表
- 历史记录列表

### 产检提醒 (pages/profile/checkup-reminder.vue)

- 下次产检日期倒计时
- 本次产检信息（时间、地点、孕周）
- 检查项目清单（支持勾选）
- 提醒设置

### 今日计划 (pages/profile/daily-plan.vue)

- 展示今日计划列表
- 支持勾选完成状态
- 显示今日备注
- 空状态引导用户添加计划

### 待产包清单 (pages/profile/hospital-bag.vue)

- 待产物品分类列表
- 准备进度统计

### 产检档案 (pages/archives/index.vue)

- 时间轴展示所有已归档报告
- 支持按类型、状态、月份筛选

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

## 孕期阶段划分

- **孕早期**: 0-12周
- **孕中期**: 13-27周
- **孕晚期**: 28周及以后

## 宝宝大小比喻数据

应用使用水果比喻来展示胎儿大小，帮助准妈妈更直观地了解宝宝发育情况：

| 孕周 | 水果比喻 |
|------|----------|
| 4周 | 🫘 罂粟籽 |
| 5周 | 🍎 苹果籽 |
| 6周 | 🫐 蓝莓 |
| 8周 | 🍇 葡萄 |
| 10周 | 🍓 草莓 |
| 13周 | 🍑 桃子 |
| 16周 | 🥑 牛油果 |
| 20周 | 🍌 香蕉 |
| 24周 | 🌽 玉米 |
| 28周 | 🍆 茄子 |
| 32周 | 🥬 大白菜 |
| 36周 | 🍈 甜瓜 |
| 40周 | 🍉 西瓜 |

## 版本信息

- **当前版本**: 1.0.0
- **版本代号**: 100
- **更新日期**: 2026-04-17

## 许可证

本项目仅供学习交流使用。

## 免责声明

本应用提供的健康数据分析仅供参考，不能替代专业医疗诊断。如有任何健康问题，请及时咨询专业医生。

---

**开发团队**: MomCare Team
**技术支持**: uni-app + uniCloud + DeepSeek
