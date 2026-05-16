import { characterAdapter } from "./adapters/character-adapter.js";
import { diceAdapter, initDiceAdapter, mountDiceShortcuts } from "./adapters/dice-adapter.js";
import { module as aatfModule } from "./data/module.js";
import { COMBAT_SCRIPTS } from "./data/combat-scripts.js";
import { createInitialState, enterCurrentNode, getCurrentNode, jumpToNode, performAction, applyEffects } from "./engine/module-engine.js";
import { createCombatState, startCombat, submitPlayerChoice, submitRollResult, getAvailableActions } from "./engine/combat-engine.js";
import { renderApp, initPathBarToggle, initCharPanelToggle, initEchoToggle, updatePathBar, updateEchoLastText, updateCharCollapsed, renderChapterProgressBar } from "./ui/render.js";
import { renderCharacterPanel } from "./ui/character-panel.js";
import { renderCombatOverlay, openCombatOverlay, closeCombatOverlay } from "./ui/combat-overlay.js";
import { initGraphMap, openGraphMap, closeGraphMap } from "./ui/graph-map.js";

const contentAdapterStatus =
  "数据来自 wiki fulltext 解析,共 270 条目、12 张插图、422 跳转。检定结果由玩家自掷自判。";


const chapterGroups = aatfModule.chapters.map((ch) => ({
  id: ch.id,
  label: ch.label,
  description: ch.description,
  anchorNodeId: ch.anchorNodeId
}));

const SAVE_KEY = "aatf-game-state";

let selectedNodeId = "entry-1";
let seedCharacter = characterAdapter.loadPersistedCharacter() || characterAdapter.createSeedCharacter();
let state = createInitialState(aatfModule, seedCharacter);
let pendingCheck = null;
let lastCheckResolution = null;
let isPushedRoll = false;
let activeCombat = null;
let activeCombatScript = null;
initDiceAdapter();
diceAdapter.setRollCompleteListener(handleRollComplete);

if (!loadSavedState()) {
  enterCurrentNode(aatfModule, state);
}
bindCharacterControls();
bindDebugJump();
bindResetRun();
initPathBarToggle();
initCharPanelToggle();
initEchoToggle();
initGraphMap();
bindGraphMapToggle();
paint(true);

function bindGraphMapToggle() {
  const openBtn = document.getElementById('graphMapBtn');
  const closeBtn = document.getElementById('graphCloseBtn');
  const overlay = document.getElementById('graphOverlay');
  if (!openBtn || !closeBtn || !overlay) return;

  openBtn.addEventListener('click', () => {
    overlay.removeAttribute('hidden');
    openGraphMap(state);
  });

  closeBtn.addEventListener('click', () => {
    overlay.setAttribute('hidden', '');
    closeGraphMap();
  });
}

function bindDebugJump() {
  const input = document.getElementById("debugJumpInput");
  const button = document.getElementById("debugJumpButton");
  if (!input || !button) return;
  const go = () => {
    const num = parseInt(input.value, 10);
    if (!Number.isInteger(num) || num < 1 || num > 270) return;
    handleJump(`entry-${num}`);
  };
  button.addEventListener("click", go);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") go();
  });
}

function paint(skipTransition = false) {
  const stage = document.querySelector(".story-stage");
  if (stage && !skipTransition) {
    stage.classList.add("fading");
    setTimeout(() => {
      window.scrollTo(0, 0);
      _doPaint(false);
      requestAnimationFrame(() => stage.classList.remove("fading"));
    }, 150);
  } else {
    _doPaint(skipTransition);
  }
}

