<template>
	<view class="page-container">
		<!-- User Profile Header -->
		<view class="profile-header">
			<view class="avatar-wrapper">
				<image class="avatar" src="/static/logo.png" mode="aspectFill"></image>
				<view class="avatar-badge">
					<text class="badge-icon">👶</text>
				</view>
			</view>
			<view class="user-info">
				<text class="user-nickname">准妈妈小美</text>
				<view class="pregnancy-status">
					<text class="status-icon">🤰</text>
					<text class="status-text">孕 23 周 + 3 天</text>
				</view>
				<text class="due-date">预产期：2024年8月20日</text>
			</view>
			<view class="edit-btn" @tap="editProfile">
				<text class="edit-icon">✏️</text>
			</view>
		</view>

		<!-- VIP Membership Card -->
		<view class="vip-card" :class="{ 'vip-active': isVip }" @tap="showVipDetail">
			<view class="vip-bg"></view>
			<view class="vip-content">
				<view class="vip-header">
					<view class="vip-title-wrapper">
						<text class="vip-crown">👑</text>
						<text class="vip-title">{{ isVip ? 'MomCare VIP 会员' : '升级 MomCare VIP' }}</text>
					</view>
					<view class="vip-badge" :class="{ 'active': isVip }">
						<text class="vip-badge-text">{{ isVip ? '已开通' : '未开通' }}</text>
					</view>
				</view>
				<view class="vip-features">
					<view class="feature-item">
						<text class="feature-icon">∞</text>
						<text class="feature-text">无限次 AI 解读</text>
					</view>
					<view class="feature-item">
						<text class="feature-icon">☁️</text>
						<text class="feature-text">无限存储容量</text>
					</view>
					<view class="feature-item">
						<text class="feature-icon">⭐</text>
						<text class="feature-text">专属客服支持</text>
					</view>
				</view>
				<view class="vip-action">
					<view class="vip-btn" :class="{ 'vip-btn-active': isVip }">
						<text class="vip-btn-text">{{ isVip ? '续费会员' : '解锁无限次 AI 解读' }}</text>
						<text class="vip-btn-arrow">{{ isVip ? '→' : '🎁' }}</text>
					</view>
				</view>
			</view>
		</view>

		<!-- AI Usage Status (for non-VIP users) -->
		<view v-if="!isVip" class="usage-card">
			<view class="usage-header">
				<text class="usage-title">本月 AI 解读次数</text>
				<text class="usage-count">{{ aiUsed }}/3 次</text>
			</view>
			<view class="usage-bar">
				<view class="usage-fill" :style="{ width: usagePercent + '%' }"></view>
			</view>
			<text class="usage-tip">升级 VIP 解锁无限次解读</text>
		</view>

		<!-- Quick Stats -->
		<view class="stats-row">
			<view class="stat-item" @tap="navigateTo('articles')">
				<text class="stat-number">12</text>
				<text class="stat-label">收藏文章</text>
			</view>
			<view class="stat-divider"></view>
			<view class="stat-item" @tap="navigateTo('reports')">
				<text class="stat-number">5</text>
				<text class="stat-label">产检报告</text>
			</view>
			<view class="stat-divider"></view>
			<view class="stat-item" @tap="navigateTo('records')">
				<text class="stat-number">48</text>
				<text class="stat-label">健康记录</text>
			</view>
		</view>

		<!-- Settings Menu -->
		<view class="settings-section">
			<text class="section-title">我的服务</text>
			<view class="menu-list">
				<view class="menu-item" @tap="navigateTo('saved')">
					<view class="menu-icon-wrapper">
						<text class="menu-icon">📚</text>
					</view>
					<text class="menu-label">我的收藏</text>
					<view class="menu-badge">
						<text class="badge-count">12</text>
					</view>
					<text class="menu-arrow">›</text>
				</view>
				<view class="menu-item" @tap="navigateTo('archives')">
					<view class="menu-icon-wrapper">
						<text class="menu-icon">📋</text>
					</view>
					<text class="menu-label">产检档案</text>
					<text class="menu-arrow">›</text>
				</view>
				<view class="menu-item" @tap="navigateTo('health')">
					<view class="menu-icon-wrapper">
						<text class="menu-icon">💊</text>
					</view>
					<text class="menu-label">健康数据</text>
					<text class="menu-arrow">›</text>
				</view>
			</view>
		</view>

		<view class="settings-section">
			<text class="section-title">系统设置</text>
			<view class="menu-list">
				<view class="menu-item" @tap="navigateTo('reminder')">
					<view class="menu-icon-wrapper">
						<text class="menu-icon">🔔</text>
					</view>
					<text class="menu-label">提醒设置</text>
					<view class="menu-switch">
						<view class="switch-track" :class="{ 'switch-on': reminderOn }">
							<view class="switch-thumb" :class="{ 'thumb-on': reminderOn }"></view>
						</view>
					</view>
				</view>
				<view class="menu-item" @tap="navigateTo('privacy')">
					<view class="menu-icon-wrapper">
						<text class="menu-icon">🔒</text>
					</view>
					<text class="menu-label">隐私设置</text>
					<text class="menu-arrow">›</text>
				</view>
				<view class="menu-item" @tap="navigateTo('about')">
					<view class="menu-icon-wrapper">
						<text class="menu-icon">ℹ️</text>
					</view>
					<text class="menu-label">关于我们</text>
					<text class="menu-arrow">›</text>
				</view>
				<view class="menu-item" @tap="navigateTo('feedback')">
					<view class="menu-icon-wrapper">
						<text class="menu-icon">💬</text>
					</view>
					<text class="menu-label">意见反馈</text>
					<text class="menu-arrow">›</text>
				</view>
			</view>
		</view>

		<!-- Logout Button -->
		<view class="logout-btn" @tap="handleLogout">
			<text class="logout-text">退出登录</text>
		</view>

		<!-- Version Info -->
		<view class="version-info">
			<text class="version-text">MomCare v1.0.0</text>
		</view>

		<!-- Bottom Spacer for TabBar -->
		<view class="bottom-spacer"></view>
	</view>
