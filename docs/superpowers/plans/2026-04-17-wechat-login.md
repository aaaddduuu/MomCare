# 微信静默登录实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 MomCare 微信小程序接入微信静默登录，实现启动时无感知登录、用户信息展示、本地数据自动迁移到云端。

**Architecture:** 在 App.vue 的 onLaunch 中调用 uni.login() 获取 code，通过新建的云函数 wxLogin 换取 openid。openid 存入 Pinia store，作为用户唯一标识。登录失败时静默降级为本地模式。"我的"页面根据登录状态展示用户头像和昵称，支持编辑。

**Tech Stack:** uni-app (Vue 3 + Pinia), uniCloud (阿里云), 微信小程序 jscode2session API

---

## File Structure

| 文件 | 变更类型 | 职责 |
|------|----------|------|
| `uniCloud-aliyun/cloudfunctions/wxLogin/index.js` | 新增 | 云函数：用 code 换 openid，查建用户记录 |
| `uniCloud-aliyun/cloudfunctions/wxLogin/package.json` | 新增 | 云函数包配置 |
| `stores/health.js` | 修改 | 新增 isLoggedIn/openid 状态、silentLogin action、数据迁移 |
| `App.vue` | 修改 | onLaunch 中调用 silentLogin |
| `components/profile/ProfileHero.vue` | 修改 | 根据登录状态展示头像/昵称，点击跳转编辑页 |
| `pages/profile/edit-profile.vue` | 新增 | 个人信息编辑页（昵称 + 头像） |
| `pages.json` | 修改 | 注册 edit-profile 页面路由 |
| `uniCloud-aliyun/database/mom_users.schema.json` | 修改 | 确保 avatar_url 字段存在（已有 avatar 字段可复用） |

---

### Task 1: 创建 wxLogin 云函数

**Files:**
- Create: `uniCloud-aliyun/cloudfunctions/wxLogin/index.js`
- Create: `uniCloud-aliyun/cloudfunctions/wxLogin/package.json`

- [ ] **Step 1: 创建 package.json**

```json
{
  "name": "wxLogin",
  "version": "1.0.0",
  "description": "MomCare 微信静默登录云函数",
  "main": "index.js",
  "dependencies": {},
  "cloudfunction-config": {
    "memorySize": 256,
    "timeout": 30,
    "runtime": "Nodejs16"
  }
}
```

- [ ] **Step 2: 创建云函数 index.js**

