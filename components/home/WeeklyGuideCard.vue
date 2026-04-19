<template>
	<view class="guide-card" @tap="handleTap">
		<!-- Header -->
		<view class="guide-header">
			<view class="week-badge">
				<text class="week-badge-text">{{ weekInfo?.week || '--' }}周</text>
			</view>
			<view class="guide-header-text">
				<text class="guide-title">{{ guideTitle }}</text>
				<text class="guide-subtitle">{{ guideSubtitle }}</text>
			</view>
		</view>

		<!-- Tags -->
		<view class="guide-tags">
			<view class="tag tag-baby" v-for="(tag, idx) in babyTags" :key="'baby-' + idx">
				<text class="tag-text">{{ tag }}</text>
			</view>
			<view class="tag tag-mom" v-for="(tag, idx) in momTags" :key="'mom-' + idx">
				<text class="tag-text">{{ tag }}</text>
			</view>
			<view class="tag tag-food" v-for="(tag, idx) in foodTags" :key="'food-' + idx">
				<text class="tag-text">{{ tag }}</text>
			</view>
		</view>

		<!-- Footer -->
		<view class="guide-footer">
			<text class="guide-read-link">阅读本周完整孕期指南 ›</text>
		</view>
	</view>
</template>

<script setup>
import { computed } from 'vue'
import { getTrimester, getTrimesterName } from '@/stores/health.js'

const props = defineProps({
	weekInfo: {
		type: Object,
		default: () => ({ week: 0, day: 0, total: 0 })
	},
	daysUntilDue: {
		type: Number,
		default: 0
	}
})

const emit = defineEmits(['tapCard'])

const week = computed(() => props.weekInfo?.week || 0)

const trimester = computed(() => getTrimester(week.value))
const trimesterName = computed(() => getTrimesterName(trimester.value))

const guideTitle = computed(() => {
	const w = week.value
	if (!w) return '加载中...'
	return `第${w}周孕期指南`
})

const guideSubtitle = computed(() => {
	const w = week.value
	if (!w) return ''
	return `${trimesterName.value} · 距预产期还有${props.daysUntilDue}天`
})

// Mock data for tags based on the current week
const babyTags = computed(() => {
	const w = week.value
	if (w <= 12) return ['👶 胚胎成形', '💓 心脏跳动']
	if (w <= 16) return ['👶 骨骼发育', '👐 开始活动']
	if (w <= 20) return ['👶 感觉发育', '👂 听到声音']
	if (w <= 24) return ['👶 快速生长', '👣 胎动明显']
	if (w <= 28) return ['👶 眼睛睁开', '🫁 肺部成熟']
	if (w <= 32) return ['👶 大脑发育', '💪 脂肪积累']
	if (w <= 36) return ['👶 皮下脂肪', '🔄 胎位固定']
	return ['👶 发育完成', '📦 准备出生']
})

const momTags = computed(() => {
	const w = week.value
	if (w <= 12) return ['🤰 早孕反应', '😴 容易疲劳']
	if (w <= 16) return ['🤰 肚子微凸', '🍽 食欲恢复']
	if (w <= 20) return ['🤰 胎动感知', '💕 情绪波动']
	if (w <= 24) return ['🤰 腰酸背痛', '🩺 定期产检']
	if (w <= 28) return ['🤰 行动不便', '😴 睡眠困难']
	if (w <= 32) return ['🤰 水肿明显', '😮‍💨 气短乏力']
	if (w <= 36) return ['🤰 尿频加重', '🏥 待产准备']
	return ['🤰 随时待产', '🏥 准备入院']
})

const foodTags = computed(() => {
	const w = week.value
	if (w <= 12) return ['🥬 叶酸补充', '🚫 避免生食']
	if (w <= 16) return ['🥛 补钙重要', '🥩 优质蛋白']
	if (w <= 20) return ['🐟 DHA摄入', '🍊 维生素C']
	if (w <= 24) return ['🥜 补铁食物', '💧 多喝水']
	if (w <= 28) return ['🫘 膳食纤维', '🧂 少盐饮食']
	if (w <= 32) return ['🥚 高蛋白', '🍌 防便秘']
	if (w <= 36) return ['🍲 少量多餐', '🫐 抗氧化食物']
	return ['🍯 补充能量', '🍼 准备哺乳']
})

