/**
 * render/skills.js - Skills 渲染（支持 L2 编辑模式下技能值编辑）
 */

function renderSkills(data) {
  let grid = document.getElementById('skillsGrid');
  let attrs = data.effectiveAttrs || data.rawAttrs;
  let sp = data.skillPoints || {};
  let occSkills = data.occSkills || [];
  let em = window.isEditMode ? window.isEditMode() : false;
  let growthMarks = data.growthMarks || {};

  // 收集所有技能名
  let categories = [
    { title: '常规技能', skills: Object.keys(SKILLS_DATA.regular) },
    { title: '格斗专攻', skills: Object.keys(SKILLS_DATA.combat).map(s => '格斗(' + s + ')') },
    { title: '射击专攻', skills: Object.keys(SKILLS_DATA.firearms).map(s => '射击(' + s + ')') },
    { title: '科学专攻', skills: Object.keys(SKILLS_DATA.science).map(s => '科学(' + s + ')') },
    { title: '艺术和手艺', skills: Object.keys(SKILLS_DATA.artCraft).map(s => '艺术和手艺(' + s + ')') },
    { title: '生存', skills: Object.keys(SKILLS_DATA.survival).map(s => '生存(' + s + ')') }
  ];

  // 收集自定义技能
  let customSkills = [];
  for (let k in sp) {
    let isPreset = false;
    for (let cat of categories) {
      if (cat.skills.includes(k)) { isPreset = true; break; }
    }
    if (!isPreset) customSkills.push(k);
  }
  if (customSkills.length > 0) {
    categories.push({ title: '其他技能', skills: customSkills });
  }

  function isOccSkill(skillName) {
    return occSkills.some(s => {
      if (s === skillName) return true;
      if (skillName.startsWith(s + '(') && skillName.endsWith(')')) return true;
      return false;
    });
  }

  function skillRowHtml(skillName) {
    let total = calcSkillTotal(skillName, attrs, sp);
    let occ = isOccSkill(skillName);
    let occTag = occ ? '<span class="tag-occ">职</span>' : '';
    let checked = growthMarks[skillName] ? ' checked' : '';
    let mainClass = em ? 'ck-main editable-value' : 'ck-main';
    let mainClick = em ? ' onclick="editSkillValue(\'' + skillName.replace(/'/g, "\\'") + '\', this)"' : '';
    return `<div class="skill-row${occ ? ' skill-row-occ' : ''}">
      <input type="checkbox" class="skill-checkbox"${checked} onchange="toggleGrowthMark('${skillName.replace(/'/g, "\\'")}', this)">
      <div class="skill-name">${skillName}${occTag}</div>
      <div class="check-cell-inline">
        <div class="${mainClass}"${mainClick}>${total > 0 ? total : ''}</div>
        <div class="ck-half">${total > 0 ? half(total) : ''}</div>
        <div class="ck-fifth">${total > 0 ? fifth(total) : ''}</div>
      </div>
      <button class="dice-btn skill-dice" title="投骰检定">${DICE_SVG}</button>
    </div>`;
  }

  // 四区块分类
  let group1 = [], group2 = [], group3 = [], group4 = [];

  categories.forEach(cat => {
    cat.skills.forEach(skillName => {
      let total = calcSkillTotal(skillName, attrs, sp);
      let occ = isOccSkill(skillName);
      let pts = sp[skillName] || {};
      let hasPoints = (pts.occ > 0 || pts.int > 0);

      if (occ) {
        group1.push(skillName);
      } else if (hasPoints) {
        group2.push(skillName);
      } else if (total > 0) {
        group3.push(skillName);
      } else {
        group4.push(skillName);
      }
    });
  });

  function renderBlock(title, skills, collapsed, icon) {
    if (skills.length === 0) return '';
    let collapseClass = collapsed ? ' collapsed' : '';
    let chevron = collapsed ? '&#9654;' : '&#9660;';
    let count = `<span class="skill-block-count">${skills.length}</span>`;
    let html = `<div class="skill-block${collapseClass}">
      <div class="skill-block-header" onclick="this.parentElement.classList.toggle('collapsed')">
        <span class="skill-block-icon">${icon}</span>
        <span class="skill-block-title">${title}</span>
        ${count}
        <span class="skill-block-toggle">${chevron}</span>
      </div>
      <div class="skill-block-body">`;
    skills.forEach(s => { html += skillRowHtml(s); });
    html += `</div></div>`;
    return html;
  }

  let html = '';
  html += renderBlock('调查员职业技能', group1, false, '&#9733;');
  html += renderBlock('非职业技能', group2, false, '&#9670;');
  html += renderBlock('其他技能', group3, true, '&#8226;');
  html += renderBlock('一窍不通', group4, true, '&#8212;');

  grid.innerHTML = html;
}