function _doPaint(skipTypewriter = false) {
  const currentNode = decorateNodeChecks(getCurrentNode(aatfModule, state));
  renderApp({
    moduleData: aatfModule,
    state,
    currentNode,
    adapterStatuses: {
      character: characterAdapter.status,
      dice: `${diceAdapter.status} ${diceAdapter.describeIntegration()}`,
      content: contentAdapterStatus
    },
    chapterGroups,
    currentCheckResolution: lastCheckResolution,
    pendingCombat: state.pendingCombat || null,
    skipTypewriter,
    onAction: handleAction,
    onReset: handleReset,
    onJump: handleJump,
    onBack: handleBack,
    onOpenDice: handleOpenDice,
    onRollCheck: handleRollCheck,
    onPushedRoll: handlePushedRoll,
    onStartCombat: openCombat,
    onMpSpend: handleMpSpend,
    onSpendLuck: handleSpendLuck
  });
  renderCharacterPanel(state.character, document.getElementById("characterPanel"), state.skillTicks, state.flags);
  mountDiceShortcuts(handleQuickRoll);
  renderChapterProgressBar(state, chapterGroups, aatfModule.nodes);

  // 更新路径条
  const visitedSet = new Set(state.history);
  visitedSet.add(state.currentNodeId);
  let chapter = chapterGroups[0];
  for (const ch of chapterGroups) {
    if (visitedSet.has(ch.anchorNodeId)) chapter = ch;
  }
  const actIndex = chapterGroups.indexOf(chapter) + 1;
  const actLabel = `第${"一二三四五六"[actIndex - 1] || actIndex}幕`;
  const nodeNum = (state.currentNodeId || "entry-1").replace("entry-", "");
  updatePathBar(actLabel, nodeNum, state.history.length);

  // 更新角色折叠态
  const ch = state.character;
  updateCharCollapsed({
    name: ch.name,
    occupation: ch.occupation,
    portrait: ch.portrait,
    hp: ch.stats?.hp?.current,
    maxHp: ch.stats?.hp?.max,
    san: ch.stats?.san?.current,
    maxSan: ch.stats?.san?.max,
    mp: ch.stats?.mp?.current,
    maxMp: ch.stats?.mp?.max,
    luck: ch.stats?.luck,
    maxLuck: ch.derived?.Luck_max ?? ch.stats?.luck
  });

  // 更新行动回声最后一条
  if (state.echoes && state.echoes.length) {
    updateEchoLastText(state.echoes[0].text);
  } else {
    updateEchoLastText("暂无记录");
  }

  saveState();
}

function handleAction(actionId) {
  const currentNode = decorateNodeChecks(getCurrentNode(aatfModule, state));
  const action = (currentNode.actions || []).find((item) => item.id === actionId);
  const resolutionSnapshot = lastCheckResolution;
  const beforeSnapshot = captureStateSnapshot(state);

  if (!canTakeAction(actionId)) {
    window.alert("请按本次检定结果前进。");
    return;
  }

  performAction(aatfModule, state, actionId);
  // 离开 entry-198 后清除施法临时状态
  if (state.currentNodeId !== "entry-198") {
    delete state.dynamicCheckTarget;
    delete state.spellMpSpent;
  }
  state.lastTransition = buildTransitionNotice(action, resolutionSnapshot, summarizeStateDelta(beforeSnapshot, state));
  pendingCheck = null;
  lastCheckResolution = null;
  paint();
}

function handleReset() {
  clearSavedState();
  selectedNodeId = aatfModule.startNodeId;
  resetState();
  paint();
}

function handleJump(nodeId) {
  selectedNodeId = nodeId;
  state.currentNodeId = nodeId;
  enterCurrentNode(aatfModule, state);
  pendingCheck = null;
  lastCheckResolution = null;
  paint();
}

function handleBack() {
  if (state.history.length <= 1) return;

  const previousId = state.history[state.history.length - 2];
  resetState();
  jumpToNode(aatfModule, state, previousId);
  paint();
}

function handleOpenDice() {
  diceAdapter.openPanel();
}

function handleQuickRoll(notation) {
  diceAdapter.quickRoll(notation);
}

function handleRollCheck(check, pushed = false) {
  const resolvedCheck = characterAdapter.resolveCheck(check, state.character);
  pendingCheck = resolvedCheck;
  lastCheckResolution = null;
  isPushedRoll = pushed;
  const targetText = resolvedCheck?.target ? ` 对抗 ${resolvedCheck.target}` : "";
  const modeLabel = getCheckModeLabel(resolvedCheck?.mode || "regular");
  const pushLabel = pushed ? "【孤注一掷】" : "";
  const label = resolvedCheck?.label ? `${pushLabel}${resolvedCheck.label}${targetText} · ${modeLabel} · ` : "";
  state.echoes.unshift({
    text: `${label}准备检定 ${formatCheckNotation(resolvedCheck)}`,
    tone: "neutral",
    nodeId: state.currentNodeId,
    at: Date.now()
  });
  state.echoes = state.echoes.slice(0, 8);
  diceAdapter.quickRoll({
    notation: getRollNotationForCheck(resolvedCheck),
    meta: {
      percentile: usesPercentileDice(resolvedCheck),
      mode: resolvedCheck.mode || "regular"
    }
  });
  paint(true);
}

