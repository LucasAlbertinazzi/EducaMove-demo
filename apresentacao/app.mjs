import { initialState } from './data.mjs?v=20261014-3';
import { activateLicense, approveMunicipality, calculateReimbursement, changeNotice, decideRequest, filterRequests, issueLicense, money, parseMoney, registerSettlement, replaceStudentDocument, reportCsv, saveNotice, submitRequest } from './domain.mjs?v=20261014-3';
import { catalog, renderCatalog } from './catalog.mjs?v=20261014-3';
import { renderPrefeitura, requestResults } from './prefeitura.mjs?v=20261014-3';
import { renderGestao } from './gestao.mjs?v=20261014-3';
import { renderEstudante } from './estudante.mjs?v=20261013-1';
import { initializeTheme } from './theme.mjs?v=20261013-1';

let state = initialState();
const ui = { role: 'prefeitura', view: 'dashboard', adminRole: 'administrator', search: '', status: '', month: '2026-10', selectedRequest: null, managementCity: 'ribeirao', managementView: 'municipalities', studentTab: 'home', attendanceFilter: 'all', editNotice: null, catalogRole: 'prefeitura', catalogIndex: 0, chapter: null };
const workspace = document.getElementById('demo-workspace');
const catalogRoot = document.getElementById('screen-catalog');
const chapters = [...document.querySelectorAll('[data-chapter]')];
const chapterNames = ['Plataformas', 'Atualizações entregues', 'Experimente', 'Telas e funções', 'Segurança', 'Disponibilidade'];
let toastTimer;

function toast(message) {
  const box = document.getElementById('toast');
  box.textContent = message;
  box.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { box.hidden = true; }, 5500);
}

function render(focus = false) {
  workspace.innerHTML = ({ prefeitura: renderPrefeitura, gestao: renderGestao, estudante: renderEstudante })[ui.role](state, ui);
  document.querySelectorAll('[data-role]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.role === ui.role)));
  if (focus) {
    const heading = workspace.querySelector('h3');
    if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
  }
}

function renderScreens() { catalogRoot.innerHTML = renderCatalog(ui.catalogRole, ui.catalogIndex); }
function setRole(role) { if (['prefeitura', 'gestao', 'estudante'].includes(role)) { ui.role = role; render(true); } }
function setStudent(tab) { ui.studentTab = tab; setRole('estudante'); }
function selectedCity(id) { return state.municipalities.find(city => city.id === id); }
function replaceCity(city) { state.municipalities = state.municipalities.map(item => item.id === city.id ? city : item); }
function requestInMunicipality(id) { return state.requests.find(item => item.id === id && item.municipality === state.municipality); }
function requireAdmin() { if (ui.adminRole !== 'administrator') throw new Error('Esta alteração depende do perfil Administrador.'); }

function confirmFrequency() {
  const box = document.createElement('dialog'); box.className = 'sample-dialog';
  box.innerHTML = '<h3>Confirmar frequência de exemplo</h3><p>Arquivo: frequencia_outubro_demo.pdf<br>Competência: outubro de 2026.</p><p>O app integrado permite conferir o PDF antes de enviar. Aqui o documento é fictício e nenhum arquivo é selecionado no aparelho.</p><div class="actions"><button type="button" class="button secondary" data-action="close-document-dialog">Cancelar</button><button type="button" class="button primary" data-action="send-attendance">Confirmar envio de exemplo</button></div>';
  box.addEventListener('close', () => box.remove()); document.body.append(box); box.showModal();
}

function navigateExperience() {
  if (ui.chapter !== null) showChapter(2);
  document.getElementById('experimente').scrollIntoView({ block: 'start', behavior: 'smooth' });
}

function showChapter(index) {
  ui.chapter = Math.min(Math.max(index, 0), chapters.length - 1);
  document.body.classList.add('presenting');
  chapters.forEach((chapter, i) => chapter.classList.toggle('current-chapter', i === ui.chapter));
  document.getElementById('presentation-bar').hidden = false;
  document.getElementById('chapter-label').textContent = `${ui.chapter + 1} / ${chapters.length} · ${chapterNames[ui.chapter]}`;
  document.querySelector('[data-action="previous-chapter"]').disabled = ui.chapter === 0;
  document.querySelector('[data-action="next-chapter"]').disabled = ui.chapter === chapters.length - 1;
  document.getElementById('presentation-toggle').textContent = 'Sair da apresentação';
  document.getElementById('presentation-toggle').setAttribute('aria-pressed', 'true');
  window.scrollTo({ top: 0 });
}

function exitPresentation() {
  const index = ui.chapter;
  ui.chapter = null;
  document.body.classList.remove('presenting');
  chapters.forEach(chapter => chapter.classList.remove('current-chapter'));
  document.getElementById('presentation-bar').hidden = true;
  document.getElementById('presentation-toggle').textContent = 'Modo apresentação';
  document.getElementById('presentation-toggle').setAttribute('aria-pressed', 'false');
  if (index !== null) chapters[index].scrollIntoView({ block: 'start' });
}

function downloadCsv() {
  if (!['administrator', 'reports'].includes(ui.adminRole)) throw new Error('A exportação exige o perfil Administrador ou Relatórios.');
  const items = filterRequests(state.requests, { municipality: state.municipality });
  const blob = new Blob([reportCsv(items)], { type: 'text/csv;charset=utf-8' });
  const href = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = href;
  link.download = `educamov-demo-${state.municipality}-2026-10.csv`;
  document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(href), 1000);
  toast('CSV gerado somente com os registros fictícios deste município.');
}

