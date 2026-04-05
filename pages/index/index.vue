<template>
	<view class="page-container">
		<!-- Greeting Header -->
		<view class="greeting-section">
			<text class="greeting-text">早安，准妈妈</text>
			<text class="greeting-subtitle">在这段生命奇迹的旅程中，被温柔呵护着</text>
		</view>

		<!-- Hero Section: Pregnancy Countdown -->
		<view class="hero-card">
			<view class="hero-header">
				<text class="hero-label">距离宝宝出生还有</text>
			</view>
			<view class="hero-number-wrapper">
				<text class="hero-number">116</text>
				<text class="hero-unit">天</text>
			</view>
			<view class="hero-subtitle">
				<text class="current-week">当前孕周</text>
				<text class="week-number">23周+3天</text>
			</view>
			<!-- Progress Ring Indicator -->
			<view class="progress-indicator">
				<view class="progress-bar">
					<view class="progress-fill" :style="{ width: '58%' }"></view>
				</view>
				<text class="progress-label">已完成 58%</text>
			</view>
		</view>

		<!-- Baby Development Card -->
		<view class="baby-card">
			<view class="card-header">
				<text class="card-title">宝宝发育情况</text>
				<text class="card-week">第23周</text>
			</view>
			<view class="baby-content">
				<view class="baby-image-placeholder">
					<text class="placeholder-icon">🍇</text>
					<text class="placeholder-text">葡萄大小</text>
				</view>
				<view class="baby-info">
					<text class="baby-description">您的宝宝现在大约像一个葡萄那么大，身长约 28cm，体重约 500g</text>
					<view class="baby-stats">
						<view class="stat-item">
							<text class="stat-label">身长</text>
							<text class="stat-value">28cm</text>
						</view>
						<view class="stat-divider"></view>
						<view class="stat-item">
							<text class="stat-label">体重</text>
							<text class="stat-value">500g</text>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- Health Data Summary -->
		<view class="health-card">
			<view class="card-header">
				<text class="card-title">健康数据记录</text>
				<text class="card-action">查看全部</text>
			</view>

			<!-- Weight Card -->
			<view class="health-item">
				<view class="health-header">
					<view class="health-icon-wrapper weight-icon">
						<text class="health-icon">⚖️</text>
					</view>
					<view class="health-info">
						<text class="health-label">体重记录</text>
						<text class="health-date">今天 08:30</text>
					</view>
					<view class="health-value">
						<text class="value-number">58.5</text>
						<text class="value-unit">kg</text>
					</view>
				</view>
				<!-- Simple Progress Bar Visualization -->
				<view class="weight-visualization">
					<view class="weight-bar-container">
						<view class="weight-labels">
							<text class="bar-label">孕前: 52kg</text>
							<text class="bar-label current">当前: 58.5kg</text>
							<text class="bar-label">推荐: 65kg</text>
						</view>
						<view class="weight-bar">
							<view class="weight-fill current-weight" :style="{ left: '35%', width: '12%' }"></view>
							<view class="weight-range normal-range" :style="{ left: '25%', width: '50%' }"></view>
						</view>
						<text class="weight-status normal">增重正常范围</text>
					</view>
				</view>
			</view>

			<!-- Blood Pressure Card -->
			<view class="health-item">
				<view class="health-header">
					<view class="health-icon-wrapper bp-icon">
						<text class="health-icon">❤️</text>
					</view>
					<view class="health-info">
						<text class="health-label">血压记录</text>
						<text class="health-date">今天 08:30</text>
					</view>
					<view class="health-value">
						<text class="value-number">118/76</text>
						<text class="value-unit">mmHg</text>
					</view>
				</view>
				<!-- Simple BP Visualization -->
				<view class="bp-visualization">
					<view class="bp-bars">
						<view class="bp-bar-item">
							<view class="bp-bar-label">
								<text class="bp-label">收缩压</text>
								<text class="bp-value">118</text>
							</view>
							<view class="bp-bar-track">
								<view class="bp-bar-fill systolic" :style="{ width: '74%' }"></view>
							</view>
						</view>
						<view class="bp-bar-item">
							<view class="bp-bar-label">
								<text class="bp-label">舒张压</text>
								<text class="bp-value">76</text>
							</view>
							<view class="bp-bar-track">
								<view class="bp-bar-fill diastolic" :style="{ width: '63%' }"></view>
							</view>
						</view>
					</view>
					<text class="bp-status normal">血压正常</text>
				</view>
			</view>
		</view>

		<!-- Check-up Plan -->
		<view class="checkup-card">
			<view class="card-header">
				<text class="card-title">产检计划</text>
				<text class="card-action">全部计划</text>
			</view>
			<view class="checkup-timeline">
				<view class="timeline-item upcoming">
					<view class="timeline-dot"></view>
					<view class="timeline-content">
						<view class="checkup-header">
							<text class="checkup-title">糖耐量检查 (OGTT)</text>
							<view class="checkup-badge upcoming-badge">待完成</view>
						</view>
						<text class="checkup-date">2024年5月15日 周三 上午 08:00</text>
						<view class="checkup-remind">
							<text class="remind-icon">⏰</text>
							<text class="remind-text">距离检查还有 7 天</text>
						</view>
					</view>
				</view>
				<view class="timeline-item completed">
					<view class="timeline-dot completed-dot"></view>
					<view class="timeline-content">
						<view class="checkup-header">
							<text class="checkup-title">常规产检 & 胎心监护</text>
							<view class="checkup-badge completed-badge">已完成</view>
						</view>
						<text class="checkup-date">2024年4月20日 周六 上午 10:30</text>
						<text class="checkup-result">一切正常，胎儿发育良好</text>
					</view>
				</view>
			</view>
		</view>

		<!-- Bottom Spacer for TabBar -->
		<view class="bottom-spacer"></view>
	</view>
