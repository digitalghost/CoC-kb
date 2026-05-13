export function renderApp({
  moduleData,
  state,
  currentNode,
  adapterStatuses,
  chapterGroups,
  milestones,
  currentCheckResolution,
  pendingCombat,
  onAction,
  onReset,
  onJump,
  onBack,
  onOpenDice,
  onRollCheck,
  onPushedRoll,
  onStartCombat,
  onMpSpend,
  onSpendLuck
}) {
  renderActBanner(currentNode, chapterGroups, state);
  renderMilestoneTimeline(state.flags, milestones);
  renderChapterProgress(state, chapterGroups, moduleData.nodes);
  renderStory(
    currentNode,
    state,
    onAction,
    onBack,
    onRollCheck,
    onPushedRoll,
    currentCheckResolution,
    pendingCombat,
    onStartCombat,
    onMpSpend,
    onSpendLuck
  );
  renderClueThreads(state.flags, currentNode.id, onJump);
  renderFlags(state.flags);
  renderAdapterStatuses(adapterStatuses);
  renderEchoes(state.echoes);
  renderHistory(state.history, moduleData.nodes);

  const resetButton = document.getElementById("resetRunButton");
  resetButton.onclick = onReset;

  const ending = (currentNode.endingId && state.dead)
    ? moduleData.endings?.find((item) => `ending-${item.num}` === currentNode.endingId)
    : null;
  const feedback = document.getElementById("actionFeedback");
  if (state.dead && !ending) {
    renderDeathRecap(state, onReset);
  } else if (ending) {
    renderEndingRecap(ending, state, milestones, onReset);
  } else if (!feedback.childElementCount) {
    feedback.textContent = "";
  }
}

function renderActBanner(currentNode, chapterGroups, state) {
  const chapter = chapterGroups.find((ch) => ch.id === currentNode.sliceId) || chapterGroups[0];
  const actIndex = chapterGroups.indexOf(chapter) + 1;

  document.getElementById("currentActLabel").textContent = `第${toChineseNum(actIndex)}幕`;
  document.getElementById("currentActTitle").textContent = chapter.label.replace(/^第.幕 · /, "");
  document.getElementById("currentActDescription").textContent = chapter.description;
  document.getElementById("journeyMeta").textContent = `已走过 ${state.history.length} 个节点`;
}

function toChineseNum(n) {
  return ["一", "二", "三", "四", "五", "六"][n - 1] || String(n);
}

function renderMilestoneTimeline(flags, milestones) {
  const container = document.getElementById("milestoneTimeline");
  container.innerHTML = "";

  const triggered = milestones.filter((m) => flags[m.flag]);

  if (!triggered.length) {
    const empty = document.createElement("div");
    empty.className = "milestone-empty";
    empty.textContent = "尚未触发关键事件";
    container.appendChild(empty);
    return;
  }

  triggered.forEach((milestone) => {
    const item = document.createElement("div");
    item.className = "milestone-item";
    item.innerHTML = `
      <div class="milestone-dot"></div>
      <div class="milestone-content">
        <strong>${milestone.label}</strong>
        <span>${milestone.description}</span>
      </div>
    `;
    container.appendChild(item);
  });
}

function renderChapterProgress(state, chapterGroups, nodes) {
  const container = document.getElementById("chapterProgress");
  container.innerHTML = "";

  const visitedChapters = new Set();
  state.history.forEach((nodeId) => {
    const node = nodes[nodeId];
    if (node) visitedChapters.add(node.sliceId);
  });

  const currentChapter = nodes[state.currentNodeId]?.sliceId;

  chapterGroups.forEach((chapter) => {
    const unlocked = visitedChapters.has(chapter.id);
    const isCurrent = chapter.id === currentChapter;
    const li = document.createElement("li");
    li.className = `chapter-item${unlocked ? " is-unlocked" : " is-locked"}${isCurrent ? " is-current" : ""}`;
    li.innerHTML = `
      <span class="chapter-icon">${unlocked ? "◆" : "◇"}</span>
      <span class="chapter-label">${chapter.label}</span>
    `;
    container.appendChild(li);
  });
}

