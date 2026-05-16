/**
 * 战斗状态机 — 驱动回合、请求骰子、应用伤害、检查终止条件
 * 不直接调用 diceAdapter，通过返回 diceRequest 由 app.js 桥接
 */

import {
  getSuccessLevel,
  resolveOpposedRoll,
  getSuccessLevelLabel,
  rollD100,
  rollDice,
  rollMultiDice
} from "./opposed-roll.js";

// ─── 行为注册表 ───

const ENEMY_BEHAVIORS = {
  alwaysAttack(round, script) {
    const { fighting, dodge } = script.enemy.skills;
    return [{
      action: "attack",
      label: script.enemy.name + "攻击",
      skill: fighting,
      damage: script.enemy.damage
    }];
  },

  rollD6OddAttackEvenDodge(round, script) {
    const roll = Math.floor(Math.random() * 6) + 1;
    const { fighting, dodge } = script.enemy.skills;
    if (roll % 2 === 1) {
      return [{
        action: "attack",
        label: `${script.enemy.name}攻击（行为骰: ${roll}）`,
        skill: fighting,
        damage: script.enemy.damage,
        behaviorRoll: roll
      }];
    }
    return [{
      action: "dodge",
      label: `${script.enemy.name}闪避（行为骰: ${roll}）`,
      skill: dodge,
      behaviorRoll: roll
    }];
  }
};

// ─── 公共 API ───

export function createCombatState(script, character, inventory) {
  if (script.type === "opposed-roll") {
    return createOpposedState(script, character);
  }
  if (script.type === "dual-claw") {
    return createDualClawState(script, character);
  }
  return createMeleeState(script, character, inventory);
}

export function startCombat(combatState, script) {
  if (script.type === "opposed-roll") {
    return startOpposedRoll(combatState, script);
  }
  if (script.type === "dual-claw") {
    return advanceDualClaw(combatState, script);
  }
  return advanceToNextExchange(combatState, script);
}

export function submitPlayerChoice(combatState, script, choice) {
  if (choice === "escape") {
    return handleEscapeAttempt(combatState, script);
  }
  combatState.playerChoice = choice;
  return resolveExchange(combatState, script);
}

export function submitRollResult(combatState, script, rollValue) {
  const pending = combatState.pendingRoll;
  if (!pending) return { state: combatState };

  combatState.pendingRoll = null;
  combatState._lastPending = pending;

  switch (pending.purpose) {
    case "playerOpposed":
      return resolveOpposedResult(combatState, script, rollValue);
    case "playerResponse":
      return resolvePlayerResponse(combatState, script, rollValue);
    case "playerDamage":
      return resolvePlayerDamage(combatState, script, rollValue);
    case "conCheck":
      return resolveConCheck(combatState, script, rollValue);
    case "escapeCheck":
      return resolveEscapeCheck(combatState, script, rollValue);
    case "dualClawHit":
      return resolveDualClawHit(combatState, script, rollValue);
    default:
      return { state: combatState };
  }
}

export function getAvailableActions(combatState, script) {
  if (combatState.phase === "awaitingPlayerChoice") {
    const actions = [
      { id: "fightBack", label: "反击（格斗）" },
      { id: "dodge", label: "闪避" }
    ];
    if (script.specialActions) {
      for (const sa of script.specialActions) {
        if (combatState.round >= sa.availableAfterRound) {
          actions.push({ id: "escape", label: sa.label, description: sa.description });
        }
      }
    }
    return actions;
  }
  return [];
}

// ─── 对抗检定 (Type A) ───

function createOpposedState(script, character) {
  const playerTarget = resolveStatValue(script.player.stat, character);
  return {
    type: "opposed-roll",
    phase: "ready",
    playerTarget,
    enemyTarget: script.enemy.stat.value,
    log: [],
    pendingRoll: null,
    outcome: null
  };
}

function startOpposedRoll(combatState, script) {
  const enemyRoll = rollD100();
  const enemyLevel = getSuccessLevel(enemyRoll, combatState.enemyTarget);
  combatState.enemyRoll = enemyRoll;
  combatState.enemyLevel = enemyLevel;

  combatState.log.push({
    text: `${script.enemy.name}掷骰：${enemyRoll} / ${combatState.enemyTarget} → ${getSuccessLevelLabel(enemyLevel)}`,
    tone: enemyLevel > 0 ? "negative" : "positive"
  });

  combatState.phase = "awaitingRoll";
  combatState.pendingRoll = {
    purpose: "playerOpposed",
    notation: "1d100",
    label: `你的${script.player.stat.label}检定`,
    meta: { percentile: true, mode: "regular" }
  };

  return { state: combatState };
}

