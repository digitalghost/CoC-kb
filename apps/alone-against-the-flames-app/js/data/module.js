// AAtF module data — generated from parsed-entries.json (the canonical wiki
// fulltext extraction). To regenerate the JSON, run
//   node scripts/parse-fulltext.mjs
// from the app root. This file is the thin adapter that maps each parsed entry
// into the shape `module-engine.js` expects: nodes keyed by id, each with
// `actions[]` whose `next` points at another node id.

import parsed from "./parsed-entries.json" with { type: "json" };

const CHAPTERS = [
  { id: "chapter-1", label: "第一幕 · 抵达", description: "长途车与初到烬头村。", range: [1, 30], anchorNodeId: "entry-1" },
  { id: "chapter-2", label: "第二幕 · 白昼调查", description: "村庄、文特斯、村会堂与图书。", range: [31, 100], anchorNodeId: "entry-31" },
  { id: "chapter-3", label: "第三幕 · 入夜", description: "夜谈、夜潜与节日前夕。", range: [101, 200], anchorNodeId: "entry-154" },
  { id: "chapter-4", label: "第四幕 · 火焰之夜", description: "灯塔、仪式与结局。", range: [201, 270], anchorNodeId: "entry-190" }
];

function toAction(jump, fromId, index) {
  const isNumeric = /^\d+$/.test(jump.label || "");
  const action = {
    id: `${fromId}-choice-${index}`,
    label: isNumeric ? "继续 →" : jump.label,
    description: "",
    next: jump.target,
    effects: [],
    check: null
  };
  const label = jump.label || "";
  const outcome = classifyOutcome(label);
  if (outcome) {
    action.check = { outcome };
  }
  return action;
}

function classifyOutcome(label) {
  if (/^成功时$/.test(label)) return "success";
  if (/^如果你(?:成功|通过)了/.test(label)) return "success";
  if (/^如果你在.*(?:检定成功|胜出)/.test(label)) return "success";
  if (/^如果你在.*获得.*成功/.test(label)) return "success";

  if (/^失败时$/.test(label)) return "failure";
  if (/^如果你(?:失败|没有通过)了/.test(label)) return "failure";
  if (/^如果你(?:没有通过)/.test(label)) return "failure";
  if (/^如果你在.*落败/.test(label)) return "failure";
  if (/^如果你的检定失败/.test(label)) return "failure";
  if (/^否则/.test(label)) return "failure";
  if (/^如果你的孤注一掷失败/.test(label)) return "pushed_failure";

  if (/大失败/.test(label)) return "fumble";

  return null;
}

function toNode(entry) {
  const directives = entry.directives || [];
  const actions = entry.jumps.map((jump, idx) => toAction(jump, entry.id, idx));
  const imageFile = entry.image || (entry.num === 1 ? "opening-full-page.png" : null);

  const hasCheckDirective = directives.some(d => d.kind === "check-mention");

  if (!hasCheckDirective) {
    actions.forEach(a => { a.check = null; });
  }

  if (hasCheckDirective) {
    const gatedTargets = new Set(actions.filter(a => a.check).map(a => a.next));
    for (let i = actions.length - 1; i >= 0; i--) {
      if (!actions[i].check && gatedTargets.has(actions[i].next)) {
        actions.splice(i, 1);
      }
    }
  }

  const hasFumble = actions.some(a => a.check?.outcome === "fumble");
  const hasSuccess = actions.some(a => a.check?.outcome === "success");
  if (hasFumble && !hasSuccess) {
    actions.forEach(a => {
      if (a.check?.outcome === "failure") a.check.outcome = "non_fumble";
    });
  }

  const pushable = actions.some(a => a.check?.outcome === "pushed_failure");

  const node = {
    id: entry.id,
    code: `条目 ${entry.num}`,
    title: `条目 ${entry.num}`,
    sliceId: getChapterIdForNum(entry.num),
    sceneMeta: "",
    text: entry.text,
    image: imageFile ? `assets/figures/${imageFile}` : null,
    directives,
    translatorNotes: entry.translatorNotes || [],
    actions,
    pushable,
    checkHints: directivesToCheckHints(directives),
    onEnterEffects: [
      ...directivesToEffects(directives, false),
      ...(ENTRY_SCRIPTS[entry.id] || []).filter(e => !e.checkGated)
    ],
    checkFailEffects: [
      ...directivesToEffects(directives, true),
      ...(ENTRY_SCRIPTS[entry.id] || []).filter(e => e.checkGated)
    ],
    thresholdGate: THRESHOLD_GATES[entry.id] || null
  };
  if (entry.isEnding) {
    node.endingId = `ending-${entry.num}`;
  }
  return node;
}

