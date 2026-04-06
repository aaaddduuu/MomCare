<template>
	<view class="page-container">
		<!-- Page Header -->
		<view class="page-header">
			<text class="page-title">报告管家</text>
			<text class="page-subtitle">AI 智能解读您的产检报告</text>
		</view>

		<!-- Hero Action Area: Upload Card -->
		<view class="upload-hero-card" @tap="handleUploadReport">
			<view class="upload-icon-wrapper">
				<text class="upload-icon">📄</text>
			</view>
			<view class="upload-content">
				<text class="upload-title">上传产检报告</text>
				<text class="upload-subtitle">支持图片 / PDF 格式</text>
			</view>
			<view class="upload-action">
				<text class="upload-action-text">立即上传</text>
				<text class="upload-arrow">→</text>
			</view>
		</view>

		<!-- Report List Header -->
		<view class="list-header">
			<text class="list-title">报告档案</text>
			<view class="list-filter" @tap="handleFilterSelect">
				<text class="filter-text">{{ currentFilterText }}</text>
				<text class="filter-arrow">▼</text>
			</view>
		</view>

		<!-- Report List -->
		<view class="report-list">
			<!-- Empty State -->
			<view v-if="reportList.length === 0 && !isLoadingReports" class="empty-state">
				<text class="empty-icon">📋</text>
				<text class="empty-title">暂无报告记录</text>
				<text class="empty-subtitle">上传产检报告，AI 智能解读</text>
			</view>

			<!-- Loading State -->
			<view v-if="isLoadingReports" class="loading-state">
				<text class="loading-text">加载中...</text>
			</view>

			<!-- Dynamic Report Cards -->
			<view
				v-for="report in reportList"
				:key="report._id"
				class="report-card"
				@tap="viewReportDetail(report)"
			>
				<view class="report-header">
					<view class="report-type-wrapper">
						<text class="report-type-icon">{{ getReportIcon(report.report_type) }}</text>
						<view class="report-type-info">
							<text class="report-title">{{ report.report_name || getReportTypeName(report.report_type) }}</text>
							<text class="report-date">{{ formatDate(report.create_time) }}</text>
						</view>
					</view>
					<view class="report-status-wrapper">
						<view
							class="status-badge"
							:class="getReportStatusClass(report)"
						>
							<text class="status-dot"></text>
							<text class="status-text">{{ getReportStatusText(report) }}</text>
						</view>
					</view>
				</view>

				<!-- Report Preview - Show key indicators from AI result -->
				<view v-if="report.ai_result && report.ai_result.indicators && report.ai_result.indicators.length > 0" class="report-preview">
					<view
						v-for="(indicator, index) in report.ai_result.indicators.slice(0, 3)"
						:key="index"
						class="preview-item"
						:class="{ 'abnormal-item': indicator.severity === 'warning' || indicator.severity === 'danger' }"
					>
						<text class="preview-label">{{ indicator.name }}</text>
						<text
							class="preview-value"
							:class="{
								'abnormal-value': indicator.severity === 'danger',
								'warning-value': indicator.severity === 'warning',
								'normal-value': indicator.severity === 'normal'
							}"
						>{{ indicator.value }}</text>
					</view>
				</view>

				<view class="report-footer">
					<view class="ai-status" :class="report.ai_status === 'completed' ? 'analyzed' : 'pending'">
						<text class="ai-icon">{{ report.ai_status === 'completed' ? '✨' : '⏳' }}</text>
						<text class="ai-text">{{ report.ai_status === 'completed' ? 'AI 已解读' : '待解读' }}</text>
					</view>
					<text class="report-action">查看详情 →</text>
				</view>
			</view>
		</view>

		<!-- AI Interpretation Result Modal -->
		<view v-if="aiReportResult" class="ai-result-modal" @tap="closeAiResult">
			<view class="ai-result-card" @tap.stop>
				<view class="ai-result-header">
					<view class="ai-result-title-wrapper">
						<text class="ai-result-icon">🤖</text>
						<text class="ai-result-title">AI 医生解读结果</text>
					</view>
					<view class="ai-result-model">
						<text class="model-badge">{{ aiReportResult.llm_used === 'deepseek' ? 'DeepSeek' : aiReportResult.llm_used === 'qwen' ? '通义千问' : 'Kimi' }}</text>
					</view>
				</view>
				<scroll-view class="ai-result-content" scroll-y>
					<!-- Report Type -->
					<view class="result-section">
						<text class="result-section-title">报告类型</text>
						<text class="result-report-type">{{ aiReportResult.report_type }}</text>
					</view>

					<!-- Overall Summary -->
					<view class="result-section">
						<text class="result-section-title">整体评估</text>
						<text class="result-summary">{{ aiReportResult.overall_summary }}</text>
					</view>

					<!-- Normal Highlights -->
					<view v-if="aiReportResult.normal_highlights" class="result-section normal-section">
						<text class="result-section-title">✨ 正常亮点</text>
						<text class="result-highlights">{{ aiReportResult.normal_highlights }}</text>
					</view>

					<!-- Abnormal Indicators -->
					<view v-if="aiReportResult.abnormal_indicators && aiReportResult.abnormal_indicators.length > 0" class="result-section">
						<text class="result-section-title">指标详解</text>
						<view class="indicators-list">
							<view
								v-for="(indicator, index) in aiReportResult.abnormal_indicators"
								:key="index"
								class="indicator-item"
								:class="{ 'indicator-warning': indicator.severity === 'warning' || indicator.severity === 'danger' }"
							>
								<view class="indicator-header">
									<text class="indicator-name">{{ indicator.name }}</text>
									<view class="indicator-severity" :class="`severity-${indicator.severity}`">
										<text class="severity-text">{{ indicator.severity === 'normal' ? '正常' : indicator.severity === 'warning' ? '注意' : '异常' }}</text>
									</view>
								</view>
								<view class="indicator-values">
									<text class="indicator-value">{{ indicator.value }}</text>
									<text class="indicator-reference">参考: {{ indicator.reference_range }}</text>
								</view>
								<text class="indicator-explanation">{{ indicator.explanation }}</text>
							</view>
						</view>
					</view>

					<!-- Action Suggestions -->
					<view v-if="aiReportResult.action_suggestions && aiReportResult.action_suggestions.length > 0" class="result-section">
						<text class="result-section-title">建议</text>
						<view class="suggestions-list">
							<view
								v-for="(suggestion, index) in aiReportResult.action_suggestions"
								:key="index"
								class="suggestion-item"
							>
								<text class="suggestion-bullet">{{ index + 1 }}</text>
								<text class="suggestion-text">{{ suggestion }}</text>
							</view>
						</view>
					</view>

					<!-- Disclaimer -->
					<view class="result-disclaimer">
						<text class="disclaimer-icon">⚠️</text>
						<text class="disclaimer-text">{{ aiReportResult.disclaimer }}</text>
					</view>
				</scroll-view>
				<view class="ai-result-footer">
					<text class="close-btn" @tap="closeAiResult">关闭</text>
				</view>
			</view>
		</view>

		<!-- AI Disclaimer -->
		<view class="disclaimer-card">
			<text class="disclaimer-icon">⚠️</text>
			<text class="disclaimer-text">以上内容由 AI 生成，仅供参考，不构成医疗建议。具体情况请以主治医生意见为准。</text>
		</view>

		<!-- Bottom Spacer for TabBar -->
		<view class="bottom-spacer"></view>
	</view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'

