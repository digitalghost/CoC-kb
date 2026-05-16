import { SKILLS_DATA, SPECIALTY_MAP, ATTR_KEYS, MODULE_SKILLS } from "../data/skills-data.js";

const STORAGE_KEY = "alone-against-the-flames-character";
const AVATAR_BASE = "assets/avatars/";

const DEFAULT_CHARACTER = normalizeCharacter({
  name: "亨利·阿什克罗夫特",
  playerName: "守秘人",
  occupation: "私家侦探",
  age: 34,
  gender: "男",
  residence: "波士顿，马萨诸塞州",
  hometown: "纽约，纽约州",
  era: "1920s",
  avatar: "",
  // 属性按模组条目263原文顺序分配：STR/CON/POW/DEX/APP/SIZ/INT/EDU = 40/50/50/50/60/60/70/80
  rawAttrs: { STR: 40, CON: 50, SIZ: 60, DEX: 50, APP: 60, INT: 70, POW: 50, EDU: 80 },
  effectiveAttrs: { STR: 40, CON: 50, SIZ: 60, DEX: 50, APP: 60, INT: 70, POW: 50, EDU: 80 },
  luck: 50,
  // HP=(CON+SIZ)/10=11, MP=POW/5=10, SAN=POW=50, DB=0(STR+SIZ=100), MOV=7(STR<SIZ)
  derived: { HP: 11, MP: 10, SAN: 50, DB: "0", build: 0, MOV: 7, dodge: 25, language: 80 },
  // 私家侦探本职技能（条目249）：侦查70/心理学60/图书馆使用60/法律50/魅惑50/乔装50/艺术和手艺（摄影）40/潜行40
  // occ值 = 分配目标值 - 技能基础值
  skillPoints: {
    "侦查":           { occ: 45, int: 0, adj: 0 },
    "心理学":         { occ: 50, int: 0, adj: 0 },
    "图书馆使用":     { occ: 40, int: 0, adj: 0 },
    "法律":           { occ: 45, int: 0, adj: 0 },
    "魅惑":           { occ: 35, int: 0, adj: 0 },
    "乔装":           { occ: 45, int: 0, adj: 0 },
    "艺术和手艺（摄影）": { occ: 35, int: 0, adj: 0 },
    "潜行":           { occ: 20, int: 0, adj: 0 },
    "信用评级":       { occ: 20, int: 0, adj: 0 }
  },
  occSkills: ["侦查", "心理学", "图书馆使用", "法律", "魅惑", "乔装", "艺术和手艺（摄影）", "潜行"],
  equipment: [
    { name: ".32 左轮手枪（柯尔特侦探特装）×1，弹药 24 发" },
    { name: "手电筒（备用电池 ×2）" },
    { name: "银质怀表（父亲遗物）" },
    { name: "石质护符（来历不明）" }
  ]
});

export function getSkillBase(skillName, attrs) {
  if (skillName === "信用评级") return 0;
  if (skillName === "闪避") return Math.floor((attrs.DEX || 0) / 2);
  if (skillName === "母语") return attrs.EDU || 0;

  const specialtyMatch = skillName.match(/^(.+?)[（(](.+?)[）)]$/);
  if (specialtyMatch) {
    const [, parent, sub] = specialtyMatch;
    const mapping = SPECIALTY_MAP[parent];
    if (mapping) {
      if (mapping.category && SKILLS_DATA[mapping.category]?.[sub] != null) {
        return SKILLS_DATA[mapping.category][sub];
      }
      if (mapping.freeForm) {
        if (parent === "生存") return 10;
        if (parent === "艺术和手艺") return 5;
        return 1;
      }
      return 0;
    }
  }

  const regularVal = SKILLS_DATA.regular[skillName];
  if (regularVal != null) {
    if (regularVal === "DEX/2") return Math.floor((attrs.DEX || 0) / 2);
    if (regularVal === "EDU") return attrs.EDU || 0;
    return regularVal;
  }

  for (const cat of ["combat", "firearms", "science", "artCraft", "survival", "unconventional"]) {
    if (SKILLS_DATA[cat]?.[skillName] != null) {
      return SKILLS_DATA[cat][skillName];
    }
  }

  return 0;
}

