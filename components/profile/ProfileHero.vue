<template>
	<view class="pc-hero">
		<!-- 状态栏占位 -->
		<view class="status-bar-spacer" :style="{ height: statusBarHeight + 'px' }"></view>

		<view class="pc-avatar-wrap">
			<!-- 头像 -->
			<view class="pc-avatar">
				<image v-if="isCustomAvatar" class="pc-avatar-img" :src="displayAvatar" mode="aspectFill" />
				<text v-else class="pc-avatar-text">{{ displayAvatar }}</text>
			</view>
			<view class="pc-name-block">
				<text class="pc-name">{{ displayName }}</text>
				<view class="pc-preg-tag" v-if="pregInfoSet && weekInfo && weekInfo.week > 0">
					<text class="pc-preg-tag-text">🤰 孕 {{ weekInfo.week }} 周 {{ weekInfo.day }} 天 · {{ trimesterName }}</text>
				</view>
				<view class="pc-preg-tag" v-else>
					<text class="pc-preg-tag-text">暂未设置孕期信息</text>
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
				<text class="pc-stat-val">{{ babyWeight }}</text>
				<text class="pc-stat-lbl">宝宝估重</text>
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
import { useHealthStore } from '@/stores/health.js'

const props = defineProps({
	userInfo: { type: Object, required: true },
	weekInfo: { type: Object, default: () => ({ week: 0, day: 0, total: 0 }) },
	daysUntilDue: { type: Number, default: 0 },
	totalPregDays: { type: Number, default: 0 },
	progressPercent: { type: Number, default: 0 },
	isLoggedIn: { type: Boolean, default: false },
	pregInfoSet: { type: Boolean, default: false }
})

const trimesterName = computed(() => {
	if (!props.pregInfoSet || !props.weekInfo || !props.weekInfo.week) return ''
	return getTrimesterName(getTrimesterFromWeek(props.weekInfo.week))
})

function getTrimesterFromWeek(w) {
	if (w <= 12) return 'early'
	if (w <= 27) return 'mid'
	return 'late'
}

const statusBarHeight = ref(20)

const displayName = computed(() => {
	if (props.userInfo.nickname) {
		return props.userInfo.nickname
	}
	if (props.pregInfoSet) {
		return '宝妈'
	}
	return '新用户'
})

const isCustomAvatar = computed(() => {
	const avatar = props.userInfo.avatar || ''
	return avatar.startsWith('http://') || avatar.startsWith('https://') || avatar.startsWith('cloud://')
})

const displayAvatar = computed(() => {
	return props.userInfo.avatar || '🌸'
})

const healthStore = useHealthStore()

const BABY_WEIGHT_DATA = {
	4: '<1g', 5: '<1g', 6: '<1g', 7: '<1g', 8: '1g', 9: '2g', 10: '4g',
	11: '7g', 12: '14g', 13: '23g', 14: '43g', 15: '70g', 16: '100g',
	17: '140g', 18: '190g', 19: '240g', 20: '300g', 21: '360g', 22: '430g',
	23: '500g', 24: '600g', 25: '660g', 26: '760g', 27: '875g', 28: '1.0kg',
	29: '1.15kg', 30: '1.3kg', 31: '1.5kg', 32: '1.8kg', 33: '2.0kg',
	34: '2.2kg', 35: '2.4kg', 36: '2.6kg', 37: '2.9kg', 38: '3.1kg',
	39: '3.3kg', 40: '3.5kg'
}

const babyWeight = computed(() => {
	if (!props.pregInfoSet || !props.weekInfo || !props.weekInfo.week) return '--'
	const w = props.weekInfo.week
	return BABY_WEIGHT_DATA[w] || '--'
})

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