function directivesToEffects(directives, checkGatedOnly) {
  const hasCheck = directives.some(d => d.kind === "check-mention");
  const effects = [];
  for (const d of directives) {
    switch (d.kind) {
      case "adjustHp":
      case "adjustSan":
      case "adjustMp":
      case "adjustLuck": {
        const isGated = hasCheck;
        if (isGated !== checkGatedOnly) break;
        const isFixed = /^\d+$/.test(d.amount);
        if (isFixed) {
          effects.push({ type: d.kind, value: Number(d.amount) * (d.sign || 1) });
        } else {
          effects.push({ type: d.kind, diceExpr: d.amount, sign: d.sign || -1 });
        }
        break;
      }
      case "tickSkill":
        if (checkGatedOnly) break;
        effects.push({ type: "tickSkill", skill: d.skill });
        break;
    }
  }
  return effects;
}

// Threshold gates: after onEnterEffects apply damage, the engine compares
// the absolute damage dealt to maxHP/2 and only shows the matching action.
// actionIndexIfMet = index of action to show when damage >= threshold
// actionIndexIfNot = index of action to show when damage < threshold
const THRESHOLD_GATES = {
  "entry-55": { stat: "hp", compare: ">=", fractionOfMax: 0.5, actionIndexIfMet: 0, actionIndexIfNot: 1 }
};

