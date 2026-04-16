<template>
  <view class="sec">
    <view class="card">
      <!-- Navigation header -->
      <view class="daily-nav">
        <view class="d-nav-btn" @tap="slideDay(-1)">
          <text class="d-nav-arrow">‹</text>
        </view>
        <view class="d-nav-center">
          <view class="d-nav-main">
            <text>{{ navLabel }}</text>
            <text v-if="isCurrentToday" class="today-chip">今天</text>
          </view>
          <view class="d-nav-sub">{{ navDate }}</view>
        </view>
        <view class="d-nav-right">
          <view v-if="!isCurrentToday" class="back-day-btn" @tap="goToday">
            <text class="back-day-text">回今天</text>
          </view>
          <view class="d-nav-btn" @tap="slideDay(1)">
            <text class="d-nav-arrow">›</text>
          </view>
        </view>
      </view>

      <!-- Swiper -->
      <swiper
        class="slides-outer"
        :current="currentIndex"
        :duration="300"
        :circular="false"
        @change="onSwiperChange"
      >
        <swiper-item v-for="(slide, sIdx) in slides" :key="sIdx">
          <view class="slide">
            <!-- Baby change -->
            <view class="ditem baby">
              <text class="di-icon">{{ slide.baby.icon }}</text>
              <text class="di-lbl">BABY</text>
              <text class="di-text">{{ slide.baby.text }}</text>
            </view>
            <!-- Mom change -->
            <view class="ditem mom">
              <text class="di-icon">{{ slide.mom.icon }}</text>
              <text class="di-lbl">MOM</text>
              <text class="di-text">{{ slide.mom.text }}</text>
            </view>
            <!-- Daily tip -->
            <view class="ditem tip">
              <text class="di-icon">{{ slide.tip.icon }}</text>
              <text class="di-lbl">TIP</text>
              <text class="di-text">{{ slide.tip.text }}</text>
            </view>
          </view>
        </swiper-item>
      </swiper>

      <!-- Pagination dots -->
      <view class="slide-dots">
        <view
          v-for="i in 5"
          :key="i"
          class="sdot"
          :class="{ active: i - 1 === currentIndex }"
        ></view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { calcWeekInfo, getTrimesterName } from '@/stores/health.js'

const props = defineProps({
  weekInfo: {
    type: Object,
    default: () => ({ week: 32, day: 3, total: 226 })
  },
  selectedDate: {
    type: Date,
    default: () => new Date()
  },
  healthStore: {
    type: Object,
    default: () => null
  }
})

// Current slide index: 0-4, where 2 = today
const currentIndex = ref(2)

// Offset from today (-2 to +2)
const offset = computed(() => currentIndex.value - 2)

// Whether the currently viewed slide is "today"
const isCurrentToday = computed(() => offset.value === 0)

// Generate date for a given offset from today
function getDateByOffset(off) {
  const d = new Date(props.selectedDate)
  d.setDate(d.getDate() + off)
  return d
}

// Format date label for navigation header
function formatDateLabel(date) {
  const store = props.healthStore
  let wi = props.weekInfo
  if (store && store.getWeekInfo) {
    const calculated = store.getWeekInfo(date)
    if (calculated) wi = calculated
  }
  if (!wi) wi = props.weekInfo
  // Adjust week/day based on offset
  const baseTotal = props.weekInfo.total
  const adjustedTotal = baseTotal + (currentIndex.value - 2)
  if (adjustedTotal >= 0) {
    const week = Math.floor(adjustedTotal / 7) + 1
    const day = adjustedTotal % 7
    return `孕 ${week} 周 ${day} 天`
  }
  return `孕 ${wi.week} 周 ${wi.day} 天`
}

function formatDate(date) {
  const y = date.getFullYear()
  const m = date.getMonth() + 1
  const d = date.getDate()
  return `${y}年${m}月${d}日`
}

// Navigation label: shows current slide's week/day info
const navLabel = computed(() => {
  const baseTotal = props.weekInfo.total
  const adjustedTotal = baseTotal + offset.value
  if (adjustedTotal >= 0) {
    const week = Math.floor(adjustedTotal / 7) + 1
    const day = adjustedTotal % 7
    return `孕 ${week} 周 ${day} 天`
  }
  return `孕 ${props.weekInfo.week} 周 ${props.weekInfo.day} 天`
})

// Navigation date string
const navDate = computed(() => {
  const date = getDateByOffset(offset.value)
  return formatDate(date)
})

