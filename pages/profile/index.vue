<template>
	<view class="page">
		<scroll-view scroll-y class="scroll-content">
			<!-- Hero 区域 -->
			<ProfileHero
				:userInfo="healthStore.userInfo"
				:weekInfo="healthStore.todayWeekInfo || { week: 0, day: 0, total: 0 }"
				:daysUntilDue="healthStore.daysUntilDue"
				:totalPregDays="healthStore.totalPregDays"
				:progressPercent="healthStore.progressPercent"
				:isLoggedIn="healthStore.isLoggedIn"
				:pregInfoSet="healthStore.pregInfoSet"
			/>

			<!-- 倒计时环 -->
			<view class="section-card">
				<DueCountdownRing
					:daysUntilDue="healthStore.daysUntilDue"
					:progressPercent="healthStore.progressPercent"
					:dueDate="healthStore.dueDate"
				/>
			</view>

			<!-- 孕期信息 -->
			<ProfileSection
				title="孕期信息"
				:items="pregInfoItems"
				@itemTap="handlePregInfoTap"
			/>

			<!-- 我的记录 -->
			<ProfileSection
				title="我的记录"
				:items="recordItems"
				@itemTap="handleRecordTap"
			/>

			<!-- 待办 & 提醒 -->
			<ProfileSection
				title="待办 & 提醒"
				:items="todoItems"
				@itemTap="handleTodoTap"
			/>

			<!-- 设置 -->
			<ProfileSection
				title="设置"
				:items="settingItems"
				@itemTap="handleSettingTap"
				@toggle="handleToggle"
			/>

			<!-- #ifdef H5 -->
			<view v-if="isIOS" class="ios-homescreen-card" @tap="installToHomeScreen">
				<view class="ios-card-icon-wrap">
					<text class="ios-card-emoji">📲</text>
				</view>
				<view class="ios-card-body">
					<text class="ios-card-title">添加到桌面 (iOS)</text>
					<text class="ios-card-desc">享受免打扰的全屏 App 体验</text>
				</view>
				<text class="ios-card-arrow">›</text>
			</view>
			<!-- #endif -->

			<view class="bottom-spacer"></view>
		</scroll-view>
		<CustomTabBar :active="3" />

		<!-- 退出登录确认弹窗 -->
		<view class="logout-overlay" v-if="showLogoutModal" @tap="showLogoutModal = false">
			<view class="logout-card" @tap.stop>
				<text class="logout-modal-title">退出登录</text>
				<text class="logout-modal-desc">确定要退出当前账号吗？\n您的数据已安全保存在云端。</text>
				<view class="logout-modal-actions">
					<view class="logout-btn logout-btn-cancel" @tap="showLogoutModal = false">
						<text>取消</text>
					</view>
					<view class="logout-btn logout-btn-confirm" @tap="confirmLogout">
						<text>确定</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useHealthStore, getTrimesterName } from '@/stores/health.js'
import { navigateToPage } from '@/utils/navigation.js'
import { removeToken } from '@/utils/api.js'
import ProfileHero from '@/components/profile/ProfileHero.vue'
import DueCountdownRing from '@/components/common/DueCountdownRing.vue'
import ProfileSection from '@/components/profile/ProfileSection.vue'
import CustomTabBar from '@/components/CustomTabBar.vue'

const healthStore = useHealthStore()
const showLogoutModal = ref(false)

function confirmLogout() {
	showLogoutModal.value = false
	removeToken()
	uni.removeStorageSync('momcare_user')
	uni.reLaunch({ url: '/pages/login/index' })
}

// #ifdef H5
const isIOS = ref(/iPhone|iPad|iPod/i.test(navigator.userAgent))

function installToHomeScreen() {
	window.location.href = '/static/momcare.mobileconfig'
}
// #endif

// 孕期信息
const pregInfoItems = computed(() => {
	const lmp = healthStore.lmpDate
	const due = healthStore.dueDate
	const lmpText = lmp ? `${lmp.getFullYear()}年${lmp.getMonth() + 1}月${lmp.getDate()}日` : '未设置'
	const dueText = due ? `${due.getFullYear()}年${due.getMonth() + 1}月${due.getDate()}日（可由医生修正）` : '未设置'
	return [
		{
			icon: '📅',
			iconBg: '#FAEAEE',
			title: '末次月经',
			subtitle: lmpText,
			action: 'editLmp'
		},
		{
			icon: '🎀',
			iconBg: '#FDF3E3',
			title: '预产期',
			subtitle: dueText,
			action: 'editDue'
		},
		{
			icon: '🏥',
			iconBg: '#DDD0F5',
			title: '就诊医院',
			subtitle: healthStore.userInfo.hospital || '未设置',
			action: 'editHospital'
		},
		{
			icon: '👶',
			iconBg: '#EAF7EF',
			title: '宝宝昵称',
			subtitle: healthStore.userInfo.babyNickname || '未设置',
			action: 'editNickname'
		}
	]
})

