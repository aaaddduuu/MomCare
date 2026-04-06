<template>
	<view class="page-container">
		<!-- Loading State -->
		<view v-if="isLoading" class="loading-state">
			<view class="spinner"></view>
			<text class="loading-text">加载报告详情...</text>
		</view>

		<!-- Error State -->
		<view v-else-if="loadError" class="error-state">
			<text class="error-icon">😕</text>
			<text class="error-title">加载失败</text>
			<text class="error-desc">{{ loadError }}</text>
			<text class="error-retry" @tap="loadReport">重试</text>
		</view>

		<!-- Report Content -->
		<view v-else-if="report" class="report-content">
			<!-- Image Preview Card -->
			<view class="image-card">
				<image
					v-if="reportImageUrl"
					:src="reportImageUrl"
					class="report-image"
					mode="aspectFit"
					@tap="previewImage"
				></image>
				<view v-else class="image-placeholder">
					<text class="placeholder-icon">📄</text>
					<text class="placeholder-text">无图片</text>
				</view>
				<view v-if="reportImageUrl" class="image-action" @tap="previewImage">
					<text class="image-action-text">查看原图</text>
				</view>
			</view>

			<!-- Report Type Header -->
			<view class="type-header">
				<text class="type-icon">{{ getReportIcon(report.report_type) }}</text>
				<view class="type-info">
					<text class="type-title">{{ report.report_name || getReportTypeName(report.report_type) }}</text>
					<text class="type-date">{{ formatDate(report.create_time) }}</text>
				</view>
				<view class="status-badge" :class="getStatusClass()">
					<text class="status-dot"></text>
					<text class="status-text">{{ getStatusText() }}</text>
				</view>
			</view>

			<!-- AI Analysis Sections (completed) -->
			<view v-if="report.ai_status === 'completed' && report.ai_result" class="analysis-section fade-in">
				<!-- Overall Summary -->
				<view class="section-card">
					<text class="section-title">整体评估</text>
					<text class="section-summary">{{ report.ai_result.overall_summary }}</text>
				</view>

				<!-- Normal Highlights -->
				<view v-if="report.ai_result.normal_highlights" class="section-card normal-card">
					<text class="section-title">✨ 正常亮点</text>
					<text class="section-highlights">{{ report.ai_result.normal_highlights }}</text>
				</view>

				<!-- Abnormal Indicators -->
				<view v-if="report.ai_result.abnormal_indicators && report.ai_result.abnormal_indicators.length > 0" class="section-card">
					<text class="section-title">指标详解</text>
					<view class="indicators-list">
						<view
							v-for="(indicator, index) in report.ai_result.abnormal_indicators"
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
				<view v-if="report.ai_result.action_suggestions && report.ai_result.action_suggestions.length > 0" class="section-card">
					<text class="section-title">建议</text>
					<view class="suggestions-list">
						<view
							v-for="(suggestion, index) in report.ai_result.action_suggestions"
							:key="index"
							class="suggestion-item"
						>
							<text class="suggestion-bullet">{{ index + 1 }}</text>
							<text class="suggestion-text">{{ suggestion }}</text>
						</view>
					</view>
				</view>

				<!-- Disclaimer -->
				<view class="disclaimer-card">
					<text class="disclaimer-icon">⚠️</text>
					<text class="disclaimer-text">{{ report.ai_result.disclaimer }}</text>
				</view>
			</view>

			<!-- Magic Card (not yet analyzed) -->
			<view v-else class="magic-card fade-in">
				<view class="magic-content">
					<text class="magic-icon">✨</text>
					<text class="magic-title">此报告尚未解读</text>
					<text class="magic-desc">点击下方按钮，由 AI 医生为您提供专业建议</text>
				</view>
			</view>

			<!-- Action Buttons -->
			<view class="action-section">
				<!-- AI Analyze Button (only when not completed) -->
				<view v-if="report.ai_status !== 'completed'" class="analyze-btn" :class="{ 'btn-disabled': isAnalyzing }" @tap="handleAiAnalyze">
					<view v-if="isAnalyzing" class="btn-spinner"></view>
					<text v-else class="analyze-icon">🤖</text>
					<text class="analyze-text">{{ isAnalyzing ? analyzingStep : '立即使用 AI 智能解读' }}</text>
				</view>

				<!-- Share Button -->
				<button v-else class="share-btn" open-type="share">
					<text class="share-icon">👨‍⚕️</text>
					<text class="share-label">分享给医生</text>
				</button>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad, onShareAppMessage } from '@dcloudio/uni-app'