function handlePushedRoll(check) {
  handleRollCheck(check, true);
}

function handleSpendLuck(luckCost) {
  const luck = state.character.stats.luck;
  if (luck < luckCost) return;

  state.character.stats.luck = luck - luckCost;
  state.character.derived.Luck = state.character.stats.luck;

  // 把当前检定结果改为成功
  lastCheckResolution = {
    ...lastCheckResolution,
    success: true,
    rank: "regular",
    outcomeLabel: "成功（幸运）",
    luckSpent: luckCost
  };

  state.echoes.unshift({
    text: `花费 ${luckCost} 点幸运，检定视为成功`,
    tone: "positive",
    nodeId: state.currentNodeId,
    at: Date.now()
  });
  state.echoes = state.echoes.slice(0, 8);
  paint(true);
}

function handleMpSpend(amount) {
  const mp = state.character.stats?.mp?.current ?? 0;
  const hp = state.character.stats?.hp?.current ?? 1;
  const mpSpend = Math.min(amount, mp);
  const hpSpend = amount - mpSpend;

  state.character.stats.mp.current = mp - mpSpend;
  state.character.derived.MP = state.character.stats.mp.current;
  if (hpSpend > 0) {
    state.character.stats.hp.current = Math.max(1, hp - hpSpend);
    state.character.derived.HP = state.character.stats.hp.current;
  }

  state.spellMpSpent = amount;
  state.flags.awaitingMpInput = false;
  delete state.flags.mpInputMax;

  state.echoes.unshift({
    text: `施法：消耗 ${amount} 点（MP ${mpSpend}${hpSpend > 0 ? ` + HP ${hpSpend}` : ""}），成功率 ${amount * 10}%`,
    tone: "neutral",
    nodeId: state.currentNodeId,
    at: Date.now()
  });
  state.echoes = state.echoes.slice(0, 8);

  // 跳转到 entry-198
  handleJump("entry-198");
}

function handleRollComplete(summary) {
  if (!pendingCheck || !summary) return;

  const resolution = evaluateCheckResult(pendingCheck, summary);
  resolution.isPushed = isPushedRoll;
  lastCheckResolution = resolution;
  pendingCheck = null;
  isPushedRoll = false;

  state.echoes.unshift({
    text: `${resolution.label}: ${resolution.roll} / ${resolution.target} -> ${resolution.outcomeLabel}`,
    tone: resolution.success ? "positive" : "negative",
    nodeId: state.currentNodeId,
    at: Date.now()
  });
  state.echoes = state.echoes.slice(0, 8);

  if (resolution.success) {
    const currentNode = getCurrentNode(aatfModule, state);
    if (currentNode.checkSuccessEffects?.length) {
      applyEffects(state, currentNode.checkSuccessEffects);
    }
  }
  if (!resolution.success) {
    const currentNode = getCurrentNode(aatfModule, state);
    if (currentNode.checkFailEffects?.length) {
      applyEffects(state, currentNode.checkFailEffects);
    }
  }
  paint(true);
}

// ─── 战斗系统集成 ───

function openCombat(scriptId) {
  const script = COMBAT_SCRIPTS[scriptId];
  if (!script) return;

  activeCombatScript = script;
  activeCombat = createCombatState(script, state.character, state.inventory);
  diceAdapter.setRollCompleteListener(handleCombatRollComplete);
  paintCombat();
  openCombatOverlay();
}

function paintCombat() {
  if (!activeCombat || !activeCombatScript) return;
  renderCombatOverlay(activeCombat, activeCombatScript, {
    onStart: handleCombatStart,
    onChoice: handleCombatChoice,
    onRoll: handleCombatRoll,
    onNextRound: handleCombatNextRound,
    onEnd: handleCombatEnd,
    onWeaponSelect: handleCombatWeaponSelect
  });
}

function handleCombatStart() {
  if (!activeCombat || !activeCombatScript) return;
  const result = startCombat(activeCombat, activeCombatScript);
  activeCombat = result.state;
  paintCombat();
}

function handleCombatChoice(choice) {
  if (!activeCombat || !activeCombatScript) return;
  const result = submitPlayerChoice(activeCombat, activeCombatScript, choice);
  activeCombat = result.state;
  paintCombat();
}

function handleCombatRoll(diceRequest) {
  let notation = diceRequest.notation;
  if (diceRequest.meta?.percentile) {
    notation = ["1d10", "1d10"];
  }
  diceAdapter.quickRoll({
    notation,
    meta: diceRequest.meta || { percentile: false }
  });
}

