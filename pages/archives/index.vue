<template>
  <view class="page">
    <!-- NavBar -->
    <NavBar title="产检档案" :showBack="false">
      <template #right>
        <view class="nav-action" @tap="showUploadSheet = true">
          <text class="nav-action-icon">+</text>
        </view>
      </template>
    </NavBar>

    <!-- Search & Filter Row -->
    <view class="search-row">
      <view class="search-box-wrap">
        <text class="search-icon">🔍</text>
        <input class="search-box" placeholder="搜索报告类型、日期…" placeholder-class="search-placeholder" />
      </view>
      <view class="filter-btn">
        <text class="filter-text">筛选 ▾</text>
      </view>
    </view>

    <!-- Horizontal Tabs -->
    <view class="tabs-wrap">
      <scroll-view scroll-x class="tabs-scroll" :show-scrollbar="false">
        <view class="tabs">
          <view
            v-for="(tab, idx) in tabs"
            :key="idx"
            class="tab"
            :class="{ active: activeTab === idx }"
            @tap="activeTab = idx"
          >
            <text class="tab-label" :class="{ 'tab-label-active': activeTab === idx }">{{ tab.name }}</text>
            <text v-if="tab.count" class="tab-count" :class="{ 'tab-count-active': activeTab === idx }">{{ tab.count }}</text>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- Scrollable List -->
    <scroll-view scroll-y class="scroll">
      <!-- Unarchived Banner -->
      <view v-if="unarchivedCount > 0" class="unarchived-banner" @tap="onBannerTap">
        <view class="banner-dot"></view>
        <text class="banner-text"><text class="banner-strong">{{ unarchivedCount }} 份报告</text>待分类，点击整理</text>
        <text class="banner-arrow">›</text>
      </view>

      <!-- Grouped Report Cards -->
      <template v-for="(group, gIdx) in reportGroups" :key="gIdx">
        <view class="section-header">
          <text class="section-header-text">{{ group.month }}</text>
        </view>
        <view
          v-for="(report, rIdx) in group.reports"
          :key="rIdx"
          class="report-card"
          @tap="onReportTap(report)"
        >
          <view class="report-thumb">
            <text class="report-thumb-icon">{{ report.icon }}</text>
          </view>
          <view class="report-info">
            <view class="report-top">
              <text class="type-badge" :class="report.typeClass">{{ report.typeLabel }}</text>
              <text class="report-date">{{ report.dateShort }}</text>
            </view>
            <text class="report-title">{{ report.title }}</text>
            <view class="report-meta">
              <text class="report-meta-text">{{ report.gestationalWeek }}</text>
              <text class="ai-tag" :class="report.aiInterpreted ? 'done' : 'pending'">
                {{ report.aiInterpreted ? '✦ 已解读' : '未解读' }}
              </text>
            </view>
          </view>
        </view>
      </template>
    </scroll-view>

    <!-- Upload Sheet -->
    <UploadSheet v-model:show="showUploadSheet" />
  </view>
</template>

<script setup>
import { ref } from 'vue'
import UploadSheet from './components/UploadSheet.vue'
import NavBar from '@/components/NavBar.vue'

const showUploadSheet = ref(false)
const activeTab = ref(0)
const unarchivedCount = ref(3)

const tabs = ref([
  { name: '全部', count: 11 },
  { name: '血液检查', count: 4 },
  { name: 'B 超', count: null },
  { name: '筛查', count: null },
  { name: '尿常规', count: null },
  { name: '产科记录', count: null },
  { name: '其他', count: null }
])

