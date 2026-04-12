<template>
	<view class="page">
		<!-- NavBar -->
		<NavBar title="知识中心" :showBack="false" />

		<!-- Search & Filter Row -->
		<view class="search-row">
			<view class="search-box-wrap">
				<text class="search-icon">🔍</text>
				<input
					class="search-box"
					type="text"
					placeholder="搜索孕期知识、症状、检查..."
					placeholder-class="search-placeholder"
					:value="searchKeyword"
					@input="onSearchInput"
				/>
				<text v-if="searchKeyword" class="search-clear" @tap="clearSearch">✕</text>
			</view>
			<view class="filter-btn" @tap="handleFilter">
				<text class="filter-text">筛选 ▾</text>
			</view>
		</view>

		<!-- Category Tabs - Horizontal Scroll -->
		<view class="tabs-wrap">
			<scroll-view scroll-x class="tabs-scroll" :show-scrollbar="false">
				<view class="tabs">
					<view
						v-for="(tab, index) in categoryTabs"
						:key="tab.id"
						class="tab"
						:class="{ active: activeTab === tab.id }"
						@tap="switchTab(tab.id)"
					>
						<text class="tab-label" :class="{ 'tab-label-active': activeTab === tab.id }">{{ tab.name }}</text>
					</view>
				</view>
			</scroll-view>
		</view>

		<!-- Scrollable Content -->
		<scroll-view scroll-y class="scroll-content">
			<!-- Week Recommendation Banner -->
		<view class="week-banner">
			<view class="week-badge">
				<text class="week-icon">📅</text>
				<text class="week-text">孕23周推荐</text>
			</view>
			<text class="banner-title">糖耐量检查攻略</text>
			<text class="banner-desc">孕中期重要检查项目，提前了解注意事项</text>
		</view>

		<!-- Article Feed -->
		<view class="article-feed">
			<!-- Article Card 1 -->
			<view class="article-card" @tap="readArticle(articleList[0])">
				<view class="article-cover">
					<view class="cover-placeholder gradient-1">
						<text class="cover-icon">👶</text>
					</view>
					<view class="article-tag">热门</view>
				</view>
				<view class="article-content">
					<view class="article-header">
						<text class="article-title">孕中期四维彩超攻略：什么时候做？要注意什么？</text>
						<view class="doctor-badge">
							<text class="doctor-icon">👨‍⚕️</text>
							<text class="doctor-text">医生认证</text>
						</view>
					</view>
					<text class="article-excerpt">四维彩超是孕中期最重要的排畸检查之一，最佳检查时间是20-24周。本文为您详细解读检查流程、注意事项...</text>
					<view class="article-meta">
						<view class="meta-item">
							<text class="meta-icon">👁️</text>
							<text class="meta-text">12.5k</text>
						</view>
						<view class="meta-item">
							<text class="meta-icon">⏱️</text>
							<text class="meta-text">8分钟</text>
						</view>
						<view class="meta-item">
							<text class="meta-icon">👍</text>
							<text class="meta-text">892</text>
						</view>
					</view>
				</view>
			</view>

			<!-- Article Card 2 -->
			<view class="article-card" @tap="readArticle(articleList[1])">
				<view class="article-cover">
					<view class="cover-placeholder gradient-2">
						<text class="cover-icon">🧬</text>
					</view>
				</view>
				<view class="article-content">
					<view class="article-header">
						<text class="article-title">唐筛与无创DNA检测如何选择？一篇讲清楚</text>
						<view class="doctor-badge">
							<text class="doctor-icon">👨‍⚕️</text>
							<text class="doctor-text">医生认证</text>
						</view>
					</view>
					<text class="article-excerpt">唐氏筛查和无创DNA检测都是染色体异常的筛查手段，但准确率、适用人群、价格都有差异。孕妈们该如何选择？</text>
					<view class="article-meta">
						<view class="meta-item">
							<text class="meta-icon">👁️</text>
							<text class="meta-text">8.3k</text>
						</view>
						<view class="meta-item">
							<text class="meta-icon">⏱️</text>
							<text class="meta-text">6分钟</text>
						</view>
						<view class="meta-item">
							<text class="meta-icon">👍</text>
							<text class="meta-text">654</text>
						</view>
					</view>
				</view>
			</view>

			<!-- Article Card 3 -->
			<view class="article-card" @tap="readArticle(articleList[2])">
				<view class="article-cover">
					<view class="cover-placeholder gradient-3">
						<text class="cover-icon">🍬</text>
					</view>
					<view class="article-tag important">必读</view>
				</view>
				<view class="article-content">
					<view class="article-header">
						<text class="article-title">妊娠期糖尿病：糖耐量检查全攻略</text>
						<view class="doctor-badge">
							<text class="doctor-icon">👨‍⚕️</text>
							<text class="doctor-text">医生认证</text>
						</view>
					</view>
					<text class="article-excerpt">孕24-28周需要做糖耐量检查，筛查妊娠期糖尿病。检查前要空腹？喝糖水难受吗？结果怎么看？一文读懂。</text>
					<view class="article-meta">
						<view class="meta-item">
							<text class="meta-icon">👁️</text>
							<text class="meta-text">15.2k</text>
						</view>
						<view class="meta-item">
							<text class="meta-icon">⏱️</text>
							<text class="meta-text">10分钟</text>
						</view>
						<view class="meta-item">
							<text class="meta-icon">👍</text>
							<text class="meta-text">1.1k</text>
						</view>
					</view>
				</view>
			</view>

			<!-- Article Card 4 -->
			<view class="article-card" @tap="readArticle(articleList[3])">
				<view class="article-cover">
					<view class="cover-placeholder gradient-4">
						<text class="cover-icon">🏃‍♀️</text>
					</view>
				</view>
				<view class="article-content">
					<view class="article-header">
						<text class="article-title">孕中期运动指南：哪些运动适合？运动时要注意什么？</text>
						<view class="doctor-badge">
							<text class="doctor-icon">👨‍⚕️</text>
							<text class="doctor-text">医生认证</text>
						</view>
					</view>
					<text class="article-excerpt">孕中期是运动的黄金时期。适量运动有助于控制体重、缓解腰痛、为分娩做准备。但哪些运动安全？运动强度如何把握？</text>
					<view class="article-meta">
						<view class="meta-item">
							<text class="meta-icon">👁️</text>
							<text class="meta-text">6.8k</text>
						</view>
						<view class="meta-item">
							<text class="meta-icon">⏱️</text>
							<text class="meta-text">5分钟</text>
						</view>
						<view class="meta-item">
							<text class="meta-icon">👍</text>
							<text class="meta-text">423</text>
						</view>
					</view>
				</view>
			</view>

			<!-- Article Card 5 -->
			<view class="article-card" @tap="readArticle(articleList[4])">
				<view class="article-cover">
					<view class="cover-placeholder gradient-5">
						<text class="cover-icon">😴</text>
					</view>
				</view>
				<view class="article-content">
					<view class="article-header">
						<text class="article-title">孕中期睡眠质量下降？5个方法帮助您睡个好觉</text>
						<view class="doctor-badge">
							<text class="doctor-icon">👨‍⚕️</text>
							<text class="doctor-text">医生认证</text>
						</view>
					</view>
					<text class="article-excerpt">随着肚子越来越大，很多孕妈开始失眠、多梦、夜间频繁起夜。如何改善孕中期睡眠质量？试试这些方法。</text>
					<view class="article-meta">
						<view class="meta-item">
							<text class="meta-icon">👁️</text>
							<text class="meta-text">9.1k</text>
						</view>
						<view class="meta-item">
							<text class="meta-icon">⏱️</text>
							<text class="meta-text">4分钟</text>
						</view>
						<view class="meta-item">
							<text class="meta-icon">👍</text>
							<text class="meta-text">567</text>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- Video Course Section -->
		<view class="video-section">
			<view class="section-header">
				<text class="section-title">专家视频课</text>
				<text class="section-action">更多 →</text>
			</view>
			<scroll-view class="video-list" scroll-x>
				<view class="video-card" v-for="video in videoList" :key="video.id" @tap="watchVideo(video)">
					<view class="video-cover">
						<view class="video-placeholder" :class="video.gradientClass">
							<text class="video-icon">▶️</text>
						</view>
						<view class="video-duration">{{ video.duration }}</view>
					</view>
					<text class="video-title">{{ video.title }}</text>
					<view class="video-doctor">
						<text class="doctor-icon-small">👨‍⚕️</text>
						<text class="doctor-name">{{ video.doctor }}</text>
					</view>
				</view>
			</scroll-view>
		</view>

			<!-- Bottom Spacer for TabBar -->
			<view class="bottom-spacer"></view>
		</scroll-view>
	</view>
