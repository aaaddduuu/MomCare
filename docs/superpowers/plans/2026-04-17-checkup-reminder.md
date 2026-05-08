# 产检提醒功能 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将产检提醒页面从硬编码假数据改造为基于真实数据库数据的完整功能。

**Architecture:** 新建 `checkup_schedules` 数据库表存储产检日程，在 `health.js` store 中新增产检日程的 state/getters/actions，重写 `checkup-reminder.vue` 页面并联动个人中心首页。

**Tech Stack:** uni-app (Vue 3 Composition API), Pinia, uniCloud DB, SCSS

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `uniCloud-aliyun/database/checkup_schedules.schema.json` | Create | 数据库表 schema |
| `stores/health.js` | Modify | 新增产检日程的 state、getters、actions、推荐时间表常量 |
| `pages/profile/checkup-reminder.vue` | Rewrite | 从假数据改为真实数据驱动 |
| `pages/profile/index.vue` | Modify | "下次产检"卡片数据动态化 |

---

### Task 1: 创建数据库 Schema

**Files:**
- Create: `uniCloud-aliyun/database/checkup_schedules.schema.json`

- [ ] **Step 1: 创建 checkup_schedules.schema.json**

在 `uniCloud-aliyun/database/` 目录下创建数据库表定义文件。参照已有的 `health_records.schema.json` 格式。

```json
{
	"bsonType": "object",
	"required": ["user_id", "checkup_date", "week_of_pregnancy"],
	"permission": {
		"read": "doc.user_id == auth.uid",
		"create": "doc.user_id == auth.uid",
		"update": "doc.user_id == auth.uid",
		"delete": "doc.user_id == auth.uid"
	},
	"properties": {
		"_id": {
			"description": "记录唯一标识"
		},
		"user_id": {
			"bsonType": "string",
			"description": "用户ID",
			"foreignKey": "mom_users._id"
		},
		"checkup_date": {
			"bsonType": "string",
			"description": "产检日期 YYYY-MM-DD",
			"title": "产检日期"
		},
		"week_of_pregnancy": {
			"bsonType": "int",
			"description": "计划孕周",
			"title": "孕周"
		},
		"week_label": {
			"bsonType": "string",
			"description": "孕周标签（如 孕7周、孕32周）",
			"title": "孕周标签"
		},
		"hospital": {
			"bsonType": "string",
			"description": "医院（为空时取userInfo默认值）",
			"title": "医院"
		},
		"department": {
			"bsonType": "string",
			"description": "科室",
			"title": "科室",
			"defaultValue": "产科门诊"
		},
		"time_slot": {
			"bsonType": "string",
			"description": "时段",
			"title": "时段",
			"enum": ["morning", "afternoon", ""]
		},
		"status": {
			"bsonType": "string",
			"description": "状态",
			"title": "状态",
			"enum": ["upcoming", "completed", "skipped"],
			"defaultValue": "upcoming"
		},
		"exam_items": {
			"bsonType": "array",
			"description": "检查项目列表",
			"title": "检查项目",
			"arrayType": "object"
		},
		"notes": {
			"bsonType": "string",
			"description": "备注",
			"title": "备注",
			"maxLength": 500
		},
		"remind_days_before": {
			"bsonType": "array",
			"description": "提前几天提醒",
			"title": "提醒天数",
			"arrayType": "int"
		},
		"create_time": {
			"bsonType": "timestamp",
			"description": "创建时间",
			"title": "创建时间",
			"forceDefaultValue": {
				"$env": "now"
			}
		},
		"update_time": {
			"bsonType": "timestamp",
			"description": "更新时间",
			"title": "更新时间"
		}
	}
}
```

- [ ] **Step 2: Commit**

```bash
git add uniCloud-aliyun/database/checkup_schedules.schema.json
git commit -m "feat: 新增 checkup_schedules 数据库表定义"
```

---

### Task 2: Store 新增标准产检推荐时间表常量

**Files:**
- Modify: `stores/health.js` (在 `FRUIT_DATA` 常量之后、`getFruitComparison` 函数之前插入)

