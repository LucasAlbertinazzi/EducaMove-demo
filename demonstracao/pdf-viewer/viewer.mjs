export function localBlob(source, origin) {
  const url = new URL(source);
  if (url.protocol !== 'blob:' || url.origin !== origin) {
    throw new Error('Origem de documento não autorizada.');
  }
  return url.href;
}

export function fittedScale(pageWidth, availableWidth, zoom) {
  if (![pageWidth, availableWidth, zoom].every(Number.isFinite) || pageWidth <= 0 || availableWidth <= 0 || zoom <= 0) {
    throw new Error('Dimensões inválidas.');
  }
  return Math.min(availableWidth / pageWidth, 1.5) * Math.min(Math.max(zoom, 0.5), 2.5);
}

async function startViewer() {
  const params = new URLSearchParams(location.search);
  document.documentElement.dataset.theme = params.get('theme') === 'dark' ? 'dark' : 'light';
  const status = document.getElementById('status');
  const canvas = document.getElementById('page');
  const controls = ['previous','next','zoom-in','zoom-out'].map(id => document.getElementById(id));
  let pdf, pageNumber = 1, zoom = 1, task, revision = 0;

  async function render() {
    const operation = ++revision;
    try {
      if (task) { task.cancel(); try { await task.promise; } catch (_) {} }
      const page = await pdf.getPage(pageNumber);
      if (operation !== revision) return;
      const viewport = page.getViewport({scale:fittedScale(page.getViewport({scale:1}).width, Math.max(innerWidth - 32, 100), zoom)});
      const ratio = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.ceil(viewport.width * ratio);
      canvas.height = Math.ceil(viewport.height * ratio);
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;
      canvas.hidden = false;
      canvas.setAttribute('aria-label', `Página ${pageNumber} de ${pdf.numPages}`);
      task = page.render({canvas, viewport, transform:ratio === 1 ? null : [ratio,0,0,ratio,0,0]});
      await task.promise;
      if (operation !== revision) return;
      status.hidden = true;
      document.getElementById('page-label').textContent = `Página ${pageNumber} de ${pdf.numPages}`;
      document.getElementById('zoom-label').textContent = `${Math.round(zoom*100)}%`;
      controls[0].disabled = pageNumber <= 1;
      controls[1].disabled = pageNumber >= pdf.numPages;
      controls[2].disabled = zoom >= 2.5;
      controls[3].disabled = zoom <= 0.5;
      const text = await page.getTextContent();
      if (operation === revision) document.getElementById('document-text').textContent = text.items.map(item => item.str || '').join(' ');
    } catch (error) {
      if (operation !== revision || error.name === 'RenderingCancelledException') return;
      status.hidden = false;
      status.textContent = 'Não foi possível exibir o PDF. Baixe o documento para consultá-lo.';
    }
  }

  try {
    const source = localBlob(params.get('file'), location.origin);
    const pdfjs = await import('../vendor/pdfjs/pdf.mjs');
    pdfjs.GlobalWorkerOptions.workerSrc = new URL('../vendor/pdfjs/pdf.worker.mjs', import.meta.url).href;
    pdf = await pdfjs.getDocument({url:source, isEvalSupported:false,
      cMapUrl:new URL('../vendor/pdfjs/cmaps/',import.meta.url).href,cMapPacked:true,
      standardFontDataUrl:new URL('../vendor/pdfjs/standard_fonts/',import.meta.url).href,
      wasmUrl:new URL('../vendor/pdfjs/wasm/',import.meta.url).href}).promise;
    controls[0].onclick = () => { if(pageNumber>1){pageNumber--;void render();} };
    controls[1].onclick = () => { if(pageNumber<pdf.numPages){pageNumber++;void render();} };
    controls[2].onclick = () => {zoom=Math.min(2.5,zoom+0.25);void render();};
    controls[3].onclick = () => {zoom=Math.max(0.5,zoom-0.25);void render();};
    addEventListener('resize',()=>void render());
    await render();
    addEventListener('pagehide',()=>void pdf.destroy(),{once:true});
  } catch (_) {
    status.textContent='Não foi possível abrir este PDF. Baixe o documento e tente novamente.';
  }
}

if (typeof document !== 'undefined') void startViewer();
