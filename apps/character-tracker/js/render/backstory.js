/**
 * render/backstory.js - Backstory 渲染
 */

function renderBackstory(data) {
    let bg = data.background || [];
    let keyConnection = data.keyConnection !== undefined ? data.keyConnection : -1;
    let grid = document.getElementById('backstoryGrid');
    let html = '';

    BACKSTORY_CATEGORIES.forEach(cat => {
      let items = bg.filter(b => b.category === cat.key);
      let linesHtml = '';
      if (items.length > 0) {
        items.forEach((item, idx) => {
          let text = item.content || '';
          // 标记关键连接
          let isKey = item.isKey || (bg.indexOf(item) === keyConnection);
          let prefix = isKey ? '<span class="tag-occ" style="margin-right:4px;">★</span>' : '';
          // 按换行拆分
          let lines = text.split('\n');
          lines.forEach(line => {
            linesHtml += `<div class="backstory-line">${prefix}${line}</div>`;
            prefix = ''; // 只在第一行显示标记
          });
        });
      } else {
        linesHtml = '<div class="backstory-line"></div><div class="backstory-line"></div><div class="backstory-line"></div>';
      }
      // 补齐至少4行
      let lineCount = (linesHtml.match(/class="backstory-line"/g) || []).length;
      while (lineCount < 3) { linesHtml += '<div class="backstory-line"></div>'; lineCount++; }

      html += `<div class="backstory-field">
        <div class="backstory-label">${cat.label}</div>
        <div class="backstory-lines">${linesHtml}</div>
      </div>`;
    });

    grid.innerHTML = html;
  }