const ENTRY_SCRIPTS = {
  // ─── entry-1 到 entry-25 ───
  "entry-2": [{ type: "adjustHp", value: 1 }],
  "entry-5": [{ type: "adjustSan", diceExpr: "1D3", sign: -1 }],
  "entry-8": [{
    type: "conditionBranch",
    stat: "SIZ",
    operator: "<=",
    value: 40,
    targetIfTrue: "entry-23",
    targetIfFalse: "entry-38",
    labelIfTrue: "你的体型较小（体型40），司机帮你搭了把手",
    labelIfFalse: "你的体型较大（体型40以上），你自己搬上了行李"
  }],
  "entry-12": [{ type: "tickSkill", skill: "闪避" }],
  "entry-13": [{ type: "adjustHp", value: 1 }],
  "entry-16": [{ type: "gainItem", item: "狩猎小刀" }],
  "entry-19": [{ type: "tickSkill", skill: "恐吓" }],

  // ─── entry-26 到 entry-50 ───
  "entry-26": [{
    type: "custom",
    fn: (state) => {
      state.flags.penaltyDay = true;
    }
  }],
  "entry-29": [{
    type: "custom",
    fn: (state) => {
      const dex = state.character.attributes?.DEX ?? 0;
      const siz = state.character.attributes?.SIZ ?? 0;
      if (dex >= siz) {
        state.conditionBranchResult = {
          met: true,
          targetIfTrue: "entry-42",
          targetIfFalse: "entry-42",
          labelIfTrue: "你的敏捷高于体型，轻松通过狭窄地带",
          labelIfFalse: "",
        };
      }
      // DEX < SIZ：不设 conditionBranchResult，由检定 hint 接管（敏捷检定）
    }
  }],
  "entry-30": [{ type: "tickSkill", skill: "侦查" }],
  "entry-35": [{ type: "tickSkill", skill: "博物学" }],
  "entry-39": [{ type: "tickSkill", skill: "魅惑" }],
  "entry-48": [{ type: "tickSkill", skill: "攀爬" }],

  // ─── entry-51 到 entry-75 ───
  // entry-45: 夜间战斗后醒来（entry-203/entry-217均跳至此），标记 nightFight
  "entry-45": [{ type: "setFlag", key: "nightFight", value: true }],
  // entry-51: 纯叙事→entry-63，无脚本
  "entry-52": [{
    type: "custom",
    checkGated: true,
    fn: (state) => {
      // 体质检定失败：今天技能检定受惩罚骰
      state.flags.penaltyDay = true;
    }
  }],
  // entry-53: 困难闪避检定，parser处理，无额外效果
  // entry-54: 纯叙事+选择，无脚本
  "entry-55": [
    { type: "adjustHp", diceExpr: "2D6", sign: -1 }
    // thresholdGate 已在 THRESHOLD_GATES["entry-55"] 中定义
  ],
  // entry-56: 纯叙事+选择，无脚本
  // entry-57: 侦查检定，parser处理，无额外效果
  "entry-58": [{ type: "adjustHp", value: 1 }],
  // entry-59: 纯叙事（瘀伤无数值变化），无脚本
  // entry-60: 考古学检定，parser处理，无额外效果
  // entry-61: 纯叙事→entry-120，无脚本
  // entry-62: 纯叙事+选择，无脚本
  // entry-63: 纯叙事→entry-154，无脚本
  "entry-64": [{
    type: "custom",
    fn: (state) => {
      // 如果昨晚卷入了战斗（nightFight flag），显示两个选项；否则直接跳entry-78
      if (!state.flags.nightFight) {
        state.conditionBranchResult = {
          met: false,
          targetIfTrue: "entry-70",
          targetIfFalse: "entry-78",
          labelIfTrue: "",
          labelIfFalse: "昨晚没有战斗，前往村庄探索"
        };
      }
      // 有 nightFight flag 时，保留原始两个选项按钮（parser生成）
    }
  }],
  "entry-65": [{
    type: "custom",
    fn: (state, applyEffects) => {
      applyEffects(state, [{ type: "adjustHp", diceExpr: "1D6", sign: -1 }]);
      if (state.character.stats.hp.current > 0) {
        // HP 未归零：取消死亡状态，让力量检定继续
        state.dead = false;
        state.deathNodeId = null;
      }
    }
  }],
  "entry-66": [{ type: "tickSkill", skill: "考古学" }],
  // entry-67: 体质检定，parser处理，无额外效果
  // entry-68: 纯叙事+选择，无脚本
  "entry-69": [{ type: "tickSkill", skill: "侦查" }],
  // entry-70: 纯叙事→entry-78，无脚本
  // entry-71: 纯叙事+职业选择，无脚本
  // entry-72: 纯叙事→entry-79，无脚本
  "entry-73": [{
    type: "custom",
    fn: (state) => {
      // HP归零→entry-92（死亡），否则→entry-82（P2遗留，暂用conditionBranch）
      const hp = state.character.stats?.hp?.current ?? 1;
      state.conditionBranchResult = {
        met: hp <= 0,
        targetIfTrue: "entry-92",
        targetIfFalse: "entry-82",
        labelIfTrue: "耐久值归零，重伤倒地",
        labelIfFalse: "虽然摔落，但还能撑住"
      };
    }
  }],
  // entry-74: 纯叙事→entry-99，无脚本
  // entry-75: 纯叙事→entry-86，无脚本

  // ─── entry-76 到 entry-100 ───
  "entry-76": [{ type: "tickSkill", skill: "科学(植物学)" }],
  // entry-77: 结局节点，无脚本
  // entry-78: 纯叙事+选择，无脚本
  // entry-79: 困难聆听检定，parser处理，无额外效果
  // entry-80: 结局节点，无脚本
  // entry-81: 纯叙事→entry-99，无脚本
  // entry-82: 纯叙事→entry-108，无脚本
  // entry-83: 侦查检定，parser处理，无额外效果
  // entry-84: 纯叙事→entry-25，无脚本
  // entry-85: 幸运检定，parser处理，无额外效果
  // entry-86: 纯叙事+选择，无脚本
  // entry-87: 困难侦查检定，parser处理，无额外效果
  // entry-88: 纯叙事→entry-99，无脚本
  // entry-89: 孤注一掷侦查检定，parser处理，无额外效果
  "entry-90": [{
    type: "custom",
    fn: (state) => {
      state.flags.awaitingMpInput = true;
      state.flags.mpInputMax = Math.min(10, (state.character.stats?.mp?.current ?? 0) + Math.max(0, (state.character.stats?.hp?.current ?? 1) - 1));
    }
  }],
  // entry-91: 纯叙事→entry-79，无脚本
  // entry-92: 结局节点，无脚本
  "entry-93": [{
    type: "custom",
    fn: (state, applyEffects) => {
      applyEffects(state, [{ type: "adjustHp", diceExpr: "1D6", sign: -1 }]);
      if (state.character.stats.hp.current > 0) {
        state.dead = false;
        state.deathNodeId = null;
      }
    }
  }],
  "entry-94": [{
    type: "custom",
    fn: (state) => {
      // 如果之前损失过理智，回复1点SAN
      const sanMax = state.character.stats?.san?.max ?? 0;
      const sanCur = state.character.stats?.san?.current ?? sanMax;
      if (sanCur < sanMax) {
        state.character.stats.san.current = Math.min(sanMax, sanCur + 1);
        state.character.derived.SAN = state.character.stats.san.current;
      }
    }
  }],
  // entry-95: 纯叙事+选择，无脚本
  // entry-96: 心理学检定，parser处理，无额外效果
  "entry-97": [
    { type: "adjustHp", diceExpr: "1D3", sign: -1 },
    // 急救检定成功→回复1点HP + tickSkill（checkGated）
    { type: "adjustHp", value: 1, checkGated: true },
    { type: "tickSkill", skill: "急救", checkGated: true }
  ],
  // entry-98: 纯叙事+选择，无脚本
  // entry-99: 信用评级检定，parser处理，无额外效果
  // entry-100: 纯叙事→entry-63，无脚本

  // ─── entry-101 到 entry-125 ───
  // entry-101: 纯叙事→entry-108，无脚本
  // entry-102: 纯叙事（职业介绍：文物学家），无脚本
  // entry-103: 纯叙事+选择，无脚本
  // entry-104: 纯叙事→entry-205，无脚本
  // entry-105: 纯叙事→entry-180，无脚本
  "entry-106": [{ type: "tickSkill", skill: "心理学" }],
  // entry-107: 纯叙事→entry-152，无脚本
  // entry-108: 纯叙事+选择，无脚本
  "entry-109": [{
    type: "custom",
    fn: (state, applyEffects) => {
      applyEffects(state, [{ type: "adjustHp", diceExpr: "1D6", sign: -1 }]);
      if (state.character.stats.hp.current > 0) {
        state.dead = false;
        state.deathNodeId = null;
      }
    }
  }],
  // entry-110: 极难潜行检定（含大失败），parser处理，无额外效果
  // entry-111: 侦查检定，parser处理，无额外效果
  "entry-112": [
    { type: "adjustSan", value: 1 },
    { type: "tickSkill", skill: "侦查" }
  ],
  // entry-113: 纯叙事→entry-205，无脚本
  // entry-114: 纯叙事→entry-120，无脚本
  // entry-115: 幸运检定，parser处理，无额外效果
  // entry-116: 幸运检定，parser处理，无额外效果
  // entry-117: 外貌检定，parser处理，无额外效果
  "entry-118": [{ type: "tickSkill", skill: "侦查" }],
  // entry-119: 极难话术检定，parser处理，无额外效果
  // entry-120: 纯叙事+选择（探索枢纽），无脚本
  // entry-121: 追踪检定，parser处理，无额外效果
  // entry-122: 纯叙事→entry-79，无脚本
  // entry-123: 结局节点，无脚本
  // entry-124: 纯叙事→entry-180，无脚本
  // entry-125: 困难乔装检定，parser处理，无额外效果

  // ─── entry-126 到 entry-150 ───
  // entry-126: 纯叙事→entry-133，无脚本
  // entry-127: 纯叙事+选择，无脚本
  // entry-128: 纯叙事→entry-144，无脚本
  // entry-129: 纯叙事→entry-79，无脚本
  // entry-130: 纯叙事→entry-63，无脚本
  // entry-131: 纯叙事+选择，无脚本
  // entry-132: 纯叙事→entry-152，无脚本
  // entry-133: 侦查检定（奖励骰），parser处理，无额外效果
  // entry-134: 敏捷检定，parser处理，无额外效果
  // entry-135: 纯叙事+选择，无脚本
  "entry-136": [{ type: "adjustSkill", skill: "博物学", value: 1 }],
  // entry-137: 纯叙事→entry-156，无脚本
  // entry-138: 话术/魅惑/说服检定，parser处理，无额外效果
  // entry-139: 纯叙事→entry-108，无脚本
  // entry-140: 纯叙事→entry-120，无脚本
  "entry-141": [
    { type: "setFlag", key: "nightCheckSuccess", value: true },
    { type: "adjustSan", diceExpr: "1D2", sign: -1, checkGated: true }
  ],
  // entry-142: 纯叙事+选择，无脚本
  "entry-143": [{ type: "adjustSkill", skill: "博物学", value: 2 }],
  // entry-144: 汽车驾驶/心理学检定，parser处理，无额外效果
  // entry-145: 纯叙事→entry-157，无脚本
  "entry-146": [{ type: "tickSkill", skill: "乔装" }],
  // entry-147: 纯叙事+选择，无脚本
  // entry-148: 纯叙事→entry-18，无脚本
  // entry-149: 纯叙事+选择，无脚本
  // entry-150: 对抗检定（startCombat已定义），保留

  // ─── entry-151 到 entry-175 ───
  // entry-151: 纯叙事→entry-157，无脚本
  // entry-152: 潜行检定，parser处理，无额外效果
  // entry-153: 纯叙事+选择，无脚本
  "entry-154": [{ type: "adjustHp", value: 1 }],
  // entry-155: 对抗检定（startCombat已定义），保留
  // entry-156: 纯叙事+选择，无脚本
  // entry-157: 纯叙事+选择，无脚本
  "entry-158": [{ type: "tickSkill", skill: "潜行", checkGated: true }],
  "entry-159": [{ type: "gainItem", item: "德比诗集《阿撒托斯及其他》" }],
  // entry-160: 纯叙事→entry-25，无脚本
  // entry-161: 纯叙事→entry-79，无脚本
  "entry-162": [{ type: "tickSkill", skill: "心理学" }],
  // entry-163: 纯叙事→entry-157，无脚本
  // entry-164: 纯叙事+选择，无脚本
  // entry-165: 图书馆使用检定，parser处理，无额外效果
  "entry-166": [{
    type: "custom",
    fn: (state) => {
      // 如果昨晚曾在技能检定中成功过（nightCheckSuccess flag），显示两个选项
      // 否则直接跳 entry-192
      if (!state.flags.nightCheckSuccess) {
        state.conditionBranchResult = {
          met: false,
          targetIfTrue: "entry-178",
          targetIfFalse: "entry-192",
          labelIfTrue: "",
          labelIfFalse: "昨晚没有特别发现，继续出发"
        };
      }
    }
  }],
  // entry-167: 熊双爪攻击（复杂战斗），见遗留P5
  // entry-168: 纯叙事→entry-185，无脚本
  // entry-169: 纯叙事+选择，无脚本
  // entry-170: 纯叙事→entry-108，无脚本
  "entry-171": [
    { type: "adjustSan", value: -1, checkGated: false },
    // 理智检定失败额外扣1D4（checkGated），成功只扣1点（已在onEnter）
    { type: "adjustSan", diceExpr: "1D4", sign: -1, checkGated: true },
    { type: "adjustSkill", skill: "克苏鲁神话", value: 4 }
    // 结局节点
  ],
  // entry-172: 纯叙事→entry-142，无脚本
  // entry-173: 战斗（startCombat已定义），保留
  "entry-174": [{ type: "tickSkill", skill: "汽车驾驶" }],
  "entry-175": [{ type: "gainItem", item: "阿博加斯特仪式咒语" }],

  // ─── entry-176 到 entry-200 ───
  // entry-176: 困难力量检定，parser处理，无额外效果
  "entry-177": [{ type: "tickSkill", skill: "图书馆使用" }],
  // entry-178: 侦查检定，parser处理，无额外效果
  // entry-179: 体质检定，parser处理，无额外效果
  // entry-180: 纯叙事+选择，无脚本
  // entry-181: 纯叙事+选择，无脚本
  // entry-182: 纯叙事→entry-157，无脚本
  // entry-183: 纯叙事→entry-108，无脚本
  "entry-184": [{ type: "gainItem", item: "德比诗集《阿撒托斯及其他》" }],
  // entry-185: 结局节点，无脚本
  // entry-186: 纯叙事→entry-79，无脚本
  // entry-187: 困难侦查检定，parser处理，无额外效果
  // entry-188: 闪避检定，parser处理，无额外效果
  // entry-189: 幸运检定，parser处理，无额外效果
  // entry-190: 纯叙事→entry-108，无脚本
  "entry-191": [{ type: "adjustSan", value: -1, checkGated: true }], // 检定失败才失去1点理智
  // entry-192: 纯叙事→entry-218，无脚本
  // entry-193: 结局节点，无脚本
  // entry-194: 纯叙事+选择，无脚本
  // entry-195: 理智检定，parser处理，无额外效果
  // entry-196: 结局节点，无脚本
  "entry-197": [{ type: "gainItem", item: "召唤天之火咒语" }],
  "entry-198": [{
    type: "custom",
    fn: (state) => {
      const spent = state.spellMpSpent ?? 0;
      state.dynamicCheckTarget = Math.min(95, spent * 10);
    }
  }],
  // entry-199: 纯叙事+选择，无脚本
  // entry-200: 纯叙事→entry-169，无脚本

  // ─── entry-201 到 entry-225 ───
  "entry-201": [
    { type: "tickSkill", skill: "格斗(斗殴)" },
    { type: "adjustHp", value: 1, checkGated: true }
  ],
  "entry-202": [{ type: "gainItem", item: "号令天之火咒语" }],
  "entry-203": [{ type: "adjustHp", diceExpr: "1D6", sign: -1 }],
  // entry-204: 纯叙事→entry-152，无脚本
  // entry-205: 纯叙事→entry-27，无脚本
  // entry-206: 纯叙事→entry-221，无脚本
  // entry-207: 敏捷检定，parser处理，无额外效果
  // entry-208: 攀爬检定（含大失败），parser处理，无额外效果
  "entry-209": [{ type: "adjustSan", diceExpr: "1D3", sign: -1 }],
  // entry-210: 纯叙事→entry-236，无脚本
  "entry-211": [{ type: "tickSkill", skill: "潜行" }],
  // entry-212: 纯叙事→entry-192，无脚本
  // entry-213: 纯叙事→entry-120，无脚本
  // entry-214: 纯叙事→entry-221，无脚本
  // entry-215: 纯叙事→entry-264，无脚本
  // entry-216: 纯叙事+选择，无脚本
  "entry-217": [
    { type: "adjustHp", diceExpr: "1D2", sign: -1 },
    { type: "adjustSan", diceExpr: "1D3", sign: -1 }
  ],
  // entry-218: 纯叙事→entry-6，无脚本
  // entry-219: 纯叙事+选择，无脚本
  // entry-220: 结局节点，无脚本
  // entry-221: 纯叙事+选择，无脚本
  "entry-222": [{
    type: "custom",
    fn: (state) => {
      const hp = state.character.stats?.hp?.current ?? 1;
      const newHp = Math.max(0, hp - 1);
      state.character.stats.hp.current = newHp;
      state.character.derived.HP_current = newHp;
      state.conditionBranchResult = {
        met: newHp <= 0,
        targetIfTrue: "entry-13",
        targetIfFalse: "entry-228",
        labelIfTrue: "耐久值归零，跌落重伤",
        labelIfFalse: "受了1点伤，继续攀爬"
      };
    }
  }],
  // entry-223: 结局节点，无脚本
  // entry-224: 纯叙事→entry-26，无脚本
  "entry-225": [{ type: "tickSkill", skill: "锁匠", checkGated: true }],

  // ─── entry-226 到 entry-250 ───
  // entry-226: 纯叙事（职业介绍：医生）→entry-128，无脚本
  // entry-227: 纯叙事→entry-259，无脚本
  // entry-228: 纯叙事→entry-246，无脚本
  // entry-229: 纯叙事→entry-223，无脚本
  // entry-230: 纯叙事+选择，无脚本
  // entry-231: 结局节点，无脚本
  // entry-232: 力量检定，parser处理，无额外效果
  // entry-233: 纯叙事→entry-134，无脚本
  // entry-234: 纯叙事+选择，无脚本
  // entry-235: 战斗（startCombat已定义），保留
  // entry-236: 纯叙事+选择，无脚本
  "entry-237": [{ type: "adjustSkill", skill: "克苏鲁神话", value: 2 }],
  // entry-238: 纯叙事→entry-120，无脚本
  // entry-239: 纯叙事（职业介绍：记者）→entry-128，无脚本
  "entry-240": [{ type: "tickSkill", skill: "聆听" }],
  "entry-241": [{ type: "tickSkill", skill: "格斗(斗殴)" }],
  // entry-242: 纯叙事→entry-157，无脚本
  // entry-243: 结局节点，无脚本
  // entry-244: 纯叙事+选择，无脚本
  // entry-245: 纯叙事→entry-259，无脚本
  // entry-246: 理智检定，parser处理，无额外效果
  // entry-247: 结局节点，无脚本
  // entry-248: 第二天夜晚→第三天早晨，清除 penaltyDay
  "entry-248": [{ type: "setFlag", key: "penaltyDay", value: false }],
  // entry-249: 纯叙事（职业介绍：私家侦探）→entry-128，无脚本
  "entry-250": [{ type: "adjustSan", diceExpr: "1D2", sign: -1, checkGated: true }],

  // ─── entry-251 到 entry-270 ───
  // entry-251: 纯叙事→entry-267，无脚本
  "entry-252": [{ type: "adjustHp", diceExpr: "1D3", sign: -1 }],
  // entry-253: 纯叙事→entry-160，无脚本
  // entry-254: 纯叙事+选择，无脚本
  // entry-255: 结局节点，无脚本
  // entry-256: 纯叙事+选择，无脚本
  // entry-257: 纯叙事→entry-267，无脚本
  "entry-258": [
    { type: "adjustSan", diceExpr: "1D2", sign: -1 },
    { type: "adjustHp", diceExpr: "1D3", sign: -1 }
  ],
  // entry-259: 纯叙事→entry-160，无脚本
  // entry-260: 恐吓检定，parser处理，无额外效果
  // entry-261: 纯叙事→entry-71，无脚本
  // entry-262: 战斗（startCombat已定义），保留
  // entry-263: 纯叙事→entry-8，无脚本
  // entry-264: 理智检定，parser处理，无额外效果
  // entry-265: 纯叙事（职业介绍：教授）→entry-128，无脚本
  // entry-266: 第二天夜晚节点，清除 penaltyDay（若走entry-26路径会重新设置）
  "entry-266": [{ type: "setFlag", key: "penaltyDay", value: false }],
  // entry-267: 纯叙事→entry-4，无脚本
  "entry-268": [{ type: "tickSkill", skill: "格斗(斗殴)" }],
  "entry-269": [{ type: "adjustSan", value: -1 }],
  // entry-270: 结局节点，无脚本

  // ─── 战斗场景（保留）───
  "entry-150": [{ type: "startCombat", scriptId: "entry-150" }],
  "entry-155": [{ type: "startCombat", scriptId: "entry-155" }],
  "entry-173": [{ type: "startCombat", scriptId: "entry-173" }],
  "entry-235": [{ type: "startCombat", scriptId: "entry-235" }],
  "entry-262": [{ type: "startCombat", scriptId: "entry-262" }],
};

