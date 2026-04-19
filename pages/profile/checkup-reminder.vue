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
	padding: 0 36rpx 40rpx;
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
