import { filterRequests, money, summary } from './domain.mjs?v=20261014-2';
import { municipalityLabels, roleLabels, statuses } from './data.mjs?v=20261014-2';
import { badge, button, e, empty, errorSlot, icon, title } from './ui.mjs?v=20261013-1';

export const destinations = [
  ['dashboard', 'Visão geral', 'home'], ['requests', 'Solicitações', 'document'],
  ['students', 'Estudantes', 'people'], ['companies', 'Transportadoras', 'bus'],
  ['periods', 'Períodos', 'calendar'], ['notices', 'Comunicados', 'bell'],
  ['reports', 'Relatórios', 'chart'], ['team', 'Equipe', 'people'], ['settings', 'Regras e licença', 'shield'],
];

export function renderContext(state, ui, showProfile = true) {
  return `<div class="workspace-context"><label>Município da prévia<select id="municipality-select">${state.municipalities.map(city => `<option value="${city.id}" ${state.municipality === city.id ? 'selected' : ''}>${e(city.name)} · ${city.state}</option>`).join('')}</select></label>${showProfile ? `<label>Perfil municipal<select id="admin-profile">${Object.entries(roleLabels).map(([id, label]) => `<option value="${id}" ${ui.adminRole === id ? 'selected' : ''}>${label}</option>`).join('')}</select></label>` : ''}</div>`;
}

function requestTable(items) {
  if (!items.length) return empty('Nenhuma solicitação encontrada para estes filtros.');
  return `<div class="table-scroll"><table><caption class="sr-only">Solicitações fictícias do município selecionado</caption><thead><tr><th scope="col">Estudante</th><th scope="col">Competência</th><th scope="col">Transporte</th><th scope="col">Status</th><th scope="col">Ação</th></tr></thead><tbody>${items.map(item => `<tr><td><strong>${e(item.name)}</strong><span class="small">${e(item.protocol)}</span></td><td>Outubro / 2026</td><td>${money(item.amountCents)}</td><td>${badge(item.status)}</td><td><button type="button" class="text-button" data-request="${item.id}" aria-label="Ver solicitação de ${e(item.name)}">${['in_review', 'pending'].includes(item.status) ? 'Analisar' : 'Ver detalhe'}</button></td></tr>`).join('')}</tbody></table></div>`;
}

function filters(ui) {
  return `<div class="filters"><label class="sr-only" for="request-search">Buscar estudante ou protocolo</label><input id="request-search" type="search" maxlength="100" placeholder="Buscar estudante ou protocolo…" value="${e(ui.search)}"><label class="sr-only" for="request-status">Filtrar status</label><select id="request-status"><option value="">Todos os status</option>${Object.entries(statuses).map(([id, label]) => `<option value="${id}" ${ui.status === id ? 'selected' : ''}>${label}</option>`).join('')}</select></div>`;
}

function metrics(items) {
  const totals = summary(items);
  return `<div class="metrics"><div class="metric"><strong>${totals.total}</strong><span>solicitações</span><small>Total do período</small></div><div class="metric"><strong>${totals.reviewing}</strong><span>em análise</span><small>Aguardando avaliação</small></div><div class="metric"><strong>${money(totals.approved)}</strong><span>aprovados</span><small>Decisão administrativa</small></div></div>`;
}

function dashboard(state, ui) {
  const items = filterRequests(state.requests, { municipality: state.municipality });
  return `${title('Visão geral', 'Acompanhe os documentos e os pedidos do município.')}<p class="small">Competência: outubro de 2026 · percentual demonstrativo: ${state.percentages[state.municipality]}%</p>${metrics(items)}<div class="panel"><div class="panel-heading"><h4>Solicitações recentes</h4>${button('Ver todas', 'view-requests', '', 'text-button')}</div>${filters(ui)}<div id="request-results">${requestTable(filterRequests(state.requests, { ...ui, municipality: state.municipality }).slice(0, 5))}</div></div>`;
}

export function requestResults(state, ui) {
  return requestTable(filterRequests(state.requests, { ...ui, municipality: state.municipality }));
}

function requests(state, ui) {
  return `${title('Solicitações recebidas', 'Busque, filtre e abra os documentos para registrar uma decisão.')}<div class="field"><label for="request-month">Competência</label><select id="request-month"><option value="2026-10" ${ui.month === '2026-10' ? 'selected' : ''}>Outubro de 2026</option><option value="2026-09" ${ui.month === '2026-09' ? 'selected' : ''}>Setembro de 2026 · sem exemplos</option><option value="" ${ui.month === '' ? 'selected' : ''}>Todas as competências</option></select></div><div class="panel">${filters(ui)}<div id="request-results">${requestResults(state, ui)}</div></div>`;
}

