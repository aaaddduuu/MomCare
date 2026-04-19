<template>
	<view class="page">
		<!-- Hero -->
		<view class="detail-hero">
			<view class="status-bar">
				<text class="sb-time">9:41</text>
				<view class="sb-icons"><text>●●●</text><text>🔋</text></view>
			</view>
			<view class="hero-top">
				<view class="back-btn" @tap="goBack"><text class="back-arrow">‹</text></view>
				<view v-if="offset !== 0" class="today-btn" @tap="goToday">
					<text class="today-btn-text">回到今天</text>
				</view>
			</view>
			<text class="hero-title">{{ heroTitle }}</text>
			<text class="hero-sub">{{ heroSub }}</text>
		</view>

		<!-- Day nav bar -->
		<view class="day-nav">
			<view class="dn-btn" @tap="slideDay(-1)"><text class="dn-arrow">‹</text></view>
			<view class="dn-center">
				<text class="dn-date">{{ navDate }}</text>
				<text class="dn-week">{{ heroTitle }}</text>
			</view>
			<view class="dn-btn" @tap="slideDay(1)"><text class="dn-arrow">›</text></view>
		</view>

		<!-- Content -->
		<scroll-view class="content-scroll" scroll-y>
			<view class="content">
				<!-- 宝宝今日状态 -->
				<view class="dc-card dc-card-baby">
					<view class="dc-header">
						<text class="dc-icon">👶</text>
						<text class="dc-title">宝宝今日状态</text>
					</view>
					<view class="dc-body">
						<text class="dc-para">{{ dayData.baby.detail }}</text>
						<view v-if="dayData.baby.highlight" class="dc-highlight dc-highlight-rose">
							<text>{{ dayData.baby.highlight }}</text>
						</view>
					</view>
				</view>

				<!-- 妈妈今日变化 -->
				<view class="dc-card dc-card-mom">
					<view class="dc-header">
						<text class="dc-icon">💆</text>
						<text class="dc-title">妈妈今日变化</text>
					</view>
					<view class="dc-body">
						<text class="dc-para">{{ dayData.mom.detail }}</text>
					</view>
				</view>

				<!-- 今日饮食建议 -->
				<view class="dc-card dc-card-diet">
					<view class="dc-header">
						<text class="dc-icon">🥗</text>
						<text class="dc-title">今日饮食建议</text>
					</view>
					<view class="dc-body">
						<view class="dc-list">
							<view class="dc-list-item" v-for="(item, idx) in dayData.diet" :key="idx">
								<text class="dc-bullet dc-bullet-amber">•</text>
								<text class="dc-list-text">{{ item }}</text>
							</view>
						</view>
					</view>
				</view>

				<!-- 今日注意事项 -->
				<view class="dc-card dc-card-care">
					<view class="dc-header">
						<text class="dc-icon">⚠️</text>
						<text class="dc-title">今日注意事项</text>
					</view>
					<view class="dc-body">
						<view class="dc-list">
							<view class="dc-list-item" v-for="(item, idx) in dayData.care" :key="idx">
								<text class="dc-bullet dc-bullet-lav">•</text>
								<text class="dc-list-text">{{ item }}</text>
							</view>
						</view>
					</view>
				</view>

				<view style="height: 40rpx;"></view>
			</view>
		</scroll-view>
	</view>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const baseTotal = ref(226) // 默认孕 32 周 3 天
const offset = ref(0) // -2 ~ +2, 0 = 当天
const cloudData = ref(null) // 云端加载的当天数据
const loadError = ref(false)

onLoad(async (options) => {
	if (options.totalDays) {
		baseTotal.value = parseInt(options.totalDays) || 226
	}
	await loadCloudData()
})

const currentTotal = computed(() => baseTotal.value + offset.value)

const weekInfo = computed(() => {
	const total = currentTotal.value
	if (total < 0) return { week: 0, day: 0 }
	return { week: Math.floor(total / 7), day: total % 7 }
})

const isToday = computed(() => offset.value === 0)