function handleCombatRollComplete(summary) {
  if (!activeCombat || !activeCombat.pendingRoll) return;

  let rollValue;
  if (activeCombat.pendingRoll.meta?.percentile) {
    rollValue = summary.percentileChosen ?? summary.total ?? 50;
  } else {
    rollValue = summary.total ?? 0;
  }

  const result = submitRollResult(activeCombat, activeCombatScript, rollValue);
  activeCombat = result.state;
  paintCombat();
}

function handleCombatNextRound() {
  if (!activeCombat || !activeCombatScript) return;
  activeCombat.phase = "exchangeResolved";
  const result = startCombat(activeCombat, activeCombatScript);
  activeCombat = result.state;
  paintCombat();
}

function handleCombatEnd(outcome) {
  closeCombatOverlay();
  diceAdapter.setRollCompleteListener(handleRollComplete);

  state.character.stats.hp.current = activeCombat.playerCurrentHp ?? state.character.stats.hp.current;
  state.character.derived.HP_current = state.character.stats.hp.current;
  state.pendingCombat = null;

  activeCombat = null;
  activeCombatScript = null;

  jumpToNode(aatfModule, state, outcome.next);
  pendingCheck = null;
  lastCheckResolution = null;
  paint();
}

function handleCombatWeaponSelect(weapon) {
  if (activeCombat) {
    activeCombat.playerWeapon = weapon;
  }
}

function bindCharacterControls() {
  const importButton = document.getElementById("importCharacterButton");
  const clearButton = document.getElementById("clearCharacterButton");
  const fileInput = document.getElementById("characterFileInput");

  importButton.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", handleCharacterImport);
  clearButton.addEventListener("click", handleCharacterClear);
}

async function handleCharacterImport(event) {
  const [file] = event.target.files || [];
  if (!file) return;

  try {
    seedCharacter = await characterAdapter.importFromFile(file);
    clearSavedState();
    resetState();
    if (selectedNodeId !== aatfModule.startNodeId) {
      jumpToNode(aatfModule, state, selectedNodeId);
    }
    paint();
  } catch (error) {
    console.error("角色导入失败", error);
    window.alert(`角色导入失败：${error.message}`);
  } finally {
    event.target.value = "";
  }
}

function handleCharacterClear() {
  seedCharacter = characterAdapter.createSeedCharacter();
  characterAdapter.clearPersistedCharacter();
  clearSavedState();
  resetState();
  if (selectedNodeId !== aatfModule.startNodeId) {
    jumpToNode(aatfModule, state, selectedNodeId);
  }
  paint();
}

function resetState() {
  state = createInitialState(aatfModule, seedCharacter);
  pendingCheck = null;
  lastCheckResolution = null;
  enterCurrentNode(aatfModule, state);
}

function saveState() {
  const snapshot = {
    currentNodeId: state.currentNodeId,
    character: state.character,
    inventory: state.inventory,
    flags: state.flags,
    history: state.history,
    visitedNodes: [...(state.visitedNodes || [])],
    unlockedEndings: state.unlockedEndings,
    skillTicks: state.skillTicks || [],
    thresholdResult: state.thresholdResult || null,
    conditionBranchResult: state.conditionBranchResult || null,
    pendingCombat: state.pendingCombat || null,
    dead: state.dead || false,
    deathNodeId: state.deathNodeId || null,
    selectedNodeId
  };
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(snapshot));
  } catch (e) {
    // localStorage full or unavailable — silently skip
  }
}

function loadSavedState() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    const snapshot = JSON.parse(raw);
    if (!snapshot.currentNodeId || !aatfModule.nodes[snapshot.currentNodeId]) return false;
    state.currentNodeId = snapshot.currentNodeId;
    state.character = snapshot.character;
    state.inventory = snapshot.inventory || [];
    state.flags = snapshot.flags || {};
    state.history = snapshot.history || [];
    state.visitedNodes = new Set(snapshot.visitedNodes || []);
    state.unlockedEndings = snapshot.unlockedEndings || [];
    state.skillTicks = snapshot.skillTicks || [];
    state.thresholdResult = snapshot.thresholdResult || null;
    state.conditionBranchResult = snapshot.conditionBranchResult || null;
    state.pendingCombat = snapshot.pendingCombat || null;
    state.dead = snapshot.dead || false;
    state.deathNodeId = snapshot.deathNodeId || null;
    selectedNodeId = snapshot.selectedNodeId || snapshot.currentNodeId;
    return true;
  } catch (e) {
    return false;
  }
}