function renderStory(
  node,
  state,
  onAction,
  onBack,
  onRollCheck,
  onPushedRoll,
  currentCheckResolution,
  pendingCombat,
  onStartCombat,
  onMpSpend,
  onSpendLuck
) {
  const feedback = document.getElementById("actionFeedback");
  feedback.innerHTML = "";
  feedback.textContent = "";

  const sceneText = document.getElementById("sceneText");
  sceneText.innerHTML = formatSceneText(node.text);

  // 内嵌图片（插在故事文字前）
  const existingImg = document.getElementById("sceneInlineImage");
  if (existingImg) existingImg.remove();
  if (node.image) {
    const img = document.createElement("img");
    img.id = "sceneInlineImage";
    img.className = "scene-inline-image";
    img.src = node.image;
    img.alt = node.title || "";
    sceneText.parentNode.insertBefore(img, sceneText);
  }

  renderTransitionBanner(state.lastTransition);
  renderDirectiveBadges(node.directives || []);
  renderEffectNotices(state.lastAppliedEffects || [], state.thresholdResult);

  const actionList = document.getElementById("actionList");
  actionList.innerHTML = "";

  if (pendingCombat) {
    const combatRow = document.createElement("div");
    combatRow.className = "action-row";
    const combatBtn = document.createElement("button");
    combatBtn.type = "button";
    combatBtn.className = "action-button is-recommended";
    combatBtn.innerHTML = `
      <span class="action-main">
        <span class="action-label">进入战斗</span>
        <span class="action-note">点击开始对抗/战斗解算</span>
      </span>
    `;
    combatBtn.onclick = () => onStartCombat(pendingCombat);
    combatRow.appendChild(combatBtn);
    actionList.appendChild(combatRow);
    return;
  }

  // entry-90：施法消耗MP选择器
  if (state.flags.awaitingMpInput) {
    const maxSpend = state.flags.mpInputMax ?? 10;
    const mp = state.character.stats?.mp?.current ?? 0;
    const hp = state.character.stats?.hp?.current ?? 1;

    const container = document.createElement("div");
    container.className = "mp-spend-container";

    let selected = Math.min(1, maxSpend);

    const updateDisplay = () => {
      const mpCost = Math.min(selected, mp);
      const hpCost = selected - mpCost;
      costEl.textContent = `消耗 MP ${mpCost}${hpCost > 0 ? ` + HP ${hpCost}` : ""}，成功率 ${selected * 10}%`;
      minusBtn.disabled = selected <= 1;
      plusBtn.disabled = selected >= maxSpend;
      countEl.textContent = selected;
    };

    container.innerHTML = `
      <div class="mp-spend-label">决定消耗的魔法值点数（最多 ${maxSpend} 点）</div>
      <div class="mp-spend-note">MP 不足时可用 HP 补足，但 HP 不能归零。当前 MP: ${mp} / HP: ${hp}</div>
      <div class="mp-spend-controls">
        <button type="button" class="mp-btn mp-minus">−</button>
        <span class="mp-count">1</span>
        <button type="button" class="mp-btn mp-plus">＋</button>
      </div>
      <div class="mp-spend-cost"></div>
      <button type="button" class="action-button is-recommended mp-confirm">确认消耗，前往施法</button>
    `;

    const minusBtn = container.querySelector(".mp-minus");
    const plusBtn = container.querySelector(".mp-plus");
    const countEl = container.querySelector(".mp-count");
    const costEl = container.querySelector(".mp-spend-cost");

    minusBtn.onclick = () => { if (selected > 1) { selected--; updateDisplay(); } };
    plusBtn.onclick = () => { if (selected < maxSpend) { selected++; updateDisplay(); } };
    container.querySelector(".mp-confirm").onclick = () => onMpSpend(selected);

    updateDisplay();
    actionList.appendChild(container);
    return;
  }
  if (state.conditionBranchResult) {
    const branch = state.conditionBranchResult;
    const target = branch.met ? branch.targetIfTrue : branch.targetIfFalse;
    const label = branch.met ? branch.labelIfTrue : branch.labelIfFalse;
    const row = document.createElement("div");
    row.className = "action-row";
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "action-button is-recommended";
    btn.innerHTML = `
      <span class="action-main">
        <span class="action-label">继续 →</span>
        <span class="action-note">${label || ""}</span>
      </span>
    `;
    btn.onclick = () => onAction(
      (node.actions || []).find(a => a.next === target)?.id ||
      (node.actions || [])[0]?.id
    );
    row.appendChild(btn);
    actionList.appendChild(row);
    return;
  }

  renderCheckHints(
    node,
    state,
    onRollCheck,
    onPushedRoll,
    onSpendLuck,
    currentCheckResolution
  );

  (node.actions || []).forEach((action, actionIndex) => {
    if (state.thresholdResult && actionIndex !== state.thresholdResult.visibleActionIndex) {
      return;
    }

    const row = document.createElement("div");
    row.className = "action-row";

    const button = document.createElement("button");
    button.type = "button";
    const recommendationClass = getActionRecommendationClass(action.check, currentCheckResolution);
    const gateState = getActionGateState(action.check, currentCheckResolution, node.actions);
    button.className = `action-button${recommendationClass ? ` ${recommendationClass}` : ""}`;
    if (gateState === "locked") {
      button.classList.add("is-locked");
      button.disabled = true;
    }
    const actionLabel = state.thresholdResult ? "继续 →" : action.label;
    button.innerHTML = `
      <span class="action-main">
        <span class="action-label">${actionLabel}</span>
        <span class="action-note">${action.description || ""}</span>
      </span>
    `;
    button.onclick = () => onAction(action.id);
    if (gateState !== "hidden") {
      row.appendChild(button);
    }

    const rollButton = renderActionCheck(action.check);
    if (rollButton && gateState === "free" && !currentCheckResolution) {
      rollButton.addEventListener("click", () =>
        onRollCheck({
          notation: rollButton.dataset.rollNotation,
          label: rollButton.dataset.rollLabel
        })
      );
      row.appendChild(rollButton);
    }

    if (row.childElementCount) {
      actionList.appendChild(row);
    }
  });
}

