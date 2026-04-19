# 产检提醒功能设计文档

## 概述

将产检提醒页面从硬编码假数据改造为基于真实数据库数据的完整功能，包含标准产检时间表自动推荐、手动调整、检查项目勾选、历史记录回看。

## 需求确认

- **数据来源**: 系统根据孕周自动推荐标准产检时间表，用户可手动调整日期、增删检查项目
- **页面范围**: 显示下一次产检详情 + 已完成产检的历史记录
- **提醒方式**: 仅页面内倒计时提醒（不做微信推送通知）
- **存储方案**: 新建 `checkup_schedules` 数据库表

## 数据库设计

### checkup_schedules 表

```json
{
  "bsonType": "object",
  "required": ["user_id", "checkup_date", "week_of_pregnancy"],
  "permission": {
    "read": "doc.user_id == auth.uid",
    "create": "doc.user_id == auth.uid",
    "update": "doc.user_id == auth.uid",
    "delete": "doc.user_id == auth.uid"
  },
  "properties": {
    "_id": { "description": "记录ID" },
    "user_id": {
      "bsonType": "string",
      "description": "用户ID",
      "foreignKey": "mom_users._id"
    },
    "checkup_date": {
      "bsonType": "string",
      "description": "产检日期 YYYY-MM-DD"
    },
    "week_of_pregnancy": {
      "bsonType": "int",
      "description": "计划孕周"
    },
    "hospital": {
      "bsonType": "string",
      "description": "医院（为空时取userInfo默认值）"
    },
    "department": {
      "bsonType": "string",
      "description": "科室"
    },
    "time_slot": {
      "bsonType": "string",
      "description": "时段（上午/下午）",
      "enum": ["morning", "afternoon", ""]
    },
    "status": {
      "bsonType": "string",
      "description": "状态",
      "enum": ["upcoming", "completed", "skipped"],
      "defaultValue": "upcoming"
    },
    "exam_items": {
      "bsonType": "array",
      "description": "检查项目列表",
      "arrayType": "object"
    },
    "notes": {
      "bsonType": "string",
      "description": "备注"
    },
    "remind_days_before": {
      "bsonType": "array",
      "description": "提前几天提醒 [1,3]",
      "arrayType": "int"
    },
    "create_time": {
      "bsonType": "timestamp",
      "forceDefaultValue": { "$env": "now" }
    },
    "update_time": {
      "bsonType": "timestamp"
    }
  }
}
```

`exam_items` 数组中每个对象的结构：

```json
{
  "text": "血常规检查",
  "required": true,
  "done": false
}
```

## 标准产检推荐时间表

根据 LMP（末次月经）日期自动计算每次产检的计划日期：

| 序号 | 孕周 | 推荐日期偏移(天) | 必查项目 | 选查项目 |
|------|------|------------------|----------|----------|
| 1 | 6-8周 | LMP+42 | 早孕B超、血常规、尿常规、血型、甲状腺功能 | - |
| 2 | 11-13周 | LMP+84 | NT检查、早期唐筛、血常规、尿常规 | - |
| 3 | 16-18周 | LMP+119 | 中期唐筛、血常规、尿常规 | 无创DNA |
| 4 | 20-22周 | LMP+147 | 大排畸B超、血常规、尿常规 | - |
| 5 | 24-28周 | LMP+182 | 糖耐量试验(OGTT)、血常规、尿常规 | - |
| 6 | 28-30周 | LMP+203 | 常规产检、小排畸B超 | - |
| 7 | 32周 | LMP+224 | 胎心监护(NST)、血常规、尿常规、B超 | - |
| 8 | 34周 | LMP+238 | 胎心监护、常规产检 | - |
| 9 | 36周 | LMP+252 | B超(评估胎位/羊水)、胎心监护、血常规 | - |
| 10 | 37周 | LMP+259 | 胎心监护、常规产检、骨盆测量 | - |
| 11 | 38周 | LMP+266 | 胎心监护、常规产检 | - |
| 12 | 39周 | LMP+273 | 胎心监护、B超 | - |
| 13 | 40周 | LMP+280 | 胎心监护、常规产检 | - |