// Default AI Model (hidden from UI, using DeepSeek by default)
const DEFAULT_MODEL = 'deepseek'

// Report List (loaded from database)
const reportList = ref([])
const isLoadingReports = ref(false)

// AI Analysis Result
const aiReportResult = ref(null)

// Filter State
const currentFilter = ref('all')
const filterOptions = [
	{ value: 'all', label: '全部报告' },
	{ value: 'abnormal', label: '⚠️ 异常报告' },
	{ value: 'lab', label: '🩸 检验化验' },
	{ value: 'ultrasound', label: '🔬 B超影像' }
]

const currentFilterText = computed(() => {
	const option = filterOptions.find(o => o.value === currentFilter.value)
	return option?.label || '全部报告'
})

// Load reports from database on page show
onShow(() => {
	loadReports()
})

// Handle filter selection
const handleFilterSelect = () => {
	uni.showActionSheet({
		itemList: filterOptions.map(o => o.label),
		success: (res) => {
			const selected = filterOptions[res.tapIndex]
			currentFilter.value = selected.value
			loadReports() // 选中后重新拉取数据
		}
	})
}

// Load reports from uniCloud database with filter
const loadReports = async () => {
	isLoadingReports.value = true
	try {
		const db = uniCloud.database()
		const cmd = db.command

		let query = db.collection('momcare_reports')

		// Apply filter based on currentFilter.value
		if (currentFilter.value === 'abnormal') {
			// 只查异常的
			query = query.where({ is_abnormal: true })
		} else if (currentFilter.value === 'lab') {
			// 用 cmd.in 匹配所有化验类
			query = query.where({
				report_type: cmd.in(['blood_routine', '尿常规', 'urine_routine', 'glucose_tolerance', 'down_screening'])
			})
		} else if (currentFilter.value === 'ultrasound') {
			// 用 cmd.in 匹配所有B超类
			query = query.where({
				report_type: cmd.in(['ultrasound', 'B超', 'nt_ultrasound', 'anomaly_ultrasound'])
			})
		}

		const res = await query
			.orderBy('create_time', 'desc')
			.get()

		console.log('Loaded reports:', res.result.data)
		reportList.value = res.result.data || []
	} catch (error) {
		console.error('Failed to load reports:', error)
		uni.showToast({ title: '加载报告失败', icon: 'none' })
	} finally {
		isLoadingReports.value = false
	}
}
// Save report to database after successful AI analysis
const saveReportToDatabase = async (aiData, fileID, ocrText) => {
	try {
		const db = uniCloud.database()
		const doc = {
			user_id: '', // Will be auto-filled by uniCloud based on logged-in user
			report_type: aiData.report_type || 'other',
			report_name: aiData.report_type || '产检报告',
			file_urls: [fileID],
			file_type: 'image',
			ocr_status: 'completed',
			ocr_text: ocrText,
			ai_status: 'completed',
			llm_used: aiData.llm_used || DEFAULT_MODEL,
			ai_result: {
				report_type: aiData.report_type,
				overall_summary: aiData.overall_summary,
				normal_highlights: aiData.normal_highlights,
				abnormal_indicators: aiData.abnormal_indicators || [],
				action_suggestions: aiData.action_suggestions || [],
				disclaimer: aiData.disclaimer
			},
			abnormal_indicators: aiData.abnormal_indicators || [],
			is_abnormal: aiData.abnormal_indicators?.some(i => i.severity === 'warning' || i.severity === 'danger') || false,
			create_time: Date.now() // 重点修复：加入时间戳，支持列表倒序
		}

		const res = await db.collection('momcare_reports').add(doc)
		console.log('Report saved to database:', res)
		
		// 重新加载列表，让新数据出现在底部档案中
		await loadReports()
		return res
	} catch (error) {
		console.error('Failed to save report:', error)
		uni.showToast({ title: '保存历史记录失败', icon: 'none' })
	}
}

