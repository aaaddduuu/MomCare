<template>
	<view class="page-container">
		<!-- Page Header -->
		<view class="page-header">
			<text class="page-title">报告管家</text>
			<text class="page-subtitle">AI 智能解读您的产检报告</text>
		</view>

		<!-- AI Model Selector -->
		<view class="model-selector-wrapper">
			<view class="selector-header">
				<text class="selector-icon">🤖</text>
				<text class="selector-title">选择 AI 医生</text>
			</view>
			<view class="model-segmented">
				<view
					v-for="model in aiModels"
					:key="model.id"
					class="model-option"
					:class="{ 'model-active': selectedModel === model.id }"
					@tap="selectModel(model.id)"
				>
					<text class="model-name">{{ model.name }}</text>
					<text class="model-desc">{{ model.desc }}</text>
				</view>
			</view>
			<view class="selector-footer">
				<text class="selected-model-text">当前选择: {{ selectedModelData.name }}</text>
				<text class="selected-model-desc">{{ selectedModelData.desc }}</text>
			</view>
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

		<!-- Quick Upload Options -->
		<view class="quick-actions">
			<view class="quick-action-item" @tap="handleCamera">
				<view class="quick-icon-wrapper camera">
					<text class="quick-icon">📷</text>
				</view>
				<text class="quick-label">拍照上传</text>
			</view>
			<view class="quick-action-item" @tap="handleAlbum">
				<view class="quick-icon-wrapper album">
					<text class="quick-icon">🖼️</text>
				</view>
				<text class="quick-label">相册选择</text>
			</view>
			<view class="quick-action-item" @tap="handlePdf">
				<view class="quick-icon-wrapper pdf">
					<text class="quick-icon">📑</text>
				</view>
				<text class="quick-label">PDF 文件</text>
			</view>
		</view>

		<!-- Report List Header -->
		<view class="list-header">
			<text class="list-title">报告档案</text>
			<view class="list-filter">
				<text class="filter-text">全部</text>
				<text class="filter-arrow">▼</text>
			</view>
		</view>

		<!-- Report List -->
		<view class="report-list">
			<!-- Report Item 1: Abnormal - Blood Routine -->
			<view class="report-card" @tap="viewReport(reportList[0])">
				<view class="report-header">
					<view class="report-type-wrapper">
						<text class="report-type-icon">🩸</text>
						<view class="report-type-info">
							<text class="report-title">血常规检查</text>
							<text class="report-date">2024年4月28日 09:30</text>
						</view>
					</view>
					<view class="report-status-wrapper">
						<view class="status-badge abnormal-badge">
							<text class="status-dot"></text>
							<text class="status-text">异常</text>
						</view>
					</view>
				</view>
				<view class="report-preview">
					<view class="preview-item abnormal-item">
						<text class="preview-label">血红蛋白</text>
						<text class="preview-value abnormal-value">95 g/L</text>
					</view>
					<view class="preview-item">
						<text class="preview-label">白细胞</text>
						<text class="preview-value">8.5×10⁹/L</text>
					</view>
					<view class="preview-item">
						<text class="preview-label">血小板</text>
						<text class="preview-value">210×10⁹/L</text>
					</view>
				</view>
				<view class="report-footer">
					<view class="ai-status analyzed">
						<text class="ai-icon">✨</text>
						<text class="ai-text">AI 已解读</text>
					</view>
					<text class="report-action">查看详情 →</text>
				</view>
			</view>

			<!-- Report Item 2: Normal - Down Syndrome Screening -->
			<view class="report-card" @tap="viewReport(reportList[1])">
				<view class="report-header">
					<view class="report-type-wrapper">
						<text class="report-type-icon">🧬</text>
						<view class="report-type-info">
							<text class="report-title">唐氏筛查</text>
							<text class="report-date">2024年4月15日 10:00</text>
						</view>
					</view>
					<view class="report-status-wrapper">
						<view class="status-badge normal-badge">
							<text class="status-dot"></text>
							<text class="status-text">正常</text>
						</view>
					</view>
				</view>
				<view class="report-preview">
					<view class="preview-item">
						<text class="preview-label">风险评估</text>
						<text class="preview-value normal-value">低风险</text>
					</view>
					<view class="preview-item">
						<text class="preview-label">AFP</text>
						<text class="preview-value">45.2</text>
					</view>
					<view class="preview-item">
						<text class="preview-label">hCGβ</text>
						<text class="preview-value">2.3</text>
					</view>
				</view>
				<view class="report-footer">
					<view class="ai-status analyzed">
						<text class="ai-icon">✨</text>
						<text class="ai-text">AI 已解读</text>
					</view>
					<text class="report-action">查看详情 →</text>
				</view>
			</view>

			<!-- Report Item 3: Pending - Ultrasound -->
			<view class="report-card" @tap="viewReport(reportList[2])">
				<view class="report-header">
					<view class="report-type-wrapper">
						<text class="report-type-icon">🔬</text>
						<view class="report-type-info">
							<text class="report-title">B超检查</text>
							<text class="report-date">2024年4月20日 14:30</text>
						</view>
					</view>
					<view class="report-status-wrapper">
						<view class="status-badge normal-badge">
							<text class="status-dot"></text>
							<text class="status-text">正常</text>
						</view>
					</view>
				</view>
				<view class="report-preview">
					<view class="preview-item">
						<text class="preview-label">胎位</text>
						<text class="preview-value">头位</text>
					</view>
					<view class="preview-item">
						<text class="preview-label">胎心率</text>
						<text class="preview-value">152 次/分</text>
					</view>
					<view class="preview-item">
						<text class="preview-label">羊水指数</text>
						<text class="preview-value">12.5 cm</text>
					</view>
				</view>
				<view class="report-footer">
					<view class="ai-status pending">
						<text class="ai-icon">⏳</text>
						<text class="ai-text">待解读</text>
					</view>
					<text class="report-action-primary" @tap.stop="handleAnalyzeReport(reportList[2])">一键解读</text>
				</view>
			</view>

			<!-- Report Item 4: Normal - Urine Routine -->
			<view class="report-card" @tap="viewReport(reportList[3])">
				<view class="report-header">
					<view class="report-type-wrapper">
						<text class="report-type-icon">💧</text>
						<view class="report-type-info">
							<text class="report-title">尿常规检查</text>
							<text class="report-date">2024年4月10日 08:15</text>
						</view>
					</view>
					<view class="report-status-wrapper">
						<view class="status-badge normal-badge">
							<text class="status-dot"></text>
							<text class="status-text">正常</text>
						</view>
					</view>
				</view>
				<view class="report-preview">
					<view class="preview-item">
						<text class="preview-label">蛋白质</text>
						<text class="preview-value normal-value">阴性</text>
					</view>
					<view class="preview-item">
						<text class="preview-label">葡萄糖</text>
						<text class="preview-value normal-value">阴性</text>
					</view>
					<view class="preview-item">
						<text class="preview-label">白细胞</text>
						<text class="preview-value normal-value">阴性</text>
					</view>
				</view>
				<view class="report-footer">
					<view class="ai-status analyzed">
						<text class="ai-icon">✨</text>
						<text class="ai-text">AI 已解读</text>
					</view>
					<text class="report-action">查看详情 →</text>
				</view>
			</view>

			<!-- Report Item 5: Pending - Glucose Tolerance -->
			<view class="report-card" @tap="viewReport(reportList[4])">
				<view class="report-header">
					<view class="report-type-wrapper">
						<text class="report-type-icon">🍬</text>
						<view class="report-type-info">
							<text class="report-title">糖耐量检查</text>
							<text class="report-date">2024年3月25日 08:00</text>
						</view>
					</view>
					<view class="report-status-wrapper">
						<view class="status-badge warning-badge">
							<text class="status-dot"></text>
							<text class="status-text">注意</text>
						</view>
					</view>
				</view>
				<view class="report-preview">
					<view class="preview-item warning-item">
						<text class="preview-label">空腹血糖</text>
						<text class="preview-value warning-value">5.4 mmol/L</text>
					</view>
					<view class="preview-item">
						<text class="preview-label">1小时血糖</text>
						<text class="preview-value">9.8 mmol/L</text>
					</view>
					<view class="preview-item">
						<text class="preview-label">2小时血糖</text>
						<text class="preview-value">7.2 mmol/L</text>
					</view>
				</view>
				<view class="report-footer">
					<view class="ai-status pending">
						<text class="ai-icon">⏳</text>
						<text class="ai-text">待解读</text>
					</view>
					<text class="report-action-primary" @tap.stop="handleAnalyzeReport(reportList[4])">一键解读</text>
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

