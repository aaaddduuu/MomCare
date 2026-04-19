<template>
	<view class="day-panel">
		<view class="dp-header">
			<view class="dp-left">
				<view class="dp-date-row">
					<text class="dp-date">{{ dateLabel }}</text>
					<view v-if="isToday" class="today-badge">
						<text class="today-badge-text">今天</text>
					</view>
				</view>
				<text class="dp-week">{{ weekLabel }}</text>
			</view>
			<view class="dp-chip" :class="'dp-chip-' + trimesterKey">
				<text class="dp-chip-text">{{ trimesterName }}</text>
			</view>
		</view>
		<!-- 水平一行：体重、血压、心情、胎动 -->
		<view class="rec-row">
			<!-- 体重 -->
			<view class="rec-item rec-item-compact" :class="{ 'rec-item-filled': !!record.weight }" @tap="$emit('edit', 'weight')">
				<view class="ri-top">
					<text class="ri-icon">⚖️</text>
					<text class="ri-edit-hint">编辑</text>
				</view>
				<text class="ri-label">体重</text>
				<view v-if="record.weight" class="ri-value-row">
					<text class="ri-value">{{ record.weight }}</text>
					<text class="ri-unit">kg</text>
				</view>
				<text v-else class="ri-empty">未记录</text>
			</view>
			<!-- 血压 -->
			<view class="rec-item rec-item-compact" :class="{ 'rec-item-filled': !!record.bp }" @tap="$emit('edit', 'bp')">
				<view class="ri-top">
					<text class="ri-icon">💗</text>
					<text class="ri-edit-hint">编辑</text>
				</view>
				<text class="ri-label">血压</text>
				<view v-if="record.bp" class="ri-value-row">
					<text class="ri-value-sm">{{ record.bp }}</text>
				</view>
				<text v-else class="ri-empty">未记录</text>
			</view>
			<!-- 心情 -->
			<view class="rec-item rec-item-compact" :class="{ 'rec-item-filled': !!record.mood }" @tap="$emit('edit', 'daily')">
				<view class="ri-top">
					<text class="ri-icon">😊</text>
					<text class="ri-edit-hint">编辑</text>
				</view>
				<text class="ri-label">心情</text>
				<text v-if="record.mood" class="ri-mood">{{ record.mood }}</text>
				<text v-else class="ri-empty">未记录</text>
			</view>
			<!-- 胎动 -->
			<view class="rec-item rec-item-compact" :class="{ 'rec-item-filled': !!record.fetal }" @tap="$emit('edit', 'fetal')">
				<view class="ri-top">
					<text class="ri-icon">👣</text>
					<text class="ri-edit-hint">编辑</text>
				</view>
				<text class="ri-label">胎动</text>
				<view v-if="record.fetal" class="ri-value-row">
					<text class="ri-value">{{ record.fetal }}</text>
					<text class="ri-unit">次</text>
				</view>
				<text v-else class="ri-empty">未记录</text>
			</view>
		</view>
		<!-- 备注/计划 独占一行 -->
		<view class="rec-note-row">
			<view class="rec-item rec-item-full" :class="{ 'rec-item-filled': !!record.note }" @tap="$emit('edit', 'note')">
				<view class="ri-top">
					<text class="ri-icon">📝</text>
					<text class="ri-edit-hint">编辑备注</text>
				</view>
				<text class="ri-label">备注 / 计划</text>
				<text v-if="record.note" class="ri-note">{{ record.note }}</text>
				<text v-else class="ri-empty">点击添加今日备注或计划…</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { computed } from 'vue'
import { getTrimester, getTrimesterName, calcWeekInfo } from '@/stores/health.js'

const props = defineProps({
	selectedDate: { type: [Date, Object], required: true },
	record: { type: Object, default: () => ({}) },
	lmpDate: { type: Date, required: true }
})

defineEmits(['edit'])

const isToday = computed(() => {
	const d = props.selectedDate
	const now = new Date()
	return d.getFullYear() === now.getFullYear() &&
		d.getMonth() === now.getMonth() &&
		d.getDate() === now.getDate()
})

