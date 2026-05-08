<template>
  <view class="cal-card">
    <!-- Month navigation -->
    <view class="month-nav">
      <view class="m-arrow" :class="{ disabled: !canPrev }" @tap="prevMonth">
        <text class="m-arrow-icon">‹</text>
      </view>
      <view class="m-center">
        <text class="m-title">{{ monthTitle }}</text>
        <text class="m-sub">{{ monthSubtitle }}</text>
      </view>
      <view class="m-right">
        <view v-if="!isCurrentMonth" class="bt-today" @tap="jumpToday">
          <text class="bt-today-text">回今天</text>
        </view>
        <view class="m-arrow" :class="{ disabled: !canNext }" @tap="nextMonth">
          <text class="m-arrow-icon">›</text>
        </view>
      </view>
    </view>

    <!-- Weekday headers -->
    <view class="wday-row">
      <text class="wdl wdl-sun">日</text>
      <text class="wdl">一</text>
      <text class="wdl">二</text>
      <text class="wdl">三</text>
      <text class="wdl">四</text>
      <text class="wdl">五</text>
      <text class="wdl wdl-sat">六</text>
    </view>

    <!-- Calendar grid -->
    <view class="cal-grid">
      <template v-for="(cell, idx) in gridCells" :key="idx">
        <!-- Empty leading cells -->
        <view v-if="cell.empty" class="dc empty"></view>
        <!-- Date cells -->
        <view
          v-else
          class="dc"
          :class="cellClasses(cell)"
          @tap="onSelectDate(cell.date)"
        >
          <!-- Week label badge for new week starts -->
          <view
            v-if="cell.weekInfo && cell.weekInfo.day === 0"
            class="wb"
            :class="'wb-' + cell.trimester"
          >
            <text class="wb-text">W{{ cell.weekInfo.week }}</text>
          </view>

          <!-- Due date icon -->
          <text v-if="cell.isDue" class="due-mk">🎀</text>

          <!-- Date number -->
          <text class="dn" :class="cell.dnClass">{{ cell.day }}</text>

          <!-- Pregnancy week/day info -->
          <text v-if="cell.weekInfo" class="pd" :class="'pd-' + cell.trimester">
            {{ cell.isToday ? '今天' : cell.weekInfo.week + 'W' + cell.weekInfo.day + 'D' }}
          </text>

          <!-- Record dot -->
          <view v-if="cell.hasRecord" class="rdot"></view>
        </view>
      </template>
    </view>

    <!-- Legend strip -->
    <view class="leg-strip">
      <view class="li">
        <view class="lsw ls-e"></view>
        <text class="li-text">早期</text>
      </view>
      <view class="li">
        <view class="lsw ls-m"></view>
        <text class="li-text">中期</text>
      </view>
      <view class="li">
        <view class="lsw ls-l"></view>
        <text class="li-text">晚期</text>
      </view>
      <view class="li">
        <view class="lsw ls-t"></view>
        <text class="li-text">今天</text>
      </view>
      <view class="li">
        <text class="li-emoji">🎀</text>
        <text class="li-text">预产期</text>
      </view>
      <view class="li">
        <view class="lwb">W32</view>
        <text class="li-text">新周</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { calcWeekInfo, getTrimester, getTrimesterName } from '@/stores/health.js'

