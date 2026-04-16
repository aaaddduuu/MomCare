<template>
	<view class="due-ring-wrap">
		<view class="due-ring">
			<!-- 使用 CSS 模拟圆环进度 -->
			<view class="ring-bg">
				<view class="ring-progress" :style="{ '--progress': progressAngle + 'deg' }"></view>
			</view>
			<view class="ring-inner">
				<text class="ring-num">{{ daysUntilDue }}</text>
				<text class="ring-unit">天</text>
			</view>
		</view>
		<view class="ring-text">
			<text class="ring-title">距预产期还有 {{ daysUntilDue }} 天</text>
			<text class="ring-sub">预计 {{ dueDateText }}\n已完成孕期旅程的 {{ progressPercent }}%</text>
		</view>
	</view>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
	daysUntilDue: { type: Number, required: true },
	progressPercent: { type: Number, required: true },
	dueDate: { type: Date, required: true }
})

const dueDateText = computed(() => {
	const d = props.dueDate
	return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
})

const progressAngle = computed(() => {
	return Math.round((props.progressPercent / 100) * 360)
})
</script>

<style scoped lang="scss">
.due-ring-wrap {
	display: flex;
	align-items: center;
	gap: 28rpx;
	padding: 28rpx 32rpx;
}

.due-ring {
	position: relative;
	width: 128rpx;
	height: 128rpx;
	flex-shrink: 0;
}

.ring-bg {
	width: 100%;
	height: 100%;
	border-radius: 50%;
	background: conic-gradient(
		#D4627A 0deg,
		#D4627A var(--progress),
		#F2F0EE var(--progress),
		#F2F0EE 360deg
	);
	padding: 10rpx;
	box-sizing: border-box;
}

.ring-progress {
	width: 100%;
	height: 100%;
	border-radius: 50%;
	background: #FFFFFF;
}

.ring-inner {
	position: absolute;
	inset: 0;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
}

.ring-num {
	font-size: 36rpx;
	font-weight: 700;
	color: #D4627A;
	line-height: 1;
}

.ring-unit {
	font-size: 16rpx;
	color: #9C9890;
}

.ring-text {
	flex: 1;
}

.ring-title {
	display: block;
	font-size: 28rpx;
	font-weight: 600;
	color: #1C1A17;
	margin-bottom: 6rpx;
}

.ring-sub {
	display: block;
	font-size: 24rpx;
	color: #9C9890;
	line-height: 1.5;
}
</style>
