<template>
	<view class="due-ring-wrap">
		<view class="due-ring">
			<!-- conic-gradient 画进度，白色中心挖空形成环 -->
			<view class="ring-progress" :style="progressStyle">
				<view class="ring-center"></view>
			</view>
			<!-- 中间文字 -->
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
	dueDate: { type: Date, default: null }
})

const dueDateText = computed(() => {
	const d = props.dueDate
	if (!d) return '未设置'
	return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
})

const progressStyle = computed(() => {
	const angle = Math.round((props.progressPercent / 100) * 360)
	return {
		background: 'conic-gradient(#D4627A ' + angle + 'deg, #EDE3D6 ' + angle + 'deg)'
	}
})
</script>

<style scoped lang="scss">
$rose: #D4627A;

.due-ring-wrap {
	display: flex;
	align-items: center;
	gap: 28rpx;
	padding: 28rpx 32rpx;
}

.due-ring {
	position: relative;
	width: 140rpx;
	height: 140rpx;
	flex-shrink: 0;
}

/* conic-gradient 整圆：粉色=已完成，灰色=未完成 */
.ring-progress {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	border-radius: 50%;
}

/* 白色中心圆，四周留出 10rpx 形成环形 */
.ring-center {
	position: absolute;
	top: 10rpx;
	left: 10rpx;
	right: 10rpx;
	bottom: 10rpx;
	border-radius: 50%;
	background: #FFFFFF;
}

/* 文字 */
.ring-inner {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
}

.ring-num {
	font-size: 36rpx;
	font-weight: 700;
	color: $rose;
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
