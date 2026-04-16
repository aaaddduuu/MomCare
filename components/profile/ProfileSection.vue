<template>
	<view class="pcs">
		<text v-if="title" class="pcs-title">{{ title }}</text>
		<view class="pc-card">
			<view
				v-for="(item, idx) in items"
				:key="idx"
				class="pc-row"
				:class="{ 'pc-row-last': idx === items.length - 1 }"
				@tap="handleTap(item)"
			>
				<view class="pc-row-icon" :style="{ background: item.iconBg || '#F2F0EE' }">
					<text class="pc-row-icon-text">{{ item.icon }}</text>
				</view>
				<view class="pc-row-body">
					<text class="pc-row-title">{{ item.title }}</text>
					<text v-if="item.subtitle" class="pc-row-sub">{{ item.subtitle }}</text>
				</view>
				<view class="pc-row-right">
					<view v-if="item.badge" class="pc-row-badge">
						<text class="badge-text">{{ item.badge }}</text>
					</view>
					<!-- 开关 -->
					<view v-if="item.toggle !== undefined" class="toggle" :class="{ 'toggle-on': item.toggle }" @tap.stop="$emit('toggle', idx)">
						<view class="toggle-thumb" :class="{ 'thumb-on': item.toggle }"></view>
					</view>
					<!-- 箭头 -->
					<text v-else class="pc-row-arrow">›</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
defineProps({
	title: { type: String, default: '' },
	items: { type: Array, required: true }
})

const emit = defineEmits(['tap', 'toggle'])

function handleTap(item) {
	if (item.toggle === undefined) {
		emit('tap', item)
	}
}
</script>

<style scoped lang="scss">
.pcs {
	margin: 20rpx 24rpx 0;
}

.pcs-title {
	display: block;
	font-size: 22rpx;
	font-weight: 700;
	color: #9C9890;
	text-transform: uppercase;
	letter-spacing: 3rpx;
	margin-bottom: 14rpx;
}

.pc-card {
	background: #FFFFFF;
	border-radius: 32rpx;
	box-shadow: 0 4rpx 28rpx rgba(60, 30, 10, 0.07);
	overflow: hidden;
}

.pc-row {
	display: flex;
	align-items: center;
	padding: 24rpx 28rpx;
	border-bottom: 1rpx solid #E8DDD0;
}

.pc-row-last {
	border-bottom: none;
}

.pc-row-icon {
	width: 68rpx;
	height: 68rpx;
	border-radius: 20rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
	margin-right: 24rpx;
}

.pc-row-icon-text {
	font-size: 34rpx;
}

.pc-row-body {
	flex: 1;
}

.pc-row-title {
	display: block;
	font-size: 28rpx;
	font-weight: 500;
	color: #1C1A17;
}

.pc-row-sub {
	display: block;
	font-size: 22rpx;
	color: #9C9890;
	margin-top: 2rpx;
}

.pc-row-right {
	display: flex;
	align-items: center;
	gap: 12rpx;
}

.pc-row-badge {
	background: #FAEAEE;
	padding: 4rpx 14rpx;
	border-radius: 999rpx;
}

.badge-text {
	font-size: 20rpx;
	font-weight: 600;
	color: #B04560;
}

.pc-row-arrow {
	font-size: 28rpx;
	color: #C8C4BC;
}

/* Toggle Switch */
.toggle {
	width: 72rpx;
	height: 40rpx;
	border-radius: 20rpx;
	background: #E4E1DC;
	position: relative;
	transition: background 0.2s;
}

.toggle-on {
	background: #D4627A;
}

.toggle-thumb {
	position: absolute;
	top: 4rpx;
	left: 4rpx;
	width: 32rpx;
	height: 32rpx;
	border-radius: 50%;
	background: #FFFFFF;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.15);
	transition: transform 0.2s;
}

.thumb-on {
	transform: translateX(32rpx);
}
</style>