function clearSavedState() {
  localStorage.removeItem(SAVE_KEY);
}

function bindResetRun() {
  // handled via onReset in renderApp
}

function decorateNodeChecks(node) {
  const resolveWithMode = (check) => {
    const resolved = characterAdapter.resolveCheck(check, state.character);
    let baseMode = resolved.mode || "regular";
    // penaltyDay flag：当天所有技能检定附加惩罚骰（不影响幸运、理智、伤害检定）
    if (state.flags.penaltyDay && baseMode === "regular") {
      const isExempt = check.type === "derived" && (check.key === "luck" || check.key === "san");
      if (!isExempt) baseMode = "penalty";
    }
    const withMode = {
      ...resolved,
      mode: baseMode
    };
    if (check.difficulty === "hard" && withMode.half) {
      withMode.target = withMode.half;
    } else if (check.difficulty === "extreme" && withMode.fifth) {
      withMode.target = withMode.fifth;
    }
    // entry-198：施法检定目标值由玩家消耗MP点数动态决定
    if (state.dynamicCheckTarget != null) {
      withMode.target = state.dynamicCheckTarget;
      withMode.half = Math.floor(state.dynamicCheckTarget / 2);
      withMode.fifth = Math.floor(state.dynamicCheckTarget / 5);
    }
    return withMode;
  };

  const baseCheckHints = node.checkHints || [];

  // entry-198：施法检定，checkHint 由消耗MP点数动态生成
  const dynamicCheckHints = (node.id === "entry-198" && state.dynamicCheckTarget != null)
    ? [{
        type: "skill",
        skill: "号令天之火",
        label: "号令天之火",
        description: `消耗 ${state.spellMpSpent ?? 0} 点，成功率 ${state.dynamicCheckTarget}%（96-100必然失败）`,
        difficulty: "regular",
        mode: "regular",
        target: state.dynamicCheckTarget,
        half: Math.floor(state.dynamicCheckTarget / 2),
        fifth: Math.floor(state.dynamicCheckTarget / 5)
      }]
    : baseCheckHints.map((check) => resolveWithMode(check));

  // entry-198：给 actions 补上检定门控（parser 因无 check-mention 而清空了 check）
  const decoratedActions = (node.actions || []).map((action) => {
    if (node.id === "entry-198" && state.dynamicCheckTarget != null) {
      const outcome = /成功/.test(action.label) ? "success" : "failure";
      return { ...action, check: { outcome } };
    }
    return { ...action, check: action.check ? resolveWithMode(action.check) : null };
  });

  return {
    ...node,
    text: appendContextualSceneText(node, state),
    checkHints: dynamicCheckHints,
    actions: decoratedActions
  };
}

function appendContextualSceneText(node, currentState) {
  const notes = getContextualNotes(node.id, currentState.flags);
  if (!notes.length) return node.text;
  return `${node.text}\n\n${notes.join("\n\n")}`;
}