const actions = {
  reset() {
    state = initialState();
    Object.assign(ui, { role: 'prefeitura', view: 'dashboard', adminRole: 'administrator', search: '', status: '', month: '2026-10', selectedRequest: null, managementCity: 'ribeirao', managementView: 'municipalities', studentTab: 'home', attendanceFilter: 'all', editNotice: null });
    render(true); toast('Demonstração reiniciada. Os exemplos criados foram apagados.');
  },
  'view-requests'() { ui.view = 'requests'; render(true); },
  'start-student'() { setStudent('attendance'); },
  'show-student-result'() { setStudent('reimbursement'); },
  'open-prefeitura'() { setRole('prefeitura'); },
  'open-management'() { setRole('gestao'); },
  'open-attendance'() { setStudent('attendance'); },
  'open-reimbursement'() { setStudent('reimbursement'); },
  'open-renewal'() { setStudent('renewal'); },
  'open-student-security'() { setStudent('security'); },
  'open-access'() { setStudent('access'); },
  'confirm-attendance': confirmFrequency,
  'close-document-dialog'(target) { target.closest('dialog')?.close(); },
  'send-attendance'(target) {
    target.closest('dialog')?.close();
    if (!state.periods[state.municipality].open) throw new Error('O recebimento desta competência está encerrado.');
    const request = state.requests.find(item => item.studentId === 'demo-student' && item.municipality === state.municipality);
    if (request && ['in_review', 'pending'].includes(request.status)) state = replaceStudentDocument(state, 'frequency');
    state.attendances[state.municipality] = true; render(true); toast('Frequência fictícia recebida. Agora acompanhe o reembolso.');
  },
  'replace-student-document'(target) { state = replaceStudentDocument(state, target.dataset.kind); render(true); toast('Documento de exemplo substituído e devolvido à análise.'); },
  'attendance-filter'(target) { ui.attendanceFilter = target.dataset.filter; render(); },
  'toggle-push'() { state.pushPreferences[state.municipality] = !state.pushPreferences[state.municipality]; render(); toast('Preferência demonstrativa atualizada. Nenhuma permissão do navegador foi solicitada.'); },
  'read-notice'(target) { state = changeNotice(state, target.dataset.id, 'read'); render(); toast('Comunicado marcado como lido na prévia.'); },
  'edit-notice'(target) { requireAdmin(); ui.editNotice = target.dataset.id; render(); workspace.querySelector('input[name="title"]')?.focus(); },
  'cancel-notice'(target) { state = changeNotice(state, target.dataset.id, 'cancel', ui.adminRole); if (ui.editNotice === target.dataset.id) ui.editNotice = null; render(); toast('Agendamento fictício cancelado.'); },
  'publish-notice'(target) { state = changeNotice(state, target.dataset.id, 'publish', ui.adminRole); ui.editNotice = null; render(); toast('Comunicado publicado na prévia do estudante.'); },
  'send-renewal'() { state.renewal = 'in_review'; render(true); toast('Matrícula fictícia enviada para análise.'); },
  'toggle-biometric'() { state.biometricDemo = !state.biometricDemo; render(); toast('Preferência visual atualizada. Nenhuma biometria foi usada.'); },
  'toggle-period'() { requireAdmin(); state.periods[state.municipality].open = !state.periods[state.municipality].open; render(true); toast('Recebimento atualizado somente na prévia deste município.'); },
  'toggle-student'(target) { requireAdmin(); const student = state.students.find(item => item.municipality === state.municipality && item.name === target.dataset.name); if (student) { student.enabled = !student.enabled; if (student.name === 'Ana Martins') state.studentAccess[state.municipality] = student.enabled; } render(); toast('Autorização fictícia atualizada. Nenhuma conta real foi alterada.'); },
  'toggle-company'(target) { requireAdmin(); const company = state.companies.find(item => item.municipality === state.municipality && item.name === target.dataset.name); if (company) company.enabled = !company.enabled; render(); toast('Fornecedor fictício atualizado; histórico preservado.'); },
  'review-student-request'() { const request = state.requests.find(item => item.studentId === 'demo-student' && item.municipality === state.municipality); if (request) { ui.selectedRequest = request.id; ui.view = 'review'; ui.search = ''; ui.status = ''; setRole('prefeitura'); } },
  'select-city'(target) { if (selectedCity(target.dataset.city)) { ui.managementCity = target.dataset.city; render(); } },
  'open-city-panel'(target) { if (selectedCity(target.dataset.city)) { state.municipality = target.dataset.city; ui.view = 'dashboard'; ui.selectedRequest = null; setRole('prefeitura'); } },
  'sample-document'(target) {
    const item = target.dataset.studentDocument ? state.requests.find(item => item.studentId === 'demo-student' && item.municipality === state.municipality) ?? (target.dataset.kind === 'frequency' && state.attendances[state.municipality] ? { name: state.studentName, amountCents: 0 } : null) : requestInMunicipality(ui.selectedRequest);
    if (!item) return;
    const box = document.createElement('dialog');
    box.className = 'sample-dialog';
    const heading = document.createElement('h3'); heading.textContent = target.dataset.kind === 'settlement' ? 'Comprovante do reembolso de exemplo' : target.dataset.kind === 'frequency' ? 'Frequência de exemplo' : 'Comprovante de exemplo';
    const text = document.createElement('p'); text.textContent = target.dataset.kind === 'settlement' && item.settlement ? `Pagamento fictício: ${money(item.settlement.amountCents)} em ${item.settlement.paidOn}. Referência: ${item.settlement.reference}. Não possui validade documental.` : target.dataset.kind === 'frequency' ? `Frequência fictícia de ${item.name}, na Instituição de exemplo. Competência: outubro de 2026. Não possui validade documental.` : `Documento fictício de ${item.name}. Competência: outubro de 2026. Valor do transporte: ${money(item.amountCents)}. Não possui validade documental.`;
    const close = document.createElement('button'); close.className = 'button primary'; close.textContent = 'Voltar à prévia'; close.type = 'button'; close.addEventListener('click', () => box.close());
    box.append(heading, text, close); box.addEventListener('close', () => { box.remove(); workspace.querySelector(`[data-kind="${target.dataset.kind}"]`)?.focus(); }); document.body.append(box); box.showModal();
  },
  export: downloadCsv,
  'previous-chapter'() { if (ui.chapter !== null) showChapter(ui.chapter - 1); },
  'next-chapter'() { if (ui.chapter !== null) showChapter(ui.chapter + 1); },
  'exit-presentation': exitPresentation,
};

