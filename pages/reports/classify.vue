<template>
	<view class="page-container">
		<!-- Loading -->
		<view v-if="isLoading" class="loading-state">
			<view class="spinner"></view>
			<text class="loading-text">加载报告...</text>
		</view>

		<!-- Error -->
		<view v-else-if="loadError" class="error-state">
			<text class="error-icon">😕</text>
			<text class="error-title">加载失败</text>
			<text class="error-desc">{{ loadError }}</text>
			<text class="error-retry" @tap="loadReport">重试</text>
		</view>

		<!-- Content -->
		<view v-else-if="report" class="content-area">
			<!-- Full Image Card -->
			<view class="image-card">
				<image
					v-if="reportImageUrl"
					:src="reportImageUrl"
					class="report-image"
					mode="widthFix"
					@tap="previewImage"
				></image>
				<view v-else class="image-placeholder">
					<text class="placeholder-icon">📄</text>
					<text class="placeholder-text">无图片</text>
				</view>
				<view v-if="reportImageUrl" class="image-action" @tap="previewImage">
					<text class="image-action-text">🔍 点击查看大图</text>
				</view>
			</view>

			<!-- Classification Form -->
			<view class="section-card">
				<text class="section-title">报告信息</text>

				<!-- Report Type -->
				<picker mode="selector" :range="typeLabels" @change="onTypeChange">
					<view class="form-field">
						<text class="field-label">报告类型</text>
						<view class="field-value-row">
							<text class="field-icon">{{ getReportIcon(form.report_type) }}</text>
							<text class="field-value">{{ getReportTypeName(form.report_type) }}</text>
							<text class="field-arrow">›</text>
						</view>
					</view>
				</picker>

				<view class="field-divider"></view>

				<!-- Date of Test -->
				<view class="form-field">
					<text class="field-label">检查日期</text>
					<picker mode="date" :value="form.report_date" @change="onDateChange">
						<view class="field-value-row">
							<text class="field-icon">📅</text>
							<text class="field-value" :class="{ 'placeholder': !form.report_date }">{{ form.report_date || '选择日期' }}</text>
							<text class="field-arrow">›</text>
						</view>
					</picker>
				</view>

				<view class="field-divider"></view>

				<!-- Pregnancy Week -->
				<view class="form-field">
					<text class="field-label">孕周</text>
					<view class="field-value-row">
						<text class="field-icon">🤰</text>
						<input
							class="field-input"
							type="number"
							v-model="form.pregnancy_week"
							placeholder="输入孕周数"
							placeholder-style="color: #BDBDBD; font-size: 28rpx;"
						/>
						<text class="field-suffix">周</text>
					</view>
				</view>

				<view class="field-divider"></view>

				<!-- Notes -->
				<view class="form-field-vertical">
					<text class="field-label">备注</text>
					<textarea
						class="field-textarea"
						v-model="form.notes"
						placeholder="可选：记录检查医院、医生建议等..."
						placeholder-style="color: #BDBDBD; font-size: 28rpx;"
						:maxlength="500"
					></textarea>
				</view>
			</view>

			<!-- Magic Card -->
			<view class="magic-card fade-in">
				<view class="magic-content">
					<text class="magic-icon">✨</text>
					<text class="magic-title">此报告尚未解读</text>
					<text class="magic-desc">点击下方按钮，由 AI 医生为您提供专业建议</text>
				</view>
			</view>

			<!-- Action Button -->
			<view class="action-section">
				<view class="analyze-btn" :class="{ 'btn-disabled': isAnalyzing }" @tap="handleFullAnalyze">
					<view v-if="isAnalyzing" class="btn-spinner"></view>
					<text v-else class="analyze-icon">🤖</text>
					<text class="analyze-text">{{ isAnalyzing ? analyzingStep : '立即使用 AI 智能解读并归档' }}</text>
				</view>

				<!-- Save form data only (no AI) -->
				<view class="save-btn" @tap="handleSaveFormOnly">
					<text class="save-text">仅保存信息（暂不解读）</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const DEFAULT_MODEL = 'deepseek'

