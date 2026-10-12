# EducaMov — ambiente integrado de homologação

- Painel web: https://educamov.com.br/painel/
- API: https://api.educamov.com.br/health/ready
- APK Android 1.0.9: https://github.com/LucasAlbertinazzi/EducaMove-demo/releases/download/v1.0.9-mobile.10/EducaMov.apk
- Demonstração do estudante: https://educamov.com.br/demonstracao/

O painel usa a API hospedada e PostgreSQL remoto. A prefeitura solicita seu cadastro no painel e aguarda aprovação do gestor. Após a aprovação, o responsável confirma o e-mail, define sua senha e configura autenticação de dois fatores.

O APK Android 1.0.9 usa a API HTTPS e autenticação reais, com acesso fornecido pela Secretaria de Educação. As novas prefeituras ativam uma licença de 12 meses após a confirmação manual do pagamento pelo gestor. Instalação manual com assinatura interna de homologação. As releases antigas continuam identificadas como demonstrações locais. A distribuição nas lojas Android/iOS e a integração WhatsApp ainda dependem das respectivas configurações externas.

Ambiente gratuito de homologação: a API pode pausar por inatividade. Nenhuma credencial é pré-preenchida ou publicada. Este repositório contém apenas artefatos compilados; o código-fonte permanece privado.
