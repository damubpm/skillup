
(() => {
"use strict";

const DAY = 86400000;
const NOW = () => Date.now();
const todayKey = () => new Date().toISOString().slice(0,10);
const clamp = (n,a,b) => Math.max(a,Math.min(b,n));
const sample = a => a[Math.floor(Math.random()*a.length)];
const shuffle = a => {
  const x=[...a]; for(let i=x.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[x[i],x[j]]=[x[j],x[i]];} return x;
};
const escapeHtml = s => String(s ?? "").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));

const GrammarDatabase = (() => {
  const T = (id,title,level,rule,formula,examples,errors,contrast,seeds=[],tip="") => ({id,title,level,rule,formula,examples,errors,contrast,seeds,tip});
  const topics = [
    T("to_be","To be","A1","Используется для состояния, профессии, возраста, места и характеристик.","Present: I am; he/she/it is; you/we/they are. Past: was/were.",
      [["I am tired.","Я устал."],["She is a doctor.","Она врач."],["They were at home.","Они были дома."]],
      ["I are tired → I am tired","They was late → They were late"],"to be vs обычный смысловой глагол",
      [
        ["fill","She ___ very busy today.","is","С she в настоящем используется is."],
        ["translate","Мы были дома вчера.","We were at home yesterday.","Past to be: we → were."],
        ["correct","They was late for the meeting.","They were late for the meeting.","They → were."]
      ]),
    T("present_simple","Present Simple","A1","Факты, привычки, регулярные действия и расписания.","I/you/we/they + V; he/she/it + V-s. do/does для вопросов и отрицаний.",
      [["I work every day.","Я работаю каждый день."],["She works from home.","Она работает из дома."],["Does he drive?","Он водит?"]],
      ["He work → He works","Does she works? → Does she work?"],"Present Simple vs Present Continuous",
      [
        ["fill","My brother ___ (work) in IT.","works","He/my brother → works."],
        ["translate","Она обычно пьёт кофе утром.","She usually drinks coffee in the morning.","She → drinks; наречие usually ставится перед смысловым глаголом."],
        ["correct","He don't know the answer.","He doesn't know the answer.","He → doesn't + base verb."]
      ]),
    T("present_continuous","Present Continuous","A1–A2","Действие происходит сейчас или носит временный характер.","am/is/are + V-ing",
      [["I am reading now.","Я сейчас читаю."],["We are working from home this week.","Мы работаем из дома на этой неделе."],["Are you listening?","Ты слушаешь?"]],
      ["I working → I am working","She is work → She is working"],"Present Simple vs Present Continuous",
      [
        ["fill","Look! It ___ (rain).","is raining","Look! указывает на действие сейчас."],
        ["translate","Я сейчас разговариваю по телефону.","I am talking on the phone now.","am + talking."],
        ["correct","She working from home today.","She is working from home today.","Нужен вспомогательный is."]
      ]),
    T("past_simple","Past Simple","A2","Завершённые действия в прошлом, часто с конкретным временем.","V2 / V-ed; did + base verb в вопросах и отрицаниях.",
      [["I visited London last year.","Я был в Лондоне в прошлом году."],["She went home early.","Она рано ушла домой."],["Did you restart the server?","Ты перезапустил сервер?"]],
      ["Did you went? → Did you go?","I buyed → I bought"],"Past Simple vs Present Perfect",
      [
        ["fill","Yesterday I ___ (buy) a new laptop.","bought","buy → bought."],
        ["translate","Ты перезапустил сервер вчера?","Did you restart the server yesterday?","После did используется базовая форма."],
        ["correct","Did she called you?","Did she call you?","did + call, не called."]
      ]),
    T("past_continuous","Past Continuous","A2","Процесс в определённый момент прошлого; фон для другого события.","was/were + V-ing",
      [["I was working at 8 p.m.","Я работал в 8 вечера."],["They were talking when I arrived.","Они разговаривали, когда я пришёл."]],
      ["I was work → I was working","They was waiting → They were waiting"],"Past Simple vs Past Continuous",
      [
        ["fill","At 9 p.m. we ___ (watch) a movie.","were watching","Процесс в конкретный момент прошлого."],
        ["translate","Я работал, когда ты позвонил.","I was working when you called.","Длительный фон → Past Continuous, короткое событие → Past Simple."],
        ["correct","They was waiting for us.","They were waiting for us.","They → were."]
      ]),
    T("future_simple","Future Simple","A2","Спонтанные решения, обещания, прогнозы и нейтральное будущее.","will + base verb",
      [["I will help you.","Я помогу тебе."],["I think it will work.","Думаю, это сработает."]],
      ["will to go → will go","will goes → will go"],"will vs going to",
      [
        ["fill","I think AI ___ change many jobs.","will","Мнение/прогноз → will."],
        ["translate","Не переживай, я тебе помогу.","Don't worry, I will help you.","Спонтанное обещание → will."],
        ["correct","She will comes later.","She will come later.","После will — базовая форма."]
      ]),
    T("going_to","Be going to","A2","Планы и намерения; прогноз по очевидным признакам.","am/is/are going to + base verb",
      [["We are going to move next month.","Мы собираемся переехать в следующем месяце."],["Look at the clouds. It's going to rain.","Посмотри на тучи. Сейчас пойдёт дождь."]],
      ["I going to → I am going to","going to went → going to go"],"will vs going to",
      [
        ["fill","We bought tickets. We ___ fly on Friday.","are going to","Уже есть план и билеты."],
        ["translate","Я собираюсь изучать английский каждый день.","I am going to study English every day.","am going to + study."],
        ["correct","He going to call you.","He is going to call you.","Нужен is."]
      ]),
    T("present_perfect","Present Perfect","A2–B1","Опыт, результат к настоящему, незавершённый период или связь прошлого с настоящим.","have/has + V3",
      [["I've already deployed the new version.","Я уже развернул новую версию."],["She has never been to Japan.","Она никогда не была в Японии."],["We have lived here for five years.","Мы живём здесь пять лет."]],
      ["I have went → I have gone","I have seen him yesterday → I saw him yesterday"],"Past Simple vs Present Perfect",
      [
        ["fill","I have already ___ (finish) the report.","finished","have + V3."],
        ["translate","Я живу здесь уже пять лет.","I have lived here for five years.","Действие началось в прошлом и продолжается сейчас."],
        ["correct","I have went there three times.","I have gone there three times.","go → went → gone; после have нужен V3."]
      ]),
    T("present_perfect_cont","Present Perfect Continuous","B1","Действие началось в прошлом и продолжается сейчас или только что закончилось с видимым результатом.","have/has been + V-ing",
      [["I've been working on this bug since morning.","Я работаю над этим багом с утра."],["It has been raining for two hours.","Дождь идёт уже два часа."]],
      ["I have working → I have been working","since two hours → for two hours"],"Present Perfect vs Present Perfect Continuous",
      [
        ["fill","I have been ___ (work) since 8 a.m.","working","have been + V-ing."],
        ["translate","Мы ждём уже два часа.","We have been waiting for two hours.","Продолжающийся процесс → Present Perfect Continuous."],
        ["correct","She has working all day.","She has been working all day.","Нужно has been + V-ing."]
      ]),
    T("past_perfect","Past Perfect","B1","Действие завершилось до другого момента или действия в прошлом.","had + V3",
      [["The train had left before we arrived.","Поезд ушёл до нашего приезда."],["I had never seen it before.","Я никогда раньше этого не видел."]],
      ["had went → had gone","didn't had → hadn't had"],"Past Perfect vs Past Simple",
      [
        ["fill","By the time I arrived, they had ___ (leave).","left","had + V3: leave → left."],
        ["translate","Я уже закончил работу до встречи.","I had already finished the work before the meeting.","Более раннее прошлое → Past Perfect."],
        ["correct","She had went home before I called.","She had gone home before I called.","go → gone после had."]
      ]),
    T("articles","Articles","A1–B1","a/an — один неопределённый предмет; the — конкретный/известный; zero article — обобщение и некоторые устойчивые случаи.","a + consonant sound; an + vowel sound; the + specific/unique noun",
      [["I need an umbrella.","Мне нужен зонтик."],["The server is down.","Этот сервер не работает."],["Water is important.","Вода важна."]],
      ["a apple → an apple","the water is important → Water is important (в общем смысле)"],"a/an vs the vs zero article",
      [
        ["fill","She is ___ engineer.","an","Engineer начинается с гласного звука."],
        ["translate","Сервер, который мы обновили, снова работает.","The server we updated is working again.","Речь о конкретном сервере → the."],
        ["correct","I bought an new phone.","I bought a new phone.","New начинается с согласного звука."]
      ]),
    T("pronouns","Pronouns","A1–A2","Личные, объектные и притяжательные местоимения меняют форму по роли в предложении.","I/me/my/mine; he/him/his; she/her/hers; they/them/their/theirs",
      [["She called me.","Она позвонила мне."],["This is their project.","Это их проект."],["The laptop is mine.","Ноутбук мой."]],
      ["He called I → He called me","This is her's → This is hers"],"subject vs object vs possessive pronouns",
      [
        ["fill","Please send ___ the file. (I)","me","После send нужен объект: me."],
        ["translate","Это их проект, а тот наш.","This is their project, and that one is ours.","their + noun; ours без noun."],
        ["correct","Me work here.","I work here.","Подлежащее → I."]
      ]),
    T("prepositions","Prepositions","A2–B1","Предлоги времени и места часто зависят от устойчивого употребления.","at 5; on Monday; in July. at work; on the table; in a room",
      [["The meeting is at 3 p.m.","Встреча в 3."],["I work on Mondays.","Я работаю по понедельникам."],["We moved here in 2024.","Мы переехали сюда в 2024."]],
      ["in Monday → on Monday","at July → in July"],"at vs on vs in",
      [
        ["fill","The call is ___ Monday.","on","Дни недели → on."],
        ["translate","Встреча начнётся в 10 утра.","The meeting will start at 10 a.m.","Точное время → at."],
        ["correct","We met in Friday.","We met on Friday.","День недели → on."]
      ]),
    T("countable","Countable & Uncountable","A2","Исчисляемые имеют singular/plural; неисчисляемые обычно не имеют множественного числа и не идут с a/an.","a file / files; information, advice, furniture, money",
      [["I need some information.","Мне нужна информация."],["There are three files.","Есть три файла."],["She gave me some advice.","Она дала мне совет."]],
      ["an information → some information","advices → advice"],"countable vs uncountable nouns",
      [
        ["fill","I need some ___. (information/informations)","information","Information неисчисляемое."],
        ["translate","Она дала мне хороший совет.","She gave me some good advice.","Advice неисчисляемое."],
        ["correct","I need an information.","I need some information.","Information не используется с an."]
      ]),
    T("quantifiers","Much / many / few / little","A2–B1","many/few — с исчисляемыми; much/little — с неисчисляемыми. a few/a little имеют более позитивный смысл.","many files; much time; few problems; little money",
      [["We have many users.","У нас много пользователей."],["I don't have much time.","У меня мало времени."],["I have a few ideas.","У меня есть несколько идей."]],
      ["much people → many people","few time → little time"],"few vs a few; little vs a little",
      [
        ["fill","We don't have ___ time.","much","Time неисчисляемое → much."],
        ["translate","У меня есть несколько вопросов.","I have a few questions.","Questions исчисляемое → a few."],
        ["correct","There are much users online.","There are many users online.","Users исчисляемое → many."]
      ]),
    T("comparison","Comparatives & Superlatives","A2","Сравнительная степень: -er/more; превосходная: the -est/the most. Есть неправильные формы.","fast → faster → fastest; good → better → best",
      [["This server is faster.","Этот сервер быстрее."],["It's the most reliable option.","Это самый надёжный вариант."],["This solution is better.","Это решение лучше."]],
      ["more faster → faster","the most easiest → the easiest"],"comparative vs superlative",
      [
        ["fill","This version is ___ (fast) than the old one.","faster","Короткое прилагательное → -er."],
        ["translate","Это лучший вариант.","This is the best option.","good → better → best."],
        ["correct","This one is more cheaper.","This one is cheaper.","Не используем more вместе с -er."]
      ]),
    T("modals","Modal verbs","A2–B1","can, must, should, may, might выражают способность, обязанность, совет и вероятность.","modal + base verb, без to",
      [["You should restart the app.","Тебе стоит перезапустить приложение."],["He can speak English.","Он умеет говорить по-английски."],["It might fail.","Возможно, это не сработает."]],
      ["can to go → can go","must to do → must do"],"must vs have to; may vs might",
      [
        ["fill","You ___ check the logs first. (совет)","should","Совет → should."],
        ["translate","Он умеет говорить на трёх языках.","He can speak three languages.","can + base verb."],
        ["correct","You must to restart it.","You must restart it.","После must нет to."]
      ]),
    T("passive","Passive Voice","B1","Используется, когда важнее действие или результат, чем исполнитель.","be + V3; время выражает форма be",
      [["The report was sent yesterday.","Отчёт отправили вчера."],["English is spoken worldwide.","На английском говорят по всему миру."],["The task will be completed tomorrow.","Задачу завершат завтра."]],
      ["was send → was sent","is build → is built"],"active vs passive",
      [
        ["fill","The report was ___ (send) yesterday.","sent","was + V3."],
        ["translate","API будет обновлён завтра.","The API will be updated tomorrow.","Future passive: will be + V3."],
        ["correct","The bridge was build in 1990.","The bridge was built in 1990.","build → built."]
      ]),
    T("conditionals","Conditionals","B1–B2","Zero — факты; First — реальное будущее; Second — гипотеза; Third — нереальное прошлое.","0: if present, present. 1: if present, will V. 2: if past, would V. 3: if had V3, would have V3.",
      [["If the API fails, the app will retry.","Если API упадёт, приложение повторит запрос."],["If I had more time, I would study more.","Если бы было больше времени, я бы учился больше."],["If I had known, I would have called.","Если бы я знал, я бы позвонил."]],
      ["If it will rain → If it rains","If I would know → If I knew"],"First vs Second vs Third Conditional",
      [
        ["fill","If the API fails, the app ___ retry.","will","First Conditional."],
        ["translate","Если бы у меня было больше времени, я бы путешествовал.","If I had more time, I would travel.","Second Conditional."],
        ["correct","If I would know, I would tell you.","If I knew, I would tell you.","В if-части Second Conditional — Past Simple."]
      ]),
    T("reported","Reported Speech","B1–B2","При пересказе после прошедшего reporting verb время часто сдвигается назад.","am/is→was; are→were; will→would; have→had",
      [["He said he was tired.","Он сказал, что устал."],["She said she would call.","Она сказала, что позвонит."]],
      ["He said he is tired → ...was tired (обычный backshift)","She said she will → ...would"],"direct vs reported speech",
      [
        ["fill",'"I will call." → She said she ___ call.',"would","will → would."],
        ["translate","Он сказал, что уже закончил.","He said that he had already finished.","have finished → had finished при backshift."],
        ["correct","She said she will come later.","She said she would come later.","will → would."]
      ]),
    T("gerund_infinitive","Gerund & Infinitive","B1","Некоторые глаголы требуют gerund, другие infinitive; смысл иногда меняется.","enjoy doing; want to do; avoid doing; decide to do",
      [["I enjoy learning English.","Мне нравится учить английский."],["We decided to deploy today.","Мы решили развернуть сегодня."],["Avoid restarting the service.","Избегай перезапуска сервиса."]],
      ["enjoy to do → enjoy doing","decide doing → decide to do"],"gerund vs infinitive",
      [
        ["fill","I enjoy ___ (learn) English.","learning","enjoy + V-ing."],
        ["translate","Мы решили обновить сервер.","We decided to update the server.","decide + to-infinitive."],
        ["correct","She suggested to go home.","She suggested going home.","suggest + V-ing."]
      ]),
    T("relative_clauses","Relative Clauses","B1","who — люди; which — вещи; that — люди/вещи в defining clauses; where — место.","the person who; the file that/which; the place where",
      [["The developer who fixed it is here.","Разработчик, который это исправил, здесь."],["The file that you sent is corrupted.","Файл, который ты прислал, повреждён."]],
      ["the person which → who","the place which I live → where I live"],"who vs which vs that",
      [
        ["fill","The person ___ called you is my manager.","who","Для человека → who."],
        ["translate","Файл, который ты отправил, повреждён.","The file that you sent is corrupted.","Для вещи возможен that/which."],
        ["correct","The woman which works here is my friend.","The woman who works here is my friend.","Для человека → who."]
      ]),
    T("questions","Question Formation","A1–B1","Вопросы обычно строятся через вспомогательный глагол перед подлежащим. С to be он сам становится перед подлежащим.","Wh + auxiliary + subject + base verb?",
      [["Where do you work?","Где ты работаешь?"],["Why did she leave?","Почему она ушла?"],["What are you doing?","Что ты делаешь?"]],
      ["Where you work? → Where do you work?","Why did she left? → Why did she leave?"],"questions with do/be/modals",
      [
        ["question","She works here.","Does she work here?","Present Simple: does + subject + base verb."],
        ["translate","Почему ты ушёл так рано?","Why did you leave so early?","did + base verb."],
        ["correct","Where you live?","Where do you live?","Нужен auxiliary do."]
      ]),
    T("word_order","Word Order","A2–B1","Базовый порядок: Subject + Verb + Object + manner/place/time. Наречия частотности обычно перед смысловым глаголом, но после be.","S + V + O; frequency adverb before main verb, after be",
      [["I usually work from home.","Я обычно работаю из дома."],["She is always busy.","Она всегда занята."],["We met him at the office yesterday.","Мы встретили его вчера в офисе."]],
      ["I work usually → I usually work","Always she is → She is always"],"adverb position",
      [
        ["build","usually / I / work / from home","I usually work from home.","Наречие usually ставится перед смысловым глаголом."],
        ["translate","Она всегда занята по понедельникам.","She is always busy on Mondays.","С be наречие ставится после be."],
        ["correct","I go often to the gym.","I often go to the gym.","Frequency adverb перед смысловым глаголом."]
      ]),
    T("have_to","Must vs Have to","B1","must — сильная внутренняя/говорящим заданная необходимость; have to — внешнее правило/обстоятельство. В повседневной речи различие не всегда строгое.","must + V; have/has to + V; had to для прошлого",
      [["I must remember to call her.","Мне нужно не забыть ей позвонить."],["We have to wear badges at work.","На работе мы обязаны носить бейджи."],["I had to leave early.","Мне пришлось уйти рано."]],
      ["must to go → must go","musted → had to"],"must vs have to",
      [
        ["fill","Yesterday I ___ leave early.","had to","У must нет обычной прошедшей формы; используем had to."],
        ["translate","На работе мы обязаны носить пропуска.","We have to wear badges at work.","Внешнее правило → have to."],
        ["correct","I must to finish this today.","I must finish this today.","must + base verb."]
      ]),
    T("few_little","Few / a few / little / a little","B1","few/little = почти нет; a few/a little = немного, но достаточно. few — countable, little — uncountable.","few/a few + plural countable; little/a little + uncountable",
      [["I have a few questions.","У меня есть несколько вопросов."],["We have little time.","У нас почти нет времени."],["Add a little water.","Добавь немного воды."]],
      ["a little questions → a few questions","few time → little time"],"few vs a few; little vs a little",
      [
        ["fill","We have ___ time, so hurry up.","little","Time неисчисляемое; смысл — почти нет."],
        ["translate","У меня есть несколько идей.","I have a few ideas.","Ideas countable + позитивный смысл → a few."],
        ["correct","I have a little friends here.","I have a few friends here.","Friends исчисляемое → a few."]
      ])
  ];
  const irregular = [
    ["go","went","gone"],["see","saw","seen"],["do","did","done"],["write","wrote","written"],["take","took","taken"],
    ["come","came","come"],["give","gave","given"],["know","knew","known"],["begin","began","begun"],["speak","spoke","spoken"],
    ["eat","ate","eaten"],["drive","drove","driven"],["break","broke","broken"],["choose","chose","chosen"],["forget","forgot","forgotten"]
  ];
  const contrasts = [
    ["present_simple","present_continuous","Present Simple vs Present Continuous"],
    ["past_simple","present_perfect","Past Simple vs Present Perfect"],
    ["past_simple","past_continuous","Past Simple vs Past Continuous"],
    ["present_perfect","present_perfect_cont","Present Perfect vs Present Perfect Continuous"],
    ["future_simple","going_to","will vs going to"],
    ["modals","have_to","must vs have to"],
    ["quantifiers","few_little","few/little contrast"]
  ];
  return {topics,irregular,contrasts,get:id=>topics.find(t=>t.id===id)};
})();