export function getSkillTotal(skillName, attrs, skillPoints) {
  const base = getSkillBase(skillName, attrs);
  const points = skillPoints?.[skillName];
  const bonus = points ? (points.occ || 0) + (points.int || 0) + (points.adj || 0) : 0;
  return base + bonus;
}

export function half(value) {
  return Math.floor(value / 2);
}

export function fifth(value) {
  return Math.floor(value / 5);
}

export const characterAdapter = {
  status: "已接入 `.coc7` 导入与简化追踪视图，可直接复用现有角色卡数据。",

  createSeedCharacter() {
    return cloneCharacter(DEFAULT_CHARACTER);
  },

  loadPersistedCharacter() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return normalizeCharacter(JSON.parse(raw));
    } catch (error) {
      console.warn("角色缓存读取失败", error);
      return null;
    }
  },

  persistCharacter(character) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeCharacter(character)));
  },

  clearPersistedCharacter() {
    localStorage.removeItem(STORAGE_KEY);
  },

  async importFromFile(file) {
    const text = await file.text();
    const parsed = JSON.parse(text);
    const imported = parseCharacterFile(parsed);
    const character = normalizeCharacter(imported);
    this.persistCharacter(character);
    return character;
  },

  getVisibleStats(character) {
    const attrs = character.effectiveAttrs || character.rawAttrs || {};
    const derived = character.derived || {};
    return [
      { label: "HP", value: `${character.stats.hp.current}/${character.stats.hp.max}` },
      { label: "SAN", value: `${character.stats.san.current}/${character.stats.san.max}` },
      { label: "MP", value: `${character.stats.mp.current}/${character.stats.mp.max}` },
      { label: "Luck", value: `${character.stats.luck}` },
      { label: "STR", value: attrs.STR || 0 },
      { label: "DEX", value: attrs.DEX || 0 },
      { label: "POW", value: attrs.POW || 0 },
      { label: "INT", value: attrs.INT || 0 },
      { label: "CON", value: attrs.CON || 0 },
      { label: "SIZ", value: attrs.SIZ || 0 },
      { label: "APP", value: attrs.APP || 0 },
      { label: "EDU", value: attrs.EDU || 0 },
      { label: "MOV", value: derived.MOV ?? 8 },
      { label: "DB", value: derived.DB ?? "0" }
    ];
  },

  getTrackerBars(character) {
    return [
      makeTrackerBar("HP", character.stats.hp.current, character.stats.hp.max, "life"),
      makeTrackerBar("SAN", character.stats.san.current, character.stats.san.max, "sanity"),
      makeTrackerBar("MP", character.stats.mp.current, character.stats.mp.max, "magic"),
      makeTrackerBar("Luck", character.stats.luck, 99, "luck")
    ];
  },

  getPortraitUrl(character) {
    if (!character.avatar) return "";
    return `${AVATAR_BASE}${character.avatar}`;
  },

  getIdentityMeta(character) {
    return [character.age ? `${character.age} 岁` : "", character.gender || "", character.era || ""]
      .filter(Boolean)
      .join(" · ");
  },

  getInventory(character) {
    const equipment = (character.equipment || [])
      .map((item) => (typeof item === "string" ? item : item.name || item.detail || ""))
      .filter(Boolean);
    const dynamic = (character.inventory || []).filter((item) => !equipment.includes(item));
    return [...equipment, ...dynamic].slice(0, 12);
  },

  getFullSkillList(character) {
    const attrs = character.effectiveAttrs || character.rawAttrs || {};
    const skillPoints = character.skillPoints || {};
    const occSkills = character.occSkills || [];
    const allSkills = new Set();

    Object.keys(SKILLS_DATA.regular).forEach((name) => allSkills.add(name));
    Object.keys(skillPoints).forEach((name) => allSkills.add(name));

    const active = [];
    const other = [];

    for (const name of allSkills) {
      if (name === "信用评级") continue;
      const total = getSkillTotal(name, attrs, skillPoints);
      const base = getSkillBase(name, attrs);
      const hasPoints = skillPoints[name] && ((skillPoints[name].occ || 0) + (skillPoints[name].int || 0) + (skillPoints[name].adj || 0)) > 0;
      const isModuleSkill = MODULE_SKILLS.includes(name);
      const isOcc = occSkills.includes(name);

      const entry = { name, total, half: half(total), fifth: fifth(total), base, isOcc, hasPoints };

      if (hasPoints || isModuleSkill) {
        active.push(entry);
      } else if (base > 0) {
        other.push(entry);
      }
    }

    // Also include specialty skills from skillPoints
    for (const name of Object.keys(skillPoints)) {
      if (allSkills.has(name)) continue;
      const total = getSkillTotal(name, attrs, skillPoints);
      const base = getSkillBase(name, attrs);
      const isOcc = occSkills.includes(name);
      active.push({ name, total, half: half(total), fifth: fifth(total), base, isOcc, hasPoints: true });
    }

    active.sort((a, b) => a.name.localeCompare(b.name, "zh-CN"));
    other.sort((a, b) => a.name.localeCompare(b.name, "zh-CN"));

    return { active, other };
  },

  resolveCheck(check, character) {
    if (!check) return null;

    const attrs = character.effectiveAttrs || character.rawAttrs || {};
    let target = null;
    let sourceLabel = "";

    if (check.type === "attribute" && check.key) {
      target = Number(attrs[check.key] || 0);
      sourceLabel = check.skill || check.key;
    } else if (check.type === "derived" && check.key) {
      if (check.key === "luck") {
        target = Number(character.stats?.luck || character.luck || 0);
      } else if (check.key === "san") {
        target = Number(character.stats?.san?.current ?? character.derived?.SAN ?? 0);
      } else {
        target = Number(character.derived?.[check.key] || 0);
      }
      sourceLabel = check.skill || check.key;
    } else if (check.type === "skill" && check.skill) {
      target = getSkillTotal(check.skill, attrs, character.skillPoints || {});
      sourceLabel = check.skill;
    }

    if (check.target != null) {
      target = Number(check.target);
    }

    if (target == null || Number.isNaN(target)) return { ...check, sourceLabel };

    return {
      ...check,
      sourceLabel,
      target,
      half: half(target),
      fifth: fifth(target)
    };
  }
};