## Store 扩展设计

在 `stores/health.js` 中新增产检日程功能，不新建独立 store。

### 新增 State

```
checkupSchedules: ref([])  // 所有产检日程列表
```

### 新增 Getters

- `nextCheckup`: 返回 status 为 upcoming 且日期最近的日程
- `completedCheckups`: 返回 status 为 completed 的日程，按日期倒序
- `upcomingCheckups`: 返回所有 status 为 upcoming 的日程，按日期正序

### 新增 Actions

**initCheckupSchedules()**
- 根据用户 LMP 日期，按推荐时间表生成 13 条日程记录
- 每条包含计算好的 checkup_date、week_of_pregnancy、exam_items
- 已过期的日程标记为 completed
- 批量写入云端数据库

**loadCheckupSchedules()**
- 从 checkup_schedules 表按 user_id 查询
- 按日期排序
- 更新 checkupSchedules state

**updateCheckupSchedule(id, data)**
- 更新单条日程的字段（日期、医院、检查项目等）
- 同步到云端数据库

**toggleExamItem(scheduleId, itemIdx)**
- 切换指定日程中某个检查项目的 done 状态
- 自动检测：如果所有必查项目都 done，提示是否标记整个日程为 completed
- 持久化到云端

**markCheckupCompleted(scheduleId)**
- 将日程状态从 upcoming 改为 completed
- 记录实际完成日期

### 数据初始化流程

```
用户进入产检提醒页
  → loadCheckupSchedules()
  → 如果返回空数组（首次使用）
    → initCheckupSchedules()
    → 计算推荐日期
    → 过去日期的标记 completed
    → 写入数据库
  → 页面渲染
```

## 页面交互设计

### 页面结构

**上半部分 — 下一次产检**

1. Hero 区域（保持现有样式，数据改为动态）
   - 标签："下次产检日期"
   - 日期：从 nextCheckup.checkup_date 格式化
   - 副标题：星期 · 医院 · 科室
   - 倒计时药丸：距离天数自动计算

2. 产检信息卡片
   - 📅 日期（完整格式，含星期）
   - 🏥 医院 · 科室
   - 👩‍⚕️ 预计孕周

3. 检查项目清单
   - 从 nextCheckup.exam_items 渲染
   - 勾选后持久化到数据库
   - 必查/选查标签

4. 编辑按钮
   - 修改日期、医院、检查项目
   - 使用底部弹窗（Sheet）交互

**下半部分 — 历史产检记录**

1. 分割标题："历史产检记录"

2. 时间线列表
   - 每条：日期 · 孕周 · 完成项目数/N · 状态标签
   - 点击展开查看具体项目

**空状态**
- 首次进入无数据时自动初始化
- 显示提示："已为您生成标准产检计划"

### 个人中心联动

`profile/index.vue` 中"下次产检"卡片改为动态数据：

```javascript
// 改造前（硬编码）
{ title: '下次产检', subtitle: '4月20日 · 还有 7 天', badge: '7天后' }

// 改造后（动态数据）
const nextCheckup = computed(() => healthStore.nextCheckup)
const checkupSubtitle = computed(() => {
  if (!nextCheckup.value) return '暂无产检安排'
  const date = formatDate(nextCheckup.value.checkup_date)
  const days = calcDaysUntil(nextCheckup.value.checkup_date)
  return `${date} · 还有 ${days} 天`
})
```

## 受影响文件

| 文件 | 改动类型 | 说明 |
|------|----------|------|
| `uniCloud-aliyun/database/checkup_schedules.schema.json` | 新建 | 数据库表定义 |
| `stores/health.js` | 修改 | 新增产检日程 state/getters/actions |
| `pages/profile/checkup-reminder.vue` | 重写 | 从假数据改为真实数据 |
| `pages/profile/index.vue` | 修改 | "下次产检"卡片数据动态化 |

## 非目标

- 不做微信推送通知（本次仅页面内提醒）
- 不做产检报告解读联动（已有独立的档案管理功能）
- 不做多医院切换（使用 userInfo 中的默认医院）