// View report detail - navigate to full detail page
const viewReportDetail = (report) => {
	uni.navigateTo({ url: `/pages/reports/detail?id=${report._id}` })
}

// Utilities
const getReportIcon = (reportType) => {
	const iconMap = {
		'blood_routine': '🩸', '尿常规': '💧', 'urine_routine': '💧',
		'down_screening': '🧬', 'glucose_tolerance': '🍬',
		'ultrasound': '🔬', 'nt_ultrasound': '🔬',
		'anomaly_ultrasound': '🔬', 'cardiotocography': '💓', 'other': '📄'
	}
	return iconMap[reportType] || '📄'
}

const getReportTypeName = (reportType) => {
	const nameMap = {
		'blood_routine': '血常规检查', 'urine_routine': '尿常规检查',
		'down_screening': '唐氏筛查', 'glucose_tolerance': '糖耐量检查',
		'ultrasound': 'B超检查', 'nt_ultrasound': 'NT检查',
		'anomaly_ultrasound': '大排畸检查', 'cardiotocography': '胎心监护', 'other': '其他检查'
	}
	return nameMap[reportType] || reportType || '产检报告'
}

const formatDate = (dateValue) => {
	if (!dateValue) return ''
	const date = new Date(dateValue)
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const day = String(date.getDate()).padStart(2, '0')
	const hour = String(date.getHours()).padStart(2, '0')
	const minute = String(date.getMinutes()).padStart(2, '0')
	return `${year}年${month}月${day}日 ${hour}:${minute}`
}

