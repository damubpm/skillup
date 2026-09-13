import json

with open("english_grammar.html", "r", encoding="utf-8") as f:
    text = f.read()

start = text.find("<script>")
end = text.rfind("</script>")
js_code = text[start+len("<script>"):end]

# 1. Update CSS for .rule-table
table_css = """
    .rule-table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 14px; background: #fff; border-radius: 8px; overflow: hidden; border: 1px solid var(--line); }
    .rule-table th, .rule-table td { padding: 8px 12px; border: 1px solid var(--line); text-align: left; }
    .rule-table th { background: rgba(15,107,93,0.08); color: var(--accent); font-weight: 700; }
"""

if ".rule-table" not in text:
    style_end = text.find("</style>")
    text = text[:style_end] + table_css + text[style_end:]

# Re-read positions
start = text.find("<script>")
end = text.rfind("</script>")
js_code = text[start+len("<script>"):end]

# 2. Expand AnswerChecker contractions
old_norm = '    .replace(/\\bhave not\\b/g,"haven\'t").replace(/\\bhas not\\b/g,"hasn\'t").replace(/\\bhad not\\b/g,"hadn\'t");'
new_norm = '    .replace(/\\bhave not\\b/g,"haven\'t").replace(/\\bhas not\\b/g,"hasn\'t").replace(/\\bhad not\\b/g,"hadn\'t")\n    .replace(/\\bis not\\b/g,"isn\'t").replace(/\\bare not\\b/g,"aren\'t").replace(/\\bwas not\\b/g,"wasn\'t").replace(/\\bwere not\\b/g,"weren\'t")\n    .replace(/\\bshould not\\b/g,"shouldn\'t").replace(/\\bmust not\\b/g,"mustn\'t").replace(/\\bcould not\\b/g,"couldn\'t");'

if old_norm in js_code:
    js_code = js_code.replace(old_norm, new_norm)

# 3. Guard UI calls in LearningEngine
js_code = js_code.replace('UI.showPage("training"); UI.renderExercise();', 'if(typeof document !== "undefined"){ UI.showPage("training"); UI.renderExercise(); }')
js_code = js_code.replace('finish(); else UI.renderExercise();', 'finish(); else if(typeof document !== "undefined") UI.renderExercise();')
js_code = js_code.replace('UI.renderSummary(ended,session.results);', 'if(typeof document !== "undefined") UI.renderSummary(ended,session.results);')
js_code = js_code.replace('finish(); else UI.showPage("today");', 'finish(); else if(typeof document !== "undefined") UI.showPage("today");')

# 4. Add T helper updates & detailed HTML table rendering
old_T = 'const T = (id,title,level,rule,formula,examples,errors,contrast,seeds=[]) => ({id,title,level,rule,formula,examples,errors,contrast,seeds});'
new_T = 'const T = (id,title,level,rule,formula,examples,errors,contrast,seeds=[],tip="",details="",tableHtml="") => ({id,title,level,rule,formula,examples,errors,contrast,seeds,tip,details,tableHtml});'
if old_T in js_code:
    js_code = js_code.replace(old_T, new_T)

old_ref = '      <div class="rulebox"><b>Когда:</b> ${escapeHtml(t.rule)}<br><b>Формула:</b> ${escapeHtml(t.formula)}</div>'
new_ref = '''      <div class="rulebox">
        <b>Подробное правило:</b> ${t.details ? escapeHtml(t.details) : escapeHtml(t.rule)}<br><br>
        <b>Сводная таблица форм и правил:</b>
        ${t.tableHtml ? t.tableHtml : `<table class="rule-table"><tr><th>Форма</th><th>Конструкция</th><th>Пример</th></tr><tr><td>Формула</td><td>${escapeHtml(t.formula)}</td><td>${escapeHtml(t.rule)}</td></tr></table>`}
      </div>'''

if old_ref in js_code:
    js_code = js_code.replace(old_ref, new_ref)

