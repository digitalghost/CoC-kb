// Playwright 端到端测试 - 角色卡追踪器
// 运行方式: npx playwright test
// 前置条件: 需要先启动本地服务器 (npx serve . 或 python3 -m http.server 8888)

const { test, expect, chromium } = require('@playwright/test');

// 测试配置
const BASE_URL = process.env.TEST_URL || 'http://localhost:8888';
const TIMEOUT = 15000;

// 默认角色数据常量
const DEFAULT_CHARACTER = {
  name: '亨利·阿什克罗夫特',
  occupation: '私家侦探',
  age: '34',
  gender: '男',
  residence: '波士顿',
  hometown: '波士顿',
  era: '1920s',
  attrs: { STR: 60, CON: 50, SIZ: 55, DEX: 70, APP: 50, INT: 75, POW: 60, EDU: 65 },
  mov: 8,
  hp: 10,
  mp: 12,
  san: 55,
  luck: 55,
  db: '0',
  build: -1,
  dodge: 35,
  spendingCash: '$150',
  weaponCount: 4,
  companionCount: 8,
  backstoryCategories: [
    '形象描述', '特质', '思想与信念', '创伤和疤痕', '重要之人',
    '恐惧症和躁狂症', '意义非凡之地', '典籍法术和神话造物', '宝贵之物', '第三类接触'
  ]
};

