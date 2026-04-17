# 微信静默登录设计文档

## 概述

为 MomCare 微信小程序接入微信静默登录，实现启动时无感知登录、用户信息展示、本地数据自动迁移到云端。

**方案选择**：轻量级自建登录（不使用 uni-id），通过 `uni.login()` + 云函数换取 openid。

## 1. 登录流程

**触发时机**：`App.vue` 的 `onLaunch` 生命周期。

**流程**：

```
App启动
  → 调用 uni.login() 获取微信临时 code
  → 调用云函数 wxLogin(code)
    → 云函数用 code + appid + secret 请求微信 jscode2session 接口
    → 获取 openid
    → 在 mom_users 表中查找或创建用户记录
    → 返回 { openid, userInfo, isNewUser }
  → 前端将 openid + userInfo 存入 Pinia store
  → 如果 isNewUser 且本地有缓存数据 → 触发数据迁移
  → 完成，用户无感知
```

**核心原则**：
- openid 作为用户唯一标识，不使用传统 uid/token
- 登录失败不阻断应用使用，降级为本地模式

## 2. 数据模型

### mom_users 表扩展

| 字段 | 类型 | 说明 |
|------|------|------|
| openid | string | 微信唯一标识（已有） |
| unionid | string | 微信开放平台标识（已有，暂不使用） |
| nickname | string | 用户昵称，默认值 "宝妈" |
| avatar_url | string | 头像地址，默认使用内置默认头像 |
| phone | string | 手机号（预留字段，暂不采集） |
| login_at | timestamp | 最后登录时间 |
| created_at | timestamp | 注册时间 |

### Pinia store 变更（stores/health.js）

新增状态：
- `isLoggedIn`（ref, boolean）— 是否已登录
- `openid`（ref, string）— 当前用户的 openid

新增 action：
- `silentLogin()` — 封装整个静默登录流程

修改逻辑：
- `loadUserProfile()` — 有 openid 时优先从云端加载，失败降级本地
- `saveUserProfile()` — 有 openid 时同步到云端
- `userInfo` — 初始化时检查 openid，有则用云端数据，无则用默认值

## 3. "我的"页面变更

### ProfileHero 组件

- **未登录**：显示默认头像（🌸）+ "点击登录"
- **已登录**：显示用户头像 + 昵称 + 孕周信息
- 点击头像/昵称区域 → 跳转到个人信息编辑页

### 新增页面：edit-profile.vue

路径：`pages/profile/edit-profile.vue`

功能：
- 修改昵称（文本输入）
- 修改头像（从相册选择或拍照，上传到 uniCloud 存储）
- 保存时更新本地 store + 云端 mom_users 记录

注意：孕期信息编辑保持现有 `pregnancy-info.vue` 不变。

## 4. 首次登录数据迁移

当 `isNewUser = true` 且本地有缓存数据时触发：

```
检测到 isNewUser 且本地有数据
  → 读取本地 user_profile、health_records、hospital_bag_items 等
  → 为每条数据写入 openid
  → 批量 upsert 到云端对应集合
  → 标记迁移完成（本地存储 key: data_migrated）
  → 后续操作正常走云端同步
```

迁移范围：
- `user_profile` → `mom_users`
- `health_records` → `health_records`
- `hospital_bag_items` → 对应集合（如有）

## 5. 云函数：wxLogin

### 入参

```json
{ "code": "微信临时登录凭证" }
```

### 处理逻辑

1. 从环境变量读取 appid 和 appsecret
2. 调用微信 `jscode2session` 接口：`https://api.weixin.qq.com/sns/jscode2session?appid=APPID&secret=SECRET&js_code=CODE&grant_type=authorization_code`
3. 获取 openid
4. 查询 `mom_users` 表：
   - **找到**：更新 `login_at`，返回用户信息
   - **未找到**：创建新记录（nickname="宝妈", avatar_url=默认, created_at=now），返回 `isNewUser=true`
5. 返回 `{ openid, userInfo, isNewUser }`

### 安全要求

- appsecret 存储在云函数环境变量中，绝不暴露到前端
- 云函数只返回 openid，不返回 session_key
- 数据库权限：`doc.openid == $env.OPENID`（用户只能操作自己的数据）

## 6. 错误处理

| 场景 | 处理方式 |
|------|----------|
| `uni.login()` 失败 | 静默降级为本地模式，不弹提示 |
| 云函数调用失败 | 同上，本地模式继续使用 |
| 微信接口返回错误 | 云函数记录日志，返回错误，前端降级 |
| 网络断开 | 本地模式，下次启动自动重试登录 |
| 数据迁移部分失败 | 记录失败项，不阻断，下次启动补传 |

## 7. 涉及文件清单

| 文件 | 变更类型 | 说明 |
|------|----------|------|
| `App.vue` | 修改 | onLaunch 中调用 silentLogin |
| `stores/health.js` | 修改 | 新增登录状态和 silentLogin action |
| `components/profile/ProfileHero.vue` | 修改 | 根据登录状态展示不同 UI |
| `pages/profile/edit-profile.vue` | 新增 | 个人信息编辑页 |
| `pages.json` | 修改 | 注册新页面路由 |
| `uniCloud-aliyun/cloudfunctions/wxLogin/` | 新增 | 微信登录云函数 |
| `uniCloud-aliyun/database/mom_users.schema.json` | 修改 | 添加 nickname、avatar_url 等字段 |
