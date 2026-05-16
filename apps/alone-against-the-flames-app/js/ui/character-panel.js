import { characterAdapter, getSkillBase, getSkillTotal, half, fifth } from "../adapters/character-adapter.js";
import { ATTR_KEYS, ATTR_NAMES } from "../data/skills-data.js";

export function renderCharacterPanel(character, container, skillTicks = [], flags = {}) {
  if (!container || !character) return;

  const attrs = character.effectiveAttrs || character.rawAttrs || {};
  const derived = character.derived || {};
  const trackerBars = characterAdapter.getTrackerBars(character);
  const skillList = characterAdapter.getFullSkillList(character);
  const equipment = characterAdapter.getInventory(character);
  const portraitUrl = characterAdapter.getPortraitUrl(character);
  const identityMeta = characterAdapter.getIdentityMeta(character);

  container.innerHTML = `
    ${renderIdentity(character, portraitUrl, identityMeta, flags)}
    ${renderTrackers(trackerBars)}
    ${renderAttributes(attrs)}
    ${renderDerived(derived)}
    ${renderSkillSection(skillList, skillTicks)}
    ${renderEquipment(equipment)}
  `;

  bindSkillToggle(container);
}

function renderIdentity(character, portraitUrl, identityMeta, flags = {}) {
  const portraitContent = portraitUrl
    ? `<img class="cp-portrait-img" src="${portraitUrl}" alt="调查员头像" onerror="this.style.display='none';this.nextElementSibling.style.display='grid'">`
    : "";

  const attrs = character.effectiveAttrs || character.rawAttrs || {};
  const creditFromSkill = getSkillTotal("信用评级", attrs, character.skillPoints || {});
  const creditRating = creditFromSkill || character.creditRating || 0;
  const creditDisplay = `<span class="cp-credit">信用评级 ${creditRating}</span>`;
  const majorWoundBadge = flags.majorWound
    ? `<span class="cp-status-badge cp-status-major-wound">⚠ 重伤</span>`
    : "";

  return `
    <div class="cp-identity">
      <div class="cp-portrait">
        ${portraitContent}
        <div class="cp-portrait-placeholder" ${portraitUrl ? 'style="display:none"' : ""}>调查员</div>
      </div>
      <div class="cp-identity-text">
        <strong class="cp-name">${esc(character.name)}</strong>
        <span class="cp-occupation">${esc(character.occupation)}</span>
        <span class="cp-meta">${esc(identityMeta)}</span>
        ${creditDisplay}
        ${majorWoundBadge}
      </div>
    </div>
  `;
}

function renderTrackers(bars) {
  return `
    <div class="cp-trackers">
      ${bars.map((bar) => `
        <div class="cp-tracker tone-${bar.tone}">
          <div class="cp-tracker-head">
            <span>${bar.label}</span>
            <strong>${bar.current}/${bar.max}</strong>
          </div>
          <div class="cp-tracker-track">
            <div class="cp-tracker-fill" style="width:${bar.percent}%"></div>
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

function renderAttributes(attrs) {
  return `
    <div class="cp-section-header">属性</div>
    <div class="cp-attr-grid">
      ${ATTR_KEYS.map((key) => {
        const val = attrs[key] || 0;
        return `
          <div class="cp-attr-card">
            <div class="cp-attr-label">${ATTR_NAMES[key]}<small>${key}</small></div>
            <div class="cp-attr-value">${val}</div>
            <div class="cp-attr-sub">
              <span>${half(val)}</span>
              <span>${fifth(val)}</span>
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function renderDerived(derived) {
  return `
    <div class="cp-derived-row">
      <div class="cp-derived-item"><span>MOV</span><strong>${derived.MOV ?? 8}</strong></div>
      <div class="cp-derived-item"><span>DB</span><strong>${derived.DB ?? "0"}</strong></div>
      <div class="cp-derived-item"><span>体格</span><strong>${derived.build ?? 0}</strong></div>
      <div class="cp-derived-item"><span>闪避</span><strong>${derived.dodge ?? 0}</strong></div>
    </div>
  `;
}

function renderSkillSection(skillList, skillTicks = []) {
  const activeRows = skillList.active.map((s) => renderSkillRow(s, skillTicks)).join("");
  const otherRows = skillList.other.map((s) => renderSkillRow(s, skillTicks)).join("");
  const otherCount = skillList.other.length;

  return `
    <div class="cp-section-header">技能</div>
    <div class="cp-skill-header-row">
      <span class="cp-skill-col-name">技能</span>
      <span class="cp-skill-col-val">值</span>
      <span class="cp-skill-col-val">半</span>
      <span class="cp-skill-col-val">五分</span>
    </div>
    <div class="cp-skill-list">
      ${activeRows}
    </div>
    ${otherCount > 0 ? `
      <button type="button" class="cp-skill-toggle" data-expanded="false">
        其他技能（${otherCount}）
      </button>
      <div class="cp-skill-list cp-skill-other" hidden>
        ${otherRows}
      </div>
    ` : ""}
  `;
}

function renderSkillRow(skill, skillTicks = []) {
  const occClass = skill.isOcc ? " is-occ" : "";
  const pointsClass = skill.hasPoints ? " has-points" : "";
  const tickedClass = skillTicks.includes(skill.name) ? " is-ticked" : "";
  return `
    <div class="cp-skill-row${occClass}${pointsClass}${tickedClass}">
      <span class="cp-skill-name">${esc(skill.name)}</span>
      <span class="cp-skill-val cp-skill-total">${skill.total}</span>
      <span class="cp-skill-val">${skill.half}</span>
      <span class="cp-skill-val">${skill.fifth}</span>
    </div>
  `;
}

function renderEquipment(items) {
  if (!items.length) return "";
  return `
    <div class="cp-section-header">装备</div>
    <ul class="cp-equipment-list">
      ${items.map((item) => `<li>${esc(item)}</li>`).join("")}
    </ul>
  `;
}

function bindSkillToggle(container) {
  const toggle = container.querySelector(".cp-skill-toggle");
  if (!toggle) return;
  toggle.addEventListener("click", () => {
    const expanded = toggle.dataset.expanded === "true";
    toggle.dataset.expanded = String(!expanded);
    toggle.textContent = expanded
      ? `其他技能（${container.querySelectorAll(".cp-skill-other .cp-skill-row").length}）`
      : "收起其他技能";
    const otherList = container.querySelector(".cp-skill-other");
    otherList.hidden = expanded;
  });
}

function esc(text) {
  if (!text) return "";
  return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
