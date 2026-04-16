<template>
	<view class="page">
		<!-- Hero 区域 -->
		<HomeHero
			:greeting="greeting"
			:weekInfo="healthStore.todayWeekInfo.value || { week: 0, day: 0, total: 0 }"
			:daysUntilDue="healthStore.daysUntilDue.value"
			:fruitComparison="healthStore.fruitComparison.value"
			@tapAvatar="goProfile"
		/>

		<!-- 可滚动内容区 -->
		<scroll-view scroll-y class="scroll-content" @scrolltolower="onScrollBottom">
			<!-- 每日变化卡片 -->
			<DailyChanges
				:weekInfo="healthStore.todayWeekInfo.value"
				:selectedDate="selectedDate"
				:healthStore="healthStore"
			/>

			<!-- 本周指南卡片 -->
			<WeeklyGuideCard
				:weekInfo="healthStore.todayWeekInfo.value || { week: 0, day: 0, total: 0 }"
				:daysUntilDue="healthStore.daysUntilDue.value"
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

			<view class="bottom-spacer"></view>
		</scroll-view>

		<!-- 记录编辑弹窗 -->
		<RecordEditSheet
			:visible="editVisible"
			:mode="editMode"
			:record="currentRecord"
			:selectedDate="selectedDate"
			:lmpDate="healthStore.lmpDate"
			@update:visible="editVisible = $event"
			@save="handleSave"
		/>
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

const selectedDate = ref(new Date())
const editVisible = ref(false)
const editMode = ref('weight')

const greeting = computed(() => healthStore.getGreeting())

const currentRecord = computed(() => {
	return healthStore.getRecord(selectedDate.value) || {}
})

onMounted(() => {
	healthStore.loadRecords()
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
</style>
