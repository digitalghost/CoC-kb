# 操作日志

> 本日志记录知识库的所有操作历史，仅追加不修改

---

## [2026-04-13] init | 知识库初始化

**操作类型**: 初始化
**描述**: 创建知识库目录结构和核心文件
**创建的文件**:
- wiki/index.md
- wiki/log.md
- CLAUDE.md (schema配置)
- concepts/llm-wiki.md

**备注**: 基于 Karpathy 的 LLM Wiki 模式构建

---

## [2026-04-13] ingest | 克苏鲁的呼唤40周年纪念版规则书

**操作类型**: 摄入（框架搭建阶段）
**描述**: 从COC 40周年纪念版规则书PDF（470页）提取目录结构，搭建知识库框架
**创建的文件**:
- sources/coc-40th-anniversary.md（来源摘要）
- concepts/ 下 40 个概念页面骨架（游戏基础、调查员、战斗、理智、魔法、守秘人、装备）
- entities/ 下 20 个实体页面骨架（人物、神话典籍、外神、旧日支配者、神话种族、神话怪物、模组）
**更新的文件**:
- wiki/index.md（更新为COC知识库索引）
- CLAUDE.md（更新为COC主题配置）

**备注**: 当前所有页面均为骨架状态（🚧），待用户确认框架后开始填充内容

---

## [2026-04-13] ingest | 全部内容填充完成

**操作类型**: 批量内容填充
**描述**: 从COC 40周年纪念版规则书PDF（470页）逐章提取内容，填充全部61个wiki页面
**填充的页面**:
- concepts/ 下 40 个概念页面（全部 ✅ 已填充）
- entities/ 下 20 个实体页面（全部 ✅ 已填充）
- sources/ 下 1 个来源摘要（✅ 已填充）
**章节覆盖**:
- Ch1 介绍 → coc-overview
- Ch2 洛夫克拉夫特与克苏鲁神话 → lovecraft-and-mythos, cthulhu-mythos, lovecraft
- Ch3 创建调查员 → investigator-creation, attribute-system, derived-attributes, half-and-fifth-values, occupation-system, harvey-walters
- Ch4 技能 → skill-system, experience-reward
- Ch5 游戏系统 → skill-check, bonus-penalty-dice, opposed-rolls
- Ch6 战斗 → combat-system, combat-round, melee-combat, combat-maneuvers, ranged-combat, damage-and-healing, armor, poison
- Ch7 追逐 → chase-rules
- Ch8 理智 → sanity-system, sanity-check, insanity, phobia, mania, sanity-recovery
- Ch9 魔法 → spells-and-magic, necronomicon, abdul-alhazred
- Ch10 进行游戏 → keeper-guide, npc, idea-check, spot-hidden-check, module-creation
- Ch11 可怖传说书籍 → mythos-tomes, deep-magic
- Ch12 神话法术 → spell-list
- Ch13 神话造物和异星科技 → mythos-artifacts
- Ch14 怪物、野兽和异星诸神 → azathoth, nyarlathotep, yog-sothoth, cthulhu, hastur, dagon, hydra, deep-ones, mi-go, shoggoth, elder-things, byakhee, colour-out-of-space
- Ch15 模组 → module-dark-woods, module-crimson-letters, module-haunted
- Ch16 附录 → equipment, weapons

**备注**: 全部61个页面已填充完成，index.md状态已更新为 ✅

---

## [2026-04-13] ingest | 遗漏内容补充

**操作类型**: 补充遗漏内容
**描述**: 系统审查PDF原文，补充遗漏的附录内容和神话生物
**新建的概念页面**:
- concepts/terminology.md（术语表）
- concepts/version-conversion.md（转换到第七版规则）
- concepts/translation-glossary.md（中英译名对照表）
- concepts/lovecraft-vocabulary.md（洛氏描写词汇表）
**新建的实体页面**:
- 神话生物13个：ghoul, dark-young, serpent-people, flying-polyp, chthonian, formless-spawn, hounds-of-tindalos, star-vampire, rat-thing, shub-niggurath, cthugha, ithaqua, deep-one-hybrid
- 传统恐怖怪物7个：zoth-ommog, ghost, mummy, skeleton, vampire, werewolf, zombie
**补充的现有页面**:
- sanity-system.md（追加复合理智检定可选规则）
- damage-and-healing.md（追加毒剂注释）
- chase-rules.md（追加载具属性注释）

