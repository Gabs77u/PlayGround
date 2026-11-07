const SAVE_KEY = 'viva-save-v2';
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const clamp = (value, min = 0, max = 100) => Math.max(min, Math.min(max, value));
const money = value => `R$ ${Math.round(value).toLocaleString('pt-BR')}`;
const pick = list => list[Math.floor(Math.random() * list.length)];
const today = () => new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
const safeNumber = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const safePercent = value => clamp(safeNumber(value));
const safeColor = (value, fallback = '#7899b2') => /^#[0-9a-f]{6}$/i.test(String(value ?? '')) ? String(value) : fallback;
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
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
  temporal: { mode: 'annual', lastAdvance: 2025, totalMonths: 0 },
  attributes: { intelligence: 70, appearance: 72, energy: 78, mentalHealth: 82, fatigue: 18, madness: 0, fertility: 86, aging: 0, hunger: 18, hydration: 82, maxHp: 100, combatStrength: 0 },
  needs: { sleep: 78, social: 68, nutrition: 82, purpose: 74 },
  hobbies: { music: 0, fitness: 0, creativity: 0 },
  mental: { diagnoses: [], screenings: 0, treated: false },
  addictions: { alcohol: 0, drugs: 0, gambling: 0, recovery: false, meetings: 0, substanceHistory: [] },
  identity: { gender: 'não definido', sexuality: 'não definida', discovered: false, transitioned: false, chosenName: '' },
  prison: { gang: 'nenhuma', protection: 0, respect: 0, work: 0, study: 0, riotRisk: 0 },
  socialMedia: { youtube: { followers: 0, engagement: 0 }, tiktok: { followers: 0, engagement: 0 }, instagram: { followers: 0, engagement: 0 }, twitter: { followers: 0, engagement: 0 }, posts: 0, controversy: 0 },
  lifestyle: { diet: 'balanceada', training: { cardio: 0, musculacao: 0, artesMarciais: 0 }, combat: 0 },
  collectibles: { items: [], nextId: 1 },
  exoticPets: { pets: [], accidents: 0, nextId: 1, breeding: [], sales: 0 },
  legal: { alimony: 0, custody: 'compartilhada', appeals: 0, extradition: false, inheritanceDebt: 0, cases: [] },
  union: { member: false, dues: 0, strike: 0, picket: 0, dismissalRisk: 0, drugTests: 0, protected: false },
  survival: { homeless: false, warmth: 72, urbanEnergy: 70, hunger: 20, policeRisk: 0, squatYears: 0 },
  occult: { mediums: 0, exorcists: 0, haunted: false, rituals: 0, poisonRisk: 0, practitioner: '' },
  landlord: { properties: [], tenants: [], evictionLock: 0 },
  talent: 'criatividade', trait: 'ambicioso', avatar: 'AM', dead: false,
  healthConditions: [], arrestCount: 0, prisonYears: 0, partnerId: null, deathCause: null,
  cooldowns: {}, history: [], generations: [], children: [], eventsOldest: false, educationCourse: null, educationHistory: [], goals: { emergency: 19440, home: 300000 },
  career: { title: 'Designer de Produto', company: 'Estúdio Aurora', salary: 7800, level: 4, skill: 78, employed: true, satisfaction: 74, remote: false },
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
    const loaded = mergeState(initialState(), saved || {});
    const base = initialState();
    ['relationships', 'events', 'children', 'generations', 'healthConditions', 'educationHistory'].forEach(key => {
      if (!Array.isArray(loaded[key])) loaded[key] = base[key];
    });
    ['relationships', 'events', 'children', 'generations', 'educationHistory'].forEach(key => {
      loaded[key] = loaded[key].filter(value => value && typeof value === 'object' && !Array.isArray(value));
    });
    ['career', 'finances', 'goals', 'skills', 'cooldowns', 'needs', 'hobbies', 'mental', 'addictions', 'identity', 'prison', 'socialMedia', 'lifestyle', 'collectibles', 'exoticPets', 'landlord', 'temporal', 'attributes'].forEach(key => {
      if (!loaded[key] || typeof loaded[key] !== 'object' || Array.isArray(loaded[key])) loaded[key] = base[key];
    });
    Object.keys(base.needs).forEach(key => { loaded.needs[key] = safePercent(loaded.needs[key]); });
    loaded.temporal.mode = ['annual', 'quarterly', 'monthly', 'action'].includes(loaded.temporal.mode) ? loaded.temporal.mode : 'annual';
    loaded.temporal.lastAdvance = Math.max(1900, safeNumber(loaded.temporal.lastAdvance, loaded.year));
    loaded.temporal.totalMonths = Math.max(0, safeNumber(loaded.temporal.totalMonths));
    Object.keys(base.attributes).forEach(key => {
      const value = safeNumber(loaded.attributes[key], base.attributes[key]);
      loaded.attributes[key] = key === 'maxHp' ? clamp(value, 35, 100) : safePercent(value);
    });
    loaded.attributes.combatStrength = safePercent(loaded.attributes.combatStrength);
    Object.keys(base.hobbies).forEach(key => { loaded.hobbies[key] = Math.max(0, safeNumber(loaded.hobbies[key])); });
    loaded.mental.diagnoses = Array.isArray(loaded.mental.diagnoses) ? loaded.mental.diagnoses : [];
    loaded.mental.screenings = Math.max(0, safeNumber(loaded.mental.screenings));
    loaded.mental.treated = loaded.mental.treated === true;
    ['alcohol', 'drugs', 'gambling'].forEach(key => { loaded.addictions[key] = safePercent(loaded.addictions[key]); });
    loaded.addictions.recovery = loaded.addictions.recovery === true;
    loaded.addictions.meetings = Math.max(0, safeNumber(loaded.addictions.meetings));
    Object.keys(base.identity).forEach(key => { if (typeof loaded.identity[key] !== typeof base.identity[key]) loaded.identity[key] = base.identity[key]; });
    ['protection', 'respect', 'work', 'study', 'riotRisk'].forEach(key => { loaded.prison[key] = safePercent(loaded.prison[key]); });
    loaded.prison.gang = String(loaded.prison.gang || 'nenhuma').slice(0, 40);
    ['youtube', 'tiktok', 'instagram', 'twitter'].forEach(key => {
      if (!loaded.socialMedia[key] || typeof loaded.socialMedia[key] !== 'object' || Array.isArray(loaded.socialMedia[key])) loaded.socialMedia[key] = { ...base.socialMedia[key] };
      loaded.socialMedia[key].followers = Math.max(0, safeNumber(loaded.socialMedia[key].followers));
      loaded.socialMedia[key].engagement = safePercent(loaded.socialMedia[key].engagement);
    });
    loaded.socialMedia.posts = Math.max(0, safeNumber(loaded.socialMedia.posts));
    loaded.socialMedia.controversy = safePercent(loaded.socialMedia.controversy);
    if (!Array.isArray(loaded.mental.diagnoses)) loaded.mental.diagnoses = [];
    loaded.mental.diagnoses = loaded.mental.diagnoses.map(value => String(value).slice(0, 60)).slice(0, 8);
    Object.keys(base.addictions).filter(key => ['alcohol', 'drugs', 'gambling'].includes(key)).forEach(key => { loaded.addictions[key] = safePercent(loaded.addictions[key]); });
    ['youtube', 'tiktok', 'instagram', 'twitter'].forEach(key => { loaded.socialMedia[key].followers = Math.max(0, safeNumber(loaded.socialMedia[key].followers)); loaded.socialMedia[key].engagement = safePercent(loaded.socialMedia[key].engagement); });
    loaded.identity.chosenName = String(loaded.identity.chosenName || '').slice(0, 80);
    loaded.lifestyle.diet = ['fastfood', 'balanceada', 'vegana', 'keto'].includes(loaded.lifestyle.diet) ? loaded.lifestyle.diet : 'balanceada';
    loaded.lifestyle.training = loaded.lifestyle.training && typeof loaded.lifestyle.training === 'object' ? loaded.lifestyle.training : { ...base.lifestyle.training };
    ['cardio', 'musculacao', 'artesMarciais'].forEach(key => { loaded.lifestyle.training[key] = Math.max(0, safeNumber(loaded.lifestyle.training[key])); });
    loaded.lifestyle.combat = safePercent(loaded.lifestyle.combat);
    loaded.collectibles.items = Array.isArray(loaded.collectibles.items) ? loaded.collectibles.items.filter(item => item && typeof item === 'object').slice(0, 80) : [];
    loaded.collectibles.items.forEach(item => { item.value = Math.max(25, safeNumber(item.value, 25)); item.originalValue = Math.max(25, safeNumber(item.originalValue, item.value)); item.condition = String(item.condition || 'usado').slice(0, 20); });
    loaded.collectibles.nextId = Math.max(1, safeNumber(loaded.collectibles.nextId, 1));
    loaded.exoticPets.pets = Array.isArray(loaded.exoticPets.pets) ? loaded.exoticPets.pets.filter(pet => pet && typeof pet === 'object').slice(0, 12) : [];
    loaded.exoticPets.accidents = Math.max(0, safeNumber(loaded.exoticPets.accidents));
    loaded.landlord.properties = Array.isArray(loaded.landlord.properties) ? loaded.landlord.properties.filter(item => item && typeof item === 'object').slice(0, 20) : [];
    loaded.landlord.tenants = Array.isArray(loaded.landlord.tenants) ? loaded.landlord.tenants.filter(item => item && typeof item === 'object').slice(0, 20) : [];
    loaded.landlord.evictionLock = Math.max(0, safeNumber(loaded.landlord.evictionLock));
    loaded.name = String(loaded.name ?? base.name).slice(0, 80);
    loaded.city = String(loaded.city ?? base.city).slice(0, 80);
    loaded.country = String(loaded.country ?? base.country).slice(0, 80);
    loaded.age = Math.max(0, safeNumber(loaded.age, base.age));
    loaded.year = Math.max(1900, safeNumber(loaded.year, base.year));
    loaded.money = Math.max(0, safeNumber(loaded.money, base.money));
    loaded.health = safePercent(loaded.health);
    loaded.happiness = safePercent(loaded.happiness);
    loaded.energy = safePercent(loaded.energy);
    loaded.stress = safePercent(loaded.stress);
    loaded.dead = loaded.dead === true;
    return loaded;
  } catch { return initialState(); }
}
function saveState() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); } catch { /* armazenamento indisponível */ }
  const dot = $('.save-state .dot'); if (dot) dot.style.background = '#7dbe63';
}
function toast(message) { const el = $('#toast'); if (!el) return; el.textContent = message; el.classList.add('show'); clearTimeout(toast.timer); toast.timer = setTimeout(() => el.classList.remove('show'), 2600); }
function addEvent(icon, title, text, cls = '') { state.events.unshift({ icon, title, text, cls, time: 'Agora' }); state.events = state.events.slice(0, 9); }
function renderEvents() { const list = $('#eventList'); const filter = $('#vidaView .timeline-panel .filter-btn'); if (filter) filter.textContent = state.eventsOldest ? 'Mais recentes⌄' : 'Mais antigos⌄'; if (list) { const events = state.eventsOldest ? state.events.slice().reverse() : state.events; list.innerHTML = events.map(e => `<div class="event"><div class="event-icon ${escapeHTML(e.cls || '')}">${escapeHTML(e.icon)}</div><div><b>${escapeHTML(e.title)}</b><p>${escapeHTML(e.text)}</p><time>${escapeHTML(e.time)}</time></div></div>`).join(''); } }
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
  const previous = state.cooldowns[key]; const newestEventBefore = state.events[0];
  if (!canAct(key, 1)) return;
  action();
  if (state.events[0] === newestEventBefore) {
    if (previous === undefined) delete state.cooldowns[key]; else state.cooldowns[key] = previous;
  }
}
function openModal(title, text, action, confirm = 'Escolher este caminho') {
  const actions = $('.modal-actions');
  if (actions) actions.innerHTML = '<button class="secondary-btn" id="modalCancel">Agora não</button><button class="primary-btn" id="modalOk"></button>';
  $('#modalTitle').textContent = title; $('#modalText').textContent = text; $('#modalOk').textContent = confirm;
  $('#modal').classList.remove('hidden'); $('#modalCancel').onclick = closeModal;
  $('#modalOk').onclick = () => {
    $('#modal').classList.add('hidden');
    if (state.dead) { toast('Esta vida chegou ao fim. Comece uma nova história.'); return; }
    if (action) action(); render();
  };
}
function openChoiceModal(title, intro, choices) {
  $('#modalTitle').textContent = title; $('#modalText').textContent = intro;
  const actions = $('.modal-actions');
  actions.innerHTML = '<button class="secondary-btn" id="modalCancel">Agora não</button>';
  choices.forEach((choice, index) => {
    const button = document.createElement('button'); button.className = index === 0 ? 'primary-btn' : 'secondary-btn';
    button.textContent = choice.label; button.title = choice.detail || '';
    button.onclick = () => {
      $('#modal').classList.add('hidden');
      if (state.dead) { toast('Esta vida chegou ao fim. Comece uma nova história.'); return; }
      choice.action(); render();
    };
    actions.appendChild(button);
  });
  $('#modal').classList.remove('hidden'); $('#modalCancel').onclick = closeModal;
}
function closeModal() { $('#modal')?.classList.add('hidden'); }

