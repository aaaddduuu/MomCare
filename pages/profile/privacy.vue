<template>
	<view class="page">
		<!-- Hero -->
		<view class="hero-gray">
			<view class="status-bar-spacer" :style="{ height: statusBarHeight + 'px' }"></view>
			<view class="nav-bar">
				<view class="nav-back" @tap="goBack">
					<text class="nav-back-icon">‹</text>
				</view>
				<text class="nav-title">隐私与数据</text>
			</view>
			<view class="hero-content">
				<text class="hero-label">数据存储</text>
				<text class="hero-val">128<text class="hero-unit">MB</text></text>
				<text class="hero-sub">已使用 · 包含 11 份产检报告图片</text>
			</view>
		</view>

		<scroll-view scroll-y class="scroll-content">
			<!-- 隐私说明横幅 -->
			<view class="privacy-banner">
				<text class="pb-icon">🔒</text>
				<text class="pb-text">您的所有健康数据均经过 AES-256 加密存储，仅在您的设备和加密云端备份中保存，不会被用于任何广告目的，也不会出售给第三方。</text>
			</view>

			<!-- 数据概览 -->
			<view class="sec">
				<text class="sec-lbl">我的数据概览</text>
				<view class="data-list">
					<view v-for="(d, idx) in dataItems" :key="idx" class="data-item">
						<view class="di-icon" :style="{ background: d.iconBg }">
							<text class="di-icon-text">{{ d.icon }}</text>
						</view>
						<view class="di-body">
							<text class="di-title">{{ d.title }}</text>
							<text class="di-count">{{ d.count }}</text>
						</view>
						<view class="di-export-btn" @tap="exportData(d.type)">
							<text class="di-export-text">{{ d.exportLabel }}</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 数据管理 -->
			<view class="sec">
				<text class="sec-lbl">数据管理</text>
				<view class="action-card">
					<view v-for="(a, idx) in actionItems" :key="idx" class="action-row" @tap="handleAction(a)">
						<view class="action-icon" :style="{ background: a.iconBg }">
							<text class="action-icon-text">{{ a.icon }}</text>
						</view>
						<text class="action-title" :class="{ 'text-danger': a.danger }">{{ a.title }}</text>
						<text v-if="a.tag" class="action-tag" :style="{ color: a.tagColor }">{{ a.tag }}</text>
						<text class="action-arrow" :style="{ color: a.danger ? '#E05050' : '#C8C4BC' }">›</text>
					</view>
				</view>
			</view>

			<view class="bottom-spacer"></view>
		</scroll-view>
	</view>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const statusBarHeight = ref(20)

onMounted(() => {
	const app = getApp()
	if (app && app.globalData) {
		statusBarHeight.value = app.globalData.statusBarHeight || 20
	}
})

function goBack() {
	uni.navigateBack()
}

const dataItems = [
	{ icon: '⚖️', iconBg: '#FAEAEE', title: '体重记录', count: '42 条记录 · 约 12KB', type: 'weight', exportLabel: '导出 CSV' },
	{ icon: '💗', iconBg: '#EBF2FB', title: '血压记录', count: '28 条记录 · 约 8KB', type: 'bp', exportLabel: '导出 CSV' },
	{ icon: '👣', iconBg: '#EAF2EE', title: '胎动记录', count: '56 条记录 · 约 15KB', type: 'fetal', exportLabel: '导出 CSV' },
	{ icon: '📁', iconBg: '#FDF3E3', title: '产检报告图片', count: '11 份报告 · 约 128MB', type: 'reports', exportLabel: '导出 ZIP' }
]

const actionItems = [
	{ icon: '📦', iconBg: '#EBF2FB', title: '导出全部数据', tag: 'ZIP', tagColor: '#5B8FC9', danger: false, action: 'exportAll' },
	{ icon: '☁️', iconBg: '#F0ECFB', title: '云端备份状态', tag: '已同步', tagColor: '#5BBF7C', danger: false, action: 'backup' },
	{ icon: '🔒', iconBg: '#FDF3E3', title: '隐私政策', danger: false, action: 'policy' },
	{ icon: '🗑', iconBg: '#F2F0EE', title: '清除本地缓存', danger: true, action: 'clearCache' },
	{ icon: '⚠️', iconBg: '#FDEAEA', title: '注销账号并删除数据', danger: true, action: 'deleteAccount' }
]

function exportData(type) {
	uni.showToast({ title: '导出功能开发中', icon: 'none' })
}