const getReportStatusClass = (report) => {
	if (report.is_abnormal) return 'abnormal-badge'
	if (report.ai_result?.abnormal_indicators?.some(i => i.severity === 'warning')) return 'warning-badge'
	return 'normal-badge'
}

const getReportStatusText = (report) => {
	if (report.is_abnormal) return '异常'
	if (report.ai_result?.abnormal_indicators?.some(i => i.severity === 'warning')) return '注意'
	return '正常'
}

// Handle Upload Report - Complete flow
const handleUploadReport = async () => {
	uni.chooseMedia({
		count: 1,
		mediaType: ['image'],
		sourceType: ['album', 'camera'],
		success: async (res) => {
			const tempFilePath = res.tempFiles[0].tempFilePath
			uni.showLoading({ title: '图片上传中...', mask: true })

			try {
				const uploadRes = await uniCloud.uploadFile({
					filePath: tempFilePath,
					cloudPath: `medical_reports/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`
				})
				const fileID = uploadRes.fileID

				uni.showLoading({ title: 'AI 提取排版中...', mask: true })
				const ocrRes = await uniCloud.callFunction({
					name: 'extractReportOCR',
					data: { fileID: fileID }
				})

				if (ocrRes.result.errCode !== 0) throw new Error(ocrRes.result.errMsg || 'OCR 提取失败')

				const realOcrText = ocrRes.result.data.text
				await handleAnalyzeReportWithText(realOcrText, fileID)

			} catch (error) {
				uni.hideLoading()
				console.error('Upload error:', error)
				uni.showToast({ title: error.message || '上传失败，请重试', icon: 'none' })
			}
		},
		fail: () => {}
	})
}

// Handle AI Analysis
const handleAnalyzeReportWithText = async (ocrText, fileID = null) => {
	uni.showLoading({ title: 'AI 医生解读中...', mask: true })
	try {
		const res = await uniCloud.callFunction({
			name: 'analyzeReportAI',
			data: { ocrText: ocrText, modelChoice: DEFAULT_MODEL }
		})
		uni.hideLoading()

		if (res.result.errCode === 0) {
			aiReportResult.value = { ...res.result.data, imageUrl: fileID }
			
			// 解读成功后，调用我们上面写的存储方法
			if (fileID) await saveReportToDatabase(res.result.data, fileID, ocrText)
			
			uni.showToast({ title: '解读完成', icon: 'success' })
		} else {
			uni.showToast({ title: res.result.errMsg || '解读失败', icon: 'none' })
		}
	} catch (error) {
		uni.hideLoading()
		console.error('AI analysis error:', error)
		uni.showToast({ title: '网络错误，请重试', icon: 'none' })
	}
}

const closeAiResult = () => {
	aiReportResult.value = null
}
</script>

<style scoped lang="scss">
/* Page Container */
.page-container {
	min-height: 100vh;
	background-color: #F5F7FA;
	padding: 0 32rpx 32rpx;
	overflow-x: hidden;
}

/* Page Header */
.page-header {
	padding: 48rpx 0 32rpx;
}

.page-title {
	display: block;
	font-size: 48rpx;
	font-weight: 600;
	color: #191C1E;
	line-height: 1.3;
	margin-bottom: 12rpx;
}

.page-subtitle {
	display: block;
	font-size: 28rpx;
	color: #757575;
	line-height: 1.5;
}