const heroTitle = computed(() => `孕 ${weekInfo.value.week} 周 ${weekInfo.value.day} 天`)

function getDateByOffset(off) {
	const d = new Date()
	d.setDate(d.getDate() + off)
	return d
}

function formatDate(date) {
	return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}

const heroSub = computed(() => {
	const date = getDateByOffset(offset.value)
	return `${formatDate(date)}${isToday.value ? ' · 今天' : ''}`
})

const navDate = computed(() => {
	const date = getDateByOffset(offset.value)
	return `${date.getMonth() + 1}月${date.getDate()}日${isToday.value ? '（今天）' : ''}`
})

function slideDay(dir) {
	const next = offset.value + dir
	if (next >= -2 && next <= 2) {
		offset.value = next
	}
}

function goToday() {
	offset.value = 0
}

function goBack() {
	uni.navigateBack()
}

// ── 云端数据加载 ──
async function loadCloudData() {
	const total = currentTotal.value
	if (total < 0) return
	loadError.value = false
	try {
		const db = uniCloud.database()
		const res = await db.collection('pregnancy_daily')
			.where(`total_days == ${total}`)
			.limit(1)
			.get()
		if (res.result && res.result.data && res.result.data.length > 0) {
			cloudData.value = res.result.data[0]
		} else {
			cloudData.value = null
		}
	} catch (e) {
		console.warn('每日详情数据加载失败，使用兜底数据:', e)
		loadError.value = true
		cloudData.value = null
	}
}

// offset 变化时重新加载对应天的数据
watch(currentTotal, () => {
	loadCloudData()
})

// ── 兜底数据 ──
const FALLBACK = {
	baby: {
		icon: '👶',
		detail: '宝宝正在持续成长发育中，每天都会有新变化。请关注产检结果，了解宝宝的发育情况。',
		highlight: ''
	},
	mom: {
		icon: '💆',
		detail: '注意休息，保持良好的心态。规律作息和均衡饮食对妈妈和宝宝都很重要。'
	},
	diet: [
		'保持营养均衡，多吃新鲜蔬果',
		'适量补充蛋白质，如鸡蛋、瘦肉、豆制品',
		'每天保证充足的水分摄入',
		'避免生冷和刺激性食物'
	],
	care: [
		'保持规律作息，避免过度劳累',
		'按时产检，关注宝宝发育情况',
		'保持心情愉快，适当活动',
		'有异常情况及时就医'
	]
}

// 将云端记录映射为模板格式
function cloudToDayData(record) {
	if (!record) return FALLBACK
	return {
		baby: {
			icon: record.baby_icon || '👶',
			detail: record.baby_detail || record.baby_summary || FALLBACK.baby.detail,
			highlight: record.baby_highlight || ''
		},
		mom: {
			icon: record.mom_icon || '💆',
			detail: record.mom_detail || record.mom_summary || FALLBACK.mom.detail
		},
		diet: (record.diet_tips && record.diet_tips.length > 0) ? record.diet_tips : FALLBACK.diet,
		care: (record.care_tips && record.care_tips.length > 0) ? record.care_tips : FALLBACK.care
	}
}

const dayData = computed(() => {
	if (cloudData.value) {
		return cloudToDayData(cloudData.value)
	}
	return FALLBACK
})
</script>

<style scoped lang="scss">
$cream: #FBF7F2;
$cream2: #F5EFE6;
$cream3: #EDE3D6;
$rose: #D4627A;
$rose-lt: #FAEAEE;
$rose-dk: #B04560;
$sage: #7BA08C;
$sage-lt: #EAF2EE;
$amber: #C98A3A;
$amber-lt: #FDF3E3;
$lavender: #9B7EC8;
$lav-lt: #F2EDFB;
$gray400: #9C9890;
$gray600: #4A4844;
$gray900: #1C1A17;
$border: #E8DDD0;

.page {
	min-height: 100vh;
	background: $cream;
	display: flex;
	flex-direction: column;
}