```javascript
'use strict'
const db = uniCloud.database()

// 从环境变量读取微信配置（需在 uniCloud 控制台配置）
const APPID = process.env.WX_APPID || ''
const APPSECRET = process.env.WX_APPSECRET || ''

exports.main = async (event, context) => {
	const { code } = event

	if (!code) {
		return { code: 400, msg: '缺少 code 参数' }
	}

	if (!APPID || !APPSECRET) {
		console.error('wxLogin: 未配置 WX_APPID 或 WX_APPSECRET 环境变量')
		return { code: 500, msg: '服务端配置错误' }
	}

	// 1. 调用微信 jscode2session 接口
	let openid = ''
	try {
		const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${APPID}&secret=${APPSECRET}&js_code=${code}&grant_type=authorization_code`
		const res = await uniCloud.httpclient.request(url, {
			method: 'GET',
			dataType: 'json',
			timeout: 10000
		})

		if (res.status !== 200 || !res.data || !res.data.openid) {
			console.error('wxLogin: 微信接口返回错误', JSON.stringify(res.data))
			return { code: 502, msg: '微信登录服务异常' }
		}

		openid = res.data.openid
	} catch (e) {
		console.error('wxLogin: 请求微信接口失败', e.message)
		return { code: 502, msg: '微信登录服务异常' }
	}

	// 2. 查询或创建用户记录
	const now = new Date()
	let userInfo = null
	let isNewUser = false

	try {
		const queryRes = await db.collection('mom_users')
			.where({ openid })
			.limit(1)
			.get()

		if (queryRes.data && queryRes.data.length > 0) {
			// 已有用户，更新登录时间
			const existingDoc = queryRes.data[0]
			await db.collection('mom_users')
				.doc(existingDoc._id)
				.update({ last_login_time: now })

			userInfo = {
				nickname: existingDoc.nickname || '宝妈',
				avatar: existingDoc.avatar || '🌸',
				hospital: existingDoc.hospital || '',
				babyNickname: existingDoc.baby_nickname || '',
				doctor: existingDoc.doctor || '',
				hospitalPhone: existingDoc.hospital_phone || '',
				preWeight: existingDoc.pre_weight || '',
				height: existingDoc.height || ''
			}

			// 如果有孕期日期也返回
			if (existingDoc.lmp_date) {
				userInfo.lmpDate = existingDoc.lmp_date
			}
			if (existingDoc.due_date) {
				userInfo.dueDate = existingDoc.due_date
			}
		} else {
			// 新用户，创建记录
			isNewUser = true
			const newDoc = {
				openid,
				nickname: '宝妈',
				avatar: '🌸',
				status: 0,
				is_vip: false,
				ai_quota_monthly: 3,
				ai_used_current_month: 0,
				last_login_time: now,
				create_time: now,
				update_time: now
			}
			await db.collection('mom_users').add(newDoc)

			userInfo = {
				nickname: '宝妈',
				avatar: '🌸',
				hospital: '',
				babyNickname: '',
				doctor: '',
				hospitalPhone: '',
				preWeight: '',
				height: ''
			}
		}
	} catch (e) {
		console.error('wxLogin: 数据库操作失败', e.message)
		return { code: 500, msg: '数据库操作失败' }
	}

	return {
		code: 200,
		data: { openid, userInfo, isNewUser }
	}
}
```

- [ ] **Step 3: Commit**

```bash
git add uniCloud-aliyun/cloudfunctions/wxLogin/index.js uniCloud-aliyun/cloudfunctions/wxLogin/package.json
git commit -m "feat: 添加 wxLogin 云函数（微信静默登录）"
```

---

### Task 2: Store 层添加登录状态与 silentLogin

**Files:**
- Modify: `stores/health.js:175-190` (新增状态)
- Modify: `stores/health.js:881-930` (导出新状态和方法)

- [ ] **Step 1: 在 `useHealthStore` 的 state 区域新增登录相关状态**

在 `const checkupSchedules = ref([])` 之后（约第 189 行），添加：

```javascript
// ── 登录状态 ──
const isLoggedIn = ref(false)
const openid = ref('')
```

- [ ] **Step 2: 添加 silentLogin action**

在 `getGreeting()` 函数之后（约第 879 行），添加：

```javascript
	// ── 微信静默登录 ──

	async function silentLogin() {
		try {
			// 1. 调用 uni.login 获取微信临时 code
			const loginRes = await new Promise((resolve, reject) => {
				uni.login({
					provider: 'weixin',
					success: resolve,
					fail: reject
				})
			})

			if (!loginRes.code) {
				console.warn('silentLogin: uni.login 未返回 code')
				return false
			}

			// 2. 调用云函数换取 openid
			const cloudRes = await uniCloud.callFunction({
				name: 'wxLogin',
				data: { code: loginRes.code }
			})

			if (!cloudRes.result || cloudRes.result.code !== 200) {
				console.warn('silentLogin: 云函数返回错误', cloudRes.result)
				return false
			}

			const { openid: wxOpenid, userInfo: wxUserInfo, isNewUser } = cloudRes.result.data

			// 3. 更新 store 状态
			openid.value = wxOpenid
			isLoggedIn.value = true

			// 4. 更新 userInfo（云端数据优先）
			if (wxUserInfo) {
				if (wxUserInfo.nickname) userInfo.value.nickname = wxUserInfo.nickname
				if (wxUserInfo.avatar) userInfo.value.avatar = wxUserInfo.avatar
				if (wxUserInfo.hospital) userInfo.value.hospital = wxUserInfo.hospital
				if (wxUserInfo.babyNickname) userInfo.value.babyNickname = wxUserInfo.babyNickname
				if (wxUserInfo.doctor) userInfo.value.doctor = wxUserInfo.doctor
				if (wxUserInfo.hospitalPhone) userInfo.value.hospitalPhone = wxUserInfo.hospitalPhone
				if (wxUserInfo.preWeight) userInfo.value.preWeight = wxUserInfo.preWeight
				if (wxUserInfo.height) userInfo.value.height = wxUserInfo.height
				if (wxUserInfo.lmpDate) lmpDate.value = cloudDateToLocal(wxUserInfo.lmpDate)
				if (wxUserInfo.dueDate) dueDate.value = cloudDateToLocal(wxUserInfo.dueDate)
			}

			userProfileLoaded.value = true

			// 5. 如果是新用户且有本地数据，触发迁移
			if (isNewUser) {
				_migrateLocalData(wxOpenid)
			}

			console.log('silentLogin: 登录成功', wxOpenid)
			return true
		} catch (e) {
			console.warn('silentLogin: 登录失败，降级为本地模式', e.message)
			return false
		}
	}

	// ── 本地数据迁移到云端 ──

	async function _migrateLocalData(targetOpenid) {
		// 检查是否已迁移
		const migrated = uni.getStorageSync('data_migrated')
		if (migrated) return

		try {
			// 迁移 user_profile → mom_users（合并到已有记录）
			const savedProfile = uni.getStorageSync('user_profile')
			if (savedProfile) {
				const localData = JSON.parse(savedProfile)
				const db = getDb()
				const updateData = {}

				if (localData.userInfo) {
					if (localData.userInfo.nickname && localData.userInfo.nickname !== '宝妈') {
						updateData.nickname = localData.userInfo.nickname
						userInfo.value.nickname = localData.userInfo.nickname
					}
					if (localData.userInfo.hospital) updateData.hospital = localData.userInfo.hospital
					if (localData.userInfo.babyNickname) updateData.baby_nickname = localData.userInfo.babyNickname
				}
				if (localData.lmpDate) {
					updateData.lmp_date = new Date(localData.lmpDate)
				}
				if (localData.dueDate) {
					updateData.due_date = new Date(localData.dueDate)
				}

				if (Object.keys(updateData).length > 0) {
					await db.collection('mom_users')
						.where({ openid: targetOpenid })
						.update(updateData)
				}
			}

			// 迁移 health_records
			const savedRecords = uni.getStorageSync('health_records')
			if (savedRecords) {
				const localRecords = JSON.parse(savedRecords)
				const db = getDb()
				let migratedCount = 0

				for (const [dateKey, dayRecord] of Object.entries(localRecords)) {
					const cloudRecords = recordsToCloud(dateKey, dayRecord)
					for (const record of cloudRecords) {
						try {
							await db.collection('health_records').add({
								...record,
								openid: targetOpenid
							})
							migratedCount++
						} catch (e) {
							console.warn('_migrateLocalData: 迁移单条记录失败', dateKey, e.message)
						}
					}
				}
				console.log(`_migrateLocalData: 迁移了 ${migratedCount} 条健康记录`)
			}

			// 标记迁移完成
			uni.setStorageSync('data_migrated', 'true')
			console.log('_migrateLocalData: 数据迁移完成')
		} catch (e) {
			console.error('_migrateLocalData: 迁移失败', e.message)
		}
	}