function renderCheckHints(
  node,
  state,
  onRollCheck,
  onPushedRoll,
  onSpendLuck,
  currentCheckResolution
) {
  const feedback = document.getElementById("actionFeedback");
  const hints = node.checkHints || [];

  if (!hints.length) {
    return;
  }
  hints.forEach((hint) => {
    const row = document.createElement("div");
    row.className = "check-hint";
    const targetMeta = renderCheckTargetMeta(hint);
    row.innerHTML = `
      <div class="check-copy">
        <strong>${hint.label}</strong>
        <span>${hint.description || "进行一次检定，结果将决定后续走向。"}</span>
        ${targetMeta ? `<small>${targetMeta}</small>` : ""}
      </div>
      <button type="button" class="check-roll-button" data-notation="${hint.notation || "1d100"}">
        投 ${formatRollButtonLabel(hint)}
      </button>
    `;

    if (currentCheckResolution && currentCheckResolution.label === hint.label) {
      row.classList.add(currentCheckResolution.success ? "is-success" : "is-failure");
      row.classList.add(`rank-${currentCheckResolution.rank}`);
      row.querySelector(".check-roll-button").remove();
      row.querySelector(".check-copy").appendChild(renderResolutionSummary(currentCheckResolution));

      if (node.pushable && !currentCheckResolution.success && currentCheckResolution.rank !== "fumble" && !currentCheckResolution.isPushed) {
        const pushBlock = document.createElement("div");
        pushBlock.className = "push-roll-block";
        pushBlock.innerHTML = `
          <button type="button" class="push-roll-button">孤注一掷</button>
          <small class="push-roll-hint">重掷一次，失败后果可能更严重</small>
        `;
        pushBlock.querySelector(".push-roll-button").addEventListener("click", () => onPushedRoll(hint));
        row.querySelector(".check-copy").appendChild(pushBlock);
      }

      // 幸运消耗：检定失败后显示花费幸运通过的选项
      if (!currentCheckResolution.success && currentCheckResolution.rank !== "fumble" && !currentCheckResolution.luckSpent) {
        const roll = currentCheckResolution.roll;
        const target = currentCheckResolution.target;
        const luckCost = roll - target;
        const currentLuck = state.character.stats?.luck ?? 0;
        if (luckCost > 0 && currentLuck >= luckCost) {
          const luckBlock = document.createElement("div");
          luckBlock.className = "push-roll-block";
          luckBlock.innerHTML = `
            <button type="button" class="luck-spend-button">花费 ${luckCost} 点幸运通过</button>
            <small class="push-roll-hint">当前幸运 ${currentLuck}，花费后剩余 ${currentLuck - luckCost}</small>
          `;
          luckBlock.querySelector(".luck-spend-button").addEventListener("click", () => onSpendLuck(luckCost));
          row.querySelector(".check-copy").appendChild(luckBlock);
        }
      }
    }

    const rollTrigger = row.querySelector(".check-roll-button");
    if (rollTrigger) {
      rollTrigger.addEventListener("click", () => onRollCheck(hint));
    }
    feedback.appendChild(row);
  });
}

function renderActionCheck(check) {
  if (!check) return null;

  const button = document.createElement("button");
  button.type = "button";
  button.className = "action-roll-button";
  button.dataset.rollNotation = check.notation || "1d100";
  button.dataset.rollLabel = check.label;
  button.textContent = `${check.label} · 投 ${formatRollButtonLabel(check)}`;
  return button;
}

function renderCheckTargetMeta(check) {
  if (!check?.target) return "";
  return `目标值 ${check.target} · 困难 ${check.half} · 极难 ${check.fifth}`;
}

function getActionRecommendationClass(check, resolution) {
  if (!check || !resolution || check.outcome == null) return "";
  if (check.outcome === "success" && resolution.success) return "is-recommended";
  if (check.outcome === "failure" && !resolution.success && resolution.rank !== "fumble" && !resolution.isPushed) return "is-recommended";
  if (check.outcome === "pushed_failure" && resolution.isPushed && !resolution.success) return "is-recommended";
  if (check.outcome === "fumble" && resolution.rank === "fumble") return "is-recommended";
  if (check.outcome === "non_fumble" && resolution.rank !== "fumble") return "is-recommended";
  return "is-muted";
}

function getActionGateState(check, resolution, nodeActions) {
  if (!check || check.outcome == null) return "free";
  if (!resolution) return "hidden";
  if (check.outcome === "success" && resolution.success) return "free";
  if (check.outcome === "failure") {
    if (resolution.isPushed) return "hidden";
    if (resolution.rank === "fumble") {
      const hasFumblePath = nodeActions && nodeActions.some(a => a.check?.outcome === "fumble");
      if (hasFumblePath) return "hidden";
    }
    if (!resolution.success) return "free";
  }
  if (check.outcome === "pushed_failure") {
    if (resolution.isPushed && !resolution.success) return "free";
    return "hidden";
  }
  if (check.outcome === "fumble" && resolution.rank === "fumble") return "free";
  if (check.outcome === "non_fumble" && resolution.rank !== "fumble") return "free";
  return "hidden";
}