</template>

<script setup>
import { ref } from 'vue'
import NavBar from '@/components/NavBar.vue'

// Search state
const searchKeyword = ref('')
const showFilterSheet = ref(false)

// Category tabs
const categoryTabs = ref([
	{ id: 'recommended', name: '为您推荐' },
	{ id: 'early', name: '孕早期必读' },
	{ id: 'mid', name: '孕中期指南' },
	{ id: 'late', name: '孕晚期准备' },
	{ id: 'checkup', name: '产检全攻略' },
	{ id: 'nutrition', name: '营养饮食' },
	{ id: 'parenting', name: '育儿知识' }
])

const activeTab = ref('recommended')
const scrollLeft = ref(0)

// Mock article data for 23-week pregnancy
const articleList = ref([
	{
		id: 1,
		title: '孕中期四维彩超攻略：什么时候做？要注意什么？',
		excerpt: '四维彩超是孕中期最重要的排畸检查之一，最佳检查时间是20-24周。本文为您详细解读检查流程、注意事项...',
		cover: 'gradient-1',
		icon: '👶',
		tag: '热门',
		doctorCertified: true,
		views: '12.5k',
		readTime: '8分钟',
		likes: 892
	},
	{
		id: 2,
		title: '唐筛与无创DNA检测如何选择？一篇讲清楚',
		excerpt: '唐氏筛查和无创DNA检测都是染色体异常的筛查手段，但准确率、适用人群、价格都有差异。孕妈们该如何选择？',
		cover: 'gradient-2',
		icon: '🧬',
		tag: null,
		doctorCertified: true,
		views: '8.3k',
		readTime: '6分钟',
		likes: 654
	},
	{
		id: 3,
		title: '妊娠期糖尿病：糖耐量检查全攻略',
		excerpt: '孕24-28周需要做糖耐量检查，筛查妊娠期糖尿病。检查前要空腹？喝糖水难受吗？结果怎么看？一文读懂。',
		cover: 'gradient-3',
		icon: '🍬',
		tag: '必读',
		doctorCertified: true,
		views: '15.2k',
		readTime: '10分钟',
		likes: 1100
	},
	{
		id: 4,
		title: '孕中期运动指南：哪些运动适合？运动时要注意什么？',
		excerpt: '孕中期是运动的黄金时期。适量运动有助于控制体重、缓解腰痛、为分娩做准备。但哪些运动安全？运动强度如何把握？',
		cover: 'gradient-4',
		icon: '🏃‍♀️',
		tag: null,
		doctorCertified: true,
		views: '6.8k',
		readTime: '5分钟',
		likes: 423
	},
	{
		id: 5,
		title: '孕中期睡眠质量下降？5个方法帮助您睡个好觉',
		excerpt: '随着肚子越来越大，很多孕妈开始失眠、多梦、夜间频繁起夜。如何改善孕中期睡眠质量？试试这些方法。',
		cover: 'gradient-5',
		icon: '😴',
		tag: null,
		doctorCertified: true,
		views: '9.1k',
		readTime: '4分钟',
		likes: 567
	}
])