- [ ] **Step 1: 添加 CHECKUP_TEMPLATES 常量**

在 `stores/health.js` 的 `FRUIT_DATA` 和 `getFruitComparison` 之间插入以下常量。这个常量定义了标准产检推荐时间表，每条记录包含：`dayOffset`（距LMP天数）、`week`（孕周）、`label`（显示标签）、`required`（必查项目）、`optional`（选查项目）。

```javascript
// 标准产检推荐时间表
const CHECKUP_TEMPLATES = [
	{
		dayOffset: 42,
		week: 7,
		label: '孕7周',
		required: ['早孕B超', '血常规', '尿常规', '血型', '甲状腺功能'],
		optional: []
	},
	{
		dayOffset: 84,
		week: 12,
		label: '孕12周',
		required: ['NT检查', '早期唐筛', '血常规', '尿常规'],
		optional: []
	},
	{
		dayOffset: 119,
		week: 17,
		label: '孕17周',
		required: ['中期唐筛', '血常规', '尿常规'],
		optional: ['无创DNA']
	},
	{
		dayOffset: 147,
		week: 21,
		label: '孕21周',
		required: ['大排畸B超', '血常规', '尿常规'],
		optional: []
	},
	{
		dayOffset: 182,
		week: 26,
		label: '孕26周',
		required: ['糖耐量试验(OGTT)', '血常规', '尿常规'],
		optional: []
	},
	{
		dayOffset: 203,
		week: 29,
		label: '孕29周',
		required: ['常规产检', '小排畸B超'],
		optional: []
	},
	{
		dayOffset: 224,
		week: 32,
		label: '孕32周',
		required: ['胎心监护(NST)', '血常规', '尿常规', 'B超'],
		optional: []
	},
	{
		dayOffset: 238,
		week: 34,
		label: '孕34周',
		required: ['胎心监护', '常规产检'],
		optional: []
	},
	{
		dayOffset: 252,
		week: 36,
		label: '孕36周',
		required: ['B超(评估胎位和羊水)', '胎心监护', '血常规'],
		optional: []
	},
	{
		dayOffset: 259,
		week: 37,
		label: '孕37周',
		required: ['胎心监护', '常规产检', '骨盆测量'],
		optional: []
	},
	{
		dayOffset: 266,
		week: 38,
		label: '孕38周',
		required: ['胎心监护', '常规产检'],
		optional: []
	},
	{
		dayOffset: 273,
		week: 39,
		label: '孕39周',
		required: ['胎心监护', 'B超'],
		optional: []
	},
	{
		dayOffset: 280,
		week: 40,
		label: '孕40周',
		required: ['胎心监护', '常规产检'],
		optional: []
	}
]
```

- [ ] **Step 2: Commit**

```bash
git add stores/health.js
git commit -m "feat: 新增标准产检推荐时间表常量 CHECKUP_TEMPLATES"
```

---

### Task 3: Store 新增产检日程 state、getters、actions

**Files:**
- Modify: `stores/health.js` (在 store 函数体内新增，并在 return 中导出)

- [ ] **Step 1: 添加 checkupSchedules state**

在 `const userInfo = ref(...)` 之后添加：

```javascript
const checkupSchedules = ref([])
```

- [ ] **Step 2: 添加 getters**

在 `const fruitComparison = computed(...)` 之后添加：

```javascript
// ── 产检日程 Getters ──

const nextCheckup = computed(() => {
	const todayStr = getRecordKey(new Date())
	return checkupSchedules.value
		.filter(s => s.status === 'upcoming' && s.checkup_date >= todayStr)
		.sort((a, b) => a.checkup_date.localeCompare(b.checkup_date))[0] || null
})

const completedCheckups = computed(() => {
	return checkupSchedules.value
		.filter(s => s.status === 'completed')
		.sort((a, b) => b.checkup_date.localeCompare(a.checkup_date))
})

const upcomingCheckups = computed(() => {
	return checkupSchedules.value
		.filter(s => s.status === 'upcoming')
		.sort((a, b) => a.checkup_date.localeCompare(b.checkup_date))
})
```

