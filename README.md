# EducaMov — ambiente integrado de homologação

- Painel web: https://educamov.com.br/painel/
- API: https://api.educamov.com.br/health/ready
- APK Android 1.0.23: https://github.com/LucasAlbertinazzi/EducaMove-demo/releases/download/v1.0.23-mobile.24/EducaMov.apk
- Demonstração do estudante: https://educamov.com.br/demonstracao/
- Apresentação interativa: https://educamov.com.br/apresentacao/
- Contrato e políticas (minutas): https://educamov.com.br/documentos/

O painel usa a API hospedada e PostgreSQL remoto. O gestor cadastra a prefeitura após entrar na Gestão de prefeituras e confere os dados antes de aprovar. Após a aprovação, o responsável confirma o e-mail, define sua senha e configura autenticação de dois fatores.

O painel registra contrato/empenho, entrega e ativação, atesto e pagamento único de R$ 16.000,00 por 12 meses, com MFA e auditoria. Permite copiar e enviar o código de licença ao contato cadastrado, acompanhando solicitação, aceite e entrega no histórico. As quatro minutas de contrato e políticas permanecem para revisão antes da contratação.

O APK Android 1.0.23 usa a API HTTPS e autenticação reais, com acesso fornecido pela Secretaria de Educação. A biometria protege a reabertura e o seletor PDF preserva a confirmação do envio. Documentos permanecem em quarentena até a inspeção privada e somente cópias seguras são liberadas. API, PostgreSQL, antivírus e inspeção executam na AWS, sem depender do PC. O backup diário cifrado no S3 possui restauração testada. Comunicados possuem leitura persistida, atualização em primeiro plano e permissão de notificações Android no primeiro acesso e no perfil. O painel acompanha solicitações e registra pagamentos efetuados com comprovante protegido. Temas claro e escuro seguem o sistema até uma escolha manual. Instalação manual com assinatura interna de homologação. As releases antigas continuam identificadas como demonstrações locais. Push iOS depende de APNs e conta Apple; lojas e WhatsApp permanecem adiados.

A instância AWS usa o plano vigente com créditos. A infraestrutura tem custo contínuo e os créditos não cobrem os 12 meses da licença. Nenhuma credencial é pré-preenchida ou publicada. Este repositório contém artefatos de distribuição e a apresentação interativa pública; o código-fonte Flutter/API permanece privado.