function renderResolutionSummary(resolution) {
  const block = document.createElement("div");
  block.className = "resolution-summary";
  block.innerHTML = `
    <div class="resolution-pill tone-${resolution.success ? "success" : "failure"} rank-${resolution.rank}">
      ${resolution.outcomeLabel}
    </div>
    <div class="resolution-meta">
      <span>${getModeDisplayLabel(resolution.mode || "regular")}</span>
      <span>掷骰 ${resolution.roll}</span>
      ${renderCandidateMeta(resolution.candidates, resolution.mode)}
      <span>目标 ${resolution.target}</span>
      <span>困难 ${resolution.half}</span>
      <span>极难 ${resolution.fifth}</span>
    </div>
  `;
  return block;
}

function formatRollButtonLabel(check) {
  if ((check.notation || "1d100") === "1d100") {
    if ((check.mode || "regular") === "bonus") return "百分骰";
    if ((check.mode || "regular") === "penalty") return "百分骰";
    return "百分骰";
  }
  return check.notation || "1d100";
}

function getModeDisplayLabel(mode) {
  if (mode === "bonus") return "奖励骰";
  if (mode === "penalty") return "惩罚骰";
  return "常规检定";
}

function renderCandidateMeta(candidates, mode) {
  if (!Array.isArray(candidates) || candidates.length <= 1) return "";
  const label = mode === "bonus" ? "取低" : mode === "penalty" ? "取高" : "候选";
  return `<span>${label} ${candidates.join(" / ")}</span>`;
}

function renderSceneArt(imagePath) {
  const art = document.getElementById("sceneArt");

  if (imagePath) {
    art.style.backgroundImage = `linear-gradient(180deg, rgba(41, 27, 19, 0.14), rgba(8, 10, 16, 0.72)), url("${imagePath}")`;
    art.style.backgroundSize = "cover";
    art.style.backgroundPosition = "center";
  } else {
    art.style.backgroundImage = "";
    art.style.backgroundSize = "";
    art.style.backgroundPosition = "";
  }
}

function renderDirectiveBadges(directives) {
  let container = document.getElementById("directiveBadges");
  if (!container) {
    container = document.createElement("div");
    container.id = "directiveBadges";
    container.className = "directive-badges";
    const sceneText = document.getElementById("sceneText");
    sceneText.parentNode.insertBefore(container, sceneText.nextSibling);
  }
  container.innerHTML = "";
  if (!directives || directives.length === 0) {
    container.hidden = true;
    return;
  }
  container.hidden = false;
  directives.forEach((dir) => {
    const badge = document.createElement("span");
    badge.className = `directive-badge tone-${dir.kind}`;
    badge.textContent = formatDirectiveLabel(dir);
    if (dir.snippet) badge.title = dir.snippet;
    container.appendChild(badge);
  });
}

function formatDirectiveLabel(dir) {
  const sign = dir.sign === -1 ? "−" : dir.sign === 1 ? "+" : "";
  switch (dir.kind) {
    case "check-mention":
      return `检定:${dir.skill || "?"}`;
    case "check-hard":
      return `困难检定:${dir.skill || "?"}`;
    case "check-extreme":
      return `极难检定:${dir.skill || "?"}`;
    case "tickSkill":
      return `技能勾选:${dir.skill || "?"}`;
    case "adjustHp":
      return `耐久 ${sign}${dir.amount || ""}`;
    case "adjustSan":
      return `理智 ${sign}${dir.amount || ""}`;
    case "adjustMp":
      return `魔法 ${sign}${dir.amount || ""}`;
    case "penalty-die":
      return "惩罚骰";
    case "bonus-die":
      return "奖励骰";
    default:
      return (dir.snippet || dir.kind || "提示").slice(0, 30);
  }
}

function renderEffectNotices(appliedEffects, thresholdResult) {
  let container = document.getElementById("effectNotices");
  if (!container) {
    container = document.createElement("div");
    container.id = "effectNotices";
    container.className = "effect-notices";
    const sceneText = document.getElementById("sceneText");
    sceneText.parentNode.insertBefore(container, sceneText.nextSibling);
  }
  container.innerHTML = "";

  const hasEffects = appliedEffects && appliedEffects.length;
  if (!hasEffects && !thresholdResult) {
    container.hidden = true;
    return;
  }
  container.hidden = false;

  if (hasEffects) {
    appliedEffects.forEach((eff) => {
      const pill = document.createElement("span");
      pill.className = `effect-pill effect-${getEffectTone(eff)}`;
      pill.textContent = eff.label;
      container.appendChild(pill);
    });
  }

  if (thresholdResult) {
    const pill = document.createElement("span");
    pill.className = `effect-pill effect-${thresholdResult.met ? "damage" : "heal"}`;
    pill.textContent = `伤害 ${thresholdResult.damage} ${thresholdResult.met ? "≥" : "<"} HP上限一半(${thresholdResult.threshold})`;
    container.appendChild(pill);
  }
}

