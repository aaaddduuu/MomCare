<template>
	<view class="page">
		<!-- Loading 状态 -->
		<view v-if="loading" class="loading-container">
			<view class="loading-spinner"></view>
			<text class="loading-text">加载中...</text>
		</view>

		<!-- 主内容（加载完成后显示） -->
		<template v-else>
		<scroll-view scroll-y class="scroll-content" @scrolltolower="onScrollBottom">
			<!-- Hero 区域 -->
			<HomeHero
				:greeting="greeting"
				:weekInfo="healthStore.todayWeekInfo || { week: 0, day: 0, total: 0 }"
				:daysUntilDue="healthStore.daysUntilDue"
				:fruitComparison="healthStore.fruitComparison"
				:pregInfoSet="healthStore.pregInfoSet"
				@tapAvatar="goProfile"
			/>

			<template v-if="healthStore.pregInfoSet">
				<!-- 每日变化卡片 -->
				<DailyChanges
					:weekInfo="healthStore.todayWeekInfo"
					:selectedDate="selectedDate"
					:healthStore="healthStore"
				/>

				<!-- 本周指南卡片 -->
				<WeeklyGuideCard
					:weekInfo="healthStore.todayWeekInfo || { week: 0, day: 0, total: 0 }"
					:daysUntilDue="healthStore.daysUntilDue"
					@tapCard="goWeeklyGuide"
				/>

				<!-- 孕期日历 -->
				<PregnancyCalendar
					:lmpDate="healthStore.lmpDate"
					:dueDate="healthStore.dueDate"
					:hasRecord="healthStore.hasRecord"
					:selectedDate="selectedDate"
					@selectDate="onSelectDate"
				/>

				<!-- 每日记录面板 -->
				<DayRecordPanel
					:selectedDate="selectedDate"
					:record="currentRecord"
					:lmpDate="healthStore.lmpDate"
					@edit="openEdit"
				/>
			</template>

			<view class="bottom-spacer"></view>
		</scroll-view>

		<!-- 记录编辑弹窗 -->
		<RecordEditSheet
			v-if="healthStore.pregInfoSet"
			:visible="editVisible"
			:mode="editMode"
			:record="currentRecord"
			:selectedDate="selectedDate"
			:lmpDate="healthStore.lmpDate"
			@update:visible="editVisible = $event"
			@save="handleSave"
		/>
		</template>
	</view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useHealthStore } from '@/stores/health.js'
import HomeHero from '@/components/home/HomeHero.vue'
import DailyChanges from '@/components/home/DailyChanges.vue'
import WeeklyGuideCard from '@/components/home/WeeklyGuideCard.vue'
import PregnancyCalendar from '@/components/common/PregnancyCalendar.vue'
import DayRecordPanel from '@/components/home/DayRecordPanel.vue'
import RecordEditSheet from '@/components/home/RecordEditSheet.vue'

const healthStore = useHealthStore()

const loading = ref(true)
const selectedDate = ref(new Date())
const editVisible = ref(false)
const editMode = ref('weight')

const greeting = computed(() => healthStore.getGreeting())

const currentRecord = computed(() => {
	return healthStore.getRecord(selectedDate.value) || {}
})

onMounted(async () => {
	try {
		await healthStore.loadUserProfile()
		await healthStore.loadRecords()
	} catch (e) {
		console.error('首页数据加载失败:', e)
	} finally {
		loading.value = false
	}
})

function onSelectDate(date) {
	selectedDate.value = new Date(date)
}

function openEdit(mode) {
	editMode.value = mode
	editVisible.value = true
}

function handleSave(data) {
	healthStore.saveRecord(selectedDate.value, data)
}

function goProfile() {
	uni.switchTab({
		url: '/pages/profile/index'
	})
}

function goWeeklyGuide() {
	// 跳转到知识库对应的孕周文章
	uni.switchTab({
		url: '/pages/knowledge/index'
	})
}

function onScrollBottom() {
	// 预留加载更多
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

.bottom-spacer {
	height: 120rpx;
}

/* ── Loading ── */
.loading-container {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	height: 100vh;
	background-color: #FBF7F2;
}

.loading-spinner {
	width: 64rpx;
	height: 64rpx;
	border: 6rpx solid #F2F0EE;
	border-top-color: #C45070;
	border-radius: 50%;
	animation: spin 0.8s linear infinite;
	margin-bottom: 24rpx;
}

@keyframes spin {
	to { transform: rotate(360deg); }
}

.loading-text {
	font-size: 28rpx;
	color: #9C9890;
}
</style>