document.addEventListener('click', event => {
  const target = event.target.closest('button, a');
  if (!target || target.disabled) return;
  try {
    if (target.id === 'presentation-toggle') { ui.chapter === null ? showChapter(0) : exitPresentation(); return; }
    if (target.dataset.role) { setRole(target.dataset.role); return; }
    if (target.dataset.startRole) {
      if (target.dataset.startTab) ui.studentTab = target.dataset.startTab;
      if (target.dataset.startView) { ui.view = target.dataset.startView; ui.selectedRequest = null; }
      setRole(target.dataset.startRole);
      if (ui.chapter !== null) { event.preventDefault(); navigateExperience(); }
      return;
    }
    if (target.dataset.view) { ui.view = target.dataset.view; ui.selectedRequest = null; render(true); return; }
    if (target.dataset.request && requestInMunicipality(target.dataset.request)) { ui.selectedRequest = target.dataset.request; ui.view = 'review'; render(true); return; }
    if (target.dataset.managementView) { ui.managementView = target.dataset.managementView; render(true); return; }
    if (target.dataset.studentTab) { setStudent(target.dataset.studentTab); return; }
    if (target.dataset.catalogRole) { ui.catalogRole = target.dataset.catalogRole; ui.catalogIndex = 0; renderScreens(); return; }
    if (target.dataset.catalogIndex !== undefined) { const index = Number(target.dataset.catalogIndex); if (catalog[ui.catalogRole][index]) { ui.catalogIndex = index; renderScreens(); } return; }
    if (target.dataset.catalogTry) {
      if (ui.catalogRole === 'prefeitura') {
        ui.view = target.dataset.catalogTry;
        if (ui.view === 'review') { ui.selectedRequest = state.requests.find(item => item.municipality === state.municipality && item.status === 'in_review')?.id ?? null; }
      } else if (ui.catalogRole === 'gestao') ui.managementView = target.dataset.catalogTry;
      else ui.studentTab = target.dataset.catalogTry;
      setRole(ui.catalogRole); navigateExperience(); return;
    }
    if (target.dataset.action) { actions[target.dataset.action]?.(target); return; }
    if (ui.chapter !== null && target.hash && target.origin === location.origin && target.pathname === location.pathname) {
      const element = document.getElementById(target.hash.slice(1));
      const chapter = element?.closest('[data-chapter]');
      if (chapter) { event.preventDefault(); showChapter(Number(chapter.dataset.chapter)); }
      else if (target.hash === '#conteudo') { event.preventDefault(); showChapter(0); }
    }
  } catch (error) { toast(error.message); }
});