const reportGroups = ref([
  {
    month: '2025 年 4 月',
    reports: [
      {
        icon: '🩸',
        typeLabel: '血常规',
        typeClass: 'type-blood',
        dateShort: '04/02',
        title: '血常规检查报告',
        gestationalWeek: '孕 32 周',
        aiInterpreted: true
      },
      {
        icon: '🔬',
        typeLabel: '尿常规',
        typeClass: 'type-urine',
        dateShort: '04/02',
        title: '尿液检查报告',
        gestationalWeek: '孕 32 周',
        aiInterpreted: true
      }
    ]
  },
  {
    month: '2025 年 3 月',
    reports: [
      {
        icon: '📊',
        typeLabel: 'B 超',
        typeClass: 'type-ultrasound',
        dateShort: '03/15',
        title: '三维彩超报告',
        gestationalWeek: '孕 30 周',
        aiInterpreted: true
      },
      {
        icon: '🍬',
        typeLabel: '糖耐量',
        typeClass: 'type-sugar',
        dateShort: '03/15',
        title: 'OGTT 糖耐量试验',
        gestationalWeek: '孕 30 周',
        aiInterpreted: false
      },
      {
        icon: '🩸',
        typeLabel: '血常规',
        typeClass: 'type-blood',
        dateShort: '03/15',
        title: '血常规检查报告',
        gestationalWeek: '孕 30 周',
        aiInterpreted: true
      }
    ]
  },
  {
    month: '2025 年 2 月',
    reports: [
      {
        icon: '🧬',
        typeLabel: '唐氏筛查',
        typeClass: 'type-screen',
        dateShort: '02/10',
        title: '唐氏综合征筛查',
        gestationalWeek: '孕 16 周',
        aiInterpreted: true
      }
    ]
  }
])

function onBannerTap() {
  uni.navigateTo({ url: '/pages/archives/unarchived' })
}

function onReportTap(report) {
  uni.navigateTo({ url: '/pages/archives/detail' })
}
</script>

<style scoped lang="scss">
/* ── CSS Variables from Prototype ── */
page {
  --rose: #E8637A;
  --rose-light: #FDEEF1;
  --rose-mid: #F5B8C4;
  --rose-dark: #C0405A;
  --teal-light: #E6F7F4;
  --amber: #F0A940;
  --amber-light: #FEF4E3;
  --purple-light: #F0ECFB;
  --blue-light: #EBF3FE;
  --green-light: #EAF7EF;
  --green: #5BBF7C;
  --gray-50: #FAF9F8;
  --gray-100: #F2F0EE;
  --gray-200: #E4E1DC;
  --gray-300: #C8C4BC;
  --gray-400: #9C9890;
  --gray-500: #6E6A64;
  --gray-700: #3A3834;
  --gray-900: #1C1A17;
  --radius: 16px;
  --radius-sm: 10px;
  --radius-pill: 999px;
  --shadow: 0 2px 16px rgba(0, 0, 0, 0.07);
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.10);
}

.page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #FAF9F8;
  font-family: 'DM Sans', 'Noto Sans SC', sans-serif;
}

/* ── Nav Action Button ── */
.nav-action {
  width: 68rpx;
  height: 68rpx;
  border-radius: 50%;
  background: #E8637A;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4rpx 16rpx rgba(232, 99, 122, 0.35);
}

.nav-action-icon {
  font-size: 40rpx;
  font-weight: 300;
  color: white;
  line-height: 1;
}

/* ── Search Row ── */
.search-row {
  background: white;
  display: flex;
  padding: 20rpx 32rpx;
  gap: 16rpx;
  flex-shrink: 0;
}

.search-box-wrap {
  flex: 1;
  height: 72rpx;
  background: #F2F0EE;
  border-radius: 999px;
  display: flex;
  align-items: center;
  padding: 0 28rpx;
  gap: 12rpx;
}

.search-icon {
  font-size: 24rpx;
  flex-shrink: 0;
}

.search-box {
  flex: 1;
  height: 72rpx;
  font-size: 26rpx;
  color: #3A3834;
  background: transparent;
}

.search-placeholder {
  color: #C8C4BC;
  font-size: 26rpx;
}

.filter-btn {
  height: 72rpx;
  padding: 0 24rpx;
  background: #F2F0EE;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.filter-text {
  font-size: 24rpx;
  font-weight: 500;
  color: #6E6A64;
}