/* Hero Upload Card */
.upload-hero-card {
	background: linear-gradient(135deg, #C2185B 0%, #E91E63 100%);
	border-radius: 32rpx;
	padding: 48rpx 40rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 24rpx;
	box-shadow: 0 8rpx 32rpx rgba(194, 24, 91, 0.15);
}

.upload-icon-wrapper {
	width: 96rpx;
	height: 96rpx;
	background-color: rgba(255, 255, 255, 0.2);
	border-radius: 24rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.upload-icon {
	font-size: 48rpx;
}

.upload-content {
	flex: 1;
	margin-left: 24rpx;
}

.upload-title {
	display: block;
	font-size: 36rpx;
	font-weight: 600;
	color: #FFFFFF;
	margin-bottom: 8rpx;
}

.upload-subtitle {
	display: block;
	font-size: 24rpx;
	color: rgba(255, 255, 255, 0.8);
}

.upload-action {
	display: flex;
	align-items: center;
	gap: 8rpx;
	background-color: rgba(255, 255, 255, 0.2);
	padding: 16rpx 24rpx;
	border-radius: 48rpx;
}

.upload-action-text {
	font-size: 28rpx;
	font-weight: 500;
	color: #FFFFFF;
}

.upload-arrow {
	font-size: 28rpx;
	color: #FFFFFF;
}

/* List Header */
.list-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 24rpx;
}

.list-title {
	font-size: 36rpx;
	font-weight: 600;
	color: #191C1E;
}

.list-filter {
	display: flex;
	align-items: center;
	gap: 8rpx;
	background-color: #FFFFFF;
	padding: 12rpx 20rpx;
	border-radius: 24rpx;
}

.filter-text {
	font-size: 26rpx;
	color: #757575;
}

.filter-arrow {
	font-size: 20rpx;
	color: #9E9E9E;
}

/* Empty State */
.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 120rpx 32rpx;
	background-color: #FFFFFF;
	border-radius: 32rpx;
}

.empty-icon {
	font-size: 120rpx;
	margin-bottom: 24rpx;
	opacity: 0.5;
}

.empty-title {
	font-size: 32rpx;
	font-weight: 500;
	color: #191C1E;
	margin-bottom: 12rpx;
}

.empty-subtitle {
	font-size: 26rpx;
	color: #9E9E9E;
	text-align: center;
}

/* Loading State */
.loading-state {
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 80rpx 32rpx;
	background-color: #FFFFFF;
	border-radius: 32rpx;
}

.loading-text {
	font-size: 28rpx;
	color: #9E9E9E;
}

/* Report List */
.report-list {
	display: flex;
	flex-direction: column;
	gap: 16rpx;
}

.report-card {
	background-color: #FFFFFF;
	border-radius: 32rpx;
	padding: 32rpx;
}

/* Report Header */
.report-header {
	display: flex;
	justify-content: space-between;
	align-items: flex-start;
	margin-bottom: 24rpx;
}

.report-type-wrapper {
	display: flex;
	align-items: center;
	flex: 1;
}

.report-type-icon {
	font-size: 40rpx;
	margin-right: 16rpx;
}

.report-type-info {
	display: flex;
	flex-direction: column;
}

.report-title {
	font-size: 32rpx;
	font-weight: 500;
	color: #191C1E;
	margin-bottom: 8rpx;
}

.report-date {
	font-size: 24rpx;
	color: #9E9E9E;
}

.report-status-wrapper {
	display: flex;
	align-items: center;
}

.status-badge {
	display: flex;
	align-items: center;
	gap: 8rpx;
	padding: 8rpx 16rpx;
	border-radius: 20rpx;
}

.status-dot {
	width: 12rpx;
	height: 12rpx;
	border-radius: 50%;
}

/* Abnormal Badge - Soft Red */
.abnormal-badge {
	background-color: #FFEBEE;
}

.abnormal-badge .status-dot {
	background-color: #EF5350;
}

.abnormal-badge .status-text {
	color: #EF5350;
	font-size: 24rpx;
	font-weight: 500;
}

/* Normal Badge - Soft Green */
.normal-badge {
	background-color: #E8F5E9;
}

.normal-badge .status-dot {
	background-color: #66BB6A;
}

.normal-badge .status-text {
	color: #66BB6A;
	font-size: 24rpx;
	font-weight: 500;
}

/* Warning Badge - Soft Yellow */
.warning-badge {
	background-color: #FFF8E1;
}

.warning-badge .status-dot {
	background-color: #FFA726;
}

.warning-badge .status-text {
	color: #FFA726;
	font-size: 24rpx;
	font-weight: 500;
}

/* Report Preview */
.report-preview {
	display: flex;
	flex-direction: column;
	gap: 12rpx;
	margin-bottom: 24rpx;
	background-color: #F5F7FA;
	border-radius: 20rpx;
	padding: 20rpx;
}

.preview-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.preview-label {
	font-size: 26rpx;
	color: #757575;
}

.preview-value {
	font-size: 28rpx;
	font-weight: 500;
	color: #191C1E;
}

.preview-value.normal-value {
	color: #66BB6A;
}

