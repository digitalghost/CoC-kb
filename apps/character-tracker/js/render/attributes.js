/**
 * render/attributes.js - Attributes 渲染
 */

function renderAttributes(data) {
    let grid = document.getElementById('attributesGrid');
    let html = '';
    // 优先使用有效属性（年龄调整后的值），回退到 rawAttrs
    let attrs = data.effectiveAttrs || data.rawAttrs || {};
    ATTR_KEYS.forEach(key => {
      let val = attrs[key] !== undefined ? attrs[key] : (data.rawAttrs[key] || 0);
      html += `<div class="attr-box">
        <div class="attr-header"><span class="attr-label">${key}</span> <span class="attr-name">${ATTR_NAMES[key]}</span> <button class="dice-btn" title="投骰检定">${DICE_SVG_LG}</button></div>
        <div class="check-cell">
          <div class="ck-main">${val}</div>
          <div class="ck-half">${half(val)}</div>
          <div class="ck-fifth">${fifth(val)}</div>
        </div>
      </div>`;
    });
    // MOV
    let mov = data.derived.MOV || 8;
    html += `<div class="attr-box">
      <div class="attr-label">MOV</div>
      <div class="attr-name">移动</div>
      <div class="attr-value-simple">${mov}</div>
    </div>`;
    grid.innerHTML = html;
  }
