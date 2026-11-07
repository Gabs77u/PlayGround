const SAVE_KEY = 'viva-save-v2';
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value));
const money = value => `R$ ${Math.round(value).toLocaleString('pt-BR')}`;
const pick = list => list[Math.floor(Math.random() * list.length)];
const today = () => new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
const safeNumber = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const mergeState = (base, saved) => Object.keys(base).reduce((result, key) => {
  const value = saved?.[key];
  result[key] = value && typeof value === 'object' && !Array.isArray(value) && base[key] && typeof base[key] === 'object'
    ? mergeState(base[key], value) : value ?? base[key];
  return result;
}, {});

const initialState = () => ({
  version: 2, name: 'Alex Martins', pronouns: 'ele/dele', country: 'Brasil', city: 'São Paulo',
  age: 24, year: 2025, money: 8420, happiness: 88, health: 92, reputation: 64,
  stress: 18, karma: 50, fame: 12, energy: 78, education: 76, credit: 780,
  talent: 'criatividade', trait: 'ambicioso', avatar: 'AM', dead: false,
  healthConditions: [], arrestCount: 0, prisonYears: 0, partnerId: null,
  cooldowns: {}, history: [], generations: [], children: [], goals: { emergency: 19440, home: 300000 },
  career: { title: 'Designer de Produto', company: 'Estúdio Aurora', salary: 7800, level: 4, skill: 78, employed: true },
  finances: { investments: 42000, property: 480000, vehicle: 126000, expenses: 3240, debt: 0 },
  skills: { criatividade: 78, inteligência: 70, carisma: 64, atletismo: 55, liderança: 62 },
  relationships: [
    { id: 'marina', name: 'Marina Costa', role: 'Melhor amiga', initials: 'MC', color: '#d79487', affinity: 86, type: 'friend', romance: 12 },
    { id: 'rafa', name: 'Rafa Mendes', role: 'Parceiro de aventuras', initials: 'RM', color: '#749a94', affinity: 72, type: 'friend', romance: 18 },
    { id: 'joao', name: 'João Martins', role: 'Irmão', initials: 'JM', color: '#7899b2', affinity: 94, type: 'family', romance: 0 },
    { id: 'lia', name: 'Lia Nakamura', role: 'Colega de trabalho', initials: 'LN', color: '#aa8fba', affinity: 48, type: 'colleague', romance: 8 }
  ],
  events: [
    { icon: '✦', cls: '', title: 'Uma ideia tomou forma', text: 'Você teve uma visão para um projeto pessoal. Talvez seja hora de tirar do papel.', time: 'Hoje, 09:42' },
    { icon: '♧', cls: 'blue', title: 'Marina curtiu sua foto', text: '“Aquele fim de semana foi inesquecível! Precisamos repetir.”', time: 'Ontem, 20:18' },
    { icon: '↗', cls: 'pink', title: 'Você recebeu uma promoção', text: 'Seu trabalho no Estúdio Aurora foi reconhecido. Parabéns, designer!', time: 'Há 3 dias' }
  ]
});

