<template>
	<view class="guide-card" @tap="handleTap">
		<!-- Header -->
		<view class="guide-header">
			<view class="week-badge">
				<text class="week-badge-text">{{ weekInfo?.week || '--' }}周</text>
			</view>
			<view class="guide-header-text">
				<text class="guide-title">{{ guideTitle }}</text>
				<text class="guide-subtitle">{{ guideSubtitle }}</text>
			</view>
		</view>

		<!-- Tags -->
		<view class="guide-tags">
			<view class="tag tag-baby" v-for="(tag, idx) in babyTags" :key="'baby-' + idx">
				<text class="tag-text">{{ tag }}</text>
			</view>
			<view class="tag tag-mom" v-for="(tag, idx) in momTags" :key="'mom-' + idx">
				<text class="tag-text">{{ tag }}</text>
			</view>
			<view class="tag tag-food" v-for="(tag, idx) in foodTags" :key="'food-' + idx">
				<text class="tag-text">{{ tag }}</text>
			</view>
		</view>

		<!-- Footer -->
		<view class="guide-footer">
			<text class="guide-read-link">阅读本周完整孕期指南 ›</text>
		</view>
	</view>
</template>

<script setup>
import { computed } from 'vue'
import { getTrimester, getTrimesterName } from '@/stores/health.js'

const props = defineProps({
	weekInfo: {
		type: Object,
		default: () => ({ week: 0, day: 0, total: 0 })
	},
	daysUntilDue: {
		type: Number,
		default: 0
	}
})

const emit = defineEmits(['tapCard'])

const week = computed(() => props.weekInfo?.week || 0)

const trimester = computed(() => getTrimester(week.value))
const trimesterName = computed(() => getTrimesterName(trimester.value))

const guideTitle = computed(() => {
	const w = week.value
	if (!w) return '加载中...'
	return `第${w}周孕期指南`
})

const guideSubtitle = computed(() => {
	const w = week.value
	if (!w) return ''
	return `${trimesterName.value} · 距预产期还有${props.daysUntilDue}天`
})

// Mock data for tags based on the current week
const babyTags = computed(() => {
	const w = week.value
	if (w <= 12) return ['👶 胚胎成形', '💓 心脏跳动']
	if (w <= 16) return ['👶 骨骼发育', '👐 开始活动']
	if (w <= 20) return ['👶 感觉发育', '👂 听到声音']
	if (w <= 24) return ['👶 快速生长', '👣 胎动明显']
	if (w <= 28) return ['👶 眼睛睁开', '🫁 肺部成熟']
	if (w <= 32) return ['👶 大脑发育', '💪 脂肪积累']
	if (w <= 36) return ['👶 皮下脂肪', '🔄 胎位固定']
	return ['👶 发育完成', '📦 准备出生']
})

const momTags = computed(() => {
	const w = week.value
	if (w <= 12) return ['🤰 早孕反应', '😴 容易疲劳']
	if (w <= 16) return ['🤰 肚子微凸', '🍽 食欲恢复']
	if (w <= 20) return ['🤰 胎动感知', '💕 情绪波动']
	if (w <= 24) return ['🤰 腰酸背痛', '🩺 定期产检']
	if (w <= 28) return ['🤰 行动不便', '😴 睡眠困难']
	if (w <= 32) return ['🤰 水肿明显', '😮‍💨 气短乏力']
	if (w <= 36) return ['🤰 尿频加重', '🏥 待产准备']
	return ['🤰 随时待产', '🏥 准备入院']
})

const foodTags = computed(() => {
	const w = week.value
	if (w <= 12) return ['🥬 叶酸补充', '🚫 避免生食']
	if (w <= 16) return ['🥛 补钙重要', '🥩 优质蛋白']
	if (w <= 20) return ['🐟 DHA摄入', '🍊 维生素C']
	if (w <= 24) return ['🥜 补铁食物', '💧 多喝水']
	if (w <= 28) return ['🫘 膳食纤维', '🧂 少盐饮食']
	if (w <= 32) return ['🥚 高蛋白', '🍌 防便秘']
	if (w <= 36) return ['🍲 少量多餐', '🫐 抗氧化食物']
	return ['🍯 补充能量', '🍼 准备哺乳']
})

function handleTap() {
	emit('tapCard')
}
</script>

<style scoped lang="scss">
.guide-card {
	background: linear-gradient(135deg, #FAF3F6 0%, #FEF9F0 100%);
	border: 2rpx solid #F0E4E8;
	border-radius: 32rpx;
	padding: 36rpx 32rpx 0;
	box-shadow: 0 8rpx 32rpx rgba(194, 24, 91, 0.08);
}

/* Header */
.guide-header {
	display: flex;
	align-items: center;
	margin-bottom: 28rpx;
}

.week-badge {
	width: 88rpx;
	height: 88rpx;
	background: linear-gradient(135deg, #E8637A 0%, #C2185B 100%);
	border-radius: 24rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
	margin-right: 24rpx;
}

.week-badge-text {
	font-size: 28rpx;
	font-weight: 700;
	color: #FFFFFF;
	line-height: 1;
}

.guide-header-text {
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: center;
}

.guide-title {
	display: block;
	font-size: 34rpx;
	font-weight: 600;
	color: #1C1A17;
	line-height: 1.3;
	margin-bottom: 6rpx;
}

.guide-subtitle {
	display: block;
	font-size: 24rpx;
	color: #9E8A90;
	line-height: 1.4;
}

/* Tags */
.guide-tags {
	display: flex;
	flex-wrap: wrap;
	gap: 16rpx;
	margin-bottom: 28rpx;
}

.tag {
	display: inline-flex;
	align-items: center;
	padding: 10rpx 20rpx;
	border-radius: 24rpx;
}

.tag-text {
	font-size: 22rpx;
	line-height: 1.3;
}

.tag-baby {
	background-color: #FCE7F3;
}

.tag-baby .tag-text {
	color: #C2185B;
}

.tag-mom {
	background-color: #E8F5E9;
}

.tag-mom .tag-text {
	color: #2E7D32;
}

.tag-food {
	background-color: #FFF8E1;
}

.tag-food .tag-text {
	color: #E65100;
}

/* Footer */
.guide-footer {
	border-top: 1rpx solid #F0E4E8;
	padding: 24rpx 0 28rpx;
	display: flex;
	align-items: center;
	justify-content: flex-end;
}

.guide-read-link {
	font-size: 26rpx;
	font-weight: 500;
	color: #C2185B;
}
</style>