// AI Model Selection
const aiModels = ref([
	{
		id: 'deepseek',
		name: 'DeepSeek',
		desc: '推理专家',
		icon: '🧠'
	},
	{
		id: 'qwen',
		name: '通义千问',
		desc: '均衡全能',
		icon: '⚖️'
	},
	{
		id: 'kimi',
		name: 'Kimi',
		desc: '长文专家',
		icon: '📚'
	}
])

const selectedModel = ref('deepseek')

const selectedModelData = computed(() => {
	return aiModels.value.find(m => m.id === selectedModel.value) || aiModels.value[0]
})

const selectModel = (modelId) => {
	selectedModel.value = modelId
	// Save to user preferences (would connect to DB in production)
	console.log('Model selected:', modelId)
}

// Mock report data
const reportList = ref([
	{
		id: 1,
		type: 'blood_routine',
		title: '血常规检查',
		date: '2024年4月28日 09:30',
		icon: '🩸',
		status: 'abnormal',
		aiStatus: 'analyzed',
		preview: [
			{ label: '血红蛋白', value: '95 g/L', abnormal: true },
			{ label: '白细胞', value: '8.5×10⁹/L', abnormal: false },
			{ label: '血小板', value: '210×10⁹/L', abnormal: false }
		]
	},
	{
		id: 2,
		type: 'down_screening',
		title: '唐氏筛查',
		date: '2024年4月15日 10:00',
		icon: '🧬',
		status: 'normal',
		aiStatus: 'analyzed',
		preview: [
			{ label: '风险评估', value: '低风险', abnormal: false },
			{ label: 'AFP', value: '45.2', abnormal: false },
			{ label: 'hCGβ', value: '2.3', abnormal: false }
		]
	},
	{
		id: 3,
		type: 'ultrasound',
		title: 'B超检查',
		date: '2024年4月20日 14:30',
		icon: '🔬',
		status: 'normal',
		aiStatus: 'pending',
		preview: [
			{ label: '胎位', value: '头位', abnormal: false },
			{ label: '胎心率', value: '152 次/分', abnormal: false },
			{ label: '羊水指数', value: '12.5 cm', abnormal: false }
		]
	},
	{
		id: 4,
		type: 'urine_routine',
		title: '尿常规检查',
		date: '2024年4月10日 08:15',
		icon: '💧',
		status: 'normal',
		aiStatus: 'analyzed',
		preview: [
			{ label: '蛋白质', value: '阴性', abnormal: false },
			{ label: '葡萄糖', value: '阴性', abnormal: false },
			{ label: '白细胞', value: '阴性', abnormal: false }
		]
	},
	{
		id: 5,
		type: 'glucose_tolerance',
		title: '糖耐量检查',
		date: '2024年3月25日 08:00',
		icon: '🍬',
		status: 'warning',
		aiStatus: 'pending',
		preview: [
			{ label: '空腹血糖', value: '5.4 mmol/L', abnormal: false, warning: true },
			{ label: '1小时血糖', value: '9.8 mmol/L', abnormal: false },
			{ label: '2小时血糖', value: '7.2 mmol/L', abnormal: false }
		]
	}
])

