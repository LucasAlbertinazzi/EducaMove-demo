/* Cadastro incorporado Meta v4. Nenhum token empresarial é guardado no navegador. */
(function (root) {
  'use strict';
  let prepared = null, running = false;
  function trustedOrigin(origin) {
    try {
      const url = new URL(origin);
      return url.protocol === 'https:' &&
        (url.hostname === 'facebook.com' || url.hostname.endsWith('.facebook.com'));
    } catch (_) { return false; }
  }
  root.educamoveWhatsAppPrepare = async function (serialized) {
    if (running) throw new Error('Já existe uma conexão em andamento.');
    const config = JSON.parse(serialized);
    if (!/^\d{5,32}$/.test(config.app_id) || !/^\d{5,32}$/.test(config.config_id) || !/^v\d{1,3}\.0$/.test(config.api_version)) {
      throw new Error('Configuração do serviço indisponível.');
    }
    if (!root.FB) {
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Não foi possível carregar a Meta.')), 15000);
        root.fbAsyncInit = () => { clearTimeout(timeout); resolve(); };
        const script = document.createElement('script');
        script.src = 'https://connect.facebook.net/pt_BR/sdk.js';
        script.crossOrigin = 'anonymous';
        script.async = true;
        script.onerror = () => { clearTimeout(timeout); reject(new Error('Não foi possível carregar a Meta.')); };
        document.head.appendChild(script);
      });
    }
    root.FB.init({appId: config.app_id, version: config.api_version, autoLogAppEvents: false, xfbml: false});
    prepared = config;
  };
  root.educamoveWhatsAppLaunch = function () {
    if (!prepared || running) return Promise.reject(new Error('Prepare a conexão novamente.'));
    running = true;
    const configuration = prepared;
    prepared = null;
    return new Promise((resolve, reject) => {
      let assets = null, code = null, finished = false, codeTimeout = null;
      const timeout = setTimeout(() => finish(null, 'A conexão expirou. Prepare novamente.'), 10 * 60 * 1000);
      function finish(result, error) {
        if (finished) return;
        finished = true;
        clearTimeout(timeout);
        clearTimeout(codeTimeout);
        root.removeEventListener('message', message);
        running = false;
        code = null;
        error ? reject(new Error(error)) : resolve(JSON.stringify(result));
      }
      function complete() {
        if (code && assets) finish({code, ...assets});
      }
      function message(event) {
        if (!trustedOrigin(event.origin)) return;
        let data;
        try { data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data; } catch (_) { return; }
        if (!data || data.type !== 'WA_EMBEDDED_SIGNUP') return;
        if (data.event === 'CANCEL' || data.event === 'ERROR') {
          finish(null, 'Conexão cancelada na Meta.');
        } else if (['FINISH','FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING'].includes(data.event)) {
          if (!data.data || !/^\d{5,32}$/.test(data.data.waba_id) || !/^\d{5,32}$/.test(data.data.phone_number_id)) return;
          assets = {waba_id: data.data.waba_id, phone_id: data.data.phone_number_id, flow: data.event};
          complete();
        }
      }
      root.addEventListener('message', message);
      try {
        root.FB.login(response => {
          if (!response || !response.authResponse || !response.authResponse.code) {
            finish(null, 'A prefeitura não autorizou a conexão.');
            return;
          }
          code = response.authResponse.code;
          codeTimeout = setTimeout(() => finish(null, 'A autorização expirou. Prepare novamente.'), 25000);
          complete();
        }, {config_id: configuration.config_id, response_type:'code', override_default_response_type:true,
            extras:{setup:{}}});
      } catch (_) { finish(null, 'Não foi possível abrir a autorização. Permita a janela da Meta e tente novamente.'); }
    });
  };
})(window);