function getContextualNotes(nodeId, flags) {
  const notes = [];

  if (nodeId === "entry-154") {
    if (flags.heardRuthNightWarning) {
      notes.push("露丝昨晚那句“不要看上面，也别站在火中间”还在你耳边，像一句根本不属于孩童的规劝。");
    }
    if (flags.sawNightLanterns || flags.shadowedNightProcession) {
      notes.push("你没法把昨夜那些在屋舍间缓慢汇聚的火光当作普通夜行，它们让这个清晨也带着一点尚未散去的余烬味。");
    }
    if (flags.feltStarPressure) {
      notes.push("哪怕窗外只是灰白晨光，你还是会想起昨夜那种仿佛整片天空正向村庄压下来的感觉。");
    }
  }

  if (nodeId === "entry-160") {
    if (flags.heardRuthNightWarning) {
      notes.push("露丝昨夜压低声音说出的那些话，让你现在很难把她的沉默当成普通的小孩子闹别扭。");
    }
    if (flags.shadowedNightProcession || flags.sawNightLanterns) {
      notes.push("你昨夜已经见过火光在村中汇聚，因此这顿早餐的客气更像一种被迫维持的白天表象。");
    }
  }

  if (nodeId === "entry-3" || nodeId === "entry-22") {
    if (flags.heardRuthNightWarning) {
      notes.push("如今再看露丝和梅站在白天光线里，你很难假装昨夜那场压低声音的警告从未发生过。");
    }
    if (flags.feltStarPressure || flags.noticedStrangeOrientation || flags.foundAlignmentNote) {
      notes.push("你开始不自觉地把村中的道路、屋脊和那座黑色建筑联系在一起，仿佛这一切并不是随便摆在这里的。");
    }
    if (flags.visitedRuinedChurch && flags.visitedBlackStructure) {
      notes.push("教堂被掏空后的黑痕，与黑色金属建筑那种刻意到近乎冰冷的朝向，已经在你脑中并列成了一组问题。");
    }
    if (flags.heardStorekeeperFestivalTone) {
      notes.push("连杂货店主人谈起今晚时都过于平常，仿佛节夜对村里人来说不是异常，而是秩序本身。");
    }
  }

  if (nodeId === "entry-6") {
    if (flags.visitedBlackStructure) {
      notes.push("你现在已经知道，东北角那座黑色建筑不是远望时的错觉；靠近它之后，那种不协调感只会变得更强。");
    }
    if (flags.visitedRuinedChurch) {
      notes.push("你也知道西南角那座教堂的问题不只是坍圮，它更像是被谁把原本该在里面的意义抽走了。");
    }
  }

  if (nodeId === "entry-11" || nodeId === "entry-43") {
    if (flags.visitedBlackStructure || flags.foundAlignmentNote) {
      notes.push("想到那座黑色建筑的朝向和你在纸页里见过的“校准”字样，你对文特斯的每一句从容解释都多留了几分心。");
    }
    if (flags.decodedMetalSymbols) {
      notes.push("你已经不只觉得那座黑色建筑可疑，而是几乎确定它本身就是整套仪式布局中的一个节点。");
    }
  }

  if (nodeId === "entry-61" || nodeId === "entry-64") {
    if (flags.decodedMetalSymbols || flags.foundAlignmentNote) {
      notes.push("你不是在凭空怀疑。无论是浮雕里的关系，还是纸页上的“校准”，都让文特斯现在的平静解释显得更像遮掩。");
    }
  }

  if (nodeId === "entry-180") {
    if (flags.foundAlignmentNote) {
      notes.push("校准备忘里的草图和那句“让村子对准”的话，让今晚的一切都像是在往某个预定时刻靠拢。");
    }
    if (flags.heardAboutFestival) {
      notes.push("梅早先提过的火把游行与灯塔，如今不再像民俗趣闻，反而像一场你已经越来越靠近的安排。");
    }
  }

  if (nodeId === "entry-190" || nodeId === "entry-203") {
    if (flags.foundAlignmentNote) {
      notes.push("图书室里那张写着“让村子对准”的纸，此刻像是终于找到了它真正指向的夜晚。");
    }
    if (flags.linkedVillageToOldRitualHill) {
      notes.push("你已经看出旧祭场与如今村庄围着的是同一段山头，所以眼前这场集结更像延续，而不是新发明。");
    }
    if (flags.foundFestivalMarginNotes) {
      notes.push("手稿边角那几个词也在你脑中浮起来了：火、灯塔、站位、不可抬头。它们和眼前的画面贴得可怕。");
    }
    if (flags.understoodSpecificNightSky) {
      notes.push("你知道这并不是随便哪一晚都行，村民等的也许正是今晚这片恰好摆成某种样子的夜空。");
    }
    if (flags.visitedBlackStructure || flags.noticedStrangeOrientation) {
      notes.push("你想起那座黑色建筑不合常理的朝向，如今村民、火光与灯塔的位置也开始显得像同一个布局的不同边。");
    }
    if (flags.decodedMetalSymbols) {
      notes.push("你已经从浮雕里读出过火、群体与朝向的关系，因此眼前这一切不像意外聚集，而像一次早被设计好的重演。");
    }
    if (flags.recognizedChurchStripping) {
      notes.push("教堂被系统清空过的事实也在你脑中作响，仿佛村里旧的信仰早就给今晚这一套东西让过路。");
    }
    if (flags.fictionEchoedRitual) {
      notes.push("连那篇俗艳怪谈里都提到过“站位”和让天上路径敞开的火祭，如今你很难再把它只当作荒唐巧合。");
    }
    if (flags.heardRuthNightWarning) {
      notes.push("露丝那句“不要看上面，也别站在火中间”现在不再像谜语，而像她能给你的最直接的求生说明。");
    }
  }

  if (nodeId === "entry-186" || nodeId === "entry-188" || nodeId === "entry-189") {
    if (flags.decodedMetalSymbols || flags.heardWintersAlignmentSlip) {
      notes.push("你早已知道这座建筑不只是村中摆设，所以现在连它的沉默都像是在参与今晚的准备。");
    }
    if (flags.foundAlignmentNote) {
      notes.push("“让村子对准”的那句话让你很难把眼前的震动和低响当成无意义的夜间杂音。");
    }
  }

  if (nodeId === "entry-205") {
    if (flags.charmedMay || flags.readMorningTension) {
      notes.push("你知道梅并不是全然无动于衷。无论是昨夜的长谈，还是今晨早餐桌上的颤抖，都说明她心里并不平静。");
    }
  }

  if (nodeId === "entry-240") {
    if (flags.ruthShowedEscapePath) {
      notes.push("若没有露丝最后那一下几乎看不见的手势，你很可能根本不会注意到那条沿悬崖下去的旧路。");
    }
    if (flags.foundAlignmentNote) {
      notes.push("你把那张校准备忘也一起带离了山上；它证明烬头村的疯狂并非一时兴起，而是被人认真记录和维护过的东西。");
    }
  }

  return notes;
}

