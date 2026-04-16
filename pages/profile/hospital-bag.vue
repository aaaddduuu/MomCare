<template>
  <view class="page">
    <!-- Hero -->
    <view class="hero">
      <!-- NavBar (dark theme for white text/icons) -->
      <NavBar title="待产包清单" theme="dark" class="hero-navbar" />

      <!-- Hero Content -->
      <view class="hero-content">
        <text class="hero-label">已完成</text>
        <text class="hero-number">{{ doneCount }} / {{ totalCount }} 项</text>
        <text class="hero-sub">还剩 {{ totalCount - doneCount }} 项待准备 · 距预产期 54 天</text>
      </view>
    </view>

    <!-- Progress Card -->
    <view class="progress-card">
      <view class="progress-row">
        <text class="progress-label">总体进度</text>
        <text class="progress-percent">{{ progressPercent }}%</text>
      </view>
      <view class="progress-track">
        <view class="progress-fill" :style="{ width: progressPercent + '%' }"></view>
      </view>
    </view>

    <!-- Category Filter Strip -->
    <scroll-view scroll-x class="filter-scroll" :show-scrollbar="false">
      <view class="filter-row">
        <view
          v-for="cat in categoryFilters"
          :key="cat.key"
          class="filter-btn"
          :class="{ 'filter-btn-active': activeCategory === cat.key }"
          @tap="activeCategory = cat.key"
        >
          <text class="filter-text" :class="{ 'filter-text-active': activeCategory === cat.key }">
            {{ cat.name }} {{ cat.count }}
          </text>
        </view>
      </view>
    </scroll-view>

    <!-- Checklist Sections -->
    <scroll-view scroll-y class="checklist-scroll">
      <template v-for="section in filteredSections" :key="section.key">
        <view class="section-header">
          <text class="section-title">{{ section.name }}</text>
          <text class="section-count">{{ section.doneCount }}/{{ section.totalCount }}</text>
        </view>
        <view
          v-for="(item, idx) in section.items"
          :key="idx"
          class="check-item"
          :class="{ 'check-item-done': item.done }"
          @tap="toggleItem(item)"
        >
          <!-- Checkbox -->
          <view class="checkbox" :class="{ 'checkbox-checked': item.done }">
            <text v-if="item.done" class="checkbox-tick">✓</text>
          </view>
          <!-- Text -->
          <text class="check-text" :class="{ 'check-text-done': item.done }">{{ item.text }}</text>
          <!-- Category Badge -->
          <text class="cat-badge" :class="[badgeClass(item.category), { 'cat-badge-faded': item.done }]">
            {{ badgeLabel(item.category) }}
          </text>
        </view>
      </template>

      <view class="bottom-spacer"></view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import NavBar from '@/components/NavBar.vue'

// Category filter definitions (static keys + names)
const categoryDefs = [
  { key: 'all', name: '全部' },
  { key: 'mom', name: '妈妈用品' },
  { key: 'baby', name: '宝宝用品' },
  { key: 'doc', name: '证件资料' },
  { key: 'other', name: '其他' }
]

const activeCategory = ref('all')

// Checklist items
const items = ref([
  // 妈妈用品
  { text: '产妇卫生巾', done: false, category: 'mom' },
  { text: '哺乳内衣', done: true, category: 'mom' },
  { text: '拖鞋', done: false, category: 'mom' },
  { text: '吸奶器', done: false, category: 'mom' },
  { text: '产后收腹带', done: false, category: 'mom' },
  { text: '产妇睡衣', done: true, category: 'mom' },
  { text: '哺乳枕', done: true, category: 'mom' },
  { text: '一次性内裤', done: false, category: 'mom' },
  { text: '洗漱用品', done: true, category: 'mom' },
  { text: '防溢乳垫', done: true, category: 'mom' },
  { text: '出院服', done: true, category: 'mom' },
  { text: '保温杯', done: true, category: 'mom' },
  // 宝宝用品
  { text: '纸尿裤', done: false, category: 'baby' },
  { text: '抱被', done: true, category: 'baby' },
  { text: '连体爬服', done: false, category: 'baby' },
  { text: '婴儿湿巾', done: false, category: 'baby' },
  { text: '奶瓶', done: true, category: 'baby' },
  { text: '婴儿面霜', done: true, category: 'baby' },
  { text: '口水巾', done: false, category: 'baby' },
  { text: '婴儿帽', done: false, category: 'baby' },
  { text: '包被', done: false, category: 'baby' },
  { text: '婴儿指甲剪', done: false, category: 'baby' },
  // 证件资料
  { text: '身份证', done: true, category: 'doc' },
  { text: '健康手册', done: true, category: 'doc' },
  { text: '医保卡', done: false, category: 'doc' },
  { text: '产检记录本', done: true, category: 'doc' },
  // 其他
  { text: '充电器', done: false, category: 'other' },
  { text: '零食能量棒', done: false, category: 'other' }
])

// Computed stats
const doneCount = computed(() => items.value.filter(i => i.done).length)
const totalCount = computed(() => items.value.length)
const progressPercent = computed(() => {
  if (totalCount.value === 0) return 0
  return Math.round((doneCount.value / totalCount.value) * 100)
})

// Category counts (reactive)
const categoryCounts = computed(() => {
  const counts = { all: totalCount.value, mom: 0, baby: 0, doc: 0, other: 0 }
  items.value.forEach(item => {
    if (counts[item.category] !== undefined) {
      counts[item.category]++
    }
  })
  return counts
})

// Filter buttons with live counts
const categoryFilters = computed(() => {
  return categoryDefs.map(cat => ({
    ...cat,
    count: categoryCounts.value[cat.key] || 0
  }))
})

