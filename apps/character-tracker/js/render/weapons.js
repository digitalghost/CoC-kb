/**
 * render/weapons.js - Weapons 渲染（支持 L2 编辑模式下增删改）
 */

function renderWeapons(data) {
    let weapons = data.weapons || [];
    let attrs = data.effectiveAttrs || data.rawAttrs;
    let sp = data.skillPoints || {};
    let d = data.derived;
    let em = window.isEditMode ? window.isEditMode() : false;

    const SKILL_ALIASES = {
      '射击(步枪)': '射击(步枪/霰弹枪)',
      '射击(霰弹枪)': '射击(步枪/霰弹枪)',
    };

    let tbodyHtml = '';
    weapons.forEach((w, idx) => {
      let skillName = SKILL_ALIASES[w.skill] || w.skill || '';
      let skillVal = calcSkillTotal(skillName, attrs, sp);
      let name = w.name || '';
      let tdClass = (name.includes('徒手') || name.includes('拳打脚踢')) ? ' class="preset-weapon"' : '';

      // 编辑模式下，单元格可点击编辑
      let nameContent = em
        ? `<div class="weapon-input editable-value" onclick="editWeaponField(${idx}, 'name', this)">${name}</div>`
        : `<div class="weapon-input">${name}</div>`;
      let dmgContent = em
        ? `<div class="weapon-input editable-value" onclick="editWeaponField(${idx}, 'damage', this)">${w.damage || ''}</div>`
        : `<div class="weapon-input">${w.damage || ''}</div>`;
      let rangeContent = em
        ? `<div class="weapon-input editable-value" onclick="editWeaponField(${idx}, 'baseRange', this)">${w.baseRange || '—'}</div>`
        : `<div class="weapon-input">${w.baseRange || '—'}</div>`;
      let aprContent = em
        ? `<div class="weapon-input editable-value" onclick="editWeaponField(${idx}, 'attacksPerRound', this)">${w.attacksPerRound || '1'}</div>`
        : `<div class="weapon-input">${w.attacksPerRound || '1'}</div>`;
      let capContent = em
        ? `<div class="weapon-input editable-value" onclick="editWeaponField(${idx}, 'capacity', this)">${w.capacity || '—'}</div>`
        : `<div class="weapon-input">${w.capacity || '—'}</div>`;
      let malContent = em
        ? `<div class="weapon-input editable-value" onclick="editWeaponField(${idx}, 'malfunction', this)">${w.malfunction || '—'}</div>`
        : `<div class="weapon-input">${w.malfunction || '—'}</div>`;
      let delBtn = em ? `<td class="weapon-del-cell"><button class="weapon-del-btn" onclick="deleteWeapon(${idx})" title="删除">✕</button></td>` : '';

      tbodyHtml += `<tr>
        <td${tdClass}>${nameContent}</td>
        <td><div class="weapon-input">${skillVal}</div></td>
        <td><div class="weapon-input">${skillVal > 0 ? half(skillVal) : ''}</div></td>
        <td><div class="weapon-input">${skillVal > 0 ? fifth(skillVal) : ''}</div></td>
        <td>${dmgContent}</td>
        <td>${rangeContent}</td>
        <td>${aprContent}</td>
        <td>${capContent}</td>
        <td>${malContent}</td>
        ${delBtn}
      </tr>`;
    });

    let addBtn = em ? '<button class="weapon-add-btn" onclick="addWeapon()">+ 添加武器</button>' : '';
    let delHeader = em ? '<th></th>' : '';

    document.getElementById('bottomSection').innerHTML = `
      <div class="weapons-panel">
        <div class="section-header">武器 WEAPONS</div>
        ${addBtn}
        <table class="weapons-table">
          <thead><tr>
            <th>武器</th><th>常规</th><th>困难</th><th>极难</th>
            <th>伤害</th><th>射程</th><th>次数</th><th>装弹量</th><th>故障值</th>
            ${delHeader}
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