function getEffectTone(eff) {
  if (eff.type === "adjustHp") return eff.value < 0 ? "damage" : "heal";
  if (eff.type === "adjustSan") return eff.value < 0 ? "sanLoss" : "heal";
  if (eff.type === "adjustMp") return eff.value < 0 ? "mpLoss" : "heal";
  if (eff.type === "adjustLuck") return eff.value < 0 ? "damage" : "heal";
  if (eff.type === "tickSkill" || eff.type === "adjustSkill") return "growth";
  if (eff.type === "gainItem") return "gain";
  if (eff.type === "loseItem") return "loss";
  return "neutral";
}

function renderTransitionBanner(transition) {
  let banner = document.getElementById("sceneTransitionBanner");

  if (!banner) {
    banner = document.createElement("div");
    banner.id = "sceneTransitionBanner";
    banner.className = "scene-transition-banner";
    const sceneText = document.getElementById("sceneText");
    sceneText.parentNode.insertBefore(banner, sceneText);
  }

  if (!transition?.text) {
    banner.hidden = true;
    banner.textContent = "";
    banner.className = "scene-transition-banner";
    return;
  }

  banner.hidden = false;
  banner.className = `scene-transition-banner tone-${transition.tone || "neutral"}`;
  banner.textContent = transition.text;
}

function renderFlags(flags) {
  const flagCloud = document.getElementById("flagCloud");
  if (!flagCloud) return;
  flagCloud.innerHTML = "";
  const entries = Object.entries(flags);

  if (!entries.length) {
    const span = document.createElement("span");
    span.className = "flag-pill is-empty";
    span.textContent = "还没有触发剧情标记";
    flagCloud.appendChild(span);
    return;
  }

  entries.forEach(([key, value]) => {
    const span = document.createElement("span");
    span.className = "flag-pill";
    span.textContent = `${key}: ${String(value)}`;
    flagCloud.appendChild(span);
  });
}

function renderClueThreads(flags, currentNodeId, onJump) {
  const container = document.getElementById("clueThreadList");
  if (!container) return;
  container.innerHTML = "";

  const empty = document.createElement("div");
  empty.className = "clue-thread-card is-empty";
  empty.innerHTML = `
    <strong>线索面板暂未启用</strong>
    <p>原线索梳理基于早期手写剧情数据;现已切换到 wiki 全文驱动,线索整理会在后续重新接入。</p>
  `;
  container.appendChild(empty);
}

function renderAdapterStatuses(adapterStatuses) {
  const charEl = document.getElementById("characterAdapterStatus");
  const diceEl = document.getElementById("diceAdapterStatus");
  const contentEl = document.getElementById("contentAdapterStatus");
  if (charEl) charEl.textContent = `角色 adapter: ${adapterStatuses.character}`;
  if (diceEl) diceEl.textContent = `骰子 adapter: ${adapterStatuses.dice}`;
  if (contentEl) contentEl.textContent = `内容 adapter: ${adapterStatuses.content}`;
}

function buildClueThreads(flags) {
  const threads = [];

  if (flags.heardRuthWarning || flags.heardRuthNightWarning || flags.metRuth) {
    threads.push({
      id: "thread-ruth",
      title: "露丝的警告",
      status: flags.heardRuthNightWarning ? "已具体化" : "已出现",
      tone: "warning",
      nodeId: flags.heardRuthNightWarning ? "entry-138" : "entry-3",
      cta: flags.heardRuthNightWarning ? "回到露丝夜谈" : "去见露丝",
      summary: flags.heardRuthNightWarning
        ? "露丝已经不只是模糊劝你离开。她提到了“不要看上面”“别站在火中间”，说明她知道的东西比大人愿意承认的更多。"
        : "露丝几次表现出与年龄不符的不安。她对节日和火的恐惧，值得你继续追问。"
    });
  }

  if (flags.heardAboutFestival || flags.sawNightLanterns || flags.shadowedNightProcession) {
    threads.push({
      id: "thread-festival",
      title: "节日与夜间火光",
      status: flags.shadowedNightProcession ? "正在逼近" : "已有迹象",
      tone: "ember",
      nodeId: flags.shadowedNightProcession ? "entry-86" : "entry-180",
      cta: flags.shadowedNightProcession ? "回到夜间火光" : "回到傍晚不安",
      summary: flags.shadowedNightProcession
        ? "你已经亲眼看见夜里的火光正汇向某处。现在很难再把所谓节日理解成单纯的村庄庆典。"
        : "火把游行、灯塔、以及夜里活动起来的村民，正在慢慢拼成同一件事。"
    });
  }

  if (flags.visitedBlackStructure || flags.noticedStrangeOrientation || flags.foundAlignmentNote) {
    threads.push({
      id: "thread-alignment",
      title: "黑色建筑与校准",
      status: flags.foundAlignmentNote ? "线索成串" : "需要解释",
      tone: "cold",
      nodeId: flags.foundAlignmentNote ? "entry-118" : "entry-57",
      cta: flags.foundAlignmentNote ? "回到校准备忘" : "去看黑色建筑",
      summary: flags.foundAlignmentNote
        ? "黑色建筑的朝向、图书室里那张校准备忘，以及“让村子对准”的说法已经彼此咬合。你接下来需要找的是：它究竟在对准什么。"
        : "那座黑色金属建筑的方位和外观都过于刻意。它看起来不像普通村舍，更像整个村子里的某个核心装置。"
    });
  }

  if (flags.visitedRuinedChurch || flags.noticedScorchedAltar) {
    threads.push({
      id: "thread-church",
      title: "被掏空的教堂",
      status: flags.noticedScorchedAltar ? "留下痕迹" : "值得回想",
      tone: "warning",
      nodeId: "entry-34",
      cta: "回到坍圮教堂",
      summary: flags.noticedScorchedAltar
        ? "教堂的问题不只是破败。祭坛后的烟痕说明那里曾长期焚烧过什么，而真正的宗教标记几乎都被清掉了。"
        : "那座教堂的空洞感不像自然荒废，更像有人有选择地把某些意义从里面抹掉。"
    });
  }

  if (flags.learnedTelegraphDelay || flags.roadsBlocked || flags.spookedByForestCall) {
    threads.push({
      id: "thread-escape",
      title: "离村为何这么难",
      status: flags.roadsBlocked ? "已被证实" : "越来越真",
      tone: "neutral",
      nodeId: flags.roadsBlocked ? "entry-7" : "entry-28",
      cta: flags.roadsBlocked ? "回到出村受阻" : "再试离村",
      summary: flags.roadsBlocked
        ? "你已经确认两侧村口都有人把守。交通稀薄和电报损坏不再像倒霉巧合，更像村子整体把外部隔在外面。"
        : "无论是坏掉的电报线，还是树林里的异响，所有与“离开”有关的事情都在变得不自然。"
    });
  }

  return threads;
}

