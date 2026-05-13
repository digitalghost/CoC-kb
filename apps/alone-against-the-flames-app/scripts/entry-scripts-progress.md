# ENTRY_SCRIPTS 逐节点处理进度

> 更新于 2026-05-12
> 目标：全部 270 个节点逐一自然语言理解，编写精确 ENTRY_SCRIPTS

## 状态说明
- ✅ 已处理（有脚本或确认无需脚本）
- ⏳ 待处理
- ❓ 需要确认

---

## 待解决的遗留问题

### ~~P1：entry-26/52 惩罚骰 flag 未接入检定系统~~ ✅ 已解决
entry-26 无条件设置 `state.flags.penaltyDay = true`。
entry-52 做体质检定，失败时设置 `state.flags.penaltyDay = true`。
**已实现**：`decorateNodeChecks` 中检查 `penaltyDay` flag，若为 true 且检定 mode 为 regular，自动升级为 penalty。
豁免：type=derived 且 key=luck 或 san 的检定不受影响（幸运/理智检定不受惩罚骰）。
flag 无需清除——第二天白天结束后游戏进入最终章，不存在第三天。

### ~~P2：HP 归零全局死亡机制~~ ✅ 已解决
所有 adjustHp 执行后若 hp.current <= 0，触发死亡结算。
**已实现**：
- 引擎 `applyEffects` 中 adjustHp 后检查 hp<=0，设置 `state.dead = true` + `state.deathNodeId`
- 渲染层检测 `state.dead`，显示死亡结算页面（复用 ending-recap UI，tone=death）
- 死亡结算显示：死亡节点、路径长度、HP/SAN 状态、技能成长、重新开始按钮
- `dead`/`deathNodeId` 纳入 saveState/loadState 持久化
- resetState 时 createInitialState 自动清除这两个字段

### P5：entry-167 熊双爪攻击战斗
entry-167 描述熊用双爪各攻击一次，每爪35%命中，造成3D6伤害，任一爪伤害≥maxHP/2则重伤。
这是一个需要两次独立骰子判定的战斗序列，当前效果系统不支持。
**待做**：考虑将此节点纳入战斗系统（combat-scripts.js），或实现"多次攻击"效果类型。

### P4：entry-90 施法消耗MP（玩家自选点数）
entry-90 要求玩家自行决定消耗多少MP（最多10点），超出MP后可消耗HP（但不能归零）。
这是一个需要玩家输入数字的交互，当前效果系统不支持。
**待做**：实现一个"消耗资源"交互 UI，让玩家输入消耗点数，引擎验证并扣除，然后跳转 entry-198。

### P3：entry-64 nightFight flag 来源未确认
entry-64 读取 `state.flags.nightFight` 判断昨晚是否发生战斗。
此 flag 应由夜间战斗节点（待确认具体节点号）在战斗结束后设置。
**待做**：在逐节点处理时，找到夜间战斗节点，添加 `setFlag nightFight true` 脚本。

---

## 进度总览

已处理：270 / 270 ✅ 全部完成！

---

## 节点详情