function resolveOpposedResult(combatState, script, playerRoll) {
  const playerLevel = getSuccessLevel(playerRoll, combatState.playerTarget);
  const result = resolveOpposedRoll(
    playerRoll, combatState.playerTarget,
    combatState.enemyRoll, combatState.enemyTarget,
    script.tieBreaker
  );

  combatState.log.push({
    text: `你掷骰：${playerRoll} / ${combatState.playerTarget} → ${getSuccessLevelLabel(playerLevel)}`,
    tone: playerLevel > 0 ? "positive" : "negative"
  });

  const won = result === "win";
  const outcomeData = won ? script.outcomes.win : script.outcomes.lose;

  combatState.log.push({
    text: won ? "你在对抗中胜出！" : "你在对抗中落败。",
    tone: won ? "positive" : "negative"
  });

  combatState.phase = "combatEnd";
  combatState.outcome = {
    result: won ? "win" : "lose",
    next: outcomeData.next,
    summary: outcomeData.text
  };

  return { state: combatState };
}

// ─── 双爪攻击 (Type C) ───

function createDualClawState(script, character) {
  return {
    type: "dual-claw",
    phase: "ready",
    playerCurrentHp: character.stats.hp.current,
    playerMaxHp: character.stats.hp.max,
    clawIndex: 0,
    majorWoundTriggered: false,
    log: [],
    pendingRoll: null,
    outcome: null
  };
}

function advanceDualClaw(combatState, script) {
  const claws = script.enemy.claws;

  if (combatState.phase === "ready" || combatState.phase === "exchangeResolved") {
    if (combatState.clawIndex >= claws.length) {
      // 两爪都结算完毕
      const outcomeKey = combatState.majorWoundTriggered ? "majorWound" : "survive";
      const outcomeData = script.outcomes[outcomeKey];
      combatState.phase = "combatEnd";
      combatState.outcome = {
        result: combatState.majorWoundTriggered ? "lose" : "survive",
        next: outcomeData.next,
        summary: outcomeData.summary
      };
      return { state: combatState };
    }

    const claw = claws[combatState.clawIndex];
    combatState.log.push({
      text: `${script.enemy.name}发动${claw.label}攻击（命中率 ${claw.skill}%）`,
      tone: "neutral"
    });

    combatState.phase = "awaitingRoll";
    combatState.pendingRoll = {
      purpose: "dualClawHit",
      notation: "1d100",
      label: `${claw.label}命中检定（${claw.skill}%）`,
      meta: { percentile: true, mode: "regular" },
      _clawIndex: combatState.clawIndex
    };
    return { state: combatState };
  }

  return { state: combatState };
}

function resolveDualClawHit(combatState, script, rollValue) {
  const lastPending = combatState._lastPending;
  const clawIndex = lastPending?._clawIndex ?? combatState.clawIndex;
  const claw = script.enemy.claws[clawIndex];
  const hit = rollValue <= claw.skill;

  combatState.log.push({
    text: `${claw.label}：掷骰 ${rollValue} / ${claw.skill} → ${hit ? "命中！" : "未命中"}`,
    tone: hit ? "negative" : "positive"
  });

  if (hit) {
    const damage = rollMultiDice(claw.damage);
    combatState.playerCurrentHp = Math.max(0, combatState.playerCurrentHp - damage);
    const halfMax = Math.floor(combatState.playerMaxHp / 2);
    const isMajor = damage >= halfMax;

    combatState.log.push({
      text: `${claw.label}造成 ${damage} 点伤害（你的 HP: ${combatState.playerCurrentHp}）${isMajor ? "　⚠ 重伤！" : ""}`,
      tone: "negative"
    });

    if (isMajor) {
      combatState.majorWoundTriggered = true;
    }

    if (combatState.playerCurrentHp <= 0) {
      combatState.log.push({ text: "你的耐久值归零，倒下了。", tone: "negative" });
      const outcomeData = script.outcomes.majorWound;
      combatState.phase = "combatEnd";
      combatState.outcome = { result: "lose", next: outcomeData.next, summary: "你倒下了。" };
      return { state: combatState };
    }
  }

  combatState.clawIndex = clawIndex + 1;
  combatState.phase = "exchangeResolved";
  return advanceDualClaw(combatState, script);
}