function renderEndingRecap(ending, state, milestones, onReset) {
  const container = document.getElementById("actionFeedback");
  container.innerHTML = "";

  const recap = document.createElement("div");
  recap.className = `ending-recap tone-${ending.tone}`;

  const toneIcon = getEndingToneIcon(ending.tone);
  const toneLabel = getEndingToneLabel(ending.tone);

  const triggeredMilestones = milestones.filter((m) => state.flags[m.flag]);
  const skillTicks = state.skillTicks || [];

  const hp = state.character.stats.hp;
  const san = state.character.stats.san;
  const mp = state.character.stats.mp;
  const luck = state.character.stats.luck;

  recap.innerHTML = `
    <div class="ending-recap-header">
      <span class="ending-tone-icon">${toneIcon}</span>
      <div class="ending-recap-title">
        <h3>${ending.label}</h3>
        <span class="ending-tone-label">${toneLabel}</span>
      </div>
    </div>
    <p class="ending-recap-summary">${ending.summary}</p>
    <div class="ending-recap-stats">
      <div class="ending-stat">
        <span class="ending-stat-label">路径长度</span>
        <strong>${state.history.length} 步</strong>
      </div>
      <div class="ending-stat">
        <span class="ending-stat-label">耐久</span>
        <strong>${hp.current} / ${hp.max}</strong>
      </div>
      <div class="ending-stat">
        <span class="ending-stat-label">理智</span>
        <strong>${san.current} / ${san.max}</strong>
      </div>
      <div class="ending-stat">
        <span class="ending-stat-label">魔法</span>
        <strong>${mp.current} / ${mp.max}</strong>
      </div>
      <div class="ending-stat">
        <span class="ending-stat-label">幸运</span>
        <strong>${luck}</strong>
      </div>
    </div>
    ${triggeredMilestones.length ? `
      <div class="ending-recap-section">
        <h4>触发的里程碑</h4>
        <ul class="ending-milestone-list">
          ${triggeredMilestones.map((m) => `<li><strong>${m.label}</strong><span>${m.description}</span></li>`).join("")}
        </ul>
      </div>
    ` : ""}
    ${skillTicks.length ? `
      <div class="ending-recap-section">
        <h4>技能成长</h4>
        <div class="ending-skill-ticks">
          ${skillTicks.map((s) => `<span class="ending-skill-pill">${s}</span>`).join("")}
        </div>
      </div>
    ` : ""}
    <button type="button" class="ending-restart-button">重新开始冒险</button>
  `;

  recap.querySelector(".ending-restart-button").addEventListener("click", onReset);
  container.appendChild(recap);
}

