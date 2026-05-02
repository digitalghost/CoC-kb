/**
 * render/attributes.js - Attributes 渲染（支持守秘人模式编辑）
 */

function renderAttributes(data) {
    let grid = document.getElementById('attributesGrid');
    let html = '';
    let attrs = data.effectiveAttrs || data.rawAttrs || {};
    let km = window.isKeeperMode ? window.isKeeperMode() : false;

    ATTR_KEYS.forEach(key => {
      let val = attrs[key] !== undefined ? attrs[key] : (data.rawAttrs[key] || 0);
      let mainClass = km ? 'ck-main editable-value' : 'ck-main';
      let mainClick = km ? ' onclick="editAttribute(\'' + key + '\', this)"' : '';
      html += `<div class="attr-box${km ? ' keeper-editable' : ''}">
        <div class="attr-header"><span class="attr-label">${key}</span> <span class="attr-name">${ATTR_NAMES[key]}</span> <button class="dice-btn" title="投骰检定">${DICE_SVG_LG}</button></div>
        <div class="check-cell">
          <div class="${mainClass}"${mainClick}>${val}</div>
          <div class="ck-half">${half(val)}</div>
          <div class="ck-fifth">${fifth(val)}</div>
        </div>
      </div>`;
    });

    // MOV
    let mov = data.derived.MOV || 8;
    html += `<div class="attr-box">
      <div class="attr-header"><span class="attr-label">MOV</span> <span class="attr-name">移动</span></div>
      <div class="attr-value-simple">${mov}</div>
    </div>`;

    grid.innerHTML = html;
  }