```

- [ ] **Step 3: 在 return 语句中导出新状态和方法**

在 return 对象中，在 `// greeting` 注释后面添加新的分组：

```javascript
		// login
		isLoggedIn,
		openid,
		silentLogin,
```

完整的 return 区域变为：

```javascript
	return {
		// state
		lmpDate,
		dueDate,
		records,
		userInfo,
		userProfileLoaded,
		// getters
		today,
		todayWeekInfo,
		daysUntilDue,
		totalPregDays,
		progressPercent,
		trimester,
		fruitComparison,
		// methods
		getRecordKey,
		getRecord,
		hasRecord,
		getWeekInfo,
		isToday,
		isDueDate,
		// cloud sync
		loadUserProfile,
		saveUserProfile,
		recordsToCloud,
		recordsToLocal,
		// actions
		loadRecords,
		saveRecord,
		// checkup schedules
		checkupSchedules,
		nextCheckup,
		completedCheckups,
		upcomingCheckups,
		loadCheckupSchedules,
		initCheckupSchedules,
		updateCheckupSchedule,
		toggleExamItem,
		markCheckupCompleted,
		// statistics
		getWeightStats,
		getBpStats,
		getFetalStats,
		getWeightHistory,
		getBpHistory,
		getFetalHistory,
		// greeting
		getGreeting,
		// login
		isLoggedIn,
		openid,
		silentLogin
	}
```