/* ── Tabs ── */
.tabs-wrap {
  background: white;
  border-bottom: 1px solid #F2F0EE;
  flex-shrink: 0;
}

.tabs-scroll {
  white-space: nowrap;
}

.tabs {
  display: inline-flex;
  padding: 0 32rpx;
}

.tab {
  display: inline-flex;
  align-items: center;
  padding: 20rpx 28rpx;
  gap: 10rpx;
  border-bottom: 4rpx solid transparent;
}

.tab.active {
  border-bottom-color: #E8637A;
}

.tab-label {
  font-size: 26rpx;
  font-weight: 500;
  color: #9C9890;
  white-space: nowrap;
}

.tab-label-active {
  color: #E8637A;
}

.tab-count {
  font-size: 22rpx;
  font-weight: 600;
  background: #FDEEF1;
  color: #C0405A;
  padding: 2rpx 10rpx;
  border-radius: 999px;
}

.tab-count-active {
  background: #E8637A;
  color: white;
}

/* ── Scroll ── */
.scroll {
  flex: 1;
  padding-bottom: 24rpx;
}

/* ── Unarchived Banner ── */
.unarchived-banner {
  margin: 24rpx 32rpx 0;
  background: #FEF4E3;
  border: 1px solid #F5D38A;
  border-radius: 20rpx;
  padding: 20rpx 28rpx;
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.banner-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: #F0A940;
  flex-shrink: 0;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.banner-text {
  flex: 1;
  font-size: 26rpx;
  color: #8C6A1A;
}

.banner-strong {
  font-weight: 600;
}

.banner-arrow {
  font-size: 24rpx;
  color: #A07820;
}

/* ── Section Header ── */
.section-header {
  padding: 32rpx 32rpx 12rpx;
}

.section-header-text {
  font-size: 22rpx;
  font-weight: 600;
  color: #9C9890;
  letter-spacing: 0.06em;
}

/* ── Report Card ── */
.report-card {
  margin: 0 32rpx 20rpx;
  background: white;
  border-radius: 32rpx;
  padding: 28rpx;
  display: flex;
  gap: 24rpx;
  box-shadow: 0 4rpx 32rpx rgba(0, 0, 0, 0.07);
}

.report-thumb {
  width: 112rpx;
  height: 112rpx;
  border-radius: 20rpx;
  flex-shrink: 0;
  background: #F2F0EE;
  display: flex;
  align-items: center;
  justify-content: center;
}

.report-thumb-icon {
  font-size: 44rpx;
}

.report-info {
  flex: 1;
  min-width: 0;
}

.report-top {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 6rpx;
}

.type-badge {
  font-size: 22rpx;
  font-weight: 600;
  padding: 4rpx 14rpx;
  border-radius: 999px;
}

.report-date {
  font-size: 24rpx;
  color: #9C9890;
  margin-left: auto;
  flex-shrink: 0;
}

.report-title {
  font-size: 28rpx;
  font-weight: 500;
  color: #1C1A17;
  margin-bottom: 8rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.report-meta {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.report-meta-text {
  font-size: 24rpx;
  color: #9C9890;
}

.ai-tag {
  font-size: 22rpx;
  font-weight: 500;
  padding: 4rpx 14rpx;
  border-radius: 999px;
}

.ai-tag.done {
  background: #EAF7EF;
  color: #2D8A50;
}

.ai-tag.pending {
  background: #F2F0EE;
  color: #9C9890;
}

/* ── Type Badge Colors ── */
.type-blood {
  background: #FDEEF1;
  color: #C0405A;
}

.type-ultrasound {
  background: #EBF3FE;
  color: #2A6FCC;
}

.type-urine {
  background: #E6F7F4;
  color: #1A7A68;
}

.type-screen {
  background: #F0ECFB;
  color: #5A40A8;
}

.type-sugar {
  background: #FEF4E3;
  color: #8C5A10;
}

.type-other {
  background: #F2F0EE;
  color: #6E6A64;
}
</style>