// Upload handlers
const handleUpload = () => {
	console.log('Upload report')
	uni.showActionSheet({
		itemList: ['拍照上传', '相册选择', 'PDF 文件'],
		success: (res) => {
			console.log('Selected:', res.tapIndex)
		}
	})
}

const handleCamera = () => {
	console.log('Camera upload')
	uni.chooseImage({
		count: 1,
		sourceType: ['camera'],
		success: (res) => {
			console.log('Image selected:', res.tempFilePaths)
		}
	})
}

const handleAlbum = () => {
	console.log('Album upload')
	uni.chooseImage({
		count: 9,
		sourceType: ['album'],
		success: (res) => {
			console.log('Images selected:', res.tempFilePaths)
		}
	})
}

const handlePdf = () => {
	console.log('PDF upload')
	uni.showToast({
		title: '请选择 PDF 文件',
		icon: 'none'
	})
}

// View report details
const viewReport = (report) => {
	console.log('View report:', report)
	uni.navigateTo({
		url: `/pages/reports/detail?id=${report.id}`
	})
}

// AI Analysis Result
const aiReportResult = ref(null)

// Handle Upload Report - Complete flow
const handleUploadReport = async () => {
	// Step 1: Choose image
	uni.chooseMedia({
		count: 1,
		mediaType: ['image'],
		sourceType: ['album', 'camera'],
		success: async (res) => {
			const tempFilePath = res.tempFiles[0].tempFilePath

			// Step 2: Show uploading loading
			uni.showLoading({
				title: '图片上传中...',
				mask: true
			})

			try {
				// Step 3: Upload to uniCloud Storage
				const uploadRes = await uniCloud.uploadFile({
					filePath: tempFilePath,
					cloudPath: `medical_reports/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.jpg`
				})

				const fileID = uploadRes.fileID

				// Step 4: Extract OCR text
				uni.showLoading({
					title: 'AI 识别文字中...',
					mask: true
				})

				const ocrRes = await uniCloud.callFunction({
					name: 'extractReportOCR',
					data: {
						fileID: fileID
					}
				})

				if (ocrRes.result.errCode !== 0) {
					throw new Error(ocrRes.result.errMsg || 'OCR 提取失败')
				}

				const realOcrText = ocrRes.result.data.text

				// Step 5: Analyze with AI
				await handleAnalyzeReportWithText(realOcrText, fileID)

			} catch (error) {
				uni.hideLoading()
				console.error('Upload error:', error)
				uni.showToast({
					title: error.message || '上传失败，请重试',
					icon: 'none'
				})
			}
		},
		fail: (error) => {
			console.error('Choose media error:', error)
			uni.showToast({
				title: '选择图片失败',
				icon: 'none'
			})
		}
	})
}