</template>

<script setup>
import { ref, computed } from 'vue'

// User state
const isVip = ref(false)
const aiUsed = ref(2)
const aiTotal = ref(3)
const reminderOn = ref(true)

// Usage percentage
const usagePercent = computed(() => {
	return (aiUsed.value / aiTotal.value) * 100
})

// Edit profile
const editProfile = () => {
	uni.navigateTo({
		url: '/pages/profile/edit'
	})
}

// Show VIP detail
const showVipDetail = () => {
	uni.navigateTo({
		url: '/pages/profile/vip'
	})
}

// Navigate to pages
const navigateTo = (page) => {
	console.log('Navigate to:', page)
	const routes = {
		articles: '/pages/profile/saved-articles',
		reports: '/pages/reports/index',
		records: '/pages/profile/health-records',
		saved: '/pages/profile/saved',
		archives: '/pages/profile/archives',
		health: '/pages/profile/health-data',
		reminder: '/pages/profile/reminder',
		privacy: '/pages/profile/privacy',
		about: '/pages/profile/about',
		feedback: '/pages/profile/feedback'
	}

	if (routes[page]) {
		uni.navigateTo({ url: routes[page] })
	}
}

// Toggle reminder
const toggleReminder = () => {
	reminderOn.value = !reminderOn.value
}

// Logout
const handleLogout = () => {
	uni.showModal({
		title: '退出登录',
		content: '确定要退出登录吗？',
		success: (res) => {
			if (res.confirm) {
				console.log('User logged out')
				uni.reLaunch({
					url: '/pages/login/index'
				})
			}
		}
	})
}
</script>

<style scoped lang="scss">
/* Page Container */
.page-container {
	min-height: 100vh;
	background-color: #F5F7FA;
	padding: 0 32rpx 32rpx;
}

/* Profile Header */
.profile-header {
	display: flex;
	align-items: center;
	padding: 48rpx 0 32rpx;
}

.avatar-wrapper {
	position: relative;
	margin-right: 24rpx;
}