function parseCharacterFile(parsed) {
  if (parsed && parsed._format === "coc7-char-v1" && parsed._encoded) {
    const decoded = JSON.parse(decodeURIComponent(escape(atob(parsed._encoded))));
    return decompressState(decoded);
  }

  if (parsed && (parsed.rawAttrs || parsed.effectiveAttrs || parsed.derived || parsed.stats)) {
    return parsed;
  }

  throw new Error("无法识别的角色卡格式");
}

function decompressState(data) {
  if (!data || data.v !== 1) {
    throw new Error("角色数据版本不受支持");
  }

  const rawAttrs = {};
  ATTR_KEYS.forEach((key, index) => {
    rawAttrs[key] = data.at?.[index] || 0;
  });

  const effectiveAttrs = {};
  const effectiveArray = data.ea || data.at || [];
  ATTR_KEYS.forEach((key, index) => {
    effectiveAttrs[key] = effectiveArray[index] || rawAttrs[key] || 0;
  });

  const dv = data.dv || [0, 0, 0, "0", 0, 8, 0, 0];

  return {
    name: data.s?.n || "",
    playerName: data.s?.p || "",
    residence: data.s?.r || "",
    hometown: data.s?.h || "",
    age: data.s?.a || 25,
    gender: data.s?.g || "男",
    era: data.s?.e || "1920s",
    avatar: data.s?.av || "",
    rawAttrs,
    effectiveAttrs,
    luck: data.l || 0,
    occupation: data.o || "",
    creditRating: data.cr || 0,
    skillPoints: decodeSkillPoints(data.sk || {}),
    occSkills: [...(data.ofsl || []), ...(data.os || [])],
    derived: {
      HP: dv[0],
      MP: dv[1],
      SAN: dv[2],
      DB: dv[3],
      build: dv[4],
      MOV: dv[5],
      dodge: dv[6],
      language: dv[7]
    },
    equipment: (data.eq || []).map((item) => ({
      name: item.n || "",
      type: item.t || "",
      price: item.r || 0,
      detail: item.d || ""
    }))
  };
}

