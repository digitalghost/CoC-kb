# CLAUDE.md - CoC-kb 项目总览

> 本文件是 AI 助手理解本项目的入口指引。
> 最后更新: 2026-05-16

---

## 项目简介

**CoC-kb** 是一个围绕《克苏鲁的呼唤（Call of Cthulhu）第七版》TRPG 的综合项目，包含四大部分：

1. **知识库** — 从官方规则书系统提取的 CoC 7e 规则 wiki（298+ 页面）
2. **角色卡创建器** — 8 步引导式调查员角色创建工具
3. **角色卡追踪器** — 模拟纸质角色卡的调查员数据追踪工具
4. **向火独行** — 单人模组《向火独行》电子陪跑原型

---

## 目录结构

```
CoC-kb/
├── CLAUDE.md                          ← 本文件（项目总览）
├── README.md                          ← 项目介绍（面向人类读者）
├── knowledge-base/                    ← CoC 7e 规则知识库
│   ├── CLAUDE.md                      ← 知识库维护规范（必读）
│   ├── wiki/
│   │   ├── index.md                   ← 内容索引（查找页面的入口）
│   │   ├── log.md                     ← 操作日志（仅追加）
│   │   ├── concepts/                  ← 概念页面（69个：规则、机制、系统）
│   │   ├── entities/                  ← 实体页面（223个：生物、神祇、模组）
│   │   ├── synthesis/                 ← 合成分析（维护追踪、补全计划等）
│   │   ├── images/                    ← 实体配图（~190张，AI 生成）
│   │   └── sources/                   ← 来源摘要（6个规则书）
│   └── raw/                           ← 原始 PDF（只读，不可修改）
├── apps/
│   ├── coc_character_sheet/           ← 角色卡创建器（多文件 SPA）
│   ├── character-tracker/             ← 角色卡追踪器（多文件架构）
│   └── alone-against-the-flames-app/  ← 向火独行电子陪跑（原型阶段）
├── docs/                              ← 设计文档
└── .obsidian/                         ← Obsidian 配置
```

---

## 模块详解

### 1. knowledge-base/ — 规则知识库

- **主题**: 克苏鲁的呼唤第七版 TRPG 规则体系
- **规模**: 69 个概念页面 + 223 个实体页面 + 6 个来源摘要
- **来源书籍**: 40周年纪念版(470页)、调查员手册(162页)、怪物之锤两卷(468页)、入门套件第一卷与第三卷
- **维护规范**: 详见 `knowledge-base/CLAUDE.md`
- **架构模式**: 基于 Karpathy 的 LLM Wiki 模式，分为三层：
  1. `raw/` — 原始 PDF 规则书（只读，不可修改，不纳入版本控制）
  2. `wiki/` — 知识整理层（LLM 维护，Markdown 页面 + 交叉引用）
  3. `CLAUDE.md` — LLM 维护规范（Schema 配置 + 操作流程）
- **关键约定**:
  - 所有规则数据必须忠实于原始规则书，不可编造
  - `raw/` 目录只读，所有知识整理通过 wiki 层进行
  - 使用 `[[页面路径]]` 格式维护交叉引用
  - 操作日志 `log.md` 仅追加

### 2. apps/coc_character_sheet/ — 角色卡创建器

- **定位**: 8 步引导式调查员角色创建工具
- **技术栈**: 纯 HTML/CSS/JS，无框架，localStorage 持久化
- **支持时代**: 1920年代 / 现代
- **8 步流程**:
  1. 基本信息（姓名/性别/年龄/时代/头像）
  2. 属性生成（3D 骰子掷 8 项核心属性 + 幸运）
  3. 年龄调整（自动计算 EDU 成长/属性减值）
  4. 职业选择（数十种预定义职业 + 自定义职业）
  5. 技能分配（职业技能点 + 兴趣技能点）
  6. 背景故事（随机灵感表生成 + 手动编辑）
  7. 装备决定（按信用评级搜索物品/武器数据库）
  8. 完成导出（可编辑角色卡 + `.coc7` 文件导出）
