/**
 * 战斗弹出层 UI — 渲染状态条、回合日志、动作按钮
 */

export function openCombatOverlay() {
  document.getElementById("combat-overlay").classList.add("open");
}

export function closeCombatOverlay() {
  document.getElementById("combat-overlay").classList.remove("open");
}

export function renderCombatOverlay(combatState, script, callbacks) {
  if (script.type === "opposed-roll") {
    renderOpposedOverlay(combatState, script, callbacks);
  } else if (script.type === "dual-claw") {
    renderDualClawOverlay(combatState, script, callbacks);
  } else {
    renderMeleeOverlay(combatState, script, callbacks);
  }
  scrollLogToBottom();
}

// ─── 双爪攻击 UI ───

function renderDualClawOverlay(combatState, script, callbacks) {
  const title = document.getElementById("combatTitle");
  const desc = document.getElementById("combatDescription");
  const status = document.getElementById("combatStatus");
  const log = document.getElementById("combatLog");
  const actions = document.getElementById("combatActions");

  title.textContent = script.label;
  desc.textContent = script.description;

  const playerPercent = Math.max(0, (combatState.playerCurrentHp / combatState.playerMaxHp) * 100);
  status.innerHTML = `
    <div class="combat-status-bar bar-player">
      <div class="bar-label">
        <span>你的 HP</span>
        <span>${combatState.playerCurrentHp} / ${combatState.playerMaxHp}</span>
      </div>
      <div class="bar-track">
        <div class="bar-fill" style="width: ${playerPercent}%"></div>
      </div>
    </div>
  `;

  renderLog(log, combatState.log);
  renderDualClawActions(actions, combatState, script, callbacks);
}

function renderDualClawActions(container, combatState, script, callbacks) {
  container.innerHTML = "";

  if (combatState.phase === "ready") {
    const btn = createButton("开始结算", "btn-primary", () => callbacks.onStart());
    container.appendChild(btn);
    return;
  }

  if (combatState.phase === "awaitingRoll" && combatState.pendingRoll) {
    const roll = combatState.pendingRoll;
    const btn = createButton(`掷骰：${roll.label}`, "btn-roll", () => callbacks.onRoll(roll));
    container.appendChild(btn);
    return;
  }

  if (combatState.phase === "combatEnd") {
    const resultDiv = document.createElement("div");
    resultDiv.className = "combat-result";
    const resultClass = combatState.outcome.result === "lose" ? "result-lose" : "result-win";
    resultDiv.innerHTML = `<p class="result-text ${resultClass}">${combatState.outcome.summary}</p>`;
    container.appendChild(resultDiv);

    const btn = createButton("继续冒险", "btn-primary", () => callbacks.onEnd(combatState.outcome));
    container.appendChild(btn);
  }
}

// ─── 对抗检定 UI ───

function renderOpposedOverlay(combatState, script, callbacks) {
  const title = document.getElementById("combatTitle");
  const desc = document.getElementById("combatDescription");
  const status = document.getElementById("combatStatus");
  const log = document.getElementById("combatLog");
  const actions = document.getElementById("combatActions");

  title.textContent = script.label;
  desc.textContent = script.description;

  status.innerHTML = `
    <div class="combat-opposed-info" style="width:100%">
      <div class="opposed-side">
        <div class="side-label">你</div>
        <div class="side-value">${script.player.stat.label} ${combatState.playerTarget}</div>
      </div>
      <div class="opposed-vs">VS</div>
      <div class="opposed-side">
        <div class="side-label">${script.enemy.name}</div>
        <div class="side-value">${script.enemy.stat.label}</div>
      </div>
    </div>
  `;

  renderLog(log, combatState.log);
  renderOpposedActions(actions, combatState, script, callbacks);
}

function renderOpposedActions(container, combatState, script, callbacks) {
  container.innerHTML = "";

  if (combatState.phase === "ready") {
    const btn = createButton("开始对抗", "btn-primary", () => {
      callbacks.onStart();
    });
    container.appendChild(btn);
    return;
  }

  if (combatState.phase === "awaitingRoll" && combatState.pendingRoll) {
    const roll = combatState.pendingRoll;
    const btn = createButton(`掷骰：${roll.label}`, "btn-roll", () => {
      callbacks.onRoll(roll);
    });
    container.appendChild(btn);
    return;
  }

  if (combatState.phase === "combatEnd") {
    const resultDiv = document.createElement("div");
    resultDiv.className = "combat-result";
    const resultClass = combatState.outcome.result === "win" ? "result-win" : "result-lose";
    resultDiv.innerHTML = `<p class="result-text ${resultClass}">${combatState.outcome.summary}</p>`;
    container.appendChild(resultDiv);

    const btn = createButton("继续冒险", "btn-primary", () => {
      callbacks.onEnd(combatState.outcome);
    });
    container.appendChild(btn);
  }
}

// ─── 多回合近战 UI ───