let state = loadState();
function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(SAVE_KEY));
    return mergeState(initialState(), saved || {});
  } catch { return initialState(); }
}
function saveState() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch { /* armazenamento indisponível */ }
  const dot = $('.save-state .dot'); if (dot) dot.style.background = '#7dbe63';
}
function toast(message) { const el = $('#toast'); if (!el) return; el.textContent = message; el.classList.add('show'); clearTimeout(toast.timer); toast.timer = setTimeout(() => el.classList.remove('show'), 2600); }
function addEvent(icon, title, text, cls = '') { state.events.unshift({ icon, title, text, cls, time: 'Agora' }); state.events = state.events.slice(0, 9); }
function renderEvents() { const list = $('#eventList'); if (list) list.innerHTML = state.events.map(e => `<div class="event"><div class="event-icon ${e.cls || ''}">${e.icon}</div><div><b>${e.title}</b><p>${e.text}</p><time>${e.time}</time></div></div>`).join(''); }
function setStat(name, value) { state[name] = clamp(safeNumber(value)); }
function changeStat(name, amount) { setStat(name, safeNumber(state[name]) + amount); }
function requireFunds(amount) {
  amount = Math.max(0, safeNumber(amount));
  if (state.money < amount) { toast(`Você precisa de ${money(amount - state.money)} a mais.`); return false; }
  state.money -= amount; return true;
}
function requireResources(cost = 0, energy = 0) {
  cost = Math.max(0, safeNumber(cost)); energy = Math.max(0, safeNumber(energy));
  if (state.money < cost) { toast(`Você precisa de ${money(cost - state.money)} a mais.`); return false; }
  if (state.energy < energy) { toast('Você está sem energia para isso. Descanse ou avance um ano.'); return false; }
  state.money -= cost; state.energy = clamp(state.energy - energy); return true;
}
function requireEnergy(amount) {
  amount = Math.max(0, safeNumber(amount));
  if (state.energy < amount) { toast('Você está sem energia para isso. Descanse ou avance um ano.'); return false; }
  state.energy = clamp(state.energy - amount); return true;
}
function requireAge(minimum, message = `Você precisa ter pelo menos ${minimum} anos.`) {
  if (state.age < minimum) { toast(message); return false; }
  return true;
}
function canAct(key, years = 1) {
  const until = safeNumber(state.cooldowns[key], 0);
  if (until > state.year) { toast(`Você poderá fazer isso novamente em ${until}.`); return false; }
  state.cooldowns[key] = state.year + years; return true;
}
function commit(message) { render(); if (message) toast(message); }
function runAction(key, action) {
  const previous = state.cooldowns[key]; const eventsBefore = state.events.length;
  if (!canAct(key, 1)) return;
  action();
  if (state.events.length === eventsBefore) {
    if (previous === undefined) delete state.cooldowns[key]; else state.cooldowns[key] = previous;
  }
}
function openModal(title, text, action, confirm = 'Escolher este caminho') { $('#modalTitle').textContent = title; $('#modalText').textContent = text; $('#modalOk').textContent = confirm; $('#modal').classList.remove('hidden'); $('#modalOk').onclick = () => { $('#modal').classList.add('hidden'); if (action) action(); render(); }; }
function closeModal() { $('#modal')?.classList.add('hidden'); }