function buildTransitionNotice(action, resolution, deltaSummary) {
  if (!action) return null;
  const prefix = resolution ? `${formatResolutionLead(resolution)}：` : "";
  const suffix = deltaSummary ? ` ${deltaSummary}` : "";

  if (action.transitionSummary) {
    return {
      text: `${prefix}${action.transitionSummary}${suffix}`,
      tone: action.check?.outcome === "failure" ? "negative" : "positive"
    };
  }

  if (action.description) {
    return {
      text: `${prefix}${action.description}${suffix}`,
      tone: resolution ? (resolution.success ? "positive" : "negative") : "neutral"
    };
  }

  return null;
}

function formatResolutionLead(resolution) {
  const source = resolution.sourceLabel || resolution.label || "检定";
  return `${source}${resolution.outcomeLabel}`;
}

function captureStateSnapshot(currentState) {
  return {
    hp: currentState.character.stats.hp.current,
    san: currentState.character.stats.san.current,
    mp: currentState.character.stats.mp.current,
    luck: currentState.character.stats.luck,
    inventory: [...currentState.inventory]
  };
}

function summarizeStateDelta(before, afterState) {
  const changes = [];
  pushDelta(changes, "HP", afterState.character.stats.hp.current - before.hp);
  pushDelta(changes, "SAN", afterState.character.stats.san.current - before.san);
  pushDelta(changes, "MP", afterState.character.stats.mp.current - before.mp);
  pushDelta(changes, "Luck", afterState.character.stats.luck - before.luck);

  const gainedItems = afterState.inventory.filter((item) => !before.inventory.includes(item));
  const lostItems = before.inventory.filter((item) => !afterState.inventory.includes(item));

  if (gainedItems.length) {
    changes.push(`获得 ${gainedItems.join("、")}`);
  }
  if (lostItems.length) {
    changes.push(`失去 ${lostItems.join("、")}`);
  }

  if (!changes.length) return "";
  return `(${changes.join("，")})`;
}

function pushDelta(target, label, delta) {
  if (!delta) return;
  target.push(`${label} ${delta > 0 ? `+${delta}` : delta}`);
}

function canTakeAction(actionId) {
  const node = decorateNodeChecks(getCurrentNode(aatfModule, state));
  const actions = node.actions || [];
  const actionIndex = actions.findIndex((item) => item.id === actionId);
  const action = actions[actionIndex];
  if (!action) return false;

  if (state.thresholdResult) {
    return actionIndex === state.thresholdResult.visibleActionIndex;
  }

  if (!action.check || action.check.outcome == null) return true;
  if (!lastCheckResolution) return false;
  if (action.check.outcome === "success") return lastCheckResolution.success;
  if (action.check.outcome === "failure") {
    if (lastCheckResolution.isPushed) return false;
    if (lastCheckResolution.rank === "fumble") {
      const hasFumblePath = actions.some(a => a.check?.outcome === "fumble");
      if (hasFumblePath) return false;
    }
    return !lastCheckResolution.success;
  }
  if (action.check.outcome === "pushed_failure") {
    return lastCheckResolution.isPushed && !lastCheckResolution.success;
  }
  if (action.check.outcome === "fumble") return lastCheckResolution.rank === "fumble";
  if (action.check.outcome === "non_fumble") return lastCheckResolution.rank !== "fumble";
  return true;
}

