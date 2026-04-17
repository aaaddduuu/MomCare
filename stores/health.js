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
	const lmpDate = ref(new Date(2024, 7, 29)) // 末次月经 2024-08-29
	const dueDate = ref(new Date(2025, 5, 5)) // 预产期 2025-06-05
	const records = ref({}) // { 'YYYY-MM-DD': { weight, bp, mood, symptoms, fetal, note, plans } }
	const userProfileLoaded = ref(false)

	const userInfo = ref({
		nickname: '',
		avatar: '🌸',
		hospital: '',
		babyNickname: ''
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
			lmpDate: lmpDate.value.toISOString(),
			dueDate: dueDate.value.toISOString(),
			userInfo: { ...userInfo.value }
		}
		try {
			uni.setStorageSync('user_profile', JSON.stringify(profileData))
		} catch (e) {
			console.error('saveUserProfile local cache error:', e)
		}

		// 异步保存到云端
		try {
			const db = getDb()
			const updateData = {
				nickname: userInfo.value.nickname || '',
				avatar: userInfo.value.avatar || '',
				hospital: userInfo.value.hospital || '',
				baby_nickname: userInfo.value.babyNickname || '',
				doctor: userInfo.value.doctor || '',
				hospital_phone: userInfo.value.hospitalPhone || '',
				pre_weight: userInfo.value.preWeight || '',
				height: userInfo.value.height || '',
				lmp_date: dateToCloudDate(lmpDate.value),
				due_date: dateToCloudDate(dueDate.value),
				update_time: dateToCloudDate(new Date())
			}

			// 先查询是否存在
			const checkRes = await db.collection('mom_users')
				.where('openid == $env.OPENID')
				.limit(1)
				.get()

			if (checkRes.result && checkRes.result.data && checkRes.result.data.length > 0) {
				// 更新
				await db.collection('mom_users')
					.doc(checkRes.result.data[0]._id)
					.update(updateData)
			} else {
				// 新建
				await db.collection('mom_users').add(updateData)
			}
			console.log('saveUserProfile: 云端保存成功')
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

	return {
		// state
		lmpDate,
		dueDate,
		records,
		userInfo,
		userProfileLoaded,
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
		// statistics
		getWeightStats,
		getBpStats,
		getFetalStats,
		getWeightHistory,
		getBpHistory,
		getFetalHistory,
		// greeting
		getGreeting
	}
})
