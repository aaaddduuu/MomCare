<template>
	<view class="tabbar-shadow">
		<view class="tabbar">
			<view
				v-for="(tab, idx) in tabs"
				:key="idx"
				class="tab-item"
				@tap="switchTab(idx)"
			>
				<image
					class="tab-icon"
					:src="active === idx ? tab.selectedIconPath : tab.iconPath"
					mode="aspectFit"
				/>
				<text class="tab-text" :class="{ 'tab-text-active': active === idx }">{{ tab.text }}</text>
			</view>
		</view>
	</view>
</template>

<script setup>
const props = defineProps({
	active: {
		type: Number,
		default: 0
	}
})

const tabs = [
	{
		pagePath: '/pages/index/index',
		text: '首页',
		iconPath: '/static/tabbar/home.png',
		selectedIconPath: '/static/tabbar/home.png'
	},
	{
		pagePath: '/pages/knowledge/index',
		text: '知识',
		iconPath: '/static/tabbar/knowledge.png',
		selectedIconPath: '/static/tabbar/knowledge.png'
	},
	{
		pagePath: '/pages/archives/index',
		text: '档案',
		iconPath: '/static/tabbar/archives.png',
		selectedIconPath: '/static/tabbar/archives.png'
	},
	{
		pagePath: '/pages/profile/index',
		text: '我的',
		iconPath: '/static/tabbar/profile.png',
		selectedIconPath: '/static/tabbar/profile.png'
	}
]

function switchTab(idx) {
	if (idx === props.active) return
	uni.switchTab({ url: tabs[idx].pagePath })
}
</script>

<style scoped lang="scss">
.tabbar-shadow {
	position: fixed;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 999;
	background: #FFFFFF;
	box-shadow: 0 -4rpx 24rpx rgba(60, 30, 10, 0.08);
	padding-bottom: env(safe-area-inset-bottom);
}

.tabbar {
	display: flex;
	height: 100rpx;
	align-items: center;
}

.tab-item {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 4rpx;
}

.tab-icon {
	width: 44rpx;
	height: 44rpx;
	opacity: 0.55;
}

.tab-item:active .tab-icon {
	opacity: 0.35;
}

.tab-text {
	font-size: 20rpx;
	color: #757575;
}

.tab-text-active {
	color: #C2185B;
	font-weight: 600;
}
</style>