const dateLabel = computed(() => {
	const d = props.selectedDate
	return `${d.getMonth() + 1}月${d.getDate()}日`
})

const weekInfo = computed(() => calcWeekInfo(props.lmpDate, props.selectedDate))

const trimesterKey = computed(() => {
	if (!weekInfo.value) return 'early'
	return getTrimester(weekInfo.value.week)
})

const trimesterName = computed(() => getTrimesterName(trimesterKey.value))

const weekLabel = computed(() => {
	if (!weekInfo.value) return ''
	return `孕 ${weekInfo.value.week} 周 ${weekInfo.value.day} 天 · ${trimesterName.value}`
})
</script>

<style scoped lang="scss">
.day-panel {
	background: #FFFFFF;
	border-radius: 32rpx;
	box-shadow: 0 4rpx 28rpx rgba(60, 30, 10, 0.07);
	overflow: hidden;
	margin: 20rpx 24rpx 0;
}

.dp-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 20rpx 24rpx;
	border-bottom: 1rpx solid #E8DDD0;
}

.dp-left {
	flex: 1;
}

.dp-date-row {
	display: flex;
	align-items: center;
	gap: 12rpx;
}

.dp-date {
	font-size: 28rpx;
	font-weight: 600;
	color: #1C1A17;
}

.today-badge {
	font-size: 20rpx;
	font-weight: 600;
	padding: 4rpx 16rpx;
	border-radius: 999rpx;
	background: #FAEAEE;
}

.today-badge-text {
	font-size: 20rpx;
	font-weight: 600;
	color: #D4627A;
}

.dp-week {
	font-size: 20rpx;
	color: #9C9890;
	margin-top: 4rpx;
}

.dp-chip {
	font-size: 20rpx;
	font-weight: 600;
	padding: 4rpx 16rpx;
	border-radius: 999rpx;
}

.dp-chip-early {
	background: #FDD8E3;
	color: #C04868;
}

.dp-chip-mid {
	background: #FDE8C0;
	color: #B07020;
}

.dp-chip-late {
	background: #DDD0F5;
	color: #6A4AAA;
}

.dp-chip-text {
	font-size: 20rpx;
}

.rec-row {
	display: flex;
	gap: 12rpx;
	padding: 16rpx 20rpx 0;
}

.rec-note-row {
	padding: 12rpx 20rpx 16rpx;
}

.rec-item-compact {
	flex: 1;
	min-width: 0;
}

.rec-item {
	background: #FBF7F2;
	border-radius: 20rpx;
	border: 3rpx solid #E8DDD0;
	padding: 18rpx 22rpx;
	transition: all 0.15s;
	box-sizing: border-box;
}

.rec-item-filled {
	border-color: #E8A0B0;
}

.rec-item-full {
	width: 100%;
}

.ri-top {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 6rpx;
}

.ri-icon {
	font-size: 32rpx;
}

.ri-edit-hint {
	font-size: 20rpx;
	color: #D4627A;
	opacity: 0;
	transition: opacity 0.15s;
}

.rec-item:active .ri-edit-hint {
	opacity: 1;
}

.ri-label {
	font-size: 18rpx;
	font-weight: 700;
	color: #9C9890;
	letter-spacing: 2rpx;
	text-transform: uppercase;
	margin-bottom: 4rpx;
	display: block;
}

.ri-value-row {
	display: flex;
	align-items: baseline;
}

.ri-value {
	font-size: 30rpx;
	font-weight: 700;
	color: #1C1A17;
}

.ri-value-sm {
	font-size: 26rpx;
	font-weight: 700;
	color: #1C1A17;
}

.ri-unit {
	font-size: 20rpx;
	color: #9C9890;
	margin-left: 4rpx;
}

.ri-mood {
	font-size: 40rpx;
}

.ri-empty {
	font-size: 24rpx;
	color: #C8C4BC;
}

.ri-note {
	font-size: 24rpx;
	color: #4A4844;
	line-height: 1.6;
}
</style>