.preview-item.abnormal-item,
.preview-item.warning-item {
	background-color: rgba(255, 167, 38, 0.08);
	padding: 12rpx 16rpx;
	border-radius: 12rpx;
	margin: -12rpx;
	margin-bottom: 0;
}

.preview-value.abnormal-value {
	color: #EF5350;
}

.preview-value.warning-value {
	color: #FFA726;
}

/* Report Footer */
.report-footer {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding-top: 24rpx;
	border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.ai-status {
	display: flex;
	align-items: center;
	gap: 8rpx;
}

.ai-status.analyzed {
	background-color: #FCE7F3;
	padding: 8rpx 16rpx;
	border-radius: 20rpx;
}

.ai-status.analyzed .ai-icon {
	font-size: 24rpx;
}

.ai-status.analyzed .ai-text {
	font-size: 24rpx;
	color: #C2185B;
	font-weight: 500;
}

.ai-status.pending {
	background-color: #F5F5F5;
	padding: 8rpx 16rpx;
	border-radius: 20rpx;
}

.ai-status.pending .ai-icon {
	font-size: 24rpx;
}

.ai-status.pending .ai-text {
	font-size: 24rpx;
	color: #9E9E9E;
	font-weight: 500;
}

.report-action {
	font-size: 28rpx;
	color: #757575;
}

.report-action-primary {
	font-size: 28rpx;
	color: #C2185B;
	font-weight: 500;
}

/* Disclaimer Card */
.disclaimer-card {
	background-color: #FFF8E1;
	border-radius: 24rpx;
	padding: 24rpx;
	margin-top: 32rpx;
	display: flex;
	align-items: flex-start;
	gap: 12rpx;
}

.disclaimer-icon {
	font-size: 28rpx;
	flex-shrink: 0;
}

.disclaimer-text {
	flex: 1;
	font-size: 24rpx;
	color: #F57C00;
	line-height: 1.5;
}

/* Bottom Spacer */
.bottom-spacer {
	height: 120rpx;
}

/* AI Result Modal */
.ai-result-modal {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.5);
	z-index: 1000;
	display: flex;
	align-items: flex-end;
}

.ai-result-card {
	width: 100%;
	max-height: 85vh;
	background-color: #FFFFFF;
	border-radius: 32rpx 32rpx 0 0;
	display: flex;
	flex-direction: column;
	animation: slideUp 0.3s ease;
	box-sizing: border-box;
}

@keyframes slideUp {
	from {
		transform: translateY(100%);
	}
	to {
		transform: translateY(0);
	}
}

.ai-result-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 32rpx;
	border-bottom: 1px solid rgba(0, 0, 0, 0.05);
	box-sizing: border-box;
	overflow-x: hidden;
}

.ai-result-title-wrapper {
	display: flex;
	align-items: center;
	gap: 12rpx;
}

.ai-result-icon {
	font-size: 32rpx;
}

.ai-result-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #191C1E;
}

.ai-result-model {
	display: flex;
	align-items: center;
}

.model-badge {
	background: linear-gradient(135deg, #C2185B 0%, #E91E63 100%);
	color: #FFFFFF;
	font-size: 22rpx;
	padding: 8rpx 16rpx;
	border-radius: 20rpx;
	font-weight: 500;
}

.ai-result-content {
	flex: 1;
	padding: 32rpx;
	overflow-y: auto;
	box-sizing: border-box;
	overflow-x: hidden;
}

.result-section {
	margin-bottom: 32rpx;
	box-sizing: border-box;
	width: 100%;
}

.result-section-title {
	display: block;
	font-size: 28rpx;
	font-weight: 600;
	color: #191C1E;
	margin-bottom: 16rpx;
}

.result-report-type {
	display: block;
	font-size: 30rpx;
	font-weight: 500;
	color: #C2185B;
}

.result-summary {
	display: block;
	font-size: 28rpx;
	color: #616161;
	line-height: 1.6;
	word-wrap: break-word;
	word-break: break-word;
	white-space: normal;
	overflow-wrap: break-word;
}

.result-section.normal-section {
	background-color: #E8F5E9;
	padding: 20rpx;
	border-radius: 20rpx;
}

.result-highlights {
	display: block;
	font-size: 26rpx;
	color: #2E7D32;
	line-height: 1.5;
	word-wrap: break-word;
	word-break: break-word;
	white-space: normal;
	overflow-wrap: break-word;
}

/* Indicators List */
.indicators-list {
	display: flex;
	flex-direction: column;
	gap: 16rpx;
}

.indicator-item {
	background-color: #F5F7FA;
	border-radius: 20rpx;
	padding: 20rpx;
	border-left: 4rpx solid #66BB6A;
	box-sizing: border-box;
	width: 100%;
}

.indicator-item.indicator-warning {
	border-left-color: #EF5350;
	background-color: #FFEBEE;
}

.indicator-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 12rpx;
	gap: 12rpx;
}