const report = ref(null)
const reportImageUrl = ref('')
const isLoading = ref(true)
const loadError = ref('')
const isAnalyzing = ref(false)
const analyzingStep = ref('')

const form = ref({
	report_type: 'other',
	report_date: '',
	pregnancy_week: '',
	notes: ''
})

const typeOptions = [
	{ value: 'blood_routine', label: '🩸 血常规', icon: '🩸' },
	{ value: 'urine_routine', label: '💧 尿常规', icon: '💧' },
	{ value: 'down_screening', label: '🧬 唐氏筛查', icon: '🧬' },
	{ value: 'glucose_tolerance', label: '🍬 糖耐量', icon: '🍬' },
	{ value: 'ultrasound', label: '🔬 B超检查', icon: '🔬' },
	{ value: 'cardiotocography', label: '💓 胎心监护', icon: '💓' },
	{ value: 'other', label: '📄 其他', icon: '📄' }
]

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

		if (res.result.data?.length > 0) {
			report.value = res.result.data[0]

			// Pre-fill form from existing data
			form.value.report_type = report.value.report_type || 'other'
			form.value.pregnancy_week = report.value.week_of_pregnancy?.toString() || ''
			form.value.notes = report.value.notes || ''

			// Resolve image URL
			if (report.value.file_urls?.[0]) {
				try {
					const urlRes = await uniCloud.getTempFileURL({ fileList: [report.value.file_urls[0]] })
					if (urlRes.fileList?.[0]) {
						reportImageUrl.value = urlRes.fileList[0].tempFileURL
					}
				} catch (e) { console.error('Temp URL error:', e) }
			}
		} else {
			loadError.value = '报告不存在'
		}
	} catch (error) {
		console.error('Load report error:', error)
		loadError.value = '网络错误，请重试'
	} finally {
		isLoading.value = false
	}
}

// 提取纯文本数组给 picker 使用
const typeLabels = typeOptions.map(o => o.label)

// 处理 picker 选择事件
const onTypeChange = (e) => {
	form.value.report_type = typeOptions[e.detail.value].value
}

const onDateChange = (e) => { form.value.report_date = e.detail.value }

// Save form data only (no AI)
const handleSaveFormOnly = async () => {
	try {
		uni.showLoading({ title: '保存中...', mask: true })
		const db = uniCloud.database()

		const updateData = {
			report_type: form.value.report_type,
			report_name: getReportTypeName(form.value.report_type),
			notes: form.value.notes || '',
			ai_status: 'manual'
		}
		if (form.value.report_date) updateData.report_date = form.value.report_date
		if (form.value.pregnancy_week) updateData.week_of_pregnancy = parseInt(form.value.pregnancy_week)

		await db.collection('momcare_reports').doc(report.value._id).update(updateData)

		uni.hideLoading()
		uni.showToast({ title: '保存成功', icon: 'success' })
		setTimeout(() => uni.navigateBack(), 800)
	} catch (error) {
		uni.hideLoading()
		console.error('Save form error:', error)
		uni.showToast({ title: '保存失败', icon: 'none' })
	}
}

