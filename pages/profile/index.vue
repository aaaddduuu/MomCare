<template>
	<view class="page">
		<!-- Hero 区域 -->
		<ProfileHero
			:userInfo="healthStore.userInfo"
			:weekInfo="healthStore.todayWeekInfo.value || { week: 0, day: 0, total: 0 }"
			:daysUntilDue="healthStore.daysUntilDue.value"
			:totalPregDays="healthStore.totalPregDays.value"
			:progressPercent="healthStore.progressPercent.value"
		/>

		<!-- 滚动区域 -->
		<scroll-view scroll-y class="scroll-content">
			<!-- 倒计时环 -->
			<view class="section-card">
				<DueCountdownRing
					:daysUntilDue="healthStore.daysUntilDue.value"
					:progressPercent="healthStore.progressPercent.value"
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
const recordItems = computed(() => [
	{
		icon: '⚖️',
		iconBg: '#FAEAEE',
		title: '体重记录',
		subtitle: '最新 62.5kg · 孕期增重 +8.5kg',
		badge: '42条',
		action: 'weightRecords'
	},
	{
		icon: '💗',
		iconBg: '#EBF2FB',
		title: '血压记录',
		subtitle: '最新 118/76 · 血压正常',
		badge: '28条',
		action: 'bpRecords'
	},
	{
		icon: '👣',
		iconBg: '#EAF2EE',
		title: '胎动记录',
		subtitle: '今日 0次 · 昨日 18次',
		badge: '56条',
		action: 'fetalRecords'
	},
	{
		icon: '📁',
		iconBg: '#FDF3E3',
		title: '产检档案',
		subtitle: '共 11 份报告 · 3份 AI 解读中',
		badge: '11份',
		action: 'archives'
	}
])

// 待办 & 提醒
const todoItems = computed(() => [
	{
		icon: '🗓',
		iconBg: '#FAEAEE',
		title: '下次产检',
		subtitle: '4月20日 · 还有 7 天',
		badge: '7天后',
		badgeStyle: 'amber',
		action: 'nextCheckup'
	},
	{
		icon: '🎒',
		iconBg: '#EEE8FA',
		title: '待产包清单',
		subtitle: '已完成 12 / 28 项',
		action: 'hospitalBag'
	},
	{
		icon: '📋',
		iconBg: '#EAF7EF',
		title: '今日计划',
		subtitle: '产检 · 练习呼吸法 · 整理报告',
		action: 'dailyPlan'
	}
])

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
	console.log('Navigate to:', item.action)
}

function handleRecordTap(item) {
	if (item.action === 'archives') {
		uni.switchTab({ url: '/pages/archives/index' })
	}
}

function handleTodoTap(item) {
	console.log('Navigate to:', item.action)
}

function handleSettingTap(item) {
	if (item.action === 'privacy') {
		uni.navigateTo({ url: '/pages/profile/privacy' })
	} else if (item.action === 'about') {
		uni.navigateTo({ url: '/pages/profile/about' })
	}
}

function handleToggle(idx) {
	settingItems[idx].toggle = !settingItems[idx].toggle
}
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