// Mock data for week 32 (5 days: -2, -1, 0, +1, +2)
const MOCK_DATA = [
  {
    baby: { icon: '👶', text: '手指甲已完全形成，会自己抓握' },
    mom: { icon: '💆', text: '腰背酸痛加重，建议用孕妇枕' },
    tip: { icon: '💡', text: '保持左侧卧，有助于改善胎儿血液供应，减轻腰背不适' }
  },
  {
    baby: { icon: '🫁', text: '肺部继续发育，已能进行呼吸练习' },
    mom: { icon: '🦵', text: '腿部抽筋常见，睡前补充钙和镁' },
    tip: { icon: '💡', text: '脚踝水肿若明显加重，应及时告知产科医生' }
  },
  {
    baby: { icon: '👶', text: '约 1.8kg，头部开始朝下入盆' },
    mom: { icon: '💆', text: '子宫扩大，气短与胃部不适明显' },
    tip: { icon: '💡', text: '少量多餐，每天记录胎动，12小时少于10次请就医' }
  },
  {
    baby: { icon: '🧠', text: '皮下脂肪积累，皮肤越来越圆润' },
    mom: { icon: '🤱', text: '乳房准备哺乳，初乳开始分泌' },
    tip: { icon: '💡', text: '开始准备待产包清单，还有约55天哦，提前列好清单' }
  },
  {
    baby: { icon: '✨', text: '大脑褶皱加深，神经系统快速完善' },
    mom: { icon: '💤', text: '胎动越来越明显，感受宝宝翻滚' },
    tip: { icon: '💡', text: '每天数胎动3次，每次1小时，形成规律记录习惯' }
  }
]

const slides = computed(() => MOCK_DATA)

// Navigation methods
function slideDay(dir) {
  const next = currentIndex.value + dir
  if (next >= 0 && next <= 4) {
    currentIndex.value = next
  }
}

function goToday() {
  currentIndex.value = 2
}

function onSwiperChange(e) {
  const idx = e.detail.current
  if (typeof idx === 'number' && idx >= 0 && idx <= 4) {
    currentIndex.value = idx
  }
}

// Reset to today when selectedDate changes
watch(
  () => props.selectedDate,
  () => {
    currentIndex.value = 2
  }
)
</script>

<style scoped lang="scss">
// ── Colors ──
$cream: #FBF7F2;
$cream3: #EDE3D6;
$border: #E8DDD0;
$rose: #D4627A;
$rose-lt: #FAEAEE;
$rose-dk: #B04560;
$sage: #7BA08C;
$sage-lt: #EAF2EE;
$amber: #C98A3A;
$amber-lt: #FDF3E3;
$gray100: #F2F0EE;
$gray200: #E4E1DC;
$gray300: #C8C4BC;
$gray400: #9C9890;
$gray600: #4A4844;
$gray900: #1C1A17;
$r: 32rpx;
$r-sm: 20rpx;
$rp: 999rpx;
$sh: 0 4rpx 28rpx rgba(60, 30, 10, 0.07);

.sec {
  margin: 20rpx 24rpx 0;
}

.card {
  background: white;
  border-radius: $r;
  box-shadow: $sh;
  overflow: hidden;
}

// ── Navigation header ──
.daily-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 28rpx 16rpx;
  border-bottom: 2rpx solid $border;
}

.d-nav-btn {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: $gray100;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.d-nav-arrow {
  font-size: 30rpx;
  color: $gray600;
  line-height: 1;
}

.d-nav-center {
  text-align: center;
  flex: 1;
}

.d-nav-main {
  font-size: 26rpx;
  font-weight: 600;
  color: $gray900;
  display: flex;
  align-items: center;
  justify-content: center;
}

.today-chip {
  font-size: 18rpx;
  font-weight: 700;
  background: $rose;
  color: white;
  padding: 2rpx 12rpx;
  border-radius: $rp;
  margin-left: 10rpx;
}

.d-nav-sub {
  font-size: 20rpx;
  color: $gray400;
  margin-top: 2rpx;
}

.d-nav-right {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.back-day-btn {
  background: $rose-lt;
  border-radius: $rp;
  padding: 6rpx 16rpx;
}

.back-day-text {
  font-size: 20rpx;
  font-weight: 600;
  color: $rose;
}

// ── Swiper slides ──
.slides-outer {
  width: 100%;
  height: 420rpx;
}

.slide {
  padding: 24rpx 24rpx 8rpx;
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.ditem {
  background: $cream;
  border-radius: $r-sm;
  padding: 20rpx 24rpx;
  border: 2rpx solid $cream3;
  transition: transform 0.15s;

  &.baby {
    width: calc(50% - 8rpx);
    border-left: 6rpx solid $rose;
  }

  &.mom {
    width: calc(50% - 8rpx);
    border-left: 6rpx solid $sage;
  }

  &.tip {
    width: 100%;
    border-left: 6rpx solid $amber;
  }
}

.di-icon {
  font-size: 40rpx;
  display: block;
  margin-bottom: 8rpx;
}

.di-lbl {
  font-size: 18rpx;
  font-weight: 700;
  color: $gray400;
  letter-spacing: 2rpx;
  display: block;
  margin-bottom: 6rpx;
}

.di-text {
  font-size: 24rpx;
  color: $gray900;
  line-height: 1.5;
  display: block;
}

// ── Pagination dots ──
.slide-dots {
  display: flex;
  justify-content: center;
  gap: 10rpx;
  padding: 16rpx 0 20rpx;
}

.sdot {
  width: 10rpx;
  height: 10rpx;
  border-radius: 50%;
  background: $gray300;
  transition: all 0.2s;

  &.active {
    width: 32rpx;
    border-radius: 6rpx;
    background: $rose;
  }
}
</style>
