<template>
	<view class="page-container">
		<!-- Header -->
		<view class="header-bar">
			<text class="header-title">产检档案</text>
			<view class="fab-btn" @tap="handleQuickArchive">
				<text class="fab-icon">+</text>
				<text class="fab-text">快速归档</text>
			</view>
		</view>

		<!-- Tabs -->
		<view class="tab-bar">
			<view class="tab-item" :class="{ 'tab-active': activeTab === 'timeline' }" @tap="switchTab('timeline')">
				<text class="tab-text">已归档</text>
				<text v-if="analyzedCount > 0" class="tab-count">{{ analyzedCount }}</text>
			</view>
			<view class="tab-item" :class="{ 'tab-active': activeTab === 'unclassified' }" @tap="switchTab('unclassified')">
				<text class="tab-text">待分类</text>
				<text v-if="unclassifiedCount > 0" class="tab-count count-pending">{{ unclassifiedCount }}</text>
			</view>
		</view>

		<!-- Filter Bar (Timeline tab only) -->
		<view v-if="activeTab === 'timeline'" class="filter-bar">
			<picker :range="typeLabels" @change="onTypeChange">
				<view class="filter-item">
					<text class="filter-label">{{ typeFilterText }}</text>
					<text class="filter-arrow">▼</text>
				</view>
			</picker>
			<picker :range="statusLabels" @change="onStatusChange">
				<view class="filter-item">
					<text class="filter-label">{{ statusFilterText }}</text>
					<text class="filter-arrow">▼</text>
				</view>
			</picker>
			<picker mode="date" fields="month" @change="onDateChange">
				<view class="filter-item">
					<text class="filter-label">{{ dateFilterText }}</text>
					<text class="filter-arrow">📅</text>
				</view>
			</picker>
		</view>

		<!-- Loading State -->
		<view v-if="isLoading" class="loading-state">
			<view class="spinner"></view>
			<text class="loading-text">加载档案中...</text>
		</view>

		<!-- ====== TIMELINE TAB ====== -->
		<template v-else-if="activeTab === 'timeline'">
			<view v-if="analyzedList.length === 0" class="empty-state">
				<text class="empty-icon">📋</text>
				<text class="empty-title">暂无已解读档案</text>
				<text class="empty-subtitle">上传报告并使用 AI 解读后，将在此处展示</text>
			</view>
			<view v-else class="timeline">
				<view v-for="(report, index) in analyzedList" :key="report._id" class="timeline-item">
					<view class="timeline-node">
						<view class="timeline-dot" :class="report.is_abnormal ? 'dot-abnormal' : 'dot-normal'"></view>
						<view v-if="index < analyzedList.length - 1" class="timeline-line"></view>
					</view>
					<view class="timeline-card" @tap="goToDetail(report._id)">
						<view class="card-header">
							<view class="card-left">
								<text class="card-icon">{{ getReportIcon(report.report_type) }}</text>
								<view class="card-info">
									<text class="card-title">{{ report.report_name || getReportTypeName(report.report_type) }}</text>
									<text class="card-date">{{ formatDate(report.create_time) }}</text>
								</view>
							</view>
							<view class="card-right">
								<view class="card-badge" :class="report.is_abnormal ? 'badge-abnormal' : 'badge-normal'">
									<text class="badge-dot"></text>
									<text class="badge-text">{{ report.is_abnormal ? '异常' : '正常' }}</text>
								</view>
								<text class="card-arrow">›</text>
							</view>
						</view>
						<view v-if="report.ai_result?.abnormal_indicators?.length" class="card-preview">
							<view v-for="(ind, i) in report.ai_result.abnormal_indicators.slice(0, 2)" :key="i" class="preview-item">
								<text class="preview-label">{{ ind.name }}</text>
								<text class="preview-value" :class="ind.severity === 'danger' ? 'value-danger' : ind.severity === 'warning' ? 'value-warning' : 'value-normal'">{{ ind.value }}</text>
							</view>
						</view>
					</view>
				</view>
			</view>
		</template>

		<!-- ====== TO CLASSIFY TAB ====== -->
		<template v-else-if="activeTab === 'unclassified'">
			<view v-if="unclassList.length === 0" class="empty-state">
				<text class="empty-icon">📸</text>
				<text class="empty-title">全部报告已归档</text>
				<text class="empty-subtitle">点击上方「快速归档」按钮添加新报告</text>
			</view>
			<view v-else class="classify-list">
				<view v-for="report in unclassList" :key="report._id" class="classify-card" @tap="goToClassify(report._id)">
					<image v-if="report.thumbUrl" :src="report.thumbUrl" class="classify-thumb" mode="aspectFill"></image>
					<view v-else class="classify-thumb-placeholder">
						<text class="thumb-icon">📄</text>
					</view>
					<view class="classify-info">
						<text class="classify-title">待归档报告</text>
						<text class="classify-date">{{ formatDate(report.create_time) }}</text>
					</view>
					<view class="classify-action" @tap.stop="goToClassify(report._id)">
						<text class="classify-btn-text">📝 立即分类</text>
					</view>
				</view>
			</view>
		</template>

		<view class="bottom-spacer"></view>
	</view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'