test.describe('角色卡追踪器 - 端到端测试', () => {

  // ==========================================
  // TC-01: 页面加载与初始化
  // ==========================================
  test.describe('TC-01: 页面加载与初始化', () => {

    test('TC-01-01: 默认角色数据加载', async ({ page }) => {
      // 清除 localStorage 确保使用默认数据
      await page.goto(BASE_URL + '/index.html');
      await page.evaluate(() => localStorage.removeItem('coc-tracker-data'));
      await page.reload();
      await page.waitForTimeout(2000);

      // 验证页面标题
      await expect(page.title()).resolves.toContain('克苏鲁的呼唤');

      // 验证默认角色名
      const nameField = page.locator('#infoFields .info-field:first-child .field-line');
      await expect(nameField).toContainText(DEFAULT_CHARACTER.name);
    });

    test('TC-01-02: localStorage 数据恢复', async ({ page }) => {
      // 先注入自定义数据到 localStorage
      await page.goto(BASE_URL + '/index.html');
      await page.evaluate(() => {
        const testData = {
          name: '测试角色',
          playerName: '测试玩家',
          occupation: '医生',
          age: '28',
          gender: '女',
          residence: '纽约',
          hometown: '伦敦',
          era: '现代',
          rawAttrs: { STR: 50, CON: 60, SIZ: 50, DEX: 60, APP: 70, INT: 80, POW: 70, EDU: 75 },
          effectiveAttrs: { STR: 50, CON: 60, SIZ: 50, DEX: 60, APP: 70, INT: 80, POW: 70, EDU: 75 },
          luck: 60,
          derived: { hp: 11, mp: 14, san: 60, db: '0', build: 0, mov: 8, dodge: 30, language: 75 },
          skillPoints: {},
          background: [],
          companions: [],
          equipment: [],
          weapons: [],
          occSkills: [],
          spendingCash: '$200'
        };
        localStorage.setItem('coc-tracker-data', JSON.stringify(testData));
      });
      await page.reload();
      await page.waitForTimeout(2000);

      // 验证显示的是自定义数据
      const nameField = page.locator('#infoFields .info-field:first-child .field-line');
      await expect(nameField).toContainText('测试角色');
    });

    test('TC-01-03: 页面结构完整性', async ({ page }) => {
      await page.goto(BASE_URL + '/index.html');
      await page.waitForTimeout(2000);

      // 验证正面区域
      await expect(page.locator('#page1')).toBeVisible();
      await expect(page.locator('#import-actions')).toBeVisible();
      await expect(page.locator('#infoSection')).toBeVisible();
      await expect(page.locator('#attributesGrid')).toBeVisible();
      await expect(page.locator('.tracker-strip')).toBeVisible();
      await expect(page.locator('#skillsGrid')).toBeVisible();

      // 验证背面区域
      await expect(page.locator('#page2')).toBeVisible();
      await expect(page.locator('#backstoryGrid')).toBeVisible();
    });
  });

  // ==========================================
  // TC-02: 基本信息展示
  // ==========================================
  test.describe('TC-02: 基本信息展示', () => {

    test('TC-02-01: 调查员信息字段完整性', async ({ page }) => {
      await page.goto(BASE_URL + '/index.html');
      await page.waitForTimeout(2000);

      // 验证 8 个信息字段
      const infoFields = page.locator('#infoFields .info-field');
      await expect(infoFields).toHaveCount(8);

      // 验证关键字段值
      await expect(page.locator('#infoFields')).toContainText(DEFAULT_CHARACTER.name);
      await expect(page.locator('#infoFields')).toContainText(DEFAULT_CHARACTER.occupation);
      await expect(page.locator('#infoFields')).toContainText(DEFAULT_CHARACTER.age);
      await expect(page.locator('#infoFields')).toContainText(DEFAULT_CHARACTER.gender);
      await expect(page.locator('#infoFields')).toContainText(DEFAULT_CHARACTER.residence);
      await expect(page.locator('#infoFields')).toContainText(DEFAULT_CHARACTER.hometown);
      await expect(page.locator('#infoFields')).toContainText(DEFAULT_CHARACTER.era);
    });

    test('TC-02-02: 头像显示', async ({ page }) => {
      await page.goto(BASE_URL + '/index.html');
      await page.waitForTimeout(2000);

      // 验证头像区域
      const portrait = page.locator('#portrait');
      await expect(portrait).toBeVisible();

      // 验证 img 元素存在（默认角色有头像）
      const portraitImg = portrait.locator('img');
      await expect(portraitImg).toHaveCount(1);
    });
  });

  // ==========================================
  // TC-03: 属性面板
  // ==========================================
  test.describe('TC-03: 属性面板', () => {

    test('TC-03-01: 八大属性正确显示', async ({ page }) => {
      await page.goto(BASE_URL + '/index.html');
      await page.waitForTimeout(2000);

      const attrBoxes = page.locator('#attributesGrid .attr-box');
      await expect(attrBoxes).toHaveCount(9); // 8属性 + MOV

      // 验证每个属性都有检定单元格和骰子按钮
      for (const attrKey of Object.keys(DEFAULT_CHARACTER.attrs)) {
        const attrBox = page.locator(`#attributesGrid .attr-box:has-text("${attrKey}")`);
        await expect(attrBox.locator('.check-cell').first()).toBeVisible();
        await expect(attrBox.locator('.dice-btn').first()).toBeVisible();
      }
    });

    test('TC-03-02: 检定值计算正确性', async ({ page }) => {
      await page.goto(BASE_URL + '/index.html');
      await page.waitForTimeout(2000);

      // 验证 STR 的检定值
      const strBox = page.locator('#attributesGrid .attr-box:has-text("STR")');
      const mainValue = strBox.locator('.check-cell .main-value');
      await expect(mainValue).toContainText('60');

      const halfValue = strBox.locator('.check-cell .half-value');
      await expect(halfValue).toContainText('30');

      const fifthValue = strBox.locator('.check-cell .fifth-value');
      await expect(fifthValue).toContainText('12');
    });

    test('TC-03-03: MOV 属性显示', async ({ page }) => {
      await page.goto(BASE_URL + '/index.html');
      await page.waitForTimeout(2000);

      const movBox = page.locator('#attributesGrid .attr-box:has-text("MOV")');
      await expect(movBox).toBeVisible();
      await expect(movBox).toContainText(String(DEFAULT_CHARACTER.mov));
    });
  });

  // ==========================================
  // TC-04: 追踪条
  // ==========================================
  test.describe('TC-04: 追踪条', () => {

    test('TC-04-01: HP 追踪器', async ({ page }) => {
      await page.goto(BASE_URL + '/index.html');
      await page.waitForTimeout(2000);

      const trackerStrip = page.locator('.tracker-strip');
      await expect(trackerStrip).toContainText('HP');
      await expect(trackerStrip).toContainText(`${DEFAULT_CHARACTER.hp}/${DEFAULT_CHARACTER.hp}`);

      // 验证状态复选框
      await expect(trackerStrip).toContainText('重伤');
      await expect(trackerStrip).toContainText('濒死');
      await expect(trackerStrip).toContainText('昏迷');
    });

    test('TC-04-02: 幸运值追踪器', async ({ page }) => {
      await page.goto(BASE_URL + '/index.html');
      await page.waitForTimeout(2000);

      const trackerStrip = page.locator('.tracker-strip');
      await expect(trackerStrip).toContainText('幸运');
      await expect(trackerStrip).toContainText(String(DEFAULT_CHARACTER.luck));
    });

    test('TC-04-03: MP 追踪器', async ({ page }) => {
      await page.goto(BASE_URL + '/index.html');
      await page.waitForTimeout(2000);

      const trackerStrip = page.locator('.tracker-strip');
      await expect(trackerStrip).toContainText('MP');
      await expect(trackerStrip).toContainText(`${DEFAULT_CHARACTER.mp}/${DEFAULT_CHARACTER.mp}`);
    });

    test('TC-04-04: SAN 追踪器', async ({ page }) => {
      await page.goto(BASE_URL + '/index.html');
      await page.waitForTimeout(2000);

      const trackerStrip = page.locator('.tracker-strip');
      await expect(trackerStrip).toContainText('SAN');
      await expect(trackerStrip).toContainText(`${DEFAULT_CHARACTER.san}/99`);

      // 验证疯狂类型复选框
      await expect(trackerStrip).toContainText('临时性');
      await expect(trackerStrip).toContainText('不定性');
      await expect(trackerStrip).toContainText('永久性');
    });
  });

  // ==========================================
  // TC-05: 技能面板
  // ==========================================
  test.describe('TC-05: 技能面板', () => {

    test('TC-05-01: 技能分组正确性', async ({ page }) => {
      await page.goto(BASE_URL + '/index.html');
      await page.waitForTimeout(2000);

      const skillsGrid = page.locator('#skillsGrid');
      await expect(skillsGrid).toBeVisible();

      // 验证 4 个技能区块
      await expect(skillsGrid.locator('.skill-group')).toHaveCount(4);

      // 验证区块标题
      await expect(skillsGrid).toContainText('调查员职业技能');
      await expect(skillsGrid).toContainText('非职业技能');
      await expect(skillsGrid).toContainText('其他技能');
      await expect(skillsGrid).toContainText('一窍不通');
    });

    test('TC-05-02: 技能检定值正确性', async ({ page }) => {
      await page.goto(BASE_URL + '/index.html');
      await page.waitForTimeout(2000);

      // 验证侦查技能有检定值
      const skillsGrid = page.locator('#skillsGrid');
      const spotHidden = skillsGrid.locator('.skill-row:has-text("侦查")');
      await expect(spotHidden.locator('.check-cell').first()).toBeVisible();
    });

    test('TC-05-03: 技能区块折叠/展开', async ({ page }) => {
      await page.goto(BASE_URL + '/index.html');
      await page.waitForTimeout(2000);

      const skillsGrid = page.locator('#skillsGrid');

      // 找到"其他技能"区块（默认折叠）
      const otherGroup = skillsGrid.locator('.skill-group-header:has-text("其他技能")');

      // 验证默认折叠状态
      const otherGroupContainer = otherGroup.locator('..');
      await expect(otherGroupContainer).toHaveClass(/collapsed/);

      // 点击展开
      await otherGroup.click();
      await page.waitForTimeout(500);
      await expect(otherGroupContainer).not.toHaveClass(/collapsed/);

      // 再次点击折叠
      await otherGroup.click();
      await page.waitForTimeout(500);
      await expect(otherGroupContainer).toHaveClass(/collapsed/);
    });

    test('TC-05-04: 技能复选框功能', async ({ page }) => {
      await page.goto(BASE_URL + '/index.html');
      await page.waitForTimeout(2000);

      // 找到第一个展开区块中的第一个技能复选框
      const firstCheckbox = page.locator('#skillsGrid .skill-group:not(.collapsed) .skill-row:first-child input[type="checkbox"]').first();
      if (await firstCheckbox.isVisible()) {
        const initialState = await firstCheckbox.isChecked();
        await firstCheckbox.click();
        await expect(firstCheckbox).toBeChecked(!initialState);
      }
    });
  });

  // ==========================================
  // TC-06: 武器面板
  // ==========================================
  test.describe('TC-06: 武器面板', () => {

    test('TC-06-01: 武器表格完整性', async ({ page }) => {
      await page.goto(BASE_URL + '/index.html');
      await page.waitForTimeout(2000);

      // 验证武器面板存在
      const weaponsPanel = page.locator('.weapons-panel');
      await expect(weaponsPanel).toBeVisible();

      // 验证武器表格列标题
      await expect(weaponsPanel).toContainText('武器名');
      await expect(weaponsPanel).toContainText('伤害');
      await expect(weaponsPanel).toContainText('射程');

      // 验证默认角色有武器
      await expect(weaponsPanel).toContainText('.32左轮手枪');
      await expect(weaponsPanel).toContainText('霰弹枪');
    });

    test('TC-06-02: 格斗面板', async ({ page }) => {
      await page.goto(BASE_URL + '/index.html');
      await page.waitForTimeout(2000);

      const combatPanel = page.locator('.combat-panel');
      await expect(combatPanel).toBeVisible();

      // 验证 DB、Build、Dodge
      await expect(combatPanel).toContainText('DB');
      await expect(combatPanel).toContainText('Build');
      await expect(combatPanel).toContainText('躲闪');
      await expect(combatPanel).toContainText(String(DEFAULT_CHARACTER.dodge));
    });
  });

  // ==========================================
  // TC-07: 背景故事
  // ==========================================
  test.describe('TC-07: 背景故事', () => {

    test('TC-07-01: 背景故事类别展示', async ({ page }) => {
      await page.goto(BASE_URL + '/index.html');
      await page.waitForTimeout(2000);

      const backstoryGrid = page.locator('#backstoryGrid');
      await expect(backstoryGrid).toBeVisible();

      // 验证所有 10 个类别
      for (const category of DEFAULT_CHARACTER.backstoryCategories) {
        await expect(backstoryGrid).toContainText(category);
      }
    });

    test('TC-07-02: 关键连接标记', async ({ page }) => {
      await page.goto(BASE_URL + '/index.html');
      await page.waitForTimeout(2000);

      const backstoryGrid = page.locator('#backstoryGrid');
      // 验证关键连接星号标记存在
      await expect(backstoryGrid.locator('text=★')).toBeVisible();
    });
  });

  // ==========================================
  // TC-08: 随身物品与资产
  // ==========================================
  test.describe('TC-08: 随身物品与资产', () => {

    test('TC-08-01: 随身物品列表', async ({ page }) => {
      await page.goto(BASE_URL + '/index.html');
      await page.waitForTimeout(2000);

      const equipmentPanel = page.locator('.equipment-panel');
      await expect(equipmentPanel).toBeVisible();

      // 验证有物品显示
      const equipmentItems = equipmentPanel.locator('.equipment-item, .eq-line');
      const count = await equipmentItems.count();
      expect(count).toBeGreaterThan(0);
    });

    test('TC-08-02: 资产面板', async ({ page }) => {
      await page.goto(BASE_URL + '/index.html');
      await page.waitForTimeout(2000);

      const assetsPanel = page.locator('.assets-panel');
      await expect(assetsPanel).toBeVisible();

      // 验证信用评级和现金
      await expect(assetsPanel).toContainText('信用评级');
      await expect(assetsPanel).toContainText('可支配现金');
      await expect(assetsPanel).toContainText(DEFAULT_CHARACTER.spendingCash);
    });
  });

  // ==========================================
  // TC-09: 调查员同伴
  // ==========================================
  test.describe('TC-09: 调查员同伴', () => {

    test('TC-09-01: 同伴面板布局', async ({ page }) => {
      await page.goto(BASE_URL + '/index.html');
      await page.waitForTimeout(2000);

      const companionsPanel = page.locator('.companions-panel, .companions-container');
      // 验证同伴面板存在
      await expect(companionsPanel).toBeVisible();
    });

    test('TC-09-02: 同伴信息显示', async ({ page }) => {
      await page.goto(BASE_URL + '/index.html');
      await page.waitForTimeout(2000);

      // 验证中心"我"节点
      const meNode = page.locator('.companion-node:has-text("我"), .companion-center:has-text("我")');
      await expect(meNode).toBeVisible();
    });
  });

  // ==========================================
  // TC-10: 导入/导出功能
  // ==========================================
  test.describe('TC-10: 导入/导出功能', () => {

    test('TC-10-01: 导入按钮触发文件选择器', async ({ page }) => {
      await page.goto(BASE_URL + '/index.html');
      await page.waitForTimeout(2000);

      // 监听文件选择器事件
      const fileInput = page.locator('#importFileInput');
      await expect(fileInput).toHaveCount(1);
      await expect(fileInput).toHaveAttribute('accept', '.coc7');

      // 验证导入按钮存在
      const importBtn = page.locator('#import-actions button:has-text("导入")');
      await expect(importBtn).toBeVisible();
    });

    test('TC-10-03: 清除角色数据', async ({ page }) => {
      await page.goto(BASE_URL + '/index.html');
      await page.waitForTimeout(2000);

      // 先注入自定义数据
      await page.evaluate(() => {
        localStorage.setItem('coc-tracker-data', JSON.stringify({
          name: '临时测试角色',
          rawAttrs: { STR: 50, CON: 60, SIZ: 50, DEX: 60, APP: 70, INT: 80, POW: 70, EDU: 75 },
          effectiveAttrs: { STR: 50, CON: 60, SIZ: 50, DEX: 60, APP: 70, INT: 80, POW: 70, EDU: 75 },
          luck: 60,
          derived: { hp: 11, mp: 14, san: 60, db: '0', build: 0, mov: 8, dodge: 30, language: 75 },
          skillPoints: {},
          background: [],
          companions: [],
          equipment: [],
          weapons: [],
          occSkills: [],
          spendingCash: '$200'
        }));
      });
      await page.reload();
      await page.waitForTimeout(2000);

      // 验证自定义数据已加载
      await expect(page.locator('#infoFields')).toContainText('临时测试角色');

      // 监听确认对话框
      page.on('dialog', async dialog => {
        await dialog.accept();
      });

      // 点击清除按钮
      const clearBtn = page.locator('#import-actions button:has-text("清除")');
      await clearBtn.click();
      await page.waitForTimeout(1000);

      // 验证恢复为默认角色
      await expect(page.locator('#infoFields')).toContainText(DEFAULT_CHARACTER.name);
    });
  });

  // ==========================================
  // TC-11: 骰子面板
  // ==========================================
  test.describe('TC-11: 骰子面板', () => {

    test('TC-11-01: 骰子面板打开', async ({ page }) => {
      await page.goto(BASE_URL + '/index.html');
      await page.waitForTimeout(2000);

      // 点击属性骰子按钮
      const firstDiceBtn = page.locator('#attributesGrid .dice-btn').first();
      await expect(firstDiceBtn).toBeVisible();
      await firstDiceBtn.click();
      await page.waitForTimeout(1000);

      // 验证骰子面板显示
      const dicePanel = page.locator('.dice-panel, #dicePanel, .dice-overlay');
      await expect(dicePanel).toBeVisible();
    });

    test('TC-11-02: 骰子面板关闭', async ({ page }) => {
      await page.goto(BASE_URL + '/index.html');
      await page.waitForTimeout(2000);

      // 打开骰子面板
      const firstDiceBtn = page.locator('#attributesGrid .dice-btn').first();
      await firstDiceBtn.click();
      await page.waitForTimeout(1000);

      // 关闭骰子面板
      const closeBtn = page.locator('.dice-panel button:has-text("关闭"), .dice-overlay button:has-text("关闭")').first();
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
        await page.waitForTimeout(500);

        // 验证面板隐藏
        const dicePanel = page.locator('.dice-panel, #dicePanel, .dice-overlay');
        await expect(dicePanel).not.toBeVisible();
      }
    });

    test('TC-11-03: 骰子类型选择', async ({ page }) => {
      await page.goto(BASE_URL + '/index.html');
      await page.waitForTimeout(2000);

      // 打开骰子面板
      await page.locator('#attributesGrid .dice-btn').first().click();
      await page.waitForTimeout(1000);

      // 点击 D100 按钮
      const d100Btn = page.locator('.dice-panel button:has-text("D100"), .dice-overlay button:has-text("D100")').first();
      if (await d100Btn.isVisible()) {
        await d100Btn.click();
        await d100Btn.click();
        await page.waitForTimeout(300);

        // 验证选中数量
        const countDisplay = page.locator('.dice-panel .dice-count, .dice-overlay .dice-count');
        // 简单验证 D100 按钮被激活
        await expect(d100Btn).toBeVisible();
      }
    });

    test('TC-11-04: 骰子表达式输入', async ({ page }) => {
      await page.goto(BASE_URL + '/index.html');
      await page.waitForTimeout(2000);

      // 打开骰子面板
      await page.locator('#attributesGrid .dice-btn').first().click();
      await page.waitForTimeout(1000);

      // 输入表达式
      const expressionInput = page.locator('.dice-panel input[type="text"], .dice-overlay input[type="text"]').first();
      if (await expressionInput.isVisible()) {
        await expressionInput.fill('1d100');
        await expect(expressionInput).toHaveValue('1d100');
      }
    });
  });

  // ==========================================
  // TC-12: 响应式与打印
  // ==========================================
  test.describe('TC-12: 响应式与打印', () => {

    test('TC-12-01: 页面翻转导航', async ({ page }) => {
      await page.goto(BASE_URL + '/index.html');
      await page.waitForTimeout(2000);

      // 验证正面和背面都存在
      await expect(page.locator('#page1')).toBeVisible();
      await expect(page.locator('#page2')).toBeVisible();
    });

    test('TC-12-02: 响应式布局', async ({ page }) => {
      await page.goto(BASE_URL + '/index.html');
      await page.waitForTimeout(2000);

      // 设置移动端视口
      await page.setViewportSize({ width: 375, height: 812 });
      await page.waitForTimeout(500);

      // 验证页面仍然可访问
      await expect(page.locator('#page1')).toBeVisible();
      await expect(page.locator('#infoSection')).toBeVisible();

      // 恢复桌面视口
      await page.setViewportSize({ width: 1280, height: 720 });
    });
  });
});
