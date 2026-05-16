/**
 * 战斗脚本配置 — 每个场景独立定义所有参数和特殊规则
 */

export const COMBAT_SCRIPTS = {
  "entry-150": {
    type: "opposed-roll",
    label: "追逐对抗",
    description: "你沿着山脊追逐这个男人，必须用你的敏捷对抗他的敏捷。",
    player: { stat: { type: "attribute", key: "DEX", label: "敏捷" } },
    enemy: { name: "逃跑的男人", stat: { value: 38, label: "敏捷 38" } },
    tieBreaker: "higher-skill",
    outcomes: {
      win: { next: "entry-172", text: "你成功抓住了他！" },
      lose: { next: "entry-87", text: "他消失在巨石后面，你没能追上。" }
    }
  },

  "entry-155": {
    type: "opposed-roll",
    label: "逃离黑熊",
    description: "你必须用你的敏捷和熊的敏捷进行对抗检定，才能从熊掌下逃脱。",
    player: { stat: { type: "attribute", key: "DEX", label: "敏捷" } },
    enemy: { name: "黑熊", stat: { value: 58, label: "敏捷 58" } },
    tieBreaker: "higher-skill",
    outcomes: {
      win: { next: "entry-161", text: "你成功甩开了黑熊！" },
      lose: { next: "entry-167", text: "黑熊的速度远超你的想象，你没能逃脱。" }
    }
  },

  "entry-173": {
    type: "melee",
    label: "黑熊搏斗",
    description: "熊立起身，挥爪向你袭来。你必须在三轮战斗中存活下来。",
    enemy: {
      name: "黑熊",
      dex: 58,
      hp: 20,
      armor: 3,
      skills: { fighting: 35 }
    },
    player: {
      weaponOptions: [
        { id: "knife", label: "小刀", condition: { hasItem: "狩猎小刀" }, damage: "1D4", damageLabel: "1D4+DB" },
        { id: "unarmed", label: "徒手", damage: "1D3", damageLabel: "1D3+DB" }
      ],
      skills: {
        fightBack: { type: "skill", skill: "格斗(斗殴)", label: "格斗(斗殴)" },
        dodge: { type: "skill", skill: "闪避", label: "闪避" }
      }
    },
    rounds: [
      {
        label: "第一轮",
        enemyActions: [
          { id: "claw-1", label: "爪击（左）", skill: 35, damage: "2D6" },
          { id: "claw-2", label: "爪击（右）", skill: 35, damage: "2D6" }
        ]
      },
      {
        label: "第二轮",
        enemyActions: [
          { id: "claw-3", label: "爪击", skill: 35, damage: "2D6" },
          { id: "bite-1", label: "啃咬", skill: 25, damage: "1D8" }
        ]
      },
      {
        label: "第三轮",
        enemyActions: [
          { id: "claw-4", label: "爪击（左）", skill: 35, damage: "2D6" },
          { id: "claw-5", label: "爪击（右）", skill: 35, damage: "2D6" }
        ]
      }
    ],
    enemyBehavior: null,
    specialActions: null,
    endConditions: [
      { check: "playerHpZero", next: "entry-193" },
      { check: "majorWound", then: "conCheck", failNext: "entry-193" },
      { check: "enemyHpZero", next: "entry-201" },
      { check: "allRoundsComplete", next: "entry-201" }
    ],
    majorWound: {
      threshold: "halfMaxHp",
      conCheck: { type: "attribute", key: "CON", label: "体质" }
    }
  },

  "entry-235": {
    type: "melee",
    label: "车夫搏斗",
    description: "一个上年纪的车夫摆好架势，作出以命相搏的眼神。",
    enemy: {
      name: "车夫",
      dex: 31,
      hp: 9,
      armor: 0,
      skills: { fighting: 30, dodge: 15 },
      damage: "1D6"
    },
    player: {
      weaponOptions: [
        { id: "knife", label: "小刀", condition: { hasItem: "狩猎小刀" }, damage: "1D4", damageLabel: "1D4+DB" },
        { id: "unarmed", label: "徒手", damage: "1D3", damageLabel: "1D3+DB" }
      ],
      skills: {
        fightBack: { type: "skill", skill: "格斗(斗殴)", label: "格斗(斗殴)" },
        dodge: { type: "skill", skill: "闪避", label: "闪避" }
      }
    },
    rounds: "unlimited",
    enemyBehavior: "rollD6OddAttackEvenDodge",
    specialActions: null,
    endConditions: [
      { check: "enemyHpBelow", threshold: 4, next: "entry-241" },
      { check: "playerHpZero", next: "entry-247" },
      { check: "majorWound", then: "unconscious", next: "entry-247" }
    ],
    majorWound: {
      threshold: "halfMaxHp",
      conCheck: { type: "attribute", key: "CON", label: "体质" }
    }
  },

  "entry-167": {
    type: "dual-claw",
    label: "熊的双爪攻击",
    description: "熊在你身后咆哮，用双爪各攻击一次。每爪命中率 35%，造成 3D6 伤害。任一爪伤害达到你最大耐久值的一半即触发重伤。",
    enemy: {
      name: "黑熊",
      claws: [
        { id: "claw-left",  label: "左爪", skill: 35, damage: "3D6" },
        { id: "claw-right", label: "右爪", skill: 35, damage: "3D6" }
      ]
    },
    outcomes: {
      majorWound: { next: "entry-179", summary: "你受到了重伤！" },
      survive:    { next: "entry-186", summary: "你挺过了熊的双爪攻击。" }
    }
  },

  "entry-262": {
    type: "melee",
    label: "工匠搏斗",
    description: "你和这个巨汉开始争斗。他的拳头如铁锤一般从暗处砸来。",
    enemy: {
      name: "工匠",
      dex: 41,
      hp: 12,
      armor: 0,
      skills: { fighting: 35 },
      damage: "1D3+1D4"
    },
    player: {
      weaponOptions: [
        { id: "knife", label: "小刀", condition: { hasItem: "狩猎小刀" }, damage: "1D4", damageLabel: "1D4+DB" },
        { id: "unarmed", label: "徒手", damage: "1D3", damageLabel: "1D3+DB" }
      ],
      skills: {
        fightBack: { type: "skill", skill: "格斗(斗殴)", label: "格斗(斗殴)" },
        dodge: { type: "skill", skill: "闪避", label: "闪避" }
      }
    },
    rounds: "unlimited",
    enemyBehavior: "alwaysAttack",
    specialActions: [
      {
        availableAfterRound: 3,
        id: "escape",
        label: "尝试逃跑",
        description: "进行一次困难闪避检定",
        check: { type: "skill", skill: "闪避", label: "闪避", difficulty: "hard" },
        successNext: "entry-12",
        failPenalty: "enemyBonusAttack"
      }
    ],
    endConditions: [
      { check: "enemyHpBelow", threshold: 6, next: "entry-268" },
      { check: "playerHpZero", next: "entry-2" },
      { check: "majorWound", then: "unconscious", next: "entry-2" }
    ],
    majorWound: {
      threshold: "halfMaxHp",
      conCheck: { type: "attribute", key: "CON", label: "体质" }
    }
  }
};
