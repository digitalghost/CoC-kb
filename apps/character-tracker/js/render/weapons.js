/**
 * render/weapons.js - Weapons 渲染
 */

function renderWeapons(data) {
    let weapons = data.weapons || [];
    let attrs = data.rawAttrs;
    let sp = data.skillPoints || {};
    let d = data.derived;

    let tbodyHtml = '';
    weapons.forEach(w => {
      let skillName = w.skill || '';
      let skillVal = calcSkillTotal(skillName, attrs, sp);
      let name = w.name || '';
      // 徒手武器用斜体
      let tdClass = (name.includes('徒手') || name.includes('拳打脚踢')) ? ' class="preset-weapon"' : '';
      tbodyHtml += `<tr>
        <td${tdClass}><div class="weapon-input">${name}</div></td>
        <td><div class="weapon-input">${skillVal}</div></td>
        <td><div class="weapon-input">${skillVal > 0 ? half(skillVal) : ''}</div></td>
        <td><div class="weapon-input">${skillVal > 0 ? fifth(skillVal) : ''}</div></td>
        <td><div class="weapon-input">${w.damage || ''}</div></td>
        <td><div class="weapon-input">${w.baseRange || '—'}</div></td>
        <td><div class="weapon-input">${w.attacksPerRound || '1'}</div></td>
        <td><div class="weapon-input">${w.capacity || '—'}</div></td>
        <td><div class="weapon-input">${w.malfunction || '—'}</div></td>
      </tr>`;
    });

    document.getElementById('bottomSection').innerHTML = `
      <div class="weapons-panel">
        <div class="section-header">武器 WEAPONS</div>
        <table class="weapons-table">
          <thead><tr>
            <th>武器</th><th>常规</th><th>困难</th><th>极难</th>
            <th>伤害</th><th>射程</th><th>次数</th><th>装弹量</th><th>故障值</th>
          </tr></thead>
          <tbody>${tbodyHtml}</tbody>
        </table>
      </div>
      <div class="combat-panel">
        <div class="section-header">格斗 COMBAT</div>
        <div class="combat-field">
          <div class="combat-field-label">DAMAGE BONUS</div>
          <div class="combat-field-name">伤害加值</div>
          <div class="combat-oval">${d.DB || '0'}</div>
        </div>
        <div class="combat-field">
          <div class="combat-field-label">BUILD</div>
          <div class="combat-field-name">体格</div>
          <div class="combat-oval">${d.build || 0}</div>
        </div>
        <div class="combat-field">
          <div class="combat-field-label">DODGE</div>
          <div class="combat-field-name">躲闪</div>
          <div class="check-cell" style="margin:0 auto;">
            <div class="ck-main">${d.dodge || 0}</div>
            <div class="ck-half">${half(d.dodge || 0)}</div>
            <div class="ck-fifth">${fifth(d.dodge || 0)}</div>
          </div>
        </div>
      </div>`;
  }