// 我的记录
const recordItems = computed(() => {
	const ws = healthStore.getWeightStats()
	const bs = healthStore.getBpStats()
	const fs = healthStore.getFetalStats()

	const weightSubtitle = ws.count > 0
		? `最新 ${ws.latest}kg · 孕期增重 ${ws.gain || '--'}kg`
		: '暂无记录'
	const weightBadge = ws.count > 0 ? `${ws.count}条` : ''

	const bpSubtitle = bs.count > 0
		? `最新 ${bs.latest} · 血压${bs.status}`
		: '暂无记录'
	const bpBadge = bs.count > 0 ? `${bs.count}条` : ''

	const fetalSubtitle = fs.count > 0
		? `今日 ${fs.today}次 · 昨日 ${fs.yesterday}次`
		: '暂无记录'
	const fetalBadge = fs.count > 0 ? `${fs.count}条` : ''

	return [
	{
		icon: '⚖️',
		iconBg: '#FAEAEE',
		title: '体重记录',
		subtitle: weightSubtitle,
		badge: weightBadge,
		action: 'weightRecords'
	},
	{
		icon: '💗',
		iconBg: '#EBF2FB',
		title: '血压记录',
		subtitle: bpSubtitle,
		badge: bpBadge,
		action: 'bpRecords'
	},
	{
		icon: '👣',
		iconBg: '#EAF2EE',
		title: '胎动记录',
		subtitle: fetalSubtitle,
		badge: fetalBadge,
		action: 'fetalRecords'
	},
	{
		icon: '📁',
		iconBg: '#FDF3E3',
		title: '产检档案',
		subtitle: '暂无报告',
		action: 'archives'
	}
]
})

// 待产包进度（从本地存储读取）
const hospitalBagSubtitle = computed(() => {
	try {
		const saved = uni.getStorageSync('hospital_bag_items')
		if (saved) {
			const items = JSON.parse(saved)
			const done = items.filter(i => i.done).length
			return `已完成 ${done} / ${items.length} 项`
		}
	} catch (e) {}
	return '点击查看待产包清单'
})

// 待办 & 提醒
const todoItems = computed(() => {
	const next = healthStore.nextCheckup
	let checkupSubtitle = '暂无产检安排'
	let checkupBadge = ''
	let checkupBadgeStyle = ''
	if (next) {
		const d = new Date(next.checkup_date)
		const todayDate = new Date()
		const days = Math.ceil((d - todayDate) / 86400000)
		const m = d.getMonth() + 1
		const day = d.getDate()
		if (days > 0) {
			checkupSubtitle = `${m}月${day}日 · 还有 ${days} 天`
			checkupBadge = days + '天后'
			checkupBadgeStyle = 'amber'
		} else if (days === 0) {
			checkupSubtitle = `${m}月${day}日 · 就是今天`
			checkupBadge = '今天'
			checkupBadgeStyle = 'rose'
		} else {
			checkupSubtitle = `${m}月${day}日 · 已过期`
			checkupBadge = '已过期'
			checkupBadgeStyle = 'gray'
		}
	}

	return [
		{
			icon: '🗓',
			iconBg: '#FAEAEE',
			title: '下次产检',
			subtitle: checkupSubtitle,
			badge: checkupBadge,
			badgeStyle: checkupBadgeStyle,
			action: 'nextCheckup'
		},
		{
			icon: '🎒',
			iconBg: '#EEE8FA',
			title: '待产包清单',
			subtitle: hospitalBagSubtitle,
			action: 'hospitalBag'
		},
		{
			icon: '📋',
			iconBg: '#EAF7EF',
			title: '今日计划',
			subtitle: '产检 · 练习呼吸法 · 整理报告',
			action: 'dailyPlan'
		}
	]
})

// 设置（含开关状态）
const settingItems = reactive([
		// 每日推送提醒、产检提醒、胎动记录提醒、隐私与数据 — 暂时隐藏，功能开发中
		{
			icon: 'ℹ️',
			iconBg: '#F2F0EE',
			title: '关于孕途伴侣',
			subtitle: '版本 v1.0.0',
			action: 'about'
		},
		{
			icon: '🚪',
			iconBg: '#F2F0EE',
			title: '退出登录',
			subtitle: '',
			action: 'logout'
		}
	])