const activeTab = ref('timeline')
const isLoading = ref(false)
const allReports = ref([])

// Filters
const typeFilter = ref('all')
const statusFilter = ref('all')
const dateFilter = ref('') // YYYY-MM

const typeOptions = [
	{ value: 'all', label: '全部类型' },
	{ value: 'blood_routine', label: '血常规' },
	{ value: 'urine_routine', label: '尿常规' },
	{ value: 'down_screening', label: '唐氏筛查' },
	{ value: 'glucose_tolerance', label: '糖耐量' },
	{ value: 'ultrasound', label: 'B超' },
	{ value: 'other', label: '其他' }
]

const statusOptions = [
	{ value: 'all', label: '全部状态' },
	{ value: 'abnormal', label: '异常' },
	{ value: 'normal', label: '正常' }
]

// Plain text arrays for native <picker> (no emoji)
const typeLabels = typeOptions.map(o => o.label)
const statusLabels = statusOptions.map(o => o.label)

const typeFilterText = computed(() => typeOptions.find(o => o.value === typeFilter.value)?.label || '全部类型')
const statusFilterText = computed(() => statusOptions.find(o => o.value === statusFilter.value)?.label || '全部状态')
const dateFilterText = computed(() => dateFilter.value || '选择月份')

// Computed lists
const analyzedList = computed(() => {
	let list = allReports.value.filter(r => r.ai_status === 'completed' || r.ai_status === 'manual')
	if (typeFilter.value !== 'all') {
		list = list.filter(r => r.report_type === typeFilter.value)
	}
	if (statusFilter.value === 'abnormal') {
		list = list.filter(r => r.is_abnormal)
	} else if (statusFilter.value === 'normal') {
		list = list.filter(r => !r.is_abnormal)
	}
	if (dateFilter.value) {
		const [year, month] = dateFilter.value.split('-').map(Number)
		list = list.filter(r => {
			const d = new Date(r.create_time)
			return d.getFullYear() === year && (d.getMonth() + 1) === month
		})
	}
	return list
})

const unclassList = computed(() => allReports.value.filter(r => r.ai_status !== 'completed' && r.ai_status !== 'manual'))
const analyzedCount = computed(() => allReports.value.filter(r => r.ai_status === 'completed' || r.ai_status === 'manual').length)
const unclassifiedCount = computed(() => allReports.value.filter(r => r.ai_status !== 'completed' && r.ai_status !== 'manual').length)

onShow(() => { loadArchives() })

const loadArchives = async () => {
	isLoading.value = true
	try {
		const db = uniCloud.database()
		const res = await db.collection('momcare_reports').orderBy('create_time', 'desc').get()
		const data = res.result.data || []

		// Resolve thumbnail URLs for unclassified items
		const fileIDs = data.filter(r => r.ai_status !== 'completed' && r.file_urls?.[0]).map(r => r.file_urls[0])
		if (fileIDs.length) {
			try {
				const urlRes = await uniCloud.getTempFileURL({ fileList: fileIDs })
				const urlMap = {}
				;(urlRes.fileList || []).forEach(f => { urlMap[f.fileID] = f.tempFileURL })
				data.forEach(r => {
					if (r.file_urls?.[0] && urlMap[r.file_urls[0]]) {
						r.thumbUrl = urlMap[r.file_urls[0]]
					}
				})
			} catch (e) { console.error('Thumb URL error:', e) }
		}

		allReports.value = data
	} catch (error) {
		console.error('Failed to load archives:', error)
		uni.showToast({ title: '加载档案失败', icon: 'none' })
	} finally {
		isLoading.value = false
	}
}

const switchTab = (tab) => { activeTab.value = tab }

