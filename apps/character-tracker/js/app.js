/**
 * app.js - 调查员追踪器主入口
 * 负责初始化、渲染编排、事件绑定
 */

(function() {
  'use strict';

  // 当前角色数据
  let currentData = null;

  // 渲染编排
  function renderCharacter(data) {
    currentData = data;
    renderBasicInfo(data);
    renderAttributes(data);
    renderTrackers(data);
    renderSkills(data);
    renderWeapons(data);
    renderBackstory(data);
    renderEquipment(data);
    renderCompanions(data);
    // 重新绑定骰子按钮
    bindDiceButtons();
  }

  // 暴露到全局，供 import.js 调用
  window.renderCharacter = renderCharacter;

  // 骰子按钮绑定
  function bindDiceButtons() {
    document.querySelectorAll('.dice-btn').forEach(btn => {
      // 移除旧监听器（通过克隆节点）
      let newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);
      newBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        if (window.openDicePanel) window.openDicePanel();
      });
    });
  }

  // 初始化
  function init() {
    // 绑定导入按钮
    document.getElementById('importBtn').addEventListener('click', () => {
      document.getElementById('importFileInput').click();
    });
    document.getElementById('importFileInput').addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        window.importCharacter(e.target.files[0]);
        e.target.value = ''; // 重置以允许重复导入同一文件
      }
    });
    document.getElementById('clearDataBtn').addEventListener('click', () => window.clearData());

    // 尝试从 localStorage 加载
    let saved = localStorage.getItem('coc-tracker-data');
    if (saved) {
      try {
        let data = JSON.parse(saved);
        if (data && data.name && data.rawAttrs) {
          renderCharacter(data);
          return;
        }
      } catch (e) { /* 忽略解析错误 */ }
    }
    // 使用默认数据
    renderCharacter(DEFAULT_DATA);
  }

  // 页面加载后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
