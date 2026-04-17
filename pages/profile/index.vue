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
				@tap="handlePregInfoTap"
			/>

			<!-- 我的记录 -->
			<ProfileSection
				title="我的记录"
				:items="recordItems"
				@tap="handleRecordTap"
			/>

			<!-- 待办 & 提醒 -->
			<ProfileSection
				title="待办 & 提醒"
				:items="todoItems"
				@tap="handleTodoTap"
			/>

			<!-- 设置 -->
			<ProfileSection
				title="设置"
				:items="settingItems"
				@tap="handleSettingTap"
				@toggle="handleToggle"
			/>

			<view class="bottom-spacer"></view>
		</scroll-view>
	</view>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useHealthStore, getTrimesterName } from '@/stores/health.js'
import { navigateToPage } from '@/utils/navigation.js'
import ProfileHero from '@/components/profile/ProfileHero.vue'
import DueCountdownRing from '@/components/common/DueCountdownRing.vue'
import ProfileSection from '@/components/profile/ProfileSection.vue'

const healthStore = useHealthStore()

// 孕期信息
const pregInfoItems = computed(() => {
	const lmp = healthStore.lmpDate
	const due = healthStore.dueDate
	return [
		{
			icon: '📅',
			iconBg: '#FAEAEE',
			title: '末次月经',
			subtitle: `${lmp.getFullYear()}年${lmp.getMonth() + 1}月${lmp.getDate()}日`,
			action: 'editLmp'
		},
		{
			icon: '🎀',
			iconBg: '#FDF3E3',
			title: '预产期',
			subtitle: `${due.getFullYear()}年${due.getMonth() + 1}月${due.getDate()}日（可由医生修正）`,
			action: 'editDue'
		},
		{
			icon: '🏥',
			iconBg: '#DDD0F5',
			title: '就诊医院',
			subtitle: healthStore.userInfo.hospital,
			action: 'editHospital'
		},
		{
			icon: '👶',
			iconBg: '#EAF7EF',
			title: '宝宝昵称',
			subtitle: healthStore.userInfo.babyNickname,
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
	{
		icon: '🔔',
		iconBg: '#EBF2FB',
		title: '每日推送提醒',
		subtitle: '每天早8点推送孕期变化',
		toggle: true,
		action: 'pushReminder'
	},
	{
		icon: '💊',
		iconBg: '#EAF2EE',
		title: '产检提醒',
		subtitle: '产检前1天提前提醒',
		toggle: true,
		action: 'checkupReminder'
	},
	{
		icon: '👣',
		iconBg: '#FAEAEE',
		title: '胎动记录提醒',
		subtitle: '9:00 / 14:00 / 21:00 提醒',
		toggle: false,
		action: 'fetalReminder'
	},
	{
		icon: '🔒',
		iconBg: '#F2F0EE',
		title: '隐私与数据',
		subtitle: '数据导出 · 账号注销',
		action: 'privacy'
	},
	{
		icon: 'ℹ️',
		iconBg: '#F2F0EE',
		title: '关于孕途伴侣',
		subtitle: '版本 v1.0.0',
		action: 'about'
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
	height: 120rpx;
}
</style>