- [ ] **Step 3: 添加 actions**

在 `saveRecord` 函数之后、`// ── 统计方法 ──` 之前插入以下函数：

```javascript
// ── 产检日程 ──

function _templateToSchedule(template, lmpDateVal, hospitalDefault) {
	const date = new Date(lmpDateVal.getTime() + template.dayOffset * 86400000)
	const dateKey = getRecordKey(date)
	const examItems = [
		...template.required.map(text => ({ text, required: true, done: false })),
		...template.optional.map(text => ({ text, required: false, done: false }))
	]
	return {
		checkup_date: dateKey,
		week_of_pregnancy: template.week,
		week_label: template.label,
		hospital: hospitalDefault || '',
		department: '产科门诊',
		time_slot: 'morning',
		status: dateKey < getRecordKey(new Date()) ? 'completed' : 'upcoming',
		exam_items: examItems,
		notes: '',
		remind_days_before: [1, 3]
	}
}

async function loadCheckupSchedules() {
	try {
		const db = getDb()
		const res = await db.collection('checkup_schedules')
			.where('user_id == $env.UID')
			.orderBy('checkup_date', 'asc')
			.limit(100)
			.get()

		if (res.result && res.result.data && res.result.data.length > 0) {
			checkupSchedules.value = res.result.data
			console.log('loadCheckupSchedules: 从云端加载', res.result.data.length, '条')
		} else {
			checkupSchedules.value = []
		}
	} catch (e) {
		console.error('loadCheckupSchedules 云端加载失败:', e)
		checkupSchedules.value = []
	}
}

async function initCheckupSchedules() {
	try {
		const db = getDb()
		const { uid: userId } = uniCloud.getCurrentUserInfo()
		if (!userId) {
			console.warn('initCheckupSchedules: 未登录')
			return
		}

		const hospitalDefault = userInfo.value.hospital || ''
		const newSchedules = CHECKUP_TEMPLATES.map(template =>
			_templateToSchedule(template, lmpDate.value, hospitalDefault)
		)

		// 批量写入云端
		for (const schedule of newSchedules) {
			await db.collection('checkup_schedules').add({
				...schedule,
				user_id: userId
			})
		}

		checkupSchedules.value = newSchedules
		console.log('initCheckupSchedules: 已生成', newSchedules.length, '条产检日程')
	} catch (e) {
		console.error('initCheckupSchedules 失败:', e)
	}
}

async function updateCheckupSchedule(scheduleId, data) {
	// 本地更新
	const idx = checkupSchedules.value.findIndex(s => s._id === scheduleId)
	if (idx >= 0) {
		checkupSchedules.value[idx] = { ...checkupSchedules.value[idx], ...data }
	}

	// 云端更新
	try {
		const db = getDb()
		await db.collection('checkup_schedules')
			.doc(scheduleId)
			.update({ ...data, update_time: dateToCloudDate(new Date()) })
		console.log('updateCheckupSchedule: 云端更新成功')
	} catch (e) {
		console.error('updateCheckupSchedule 云端更新失败:', e)
	}
}

async function toggleExamItem(scheduleId, itemIdx) {
	const schedule = checkupSchedules.value.find(s => s._id === scheduleId)
	if (!schedule) return

	const items = [...schedule.exam_items]
	items[itemIdx].done = !items[itemIdx].done
	await updateCheckupSchedule(scheduleId, { exam_items: items })
}

async function markCheckupCompleted(scheduleId) {
	await updateCheckupSchedule(scheduleId, { status: 'completed' })
}
```

- [ ] **Step 4: 在 return 对象中导出新增内容**

在 return 对象中添加以下导出。在 `// actions` 部分的 `saveRecord,` 之后添加：

```javascript
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
```

- [ ] **Step 5: Commit**

```bash
git add stores/health.js
git commit -m "feat: health store 新增产检日程 state/getters/actions"
```

---