**备注**: 知识库从61页扩展到85页，覆盖了PDF中几乎所有核心内容

---

## [2026-04-13] ingest | 第十四章剩余生物补充

**操作类型**: 补充遗漏实体
**描述**: 将第十四章"怪物、野兽和异星诸神"中所有剩余的35个神话生物创建为独立实体页面
**新建的实体页面**:
- 旧神: nodens
- 外神: daoloth, tulzscha
- 旧日支配者: abhoth, atlach-nacha, chaugnar-faugn, cyaegha, eihort, ghatanothoa, ghlaaki, ig, nyogtha, rhan-tegoth, shudde-mell, tsathoggua, ubbo-sathla, ygolonac, yibb-tstll
- 神话种族: yithian, loigar, yugg
- 神话怪物: bloodworm, cthughan, dimensional-shambler, fire-vampire, ghast, ghoul-servant-of-ghlaaki, hunting-horror, nightgaunt, nofer-kee, sand-dweller, shantak-bird, shoggoth-lord, star-spawn-of-cthulhu

**备注**: 知识库从85页扩展到120页，第十四章所有独立条目已全部覆盖

---

## [2026-04-14] ingest | 克苏鲁的呼唤第七版调查员手册

**操作类型**: 新来源摄入
**描述**: 从《克苏鲁的呼唤第七版调查员手册》（162页）提取内容并整合到知识库
**新建的概念页面**:
- concepts/dunwich-horror.md（敦威治恐怖事件 - 洛夫克拉夫特原著译文）
- concepts/investigator-organizations.md（调查员组织 - 8个范例组织）
- concepts/investigator-career.md（调查员生涯 - 调查流程与团队角色）
- concepts/roaring-twenties.md（咆哮的二十年代 - 历史背景与年表）
- concepts/player-advice.md（给玩家的建议）
**新建的来源页面**:
- sources/coc-investigator-handbook.md
**补充的现有页面**:
- occupation-system.md（追加约50个调查员手册独有职业）
- skill-system.md（追加24个技能的1920年代时代背景补充说明）

**备注**: 知识库从122页扩展到129页

---

## [2026-04-14] ingest | 调查员手册遗漏内容补充

**操作类型**: 补充遗漏内容
**描述**: 系统审查调查员手册PDF原文，补充首次摄入时遗漏的内容
**新建的概念页面**:
- concepts/travel-and-transport.md（旅行与交通参考 - 单位换算、各时代交通工具速度与航程、15城市国际航班飞行里程矩阵）
**补充的现有页面**:
- investigator-creation.md（追加"有故事的调查员"可选规则，含5个经历包：战场、警务、罪犯、医务、神话）
- roaring-twenties.md（追加"百年惊梦年表"1890-2012完整时间线）

**备注**: 知识库从129页扩展到128页（实际为128个内容页面，含index.md和log.md共130个文件）

---

## [2026-04-14] lint | 全面内容完整性审计与补充

**操作类型**: 质量审计 + 内容补充
**描述**: 系统对比两本PDF（规则书470页+调查员手册162页）的全部章节目录与知识库内容，确认所有有价值内容已摄入
**审计结果**:
- 规则书16章+3附录：全部覆盖 ✅
- 调查员手册10章+附录：全部覆盖 ✅
- 实体页面75个：全部覆盖 ✅
**修复的文字交错问题**（调查员手册PDF双栏排版导致）:
- dunwich-horror.md（重写为故事概要版+校对原文）
- investigator-organizations.md（重新整理+校对原文）
- investigator-career.md（重新整理+校对原文）
- player-advice.md（重新整理+校对原文）
- roaring-twenties.md（重新整理+校对原文）
**补充的遗漏内容**:
- keeper-guide.md（追加"使用规则"和"展现神话的恐怖"两个子章节的详细内容）
- spell-list.md（追加"法术变体"专节，含僵尸创造术4个变体版本示例）