</template>

<script setup>
import { ref } from 'vue'

// Mock data for 23 weeks 3 days pregnant
const daysLeft = ref(116)
const currentWeek = ref(23)
const currentDay = ref(3)
const progressPercent = ref(58)

const babyInfo = ref({
	size: '葡萄',
	length: 28,
	weight: 500,
	description: '您的宝宝现在大约像一个葡萄那么大，身长约 28cm，体重约 500g'
})

const healthData = ref({
	weight: {
		current: 58.5,
		prePregnancy: 52,
		recommended: 65,
		date: '今天 08:30',
		status: 'normal'
	},
	bloodPressure: {
		systolic: 118,
		diastolic: 76,
		date: '今天 08:30',
		status: 'normal'
	}
})

const upcomingCheckup = ref({
	title: '糖耐量检查 (OGTT)',
	date: '2024年5月15日 周三 上午 08:00',
	daysLeft: 7,
	type: 'upcoming'
})

const completedCheckup = ref({
	title: '常规产检 & 胎心监护',
	date: '2024年4月20日 周六 上午 10:30',
	result: '一切正常，胎儿发育良好',
	type: 'completed'
})
</script>

<style scoped lang="scss">
/* Page Container - Light Grey Background */
.page-container {
	min-height: 100vh;
	background-color: #F5F7FA;
	padding: 0 32rpx 32rpx;
}

/* Greeting Section */
.greeting-section {
	padding: 48rpx 0 32rpx;
}

.greeting-text {
	display: block;
	font-size: 48rpx;
	font-weight: 600;
	color: #191C1E;
	line-height: 1.3;
	margin-bottom: 12rpx;
}

.greeting-subtitle {
	display: block;
	font-size: 28rpx;
	color: #757575;
	line-height: 1.5;
}