/* Hero */
.detail-hero {
	background: linear-gradient(160deg, #C85A72 0%, #E8809A 50%, #F4C0CC 100%);
	padding: 0 40rpx 40rpx;
	flex-shrink: 0;
}

.status-bar {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 20rpx 0;
	font-size: 24rpx;
	font-weight: 600;
	color: white;
}

.sb-icons {
	display: flex;
	gap: 10rpx;
	font-size: 22rpx;
}

.hero-top {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 16rpx;
}

.back-btn {
	width: 64rpx;
	height: 64rpx;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.2);
	display: flex;
	align-items: center;
	justify-content: center;
}

.back-arrow {
	font-size: 36rpx;
	color: white;
	line-height: 1;
}

.today-btn {
	background: rgba(255, 255, 255, 0.25);
	border-radius: 999rpx;
	padding: 10rpx 24rpx;
}

.today-btn-text {
	font-size: 22rpx;
	font-weight: 600;
	color: white;
}

.hero-title {
	font-size: 44rpx;
	font-weight: 700;
	color: white;
	display: block;
	margin-bottom: 6rpx;
}

.hero-sub {
	font-size: 24rpx;
	color: rgba(255, 255, 255, 0.8);
	display: block;
}

/* Day nav */
.day-nav {
	background: white;
	border-bottom: 2rpx solid $border;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 16rpx 28rpx;
	flex-shrink: 0;
}

.dn-btn {
	width: 56rpx;
	height: 56rpx;
	border-radius: 50%;
	background: $cream;
	display: flex;
	align-items: center;
	justify-content: center;
}

.dn-arrow {
	font-size: 30rpx;
	color: $gray600;
	line-height: 1;
}

.dn-center {
	text-align: center;
	flex: 1;
}

.dn-date {
	font-size: 26rpx;
	font-weight: 600;
	color: $gray900;
	display: block;
}

.dn-week {
	font-size: 20rpx;
	color: $gray400;
	display: block;
	margin-top: 2rpx;
}

/* Content */
.content-scroll {
	flex: 1;
	height: 0;
}

.content {
	padding: 24rpx 28rpx;
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}

/* Cards */
.dc-card {
	background: white;
	border-radius: 28rpx;
	box-shadow: 0 4rpx 28rpx rgba(60, 30, 10, 0.07);
	overflow: hidden;
	border-left: 6rpx solid transparent;
}

.dc-card-baby {
	border-left-color: $rose;
}

.dc-card-mom {
	border-left-color: $sage;
}

.dc-card-diet {
	border-left-color: $amber;
}

.dc-card-care {
	border-left-color: $lavender;
}

.dc-header {
	display: flex;
	align-items: center;
	gap: 14rpx;
	padding: 24rpx 28rpx;
	border-bottom: 2rpx solid $cream2;
}

.dc-icon {
	font-size: 36rpx;
}

.dc-title {
	font-size: 28rpx;
	font-weight: 600;
	color: $gray900;
}

.dc-body {
	padding: 24rpx 28rpx;
}

.dc-para {
	font-size: 26rpx;
	color: $gray600;
	line-height: 1.8;
	display: block;
}

.dc-highlight {
	border-radius: 16rpx;
	padding: 16rpx 24rpx;
	margin-top: 16rpx;
	font-size: 24rpx;
	line-height: 1.7;
	border-left: 5rpx solid;
}

.dc-highlight-rose {
	background: $rose-lt;
	border-left-color: $rose;
	color: $rose-dk;
}

/* List */
.dc-list {
	display: flex;
	flex-direction: column;
	gap: 14rpx;
}

.dc-list-item {
	display: flex;
	align-items: flex-start;
	gap: 14rpx;
}

.dc-bullet {
	font-size: 28rpx;
	font-weight: 700;
	flex-shrink: 0;
	margin-top: 2rpx;
}

.dc-bullet-amber {
	color: $amber;
}

.dc-bullet-lav {
	color: $lavender;
}

.dc-list-text {
	font-size: 26rpx;
	color: $gray600;
	line-height: 1.6;
}
</style>
