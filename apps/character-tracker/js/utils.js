/**
 * utils.js - 工具函数
 */

  function getSkillBase(skillName, attrs) {
    if (skillName === '闪避') return Math.floor(attrs.DEX / 2);
    if (skillName === '母语') return attrs.EDU;
    // 专精技能
    for (let parent in SPECIALTY_MAP) {
      if (skillName.startsWith(parent + '(') && skillName.endsWith(')')) {
        let sub = skillName.slice(parent.length + 1, -1);
        let map = SPECIALTY_MAP[parent];
        if (map && map.category && SKILLS_DATA[map.category]) {
          let val = SKILLS_DATA[map.category][sub];
          if (val !== undefined) return val;
        }
        if (map && map.freeForm) {
          if (parent === '生存') return 10;
          if (parent === '艺术和手艺') return 5;
          return 1;
        }
        return 0;
      }
    }
    // 常规技能
    let v = SKILLS_DATA.regular[skillName];
    if (v !== undefined) {
      if (typeof v === 'string') {
        if (v === 'DEX/2') return Math.floor(attrs.DEX / 2);
        if (v === 'EDU') return attrs.EDU;
      }
      return v;
    }
    for (let cat of ['combat','firearms','science','artCraft','survival','unconventional']) {
      if (SKILLS_DATA[cat] && SKILLS_DATA[cat][skillName] !== undefined) return SKILLS_DATA[cat][skillName];
    }
    return 0;
  }

  function calcSkillTotal(skillName, attrs, skillPoints) {
    let base = getSkillBase(skillName, attrs);
    let sp = skillPoints[skillName];
    let bonus = sp ? (sp.occ || 0) + (sp.int || 0) : 0;
    return base + bonus;
  }

  function half(v) { return Math.floor(v / 2); }
  function fifth(v) { return Math.floor(v / 5); }

  // 骰子按钮 SVG
  const DICE_SVG = '<svg viewBox="0 0 20 20"><path d="M10 1a9 9 0 1 0 0 18 9 9 0 0 0 0-18zm0 16a7 7 0 1 1 0-14 7 7 0 0 1 0 14zm-1-11h2v1.5h-2V6zm0 3.5h2v5h-2v-5z"/></svg>';
  const DICE_SVG_LG = '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v2h-2V7zm0 4h2v6h-2v-6z"/></svg>';

  