// ─── 多回合近战 (Type B) ───

function createMeleeState(script, character, inventory) {
  const availableWeapons = resolveWeapons(script.player.weaponOptions, inventory);
  const playerFighting = resolveStatValue(script.player.skills.fightBack, character);
  const playerDodge = resolveStatValue(script.player.skills.dodge, character);
  const db = parseDB(character.derived?.DB ?? "0");
  const conTarget = character.effectiveAttrs?.CON || character.rawAttrs?.CON || 50;

  return {
    type: "melee",
    phase: "ready",
    round: 0,
    exchangeIndex: 0,
    enemyHp: script.enemy.hp,
    playerHpSnapshot: character.stats.hp.current,
    playerMaxHp: character.stats.hp.max,
    playerCurrentHp: character.stats.hp.current,
    playerFighting,
    playerDodge,
    playerDB: db,
    playerWeapon: availableWeapons.length === 1 ? availableWeapons[0] : null,
    availableWeapons,
    playerChoice: null,
    currentEnemyAction: null,
    conTarget,
    log: [],
    pendingRoll: null,
    outcome: null
  };
}

function advanceToNextExchange(combatState, script) {
  const rounds = script.rounds;

  if (combatState.phase === "ready" || combatState.phase === "exchangeResolved" || combatState.phase === "roundEnd") {
    const currentRound = getCurrentRound(combatState, script);
    if (!currentRound) {
      return checkEndCondition(combatState, script, "allRoundsComplete");
    }

    const enemyActions = getEnemyActionsForRound(combatState, script, currentRound);
    if (combatState.exchangeIndex >= enemyActions.length) {
      combatState.exchangeIndex = 0;
      combatState.round++;
      combatState.phase = "roundEnd";
      combatState.log.push({ text: `── 第 ${combatState.round} 轮结束 ──`, tone: "neutral" });
      const endCheck = evaluateEndConditions(combatState, script);
      if (endCheck) return endCheck;
      return { state: combatState };
    }

    combatState.currentEnemyAction = enemyActions[combatState.exchangeIndex];
    combatState.phase = "awaitingPlayerChoice";
    combatState.playerChoice = null;

    combatState.log.push({
      text: `${combatState.currentEnemyAction.label}（技能 ${combatState.currentEnemyAction.skill}%）`,
      tone: "neutral"
    });

    return { state: combatState };
  }

  return { state: combatState };
}

function resolveExchange(combatState, script) {
  const enemyAction = combatState.currentEnemyAction;
  const enemyRoll = rollD100();
  const enemyLevel = getSuccessLevel(enemyRoll, enemyAction.skill);

  combatState.enemyRoll = enemyRoll;
  combatState.enemyLevel = enemyLevel;

  combatState.log.push({
    text: `${script.enemy.name}掷骰：${enemyRoll} / ${enemyAction.skill} → ${getSuccessLevelLabel(enemyLevel)}`,
    tone: enemyLevel > 0 ? "warning" : "positive"
  });

  const playerSkillValue = combatState.playerChoice === "fightBack"
    ? combatState.playerFighting
    : combatState.playerDodge;
  const skillLabel = combatState.playerChoice === "fightBack"
    ? script.player.skills.fightBack.label
    : script.player.skills.dodge.label;

  combatState.phase = "awaitingRoll";
  combatState.pendingRoll = {
    purpose: "playerResponse",
    notation: "1d100",
    label: `你的${skillLabel}检定`,
    meta: { percentile: true, mode: "regular" },
    _playerSkillValue: playerSkillValue
  };

  return { state: combatState };
}