### Task 4: 重写 checkup-reminder.vue 页面

**Files:**
- Rewrite: `pages/profile/checkup-reminder.vue`

- [ ] **Step 1: 完整重写 checkup-reminder.vue**

替换整个文件内容。页面结构：Hero区域（动态数据）+ 产检信息卡片 + 检查项目清单 + 历史产检记录时间线。保持现有 SCSS 样式风格。

```vue
<template>
	<view class="page">
		<!-- Hero -->
		<view class="hero-rose">
			<NavBar title="产检提醒" theme="dark" :showBack="true" class="hero-navbar" />
			<view class="hero-content">
				<template v-if="nextCheckup">
					<text class="hero-label">下次产检日期</text>
					<text class="hero-date">{{ heroDate }}</text>
					<text class="hero-sub">{{ heroSub }}</text>
					<view class="countdown-pill">
						<text class="countdown-num">{{ daysUntil }}</text>
						<text class="countdown-lbl">天后</text>
					</view>
				</template>
				<template v-else>
					<text class="hero-label">产检安排</text>
					<text class="hero-date">已全部完成</text>
					<text class="hero-sub">所有产检日程已完成，祝您一切顺利</text>
				</template>
			</view>
		</view>

		<scroll-view scroll-y class="scroll-content">
			<!-- 无数据时初始化提示 -->
			<view v-if="loading" class="loading-container">
				<view class="loading-spinner"></view>
				<text class="loading-text">加载中...</text>
			</view>

			<template v-else-if="nextCheckup">
				<!-- 产检信息卡片 -->
				<view class="info-card">
					<text class="info-title">本次产检信息</text>
					<view class="info-row">
						<text class="info-icon">📅</text>
						<text class="info-text">{{ infoDate }}</text>
					</view>
					<view class="info-row">
						<text class="info-icon">🏥</text>
						<text class="info-text">{{ infoHospital }}</text>
					</view>
					<view class="info-row">
						<text class="info-icon">👩‍⚕️</text>
						<text class="info-text">预计孕周：{{ nextCheckup.week_label }}</text>
					</view>
				</view>

				<!-- 检查项目清单 -->
				<text class="section-title">本次需要做的检查</text>
				<view class="exam-list">
					<view
						v-for="(item, idx) in nextCheckup.exam_items"
						:key="idx"
						class="exam-item"
						:class="{ 'exam-checked': item.done }"
						@tap="handleToggleItem(idx)"
					>
						<view class="exam-check">
							<text v-if="item.done" class="check-mark">✓</text>
						</view>
						<text class="exam-text" :class="{ 'exam-text-done': item.done }">{{ item.text }}</text>
						<view class="exam-tag" :class="item.required ? 'tag-req' : 'tag-opt'">
							<text class="exam-tag-text">{{ item.required ? '必查' : '选查' }}</text>
						</view>
					</view>
				</view>
			</template>

			<!-- 历史产检记录 -->
			<template v-if="completedCheckups.length > 0">
				<text class="section-title">历史产检记录</text>
				<view class="history-list">
					<view
						v-for="(item, idx) in completedCheckups"
						:key="'h-' + idx"
						class="history-item"
					>
						<view class="history-left">
							<view class="history-dot"></view>
							<view class="history-info">
								<text class="history-date">{{ formatHistoryDate(item.checkup_date) }}</text>
								<text class="history-week">{{ item.week_label }}</text>
							</view>
						</view>
						<view class="history-right">
							<text class="history-done-count">{{ countDoneItems(item) }}/{{ item.exam_items.length }}</text>
							<text class="history-done-label">项已完成</text>
						</view>
					</view>
				</view>
			</template>

			<view class="bottom-spacer"></view>
		</scroll-view>
	</view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useHealthStore, calcWeekInfo } from '@/stores/health.js'
import NavBar from '@/components/NavBar.vue'

const healthStore = useHealthStore()
const loading = ref(true)

// 下一次产检
const nextCheckup = computed(() => healthStore.nextCheckup)
const completedCheckups = computed(() => healthStore.completedCheckups)

// Hero 区域数据
const heroDate = computed(() => {
	if (!nextCheckup.value) return ''
	const d = new Date(nextCheckup.value.checkup_date)
	return `${d.getMonth() + 1}月${d.getDate()}日`
})

const heroSub = computed(() => {
	if (!nextCheckup.value) return ''
	const c = nextCheckup.value
	const d = new Date(c.checkup_date)
	const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
	const timeLabel = c.time_slot === 'morning' ? '上午' : c.time_slot === 'afternoon' ? '下午' : ''
	let sub = weekDays[d.getDay()]
	if (timeLabel) sub += ` · ${timeLabel}`
	if (c.hospital) sub += ` · ${c.hospital}`
	if (c.department) sub += ` · ${c.department}`
	return sub
})

const daysUntil = computed(() => {
	if (!nextCheckup.value) return 0
	const target = new Date(nextCheckup.value.checkup_date)
	const today = new Date()
	const diff = Math.ceil((target - today) / 86400000)
	return Math.max(0, diff)
})

// 产检信息卡片数据
const infoDate = computed(() => {
	if (!nextCheckup.value) return ''
	const c = nextCheckup.value
	const d = new Date(c.checkup_date)
	const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
	const timeLabel = c.time_slot === 'morning' ? '上午 09:30' : c.time_slot === 'afternoon' ? '下午 14:00' : ''
	return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日（${weekDays[d.getDay()]}）${timeLabel}`
})