function review(state, ui) {
  const item = state.requests.find(item => item.id === ui.selectedRequest && item.municipality === state.municipality);
  if (!item) return requests(state, ui);
  const final = !['in_review', 'pending'].includes(item.status);
  const readonly = !['administrator', 'validator'].includes(ui.adminRole) || final;
  const suggested = item.referenceCents;
  return `${button('← Voltar às solicitações', 'view-requests', '', 'text-button')}${title(e(item.protocol), `Solicitação de ${e(item.name)}`, badge(item.status))}
    <div class="review-details"><div class="detail-block"><h4>Dados do estudante</h4><dl><dt>Nome fictício</dt><dd>${e(item.name)}</dd><dt>Instituição</dt><dd>${e(item.institution)}</dd><dt>Competência / pagamento</dt><dd>Outubro / 2026 · ${e(item.paymentDate.split('-').reverse().join('/'))}</dd><dt>Valor do transporte</dt><dd>${money(item.amountCents)}</dd><dt>Referência salva (${item.referencePercentage}%)</dt><dd>${money(suggested)}</dd></dl></div>
    <div class="detail-block"><h4>Documentos de exemplo</h4><p>Frequência e comprovante fictícios recebidos. Na aplicação integrada, a equipe confere os PDFs.</p><button class="text-button" type="button" data-action="sample-document" data-kind="frequency">Ver frequência de exemplo →</button><br><button class="text-button" type="button" data-action="sample-document" data-kind="payment">Ver comprovante de exemplo →</button><p class="small">Aqui a conferência usa um exemplo em texto, sem upload ou documento real.</p></div></div>
    <form class="review-form" id="decision-form" data-id="${item.id}"><fieldset ${readonly ? 'disabled' : ''}><legend>Conferência e decisão</legend><label class="check-field"><input name="frequencyValid" type="checkbox" ${item.frequencyValid ? 'checked' : ''}> Frequência validada</label><label class="check-field"><input name="paymentValid" type="checkbox" ${item.paymentValid ? 'checked' : ''}> Comprovante validado</label><label class="field">Valor a aprovar (R$)<input name="amount" inputmode="decimal" value="${((final ? item.approvedCents : suggested) / 100).toFixed(2).replace('.', ',')}" maxlength="12"></label><label class="field">Mensagem ao estudante<textarea name="notes" maxlength="500" placeholder="Ex.: documentos conferidos pela secretaria.">${final ? e(item.note) : ''}</textarea></label><div class="actions"><button class="button primary" name="decision" value="approved" type="submit">Aprovar solicitação</button><button class="button secondary" name="decision" value="pending" type="submit">Solicitar correção</button><button class="text-button" name="decision" value="rejected" type="submit">Recusar</button></div></fieldset>${errorSlot('decision-error')}</form>
    ${readonly ? `<p class="form-note">${final ? 'Decisão registrada. Reinicie a prévia para analisar novamente.' : `O perfil ${roleLabels[ui.adminRole]} pode visualizar, mas não registra decisões.`}</p>` : ''}
    ${settlement(item, ui)}<h4>Histórico da solicitação</h4><ol class="history">${item.history.map(entry => `<li>${e(entry)}</li>`).join('')}</ol>`;
}

function settlement(item, ui) {
  if (item.settlement) return `<div class="detail-block"><h4>Pagamento registrado</h4><p>${money(item.settlement.amountCents)} em ${e(item.settlement.paidOn.split('-').reverse().join('/'))}<br>Referência: ${e(item.settlement.reference)}</p>${button('Ver comprovante do reembolso de exemplo', 'sample-document', 'data-kind="settlement"', 'text-button')}</div>`;
  if (item.status !== 'approved') return '';
  if (ui.adminRole !== 'administrator') return '<p class="form-note">Registro de pagamento demonstrativo disponível ao Administrador.</p>';
  return `<div class="panel settlement-panel"><h4>Registrar pagamento já efetuado</h4><p>Valor aprovado: <strong>${money(item.approvedCents)}</strong>. No integrado, a secretaria registra data, referência e comprovante de um pagamento realizado fora do sistema.</p><form id="settlement-form" data-id="${e(item.id)}"><label class="field">Data do pagamento fictício<input type="date" name="paidOn" min="2026-10-01" max="2026-10-13" value="2026-10-13" required></label><label class="field">Referência de exemplo<input name="reference" minlength="3" maxlength="100" placeholder="Ex.: DEMO-PIX-001" required autocomplete="off"></label><label class="check-field"><input type="checkbox" name="receipt" required> Usar comprovante de reembolso fictício</label><button class="button primary" type="submit">Registrar pagamento na prévia</button>${errorSlot('settlement-error')}</form><p class="small">Nenhuma transferência é executada. O estudante acompanha o status e o comprovante protegido no app integrado.</p></div>`;
}