function resolvePlayerResponse(combatState, script, playerRoll) {
  const lastPending = combatState._lastPending;
  const playerSkillValue = lastPending?._playerSkillValue
    ?? (combatState.playerChoice === "fightBack" ? combatState.playerFighting : combatState.playerDodge);
  const playerLevel = getSuccessLevel(playerRoll, playerSkillValue);
  const enemyLevel = combatState.enemyLevel;
  const enemyAction = combatState.currentEnemyAction;

  combatState.log.push({
    text: `你掷骰：${playerRoll} / ${playerSkillValue} → ${getSuccessLevelLabel(playerLevel)}`,
    tone: playerLevel > 0 ? "positive" : "negative"
  });

  // 对抗比较
  if (playerLevel > enemyLevel) {
    // 玩家胜
    if (combatState.playerChoice === "fightBack") {
      combatState.log.push({ text: "你的反击得手！", tone: "positive" });
      return requestPlayerDamageRoll(combatState, script);
    } else {
      combatState.log.push({ text: "你成功闪避了攻击！", tone: "positive" });
      return finishExchange(combatState, script);
    }
  } else if (enemyLevel > playerLevel) {
    // 敌人胜
    if (enemyAction.action === "dodge") {
      combatState.log.push({ text: `${script.enemy.name}闪避了你的攻击。`, tone: "negative" });
      return finishExchange(combatState, script);
    }
    return applyEnemyDamage(combatState, script);
  } else {
    // 平手 — 主动方（敌人进攻时敌人是主动方）胜
    if (enemyAction.action === "dodge") {
      // 玩家进攻，敌人闪避，平手 → 主动方(玩家)胜
      if (combatState.playerChoice === "fightBack") {
        combatState.log.push({ text: "平手！你作为进攻方得手！", tone: "positive" });
        return requestPlayerDamageRoll(combatState, script);
      }
      combatState.log.push({ text: "双方僵持，无事发生。", tone: "neutral" });
      return finishExchange(combatState, script);
    }
    // 敌人进攻，平手 → 敌人作为主动方胜
    combatState.log.push({ text: "平手！敌人作为进攻方得手。", tone: "negative" });
    return applyEnemyDamage(combatState, script);
  }
}

function requestPlayerDamageRoll(combatState, script) {
  const weapon = combatState.playerWeapon || combatState.availableWeapons[0];
  const notation = buildDamageNotation(weapon.damage, combatState.playerDB);

  combatState.phase = "awaitingRoll";
  combatState.pendingRoll = {
    purpose: "playerDamage",
    notation,
    label: `伤害（${weapon.label}）`,
    meta: { percentile: false }
  };

  return { state: combatState };
}

function resolvePlayerDamage(combatState, script, damageTotal) {
  const armor = script.enemy.armor || 0;
  const actual = Math.max(0, damageTotal - armor);
  combatState.enemyHp -= actual;

  let text = `你造成 ${damageTotal} 点伤害`;
  if (armor > 0) text += `（护甲吸收 ${Math.min(armor, damageTotal)} 点，实际 ${actual} 点）`;
  text += `。${script.enemy.name}剩余 HP: ${Math.max(0, combatState.enemyHp)}`;
  combatState.log.push({ text, tone: "positive" });

  return finishExchange(combatState, script);
}

function applyEnemyDamage(combatState, script) {
  const enemyAction = combatState.currentEnemyAction;
  const damage = rollMultiDice(enemyAction.damage);
  combatState.playerCurrentHp = Math.max(0, combatState.playerCurrentHp - damage);

  combatState.log.push({
    text: `${script.enemy.name}命中！造成 ${damage} 点伤害。你的 HP: ${combatState.playerCurrentHp}`,
    tone: "negative"
  });

  // 重伤检查
  if (script.majorWound && damage >= Math.floor(combatState.playerMaxHp / 2)) {
    combatState.log.push({ text: `重伤！你单次受到了 ${damage} 点伤害（≥ 最大HP一半）。`, tone: "negative" });
    combatState.majorWoundTriggered = true;

    const conTarget = combatState.conTarget;
    combatState.phase = "awaitingRoll";
    combatState.pendingRoll = {
      purpose: "conCheck",
      notation: "1d100",
      label: `体质检定（目标 ${conTarget}）`,
      meta: { percentile: true, mode: "regular" },
      _target: conTarget
    };
    return { state: combatState };
  }

  return finishExchange(combatState, script);
}

