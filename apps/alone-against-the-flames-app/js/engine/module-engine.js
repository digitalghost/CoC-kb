function cloneCharacter(seedCharacter) {
  return JSON.parse(JSON.stringify(seedCharacter));
}

export function createInitialState(moduleData, seedCharacter) {
  return {
    moduleId: moduleData.id,
    currentNodeId: moduleData.startNodeId,
    character: cloneCharacter(seedCharacter),
    inventory: [...(seedCharacter.inventory || [])],
    flags: {},
    history: [],
    visitedNodes: new Set(),
    echoes: [],
    unlockedEndings: [],
    skillTicks: [],
    lastTransition: null
  };
}

export function getCurrentNode(moduleData, state) {
  return moduleData.nodes[state.currentNodeId];
}

export function enterCurrentNode(moduleData, state) {
  const node = getCurrentNode(moduleData, state);
  if (!node) {
    throw new Error(`Unknown node: ${state.currentNodeId}`);
  }

  state.history.push(node.id);
  state.conditionBranchResult = null;

  // onceOnly 节点：重复进入时跳过 onEnterEffects，避免重复触发属性/物品变化
  const alreadyVisited = state.visitedNodes.has(node.id);
  if (!alreadyVisited) {
    state.visitedNodes.add(node.id);
  }
  const effectsToApply = (node.onceOnly && alreadyVisited) ? [] : (node.onEnterEffects || []);
  state.lastAppliedEffects = applyEffects(state, effectsToApply);

  state.thresholdResult = evaluateThresholdGate(node, state);
  if (node.endingId && !state.unlockedEndings.includes(node.endingId)) {
    state.unlockedEndings.push(node.endingId);
  }
  return node;
}

export function performAction(moduleData, state, actionId) {
  const node = getCurrentNode(moduleData, state);
  const action = (node.actions || []).find((item) => item.id === actionId);
  if (!action) {
    throw new Error(`Unknown action: ${actionId}`);
  }

  applyEffects(state, action.effects || []);
  state.currentNodeId = action.next;
  return enterCurrentNode(moduleData, state);
}

export function jumpToNode(moduleData, state, nodeId) {
  if (!moduleData.nodes[nodeId]) {
    throw new Error(`Unknown node: ${nodeId}`);
  }

  state.currentNodeId = nodeId;
  return enterCurrentNode(moduleData, state);
}

export function applyEffects(state, effects) {
  const applied = [];
  for (const effect of effects) {
    switch (effect.type) {
      case "setFlag":
        state.flags[effect.key] = effect.value;
        break;
      case "adjustLuck": {
        const value = resolveEffectValue(effect);
        state.character.stats.luck = clampValue(state.character.stats.luck + value, 0, 99);
        state.character.luck = state.character.stats.luck;
        applied.push({ type: "adjustLuck", value, label: `幸运 ${formatDelta(value)}` });
        pushEcho(state, `Luck ${formatDelta(value)}`, value < 0 ? "negative" : "positive");
        break;
      }
      case "adjustHp": {
        const value = resolveEffectValue(effect);
        state.character.stats.hp.current = clampValue(
          state.character.stats.hp.current + value,
          0,
          state.character.stats.hp.max
        );
        state.character.derived.HP_current = state.character.stats.hp.current;
        applied.push({ type: "adjustHp", value, label: `耐久 ${formatDelta(value)}` });
        pushEcho(state, `HP ${formatDelta(value)}`, value < 0 ? "negative" : "positive");
        if (state.character.stats.hp.current <= 0) {
          state.dead = true;
          state.deathNodeId = state.currentNodeId;
        }
        break;
      }
      case "adjustSan": {
        const value = resolveEffectValue(effect);
        state.character.stats.san.current = clampValue(
          state.character.stats.san.current + value,
          0,
          state.character.stats.san.max
        );
        state.character.derived.SAN = state.character.stats.san.current;
        applied.push({ type: "adjustSan", value, label: `理智 ${formatDelta(value)}` });
        pushEcho(state, `SAN ${formatDelta(value)}`, value < 0 ? "negative" : "positive");
        break;
      }
      case "adjustMp": {
        const value = resolveEffectValue(effect);
        state.character.stats.mp.current = clampValue(
          state.character.stats.mp.current + value,
          0,
          state.character.stats.mp.max
        );
        state.character.derived.MP_current = state.character.stats.mp.current;
        applied.push({ type: "adjustMp", value, label: `魔法 ${formatDelta(value)}` });
        pushEcho(state, `MP ${formatDelta(value)}`, value < 0 ? "negative" : "positive");
        break;
      }
      case "tickSkill":
        if (!state.skillTicks) state.skillTicks = [];
        if (!state.skillTicks.includes(effect.skill)) {
          state.skillTicks.push(effect.skill);
          applied.push({ type: "tickSkill", label: `${effect.skill} ✓` });
        }
        pushEcho(state, `技能成长：${effect.skill}`, "positive");
        break;
      case "adjustSkill": {
        if (!state.character.skillPoints) state.character.skillPoints = {};
        if (!state.character.skillPoints[effect.skill]) {
          state.character.skillPoints[effect.skill] = { occ: 0, int: 0, adj: 0 };
        }
        state.character.skillPoints[effect.skill].adj =
          (state.character.skillPoints[effect.skill].adj || 0) + effect.value;
        applied.push({ type: "adjustSkill", label: `${effect.skill} +${effect.value}` });
        pushEcho(state, `${effect.skill} 永久+${effect.value}`, "positive");
        break;
      }
      case "gainItem":
        state.inventory.push(effect.item);
        state.character.inventory = [...state.inventory];
        applied.push({ type: "gainItem", label: `获得 ${effect.item}` });
        pushEcho(state, `获得物品：${effect.item}`, "positive");
        break;
      case "loseItem":
        state.inventory = state.inventory.filter((item) => item !== effect.item);
        state.character.inventory = [...state.inventory];
        applied.push({ type: "loseItem", label: `失去 ${effect.item}` });
        pushEcho(state, `失去物品：${effect.item}`, "negative");
        break;
      case "logEntry":
        pushEcho(state, effect.text, "neutral");
        break;
      case "startCombat":
        state.pendingCombat = effect.scriptId;
        applied.push({ type: "startCombat", label: "进入战斗" });
        pushEcho(state, "进入战斗", "negative");
        break;
      case "conditionBranch": {
        const statVal = resolveStatValue(state, effect.stat);
        const condMet = evaluateCondition(statVal, effect.operator, effect.value);
        state.conditionBranchResult = {
          met: condMet,
          targetIfTrue: effect.targetIfTrue,
          targetIfFalse: effect.targetIfFalse,
          labelIfTrue: effect.labelIfTrue,
          labelIfFalse: effect.labelIfFalse,
        };
        // conditionBranch 是内部路由，不向玩家显示 pill
        break;
      }
      case "custom": {
        if (typeof effect.fn === "function") {
          effect.fn(state, applyEffects);
        }
        break;
      }
      default:
        pushEcho(state, `未实现 effect: ${effect.type}`, "neutral");
        break;
    }
  }
  return applied;
}