// Handle AI Analysis with real OCR text
const handleAnalyzeReportWithText = async (ocrText, imageUrl = null) => {
	console.log('Analyze with OCR text:', ocrText.substring(0, 100))

	// Show loading
	uni.showLoading({
		title: 'AI 医生解读中...',
		mask: true
	})

	try {
		// Call cloud function
		const res = await uniCloud.callFunction({
			name: 'analyzeReportAI',
			data: {
				ocrText: ocrText,
				modelChoice: selectedModel.value
			}
		})

		// Hide loading
		uni.hideLoading()

		if (res.result.errCode === 0) {
			// Success - bind result to ref
			aiReportResult.value = {
				...res.result.data,
				imageUrl: imageUrl
			}

			// Add new report to list
			const newReport = {
				id: Date.now(),
				type: 'manual_upload',
				title: res.result.data.report_type || '新上传报告',
				date: new Date().toLocaleString('zh-CN'),
				icon: '📄',
				status: res.result.data.abnormal_indicators?.some(i => i.severity === 'danger' || i.severity === 'warning') ? 'warning' : 'normal',
				aiStatus: 'analyzed',
				preview: []
			}

			reportList.value.unshift(newReport)

			uni.showToast({
				title: '解读完成',
				icon: 'success'
			})
		} else {
			// Error
			uni.showToast({
				title: res.result.errMsg || '解读失败',
				icon: 'none'
			})
		}
	} catch (error) {
		uni.hideLoading()
		console.error('AI analysis error:', error)
		uni.showToast({
			title: '网络错误，请重试',
			icon: 'none'
		})
	}
}

