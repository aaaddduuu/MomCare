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

// ── 云数据库辅助 ──
function getDb() {
	return uniCloud.database()
}

function dateToCloudDate(date) {
	// uniCloud 使用 Date 对象存储日期
	return new Date(date.getTime())
}

function cloudDateToLocal(dateVal) {
	if (!dateVal) return new Date()
	if (dateVal instanceof Date) return dateVal
	return new Date(dateVal)
}

export const useHealthStore = defineStore('health', () => {
	// ── State ──
	const lmpDate = ref(null) // 末次月经，null 表示未设置
	const dueDate = ref(null) // 预产期，null 表示未设置
	const records = ref({}) // { 'YYYY-MM-DD': { weight, bp, mood, symptoms, fetal, note, plans } }
	const userProfileLoaded = ref(false)

	const userInfo = ref({
		nickname: '',
		avatar: '🌸',
		hospital: '',
		babyNickname: ''
	})

	const checkupSchedules = ref([])
	// ── 登录状态 ──
	const isLoggedIn = ref(false)
	const openid = ref('')

	// ── Getters ──
	const today = computed(() => new Date())

	// 是否已设置孕期信息
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
		const todayStr = getRecordKey(new Date())
		return checkupSchedules.value
			.filter(s => s.status === 'upcoming' && s.checkup_date >= todayStr)
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

	// ── 云端数据格式转换 ──

	// 将本地 records 拆分为 cloud health_records 格式的多条记录
	function recordsToCloud(dateKey, dayRecord) {
		const cloudRecords = []
		const weekInfo = calcWeekInfo(lmpDate.value, new Date(dateKey))
		const weekOfPregnancy = weekInfo ? weekInfo.week : 0

		if (dayRecord.weight) {
			cloudRecords.push({
				record_type: 'weight',
				record_date: dateKey,
				weight: String(dayRecord.weight),
				weight_unit: 'kg',
				week_of_pregnancy: weekOfPregnancy,
				data_source: 'manual'
			})
		}
		if (dayRecord.bp) {
			const bpStr = String(dayRecord.bp)
			const parts = bpStr.split('/')
			const systolic = parts[0] ? parseInt(parts[0]) : 0
			const diastolic = parts[1] ? parseInt(parts[1]) : 0
			cloudRecords.push({
				record_type: 'blood_pressure',
				record_date: dateKey,
				bp_text: bpStr,
				systolic,
				diastolic,
				is_abnormal: systolic >= 140 || diastolic >= 90,
				week_of_pregnancy: weekOfPregnancy,
				data_source: 'manual'
			})
		}
		if (dayRecord.fetal) {
			cloudRecords.push({
				record_type: 'fetal_movement',
				record_date: dateKey,
				fetal_movement: String(dayRecord.fetal),
				week_of_pregnancy: weekOfPregnancy,
				data_source: 'manual'
			})
		}
		if (dayRecord.mood) {
			cloudRecords.push({
				record_type: 'mood',
				record_date: dateKey,
				mood: String(dayRecord.mood),
				week_of_pregnancy: weekOfPregnancy,
				data_source: 'manual'
			})
		}
		if (dayRecord.note || dayRecord.plans) {
			cloudRecords.push({
				record_type: 'note',
				record_date: dateKey,
				note: String(dayRecord.note || ''),
				plans: dayRecord.plans || [],
				week_of_pregnancy: weekOfPregnancy,
				data_source: 'manual'
			})
		}
		return cloudRecords
	}

	// 将云端 health_records 多条记录合并为本地格式
	function recordsToLocal(cloudRecords) {
		const localRecords = {}
		for (const r of cloudRecords) {
			const dateKey = r.record_date
			if (!localRecords[dateKey]) {
				localRecords[dateKey] = {}
			}
			const day = localRecords[dateKey]
			switch (r.record_type) {
				case 'weight':
					day.weight = r.weight || ''
					break
				case 'blood_pressure':
					day.bp = r.bp_text || ''
					break
				case 'fetal_movement':
					day.fetal = r.fetal_movement || ''
					break
				case 'mood':
					day.mood = r.mood || ''
					break
				case 'note':
					day.note = r.note || ''
					if (r.plans && r.plans.length > 0) {
						day.plans = r.plans
					}
					break
			}
		}
		return localRecords
	}

	// ── 用户资料云端同步 ──

	async function loadUserProfile() {
		try {
			const db = getDb()
			const res = await db.collection('mom_users')
				.where('openid == $env.OPENID')
				.limit(1)
				.get()

			if (res.result && res.result.data && res.result.data.length > 0) {
				const doc = res.result.data[0]
				if (doc.lmp_date) lmpDate.value = cloudDateToLocal(doc.lmp_date)
				if (doc.due_date) dueDate.value = cloudDateToLocal(doc.due_date)
				if (doc.nickname) userInfo.value.nickname = doc.nickname
				if (doc.avatar) userInfo.value.avatar = doc.avatar
				if (doc.hospital) userInfo.value.hospital = doc.hospital
				if (doc.baby_nickname) userInfo.value.babyNickname = doc.baby_nickname
				if (doc.doctor) userInfo.value.doctor = doc.doctor
				if (doc.hospital_phone) userInfo.value.hospitalPhone = doc.hospital_phone
				if (doc.pre_weight) userInfo.value.preWeight = doc.pre_weight
				if (doc.height) userInfo.value.height = doc.height
				userProfileLoaded.value = true
				console.log('loadUserProfile: 从云端加载成功')
			} else {
				// 无云端数据，尝试本地缓存
				_loadLocalCache()
				console.log('loadUserProfile: 云端无数据，使用本地缓存')
			}
		} catch (e) {
			console.error('loadUserProfile 云端加载失败，降级本地缓存:', e)
			_loadLocalCache()
		}
	}

	function _loadLocalCache() {
		try {
			const saved = uni.getStorageSync('user_profile')
			if (saved) {
				const data = JSON.parse(saved)
				if (data.lmpDate) lmpDate.value = new Date(data.lmpDate)
				if (data.dueDate) dueDate.value = new Date(data.dueDate)
				if (data.userInfo) Object.assign(userInfo.value, data.userInfo)
			}
		} catch (e) {
			console.error('_loadLocalCache error:', e)
		}
	}

	async function saveUserProfile() {
		// 先保存本地缓存
		const profileData = {
			lmpDate: lmpDate.value ? lmpDate.value.toISOString() : null,
			dueDate: dueDate.value ? dueDate.value.toISOString() : null,
			userInfo: { ...userInfo.value }
		}
		try {
			uni.setStorageSync('user_profile', JSON.stringify(profileData))
		} catch (e) {
			console.error('saveUserProfile local cache error:', e)
		}

		// 异步保存到云端（通过云函数绕过数据库权限限制）
		if (!openid.value) return
		try {
			const cloudProfileData = {
				nickname: userInfo.value.nickname || '',
				avatar: userInfo.value.avatar || '',
				hospital: userInfo.value.hospital || '',
				baby_nickname: userInfo.value.babyNickname || '',
				doctor: userInfo.value.doctor || '',
				hospital_phone: userInfo.value.hospitalPhone || '',
				pre_weight: userInfo.value.preWeight || '',
				height: userInfo.value.height || ''
			}
			if (lmpDate.value) cloudProfileData.lmp_date = dateToCloudDate(lmpDate.value)
			if (dueDate.value) cloudProfileData.due_date = dateToCloudDate(dueDate.value)

			const res = await uniCloud.callFunction({
				name: 'wxLogin',
				data: {
					action: 'saveProfile',
					openid: openid.value,
					profileData: cloudProfileData
				}
			})

			if (res.result && res.result.code === 200) {
				console.log('saveUserProfile: 云端保存成功')
			} else {
				console.warn('saveUserProfile: 云端保存失败', res.result)
			}
		} catch (e) {
			console.error('saveUserProfile 云端保存失败（本地已生效）:', e)
		}
	}

	// ── 健康记录 ──

	async function loadRecords() {
		try {
			const db = getDb()
			const res = await db.collection('health_records')
				.where('user_id == $env.UID')
				.orderBy('record_date', 'desc')
				.limit(500)
				.get()

			if (res.result && res.result.data && res.result.data.length > 0) {
				records.value = recordsToLocal(res.result.data)
				// 同步到本地缓存
				_saveLocalRecords()
				console.log('loadRecords: 从云端加载', res.result.data.length, '条记录')
			} else {
				// 降级本地缓存
				_loadLocalRecords()
			}
		} catch (e) {
			console.error('loadRecords 云端加载失败，降级本地缓存:', e)
			_loadLocalRecords()
		}
	}

	function _loadLocalRecords() {
		try {
			const saved = uni.getStorageSync('health_records')
			if (saved) {
				records.value = JSON.parse(saved)
			}
		} catch (e) {
			console.error('_loadLocalRecords error:', e)
		}
	}

	function _saveLocalRecords() {
		try {
			uni.setStorageSync('health_records', JSON.stringify(records.value))
		} catch (e) {
			console.error('_saveLocalRecords error:', e)
		}
	}

	async function saveRecord(date, data) {
		const key = getRecordKey(date)
		records.value[key] = { ...records.value[key], ...data }
		// 先保存本地缓存
		_saveLocalRecords()

		// 异步保存到云端
		try {
			const db = getDb()
			// 获取当前用户ID
			const { uid: userId } = uniCloud.getCurrentUserInfo()
			if (!userId) {
				console.warn('saveRecord: 未登录，跳过云端保存')
				return
			}

			const cloudRecords = recordsToCloud(key, records.value[key])
			for (const record of cloudRecords) {
				// 添加 user_id 字段
				const recordWithUserId = { ...record, user_id: userId }

				// 检查是否已存在相同日期和类型的记录
				const existing = await db.collection('health_records')
					.where({
						record_date: key,
						record_type: record.record_type
					})
					.limit(1)
					.get()

				if (existing.result && existing.result.data && existing.result.data.length > 0) {
					await db.collection('health_records')
						.doc(existing.result.data[0]._id)
						.update(recordWithUserId)
				} else {
					await db.collection('health_records').add(recordWithUserId)
				}
			}
			console.log('saveRecord: 云端保存成功')
		} catch (e) {
			console.error('saveRecord 云端保存失败（本地已生效）:', e)
		}
	}

	// ── 产检日程 ──

	function _templateToSchedule(template, lmpDateVal, hospitalDefault) {
		const date = new Date(lmpDateVal.getTime() + template.dayOffset * 86400000)
		const dateKey = getRecordKey(date)
		const examItems = [
			...template.required.map(text => ({ text, required: true, done: false })),
			...template.optional.map(text => ({ text, required: false, done: false }))
		]
		return {
			checkup_date: dateKey,
			week_of_pregnancy: template.week,
			week_label: template.label,
			hospital: hospitalDefault || '',
			department: '产科门诊',
			time_slot: 'morning',
			status: dateKey < getRecordKey(new Date()) ? 'completed' : 'upcoming',
			exam_items: examItems,
			notes: '',
			remind_days_before: [1, 3]
		}
	}

	async function loadCheckupSchedules() {
		try {
			const db = getDb()
			const res = await db.collection('checkup_schedules')
				.where('user_id == $env.UID')
				.orderBy('checkup_date', 'asc')
				.limit(100)
				.get()

			if (res.result && res.result.data && res.result.data.length > 0) {
				checkupSchedules.value = res.result.data
				console.log('loadCheckupSchedules: 从云端加载', res.result.data.length, '条')
			} else {
				checkupSchedules.value = []
			}
		} catch (e) {
			console.error('loadCheckupSchedules 云端加载失败:', e)
			checkupSchedules.value = []
		}
	}

	async function initCheckupSchedules() {
		if (!lmpDate.value) return
		try {
			const hospitalDefault = userInfo.value.hospital || ''
			const newSchedules = CHECKUP_TEMPLATES.map(template =>
				_templateToSchedule(template, lmpDate.value, hospitalDefault)
			)

			// 先本地展示
			checkupSchedules.value = newSchedules
			console.log('initCheckupSchedules: 已生成', newSchedules.length, '条产检日程')

			// 尝试写入云端（未登录时跳过）
			const { uid: userId } = uniCloud.getCurrentUserInfo()
			if (!userId) {
				console.warn('initCheckupSchedules: 未登录，仅本地展示')
				return
			}

			const db = getDb()
			for (const schedule of newSchedules) {
				await db.collection('checkup_schedules').add({
					...schedule,
					user_id: userId
				})
			}
			console.log('initCheckupSchedules: 云端同步成功')
		} catch (e) {
			console.error('initCheckupSchedules 失败:', e)
		}
	}

	async function updateCheckupSchedule(scheduleId, data) {
		// 本地更新
		const idx = checkupSchedules.value.findIndex(s => s._id === scheduleId)
		if (idx >= 0) {
			checkupSchedules.value[idx] = { ...checkupSchedules.value[idx], ...data }
		}

		// 云端更新
		try {
			const db = getDb()
			await db.collection('checkup_schedules')
				.doc(scheduleId)
				.update({ ...data, update_time: dateToCloudDate(new Date()) })
			console.log('updateCheckupSchedule: 云端更新成功')
		} catch (e) {
			console.error('updateCheckupSchedule 云端更新失败:', e)
		}
	}

	async function toggleExamItem(scheduleId, itemIdx) {
		const schedule = checkupSchedules.value.find(s => s._id === scheduleId)
		if (!schedule) return

		const items = [...schedule.exam_items]
		items[itemIdx].done = !items[itemIdx].done
		await updateCheckupSchedule(scheduleId, { exam_items: items })
	}

	async function markCheckupCompleted(scheduleId) {
		await updateCheckupSchedule(scheduleId, { status: 'completed' })
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

		// 计算变化值
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

		// 生成月度热力图数据
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

	// 获取问候语
	function getGreeting() {
		const name = userInfo.value.nickname || '宝妈'
		const hour = new Date().getHours()
		if (hour < 6) return `夜深了，${name}`
		if (hour < 11) return `早上好，${name}`
		if (hour < 14) return `中午好，${name}`
		if (hour < 18) return `下午好，${name}`
		return `晚上好，${name}`
	}

	// ── 微信静默登录 ──

	async function silentLogin() {
		try {
			// 1. 调用 uni.login 获取微信临时 code
			const loginRes = await new Promise((resolve, reject) => {
				uni.login({
					provider: 'weixin',
					success: resolve,
					fail: reject
				})
			})

			if (!loginRes.code) {
				console.warn('silentLogin: uni.login 未返回 code')
				return false
			}

			// 2. 调用云函数换取 openid
			const cloudRes = await uniCloud.callFunction({
				name: 'wxLogin',
				data: { code: loginRes.code }
			})

			if (!cloudRes.result || cloudRes.result.code !== 200) {
				console.warn('silentLogin: 云函数返回错误', cloudRes.result)
				return false
			}

			const { openid: wxOpenid, userInfo: wxUserInfo, isNewUser } = cloudRes.result.data

			// 3. 更新 store 状态
			openid.value = wxOpenid
			isLoggedIn.value = true

			// 4. 更新 userInfo（云端数据优先）
			if (wxUserInfo) {
				if (wxUserInfo.nickname) userInfo.value.nickname = wxUserInfo.nickname
				if (wxUserInfo.avatar) userInfo.value.avatar = wxUserInfo.avatar
				if (wxUserInfo.hospital) userInfo.value.hospital = wxUserInfo.hospital
				if (wxUserInfo.babyNickname) userInfo.value.babyNickname = wxUserInfo.babyNickname
				if (wxUserInfo.doctor) userInfo.value.doctor = wxUserInfo.doctor
				if (wxUserInfo.hospitalPhone) userInfo.value.hospitalPhone = wxUserInfo.hospitalPhone
				if (wxUserInfo.preWeight) userInfo.value.preWeight = wxUserInfo.preWeight
				if (wxUserInfo.height) userInfo.value.height = wxUserInfo.height
				if (wxUserInfo.lmpDate) lmpDate.value = cloudDateToLocal(wxUserInfo.lmpDate)
				if (wxUserInfo.dueDate) dueDate.value = cloudDateToLocal(wxUserInfo.dueDate)
			}

			userProfileLoaded.value = true

			// 5. 如果是新用户且有本地数据，触发迁移
			if (isNewUser) {
				_migrateLocalData(wxOpenid)
			}

			console.log('silentLogin: 登录成功', wxOpenid)
			return true
		} catch (e) {
			console.warn('silentLogin: 登录失败，降级为本地模式', e.message)
			return false
		}
	}

	// ── 本地数据迁移到云端 ──

	async function _migrateLocalData(targetOpenid) {
		// 检查是否已迁移
		const migrated = uni.getStorageSync('data_migrated')
		if (migrated) return

		try {
			// 迁移 user_profile → mom_users（合并到已有记录）
			const savedProfile = uni.getStorageSync('user_profile')
			if (savedProfile) {
				const localData = JSON.parse(savedProfile)
				const db = getDb()
				const updateData = {}

				if (localData.userInfo) {
					if (localData.userInfo.nickname && localData.userInfo.nickname !== '宝妈') {
						updateData.nickname = localData.userInfo.nickname
						userInfo.value.nickname = localData.userInfo.nickname
					}
					if (localData.userInfo.hospital) updateData.hospital = localData.userInfo.hospital
					if (localData.userInfo.babyNickname) updateData.baby_nickname = localData.userInfo.babyNickname
				}
				if (localData.lmpDate) {
					updateData.lmp_date = new Date(localData.lmpDate)
				}
				if (localData.dueDate) {
					updateData.due_date = new Date(localData.dueDate)
				}

				if (Object.keys(updateData).length > 0) {
					await db.collection('mom_users')
						.where({ openid: targetOpenid })
						.update(updateData)
				}
			}

			// 迁移 health_records
			const savedRecords = uni.getStorageSync('health_records')
			if (savedRecords) {
				const localRecords = JSON.parse(savedRecords)
				const db = getDb()
				let migratedCount = 0

				for (const [dateKey, dayRecord] of Object.entries(localRecords)) {
					const cloudRecords = recordsToCloud(dateKey, dayRecord)
					for (const record of cloudRecords) {
						try {
							await db.collection('health_records').add({
								...record,
								openid: targetOpenid
							})
							migratedCount++
						} catch (e) {
							console.warn('_migrateLocalData: 迁移单条记录失败', dateKey, e.message)
						}
					}
				}
				console.log(`_migrateLocalData: 迁移了 ${migratedCount} 条健康记录`)
			}

			// 标记迁移完成
			uni.setStorageSync('data_migrated', 'true')
			console.log('_migrateLocalData: 数据迁移完成')
		} catch (e) {
			console.error('_migrateLocalData: 迁移失败', e.message)
		}
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
		// cloud sync
		loadUserProfile,
		saveUserProfile,
		recordsToCloud,
		recordsToLocal,
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
		silentLogin
	}
})