function handleTap() {
	const w = week.value
	if (w) {
		uni.navigateTo({ url: `/pages/guide/weekly-guide?week=${w}` })
	}
	emit('tapCard')
}

// 宝宝发育摘要数据
const babySummaryData = {
	4: { icon: '🫘', text: '胚胎刚着床，细胞快速分裂' },
	5: { icon: '🍎', text: '心脏开始形成并跳动' },
	6: { icon: '🫐', text: '面部五官开始成形' },
	7: { icon: '🫐', text: '手指脚趾开始分化' },
	8: { icon: '🍇', text: '四肢可活动，尾巴消失' },
	9: { icon: '🍒', text: '所有器官已初步形成' },
	10: { icon: '🍓', text: '手指脚趾完全分开' },
	11: { icon: '🍋', text: '生殖器开始发育' },
	12: { icon: '🍋', text: '骨骼硬化，能做表情' },
	13: { icon: '🍑', text: '指纹已形成' },
	14: { icon: '🍋', text: '长出细软胎毛' },
	16: { icon: '🥑', text: '可能在吸吮手指' },
	18: { icon: '🫑', text: '能听到声音了' },
	20: { icon: '🍌', text: '全身覆盖胎脂' },
	22: { icon: '🥭', text: '眉毛眼睑成型' },
	24: { icon: '🌽', text: '肺部快速发育' },
	26: { icon: '🥬', text: '眼睛能睁开了' },
	28: { icon: '🍆', text: '约1kg，能做梦了' },
	29: { icon: '🥥', text: '骨骼在快速钙化' },
	30: { icon: '🥥', text: '约1.3kg，大脑快速发育' },
	31: { icon: '🥥', text: '五官精致，能转头' },
	32: { icon: '👶', text: '约1.8kg，头部开始朝下入盆' },
	33: { icon: '👶', text: '约2kg，皮肤不再红皱' },
	34: { icon: '🧠', text: '约2.2kg，中枢神经系统成熟中' },
	35: { icon: '✨', text: '约2.4kg，皮下脂肪丰满' },
	36: { icon: '🍈', text: '约2.6kg，头部入盆固定' },
	37: { icon: '🍈', text: '约2.9kg，肺部已成熟' },
	38: { icon: '🍉', text: '约3.1kg，继续积累脂肪' },
	39: { icon: '🍉', text: '约3.3kg，已足月完全成熟' },
	40: { icon: '🍉', text: '约3.5kg，已完全成熟准备出生' }
}

const momSummaryData = {
	4: { icon: '🌡', text: '可能出现轻微腹痛' },
	5: { icon: '💊', text: '早孕反应可能出现' },
	6: { icon: '😴', text: '嗜睡乏力，乳房胀痛' },
	7: { icon: '🤢', text: '孕吐高峰，嗅觉敏感' },
	8: { icon: '🩲', text: '腰围变粗，子宫如拳头大' },
	9: { icon: '😤', text: '情绪波动大' },
	10: { icon: '💫', text: '孕吐减轻，食欲恢复' },
	11: { icon: '😊', text: '早孕反应消退，舒适期' },
	12: { icon: '💪', text: '流产风险降低' },
	13: { icon: '🌟', text: '孕中期开始，精力恢复' },
	14: { icon: '🎀', text: '腹部微微隆起' },
	16: { icon: '🎈', text: '肚子明显隆起，开始显怀' },
	18: { icon: '🦶', text: '胎动明显' },
	20: { icon: '📐', text: '宫底到肚脐' },
	22: { icon: '🦵', text: '腿部可能开始抽筋' },
	24: { icon: '🔍', text: '肚子更圆更大' },
	26: { icon: '💤', text: '睡眠质量下降' },
	28: { icon: '📊', text: '进入孕晚期，产检更频繁' },
	29: { icon: '📋', text: '假性宫缩可能出现' },
	30: { icon: '💓', text: '容易气短' },
	31: { icon: '🫁', text: '气短尿频加重' },
	32: { icon: '💆', text: '气短与胃部不适明显' },
	33: { icon: '🦵', text: '骨盆韧带松弛' },
	34: { icon: '🫁', text: '胎头入盆后呼吸轻松些' },
	35: { icon: '🤱', text: '初乳开始分泌' },
	36: { icon: '💪', text: '下腹坠胀，尿频严重' },
	37: { icon: '🎯', text: '宝宝入盆，胃部轻松些' },
	38: { icon: '⏰', text: '随时可能发动' },
	39: { icon: '🏥', text: '随时准备入院待产' },
	40: { icon: '🌹', text: '临产在即，调整好心态' }
}

