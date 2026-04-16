# CoC-kb

> 克苏鲁的呼唤（Call of Cthulhu）第七版 TRPG 知识库

基于 Karpathy 的 [LLM Wiki](knowledge-base/wiki/concepts/llm-wiki.md) 模式构建，从官方规则书中系统提取的 COC 第七版规则知识库，涵盖游戏机制、神话生物、法术魔法等完整内容。

## 神话生物图鉴

> 以下配图均由 **[TRAE](https://trae.ai/)** AI 生成，仅供知识库展示使用，不属于原书内容。

<p align="center">
  <table>
    <tr>
      <td align="center" width="50%">
        <img src="knowledge-base/wiki/images/cthulhu.jpg" alt="克苏鲁" width="400"/><br/>
        <b>克苏鲁 (Cthulhu)</b><br/>旧日支配者 · 沉睡于拉莱耶
      </td>
      <td align="center" width="50%">
        <img src="knowledge-base/wiki/images/azathoth.jpg" alt="阿撒托斯" width="400"/><br/>
        <b>阿撒托斯 (Azathoth)</b><br/>外神 · 盲目痴愚之神
      </td>
    </tr>
    <tr>
      <td align="center" width="50%">
        <img src="knowledge-base/wiki/images/nyarlathotep.jpg" alt="奈亚拉托提普" width="400"/><br/>
        <b>奈亚拉托提普 (Nyarlathotep)</b><br/>外神 · 伏行之混沌
      </td>
      <td align="center" width="50%">
        <img src="knowledge-base/wiki/images/yog-sothoth.jpg" alt="犹格·索托斯" width="400"/><br/>
        <b>犹格·索托斯 (Yog-Sothoth)</b><br/>外神 · 万物归一者
      </td>
    </tr>
    <tr>
      <td align="center" width="50%">
        <img src="knowledge-base/wiki/images/hastur.jpg" alt="哈斯塔" width="400"/><br/>
        <b>哈斯塔 (Hastur)</b><br/>旧日支配者 · 黄衣之王
      </td>
      <td align="center" width="50%">
        <img src="knowledge-base/wiki/images/shoggoth.jpg" alt="修格斯" width="400"/><br/>
        <b>修格斯 (Shoggoth)</b><br/>神话怪物 · Tekeli-li!
      </td>
    </tr>
  </table>
</p>

## 来源

| 书籍 | 页数 | 类型 |
|------|------|------|
| 克苏鲁的呼唤 40周年纪念版 | 470页 | 核心规则书 |
| 克苏鲁的呼唤第七版调查员手册 | 162页 | 规则补充 |
| 怪物之锤 第一卷：神话怪物 | 210页 | 规则扩展 |
| 怪物之锤 第二卷：神话神祇 | 258页 | 规则扩展 |

## 内容概览

共计 **260 页面**，包含 53 个概念页面、203 个实体页面、4 个来源摘要。

### 概念页面 `wiki/concepts/`

游戏规则与机制的系统化整理：

- **游戏基础** — 游戏概述、洛夫克拉夫特与克苏鲁神话背景
- **调查员** — 创建流程、属性系统、衍生属性、职业系统、技能系统、经验成长
- **游戏机制** — 技能检定、奖励/惩罚骰、对抗检定
- **战斗** — 战斗系统、战斗轮、格斗、射击、伤害治疗、护甲、毒剂
- **理智** — 理智系统、理智检定、疯狂、恐惧症、躁狂症、恢复
- **魔法** — 魔法系统、神话典籍、法术列表、深层魔法、神话造物、神祇指南
- **守秘人** — 守秘人指南、NPC、灵感检定、察觉检定、模组创作、怪物创造
- **调查员手册** — 咆哮的二十年代、调查员组织、调查员生涯、旅行交通参考
- **装备** — 装备列表、武器列表
- **附录** — 术语表（70+条）、中英译名对照、洛氏描写词汇（400+词）、版本转换

### 实体页面 `wiki/entities/`

神话世界中的生物、人物与模组：

- **外神** — 阿撒托斯、奈亚拉托提普、犹格·索托斯、莎布·尼古拉丝 等 9 位
- **旧日支配者** — 克苏鲁、哈斯塔、达贡、伊格、茨夏格瓦 等 40+ 位
- **旧神** — 诺登斯、巴斯特 等
- **神话种族** — 深潜者、米·戈、远古种族、蛇人、伊斯人 等 19 个种族
- **神话怪物** — 修格斯、拜亚基、星之吸血鬼、廷达罗斯猎犬 等 70+ 种
- **传统怪物** — 幽灵、木乃伊、吸血鬼、狼人、僵尸 等
- **野兽** — 26 种常见动物的数据
- **模组** — 暗黑森林、猩红书信、闹鬼 等

### 图片 `wiki/images/`

约 170 张实体配图，与实体页面一一对应。所有图片由 **TRAE** AI 生成，用于辅助理解实体形象，不属于原书内容。

## 目录结构

```
CoC-kb/
├── .gitignore
├── .obsidian/                   # Obsidian 配置
├── knowledge-base/
│   ├── CLAUDE.md                # 知识库维护规范（LLM Schema）
│   ├── wiki/
│   │   ├── index.md             # 内容索引
│   │   ├── log.md               # 操作日志
│   │   ├── concepts/            # 概念页面（53个）
│   │   ├── entities/            # 实体页面（203个）
│   │   ├── images/              # 实体配图（~170张，TRAE AI 生成）
│   │   └── sources/             # 来源摘要（4个）
│   └── raw/                     # 原始PDF（未纳入版本控制）
└── README.md
```

## 使用方式

### Obsidian

本知识库使用 [Obsidian](https://obsidian.md/) 构建，推荐用 Obsidian 打开以获得最佳体验（双向链接、图谱视图等）。

```bash
git clone https://github.com/digitalghost/CoC-kb.git
# 用 Obsidian 打开克隆的文件夹即可
```

### 直接浏览

所有内容均为 Markdown 格式，可以直接在 GitHub 上阅读，或用任意文本编辑器/Markdown 阅读器打开。

## 维护说明

知识库的维护规范定义在 `knowledge-base/CLAUDE.md` 中，遵循以下原则：

- 所有规则数据忠实于原始规则书，不编造规则
- 使用 `[[页面路径]]` 格式维护页面间的交叉引用
- 原始来源（`raw/`）不可修改，仅通过 wiki 层进行知识整理
- 操作日志（`log.md`）仅追加，不删除历史记录

## 许可

本知识库内容整理自 Chaosium 出版的《克苏鲁的呼唤》系列规则书。规则书原文版权归 Chaosium Inc. 所有。知识库中的实体配图由 TRAE AI 生成，仅供学习参考。