// Mock video data
const videoList = ref([
	{
		id: 1,
		title: '孕中期营养搭配',
		doctor: '张主任',
		duration: '12:30',
		gradientClass: 'video-gradient-1'
	},
	{
		id: 2,
		title: '四维彩超检查详解',
		doctor: '李医生',
		duration: '15:45',
		gradientClass: 'video-gradient-2'
	},
	{
		id: 3,
		title: '孕期体重管理',
		doctor: '王医师',
		duration: '10:20',
		gradientClass: 'video-gradient-3'
	}
])

// Search handlers
const onSearchInput = (e) => {
	searchKeyword.value = e.detail.value
}

const handleSearch = () => {
	console.log('Search:', searchKeyword.value)
	uni.showToast({
		title: '搜索功能开发中',
		icon: 'none'
	})
}

const handleFilter = () => {
	uni.showToast({
		title: '筛选功能开发中',
		icon: 'none'
	})
}

const clearSearch = () => {
	searchKeyword.value = ''
}

// Tab switch
const switchTab = (tabId) => {
	activeTab.value = tabId
	// Calculate scroll position for active tab
	const index = categoryTabs.value.findIndex(tab => tab.id === tabId)
	scrollLeft.value = index * 120 // Approximate tab width
}

// Read article
const readArticle = (article) => {
	console.log('Read article:', article)
	uni.navigateTo({
		url: `/pages/knowledge/article?id=${article.id}`
	})
}

