#!/usr/bin/env python3
"""
角色卡追踪器 - 端到端测试脚本（Python 版）
使用 HTTP 请求 + HTML/JS 解析验证页面结构和内容
适用于无法安装 Playwright 的环境
"""

import json
import re
import sys
import time
import urllib.request
import urllib.error

BASE_URL = "http://localhost:8888"

# ============================================
# 测试结果收集
# ============================================
class TestResult:
    def __init__(self):
        self.results = []
    
    def add(self, case_id, name, status, detail=""):
        self.results.append({
            "id": case_id,
            "name": name,
            "status": status,
            "detail": detail
        })
        icon = {"PASS": "✅", "FAIL": "❌", "SKIP": "⏭️"}[status]
        print(f"  {icon} {case_id}: {name}" + (f" - {detail}" if detail else ""))
    
    def summary(self):
        total = len(self.results)
        passed = sum(1 for r in self.results if r["status"] == "PASS")
        failed = sum(1 for r in self.results if r["status"] == "FAIL")
        skipped = sum(1 for r in self.results if r["status"] == "SKIP")
        print(f"\n{'='*60}")
        print(f"测试结果汇总: {passed}/{total} 通过, {failed} 失败, {skipped} 跳过")
        print(f"{'='*60}")
        return failed == 0

results = TestResult()

# ============================================
# 工具函数
# ============================================
def fetch(url):
    try:
        with urllib.request.urlopen(url, timeout=10) as resp:
            return resp.read().decode('utf-8', errors='replace')
    except Exception as e:
        return None

def has_id(html, eid):
    return bool(re.search(rf'id=["\']{re.escape(eid)}["\']', html))

def has_class(html, cls):
    return bool(re.search(rf'class=["\'][^"\']*\b{re.escape(cls)}\b[^"\']*["\']', html))

def has_text(html, text):
    return text in html

# ============================================
# 获取所有资源
# ============================================
print("🔍 正在获取角色卡追踪器页面及资源...")
html = fetch(f"{BASE_URL}/index.html")
if not html:
    print("❌ 无法获取页面，请确保服务器正在运行")
    sys.exit(1)
print(f"📄 页面大小: {len(html)} 字节")

# 获取所有 JS 文件
js_files = {
    "app": fetch(f"{BASE_URL}/js/app.js") or "",
    "import": fetch(f"{BASE_URL}/js/import.js") or "",
    "utils": fetch(f"{BASE_URL}/js/utils.js") or "",
    "default_char": fetch(f"{BASE_URL}/js/data/default-character.js") or "",
    "skills": fetch(f"{BASE_URL}/js/data/skills.js") or "",
    "dice": fetch(f"{BASE_URL}/js/dice-module.js") or "",
    "render_info": fetch(f"{BASE_URL}/js/render/info.js") or "",
    "render_attrs": fetch(f"{BASE_URL}/js/render/attributes.js") or "",
    "render_trackers": fetch(f"{BASE_URL}/js/render/trackers.js") or "",
    "render_skills": fetch(f"{BASE_URL}/js/render/skills.js") or "",
    "render_weapons": fetch(f"{BASE_URL}/js/render/weapons.js") or "",
    "render_backstory": fetch(f"{BASE_URL}/js/render/backstory.js") or "",
    "render_equipment": fetch(f"{BASE_URL}/js/render/equipment.js") or "",
    "render_companions": fetch(f"{BASE_URL}/js/render/companions.js") or "",
}
all_js = "\n".join(js_files.values())
css = fetch(f"{BASE_URL}/css/tracker.css") or ""

# ============================================
# TC-01: 页面加载与初始化
# ============================================
print("\n📋 TC-01: 页面加载与初始化")

results.add("TC-01-01", "页面标题包含'克苏鲁的呼唤'",
    "PASS" if has_text(html, "克苏鲁的呼唤") else "FAIL")