function resolveConCheck(combatState, script, rollValue) {
  const lastPending = combatState._lastPending;
  const target = lastPending?._target ?? combatState.conTarget ?? 50;
  const level = getSuccessLevel(rollValue, target);
  const success = level > 0;

  combatState.log.push({
    text: `体质检定：${rollValue} / ${target} → ${success ? "成功，你挺住了！" : "失败，你昏迷了……"}`,
    tone: success ? "positive" : "negative"
  });

  if (!success) {
    const endCond = script.endConditions.find(c => c.check === "majorWound");
    combatState.phase = "combatEnd";
    combatState.outcome = {
      result: "lose",
      next: endCond?.failNext || endCond?.next,
      summary: "你因重伤昏迷，倒在了地上。"
    };
    return { state: combatState };
  }

  return finishExchange(combatState, script);
}

function finishExchange(combatState, script) {
  combatState.exchangeIndex++;
  combatState.phase = "exchangeResolved";

  const endCheck = evaluateEndConditions(combatState, script);
  if (endCheck) return endCheck;

  return advanceToNextExchange(combatState, script);
}

// ─── 特殊动作：逃跑 ───

function handleEscapeAttempt(combatState, script) {
  const sa = script.specialActions.find(a => a.id === "escape");
  if (!sa) return { state: combatState };

  const dodgeTarget = combatState.playerDodge;
  const effectiveTarget = sa.check.difficulty === "hard"
    ? Math.floor(dodgeTarget / 2)
    : dodgeTarget;

  combatState.log.push({ text: `尝试逃跑！需要困难闪避检定（目标 ${effectiveTarget}）`, tone: "neutral" });

  combatState.phase = "awaitingRoll";
  combatState.pendingRoll = {
    purpose: "escapeCheck",
    notation: "1d100",
    label: `困难闪避（目标 ${effectiveTarget}）`,
    meta: { percentile: true, mode: "regular" },
    _target: effectiveTarget,
    _specialAction: sa
  };

  return { state: combatState };
}

function resolveEscapeCheck(combatState, script, rollValue) {
  const lastPending = combatState._lastPending;
  const target = lastPending._target;
  const sa = lastPending._specialAction;
  const level = getSuccessLevel(rollValue, target);
  const success = level > 0;

  combatState.log.push({
    text: `闪避检定：${rollValue} / ${target} → ${success ? "成功！你逃脱了！" : "失败！"}`,
    tone: success ? "positive" : "negative"
  });

  if (success) {
    combatState.phase = "combatEnd";
    combatState.outcome = {
      result: "escape",
      next: sa.successNext,
      summary: "你成功逃离了战斗！"
    };
    return { state: combatState };
  }

  // 失败惩罚：敌人额外攻击
  if (sa.failPenalty === "enemyBonusAttack") {
    combatState.log.push({ text: `逃跑失败，${script.enemy.name}趁机攻击！`, tone: "negative" });
    const enemyRoll = rollD100();
    const enemySkill = script.enemy.skills.fighting;
    const enemyLevel = getSuccessLevel(enemyRoll, enemySkill);

    combatState.log.push({
      text: `${script.enemy.name}掷骰：${enemyRoll} / ${enemySkill} → ${getSuccessLevelLabel(enemyLevel)}`,
      tone: enemyLevel > 0 ? "negative" : "positive"
    });

    if (enemyLevel > 0) {
      const damage = rollMultiDice(script.enemy.damage);
      combatState.playerCurrentHp = Math.max(0, combatState.playerCurrentHp - damage);
      combatState.log.push({
        text: `${script.enemy.name}命中！造成 ${damage} 点伤害。你的 HP: ${combatState.playerCurrentHp}`,
        tone: "negative"
      });
    } else {
      combatState.log.push({ text: `${script.enemy.name}的攻击落空了。`, tone: "positive" });
    }
  }

  combatState.phase = "exchangeResolved";
  const endCheck = evaluateEndConditions(combatState, script);
  if (endCheck) return endCheck;

  return advanceToNextExchange(combatState, script);
}

// ─── 终止条件 ───