// Handle AI Analysis (for existing reports - uses mock OCR for now)
const handleAnalyzeReport = async (report) => {
	console.log('Analyze report:', report)

	// Mock OCR text for demonstration
	const mockOcrText = `血常规检查报告
检测日期：2024年4月20日
------------------------------------------------
项目名称                 结果     单位    参考范围
白细胞(WBC)             8.5      10^9/L  4.0-10.0
红细胞(RBC)             4.2      10^12/L 3.5-5.0
血红蛋白(HGB)           95       g/L     110-150  ↓
血小板(PLT)             210      10^9/L  100-300
中性粒细胞比率          65       %       50-70
淋巴细胞比率            28       %       20-40
------------------------------------------------
↓ 表示低于参考范围`

	await handleAnalyzeReportWithText(mockOcrText)
}

// Close AI Result Modal
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

/* AI Model Selector */
.model-selector-wrapper {
	background-color: #FFFFFF;
	border-radius: 32rpx;
	padding: 32rpx;
	margin-bottom: 24rpx;
}

.selector-header {
	display: flex;
	align-items: center;
	gap: 12rpx;
	margin-bottom: 24rpx;
}

.selector-icon {
	font-size: 32rpx;
}

.selector-title {
	font-size: 30rpx;
	font-weight: 600;
	color: #191C1E;
}

.model-segmented {
	display: flex;
	background-color: #F5F7FA;
	border-radius: 24rpx;
	padding: 8rpx;
	margin-bottom: 20rpx;
}

.model-option {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 20rpx 12rpx;
	border-radius: 20rpx;
	transition: all 0.2s ease;
}

.model-option.model-active {
	background: linear-gradient(135deg, #C2185B 0%, #E91E63 100%);
	box-shadow: 0 4rpx 16rpx rgba(194, 24, 91, 0.2);
}

.model-name {
	font-size: 28rpx;
	font-weight: 500;
	color: #616161;
	margin-bottom: 4rpx;
	transition: color 0.2s ease;
}

.model-option.model-active .model-name {
	color: #FFFFFF;
	font-weight: 600;
}

.model-desc {
	font-size: 22rpx;
	color: #9E9E9E;
	transition: color 0.2s ease;
}

.model-option.model-active .model-desc {
	color: rgba(255, 255, 255, 0.9);
}

.selector-footer {
	display: flex;
	align-items: center;
	justify-content: space-between;
	background-color: #F5F7FA;
	border-radius: 16rpx;
	padding: 16rpx 20rpx;
}

.selected-model-text {
	font-size: 26rpx;
	color: #191C1E;
	font-weight: 500;
}

.selected-model-desc {
	font-size: 24rpx;
	color: #C2185B;
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

/* Quick Actions */
.quick-actions {
	display: flex;
	justify-content: space-between;
	gap: 16rpx;
	margin-bottom: 32rpx;
}

.quick-action-item {
	flex: 1;
	background-color: #FFFFFF;
	border-radius: 24rpx;
	padding: 32rpx 16rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 12rpx;
}

.quick-icon-wrapper {
	width: 80rpx;
	height: 80rpx;
	border-radius: 20rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.quick-icon-wrapper.camera {
	background-color: #E3F2FD;
}

.quick-icon-wrapper.album {
	background-color: #F3E5F5;
}

.quick-icon-wrapper.pdf {
	background-color: #FFF3E0;
}

.quick-icon {
	font-size: 36rpx;
}

.quick-label {
	font-size: 24rpx;
	color: #616161;
	text-align: center;
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
</style>