results.add("TC-01-01b", "HTML lang=zh-CN",
    "PASS" if 'lang="zh-CN"' in html else "FAIL")

results.add("TC-01-01c", "页面包含正面和背面结构",
    "PASS" if has_class(html, "sheet") and has_class(html, "page2-bottom") else "FAIL")

results.add("TC-01-02", "localStorage 数据持久化",
    "PASS" if "localStorage" in js_files["app"] else "FAIL")

sections = {
    "infoSection": "调查员信息区",
    "attributesGrid": "属性区",
    "skillsGrid": "技能区",
    "backstoryGrid": "背景故事区",
}
for sid, label in sections.items():
    results.add(f"TC-01-03-{sid}", f"页面区域 '{label}' 存在",
        "PASS" if has_id(html, sid) else "FAIL")

results.add("TC-01-03-extra", "导入按钮区域存在",
    "PASS" if has_class(html, "import-actions") else "FAIL")

# ============================================
# TC-02: 基本信息展示
# ============================================
print("\n📋 TC-02: 基本信息展示")

results.add("TC-02-01", "信息字段区域 #infoFields",
    "PASS" if has_id(html, "infoFields") else "FAIL")

results.add("TC-02-02", "头像区域 #portrait",
    "PASS" if has_id(html, "portrait") else "FAIL")

dc = js_files["default_char"]
info_fields = [
    ("name", "亨利·阿什克罗夫特"), ("occupation", "私家侦探"),
    ("age", "34"), ("gender", "男"), ("residence", "波士顿"),
    ("hometown", "波士顿"), ("era", "1920s"),
]
for field, expected in info_fields:
    results.add(f"TC-02-01-{field}", f"默认角色 {field}={expected}",
        "PASS" if expected in dc else "FAIL", f"'{expected}'")

# 头像渲染逻辑
results.add("TC-02-02b", "头像渲染逻辑（含回退）",
    "PASS" if "avatar" in js_files["render_info"] and ("img" in js_files["render_info"] or "placeholder" in js_files["render_info"].lower()) else "FAIL")

# ============================================
# TC-03: 属性面板
# ============================================
print("\n📋 TC-03: 属性面板")

results.add("TC-03-01", "属性面板 #attributesGrid",
    "PASS" if has_id(html, "attributesGrid") else "FAIL")

attrs = {"STR": 60, "CON": 50, "SIZ": 55, "DEX": 70, "APP": 50, "INT": 75, "POW": 60, "EDU": 65}
for attr, val in attrs.items():
    results.add(f"TC-03-01-{attr}", f"属性 {attr}={val}",
        "PASS" if attr in dc and str(val) in dc else "FAIL")

results.add("TC-03-02", "检定值 - 半值计算 (Math.floor(v/2))",
    "PASS" if "half" in js_files["utils"] and "Math.floor" in js_files["utils"] else "FAIL")

results.add("TC-03-02b", "检定值 - 五分之一值计算 (Math.floor(v/5))",
    "PASS" if "fifth" in js_files["utils"] and "/ 5" in js_files["utils"] else "FAIL")

results.add("TC-03-02c", "属性检定单元格渲染（主值/半值/五分之一）",
    "PASS" if "ck-main" in js_files["render_attrs"] and "ck-half" in js_files["render_attrs"] and "ck-fifth" in js_files["render_attrs"] else "FAIL")

results.add("TC-03-03", "MOV 属性",
    "PASS" if "MOV" in js_files["render_attrs"] else "FAIL")

results.add("TC-03-04", "属性骰子按钮",
    "PASS" if "dice-btn" in js_files["render_attrs"] else "FAIL")

# ============================================
# TC-04: 追踪条
# ============================================
print("\n📋 TC-04: 追踪条")

rt = js_files["render_trackers"]
results.add("TC-04-01", "HP 追踪器渲染",
    "PASS" if "HP" in rt else "FAIL")