- **文件结构**:
  ```
  js/
    data/          ← 游戏数据（skills/occupations/equipment/weapons/tables）
    render/        ← 渲染层（router + steps-1to4 + steps-5to8 + progress）
    state.js       ← 全局状态 + localStorage
    dice-physics.js ← 自研 3D 骰子物理引擎
    utils.js       ← 工具函数（骰子/属性计算/技能基础值）
    navigation.js  ← 导航逻辑 + 导出
    init.js        ← 启动入口
  css/             ← 样式（base.css + components.css）
  assets/avatars/  ← 20 张职业主题头像
  ```

### 3. apps/character-tracker/ — 角色卡追踪器

- **定位**: 模拟纸质角色卡正反面的调查员数据展示与追踪工具
- **技术栈**: 多文件 HTML/CSS/JS（无框架），dice-box 3D 骰子库（ES Module）
- **架构**: 模块化多文件架构，按功能拆分为 render/（渲染层）、data/（数据层）、dice-module.js（骰子模块）等
- **核心功能**:
  - 调查员基本信息 + 头像
  - 8 项属性（含半值/五分之一值）+ 骰子检定按钮
  - 资源追踪条（HP/Luck/MP/SAN + 状态勾选）
  - 50+ 技能表（三栏布局，含判定值 + 骰子按钮）
  - 武器表格 + 战斗摘要（DB/体格/闪避）
  - 背景故事（9 个字段）
  - 随身物品 + 资产面板
  - 快速参考规则（检定表 + 治疗规则）
  - 调查员同伴环形图（8 节点）
  - 3D 骰子检定系统（D4/D6/D8/D10/D12/D20/D100，支持骰子表达式）
