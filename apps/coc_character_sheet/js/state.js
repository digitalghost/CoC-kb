// 应用状态管理 - Application State Management
// 包含函数: state, saveState(), loadState(), notify()

// ============================================================
// STATE
// ============================================================

let state = {
  currentStep: 0,
  // Step 1
  name: '',
  playerName: 'COC-PL',
  residence: '',
  hometown: '',
  age: 25,
  gender: '男',
  avatar: '',  // 头像文件名，如 'male-01.png'，空表示未选择
  era: '1920s',
  // Step 2 - raw rolled values
  rawAttrs: { STR: 0, CON: 0, SIZ: 0, DEX: 0, APP: 0, INT: 0, POW: 0, EDU: 0 },
  luck: 0,
  attrsGenerated: false,
  ageAdjusted: false,
  ageAdjustChoice: 'STR', // which attr to reduce for 40+
  eduGrowthLog: [],
  // Step 4
  occupation: null,
  creditRating: 0,
  selectedOccSkills: [],  // Step 4 - skill selection from choiceGroups
  fixedSpecialtyChoices: {},  // Step 4 - { parentName: 'chosenSpecialty' } 固定技能中父技能的专精选择
  customSkillGroups: {},  // Step 4 - { skillName: groupIdx } 自定义技能所属组记录
  customOccForm: { name: '', creditRatingMin: 0, creditRatingMax: 99, occupationalPoints: 0, selectedSkills: [] },
  // Step 5
  occupationalPoints: 0,
  interestPoints: 0,
  occupationalUsed: 0,
  interestUsed: 0,
  skillPoints: {}, // skillKey -> { occ: number, int: number }
  // Step 6
  derived: { HP: 0, MP: 0, SAN: 0, DB: '0', build: 0, MOV: 9, dodge: 0, language: 0 },
  // Step 7
  background: [],  // 每项: { category: '形象描述', content: '...', isKey: false }
  keyConnection: -1,  // 关键连接的索引
  companions: [],  // 同伴列表，每项: { charName: '', playerName: '' }，最多7个
  // Step 8
  equipment: [],  // 随身物品列表，每项: { name, type, price, detail }
  weapons: [
    { name: '徒手（拳打脚踢）', skill: '格斗(斗殴)', damage: '1D3+DB', armorPiercing: false, baseRange: '接触', attacksPerRound: '1', capacity: '-', malfunction: null, price20s: null, priceModern: null, era: '默认', category: '常规武器' },
  ],    // 武器列表，每项: 完整武器对象（含战斗属性）
  spendingCash: 0,  // 可支配现金
  // Final
  completed: false
};

function notify(msg, type) {
  let el = document.createElement('div');
  el.className = 'notification ' + type;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2500);
}

function saveState() {
  try { localStorage.setItem('coc_char_state', JSON.stringify(state)); } catch(e) {}
}

function loadState() {
  try {
    let s = localStorage.getItem('coc_char_state');
    if (s) {
      let parsed = JSON.parse(s);
      state = { ...state, ...parsed };
      // 兼容旧存档：补齐缺失的字段
      if (!state.weapons || state.weapons.length === 0) {
        state.weapons = [
          { name: '徒手（拳打脚踢）', skill: '格斗(斗殴)', damage: '1D3+DB', armorPiercing: false, baseRange: '接触', attacksPerRound: '1', capacity: '-', malfunction: null, price20s: null, priceModern: null, era: '默认', category: '常规武器' },
        ];
      }
      if (!state.fixedSpecialtyChoices) state.fixedSpecialtyChoices = {};
      if (!state.customSkillGroups) state.customSkillGroups = {};
      if (!state.customOccForm) state.customOccForm = { name: '', creditRatingMin: 0, creditRatingMax: 99, occupationalPoints: 0, selectedSkills: [] };
      if (state.keyConnection === undefined || state.keyConnection === null) state.keyConnection = -1;
      if (!state.companions) state.companions = [];
      if (!state.equipment) state.equipment = [];
      if (!state.background) state.background = [];
      if (!state.skillPoints) state.skillPoints = {};
      if (!state.eduGrowthLog) state.eduGrowthLog = [];
      if (!state.selectedOccSkills) state.selectedOccSkills = [];
      if (!state.derived) state.derived = { HP: 0, MP: 0, SAN: 0, DB: '0', build: 0, MOV: 9, dodge: 0, language: 0 };
      if (!state.ageAdjustChoice) state.ageAdjustChoice = 'STR';
      if (state.spendingCash === undefined || state.spendingCash === null) state.spendingCash = 0;
      if (state.avatar === undefined || state.avatar === null) state.avatar = '';
      // 兼容旧存档：旧版 9 步流程 → 新版 8 步流程（移除了原 Step 6 衍生属性）
      if (state.currentStep !== undefined && state.currentStep >= 5) {
        // 旧5(衍生属性)→新5(背景故事), 旧6(背景故事)→新5(背景故事),
        // 旧7(装备决定)→新6(装备决定), 旧8(最终卡)→新7(完成)
        const stepMap = { 5: 5, 6: 5, 7: 6, 8: 7 };
        state.currentStep = stepMap[state.currentStep] || state.currentStep;
      }
      return true;
    }
  } catch(e) {}
  return false;
}