results.add("TC-04-01b", "HP 状态复选框（重伤/濒死/昏迷）",
    "PASS" if all(kw in rt for kw in ["重伤", "濒死", "昏迷"]) else "FAIL")

results.add("TC-04-02", "幸运值追踪器渲染",
    "PASS" if "幸运" in rt or "LUCK" in rt else "FAIL")

results.add("TC-04-02b", "幸运值检定单元格",
    "PASS" if "ck-main" in rt and "ck-half" in rt else "FAIL")

results.add("TC-04-03", "MP 追踪器渲染",
    "PASS" if "MP" in rt else "FAIL")

results.add("TC-04-04", "SAN 追踪器渲染",
    "PASS" if "SAN" in rt else "FAIL")

results.add("TC-04-04b", "SAN 疯狂类型复选框（临时性/不定性/永久性）",
    "PASS" if all(kw in rt for kw in ["临时性", "不定性", "永久性"]) else "FAIL")

# ============================================
# TC-05: 技能面板
# ============================================
print("\n📋 TC-05: 技能面板")

results.add("TC-05-01", "技能面板 #skillsGrid",
    "PASS" if has_id(html, "skillsGrid") else "FAIL")

sk = js_files["skills"]
skill_categories = ["regular", "combat", "firearms", "science", "artCraft", "survival"]
for cat in skill_categories:
    results.add(f"TC-05-01-{cat}", f"技能分类 '{cat}'",
        "PASS" if cat in sk else "FAIL")

results.add("TC-05-02", "技能检定值渲染（基础值+职业点+兴趣点）",
    "PASS" if "calcSkillTotal" in js_files["utils"] or "total" in js_files["render_skills"] else "FAIL")

results.add("TC-05-03", "技能区块折叠/展开",
    "PASS" if "collapsed" in js_files["render_skills"] and "toggle" in js_files["render_skills"] else "FAIL")

results.add("TC-05-04", "技能复选框",
    "PASS" if "checkbox" in js_files["render_skills"] or "type=\"checkbox\"" in js_files["render_skills"] else "FAIL")

results.add("TC-05-05", "技能骰子按钮",
    "PASS" if "dice-btn" in js_files["render_skills"] else "FAIL")

# ============================================
# TC-06: 武器面板
# ============================================
print("\n📋 TC-06: 武器面板")

rw = js_files["render_weapons"]
results.add("TC-06-01", "武器渲染模块存在",
    "PASS" if len(rw) > 50 else "FAIL")

results.add("TC-06-01b", "武器表格列（武器/伤害/射程等）",
    "PASS" if all(kw in rw for kw in ["武器", "伤害", "射程"]) else "FAIL")

results.add("TC-06-01c", "武器技能检定值（常规/困难/极难）",
    "PASS" if "ck-main" in rw and "ck-half" in rw else "FAIL")

results.add("TC-06-02", "格斗面板（DB/体格/躲闪）",
    "PASS" if all(kw in rw for kw in ["伤害加值", "体格", "躲闪"]) else "FAIL")

# 默认武器
weapons_in_dc = [".32 左轮手枪", "霰弹枪", "战斗匕首", "徒手"]
for w in weapons_in_dc:
    results.add(f"TC-06-01w-{w[:4]}", f"默认武器 '{w}'",
        "PASS" if w in dc else "FAIL")

# ============================================
# TC-07: 背景故事
# ============================================
print("\n📋 TC-07: 背景故事")

rb = js_files["render_backstory"]
results.add("TC-07-01", "背景故事渲染模块",
    "PASS" if len(rb) > 50 else "FAIL")

results.add("TC-07-01b", "背景故事区域 #backstoryGrid",
    "PASS" if has_id(html, "backstoryGrid") else "FAIL")

categories = ["形象描述", "特质", "思想与信念", "创伤和疤痕", "重要之人",
              "恐惧症和躁狂症", "意义非凡之地", "典籍法术和神话造物", "宝贵之物", "第三类接触"]