const props = defineProps({
  lmpDate: {
    type: Date,
    required: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  hasRecord: {
    type: Function,
    default: () => false
  },
  selectedDate: {
    type: Date,
    default: null
  }
})

const emit = defineEmits(['selectDate'])

// Month names
const MONTH_NAMES = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']

// Build the list of months from LMP to due date
const allMonths = computed(() => {
  const months = []
  let y = props.lmpDate.getFullYear()
  let m = props.lmpDate.getMonth()
  const endY = props.dueDate.getFullYear()
  const endM = props.dueDate.getMonth()
  while (y < endY || (y === endY && m <= endM)) {
    months.push({ y, m })
    m++
    if (m > 11) {
      m = 0
      y++
    }
  }
  return months
})

// Current viewing month index
const currentMonthIndex = ref(0)

// Today helper
const today = computed(() => {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
})

// Find today's month index
const todayMonthIndex = computed(() => {
  return allMonths.value.findIndex(
    item => item.y === today.value.getFullYear() && item.m === today.value.getMonth()
  )
})

// Initialize to today's month or first month
function initMonthIndex() {
  const idx = todayMonthIndex.value
  currentMonthIndex.value = idx >= 0 ? idx : 0
}

// Initialize on creation
initMonthIndex()

// Current viewing year/month
const viewYear = computed(() => allMonths.value[currentMonthIndex.value]?.y ?? 0)
const viewMonth = computed(() => allMonths.value[currentMonthIndex.value]?.m ?? 0)

// Navigation helpers
const canPrev = computed(() => currentMonthIndex.value > 0)
const canNext = computed(() => currentMonthIndex.value < allMonths.value.length - 1)
const isCurrentMonth = computed(() => {
  return viewYear.value === today.value.getFullYear() && viewMonth.value === today.value.getMonth()
})

function prevMonth() {
  if (canPrev.value) currentMonthIndex.value--
}
function nextMonth() {
  if (canNext.value) currentMonthIndex.value++
}
function jumpToday() {
  initMonthIndex()
}

// Month title
const monthTitle = computed(() => `${viewYear.value}年${MONTH_NAMES[viewMonth.value]}`)

// Month subtitle (trimester + week range)
const monthSubtitle = computed(() => {
  const daysInMonth = new Date(viewYear.value, viewMonth.value + 1, 0).getDate()
  const w1 = calcWeekInfo(props.lmpDate, new Date(viewYear.value, viewMonth.value, 1))
  const w2 = calcWeekInfo(props.lmpDate, new Date(viewYear.value, viewMonth.value, daysInMonth))
  if (!w1 || !w2) return ''
  const midWeek = calcWeekInfo(props.lmpDate, new Date(viewYear.value, viewMonth.value, 15))
  const tri = midWeek ? getTrimester(midWeek.week) : 'early'
  return `${getTrimesterName(tri)} · 第 ${w1.week}–${w2.week} 周`
})

// Date comparison helpers
function sameDay(a, b) {
  if (!a || !b) return false
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}

function isToday(date) {
  return sameDay(date, today.value)
}

function isDueDate(date) {
  return sameDay(date, props.dueDate)
}

function isCurrentWeek(date) {
  const todayInfo = calcWeekInfo(props.lmpDate, today.value)
  const dateInfo = calcWeekInfo(props.lmpDate, date)
  return todayInfo && dateInfo && dateInfo.week === todayInfo.week
}

// Build the calendar grid cells
const gridCells = computed(() => {
  const cells = []
  const y = viewYear.value
  const m = viewMonth.value

  // Day of week for the 1st
  const firstDow = new Date(y, m, 1).getDay()
  // Days in month
  const daysInMonth = new Date(y, m + 1, 0).getDate()

  // Empty leading cells
  for (let i = 0; i < firstDow; i++) {
    cells.push({ empty: true })
  }

  // Date cells
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(y, m, d)
    const weekInfo = calcWeekInfo(props.lmpDate, date)
    const dow = date.getDay()
    const trimester = weekInfo ? getTrimester(weekInfo.week) : null
    const triClass = trimester === 'early' ? 'ed' : trimester === 'mid' ? 'md' : trimester === 'late' ? 'ld' : ''

    // Determine date number styling
    let dnClass = ''
    if (isToday(date)) {
      dnClass = 'dn-today'
    } else if (triClass) {
      dnClass = 'dn-' + triClass
    }
    if (dow === 0) dnClass += ' dn-sun'
    if (dow === 6) dnClass += ' dn-sat'
    // If no pregnancy and before LMP
    if (!weekInfo) {
      const lmpNormalized = new Date(props.lmpDate.getFullYear(), props.lmpDate.getMonth(), props.lmpDate.getDate())
      dnClass = date < lmpNormalized ? 'dn-pre' : 'dn-post'
      if (dow === 0) dnClass += ' dn-sun'
      if (dow === 6) dnClass += ' dn-sat'
    }

    cells.push({
      empty: false,
      day: d,
      date,
      dow,
      weekInfo,
      trimester,
      triClass,
      isToday: isToday(date),
      isDue: isDueDate(date),
      isCurrentWeek: weekInfo ? isCurrentWeek(date) : false,
      isSelected: sameDay(date, props.selectedDate),
      hasRecord: props.hasRecord(date),
      dnClass
    })
  }

  return cells
})