const ATTR_CN_TO_KEY = {
  "力量": "STR", "体质": "CON", "体形": "SIZ", "敏捷": "DEX",
  "外貌": "APP", "智力": "INT", "意志": "POW", "教育": "EDU"
};

const DERIVED_CN_TO_KEY = {
  "幸运": "luck", "理智": "san"
};

function directivesToCheckHints(directives) {
  const hints = [];
  let lastCheck = null;
  for (const d of directives) {
    switch (d.kind) {
      case "check-mention": {
        let check;
        if (ATTR_CN_TO_KEY[d.skill]) {
          check = { type: "attribute", key: ATTR_CN_TO_KEY[d.skill], skill: d.skill, label: d.skill, difficulty: "regular", mode: "regular" };
        } else if (DERIVED_CN_TO_KEY[d.skill]) {
          check = { type: "derived", key: DERIVED_CN_TO_KEY[d.skill], skill: d.skill, label: d.skill, difficulty: "regular", mode: "regular" };
        } else {
          check = { type: "skill", skill: d.skill, label: d.skill, difficulty: "regular", mode: "regular" };
        }
        lastCheck = check;
        hints.push(lastCheck);
        break;
      }
      case "check-hard":
        if (lastCheck) lastCheck.difficulty = "hard";
        break;
      case "check-extreme":
        if (lastCheck) lastCheck.difficulty = "extreme";
        break;
      case "bonus-die":
        if (lastCheck && !d.context) lastCheck.mode = "bonus";
        break;
      case "penalty-die":
        if (lastCheck && !d.context) lastCheck.mode = "penalty";
        break;
    }
  }
  return hints;
}

