with open("english_grammar.html", "r", encoding="utf-8") as f:
    text = f.read()

start = text.find("<script>")
end = text.rfind("</script>")
js_code = text[start+len("<script>"):end]

# Replace repetitive examples and seeds with unique sentences for each topic

# relative_clauses (lines 186-193)
old_rel = '''    T("relative_clauses","Relative Clauses","B1","who — люди; which — вещи; that — люди/вещи в defining clauses; where — место.","the person who; the file that/which; the place where",
      [["The developer who fixed it is here.","Разработчик, который это исправил, здесь."],["The file that you sent is corrupted.","Файл, который ты прислал, повреждён."]],
      ["the person which → who","the place which I live → where I live"],"who vs which vs that",
      [
        ["fill","The person ___ called you is my manager.","who","Для человека → who."],
        ["translate","Файл, который ты отправил, повреждён.","The file that you sent is corrupted.","Для вещи возможен that/which."],
        ["correct","The woman which works here is my friend.","The woman who works here is my friend.","Для человека → who."]
      ]),'''

new_rel = '''    T("relative_clauses","Relative Clauses","B1","who — люди; which — вещи; that — люди/вещи в defining clauses; where — место.","the person who; the file that/which; the place where",
      [["The developer who fixed it is here.","Разработчик, который это исправил, здесь."],["The document which you requested is ready.","Документ, который вы запросили, готов."]],
      ["the person which → who","the place which I live → where I live"],"who vs which vs that",
      [
        ["fill","The specialist ___ solved the issue is on call.","who","Для человека → who."],
        ["translate","Проект, который мы выбрали, успешный.","The project that we chose is successful.","Для вещей используем that или which."],
        ["correct","The woman which works here is my friend.","The woman who works here is my friend.","Для человека → who."]
      ]),'''

js_code = js_code.replace(old_rel, new_rel)

# word_order (lines 202-209)
old_wo = '''    T("word_order","Word Order","A2–B1","Базовый порядок: Subject + Verb + Object + manner/place/time. Наречия частотности обычно перед смысловым глаголом, но после be.","S + V + O; frequency adverb before main verb, after be",
      [["I usually work from home.","Я обычно работаю из дома."],["She is always busy.","Она всегда занята."],["We met him at the office yesterday.","Мы встретили его вчера в офисе."]],
      ["I work usually → I usually work","Always she is → She is always"],"adverb position",
      [
        ["build","usually / I / work / from home","I usually work from home.","Наречие usually ставится перед смысловым глаголом."],
        ["translate","Она всегда занята по понедельникам.","She is always busy on Mondays.","С be наречие ставится после be."],
        ["correct","I go often to the gym.","I often go to the gym.","Frequency adverb перед смысловым глаголом."]
      ]),'''

new_wo = '''    T("word_order","Word Order","A2–B1","Базовый порядок: Subject + Verb + Object + manner/place/time. Наречия частотности обычно перед смысловым глаголом, но после be.","S + V + O; frequency adverb before main verb, after be",
      [["We usually start meetings on time.","Мы обычно начинаем встречи вовремя."],["He is always punctual.","Он всегда пунктуален."],["They discussed the plan yesterday.","Они обсудили план вчера."]],
      ["I work usually → I usually work","Always she is → She is always"],"adverb position",
      [
        ["build","usually / I / work / from home","I usually work from home.","Наречие usually ставится перед смысловым глаголом."],
        ["translate","Она всегда занята по понедельникам.","She is always busy on Mondays.","С be наречие ставится после be."],
        ["correct","I go often to the gym.","I often go to the gym.","Frequency adverb перед смысловым глаголом."]
      ]),'''

js_code = js_code.replace(old_wo, new_wo)

# have_to (lines 210-217)
old_ht = '''    T("have_to","Must vs Have to","B1","must — сильная внутренняя/говорящим заданная необходимость; have to — внешнее правило/обстоятельство. В повседневной речи различие не всегда строгое.","must + V; have/has to + V; had to для прошлого",
      [["I must remember to call her.","Мне нужно не забыть ей позвонить."],["We have to wear badges at work.","На работе мы обязаны носить бейджи."],["I had to leave early.","Мне пришлось уйти рано."]],
      ["must to go → must go","musted → had to"],"must vs have to",
      [
        ["fill","Yesterday I ___ leave early.","had to","У must нет обычной прошедшей формы; используем had to."],
        ["translate","На работе мы обязаны носить пропуска.","We have to wear badges at work.","Внешнее правило → have to."],
        ["correct","I must to finish this today.","I must finish this today.","must + base verb."]
      ]),'''