const DEFAULT_MODEL = 'deepseek'

const report = ref(null)
const reportImageUrl = ref('')
const isLoading = ref(true)
const loadError = ref('')
const isAnalyzing = ref(false)
const analyzingStep = ref('')

// Page share config
onShareAppMessage(() => {
	return {
		title: `产检报告解读 - ${report.value?.report_name || '孕伴 MomCare'}`,
		path: `/pages/reports/detail?id=${report.value?._id}`
	}
})

// Load report by ID
onLoad((options) => {
	if (options.id) {
		report.value = { _id: options.id }
		loadReport()
	} else {
		isLoading.value = false
		loadError.value = '缺少报告 ID'
	}
})

const loadReport = async () => {
	isLoading.value = true
	loadError.value = ''

	try {
		const db = uniCloud.database()
		const res = await db.collection('momcare_reports').doc(report.value._id).get()

		if (res.result.data && res.result.data.length > 0) {
			report.value = res.result.data[0]

			// Get temporary URL for the image
			if (report.value.file_urls && report.value.file_urls.length > 0) {
				try {
					const urlRes = await uniCloud.getTempFileURL({
						fileList: [report.value.file_urls[0]]
					})
					if (urlRes.fileList && urlRes.fileList.length > 0) {
						reportImageUrl.value = urlRes.fileList[0].tempFileURL
					}
				} catch (e) {
					console.error('Failed to get temp URL:', e)
				}
			}
		} else {
			loadError.value = '报告不存在'
		}
	} catch (error) {
		console.error('Failed to load report:', error)
		loadError.value = '网络错误，请重试'
	} finally {
		isLoading.value = false
	}
}

// AI Analysis: OCR -> LLM -> Save back to DB
const handleAiAnalyze = async () => {
	if (isAnalyzing.value) return
	isAnalyzing.value = true

	try {
		const fileID = report.value.file_urls?.[0]
		if (!fileID) {
			uni.showToast({ title: '无报告图片', icon: 'none' })
			return
		}

		// Step 1: OCR
		analyzingStep.value = 'AI 识别文字中...'
		const ocrRes = await uniCloud.callFunction({
			name: 'extractReportOCR',
			data: { fileID }
		})

		if (ocrRes.result.errCode !== 0) {
			throw new Error(ocrRes.result.errMsg || 'OCR 提取失败')
		}

		const ocrText = ocrRes.result.data.text

		// Step 2: AI Analysis
		analyzingStep.value = 'AI 医生解读中...'
		const aiRes = await uniCloud.callFunction({
			name: 'analyzeReportAI',
			data: { ocrText, modelChoice: DEFAULT_MODEL }
		})

		if (aiRes.result.errCode !== 0) {
			throw new Error(aiRes.result.errMsg || 'AI 解读失败')
		}

		const aiData = aiRes.result.data

		// Step 3: Save results back to database
		analyzingStep.value = '保存结果中...'
		const db = uniCloud.database()
		await db.collection('momcare_reports').doc(report.value._id).update({
			ai_status: 'completed',
			ocr_status: 'completed',
			ocr_text: ocrText,
			llm_used: aiData.llm_used || DEFAULT_MODEL,
			report_type: aiData.report_type || 'other',
			report_name: aiData.report_type || report.value.report_name,
			ai_result: {
				report_type: aiData.report_type,
				overall_summary: aiData.overall_summary,
				normal_highlights: aiData.normal_highlights,
				abnormal_indicators: aiData.abnormal_indicators || [],
				action_suggestions: aiData.action_suggestions || [],
				disclaimer: aiData.disclaimer
			},
			abnormal_indicators: aiData.abnormal_indicators || [],
			is_abnormal: aiData.abnormal_indicators?.some(i => i.severity === 'warning' || i.severity === 'danger') || false
		})

		// Step 4: Refresh local state instantly
		report.value = {
			...report.value,
			ai_status: 'completed',
			ocr_status: 'completed',
			ocr_text: ocrText,
			report_type: aiData.report_type || report.value.report_type,
			report_name: aiData.report_type || report.value.report_name,
			ai_result: {
				report_type: aiData.report_type,
				overall_summary: aiData.overall_summary,
				normal_highlights: aiData.normal_highlights,
				abnormal_indicators: aiData.abnormal_indicators || [],
				action_suggestions: aiData.action_suggestions || [],
				disclaimer: aiData.disclaimer
			},
			abnormal_indicators: aiData.abnormal_indicators || [],
			is_abnormal: aiData.abnormal_indicators?.some(i => i.severity === 'warning' || i.severity === 'danger') || false
		}

		uni.showToast({ title: '解读完成', icon: 'success' })
	} catch (error) {
		console.error('AI analysis error:', error)
		uni.showToast({ title: error.message || '解读失败，请重试', icon: 'none' })
	} finally {
		isAnalyzing.value = false
		analyzingStep.value = ''
	}
}

