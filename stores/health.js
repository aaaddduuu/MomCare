import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { request, isLoggedIn as isAuthed } from '@/utils/api.js'
import { useReportStore } from '@/stores/report.js'

// 孕期计算工具函数
export function calcPregDay(lmpDate, targetDate) {
	const a = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate())
	const b = new Date(lmpDate.getFullYear(), lmpDate.getMonth(), lmpDate.getDate())
	return Math.floor((a - b) / 86400000)
}

export function calcWeekInfo(lmpDate, targetDate) {
	const n = calcPregDay(lmpDate, targetDate)
	if (n < 0) return null
	return { week: Math.floor(n / 7), day: n % 7, total: n }
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
  6: { emoji: '🫛', name: '甜豌豆' },
  7: { emoji: '🫐', name: '蓝莓' },
  8: { emoji: '🍇', name: '葡萄' },
  9: { emoji: '🍒', name: '樱桃' },
  10: { emoji: '🍓', name: '草莓' },
  11: { emoji: '🍋', name: '青柠' },
  12: { emoji: '🥝', name: '猕猴桃' },
  13: { emoji: '🍑', name: '桃子' },
  14: { emoji: '🍋', name: '柠檬' },
  15: { emoji: '🍎', name: '苹果' },
  16: { emoji: '🥑', name: '牛油果' },
  17: { emoji: '🧅', name: '洋葱' },
  18: { emoji: '🫑', name: '甜椒' },
  19: { emoji: '🍅', name: '大番茄' },
  20: { emoji: '🍌', name: '香蕉' },
  21: { emoji: '🥕', name: '胡萝卜' },
  22: { emoji: '🥭', name: '芒果' },
  23: { emoji: '🍠', name: '红薯' },
  24: { emoji: '🌽', name: '玉米' },
  25: { emoji: '🥦', name: '花椰菜' },
  26: { emoji: '🥬', name: '生菜' },
  27: { emoji: '🍆', name: '小茄子' },
  28: { emoji: '🍆', name: '长茄子' },
  29: { emoji: '🥥', name: '小椰子' },
  30: { emoji: '🥥', name: '椰子' },
  31: { emoji: '🍍', name: '菠萝' },
  32: { emoji: '🥬', name: '大白菜' },
  33: { emoji: '🍈', name: '哈密瓜' },
  34: { emoji: '🍈', name: '甜瓜' },
  35: { emoji: '🍯', name: '小蜜瓜' },
  36: { emoji: '🍯', name: '蜜瓜' },
  37: { emoji: '🍉', name: '小西瓜' },
  38: { emoji: '🍉', name: '西瓜' },
  39: { emoji: '🎃', name: '南瓜' },
  40: { emoji: '🍉', name: '大西瓜' }
};

// 标准产检推荐时间表
const CHECKUP_TEMPLATES = [
	{
		dayOffset: 42,
		week: 7,
		label: '孕7周',
		required: ['早孕B超', '血常规', '尿常规', '血型', '甲状腺功能'],
		optional: []
	},
	{
		dayOffset: 84,
		week: 12,
		label: '孕12周',
		required: ['NT检查', '早期唐筛', '血常规', '尿常规'],
		optional: []
	},
	{
		dayOffset: 119,
		week: 17,
		label: '孕17周',
		required: ['中期唐筛', '血常规', '尿常规'],
		optional: ['无创DNA']
	},
	{
		dayOffset: 147,
		week: 21,
		label: '孕21周',
		required: ['大排畸B超', '血常规', '尿常规'],
		optional: []
	},
	{
		dayOffset: 182,
		week: 26,
		label: '孕26周',
		required: ['糖耐量试验(OGTT)', '血常规', '尿常规'],
		optional: []
	},
	{
		dayOffset: 203,
		week: 29,
		label: '孕29周',
		required: ['常规产检', '小排畸B超'],
		optional: []
	},
	{
		dayOffset: 224,
		week: 32,
		label: '孕32周',
		required: ['胎心监护(NST)', '血常规', '尿常规', 'B超'],
		optional: []
	},
	{
		dayOffset: 238,
		week: 34,
		label: '孕34周',
		required: ['胎心监护', '常规产检'],
		optional: []
	},
	{
		dayOffset: 252,
		week: 36,
		label: '孕36周',
		required: ['B超(评估胎位和羊水)', '胎心监护', '血常规'],
		optional: []
	},
	{
		dayOffset: 259,
		week: 37,
		label: '孕37周',
		required: ['胎心监护', '常规产检', '骨盆测量'],
		optional: []
	},
	{
		dayOffset: 266,
		week: 38,
		label: '孕38周',
		required: ['胎心监护', '常规产检'],
		optional: []
	},
	{
		dayOffset: 273,
		week: 39,
		label: '孕39周',
		required: ['胎心监护', 'B超'],
		optional: []
	},
	{
		dayOffset: 280,
		week: 40,
		label: '孕40周',
		required: ['胎心监护', '常规产检'],
		optional: []
	}
]