function students(state, ui) {
  const canEdit = ui.adminRole === 'administrator';
  return `${title('Estudantes autorizados', 'Cadastro e vínculo acadêmico mantidos pela secretaria.')}<ul class="inline-list">${state.students.filter(item => item.municipality === state.municipality).map((item, index) => `<li><div><strong>${e(item.name)}</strong><p>${e(item.course)} · ${e(item.institution)}</p><span class="badge ${item.enabled ? 'approved' : 'rejected'}">${item.enabled ? 'Autorizado' : 'Bloqueado na prévia'}</span></div>${canEdit ? button(item.enabled ? 'Bloquear' : 'Autorizar', 'toggle-student', `data-name="${e(item.name)}"`) : ''}</li>`).join('') || empty('Nenhum estudante de exemplo neste município.')}</ul>${canEdit ? `<details><summary>Adicionar estudante fictício</summary><form id="student-registry-form" class="form-note"><label class="field">Nome fictício<input name="name" required minlength="2" maxlength="80" placeholder="Ex.: Luiza de Exemplo"></label><label class="field">Curso<input name="course" required minlength="2" maxlength="80" placeholder="Ex.: Pedagogia"></label><button type="submit" class="button primary">Cadastrar na prévia</button>${errorSlot('registry-error')}</form></details>` : '<p class="form-note">Cadastros são editados pelo Administrador.</p>'}`;
}

function companies(state, ui) {
  const companies = state.companies.filter(item => item.municipality === state.municipality);
  return `${title('Transportadoras', 'Ative e inative fornecedores de exemplo. O histórico mensal é preservado.')}<ul class="inline-list">${companies.map(item => `<li><div><strong>${e(item.name)}</strong><p>${item.enabled ? 'Disponível para novos vínculos' : 'Inativa; vínculos existentes preservados'}</p></div>${ui.adminRole === 'administrator' ? button(item.enabled ? 'Inativar' : 'Ativar', 'toggle-company', `data-name="${e(item.name)}"`) : ''}</li>`).join('') || empty('Nenhuma transportadora de exemplo neste município.')}</ul>`;
}

function periods(state, ui) {
  const period = state.periods[state.municipality];
  return `${title('Períodos e prazos', 'O calendário municipal organiza a entrega dos documentos e a análise.')}<div class="detail-block"><h4>Outubro de 2026</h4><dl><dt>Recebimento</dt><dd>${period.open ? 'Aberto' : 'Encerrado'}</dd><dt>Prazo de envio</dt><dd>31/10/2026</dd><dt>Previsão de liberação</dt><dd>05/11/2026</dd></dl>${ui.adminRole === 'administrator' ? button(period.open ? 'Encerrar recebimento de exemplo' : 'Abrir recebimento de exemplo', 'toggle-period') : ''}</div><p class="form-note">Experimente encerrar o recebimento e abrir Reembolso no estudante: o novo envio ficará indisponível. Nesta prévia, a abertura é reversível; no integrado, regularização documental não prorroga um prazo financeiro vencido.</p>`;
}