.indicator-name {
	font-size: 28rpx;
	font-weight: 500;
	color: #191C1E;
	flex: 1;
	word-wrap: break-word;
	word-break: break-word;
	white-space: normal;
	overflow-wrap: break-word;
}

.indicator-severity {
	padding: 4rpx 12rpx;
	border-radius: 12rpx;
	flex-shrink: 0;
}

.severity-normal {
	background-color: #E8F5E9;
}

.severity-normal .severity-text {
	font-size: 22rpx;
	color: #66BB6A;
}

.severity-warning {
	background-color: #FFF8E1;
}

.severity-warning .severity-text {
	font-size: 22rpx;
	color: #FFA726;
}

.severity-danger {
	background-color: #FFEBEE;
}

.severity-danger .severity-text {
	font-size: 22rpx;
	color: #EF5350;
}

.indicator-values {
	display: flex;
	align-items: center;
	gap: 16rpx;
	margin-bottom: 12rpx;
}

.indicator-value {
	font-size: 32rpx;
	font-weight: 600;
	color: #191C1E;
}

.indicator-item.indicator-warning .indicator-value {
	color: #EF5350;
}

.indicator-reference {
	font-size: 24rpx;
	color: #9E9E9E;
}

.indicator-explanation {
	display: block;
	font-size: 26rpx;
	color: #616161;
	line-height: 1.5;
	word-wrap: break-word;
	word-break: break-word;
	white-space: normal;
	overflow-wrap: break-word;
}

/* Suggestions List */
.suggestions-list {
	display: flex;
	flex-direction: column;
	gap: 12rpx;
}

.suggestion-item {
	display: flex;
	align-items: flex-start;
	gap: 12rpx;
	box-sizing: border-box;
	width: 100%;
}

.suggestion-bullet {
	width: 32rpx;
	height: 32rpx;
	background: linear-gradient(135deg, #C2185B 0%, #E91E63 100%);
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
	font-size: 20rpx;
	color: #FFFFFF;
	font-weight: 600;
}

.suggestion-text {
	flex: 1;
	font-size: 26rpx;
	color: #616161;
	line-height: 1.5;
	padding-top: 4rpx;
	word-wrap: break-word;
	word-break: break-word;
	white-space: normal;
	overflow-wrap: break-word;
}

/* Result Disclaimer */
.result-disclaimer {
	background-color: #FFF8E1;
	border-radius: 16rpx;
	padding: 20rpx;
	display: flex;
	align-items: flex-start;
	gap: 12rpx;
	box-sizing: border-box;
}

.disclaimer-icon {
	font-size: 24rpx;
	flex-shrink: 0;
}

.disclaimer-text {
	flex: 1;
	font-size: 22rpx;
	color: #F57C00;
	line-height: 1.4;
	word-wrap: break-word;
	word-break: break-word;
	white-space: normal;
	overflow-wrap: break-word;
}

/* AI Result Footer */
.ai-result-footer {
	padding: 20rpx 32rpx;
	padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
	border-top: 1px solid rgba(0, 0, 0, 0.05);
	box-sizing: border-box;
}

.close-btn {
	display: block;
	width: 100%;
	text-align: center;
	background: linear-gradient(135deg, #C2185B 0%, #E91E63 100%);
	color: #FFFFFF;
	font-size: 30rpx;
	font-weight: 500;
	padding: 24rpx;
	border-radius: 48rpx;
}
.ai-result-footer {
	padding: 24rpx 32rpx 48rpx; /* 固定留白：上24，左右32，下48 */
	border-top: 1px solid rgba(0, 0, 0, 0.05);
	background-color: #FFFFFF;
	box-sizing: border-box;
}
</style>
