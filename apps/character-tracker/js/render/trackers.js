/**
 * render/trackers.js - Trackers 渲染（支持 L1 始终可编辑）
 */

function renderTrackers(data) {
    let d = data.derived;
    let hpCurrent = d.HP_current !== undefined ? d.HP_current : d.HP;
    let mpCurrent = d.MP_current !== undefined ? d.MP_current : d.MP;
    let san = d.SAN || 0;
    let sanMax = d.SAN_MAX || 99;
    let sanStart = d.SAN_START || san;
    let luck = data.luck || 0;
    let statuses = d.statuses || {};

    // HP 超出最大值的警告样式
    let hpWarn = hpCurrent > d.HP ? ' value-warn' : '';
    let mpWarn = mpCurrent > d.MP ? ' value-warn' : '';
    let sanWarn = san > sanMax ? ' value-warn' : '';

    document.getElementById('trackerStrip').innerHTML = `
      <!-- HP -->
      <div class="tracker hp">
        <div class="tracker-label">生命值 HIT POINTS</div>
        <div class="tracker-values">
          <button class="adj-btn minus" onclick="modifyHP(-1)" title="-1">−</button>
          <div class="tracker-current editable-value${hpWarn}" onclick="editHP(this)">${hpCurrent}</div>
          <div class="tracker-sep">/</div>
          <div class="tracker-max">${d.HP}</div>
          <button class="adj-btn plus" onclick="modifyHP(1)" title="+1">+</button>
        </div>
        <div class="hp-status">
          <div class="hp-status-item" onclick="toggleStatus('majorWound')">
            <div class="hp-status-check${statuses.majorWound ? ' checked' : ''}">${statuses.majorWound ? '✓' : ''}</div>
            <div class="hp-status-label">重伤</div>
          </div>
          <div class="hp-status-item" onclick="toggleStatus('dying')">
            <div class="hp-status-check${statuses.dying ? ' checked' : ''}">${statuses.dying ? '✓' : ''}</div>
            <div class="hp-status-label">濒死</div>
          </div>
          <div class="hp-status-item" onclick="toggleStatus('unconscious')">
            <div class="hp-status-check${statuses.unconscious ? ' checked' : ''}">${statuses.unconscious ? '✓' : ''}</div>
            <div class="hp-status-label">昏迷</div>
          </div>
        </div>
      </div>
      <!-- Luck -->
      <div class="tracker luck">
        <div class="tracker-label">幸运 LUCK</div>
        <div class="tracker-check-cell">
          <div class="check-cell">
            <div class="ck-main editable-value" onclick="editLuck(this)">${luck}</div>
            <div class="ck-half">${half(luck)}</div>
            <div class="ck-fifth">${fifth(luck)}</div>
          </div>
        </div>
      </div>
      <!-- Logo -->
      <div class="tracker-logo">CALL OF<br>CTHULHU</div>
      <!-- MP -->
      <div class="tracker mp">
        <div class="tracker-label">魔法点 MAGIC POINTS</div>
        <div class="tracker-values">
          <button class="adj-btn minus" onclick="modifyMP(-1)" title="-1">−</button>
          <div class="tracker-current editable-value${mpWarn}" onclick="editMP(this)">${mpCurrent}</div>
          <div class="tracker-sep">/</div>
          <div class="tracker-max">${d.MP}</div>
          <button class="adj-btn plus" onclick="modifyMP(1)" title="+1">+</button>
        </div>
      </div>
      <!-- SAN -->
      <div class="tracker san">
        <div class="tracker-label">理智 SANITY</div>
        <div class="tracker-values">
          <button class="adj-btn minus" onclick="modifySAN(-1)" title="-1">−</button>
          <div class="tracker-current editable-value${sanWarn}" onclick="editSAN(this)">${san}</div>
          <div class="tracker-sep">/</div>
          <div class="tracker-max">${sanMax}</div>
          <button class="adj-btn plus" onclick="modifySAN(1)" title="+1">+</button>
        </div>
        <div class="san-info">
          <div class="san-insanity">
            <div class="san-ins-item" onclick="toggleStatus('temporaryInsanity')">
              <div class="san-ins-label">临时性</div>
              <div class="san-ins-check${statuses.temporaryInsanity ? ' checked' : ''}">${statuses.temporaryInsanity ? '✓' : ''}</div>
            </div>
            <div class="san-ins-item" onclick="toggleStatus('indefiniteInsanity')">
              <div class="san-ins-label">不定性</div>
              <div class="san-ins-check${statuses.indefiniteInsanity ? ' checked' : ''}">${statuses.indefiniteInsanity ? '✓' : ''}</div>
            </div>
            <div class="san-ins-item" onclick="toggleStatus('permanentInsanity')">
              <div class="san-ins-label">永久性</div>
              <div class="san-ins-check${statuses.permanentInsanity ? ' checked' : ''}">${statuses.permanentInsanity ? '✓' : ''}</div>
            </div>
          </div>
          <div class="san-ref">
            <div class="san-ref-item"><div class="san-ref-label">Start</div><div class="san-ref-oval">${sanStart}</div></div>
            <div class="san-ref-item"><div class="san-ref-label">Max</div><div class="san-ref-oval">${sanMax}</div></div>
          </div>
        </div>
      </div>`;
  }
