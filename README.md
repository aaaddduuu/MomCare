# MomCare - 孕途伴侣

> 一款结合 AI 大模型的孕期健康伴侣 App，为准妈妈提供智能健康追踪与产检报告解读。

---

## 🌟 为什么选择孕途伴侣？

|  |  |
| --- | --- |
| 🤰 **AI 产检报告解读** 上传产检报告图片，OCR 自动提取文字，DeepSeek 大模型智能解读，输出整体评估、逐项指标分析和行动建议。支持一键生成分享海报。 | 📊 **全生命周期健康记录** 体重追踪、血压监测、胎动计数、心情日记，配合可视化趋势图表，全方位掌握孕期健康。 |
| 📅 **智能产检管理** 产检提醒与倒计时、检查项目清单、待产包准备进度追踪，让每一次产检都有条不紊。 | 📖 **孕期知识库** 按孕周推荐知识文章，每周指南展示宝宝发育变化与妈妈身体变化，陪伴整个孕期。 |

---

## ✨ 核心功能

|  |  |  |
| --- | --- | --- |
| 🔬 **AI 报告解读** | 📈 **健康追踪** | 📅 **产检管理** |
| 拍照 / 相册上传产检报告 | 体重、血压、胎动记录 | 产检提醒与倒计时 |
| OCR 文字自动提取 | 可视化趋势图表 | 检查项目清单勾选 |
| DeepSeek 大模型智能分析 | 孕期日历 + 每日面板 | 待产包准备进度 |
| 一键生成分享海报 | 数据本地 + 云端同步 | 孕周自动计算 |
| 批量报告分类管理 | 多维度健康趋势 | 新用户引导配置 |

---

## 🏗️ 技术架构

| 层级 | 技术 | 说明 |
| --- | --- | --- |
| **前端** | UniApp + Vue 3 + Pinia | 跨平台微信小程序 / H5，Composition API |
| **边缘计算** | Cloudflare Worker | 全球分布式 API 网关，零冷启动 |
| **数据库** | Cloudflare D1 (SQLite) | Serverless 关系型数据库，边缘就近读取 |
| **对象存储** | Cloudflare R2 | 产检报告图片存储，无出站流量费 |
| **AI 大模型** | DeepSeek-V3 | 产检报告智能解读，指标分析与建议 |
| **OCR** | PaddleOCR (SiliconFlow) | 产检报告图片文字提取 |

```
MomCare/
├── 📂 pages/                    # 页面目录
│   ├── 🏠 index/                #   首页（日历、记录、每周指南）
│   ├── 🔐 login/                #   登录页
│   ├── 📝 register/             #   注册页
│   ├── 📂 archives/             #   产检档案模块
│   │   ├── index.vue            #     档案列表
│   │   ├── detail.vue           #     报告详情（含海报生成）
│   │   ├── ai-result.vue        #     AI 解读结果
│   │   ├── classify.vue         #     报告分类
│   │   └── batch.vue            #     批量操作
│   ├── 📖 knowledge/            #   知识库
│   ├── 📘 guide/                #   每周指南
│   ├── 📆 daily/                #   每日记录
│   └── 👤 profile/              #   个人中心
│       ├── index.vue            #     主页
│       ├── onboarding.vue       #     新用户引导
│       ├── weight-records.vue   #     体重记录
│       ├── bp-records.vue       #     血压记录
│       ├── fetal-records.vue    #     胎动记录
│       ├── checkup-reminder.vue #     产检提醒
│       ├── hospital-bag.vue     #     待产包清单
│       └── ...
├── 🧩 components/               # 组件目录
│   ├── NavBar.vue               #   自定义导航栏
│   ├── common/                  #   通用组件
│   ├── home/                    #   首页组件
│   └── profile/                 #   个人中心组件
├── 📦 stores/                   # Pinia 状态管理
│   ├── health.js                #   健康数据
│   ├── report.js                #   报告数据
│   └── staticData.js            #   静态数据
├── 🎨 static/                   # 静态资源
├── 📄 manifest.json             # UniApp 应用配置
└── 📄 pages.json                # 页面路由配置
```

---

## 🚀 快速开始

### 环境要求

```
Node.js >= 18
HBuilderX (前端开发 IDE)
微信开发者工具 (可选，小程序调试)
```

### 安装与运行

```
# 克隆仓库
git clone https://github.com/your-username/MomCare.git
cd MomCare

# 安装依赖
npm install

# 使用 HBuilderX 打开项目
# 运行到微信开发者工具或浏览器
```

### 后端部署

后端基于 Cloudflare Worker + D1 + R2 边缘计算架构：

1. 在 [Cloudflare 控制台](https://dash.cloudflare.com/) 创建 D1 数据库和 R2 存储桶
2. 在 Worker 控制台 **Settings > Variables** 配置环境变量（JWT_SECRET、AI_API_KEY）
3. 部署 Worker 服务

> **安全提醒：** 切勿将 API 密钥或密签字符串写入代码，所有敏感配置通过环境变量注入。

---

## 🤝 贡献指南

欢迎所有形式的贡献！

- 🐛 **问题反馈** - 提交 Issue 报告 Bug
- 💡 **功能建议** - 分享你的想法和新功能需求
- 🔧 **代码贡献** - 提交 PR 改进项目
- 📖 **文档完善** - 帮助完善文档

```
# 创建功能分支
git checkout -b feature/amazing-feature

# 提交更改
git commit -m "✨ Add amazing feature"

# 推送分支
git push origin feature/amazing-feature

# 发起 Pull Request
```

---

## 📊 发展路线

- [x] AI 产检报告 OCR + 智能解读
- [x] 健康数据追踪（体重 / 血压 / 胎动）
- [x] 产检提醒与倒计时
- [x] 孕期知识库 + 每周指南
- [x] 报告分享海报生成
- [x] Cloudflare 边缘计算架构迁移
- [ ] 孕期社区交流
- [ ] 数据导出与备份
- [ ] 智能饮食建议
- [ ] 多语言支持
- [ ] App 端适配

---

## 📄 许可证

本项目仅供学习交流使用。

---

## ⚠️ 免责声明

本应用提供的健康数据分析由 AI 生成，仅供参考，不构成医疗诊断建议。如有任何健康问题，请及时咨询专业产科医生。

---

__Made with ❤️ for every mom-to-be__