- **数据存储**: localStorage 持久化，支持 .coc7 文件导入
- **测试**: 已移除（原有 Playwright E2E 测试和 Python 备选测试脚本已删除）
- **第三方依赖**: 集成 [dice-box](https://github.com/3dice/Dice-Box) 3D 骰子库（含 WebAssembly），支持 D4/D6/D8/D10/D12/D20/D100 骰子，附带 10 种视觉主题（含 CoC 专属主题 `coc/`）
- **文件结构**:
  ```
  index.html              ← HTML 结构 + 外部文件引用（~253 行）
  css/
    tracker.css           ← 全部样式（~2141 行）
  js/
    data/
      skills.js           ← 技能基础值数据 + 常量（SKILLS_DATA, SPECIALTY_MAP, ATTR_KEYS 等）
      default-character.js ← 默认示例角色数据（DEFAULT_DATA）
    utils.js              ← 工具函数（getSkillBase, calcSkillTotal, half, fifth）
    import.js             ← .coc7 导入/清除功能（decompressState, importCharacter）
    render/
      info.js             ← renderBasicInfo（基本信息 + 头像）
      attributes.js       ← renderAttributes（属性网格 + MOV）
      trackers.js         ← renderTrackers（HP/Luck/MP/SAN 资源条）
      skills.js           ← renderSkills（技能列表）
      weapons.js          ← renderWeapons（武器表格 + 战斗面板）
      backstory.js        ← renderBackstory（背景故事网格）
      equipment.js        ← renderEquipment（随身物品 + 资产）
      companions.js       ← renderCompanions（调查员同伴环形图）
    app.js                ← 主入口 IIFE（init + renderCharacter + bindDiceButtons）
    dice-module.js        ← 3D 骰子模块（ES Module）
  assets/                 ← 背景图 + 4 个角落装饰 SVG
  dice-box/               ← 3D 骰子引擎库 + 10 种主题资源
  ```

### 4. apps/alone-against-the-flames-app/ — 向火独行电子陪跑

- **定位**: 单人模组《向火独行（Alone Against the Flames）》的电子陪跑工具
- **技术栈**: 多文件 HTML/CSS/JS（ES Module），复用 character-tracker 的 DiceBox 3D 骰子库
- **当前状态**: 核心引擎完成，可完整游玩 270 条目模组；节点图导航已实装
- **架构**: engine/adapters/data/ui 四层代码边界
- **核心功能**（已实现）:
  - 三栏体验布局（左侧快速入口+进度、中央剧情主舞台、右侧角色状态+线索）
  - 模组引擎（module-engine.js）驱动节点式剧情流转
  - .coc7 角色卡导入（复用 character-adapter.js）
  - DiceBox 3D 骰子面板（dice-adapter.js），支持百分骰/奖励骰/惩罚骰
  - 技能/属性/派生值检定系统（自动识别检定难度和模式）
  - 检定结果驱动路径分支（成功/失败/大失败门控）
  - 对抗检定 & 多回合战斗系统（6 个战斗场景，弹出层 UI）
  - 效果系统：HP/SAN/MP/Luck 调整、技能成长、物品获得/失去、战斗触发
  - 检定门控效果：属性损失仅在检定失败后触发
  - 伤害阈值自动分支（伤害 vs maxHP/2 决定路径）
  - 效果通知 UI（effect pills）
  - 结局复盘页面（18 个结局，含路径/状态/里程碑/技能成长）
  - localStorage 游戏进度持久化
  - 路径时间线、线索线程、剧情记录面板
  - **节点图导航**（graph-map.js）：Canvas 力导向图，可视化 270 条目的跳转关系，支持平移/缩放/悬停预览，已访问节点高亮
- **待实现**:
  - 孤注一掷（Pushed Roll）
  - 幸运消耗（Spending Luck）
  - 重伤/昏迷状态
  - 叙事 flag 触发
- **文件结构**:
  ```
  index.html              ← HTML 结构
  css/
    app.css               ← 主样式
    combat.css            ← 战斗弹出层样式
  js/
    app.js                ← 主入口（ES Module），状态管理，战斗集成，图谱切换
    engine/
      module-engine.js    ← 模组引擎（节点流转、效果执行、阈值门控）
      opposed-roll.js     ← CoC 7e 对抗检定纯函数（成功等级比较）
      combat-engine.js    ← 战斗状态机（回合驱动、骰子请求、伤害应用）
    adapters/
      character-adapter.js ← 角色卡适配器（.coc7 导入）
      dice-adapter.js     ← 骰子适配器（DiceBox 接口，百分骰/奖惩骰）
    data/
      module.js           ← 数据适配层（parsed JSON → 引擎节点，ENTRY_SCRIPTS，THRESHOLD_GATES）
      parsed-entries.json ← 解析后的 270 条目原始数据
      combat-scripts.js   ← 6 个战斗场景的声明式配置
      skills-data.js      ← 技能数据
      graph-data.json     ← 节点图数据（270 节点 + 422 跳转边）
    ui/
      render.js           ← UI 渲染函数
      character-panel.js  ← 角色面板渲染
      combat-overlay.js   ← 战斗弹出层 UI
      graph-map.js        ← Canvas 力导向节点图（平移/缩放/悬停/已访问高亮）
  assets/figures/         ← 模组插图（283 张，条目全覆盖）
  assets/figures-v4/      ← 模组插图备用版本（272 张）
  scripts/
    parse-fulltext.mjs    ← 全文解析脚本（生成 parsed-entries.json）
  ```

### 5. 视觉设计体系

三个 app 共享一致的暗色金色视觉主题，修改 UI 时应保持风格统一：

- **主色调**: 深蓝黑底色（`#0A0E14`）+ 金色强调（`#C9A84C`）
- **辅助色**: 绿色（`#3D8B6E`，正面状态）、红色（`#A63D40`，负面/危险状态）
- **主题管理**: 通过 CSS 自定义属性（CSS Variables）统一管理，修改颜色时只改变量值
- **字体**: UI 使用系统字体栈，标题使用衬线字体（Georgia / Noto Serif SC）
- **语言**: HTML 标签设置 `lang="zh-CN"`，界面文案为中文

---

## 跨模块关系

```
knowledge-base/wiki/concepts/  ──规则来源──→  apps/coc_character_sheet/js/data/
knowledge-base/wiki/entities/  ──实体数据──→  apps/character-tracker/（预设角色数据）
knowledge-base/wiki/entities/  ──模组正文──→  apps/alone-against-the-flames-app/js/data/
apps/coc_character_sheet/      ──.coc7导出──→  apps/character-tracker/（导入角色）
apps/coc_character_sheet/      ──.coc7导出──→  apps/alone-against-the-flames-app/（导入角色）
apps/character-tracker/        ──DiceBox库──→  apps/alone-against-the-flames-app/（共享 3D 骰子引擎）
```

- 角色卡创建器的游戏数据（技能、职业、装备、武器、表格）来源于知识库中的规则提取
- 角色卡追踪器的技能列表、武器数据、规则参考与知识库保持一致
- 向火独行 app 通过 .coc7 文件导入角色，直接引用 character-tracker 的 DiceBox 库
- 修改知识库中的规则时，应同步检查三个 app 的数据是否需要更新

---

## 工作约定

### 上下文加载策略

当开始一个新对话时，按以下顺序建立上下文：

1. **先读本文件**（CLAUDE.md）了解项目全貌
2. **根据任务需要**，阅读对应模块的详细文档：
   - 知识库相关 → 读 `knowledge-base/CLAUDE.md` + `knowledge-base/wiki/index.md`
   - 角色创建器 → 读 `apps/coc_character_sheet/js/data/` 下的数据文件
   - 角色追踪器 → 读 `apps/character-tracker/index.html` 的结构注释
3. **需要具体规则细节时**，再到 `knowledge-base/wiki/concepts/` 或 `entities/` 中查找对应页面

### 代码风格

- 三个 app 均为纯前端项目，无构建工具、无框架、无包管理器
- JavaScript 使用全局函数式架构（非模块化），通过 `<script>` 标签按依赖顺序加载；向火独行 app 使用 ES Module
- CSS 使用自定义属性（CSS Variables）管理主题色
- 中文注释，英文变量名
- **第三方依赖**: character-tracker 和 alone-against-the-flames-app 使用了外部库 [dice-box](https://github.com/3dice/Dice-Box)（3D 骰子引擎），角色卡创建器的骰子系统为自研实现（CSS 3D Transform）
- **测试**: 暂无（character-tracker 原有的 Playwright E2E 测试已移除）

### 工具链与环境

- **编辑工具**: 知识库使用 [Obsidian](https://obsidian.md/) 编辑和浏览，支持双向链接和图谱视图，附带 HTML 导出插件
- **运行方式**: 纯静态文件，可直接用浏览器打开 HTML 运行，或通过任意静态文件服务器提供服务
- **版本控制**: Git，`.gitignore` 排除原始 PDF（`knowledge-base/raw/*.pdf`）、系统文件、Obsidian 工作区状态
- **无构建系统**: 不需要 `npm install`、`build` 等步骤，不要生成 `package.json`、`webpack.config.js` 等配置文件

### 数据一致性

- 游戏规则数据以 `knowledge-base/wiki/` 为权威来源
- app 中的数据文件是规则数据的工程化呈现，修改时应与 wiki 保持一致
- 添加新实体/概念时，同步更新 wiki 页面和 app 数据文件

---

## 本文件维护规则

> **重要**: 当本次会话对项目结构、模块功能、工作约定做了变更时，应主动更新本文件。

更新检查清单：
- [ ] 新增/删除/重命名了顶层目录或模块
- [ ] 模块的核心功能发生了变化
- [ ] 跨模块关系发生了变化
- [ ] 工作约定需要调整
- [ ] 添加了新的子模块或工具

不需要更新的情况：
- wiki 页面内容的日常增删（由 `knowledge-base/CLAUDE.md` 管理）
- app 内部的 bug 修复或样式调整
- 纯数据内容的更新（如新增一个实体页面）