function handleAction(item) {
	if (item.danger) {
		uni.showModal({
			title: item.action === 'deleteAccount' ? '注销账号' : '清除缓存',
			content: item.action === 'deleteAccount' ? '确定要注销账号并删除所有数据吗？此操作不可恢复。' : '确定要清除本地缓存吗？',
			confirmColor: '#E05050',
			success: (res) => {
				if (res.confirm) {
					uni.showToast({ title: '操作完成', icon: 'none' })
				}
			}
		})
	} else {
		uni.showToast({ title: '功能开发中', icon: 'none' })
	}
}
</script>

<style scoped lang="scss">
.page {
	display: flex;
	flex-direction: column;
	height: 100vh;
	background-color: #FBF7F2;
}

.hero-gray {
	background: linear-gradient(155deg, #3A3834 0%, #6E6A64 45%, #A8A49C 100%);
	padding: 0 36rpx 36rpx;
	flex-shrink: 0;
}

.status-bar-spacer { width: 100%; }

.nav-bar {
	display: flex;
	align-items: center;
	gap: 20rpx;
	padding: 16rpx 0 20rpx;
}

.nav-back {
	width: 64rpx;
	height: 64rpx;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.2);
	display: flex;
	align-items: center;
	justify-content: center;
}

.nav-back-icon {
	font-size: 32rpx;
	color: #FFFFFF;
}

.nav-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #FFFFFF;
	flex: 1;
}

.hero-content { position: relative; z-index: 1; }

.hero-label {
	display: block;
	font-size: 22rpx;
	color: rgba(255, 255, 255, 0.7);
	letter-spacing: 3rpx;
	margin-bottom: 6rpx;
}

.hero-val {
	font-size: 64rpx;
	font-weight: 700;
	color: #FFFFFF;
	line-height: 1;
}

.hero-unit {
	font-size: 32rpx;
	font-weight: 400;
	opacity: 0.8;
}

.hero-sub {
	display: block;
	font-size: 24rpx;
	color: rgba(255, 255, 255, 0.8);
	margin-top: 6rpx;
}

.scroll-content { flex: 1; }

.privacy-banner {
	margin: 24rpx 28rpx 0;
	background: #EBF2FB;
	border: 2rpx solid rgba(91, 143, 201, 0.25);
	border-radius: 32rpx;
	padding: 24rpx 28rpx;
	display: flex;
	gap: 20rpx;
	align-items: flex-start;
}

.pb-icon {
	font-size: 40rpx;
	flex-shrink: 0;
}

.pb-text {
	font-size: 24rpx;
	color: #5B8FC9;
	line-height: 1.6;
}

.sec {
	margin: 20rpx 28rpx 0;
}

.sec-lbl {
	display: block;
	font-size: 22rpx;
	font-weight: 700;
	color: #9C9890;
	text-transform: uppercase;
	letter-spacing: 3rpx;
	margin-bottom: 14rpx;
}

.data-list {
	display: flex;
	flex-direction: column;
	gap: 16rpx;
}

.data-item {
	background: #FFFFFF;
	border-radius: 20rpx;
	box-shadow: 0 4rpx 28rpx rgba(60, 30, 10, 0.07);
	padding: 24rpx 28rpx;
	display: flex;
	align-items: center;
	gap: 20rpx;
}

.di-icon {
	width: 72rpx;
	height: 72rpx;
	border-radius: 20rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
}

.di-icon-text { font-size: 32rpx; }

.di-body { flex: 1; }

.di-title {
	display: block;
	font-size: 26rpx;
	font-weight: 600;
	color: #1C1A17;
}

.di-count {
	display: block;
	font-size: 22rpx;
	color: #9C9890;
	margin-top: 2rpx;
}

.di-export-btn {
	background: #EBF2FB;
	border-radius: 999rpx;
	padding: 10rpx 24rpx;
}

.di-export-text {
	font-size: 22rpx;
	font-weight: 600;
	color: #5B8FC9;
}

.action-card {
	background: #FFFFFF;
	border-radius: 32rpx;
	box-shadow: 0 4rpx 28rpx rgba(60, 30, 10, 0.07);
	overflow: hidden;
}

.action-row {
	display: flex;
	align-items: center;
	padding: 26rpx 28rpx;
	border-bottom: 1rpx solid #E8DDD0;
}

.action-row:last-child { border-bottom: none; }

.action-icon {
	width: 64rpx;
	height: 64rpx;
	border-radius: 18rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
	margin-right: 22rpx;
}

.action-icon-text { font-size: 30rpx; }

.action-title {
	font-size: 28rpx;
	font-weight: 500;
	color: #1C1A17;
	flex: 1;
}

.text-danger { color: #E05050; }

.action-tag {
	font-size: 22rpx;
	margin-right: 12rpx;
}

.action-arrow {
	font-size: 28rpx;
}

.bottom-spacer { height: 40rpx; }
</style>