function renderMeleeOverlay(combatState, script, callbacks) {
  const title = document.getElementById("combatTitle");
  const desc = document.getElementById("combatDescription");
  const status = document.getElementById("combatStatus");
  const log = document.getElementById("combatLog");
  const actions = document.getElementById("combatActions");

  title.textContent = script.label;
  desc.textContent = script.description;

  renderMeleeStatus(status, combatState, script);
  renderLog(log, combatState.log);
  renderMeleeActions(actions, combatState, script, callbacks);
}

function renderMeleeStatus(container, combatState, script) {
  const playerPercent = Math.max(0, (combatState.playerCurrentHp / combatState.playerMaxHp) * 100);
  const enemyPercent = Math.max(0, (combatState.enemyHp / script.enemy.hp) * 100);

  container.innerHTML = `
    <div class="combat-status-bar bar-player">
      <div class="bar-label">
        <span>你的 HP</span>
        <span>${combatState.playerCurrentHp} / ${combatState.playerMaxHp}</span>
      </div>
      <div class="bar-track">
        <div class="bar-fill" style="width: ${playerPercent}%"></div>
      </div>
    </div>
    <div class="combat-status-bar bar-enemy">
      <div class="bar-label">
        <span>${script.enemy.name} HP</span>
        <span>${Math.max(0, combatState.enemyHp)} / ${script.enemy.hp}</span>
      </div>
      <div class="bar-track">
        <div class="bar-fill" style="width: ${enemyPercent}%"></div>
      </div>
    </div>
  `;
}

function renderMeleeActions(container, combatState, script, callbacks) {
  container.innerHTML = "";

  if (combatState.phase === "ready") {
    if (combatState.availableWeapons.length > 1 && !combatState.playerWeapon) {
      const weaponDiv = document.createElement("div");
      weaponDiv.className = "combat-weapon-select";
      for (const w of combatState.availableWeapons) {
        const opt = document.createElement("button");
        opt.className = "weapon-option";
        opt.textContent = `${w.label}（${w.damageLabel || w.damage}）`;
        opt.addEventListener("click", () => {
          callbacks.onWeaponSelect(w);
          weaponDiv.querySelectorAll(".weapon-option").forEach(el => el.classList.remove("selected"));
          opt.classList.add("selected");
        });
        weaponDiv.appendChild(opt);
      }
      container.appendChild(weaponDiv);
    }

    const btn = createButton("开始战斗", "btn-primary", () => {
      callbacks.onStart();
    });
    container.appendChild(btn);
    return;
  }

  if (combatState.phase === "awaitingPlayerChoice") {
    const btn1 = createButton("反击（格斗）", "btn-primary", () => {
      callbacks.onChoice("fightBack");
    });
    const btn2 = createButton("闪避", "", () => {
      callbacks.onChoice("dodge");
    });
    container.appendChild(btn1);
    container.appendChild(btn2);

    if (script.specialActions) {
      for (const sa of script.specialActions) {
        if (combatState.round >= sa.availableAfterRound) {
          const escBtn = createButton(sa.label, "btn-danger", () => {
            callbacks.onChoice("escape");
          });
          container.appendChild(escBtn);
        }
      }
    }
    return;
  }

  if (combatState.phase === "awaitingRoll" && combatState.pendingRoll) {
    const roll = combatState.pendingRoll;
    const btn = createButton(`掷骰：${roll.label}`, "btn-roll", () => {
      callbacks.onRoll(roll);
    });
    container.appendChild(btn);
    return;
  }

  if (combatState.phase === "roundEnd") {
    const btn = createButton("下一轮", "btn-primary", () => {
      callbacks.onNextRound();
    });
    container.appendChild(btn);
    return;
  }

  if (combatState.phase === "combatEnd") {
    const resultDiv = document.createElement("div");
    resultDiv.className = "combat-result";
    const resultClass = combatState.outcome.result === "lose" ? "result-lose" : "result-win";
    resultDiv.innerHTML = `<p class="result-text ${resultClass}">${combatState.outcome.summary}</p>`;
    container.appendChild(resultDiv);

    const btn = createButton("继续冒险", "btn-primary", () => {
      callbacks.onEnd(combatState.outcome);
    });
    container.appendChild(btn);
  }
}

// ─── 通用渲染 ───

function renderLog(container, logEntries) {
  container.innerHTML = "";
  for (const entry of logEntries) {
    const div = document.createElement("div");
    div.className = `combat-log-entry tone-${entry.tone || "neutral"}`;
    div.textContent = entry.text;
    container.appendChild(div);
  }
}

function scrollLogToBottom() {
  const log = document.getElementById("combatLog");
  if (log) log.scrollTop = log.scrollHeight;
}

function createButton(text, extraClass, onClick) {
  const btn = document.createElement("button");
  btn.className = `combat-btn ${extraClass}`.trim();
  btn.textContent = text;
  btn.addEventListener("click", onClick);
  return btn;
}