// Preview full image
const previewImage = () => {
	if (reportImageUrl.value) {
		uni.previewImage({
			urls: [reportImageUrl.value],
			current: reportImageUrl.value
		})
	}
}

// Utilities
const getReportIcon = (reportType) => {
	const iconMap = {
		'blood_routine': '🩸', 'urine_routine': '💧',
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

const getStatusClass = () => {
	if (report.value?.ai_status !== 'completed') return 'pending-badge'
	if (report.value?.is_abnormal) return 'abnormal-badge'
	if (report.value?.ai_result?.abnormal_indicators?.some(i => i.severity === 'warning')) return 'warning-badge'
	return 'normal-badge'
}

const getStatusText = () => {
	if (report.value?.ai_status !== 'completed') return '待解读'
	if (report.value?.is_abnormal) return '异常'
	if (report.value?.ai_result?.abnormal_indicators?.some(i => i.severity === 'warning')) return '注意'
	return '正常'
}
</script>

<style scoped lang="scss">
.page-container {
	min-height: 100vh;
	background-color: #F5F7FA;
	padding: 24rpx 32rpx 32rpx;
}

/* Loading State */
.loading-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	min-height: 60vh;
}

.spinner {
	width: 64rpx;
	height: 64rpx;
	border: 6rpx solid #E8EAED;
	border-top-color: #C2185B;
	border-radius: 50%;
	animation: spin 0.8s linear infinite;
}

@keyframes spin {
	to { transform: rotate(360deg); }
}

.loading-text {
	font-size: 28rpx;
	color: #9E9E9E;
	margin-top: 24rpx;
}

/* Error State */
.error-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	min-height: 60vh;
}

.error-icon {
	font-size: 120rpx;
	margin-bottom: 24rpx;
}

.error-title {
	font-size: 36rpx;
	font-weight: 600;
	color: #191C1E;
	margin-bottom: 12rpx;
}

.error-desc {
	font-size: 28rpx;
	color: #757575;
	margin-bottom: 32rpx;
}

.error-retry {
	font-size: 30rpx;
	color: #C2185B;
	font-weight: 500;
	padding: 20rpx 48rpx;
	border: 2rpx solid #C2185B;
	border-radius: 48rpx;
}

/* Image Card */
.image-card {
	background-color: #FFFFFF;
	border-radius: 32rpx;
	overflow: hidden;
	margin-bottom: 24rpx;
}

.report-image {
	width: 100%;
	height: 500rpx;
}

.image-placeholder {
	height: 300rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	background-color: #F5F7FA;
}

.placeholder-icon {
	font-size: 80rpx;
	margin-bottom: 12rpx;
}

.placeholder-text {
	font-size: 28rpx;
	color: #9E9E9E;
}

.image-action {
	padding: 20rpx;
	text-align: center;
	border-top: 1rpx solid rgba(0, 0, 0, 0.05);
}

.image-action-text {
	font-size: 28rpx;
	color: #C2185B;
	font-weight: 500;
}

/* Type Header */
.type-header {
	display: flex;
	align-items: center;
	background-color: #FFFFFF;
	border-radius: 32rpx;
	padding: 32rpx;
	margin-bottom: 24rpx;
}

.type-icon {
	font-size: 48rpx;
	margin-right: 20rpx;
}

.type-info {
	flex: 1;
	display: flex;
	flex-direction: column;
}

.type-title {
	font-size: 36rpx;
	font-weight: 600;
	color: #191C1E;
	margin-bottom: 8rpx;
}

.type-date {
	font-size: 24rpx;
	color: #9E9E9E;
}

/* Status Badge */
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

.pending-badge {
	background-color: #F5F5F5;
}

.pending-badge .status-dot {
	background-color: #BDBDBD;
}

.pending-badge .status-text {
	color: #9E9E9E;
	font-size: 24rpx;
	font-weight: 500;
}