function evaluateEndConditions(combatState, script) {
  for (const cond of script.endConditions) {
    switch (cond.check) {
      case "playerHpZero":
        if (combatState.playerCurrentHp <= 0) {
          combatState.phase = "combatEnd";
          combatState.outcome = { result: "lose", next: cond.next, summary: "你倒下了。" };
          return { state: combatState };
        }
        break;
      case "enemyHpZero":
        if (combatState.enemyHp <= 0) {
          combatState.phase = "combatEnd";
          combatState.outcome = { result: "win", next: cond.next, summary: `${script.enemy.name}倒下了！` };
          return { state: combatState };
        }
        break;
      case "enemyHpBelow":
        if (combatState.enemyHp <= cond.threshold) {
          combatState.phase = "combatEnd";
          combatState.outcome = { result: "win", next: cond.next, summary: `${script.enemy.name}无力再战！` };
          return { state: combatState };
        }
        break;
      case "allRoundsComplete": {
        const totalRounds = Array.isArray(script.rounds) ? script.rounds.length : Infinity;
        if (combatState.round >= totalRounds) {
          combatState.phase = "combatEnd";
          combatState.outcome = { result: "survive", next: cond.next, summary: "你撑过了所有回合！" };
          return { state: combatState };
        }
        break;
      }
      case "majorWound":
        // handled inline during damage application
        break;
    }
  }
  return null;
}

function checkEndCondition(combatState, script, condType) {
  const cond = script.endConditions.find(c => c.check === condType);
  if (cond) {
    combatState.phase = "combatEnd";
    combatState.outcome = { result: "survive", next: cond.next, summary: "你撑过了所有回合！" };
    return { state: combatState };
  }
  return { state: combatState };
}

// ─── 辅助函数 ───

function getCurrentRound(combatState, script) {
  if (Array.isArray(script.rounds)) {
    return script.rounds[combatState.round] || null;
  }
  return { label: `第 ${combatState.round + 1} 轮`, enemyActions: null };
}

function getEnemyActionsForRound(combatState, script, currentRound) {
  if (currentRound.enemyActions) return currentRound.enemyActions;

  // unlimited rounds with behavior
  if (script.enemyBehavior && ENEMY_BEHAVIORS[script.enemyBehavior]) {
    return ENEMY_BEHAVIORS[script.enemyBehavior](combatState.round, script);
  }

  // fallback: single attack
  return [{
    action: "attack",
    label: `${script.enemy.name}攻击`,
    skill: script.enemy.skills.fighting,
    damage: script.enemy.damage
  }];
}

function resolveStatValue(statDef, character) {
  if (!statDef || !character) return 50;
  if (statDef.type === "attribute") {
    return character.effectiveAttrs?.[statDef.key] || character.rawAttrs?.[statDef.key] || 50;
  }
  if (statDef.type === "skill") {
    const base = getSkillBaseFromCharacter(statDef.skill, character);
    const points = character.skillPoints?.[statDef.skill];
    const added = points ? (points.occ || 0) + (points.int || 0) + (points.adj || 0) : 0;
    return base + added;
  }
  if (statDef.value != null) return statDef.value;
  return 50;
}

function getSkillBaseFromCharacter(skillName, character) {
  const attrs = character.effectiveAttrs || character.rawAttrs || {};
  if (skillName === "闪避") return Math.floor((attrs.DEX || 0) / 2);
  if (skillName === "格斗(斗殴)") return 25;
  return 1;
}

function resolveWeapons(weaponOptions, inventory) {
  const inv = inventory || [];
  const available = [];
  for (const w of weaponOptions) {
    if (w.condition?.hasItem) {
      if (inv.some(item => typeof item === "string" ? item.includes(w.condition.hasItem) : item?.name?.includes(w.condition.hasItem))) {
        available.push(w);
      }
    } else {
      available.push(w);
    }
  }
  return available.length > 0 ? available : [weaponOptions[weaponOptions.length - 1]];
}

function parseDB(dbStr) {
  if (!dbStr || dbStr === "0" || dbStr === "+0") return null;
  const cleaned = dbStr.startsWith("+") ? dbStr.slice(1) : dbStr;
  if (/^\d+[Dd]\d+/.test(cleaned)) return cleaned;
  const num = Number(cleaned);
  if (!isNaN(num) && num !== 0) return String(num);
  return null;
}

function buildDamageNotation(baseDamage, db) {
  if (!db) return baseDamage;
  if (/^-?\d+$/.test(db)) {
    return `${baseDamage}+${db}`;
  }
  return `${baseDamage}+${db}`;
}
