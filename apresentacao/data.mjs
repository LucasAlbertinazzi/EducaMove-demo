export const statuses = { in_review: 'Em análise', pending: 'Correção solicitada', approved: 'Aprovado', rejected: 'Recusado' };
export const licenseLabels = { active: 'Licença ativa', awaiting: 'Aguardando licença', issued: 'Código emitido' };
export const roleLabels = { administrator: 'Administrador', validator: 'Validador', reports: 'Relatórios', viewer: 'Consulta' };
export const municipalityLabels = { brotas: 'Brotas', 'sao-carlos': 'São Carlos', ribeirao: 'Ribeirão Bonito' };

export function initialState() {
  const seed = [
    ['Pedro Lima', 'brotas', 36000, 'in_review', true, false, 0],
    ['Júlia Santos', 'brotas', 48000, 'in_review', false, false, 0],
    ['Beatriz Alves', 'brotas', 30000, 'in_review', true, true, 0],
    ['Rafael Costa', 'brotas', 40000, 'pending', false, true, 0],
    ['Bruno Souza', 'brotas', 72000, 'approved', true, true, 50400],
    ['Marina Oliveira', 'brotas', 36000, 'approved', true, true, 25200],
    ['Carla Mendes', 'sao-carlos', 60000, 'in_review', true, false, 0],
    ['André Ribeiro', 'sao-carlos', 60000, 'approved', true, true, 42000],
  ];
  return {
    municipality: 'brotas', nextId: 9, studentName: 'Ana Martins',
    percentages: { brotas: 70, 'sao-carlos': 70, ribeirao: 70 },
    attendances: { brotas: false, 'sao-carlos': false, ribeirao: false },
    studentAccess: { brotas: true, 'sao-carlos': true, ribeirao: true },
    periods: Object.fromEntries(['brotas', 'sao-carlos', 'ribeirao'].map(id => [id, { open: true, deadline: '2026-10-31', releasesOn: '2026-11-05' }])),
    municipalities: [
      { id: 'brotas', name: 'Brotas', state: 'SP', status: 'approved', license: 'active', activatedAt: '2026-07-01', expiresAt: '2027-07-01', contact: 'secretaria@brotas.example.invalid' },
      { id: 'sao-carlos', name: 'São Carlos', state: 'SP', status: 'approved', license: 'active', activatedAt: '2026-08-01', expiresAt: '2027-08-01', contact: 'secretaria@saocarlos.example.invalid' },
      { id: 'ribeirao', name: 'Ribeirão Bonito', state: 'SP', status: 'pending', license: 'awaiting', contact: 'secretaria@ribeirao.example.invalid' },
    ],
    requests: seed.map(([name, municipality, amountCents, status, frequencyValid, paymentValid, approvedCents], index) => ({
      id: `seed-${index + 1}`, protocol: `DEMO-2026-${String(index + 1).padStart(4, '0')}`,
      studentId: `seed-student-${index + 1}`, name, municipality, amountCents, status, frequencyValid, paymentValid, approvedCents,
      institution: index % 2 ? 'Faculdade de exemplo' : 'Instituto de exemplo', month: '2026-10', paymentDate: '2026-10-05',
      note: status === 'pending' ? 'Reenvie a frequência legível.' : status === 'approved' ? 'Documentos conferidos pela secretaria.' : 'Aguardando conferência da secretaria.',
      history: ['Solicitação demonstrativa recebida.'],
    })),
    students: [
      { name: 'Ana Martins', institution: 'Instituição de exemplo', course: 'Administração', municipality: 'brotas', enabled: true },
      { name: 'Pedro Lima', institution: 'Instituto de exemplo', course: 'Engenharia', municipality: 'brotas', enabled: true },
      { name: 'Júlia Santos', institution: 'Faculdade de exemplo', course: 'Pedagogia', municipality: 'brotas', enabled: true },
      { name: 'Carla Mendes', institution: 'Instituto de exemplo', course: 'Direito', municipality: 'sao-carlos', enabled: true },
    ],
    companies: [{ name: 'Transporte Universitário de Exemplo', municipality: 'brotas', enabled: true }, { name: 'Viação Demonstrativa', municipality: 'brotas', enabled: true }, { name: 'Transporte São Carlos de Exemplo', municipality: 'sao-carlos', enabled: true }],
    notices: [{ title: 'Outubro: envie seus documentos', message: 'Frequência e comprovante do transporte devem ser enviados até 31/10.', municipality: 'brotas' }],
    renewal: 'not_sent', biometricDemo: false,
  };
}