const Storage = (() => {
  const KEY="grammarForge.v2";
  const defaultState=()=>({
    version:2,createdAt:NOW(),theme:"system",diagnosticDone:false,currentTopic:"present_simple",
    totals:{answered:0,correct:0},topics:{},skills:{},errors:{},sessions:[],streak:{count:0,lastDay:null},
    recentExerciseIds:[],settings:{dailyCount:20}
  });
  const load=()=>{
    try{
      const raw=JSON.parse(localStorage.getItem(KEY)||"null");
      const s=raw&&raw.version===2?raw:defaultState();
      GrammarDatabase.topics.forEach(t=>{
        if(!s.topics[t.id]) s.topics[t.id]={mastery:10,attempts:0,correct:0,errors:0,lastPractice:null,dueDate:0,interval:0,repetitions:0,daysSeen:[]};
      });
      return s;
    }catch(e){return defaultState();}
  };
  let state=load();
  const save=()=>localStorage.setItem(KEY,JSON.stringify(state));
  const replace=s=>{state=s; GrammarDatabase.topics.forEach(t=>{if(!state.topics[t.id]) state.topics[t.id]={mastery:10,attempts:0,correct:0,errors:0,lastPractice:null,dueDate:0,interval:0,repetitions:0,daysSeen:[]};}); save();};
  const reset=()=>{state=defaultState();GrammarDatabase.topics.forEach(t=>state.topics[t.id]={mastery:10,attempts:0,correct:0,errors:0,lastPractice:null,dueDate:0,interval:0,repetitions:0,daysSeen:[]});save();};
  return {get state(){return state},save,replace,reset,KEY};
})();