- [ ] **Step 4: Commit**

```bash
git add stores/health.js
git commit -m "feat: store 添加 silentLogin 和登录状态管理"
```

---

### Task 3: App.vue 接入静默登录

**Files:**
- Modify: `App.vue:8-37` (onLaunch 方法)

- [ ] **Step 1: 修改 onLaunch，在末尾添加 silentLogin 调用**

将 `App.vue` 的 `<script>` 部分替换为：

```javascript
<script>
	export default {
		globalData: {
			statusBarHeight: 20,
			navBarHeight: 44,
			menuButtonRightPadding: 0
		},
		onLaunch: function() {
			console.log('MomCare Launch')

			try {
				// 获取系统信息，计算状态栏高度
				const systemInfo = uni.getSystemInfoSync()
				const statusBarHeight = systemInfo.statusBarHeight || 20
				let navBarHeight = 44
				let menuButtonRightPadding = 0

				// #ifdef MP-WEIXIN
				try {
					const menuButton = uni.getMenuButtonBoundingClientRect()
					if (menuButton) {
						navBarHeight = (menuButton.bottom - menuButton.top) + (menuButton.top - statusBarHeight) * 2
						menuButtonRightPadding = systemInfo.windowWidth - menuButton.left + 8
					}
				} catch (e) {
					console.warn('getMenuButtonBoundingClientRect failed', e)
				}
				// #endif

				this.globalData.statusBarHeight = statusBarHeight
				this.globalData.navBarHeight = navBarHeight
				this.globalData.menuButtonRightPadding = menuButtonRightPadding
			} catch (e) {
				console.error('App onLaunch error:', e)
			}

			// 微信静默登录（不阻断应用启动）
			// #ifdef MP-WEIXIN
			this._silentLogin()
			// #endif
		},
		onShow: function() {
			console.log('MomCare Show')
		},
		onHide: function() {
			console.log('MomCare Hide')
		},
		methods: {
			async _silentLogin() {
				try {
					const { useHealthStore } = require('@/stores/health.js')
					const store = useHealthStore()
					await store.silentLogin()
				} catch (e) {
					console.warn('App._silentLogin 失败，使用本地模式', e.message)
				}
			}
		}
	}
</script>
```

关键点：使用动态 `require` 引入 store，避免 Options API 和 Composition API 的兼容问题。用 `// #ifdef MP-WEIXIN` 条件编译确保只在微信小程序平台执行登录。

- [ ] **Step 2: Commit**

```bash
git add App.vue
git commit -m "feat: App.vue onLaunch 接入微信静默登录"
```

---

### Task 4: 修改 ProfileHero 组件

**Files:**
- Modify: `components/profile/ProfileHero.vue` (整个文件)

- [ ] **Step 1: 重写 ProfileHero 组件**

将 `components/profile/ProfileHero.vue` 完整替换为：