function handlePregInfoTap(item) {
	navigateToPage('/pages/profile/pregnancy-info')
}

function handleRecordTap(item) {
	const routes = {
		weightRecords: '/pages/profile/weight-records',
		bpRecords: '/pages/profile/bp-records',
		fetalRecords: '/pages/profile/fetal-records',
		archives: '/pages/archives/index'
	}
	if (item.action === 'archives') {
		uni.switchTab({ url: routes.archives })
	} else if (routes[item.action]) {
		navigateToPage(routes[item.action])
	}
}

function handleTodoTap(item) {
	const routes = {
		nextCheckup: '/pages/profile/checkup-reminder',
		hospitalBag: '/pages/profile/hospital-bag',
		dailyPlan: '/pages/profile/daily-plan'
	}
	if (routes[item.action]) {
		navigateToPage(routes[item.action])
	}
}

function handleSettingTap(item) {
		if (item.action === 'logout') {
			showLogoutModal.value = true
			return
		}

	const routes = {
		privacy: '/pages/profile/privacy',
		about: '/pages/profile/about'
	}
	if (routes[item.action]) {
		navigateToPage(routes[item.action])
	}
}

function handleToggle(idx) {
	settingItems[idx].toggle = !settingItems[idx].toggle
}

// 加载产检日程（用于首页卡片显示）
healthStore.loadCheckupSchedules().then(() => {
	if (healthStore.checkupSchedules.length === 0) {
		healthStore.initCheckupSchedules()
	}
})
</script>

<style scoped lang="scss">
.page {
	display: flex;
	flex-direction: column;
	height: 100vh;
	background-color: #FBF7F2;
	box-sizing: border-box;
}

.scroll-content {
	flex: 1;
	padding-bottom: 20rpx;
}

.section-card {
	background: #FFFFFF;
	border-radius: 32rpx;
	box-shadow: 0 4rpx 28rpx rgba(60, 30, 10, 0.07);
	overflow: hidden;
	margin: 20rpx 24rpx 0;
}

.bottom-spacer {
	height: calc(120rpx + env(safe-area-inset-bottom));
}

.ios-homescreen-card {
	display: flex;
	align-items: center;
	margin: 20rpx 24rpx 0;
	padding: 28rpx 28rpx;
	background: linear-gradient(135deg, #FFF5F6 0%, #FFF0F3 100%);
	border: 2rpx solid rgba(232, 99, 122, 0.15);
	border-radius: 32rpx;
	box-shadow: 0 4rpx 28rpx rgba(60, 30, 10, 0.07);
}

.ios-card-icon-wrap {
	flex-shrink: 0;
	width: 80rpx;
	height: 80rpx;
	border-radius: 20rpx;
	background: rgba(232, 99, 122, 0.1);
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 24rpx;
}

.ios-card-emoji {
	font-size: 40rpx;
}

.ios-card-body {
	flex: 1;
	display: flex;
	flex-direction: column;
}

.ios-card-title {
	font-size: 30rpx;
	font-weight: 600;
	color: #333;
}

.ios-card-desc {
	font-size: 24rpx;
	color: #999;
	margin-top: 6rpx;
}

.ios-card-arrow {
	flex-shrink: 0;
	font-size: 36rpx;
	color: #CCC;
	margin-left: 16rpx;
}

/* 退出登录弹窗 */
.logout-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.4);
	backdrop-filter: blur(4px);
	-webkit-backdrop-filter: blur(4px);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 9999;
}

.logout-card {
	width: 80%;
	background: #FFFFFF;
	border-radius: 48rpx;
	padding: 48rpx 40rpx 36rpx;
	box-shadow: 0 16rpx 64rpx rgba(0, 0, 0, 0.15);
}

.logout-modal-title {
	display: block;
	text-align: center;
	font-size: 36rpx;
	font-weight: 700;
	color: #333333;
}

.logout-modal-desc {
	display: block;
	text-align: center;
	font-size: 28rpx;
	color: #666666;
	line-height: 1.7;
	margin-top: 20rpx;
	white-space: pre-line;
}

.logout-modal-actions {
	display: flex;
	gap: 24rpx;
	margin-top: 40rpx;
}

.logout-btn {
	flex: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	height: 88rpx;
	border-radius: 88rpx;
	font-size: 30rpx;
	font-weight: 600;
}

.logout-btn-cancel {
	background: #F5F5F5;
	color: #333333;
}

.logout-btn-confirm {
	background: #E8637A;
	color: #FFFFFF;
}
</style>