function evaluateCheckResult(check, summary) {
  const candidates = getCheckRollCandidates(check, summary);
  const roll = resolveChosenRoll(check.mode, candidates);
  const target = Number(check.target || 0);
  const critical = roll === 1;
  const fumble = isFumble(roll, target);
  const success = critical || (!fumble && roll <= target);
  let rank = success ? "regular" : "failure";
  if (critical) rank = "critical";
  else if (success && roll <= (check.fifth ?? 0)) rank = "extreme";
  else if (success && roll <= (check.half ?? 0)) rank = "hard";
  else if (fumble) rank = "fumble";

  return {
    label: check.label || check.sourceLabel || "检定",
    roll,
    candidates,
    target,
    success,
    rank,
    outcomeLabel: getOutcomeLabel(rank, success),
    sourceLabel: check.sourceLabel || "",
    half: check.half ?? 0,
    fifth: check.fifth ?? 0,
    mode: check.mode || "regular"
  };
}

function getOutcomeLabel(rank, success) {
  if (rank === "critical") return "大成功";
  if (rank === "extreme") return "极难成功";
  if (rank === "hard") return "困难成功";
  if (rank === "fumble") return "大失败";
  return success ? "成功" : "失败";
}

function isFumble(roll, target) {
  if (roll === 100) return true;
  if (target < 50 && roll >= 96) return true;
  return false;
}

function getCheckRollCandidates(check, summary) {
  if (Array.isArray(summary.percentileCandidates) && summary.percentileCandidates.length) {
    return summary.percentileCandidates;
  }

  if (usesPercentileDice(check)) {
    return buildPercentileCandidates(check, summary);
  }

  if (Array.isArray(summary.flatRolls) && summary.flatRolls.length) {
    return summary.flatRolls.map((value) => Number(value)).filter((value) => Number.isFinite(value));
  }
  return [Number(summary.total || 0)];
}

function resolveChosenRoll(mode, candidates) {
  if (!candidates.length) return 0;
  if (mode === "bonus") return Math.min(...candidates);
  if (mode === "penalty") return Math.max(...candidates);
  return candidates[0];
}

function getRollNotationForCheck(check) {
  if (usesPercentileDice(check)) {
    if ((check.mode || "regular") === "bonus" || (check.mode || "regular") === "penalty") {
      return ["1d10", "1d10", "1d10"];
    }
    return ["1d10", "1d10"];
  }
  return check.notation || "1d100";
}

function formatCheckNotation(check) {
  const notation = getRollNotationForCheck(check);
  if (usesPercentileDice(check)) {
    return Array.isArray(notation) && notation.length === 3 ? "百分骰（奖励/惩罚）" : "百分骰";
  }
  return Array.isArray(notation) ? notation.join(" + ") : notation;
}

function getCheckModeLabel(mode) {
  if (mode === "bonus") return "奖励骰";
  if (mode === "penalty") return "惩罚骰";
  return "常规";
}

function usesPercentileDice(check) {
  return (check?.notation || "1d100") === "1d100";
}

function buildPercentileCandidates(check, summary) {
  const d10Rolls = extractD10Rolls(summary);
  if (!d10Rolls.length) {
    return [Number(summary.total || 0)];
  }

  const ones = d10Rolls[0];
  const tensPool = d10Rolls.slice(1);

  if (!tensPool.length) {
    return [composePercentileValue(0, ones)];
  }

  if ((check.mode || "regular") === "bonus" || (check.mode || "regular") === "penalty") {
    return tensPool.map((tens) => composePercentileValue(tens, ones));
  }

  return [composePercentileValue(tensPool[0], ones)];
}

function extractD10Rolls(summary) {
  if (!Array.isArray(summary.rawResults)) return [];
  return summary.rawResults
    .filter((die) => Number(die.sides || die.side || 0) === 10)
    .flatMap((die) =>
      Array.isArray(die.rolls)
        ? die.rolls.map((roll) => normalizeD10Value(typeof roll === "object" ? roll.value || 0 : roll || 0))
        : [normalizeD10Value(die.value || 0)]
    );
}

function normalizeD10Value(value) {
  const numeric = Number(value) || 0;
  return numeric === 10 ? 0 : numeric;
}

function composePercentileValue(tens, ones) {
  if (tens === 0 && ones === 0) return 100;
  return tens * 10 + ones;
}