```vue
<template>
	<view class="pc-hero">
		<!-- 状态栏占位 -->
		<view class="status-bar-spacer" :style="{ height: statusBarHeight + 'px' }"></view>

		<view class="pc-avatar-wrap" @tap="handleAvatarTap">
			<!-- 头像 -->
			<view class="pc-avatar">
				<image v-if="isCustomAvatar" class="pc-avatar-img" :src="displayAvatar" mode="aspectFill" />
				<text v-else class="pc-avatar-text">{{ displayAvatar }}</text>
			</view>
			<view class="pc-name-block">
				<text class="pc-name">{{ displayName }}</text>
				<view class="pc-preg-tag">
					<text class="pc-preg-tag-text">🤰 孕 {{ weekInfo.week }} 周 {{ weekInfo.day }} 天 · {{ trimesterName }}</text>
				</view>
			</view>
		</view>

		<view class="pc-stats">
			<view class="pc-stat">
				<text class="pc-stat-val">{{ daysUntilDue }}</text>
				<text class="pc-stat-lbl">距预产期（天）</text>
			</view>
			<view class="pc-stat">
				<text class="pc-stat-val">{{ totalPregDays }}</text>
				<text class="pc-stat-lbl">已孕天数</text>
			</view>
			<view class="pc-stat">
				<text class="pc-stat-val">11</text>
				<text class="pc-stat-lbl">产检次数</text>
			</view>
		</view>

		<!-- 孕期进度条 -->
		<view class="pc-prog">
			<view class="pc-prog-labels">
				<text class="pc-prog-lbl">孕早期 W1</text>
				<text class="pc-prog-lbl">孕中期 W13</text>
				<text class="pc-prog-lbl">孕晚期 W28</text>
				<text class="pc-prog-lbl">W40</text>
			</view>
			<view class="pc-prog-track">
				<view class="pc-prog-fill" :style="{ width: progressPercent + '%' }">
					<view class="pc-prog-thumb"></view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getTrimesterName } from '@/stores/health.js'

const props = defineProps({
	userInfo: { type: Object, required: true },
	weekInfo: { type: Object, required: true },
	daysUntilDue: { type: Number, required: true },
	totalPregDays: { type: Number, required: true },
	progressPercent: { type: Number, required: true },
	isLoggedIn: { type: Boolean, default: false }
})

const trimesterName = getTrimesterName(getTrimesterFromWeek(props.weekInfo.week))

function getTrimesterFromWeek(w) {
	if (w <= 12) return 'early'
	if (w <= 27) return 'mid'
	return 'late'
}

const statusBarHeight = ref(20)

// 显示名称：已登录显示昵称，未登录显示"点击登录"
const displayName = computed(() => {
	if (props.isLoggedIn && props.userInfo.nickname) {
		return props.userInfo.nickname
	}
	return '点击登录'
})

// 显示头像：判断是 emoji 还是 URL
const isCustomAvatar = computed(() => {
	const avatar = props.userInfo.avatar || ''
	return avatar.startsWith('http://') || avatar.startsWith('https://') || avatar.startsWith('cloud://')
})

const displayAvatar = computed(() => {
	return props.userInfo.avatar || '🌸'
})

function handleAvatarTap() {
	if (!props.isLoggedIn) {
		// 未登录时不做跳转（登录是自动的，此处仅提示）
		return
	}
	uni.navigateTo({ url: '/pages/profile/edit-profile' })
}

onMounted(() => {
	const app = getApp()
	if (app && app.globalData) {
		statusBarHeight.value = app.globalData.statusBarHeight || 20
	}
})
</script>

<style scoped lang="scss">
.pc-hero {
	background: linear-gradient(155deg, #C45070 0%, #E07898 40%, #F4C0CC 100%);
	padding: 0 40rpx 48rpx;
	flex-shrink: 0;
	position: relative;
	overflow: hidden;
}

.status-bar-spacer {
	width: 100%;
}

.pc-avatar-wrap {
	display: flex;
	align-items: flex-end;
	gap: 28rpx;
	padding-top: 16rpx;
}

.pc-avatar {
	width: 140rpx;
	height: 140rpx;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.3);
	border: 6rpx solid rgba(255, 255, 255, 0.6);
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
	overflow: hidden;
}

.pc-avatar-img {
	width: 100%;
	height: 100%;
}

.pc-avatar-text {
	font-size: 68rpx;
}

.pc-name-block {
	flex: 1;
}

.pc-name {
	display: block;
	font-size: 40rpx;
	font-weight: 700;
	color: #FFFFFF;
	margin-bottom: 6rpx;
}

.pc-preg-tag {
	display: inline-flex;
	align-items: center;
	background: rgba(255, 255, 255, 0.2);
	border: 2rpx solid rgba(255, 255, 255, 0.3);
	border-radius: 999rpx;
	padding: 8rpx 20rpx;
}

.pc-preg-tag-text {
	font-size: 22rpx;
	color: rgba(255, 255, 255, 0.9);
}

.pc-stats {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 16rpx;
	margin-top: 32rpx;
}

.pc-stat {
	background: rgba(255, 255, 255, 0.18);
	border-radius: 24rpx;
	padding: 20rpx 16rpx;
	text-align: center;
}

.pc-stat-val {
	display: block;
	font-size: 40rpx;
	font-weight: 700;
	color: #FFFFFF;
	line-height: 1;
}

.pc-stat-lbl {
	display: block;
	font-size: 18rpx;
	color: rgba(255, 255, 255, 0.75);
	margin-top: 6rpx;
	line-height: 1.3;
}

.pc-prog {
	margin-top: 28rpx;
}

.pc-prog-labels {
	display: flex;
	justify-content: space-between;
	margin-bottom: 10rpx;
}

.pc-prog-lbl {
	font-size: 20rpx;
	color: rgba(255, 255, 255, 0.75);
}

.pc-prog-track {
	height: 16rpx;
	background: rgba(255, 255, 255, 0.2);
	border-radius: 8rpx;
	overflow: hidden;
}

.pc-prog-fill {
	height: 100%;
	border-radius: 8rpx;
	background: linear-gradient(90deg, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.9));
	position: relative;
	min-width: 40rpx;
}

.pc-prog-thumb {
	position: absolute;
	right: -2rpx;
	top: -6rpx;
	width: 28rpx;
	height: 28rpx;
	border-radius: 50%;
	background: #FFFFFF;
	box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.2);
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add components/profile/ProfileHero.vue
git commit -m "feat: ProfileHero 支持登录状态展示和头像/昵称显示"
```