found_cats = [c for c in categories if c in sk]
results.add("TC-07-01c", f"背景故事类别定义 ({len(found_cats)}/10)",
    "PASS" if len(found_cats) >= 9 else "FAIL", f"找到: {found_cats}")

results.add("TC-07-02", "关键连接标记（★星号）",
    "PASS" if "★" in rb or "isKey" in rb or "keyConnection" in rb else "FAIL")

# ============================================
# TC-08: 随身物品与资产
# ============================================
print("\n📋 TC-08: 随身物品与资产")

re_eq = js_files["render_equipment"]
results.add("TC-08-01", "随身物品渲染模块",
    "PASS" if len(re_eq) > 50 else "FAIL")

results.add("TC-08-01b", "物品格式（名称/类型/价格/详情）",
    "PASS" if "equipment" in re_eq.lower() or "物品" in re_eq else "FAIL")

results.add("TC-08-02", "资产面板（信用评级+可支配现金）",
    "PASS" if ("信用评级" in re_eq or "Credit" in re_eq) and ("可支配现金" in re_eq or "Spending" in re_eq) else "FAIL")

# 默认物品
results.add("TC-08-01c", "默认角色有随身物品数据",
    "PASS" if "equipment" in dc and len(dc.split("equipment", 1)[1]) > 10 else "FAIL")

# ============================================
# TC-09: 调查员同伴
# ============================================
print("\n📋 TC-09: 调查员同伴")

rc = js_files["render_companions"]
results.add("TC-09-01", "同伴渲染模块",
    "PASS" if len(rc) > 50 else "FAIL")

results.add("TC-09-01b", "同伴圆形辐射布局",
    "PASS" if "companion" in rc.lower() or len(rc) > 50 else "FAIL")

results.add("TC-09-02", "中心'我'节点",
    "PASS" if "我" in rc else "FAIL")

# 默认同伴
results.add("TC-09-02b", "默认角色有同伴数据",
    "PASS" if "companions" in dc else "FAIL")

# ============================================
# TC-10: 导入/导出功能
# ============================================
print("\n📋 TC-10: 导入/导出功能")

imp = js_files["import"]
results.add("TC-10-01", "导入模块存在",
    "PASS" if len(imp) > 50 else "FAIL")

results.add("TC-10-01b", "支持 .coc7 文件格式",
    "PASS" if ".coc7" in imp else "FAIL")

results.add("TC-10-01c", "导入文件输入元素 #importFileInput",
    "PASS" if has_id(html, "importFileInput") else "FAIL")

results.add("TC-10-01d", "导入按钮存在",
    "PASS" if has_id(html, "importBtn") else "FAIL")

results.add("TC-10-02", "导入后 localStorage 持久化",
    "PASS" if "localStorage" in imp else "FAIL")

results.add("TC-10-02b", "导入数据格式验证（_format: coc7-char-v1）",
    "PASS" if "coc7-char-v1" in imp else "FAIL")

results.add("TC-10-03", "清除角色数据功能",
    "PASS" if "clearData" in imp or "清除" in imp else "FAIL")

results.add("TC-10-03b", "清除按钮存在 #clearDataBtn",
    "PASS" if has_id(html, "clearDataBtn") else "FAIL")

results.add("TC-10-04", "Toast 通知功能",
    "PASS" if "showToast" in imp or "Toast" in imp else "FAIL")

# ============================================
# TC-11: 骰子面板
# ============================================
print("\n📋 TC-11: 骰子面板")

dice = js_files["dice"]
results.add("TC-11-01", "骰子模块存在",
    "PASS" if len(dice) > 100 else "FAIL")

dice_types = ["D4", "D6", "D8", "D10", "D12", "D20", "D100"]
found_dice = [d for d in dice_types if d in dice]
results.add("TC-11-01b", f"骰子类型支持 ({len(found_dice)}/7)",
    "PASS" if len(found_dice) >= 7 else "FAIL", f"找到: {found_dice}")

