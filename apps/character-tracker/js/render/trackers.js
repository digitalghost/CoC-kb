/**
 * render/trackers.js - Trackers 渲染
 */

function renderTrackers(data) {
    let d = data.derived;
    let hp = d.HP || 0, mp = d.MP || 0, san = d.SAN || 0, luck = data.luck || 0;
    let sanStart = san; // 创建器 SAN 初始值 = POW

    document.getElementById('trackerStrip').innerHTML = `
      <!-- HP -->
      <div class="tracker hp">
        <div class="tracker-label">生命值 HIT POINTS</div>
        <div class="tracker-values">
          <div class="tracker-current">${hp}</div>
          <div class="tracker-sep">/</div>
          <div class="tracker-max">${hp}</div>
        </div>
        <div class="hp-status">
          <div class="hp-status-item"><div class="hp-status-check"></div><div class="hp-status-label">重伤</div></div>
          <div class="hp-status-item"><div class="hp-status-check"></div><div class="hp-status-label">濒死</div></div>
          <div class="hp-status-item"><div class="hp-status-check"></div><div class="hp-status-label">昏迷</div></div>
        </div>
      </div>
      <!-- Luck -->
      <div class="tracker luck">
        <div class="tracker-label">幸运 LUCK</div>
        <div class="tracker-values"><div class="tracker-current">${luck}</div></div>
        <div class="tracker-check-cell">
          <div class="check-cell">
            <div class="ck-main">${luck}</div><div class="ck-half">${half(luck)}</div><div class="ck-fifth">${fifth(luck)}</div>
          </div>
        </div>
      </div>
      <!-- Logo -->
      <div class="tracker-logo">CALL OF<br>CTHULHU</div>
      <!-- MP -->
      <div class="tracker mp">
        <div class="tracker-label">魔法点 MAGIC POINTS</div>
        <div class="tracker-values">
          <div class="tracker-current">${mp}</div>
          <div class="tracker-sep">/</div>
          <div class="tracker-max">${mp}</div>
        </div>
      </div>
      <!-- SAN -->
      <div class="tracker san">
        <div class="tracker-label">理智 SANITY</div>
        <div class="tracker-values">
          <div class="tracker-current">${san}</div>
          <div class="tracker-sep">/</div>
          <div class="tracker-max">99</div>
        </div>
        <div class="san-info">
          <div class="san-insanity">
            <div class="san-ins-item"><div class="san-ins-label">临时性</div><div class="san-ins-check"></div></div>
            <div class="san-ins-item"><div class="san-ins-label">不定性</div><div class="san-ins-check"></div></div>
            <div class="san-ins-item"><div class="san-ins-label">永久性</div><div class="san-ins-check"></div></div>
          </div>
          <div class="san-ref">
            <div class="san-ref-item"><div class="san-ref-label">Start</div><div class="san-ref-oval">${sanStart}</div></div>
            <div class="san-ref-item"><div class="san-ref-label">Max</div><div class="san-ref-oval">99</div></div>
          </div>
        </div>
      </div>`;
  }