const infoHospital = computed(() => {
	if (!nextCheckup.value) return ''
	const c = nextCheckup.value
	let text = c.hospital || healthStore.userInfo.hospital || '未设置医院'
	if (c.department) text += ` · ${c.department}`
	return text
})

// 交互
function handleToggleItem(itemIdx) {
	if (!nextCheckup.value || !nextCheckup.value._id) return
	healthStore.toggleExamItem(nextCheckup.value._id, itemIdx)
}

function formatHistoryDate(dateStr) {
	if (!dateStr) return ''
	const d = new Date(dateStr)
	return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

function countDoneItems(schedule) {
	if (!schedule.exam_items) return 0
	return schedule.exam_items.filter(i => i.done).length
}

// 加载数据
onMounted(async () => {
	await healthStore.loadCheckupSchedules()
	if (healthStore.checkupSchedules.length === 0) {
		await healthStore.initCheckupSchedules()
	}
	loading.value = false
})
</script>

<style scoped lang="scss">
.page {
	display: flex;
	flex-direction: column;
	height: 100vh;
	background-color: #FBF7F2;
}

.hero-rose {
	background: linear-gradient(155deg, #C45070 0%, #E07898 40%, #F4C0CC 100%);
	padding: 0 36rpx 40rpx;
	flex-shrink: 0;
	position: relative;
	overflow: hidden;
}

.hero-navbar :deep(.nav-bar-dark) {
	background: transparent;
}

.hero-navbar :deep(.status-bar-dark) {
	background: transparent;
}

.hero-content {
	position: relative;
	z-index: 1;
}

.hero-label {
	display: block;
	font-size: 22rpx;
	color: rgba(255, 255, 255, 0.7);
	letter-spacing: 3rpx;
	margin-bottom: 6rpx;
}

.hero-date {
	display: block;
	font-size: 84rpx;
	font-weight: 700;
	color: #FFFFFF;
	line-height: 1;
}

.hero-sub {
	display: block;
	font-size: 24rpx;
	color: rgba(255, 255, 255, 0.8);
	margin-top: 6rpx;
}

.countdown-pill {
	display: inline-flex;
	align-items: center;
	gap: 12rpx;
	background: rgba(255, 255, 255, 0.2);
	border: 2rpx solid rgba(255, 255, 255, 0.3);
	border-radius: 999rpx;
	padding: 12rpx 28rpx;
	margin-top: 20rpx;
}

.countdown-num {
	font-size: 44rpx;
	font-weight: 700;
	color: #FFFFFF;
}

.countdown-lbl {
	font-size: 22rpx;
	color: rgba(255, 255, 255, 0.8);
}

.scroll-content { flex: 1; }

.loading-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 120rpx 0;
}

.loading-spinner {
	width: 48rpx;
	height: 48rpx;
	border: 4rpx solid #E4E1DC;
	border-top-color: #C45070;
	border-radius: 50%;
	animation: spin 0.8s linear infinite;
	margin-bottom: 16rpx;
}

@keyframes spin {
	to { transform: rotate(360deg); }
}

.loading-text {
	font-size: 26rpx;
	color: #9C9890;
}

.info-card {
	background: #FFFFFF;
	border-radius: 32rpx;
	box-shadow: 0 4rpx 28rpx rgba(60, 30, 10, 0.07);
	margin: 28rpx 28rpx 0;
	padding: 28rpx;
}

.info-title {
	display: block;
	font-size: 28rpx;
	font-weight: 600;
	color: #1C1A17;
	margin-bottom: 20rpx;
}

.info-row {
	display: flex;
	gap: 16rpx;
	margin-bottom: 16rpx;
	align-items: flex-start;
}

.info-row:last-child { margin-bottom: 0; }

.info-icon {
	font-size: 28rpx;
	flex-shrink: 0;
	margin-top: 2rpx;
}

.info-text {
	font-size: 26rpx;
	color: #4A4844;
	line-height: 1.6;
}

.section-title {
	display: block;
	padding: 20rpx 28rpx 12rpx;
	font-size: 26rpx;
	font-weight: 600;
	color: #1C1A17;
}

.exam-list {
	padding: 0 28rpx;
}

.exam-item {
	background: #FFFFFF;
	border-radius: 20rpx;
	box-shadow: 0 4rpx 28rpx rgba(60, 30, 10, 0.07);
	padding: 24rpx 26rpx;
	margin-bottom: 16rpx;
	display: flex;
	align-items: center;
	gap: 20rpx;
}

.exam-item:active {
	opacity: 0.85;
	transform: scale(0.98);
}

.exam-check {
	width: 40rpx;
	height: 40rpx;
	border-radius: 10rpx;
	border: 4rpx solid #E8DDD0;
	background: #F2F0EE;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.exam-checked .exam-check {
	background: #7BA08C;
	border-color: #7BA08C;
}

.check-mark {
	font-size: 22rpx;
	color: #FFFFFF;
}

.exam-text {
	font-size: 26rpx;
	color: #1C1A17;
	flex: 1;
}

.exam-text-done {
	text-decoration: line-through;
	color: #9C9890;
}

.exam-tag {
	padding: 4rpx 14rpx;
	border-radius: 999rpx;
	flex-shrink: 0;
}

.tag-req { background: #FAEAEE; }
.tag-req .exam-tag-text { color: #B04560; }
.tag-opt { background: #F2F0EE; }
.tag-opt .exam-tag-text { color: #9C9890; }

.exam-tag-text {
	font-size: 20rpx;
	font-weight: 600;
}

/* ── 历史记录 ── */
.history-list {
	padding: 0 28rpx;
}

.history-item {
	background: #FFFFFF;
	border-radius: 20rpx;
	box-shadow: 0 4rpx 28rpx rgba(60, 30, 10, 0.07);
	padding: 24rpx 26rpx;
	margin-bottom: 16rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.history-left {
	display: flex;
	align-items: center;
	gap: 20rpx;
}

.history-dot {
	width: 20rpx;
	height: 20rpx;
	border-radius: 50%;
	background: #7BA08C;
	flex-shrink: 0;
}

.history-info {
	display: flex;
	flex-direction: column;
	gap: 4rpx;
}

.history-date {
	font-size: 28rpx;
	font-weight: 600;
	color: #1C1A17;
}

.history-week {
	font-size: 22rpx;
	color: #9C9890;
}

.history-right {
	display: flex;
	align-items: center;
	gap: 4rpx;
}

.history-done-count {
	font-size: 28rpx;
	font-weight: 700;
	color: #7BA08C;
}

.history-done-label {
	font-size: 22rpx;
	color: #9C9890;
}

.bottom-spacer { height: 40rpx; }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add pages/profile/checkup-reminder.vue
git commit -m "feat: 重写产检提醒页，对接真实数据库数据"
```

---

### Task 5: 个人中心"下次产检"卡片动态化

**Files:**
- Modify: `pages/profile/index.vue` (修改 `todoItems` computed 属性)

- [ ] **Step 1: 修改 todoItems computed 属性**

将 `todoItems` 从硬编码改为从 store 读取真实数据。找到 `// 待办 & 提醒` 下方的 `const todoItems = computed(...)` 代码块（约第158-183行），替换为：

```javascript
// 待办 & 提醒
const todoItems = computed(() => {
	const next = healthStore.nextCheckup
	let checkupSubtitle = '暂无产检安排'
	let checkupBadge = ''
	let checkupBadgeStyle = ''
	if (next) {
		const d = new Date(next.checkup_date)
		const todayDate = new Date()
		const days = Math.ceil((d - todayDate) / 86400000)
		const m = d.getMonth() + 1
		const day = d.getDate()
		if (days > 0) {
			checkupSubtitle = `${m}月${day}日 · 还有 ${days} 天`
			checkupBadge = days + '天后'
			checkupBadgeStyle = 'amber'
		} else if (days === 0) {
			checkupSubtitle = `${m}月${day}日 · 就是今天`
			checkupBadge = '今天'
			checkupBadgeStyle = 'rose'
		} else {
			checkupSubtitle = `${m}月${day}日 · 已过期`
			checkupBadge = '已过期'
			checkupBadgeStyle = 'gray'
		}
	}

	return [
		{
			icon: '🗓',
			iconBg: '#FAEAEE',
			title: '下次产检',
			subtitle: checkupSubtitle,
			badge: checkupBadge,
			badgeStyle: checkupBadgeStyle,
			action: 'nextCheckup'
		},
		{
			icon: '🎒',
			iconBg: '#EEE8FA',
			title: '待产包清单',
			subtitle: '已完成 12 / 28 项',
			action: 'hospitalBag'
		},
		{
			icon: '📋',
			iconBg: '#EAF7EF',
			title: '今日计划',
			subtitle: '产检 · 练习呼吸法 · 整理报告',
			action: 'dailyPlan'
		}
	]
})
```

- [ ] **Step 2: 在 profile 页面的 onMounted 或初始化逻辑中加载产检日程**

在 `pages/profile/index.vue` 的 `<script setup>` 中，找到页面初始化位置。在已有的 store 初始化代码之后添加：

```javascript
// 加载产检日程（用于首页卡片显示）
healthStore.loadCheckupSchedules().then(() => {
	if (healthStore.checkupSchedules.length === 0) {
		healthStore.initCheckupSchedules()
	}
})
```

注意：这段代码放在 `<script setup>` 顶层执行，不需要新的 onMounted（如果 profile 页面已有 onMounted，放在其回调内也可以）。

- [ ] **Step 3: Commit**

```bash
git add pages/profile/index.vue
git commit -m "feat: 个人中心下次产检卡片改为动态数据"
```

---

### Task 6: 最终验证和合并提交

- [ ] **Step 1: 检查所有文件修改**

确认以下文件都已正确修改：
- `uniCloud-aliyun/database/checkup_schedules.schema.json` — 新建
- `stores/health.js` — 新增常量、state、getters、actions、导出
- `pages/profile/checkup-reminder.vue` — 完整重写
- `pages/profile/index.vue` — todoItems 动态化 + 初始化加载

```bash
git status
```

- [ ] **Step 2: 检查是否有遗漏的语法问题**

快速检查各文件是否有明显的语法错误（括号未闭合、逗号缺失等）。

- [ ] **Step 3: 最终合并提交（如有未提交的修改）**

```bash
git add -A
git commit -m "feat: 产检提醒功能完整实现 — 数据库+Store+页面+联动"
```