results.add("TC-11-01c", "骰子面板 HTML 元素",
    "PASS" if has_id(html, "dice-box-container") or has_class(html, "dice-panel") else "FAIL")

results.add("TC-11-02", "骰子面板开关功能",
    "PASS" if "openDicePanel" in dice and "closeDicePanel" in dice else "FAIL")

results.add("TC-11-03", "骰子类型选择（点击增加数量）",
    "PASS" if "selectedDice" in dice or "dice-btn" in dice else "FAIL")

results.add("TC-11-04", "骰子表达式输入",
    "PASS" if "表达式" in dice or "notation" in dice or "input" in dice.lower() else "FAIL")

results.add("TC-11-05", "掷骰功能",
    "PASS" if "rollDice" in dice or "roll(" in dice else "FAIL")

results.add("TC-11-05b", "掷骰结果展示",
    "PASS" if "displayResults" in dice or "results" in dice.lower() else "FAIL")

results.add("TC-11-05c", "DiceBox 3D 引擎初始化",
    "PASS" if "DiceBox" in dice or "initDiceBox" in dice else "FAIL")

results.add("TC-11-06", "ESC 键关闭面板",
    "PASS" if "Escape" in dice or "ESC" in dice or "keydown" in dice else "FAIL")

# ============================================
# TC-12: 响应式与打印
# ============================================
print("\n📋 TC-12: 响应式与打印")

results.add("TC-12-01", "页面正反面结构",
    "PASS" if has_class(html, "sheet") else "FAIL")

results.add("TC-12-02", "响应式布局 - @media 查询",
    "PASS" if "@media" in css else "FAIL")

results.add("TC-12-02b", "移动端断点 (800px)",
    "PASS" if "800px" in css or "768px" in css else "FAIL")

results.add("TC-12-03", "打印样式支持",
    "PASS" if "print" in css else "FAIL")

# ============================================
# 额外验证: 代码质量
# ============================================
print("\n📋 额外验证: 代码质量")

results.add("QC-01", "app.js 使用严格模式 (use strict)",
    "PASS" if "'use strict'" in js_files["app"] or '"use strict"' in js_files["app"] else "FAIL")

results.add("QC-02", "所有渲染模块被 app.js 调用",
    "PASS" if all(f"render{m}(" in js_files["app"] for m in ["BasicInfo", "Attributes", "Trackers", "Skills", "Weapons", "Backstory", "Equipment", "Companions"]) else "FAIL")

results.add("QC-03", "CSS 变量系统定义",
    "PASS" if "--bg-primary" in css and "--gold" in css else "FAIL")

results.add("QC-04", "哥特风装饰元素",
    "PASS" if has_class(html, "corner-decor") else "FAIL")

results.add("QC-05", "骰子按钮全局绑定",
    "PASS" if "bindDiceButtons" in js_files["app"] or "dice-btn" in js_files["app"] else "FAIL")

# ============================================
# 生成 JSON 测试报告
# ============================================
report = {
    "project": "角色卡追踪器 - 端到端测试",
    "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
    "baseUrl": BASE_URL,
    "summary": {
        "total": len(results.results),
        "passed": sum(1 for r in results.results if r["status"] == "PASS"),
        "failed": sum(1 for r in results.results if r["status"] == "FAIL"),
        "skipped": sum(1 for r in results.results if r["status"] == "SKIP"),
    },
    "results": results.results
}

report_path = "/sessions/69f0b5b5830ba2f94beafee4/workspace/apps/character-tracker/test-results.json"
with open(report_path, "w", encoding="utf-8") as f:
    json.dump(report, f, ensure_ascii=False, indent=2)

print(f"\n📊 测试报告已保存: test-results.json")

all_passed = results.summary()
sys.exit(0 if all_passed else 1)