// Build class list for a cell
function cellClasses(cell) {
  const cls = []
  if (cell.dow === 0) cls.push('dc-sun')
  if (cell.dow === 6) cls.push('dc-sat')
  if (!cell.weekInfo) {
    // Before LMP or after pregnancy range
    const lmpNormalized = new Date(props.lmpDate.getFullYear(), props.lmpDate.getMonth(), props.lmpDate.getDate())
    cls.push(cell.date < lmpNormalized ? 'dc-pre' : 'dc-post')
  } else {
    cls.push('dc-' + cell.triClass)
    if (cell.isCurrentWeek) cls.push('dc-cw')
  }
  if (cell.isToday) cls.push('dc-tc')
  if (cell.isSelected) cls.push('dc-sc')
  return cls
}

// Handle date selection
function onSelectDate(date) {
  emit('selectDate', new Date(date.getFullYear(), date.getMonth(), date.getDate()))
}
</script>

<style scoped lang="scss">
/* ── Card ── */
.cal-card {
  background: #ffffff;
  margin: 20rpx 24rpx 0;
  border-radius: 32rpx;
  box-shadow: 0 4rpx 28rpx rgba(60, 30, 10, 0.07);
  overflow: hidden;
}

/* ── Month Navigation ── */
.month-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18rpx 24rpx 14rpx;
  border-bottom: 1rpx solid #E8DDD0;
}

.m-arrow {
  width: 54rpx;
  height: 54rpx;
  border-radius: 50%;
  background: #F2F0EE;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.m-arrow-icon {
  font-size: 30rpx;
  color: #4A4844;
  line-height: 1;
}

.m-arrow.disabled {
  opacity: 0.25;
}

.m-center {
  text-align: center;
  flex: 1;
}

.m-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #1C1A17;
}

.m-sub {
  font-size: 18rpx;
  color: #9C9890;
  margin-top: 2rpx;
}

.m-right {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.bt-today {
  background: #FAEAEE;
  border-radius: 999rpx;
  padding: 6rpx 18rpx;
  white-space: nowrap;
}

.bt-today-text {
  font-size: 20rpx;
  font-weight: 600;
  color: #D4627A;
}

/* ── Weekday Row ── */
.wday-row {
  display: flex;
  padding: 10rpx 14rpx 4rpx;
}

.wdl {
  flex: 1;
  text-align: center;
  font-size: 18rpx;
  font-weight: 600;
  color: #9C9890;
}

.wdl-sun {
  color: #D06060;
}

.wdl-sat {
  color: #6080C8;
}

/* ── Calendar Grid ── */
.cal-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 4rpx;
  padding: 4rpx 14rpx 14rpx;
}

/* ── Date Cell ── */
.dc {
  width: calc((100% - 24rpx) / 7);
  border-radius: 14rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4rpx 2rpx 4rpx;
  min-height: 88rpx;
  position: relative;
  box-sizing: border-box;
}

.dc.empty {
  pointer-events: none;
}

/* Pre/post pregnancy */
.dc-pre,
.dc-post {
  background: transparent;
}

/* Trimester backgrounds */
.dc-ed {
  background: #FFF0F3;
}

.dc-md {
  background: #FEF6E8;
}

.dc-ld {
  background: #EEE8FA;
}

/* Current week deeper shade */
.dc-cw.dc-ed {
  background: #FDD8E3;
}

.dc-cw.dc-md {
  background: #FDE8C0;
}

.dc-cw.dc-ld {
  background: #DDD0F5;
}