function renderDeathRecap(state, onReset) {
  const container = document.getElementById("sceneText");
  container.innerHTML = "";
  const actionList = document.getElementById("actionList");
  if (actionList) actionList.innerHTML = "";

  const deathNodeNum = (state.deathNodeId || "").replace("entry-", "");
  const skillTicks = state.skillTicks || [];

  const recap = document.createElement("div");
  recap.className = "ending-recap tone-death";
  recap.innerHTML = `
    <div class="ending-recap-header">
      <span class="ending-tone-icon">💀</span>
      <div class="ending-recap-title">
        <h3>耐久值归零</h3>
        <span class="ending-tone-label">死亡结局</span>
      </div>
    </div>
    <p class="ending-recap-summary">你的伤势过重，失去了意识，再也没有醒来。${deathNodeNum ? `（条目 ${deathNodeNum}）` : ""}</p>
    <div class="ending-recap-stats">
      <div class="ending-stat">
        <span class="ending-stat-label">路径长度</span>
        <span class="ending-stat-value">${state.history.length} 步</span>
      </div>
      <div class="ending-stat">
        <span class="ending-stat-label">耐久</span>
        <span class="ending-stat-value">0 / ${state.character.stats?.hp?.max ?? "?"}</span>
      </div>
      <div class="ending-stat">
        <span class="ending-stat-label">理智</span>
        <span class="ending-stat-value">${state.character.stats?.san?.current ?? "?"}</span>
      </div>
    </div>
    ${skillTicks.length ? `
    <div class="ending-recap-section">
      <h4>技能成长</h4>
      <div class="ending-skill-ticks">
        ${skillTicks.map((s) => `<span class="ending-skill-pill">${s}</span>`).join("")}
      </div>
    </div>` : ""}
    <button type="button" class="ending-restart-button">重新开始冒险</button>
  `;

  recap.querySelector(".ending-restart-button").addEventListener("click", onReset);
  container.appendChild(recap);
}

function getEndingToneIcon(tone) {
  switch (tone) {
    case "death": return "💀";
    case "escape": return "🏃";
    case "triumph": return "⭐";
    case "madness": return "🌀";
    case "sacrifice": return "🔥";
    default: return "📖";
  }
}

function getEndingToneLabel(tone) {
  switch (tone) {
    case "death": return "死亡结局";
    case "escape": return "逃离结局";
    case "triumph": return "胜利结局";
    case "madness": return "疯狂结局";
    case "sacrifice": return "献祭结局";
    default: return "结局";
  }
}

function renderEchoes(echoes) {
  const echoList = document.getElementById("echoList");
  echoList.innerHTML = "";

  echoes.forEach((echo) => {
    const li = document.createElement("li");
    if (echo.nodeId) {
      const nodeNum = echo.nodeId.replace("entry-", "");
      const tag = document.createElement("span");
      tag.className = "echo-node-tag";
      tag.textContent = `#${nodeNum}`;
      li.appendChild(tag);
    }
    const textSpan = document.createElement("span");
    textSpan.textContent = echo.text;
    li.appendChild(textSpan);
    if (echo.tone === "positive") li.classList.add("is-positive");
    if (echo.tone === "negative") li.classList.add("is-negative");
    echoList.appendChild(li);
  });

  // 更新 tab 上的最后一条文字
  const lastTextEl = document.getElementById('echoLastText');
  if (lastTextEl && echoes.length) {
    const last = echoes[echoes.length - 1].text;
    lastTextEl.textContent = last.slice(0, 28) + (last.length > 28 ? '…' : '');
  }
}

function renderHistory(history, nodeMap) {
  const historyList = document.getElementById("historyList");
  if (!historyList) return;
  historyList.innerHTML = "";

  history
    .slice(-8)
    .reverse()
    .forEach((id, index) => {
      const node = nodeMap[id];
      const item = document.createElement("li");
      item.className = "history-item";
      item.innerHTML = `
        <strong>${node ? node.title : id}</strong>
        <span>${index === 0 ? "当前停留点" : "此前经过节点"}</span>
      `;
      historyList.appendChild(item);
    });
}

function inferPhase(node) {
  const map = {
    "chapter-1": "抵达烬头",
    "chapter-2": "白昼调查",
    "chapter-3": "入夜与节日",
    "chapter-4": "火焰与终局"
  };
  return map[node.sliceId] || "游玩中";
}