function renderMentalHealth() {
  const mental = state.mental && typeof state.mental === 'object' ? state.mental : {}; const addictions = state.addictions && typeof state.addictions === 'object' ? state.addictions : {};
  const diagnoses = Array.isArray(mental.diagnoses) ? mental.diagnoses : [];
  const diagnosis = $('#mentalConditions'); if (diagnosis) diagnosis.textContent = diagnoses.length ? diagnoses.join(' · ') : 'Nenhum diagnóstico — acompanhamento preventivo';
  const addiction = $('#addictionStatus'); if (addiction) { const active = ['alcohol', 'drugs', 'gambling'].filter(key => safePercent(addictions[key]) >= 35); addiction.textContent = active.length ? `Risco elevado: ${active.join(', ')}` : addictions.recovery ? 'Em recuperação, um dia de cada vez.' : 'Nenhuma dependência identificada'; }
  const identityState = state.identity && typeof state.identity === 'object' ? state.identity : {};
  const identity = $('#identityStatus'); if (identity) identity.textContent = `${identityState.gender || 'não definido'} · ${identityState.sexuality || 'não definida'}${identityState.transitioned ? ' · transição realizada' : ''}`;
}
function renderPrison() {
  const panel = $('#prisonDetails'); if (!panel) return;
  const prison = state.prison && typeof state.prison === 'object' ? state.prison : {};
  panel.textContent = state.prisonYears ? `Pena: ${state.prisonYears} ano(s) · grupo: ${prison.gang || 'nenhuma'} · respeito: ${Math.round(safePercent(prison.respect))}/100` : 'Você está em liberdade. Evite riscos e cuide dos vínculos.';
}
function renderFame() {
  const fame = $('#fameDetails'); if (!fame) return;
  const media = state.socialMedia && typeof state.socialMedia === 'object' ? state.socialMedia : {};
  const total = ['youtube', 'tiktok', 'instagram', 'twitter'].reduce((sum, key) => {
    const platform = media[key] && typeof media[key] === 'object' ? media[key] : {};
    return sum + safeNumber(platform.followers);
  }, 0);
  fame.textContent = `${total.toLocaleString('pt-BR')} seguidores · ${safePercent(state.fame)}/100 de fama · ${safeNumber(media.posts)} post(s)`;
}
function renderLifestyle() {
  const dietNames = { fastfood: 'Fast Food', balanceada: 'Balanceada', vegana: 'Vegana', keto: 'Keto' };
  const diet = $('#dietStatus'); if (diet) diet.textContent = `${dietNames[state.lifestyle.diet] || 'Balanceada'} · escolha semanal`;
  const training = state.lifestyle.training; const combat = $('#combatScore'); if (combat) combat.textContent = `${Math.round(state.attributes.combatStrength || state.lifestyle.combat)}/100`;
  const trainingEl = $('#trainingStatus'); if (trainingEl) trainingEl.textContent = `Cardio ${Math.round(training.cardio)} · Musculação ${Math.round(training.musculacao)} · Artes marciais ${Math.round(training.artesMarciais)}`;
  const collection = $('#collectionList'); if (collection) collection.innerHTML = state.collectibles.items.length ? state.collectibles.items.map(item => `<div class="goal"><span class="goal-icon">${escapeHTML(item.icon || '✦')}</span><div><b>${escapeHTML(item.name)}</b><small>${money(item.value)} · ${item.condition || 'coleção'}</small></div><button class="filter-btn" data-sell-collectible="${item.id}">Vender</button></div>`).join('') : '<div class="system-copy">Nenhum item colecionável ainda.</div>';
  const pets = $('#petsList'); if (pets) pets.innerHTML = state.exoticPets.pets.length ? state.exoticPets.pets.map(pet => `<div class="goal"><span class="goal-icon">${pet.type === 'tigre' ? '🐅' : '🐍'}</span><div><b>${escapeHTML(pet.name)}</b><small>${escapeHTML(pet.type)} · manutenção ${money(pet.cost)}/ano</small></div></div>`).join('') : '<div class="system-copy">Nenhum animal exótico.</div>';
  const rental = $('#landlordList');
  if (rental) {
    const lock = safeNumber(state.landlord.evictionLock);
    const notice = lock ? `<div class="system-copy">⚖ Processo judicial: ações do locador bloqueadas por ${lock} ano(s).</div>` : '';
    const properties = state.landlord.properties.map(property => {
      const tenant = state.landlord.tenants.find(item => item.propertyId === property.id);
      let status = 'sem inquilino';
      if (tenant) {
        status = `${escapeHTML(tenant.name)} · ${money(tenant.rent)} · crédito ${Math.round(safeNumber(tenant.credit))}/900`;
        if (tenant.overdue) status += ' · aluguel atrasado';
        if (tenant.vandalized) status += ' · danos no imóvel';
        if (tenant.eviction) status += ' · despejo em curso';
      }
      return `<div class="goal"><span class="goal-icon">⌂</span><div><b>${escapeHTML(property.name)}</b><small>${status}</small></div></div>`;
    }).join('');
    rental.innerHTML = notice + (properties || '<div class="system-copy">Nenhum imóvel para alugar.</div>');
  }
  $$('[data-sell-collectible]').forEach(button => button.onclick = () => sellCollectible(Number(button.dataset.sellCollectible)));
}
function render() {
  const setText = (selector, text) => { const el = $(selector); if (el) el.textContent = text; };
  setText('#sideName', state.name); setText('#sideAge', `${state.age} anos · ${state.city}, ${state.country}`); setText('#money', money(state.money));
  const displayName = String(state.name ?? 'Alex Martins');
  const heading = $('.page-heading h1'); if (heading && $('#vidaView')?.classList.contains('hidden') === false && heading.firstChild) heading.firstChild.textContent = `Olá, ${displayName.split(' ')[0]} `;
  const eyebrow = $('.page-heading .eyebrow'); if (eyebrow && $('#vidaView')?.classList.contains('hidden') === false) eyebrow.textContent = `${today()} · ${safeNumber(state.year, 2026)}`;
  const stat = (id, value) => { const el = $(`#${id}`); if (el) el.innerHTML = `${Math.round(safePercent(value))}<span class="unit">/100</span>`; };
  stat('happiness', state.happiness); stat('reputation', state.reputation);
  const healthCard = $('.stats-grid .stat-card:nth-child(2) strong'); if (healthCard) healthCard.innerHTML = `${Math.round(safePercent(state.health))}<span class="unit">/100</span>`;
  const bars = $('.stats-grid .stat-card:nth-child(2) .progress i'); if (bars) bars.style.width = `${safePercent(state.health)}%`;
  const mood = state.happiness > 80 ? 'se sentindo inspirado' : state.happiness > 55 ? 'em equilíbrio' : state.happiness > 30 ? 'um pouco abatido' : 'precisando de cuidado';
  setText('#moodText', mood); const moodPercent = $('.mood i'); if (moodPercent) moodPercent.textContent = `${Math.round(state.happiness)}%`;
  const avatar = $('.avatar'); if (avatar) avatar.textContent = state.avatar || displayName.slice(0, 2).toUpperCase(); const mini = $('.avatar-mini'); if (mini) mini.textContent = String(state.avatar || displayName.slice(0, 2)).slice(0, 2);
  setText('#relCount', state.relationships.length); setText('#netWorth', money(state.money + state.finances.investments + state.finances.property + state.finances.vehicle - state.finances.debt));
  const financeCards = $$('#patrimonioView .stat-card strong');
  if (financeCards[1]) financeCards[1].textContent = money(state.finances.expenses);
  if (financeCards[2]) financeCards[2].textContent = money(state.finances.investments);
  setText('#monthlyExpenses', money(state.finances.expenses)); setText('#investmentValue', money(state.finances.investments));
  if (financeCards[3]) financeCards[3].innerHTML = `${Math.round(clamp(safeNumber(state.credit), 0, 900))}<span class="unit">/900</span>`;
  const financeBars = $$('#patrimonioView .progress i'); if (financeBars[0]) financeBars[0].style.width = `${clamp(safeNumber(state.credit), 0, 900) / 9}%`;
  setText('#debtValue', `Dívida: ${money(state.finances.debt)}`); setText('#lifeStatus', state.dead ? `Vida encerrada aos ${state.age} anos` : `${state.age} anos · ${state.city}`);
  renderEvents(); renderPeople(); renderFamily(); renderCareer(); renderEducation(); renderAssets(); renderHealth(); renderNeeds(); renderAttributes(); renderHobbies(); renderMentalHealth(); renderPrison(); renderFame(); renderLifestyle(); saveState();
}
function renderAttributes() {
  const a = state.attributes || {};
  const set = (id, value) => { const el = $(`#${id}`); if (el) el.textContent = `${Math.round(safePercent(value))}/100`; };
  set('intelligenceScore', a.intelligence); set('appearanceScore', a.appearance); set('mentalHealthScore', a.mentalHealth); set('fertilityScore', a.fertility);
  set('hydrationScore', a.hydration); set('hungerScore', 100 - a.hunger); set('fatigueScore', a.fatigue); set('maxHpScore', a.maxHp);
  a.energy = clamp(state.energy);
  const modes = { annual: 'anual', quarterly: 'trimestral', monthly: 'mensal', action: 'por ação' };
  const status = $('#temporalStatus'); if (status) status.textContent = `Modo ${modes[state.temporal?.mode] || 'anual'} · próximo avanço: ${state.year + 1} · ${state.temporal?.totalMonths || 0} meses vividos`;
  const note = $('#agingNote'); if (note) note.textContent = `${a.aging < 20 ? 'Seu corpo ainda tem boa margem de recuperação.' : a.aging < 55 ? 'O desgaste biológico pede hábitos consistentes.' : 'O envelhecimento está acelerado; cuide da saúde e do descanso.'} Desgaste: ${Math.round(a.aging)}/100.`;
}
function renderNeeds() {
  const needs = state.needs || {};
  const labels = { sleep: 'Descanso', social: 'Conexão', nutrition: 'Alimentação', purpose: 'Propósito' };
  Object.entries(labels).forEach(([key, label]) => {
    const value = safePercent(needs[key]); const bar = $(`#need-${key}`); const score = $(`#need-${key}-score`);
    if (bar) { bar.style.width = `${value}%`; bar.classList.toggle('low', value < 35); }
    if (score) score.textContent = `${Math.round(value)}/100`;
  });
  const note = $('#needsNote'); if (note) note.textContent = Math.min(...Object.values(needs).map(safePercent)) < 35 ? 'Alguma necessidade está pedindo atenção.' : 'Tudo certo por aqui — escolha o que combina com seu momento.';
}
function renderHobbies() {
  const hobbies = state.hobbies || {};
  const labels = { music: 'Música', fitness: 'Movimento', creativity: 'Criatividade' };
  const rank = value => value < 20 ? 'Iniciante' : value < 40 ? 'Curioso(a)' : value < 65 ? 'Dedicado(a)' : value < 85 ? 'Habilidoso(a)' : 'Referência';
  Object.entries(labels).forEach(([key]) => {
    const value = safePercent(hobbies[key]);
    const bar = $(`#hobby-${key}-bar`); const score = $(`#hobby-${key}-score`);
    if (bar) { bar.style.width = `${value}%`; bar.classList.toggle('low', value < 20); }
    if (score) score.textContent = `${rank(value)} · ${Math.round(value)}/100`;
  });
}
function renderEducation() {
  const education = $('#educationScore'); if (education) education.textContent = `${Math.round(state.education)}/100`;
  const active = state.educationCourse;
  const course = $('#currentCourse');
  if (course) course.textContent = active ? `${active.name} · ${active.progress}% concluído` : (state.education >= 90 ? 'Formação avançada concluída' : state.education >= 70 ? 'Design e Tecnologia · concluído' : state.education >= 40 ? 'Ensino médio · em progresso' : 'Ensino básico · em progresso');
  const study = $('#studyHint'); if (study) study.textContent = state.age < 6 ? 'Disponível a partir dos 6 anos' : active ? `Módulo atual: ${active.module} · energia e foco definem seu ritmo` : `Progresso geral: ${Math.round(state.education)}%`;
  $$('[data-course]').forEach(button => {
    const done = (state.educationHistory || []).some(item => item.id === button.dataset.course);
    const courseData = educationCourses[button.dataset.course];
    const label = $('[data-course-label]', button);
    if (courseData && label) label.textContent = done ? `${courseData.name} · concluído` : courseData.name;
  });
}
const educationCourses = {
  direito: { name: 'Direito', cost: 900, energy: 10, gain: 7, skill: 'liderança', unlock: 'Consultoria jurídica' },
  medicina: { name: 'Medicina', cost: 1400, energy: 14, gain: 9, skill: 'inteligência', unlock: 'Pesquisa em saúde' },
  artes: { name: 'Artes cênicas', cost: 650, energy: 8, gain: 6, skill: 'carisma', unlock: 'Entretenimento' },
  mba: { name: 'MBA em negócios', cost: 1100, energy: 12, gain: 8, skill: 'liderança', unlock: 'Gestão executiva' }
};
function educationMenu(courseId = null) {
  if (state.dead) return toast('Esta vida chegou ao fim.');
  const entries = Object.entries(educationCourses);
  if (courseId && educationCourses[courseId]) entries.sort(([id]) => id === courseId ? -1 : 1);
  const choices = entries.map(([id, course]) => ({
    label: `${course.name} · ${money(course.cost)}`,
    detail: `${course.energy} energia; aumenta educação e ${course.skill}. Desbloqueia ${course.unlock}.`,
    action: () => runAction(`course-${id}`, () => {
      if (!requireAge(6)) return;
      const current = state.educationCourse;
      if ((state.educationHistory || []).some(item => item.id === id)) return toast(`${course.name} já está no seu histórico de formação.`);
      if (current && current.id !== id && current.progress < 100) return toast(`Conclua ${current.name} antes de trocar de curso.`);
      if (!requireResources(course.cost, course.energy)) return;
      const progress = current?.id === id ? current.progress : 0;
      const next = clamp(progress + course.gain * (state.trait === 'ambicioso' ? 1.2 : 1));
      state.educationCourse = { id, name: course.name, module: next >= 70 ? 'projeto final' : next >= 35 ? 'prática' : 'fundamentos', progress: Math.round(next) };
      state.education = clamp(state.education + course.gain);
      state.skills[course.skill] = clamp((state.skills[course.skill] || 50) + 3);
      if (next >= 100) { state.educationHistory.push({ id, name: course.name, year: state.year }); state.educationCourse = null; addEvent('⌘', `${course.name} concluído`, `Seu certificado desbloqueou ${course.unlock}.`, 'blue'); }
      else addEvent('⌘', `Você avançou em ${course.name}`, `O módulo de ${state.educationCourse.module} está ${Math.round(next)}% concluído.`);
    })
  }));
  openChoiceModal('Escolha sua formação', 'Cursos têm custo, ritmo e portas diferentes. Você pode estudar novamente para avançar no mesmo curso.', choices);
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
  if (children) {
    children.innerHTML = state.children.length ? state.children.map((child, index) => `<div class="goal"><span class="goal-icon">♡</span><div><b>${escapeHTML(child.name)}</b><small>${safeNumber(child.age)} ano(s) · ${child.adopted ? 'adotado(a)' : 'filho(a)'}</small></div><button class="filter-btn" data-child="${index}">Cuidar</button></div>`).join('') : '<div class="goal"><span class="goal-icon">♡</span><div><b>Nenhum filho ainda</b><small>Construir uma família é uma escolha para o seu momento.</small></div></div>';
    $$('[data-child]', children).forEach(button => button.onclick = () => childMenu(state.children[Number(button.dataset.child)]));
  }
  const generations = $('#generationsList');
  if (generations) generations.innerHTML = state.generations.length ? state.generations.slice().reverse().map(g => `<div class="goal"><span class="goal-icon">✦</span><div><b>${escapeHTML(g.name)} · ${safeNumber(g.age)} anos</b><small>${escapeHTML(g.career)} · ${escapeHTML(g.cause)}</small></div></div>`).join('') : '<div class="goal"><span class="goal-icon">⌁</span><div><b>Seu legado começa aqui</b><small>Uma nova geração será registrada quando esta vida terminar.</small></div></div>';
  const generationSummary = $('#generationSummary'); if (generationSummary) generationSummary.textContent = state.generations.length ? `${state.generations.length} geração(ões) registrada(s)` : 'Nenhuma geração arquivada.';
}
function renderCareer() {
  const c = state.career; const hero = $('.career-hero'); if (!hero) return;
  const tag = $('.career-hero .tag'); if (tag) tag.textContent = c.employed ? `EM ASCENSÃO · NÍVEL ${c.level}` : 'EM BUSCA DE UMA OPORTUNIDADE';
  const title = $('.career-hero h2'); if (title) title.textContent = c.title;
  const place = $('.career-hero p'); if (place) place.textContent = `${c.company} · ${state.city}, ${state.country} · satisfação ${Math.round(c.satisfaction || 70)}/100${c.remote ? ' · remoto' : ''}`;
  const salary = $('.career-salary strong'); if (salary) salary.textContent = money(c.salary);
  const skills = $('#skills'); if (skills) skills.innerHTML = Object.entries(state.skills || {}).map(([name, value]) => { const label = String(name); const percent = safePercent(value); return `<div class="skill"><div class="skill-top"><b>${escapeHTML(label ? label[0].toUpperCase() + label.slice(1) : 'Habilidade')}</b><span>${Math.round(percent)}/100</span></div><div class="skill-bar"><i style="width:${percent}%"></i></div></div>`; }).join('');
}
function renderPeople() {
  const grid = $('#peopleGrid'); if (!grid) return;
  grid.innerHTML = state.relationships.map(person => {
    const bond = person.affinity >= 80 ? 'vínculo muito próximo' : person.affinity >= 55 ? 'presença constante' : person.affinity >= 30 ? 'relação em construção' : 'vínculo distante';
    const romantic = person.romance > 40 && person.type !== 'family' ? ' · interesse romântico' : '';
    return `<div class="person"><div class="person-avatar" style="background:${escapeHTML(safeColor(person.color))}">${escapeHTML(person.initials)}</div><div><h3>${escapeHTML(person.name)}</h3><p>${escapeHTML(person.role)}${romantic} · ${bond}</p><div class="relationship"><i style="width:${safePercent(person.affinity)}%"></i></div></div><button data-rel="${escapeHTML(person.id)}">Interagir</button></div>`;
  }).join('');
  $$('[data-rel]', grid).forEach(button => button.onclick = () => relationshipMenu(state.relationships.find(p => p.id === button.dataset.rel)));
}
function renderHealth() {
  const health = safePercent(state.health); const happiness = safePercent(state.happiness); const stress = safePercent(state.stress);
  const ring = $('.health-ring'); if (ring) ring.innerHTML = `${Math.round(health)}<span>/100</span>`;
  const healthTitle = $('#healthSummary'); if (healthTitle) healthTitle.textContent = state.dead ? 'Esta jornada terminou' : health > 75 ? 'Você está muito bem' : health > 45 ? 'Atenção ao seu bem-estar' : 'Sua saúde precisa de cuidado';
  const bars = $$('#saudeView .skill-bar i'); if (bars.length >= 3) { bars[0].style.width = `${health}%`; bars[1].style.width = `${clamp(happiness - stress / 2)}%`; bars[2].style.width = `${stress}%`; }
  const conditions = $('#healthConditions'); if (conditions) conditions.textContent = state.healthConditions.length ? state.healthConditions.map(condition => String(condition)).join(' · ') : 'Nenhuma condição diagnosticada';
  const status = $('#lifeStatus'); if (status) status.textContent = state.dead ? 'Jornada encerrada' : `${safeNumber(state.age)} anos · ${String(state.city ?? '')}`;
}
function relationshipMenu(person) {
  if (!person || state.dead) return;
  const isFamily = person.type === 'family'; const isPartner = state.partnerId === person.id;
  const romanceText = !isFamily ? ` Interesse romântico: ${person.romance || 0}/100.` : '';
  const context = `${person.name} é ${person.role.toLowerCase()}. Afinidade: ${person.affinity}/100.${romanceText}${isPartner ? ' Esta relação já é uma parceria: decisões compartilhadas exigem tempo e responsabilidade.' : ''}`;
  const choices = [
    { label: 'Ouvir de verdade', detail: 'Custa 4 de energia; aumenta afinidade e reduz estresse.', action: () => runAction(`rel-${person.id}-listen`, () => {
      if (!requireEnergy(4)) return;
      person.affinity = clamp(person.affinity + (state.trait === 'gentil' ? 9 : 6)); changeStat('happiness', 3); state.stress = clamp(state.stress - 2);
      addEvent('♡', `Você esteve presente para ${person.name}`, `Uma conversa sem pressa fortaleceu a confiança entre vocês. Afinidade agora: ${person.affinity}/100.`, 'pink');
    }) },
    { label: 'Fazer um programa', detail: 'Custa R$ 120 e 8 de energia; cria uma memória compartilhada.', action: () => runAction(`rel-${person.id}-date`, () => {
      if (!requireResources(120, 8)) return;
      person.affinity = clamp(person.affinity + 10); if (!isFamily) person.romance = clamp(person.romance + 5); changeStat('happiness', 6); changeStat('reputation', 1);
      addEvent('✦', `Uma memória com ${person.name}`, `Vocês saíram da rotina e descobriram um novo assunto em comum. A relação ganhou mais intimidade.`);
    }) },
    { label: isFamily ? 'Resolver uma tensão' : 'Falar com sinceridade', detail: 'Custa 6 de energia; pode reparar um vínculo abalado, mas exige coragem.', action: () => runAction(`rel-${person.id}-honest`, () => {
      if (!requireEnergy(6)) return;
      const success = person.affinity >= 35 || state.trait === 'gentil'; person.affinity = clamp(person.affinity + (success ? 12 : -6)); state.stress = clamp(state.stress + (success ? -4 : 7)); changeStat('happiness', success ? 4 : -3);
      addEvent(success ? '↗' : '⚠', success ? `Reconciliação com ${person.name}` : `Uma conversa difícil com ${person.name}`, success ? 'Vocês nomearam o que estava incomodando e combinaram uma mudança concreta.' : 'A verdade veio à tona, mas a outra pessoa ainda precisa de tempo.', success ? 'blue' : 'pink');
    }) }
  ];
  if (!isFamily && !isPartner && !state.partnerId && person.romance >= 45) choices.push({ label: 'Assumir o que sente', detail: 'Custa 5 de energia; pode transformar interesse em parceria.', action: () => runAction(`rel-${person.id}-romance`, () => {
    if (!requireEnergy(5)) return;
    if (person.romance >= 55) { state.partnerId = person.id; person.romance = clamp(person.romance + 8); person.affinity = clamp(person.affinity + 8); person.role = 'Parceiro(a)'; changeStat('happiness', 10); addEvent('♡', `Você e ${person.name} ficaram juntos`, 'O vínculo ganhou um compromisso novo, com planos e responsabilidades compartilhadas.', 'pink'); }
    else { person.romance = clamp(person.romance + 4); changeStat('happiness', 2); addEvent('♡', `Você abriu o coração para ${person.name}`, 'A resposta não foi definitiva, mas agora existe mais clareza entre vocês.'); }
  }) });
  if (isPartner) choices.push({ label: 'Planejar o próximo ano', detail: 'Custa R$ 300 e 6 de energia; fortalece planos de longo prazo.', action: () => runAction(`rel-${person.id}-future`, () => {
    if (!requireResources(300, 6)) return; person.affinity = clamp(person.affinity + 7); state.stress = clamp(state.stress - 5); changeStat('happiness', 7); addEvent('⌂', `Planos compartilhados com ${person.name}`, 'Vocês organizaram metas, dividiram responsabilidades e saíram com uma sensação de equipe.', 'blue');
  }) });
  openChoiceModal(`O que fazer com ${person.name}?`, context, choices);
}
function childMenu(child) {
  if (!child) return;
  openChoiceModal(`Um momento com ${child.name}`, `${child.name} tem ${child.age || 0} ano(s). O vínculo é construído em pequenos gestos, não apenas em grandes decisões.`, [
    { label: 'Tempo exclusivo', detail: 'Custa 6 de energia; aumenta felicidade e reduz estresse.', action: () => runAction(`child-${child.name}-time`, () => { if (!requireEnergy(6)) return; changeStat('happiness', 6); state.stress = clamp(state.stress - 3); addEvent('♡', `Você esteve com ${child.name}`, `Vocês brincaram, conversaram e criaram uma lembrança que vai atravessar esta fase.`, 'pink'); }) },
    { label: 'Apoiar um interesse', detail: 'Custa R$ 180 e 4 de energia; investe no futuro da criança.', action: () => runAction(`child-${child.name}-support`, () => { if (!requireResources(180, 4)) return; changeStat('happiness', 4); child.age = safeNumber(child.age); addEvent('✦', `Você apoiou ${child.name}`, `Um curso, livro ou equipamento adequado à idade mostrou que os sonhos de ${child.name} importam.`); }) },
    { label: 'Conversar sobre sentimentos', detail: 'Custa 3 de energia; torna a família mais aberta.', action: () => runAction(`child-${child.name}-talk`, () => { if (!requireEnergy(3)) return; changeStat('happiness', 3); state.stress = clamp(state.stress - 2); addEvent('☾', `Uma conversa importante com ${child.name}`, 'Você criou um espaço seguro para falar sobre medo, escola e expectativas.'); }) }
  ]);
}