export function getFruitComparison(week) {
	const keys = Object.keys(FRUIT_DATA).map(Number).sort((a, b) => a - b)
	let result = FRUIT_DATA[4]
	for (const k of keys) {
		if (week >= k) result = FRUIT_DATA[k]
	}
	return result
}

// ── 本地存储辅助 ──
const STORAGE_KEY = 'YUNTU_HEALTH_DATA'

function _loadStorage() {
	try {
		const raw = uni.getStorageSync(STORAGE_KEY)
		return raw ? JSON.parse(raw) : null
	} catch (e) {
		console.error('_loadStorage error:', e)
		return null
	}
}

function _saveStorage(data) {
	try {
		uni.setStorageSync(STORAGE_KEY, JSON.stringify(data))
	} catch (e) {
		console.error('_saveStorage error:', e)
	}
}

// 一次性迁移旧存储键到统一键
function _migrateOldKeys() {
	if (_loadStorage()) return

	const data = {
		lmpDate: null,
		dueDate: null,
		userInfo: { nickname: '', avatar: '🌸', hospital: '', babyNickname: '' },
		records: {},
		checkupSchedules: [],
		openid: ''
	}

	try {
		const profileRaw = uni.getStorageSync('user_profile')
		if (profileRaw) {
			const profile = JSON.parse(profileRaw)
			if (profile.lmpDate) data.lmpDate = profile.lmpDate
			if (profile.dueDate) data.dueDate = profile.dueDate
			if (profile.userInfo) Object.assign(data.userInfo, profile.userInfo)
		}

		const recordsRaw = uni.getStorageSync('health_records')
		if (recordsRaw) {
			data.records = JSON.parse(recordsRaw)
		}

		const guestId = uni.getStorageSync('guest_id')
		if (guestId) data.openid = guestId
	} catch (e) {
		console.warn('_migrateOldKeys: migration partial', e)
	}

	_saveStorage(data)
}

