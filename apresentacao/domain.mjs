// Regras exclusivas da apresentação. Não acessam serviços do aplicativo.
export function money(cents) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
}

export function parseMoney(value) {
  const text = String(value).trim();
  if (!/^\d+(?:[.,]\d{1,2})?$/.test(text)) throw new Error('Informe um valor positivo, como 360,00.');
  const [whole, decimal = ''] = text.replace(',', '.').split('.');
  const cents = Number(whole) * 100 + Number(decimal.padEnd(2, '0'));
  if (!Number.isSafeInteger(cents) || cents <= 0 || cents > 10000000) {
    throw new Error('Use um valor entre R$ 0,01 e R$ 100.000,00 nesta demonstração.');
  }
  return cents;
}

export function calculateReimbursement(cents, percentage) {
  if (!Number.isSafeInteger(cents) || cents <= 0 || cents > 10000000 || !Number.isInteger(percentage) || percentage < 0 || percentage > 100) {
    throw new Error('Confira o valor do transporte e o percentual de 0 a 100.');
  }
  return Math.floor((cents * percentage + 50) / 100);
}

export function filterRequests(requests, { municipality, month = '', status = '', search = '' }) {
  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const query = normalize(search.trim());
  return requests.filter(item => item.municipality === municipality &&
    (!month || item.month === month) && (!status || item.status === status) &&
    (!query || normalize(`${item.name} ${item.protocol} ${item.institution}`).includes(query)));
}

export function summary(requests) {
  return requests.reduce((result, item) => ({
    total: result.total + 1,
    reviewing: result.reviewing + Number(item.status === 'in_review'),
    pending: result.pending + Number(item.status === 'pending'),
    approved: result.approved + (item.status === 'approved' ? item.approvedCents : 0),
    requested: result.requested + item.amountCents,
  }), { total: 0, reviewing: 0, pending: 0, approved: 0, requested: 0 });
}

export function submitRequest(state, { name, amount, paymentDate, paymentDocument }) {
  const city = state.municipalities.find(item => item.id === state.municipality);
  if (city.status !== 'approved' || city.license !== 'active') throw new Error('O acesso deste município aguarda ativação da licença.');
  if (!state.studentAccess[state.municipality]) throw new Error('A autorização deste estudante está desativada pela secretaria na prévia.');
  if (!state.periods[state.municipality].open) throw new Error('O recebimento de solicitações está encerrado.');
  if (!state.attendances[state.municipality]) throw new Error('Envie a frequência de exemplo antes de solicitar o reembolso.');
  if (!paymentDocument) throw new Error('Selecione o comprovante de transporte de exemplo.');
  if (name.trim().length < 2 || name.trim().length > 80) throw new Error('Informe um nome fictício de 2 a 80 caracteres.');
  if (!/^2026-10-(0[1-9]|[12]\d|3[01])$/.test(paymentDate)) throw new Error('Use uma data de pagamento de outubro de 2026.');
  if (state.requests.some(item => item.municipality === state.municipality && item.studentId === 'demo-student' && item.month === '2026-10')) {
    throw new Error('Já existe uma solicitação para este estudante em outubro. Acompanhe a análise ou reinicie a demonstração.');
  }
  const amountCents = parseMoney(amount);
  const id = `demo-request-${state.nextId}`;
  const item = {
    id, protocol: `DEMO-2026-${String(state.nextId).padStart(4, '0')}`, studentId: 'demo-student',
    name: name.trim(), municipality: state.municipality, institution: 'Instituição de exemplo',
    month: '2026-10', amountCents, approvedCents: 0, status: 'in_review',
    frequencyValid: false, paymentValid: false, paymentDate, note: 'Aguardando conferência da secretaria.',
    history: ['Solicitação recebida com dois documentos fictícios.'],
  };
  return { ...state, nextId: state.nextId + 1, studentName: name.trim(), requests: [item, ...state.requests] };
}

export function decideRequest(item, { status, notes, amountCents, frequencyValid, paymentValid, role = 'administrator' }) {
  if (!['administrator', 'validator'].includes(role)) throw new Error('O perfil Consulta não pode registrar decisões.');
  if (!['in_review', 'pending'].includes(item.status)) throw new Error('Esta solicitação já tem uma decisão final.');
  if (!['approved', 'pending', 'rejected'].includes(status)) throw new Error('Selecione uma decisão válida.');
  if (notes.trim().length < 3 || notes.length > 500) throw new Error('Informe uma mensagem de 3 a 500 caracteres ao estudante.');
  if (status === 'approved') {
    if (!frequencyValid || !paymentValid) throw new Error('Valide a frequência e o comprovante antes de aprovar.');
    if (!Number.isSafeInteger(amountCents) || amountCents <= 0 || amountCents > item.amountCents) {
      throw new Error('O valor aprovado deve ser positivo e não ultrapassar o valor solicitado.');
    }
  }
  return { ...item, status, note: notes.trim(), frequencyValid, paymentValid,
    approvedCents: status === 'approved' ? amountCents : 0,
    history: [...item.history, `${status === 'approved' ? 'Aprovação' : status === 'pending' ? 'Correção solicitada' : 'Recusa'}: ${notes.trim()}`] };
}

export function approveMunicipality(city, reason) {
  if (city.status !== 'pending') throw new Error('Este cadastro já foi analisado.');
  if (reason.trim().length < 10 || reason.length > 500) throw new Error('Registre uma justificativa de 10 a 500 caracteres.');
  return { ...city, status: 'approved', license: 'awaiting', reason: reason.trim() };
}

export function issueLicense(city, { paymentConfirmed, reference }) {
  if (city.status !== 'approved') throw new Error('Aprove o cadastro antes de emitir a licença.');
  if (city.license !== 'awaiting') throw new Error('Já existe uma licença ativa ou um código emitido.');
  if (!paymentConfirmed || reference.trim().length < 3) throw new Error('Confirme o pagamento fictício e informe uma referência de exemplo.');
  return { ...city, license: 'issued', code: `DEMO-${city.id.toUpperCase()}-2026`, paymentReference: reference.trim() };
}

export function activateLicense(city, code, today = '2026-10-12') {
  if (city.license !== 'issued' || code.trim() !== city.code) throw new Error('Use o código fictício emitido para este município.');
  const start = new Date(`${today}T12:00:00Z`);
  if (!Number.isFinite(start.getTime())) throw new Error('Data de ativação inválida.');
  const end = new Date(start);
  end.setUTCFullYear(start.getUTCFullYear() + 1);
  if (end.getUTCMonth() !== start.getUTCMonth()) end.setUTCDate(0);
  return { ...city, license: 'active', code: null, activatedAt: today, expiresAt: end.toISOString().slice(0, 10) };
}

function csvCell(value) {
  let text = String(value);
  if (/^[=+@\-\t\r]/.test(text.trimStart())) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

export function reportCsv(items) {
  const rows = [['Protocolo', 'Estudante fictício', 'Competência', 'Status', 'Transporte (R$)', 'Aprovado (R$)'],
    ...items.map(item => [item.protocol, item.name, item.month, item.status,
      (item.amountCents / 100).toFixed(2).replace('.', ','), (item.approvedCents / 100).toFixed(2).replace('.', ',')])];
  return '\ufeff' + rows.map(row => row.map(csvCell).join(';')).join('\r\n');
}