// Watch video
const watchVideo = (video) => {
	console.log('Watch video:', video)
	uni.navigateTo({
		url: `/pages/knowledge/video?id=${video.id}`
	})
}
</script>

<style scoped lang="scss">
/* ── CSS Variables ── */
page {
	--rose: #E8637A;
	--rose-light: #FDEEF1;
	--rose-mid: #F5B8C4;
	--rose-dark: #C0405A;
	--gray-50: #FAF9F8;
	--gray-100: #F2F0EE;
	--gray-200: #E4E1DC;
	--gray-300: #C8C4BC;
	--gray-400: #9C9890;
	--gray-500: #6E6A64;
	--gray-700: #3A3834;
	--gray-900: #1C1A17;
}

/* Page Container */
.page {
	display: flex;
	flex-direction: column;
	height: 100vh;
	background-color: #FFFFFF;
	box-sizing: border-box;
}

/* ── Search Row ── */
.search-row {
	background: white;
	display: flex;
	padding: 20rpx 32rpx;
	gap: 16rpx;
	flex-shrink: 0;
}

.search-box-wrap {
	flex: 1;
	height: 72rpx;
	background: #F2F0EE;
	border-radius: 999px;
	display: flex;
	align-items: center;
	padding: 0 28rpx;
	gap: 12rpx;
}

.search-icon {
	font-size: 24rpx;
	flex-shrink: 0;
}

.search-box {
	flex: 1;
	height: 72rpx;
	font-size: 26rpx;
	color: #3A3834;
	background: transparent;
}

.search-placeholder {
	color: #C8C4BC;
	font-size: 26rpx;
}

.search-clear {
	font-size: 24rpx;
	color: #9C9890;
	padding: 8rpx;
}

/* ── Filter Button ── */
.filter-btn {
	height: 72rpx;
	padding: 0 24rpx;
	background: #F2F0EE;
	border-radius: 999px;
	display: flex;
	align-items: center;
	justify-content: center;
}

.filter-text {
	font-size: 24rpx;
	font-weight: 500;
	color: #6E6A64;
}

/* ── Tabs ── */
.tabs-wrap {
	background: white;
	border-bottom: 1px solid #F2F0EE;
	flex-shrink: 0;
}

.tabs-scroll {
	white-space: nowrap;
}

.tabs {
	display: inline-flex;
	padding: 0 32rpx;
}

.tab {
	display: inline-flex;
	align-items: center;
	padding: 20rpx 28rpx;
	gap: 10rpx;
	border-bottom: 4rpx solid transparent;
}

.tab.active {
	border-bottom-color: #E8637A;
}

.tab-label {
	font-size: 26rpx;
	font-weight: 500;
	color: #9C9890;
	white-space: nowrap;
}

.tab-label-active {
	color: #E8637A;
}

/* Scrollable Content Area */
.scroll-content {
	flex: 1;
	padding: 32rpx;
	padding-bottom: 180rpx;
	padding-bottom: calc(180rpx + env(safe-area-inset-bottom));
	box-sizing: border-box;
}

/* Week Recommendation Banner */
.week-banner {
	background: linear-gradient(135deg, #FCE7F3 0%, #F8BBD0 100%);
	border-radius: 32rpx;
	padding: 32rpx;
	margin-bottom: 32rpx;
}

.week-badge {
	display: flex;
	align-items: center;
	gap: 8rpx;
	background-color: rgba(194, 24, 91, 0.15);
	padding: 8rpx 16rpx;
	border-radius: 20rpx;
	width: fit-content;
	margin-bottom: 16rpx;
}

.week-icon {
	font-size: 24rpx;
}

.week-text {
	font-size: 24rpx;
	color: #C2185B;
	font-weight: 500;
}

.banner-title {
	display: block;
	font-size: 36rpx;
	font-weight: 600;
	color: #191C1E;
	margin-bottom: 12rpx;
}

.banner-desc {
	display: block;
	font-size: 26rpx;
	color: #616161;
	line-height: 1.5;
}

/* Article Feed */
.article-feed {
	display: flex;
	flex-direction: column;
	gap: 24rpx;
	margin-bottom: 32rpx;
}

.article-card {
	background-color: #FFFFFF;
	border-radius: 32rpx;
	overflow: hidden;
}

.article-cover {
	position: relative;
	width: 100%;
	height: 320rpx;
}

.cover-placeholder {
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
}

.gradient-1 {
	background: linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%);
}

