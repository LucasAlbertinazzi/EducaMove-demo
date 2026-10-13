# EducaMov — ambiente integrado de homologação

- Painel web: https://educamov.com.br/painel/
- API: https://api.educamov.com.br/health/ready
- APK Android 1.0.20: https://github.com/LucasAlbertinazzi/EducaMove-demo/releases/download/v1.0.20-mobile.21/EducaMov.apk
- Demonstração do estudante: https://educamov.com.br/demonstracao/
- Apresentação interativa: https://educamov.com.br/apresentacao/
- Contrato e políticas (minutas): https://educamov.com.br/documentos/

O painel usa a API hospedada e PostgreSQL remoto. O gestor cadastra a prefeitura após entrar na Gestão de prefeituras e confere os dados antes de aprovar. Após a aprovação, o responsável confirma o e-mail, define sua senha e configura autenticação de dois fatores.

O painel atualizado permite copiar e enviar o código de licença ao contato cadastrado, com acompanhamento de solicitação, aceite e entrega no histórico. As quatro minutas de contrato e políticas permanecem para revisão antes da contratação.

O APK Android 1.0.20 usa a API HTTPS e autenticação reais, com acesso fornecido pela Secretaria de Educação. Comunicados possuem leitura persistida, atualização em primeiro plano e permissão de notificações Android no primeiro acesso e no perfil. O painel permite editar/cancelar agendamentos, acompanha solicitações novas e registra pagamentos efetuados com comprovante protegido. As telas mobile permitem enviar frequência, consultar histórico e correções, criar reembolso com comprovante na mesma transação e baixar documentos próprios autenticados. Temas claro e escuro seguem o sistema até uma escolha manual. Instalação manual com assinatura interna de homologação. As releases antigas continuam identificadas como demonstrações locais. Push iOS depende de APNs e conta Apple; lojas e WhatsApp permanecem adiados.

Ambiente gratuito de homologação: a API pode pausar por inatividade. Nenhuma credencial é pré-preenchida ou publicada. Este repositório contém artefatos de distribuição e a apresentação interativa pública; o código-fonte Flutter/API permanece privado.