.avatar {
	width: 120rpx;
	height: 120rpx;
	border-radius: 60rpx;
	background-color: #F2F4F7;
}

.avatar-badge {
	position: absolute;
	bottom: -4rpx;
	right: -4rpx;
	width: 40rpx;
	height: 40rpx;
	background: linear-gradient(135deg, #C2185B 0%, #E91E63 100%);
	border-radius: 20rpx;
	border: 4rpx solid #FFFFFF;
	display: flex;
	align-items: center;
	justify-content: center;
}

.badge-icon {
	font-size: 20rpx;
}

.user-info {
	flex: 1;
}

.user-nickname {
	display: block;
	font-size: 40rpx;
	font-weight: 600;
	color: #191C1E;
	margin-bottom: 12rpx;
}

.pregnancy-status {
	display: flex;
	align-items: center;
	gap: 8rpx;
	margin-bottom: 8rpx;
}

.status-icon {
	font-size: 28rpx;
}

.status-text {
	font-size: 28rpx;
	color: #C2185B;
	font-weight: 500;
}

.due-date {
	display: block;
	font-size: 24rpx;
	color: #9E9E9E;
}

.edit-btn {
	width: 64rpx;
	height: 64rpx;
	background-color: #FFFFFF;
	border-radius: 32rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.edit-icon {
	font-size: 28rpx;
}

/* VIP Card */
.vip-card {
	position: relative;
	background: linear-gradient(135deg, #2C2C2C 0%, #1A1A1A 100%);
	border-radius: 32rpx;
	padding: 40rpx;
	margin-bottom: 24rpx;
	overflow: hidden;
	box-shadow: 0 12rpx 40rpx rgba(0, 0, 0, 0.15);
}

.vip-card.vip-active {
	background: linear-gradient(135deg, #C2185B 0%, #880E4F 100%);
}

.vip-bg {
	position: absolute;
	top: -50%;
	right: -20%;
	width: 300rpx;
	height: 300rpx;
	background: radial-gradient(circle, rgba(255, 215, 0, 0.1) 0%, transparent 70%);
	border-radius: 50%;
}

.vip-content {
	position: relative;
	z-index: 1;
}

.vip-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 32rpx;
}

.vip-title-wrapper {
	display: flex;
	align-items: center;
	gap: 12rpx;
}

.vip-crown {
	font-size: 36rpx;
}

.vip-title {
	font-size: 36rpx;
	font-weight: 600;
	color: #FFFFFF;
}

.vip-badge {
	background-color: rgba(255, 255, 255, 0.15);
	padding: 8rpx 20rpx;
	border-radius: 20rpx;
}

.vip-badge.active {
	background-color: rgba(255, 215, 0, 0.3);
}

.vip-badge-text {
	font-size: 24rpx;
	color: #FFFFFF;
	font-weight: 500;
}

.vip-features {
	display: flex;
	justify-content: space-between;
	margin-bottom: 32rpx;
	padding: 0 8rpx;
}

.feature-item {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 8rpx;
}

.feature-icon {
	font-size: 32rpx;
}

.feature-text {
	font-size: 22rpx;
	color: rgba(255, 255, 255, 0.8);
	text-align: center;
}

.vip-action {
	display: flex;
	justify-content: center;
}

.vip-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 12rpx;
	background: linear-gradient(135deg, #FFD700 0%, #FFA726 100%);
	padding: 20rpx 48rpx;
	border-radius: 48rpx;
	box-shadow: 0 8rpx 24rpx rgba(255, 215, 0, 0.3);
}

.vip-btn-active {
	background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%);
	border: 2rpx solid rgba(255, 255, 255, 0.3);
	box-shadow: none;
}

.vip-btn-text {
	font-size: 28rpx;
	font-weight: 600;
	color: #2C2C2C;
}

.vip-btn-active .vip-btn-text {
	color: #FFFFFF;
}

.vip-btn-arrow {
	font-size: 24rpx;
	color: #2C2C2C;
}

.vip-btn-active .vip-btn-arrow {
	color: #FFFFFF;
}

/* Usage Card */
.usage-card {
	background-color: #FFFFFF;
	border-radius: 24rpx;
	padding: 32rpx;
	margin-bottom: 24rpx;
}

.usage-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 16rpx;
}

.usage-title {
	font-size: 28rpx;
	color: #757575;
}

.usage-count {
	font-size: 28rpx;
	font-weight: 600;
	color: #C2185B;
}

.usage-bar {
	width: 100%;
	height: 12rpx;
	background-color: #F5F7FA;
	border-radius: 12rpx;
	overflow: hidden;
	margin-bottom: 12rpx;
}

.usage-fill {
	height: 100%;
	background: linear-gradient(90deg, #C2185B 0%, #E91E63 100%);
	border-radius: 12rpx;
	transition: width 0.3s ease;
}

.usage-tip {
	display: block;
	font-size: 24rpx;
	color: #9E9E9E;
	text-align: center;
}

/* Quick Stats */
.stats-row {
	display: flex;
	background-color: #FFFFFF;
	border-radius: 24rpx;
	padding: 32rpx 0;
	margin-bottom: 24rpx;
}

.stat-item {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 8rpx;
}

.stat-number {
	font-size: 40rpx;
	font-weight: 600;
	color: #C2185B;
}

.stat-label {
	font-size: 24rpx;
	color: #9E9E9E;
}

.stat-divider {
	width: 2rpx;
	background-color: rgba(0, 0, 0, 0.05);
}

/* Settings Section */
.settings-section {
	margin-bottom: 24rpx;
}

.section-title {
	display: block;
	font-size: 28rpx;
	color: #9E9E9E;
	margin-bottom: 16rpx;
	padding-left: 8rpx;
}

.menu-list {
	background-color: #FFFFFF;
	border-radius: 24rpx;
	overflow: hidden;
}

.menu-item {
	display: flex;
	align-items: center;
	padding: 28rpx 32rpx;
	position: relative;
}

.menu-item:not(:last-child)::after {
	content: '';
	position: absolute;
	bottom: 0;
	left: 104rpx;
	right: 32rpx;
	height: 1px;
	background-color: rgba(0, 0, 0, 0.05);
}

.menu-icon-wrapper {
	width: 56rpx;
	height: 56rpx;
	background-color: #F5F7FA;
	border-radius: 16rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 20rpx;
}

.menu-icon {
	font-size: 32rpx;
}

.menu-label {
	flex: 1;
	font-size: 30rpx;
	color: #191C1E;
}

.menu-badge {
	background-color: #FCE7F3;
	padding: 4rpx 12rpx;
	border-radius: 12rpx;
	margin-right: 12rpx;
}

.badge-count {
	font-size: 22rpx;
	color: #C2185B;
	font-weight: 500;
}

.menu-arrow {
	font-size: 40rpx;
	color: #D0D0D0;
	font-weight: 300;
}

/* Switch Toggle */
.menu-switch {
	margin-left: auto;
}

.switch-track {
	width: 88rpx;
	height: 48rpx;
	background-color: #E0E0E0;
	border-radius: 24rpx;
	position: relative;
	transition: background-color 0.3s ease;
}

.switch-track.switch-on {
	background-color: #C2185B;
}

.switch-thumb {
	position: absolute;
	top: 4rpx;
	left: 4rpx;
	width: 40rpx;
	height: 40rpx;
	background-color: #FFFFFF;
	border-radius: 20rpx;
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.15);
	transition: transform 0.3s ease;
}

.switch-thumb.thumb-on {
	transform: translateX(40rpx);
}

/* Logout Button */
.logout-btn {
	background-color: #FFFFFF;
	border-radius: 24rpx;
	padding: 28rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-bottom: 24rpx;
}

.logout-text {
	font-size: 30rpx;
	color: #EF5350;
}

/* Version Info */
.version-info {
	text-align: center;
	padding: 16rpx 0;
}

.version-text {
	font-size: 24rpx;
	color: #D0D0D0;
}

/* Bottom Spacer */
.bottom-spacer {
	height: 120rpx;
}
</style>