function notices(state, ui) {
  const entries = state.notices.filter(item => item.municipality === state.municipality);
  const editing = entries.find(item => item.id === ui.editNotice && item.status === 'scheduled');
  return `${title('Comunicados e agendamentos', 'Publicação, leitura, canais e controle dos avisos da secretaria.')}<p class="form-note">No integrado, há públicos segmentados, regras automáticas e tentativas de entrega. Publicação, aceite pelo provedor e leitura são etapas distintas. Esta prévia usa apenas registros fictícios, com relógio de exemplo em 13/10/2026 às 10h.</p><ul class="inline-list notices-list">${entries.map(item => `<li><div><strong>${e(item.title)}</strong><p>${e(item.message)}</p><span class="badge ${item.status === 'published' ? 'approved' : item.status === 'scheduled' ? 'in_review' : 'rejected'}">${item.status === 'published' ? 'Publicado na prévia' : item.status === 'scheduled' ? 'Agendado' : 'Cancelado'}</span><p>${item.schedule ? `Agendamento de exemplo: ${e(item.schedule.replace('T',' às '))}<br>` : ''}Canais selecionados: ${[item.push ? 'Push' : '', item.email ? 'E-mail' : ''].filter(Boolean).join(' + ') || 'Somente no aplicativo'}</p>${item.status === 'scheduled' && ui.adminRole === 'administrator' ? `<div class="actions">${button('Editar agendamento', 'edit-notice', `data-id="${e(item.id)}"`, 'secondary')}${button('Cancelar agendamento', 'cancel-notice', `data-id="${e(item.id)}"`, 'secondary')}${button('Publicar agora na prévia', 'publish-notice', `data-id="${e(item.id)}"`, 'primary')}</div>` : ''}</div></li>`).join('') || empty('Nenhum comunicado publicado.')}</ul>${ui.adminRole === 'administrator' ? `<form id="notice-form" data-id="${e(editing?.id ?? '')}" data-version="${editing?.version ?? 0}"><h4>${editing ? 'Editar agendamento de exemplo' : 'Novo comunicado de exemplo'}</h4><label class="field">Título do comunicado<input name="title" required minlength="3" maxlength="80" value="${e(editing?.title ?? '')}" placeholder="Ex.: Confira o prazo de outubro"></label><label class="field">Mensagem<textarea name="message" required minlength="5" maxlength="300" placeholder="Escreva uma orientação fictícia para os estudantes.">${e(editing?.message ?? '')}</textarea></label><label class="field">Agendar (opcional, relógio de exemplo)<input type="datetime-local" name="schedule" min="2026-10-13T10:01" max="2026-12-31T23:59" value="${e(editing?.schedule ?? '')}"></label><label class="check-field"><input type="checkbox" name="push" ${editing?.push !== false ? 'checked' : ''}> Canal push de exemplo</label><label class="check-field"><input type="checkbox" name="email" ${editing?.email ? 'checked' : ''}> Canal e-mail de exemplo</label><button type="submit" class="button primary">${editing ? 'Salvar agendamento' : 'Publicar ou agendar na prévia'}</button>${errorSlot('notice-error')}</form>` : '<p class="form-note">A publicação depende de permissão administrativa.</p>'}<p class="small">Canais selecionados não enviam mensagens reais nesta página. No Android integrado, o push depende da permissão do aparelho; no iOS, APNs permanece pendente.</p>`;
}

function reports(state, ui) {
  if (!['administrator', 'reports'].includes(ui.adminRole)) return `${title('Relatórios e indicadores', 'Consulta restrita aos perfis autorizados.')}<p class="form-note">Selecione Administrador ou Relatórios no perfil municipal para consultar e exportar os dados fictícios.</p>`;
  const items = filterRequests(state.requests, { municipality: state.municipality });
  const total = summary(items);
  return `${title('Relatórios e indicadores', 'Resumo demonstrativo de outubro, atualizado após cada decisão.', button('Baixar CSV fictício', 'export', '', 'primary'))}${metrics(items)}<div class="panel"><div class="panel-heading"><h4>Distribuição das solicitações</h4></div><div class="bar-chart">${Object.entries(statuses).map(([status, label]) => { const count = items.filter(item => item.status === status).length; const height = total.total ? Math.round(count / total.total * 10) : 0; return `<div class="bar-item"><strong>${count}</strong><div class="bar ${status} h-${height}"></div><span>${e(label)}</span></div>`; }).join('')}</div><p class="chart-legend">Quantidade de pedidos por situação, no município selecionado.</p></div><div class="detail-block"><p>Transporte informado: <strong>${money(total.requested)}</strong></p><p>Valor aprovado: <strong>${money(total.approved)}</strong></p><p class="small">CSV inclui somente os registros fictícios do município selecionado. PDF está disponível no painel integrado.</p></div>`;
}

