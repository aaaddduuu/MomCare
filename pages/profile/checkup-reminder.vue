<template>
	<view class="page">
		<!-- Hero -->
		<view class="hero-rose">
			<view class="status-bar-spacer" :style="{ height: statusBarHeight + 'px' }"></view>
			<NavBar title="产检提醒" :showBack="true" />
			<view class="hero-content">
				<text class="hero-label">下次产检日期</text>
				<text class="hero-date">4月20日</text>
				<text class="hero-sub">周日 · 上午 09:30 · 北京协和医院 · 产科门诊</text>
				<view class="countdown-pill">
					<text class="countdown-num">7</text>
					<text class="countdown-lbl">天后</text>
				</view>
			</view>
		</view>

		<scroll-view scroll-y class="scroll-content">
			<!-- 产检信息卡片 -->
			<view class="info-card">
				<text class="info-title">本次产检信息</text>
				<view class="info-row">
					<text class="info-icon">📅</text>
					<text class="info-text">2025年4月20日（周日）上午 09:30</text>
				</view>
				<view class="info-row">
					<text class="info-icon">🏥</text>
					<text class="info-text">北京协和医院 · 产科门诊 6楼 B区</text>
				</view>
				<view class="info-row">
					<text class="info-icon">👩‍⚕️</text>
					<text class="info-text">当时孕周：孕 33 周 3 天</text>
				</view>
			</view>

			<!-- 检查项目清单 -->
			<text class="section-title">本次需要做的检查</text>
			<view class="exam-list">
				<view
					v-for="(item, idx) in examItems"
					:key="idx"
					class="exam-item"
					:class="{ 'exam-checked': item.done }"
					@tap="item.done = !item.done"
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

			<!-- 提醒设置 -->
			<text class="section-title">提醒设置</text>
			<view class="notif-card">
				<view v-for="(n, idx) in notifItems" :key="idx" class="notif-row">
					<view class="notif-text">
						<text class="notif-title">{{ n.title }}</text>
						<text class="notif-sub">{{ n.subtitle }}</text>
					</view>
					<view class="toggle" :class="{ 'toggle-on': n.on }" @tap="n.on = !n.on">
						<view class="toggle-thumb" :class="{ 'thumb-on': n.on }"></view>
					</view>
				</view>
			</view>

			<view class="bottom-spacer"></view>
		</scroll-view>
	</view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import NavBar from '@/components/NavBar.vue'

const statusBarHeight = ref(20)

onMounted(() => {
	const app = getApp()
	if (app && app.globalData) {
		statusBarHeight.value = app.globalData.statusBarHeight || 20
	}
})

const examItems = reactive([
	{ text: '常规产检（宫高、腹围、胎心）', required: true, done: true },
	{ text: '血常规检查', required: true, done: true },
	{ text: '胎心监护（NST）', required: true, done: false },
	{ text: 'B超（评估胎位和羊水）', required: false, done: false },
	{ text: '尿常规', required: true, done: false }
])

const notifItems = reactive([
	{ title: '提前1天提醒', subtitle: '4月19日 09:30 推送通知', on: true },
	{ title: '提前3天提醒', subtitle: '4月17日 09:30 推送通知', on: true },
	{ title: '当天早晨提醒', subtitle: '4月20日 08:00 推送通知', on: false }
])
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

.status-bar-spacer { width: 100%; }

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

.notif-card {
	background: #FFFFFF;
	border-radius: 32rpx;
	box-shadow: 0 4rpx 28rpx rgba(60, 30, 10, 0.07);
	overflow: hidden;
	margin: 0 28rpx;
}

.notif-row {
	display: flex;
	align-items: center;
	padding: 24rpx 28rpx;
	border-bottom: 1rpx solid #E8DDD0;
}

.notif-row:last-child { border-bottom: none; }

.notif-text { flex: 1; }

.notif-title {
	display: block;
	font-size: 28rpx;
	font-weight: 500;
	color: #1C1A17;
}

.notif-sub {
	display: block;
	font-size: 22rpx;
	color: #9C9890;
	margin-top: 2rpx;
}

.toggle {
	width: 76rpx;
	height: 42rpx;
	border-radius: 21rpx;
	background: #E4E1DC;
	position: relative;
	transition: background 0.2s;
}

.toggle-on { background: #D4627A; }

.toggle-thumb {
	position: absolute;
	top: 5rpx;
	left: 5rpx;
	width: 32rpx;
	height: 32rpx;
	border-radius: 50%;
	background: #FFFFFF;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.15);
	transition: transform 0.2s;
}

.thumb-on { transform: translateX(34rpx); }

.bottom-spacer { height: 40rpx; }
</style>
