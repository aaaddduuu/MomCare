# 核心设计系统文档：柔韧之美 (Modern Feminine Strength)

作为高级 UI/UX 设计总监，我们在此确立的不仅仅是一套组件库，而是一种数字化的“陪伴感”。本设计系统旨在摆脱传统医疗应用的冰冷感，通过 **Material Design 3** 的逻辑框架，注入“现代女性力量”与“优雅暖意”。我们拒绝平庸的网格，追求有呼吸感的留白与极具意图的排版。

---

### 1. 创意北极星 (Creative North Star)：数字策展人 (The Digital Curator)
本系统的核心理念是 **“有温度的精准”**。我们不堆砌信息，而是像策展人一样整理母亲在孕期每一阶段的需求。设计打破了僵化的模版感，通过非对称的布局意图、重叠的层次以及极高对比度的字体比例，创造出一种高级社论（Editorial）般的视觉体验。

---

### 2. 色彩策略 (Color Palette & Atmosphere)

我们将色彩视为情感的载体。核心色 `#C2185B` 不仅仅是点缀，它是力量与生命的象征。

*   **品牌核心 (The Pulse):** 
    *   `primary` (#9B0044) 与 `primary_container` (#C2185B): 用于核心行动点与关键进度指示。
*   **无线条原则 (The No-Line Rule):** 
    禁止使用 1px 实线进行区域分割。所有的边界必须通过背景色的微妙位移（例如：在 `surface` 背景上嵌套 `surface_container_low`）来定义。
*   **表面层级与嵌套 (Surface Hierarchy):** 
    将 UI 视为多层叠放的顶级艺术纸张。通过 `surface_container` 从 Lowest 到 Highest 的推演，建立深度感。
*   **玻璃感与渐变 (Glass & Gradient):** 
    针对悬浮元素（如底部导航或浮动通知），应使用半透明的 `surface` 色彩配合 `backdrop-blur` (15px-25px)。关键 CTA 按钮应使用从 `primary` 到 `primary_container` 的微弱垂直渐变，赋予其“灵魂”而非干瘪的平涂色。

---

### 3. 排版系统 (Typography: The Hero Style)

排版是本系统的骨骼。我们通过 **Manrope** 的理智与 **Plus Jakarta Sans** 的现代感交织，营造专业且亲和的语境。

*   **英雄数字 (Hero Number):** 
    针对孕期倒计时或关键健康指标，强制使用 `display-lg` (3.5rem+, Bold, #C2185B)。这是视觉的锚点，必须在屏幕中占据绝对统治力。
*   **标题层级:** 
    `headline-lg` 用于情感引导语（如：“早安，准妈妈”），采用非对称对齐，留出至少 32px 的侧边边距。
*   **正文语义:** 
    `body-lg` 负责专业知识传达，行间距设置为 1.6 倍，确保在高密度阅读下的极致舒适。

---

### 4. 深度与高度 (Elevation & Depth)

我们不使用结构线条，我们使用**调性图层 (Tonal Layering)**。

*   **层级堆叠原理:** 
    利用 `surface_container_lowest` (纯白) 的卡片放置在 `surface_container_low` (#F2F4F7) 的背景上。这种“软提升”比阴影更自然，更符合“优雅暖意”的基调。
*   **氛围阴影 (Ambient Shadows):** 
    仅在必须浮起的元素上使用极度扩散的阴影（Blur 20px-40px），透明度控制在 4%-6%，且阴影颜色应带有 2% 的 `primary` 色相，模拟自然光线穿过皮肤或织物的柔和感。
*   **幽灵边框 (Ghost Border):** 
    若因无障碍需求必须使用边框，仅允许使用 `outline_variant` 并在透明度降至 15% 后使用。

---

### 5. 核心组件规范 (Components)

#### **卡片与列表 (Cards & Lists)**
*   **原则:** 严禁使用分割线。
*   **实现:** 利用垂直间距（Spacing Scale: 16px, 24px, 32px）或色块切换来区分内容块。卡片圆角统一使用 `xl` (24px) 或 `lg` (16px)。

#### **交互按钮 (Buttons)**
*   **Primary:** 全圆角 (full)，背景为 `primary` 渐变，文字为 `on_primary`。
*   **Tertiary:** 仅文字，但在 Hover 或 Press 状态下，下方出现 4px 的 `primary_fixed` 柔和色块。

#### **输入字段 (Input Fields)**
*   放弃传统的全框式输入框。使用填充式 (Filled) 背景 `surface_container_high`，配合底部 2px 的 `outline_variant` 激活线。错误状态使用 `error` 色值，并伴随轻微的触感反馈。

#### **进度指示器 (Pregnancy Progress)**
*   结合线型艺术 (Line Art)。使用 `#C2185B` 的极细线条勾勒胎儿发育阶段，背景衬以大面积的 `surface_container_lowest` 玻璃感圆环。

---

### 6. 行为准则 (Do's and Don'ts)

✅ **Do:**
*   **拥抱留白:** 每一屏至少保持 20% 的视觉空白。
*   **情感化文案:** 使用“您的宝宝今天...”而非“胎儿发育数据...”。
*   **动态叙事:** 页面切换时使用容器转换（Container Transform）动画，让元素仿佛在纸面上滑动。

❌ **Don't:**
*   **禁止使用纯黑 (#000000):** 请使用 `on_surface` (#191C1E) 保持色调的深沉而非生硬。
*   **禁止使用 1px 硬线条:** 它们会切断视觉流，破坏系统的“呼吸感”。
*   **避免过度装饰:** 所有的装饰性元素（如矢量线稿）必须服务于功能或情感，不可为了美观而堆砌。

---

### 7. 结语
本设计系统不是为了限制创意，而是为了提供一个高水准的起点。请记住，每一处圆角的变化，每一份色彩的浓淡，都是在向用户传递一份：**“在这段生命奇迹的旅程中，你被温柔且专业地呵护着。”**