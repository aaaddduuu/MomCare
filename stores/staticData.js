import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useStaticDataStore = defineStore('staticData', () => {
	const dailyData = ref([])
	const weeklyGuideData = ref([])
	const loaded = ref(false)
	const loadError = ref(false)

	async function loadData() {
		if (loaded.value) return

		try {
			const [dailyRes, weeklyRes] = await Promise.all([
				uni.request({ url: '/static/data/pregnancy-daily.json', responseType: 'text' }),
				uni.request({ url: '/static/data/pregnancy-weekly-guide.json', responseType: 'text' })
			])

			if (dailyRes.statusCode === 200 && dailyRes.data) {
				const raw = typeof dailyRes.data === 'string' ? dailyRes.data : JSON.stringify(dailyRes.data)
				dailyData.value = JSON.parse(raw)
			}

			if (weeklyRes.statusCode === 200 && weeklyRes.data) {
				const raw = typeof weeklyRes.data === 'string' ? weeklyRes.data : JSON.stringify(weeklyRes.data)
				weeklyGuideData.value = JSON.parse(raw)
			}

			loaded.value = true
			console.log(`staticData loaded: ${dailyData.value.length} daily, ${weeklyGuideData.value.length} weekly`)
		} catch (e) {
			console.error('staticData load error:', e)
			loadError.value = true
		}
	}

	function getDailyByTotalDays(totalDays) {
		if (totalDays < 0 || totalDays > 280) return null
		return dailyData.value.find(d => d.total_days === totalDays) || null
	}

	function getDailyRange(minDay, maxDay) {
		return dailyData.value.filter(
			d => d.total_days >= minDay && d.total_days <= maxDay
		)
	}

	function getWeeklyGuide(week) {
		if (week < 1 || week > 40) return null
		return weeklyGuideData.value.find(w => w.week === week) || null
	}

	return {
		dailyData,
		weeklyGuideData,
		loaded,
		loadError,
		loadData,
		getDailyByTotalDays,
		getDailyRange,
		getWeeklyGuide
	}
})
