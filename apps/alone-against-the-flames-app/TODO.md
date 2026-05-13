# 向火独行 — 后续开发待办

> 更新于 2026-05-13

---

## 已完成

- [x] 指令→效果系统：`module.js` 的 `toNode()` 将 directives 转换为引擎可执行的 effects
- [x] 引擎新增 `tickSkill` 效果 + 骰子表达式（1D3/1D6 等）内部解析
- [x] `checkHints` 从 directives 自动生成，含 difficulty（hard/extreme）和 mode（bonus/penalty）
- [x] 检定 UI 改造：移除奖励骰/惩罚骰手动选择器，检定前隐藏路径按钮，检定后只显示对应路径
- [x] Debug 跳转不再重置角色状态
- [x] localStorage 游戏进度持久化（自动存/读，重开时清除）
- [x] 骰子内联模式：检定掷骰全屏透明 overlay + 右下角 toast 2 秒自动消失
- [x] 结局复盘页面：18 个结局条目到达后展示复盘面板（路径/状态/里程碑/技能成长/重开按钮）
- [x] 孤立 check 修饰符修复：parser 正则扩展支持中文弯引号，新增 consequence 上下文标记
- [x] 检定与路径精确绑定：`classifyOutcome()` 支持多种中文成功/失败/大失败表述，fumble/non_fumble 门控
- [x] ENTRY_SCRIPTS 全部 270 节点逐一自然语言理解并完成脚本化
- [x] 效果通知 UI：故事区域显示 effect pills（伤害/治疗/成长/物品等）
- [x] 物品获得在角色面板正确显示（inventory 合并修复）
- [x] 属性检定目标值修复：`directivesToCheckHints` 区分 attribute/derived/skill 类型
- [x] 伤害阈值自动分支：entry-55 类型条目根据伤害值 vs maxHP/2 自动选择路径
- [x] 对抗检定 & 战斗系统：5 个战斗场景完整实现
- [x] 孤注一掷（Pushed Roll）：entry-165 三路分支完整实现
- [x] 检定节点冗余路径修复：numeric duplicate jump 与 gated action 指向同一目标时自动去重
- [x] UI 大改造：复古克苏鲁风格 + 布局精简（深褐暖调、IM Fell English、折叠面板、浮动角色卡）
- [x] P1 惩罚骰 flag 接入检定系统：`penaltyDay` flag 自动将 regular 检定升级为 penalty（幸运/理智豁免）
- [x] P2 HP 归零全局死亡机制：引擎检测 hp<=0 设置 `state.dead`，渲染层显示死亡结算页面
- [x] P3 flag 来源确认：`nightFight` 在 entry-45（夜间战斗后醒来）设置；`nightCheckSuccess` 在 entry-141（追踪成功追至悬崖）设置
- [x] P4 entry-90/198 施法消耗 MP：内联数字选择器 + 动态检定目标值（消耗点数×10%）
- [x] penaltyDay 第三天清除：entry-248/266 进入第三天时清除 flag
- [x] parsed-entries.json directive 双重应用修复：18 个条目的误解析/重复 directive 全部清理
- [x] entry-65/93/109 HP 归零条件死亡：HP 未归零时取消 dead 状态，允许继续检定
- [x] 结局节点渲染修复：`endingId` 只在 `state.dead` 为真时才触发结局复盘页面
- [x] 幸运消耗（Spending Luck）：检定失败后显示"花费 N 点幸运通过"绿色按钮，与孤注一掷并列
- [x] 行动回声节点编号：每条回声记录前显示金色 `#节点号`，方便追溯

---

## 待办

### 优先级 1：遗留机制问题

1. **entry-167 熊双爪攻击战斗**
   - 熊用双爪各攻击一次，每爪 35% 命中，造成 3D6 伤害
   - 任一爪伤害 ≥ maxHP/2 则重伤，两爪结算后判断路径
   - 考虑纳入 combat-scripts.js 战斗系统，或实现"多次攻击"效果类型

### 优先级 2：核心机制补全

2. **重伤/昏迷状态**
   - HP 降到 maxHP/2 以下时标记"重伤"状态（`state.flags.majorWound`）
   - 状态影响后续检定或触发特殊分支（entry-67/179 等节点已有重伤判断）
   - 角色面板需显示重伤标记

### 优先级 3：体验优化

3. **叙事 flag 触发**
   - `getContextualNotes()` 已有大量 flag 条件文本，但 flag 需要被实际触发
   - 需在特定条目的 `onEnterEffects` 中添加 `setFlag` 效果
   - 重点 flag：`metRuth`、`heardAboutFestival`、`visitedBlackStructure`、`roadsBlocked` 等

4. **entry-89 大失败禁止推骰的 UX 优化**
   - 当前 entry-89（独立推骰节点）在大失败后仍显示检定按钮
   - 理想行为：如果上一个节点（entry-83）掷出大失败，entry-89 应自动禁用检定

5. **角色面板 tickSkill 展示验证**
   - 确认技能成长勾选在面板中正确显示绿色标记

### 优先级 4：内容与完善

6. **插图资源确认**
   - `assets/figures/` 目录下的 12 张插图路径是否正确
   - 条目 1 的 `opening-full-page.png` 是否存在

7. **角色创建流程集成**
   - 当前只支持导入 .coc7 文件或使用示例角色
   - 考虑内嵌简化版角色创建（选属性→选职业→开始游戏）

8. **结局复盘页增强**
   - 完整路径回顾可视化
   - 解锁的结局列表（已解锁 vs 未解锁）

### 优先级 5：长期规划

9. **多存档支持**
   - localStorage 当前只存一个存档，考虑支持多个存档槽位

10. **移动端适配**
    - 三栏布局在移动端需要折叠为单栏

---

## 关键文件索引

| 文件 | 职责 |
|------|------|
| `js/app.js` | 主入口，状态管理，事件绑定，战斗集成 |
| `js/engine/module-engine.js` | 引擎核心：节点流转、效果执行、阈值门控 |
| `js/engine/opposed-roll.js` | CoC 7e 对抗检定纯函数（成功等级比较） |
| `js/engine/combat-engine.js` | 战斗状态机：回合驱动、骰子请求、伤害应用 |
| `js/data/module.js` | 数据适配：parsed JSON → 引擎节点，ENTRY_SCRIPTS，THRESHOLD_GATES |
| `js/data/combat-scripts.js` | 5 个战斗场景的声明式配置 |
| `js/data/parsed-entries.json` | 解析后的 270 条目原始数据 |
| `js/adapters/dice-adapter.js` | DiceBox 骰子适配器 |
| `js/adapters/character-adapter.js` | 角色卡适配器，检定解析 |
| `js/ui/render.js` | UI 渲染函数 |
| `js/ui/character-panel.js` | 角色面板渲染 |
| `js/ui/combat-overlay.js` | 战斗弹出层 UI |
| `css/app.css` | 主样式 |
| `css/combat.css` | 战斗弹出层样式 |
| `scripts/parse-fulltext.mjs` | 全文解析脚本（生成 parsed-entries.json） |
| `scripts/entry-scripts-progress.md` | 270 节点脚本化进度与遗留问题详细记录 |