// Build sections for grouped display
const sectionDefs = [
  { key: 'mom', name: '妈妈用品' },
  { key: 'baby', name: '宝宝用品' },
  { key: 'doc', name: '证件资料' },
  { key: 'other', name: '其他' }
]

const filteredSections = computed(() => {
  const sections = []
  const keysToShow = activeCategory.value === 'all'
    ? sectionDefs.map(s => s.key)
    : [activeCategory.value]

  keysToShow.forEach(key => {
    const def = sectionDefs.find(s => s.key === key)
    if (!def) return
    const sectionItems = items.value.filter(i => i.category === key)
    if (sectionItems.length === 0) return
    sections.push({
      key,
      name: def.name,
      items: sectionItems,
      doneCount: sectionItems.filter(i => i.done).length,
      totalCount: sectionItems.length
    })
  })

  return sections
})

// Toggle item done state
function toggleItem(item) {
  item.done = !item.done
}

// Badge helpers
function badgeClass(category) {
  const map = {
    mom: 'badge-mom',
    baby: 'badge-baby',
    doc: 'badge-doc',
    other: 'badge-other'
  }
  return map[category] || ''
}

function badgeLabel(category) {
  const map = {
    mom: '妈妈',
    baby: '宝宝',
    doc: '证件',
    other: '其他'
  }
  return map[category] || ''
}
</script>

<style scoped lang="scss">
.page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #FBF7F2;
  box-sizing: border-box;
}

/* ── Hero ── */
.hero {
  background: linear-gradient(155deg, #8A5818 0%, #C98A3A 45%, #F0C878 100%);
  padding-bottom: 48rpx;
  flex-shrink: 0;
}

.hero-navbar :deep(.nav-bar-dark) {
  background: transparent;
}

.hero-navbar :deep(.status-bar-dark) {
  background: transparent;
}

.hero-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32rpx 32rpx 0;
}

.hero-label {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.75);
  margin-bottom: 8rpx;
}

.hero-number {
  font-size: 56rpx;
  font-weight: 700;
  color: #FFFFFF;
  line-height: 1.2;
  margin-bottom: 12rpx;
}

.hero-sub {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.65);
}

/* ── Progress Card ── */
.progress-card {
  margin: -24rpx 32rpx 0;
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 28rpx 32rpx;
  box-shadow: 0 8rpx 32rpx rgba(60, 30, 10, 0.10);
  position: relative;
  z-index: 10;
  flex-shrink: 0;
}

.progress-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.progress-label {
  font-size: 26rpx;
  font-weight: 500;
  color: #6E6A64;
}

.progress-percent {
  font-size: 30rpx;
  font-weight: 700;
  color: #C98A3A;
}

.progress-track {
  height: 16rpx;
  background: #F2F0EE;
  border-radius: 999rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #C98A3A, #F0C878);
  border-radius: 999rpx;
  transition: width 0.3s ease;
}

/* ── Filter Strip ── */
.filter-scroll {
  flex-shrink: 0;
  white-space: nowrap;
  padding: 24rpx 0 12rpx;
}

.filter-row {
  display: inline-flex;
  padding: 0 32rpx;
  gap: 16rpx;
}

.filter-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 64rpx;
  padding: 0 28rpx;
  border-radius: 999rpx;
  background: #F2F0EE;
  flex-shrink: 0;
}

.filter-btn-active {
  background: #C98A3A;
}

.filter-text {
  font-size: 24rpx;
  font-weight: 500;
  color: #9C9890;
  white-space: nowrap;
}

.filter-text-active {
  color: #FFFFFF;
}

/* ── Checklist Scroll ── */
.checklist-scroll {
  flex: 1;
  padding: 0 32rpx;
}

/* ── Section Header ── */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 8rpx 16rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #3A3834;
}

.section-count {
  font-size: 24rpx;
  font-weight: 500;
  color: #9C9890;
}

/* ── Check Item ── */
.check-item {
  display: flex;
  align-items: center;
  background: #FFFFFF;
  border-radius: 20rpx;
  padding: 24rpx 28rpx;
  margin-bottom: 16rpx;
  gap: 20rpx;
  box-shadow: 0 2rpx 16rpx rgba(60, 30, 10, 0.05);
}

.check-item-done {
  opacity: 0.7;
}

/* ── Checkbox ── */
.checkbox {
  width: 44rpx;
  height: 44rpx;
  border-radius: 10rpx;
  border: 3rpx solid #E4E1DC;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: #FAF9F8;
  transition: all 0.2s ease;
}

.checkbox-checked {
  background: #C98A3A;
  border-color: #C98A3A;
}

.checkbox-tick {
  font-size: 26rpx;
  font-weight: 700;
  color: #FFFFFF;
  line-height: 1;
}

/* ── Check Text ── */
.check-text {
  flex: 1;
  font-size: 28rpx;
  font-weight: 500;
  color: #3A3834;
  line-height: 1.4;
}

.check-text-done {
  text-decoration: line-through;
  color: #9C9890;
}

/* ── Category Badge ── */
.cat-badge {
  font-size: 22rpx;
  font-weight: 500;
  padding: 6rpx 16rpx;
  border-radius: 999rpx;
  flex-shrink: 0;
  transition: opacity 0.2s ease;
}

.cat-badge-faded {
  opacity: 0.4;
}

.badge-mom {
  background: #FDEEF1;
  color: #C0405A;
}

.badge-baby {
  background: #F0ECFB;
  color: #5A40A8;
}

.badge-doc {
  background: #EBF3FE;
  color: #2A6FCC;
}

.badge-other {
  background: #FEF4E3;
  color: #8C5A10;
}

/* ── Bottom Spacer ── */
.bottom-spacer {
  height: 120rpx;
}
</style>
