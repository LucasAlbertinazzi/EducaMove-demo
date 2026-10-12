# EducaMov — ambiente integrado de homologação

- Painel web: https://educamov.com.br/painel/
- API: https://api.educamov.com.br/health/ready
- APK Android 1.0.7: https://github.com/LucasAlbertinazzi/EducaMove-demo/releases/download/v1.0.7-mobile.8/EducaMov.apk

O painel usa a API hospedada e PostgreSQL remoto. A prefeitura solicita seu cadastro no painel e aguarda aprovação do gestor. Após a aprovação, o responsável confirma o e-mail, define sua senha e configura autenticação de dois fatores.

O APK Android 1.0.7 usa a API HTTPS e autenticação reais, com acesso fornecido pela Secretaria de Educação. Instalação manual com assinatura interna de homologação. As releases antigas continuam identificadas como demonstrações locais. A distribuição nas lojas Android/iOS e a integração WhatsApp ainda dependem das respectivas configurações externas.

Ambiente gratuito de homologação: a API pode pausar por inatividade. Nenhuma credencial é pré-preenchida ou publicada. Este repositório contém apenas artefatos compilados; o código-fonte permanece privado.

## Nova experiência do estudante — demonstração separada

- Web e iPhone/iPad: https://educamov.com.br/demonstracao/
- APK EducaMove Demo: https://github.com/LucasAlbertinazzi/EducaMove-demo/releases/download/v1.0.0-demo-feed.20261011/EducaMove-Demo.apk

Feed municipal, frequência, reembolso calculado pelo percentual anual da prefeitura,
perfil, renovação e segurança. Dados e operações fictícios para avaliação do layout.
Brotas: demo@example.com / 123456. São Carlos: demo.saocarlos@example.com / 123456.
O APK demonstrativo tem identificador próprio e pode instalar ao lado da versão integrada.