function mentalAction(type) {
  if (state.dead) return toast('Esta vida chegou ao fim.');
  const actions = {
    support: () => { if (!requireResources(120, 4)) return; state.addictions.recovery = true; state.addictions.meetings++; ['alcohol', 'drugs', 'gambling'].forEach(key => state.addictions[key] = clamp(state.addictions[key] - 12)); state.stress = clamp(state.stress - 5); addEvent('☾', 'Você procurou apoio', 'Uma rede de cuidado ajuda a transformar recaídas em aprendizado.', 'blue'); },
    therapy: () => { if (!requireResources(180, 5)) return; state.mental.treated = true; state.mental.screenings++; state.stress = clamp(state.stress - 8); state.happiness = clamp(state.happiness + 4); addEvent('♡', 'Você iniciou acompanhamento', 'Cuidar da mente também é uma forma de coragem.', 'pink'); },
    identity: () => { if (!requireAge(12)) return; state.identity.discovered = true; openChoiceModal('Como você se reconhece?', 'Sua identidade pode ganhar novas palavras com o tempo. Não existe resposta obrigatória.', [
      { label: 'Sou uma pessoa não-binária', detail: 'Atualiza sua identidade e abre espaço para redesignação.', action: () => { state.identity.gender = 'não-binárie'; state.identity.chosenName = state.name; addEvent('✦', 'Você encontrou uma palavra para si', 'Sua identidade merece respeito e tempo.', 'pink'); } },
      { label: 'Quero explorar minha orientação', detail: 'Você registra uma descoberta íntima, sem pressa.', action: () => { state.identity.sexuality = pick(['bissexual', 'pansexual', 'homossexual', 'heterossexual']); addEvent('♡', 'Uma descoberta íntima', `Você começou a se reconhecer como ${state.identity.sexuality}.`, 'pink'); } },
      { label: 'Ainda estou descobrindo', detail: 'Tudo bem não ter certeza agora.', action: () => addEvent('☾', 'Sem pressa para se definir', 'Você escolheu respeitar seu próprio tempo.') }
    ]); },
    transition: () => { if (!state.identity.discovered) return toast('Explore sua identidade antes de decidir uma transição.'); if (!requireResources(2500, 10)) return; state.identity.transitioned = true; state.identity.gender = state.identity.gender === 'não definido' ? 'em transição' : state.identity.gender; state.happiness = clamp(state.happiness + 12); state.stress = clamp(state.stress - 10); addEvent('✦', 'Você deu um passo de afirmação', 'A transição foi planejada com acompanhamento e respeito à sua segurança.', 'pink'); },
    rename: () => { if (!state.identity.discovered) return toast('Primeiro, descubra que nome combina com você.'); const name = window.prompt('Qual nome representa você?', state.identity.chosenName || state.name); if (!name?.trim()) return; state.name = name.trim().slice(0, 80); state.identity.chosenName = state.name; addEvent('✦', 'Seu nome foi redesignado', `Agora sua história é contada como ${state.name}.`); }
  };
  if (type === 'identity') return actions.identity();
  if (type === 'transition') return runAction('identity-transition', actions.transition);
  if (type === 'rename') return runAction('identity-rename', actions.rename);
  if (type === 'support' || type === 'therapy') runAction(`mental-${type}`, actions[type]);
}
function prisonAction(type) {
  if (state.dead || !state.prisonYears) return toast('Esta ação só está disponível durante uma pena.');
  const actions = {
    protection: () => { if (!requireResources(80, 2)) return; state.prison.protection = clamp(state.prison.protection + 18); state.prison.respect = clamp(state.prison.respect + 5); addEvent('⚖', 'Você negociou proteção', 'Você estabeleceu limites e buscou segurança sem abandonar seus valores.', 'blue'); },
    work: () => { if (!requireEnergy(6)) return; state.prison.work = clamp(state.prison.work + 10); state.money += 180; state.stress = clamp(state.stress - 3); addEvent('⌂', 'Trabalho na prisão', 'Uma rotina de trabalho trouxe algum dinheiro e dignidade.', 'blue'); },
    study: () => { if (!requireEnergy(6)) return; state.prison.study = clamp(state.prison.study + 10); state.education = clamp(state.education + 4); addEvent('⌘', 'Você estudou na prisão', 'O conhecimento continua sendo uma saída possível.'); },
    riot: () => { if (Math.random() < .35) { state.prisonYears += 1; state.health = clamp(state.health - 12); addEvent('⚠', 'Uma rebelião começou', 'A confusão aumentou sua pena e deixou marcas.', 'pink'); } else { state.prison.respect = clamp(state.prison.respect + 12); state.prison.riotRisk = 0; addEvent('⚖', 'Você evitou uma rebelião', 'Sua calma protegeu outras pessoas e aumentou seu respeito.'); } }
  }; if (actions[type]) runAction(`prison-${type}`, actions[type]);
}
function socialAction(platform) {
  if (state.dead) return toast('Esta vida chegou ao fim.');
  const labels = { youtube: 'YouTube', tiktok: 'TikTok', instagram: 'Instagram', twitter: 'Twitter' }; const media = state.socialMedia[platform];
  if (!media) return;
  runAction(`social-${platform}`, () => { if (!requireAge(13) || !requireEnergy(5)) return; const viral = Math.random() < .28; const cancelled = Math.random() < .08; const gain = viral ? 500 + Math.round(state.fame * 8) : 40 + Math.round(Math.random() * 100); media.followers += cancelled ? -Math.round(media.followers * .2) : gain; media.followers = Math.max(0, media.followers); media.engagement = clamp(media.engagement + (viral ? 10 : 2) - (cancelled ? 12 : 0)); state.socialMedia.posts++; state.socialMedia.controversy = clamp(safeNumber(state.socialMedia.controversy) + (cancelled ? 12 : viral ? 1 : 0), 0, 100); state.fame = clamp(state.fame + (viral ? 8 : 2) - (cancelled ? 6 : 0)); state.stress = clamp(state.stress + (viral ? 5 : 2)); addEvent(cancelled ? '⚠' : viral ? '★' : '♧', cancelled ? `Crise no ${labels[platform]}` : viral ? `Seu post viralizou no ${labels[platform]}` : `Você publicou no ${labels[platform]}`, cancelled ? 'Uma publicação dividiu opiniões; você decidiu aprender com a responsabilidade.' : `Sua comunidade ganhou ${gain.toLocaleString('pt-BR')} novas pessoas.`, cancelled ? 'pink' : 'blue'); });
}
function celebrityAction(type) {
  const values = { book: 18000, commercial: 12000, sponsored: 4500, photoshoot: 9000 };
  if (state.dead) return toast('Esta vida chegou ao fim.');
  if (!Object.prototype.hasOwnProperty.call(values, type)) return toast('Essa oportunidade de celebridade não está disponível.');
  if (state.fame < 60 || !state.career.employed) return toast('Você precisa de pelo menos 60 de fama e uma carreira ativa.');
  runAction(`celebrity-${type}`, () => { if (!requireEnergy(6)) return; state.money += values[type]; state.reputation = clamp(state.reputation + 3); addEvent('★', 'Sua fama virou oportunidade', `Você recebeu ${money(values[type])} com um trabalho de celebridade.`, 'blue'); });
}
function lifestyleAction(type, value) {
  if (state.dead) return toast('Esta vida chegou ao fim.');
  const diets = { fastfood: ['Fast Food', 120, -3, 0], balanceada: ['Balanceada', 420, 2, 1], vegana: ['Vegana', 520, 4, 1], keto: ['Keto', 680, 3, 2] };
  if (type === 'diet') return runAction('diet', () => { const data = diets[value]; if (!data || !requireFunds(data[1])) return; state.lifestyle.diet = value; state.needs.nutrition = clamp(state.needs.nutrition + 8); state.health = clamp(state.health + data[2]); state.energy = clamp(state.energy + data[3]); addEvent('♧', `Dieta ${data[0]} escolhida`, `Sua alimentação semanal agora prioriza ${data[0].toLowerCase()}.`); });
  if (type === 'training') return runAction(`training-${value}`, () => { const costs = { cardio: 80, musculacao: 110, artesMarciais: 150 }; if (!requireResources(costs[value] || 80, 10)) return; state.lifestyle.training[value] = safeNumber(state.lifestyle.training[value]) + 8; state.hobbies.fitness = clamp(state.hobbies.fitness + 6); state.skills.atletismo = clamp(state.skills.atletismo + 3); state.health = clamp(state.health + 2); if (value === 'artesMarciais') state.lifestyle.combat = clamp(state.lifestyle.combat + 7); addEvent('♧', 'Treino focado concluído', `Sua preparação melhorou; força de combate em ${Math.round(state.lifestyle.combat)}/100.`); });
}
function buyCollectible(type) {
  const items = { cartas: ['Cartas colecionáveis', 350, '♢'], figures: ['Action figure', 900, '♙'], games: ['Videogame raro', 1400, '▣'] }; const item = items[type];
  if (!item) return; runAction(`collectible-${type}`, () => { if (!requireFunds(item[1])) return; state.collectibles.items.push({ id: state.collectibles.nextId++, name: item[0], icon: item[2], value: item[1], originalValue: item[1], condition: 'novo', bought: state.year }); addEvent('✦', 'Nova peça na coleção', `${item[0]} entrou para o seu acervo.`); });
}
function sellCollectible(id) { runAction(`sell-collectible-${id}`, () => { const index = state.collectibles.items.findIndex(item => item.id === id); if (index < 0) return; const item = state.collectibles.items.splice(index, 1)[0]; const sale = Math.round(item.value * (Math.random() < .25 ? 1.15 : .7)); state.money += sale; addEvent('↗', 'Venda no mercado usado', `Você vendeu ${item.name} por ${money(sale)}.`); }); }
function buyExoticPet(type) { const data = { tigre: ['Tigre', 9500, 7000], cobra: ['Serpente', 2200, 1800] }[type]; if (!data) return; runAction(`pet-${type}`, () => { if (!requireAge(18) || !requireFunds(data[1])) return; state.exoticPets.pets.push({ id: Date.now(), type, name: data[0], cost: data[2] }); state.stress = clamp(state.stress + 4); addEvent('⚠', 'Animal exótico adquirido', `${data[0]} exige licença, cuidado e uma manutenção muito alta.`, 'pink'); }); }
function landlordAction(type) { runAction(`landlord-${type}`, () => { if (state.landlord.evictionLock > 0) { toast(`Processo de despejo em andamento por mais ${state.landlord.evictionLock} ano(s).`); return; } if (type === 'property') { if (!requireFunds(90000)) return; const property = { id: Date.now(), name: `Imóvel ${state.landlord.properties.length + 1}` }; state.landlord.properties.push(property); addEvent('⌂', 'Novo imóvel para renda', 'Você comprou uma propriedade e pode procurar um inquilino.'); } else if (type === 'tenant') { const property = state.landlord.properties.find(p => !state.landlord.tenants.some(t => t.propertyId === p.id)); if (!property) return toast('Compre um imóvel disponível primeiro.'); state.landlord.tenants.push({ propertyId: property.id, name: pick(['Ana Souza', 'Bruno Lima', 'Carla Reis', 'Diego Alves']), rent: 1600 + Math.round(Math.random() * 900), credit: Math.round(500 + Math.random() * 400), overdue: false, vandalized: false }); addEvent('⌂', 'Inquilino selecionado', 'A análise de crédito ajudou a encontrar um novo morador.'); } else if (type === 'collect') { let total = 0; state.landlord.tenants.forEach(t => { if (!t.overdue && !t.eviction) total += safeNumber(t.rent); }); state.money += total; addEvent('↗', 'Aluguéis recebidos', `Você recebeu ${money(total)} dos seus inquilinos.`); } else if (type === 'evict') { const tenant = state.landlord.tenants.find(t => t.overdue || t.vandalized); if (!tenant) return toast('Nenhum caso grave para levar à justiça.'); state.landlord.evictionLock = 2; tenant.eviction = true; addEvent('⚖', 'Ordem de despejo protocolada', 'O processo judicial bloqueará certas ações por dois anos.', 'pink'); } }); }
function advanceYear() {
  if (state.dead) return toast('Esta vida chegou ao fim. Comece uma nova história.');
  state.age++; state.year++; state.temporal.totalMonths += 12; state.temporal.lastAdvance = state.year; const c = state.career;
  const a = state.attributes;
  a.aging = clamp((state.age - 24) * 1.15 + (state.age > 45 ? (state.age - 45) * .8 : 0));
  a.fatigue = clamp(a.fatigue + 7 + (state.stress > 65 ? 5 : 0) - (state.needs.sleep > 70 ? 8 : 0));
  a.hunger = clamp(a.hunger + 6 - (state.needs.nutrition > 65 ? 9 : 0));
  a.hydration = clamp(a.hydration - 5 + (state.needs.nutrition > 60 ? 3 : 0));
  a.mentalHealth = clamp(a.mentalHealth - (state.stress > 65 ? 5 : 1) - (a.fatigue > 70 ? 3 : 0) + (state.mental.treated ? 6 : 0));
  a.madness = clamp(a.madness + (a.mentalHealth < 30 ? 5 : 0) + (state.stress > 85 ? 3 : 0) - (state.mental.treated ? 4 : 0));
  a.fertility = clamp(a.fertility - (state.age > 35 ? 2 : 0) - (state.age > 50 ? 3 : 0));
  a.maxHp = Math.max(35, Math.round(100 - a.aging * .35));
  a.combatStrength = clamp(state.lifestyle.combat * (1 - Math.max(0, a.aging - 30) / 180) - a.fatigue * .12);
  state.energy = clamp(state.energy - a.fatigue * .08 + (a.hydration > 60 ? 3 : -4));
  a.energy = state.energy;
  state.health = Math.min(state.health, a.maxHp);
  const wasInPrison = state.prisonYears > 0;
  if (wasInPrison) state.prisonYears = Math.max(0, state.prisonYears - 1);
  const income = c.employed && state.prisonYears === 0 && !wasInPrison ? c.salary * 12 : 0;
  const dietCosts = { fastfood: 120, balanceada: 420, vegana: 520, keto: 680 };
  const petCosts = state.exoticPets.pets.reduce((sum, pet) => sum + safeNumber(pet.cost), 0);
  const rentIncome = state.landlord.tenants.reduce((sum, tenant) => sum + (!tenant.overdue && !tenant.eviction ? safeNumber(tenant.rent) : 0), 0);
  const expenses = Math.round(state.finances.expenses * 12 * (1 + state.age / 500)) + dietCosts[state.lifestyle.diet] * 12 + petCosts + state.lifestyle.training.musculacao * 2;
  state.collectibles.items.forEach(item => { const shift = item.condition === 'novo' ? (Math.random() < .55 ? 1.04 : .96) : (Math.random() < .35 ? 1.12 : .91); item.value = Math.max(25, Math.round(safeNumber(item.value, 25) * shift)); item.condition = item.value >= safeNumber(item.originalValue, item.value) * 1.15 ? 'valorizado' : item.value < safeNumber(item.originalValue, item.value) * .75 ? 'usado' : item.condition; });
  const investmentReturn = state.finances.investments * ((Math.random() * .12) - .03);
  state.finances.investments = Math.max(0, state.finances.investments + investmentReturn);
  const balanceBeforeDebt = state.money + income + rentIncome - expenses;
  if (state.landlord.evictionLock > 0) {
    state.landlord.evictionLock--;
    if (state.landlord.evictionLock === 0) {
      const completed = state.landlord.tenants.filter(tenant => tenant.eviction);
      completed.forEach(tenant => { state.landlord.tenants = state.landlord.tenants.filter(current => current !== tenant); addEvent('⚖', 'Despejo concluído', `${tenant.name} deixou o imóvel após a decisão judicial.`); });
    }
  }
  state.landlord.tenants.forEach(tenant => { if (tenant.eviction) return; if (tenant.overdue) tenant.credit = clamp(safeNumber(tenant.credit) - 25, 0, 900); if (Math.random() < .18) { tenant.overdue = true; tenant.credit = clamp(safeNumber(tenant.credit) - 20, 0, 900); } else if (tenant.overdue && Math.random() < .35) { tenant.overdue = false; tenant.credit = clamp(safeNumber(tenant.credit) + 18, 0, 900); } if (Math.random() < .08) tenant.vandalized = true; });
  const petAccident = state.exoticPets.pets.length && Math.random() < Math.min(.45, state.exoticPets.pets.length * .12);
  if (petAccident) { state.exoticPets.accidents++; state.health = clamp(state.health - 8); addEvent('⚠', 'Acidente doméstico', 'Um animal exótico causou um incidente; o atendimento foi caro.', 'pink'); }
  const deficit = Math.max(0, -balanceBeforeDebt);
  state.money = Math.max(0, balanceBeforeDebt);
  if (petAccident) state.money = Math.max(0, state.money - 1800);
  if (deficit) { state.finances.debt += deficit; state.credit = clamp(state.credit - 35, 0, 900); }
  else { state.finances.debt = Math.max(0, state.finances.debt - Math.min(state.finances.debt, income * .05)); state.credit = clamp(state.credit + 8, 0, 900); }
  const agePenalty = state.age > 70 ? 2.5 : state.age > 45 ? 1 : .25;
  const biologicalWear = (a.fatigue > 70 ? 2 : 0) + (a.hydration < 35 ? 2 : 0) + (a.hunger > 70 ? 2 : 0);
  state.stress = clamp(state.stress + a.madness * .03);
  state.health = clamp(Math.min(a.maxHp, state.health - agePenalty - biologicalWear - (a.madness > 70 ? 1 : 0) - (state.stress > 70 ? 1.5 : 0)));
  state.reputation = clamp(state.reputation + (state.karma >= 70 ? 1 : state.karma <= 30 ? -1 : 0));
  changeStat('happiness', deficit ? -6 : state.money > expenses ? 1 : -1);
  state.stress = clamp(state.stress + 3 + (deficit ? 5 : 0) - (state.trait === 'espiritual' ? 2 : 0));
  const addictionKeys = ['alcohol', 'drugs', 'gambling'];
  addictionKeys.forEach(key => {
    const risk = safePercent(state.addictions[key]);
    if (state.addictions.recovery) state.addictions[key] = clamp(risk - 8);
    else if (risk >= 35) { state.addictions[key] = clamp(risk + 4); state.stress = clamp(state.stress + 4); state.health = clamp(state.health - 2); }
  });
  if (state.addictions.recovery && addictionKeys.every(key => state.addictions[key] < 15)) state.addictions.recovery = false;
  if (state.stress >= 75 && !state.mental.diagnoses.includes('ansiedade')) { state.mental.diagnoses.push('ansiedade'); addEvent('☾', 'Seu corpo pediu atenção', 'O estresse persistente foi reconhecido como ansiedade; acompanhamento pode ajudar.', 'pink'); }
  if (state.happiness <= 30 && !state.mental.diagnoses.includes('depressão')) { state.mental.diagnoses.push('depressão'); addEvent('☾', 'Você recebeu um alerta de cuidado', 'Sua felicidade baixa merece acolhimento, apoio e acompanhamento profissional.', 'pink'); }
  if (state.mental.treated) { state.stress = clamp(state.stress - 5); state.happiness = clamp(state.happiness + 2); }
  if (state.identity.discovered) { state.stress = clamp(state.stress - 1); state.happiness = clamp(state.happiness + 1); }
  const totalFollowers = ['youtube', 'tiktok', 'instagram', 'twitter'].reduce((sum, key) => sum + state.socialMedia[key].followers, 0);
  if (totalFollowers > 0) {
    const annualGrowth = state.socialMedia.controversy > 40 ? .92 : 1 + Math.min(.25, state.fame / 500);
    ['youtube', 'tiktok', 'instagram', 'twitter'].forEach(key => { state.socialMedia[key].followers = Math.max(0, Math.round(state.socialMedia[key].followers * annualGrowth)); state.socialMedia[key].engagement = clamp(state.socialMedia[key].engagement + (state.socialMedia.controversy > 40 ? -3 : 1)); });
    state.socialMedia.controversy = clamp(state.socialMedia.controversy - 5);
    state.fame = clamp(state.fame + (totalFollowers > 10000 ? 3 : 1) - (state.socialMedia.controversy > 40 ? 2 : 0));
  }
  if (state.fame >= 60 && c.employed) { const brandIncome = Math.round(state.fame * 18); state.money += brandIncome; addEvent('★', 'A fama trouxe renda', `Marcas pagaram ${money(brandIncome)} por sua visibilidade.`, 'blue'); }
  const dietEffect = { fastfood: -2, balanceada: 1, vegana: 2, keto: 1 }[state.lifestyle.diet] || 0;
  state.health = clamp(state.health + dietEffect); state.energy = clamp(state.energy + (state.age < 30 ? 2 : -3) + (state.lifestyle.diet === 'keto' || state.lifestyle.diet === 'vegana' ? 2 : 0));
  if (a.combatStrength >= 35 && Math.random() < .2) { state.reputation = clamp(state.reputation + 2); addEvent('⚖', 'Você evitou um conflito', 'Seu treinamento ajudou a resolver uma situação tensa sem violência.'); }
  if (Math.random() < .12) { const protectedByTraining = a.combatStrength >= 50; if (protectedByTraining) { state.reputation = clamp(state.reputation + 1); addEvent('⚖', 'Você evitou um assalto', 'Sua postura e treinamento fizeram o ladrão desistir antes do confronto.'); } else { const stolen = Math.min(state.money, 250 + Math.round(Math.random() * 750)); state.money -= stolen; state.stress = clamp(state.stress + 6); addEvent('⚠', 'Você sofreu um assalto', `Você perdeu ${money(stolen)}; procure apoio e evite se colocar em risco.`, 'pink'); } }
  state.needs.sleep = clamp(state.needs.sleep - 5 + (state.energy > 60 ? 4 : 0));
  state.needs.social = clamp(state.needs.social - 3 + (state.relationships.length ? 2 : 0));
  state.needs.nutrition = clamp(state.needs.nutrition - 2 + (state.money > expenses ? 3 : 0));
  state.needs.purpose = clamp(state.needs.purpose + (c.employed ? 2 : -4));
  const neglectedNeeds = Object.values(state.needs).filter(value => value < 30).length;
  if (neglectedNeeds) { state.stress = clamp(state.stress + neglectedNeeds * 4); state.health = clamp(state.health - neglectedNeeds * 2); }
  state.relationships.forEach(person => { person.affinity = clamp(person.affinity - (Math.random() < .4 ? 2 : 0)); });
  state.children.forEach(child => { child.age = safeNumber(child.age) + 1; });
  if (c.employed) {
    c.skill = clamp(c.skill + (state.education > 70 ? 4 : 2));
    c.satisfaction = clamp((c.satisfaction || 70) + (c.remote ? 1 : -1) - (state.stress > 70 ? 3 : 0));
    if (Math.random() < .3 && c.level < 10) { c.level++; c.salary = Math.round(c.salary * 1.08); addEvent('↗', 'Uma promoção chegou', `Seu salário agora é ${money(c.salary)} por mês.`, 'blue'); }
  }
  if (state.age >= 45 && Math.random() < .08 && !state.healthConditions.includes('pressão alta')) state.healthConditions.push('pressão alta');
  const event = yearlyEvent(); addEvent(event.icon, event.title, event.text, event.cls);
  if (wasInPrison) addEvent('⚖', 'Um ano difícil', state.prisonYears ? `Você cumpriu mais um ano de prisão. Restam ${state.prisonYears}.` : 'Você cumpriu sua pena e está tentando reconstruir a vida.', 'pink');
  state.history.push({ year: state.year, age: state.age, money: Math.round(state.money), career: c.title });
  const reachedLimit = state.age >= 105;
  const healthFailure = state.health <= 0;
  const lateLifeRisk = state.age >= 92 && Math.random() < .15;
  if (healthFailure || lateLifeRisk || reachedLimit) {
    state.dead = true;
    state.deathCause = healthFailure ? 'complicações de saúde' : reachedLimit ? 'idade avançada' : 'fim natural da jornada';
    addEvent('☾', 'O fim de uma jornada', `Sua história terminou por ${state.deathCause}, mas seu legado permanece.`, 'pink');
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
  if (type === 'learn') return educationMenu();
  if (type === 'social') {
    if (!state.relationships.length) return toast('Você ainda não tem ninguém para convidar.');
    return openChoiceModal('Como você quer se conectar?', 'Uma conversa pode fortalecer um vínculo diferente de uma festa ou de uma ajuda concreta.', state.relationships.map(p => ({ label: `${p.name} · ${p.affinity}/100`, detail: 'R$ 80 e 8 de energia; aumenta afinidade e felicidade.', action: () => runAction(`quick-social-${p.id}`, () => { if (!requireResources(80, 8)) return; p.affinity = clamp(p.affinity + 8); changeStat('happiness', 5); changeStat('reputation', 2); addEvent('♧', `Uma noite memorável com ${p.name}`, 'Você escolheu presença em vez de rotina.', 'pink'); }) })));
  }
  const actions = {
    explore: ['Uma descoberta inesperada', 'Escolha entre uma experiência cultural, uma aventura ou uma oportunidade que exige coragem.', () => openChoiceModal('O que você encontrou?', 'Nem toda descoberta custa dinheiro; algumas cobram atenção e risco.', [
      { label: 'Visitar uma livraria', detail: 'R$ 45 e 6 energia; aumenta educação e felicidade.', action: () => runAction('quick-explore-book', () => { if (!requireResources(45, 6)) return; state.education = clamp(state.education + 2); changeStat('happiness', 4); addEvent('⌁', 'Uma nova descoberta', 'Um livro raro abriu uma pergunta que você ainda quer responder.'); }) },
      { label: 'Trilha improvisada', detail: '4 energia; melhora saúde, mas exige preparo.', action: () => runAction('quick-explore-trail', () => { if (!requireEnergy(4)) return; state.health = clamp(state.health + 2); state.stress = clamp(state.stress - 4); addEvent('♧', 'Você saiu da rota', 'O corpo lembrou que curiosidade também pode ser movimento.', 'blue'); }) },
      { label: 'Aceitar um risco', detail: 'Sem custo; pode trazer dinheiro ou estresse.', action: () => runAction('quick-explore-risk', () => { if (Math.random() < .55) { state.money += 350; addEvent('↗', 'Uma oportunidade inesperada', 'Sua curiosidade rendeu um pequeno trabalho.'); } else { state.stress = clamp(state.stress + 8); addEvent('⚠', 'Uma descoberta desconfortável', 'Você aprendeu a avaliar melhor os riscos antes de dizer sim.'); } }) }
    ])],
    rest: ['Pausa merecida', 'Escolha como recuperar seu corpo e sua mente.', () => openChoiceModal('Como descansar?', 'Descanso não é igual para todo mundo.', [
      { label: 'Dormir sem culpa', detail: 'Recupera 20 energia e reduz 8 estresse.', action: () => runAction('quick-rest-sleep', () => { state.stress = clamp(state.stress - 8); state.energy = clamp(state.energy + 20); changeStat('happiness', 3); addEvent('☾', 'Você dormiu de verdade', 'Seu corpo recebeu o tempo que vinha pedindo.'); }) },
      { label: 'Desacelerar com alguém', detail: '4 energia; reduz estresse e fortalece relações.', action: () => runAction('quick-rest-social', () => { if (!state.relationships.length || !requireEnergy(4)) return; const p = pick(state.relationships); p.affinity = clamp(p.affinity + 4); state.stress = clamp(state.stress - 10); addEvent('♡', `Um descanso compartilhado com ${p.name}`, 'Você não precisou resolver nada: só estar presente.'); }) }
    ])]
  }; const action = actions[type]; if (action) openModal(action[0], action[1], action[2]);
}
function needsAction(type) {
  if (state.dead) return toast('Esta vida chegou ao fim.');
  const actions = {
    sleep: () => { state.needs.sleep = clamp(state.needs.sleep + 24); state.energy = clamp(state.energy + 16); state.stress = clamp(state.stress - 8); addEvent('☾', 'Você cuidou do descanso', 'Uma pausa de verdade devolveu espaço para o próximo passo.'); },
    social: () => { if (!state.relationships.length) return toast('Conheça alguém para criar conexões.'); const person = pick(state.relationships); person.affinity = clamp(person.affinity + 7); state.needs.social = clamp(state.needs.social + 22); state.happiness = clamp(state.happiness + 4); addEvent('♡', `Você se conectou com ${person.name}`, 'Uma conversa simples fez o dia parecer mais leve.', 'pink'); },
    nutrition: () => { if (!requireResources(45, 2)) return; state.needs.nutrition = clamp(state.needs.nutrition + 25); state.health = clamp(state.health + 2); addEvent('♧', 'Uma refeição cuidadosa', 'Você escolheu alimentar seu corpo com atenção.'); },
    purpose: () => { if (!requireEnergy(5)) return; state.needs.purpose = clamp(state.needs.purpose + 20); state.education = clamp(state.education + 1); state.happiness = clamp(state.happiness + 3); addEvent('✦', 'Um pequeno sentido', 'Você reservou tempo para algo que importa de verdade.'); }
  };
  if (actions[type]) { runAction(`need-${type}`, actions[type]); render(); }
}
function hobbyAction(type) {
  if (state.dead) return toast('Esta vida chegou ao fim.');
  const actions = {
    music: () => {
      if (!requireAge(8) || !requireResources(25, 8)) return;
      state.hobbies.music = clamp(state.hobbies.music + 8);
      state.skills.criatividade = clamp(state.skills.criatividade + 2);
      state.needs.social = clamp(state.needs.social + 3);
      state.needs.purpose = clamp(state.needs.purpose + 2);
      changeStat('happiness', 2);
      addEvent('♫', 'Você praticou música', 'Uma sessão de prática transformou curiosidade em repertório e expressão.', 'blue');
    },
    fitness: () => {
      if (!requireAge(12) || !requireResources(30, 12)) return;
      state.hobbies.fitness = clamp(state.hobbies.fitness + 8);
      state.skills.atletismo = clamp(state.skills.atletismo + 3);
      state.health = clamp(state.health + 3);
      state.stress = clamp(state.stress - 4);
      state.needs.sleep = clamp(state.needs.sleep + 2);
      addEvent('♧', 'Você treinou com intenção', 'Seu corpo ganhou força e a rotina ficou um pouco mais leve.', 'blue');
    },
    creativity: () => {
      if (!requireAge(6) || !requireEnergy(10)) return;
      state.hobbies.creativity = clamp(state.hobbies.creativity + 8);
      state.skills.criatividade = clamp(state.skills.criatividade + 3);
      state.needs.purpose = clamp(state.needs.purpose + 5);
      changeStat('happiness', 3);
      addEvent('✎', 'Você criou algo novo', 'O resultado não precisava ser perfeito: precisava existir.', 'pink');
    }
  };
  if (!actions[type]) return;
  const before = state.events[0];
  runAction(`hobby-${type}`, actions[type]);
  render();
  if (state.events[0] !== before) toast('Hobby praticado — seu progresso foi salvo.');
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
function careerMenu() {
  if (state.dead) return toast('Esta vida chegou ao fim. Comece uma nova história.');
  const c = state.career;
  openChoiceModal('Próximo passo profissional', c.employed ? `${c.title} · ${money(c.salary)}/mês · satisfação ${c.satisfaction || 70}/100` : 'Você está entre oportunidades. Escolhas pequenas podem reconstruir sua trajetória.', [
    { label: 'Negociar salário', detail: '6 energia; chance de ganhar 12% ou perder satisfação.', action: () => runAction('career-negotiate', () => { if (!c.employed || !requireEnergy(6)) return; if (c.skill >= 65 || Math.random() < .6) { c.salary = Math.round(c.salary * 1.12); c.satisfaction = clamp((c.satisfaction || 70) + 5); addEvent('↗', 'Negociação bem-sucedida', `Seu salário subiu para ${money(c.salary)} por mês.`, 'blue'); } else { c.satisfaction = clamp((c.satisfaction || 70) - 8); state.stress = clamp(state.stress + 8); addEvent('⚠', 'A negociação não avançou', 'Você saiu da conversa com mais clareza, mas sem aumento.'); } }) },
    { label: 'Desenvolver uma habilidade', detail: 'R$ 180 e 10 energia; melhora sua competitividade.', action: () => runAction('career-training', () => { if (!c.employed || !requireResources(180, 10)) return; c.skill = clamp(c.skill + 6); state.skills.liderança = clamp(state.skills.liderança + 3); c.satisfaction = clamp((c.satisfaction || 70) + 3); addEvent('⌘', 'Você investiu na carreira', `Sua prontidão profissional chegou a ${Math.round(c.skill)}/100.`); }) },
    { label: c.remote ? 'Voltar ao escritório' : 'Trabalhar remotamente', detail: '4 energia; altera satisfação e rotina.', action: () => runAction('career-remote', () => { if (!c.employed || !requireEnergy(4)) return; c.remote = !c.remote; c.satisfaction = clamp((c.satisfaction || 70) + (c.remote ? 7 : -2)); state.stress = clamp(state.stress + (c.remote ? -5 : 3)); addEvent('⌂', c.remote ? 'Você adotou uma rotina remota' : 'Você voltou ao escritório', 'Sua forma de trabalhar agora tem novas exigências e liberdades.'); }) },
    { label: c.employed ? 'Pedir demissão' : 'Aceitar uma oportunidade', detail: c.employed ? 'Sem custo; liberdade agora, mas renda zero até se recolocar.' : '6 energia; cursos concluídos podem abrir uma área especializada.', action: () => runAction('career-change', () => { if (c.employed) { c.employed = false; c.title = 'Em transição'; c.company = '—'; c.salary = 0; c.satisfaction = 55; addEvent('↗', 'Você encerrou um ciclo profissional', 'Agora terá de equilibrar liberdade, dinheiro e o próximo passo.'); } else if (requireAge(16) && requireEnergy(6)) { const completed = new Set((state.educationHistory || []).map(course => course.id)); const opportunity = completed.has('direito') ? ['Consultor(a) jurídico(a)', 'Núcleo Cívico', 7200] : completed.has('medicina') ? ['Pesquisador(a) em saúde', 'Instituto Horizonte', 8600] : completed.has('mba') ? ['Gestor(a) de negócios', 'Coletivo Horizonte', 7800] : completed.has('artes') ? ['Produtor(a) cultural', 'Casa Aberta', 6100] : ['Analista de projetos', 'Coletivo Horizonte', 4200 + state.education * 12]; c.employed = true; c.title = opportunity[0]; c.company = opportunity[1]; c.salary = opportunity[2]; c.level = Math.max(1, c.level); c.skill = clamp(c.skill + 5); c.satisfaction = 70; addEvent('↗', 'Você voltou ao mercado', `${c.title} começa com ${money(c.salary)} por mês em ${c.company}.`, 'blue'); } }) }
  ]);
}
function setupBindings() {
  $$('.nav-item').forEach(button => button.onclick = () => { const view = $(`#${button.dataset.section}View`); if (!view) return toast('Esta área ainda está sendo preparada.'); $$('.nav-item').forEach(b => b.classList.remove('active')); button.classList.add('active'); $$('.section-view').forEach(section => section.classList.add('hidden')); view.classList.remove('hidden'); });
  $$('.action-grid button').forEach(button => button.onclick = () => quickAction(button.dataset.action));
  $$('.activity-grid button').forEach(button => button.onclick = () => activity(button.dataset.game));
  $$('[data-need]').forEach(button => button.onclick = () => needsAction(button.dataset.need));
  $$('[data-hobby]').forEach(button => button.onclick = () => hobbyAction(button.dataset.hobby));
  $$('[data-mental-action]').forEach(button => button.onclick = () => { mentalAction(button.dataset.mentalAction); render(); });
  $$('[data-prison-action]').forEach(button => button.onclick = () => { prisonAction(button.dataset.prisonAction); render(); });
  $$('[data-social-platform]').forEach(button => button.onclick = () => { socialAction(button.dataset.socialPlatform); render(); });
  $$('[data-celebrity-action]').forEach(button => button.onclick = () => { celebrityAction(button.dataset.celebrityAction); render(); });
  $$('[data-diet]').forEach(button => button.onclick = () => { lifestyleAction('diet', button.dataset.diet); render(); });
  $$('[data-training]').forEach(button => button.onclick = () => { lifestyleAction('training', button.dataset.training); render(); });
  $$('[data-buy-collectible]').forEach(button => button.onclick = () => { buyCollectible(button.dataset.buyCollectible); render(); });
  $$('[data-buy-pet]').forEach(button => button.onclick = () => { buyExoticPet(button.dataset.buyPet); render(); });
  $$('[data-landlord]').forEach(button => button.onclick = () => { landlordAction(button.dataset.landlord); render(); });
  const ageBtn = $('#ageBtn'); if (ageBtn) ageBtn.onclick = () => openModal('Virar um ano', 'O tempo passa, suas contas são processadas e as relações mudam. Quer descobrir o próximo capítulo?', advanceYear, 'Avançar');
  const jobBtn = $('#jobBtn'); if (jobBtn) jobBtn.onclick = careerMenu;
  const meetBtn = $('#meetBtn'); if (meetBtn) meetBtn.onclick = () => activity('dating');
  const childBtn = $('#childBtn'); if (childBtn) childBtn.onclick = () => openModal('Planejar família', 'Ter um filho exige estabilidade, cuidado e disponibilidade emocional. O custo inicial é de R$ 1.500.', () => runAction('family-child', () => { if (!requireAge(18) || !state.partnerId || state.attributes.fertility < 20 || !requireResources(1500, 12)) { if (!state.partnerId && state.age >= 18) toast('Você precisa de um parceiro para planejar esta família.'); else if (state.attributes.fertility < 20) toast('Sua fertilidade está baixa; considere acompanhamento médico.'); return; } const child = { name: pick(['Luna', 'Theo', 'Clara', 'Miguel', 'Sofia']), age: 0, adopted: false }; state.children.push(child); changeStat('happiness', 8); addEvent('♡', 'Uma nova vida chegou', `${child.name} agora faz parte da sua família.`, 'pink'); }), 'Confirmar');
  const adoptBtn = $('#adoptBtn'); if (adoptBtn) adoptBtn.onclick = () => openModal('Considerar adoção', 'A adoção custa R$ 4.000 em preparação e acompanhamento. Você poderá oferecer um lar a uma criança.', () => runAction('family-adopt', () => { if (!requireAge(21) || !requireResources(4000, 16)) return; const child = { name: pick(['Bia', 'Davi', 'Nina', 'Ravi']), age: 2, adopted: true }; state.children.push(child); changeStat('happiness', 10); addEvent('♡', 'Adoção concluída', `${child.name} encontrou um lar com você.`, 'pink'); }), 'Iniciar processo');
  const quoteBtn = $('#newQuote'); if (quoteBtn) quoteBtn.onclick = () => { const q = pick([['O futuro pertence a quem acredita na beleza de seus sonhos.', '— Eleanor Roosevelt'], ['Não conte os dias, faça os dias contarem.', '— Muhammad Ali'], ['Tudo parece impossível até que seja feito.', '— Nelson Mandela']]); $('#quote').textContent = q[0]; $('#quote').nextElementSibling.textContent = q[1]; toast('Nova reflexão encontrada'); };
  const settingsBtn = $('#settingsBtn'); if (settingsBtn) settingsBtn.onclick = () => toast('Seu progresso está salvo neste dispositivo.');
  const closeModalBtn = $('#closeModal'); if (closeModalBtn) closeModalBtn.onclick = closeModal;
  $$('[data-modal]').forEach(button => button.onclick = () => button.dataset.modal === 'study' ? educationMenu() : modalAction(button.dataset.modal));
  $$('[data-course]').forEach(button => button.onclick = () => educationMenu(button.dataset.course));
  const avatarBtn = $('#avatarBtn'); if (avatarBtn) avatarBtn.onclick = () => { const vida = $('[data-section="vida"]'); if (vida) vida.click(); toast(`${state.name} · ${state.age} anos · ${state.city}`); };
  const filterBtn = $('#vidaView .timeline-panel .filter-btn'); if (filterBtn) { filterBtn.onclick = () => { state.eventsOldest = !state.eventsOldest; renderEvents(); filterBtn.textContent = state.eventsOldest ? 'Mais recentes⌄' : 'Mais antigos⌄'; saveState(); }; }
  const manageBtn = $('#patrimonioView .panel-title .filter-btn'); if (manageBtn) manageBtn.onclick = () => openChoiceModal('Gerenciar patrimônio', 'Escolha uma decisão financeira para este momento.', [{ label: 'Investir dinheiro', detail: 'Aplique R$ 500.', action: () => modalAction('invest') }, { label: 'Planejar uma viagem', detail: 'Uma experiência de R$ 4.200.', action: () => modalAction('travel') }]);
  const newLife = $('#newLife'); if (newLife) newLife.onclick = () => $('#customizer')?.classList.remove('hidden'); const closeCreator = $('#closeCreator'); if (closeCreator) closeCreator.onclick = () => $('#customizer')?.classList.add('hidden');
  $$('.appearance-options button').forEach(button => button.onclick = () => { $$('.appearance-options button').forEach(b => b.classList.remove('selected')); button.classList.add('selected'); });
  const createLifeBtn = $('#createLife'); if (createLifeBtn) createLifeBtn.onclick = createLife;
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
  const value = selector => $(selector)?.value?.trim() || ''; const name = value('#newName').slice(0, 28) || 'Alex'; const city = value('#newCity').slice(0, 28) || 'São Paulo';
  const previous = state;
  const liquidLegacy = Math.max(0, safeNumber(previous.money) + safeNumber(previous.finances?.investments) - safeNumber(previous.finances?.debt));
  const inheritance = previous.dead ? Math.round(liquidLegacy * .15) : 0;
  const archive = { name: previous.name, age: previous.age, year: previous.year, city: previous.city, country: previous.country, career: previous.career.title, money: Math.round(previous.money), cause: previous.dead ? (previous.deathCause || 'fim da vida') : 'nova jornada' };
  const fresh = initialState(); state = { ...fresh, name, city, pronouns: value('#newPronouns') || fresh.pronouns, country: value('#newCountry') || fresh.country, talent: value('#newTalent') || fresh.talent, trait: value('#newTrait') || fresh.trait, age: 0, year: 2026, money: inheritance, happiness: 75, health: 85, reputation: 10, stress: 25, generations: [...(previous.generations || []), archive].slice(-12), career: { title: 'Sem profissão', company: '—', salary: 0, level: 0, skill: 20, employed: false }, relationships: [] };
  state.avatar = $('.appearance-options .selected')?.textContent || name.slice(0, 2).toUpperCase(); state.skills[state.talent] = clamp((state.skills[state.talent] || 50) + 15); state.events = [{ icon: '✦', cls: '', title: 'Você nasceu', text: inheritance ? `Uma nova história começou com uma herança de ${money(inheritance)}.` : `Uma nova história começou em ${city}, ${state.country}.`, time: 'Agora' }];
  $('#customizer')?.classList.add('hidden'); render(); toast(`✦ Nova vida criada: ${name}`);
}
setupBindings(); render();