document.addEventListener('change', event => {
  const target = event.target;
  if (target.id === 'municipality-select' && selectedCity(target.value)) {
    state.municipality = target.value; ui.selectedRequest = null; ui.search = ''; ui.status = ''; ui.view = 'dashboard'; render();
    toast('Município alterado: os registros exibidos pertencem apenas a ele.');
  } else if (target.id === 'admin-profile') { ui.adminRole = target.value; render(); toast(`Perfil municipal alterado. As ações respeitam a permissão selecionada.`); }
  else if (target.id === 'request-status' || target.id === 'request-month') {
    ui[target.id === 'request-status' ? 'status' : 'month'] = target.value;
    document.getElementById('request-results').innerHTML = requestResults(state, ui);
  }
});

document.addEventListener('input', event => {
  const target = event.target;
  if (target.id === 'request-search') { ui.search = target.value; document.getElementById('request-results').innerHTML = requestResults(state, ui); }
  if (target.id === 'transport-amount') {
    const result = document.getElementById('student-calculation');
    try { result.textContent = money(calculateReimbursement(parseMoney(target.value), state.percentages[state.municipality])); }
    catch { result.textContent = 'Confira o valor informado'; }
  }
});

document.addEventListener('submit', event => {
  event.preventDefault();
  const form = event.target;
  const values = new FormData(form);
  const value = name => String(values.get(name) ?? '');
  const slots = { 'decision-form': 'decision-error', 'settlement-form': 'settlement-error', 'reimbursement-form': 'reimbursement-error', 'municipality-approval-form': 'municipality-error', 'license-issue-form': 'license-error', 'license-activate-form': 'activate-error', 'policy-form': 'policy-error', 'notice-form': 'notice-error', 'student-registry-form': 'registry-error', 'mfa-demo-form': 'mfa-error' };
  try {
    if (form.id === 'reimbursement-form') {
      state = submitRequest(state, { name: value('name'), amount: value('amount'), paymentDate: value('paymentDate'), paymentDocument: values.has('paymentDocument') });
      ui.studentTab = 'reimbursement'; render(true); toast('Pedido fictício recebido. Abra a Prefeitura para conferir os documentos.');
    } else if (form.id === 'decision-form') {
      const item = requestInMunicipality(form.dataset.id);
      if (!item) throw new Error('Solicitação indisponível neste município.');
      const status = event.submitter?.value;
      const updated = decideRequest(item, { status, notes: value('notes'), amountCents: status === 'approved' ? parseMoney(value('amount')) : 0, frequencyValid: values.has('frequencyValid'), paymentValid: values.has('paymentValid'), role: ui.adminRole });
      state.requests = state.requests.map(item => item.id === updated.id ? updated : item);
      render(true); toast('Decisão registrada na prévia. O estudante já pode consultar a mensagem.');
    } else if (form.id === 'settlement-form') {
      const item = requestInMunicipality(form.dataset.id);
      if (!item) throw new Error('Solicitação indisponível neste município.');
      const updated = registerSettlement(item, { paidOn: value('paidOn'), reference: value('reference'), receipt: values.has('receipt'), role: ui.adminRole });
      state.requests = state.requests.map(item => item.id === updated.id ? updated : item); render(true); toast('Pagamento fictício registrado. Nenhuma transferência foi executada.');
    } else if (form.id === 'municipality-approval-form') {
      replaceCity(approveMunicipality(selectedCity(form.dataset.city), value('reason'))); render(true); toast('Cadastro fictício aprovado. Agora emita o código da licença.');
    } else if (form.id === 'license-issue-form') {
      replaceCity(issueLicense(selectedCity(form.dataset.city), { contractConfirmed: values.has('contractConfirmed'), reference: value('reference') })); render(true); toast('Código fictício emitido. Os 12 meses começam na ativação.');
    } else if (form.id === 'license-activate-form') {
      replaceCity(activateLicense(selectedCity(form.dataset.city), value('code'))); render(true); toast('Licença fictícia ativada de 12/10/2026 a 12/10/2027.');
    } else if (form.id === 'policy-form') {
      requireAdmin(); const percentage = Number(value('percentage'));
      if (!value('percentage') || !Number.isInteger(percentage) || percentage < 0 || percentage > 100) throw new Error('Use um percentual inteiro entre 0 e 100.');
      state.percentages[state.municipality] = percentage; render(true); toast('Percentual demonstrativo atualizado para este município.');
    } else if (form.id === 'notice-form') {
      state = saveNotice(state, { id: form.dataset.id || null, version: Number(form.dataset.version), title: value('title'), message: value('message'), schedule: value('schedule'), push: values.has('push'), email: values.has('email') }, ui.adminRole);
      ui.editNotice = null; render(true); toast(value('schedule') ? 'Agendamento fictício salvo. Publique agora ou cancele para experimentar.' : 'Comunicado fictício publicado no início do estudante.');
    } else if (form.id === 'student-registry-form') {
      requireAdmin(); const name = value('name').trim(); const course = value('course').trim();
      if (name.length < 2 || name.length > 80 || course.length < 2 || course.length > 80) throw new Error('Use um nome e curso fictícios de 2 a 80 caracteres.');
      if (state.students.some(item => item.municipality === state.municipality && item.name === name)) throw new Error('Este estudante de exemplo já está na lista.');
      state.students.push({ name, course, institution: 'Instituição de exemplo', municipality: state.municipality, enabled: true }); render(true); toast('Estudante fictício cadastrado apenas nesta apresentação.');
    } else if (form.id === 'mfa-demo-form') {
      if (value('code') !== '123456') throw new Error('Código de exemplo incorreto. Use 123456 nesta demonstração.');
      toast('Etapa ilustrativa concluída. Nenhuma sessão real foi criada.'); setStudent('home');
    }
  } catch (error) {
    const slot = document.getElementById(slots[form.id]);
    if (slot) { slot.textContent = error.message; slot.hidden = false; } else toast(error.message);
  }
});

document.addEventListener('keydown', event => {
  if (ui.chapter === null || event.target.closest('input,select,textarea,dialog')) return;
  if (event.key === 'Escape') { event.preventDefault(); exitPresentation(); }
  if (event.key === 'ArrowRight') { event.preventDefault(); showChapter(ui.chapter + 1); }
  if (event.key === 'ArrowLeft') { event.preventDefault(); showChapter(ui.chapter - 1); }
});

initializeTheme(); render(); renderScreens();