# 5. Add Audio Speech Synthesis function & Hint button to UI
speech_fn = '''
  function speakText(txt){
    if (typeof window !== "undefined" && "speechSynthesis" in window && txt) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(txt);
      u.lang = "en-US";
      u.rate = 0.9;
      window.speechSynthesis.speak(u);
    }
  }
'''
if 'function speakText' not in js_code:
    idx = js_code.find('return {bind,showPage,refreshAll,renderExercise,renderSummary,toast};')
    if idx != -1:
        js_code = js_code[:idx] + speech_fn + '\n' + js_code[idx:]

old_render_actions = '''<div class="actions" style="margin-top:14px"><button class="btn" id="checkAnswer" type="button">Проверить</button>
      <button class="btn secondary" id="showRule" type="button" ${ss.mode==="diagnostic"?"disabled title=\'В диагностике правило скрыто\'":""}>Показать правило</button></div>'''

new_render_actions = '''<div class="actions" style="margin-top:14px">
        <button class="btn" id="checkAnswer" type="button">Проверить</button>
        <button class="btn secondary" id="toggleHint" type="button" ${ss.mode==="diagnostic"?"disabled":""}>💡 Подсказка</button>
        <button class="btn secondary" id="showRule" type="button" ${ss.mode==="diagnostic"?"disabled title=\'В диагностике правило скрыто\'":""}>📖 Правило</button>
        <button class="btn secondary" id="speakPrompt" type="button">🔊 Озвучить</button>
      </div>
      <div id="hintBox" style="display:none;margin-top:10px;padding:10px 14px;background:rgba(217,164,65,0.15);border-left:4px solid var(--gold);border-radius:8px;font-size:14px;"></div>'''

if old_render_actions in js_code:
    js_code = js_code.replace(old_render_actions, new_render_actions)

old_bind_ex = '$("checkAnswer").addEventListener("click",onCheck);$("showRule").addEventListener("click",showRule);'
new_bind_ex = '''$("checkAnswer").addEventListener("click",onCheck);$("showRule").addEventListener("click",showRule);
    $("toggleHint")?.addEventListener("click",()=>{
      const hb = $("hintBox"), ex = LearningEngine.current(), topic = GrammarDatabase.get(ex.topicId);
      if(!hb) return;
      if(hb.style.display === "none"){
        hb.textContent = ex.explanation || topic?.tip || "Обратите внимание на ключевые слова и время глагола.";
        hb.style.display = "block";
      } else { hb.style.display = "none"; }
    });
    $("speakPrompt")?.addEventListener("click",()=>{
      const ex = LearningEngine.current();
      speakText(ex.prompt.replace(/___/g, ex.answer ? (Array.isArray(ex.answer)?ex.answer[0]:ex.answer) : "blank"));
    });'''

if old_bind_ex in js_code:
    js_code = js_code.replace(old_bind_ex, new_bind_ex)

# 6. Guard bottom document calls & export CJS modules
old_bottom = '''document.documentElement.dataset.theme=Storage.state.theme||"system";
UI.bind();
UI.refreshAll();
if(!Storage.state.diagnosticDone && Storage.state.totals.answered===0){
  setTimeout(()=>UI.toast("Совет: начни с диагностики, чтобы настроить адаптивную сложность."),500);
}
})();'''

new_bottom = '''if (typeof document !== "undefined") {
  document.documentElement.dataset.theme=Storage.state.theme||"system";
  UI.bind();
  UI.refreshAll();
  if(!Storage.state.diagnosticDone && Storage.state.totals.answered===0){
    setTimeout(()=>UI.toast("Совет: начни с диагностики, чтобы настроить адаптивную сложность."),500);
  }
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = { DAY, NOW, todayKey, clamp, sample, shuffle, escapeHtml, GrammarDatabase, Storage, AnswerChecker, SpacedRepetition, ProgressTracker, ExerciseGenerator, LearningEngine, UI };
}
})();'''

if old_bottom in js_code:
    js_code = js_code.replace(old_bottom, new_bottom)

new_html = text[:start+len("<script>")] + js_code + text[end:]
with open("english_grammar.html", "w", encoding="utf-8") as f:
    f.write(new_html)

with open("app.js", "w", encoding="utf-8") as f:
    f.write(js_code)

print("Patch all applied cleanly.")
