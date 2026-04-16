import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// 孕期计算工具函数
export function calcPregDay(lmpDate, targetDate) {
	const a = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate())
	const b = new Date(lmpDate.getFullYear(), lmpDate.getMonth(), lmpDate.getDate())
	return Math.floor((a - b) / 86400000)
}

export function calcWeekInfo(lmpDate, targetDate) {
	const n = calcPregDay(lmpDate, targetDate)
	if (n < 0) return null
	return { week: Math.floor(n / 7) + 1, day: n % 7, total: n }
}

export function getTrimester(week) {
	if (week <= 12) return 'early'
	if (week <= 27) return 'mid'
	return 'late'
}

export function getTrimesterName(t) {
	return t === 'early' ? '孕早期' : t === 'mid' ? '孕中期' : '孕晚期'
}

// 宝宝大小比喻数据
const FRUIT_DATA = {
	4: { emoji: '🫘', name: '罂粟籽' },
	5: { emoji: '🍎', name: '苹果籽' },
	6: { emoji: '🫐', name: '蓝莓' },
	7: { emoji: '🫐', name: '蓝莓' },
	8: { emoji: '🍇', name: '葡萄' },
	9: { emoji: '🍒', name: '樱桃' },
	10: { emoji: '🍓', name: '草莓' },
	11: { emoji: '🍋', name: '柠檬' },
	12: { emoji: '🍋', name: '柠檬' },
	13: { emoji: '🍑', name: '桃子' },
	14: { emoji: '🍋', name: '柠檬' },
	16: { emoji: '🥑', name: '牛油果' },
	18: { emoji: '🫑', name: '甜椒' },
	20: { emoji: '🍌', name: '香蕉' },
	22: { emoji: '🥭', name: '芒果' },
	24: { emoji: '🌽', name: '玉米' },
	26: { emoji: '🥬', name: '生菜' },
	28: { emoji: '🍆', name: '茄子' },
	30: { emoji: '🥥', name: '椰子' },
	32: { emoji: '🥬', name: '大白菜' },
	34: { emoji: '🍈', name: '甜瓜' },
	36: { emoji: '🍯', name: '蜜瓜' },
	38: { emoji: '🍉', name: '西瓜' },
	40: { emoji: '🍉', name: '西瓜' }
}

export function getFruitComparison(week) {
	const keys = Object.keys(FRUIT_DATA).map(Number).sort((a, b) => a - b)
	let result = FRUIT_DATA[4]
	for (const k of keys) {
		if (week >= k) result = FRUIT_DATA[k]
	}
	return result
}

export const useHealthStore = defineStore('health', () => {
	// ── State ──
	const lmpDate = ref(new Date(2024, 7, 29)) // 末次月经 2024-08-29
	const dueDate = ref(new Date(2025, 5, 5)) // 预产期 2025-06-05
	const records = ref({}) // { 'YYYY-MM-DD': { weight, bp, mood, symptoms, fetal, note, plans } }

	const userInfo = ref({
		nickname: '小柚子的妈妈',
		avatar: '🌸',
		hospital: '北京协和医院',
		babyNickname: '小柚子'
	})

	// ── Getters ──
	const today = computed(() => new Date())

	const todayWeekInfo = computed(() => calcWeekInfo(lmpDate.value, today.value))

	const daysUntilDue = computed(() => {
		const diff = dueDate.value.getTime() - today.value.getTime()
		return Math.max(0, Math.ceil(diff / 86400000))
	})

	const totalPregDays = computed(() => {
		return todayWeekInfo.value ? todayWeekInfo.value.total : 0
	})

	const progressPercent = computed(() => {
		if (!todayWeekInfo.value) return 0
		return Math.min(100, Math.round((todayWeekInfo.value.total / 280) * 1000) / 10)
	})

	const trimester = computed(() => {
		if (!todayWeekInfo.value) return 'early'
		return getTrimester(todayWeekInfo.value.week)
	})

	const fruitComparison = computed(() => {
		if (!todayWeekInfo.value) return { emoji: '🫘', name: '种子' }
		return getFruitComparison(todayWeekInfo.value.week)
	})

	function getRecordKey(date) {
		const y = date.getFullYear()
		const m = String(date.getMonth() + 1).padStart(2, '0')
		const d = String(date.getDate()).padStart(2, '0')
		return `${y}-${m}-${d}`
	}

	function getRecord(date) {
		return records.value[getRecordKey(date)] || null
	}

	function hasRecord(date) {
		const r = getRecord(date)
		return r && (r.weight || r.bp || r.mood || r.fetal || r.note)
	}

	function getWeekInfo(date) {
		return calcWeekInfo(lmpDate.value, date)
	}

	function isToday(date) {
		return date.getFullYear() === today.value.getFullYear() &&
			date.getMonth() === today.value.getMonth() &&
			date.getDate() === today.value.getDate()
	}

	function isDueDate(date) {
		return date.getFullYear() === dueDate.value.getFullYear() &&
			date.getMonth() === dueDate.value.getMonth() &&
			date.getDate() === dueDate.value.getDate()
	}

	// ── Actions ──

	// 加载健康记录（从本地存储读取 mock 数据）
	function loadRecords() {
		try {
			const saved = uni.getStorageSync('health_records')
			if (saved) {
				records.value = JSON.parse(saved)
			}
		} catch (e) {
			console.error('loadRecords error:', e)
		}
	}

	// 保存记录
	function saveRecord(date, data) {
		const key = getRecordKey(date)
		records.value[key] = { ...records.value[key], ...data }
		try {
			uni.setStorageSync('health_records', JSON.stringify(records.value))
		} catch (e) {
			console.error('saveRecord error:', e)
		}
	}

	// 获取问候语
	function getGreeting() {
		const hour = new Date().getHours()
		if (hour < 6) return '夜深了，宝妈'
		if (hour < 11) return '早上好，宝妈'
		if (hour < 14) return '中午好，宝妈'
		if (hour < 18) return '下午好，宝妈'
		return '晚上好，宝妈'
	}

	return {
		// state
		lmpDate,
		dueDate,
		records,
		userInfo,
		// getters
		today,
		todayWeekInfo,
		daysUntilDue,
		totalPregDays,
		progressPercent,
		trimester,
		fruitComparison,
		// methods
		getRecordKey,
		getRecord,
		hasRecord,
		getWeekInfo,
		isToday,
		isDueDate,
		// actions
		loadRecords,
		saveRecord,
		getGreeting
	}
})
