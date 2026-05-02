/**
 * render/backstory.js - Backstory 渲染（支持 L2 编辑模式）
 * 每个类别用一个完整文本框呈现
 */

function renderBackstory(data) {
    let bg = data.background || [];
    let keyConnection = data.keyConnection !== undefined ? data.keyConnection : -1;
    let grid = document.getElementById('backstoryGrid');
    let html = '';
    let em = window.isEditMode ? window.isEditMode() : false;

    BACKSTORY_CATEGORIES.forEach(cat => {
      let items = bg.filter(b => b.category === cat.key);
      let content = '';
      let isKey = false;
      let itemIdx = -1;

      if (items.length > 0) {
        let item = items[0];
        content = item.content || '';
        isKey = item.isKey || (bg.indexOf(item) === keyConnection);
        itemIdx = bg.indexOf(item);
      }

      // 关键连接标记
      let keyBadge = '';
      if (isKey) {
        if (em) {
          keyBadge = `<span class="tag-occ tag-clickable" onclick="toggleKeyConnection('${cat.key}', 0)" title="点击取消关键连接">★</span>`;
        } else {
          keyBadge = `<span class="tag-occ">★</span>`;
        }
      } else if (em && items.length > 0) {
        keyBadge = `<span class="tag-key-empty" onclick="toggleKeyConnection('${cat.key}', 0)" title="点击设为关键连接">☆</span>`;
      }

      // 文本区域：编辑模式用 textarea，普通模式用只读 div
      let textareaHtml;
      if (em) {
        textareaHtml = `<textarea class="backstory-textarea" rows="3"
          oninput="updateBackstoryContent('${cat.key}', this.value)"
          placeholder="输入${cat.key}...">${escapeHtml(content)}</textarea>`;
      } else {
        let displayContent = content
          ? escapeHtml(content).replace(/\n/g, '<br>')
          : '<span class="backstory-empty">—</span>';
        textareaHtml = `<div class="backstory-text">${displayContent}</div>`;
      }

      html += `<div class="backstory-field${isKey ? ' backstory-field-key' : ''}">
        <div class="backstory-label">${keyBadge}${cat.label}</div>
        <div class="backstory-content">${textareaHtml}</div>
      </div>`;
    });

    grid.innerHTML = html;
  }

  function escapeHtml(str) {
    let div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