function resolveEffectValue(effect) {
  if (effect.diceExpr) {
    return rollDiceExpr(effect.diceExpr) * (effect.sign ?? 1);
  }
  return effect.value;
}

function resolveStatValue(state, statKey) {
  const ch = state.character;
  // 属性：STR/CON/SIZ/DEX/APP/INT/POW/EDU
  if (ch.attributes && ch.attributes[statKey] !== undefined) return ch.attributes[statKey];
  if (ch.effectiveAttrs && ch.effectiveAttrs[statKey] !== undefined) return ch.effectiveAttrs[statKey];
  if (ch.rawAttrs && ch.rawAttrs[statKey] !== undefined) return ch.rawAttrs[statKey];
  // 兼容 stats 结构
  if (ch.stats) {
    if (statKey === "HP") return ch.stats.hp?.current ?? 0;
    if (statKey === "SAN") return ch.stats.san?.current ?? 0;
    if (statKey === "MP") return ch.stats.mp?.current ?? 0;
    if (statKey === "LUCK") return ch.stats.luck ?? 0;
  }
  // derived
  if (ch.derived && ch.derived[statKey] !== undefined) return ch.derived[statKey];
  return 0;
}

function evaluateCondition(val, operator, threshold) {
  switch (operator) {
    case "==": return val === threshold;
    case "!=": return val !== threshold;
    case "<=": return val <= threshold;
    case ">=": return val >= threshold;
    case "<":  return val < threshold;
    case ">":  return val > threshold;
    default:   return false;
  }
}

function rollDiceExpr(expr) {
  const match = expr.match(/^(\d+)[Dd](\d+)([+-]\d+)?$/);
  if (!match) return 0;
  const [, count, sides, mod] = match;
  let total = 0;
  for (let i = 0; i < Number(count); i++) {
    total += Math.floor(Math.random() * Number(sides)) + 1;
  }
  return total + (Number(mod) || 0);
}

function pushEcho(state, text, tone) {
  state.echoes.unshift({
    text,
    tone,
    nodeId: state.currentNodeId,
    at: Date.now()
  });
  state.echoes = state.echoes.slice(0, 8);
}

function formatDelta(value) {
  return value > 0 ? `+${value}` : `${value}`;
}

function clampValue(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function evaluateThresholdGate(node, state) {
  const gate = node.thresholdGate;
  if (!gate) return null;

  const lastHpEffect = (state.lastAppliedEffects || [])
    .filter(e => e.type === "adjustHp")
    .pop();
  if (!lastHpEffect) return null;

  const absDamage = Math.abs(lastHpEffect.value);
  const max = state.character.stats.hp.max;
  const threshold = Math.floor(max * gate.fractionOfMax);
  const met = gate.compare === ">=" ? absDamage >= threshold : absDamage > threshold;

  pushEcho(state,
    `伤害 ${absDamage} ${met ? "≥" : "<"} 最大HP一半(${threshold})：${met ? "重伤" : "轻伤"}`,
    met ? "negative" : "neutral"
  );

  return {
    met,
    damage: absDamage,
    threshold,
    visibleActionIndex: met ? gate.actionIndexIfMet : gate.actionIndexIfNot
  };
}