new_ht = '''    T("have_to","Must vs Have to","B1","must — сильная внутренняя/говорящим заданная необходимость; have to — внешнее правило/обстоятельство. В повседневной речи различие не всегда строгое.","must + V; have/has to + V; had to для прошлого",
      [["I must send this feedback tonight.","Я должен отправить этот отзыв сегодня вечером."],["Employees have to follow security rules.","Сотрудники обязаны соблюдать правила безопасности."],["He had to catch the last train.","Ему пришлось успеть на последний поезд."]],
      ["must to go → must go","musted → had to"],"must vs have to",
      [
        ["fill","Yesterday I ___ leave early.","had to","У must нет обычной прошедшей формы; используем had to."],
        ["translate","На работе мы обязаны носить пропуска.","We have to wear badges at work.","Внешнее правило → have to."],
        ["correct","I must to finish this today.","I must finish this today.","must + base verb."]
      ]),'''

js_code = js_code.replace(old_ht, new_ht)

# few_little (lines 218-225)
old_fl = '''    T("few_little","Few / a few / little / a little","B1","few/little = почти нет; a few/a little = немного, но достаточно. few — countable, little — uncountable.","few/a few + plural countable; little/a little + uncountable",
      [["I have a few questions.","У меня есть несколько вопросов."],["We have little time.","У нас почти нет времени."],["Add a little water.","Добавь немного воды."]],
      ["a little questions → a few questions","few time → little time"],"few vs a few; little vs a little",
      [
        ["fill","We have ___ time, so hurry up.","little","Time неисчисляемое; смысл — почти нет."],
        ["translate","У меня есть несколько идей.","I have a few ideas.","Ideas countable + позитивный смысл → a few."],
        ["correct","I have a little friends here.","I have a few friends here.","Friends исчисляемое → a few."]
      ])'''

new_fl = '''    T("few_little","Few / a few / little / a little","B1","few/little = почти нет; a few/a little = немного, но достаточно. few — countable, little — uncountable.","few/a few + plural countable; little/a little + uncountable",
      [["There are a few tickets left.","Осталось несколько билетов."],["She has little patience for delays.","У неё почти нет терпения к задержкам."],["Could I get a little help?","Могу я получить немного помощи?"]],
      ["a little questions → a few questions","few time → little time"],"few vs a few; little vs a little",
      [
        ["fill","We have ___ time, so hurry up.","little","Time неисчисляемое; смысл — почти нет."],
        ["translate","У меня есть несколько идей.","I have a few ideas.","Ideas countable + позитивный смысл → a few."],
        ["correct","I have a little friends here.","I have a few friends here.","Friends исчисляемое → a few."]
      ])'''

js_code = js_code.replace(old_fl, new_fl)

# Expand presentSubjects pool to increase variety in dynamically generated Present Simple exercises
old_ps_subjects = '''  const presentSubjects=[
    {s:"He",v:"works",base:"work",ru:"Он"},{s:"She",v:"drives",base:"drive",ru:"Она"},
    {s:"My brother",v:"studies",base:"study",ru:"Мой брат"},{s:"Sarah",v:"plays",base:"play",ru:"Сара"}
  ];'''

new_ps_subjects = '''  const presentSubjects=[
    {s:"He",v:"works",base:"work",ru:"Он"},{s:"She",v:"drives",base:"drive",ru:"Она"},
    {s:"My brother",v:"studies",base:"study",ru:"Мой брат"},{s:"Sarah",v:"plays",base:"play",ru:"Сара"},
    {s:"Our team",v:"creates",base:"create",ru:"Наша команда"},{s:"The chef",v:"prepares",base:"prepare",ru:"Шеф-повар"},
    {s:"My colleague",v:"writes",base:"write",ru:"Мой коллега"},{s:"Alex",v:"designs",base:"design",ru:"Алекс"}
  ];'''

js_code = js_code.replace(old_ps_subjects, new_ps_subjects)

new_html = text[:start+len("<script>")] + js_code + text[end:]
with open("english_grammar.html", "w", encoding="utf-8") as f:
    f.write(new_html)

with open("app.js", "w", encoding="utf-8") as f:
    f.write(js_code)

print("Examples deduplicated and expanded successfully.")