/* Today border */
.dc-tc::after {
  content: '';
  position: absolute;
  top: 2rpx;
  left: 2rpx;
  right: 2rpx;
  bottom: 2rpx;
  border-radius: 12rpx;
  border: 4rpx solid #D4627A;
  box-shadow: 0 0 0 4rpx rgba(212, 98, 122, 0.12);
  pointer-events: none;
  z-index: 1;
}

/* Selected overlay */
.dc-sc::before {
  content: '';
  position: absolute;
  top: 2rpx;
  left: 2rpx;
  right: 2rpx;
  bottom: 2rpx;
  border-radius: 12rpx;
  background: rgba(212, 98, 122, 0.1);
  pointer-events: none;
  z-index: 0;
}

.dc-sc.dc-tc::before {
  display: none;
}

/* ── Date Number ── */
.dn {
  font-size: 26rpx;
  font-weight: 600;
  line-height: 1;
  margin-top: 4rpx;
  color: #1C1A17;
  position: relative;
  z-index: 2;
}

.dn-pre,
.dn-post {
  color: #C8C4BC;
}

.dn-today {
  color: #D4627A;
  font-weight: 700;
}

.dn-ed {
  color: #C04868;
}

.dn-md {
  color: #B07020;
}

.dn-ld {
  color: #6A4AAA;
}

.dn-sun {
  color: #D05050 !important;
}

.dn-sat {
  color: #5070C8 !important;
}

/* ── Pregnancy Day Info ── */
.pd {
  font-size: 15rpx;
  margin-top: 2rpx;
  opacity: 0.7;
  line-height: 1;
  text-align: center;
  position: relative;
  z-index: 2;
}

.pd-ed {
  color: #C04868;
}

.pd-md {
  color: #B07020;
}

.pd-ld {
  color: #6A4AAA;
}

/* ── Week Label Badge ── */
.wb {
  position: absolute;
  top: -12rpx;
  left: 50%;
  transform: translateX(-50%);
  font-size: 14rpx;
  font-weight: 700;
  padding: 2rpx 8rpx;
  border-radius: 999rpx;
  white-space: nowrap;
  z-index: 4;
  box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1);
  pointer-events: none;
}

.wb-early {
  background: #FDD8E3;
  color: #C04868;
  border: 2rpx solid #E8A0B0;
}

.wb-mid {
  background: #FDE8C0;
  color: #B07020;
  border: 2rpx solid #F0C070;
}

.wb-late {
  background: #DDD0F5;
  color: #6A4AAA;
  border: 2rpx solid #B8A0E0;
}

.wb-text {
  font-size: 14rpx;
  font-weight: 700;
}

/* ── Due Date Marker ── */
.due-mk {
  position: absolute;
  top: -10rpx;
  right: -6rpx;
  font-size: 20rpx;
  z-index: 5;
  pointer-events: none;
}

/* ── Record Dot ── */
.rdot {
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  background: #D4627A;
  position: absolute;
  bottom: 4rpx;
  left: 50%;
  transform: translateX(-50%);
  opacity: 0.8;
  z-index: 2;
}

/* ── Legend Strip ── */
.leg-strip {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 10rpx 24rpx 16rpx;
  border-top: 1rpx solid #E8DDD0;
  flex-wrap: wrap;
}

.li {
  display: flex;
  align-items: center;
  gap: 6rpx;
}

.li-text {
  font-size: 18rpx;
  color: #4A4844;
}

.li-emoji {
  font-size: 20rpx;
}

.lsw {
  width: 22rpx;
  height: 22rpx;
  border-radius: 6rpx;
  flex-shrink: 0;
}

.ls-e {
  background: #FDD8E3;
  border: 2rpx solid #E8A0B0;
}

.ls-m {
  background: #FDE8C0;
  border: 2rpx solid #F0C070;
}

.ls-l {
  background: #DDD0F5;
  border: 2rpx solid #B8A0E0;
}

.ls-t {
  background: #ffffff;
  border: 4rpx solid #D4627A;
}

.lwb {
  font-size: 14rpx;
  font-weight: 700;
  background: #DDD0F5;
  color: #6A4AAA;
  padding: 2rpx 8rpx;
  border-radius: 999rpx;
  border: 2rpx solid #B8A0E0;
}
</style>