---

## [2026-04-14] lint | 知识库健康检查与修复

**操作类型**: 健康检查 + 修复
**描述**: 执行全面 Lint 检查并修复所有发现的问题
**检查项目**:
- 孤立页面检查、断裂链接检查、单向链接检查
- 页面格式规范检查、数据矛盾检查、过时内容检查

**修复的问题**:
- 🔴 zoth-ommog.md 类型标注从"传统恐怖怪物"修正为"旧日支配者"
- 🔴 star-spawn-of-cthulhu.md 关联实体链接从 deep-one-hybrid.md 修正为 deep-ones.md
- 🟡 zoth-ommog.md 补充关联实体（克苏鲁、深潜者）
- 🟡 20组单向链接补充为双向链接（涉及14个文件）
- 🟡 45个孤立页面全部消除（在 cthulhu-mythos.md、combat-system.md、coc-overview.md、roaring-twenties.md、module-creation.md 中添加引用）
- 🟢 dunwich-horror.md 补充来源数字段、核心要点、相关概念、相关来源章节
- 🟢 investigator-organizations.md 补充来源数字段、核心要点、相关概念、相关来源章节
- 🟢 coc-40th-anniversary.md 补充涉及实体、涉及概念章节
- 🟢 coc-investigator-handbook.md 补充涉及实体、涉及概念章节
- 🟢 创建 synthesis/ 目录

**检查结果**:
- 断裂链接: 0（修复前即为0）
- 孤立页面: 0（修复前45个）
- 数据矛盾: 0（修复前2处，已修复）
- 格式问题: 0（修复前4个页面，已修复）
- 过时内容: 0

**影响的文件**: 约30个wiki页面
**详细报告**: wiki/lint-report-2026-04-14.md

---

## [2026-04-14] ingest | 怪物之锤 第一卷：神话怪物

**操作类型**: 新来源摄入
**描述**: 从《怪物之锤》第一卷（210页）提取内容并整合到知识库
**新建的概念页面**:
- concepts/monster-creation.md（怪物创造与使用）
**新建的实体页面**:
- 神话怪物70个：阿布霍斯的眷族、不可名状誓言的信徒、化尘者等
- 民俗怪物5个：黑狗、鬼火、魔像、泽西恶魔、食人植物
- 野兽26个：短吻鳄、熊、大象、鲨鱼等
**合并补充的现有页面**:
- 28个神话怪物实体页面（拜亚基、深潜者、修格斯等）
- 6个民俗怪物实体页面（幽灵、吸血鬼、狼人等）
**新建的来源页面**:
- sources/malleus-monstrorum-vol1.md

**备注**: 知识库从约130页扩展到约200页

---

## [2026-04-14] ingest | 怪物之锤 第二卷：神话神祇

**操作类型**: 新来源摄入
**描述**: 从《怪物之锤》第二卷（258页）提取内容并整合到知识库
**新建的概念页面**:
- concepts/mythos-deity-guide.md（神话神祇指南）
**新建的实体页面**:
- 外神3个：格罗斯、克赛克修克鲁斯、特鲁南伯拉
- 旧日支配者26个：亚弗姆-扎、阿尔瓦萨、鲍特·祖卡-莫格等
- 旧神3个：低等旧神、修普诺斯、沃尔瓦多斯
**合并补充的现有页面**:
- 25个神祇实体页面（阿撒托斯、克苏鲁、奈亚拉托提普等）
**新建的来源页面**:
- sources/malleus-monstrorum-vol2.md

**备注**: 知识库扩展到约264页