---

### Task 5: 修改 profile/index.vue 传递登录状态

**Files:**
- Modify: `pages/profile/index.vue:5-11` (ProfileHero 组件调用)

- [ ] **Step 1: 更新 ProfileHero 的 props 传递**

将 `pages/profile/index.vue` 中的 ProfileHero 组件调用从：

```html
<ProfileHero
	:userInfo="healthStore.userInfo"
	:weekInfo="healthStore.todayWeekInfo || { week: 0, day: 0, total: 0 }"
	:daysUntilDue="healthStore.daysUntilDue"
	:totalPregDays="healthStore.totalPregDays"
	:progressPercent="healthStore.progressPercent"
/>
```

改为：

```html
<ProfileHero
	:userInfo="healthStore.userInfo"
	:weekInfo="healthStore.todayWeekInfo || { week: 0, day: 0, total: 0 }"
	:daysUntilDue="healthStore.daysUntilDue"
	:totalPregDays="healthStore.totalPregDays"
	:progressPercent="healthStore.progressPercent"
	:isLoggedIn="healthStore.isLoggedIn"
/>
```

- [ ] **Step 2: Commit**

```bash
git add pages/profile/index.vue
git commit -m "feat: 个人中心页面传递登录状态给 ProfileHero"
```

---

### Task 6: 创建个人信息编辑页

**Files:**
- Create: `pages/profile/edit-profile.vue`
- Modify: `pages.json` (注册新页面路由)

- [ ] **Step 1: 创建 edit-profile.vue**