const AnswerChecker = (() => {
  const normalize = s => String(s??"").toLowerCase().trim()
    .replace(/[“”]/g,'"').replace(/[’`]/g,"'")
    .replace(/[.!?]+$/,"").replace(/\s+/g," ")
    .replace(/\bi am\b/g,"i'm").replace(/\byou are\b/g,"you're").replace(/\bwe are\b/g,"we're").replace(/\bthey are\b/g,"they're")
    .replace(/\bhe is\b/g,"he's").replace(/\bshe is\b/g,"she's").replace(/\bit is\b/g,"it's")
    .replace(/\bdo not\b/g,"don't").replace(/\bdoes not\b/g,"doesn't").replace(/\bdid not\b/g,"didn't")
    .replace(/\bcannot\b/g,"can't").replace(/\bwill not\b/g,"won't").replace(/\bwould not\b/g,"wouldn't")
    .replace(/\bhave not\b/g,"haven't").replace(/\bhas not\b/g,"hasn't").replace(/\bhad not\b/g,"hadn't")
    .replace(/\bis not\b/g,"isn't").replace(/\bare not\b/g,"aren't").replace(/\bwas not\b/g,"wasn't").replace(/\bwere not\b/g,"weren't")
    .replace(/\bshould not\b/g,"shouldn't").replace(/\bmust not\b/g,"mustn't").replace(/\bcould not\b/g,"couldn't");
  const equivalent=(user,answers)=> {
    const u=normalize(user); const list=Array.isArray(answers)?answers:[answers];
    return list.some(a=>normalize(a)===u);
  };
  return {normalize,equivalent};
})();

const SpacedRepetition = (() => {
  const intervals=[0.007,1,3,7,14,30,60]; // first ~10 minutes
  function update(topicState,correct,difficulty){
    if(correct){
      topicState.repetitions=(topicState.repetitions||0)+1;
      topicState.interval=intervals[Math.min(topicState.repetitions,intervals.length-1)];
    }else{
      topicState.repetitions=0;
      topicState.interval=intervals[0];
    }
    topicState.dueDate=NOW()+topicState.interval*DAY;
  }
  const isDue=s => !s.dueDate || s.dueDate<=NOW();
  return {update,isDue};
})();

const ProgressTracker = (() => {
  function status(m){
    if(m<=20)return"New"; if(m<=45)return"Learning"; if(m<=60)return"Weak"; if(m<=75)return"Good"; if(m<=90)return"Strong"; return"Mastered";
  }
  function difficultyFor(topicId){
    const m=Storage.state.topics[topicId].mastery;
    return m<45?1:m<76?2:3;
  }
  function record(ex,correct,userAnswer,sessionMode){
    const s=Storage.state, ts=s.topics[ex.topicId], day=todayKey();
    s.totals.answered++; if(correct)s.totals.correct++;
    ts.attempts++; if(correct)ts.correct++; else ts.errors++;
    ts.lastPractice=NOW();
    if(!ts.daysSeen.includes(day)){ts.daysSeen.push(day); if(ts.daysSeen.length>20)ts.daysSeen.shift();}
    const gain=correct?(ex.difficulty===3?5:ex.difficulty===2?4:3):-(ex.difficulty===3?3:5);
    let next=clamp(ts.mastery+gain,0,100);
    if(next>90 && ts.daysSeen.length<3) next=90; // Mastered requires multiple days
    ts.mastery=Math.round(next);
    SpacedRepetition.update(ts,correct,ex.difficulty);
    if(!correct){
      const key=ex.skillId||ex.topicId;
      const old=s.errors[key]||{skillId:key,topicId:ex.topicId,label:ex.skillLabel||GrammarDatabase.get(ex.topicId).title,count:0,successes:0,lastQuestion:"",lastAnswer:"",correctAnswer:"",explanation:"",lastAt:0};
      old.count++; old.lastQuestion=ex.prompt; old.lastAnswer=userAnswer; old.correctAnswer=Array.isArray(ex.answer)?ex.answer[0]:ex.answer; old.explanation=ex.explanation; old.lastAt=NOW(); old.topicId=ex.topicId;
      s.errors[key]=old;
    }else if(s.errors[ex.skillId||ex.topicId]){
      s.errors[ex.skillId||ex.topicId].successes++;
      if(s.errors[ex.skillId||ex.topicId].successes>=3 && s.errors[ex.skillId||ex.topicId].successes>=s.errors[ex.skillId||ex.topicId].count){
        delete s.errors[ex.skillId||ex.topicId];
      }
    }
    Storage.save();
  }
  function overallMastery(){
    const vals=GrammarDatabase.topics.map(t=>Storage.state.topics[t.id].mastery);
    return Math.round(vals.reduce((a,b)=>a+b,0)/vals.length);
  }
  function updateStreak(){
    const st=Storage.state.streak, today=todayKey();
    if(st.lastDay===today)return;
    const yesterday=new Date(Date.now()-DAY).toISOString().slice(0,10);
    st.count=st.lastDay===yesterday?st.count+1:1; st.lastDay=today; Storage.save();
  }
  return {status,difficultyFor,record,overallMastery,updateStreak};
})();

const ExerciseGenerator = (() => {
  let seq=0;
  const mk=(topicId,type,prompt,answer,explanation,difficulty=1,extra={})=>({
    id:`${topicId}-${type}-${++seq}-${Math.random().toString(36).slice(2,7)}`,topicId,type,prompt,answer,explanation,difficulty,
    skillId:extra.skillId||`${topicId}:${type}`,skillLabel:extra.skillLabel||`${GrammarDatabase.get(topicId)?.title||topicId} — ${type}`,
    options:extra.options||null,context:extra.context||"",words:extra.words||null
  });
  const presentSubjects=[
    {s:"He",v:"works",base:"work",ru:"Он"},{s:"She",v:"drives",base:"drive",ru:"Она"},
    {s:"My brother",v:"studies",base:"study",ru:"Мой брат"},{s:"Sarah",v:"plays",base:"play",ru:"Сара"}
  ];
  function generatedPresentSimple(d=1,type="all"){
    const x=sample(presentSubjects), choices=["fill","translate","correct","question","choice"], ty=type==="all"?sample(choices):type;
    if(ty==="translate") return mk("present_simple","translate",`${x.ru} обычно ${x.base==="work"?"работает":x.base==="drive"?"ездит на машине":x.base==="study"?"учится":"играет"} утром.`,`${x.s} usually ${x.v} in the morning.`,`3-е лицо единственного числа: ${x.base} → ${x.v}.`,d);
    if(ty==="correct") return mk("present_simple","correct",`${x.s} ${x.base} every day.`,`${x.s} ${x.v} every day.`,`В 3-м лице добавляется -s/-es.`,d);
    if(ty==="question"){
      const qs=x.s.charAt(0).toLowerCase()+x.s.slice(1);
      return mk("present_simple","question",`${x.s} ${x.v} here.`,`Does ${qs} ${x.base} here?`,`Does + subject + base verb.`,d);
    }
    if(ty==="choice") return mk("present_simple","choice",`${x.s} ___ here every day.`,x.v,`3-е лицо → ${x.v}.`,d,{options:shuffle([x.base,x.v,`${x.base}ing`,"worked"])});
    return mk("present_simple","fill",`${x.s} ___ (${x.base}) here every day.`,x.v,`3-е лицо → ${x.v}.`,d);
  }
  function generatedPastPerfectContrast(topicId,d=2){
    const pp=topicId==="present_perfect";
    if(pp){
      const opts=shuffle(["saw","have seen","see","had seen"]);
      return mk("present_perfect","choice","I ___ him three times this week.","have seen","This week ещё не завершена; важен опыт к настоящему.",d,{options:opts,skillId:"contrast:past_vs_present_perfect",skillLabel:"Past Simple vs Present Perfect"});
    }
    return mk("past_simple","choice","I ___ him yesterday.","saw","Yesterday — конкретное завершённое прошлое → Past Simple.",d,{options:shuffle(["saw","have seen","see","had seen"]),skillId:"contrast:past_vs_present_perfect",skillLabel:"Past Simple vs Present Perfect"});
  }
  function fromSeed(topic,d,type="all"){
    const pool=topic.seeds.filter(x=>type==="all"||x[0]===type);
    const s=sample(pool.length?pool:topic.seeds);
    const [ty,prompt,answer,explanation]=s;
    if(ty==="choice"){
      const distract=[answer,"is","was","did","have","has","will","would","went","gone"].filter((v,i,a)=>a.indexOf(v)===i&&v!==answer).slice(0,3);
      return mk(topic.id,ty,prompt,answer,explanation,d,{options:shuffle([answer,...distract])});
    }
    if(ty==="build"){
      return mk(topic.id,ty,prompt,answer,explanation,d,{words:prompt.split("/").map(s=>s.trim())});
    }
    return mk(topic.id,ty,prompt,answer,explanation,d);
  }
  function generate(topicId,difficulty=1,type="all"){
    const topic=GrammarDatabase.get(topicId)||sample(GrammarDatabase.topics);
    if(topicId==="present_simple" && Math.random()<.65) return generatedPresentSimple(difficulty,type);
    if((topicId==="present_perfect"||topicId==="past_simple") && type==="all" && Math.random()<.35) return generatedPastPerfectContrast(topicId,difficulty);
    let ex=fromSeed(topic,difficulty,type);
    if(difficulty>=2 && type==="all" && Math.random()<.35){
      // turn a fixed answer into active recall whenever possible
      if(ex.type==="fill" && !String(ex.prompt).includes("___")) ex.type="translate";
    }
    return ex;
  }
  function irregular(count=12){
    return shuffle(GrammarDatabase.irregular).slice(0,Math.min(count,GrammarDatabase.irregular.length)).map((v,i)=>{
      const mode=i%3;
      if(mode===0)return mk("past_simple","fill",`${v[0]} → Past Simple: ___`,v[1],`${v[0]} → ${v[1]} → ${v[2]}`,1,{skillId:"irregular:v2",skillLabel:"Irregular verbs — V2"});
      if(mode===1)return mk("present_perfect","fill",`${v[0]} → V3: ___`,v[2],`${v[0]} → ${v[1]} → ${v[2]}`,2,{skillId:"irregular:v3",skillLabel:"Irregular verbs — V3"});
      return mk("present_perfect","fill",`I have ___ (${v[0]}) it before.`,v[2],`После have нужен V3: ${v[2]}.`,2,{skillId:"irregular:context",skillLabel:"Irregular verbs — context"});
    });
  }
  function diagnostic(){
    const chosen=GrammarDatabase.topics;
    const arr=[];
    chosen.forEach((t,i)=>{
      const ex=generate(t.id, i<8?1:i<18?2:3, i%5===0?"choice":"all");
      ex.diagnostic=true;
      arr.push(ex);
    });
    let i=0;
    while(arr.length<36){
      const t=chosen[i%chosen.length];
      const ex=generate(t.id,Math.min(3,1+(i%3)),"all");
      ex.diagnostic=true;
      arr.push(ex);
      i++;
    }
    return shuffle(arr).slice(0,36);
  }
  function daily(count=20){
    const s=Storage.state;
    const due=GrammarDatabase.topics.filter(t=>SpacedRepetition.isDue(s.topics[t.id])&&s.topics[t.id].attempts>0);
    const weak=[...GrammarDatabase.topics].sort((a,b)=>s.topics[a.id].mastery-s.topics[b.id].mastery);
    const current=GrammarDatabase.get(s.currentTopic)||weak[0];
    const nDue=Math.round(count*.4),nWeak=Math.round(count*.3),nCurrent=Math.round(count*.2);
    const arr=[];
    for(let i=0;i<nDue;i++){const t=due.length?due[i%due.length]:weak[i%weak.length];arr.push(generate(t.id,ProgressTracker.difficultyFor(t.id),"all"))}
    for(let i=0;i<nWeak;i++){const t=weak[i%Math.min(8,weak.length)];arr.push(generate(t.id,ProgressTracker.difficultyFor(t.id),"all"))}
    for(let i=0;i<nCurrent;i++)arr.push(generate(current.id,ProgressTracker.difficultyFor(current.id),"all"));
    while(arr.length<count){const t=sample(GrammarDatabase.topics);arr.push(generate(t.id,Math.max(2,ProgressTracker.difficultyFor(t.id)),"all"))}
    return shuffle(arr);
  }
  function mixed(count=20){
    return Array.from({length:count},()=>{const t=sample(GrammarDatabase.topics);return generate(t.id,ProgressTracker.difficultyFor(t.id),"all")});
  }
  function contrast(a,b,count=12){
    return Array.from({length:count},(_,i)=>generate(i%2?a:b,Math.max(2,ProgressTracker.difficultyFor(i%2?a:b)),"all"));
  }
  return {generate,daily,mixed,diagnostic,irregular,contrast};
})();

const LearningEngine = (() => {
  let session=null;
  function start(exercises,mode,title){
    session={mode,title,queue:[...exercises],index:0,correct:0,answered:0,startAt:NOW(),results:[],selected:null,locked:false};
    if(typeof document !== "undefined"){ UI.showPage("training"); UI.renderExercise(); }
  }
  function current(){return session?.queue[session.index]||null}
  function submit(userAnswer){
    if(!session||session.locked)return null;
    const ex=current(); if(!ex)return null;
    if(!String(userAnswer??"").trim())return {empty:true};
    const correct=AnswerChecker.equivalent(userAnswer,ex.answer);
    session.locked=true;session.answered++;if(correct)session.correct++;
    session.results.push({topicId:ex.topicId,correct,difficulty:ex.difficulty});
    if(session.mode!=="diagnostic") ProgressTracker.record(ex,correct,userAnswer,session.mode);
    if(!correct && session.mode!=="diagnostic"){
      // same skill returns later in same session, but with a regenerated variant
      const retry=ExerciseGenerator.generate(ex.topicId,Math.max(1,ex.difficulty-1),"all");
      retry.skillId=ex.skillId; retry.skillLabel=ex.skillLabel; retry.retry=true;
      const pos=Math.min(session.queue.length,session.index+3+Math.floor(Math.random()*3));
      session.queue.splice(pos,0,retry);
    }
    return {correct,ex};
  }
  function next(){
    if(!session)return;
    session.index++;session.locked=false;session.selected=null;
    if(session.index>=session.queue.length) finish(); else if(typeof document !== "undefined") UI.renderExercise();
  }
  function finish(){
    if(!session)return;
    const ended={date:NOW(),mode:session.mode,title:session.title,correct:session.correct,answered:session.answered,duration:NOW()-session.startAt};
    if(session.mode==="diagnostic"){
      const grouped={};
      session.results.forEach(r=>{grouped[r.topicId]??={c:0,n:0};grouped[r.topicId].n++;if(r.correct)grouped[r.topicId].c++;});
      Object.entries(grouped).forEach(([id,g])=>{
        const pct=g.c/g.n;
        const ts=Storage.state.topics[id];
        ts.mastery=Math.round(10+pct*75);
        ts.attempts+=g.n;ts.correct+=g.c;ts.errors+=g.n-g.c;ts.lastPractice=NOW();
        ts.daysSeen=[...new Set([...(ts.daysSeen||[]),todayKey()])];
      });
      Storage.state.diagnosticDone=true;Storage.save();
    }else{
      Storage.state.sessions.unshift(ended);Storage.state.sessions=Storage.state.sessions.slice(0,30);
      ProgressTracker.updateStreak();Storage.save();
    }
    if(typeof document !== "undefined") UI.renderSummary(ended,session.results); session.finished=true;
  }
  function quit(){ if(session&&!session.finished&&session.answered>0)finish(); else if(typeof document !== "undefined") UI.showPage("today");}
  return {start,current,submit,next,quit,get session(){return session}};
})();

const UI = (() => {
  const $=id=>document.getElementById(id);
  let builtWords=[];
  function toast(msg){const e=$("toast");e.textContent=msg;e.style.display="block";clearTimeout(toast.t);toast.t=setTimeout(()=>e.style.display="none",2600)}
  function showPage(name){
    document.querySelectorAll(".page").forEach(p=>p.classList.toggle("active",p.id===`page-${name}`));
    document.querySelectorAll("#nav button").forEach(b=>b.classList.toggle("active",b.dataset.page===name));
    window.scrollTo({top:0,behavior:"smooth"});
    if(name!=="training"&&name!=="diagnostic") refreshAll();
  }
  function masteryStatus(m){return ProgressTracker.status(m)}
  function fmtDate(ts){if(!ts)return"—";return new Date(ts).toLocaleDateString("ru-RU",{day:"2-digit",month:"short"});}
  function dueText(ts){if(!ts||ts<=NOW())return"сейчас";const d=Math.ceil((ts-NOW())/DAY);return d<=1?"завтра":`через ${d} дн.`}
  function refreshAll(){
    const s=Storage.state, mastery=ProgressTracker.overallMastery();
    $("sideMastery").textContent=mastery+"%";$("sideProgress").style.width=mastery+"%";$("sideStreak").textContent=s.streak.count||0;
    $("todayMastery").textContent=mastery+"%";
    const due=GrammarDatabase.topics.filter(t=>s.topics[t.id].attempts>0&&SpacedRepetition.isDue(s.topics[t.id])).length;
    $("todayDue").textContent=due;$("todayStreak").textContent=s.streak.count||0;
    const week=s.sessions.filter(x=>x.date>NOW()-7*DAY),wa=week.reduce((a,x)=>a+x.answered,0),wc=week.reduce((a,x)=>a+x.correct,0);
    $("todayAccuracy").textContent=wa?Math.round(wc/wa*100)+"%":"—";
    renderDailyPlan(due);renderWeak();renderRecent();renderLearn();renderErrors();renderProgress();renderReference();populatePractice();
  }
  function renderDailyPlan(due){
    const count=Storage.state.settings.dailyCount||20;
    const a=Math.round(count*.4),b=Math.round(count*.3),c=Math.round(count*.2),d=count-a-b-c;
    $("dailyPlan").innerHTML=`
      <div class="topic-row" style="grid-template-columns:1fr 70px"><span>Повторение due/ошибок</span><b>${a}</b></div>
      <div class="topic-row" style="grid-template-columns:1fr 70px"><span>Слабые темы</span><b>${b}</b></div>
      <div class="topic-row" style="grid-template-columns:1fr 70px"><span>Текущая тема</span><b>${c}</b></div>
      <div class="topic-row" style="grid-template-columns:1fr 70px"><span>Mixed Grammar</span><b>${d}</b></div>
      <p class="small muted">Сейчас готовы к повторению: ${due}. Тренировка автоматически адаптируется.</p>`;
  }
  function renderWeak(){
    const s=Storage.state, weak=[...GrammarDatabase.topics].sort((a,b)=>s.topics[a.id].mastery-s.topics[b.id].mastery).slice(0,5);
    $("weakTopics").innerHTML=weak.map(t=>{const m=s.topics[t.id].mastery;return`<div style="margin:10px 0"><div style="display:flex;justify-content:space-between;gap:10px"><b>${escapeHtml(t.title)}</b><span>${m}%</span></div><div class="progress"><i style="width:${m}%"></i></div></div>`}).join("");
  }
  function renderRecent(){
    const ss=Storage.state.sessions.slice(0,5);
    $("recentSessions").innerHTML=ss.length?ss.map(x=>`<div class="topic-row" style="grid-template-columns:1fr 100px 90px"><span>${escapeHtml(x.title)}</span><span>${fmtDate(x.date)}</span><b>${x.answered?Math.round(x.correct/x.answered*100):0}%</b></div>`).join(""):`<div class="empty">Тренировок пока нет.</div>`;
  }
  function renderLearn(){
    const s=Storage.state;
    $("learnTopics").innerHTML=GrammarDatabase.topics.map(t=>{
      const m=s.topics[t.id].mastery;
      return `<div class="card"><div style="display:flex;justify-content:space-between;gap:10px"><div><h3>${escapeHtml(t.title)}</h3><span class="pill">${t.level}</span></div><b>${m}%</b></div>
      <div class="progress" style="margin:11px 0"><i style="width:${m}%"></i></div><p class="small muted">${escapeHtml(t.rule)}</p>
      <div class="actions"><button class="btn secondary learn-rule" data-id="${t.id}">Правило</button><button class="btn learn-practice" data-id="${t.id}">Практика</button></div></div>`;
    }).join("");
    document.querySelectorAll(".learn-rule").forEach(b=>b.addEventListener("click",()=>{showPage("reference");setTimeout(()=>document.getElementById(`rule-${b.dataset.id}`)?.scrollIntoView({behavior:"smooth"}),30)}));
    document.querySelectorAll(".learn-practice").forEach(b=>b.addEventListener("click",()=>{
      Storage.state.currentTopic=b.dataset.id;Storage.save();
      LearningEngine.start(Array.from({length:10},()=>ExerciseGenerator.generate(b.dataset.id,ProgressTracker.difficultyFor(b.dataset.id),"all")),"practice",GrammarDatabase.get(b.dataset.id).title);
    }));
  }
  function renderErrors(){
    const es=Object.values(Storage.state.errors).sort((a,b)=>b.count-a.count);
    if(!es.length){$("errorJournal").innerHTML='<div class="empty">Активных ошибок нет. Ошибки появятся здесь после тренировок.</div>';return}
    const groups={}; es.forEach(e=>(groups[e.topicId]??=[]).push(e));
    $("errorJournal").innerHTML=Object.entries(groups).map(([tid,list])=>`
      <div style="margin-bottom:18px"><h3>${escapeHtml(GrammarDatabase.get(tid)?.title||tid)}</h3>
      <div class="list">${list.map(e=>`<div class="error-item"><div style="display:flex;justify-content:space-between;gap:10px"><b>${escapeHtml(e.label)}</b><span class="pill">${e.count} ошибок / ${e.successes} повторов</span></div>
      <div class="small" style="margin-top:8px">${escapeHtml(e.lastQuestion)}</div>
      <div class="badtext small">Твой ответ: ${escapeHtml(e.lastAnswer)}</div><div class="good small">Правильно: ${escapeHtml(e.correctAnswer)}</div>
      <div class="muted small">${escapeHtml(e.explanation)}</div></div>`).join("")}</div></div>`).join("");
  }
  function renderProgress(){
    const s=Storage.state;
    $("pExercises").textContent=s.totals.answered;$("pAccuracy").textContent=s.totals.answered?Math.round(s.totals.correct/s.totals.answered*100)+"%":"—";
    $("pMastered").textContent=GrammarDatabase.topics.filter(t=>s.topics[t.id].mastery>90).length;$("pErrors").textContent=Object.keys(s.errors).length;
    $("topicProgress").innerHTML=GrammarDatabase.topics.map(t=>{const x=s.topics[t.id];return`<div class="topic-row">
      <div><div class="topic-title">${escapeHtml(t.title)}</div><span class="small muted">${t.level}</span></div>
      <span class="mastery-num">${x.mastery}%</span><div><div class="progress"><i style="width:${x.mastery}%"></i></div><span class="small muted">${masteryStatus(x.mastery)}</span></div>
      <span class="hide-tablet">${x.attempts} заданий</span><span class="hide-mobile">${dueText(x.dueDate)}</span></div>`}).join("");
    const ss=s.sessions.slice(0,8).reverse();
    $("sessionBars").innerHTML=ss.length?ss.map(x=>{const p=x.answered?Math.round(x.correct/x.answered*100):0;return`<div class="barrow"><span class="small">${fmtDate(x.date)}</span><div class="bar"><i style="width:${p}%"></i></div><b>${p}%</b></div>`}).join(""):'<div class="empty">Недостаточно данных.</div>';
    const ce=Object.values(s.errors).sort((a,b)=>b.count-a.count).slice(0,6);
    $("commonErrors").innerHTML=ce.length?ce.map(e=>`<div class="topic-row" style="grid-template-columns:1fr 60px"><span>${escapeHtml(e.label)}</span><b>${e.count}×</b></div>`).join(""):'<div class="empty">Ошибок пока нет.</div>';
  }
  function renderReference(){
    $("referenceList").innerHTML=GrammarDatabase.topics.map(t=>`<details class="rule-topic" id="rule-${t.id}" data-search="${escapeHtml((t.title+" "+t.rule+" "+t.formula).toLowerCase())}">
      <summary>${escapeHtml(t.title)} <span class="pill">${t.level}</span></summary>
      <div class="rulebox"><b>Когда:</b> ${escapeHtml(t.rule)}<br><b>Формула:</b> ${escapeHtml(t.formula)}</div>
      <div class="examples">${t.examples.map(e=>`<div class="example"><b>${escapeHtml(e[0])}</b><small>${escapeHtml(e[1])}</small></div>`).join("")}</div>
      <p><b>Типичные ошибки:</b><br>${t.errors.map(e=>"• "+escapeHtml(e)).join("<br>")}</p>
      <p><b>Сравнить:</b> ${escapeHtml(t.contrast)}</p>
      <button class="btn secondary ref-practice" type="button" data-id="${t.id}">Практиковать тему</button>
    </details>`).join("");
    document.querySelectorAll(".ref-practice").forEach(b=>b.addEventListener("click",()=>LearningEngine.start(Array.from({length:10},()=>ExerciseGenerator.generate(b.dataset.id,ProgressTracker.difficultyFor(b.dataset.id),"all")),"practice",GrammarDatabase.get(b.dataset.id).title)));
  }
  function populatePractice(){
    const sel=$("practiceTopic"),cur=sel.value;
    sel.innerHTML='<option value="mixed">Mixed Grammar</option>'+GrammarDatabase.topics.map(t=>`<option value="${t.id}">${escapeHtml(t.title)} (${t.level})</option>`).join("");
    sel.value=cur||"mixed";
    $("contrastTabs").innerHTML=GrammarDatabase.contrasts.map((c,i)=>`<button class="tab contrast" data-i="${i}">${escapeHtml(c[2])}</button>`).join("");
    document.querySelectorAll(".contrast").forEach(b=>b.addEventListener("click",()=>{const c=GrammarDatabase.contrasts[+b.dataset.i];LearningEngine.start(ExerciseGenerator.contrast(c[0],c[1],12),"contrast",c[2])}));
  }
  function answerControl(ex){
    if(ex.type==="choice"){
      return `<div class="options">${ex.options.map((o,i)=>`<button type="button" class="option" data-value="${escapeHtml(o)}"><b>${i+1}.</b> ${escapeHtml(o)}</button>`).join("")}</div>`;
    }
    if(ex.type==="build"){
      builtWords=[];
      return `<div class="built" id="builtWords"><span class="muted small">Нажимай слова в правильном порядке</span></div><div class="word-bank" id="wordBank">${shuffle(ex.words).map((w,i)=>`<button class="word" type="button" data-word="${escapeHtml(w)}" data-idx="${i}">${escapeHtml(w)}</button>`).join("")}</div>`;
    }
    return `<input class="answer-input" id="answerInput" autocomplete="off" spellcheck="false" placeholder="Введи ответ…">`;
  }
  function renderExercise(){
    const ss=LearningEngine.session, ex=LearningEngine.current(); if(!ss||!ex)return;
    $("trainingTitle").textContent=ss.title;$("trainingSubtitle").textContent=ss.mode==="diagnostic"?"Тема скрыта до ответа.":"Сначала попробуй ответить без открытия правила.";
    $("exerciseMeta").textContent=`${ss.index+1} / ${ss.queue.length}`;$("exerciseScore").textContent=`${ss.correct} правильных`;
    $("exerciseProgress").style.width=Math.round(ss.index/ss.queue.length*100)+"%";
    const taskLabel={translate:"Переведи на английский",fill:"Заполни пропуск",correct:"Исправь ошибку",question:"Построй вопрос",choice:"Выбери лучший вариант",build:"Собери предложение"}[ex.type]||"Ответь";
    $("exerciseBody").innerHTML=`<div class="small muted" style="margin-top:18px">${taskLabel}${ss.mode==="diagnostic"?"":` · сложность ${ex.difficulty}/3`}</div>
      <div class="prompt">${escapeHtml(ex.prompt)}</div>${ex.context?`<div class="context">${escapeHtml(ex.context)}</div>`:""}
      <div id="answerArea">${answerControl(ex)}</div>
      <div id="feedbackArea"></div>
      <div class="actions" style="margin-top:14px">
        <button class="btn" id="checkAnswer" type="button">Проверить</button>
        <button class="btn secondary" id="toggleHint" type="button" ${ss.mode==="diagnostic"?"disabled":""}>💡 Подсказка</button>
        <button class="btn secondary" id="showRule" type="button" ${ss.mode==="diagnostic"?"disabled title='В диагностике правило скрыто'":""}>📖 Правило</button>
        <button class="btn secondary" id="speakPrompt" type="button">🔊 Озвучить</button>
      </div>
      <div id="hintBox" style="display:none;margin-top:10px;padding:10px 14px;background:rgba(217,164,65,0.15);border-left:4px solid var(--gold);border-radius:8px;font-size:14px;"></div>
      <div class="shortcuts"><kbd>Enter</kbd> проверить/дальше · <kbd>1–4</kbd> вариант · <kbd>R</kbd> правило</div>`;
    document.querySelectorAll(".option").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll(".option").forEach(x=>x.classList.remove("selected"));b.classList.add("selected");ss.selected=b.dataset.value}));
    document.querySelectorAll(".word").forEach(b=>b.addEventListener("click",()=>{if(b.disabled)return;builtWords.push(b.dataset.word);b.disabled=true;renderBuilt()}));
    $("checkAnswer").addEventListener("click",onCheck);$("showRule").addEventListener("click",showRule);
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
    });
    $("answerInput")?.focus();
  }
  function renderBuilt(){
    $("builtWords").innerHTML=builtWords.length?builtWords.map((w,i)=>`<button class="word built-word" type="button" data-i="${i}">${escapeHtml(w)}</button>`).join(""):'<span class="muted small">Нажимай слова в правильном порядке</span>';
    document.querySelectorAll(".built-word").forEach(b=>b.addEventListener("click",()=>{const word=builtWords.splice(+b.dataset.i,1)[0];document.querySelectorAll(".word-bank .word").forEach(x=>{if(x.dataset.word===word&&x.disabled){x.disabled=false;return}});renderBuilt()}));
  }
  function currentAnswer(){
    const ex=LearningEngine.current();
    if(ex.type==="choice")return LearningEngine.session.selected||"";
    if(ex.type==="build")return builtWords.join(" ");
    return $("answerInput")?.value||"";
  }
  function onCheck(){
    const ss=LearningEngine.session;
    if(ss.locked){LearningEngine.next();return}
    const ans=currentAnswer(),res=LearningEngine.submit(ans);
    if(res?.empty){toast("Сначала введи или выбери ответ.");return}
    const ex=res.ex,correctAns=Array.isArray(ex.answer)?ex.answer[0]:ex.answer;
    $("feedbackArea").innerHTML=`<div class="feedback ${res.correct?"ok":"bad"}">
      <b class="${res.correct?"good":"badtext"}">${res.correct?"✓ Правильно":"✗ Нужно исправить"}</b>
      ${res.correct?"":`<div class="badtext small" style="margin-top:6px">Твой ответ: ${escapeHtml(ans)}</div><div class="good"><b>Правильно:</b> ${escapeHtml(correctAns)}</div>`}
      <div style="margin-top:7px">${escapeHtml(ex.explanation)}</div>
      ${ss.mode==="diagnostic"?`<div class="small muted" style="margin-top:7px">Тема: ${escapeHtml(GrammarDatabase.get(ex.topicId)?.title||ex.topicId)}</div>`:""}
    </div>`;
    $("checkAnswer").textContent="Дальше";$("showRule").disabled=ss.mode==="diagnostic";
    $("exerciseScore").textContent=`${ss.correct} правильных`;
    refreshSidebarOnly();
  }
  function showRule(){
    const ex=LearningEngine.current(),t=GrammarDatabase.get(ex.topicId);if(!t)return;
    if(document.getElementById("inlineRule"))return;
    $("feedbackArea").insertAdjacentHTML("beforeend",`<div class="rulebox" id="inlineRule"><b>${escapeHtml(t.title)}</b><br>${escapeHtml(t.rule)}<br><b>Формула:</b> ${escapeHtml(t.formula)}</div>`);
  }
  function refreshSidebarOnly(){const m=ProgressTracker.overallMastery();$("sideMastery").textContent=m+"%";$("sideProgress").style.width=m+"%"}
  function renderSummary(ended,results){
    const pct=ended.answered?Math.round(ended.correct/ended.answered*100):0;
    const grouped={};results.forEach(r=>{grouped[r.topicId]??={c:0,n:0};grouped[r.topicId].n++;if(r.correct)grouped[r.topicId].c++});
    const ranked=Object.entries(grouped).map(([id,g])=>({id,p:g.c/g.n})).sort((a,b)=>b.p-a.p);
    const best=ranked.slice(0,2).map(x=>GrammarDatabase.get(x.id)?.title).filter(Boolean).join(", ")||"—";
    const weak=ranked.slice(-2).reverse().map(x=>GrammarDatabase.get(x.id)?.title).filter(Boolean).join(", ")||"—";
    $("exerciseProgress").style.width="100%";
    $("exerciseBody").innerHTML=`<div class="session-summary"><div class="muted">Результат</div><div class="score">${pct}%</div><h2>${ended.correct} / ${ended.answered}</h2>
      <p>Время: ${Math.max(1,Math.round(ended.duration/60000))} мин.</p>
      <div class="grid two" style="text-align:left;margin-top:18px"><div class="card"><b>Сильнее всего</b><div class="muted">${escapeHtml(best)}</div></div><div class="card"><b>Нужно повторить</b><div class="muted">${escapeHtml(weak)}</div></div></div>
      <div class="actions" style="justify-content:center;margin-top:18px"><button class="btn" id="summaryHome">На главную</button><button class="btn secondary" id="summaryAgain">Ещё 10 mixed</button></div></div>`;
    $("summaryHome").addEventListener("click",()=>showPage("today"));$("summaryAgain").addEventListener("click",()=>LearningEngine.start(ExerciseGenerator.mixed(10),"mixed","Mixed Grammar"));
    if(ended.mode==="diagnostic"){Storage.state.diagnosticDone=true;Storage.save();}
  }
  function bind(){
    document.querySelectorAll("#nav button").forEach(b=>b.addEventListener("click",()=>showPage(b.dataset.page)));
    $("startDaily").addEventListener("click",()=>LearningEngine.start(ExerciseGenerator.daily(Storage.state.settings.dailyCount||20),"daily","Тренировка на сегодня"));
    $("startMixed").addEventListener("click",()=>LearningEngine.start(ExerciseGenerator.mixed(20),"mixed","Mixed Grammar"));
    $("diagnosticBtn").addEventListener("click",()=>showPage("diagnostic"));
    $("beginDiagnostic").addEventListener("click",()=>LearningEngine.start(ExerciseGenerator.diagnostic(),"diagnostic","Диагностика"));
    $("quitTraining").addEventListener("click",()=>LearningEngine.quit());
    $("startIrregular").addEventListener("click",()=>LearningEngine.start(ExerciseGenerator.irregular(12),"irregular","Irregular Verbs"));
    $("reviewErrorsBtn").addEventListener("click",()=>{
      const es=Object.values(Storage.state.errors); if(!es.length){toast("Активных ошибок нет.");return}
      const arr=[];es.forEach(e=>{for(let i=0;i<Math.min(3,e.count);i++){const ex=ExerciseGenerator.generate(e.topicId,Math.max(1,ProgressTracker.difficultyFor(e.topicId)-1),"all");ex.skillId=e.skillId;ex.skillLabel=e.label;arr.push(ex)}});LearningEngine.start(shuffle(arr).slice(0,20),"errors","Повтор ошибок");
    });
    $("startPractice").addEventListener("click",()=>{
      const topic=$("practiceTopic").value,type=$("practiceType").value,count=+ $("practiceCount").value,diff=$("practiceDifficulty").value;
      if(topic==="mixed"){LearningEngine.start(ExerciseGenerator.mixed(count),"practice","Mixed Practice");return}
      Storage.state.currentTopic=topic;Storage.save();const d=diff==="adaptive"?ProgressTracker.difficultyFor(topic):+diff;
      LearningEngine.start(Array.from({length:count},()=>ExerciseGenerator.generate(topic,d,type)),"practice",GrammarDatabase.get(topic).title);
    });
    $("ruleSearch").addEventListener("input",e=>{const q=e.target.value.toLowerCase().trim();document.querySelectorAll(".rule-topic").forEach(x=>x.style.display=!q||x.dataset.search.includes(q)||x.textContent.toLowerCase().includes(q)?"":"none")});
    $("themeBtn").addEventListener("click",()=>{const order=["system","light","dark"],i=order.indexOf(Storage.state.theme||"system");Storage.state.theme=order[(i+1)%3];document.documentElement.dataset.theme=Storage.state.theme;Storage.save();toast("Тема: "+Storage.state.theme)});
    $("exportBtn").addEventListener("click",exportProgress);$("importBtn").addEventListener("click",()=>$("importFile").click());$("importFile").addEventListener("change",importProgress);
    $("resetBtn").addEventListener("click",()=>{if(confirm("Сбросить весь прогресс, ошибки и историю тренировок?")){Storage.reset();document.documentElement.dataset.theme=Storage.state.theme;refreshAll();toast("Прогресс сброшен.")}});
    document.addEventListener("keydown",e=>{
      if(!document.getElementById("page-training").classList.contains("active"))return;
      const tag=document.activeElement?.tagName;if(["INPUT","TEXTAREA","SELECT"].includes(tag)){
        if(e.key==="Enter"){e.preventDefault();$("checkAnswer")?.click()} return;
      }
      if(e.key==="Enter"){e.preventDefault();$("checkAnswer")?.click()}
      if(/^[1-4]$/.test(e.key)){document.querySelectorAll(".option")[+e.key-1]?.click()}
      if(e.key.toLowerCase()==="r")$("showRule")?.click();
      if(e.key.toLowerCase()==="n"&&LearningEngine.session?.locked)LearningEngine.next();
    });
  }
  function exportProgress(){
    const blob=new Blob([JSON.stringify(Storage.state,null,2)],{type:"application/json"}),a=document.createElement("a");
    a.href=URL.createObjectURL(blob);a.download=`grammar-forge-progress-${todayKey()}.json`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),500);
  }
  function importProgress(e){
    const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=()=>{
      try{const s=JSON.parse(r.result);if(!s||typeof s!=="object"||!s.totals)throw new Error("bad");Storage.replace(s);document.documentElement.dataset.theme=Storage.state.theme||"system";refreshAll();toast("Прогресс импортирован.")}
      catch(err){toast("Не удалось импортировать JSON.")}e.target.value="";
    };r.readAsText(f);
  }

  function speakText(txt){
    if (typeof window !== "undefined" && "speechSynthesis" in window && txt) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(txt);
      u.lang = "en-US";
      u.rate = 0.9;
      window.speechSynthesis.speak(u);
    }
  }

return {bind,showPage,refreshAll,renderExercise,renderSummary,toast};
})();

if (typeof document !== "undefined") {
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
})();