const ENDINGS = [
  { num: 65, tone: "death", label: "烈焰吞噬", summary: "你在铁链中被火焰烧死。" },
  { num: 77, tone: "death", label: "时间耗尽", summary: "铁链未能挣脱，火焰夺去了你的生命。" },
  { num: 80, tone: "sacrifice", label: "仪式献祭", summary: "你吟诵了仪式，以自身为代价。" },
  { num: 92, tone: "death", label: "坠崖身亡", summary: "你从悬崖跌落，因伤出血而死。" },
  { num: 93, tone: "death", label: "挣脱但未逃脱", summary: "你挣脱了铁链，但火焰仍在追赶。" },
  { num: 109, tone: "death", label: "灯塔之火", summary: "你躲开了抓捕，但火焰吞没了一切。" },
  { num: 123, tone: "death", label: "推入火堆", summary: "村民将你推回火中，狂热吞噬了你。" },
  { num: 171, tone: "madness", label: "宇宙真相", summary: "你领悟了德比的诗作，精神再也无法安宁。" },
  { num: 185, tone: "escape", label: "骑车逃离", summary: "你骑车离开了烬头村，身后是嘶吼与爆响。" },
  { num: 193, tone: "death", label: "熊的猎物", summary: "你倒在路边，成为野兽的猎物。" },
  { num: 196, tone: "death", label: "教堂坍塌", summary: "坍塌的屋顶将你压碎。" },
  { num: 220, tone: "madness", label: "星辰彻悟", summary: "你彻悟自己从来都是一颗星星。" },
  { num: 223, tone: "escape", label: "山顶远望", summary: "你逃到山顶，目睹烬头村在身后燃烧。" },
  { num: 231, tone: "death", label: "献祭之火", summary: "你被村民献祭，命令群星降临。" },
  { num: 243, tone: "death", label: "白炽湮灭", summary: "群星回应了你，你在光与热中湮灭。" },
  { num: 247, tone: "escape", label: "马车脱险", summary: "你被拖上马车，在颠簸中离开了烬头村。" },
  { num: 255, tone: "triumph", label: "阻止群星", summary: "你的命令阻止了群星下落，村庄得救。" },
  { num: 270, tone: "triumph", label: "火焰凝固", summary: "火焰停在半空，烬头村的噩梦终结。" }
];

function getChapterIdForNum(num) {
  for (const ch of CHAPTERS) {
    if (num >= ch.range[0] && num <= ch.range[1]) return ch.id;
  }
  return CHAPTERS[0].id;
}

const nodes = {};
for (const entry of Object.values(parsed.entries)) {
  nodes[entry.id] = toNode(entry);
}

export const module = {
  id: "alone-against-the-flames",
  title: "向火独行",
  startNodeId: "entry-1",
  chapters: CHAPTERS,
  endings: ENDINGS,
  nodes
};

export const moduleStats = {
  totalNodes: Object.keys(nodes).length,
  endingNodes: Object.values(nodes).filter((n) => n.endingId).length,
  imageNodes: Object.values(nodes).filter((n) => n.image).length,
  directiveNodes: Object.values(nodes).filter((n) => n.directives.length).length
};