function render() {
  const setText = (selector, text) => { const el = $(selector); if (el) el.textContent = text; };
  setText('#sideName', state.name); setText('#sideAge', `${state.age} anos · ${state.city}, ${state.country}`); setText('#money', money(state.money));
  const heading = $('.page-heading h1'); if (heading && $('#vidaView')?.classList.contains('hidden') === false) heading.firstChild.textContent = `Olá, ${state.name.split(' ')[0]} `;
  const eyebrow = $('.page-heading .eyebrow'); if (eyebrow && $('#vidaView')?.classList.contains('hidden') === false) eyebrow.textContent = `${today()} · ${state.year}`;
  const stat = (id, value) => { const el = $(`#${id}`); if (el) el.innerHTML = `${Math.round(value)}<span class="unit">/100</span>`; };
  stat('happiness', state.happiness); stat('reputation', state.reputation);
  const healthCard = $('.stats-grid .stat-card:nth-child(2) strong'); if (healthCard) healthCard.innerHTML = `${Math.round(state.health)}<span class="unit">/100</span>`;
  const bars = $('.stats-grid .stat-card:nth-child(2) .progress i'); if (bars) bars.style.width = `${state.health}%`;
  const mood = state.happiness > 80 ? 'se sentindo inspirado' : state.happiness > 55 ? 'em equilíbrio' : state.happiness > 30 ? 'um pouco abatido' : 'precisando de cuidado';
  setText('#moodText', mood); const moodPercent = $('.mood i'); if (moodPercent) moodPercent.textContent = `${Math.round(state.happiness)}%`;
  const avatar = $('.avatar'); if (avatar) avatar.textContent = state.avatar || state.name.slice(0, 2).toUpperCase(); const mini = $('.avatar-mini'); if (mini) mini.textContent = (state.avatar || state.name.slice(0, 2)).slice(0, 2);
  setText('#relCount', state.relationships.length); setText('#netWorth', money(state.money + state.finances.investments + state.finances.property + state.finances.vehicle - state.finances.debt));
  const financeCards = $$('#patrimonioView .stat-card strong');
  if (financeCards[1]) financeCards[1].textContent = money(state.finances.expenses);
  if (financeCards[2]) financeCards[2].textContent = money(state.finances.investments);
  setText('#monthlyExpenses', money(state.finances.expenses)); setText('#investmentValue', money(state.finances.investments));
  if (financeCards[3]) financeCards[3].innerHTML = `${Math.round(state.credit)}<span class="unit">/900</span>`;
  const financeBars = $$('#patrimonioView .progress i'); if (financeBars[0]) financeBars[0].style.width = `${state.credit / 9}%`;
  setText('#debtValue', `Dívida: ${money(state.finances.debt)}`); setText('#historyCount', `${state.history.length} anos registrados`); setText('#lifeStatus', state.dead ? `Falecida aos ${state.age} anos` : `${state.age} anos · ${state.city}`);
  renderEvents(); renderPeople(); renderFamily(); renderCareer(); renderEducation(); renderAssets(); renderHealth(); saveState();
}
function renderEducation() {
  const education = $('#educationScore'); if (education) education.textContent = `${Math.round(state.education)}/100`;
  const course = $('#currentCourse'); if (course) course.textContent = state.education >= 90 ? 'Formação avançada concluída' : state.education >= 70 ? 'Design e Tecnologia · concluído' : state.education >= 40 ? 'Ensino médio · em progresso' : 'Ensino básico · em progresso';
  const study = $('#studyHint'); if (study) study.textContent = state.age < 6 ? 'Disponível a partir dos 6 anos' : `Progresso geral: ${Math.round(state.education)}%`;
}
function renderAssets() {
  const property = $('#propertyValue'); if (property) property.textContent = money(state.finances.property);
  const vehicle = $('#vehicleValue'); if (vehicle) vehicle.textContent = money(state.finances.vehicle);
  const goal = $('#homeGoal'); if (goal) goal.textContent = `${money(Math.min(state.money + state.finances.investments, state.goals.home))} de ${money(state.goals.home)}`;
  const prison = $('#prisonStatus'); if (prison) prison.textContent = state.prisonYears ? `Cumprindo pena: ${state.prisonYears} ano(s) restante(s)` : state.arrestCount ? `${state.arrestCount} prisão(ões) registrada(s)` : 'Nenhum registro criminal';
}
function renderFamily() {
  const summary = $('#familySummary');
  if (summary) summary.textContent = state.children.length ? `${state.children.length} filho(s) · suas decisões moldam este legado.` : 'Sua família acompanha suas escolhas.';
  const children = $('#childrenList');
  if (children) children.innerHTML = state.children.length ? state.children.map(child => `<div class="goal"><span class="goal-icon">♡</span><div><b>${child.name}</b><small>${child.age || 0} ano(s) · ${child.adopted ? 'adotado(a)' : 'filho(a)'}</small></div></div>`).join('') : '<div class="goal"><span class="goal-icon">♡</span><div><b>Nenhum filho ainda</b><small>Construir uma família é uma escolha para o seu momento.</small></div></div>';
  const generations = $('#generationsList');
  if (generations) generations.innerHTML = state.generations.length ? state.generations.slice().reverse().map(g => `<div class="goal"><span class="goal-icon">✦</span><div><b>${g.name} · ${g.age} anos</b><small>${g.career} · ${g.cause}</small></div></div>`).join('') : '<div class="goal"><span class="goal-icon">⌁</span><div><b>Seu legado começa aqui</b><small>Uma nova geração será registrada quando esta vida terminar.</small></div></div>';
  const generationSummary = $('#generationSummary'); if (generationSummary) generationSummary.textContent = state.generations.length ? `${state.generations.length} geração(ões) registrada(s)` : 'Nenhuma geração arquivada.';
}
function renderCareer() {
  const c = state.career; const hero = $('.career-hero'); if (!hero) return;
  const tag = $('.career-hero .tag'); if (tag) tag.textContent = c.employed ? `EM ASCENSÃO · NÍVEL ${c.level}` : 'EM BUSCA DE UMA OPORTUNIDADE';
  const title = $('.career-hero h2'); if (title) title.textContent = c.title;
  const place = $('.career-hero p'); if (place) place.textContent = `${c.company} · ${state.city}, ${state.country}`;
  const salary = $('.career-salary strong'); if (salary) salary.textContent = money(c.salary);
  const skills = $('#skills'); if (skills) skills.innerHTML = Object.entries(state.skills).map(([name, value]) => `<div class="skill"><div class="skill-top"><b>${name[0].toUpperCase() + name.slice(1)}</b><span>${Math.round(value)}/100</span></div><div class="skill-bar"><i style="width:${value}%"></i></div></div>`).join('');
}
function renderPeople() {
  const grid = $('#peopleGrid'); if (!grid) return;
  grid.innerHTML = state.relationships.map(person => `<div class="person"><div class="person-avatar" style="background:${person.color}">${person.initials}</div><div><h3>${person.name}</h3><p>${person.role}${person.romance > 40 ? ' · interesse romântico' : ''}</p><div class="relationship"><i style="width:${person.affinity}%"></i></div></div><button data-rel="${person.id}">Interagir</button></div>`).join('');
  $$('[data-rel]', grid).forEach(button => button.onclick = () => relationshipMenu(state.relationships.find(p => p.id === button.dataset.rel)));
}
function renderHealth() {
  const ring = $('.health-ring'); if (ring) ring.innerHTML = `${Math.round(state.health)}<span>/100</span>`;
  const healthTitle = $('#healthSummary'); if (healthTitle) healthTitle.textContent = state.dead ? 'Esta jornada terminou' : state.health > 75 ? 'Você está muito bem' : state.health > 45 ? 'Atenção ao seu bem-estar' : 'Sua saúde precisa de cuidado';
  const bars = $$('#saudeView .skill-bar i'); if (bars.length >= 3) { bars[0].style.width = `${state.health}%`; bars[1].style.width = `${clamp(state.happiness - state.stress / 2)}%`; bars[2].style.width = `${state.stress}%`; }
  const conditions = $('#healthConditions'); if (conditions) conditions.textContent = state.healthConditions.length ? state.healthConditions.join(' · ') : 'Nenhuma condição diagnosticada';
  const status = $('#lifeStatus'); if (status) status.textContent = state.dead ? 'Falecida' : `${state.age} anos · ${state.city}`;
}
function relationshipMenu(person) {
  if (!person) return;
  const options = person.romance >= 55 && !state.partnerId && person.type !== 'family' ? ' Talvez seja hora de falar sobre o que vocês sentem.' : '';
  openModal(`Interagir com ${person.name}`, `A afinidade atual é ${person.affinity}/100.${options}`, () => runAction(`rel-${person.id}`, () => {
    if (!requireEnergy(4)) return;
    const gain = state.trait === 'gentil' ? 8 : state.trait === 'rebelde' ? 3 : 5;
    person.affinity = clamp(person.affinity + gain); person.romance = clamp(person.romance + (person.type !== 'family' ? 2 : 0));
    if (person.romance >= 60 && !state.partnerId && person.type !== 'family') { state.partnerId = person.id; person.role = 'Parceiro(a)'; changeStat('happiness', 8); addEvent('♡', `Você e ${person.name} ficaram juntos`, 'Uma nova fase da relação começou.', 'pink'); }
    else { changeStat('happiness', 2); addEvent('♡', `Você esteve com ${person.name}`, 'Uma conversa sincera fortaleceu esse vínculo.', 'pink'); }
  }), 'Conversar');
}