function team(ui) {
  return `${title('Equipe e perfis', 'Os perfis separam a consulta, a validação e a administração.')}<div class="panel"><div class="table-scroll"><table><thead><tr><th scope="col">Perfil</th><th scope="col">Responsabilidade</th></tr></thead><tbody><tr><td>Administrador</td><td>Cadastros, regras, equipe, documentos e decisões.</td></tr><tr><td>Validador</td><td>Conferência de documentos e decisões autorizadas.</td></tr><tr><td>Relatórios</td><td>Consulta e exportação autorizada.</td></tr><tr><td>Consulta</td><td>Leitura dos registros, sem alteração.</td></tr></tbody></table></div></div><p class="form-note">Perfil selecionado na prévia: <strong>${roleLabels[ui.adminRole]}</strong>. Use o seletor acima para comparar o comportamento.</p>`;
}

function settings(state, ui) {
  const city = state.municipalities.find(item => item.id === state.municipality);
  return `${title('Regras e licença municipal', 'Parâmetros da prévia e vigência de acesso da prefeitura.')}<form id="policy-form"><label class="field">Percentual de reembolso demonstrativo (%)<input name="percentage" type="number" min="0" max="100" step="1" value="${state.percentages[state.municipality]}" ${ui.adminRole !== 'administrator' ? 'disabled' : ''}></label>${ui.adminRole === 'administrator' ? '<button class="button primary" type="submit">Aplicar percentual na prévia</button>' : ''}${errorSlot('policy-error')}</form><p class="form-note">O percentual é fictício e não representa uma política oficial. Altera a calculadora e os novos envios; referências já salvas e valores aprovados são preservados. No aplicativo integrado, a regra é anual, versionada e auditada.</p><div class="detail-block"><h4>Licença de ${e(city.name)}</h4><p>Ativa até ${e(city.expiresAt?.split('-').reverse().join('/') ?? 'aguardar ativação')}.</p><p class="small">A gestão confirma o pagamento e emite o código. Os 12 meses começam quando o responsável municipal o ativa.</p></div>`;
}

export function renderPrefeitura(state, ui) {
  const city = state.municipalities.find(item => item.id === state.municipality);
  const views = { dashboard, requests, review, students, companies, periods, notices, reports, team: (_, ui) => team(ui), settings };
  const blocked = city.status !== 'approved' || city.license !== 'active';
  return `<div class="demo-topbar"><span class="browser-dots" aria-hidden="true">● ● ●</span><span>Painel municipal · reprodução demonstrativa</span></div><div class="workspace-layout"><aside class="workspace-sidebar"><div class="brand"><img src="assets/icone.png" width="32" height="32" alt=""><span>Educa<span>Mov</span></span></div><div class="workspace-nav" role="group" aria-label="Menu municipal">${destinations.map(([id, text, symbol]) => `<button type="button" data-view="${id}" ${ui.view === id || ui.view === 'review' && id === 'requests' ? 'aria-current="page"' : ''}>${icon(symbol)}${text}</button>`).join('')}</div><div class="sidebar-foot">${e(city.name)} · ${city.state}<br>Prefeitura · dados fictícios</div></aside>
    <div class="workspace-main">${renderContext(state, ui)}${blocked ? `${title('Acesso municipal aguardando licença', 'A aprovação cadastral e a ativação comercial são etapas diferentes.')}<p class="form-note">Aprove o cadastro e emita um código pela Gestão; depois use Ativar como prefeitura para liberar a prévia deste município.</p>${button('Explorar gestão de licenças', 'open-management', '', 'primary')}` : (views[ui.view] ?? dashboard)(state, ui)}</div>
    <aside class="workspace-guide"><h4>Da solicitação à decisão.</h4><div class="journey-step"><span class="step-num">1</span><div><strong>Envie pelo estudante</strong><p>Use a frequência de exemplo e solicite um reembolso.</p><button type="button" class="text-button" data-action="start-student">Começar →</button></div></div><div class="journey-step"><span class="step-num">2</span><div><strong>Confira na prefeitura</strong><p>Abra o pedido, valide os dois documentos e escreva a decisão.</p></div></div><div class="journey-step"><span class="step-num">3</span><div><strong>Veja o retorno no app</strong><p>Acompanhe status, valor aprovado e mensagem no estudante.</p><button type="button" class="text-button" data-action="show-student-result">Ver resultado →</button></div></div><div class="guide-note">Simulação com registros fictícios. Nenhuma conta, documento ou pagamento real é criado.</div></aside></div>`;
}