function findClosestWeekData(w, dataMap) {
	const keys = Object.keys(dataMap).map(Number).sort((a, b) => a - b)
	let result = keys[0]
	for (const k of keys) {
		if (k <= w) result = k
		else break
	}
	return dataMap[result] || { icon: '👶', text: '发育中...' }
}

const babySummary = computed(() => findClosestWeekData(week.value, babySummaryData))
const momSummary = computed(() => findClosestWeekData(week.value, momSummaryData))
</script>

<style scoped lang="scss">
.guide-card {
	background: white;
	border-radius: 32rpx;
	padding: 24rpx 28rpx 0;
	box-shadow: 0 4rpx 28rpx rgba(60, 30, 10, 0.07);
	margin: 20rpx 24rpx 0;
	overflow: hidden;
}

/* Header */
.guide-header {
	display: flex;
	align-items: center;
	margin-bottom: 20rpx;
}

/* Summary */
.guide-summary {
	display: flex;
	flex-direction: column;
	gap: 12rpx;
	margin-bottom: 20rpx;
}

.summary-item {
	display: flex;
	align-items: flex-start;
	gap: 12rpx;
	padding: 16rpx 20rpx;
	border-radius: 16rpx;
}

.summary-baby {
	background: rgba(212, 98, 122, 0.06);
	border-left: 4rpx solid #D4627A;
}

.summary-mom {
	background: rgba(123, 160, 140, 0.06);
	border-left: 4rpx solid #7BA08C;
}

.summary-icon {
	font-size: 28rpx;
	flex-shrink: 0;
	margin-top: 2rpx;
}

.summary-content {
	flex: 1;
}

.summary-label {
	font-size: 18rpx;
	font-weight: 700;
	color: #9C9890;
	letter-spacing: 2rpx;
	display: block;
	margin-bottom: 4rpx;
}

.summary-text {
	font-size: 24rpx;
	color: #4A4844;
	line-height: 1.5;
	display: block;
}

.week-badge {
	width: 88rpx;
	height: 88rpx;
	background: linear-gradient(135deg, #E8637A 0%, #C2185B 100%);
	border-radius: 24rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
	margin-right: 24rpx;
}

.week-badge-text {
	font-size: 28rpx;
	font-weight: 700;
	color: #FFFFFF;
	line-height: 1;
}

.guide-header-text {
	flex: 1;
	display: flex;
	flex-direction: column;
	justify-content: center;
}

.guide-title {
	display: block;
	font-size: 34rpx;
	font-weight: 600;
	color: #1C1A17;
	line-height: 1.3;
	margin-bottom: 6rpx;
}

.guide-subtitle {
	display: block;
	font-size: 24rpx;
	color: #9E8A90;
	line-height: 1.4;
}

/* Tags */
.guide-tags {
	display: flex;
	flex-wrap: wrap;
	gap: 16rpx;
	margin-bottom: 28rpx;
}

.tag {
	display: inline-flex;
	align-items: center;
	padding: 10rpx 20rpx;
	border-radius: 24rpx;
}

.tag-text {
	font-size: 22rpx;
	line-height: 1.3;
}

.tag-baby {
	background-color: #FCE7F3;
}

.tag-baby .tag-text {
	color: #C2185B;
}

.tag-mom {
	background-color: #E8F5E9;
}

.tag-mom .tag-text {
	color: #2E7D32;
}

.tag-food {
	background-color: #FFF8E1;
}

.tag-food .tag-text {
	color: #E65100;
}

/* Footer */
.guide-footer {
	border-top: 2rpx solid #E8DDD0;
	padding: 24rpx 0 28rpx;
	display: flex;
	align-items: center;
	justify-content: flex-end;
}

.guide-read-link {
	font-size: 26rpx;
	font-weight: 500;
	color: #C2185B;
}
</style>