/* Hero Card - Pregnancy Countdown */
.hero-card {
	background-color: #FFFFFF;
	border-radius: 32rpx;
	padding: 48rpx 40rpx;
	margin-bottom: 24rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.hero-header {
	margin-bottom: 24rpx;
}

.hero-label {
	font-size: 28rpx;
	color: #757575;
	letter-spacing: 2rpx;
}

.hero-number-wrapper {
	display: flex;
	align-items: baseline;
	margin-bottom: 24rpx;
}

.hero-number {
	font-size: 160rpx;
	font-weight: 700;
	color: #C2185B;
	line-height: 1;
	letter-spacing: -4rpx;
}

.hero-unit {
	font-size: 48rpx;
	font-weight: 600;
	color: #C2185B;
	margin-left: 12rpx;
}

.hero-subtitle {
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-bottom: 40rpx;
}

.current-week {
	font-size: 24rpx;
	color: #9E9E9E;
	margin-bottom: 8rpx;
}

.week-number {
	font-size: 32rpx;
	font-weight: 600;
	color: #191C1E;
}

/* Progress Indicator */
.progress-indicator {
	width: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.progress-bar {
	width: 100%;
	height: 12rpx;
	background-color: #F2F4F7;
	border-radius: 12rpx;
	overflow: hidden;
	margin-bottom: 16rpx;
}

.progress-fill {
	height: 100%;
	background: linear-gradient(90deg, #E91E63 0%, #C2185B 100%);
	border-radius: 12rpx;
	transition: width 0.3s ease;
}

.progress-label {
	font-size: 24rpx;
	color: #757575;
}

/* Baby Development Card */
.baby-card {
	background-color: #FFFFFF;
	border-radius: 32rpx;
	padding: 40rpx;
	margin-bottom: 24rpx;
}

.card-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 32rpx;
}

.card-title {
	font-size: 36rpx;
	font-weight: 600;
	color: #191C1E;
}

.card-week {
	font-size: 28rpx;
	color: #C2185B;
	font-weight: 500;
}

.card-action {
	font-size: 28rpx;
	color: #C2185B;
}

.baby-content {
	display: flex;
	flex-direction: column;
	align-items: center;
}

.baby-image-placeholder {
	width: 200rpx;
	height: 200rpx;
	background: linear-gradient(135deg, #FCE7F3 0%, #F8BBD0 100%);
	border-radius: 50%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	margin-bottom: 32rpx;
}

.placeholder-icon {
	font-size: 80rpx;
	margin-bottom: 8rpx;
}

.placeholder-text {
	font-size: 24rpx;
	color: #C2185B;
	font-weight: 500;
}

.baby-info {
	width: 100%;
}

.baby-description {
	display: block;
	font-size: 28rpx;
	color: #616161;
	line-height: 1.6;
	text-align: center;
	margin-bottom: 32rpx;
}

.baby-stats {
	display: flex;
	align-items: center;
	justify-content: space-around;
	background-color: #F5F7FA;
	border-radius: 24rpx;
	padding: 32rpx;
}

.stat-item {
	display: flex;
	flex-direction: column;
	align-items: center;
}

.stat-label {
	font-size: 24rpx;
	color: #9E9E9E;
	margin-bottom: 8rpx;
}

.stat-value {
	font-size: 40rpx;
	font-weight: 600;
	color: #191C1E;
}

.stat-divider {
	width: 2rpx;
	height: 48rpx;
	background-color: #E0E0E0;
}

/* Health Data Card */
.health-card {
	background-color: #FFFFFF;
	border-radius: 32rpx;
	padding: 40rpx;
	margin-bottom: 24rpx;
}

.health-item {
	padding: 32rpx 0;
}

.health-item:not(:last-child) {
	border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.health-header {
	display: flex;
	align-items: center;
	margin-bottom: 24rpx;
}

.health-icon-wrapper {
	width: 80rpx;
	height: 80rpx;
	border-radius: 20rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 24rpx;
}

.weight-icon {
	background-color: #E3F2FD;
}

.bp-icon {
	background-color: #FFEBEE;
}

.health-icon {
	font-size: 36rpx;
}

.health-info {
	flex: 1;
}

.health-label {
	display: block;
	font-size: 32rpx;
	font-weight: 500;
	color: #191C1E;
	margin-bottom: 4rpx;
}

.health-date {
	display: block;
	font-size: 24rpx;
	color: #9E9E9E;
}

.health-value {
	display: flex;
	align-items: baseline;
}

.value-number {
	font-size: 40rpx;
	font-weight: 600;
	color: #191C1E;
}

.value-unit {
	font-size: 24rpx;
	color: #9E9E9E;
	margin-left: 4rpx;
}

/* Weight Visualization */
.weight-visualization {
	width: 100%;
}

.weight-bar-container {
	width: 100%;
}

.weight-labels {
	display: flex;
	justify-content: space-between;
	margin-bottom: 12rpx;
}

.bar-label {
	font-size: 22rpx;
	color: #9E9E9E;
}

.bar-label.current {
	color: #C2185B;
	font-weight: 500;
}

.weight-bar {
	position: relative;
	width: 100%;
	height: 16rpx;
	background-color: #F5F7FA;
	border-radius: 12rpx;
	overflow: hidden;
}

.weight-fill {
	position: absolute;
	top: 0;
	height: 100%;
	background-color: #C2185B;
	border-radius: 12rpx;
}

.weight-range {
	position: absolute;
	top: 0;
	height: 100%;
	background-color: #81C784;
	border-radius: 12rpx;
	opacity: 0.4;
}

.weight-status {
	display: block;
	font-size: 24rpx;
	margin-top: 16rpx;
}

.weight-status.normal {
	color: #4CAF50;
}

/* Blood Pressure Visualization */
.bp-visualization {
	width: 100%;
}

.bp-bars {
	display: flex;
	flex-direction: column;
	gap: 16rpx;
	margin-bottom: 16rpx;
}

.bp-bar-item {
	width: 100%;
}

.bp-bar-label {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 8rpx;
}

.bp-label {
	font-size: 24rpx;
	color: #757575;
}

.bp-value {
	font-size: 28rpx;
	font-weight: 600;
	color: #191C1E;
}

.bp-bar-track {
	width: 100%;
	height: 12rpx;
	background-color: #F5F7FA;
	border-radius: 12rpx;
	overflow: hidden;
}

.bp-bar-fill {
	height: 100%;
	border-radius: 12rpx;
}

.bp-bar-fill.systolic {
	background: linear-gradient(90deg, #42A5F5 0%, #2196F3 100%);
}

.bp-bar-fill.diastolic {
	background: linear-gradient(90deg, #66BB6A 0%, #4CAF50 100%);
}

.bp-status {
	display: block;
	font-size: 24rpx;
}

.bp-status.normal {
	color: #4CAF50;
}

/* Check-up Plan Card */
.checkup-card {
	background-color: #FFFFFF;
	border-radius: 32rpx;
	padding: 40rpx;
	margin-bottom: 24rpx;
}

.checkup-timeline {
	display: flex;
	flex-direction: column;
	gap: 32rpx;
}

.timeline-item {
	position: relative;
	display: flex;
	padding-left: 48rpx;
}

.timeline-item::before {
	content: '';
	position: absolute;
	left: 12rpx;
	top: 40rpx;
	bottom: -40rpx;
	width: 2rpx;
	background-color: #E0E0E0;
}

.timeline-item:last-child::before {
	display: none;
}

.timeline-dot {
	position: absolute;
	left: 0;
	top: 8rpx;
	width: 24rpx;
	height: 24rpx;
	border-radius: 50%;
	background-color: #C2185B;
	border: 4rpx solid #FFFFFF;
	box-shadow: 0 0 0 4rpx #FCE7F3;
}

.completed-dot {
	background-color: #BDBDBD;
	box-shadow: 0 0 0 4rpx #F5F5F5;
}

.timeline-content {
	flex: 1;
}

.checkup-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 12rpx;
}

.checkup-title {
	font-size: 32rpx;
	font-weight: 500;
	color: #191C1E;
}

.checkup-badge {
	padding: 8rpx 16rpx;
	border-radius: 20rpx;
	font-size: 22rpx;
	font-weight: 500;
}

.upcoming-badge {
	background-color: #FFF3E0;
	color: #FF9800;
}

.completed-badge {
	background-color: #E8F5E9;
	color: #4CAF50;
}

.checkup-date {
	display: block;
	font-size: 26rpx;
	color: #757575;
	margin-bottom: 8rpx;
}

.checkup-remind {
	display: flex;
	align-items: center;
	gap: 8rpx;
}

.remind-icon {
	font-size: 24rpx;
}

.remind-text {
	font-size: 24rpx;
	color: #FF9800;
}

.checkup-result {
	display: block;
	font-size: 26rpx;
	color: #757575;
	margin-top: 8rpx;
}

/* Bottom Spacer */
.bottom-spacer {
	height: 120rpx;
}
</style>
