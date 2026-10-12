# EducaMov — ambiente integrado de homologação

- Apresentação interativa: https://educamov.com.br/apresentacao/

- Painel web: https://educamov.com.br/painel/
- API: https://api.educamov.com.br/health/ready
- APK Android 1.0.10: https://github.com/LucasAlbertinazzi/EducaMove-demo/releases/download/v1.0.10-mobile.11/EducaMov.apk
- Demonstração do estudante: https://educamov.com.br/demonstracao/
- Contrato e políticas (minutas): https://educamov.com.br/documentos/

O painel usa a API hospedada e PostgreSQL remoto. O gestor cadastra a prefeitura após entrar na Gestão de prefeituras e confere os dados antes de aprovar. Após a aprovação, o responsável confirma o e-mail, define sua senha e configura autenticação de dois fatores.

O painel atualizado permite copiar e enviar o código de licença ao contato cadastrado, com acompanhamento de solicitação, aceite e entrega no histórico. As quatro minutas de contrato e políticas permanecem para revisão antes da contratação.

O APK Android 1.0.10 usa a API HTTPS e autenticação reais, com acesso fornecido pela Secretaria de Educação. As novas prefeituras ativam uma licença de 12 meses após a confirmação manual do pagamento pelo gestor. O painel oferece anexos de comprovantes, status do serviço e confiança de dispositivo por 30 dias após MFA. Instalação manual com assinatura interna de homologação. As releases antigas continuam identificadas como demonstrações locais. A distribuição nas lojas Android/iOS e a integração WhatsApp ainda dependem das respectivas configurações externas.

Ambiente gratuito de homologação: a API pode pausar por inatividade. Nenhuma credencial é pré-preenchida ou publicada. Este repositório contém artefatos de distribuição e a apresentação interativa pública; o código-fonte Flutter/API permanece privado.