```vue
<template>
	<view class="page">
		<!-- NavBar -->
		<NavBar theme="light" title="编辑资料">
			<template #right>
				<view class="nav-save-btn" @tap="handleSave">
					<text class="nav-save-text">保存</text>
				</view>
			</template>
		</NavBar>

		<!-- Scrollable Content -->
		<scroll-view scroll-y class="scroll-content">
			<!-- 头像 -->
			<view class="avatar-section">
				<view class="avatar-wrap" @tap="handleAvatarTap">
					<image v-if="isCustomAvatar" class="avatar-img" :src="form.avatar" mode="aspectFill" />
					<text v-else class="avatar-emoji">{{ form.avatar }}</text>
					<view class="avatar-edit-badge">
						<text class="avatar-edit-icon">📷</text>
					</view>
				</view>
				<text class="avatar-hint">点击更换头像</text>
			</view>

			<!-- 昵称 -->
			<view class="section-card">
				<view class="section-header">
					<view class="section-icon">
						<text class="section-icon-text">✏️</text>
					</view>
					<text class="section-title">基本信息</text>
				</view>

				<view class="form-field">
					<text class="field-label">昵称</text>
					<view class="field-input-wrap">
						<input
							class="field-input field-input-lg"
							v-model="form.nickname"
							placeholder="请输入昵称"
							placeholder-class="field-placeholder"
							maxlength="20"
						/>
					</view>
				</view>
			</view>

			<view class="bottom-spacer"></view>
		</scroll-view>

		<!-- Fixed Bottom Save Bar -->
		<view class="save-bar">
			<view class="save-bar-inner">
				<view class="save-btn" @tap="handleSave">
					<text class="save-btn-text">保存</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useHealthStore } from '@/stores/health.js'
import NavBar from '@/components/NavBar.vue'

const healthStore = useHealthStore()

const form = reactive({
	nickname: '',
	avatar: '🌸'
})

const isCustomAvatar = computed(() => {
	return form.avatar.startsWith('http://') || form.avatar.startsWith('https://') || form.avatar.startsWith('cloud://')
})

onMounted(() => {
	form.nickname = healthStore.userInfo.nickname || ''
	form.avatar = healthStore.userInfo.avatar || '🌸'
})

function handleAvatarTap() {
	uni.chooseImage({
		count: 1,
		sizeType: ['compressed'],
		sourceType: ['album', 'camera'],
		success: async (res) => {
			if (res.tempFilePaths && res.tempFilePaths.length > 0) {
				const tempPath = res.tempFilePaths[0]
				uni.showLoading({ title: '上传中...' })
				try {
					const uploadRes = await uniCloud.uploadFile({
						filePath: tempPath,
						cloudPath: `avatars/${healthStore.openid || 'local'}_${Date.now()}.jpg`
					})
					if (uploadRes.fileID) {
						form.avatar = uploadRes.fileID
					}
				} catch (e) {
					console.error('头像上传失败:', e)
					uni.showToast({ title: '上传失败', icon: 'error' })
				} finally {
					uni.hideLoading()
				}
			}
		}
	})
}

async function handleSave() {
	if (!form.nickname.trim()) {
		uni.showToast({ title: '请输入昵称', icon: 'none' })
		return
	}

	// 更新 store
	healthStore.userInfo.nickname = form.nickname.trim()
	healthStore.userInfo.avatar = form.avatar

	uni.showLoading({ title: '保存中...' })

	try {
		await healthStore.saveUserProfile()
		uni.hideLoading()
		uni.showToast({ title: '保存成功', icon: 'success', duration: 1500 })
		setTimeout(() => {
			uni.navigateBack()
		}, 1500)
	} catch (e) {
		uni.hideLoading()
		uni.showToast({ title: '保存失败', icon: 'error', duration: 2000 })
	}
}
</script>

<style scoped lang="scss">
.page {
	display: flex;
	flex-direction: column;
	height: 100vh;
	background-color: #FBF7F2;
	box-sizing: border-box;
}

.scroll-content {
	flex: 1;
}

/* Avatar Section */
.avatar-section {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 48rpx 0 32rpx;
}

.avatar-wrap {
	position: relative;
	width: 180rpx;
	height: 180rpx;
	border-radius: 50%;
	background: rgba(194, 24, 91, 0.1);
	display: flex;
	align-items: center;
	justify-content: center;
	overflow: hidden;
}

.avatar-img {
	width: 100%;
	height: 100%;
}

.avatar-emoji {
	font-size: 88rpx;
}

.avatar-edit-badge {
	position: absolute;
	right: 0;
	bottom: 0;
	width: 52rpx;
	height: 52rpx;
	border-radius: 50%;
	background: #C2185B;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 4rpx solid #FFFFFF;
}

.avatar-edit-icon {
	font-size: 24rpx;
}

.avatar-hint {
	margin-top: 16rpx;
	font-size: 24rpx;
	color: #9B9590;
}

/* Section Card */
.section-card {
	background: #FFFFFF;
	border-radius: 32rpx;
	box-shadow: 0 4rpx 28rpx rgba(60, 30, 10, 0.07);
	overflow: hidden;
	margin: 20rpx 24rpx 0;
	padding: 0 32rpx 32rpx;
}

.section-header {
	display: flex;
	align-items: center;
	gap: 16rpx;
	padding: 32rpx 0 16rpx;
	border-bottom: 1px solid #F5F2EF;
	margin-bottom: 8rpx;
}

.section-icon {
	width: 52rpx;
	height: 52rpx;
	border-radius: 16rpx;
	background: #FAF0EE;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.section-icon-text {
	font-size: 28rpx;
}

.section-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #1C1A17;
}

/* Form Field */
.form-field {
	padding: 20rpx 0;
}

.field-label {
	display: block;
	font-size: 22rpx;
	font-weight: 500;
	color: #9B9590;
	text-transform: uppercase;
	letter-spacing: 2rpx;
	margin-bottom: 12rpx;
}

.field-input-wrap {
	position: relative;
	display: flex;
	align-items: center;
}

.field-input {
	flex: 1;
	height: 88rpx;
	background: #F5F2EF;
	border-radius: 20rpx;
	padding: 0 28rpx;
	font-size: 28rpx;
	color: #1C1A17;
	border: 2rpx solid transparent;
	transition: all 0.2s ease;
	box-sizing: border-box;
}

.field-input-lg {
	font-size: 34rpx;
	font-weight: 500;
}

.field-placeholder {
	color: #C8C2BC;
	font-size: 28rpx;
}

/* Bottom Spacer */
.bottom-spacer {
	height: 180rpx;
}

/* Fixed Bottom Save Bar */
.save-bar {
	position: fixed;
	left: 0;
	right: 0;
	bottom: 0;
	background: #FFFFFF;
	padding: 20rpx 32rpx;
	padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
	box-shadow: 0 -4rpx 24rpx rgba(60, 30, 10, 0.06);
	z-index: 100;
}

.save-bar-inner {
	display: flex;
	align-items: center;
	justify-content: center;
}

.save-btn {
	width: 100%;
	height: 96rpx;
	border-radius: 48rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: linear-gradient(135deg, #7FB88F, #5A9E6F);
	box-shadow: 0 8rpx 24rpx rgba(90, 158, 111, 0.3);
}

.save-btn:active {
	opacity: 0.85;
	transform: scale(0.98);
	transition: all 0.15s ease;
}

.save-btn-text {
	font-size: 32rpx;
	font-weight: 600;
	color: #FFFFFF;
	letter-spacing: 2rpx;
}

/* NavBar right save button */
.nav-save-btn {
	padding: 8rpx 24rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.nav-save-text {
	font-size: 30rpx;
	color: #E8637A;
	font-weight: 600;
}
</style>
```