const handleQuickArchive = () => {
	uni.chooseMedia({
		count: 9, mediaType: ['image'], sourceType: ['album', 'camera'],
		success: async (res) => {
			const files = res.tempFiles
			if (!files?.length) return
			uni.showLoading({ title: '归档中...', mask: true })
			try {
				const db = uniCloud.database()
				for (const file of files) {
					const upRes = await uniCloud.uploadFile({
						filePath: file.tempFilePath,
						cloudPath: `medical_reports/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`
					})
					await db.collection('momcare_reports').add({
						user_id: '', report_type: 'other', report_name: '待归档报告',
						file_urls: [upRes.fileID], file_type: 'image',
						ocr_status: 'none', ai_status: 'none',
						is_abnormal: false, create_time: Date.now()
					})
				}
				uni.hideLoading()
				uni.showToast({ title: `已归档 ${files.length} 份报告`, icon: 'success' })
				await loadArchives()
				activeTab.value = 'unclassified'
			} catch (error) {
				uni.hideLoading()
				uni.showToast({ title: '归档失败', icon: 'none' })
			}
		}
	})
}

// Navigation
const goToDetail = (id) => { uni.navigateTo({ url: `/pages/reports/detail?id=${id}` }) }
const goToClassify = (id) => { uni.navigateTo({ url: `/pages/reports/classify?id=${id}` }) }

// Filter actions (driven by native <picker> components)
const onTypeChange = (e) => {
	const idx = e.detail.value
	typeFilter.value = typeOptions[idx].value
}
const onStatusChange = (e) => {
	const idx = e.detail.value
	statusFilter.value = statusOptions[idx].value
}
const onDateChange = (e) => {
	dateFilter.value = e.detail.value || ''
}

// Utilities
const getReportIcon = (t) => ({ blood_routine:'🩸', urine_routine:'💧', down_screening:'🧬', glucose_tolerance:'🍬', ultrasound:'🔬', nt_ultrasound:'🔬', anomaly_ultrasound:'🔬', cardiotocography:'💓', other:'📄' })[t] || '📄'
const getReportTypeName = (t) => ({ blood_routine:'血常规检查', urine_routine:'尿常规检查', down_screening:'唐氏筛查', glucose_tolerance:'糖耐量检查', ultrasound:'B超检查', nt_ultrasound:'NT检查', anomaly_ultrasound:'大排畸检查', cardiotocography:'胎心监护', other:'其他检查' })[t] || t || '产检报告'
const formatDate = (v) => {
	if (!v) return ''
	const d = new Date(v)
	return `${d.getFullYear()}年${String(d.getMonth()+1).padStart(2,'0')}月${String(d.getDate()).padStart(2,'0')}日`
}
</script>