function advanceYear() {
  if (state.dead) return toast('Esta vida chegou ao fim. Comece uma nova história.');
  state.age++; state.year++; const c = state.career;
  const wasInPrison = state.prisonYears > 0;
  if (wasInPrison) state.prisonYears = Math.max(0, state.prisonYears - 1);
  const income = c.employed && state.prisonYears === 0 && !wasInPrison ? c.salary * 12 : 0;
  const expenses = Math.round(state.finances.expenses * 12 * (1 + state.age / 500));
  const investmentReturn = state.finances.investments * ((Math.random() * .12) - .03);
  state.finances.investments = Math.max(0, state.finances.investments + investmentReturn);
  const balanceBeforeDebt = state.money + income - expenses;
  const deficit = Math.max(0, -balanceBeforeDebt);
  state.money = Math.max(0, balanceBeforeDebt);
  if (deficit) { state.finances.debt += deficit; state.credit = clamp(state.credit - 35, 0, 900); }
  else { state.finances.debt = Math.max(0, state.finances.debt - Math.min(state.finances.debt, income * .05)); state.credit = clamp(state.credit + 8, 0, 900); }
  const agePenalty = state.age > 70 ? 2.5 : state.age > 45 ? 1 : .25;
  state.health -= agePenalty + (state.stress > 70 ? 1.5 : 0);
  state.happiness += deficit ? -6 : state.money > expenses ? 1 : -1;
  state.stress = clamp(state.stress + 3 + (deficit ? 5 : 0) - (state.trait === 'espiritual' ? 2 : 0));
  state.energy = clamp(state.energy + (state.age < 30 ? 2 : -3));
  state.relationships.forEach(person => { person.affinity = clamp(person.affinity - (Math.random() < .4 ? 2 : 0)); });
  state.children.forEach(child => { child.age = safeNumber(child.age) + 1; });
  if (c.employed) {
    c.skill = clamp(c.skill + (state.education > 70 ? 4 : 2));
    if (Math.random() < .3 && c.level < 10) { c.level++; c.salary = Math.round(c.salary * 1.08); addEvent('↗', 'Uma promoção chegou', `Seu salário agora é ${money(c.salary)} por mês.`, 'blue'); }
  }
  if (state.age >= 45 && Math.random() < .08 && !state.healthConditions.includes('pressão alta')) state.healthConditions.push('pressão alta');
  const event = yearlyEvent(); addEvent(event.icon, event.title, event.text, event.cls);
  if (wasInPrison) addEvent('⚖', 'Um ano difícil', state.prisonYears ? `Você cumpriu mais um ano de prisão. Restam ${state.prisonYears}.` : 'Você cumpriu sua pena e está tentando reconstruir a vida.', 'pink');
  state.history.push({ year: state.year, age: state.age, money: Math.round(state.money), career: c.title });
  if (state.health <= 0 || (state.age >= 92 && Math.random() < .15) || state.age >= 105) {
    state.dead = true; addEvent('☾', 'O fim de uma jornada', 'Sua história terminou, mas seu legado permanece.', 'pink');
  }
  commit(`Ano ${state.year}: ${income >= expenses ? 'suas contas fecharam no azul' : 'suas despesas exigiram atenção'}`);
}
function yearlyEvent() {
  const events = [
    { icon: '✦', title: 'Um novo capítulo', text: 'Você percebeu que pequenas escolhas mudaram completamente seu caminho.' },
    { icon: '♧', title: 'Um hábito saudável', text: 'Sua rotina melhorou e você encontrou mais equilíbrio.', cls: 'blue' },
    { icon: '↗', title: 'Reconhecimento profissional', text: 'Seu trabalho chamou atenção e uma oportunidade apareceu.', cls: 'pink' },
    { icon: '♡', title: 'Uma mensagem inesperada', text: `${state.relationships.length ? pick(state.relationships).name : 'Alguém especial'} lembrou de você e propôs um encontro.`, cls: 'pink' }
  ]; return pick(events);
}
function quickAction(type) {
  if (state.dead) return toast('Esta vida chegou ao fim.');
  const actions = {
    explore: ['Uma descoberta inesperada', 'Você encontrou uma livraria escondida. Um livro raro custou R$ 45.', () => { if (!requireResources(45, 6)) return; changeStat('happiness', 4); addEvent('⌁', 'Uma nova descoberta', 'Uma livraria escondida mudou seu caminho hoje.'); }],
    learn: ['Hora de crescer', 'Um curso intensivo vai consumir tempo, mas aumentar sua habilidade.', () => { if (!requireAge(6) || !requireEnergy(12)) return; state.education = clamp(state.education + 5); state.skills[state.talent] = clamp((state.skills[state.talent] || 50) + 4); changeStat('happiness', 2); addEvent('⊙', 'Você começou a aprender', 'Um curso abriu novas possibilidades.', 'blue'); }],
    social: ['Um convite especial', 'Marina está organizando um jantar. O custo é R$ 80, mas a conexão pode valer muito mais.', () => { if (!state.relationships.length) return toast('Você ainda não tem ninguém para convidar.'); if (!requireResources(80, 8)) return; const p = state.relationships[0]; p.affinity = clamp(p.affinity + 8); changeStat('happiness', 5); changeStat('reputation', 2); addEvent('♧', 'Uma noite memorável', `Você passou a noite com ${p.name}.`, 'pink'); }],
    rest: ['Pausa merecida', 'Você desligou o celular e recuperou as energias.', () => { state.stress = clamp(state.stress - 12); state.energy = clamp(state.energy + 15); changeStat('happiness', 3); addEvent('☾', 'Você cuidou de si', 'Descanso também é parte da jornada.'); }]
  }; const action = actions[type]; if (action) openModal(action[0], action[1], () => runAction(`quick-${type}`, action[2]));
}
function activity(type) {
  if (state.dead) return toast('Esta vida chegou ao fim.');
  const actions = {
    gym: ['Academia', 'Uma sessão custa R$ 40 e melhora seu condicionamento.', () => { if (!requireAge(12) || !requireResources(40, 10)) return; state.health = clamp(state.health + 5); state.stress = clamp(state.stress - 2); state.skills.atletismo = clamp(state.skills.atletismo + 2); addEvent('♧', 'Treino concluído', 'Você venceu a preguiça hoje.'); }],
    music: ['Música', 'Você publicou uma música e pode começar uma carreira artística.', () => { if (!requireAge(10) || !requireEnergy(8)) return; state.skills.criatividade = clamp(state.skills.criatividade + 3); changeStat('reputation', 3); addEvent('♫', 'Sua música ganhou atenção', 'Um pequeno começo pode virar uma grande carreira.', 'blue'); }],
    volunteer: ['Voluntariado', 'Você passou a tarde ajudando uma ONG local.', () => { if (!requireAge(14) || !requireEnergy(10)) return; state.karma = clamp(state.karma + 4); changeStat('reputation', 6); changeStat('happiness', 3); addEvent('♡', 'Você fez a diferença', 'Seu tempo ajudou quem precisava.', 'pink'); }],
    casino: ['Cassino', 'Você pode apostar R$ 200. A chance de ganhar é pequena, e perder também dói.', () => { if (!requireAge(18) || !requireResources(200, 4)) return; if (Math.random() < .38) { state.money += 600; addEvent('♢', 'Uma aposta deu certo', 'Você saiu antes de perder o controle.'); } else { state.stress = clamp(state.stress + 8); addEvent('♢', 'A sorte não veio', 'Você perdeu a aposta e decidiu aprender com o limite.'); } }],
    dating: ['Encontro', 'Um encontro casual pode virar uma relação nova.', () => { if (!requireAge(16) || !requireEnergy(10)) return; const p = { id: `new-${Date.now()}`, name: pick(['Bea Lima', 'Caio Torres', 'Nina Alves', 'Theo Reis']), role: 'Novo interesse', initials: '♡', color: '#c88d9b', affinity: 55, romance: 45, type: 'romance' }; state.relationships.push(p); changeStat('happiness', 5); addEvent('♥', 'Um encontro promissor', `${p.name} entrou na sua história.`, 'pink'); }],
    meditate: ['Meditação', 'Você respirou fundo e deixou o celular de lado.', () => { if (!requireEnergy(6)) return; state.stress = clamp(state.stress - 10); changeStat('happiness', 4); addEvent('☾', 'Momento de paz', 'Você encontrou silêncio em meio ao caos.'); }],
    crime: ['Vida do crime', 'Um contato ofereceu um trabalho ilegal. O risco de investigação é real.', () => { if (!requireAge(18) || !requireEnergy(15)) return; if (Math.random() < .55) { state.money += 5000; state.karma = clamp(state.karma - 10); changeStat('reputation', -15); addEvent('⚠', 'Uma escolha perigosa', 'Dinheiro fácil trouxe consequências para sua reputação.'); } else if (Math.random() < .45) { state.arrestCount++; state.prisonYears += 2; state.money = Math.max(0, state.money - 1000); changeStat('reputation', -25); changeStat('happiness', -12); state.stress = clamp(state.stress + 20); addEvent('⚖', 'Você foi preso', 'A investigação encontrou provas. Você cumprirá dois anos de pena.', 'pink'); } else { state.finances.debt += 1000; state.credit = clamp(state.credit - 60, 0, 900); state.stress = clamp(state.stress + 20); addEvent('⚠', 'O plano deu errado', 'Você escapou, mas ficou com uma dívida e perdeu tranquilidade.'); } }],
    fame: ['Buscar fama', 'Um vídeo seu pode viralizar, mas a exposição cobra seu preço.', () => { if (!requireAge(13) || !requireEnergy(8)) return; changeStat('reputation', 10); state.fame += 8; state.stress = clamp(state.stress + 3); addEvent('★', 'Você ficou famoso', 'Seu rosto está em todos os lugares hoje.', 'blue'); }]
  }; const action = actions[type]; if (action) openModal(action[0], action[1], () => runAction(`activity-${type}`, action[2]));
}
function setupBindings() {
  $$('.nav-item').forEach(button => button.onclick = () => { $$('.nav-item').forEach(b => b.classList.remove('active')); button.classList.add('active'); $$('.section-view').forEach(view => view.classList.add('hidden')); $(`#${button.dataset.section}View`)?.classList.remove('hidden'); });
  $$('.action-grid button').forEach(button => button.onclick = () => quickAction(button.dataset.action));
  $$('.activity-grid button').forEach(button => button.onclick = () => activity(button.dataset.game));
  $('#ageBtn').onclick = () => openModal('Virar um ano', 'O tempo passa, suas contas são processadas e as relações mudam. Quer descobrir o próximo capítulo?', advanceYear, 'Avançar');
  $('#jobBtn').onclick = () => openModal('Uma proposta chegou', 'Uma startup quer você como líder de design. O salário será maior, mas o risco também.', () => runAction('career', () => { if (!requireAge(16) || !requireEnergy(6)) return; state.career.title = 'Líder de Design'; state.career.company = 'Núcleo Lab'; state.career.salary += 2400; state.career.level++; addEvent('↗', 'Você aceitou uma proposta', 'Uma mudança profissional abriu novas possibilidades.', 'blue'); }));
  $('#meetBtn').onclick = () => activity('dating');
  $('#childBtn').onclick = () => openModal('Planejar família', 'Ter um filho exige estabilidade, cuidado e disponibilidade emocional. O custo inicial é de R$ 1.500.', () => runAction('family-child', () => { if (!requireAge(18) || !state.partnerId || !requireResources(1500, 12)) { if (!state.partnerId && state.age >= 18) toast('Você precisa de um parceiro para planejar esta família.'); return; } const child = { name: pick(['Luna', 'Theo', 'Clara', 'Miguel', 'Sofia']), age: 0, adopted: false }; state.children.push(child); changeStat('happiness', 8); addEvent('♡', 'Uma nova vida chegou', `${child.name} agora faz parte da sua família.`, 'pink'); }), 'Confirmar');
  $('#adoptBtn').onclick = () => openModal('Considerar adoção', 'A adoção custa R$ 4.000 em preparação e acompanhamento. Você poderá oferecer um lar a uma criança.', () => runAction('family-adopt', () => { if (!requireAge(21) || !requireResources(4000, 16)) return; const child = { name: pick(['Bia', 'Davi', 'Nina', 'Ravi']), age: 2, adopted: true }; state.children.push(child); changeStat('happiness', 10); addEvent('♡', 'Adoção concluída', `${child.name} encontrou um lar com você.`, 'pink'); }), 'Iniciar processo');
  $('#newQuote').onclick = () => { const q = pick([['O futuro pertence a quem acredita na beleza de seus sonhos.', '— Eleanor Roosevelt'], ['Não conte os dias, faça os dias contarem.', '— Muhammad Ali'], ['Tudo parece impossível até que seja feito.', '— Nelson Mandela']]); $('#quote').textContent = q[0]; $('#quote').nextElementSibling.textContent = q[1]; toast('Nova reflexão encontrada'); };
  $('#settingsBtn').onclick = () => toast('Seu progresso está salvo neste dispositivo.'); $('#closeModal').onclick = $('#modalCancel').onclick = closeModal;
  $$('[data-modal]').forEach(button => button.onclick = () => modalAction(button.dataset.modal));
  $('#newLife').onclick = () => $('#customizer').classList.remove('hidden'); $('#closeCreator').onclick = () => $('#customizer').classList.add('hidden');
  $$('.appearance-options button').forEach(button => button.onclick = () => { $$('.appearance-options button').forEach(b => b.classList.remove('selected')); button.classList.add('selected'); });
  $('#createLife').onclick = createLife;
}
function modalAction(type) {
  const actions = {
    study: ['Matricular-se em um curso', 'Uma formação pode transformar seu futuro. O primeiro passo exige disciplina.', () => { if (!requireAge(6) || !requireEnergy(12)) return; state.education = clamp(state.education + 8); state.skills.inteligência = clamp(state.skills.inteligência + 4); addEvent('⌘', 'Você voltou a estudar', 'Uma nova habilidade foi adicionada ao seu repertório.'); }],
    invest: ['Investir dinheiro', 'Aplique R$ 500 em uma carteira diversificada. O retorno nunca é garantido.', () => { if (!requireAge(18) || !requireResources(500, 2)) return; state.finances.investments += 500; addEvent('▣', 'Você fez um investimento', 'Sua carteira ganhou uma nova posição.'); }],
    travel: ['Planejar uma viagem', 'Uma promoção para Lisboa custa R$ 4.200. Viajar abre a mente.', () => { if (!requireAge(16) || !requireResources(4200, 12)) return; changeStat('happiness', 8); state.stress = clamp(state.stress - 8); addEvent('✈', 'Viagem planejada', 'Lisboa está esperando por você.', 'blue'); }],
    doctor: ['Consulta médica', 'Um check-up custa R$ 250 e ajuda a prevenir problemas.', () => { if (!requireResources(250, 4)) return; state.health = clamp(state.health + 6); state.stress = clamp(state.stress - 3); addEvent('♧', 'Check-up realizado', 'Você está cuidando bem da sua saúde.'); }]
  }; const action = actions[type]; if (action) openModal(action[0], action[1], action[2]);
}
function createLife() {
  const name = $('#newName').value.trim().slice(0, 28) || 'Alex'; const city = $('#newCity').value.trim().slice(0, 28) || 'São Paulo';
  const previous = state; const inheritance = previous.dead ? Math.round((previous.money + previous.finances.investments) * .15) : 0;
  const archive = { name: previous.name, age: previous.age, year: previous.year, city: previous.city, country: previous.country, career: previous.career.title, money: Math.round(previous.money), cause: previous.dead ? 'fim da vida' : 'nova jornada' };
  const fresh = initialState(); state = { ...fresh, name, city, pronouns: $('#newPronouns').value, country: $('#newCountry').value, talent: $('#newTalent').value, trait: $('#newTrait').value, age: 0, year: 2026, money: inheritance, happiness: 75, health: 85, reputation: 10, stress: 25, generations: [...(previous.generations || []), archive].slice(-12), career: { title: 'Sem profissão', company: '—', salary: 0, level: 0, skill: 20, employed: false }, relationships: [] };
  state.avatar = $('.appearance-options .selected')?.textContent || name.slice(0, 2).toUpperCase(); state.skills[state.talent] = clamp((state.skills[state.talent] || 50) + 15); state.events = [{ icon: '✦', cls: '', title: 'Você nasceu', text: inheritance ? `Uma nova história começou com uma herança de ${money(inheritance)}.` : `Uma nova história começou em ${city}, ${state.country}.`, time: 'Agora' }];
  $('#customizer').classList.add('hidden'); render(); toast(`✦ Nova vida criada: ${name}`);
}
setupBindings(); render();
