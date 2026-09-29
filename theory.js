// Подробная теория темы и задания «Попробуй сам» внутри неё.
// Код заданий выполняет тот же Python в браузере, что и основную задачу урока.
import {makeEditor} from './editor.js';
const e=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const inline=s=>e(s).replace(/`([^`]+)`/g,'<code>$1</code>');
const icon=name=>`<i data-lucide="${name}" aria-hidden="true"></i>`;
const plural=(n,one,few,many)=>{const a=n%10,b=n%100;return a===1&&b!==11?one:a>=2&&a<=4&&(b<12||b>14)?few:many;};
const KIND={predict:['eye','Предскажи вывод'],fill:['pen-line','Допиши код'],'Мини-задача':['code','Мини-задача'],'Исправь ошибку':['bug','Исправь ошибку']};
const isError=s=>/^[A-Z]\w*(Error|Exception)\b/.test(s);
export const drillsOf=t=>t?.deep?t.deep.filter(b=>b.id):[];
export const topicOf=(l,lessons)=>l.deep?l:lessons.find(x=>x.deep&&(x.id===l.parent||x.id===l.related));
const progressText=(done,total)=>`Практика в теории: ${done} из ${total}`;
const btn=(act,text,primary=false)=>`<button type="button" class="button ${primary?'primary':'secondary'}" data-act="${act}">${text}</button>`;
const sample=t=>`<div class="sample-grid drill-sample"><div><span>ПРИМЕР ВВОДА</span><pre>${e(t.input.trimEnd())}</pre></div><div><span>ОЖИДАЕМЫЙ ВЫВОД</span><pre>${e(t.expected)}</pre></div></div>`;

function codeBlock(b){
 return `<div class="run-example"><pre class="example-code">${e(b.code)}</pre>${b.input?`<div class="run-io"><span>Ввод</span><pre>${e(b.input.trimEnd())}</pre></div>`:''}${b.output?`<div class="run-io"><span>Вывод</span><pre>${e(b.output)}</pre></div>`:''}</div>`;
}
function table(b){
 return `<div class="trace-wrap" tabindex="0" role="region" aria-label="Таблица: выполнение по шагам"><table class="trace"><thead><tr>${b.head.map(h=>`<th scope="col">${inline(h)}</th>`).join('')}</tr></thead><tbody>${b.rows.map(r=>`<tr>${r.map(c=>`<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>${b.note?`<p class="trace-note">${inline(b.note)}</p>`:''}`;
}
function mistake(b){
 const col=(good,code,out)=>`<div class="mistake-col ${good?'good':'bad'}"><b>${good?'Так правильно':'Так ошибаются'}</b><pre>${e(code)}</pre><div class="mistake-out"><span>${!good&&isError(out)?'Ошибка Python':'Вывод'}</span><code>${e(out||'(пусто)')}</code></div></div>`;
 return `<div class="mistake">${b.input?`<p class="mistake-input">Ввод: <code>${e(b.input.trim())}</code></p>`:''}<div class="mistake-grid">${col(false,b.wrong,b.wrongOut)}${col(true,b.right,b.rightOut)}</div><p class="mistake-why">${inline(b.why)}</p></div>`;
}
function drill(b,st){
 const [ic,label]=KIND[b.type==='mini'?b.label:b.type];let body,actions;
 if(b.type==='predict'){const lines=b.answer.split('\n').length;
  body=`<p class="drill-goal">Что напечатает программа? Реши в уме, затем проверь себя.</p><pre class="example-code">${e(b.code)}</pre>${b.input?`<p class="drill-note">Ввод: <code>${e(b.input.trim())}</code></p>`:''}<label class="drill-label" for="answer-${b.id}">Твой ответ: ${lines} ${plural(lines,'строка','строки','строк')}</label><textarea class="drill-answer" id="answer-${b.id}" rows="${Math.min(lines,8)}" spellcheck="false" autocomplete="off" autocapitalize="off"></textarea>`;
  actions=btn('check','Проверить',true)+btn('show','Показать ответ');}
 else if(b.type==='fill'){const parts=b.code.split('___');
  body=`<p class="drill-goal">${inline(b.goal)}</p><pre class="example-code fill-code">${parts.map((p,i)=>e(p)+(i<parts.length-1?`<input class="blank" data-blank="${i}" aria-label="Пропуск ${i+1}" size="${Math.max(5,b.answers[i].length+2)}" spellcheck="false" autocomplete="off" autocapitalize="off">`:'')).join('')}</pre>${sample(b.tests[0])}`;
  actions=btn('check','Проверить',true)+btn('hint','Подсказка')+btn('show','Показать ответ');}
 else{body=`<p class="drill-goal">${inline(b.goal)}</p>${sample(b.tests[0])}<div class="drill-editor" data-editor></div>`;
  actions=btn('check','Проверить',true)+btn('hint','Подсказка')+btn('reset','Сначала')+btn('show','Показать решение');}
 return `<article class="drill${st.drills?.[b.id]?.done?' done':''}" data-drill="${b.id}"><header class="drill-head"><span class="drill-kind">${icon(ic)}Попробуй сам · ${label}</span><span class="drill-done">${icon('check')}Готово</span></header>${body}<div class="drill-actions">${actions}</div><div class="drill-feedback" role="status" aria-live="polite"></div><div class="drill-extra"></div></article>`;
}
function blocks(list,st,withSummary){
 let html='';
 list.forEach((b,i)=>{
  if(b.type==='mistake'&&list[i-1]?.type!=='mistake')html+=`<h3 class="deep-title">Ошибки и как их исправить</h3>`;
  html+=b.type==='h'?`<h3 class="deep-title">${inline(b.text)}</h3>`:b.type==='p'?`<p>${inline(b.text)}</p>`:b.type==='code'?codeBlock(b):b.type==='table'?table(b):b.type==='mistake'?mistake(b):b.id?drill(b,st):b.type==='remember'&&withSummary?summary(b):'';
 });
 return html;
}
const summary=b=>`<div class="remember"><b>${icon('list-checks')}Запомни</b><ul>${b.items.map(x=>`<li>${inline(x)}</li>`).join('')}</ul></div>`;
export function deepSummary(topic){const r=topic?.deep?.find(b=>b.type==='remember');return r?summary(r):'';}
export function deepSection(l,topic,st){
 if(!topic)return '';
 const drills=drillsOf(topic),done=drills.filter(d=>st.drills?.[d.id]?.done).length;
 const head=`<div class="deep-head"><span class="section-kicker">ПОДРОБНЫЙ РАЗБОР И ПРАКТИКА</span><span class="deep-progress" data-deep-progress>${progressText(done,drills.length)}</span></div><p class="deep-lead">Читай по порядку. В карточках «Попробуй сам» можно сразу потренироваться: код проверяет настоящий Python.</p>`;
 if(l===topic)return `<section class="deep" data-deep="${topic.id}">${head}${blocks(topic.deep,st,false)}</section>`;
 return `<details class="deep deep-more" data-deep="${topic.id}"><summary>Подробная теория темы «${e(topic.topic)}» и практика: ${drills.length} ${plural(drills.length,'задание','задания','заданий')}</summary>${head}${blocks(topic.deep,st,true)}</details>`;
}

export function wireDeep(root,topic,ctx){
 const sec=root.querySelector('[data-deep]');if(!sec||!topic)return;
 const cards=[...sec.querySelectorAll('[data-drill]')].map(card=>setupDrill(card,topic.deep.find(b=>b.id===card.dataset.drill),ctx,sec,topic));
 const open=()=>cards.forEach(c=>c.ensureEditor());
 if(sec.tagName==='DETAILS')sec.addEventListener('toggle',()=>{if(sec.open)open();});else open();
}
function setupDrill(card,b,ctx,sec,topic){
 const st=ctx.state,rec=()=>st.drills[b.id]||(st.drills[b.id]={}),fb=card.querySelector('.drill-feedback'),extra=card.querySelector('.drill-extra'),act=name=>card.querySelector(`[data-act="${name}"]`);
 const say=(cls,html)=>{fb.className='drill-feedback'+(cls?' '+cls:'');fb.innerHTML=html;ctx.paintIcons();};
 let editor=null,hinted=false;
 const ensureEditor=()=>{if(b.type!=='mini'||editor)return;editor=makeEditor(card.querySelector('[data-editor]'),st.drills[b.id]?.code??b.starter,code=>{rec().code=code;ctx.save();},()=>check(),{minHeight:'120px',label:'Редактор задания: '+b.goal});ctx.editors.push(editor);};
 const complete=()=>{if(!st.drills[b.id]?.done){rec().done=true;rec().at=Date.now();ctx.save();}card.classList.add('done');const drills=drillsOf(topic);sec.querySelector('[data-deep-progress]').textContent=progressText(drills.filter(d=>st.drills[d.id]?.done).length,drills.length);};
 const codeNow=()=>{if(b.type==='fill'){const vals=[...card.querySelectorAll('.blank')].map(x=>x.value);if(vals.some(v=>!v.trim()))return null;const parts=b.code.split('___');return parts.map((p,i)=>p+(vals[i]??'')).join('');}ensureEditor();return editor.get();};
 async function check(){
  if(b.type==='predict'){const v=card.querySelector('.drill-answer').value;
   if(!v.trim()){say('error','Сначала напиши ответ в поле.');return;}
   if(ctx.norm(v)===ctx.norm(b.answer)){say('success',`<b>${icon('check-circle-2')} Верно!</b><p>${inline(b.explain)}</p>`);complete();return;}
   const want=b.answer.split('\n').length,got=v.trim().split('\n').length;
   say('error',`<b>Пока не совпадает</b><p>${got!==want?`Программа печатает ${want} ${plural(want,'строку','строки','строк')}, а в ответе ${got}. `:''}Пройди код сверху вниз и запиши, что выводит каждый print. Если не получается, нажми «Показать ответ».</p>`);return;}
  const code=codeNow();if(code===null){say('error','Заполни все пропуски.');return;}
  const button=act('check');button.disabled=true;say('','Проверяем…');
  try{
   const results=await ctx.runCases(code,b.tests);
   const bad=b.tests.findIndex((t,i)=>{const r=results[i];return !r||r.error||ctx.norm(r.output)!==ctx.norm(t.expected);});
   if(bad<0){say('success',`<b>${icon('check-circle-2')} Верно! ${b.tests.length===1?'Проверка пройдена.':`Все ${b.tests.length} проверки пройдены.`}</b>`);complete();return;}
   const r=results[bad],t=b.tests[bad];
   if(r?.error)say('error',`<b>Python сообщает об ошибке</b><p>${e(ctx.friendly(r.error))}</p><pre>${e(r.error.trim().split('\n').slice(-3).join('\n'))}</pre>`);
   else{const hint=r?ctx.diagnose(r.output,t.expected):'';say('error',`<b>Проверка ${bad+1} из ${b.tests.length} не пройдена</b><div class="drill-diff"><div><span>Ввод</span><pre>${e(t.input.trimEnd())}</pre></div><div><span>Ожидалось</span><pre>${e(t.expected)}</pre></div><div><span>Получилось</span><pre>${e(r?.output?.trimEnd()||'(пусто)')}</pre></div></div>${hint?`<p>${icon('lightbulb')} ${e(hint)}</p>`:''}`);}
  }catch(err){say('error',e(err.message));}
  finally{button.disabled=false;}
 }
 act('check').onclick=check;
 act('hint')?.addEventListener('click',()=>{if(hinted)return;hinted=true;extra.insertAdjacentHTML('beforeend',`<p class="hint">${inline(b.hint)}</p>`);});
 act('reset')?.addEventListener('click',()=>{ensureEditor();editor.set(b.starter);say('','Начальный код восстановлен.');});
 act('show').onclick=()=>{
  if(card.querySelector('.drill-reveal'))return;rec().shown=true;ctx.save();
  const html=b.type==='predict'?`<b>Python напечатает:</b><pre>${e(b.answer)}</pre><p>${inline(b.explain)}</p>`:b.type==='fill'?`<b>${b.answers.length>1?'Ответы по порядку:':'Ответ:'}</b> ${b.answers.map(a=>`<code>${e(a)}</code>`).join(', ')}<p>Впиши ответ в пропуск и нажми «Проверить». Возможны и другие верные варианты: проверка запускает код.</p>`:`<b>Одно из верных решений:</b><pre class="example-code">${e(b.solution)}</pre><button type="button" class="button secondary" data-act="paste">Вставить в редактор</button>`;
  extra.insertAdjacentHTML('beforeend',`<div class="drill-reveal">${html}</div>`);
  card.querySelector('[data-act="paste"]')?.addEventListener('click',()=>{ensureEditor();editor.set(b.solution);say('','Решение в редакторе. Нажми «Проверить», затем попробуй написать его сам.');});
 };
 card.querySelector('.drill-answer')?.addEventListener('keydown',ev=>{if(ev.key==='Enter'&&(ev.ctrlKey||ev.metaKey)){ev.preventDefault();check();}});
 card.querySelectorAll('.blank').forEach(x=>x.addEventListener('keydown',ev=>{if(ev.key==='Enter'){ev.preventDefault();check();}}));
 return {ensureEditor};
}