<style scoped lang="scss">
.page-container { min-height: 100vh; background-color: #F5F7FA; }

/* Header */
.header-bar { display: flex; align-items: center; justify-content: space-between; padding: 32rpx 32rpx 16rpx; }
.header-title { font-size: 40rpx; font-weight: 700; color: #191C1E; }
.fab-btn { display: flex; align-items: center; gap: 8rpx; background: linear-gradient(135deg, #C2185B, #E91E63); padding: 16rpx 28rpx; border-radius: 48rpx; box-shadow: 0 4rpx 16rpx rgba(194,24,91,.25); }
.fab-icon { font-size: 32rpx; color: #FFF; font-weight: 600; }
.fab-text { font-size: 26rpx; color: #FFF; font-weight: 500; }

/* Tabs */
.tab-bar { display: flex; padding: 0 32rpx; gap: 16rpx; margin-bottom: 16rpx; }
.tab-item { display: flex; align-items: center; gap: 8rpx; padding: 16rpx 28rpx; border-radius: 48rpx; background-color: #FFFFFF; transition: all .2s; }
.tab-item.tab-active { background: linear-gradient(135deg, #C2185B, #E91E63); }
.tab-text { font-size: 28rpx; font-weight: 500; color: #757575; }
.tab-item.tab-active .tab-text { color: #FFF; }
.tab-count { font-size: 22rpx; font-weight: 600; color: #C2185B; background: #FCE7F3; padding: 2rpx 12rpx; border-radius: 20rpx; min-width: 32rpx; text-align: center; }
.tab-item.tab-active .tab-count { color: #FFF; background: rgba(255,255,255,.25); }
.count-pending { color: #FF9800; background: #FFF3E0; }
.tab-item.tab-active .count-pending { color: #FFF; background: rgba(255,255,255,.25); }

/* Filter Bar */
.filter-bar { display: flex; gap: 16rpx; padding: 0 32rpx 16rpx; }
.filter-item { display: flex; align-items: center; gap: 6rpx; background: #FFF; padding: 12rpx 20rpx; border-radius: 24rpx; }
.filter-label { font-size: 24rpx; color: #757575; }
.filter-arrow { font-size: 20rpx; color: #BDBDBD; }

/* Loading */
.loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 50vh; }
.spinner { width: 64rpx; height: 64rpx; border: 6rpx solid #E8EAED; border-top-color: #C2185B; border-radius: 50%; animation: spin .8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.loading-text { font-size: 28rpx; color: #9E9E9E; margin-top: 24rpx; }

/* Empty */
.empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 50vh; }
.empty-icon { font-size: 120rpx; margin-bottom: 24rpx; opacity: .5; }
.empty-title { font-size: 36rpx; font-weight: 600; color: #191C1E; margin-bottom: 12rpx; }
.empty-subtitle { font-size: 28rpx; color: #9E9E9E; text-align: center; }

/* Timeline */
.timeline { display: flex; flex-direction: column; padding: 0 32rpx; }
.timeline-item { display: flex; }
.timeline-node { display: flex; flex-direction: column; align-items: center; width: 48rpx; flex-shrink: 0; }
.timeline-dot { width: 24rpx; height: 24rpx; border-radius: 50%; border: 4rpx solid #FFF; flex-shrink: 0; z-index: 1; }
.dot-normal { background-color: #66BB6A; box-shadow: 0 0 0 4rpx #E8F5E9; }
.dot-abnormal { background-color: #EF5350; box-shadow: 0 0 0 4rpx #FFEBEE; }
.timeline-line { width: 4rpx; flex: 1; background-color: #E0E0E0; min-height: 40rpx; }
.timeline-card { flex: 1; background-color: #FFF; border-radius: 24rpx; padding: 28rpx; margin-left: 20rpx; margin-bottom: 24rpx; }
.card-header { display: flex; align-items: center; justify-content: space-between; }
.card-left { display: flex; align-items: center; flex: 1; }
.card-icon { font-size: 40rpx; margin-right: 16rpx; }
.card-info { display: flex; flex-direction: column; }
.card-title { font-size: 30rpx; font-weight: 500; color: #191C1E; margin-bottom: 6rpx; }
.card-date { font-size: 24rpx; color: #9E9E9E; }
.card-right { display: flex; align-items: center; gap: 8rpx; }
.card-badge { display: flex; align-items: center; gap: 6rpx; padding: 6rpx 14rpx; border-radius: 16rpx; }
.badge-normal { background-color: #E8F5E9; }
.badge-abnormal { background-color: #FFEBEE; }
.badge-dot { width: 10rpx; height: 10rpx; border-radius: 50%; }
.badge-normal .badge-dot { background-color: #66BB6A; }
.badge-abnormal .badge-dot { background-color: #EF5350; }
.badge-text { font-size: 22rpx; font-weight: 500; }
.badge-normal .badge-text { color: #66BB6A; }
.badge-abnormal .badge-text { color: #EF5350; }
.card-arrow { font-size: 32rpx; color: #BDBDBD; margin-left: 4rpx; }
.card-preview { display: flex; gap: 16rpx; margin-top: 20rpx; padding-top: 20rpx; border-top: 1rpx solid rgba(0,0,0,.05); }
.preview-item { flex: 1; display: flex; flex-direction: column; align-items: center; background-color: #F5F7FA; border-radius: 12rpx; padding: 12rpx; }
.preview-label { font-size: 22rpx; color: #9E9E9E; margin-bottom: 6rpx; }
.preview-value { font-size: 26rpx; font-weight: 500; color: #191C1E; }
.value-normal { color: #66BB6A; }
.value-warning { color: #FFA726; }
.value-danger { color: #EF5350; }

/* Classify List (To Classify tab) */
.classify-list { display: flex; flex-direction: column; gap: 16rpx; padding: 0 32rpx; }
.classify-card { display: flex; align-items: center; background-color: #FFF; border-radius: 24rpx; padding: 20rpx; gap: 20rpx; }
.classify-thumb { width: 120rpx; height: 120rpx; border-radius: 16rpx; flex-shrink: 0; }
.classify-thumb-placeholder { width: 120rpx; height: 120rpx; border-radius: 16rpx; flex-shrink: 0; background-color: #F5F7FA; display: flex; align-items: center; justify-content: center; }
.thumb-icon { font-size: 48rpx; opacity: .5; }
.classify-info { flex: 1; display: flex; flex-direction: column; }
.classify-title { font-size: 30rpx; font-weight: 500; color: #191C1E; margin-bottom: 6rpx; }
.classify-date { font-size: 24rpx; color: #9E9E9E; }
.classify-action { flex-shrink: 0; background: linear-gradient(135deg, #C2185B, #E91E63); padding: 14rpx 24rpx; border-radius: 24rpx; }
.classify-btn-text { font-size: 24rpx; color: #FFF; font-weight: 500; white-space: nowrap; }

.bottom-spacer { height: 120rpx; }
</style>