// Full AI Analysis: OCR → LLM → Save → Navigate to detail
const handleFullAnalyze = async () => {
	if (isAnalyzing.value) return

	// First save form data
	try {
		isAnalyzing.value = true
		analyzingStep.value = '保存报告信息...'

		const db = uniCloud.database()
		const formUpdate = {
			report_type: form.value.report_type,
			report_name: getReportTypeName(form.value.report_type),
			notes: form.value.notes || ''
		}
		if (form.value.report_date) formUpdate.report_date = form.value.report_date
		if (form.value.pregnancy_week) formUpdate.week_of_pregnancy = parseInt(form.value.pregnancy_week)

		await db.collection('momcare_reports').doc(report.value._id).update(formUpdate)

		// Step 1: OCR
		const fileID = report.value.file_urls?.[0]
		if (!fileID) throw new Error('无报告图片')

		analyzingStep.value = 'AI 识别文字中...'
		const ocrRes = await uniCloud.callFunction({
			name: 'extractReportOCR',
			data: { fileID }
		})
		if (ocrRes.result.errCode !== 0) throw new Error(ocrRes.result.errMsg || 'OCR 提取失败')
		const ocrText = ocrRes.result.data.text

		// Step 2: AI Analysis
		analyzingStep.value = 'AI 医生解读中...'
		const aiRes = await uniCloud.callFunction({
			name: 'analyzeReportAI',
			data: { ocrText, modelChoice: DEFAULT_MODEL }
		})
		if (aiRes.result.errCode !== 0) throw new Error(aiRes.result.errMsg || 'AI 解读失败')
		const aiData = aiRes.result.data

		// Step 3: Save AI results
		analyzingStep.value = '保存结果中...'
		await db.collection('momcare_reports').doc(report.value._id).update({
			ai_status: 'completed',
			ocr_status: 'completed',
			ocr_text: ocrText,
			llm_used: aiData.llm_used || DEFAULT_MODEL,
			report_type: aiData.report_type || form.value.report_type,
			report_name: aiData.report_type || getReportTypeName(form.value.report_type),
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

		uni.showToast({ title: '解读完成!', icon: 'success' })

		// Navigate to detail page (replace current page)
		setTimeout(() => {
			uni.redirectTo({ url: `/pages/reports/detail?id=${report.value._id}` })
		}, 600)

	} catch (error) {
		console.error('AI analysis error:', error)
		uni.showToast({ title: error.message || '解读失败，请重试', icon: 'none' })
	} finally {
		isAnalyzing.value = false
		analyzingStep.value = ''
	}
}

// Preview image
const previewImage = () => {
	if (reportImageUrl.value) {
		uni.previewImage({ urls: [reportImageUrl.value], current: reportImageUrl.value })
	}
}

// Utilities
const getReportIcon = (t) => ({ blood_routine:'🩸', urine_routine:'💧', down_screening:'🧬', glucose_tolerance:'🍬', ultrasound:'🔬', cardiotocography:'💓', other:'📄' })[t] || '📄'
const getReportTypeName = (t) => ({ blood_routine:'血常规检查', urine_routine:'尿常规检查', down_screening:'唐氏筛查', glucose_tolerance:'糖耐量检查', ultrasound:'B超检查', cardiotocography:'胎心监护', other:'其他检查' })[t] || '产检报告'
</script>

<style scoped lang="scss">
.page-container { min-height: 100vh; background-color: #F5F7FA; }

/* Loading */
.loading-state { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 70vh; }
.spinner { width: 64rpx; height: 64rpx; border: 6rpx solid #E8EAED; border-top-color: #C2185B; border-radius: 50%; animation: spin .8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.loading-text { font-size: 28rpx; color: #9E9E9E; margin-top: 24rpx; }

/* Error */
.error-state { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 70vh; }
.error-icon { font-size: 120rpx; margin-bottom: 24rpx; }
.error-title { font-size: 36rpx; font-weight: 600; color: #191C1E; margin-bottom: 12rpx; }
.error-desc { font-size: 28rpx; color: #757575; margin-bottom: 32rpx; }
.error-retry { font-size: 30rpx; color: #C2185B; font-weight: 500; padding: 20rpx 48rpx; border: 2rpx solid #C2185B; border-radius: 48rpx; }

.content-area { padding: 24rpx 32rpx; }

/* Image Card */
.image-card { background-color: #FFF; border-radius: 32rpx; overflow: hidden; margin-bottom: 24rpx; }
.report-image { width: 100%; }
.image-placeholder { height: 300rpx; display: flex; flex-direction: column; align-items: center; justify-content: center; background-color: #F5F7FA; }
.placeholder-icon { font-size: 80rpx; margin-bottom: 12rpx; }
.placeholder-text { font-size: 28rpx; color: #9E9E9E; }
.image-action { padding: 20rpx; text-align: center; border-top: 1rpx solid rgba(0,0,0,.05); }
.image-action-text { font-size: 28rpx; color: #C2185B; font-weight: 500; }

/* Section Card */
.section-card { background-color: #FFF; border-radius: 32rpx; padding: 32rpx; margin-bottom: 24rpx; }
.section-title { display: block; font-size: 30rpx; font-weight: 600; color: #191C1E; margin-bottom: 24rpx; }

/* Form Fields */
.form-field { display: flex; align-items: center; justify-content: space-between; padding: 12rpx 0; }
.form-field-vertical { display: flex; flex-direction: column; padding: 12rpx 0; }
.field-label { font-size: 28rpx; color: #757575; flex-shrink: 0; width: 140rpx; }
.field-value-row { display: flex; align-items: center; gap: 12rpx; flex: 1; justify-content: flex-end; }
.field-icon { font-size: 28rpx; }
.field-value { font-size: 28rpx; color: #191C1E; font-weight: 500; }
.field-value.placeholder { color: #BDBDBD; font-weight: 400; }
.field-arrow { font-size: 28rpx; color: #BDBDBD; }
.field-input { flex: 1; text-align: right; font-size: 28rpx; color: #191C1E; padding: 8rpx 0; }
.field-suffix { font-size: 28rpx; color: #9E9E9E; margin-left: 8rpx; }
.field-textarea { width: 100%; height: 160rpx; font-size: 28rpx; color: #191C1E; padding: 16rpx; background-color: #F5F7FA; border-radius: 16rpx; margin-top: 12rpx; box-sizing: border-box; }
.field-divider { height: 1rpx; background-color: rgba(0,0,0,.05); margin: 8rpx 0; }

/* Magic Card */
.magic-card { background: linear-gradient(135deg, #FCE7F3, #F8BBD0); border-radius: 32rpx; padding: 48rpx 32rpx; margin-bottom: 24rpx; border: 2rpx solid rgba(194,24,91,.1); }
.magic-content { display: flex; flex-direction: column; align-items: center; }
.magic-icon { font-size: 80rpx; margin-bottom: 20rpx; }
.magic-title { font-size: 34rpx; font-weight: 600; color: #C2185B; margin-bottom: 12rpx; }
.magic-desc { font-size: 28rpx; color: #880E4F; opacity: .7; text-align: center; line-height: 1.5; }

.fade-in { animation: fadeIn .5s ease; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(20rpx); } to { opacity: 1; transform: translateY(0); } }

/* Action Section */
.action-section { padding: 16rpx 0 64rpx; }
.analyze-btn { display: flex; align-items: center; justify-content: center; gap: 12rpx; background: linear-gradient(135deg, #C2185B, #E91E63); padding: 28rpx; border-radius: 48rpx; box-shadow: 0 8rpx 24rpx rgba(194,24,91,.25); margin-bottom: 20rpx; transition: opacity .2s; }
.analyze-btn:active { opacity: .9; }
.btn-disabled { opacity: .8; pointer-events: none; }
.analyze-icon { font-size: 32rpx; }
.analyze-text { font-size: 30rpx; color: #FFF; font-weight: 500; }
.btn-spinner { width: 32rpx; height: 32rpx; border: 4rpx solid rgba(255,255,255,.3); border-top-color: #FFF; border-radius: 50%; animation: spin .8s linear infinite; }

.save-btn { display: flex; align-items: center; justify-content: center; padding: 20rpx; border-radius: 48rpx; border: 2rpx solid #E0E0E0; }
.save-text { font-size: 28rpx; color: #9E9E9E; }
</style>