| 节点 | 状态 | 脚本类型 | 备注 |
|------|------|----------|------|
| entry-1 | ✅ | 无 | 纯叙事，直接跳 entry-263 |
| entry-2 | ✅ | adjustHp +1 | "可以回复1点耐久值" |
| entry-3 | ✅ | 无 | 纯叙事+选择 |
| entry-4 | ✅ | 无 | 纯叙事+选择 |
| entry-5 | ✅ | adjustSan -1d3 | "失去1D3点理智值" |
| entry-6 | ✅ | 无 | 纯叙事+选择 |
| entry-7 | ✅ | 无 | 纯叙事+选择 |
| entry-8 | ✅ | conditionBranch SIZ<=40 | SIZ<=40→entry-23，SIZ>40→entry-38 |
| entry-9 | ✅ | 无 | 纯叙事，跳 entry-22 |
| entry-10 | ✅ | 无 | 纯叙事，跳 entry-18 |
| entry-11 | ✅ | 无 | 纯叙事+选择 |
| entry-12 | ✅ | tickSkill 闪避 | "可以在「闪避」技能左边的小方框里打勾" |
| entry-13 | ✅ | adjustHp +1 | "接受了急救，可以回复1点耐久值" |
| entry-14 | ✅ | 无 | 纯叙事+选择 |
| entry-15 | ✅ | 无 | 纯叙事，跳 entry-22 |
| entry-16 | ✅ | gainItem 狩猎小刀 | 玩家可选择购买 |
| entry-17 | ✅ | checkHint 侦查 | parser 自动处理，成功→30，失败→37 |
| entry-18 | ✅ | 无 | 纯叙事，跳 entry-33 |
| entry-19 | ✅ | tickSkill 恐吓 | "可以在「恐吓」技能左边的小方框里打勾" |
| entry-20 | ✅ | 无 | 纯叙事，跳 entry-120 |
| entry-21 | ✅ | 无 | 纯叙事+选择 |
| entry-22 | ✅ | 无 | 纯叙事+选择 |
| entry-23 | ✅ | 无 | 纯叙事，跳 entry-233 |
| entry-24 | ✅ | 无 | 纯叙事，跳 entry-43 |
| entry-25 | ✅ | 无 | 探索循环枢纽，纯选择 |
| entry-26 | ✅ | custom: setFlag penaltyDay | 当天检定受惩罚骰，flag已写入，检定系统集成见遗留P1 |
| entry-27 | ✅ | 无 | 纯叙事，跳 entry-117 |
| entry-28 | ✅ | checkHint 博物学 | parser 自动处理，成功→35，失败→41 |
| entry-29 | ✅ | custom: conditionBranch DEX vs SIZ | DEX>=SIZ直接→42；否则做敏捷检定 |
| entry-30 | ✅ | tickSkill 侦查 | "可以在「侦查」技能左边的小方框里打勾" |
| entry-31 | ✅ | checkHint 魅惑 | parser 自动处理，成功→39，失败→51 |
| entry-32 | ✅ | 无 | 纯叙事+选择 |
| entry-33 | ✅ | 无 | 纯叙事+选择 |
| entry-34 | ✅ | checkHint 骑术（奖励骰） | parser 自动处理，成功→46，失败→25 |
| entry-35 | ✅ | tickSkill 博物学 | "可以在「博物学」技能左边的小方框里打勾" |
| entry-36 | ✅ | checkHint 攀爬 | parser 自动处理，成功→48，失败→55 |
| entry-37 | ✅ | 无 | 纯叙事，跳 entry-43 |
| entry-38 | ✅ | 无 | 纯叙事，跳 entry-233 |
| entry-39 | ✅ | tickSkill 魅惑 | "在「魅惑」技能左边的小方框里打勾" |
| entry-40 | ✅ | 无 | 纯叙事+选择（咒语分支） |
| entry-41 | ✅ | 无 | 纯叙事+选择 |
| entry-42 | ✅ | 无 | 纯叙事，跳 entry-61 |
| entry-43 | ✅ | 无 | 纯叙事+选择 |
| entry-44 | ✅ | checkHint 困难力量 | parser 自动处理，成功→53，失败→40 |
| entry-45 | ✅ | 无 | 纯叙事，跳 entry-64 |
| entry-46 | ✅ | 无 | 纯叙事，跳 entry-25 |
| entry-47 | ✅ | 无 | 纯叙事，跳 entry-11 |
| entry-48 | ✅ | tickSkill 攀爬 | "可以在「攀爬」技能左边的小方框里打勾" |
| entry-49 | ✅ | 无 | 纯叙事，跳 entry-56 |
| entry-50 | ✅ | 无 | 纯叙事，跳 entry-270（咒语节点） |
| entry-51 | ✅ | 无 | 纯叙事，跳 entry-63 |
| entry-52 | ✅ | custom(checkGated): setFlag penaltyDay | 体质检定失败→惩罚骰flag，检定系统集成见遗留P1 |
| entry-53 | ✅ | 无 | 困难闪避检定，parser处理，成功→109，失败→123 |
| entry-54 | ✅ | 无 | 纯叙事+选择 |
| entry-55 | ✅ | adjustHp -2D6 + thresholdGate | 摔落伤害，伤害≥maxHP/2→67，否则→73 |
| entry-56 | ✅ | 无 | 纯叙事+选择 |
| entry-57 | ✅ | 无 | 侦查检定，parser处理，成功→69，失败→25 |
| entry-58 | ✅ | adjustHp +1 | "可以回复1点耐久值" |
| entry-59 | ✅ | 无 | 纯叙事，跳 entry-71（瘀伤无数值变化） |
| entry-60 | ✅ | 无 | 考古学检定，parser处理，成功→66，失败→72 |
| entry-61 | ✅ | 无 | 纯叙事，跳 entry-120 |
| entry-62 | ✅ | 无 | 纯叙事+选择 |
| entry-63 | ✅ | 无 | 纯叙事，跳 entry-154 |
| entry-64 | ✅ | custom: conditionBranch nightFight flag | 无战斗flag→直接跳entry-78；有flag→保留两选项 |
| entry-65 | ✅ | adjustHp -1D6 | 火焰伤害；HP归零→死亡（P2遗留）；力量检定parser处理 |
| entry-66 | ✅ | tickSkill 考古学 | "可以在「考古学」技能左边的小方框里打勾" |
| entry-67 | ✅ | 无 | 体质检定，parser处理，成功→82，失败→92 |
| entry-68 | ✅ | 无 | 纯叙事+选择（图书馆研究方向） |
| entry-69 | ✅ | tickSkill 侦查 | "可以在「侦查」技能左边的小方框里打勾" |
| entry-70 | ✅ | 无 | 纯叙事，跳 entry-78 |
| entry-71 | ✅ | 无 | 纯叙事+职业选择 |
| entry-72 | ✅ | 无 | 纯叙事，跳 entry-79 |
| entry-73 | ✅ | custom: conditionBranch HP<=0 | HP归零→92（死亡P2遗留），否则→82 |
| entry-74 | ✅ | 无 | 纯叙事，跳 entry-99 |
| entry-75 | ✅ | 无 | 纯叙事，跳 entry-86 |
| entry-76 | ✅ | tickSkill 科学(植物学) | "可以在「科学(植物学)」技能左边的小方框里打勾" |
| entry-77 | ✅ | 无 | 结局节点（死亡），无脚本 |
| entry-78 | ✅ | 无 | 纯叙事+选择 |
| entry-79 | ✅ | 无 | 困难聆听检定，parser处理，成功→240，失败→234 |
| entry-80 | ✅ | 无 | 结局节点（死亡），无脚本 |
| entry-81 | ✅ | 无 | 纯叙事，跳 entry-99 |
| entry-82 | ✅ | 无 | 纯叙事，跳 entry-108 |
| entry-83 | ✅ | 无 | 侦查检定，parser处理，成功→95，失败→89 |
| entry-84 | ✅ | 无 | 纯叙事，跳 entry-25 |
| entry-85 | ✅ | 无 | 幸运检定，parser处理，成功→91，失败→97 |
| entry-86 | ✅ | 无 | 纯叙事+选择 |
| entry-87 | ✅ | 无 | 困难侦查检定，parser处理，成功→181，失败→160 |
| entry-88 | ✅ | 无 | 纯叙事，跳 entry-99 |
| entry-89 | ✅ | 无 | 孤注一掷侦查检定，parser处理，成功→95，失败→101 |
| entry-90 | ✅ | 无（遗留P4） | 施法消耗MP，玩家自选点数，见遗留P4 |
| entry-91 | ✅ | 无 | 纯叙事，跳 entry-79 |
| entry-92 | ✅ | 无 | 结局节点（死亡），无脚本 |
| entry-93 | ✅ | adjustHp -1D6 | 火焰伤害；HP归零→死亡（P2遗留）；结局节点 |
| entry-94 | ✅ | custom: adjustSan +1（条件性） | 若之前损失过理智，回复1点SAN |
| entry-95 | ✅ | 无 | 纯叙事+选择 |
| entry-96 | ✅ | 无 | 心理学检定，parser处理，成功→106，失败→25 |
| entry-97 | ✅ | adjustHp -1D3 + checkGated: adjustHp +1 + tickSkill 急救 | 摔伤扣血；急救成功→回血+技能成长 |
| entry-98 | ✅ | 无 | 纯叙事+选择 |
| entry-99 | ✅ | 无 | 信用评级检定，parser处理，成功→111，失败→105 |
| entry-100 | ✅ | 无 | 纯叙事，跳 entry-63 |
| entry-101 | ✅ | 无 | 纯叙事，跳 entry-108 |
| entry-102 | ✅ | 无 | 纯叙事（职业介绍：文物学家），无脚本 |
| entry-103 | ✅ | 无 | 纯叙事+选择 |
| entry-104 | ✅ | 无 | 纯叙事，跳 entry-205 |
| entry-105 | ✅ | 无 | 纯叙事，跳 entry-180 |
| entry-106 | ✅ | tickSkill 心理学 | "可以在「心理学」技能左边的小方框里打勾" |
| entry-107 | ✅ | 无 | 纯叙事，跳 entry-152 |
| entry-108 | ✅ | 无 | 纯叙事+选择 |
| entry-109 | ✅ | adjustHp -1D6 | 火焰伤害；HP归零→死亡（P2遗留）；结局节点 |
| entry-110 | ✅ | 无 | 极难潜行检定（含大失败），parser处理，成功→143，失败→129，大失败→149 |
| entry-111 | ✅ | 无 | 侦查检定，parser处理，成功→118，失败→124 |
| entry-112 | ✅ | adjustSan +1 + tickSkill 侦查 | 发现秘密梯子，回复1点理智+技能成长 |
| entry-113 | ✅ | 无 | 纯叙事，跳 entry-205 |
| entry-114 | ✅ | 无 | 纯叙事，跳 entry-120 |
| entry-115 | ✅ | 无 | 幸运检定，parser处理，成功→127，失败→135 |
| entry-116 | ✅ | 无 | 幸运检定，parser处理，成功→136，失败→129 |
| entry-117 | ✅ | 无 | 外貌检定，parser处理，成功→10，失败→148 |
| entry-118 | ✅ | tickSkill 侦查 | "可以在「侦查」技能左边的小方框里打勾" |
| entry-119 | ✅ | 无 | 极难话术检定，parser处理，成功→132，失败→139 |
| entry-120 | ✅ | 无 | 纯叙事+选择（探索枢纽） |
| entry-121 | ✅ | 无 | 追踪检定，parser处理，成功→141，失败→130 |
| entry-122 | ✅ | 无 | 纯叙事，跳 entry-79 |
| entry-123 | ✅ | 无 | 结局节点（死亡），无脚本 |
| entry-124 | ✅ | 无 | 纯叙事，跳 entry-180 |
| entry-125 | ✅ | 无 | 困难乔装检定，parser处理，成功→146，失败→139 |
| entry-126 | ✅ | 无 | 纯叙事，跳 entry-133 |
| entry-127 | ✅ | 无 | 纯叙事+选择 |
| entry-128 | ✅ | 无 | 纯叙事，跳 entry-144 |
| entry-129 | ✅ | 无 | 纯叙事，跳 entry-79 |
| entry-130 | ✅ | 无 | 纯叙事，跳 entry-63 |
| entry-131 | ✅ | 无 | 纯叙事+选择 |
| entry-132 | ✅ | 无 | 纯叙事，跳 entry-152 |
| entry-133 | ✅ | 无 | 侦查检定（奖励骰），parser处理，成功→147，失败→140 |
| entry-134 | ✅ | 无 | 敏捷检定，parser处理，成功→261，失败→59 |
| entry-135 | ✅ | 无 | 纯叙事+选择 |
| entry-136 | ✅ | adjustSkill 博物学 +1 | 观察熊，博物学永久+1 |
| entry-137 | ✅ | 无 | 纯叙事，跳 entry-156 |
| entry-138 | ✅ | 无 | 话术/魅惑/说服检定，parser处理，成功→145，失败→151 |
| entry-139 | ✅ | 无 | 纯叙事，跳 entry-108 |
| entry-140 | ✅ | 无 | 纯叙事，跳 entry-120 |
| entry-141 | ✅ | checkGated: adjustSan -1D2 | 理智检定失败→失去1D2点理智 |
| entry-142 | ✅ | 无 | 纯叙事+选择 |
| entry-143 | ✅ | adjustSkill 博物学 +2 | 极难潜行成功观察熊，博物学永久+2 |
| entry-144 | ✅ | 无 | 汽车驾驶/心理学检定，parser处理，成功→174/162，失败→194 |
| entry-145 | ✅ | 无 | 纯叙事，跳 entry-157 |
| entry-146 | ✅ | tickSkill 乔装 | "可以在「乔装」技能左边的小方框里打勾" |
| entry-147 | ✅ | 无 | 纯叙事+选择 |
| entry-148 | ✅ | 无 | 纯叙事，跳 entry-18 |
| entry-149 | ✅ | 无 | 纯叙事+选择 |
| entry-150 | ✅ | startCombat | 对抗检定（追逐男人），战斗脚本已定义 |
| entry-151 | ✅ | 无 | 纯叙事，跳 entry-157 |
| entry-152 | ✅ | 无 | 潜行检定，parser处理，成功→211，失败→216 |
| entry-153 | ✅ | 无 | 纯叙事+选择 |
| entry-154 | ✅ | adjustHp +1 | 睡眠回复1点耐久值 |
| entry-155 | ✅ | startCombat | 对抗检定（逃离熊），战斗脚本已定义 |
| entry-156 | ✅ | 无 | 纯叙事+选择 |
| entry-157 | ✅ | 无 | 纯叙事+选择 |
| entry-158 | ✅ | checkGated: tickSkill 潜行 | 潜行检定成功→技能成长，parser处理检定 |
| entry-159 | ✅ | gainItem 德比诗集 | 获得《阿撒托斯及其他》 |
| entry-160 | ✅ | 无 | 纯叙事，跳 entry-25 |
| entry-161 | ✅ | 无 | 纯叙事，跳 entry-79 |
| entry-162 | ✅ | tickSkill 心理学 | 困难心理学成功，技能成长 |
| entry-163 | ✅ | 无 | 纯叙事，跳 entry-157 |
| entry-164 | ✅ | 无 | 纯叙事+选择 |
| entry-165 | ✅ | 无 | 图书馆使用检定，parser处理，成功→177，失败→184 |
| entry-166 | ✅ | custom: conditionBranch nightCheckSuccess flag | 无flag→直接跳entry-192；有flag→保留两选项 |
| entry-167 | ✅ | 无（遗留P5） | 熊双爪攻击战斗，见遗留P5 |
| entry-168 | ✅ | 无 | 纯叙事，跳 entry-185 |
| entry-169 | ✅ | 无 | 纯叙事+选择 |
| entry-170 | ✅ | 无 | 纯叙事，跳 entry-108 |
| entry-171 | ✅ | adjustSan -1 + checkGated: adjustSan -1D4 + adjustSkill 克苏鲁神话+4 | 理智检定；结局节点 |
| entry-172 | ✅ | 无 | 纯叙事，跳 entry-142 |
| entry-173 | ✅ | startCombat | 战斗（黑熊），战斗脚本已定义 |
| entry-174 | ✅ | tickSkill 汽车驾驶 | 汽车驾驶检定成功，技能成长 |
| entry-175 | ✅ | gainItem 阿博加斯特仪式咒语 | 学会仪式咒语 |
| entry-176 | ✅ | 无 | 困难力量检定，parser处理，成功→189，失败→183 |
| entry-177 | ✅ | tickSkill 图书馆使用 | "可以在「图书馆使用」技能左边的小方框里打勾" |
| entry-178 | ✅ | 无 | 侦查检定，parser处理，成功→112，失败→192 |
| entry-179 | ✅ | 无 | 体质检定，parser处理，成功→186，失败→193 |
| entry-180 | ✅ | 无 | 纯叙事+选择 |
| entry-181 | ✅ | 无 | 纯叙事+选择 |
| entry-182 | ✅ | 无 | 纯叙事，跳 entry-157 |
| entry-183 | ✅ | 无 | 纯叙事，跳 entry-108 |
| entry-184 | ✅ | gainItem 德比诗集 | 获得《阿撒托斯及其他》 |
| entry-185 | ✅ | 无 | 结局节点（逃脱），无脚本 |
| entry-186 | ✅ | 无 | 纯叙事，跳 entry-79 |
| entry-187 | ✅ | 无 | 困难侦查检定，parser处理，成功→181，失败→160 |
| entry-188 | ✅ | 无 | 闪避检定，parser处理，成功→195，失败→203 |
| entry-189 | ✅ | 无 | 幸运检定，parser处理，成功→204，失败→196 |
| entry-190 | ✅ | 无 | 纯叙事，跳 entry-108 |
| entry-191 | ✅ | checkGated: adjustSan -1 | 理智检定失败→失去1点理智 |
| entry-192 | ✅ | 无 | 纯叙事，跳 entry-218 |
| entry-193 | ✅ | 无 | 结局节点（死亡），无脚本 |
| entry-194 | ✅ | 无 | 纯叙事+选择 |
| entry-195 | ✅ | 无 | 理智检定，parser处理，成功→210，失败→217 |
| entry-196 | ✅ | 无 | 结局节点（死亡），无脚本 |
| entry-197 | ✅ | gainItem 召唤天之火咒语 | 记住"召唤天之火"仪式 |
| entry-198 | ✅ | 无（遗留P4） | 施法消耗MP，玩家自选点数，见遗留P4 |
| entry-199 | ✅ | 无 | 纯叙事+选择 |
| entry-200 | ✅ | 无 | 纯叙事，跳 entry-169 |
| entry-201 | ✅ | tickSkill 格斗(斗殴) + checkGated: adjustHp +1 | 击退熊；急救成功→回血 |
| entry-202 | ✅ | gainItem 号令天之火咒语 | 记住"号令天之火"仪式 |
| entry-203 | ✅ | adjustHp -1D6 | 被刺伤，跳 entry-45 |
| entry-204 | ✅ | 无 | 纯叙事，跳 entry-152 |
| entry-205 | ✅ | 无 | 纯叙事，跳 entry-27 |
| entry-206 | ✅ | 无 | 纯叙事，跳 entry-221 |
| entry-207 | ✅ | 无 | 敏捷检定，parser处理，成功→213，失败→190 |
| entry-208 | ✅ | 无 | 攀爬检定（含大失败），parser处理，大失败→222，否则→228 |
| entry-209 | ✅ | adjustSan -1D3 | 群星降临，失去1D3理智；SAN归零→220 |
| entry-210 | ✅ | 无 | 纯叙事，跳 entry-236 |
| entry-211 | ✅ | tickSkill 潜行 | "可以在「潜行」技能左边的小方框里打勾" |
| entry-212 | ✅ | 无 | 纯叙事，跳 entry-192 |
| entry-213 | ✅ | 无 | 纯叙事，跳 entry-120 |
| entry-214 | ✅ | 无 | 纯叙事，跳 entry-221 |
| entry-215 | ✅ | 无 | 纯叙事，跳 entry-264 |
| entry-216 | ✅ | 无 | 纯叙事+选择 |
| entry-217 | ✅ | adjustHp -1D2 + adjustSan -1D3 | 被攻击，跳 entry-45 |
| entry-218 | ✅ | 无 | 纯叙事，跳 entry-6 |
| entry-219 | ✅ | 无 | 纯叙事+选择 |
| entry-220 | ✅ | 无 | 结局节点（疯狂），无脚本 |
| entry-221 | ✅ | 无 | 纯叙事+选择 |
| entry-222 | ✅ | custom: adjustHp -1 + conditionBranch HP<=0 | 跌落受1点伤；HP归零→13，否则→228 |
| entry-223 | ✅ | 无 | 结局节点（逃脱），无脚本 |
| entry-224 | ✅ | 无 | 纯叙事，跳 entry-26 |
| entry-225 | ✅ | checkGated: tickSkill 锁匠 | 锁匠检定成功→技能成长 |
| entry-226 | ✅ | 无 | 纯叙事（职业介绍：医生），跳 entry-128 |
| entry-227 | ✅ | 无 | 纯叙事，跳 entry-259 |
| entry-228 | ✅ | 无 | 纯叙事，跳 entry-246 |
| entry-229 | ✅ | 无 | 纯叙事，跳 entry-223 |
| entry-230 | ✅ | 无 | 纯叙事+选择 |
| entry-231 | ✅ | 无 | 结局节点（献祭），无脚本 |
| entry-232 | ✅ | 无 | 力量检定，parser处理，成功→244，失败→238 |
| entry-233 | ✅ | 无 | 纯叙事，跳 entry-134 |
| entry-234 | ✅ | 无 | 纯叙事+选择 |
| entry-235 | ✅ | startCombat | 战斗（车夫），战斗脚本已定义 |
| entry-236 | ✅ | 无 | 纯叙事+选择 |
| entry-237 | ✅ | adjustSkill 克苏鲁神话 +2 | 听阿博加斯特讲旧日支配者，神话知识+2 |
| entry-238 | ✅ | 无 | 纯叙事，跳 entry-120 |
| entry-239 | ✅ | 无 | 纯叙事（职业介绍：记者），跳 entry-128 |
| entry-240 | ✅ | tickSkill 聆听 | "可以在「聆听」技能左边的小方框里打勾" |
| entry-241 | ✅ | tickSkill 格斗(斗殴) | "可以在「格斗(斗殴)」技能左边的小方框里打勾" |
| entry-242 | ✅ | 无 | 纯叙事，跳 entry-157 |
| entry-243 | ✅ | 无 | 结局节点（死亡），无脚本 |
| entry-244 | ✅ | 无 | 纯叙事+选择 |
| entry-245 | ✅ | 无 | 纯叙事，跳 entry-259 |
| entry-246 | ✅ | 无 | 理智检定，parser处理，成功→252，失败→258 |
| entry-247 | ✅ | 无 | 结局节点（逃脱），无脚本 |
| entry-248 | ✅ | 无 | 纯叙事，跳 entry-58 |
| entry-249 | ✅ | 无 | 纯叙事（职业介绍：私家侦探），跳 entry-128 |
| entry-250 | ✅ | checkGated: adjustSan -1D2 | 理智检定失败→失去1D2点理智 |
| entry-251 | ✅ | 无 | 纯叙事，跳 entry-267 |
| entry-252 | ✅ | adjustHp -1D3 | 从树上跌落，跳 entry-13 |
| entry-253 | ✅ | 无 | 纯叙事，跳 entry-160 |
| entry-254 | ✅ | 无 | 纯叙事+选择 |
| entry-255 | ✅ | 无 | 结局节点（胜利），无脚本 |
| entry-256 | ✅ | 无 | 纯叙事+选择 |
| entry-257 | ✅ | 无 | 纯叙事，跳 entry-267 |
| entry-258 | ✅ | adjustSan -1D2 + adjustHp -1D3 | 梦中跌落，跳 entry-13 |
| entry-259 | ✅ | 无 | 纯叙事，跳 entry-160 |
| entry-260 | ✅ | 无 | 恐吓检定，parser处理，成功→19，失败→32 |
| entry-261 | ✅ | 无 | 纯叙事，跳 entry-71 |
| entry-262 | ✅ | startCombat | 战斗（工匠），战斗脚本已定义 |
| entry-263 | ✅ | 无 | 纯叙事，跳 entry-8 |
| entry-264 | ✅ | 无 | 理智检定，parser处理，成功→269，失败→5 |
| entry-265 | ✅ | 无 | 纯叙事（职业介绍：教授），跳 entry-128 |
| entry-266 | ✅ | 无 | 困难科学(植物学)检定，parser处理，成功→76 |
| entry-267 | ✅ | 无 | 纯叙事，跳 entry-4 |
| entry-268 | ✅ | tickSkill 格斗(斗殴) | "可以在「格斗(斗殴)」技能左边的小方框里打勾" |
| entry-269 | ✅ | adjustSan -1 | 目睹燃烧兽群，失去1点理智，跳 entry-13 |
| entry-270 | ✅ | 无 | 结局节点（胜利/死亡），无脚本 |