function formatSceneText(raw) {
  const escaped = escapeHtml(raw);
  const highlighted = applyHighlights(escaped);
  const paragraphs = highlighted.split(/\n\n+/);
  return paragraphs
    .map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`)
    .join("");
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function applyHighlights(text) {
  // Attributes with English abbreviation: 力量(STR), 体质(CON), etc.
  text = text.replace(
    /(力量|体质|意志|敏捷|外貌|体形|智力|教育|幸运)\s*[\(（](STR|CON|POW|DEX|APP|SIZ|INT|EDU|Luck)[\)）]/g,
    '<span class="hl-attr">$1($2)</span>'
  );

  // Standalone attribute names (Chinese only, not already wrapped)
  text = text.replace(
    /(?<!<span[^>]*>)(力量|体质|意志|敏捷|外貌|体形|智力|教育)(?![\(（])/g,
    '<span class="hl-attr">$1</span>'
  );

  // Skill/quoted terms: 「技能名」 (with or without 检定/技能 suffix)
  text = text.replace(
    /「([^」]{1,12})」/g,
    '<span class="hl-skill">「$1」</span>'
  );

  // Mechanic keywords: 检定, 困难检定, 极难检定, 奖励骰, 惩罚骰
  text = text.replace(
    /(?<!<[^>]*)(?:困难检定|极难检定|奖励骰|惩罚骰)/g,
    '<span class="hl-mechanic">$&</span>'
  );

  // HP/SAN/MP/Luck changes: 回复/失去 N 点 耐久值/理智值/魔法值
  text = text.replace(
    /((?:回复|失去|损失|受到)\s*\d+\s*点(?:耐久值|HP|理智值|SAN|San|魔法值|MP|幸运值|幸运|Luck))/g,
    '<span class="hl-mechanic">$1</span>'
  );

  // Entry references: [条目 N]
  text = text.replace(
    /\[条目 (\d+)\]/g,
    '<span class="hl-ref">条目 $1</span>'
  );

  // Ending marker: 【剧终】
  text = text.replace(
    /【剧终】/g,
    '<span class="hl-ending">【剧终】</span>'
  );

  return text;
}

// ─── 路径条 + 导航抽屉交互 ───

export function initPathBarToggle() {
  const toggle = document.getElementById('cpbNavToggle');
  const layout = document.getElementById('storyLayout');
  if (!toggle || !layout) return;
  toggle.addEventListener('click', () => {
    const open = layout.classList.toggle('drawer-open');
    toggle.classList.toggle('is-open', open);
  });
}

// 角色面板折叠交互
export function initCharPanelToggle() {
  const btn = document.getElementById('charExpandBtn');
  const body = document.getElementById('charBody');
  const closeBtn = document.getElementById('charCloseBtn');
  if (!btn || !body) return;
  btn.addEventListener('click', () => {
    body.removeAttribute('hidden');
  });
  closeBtn && closeBtn.addEventListener('click', () => {
    body.setAttribute('hidden', '');
  });
}

// 行动回声折叠交互
export function initEchoToggle() {
  const toggleBtn = document.getElementById('echoToggleBtn');
  const closeBtn = document.getElementById('echoCloseBtn');
  const body = document.getElementById('echoBody');
  if (!toggleBtn || !body) return;
  toggleBtn.addEventListener('click', () => {
    body.removeAttribute('hidden');
  });
  closeBtn && closeBtn.addEventListener('click', () => {
    body.setAttribute('hidden', '');
  });
}

// 更新路径条数据（path-bar 已移除，保留供 app.js 调用）
export function updatePathBar(actLabel, nodeId, steps) {
  // 章节进度条由 renderChapterProgressBar 负责，此函数为空桩
}

// 更新行动回声最后一条
export function updateEchoLastText(text) {
  const el = document.getElementById('echoLastText');
  if (el) el.textContent = text || '暂无记录';
}

// 更新角色折叠态数据
export function updateCharCollapsed(character) {
  if (!character) return;
  const nameEl = document.getElementById('charCollapsedName');
  const statsEl = document.getElementById('charCollapsedStats');
  const portraitEl = document.getElementById('charCollapsedPortrait');

  if (nameEl) nameEl.textContent = character.name || '调查员';

  if (portraitEl) {
    if (character.portrait) {
      portraitEl.innerHTML = `<img src="${character.portrait}" alt="">`;
    } else {
      portraitEl.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
    }
  }

  if (statsEl) {
    const stats = [
      {
        label: 'HP', val: character.hp, max: character.maxHp, color: '#c86d5d',
        icon: `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`
      },
      {
        label: 'SAN', val: character.san, max: character.maxSan, color: '#9788c8',
        icon: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="12" rx="10" ry="6"/><circle cx="12" cy="12" r="3" fill="currentColor"/></svg>`
      },
      {
        label: 'MP', val: character.mp, max: character.maxMp, color: '#67a7b8',
        icon: `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6 8 4 12 4 15a8 8 0 0 0 16 0c0-3-2-7-8-13z"/></svg>`
      },
      {
        label: 'LCK', val: character.luck, max: character.maxLuck, color: '#d7b15a',
        icon: `<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`
      },
    ];
    statsEl.innerHTML = stats.map(s => {
      const pct = s.max ? s.val / s.max : 1;
      const low = pct < 0.3 ? ' is-low' : '';
      return `<div class="char-stat-chip">
        <span class="char-stat-icon" style="color:${s.color}">${s.icon}</span>
        <span class="char-stat-val${low}">${s.val ?? '—'}</span>
      </div>`;
    }).join('');
  }
}

// 章节进度条渲染
export function renderChapterProgressBar(state, chapterGroups, nodes) {
  const track = document.getElementById('cpbTrack');
  if (!track) return;
  track.innerHTML = '';

  const history = state.history || [];
  const currentId = state.currentNodeId;

  // 显示历史路径 + 当前节点（去重，保持顺序）
  const sequence = [...history];
  if (currentId && sequence[sequence.length - 1] !== currentId) {
    sequence.push(currentId);
  }

  sequence.forEach((nodeId, i) => {
    // 连接线
    if (i > 0) {
      const line = document.createElement('div');
      line.className = 'cpb-connector';
      track.appendChild(line);
    }

    const num = nodeId.replace('entry-', '');

    const dot = document.createElement('div');
    dot.className = 'cpb-node--chapter';
    if (nodeId === currentId) dot.classList.add('is-current');
    else dot.classList.add('is-visited');

    const dotInner = document.createElement('div');
    dotInner.className = 'cpb-node-dot';
    dot.appendChild(dotInner);

    const label = document.createElement('span');
    label.className = 'cpb-node-num';
    label.textContent = num;
    dot.appendChild(label);

    track.appendChild(dot);
  });

  // 自动滚动到最右（当前节点）
  track.scrollLeft = track.scrollWidth;
}
