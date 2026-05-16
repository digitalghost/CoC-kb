// AAtF module data — generated from parsed-entries.json (the canonical wiki
// fulltext extraction). To regenerate the JSON, run
//   node scripts/parse-fulltext.mjs
// from the app root. This file is the thin adapter that maps each parsed entry
// into the shape `module-engine.js` expects: nodes keyed by id, each with
// `actions[]` whose `next` points at another node id.

import parsed from "./parsed-entries.json" with { type: "json" };


const CHAPTERS = [
  { id: "chapter-1", label: "第一幕 · 长途车", description: "长途车上的建卡与初识。", anchorNodeId: "entry-1" },
  { id: "chapter-2", label: "第二幕 · 抵达烬头村", description: "进入梅家，初识村民。", anchorNodeId: "entry-4" },
  { id: "chapter-3", label: "第三幕 · 白天调查", description: "探索村庄、文特斯与图书室。", anchorNodeId: "entry-6" },
  { id: "chapter-4", label: "第四幕 · 入夜", description: "第一夜的夜谈与暗流。", anchorNodeId: "entry-63" },
  { id: "chapter-5", label: "第五幕 · 第二天", description: "清晨醒来，深入调查。", anchorNodeId: "entry-64" },
  { id: "chapter-6", label: "第六幕 · 火焰之夜", description: "被押往灯塔，仪式与结局。", anchorNodeId: "entry-117" }
];