/* Fade-in Animation */
.fade-in {
	animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
	from {
		opacity: 0;
		transform: translateY(20rpx);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

/* Magic Card */
.magic-card {
	background: linear-gradient(135deg, #FCE7F3 0%, #F8BBD0 100%);
	border-radius: 32rpx;
	padding: 48rpx 32rpx;
	margin-bottom: 24rpx;
	border: 2rpx solid rgba(194, 24, 91, 0.1);
}

.magic-content {
	display: flex;
	flex-direction: column;
	align-items: center;
}

.magic-icon {
	font-size: 80rpx;
	margin-bottom: 20rpx;
}

.magic-title {
	font-size: 34rpx;
	font-weight: 600;
	color: #C2185B;
	margin-bottom: 12rpx;
}

.magic-desc {
	font-size: 28rpx;
	color: #880E4F;
	opacity: 0.7;
	text-align: center;
	line-height: 1.5;
}

/* Section Cards */
.section-card {
	background-color: #FFFFFF;
	border-radius: 32rpx;
	padding: 32rpx;
	margin-bottom: 24rpx;
}

.section-title {
	display: block;
	font-size: 30rpx;
	font-weight: 600;
	color: #191C1E;
	margin-bottom: 20rpx;
}

.section-summary {
	font-size: 28rpx;
	color: #616161;
	line-height: 1.7;
	word-break: break-word;
}

/* Normal Highlights */
.normal-card {
	background-color: #E8F5E9;
}

.section-highlights {
	font-size: 26rpx;
	color: #2E7D32;
	line-height: 1.6;
	word-break: break-word;
}

/* Indicators */
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
}

.indicator-name {
	font-size: 28rpx;
	font-weight: 500;
	color: #191C1E;
	flex: 1;
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

.indicator-warning .indicator-value {
	color: #EF5350;
}

.indicator-reference {
	font-size: 24rpx;
	color: #9E9E9E;
}

.indicator-explanation {
	font-size: 26rpx;
	color: #616161;
	line-height: 1.5;
	word-break: break-word;
}

/* Suggestions */
.suggestions-list {
	display: flex;
	flex-direction: column;
	gap: 12rpx;
}

.suggestion-item {
	display: flex;
	align-items: flex-start;
	gap: 12rpx;
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
	line-height: 32rpx;
	text-align: center;
}

.suggestion-text {
	flex: 1;
	font-size: 26rpx;
	color: #616161;
	line-height: 1.5;
	padding-top: 4rpx;
	word-break: break-word;
}

/* Disclaimer */
.disclaimer-card {
	background-color: #FFF8E1;
	border-radius: 20rpx;
	padding: 24rpx;
	display: flex;
	align-items: flex-start;
	gap: 12rpx;
	margin-bottom: 24rpx;
}

.disclaimer-card .disclaimer-icon {
	font-size: 28rpx;
	flex-shrink: 0;
}

.disclaimer-card .disclaimer-text {
	flex: 1;
	font-size: 24rpx;
	color: #F57C00;
	line-height: 1.5;
	word-break: break-word;
}

/* Action Section */
.action-section {
	padding: 32rpx 0 48rpx;
}

/* Analyze Button */
.analyze-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 12rpx;
	background: linear-gradient(135deg, #C2185B 0%, #E91E63 100%);
	padding: 28rpx;
	border-radius: 48rpx;
	box-shadow: 0 8rpx 24rpx rgba(194, 24, 91, 0.25);
	transition: opacity 0.2s ease;
}

.analyze-btn:active {
	opacity: 0.9;
}

.btn-disabled {
	opacity: 0.8;
	pointer-events: none;
}

.analyze-icon {
	font-size: 32rpx;
}

.analyze-text {
	font-size: 30rpx;
	color: #FFFFFF;
	font-weight: 500;
}

.btn-spinner {
	width: 32rpx;
	height: 32rpx;
	border: 4rpx solid rgba(255, 255, 255, 0.3);
	border-top-color: #FFFFFF;
	border-radius: 50%;
	animation: spin 0.8s linear infinite;
}

/* Share Button */
.share-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 12rpx;
	background-color: #FFFFFF;
	color: #C2185B;
	font-size: 30rpx;
	font-weight: 500;
	padding: 24rpx;
	border-radius: 48rpx;
	border: 2rpx solid #C2185B;
	width: 100%;
	box-sizing: border-box;
}

.share-btn::after {
	border: none;
}

.share-icon {
	font-size: 32rpx;
}

.share-label {
	font-size: 30rpx;
	color: #C2185B;
	font-weight: 500;
}
</style>