export const useHealthStore = defineStore('health', () => {
	// ── State ──
	const lmpDate = ref(null)
	const dueDate = ref(null)
	const records = ref({})
	const userProfileLoaded = ref(false)

	const userInfo = ref({
		nickname: '',
		avatar: '🌸',
		hospital: '',
		babyNickname: ''
	})

	const checkupSchedules = ref([])
	const isLoggedIn = ref(false)
	const openid = ref('')

	// ── Persist helper: serialize current state to localStorage ──
	function _persist() {
		_saveStorage({
			lmpDate: lmpDate.value ? lmpDate.value.toISOString() : null,
			dueDate: dueDate.value ? dueDate.value.toISOString() : null,
			userInfo: { ...userInfo.value },
			records: records.value,
			checkupSchedules: checkupSchedules.value,
			openid: openid.value
		})
	}

	// ── Getters ──
	const today = computed(() => new Date())

	const pregInfoSet = computed(() => lmpDate.value !== null)

	const todayWeekInfo = computed(() => {
		if (!lmpDate.value) return null
		return calcWeekInfo(lmpDate.value, today.value)
	})

	const daysUntilDue = computed(() => {
		if (!dueDate.value) return 0
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

	// ── 产检日程 Getters ──

	const nextCheckup = computed(() => {
		return checkupSchedules.value
			.filter(s => s.status === 'upcoming')
			.sort((a, b) => a.checkup_date.localeCompare(b.checkup_date))[0] || null
	})

	const completedCheckups = computed(() => {
		return checkupSchedules.value
			.filter(s => s.status === 'completed')
			.sort((a, b) => b.checkup_date.localeCompare(a.checkup_date))
	})

	const upcomingCheckups = computed(() => {
		return checkupSchedules.value
			.filter(s => s.status === 'upcoming')
			.sort((a, b) => a.checkup_date.localeCompare(b.checkup_date))
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
			date.getDate() === today.value.getDate()
	}

	// ── 用户资料 ──

	async function loadUserProfile() {
		const data = _loadStorage()
		if (data) {
			if (data.lmpDate) lmpDate.value = new Date(data.lmpDate)
			if (data.dueDate) dueDate.value = new Date(data.dueDate)
			if (data.userInfo) Object.assign(userInfo.value, data.userInfo)
			if (data.openid) openid.value = data.openid
		}
		userProfileLoaded.value = true
	}

	async function saveUserProfile() {
		_persist()
	}

	// Sync all profile data to backend D1 (write-through)
	async function syncProfileToCloud() {
		if (!isAuthed()) return false

		const updateData = {}
		if (dueDate.value) {
			const y = dueDate.value.getFullYear()
			const m = String(dueDate.value.getMonth() + 1).padStart(2, '0')
			const d = String(dueDate.value.getDate()).padStart(2, '0')
			updateData.expected_due_date = `${y}-${m}-${d}`
		}
		if (lmpDate.value) {
			const y = lmpDate.value.getFullYear()
			const m = String(lmpDate.value.getMonth() + 1).padStart(2, '0')
			const d = String(lmpDate.value.getDate()).padStart(2, '0')
			updateData.lmp_date = `${y}-${m}-${d}`
		}
		if (userInfo.value.nickname) {
			updateData.nickname = userInfo.value.nickname
		}
		updateData.profile_data = {
			babyNickname: userInfo.value.babyNickname || '',
			preWeight: userInfo.value.preWeight || '',
			height: userInfo.value.height || '',
			hospital: userInfo.value.hospital || '',
			doctor: userInfo.value.doctor || '',
			hospitalPhone: userInfo.value.hospitalPhone || '',
		}

		try {
			const res = await request({
				url: '/api/user/profile',
				method: 'PUT',
				data: updateData,
			})
			return res.statusCode === 200 && res.data?.code === 0
		} catch (e) {
			console.error('syncProfileToCloud failed:', e)
			return false
		}
	}

	// Fetch profile from backend and overwrite local state (cloud is source of truth)
	async function syncProfileFromCloud() {
		if (!isAuthed()) return false

		try {
			const res = await request({
				url: '/api/user/profile',
				method: 'GET',
			})
			if (res.statusCode === 200 && res.data?.code === 0) {
				const serverUser = res.data.data
				uni.setStorageSync('momcare_user', JSON.stringify(serverUser))

				if (serverUser.expected_due_date) {
					const due = new Date(serverUser.expected_due_date)
					if (!isNaN(due.getTime())) {
						dueDate.value = due
					}
				}
				if (serverUser.lmp_date) {
					const lmp = new Date(serverUser.lmp_date)
					if (!isNaN(lmp.getTime())) {
						lmpDate.value = lmp
					}
				} else if (serverUser.expected_due_date) {
					const due = new Date(serverUser.expected_due_date)
					lmpDate.value = new Date(due.getTime() - 280 * 86400000)
				}
				if (serverUser.nickname) {
					userInfo.value.nickname = serverUser.nickname
				}
				if (serverUser.profile_data) {
					const pd = serverUser.profile_data
					if (pd.babyNickname) userInfo.value.babyNickname = pd.babyNickname
					if (pd.preWeight) userInfo.value.preWeight = pd.preWeight
					if (pd.height) userInfo.value.height = pd.height
					if (pd.hospital) userInfo.value.hospital = pd.hospital
					if (pd.doctor) userInfo.value.doctor = pd.doctor
					if (pd.hospitalPhone) userInfo.value.hospitalPhone = pd.hospitalPhone
				}
				_persist()
				return true
			}
		} catch (e) {
			console.error('syncProfileFromCloud failed:', e)
		}
		return false
	}

	// Unified cloud sync: pull both profile and reports from cloud
	async function syncCloudData() {
		if (!isAuthed()) return false

		let profileOk = false
		let reportsOk = false

		try {
			profileOk = await syncProfileFromCloud()
		} catch (e) {
			console.error('syncCloudData: profile sync failed', e)
		}

		try {
			const reportStore = useReportStore()
			reportsOk = await reportStore.syncReportsFromCloud()
		} catch (e) {
			console.error('syncCloudData: reports sync failed', e)
		}

		return profileOk || reportsOk
	}

	// ── 健康记录（纯本地） ──

	async function loadRecords() {
		const data = _loadStorage()
		if (data && data.records) {
			records.value = data.records
		}
	}

	async function saveRecord(date, data) {
		const key = getRecordKey(date)
		records.value[key] = { ...records.value[key], ...data }
		_persist()
	}

	// ── 产检日程（纯本地） ──

	function _templateToSchedule(template, lmpDateVal, hospitalDefault) {
		const date = new Date(lmpDateVal.getTime() + template.dayOffset * 86400000)
		const dateKey = getRecordKey(date)
		const examItems = [
			...template.required.map(text => ({ text, required: true, done: false })),
			...template.optional.map(text => ({ text, required: false, done: false }))
		]
		return {
			_id: 'local_' + template.week + '_' + dateKey,
			checkup_date: dateKey,
			week_of_pregnancy: template.week,
			week_label: template.label,
			hospital: hospitalDefault || '',
			department: '产科门诊',
			time_slot: 'morning',
			status: 'upcoming',
			exam_items: examItems,
			notes: '',
			remind_days_before: [1, 3]
		}
	}

	async function loadCheckupSchedules() {
		const data = _loadStorage()
		if (data && data.checkupSchedules) {
			checkupSchedules.value = data.checkupSchedules
		}
	}

	async function initCheckupSchedules() {
		if (!lmpDate.value) return
		const hospitalDefault = userInfo.value.hospital || ''
		checkupSchedules.value = CHECKUP_TEMPLATES.map(template =>
			_templateToSchedule(template, lmpDate.value, hospitalDefault)
		)
		_persist()
	}

	async function updateCheckupSchedule(scheduleId, data) {
		const idx = checkupSchedules.value.findIndex(s => s._id === scheduleId)
		if (idx >= 0) {
			checkupSchedules.value[idx] = { ...checkupSchedules.value[idx], ...data }
		}
		_persist()
	}

	async function toggleExamItem(scheduleId, itemIdx) {
		const schedule = checkupSchedules.value.find(s => s._id === scheduleId)
		if (!schedule) return

		const items = schedule.exam_items.map(item => ({ ...item }))
		items[itemIdx].done = !items[itemIdx].done
		await updateCheckupSchedule(scheduleId, { exam_items: items })
	}

	async function markCheckupCompleted(scheduleId) {
		await updateCheckupSchedule(scheduleId, { status: 'completed' })
	}

	async function skipCheckup(scheduleId) {
		await updateCheckupSchedule(scheduleId, { status: 'skipped' })
	}

	async function addCustomExamItem(scheduleId, text) {
		const schedule = checkupSchedules.value.find(s => s._id === scheduleId)
		if (!schedule) return
		const items = schedule.exam_items.map(item => ({ ...item }))
		items.push({ text, required: false, done: false })
		await updateCheckupSchedule(scheduleId, { exam_items: items })
	}

	// ── 统计方法 ──

	function getWeightStats() {
		const entries = []
		for (const [dateKey, record] of Object.entries(records.value)) {
			if (record.weight) {
				entries.push({ date: dateKey, weight: record.weight })
			}
		}
		entries.sort((a, b) => b.date.localeCompare(a.date))

		if (entries.length === 0) {
			return { latest: null, gain: null, count: 0 }
		}

		const latest = parseFloat(entries[0].weight)
		const preWeight = parseFloat(userInfo.value.preWeight)
		let gain = null
		if (preWeight && latest) {
			gain = (latest - preWeight).toFixed(1)
		}

		return {
			latest: latest ? latest.toFixed(1) : null,
			gain: gain !== null ? (gain >= 0 ? `+${gain}` : gain) : null,
			preWeight: preWeight || null,
			count: entries.length
		}
	}

	function getBpStats() {
		const entries = []
		for (const [dateKey, record] of Object.entries(records.value)) {
			if (record.bp) {
				const parts = String(record.bp).split('/')
				const systolic = parts[0] ? parseInt(parts[0]) : 0
				const diastolic = parts[1] ? parseInt(parts[1]) : 0
				entries.push({
					date: dateKey,
					bpText: String(record.bp),
					systolic,
					diastolic,
					status: systolic >= 140 || diastolic >= 90 ? '偏高' : '正常'
				})
			}
		}
		entries.sort((a, b) => b.date.localeCompare(a.date))

		if (entries.length === 0) {
			return { latest: null, status: '', count: 0 }
		}

		return {
			latest: entries[0].bpText,
			status: entries[0].status,
			systolic: entries[0].systolic,
			diastolic: entries[0].diastolic,
			count: entries.length
		}
	}

	function getFetalStats() {
		const todayKey = getRecordKey(new Date())
		const yesterday = new Date()
		yesterday.setDate(yesterday.getDate() - 1)
		const yesterdayKey = getRecordKey(yesterday)

		const entries = []
		for (const [dateKey, record] of Object.entries(records.value)) {
			if (record.fetal) {
				entries.push({ date: dateKey, count: parseInt(record.fetal) || 0 })
			}
		}
		entries.sort((a, b) => b.date.localeCompare(a.date))

		const todayCount = entries.find(e => e.date === todayKey)?.count || 0
		const yesterdayCount = entries.find(e => e.date === yesterdayKey)?.count || 0

		return {
			today: todayCount,
			yesterday: yesterdayCount,
			count: entries.length
		}
	}

	function getWeightHistory() {
		const entries = []
		for (const [dateKey, record] of Object.entries(records.value)) {
			if (record.weight) {
				const weekInfo = calcWeekInfo(lmpDate.value, new Date(dateKey))
				entries.push({
					date: dateKey,
					dateDisplay: _formatDateDisplay(dateKey),
					week: weekInfo ? `孕${weekInfo.week}周+${weekInfo.day}` : '',
					weight: parseFloat(record.weight).toFixed(1),
					weekInfo
				})
			}
		}
		entries.sort((a, b) => b.date.localeCompare(a.date))

		for (let i = 0; i < entries.length; i++) {
			if (i < entries.length - 1) {
				const diff = (parseFloat(entries[i].weight) - parseFloat(entries[i + 1].weight)).toFixed(1)
				entries[i].diff = diff >= 0 ? `+${diff}` : diff
				entries[i].diffClass = diff > 0 ? 'diff-up' : diff < 0 ? 'diff-down' : 'diff-zero'
			} else {
				entries[i].diff = '±0'
				entries[i].diffClass = 'diff-zero'
			}
		}

		return entries
	}

	function getBpHistory() {
		const entries = []
		for (const [dateKey, record] of Object.entries(records.value)) {
			if (record.bp) {
				const parts = String(record.bp).split('/')
				const systolic = parts[0] ? parseInt(parts[0]) : 0
				const diastolic = parts[1] ? parseInt(parts[1]) : 0
				const weekInfo = calcWeekInfo(lmpDate.value, new Date(dateKey))
				entries.push({
					date: dateKey,
					dateDisplay: _formatDateDisplay(dateKey),
					week: weekInfo ? `孕${weekInfo.week}周+${weekInfo.day}` : '',
					systolic: String(systolic),
					diastolic: String(diastolic),
					bpText: String(record.bp),
					status: systolic >= 140 || diastolic >= 90 ? '偏高' : '正常',
					statusClass: systolic >= 140 || diastolic >= 90 ? 'badge-high' : 'badge-normal',
					weekInfo
				})
			}
		}
		entries.sort((a, b) => b.date.localeCompare(a.date))
		return entries
	}

	function getFetalHistory() {
		const entries = []
		for (const [dateKey, record] of Object.entries(records.value)) {
			if (record.fetal) {
				const weekInfo = calcWeekInfo(lmpDate.value, new Date(dateKey))
				entries.push({
					date: dateKey,
					dateDisplay: _formatDateDisplay(dateKey),
					week: weekInfo ? `孕${weekInfo.week}周+${weekInfo.day}` : '',
					count: parseInt(record.fetal) || 0,
					weekInfo
				})
			}
		}
		entries.sort((a, b) => b.date.localeCompare(a.date))

		const now = new Date()
		const year = now.getFullYear()
		const month = now.getMonth()
		const daysInMonth = new Date(year, month + 1, 0).getDate()
		const firstDayOfWeek = new Date(year, month, 1).getDay()

		const heatmapData = []
		for (let d = 1; d <= daysInMonth; d++) {
			const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
			const entry = entries.find(e => e.date === dateKey)
			const count = entry ? entry.count : 0
			heatmapData.push({
				day: d,
				count,
				heatClass: _getHeatLevel(count),
				isToday: d === now.getDate()
			})
		}

		return {
			entries,
			heatmap: {
				year,
				month,
				daysInMonth,
				firstDayOfWeek,
				data: heatmapData
			}
		}
	}

	function _getHeatLevel(count) {
		if (!count || count === 0) return 'heat-0'
		if (count >= 10 && count < 14) return 'heat-1'
		if (count >= 14 && count < 18) return 'heat-2'
		if (count >= 18 && count < 22) return 'heat-3'
		if (count >= 22) return 'heat-4'
		return 'heat-0'
	}

	function _formatDateDisplay(dateKey) {
		const parts = dateKey.split('-')
		return `${parseInt(parts[1])}月${parseInt(parts[2])}日`
	}

	function getGreeting() {
		const name = userInfo.value.nickname || '宝妈'
		const hour = new Date().getHours()
		if (hour < 6) return `夜深了，${name}`
		if (hour < 11) return `早上好，${name}`
		if (hour < 14) return `中午好，${name}`
		if (hour < 18) return `下午好，${name}`
		return `晚上好，${name}`
	}

	// ── 游客登录（纯本地） ──

	function generateGuestId() {
		const timestamp = Date.now()
		const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0')
		return `guest_${timestamp}${random}`
	}

	function generateGuestNickname() {
		const num = String(Math.floor(Math.random() * 100000)).padStart(5, '0')
		return `宝妈${num}`
	}

	async function silentLogin() {
		try {
			_migrateOldKeys()

			const data = _loadStorage()
			if (data) {
				if (data.lmpDate) lmpDate.value = new Date(data.lmpDate)
				if (data.dueDate) dueDate.value = new Date(data.dueDate)
				if (data.userInfo) Object.assign(userInfo.value, data.userInfo)
				if (data.records) records.value = data.records
				if (data.checkupSchedules) checkupSchedules.value = data.checkupSchedules
				if (data.openid) openid.value = data.openid
			}

			if (!openid.value) {
				openid.value = generateGuestId()
				if (!userInfo.value.nickname) {
					userInfo.value.nickname = generateGuestNickname()
				}
			}

			isLoggedIn.value = true
			userProfileLoaded.value = true
			_persist()
			console.log('silentLogin: 本地登录成功', openid.value)
			return true
		} catch (e) {
			console.error('silentLogin error:', e)
			return false
		}
	}

	// ── 头像选择（H5 本地） ──

	async function chooseAvatar() {
		try {
			const res = await new Promise((resolve, reject) => {
				uni.chooseImage({
					count: 1,
					sourceType: ['album', 'camera'],
					success: resolve,
					fail: reject
				})
			})
			if (res.tempFilePaths && res.tempFilePaths.length > 0) {
				userInfo.value.avatar = res.tempFilePaths[0]
				_persist()
				uni.showToast({ title: '头像已更新', icon: 'success' })
				return true
			}
		} catch (e) {
			if (e.errMsg && e.errMsg.includes('cancel')) return false
			console.warn('chooseAvatar error:', e)
			uni.showToast({ title: '选择头像失败', icon: 'none' })
		}
		return false
	}

	return {
		// state
		lmpDate,
		dueDate,
		records,
		userInfo,
		userProfileLoaded,
		pregInfoSet,
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
		// profile
		loadUserProfile,
		saveUserProfile,
		syncProfileToCloud,
		syncProfileFromCloud,
		syncCloudData,
		// actions
		loadRecords,
		saveRecord,
		// checkup schedules
		checkupSchedules,
		nextCheckup,
		completedCheckups,
		upcomingCheckups,
		loadCheckupSchedules,
		initCheckupSchedules,
		updateCheckupSchedule,
		toggleExamItem,
		markCheckupCompleted,
		skipCheckup,
		addCustomExamItem,
		// statistics
		getWeightStats,
		getBpStats,
		getFetalStats,
		getWeightHistory,
		getBpHistory,
		getFetalHistory,
		// greeting
		getGreeting,
		// login
		isLoggedIn,
		openid,
		silentLogin,
		chooseAvatar,
	}
})