function normalizeCharacter(character) {
  const attrs = character.effectiveAttrs || character.rawAttrs || {};
  const derived = character.derived || {};
  const hpMax = derived.HP ?? character.stats?.hp?.max ?? 10;
  const mpMax = derived.MP ?? character.stats?.mp?.max ?? 10;
  const sanMax = derived.SAN_MAX ?? derived.SAN_START ?? derived.SAN ?? character.stats?.san?.max ?? 99;
  const hpCurrent = derived.HP_current ?? character.stats?.hp?.current ?? hpMax;
  const mpCurrent = derived.MP_current ?? character.stats?.mp?.current ?? mpMax;
  const sanCurrent = derived.SAN_current ?? derived.SAN ?? character.stats?.san?.current ?? sanMax;
  const luck = character.luck ?? character.stats?.luck ?? 0;

  return {
    name: character.name || "未命名调查员",
    playerName: character.playerName || "",
    occupation: character.occupation || "未知职业",
    age: character.age || "",
    gender: character.gender || "",
    residence: character.residence || "",
    hometown: character.hometown || "",
    era: character.era || "",
    avatar: character.avatar || "",
    rawAttrs: fillAttrs(character.rawAttrs || attrs),
    effectiveAttrs: fillAttrs(attrs),
    creditRating: character.creditRating || 0,
    skillPoints: character.skillPoints || {},
    occSkills: character.occSkills || [],
    derived: {
      HP: hpMax,
      HP_current: hpCurrent,
      MP: mpMax,
      MP_current: mpCurrent,
      SAN: sanCurrent,
      SAN_START: derived.SAN_START ?? sanMax,
      SAN_MAX: sanMax,
      DB: derived.DB ?? "0",
      build: derived.build ?? 0,
      MOV: derived.MOV ?? 8,
      dodge: derived.dodge ?? 0,
      language: derived.language ?? 0
    },
    luck,
    equipment: Array.isArray(character.equipment) ? character.equipment : [],
    inventory: Array.isArray(character.inventory)
      ? character.inventory
      : Array.isArray(character.equipment)
        ? character.equipment.map((item) => item.name || item.detail).filter(Boolean)
        : [],
    stats: {
      hp: { current: hpCurrent, max: hpMax },
      san: { current: sanCurrent, max: sanMax },
      mp: { current: mpCurrent, max: mpMax },
      luck
    }
  };
}

function fillAttrs(source) {
  const result = {};
  ATTR_KEYS.forEach((key) => {
    result[key] = source?.[key] || 0;
  });
  return result;
}

function decodeSkillPoints(source) {
  const result = {};
  for (const [key, value] of Object.entries(source)) {
    const [occ, int] = String(value).split(",");
    result[key] = {
      occ: Number.parseInt(occ, 10) || 0,
      int: Number.parseInt(int, 10) || 0
    };
  }
  return result;
}

function makeTrackerBar(label, current, max, tone) {
  const safeMax = Math.max(1, Number(max) || 1);
  const safeCurrent = Math.max(0, Number(current) || 0);
  return {
    label,
    current: safeCurrent,
    max: safeMax,
    percent: Math.max(0, Math.min(100, Math.round((safeCurrent / safeMax) * 100))),
    tone
  };
}

function cloneCharacter(character) {
  return JSON.parse(JSON.stringify(character));
}