- [ ] **Step 2: 在 pages.json 注册新页面路由**

在 `pages.json` 的 `pages` 数组中，在 `"pages/profile/about"` 之后添加：

```json
{
	"path": "pages/profile/edit-profile",
	"style": {
		"navigationStyle": "custom",
		"navigationBarTextStyle": "black",
		"backgroundColor": "#FBF7F2"
	}
}
```

- [ ] **Step 3: Commit**

```bash
git add pages/profile/edit-profile.vue pages.json
git commit -m "feat: 添加个人信息编辑页面（头像+昵称）"
```

---

### Task 7: 更新数据库 schema

**Files:**
- Modify: `uniCloud-aliyun/database/mom_users.schema.json`

- [ ] **Step 1: 确认 avatar 字段存在且格式正确**

当前 schema 已有 `avatar` 字段（string 类型，无 maxLength 限制），这已满足需求。不需要新增 `avatar_url` 字段——直接复用现有 `avatar` 字段存储 emoji 或 URL。

无需修改此文件，schema 已完备。

- [ ] **Step 2: Commit（无变更则跳过）**

无需提交。

---

## Self-Review

**Spec coverage check:**
- [x] 登录流程 → Task 1 (云函数) + Task 2 (store) + Task 3 (App.vue)
- [x] 数据模型 → Task 7 (schema 已有，无需改)
- [x] Pinia store 变更 → Task 2
- [x] ProfileHero 变更 → Task 4
- [x] edit-profile 页面 → Task 6
- [x] 数据迁移 → Task 2 (_migrateLocalData)
- [x] 云函数 wxLogin → Task 1
- [x] 错误处理 → 贯穿各 Task（try-catch + 降级）
- [x] pages.json 注册 → Task 6

**Placeholder scan:** 无 TBD/TODO/模糊描述。

**Type consistency:** openid 字段在各 task 中统一为 string 类型。userInfo 的 nickname/avatar 字段名一致。云函数返回 `{ openid, userInfo, isNewUser }` 与 store 中 `silentLogin` 的解构一致。