function toAction(jump, fromId, index) {
  const raw = (jump.label || "").trim();
  // 纯数字、空字符串、纯标点引号、或"现在"/"然后"等过渡词，都显示"继续 →"
  const isContinue = !raw
    || /^\d+$/.test(raw)
    || /^["""“”‘’\s]+$/.test(raw)
    || /^[现在然后，。]+$/.test(raw);
  const action = {
    id: `${fromId}-choice-${index}`,
    label: isContinue ? "继续 →" : raw,
    description: "",
    next: jump.target,
    effects: [],
    check: null
  };
  const outcome = classifyOutcome(raw);
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

const SCENE_IMAGES = {
  0: "opening-scene.jpg",
  1: "entry-1-bus-station.jpg",
  2: "entry-2-subdued.jpg",
  3: "entry-3-leadbetter-daughter.jpg",
  4: "entry-4-leadbetter-home.jpg",
  5: "entry-5-burning-beasts.jpg",
  6: "entry-6-village-panorama.jpg",
  7: "entry-7-village-blocked.jpg",
  8: "entry-8-loading-luggage.jpg",
  9: "entry-9-ruth-warning.jpg",
  10: "entry-10-fire-dancers.jpg",
  11: "entry-11-town-hall.jpg",
  12: "entry-12-escape-workshop.jpg",
  13: "entry-13-rescued-farm.jpg",
  14: "entry-14-may-silas.jpg",
  15: "entry-15-may-ruth.jpg",
  16: "entry-16-general-store.jpg",
  17: "entry-17-bulletin-board.jpg",
  18: "entry-18-lighthouse-ritual.jpg",
  19: "entry-19-may-fear.jpg",
  20: "entry-20-craftsman-reveal.jpg",
  21: "entry-21-may-festival.jpg",
  22: "entry-22-leaving-home.jpg",
  23: "entry-23-driver-help.jpg",
  24: "entry-24-mr-vents.jpg",
  25: "entry-25-buying-supplies.jpg",
  26: "entry-26-poisoned-morning.jpg",
  27: "entry-27-robed-villagers.jpg",
  28: "entry-28-leaving-village.jpg",
  29: "entry-29-northern-recon.jpg",
  30: "entry-30-window-secret.jpg",
  31: "entry-31-may-village-life.jpg",
  32: "entry-32-may-anger.jpg",
  33: "entry-33-lighthouse-ceremony.jpg",
  34: "entry-34-ruined-church.jpg",
  35: "entry-35-coyote-howl.jpg",
  36: "entry-36-cliff-fall.jpg",
  37: "entry-37-meeting-vents.jpg",
  38: "entry-38-struggling-luggage.jpg",
  39: "entry-39-may-past.jpg",
  40: "entry-40-flames-spread.jpg",
  41: "entry-41-hesitation.jpg",
  42: "entry-42-finding-overlook.jpg",
  43: "entry-43-vents-office.jpg",
  44: "entry-44-struggle-chains.jpg",
  45: "entry-45-waking-up.jpg",
  46: "entry-46-church-stable.jpg",
  47: "entry-47-forest-fear.jpg",
  48: "entry-48-climbing-escape.jpg",
  49: "entry-49-vents-village.jpg",
  50: "entry-50-casting-spell.jpg",
  51: "entry-51-may-tour.jpg",
  52: "entry-52-sleepless-night.jpg",
  53: "entry-53-breaking-free.jpg",
  54: "entry-54-forest-path.jpg",
  55: "entry-55-heavy-fall.jpg",
  56: "entry-56-vents-telegraph.jpg",
  57: "entry-57-black-lighthouse.jpg",
  58: "entry-58-awakened-footsteps.jpg",
  59: "entry-59-car-accident.jpg",
  60: "entry-60-mountain-view.jpg",
  61: "entry-61-observing-lighthouse.jpg",
  62: "entry-62-vents-library.jpg",
  63: "entry-63-first-meeting-ruth.jpg",
  64: "entry-64-empty-kitchen.jpg",
  65: "entry-65-flames-licking.jpg",
  66: "entry-66-stonehenge-secret.jpg",
  67: "entry-67-injured-landing.jpg",
  68: "entry-68-vents-study.jpg",
  69: "entry-69-village-secret.jpg",
  70: "entry-70-battlefield-investigation.jpg",
  71: "entry-71-talking-silas.jpg",
  72: "entry-72-solitary-joy.jpg",
  73: "entry-73-knocked-down.jpg",
  74: "entry-74-local-history.jpg",
  75: "entry-75-night-walk.jpg",
  76: "entry-76-hypnotic-powder.jpg",
  77: "entry-77-burned-alive-ending.jpg",
  78: "entry-78-village-survey.jpg",
  79: "entry-79-night-road.jpg",
  80: "entry-80-spell-fails.jpg",
  81: "entry-81-festival-research.jpg",
  82: "entry-82-rescued-by-villagers.jpg",
  83: "entry-83-searching-may-bedroom.jpg",
  84: "entry-84-outside-town-hall.jpg",
  85: "entry-85-lost-trail.jpg",
  86: "entry-86-dark-shadow.jpg",
  87: "entry-87-chase-fails.jpg",
  88: "entry-88-mars-research.jpg",
  89: "entry-89-searching-drawers.jpg",
  90: "entry-90-spell-preparation.jpg",
  91: "entry-91-stumbling.jpg",
  92: "entry-92-falling-death.jpg",
  93: "entry-93-breaking-free-success.jpg",
  94: "entry-94-reading-magazine.jpg",
  95: "entry-95-finding-trapdoor-2.jpg",
  96: "entry-96-craftsmen-yard.jpg",
  97: "entry-97-forest-tumble.jpg",
  98: "entry-98-being-watched.jpg",
  99: "entry-99-research-time.jpg",
  100: "entry-100-returning-leadbetter.jpg",
  101: "entry-101-surrounded.jpg",
  102: "entry-102-archaeologist-backstory.jpg",
  103: "entry-103-bear-forest.jpg",
  104: "entry-104-captive-drinking.jpg",
  105: "entry-105-library-closing.jpg",
  106: "entry-106-mysterious-workshop.jpg",
  107: "entry-107-cliff-stairs.jpg",
  108: "entry-108-captivity.jpg",
  109: "entry-109-dodging-flames.jpg",
  110: "entry-110-sneaking-bear.jpg",
  111: "entry-111-continue-reading.jpg",
  112: "entry-112-hidden-ladder.jpg",
  113: "entry-113-refusing-water.jpg",
  114: "entry-114-cellar-trunks.jpg",
  115: "entry-115-eastern-road.jpg",
  116: "entry-116-watching-bear.jpg",
  117: "entry-117-marched-lighthouse.jpg",
  118: "entry-118-bookshelf-secret.jpg",
  119: "entry-119-persuading-guard.jpg",
  120: "entry-120-village-unrest.jpg",
  121: "entry-121-chasing-shadow.jpg",
  122: "entry-122-cautious-retreat.jpg",
  123: "entry-123-death-ending.jpg",
  124: "entry-124-library-close.jpg",
  125: "entry-125-disguise-escape.jpg",
  126: "entry-126-sneaking-town-hall.jpg",
  127: "entry-127-mysterious-wave.jpg",
  128: "entry-128-journey-scenery.jpg",
  129: "entry-129-bear-leaves.jpg",
  130: "entry-130-shadow-disappears.jpg",
  131: "entry-131-starry-night.jpg",
  132: "entry-132-deceiving-guard.jpg",
  133: "entry-133-entering-secret-room.jpg",
  134: "entry-134-agility-check.jpg",
  135: "entry-135-man-flees.jpg",
  136: "entry-136-bear-eating.jpg",
  137: "entry-137-jumping-lighthouse.jpg",
  138: "entry-138-talking-ruth-plan.jpg",
  139: "entry-139-caught-villagers.jpg",
  140: "entry-140-finding-map.jpg",
  141: "entry-141-chasing-cliff.jpg",
  142: "entry-142-finding-cave.jpg",
  143: "entry-143-watching-bear-tree.jpg",
  144: "entry-144-arriving-ashhead.jpg",
  145: "entry-145-ruth-warning-detail.jpg",
  146: "entry-146-disguise-passing.jpg",
  147: "entry-147-bookshelf-mechanism.jpg",
  148: "entry-148-fire-dancers-farewell.jpg",
  149: "entry-149-bear-attack.jpg",
  150: "entry-150-chasing-man.jpg",
  151: "entry-151-ruth-disobedient.jpg",
  152: "entry-152-night-escape.jpg",
  153: "entry-153-dark-room.jpg",
  154: "entry-154-fire-dream.jpg",
  155: "entry-155-racing-bear.jpg",
  156: "entry-156-finding-bicycle.jpg",
  157: "entry-157-cramped-room.jpg",
  158: "entry-158-escape-attempt.jpg",
  159: "entry-159-stealing-books.jpg",
  160: "entry-160-deciding-leave.jpg",
  161: "entry-161-shaking-bear.jpg",
  162: "entry-162-silas-trick.jpg",
  163: "entry-163-shadows-surround.jpg",
  164: "entry-164-being-chased.jpg",
  165: "entry-165-opening-window.jpg",
  166: "entry-166-leaving-morning.jpg",
  167: "entry-167-bear-claw.jpg",
  168: "entry-168-stars-descend.jpg",
  169: "entry-169-abogast-truth.jpg",
  170: "entry-170-subdued.jpg",
  171: "entry-171-learning-poetry.jpg",
  172: "entry-172-catching-man.jpg",
  173: "entry-173-bear-standing.jpg",
  174: "entry-174-realizing-breakdown.jpg",
  175: "entry-175-learning-spell.jpg",
  176: "entry-176-collapsing-roof.jpg",
  177: "entry-177-finding-fire-book.jpg",
  178: "entry-178-surveying-cliff.jpg",
  179: "entry-179-shadow-attack.jpg",
  180: "entry-180-return-leadbetter-evening.jpg",
  181: "entry-181-finding-hidden-passage.jpg",
  182: "entry-182-abogast-leaves.jpg",
  183: "entry-183-fail-arrested.jpg",
  184: "entry-184-finding-poetry-book.jpg",
  185: "entry-185-cycling-escape.jpg",
  186: "entry-186-after-bear-escape.jpg",
  187: "entry-187-hidden-stairs.jpg",
  188: "entry-188-shadow-attack.jpg",
  189: "entry-189-collapsing-ceiling.jpg",
  190: "entry-190-discovered.jpg",
  191: "entry-191-entering-cave.jpg",
  192: "entry-192-bus-disappears.jpg",
  193: "entry-193-bear-attack.jpg",
  194: "entry-194-repairing-bus.jpg",
  195: "entry-195-abogast-battle.jpg",
  196: "entry-196-crushed-death.jpg",
  197: "entry-197-summoning-fire.jpg",
  198: "entry-198-commanding-fire.jpg",
  199: "entry-199-abogast-face.jpg",
  200: "entry-200-missed-meeting.jpg",
  201: "entry-201-bear-retreats.jpg",
  202: "entry-202-commanding-spell.jpg",
  203: "entry-203-hit-attacked.jpg",
  204: "entry-204-successful-escape-2.jpg",
  205: "entry-205-dungeon-dark.jpg",
  206: "entry-206-suspicious-look.jpg",
  207: "entry-207-escaping-window.jpg",
  208: "entry-208-forest-climbing.jpg",
  209: "entry-209-stars-alive.jpg",
  210: "entry-210-commanding-flames.jpg",
  211: "entry-211-avoiding-carriage.jpg",
  212: "entry-212-stairs-hesitation.jpg",
  213: "entry-213-successful-jump.jpg",
  214: "entry-214-abogast-anger.jpg",
  215: "entry-215-continue-night.jpg",
  216: "entry-216-discovered-carriage.jpg",
  217: "entry-217-burning-face.jpg",
  218: "entry-218-depositing-luggage.jpg",
  219: "entry-219-craftsmen-workshop.jpg",
  220: "entry-220-awakening-death.jpg",
  221: "entry-221-abogast-history.jpg",
  222: "entry-222-falling-tree.jpg",
  223: "entry-223-successful-escape.jpg",
  224: "entry-224-fire-dream-second.jpg",
  225: "entry-225-unlocking.jpg",
  226: "entry-226-doctor-backstory.jpg",
  227: "entry-227-abogast-abenaki.jpg",
  228: "entry-228-sleeping-tree.jpg",
  229: "entry-229-escape-pursuit.jpg",
  230: "entry-230-door-handle-turning.jpg",
  231: "entry-231-revenge-ending.jpg",
  232: "entry-232-breaking-door.jpg",
  233: "entry-233-heading-arkham.jpg",
  234: "entry-234-terrifying-howl.jpg",
  235: "entry-235-fighting-driver.jpg",
  236: "entry-236-abogast-dying.jpg",
  237: "entry-237-abogast-old-ones.jpg",
  238: "entry-238-discovered-leaving.jpg",
  239: "entry-239-reporter-backstory.jpg",
  240: "entry-240-listening-check.jpg",
  241: "entry-241-defeating-driver.jpg",
  242: "entry-242-showing-may-scene.jpg",
  243: "entry-243-self-liberation.jpg",
  244: "entry-244-discovering-bodies.jpg",
  245: "entry-245-abogast-villagers.jpg",
  246: "entry-246-tree-dream.jpg",
  247: "entry-247-brought-village.jpg",
  248: "entry-248-may-night-visit.jpg",
  249: "entry-249-detective-backstory.jpg",
  250: "entry-250-three-corpses.jpg",
  251: "entry-251-silas-departure.jpg",
  252: "entry-252-mysterious-descent.jpg",
  253: "entry-253-warning-leave.jpg",
  254: "entry-254-may-fireplace.jpg",
  255: "entry-255-stars-burned.jpg",
  256: "entry-256-craftsman-caught.jpg",
  257: "entry-257-silas-anger.jpg",
  258: "entry-258-falling-flames.jpg",
  259: "entry-259-cemetery-meeting.jpg",
  260: "entry-260-confronting-may.jpg",
  261: "entry-261-bus-accident.jpg",
  262: "entry-262-fighting-craftsman.jpg",
  263: "entry-263-arriving-ashhead-v2.jpg",
  264: "entry-264-forest-beasts.jpg",
  265: "entry-265-professor-backstory.jpg",
  266: "entry-266-hypnotic-smoke.jpg",
  267: "entry-267-leadbetter-house-v2.jpg",
  268: "entry-268-defeating-craftsman.jpg",
  269: "entry-269-beasts-spontaneously-ignite.jpg",
  270: "entry-270-final-ending.jpg",
};

function toNode(entry) {
  const directives = entry.directives || [];
  const actions = entry.jumps.map((jump, idx) => toAction(jump, entry.id, idx));
  const sceneImage = SCENE_IMAGES[entry.num] ? `assets/figures/${SCENE_IMAGES[entry.num]}` : null;
  // entry.image holds original-text illustrations (shown via lightbox trigger)
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

  const hasCombatScript = (ENTRY_SCRIPTS[entry.id] || []).some(e => e.type === "startCombat");

  // 这些节点可从多条路径到达，onEnterEffects 只应触发一次
  const ONCE_ONLY_NODES = new Set(["entry-13", "entry-16", "entry-58", "entry-65"]);

  const node = {
    id: entry.id,
    code: `条目 ${entry.num}`,
    title: `条目 ${entry.num}`,
    sceneMeta: "",
    text: entry.text,
    image: imageFile ? `assets/figures/${imageFile}` : null,
    sceneImage: sceneImage,
    directives,
    translatorNotes: entry.translatorNotes || [],
    actions,
    pushable,
    onceOnly: ONCE_ONLY_NODES.has(entry.id),
    // 有战斗脚本的节点由战斗系统接管，不渲染普通检定 UI
    checkHints: hasCombatScript ? [] : directivesToCheckHints(directives),
    // entry-144：二选一单次检定，选定后不能再用另一个技能重试
    checkMode: entry.id === "entry-144" ? "pick-one" : "normal",
    onEnterEffects: [
      ...directivesToEffects(directives, false, false),
      ...(ENTRY_SCRIPTS[entry.id] || []).filter(e => !e.checkGated && !e.checkSuccess)
    ],
    checkFailEffects: [
      ...directivesToEffects(directives, true, false),
      ...(ENTRY_SCRIPTS[entry.id] || []).filter(e => e.checkGated)
    ],
    checkSuccessEffects: [
      ...directivesToEffects(directives, false, true),
      ...(ENTRY_SCRIPTS[entry.id] || []).filter(e => e.checkSuccess)
    ],
    thresholdGate: THRESHOLD_GATES[entry.id] || null
  };
  if (entry.isEnding) {
    node.endingId = `ending-${entry.num}`;
  }
  return node;
}

function directivesToEffects(directives, checkGatedOnly, checkSuccessOnly) {
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
        if (checkSuccessOnly) break;
        const isFixed = /^\d+$/.test(d.amount);
        if (isFixed) {
          effects.push({ type: d.kind, value: Number(d.amount) * (d.sign || 1) });
        } else {
          effects.push({ type: d.kind, diceExpr: d.amount, sign: d.sign || -1 });
        }
        break;
      }
      case "tickSkill":
        if (hasCheck) {
          // 有检定的节点：tick 只在检定成功时触发
          if (!checkSuccessOnly) break;
        } else {
          // 无检定的节点：进入即 tick（已成功的叙述）
          if (checkSuccessOnly || checkGatedOnly) break;
        }
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
      const attrs = state.character.effectiveAttrs || state.character.rawAttrs || state.character.attributes || {};
      const dex = attrs.DEX ?? 0;
      const siz = attrs.SIZ ?? 0;
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
  "entry-67": [{ type: "setFlag", key: "majorWound", value: true }],
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
    // 急救检定成功→回复1点HP + tickSkill
    { type: "adjustHp", value: 1, checkSuccess: true },
    { type: "tickSkill", skill: "急救", checkSuccess: true }
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
  "entry-158": [{ type: "tickSkill", skill: "潜行", checkSuccess: true }],
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
  // entry-167: 熊双爪攻击（dual-claw 战斗）
  // entry-168: 纯叙事→entry-185，无脚本
  // entry-169: 纯叙事+选择，无脚本
  // entry-170: 纯叙事→entry-108，无脚本
  "entry-171": [
    { type: "adjustSan", value: -1, checkSuccess: true },
    // 理智检定失败额外扣1D4，成功只扣1点
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
  "entry-179": [{ type: "setFlag", key: "majorWound", value: true }],
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
    { type: "adjustHp", value: 1, checkSuccess: true }
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
  "entry-225": [{ type: "tickSkill", skill: "锁匠", checkSuccess: true }],

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
  "entry-167": [{ type: "startCombat", scriptId: "entry-167" }],
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
  const seenSkills = new Set();
  for (const d of directives) {
    switch (d.kind) {
      case "check-mention": {
        // 同一技能只保留第一次出现，避免解析器重复提取同一句话产生双重检定 UI
        if (seenSkills.has(d.skill)) break;
        seenSkills.add(d.skill);
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