.gradient-2 {
	background: linear-gradient(135deg, #F3E5F5 0%, #E1BEE7 100%);
}

.gradient-3 {
	background: linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%);
}

.gradient-4 {
	background: linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%);
}

.gradient-5 {
	background: linear-gradient(135deg, #FCE4EC 0%, #F8BBD0 100%);
}

.cover-icon {
	font-size: 80rpx;
}

.article-tag {
	position: absolute;
	top: 24rpx;
	left: 24rpx;
	background-color: #C2185B;
	color: #FFFFFF;
	font-size: 24rpx;
	font-weight: 500;
	padding: 8rpx 20rpx;
	border-radius: 20rpx;
}

.article-tag.important {
	background-color: #FFA726;
}

/* Article Content */
.article-content {
	padding: 32rpx;
}

.article-header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	margin-bottom: 16rpx;
}

.article-title {
	flex: 1;
	font-size: 32rpx;
	font-weight: 500;
	color: #191C1E;
	line-height: 1.4;
	margin-right: 16rpx;
}

.doctor-badge {
	display: flex;
	align-items: center;
	gap: 6rpx;
	background-color: #E8F5E9;
	padding: 8rpx 16rpx;
	border-radius: 20rpx;
	flex-shrink: 0;
}

.doctor-icon {
	font-size: 24rpx;
}

.doctor-text {
	font-size: 22rpx;
	color: #4CAF50;
	font-weight: 500;
}

.article-excerpt {
	display: block;
	font-size: 26rpx;
	color: #757575;
	line-height: 1.6;
	margin-bottom: 20rpx;
}

.article-meta {
	display: flex;
	align-items: center;
	gap: 24rpx;
}

.meta-item {
	display: flex;
	align-items: center;
	gap: 6rpx;
}

.meta-icon {
	font-size: 24rpx;
}

.meta-text {
	font-size: 24rpx;
	color: #9E9E9E;
}

/* Video Section */
.video-section {
	margin-bottom: 32rpx;
}

.section-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20rpx;
}

.section-title {
	font-size: 36rpx;
	font-weight: 600;
	color: #191C1E;
}

.section-action {
	font-size: 28rpx;
	color: #C2185B;
}

.video-list {
	white-space: nowrap;
}

.video-card {
	display: inline-block;
	width: 240rpx;
	margin-right: 16rpx;
	background-color: #FFFFFF;
	border-radius: 24rpx;
	overflow: hidden;
	vertical-align: top;
}

.video-cover {
	position: relative;
	width: 100%;
	height: 160rpx;
	margin-bottom: 16rpx;
}

.video-placeholder {
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
}

.video-gradient-1 {
	background: linear-gradient(135deg, #E3F2FD 0%, #90CAF9 100%);
}

.video-gradient-2 {
	background: linear-gradient(135deg, #F3E5F5 0%, #CE93D8 100%);
}

.video-gradient-3 {
	background: linear-gradient(135deg, #FFF3E0 0%, #FFCC80 100%);
}

.video-icon {
	font-size: 48rpx;
}

.video-duration {
	position: absolute;
	bottom: 12rpx;
	right: 12rpx;
	background-color: rgba(0, 0, 0, 0.6);
	color: #FFFFFF;
	font-size: 20rpx;
	padding: 4rpx 12rpx;
	border-radius: 12rpx;
}

.video-title {
	display: block;
	font-size: 26rpx;
	font-weight: 500;
	color: #191C1E;
	line-height: 1.3;
	margin: 0 16rpx 12rpx;
	white-space: normal;
}

.video-doctor {
	display: flex;
	align-items: center;
	gap: 6rpx;
	margin: 0 16rpx 16rpx;
}

.doctor-icon-small {
	font-size: 20rpx;
}

.doctor-name {
	font-size: 22rpx;
	color: #9E9E9E;
}

/* Bottom Spacer */
.bottom-spacer {
	height: 120rpx;
}
</style>
