/* HOSPITAL ESPAÇO DA PLÁSTICA — interações globais */
(() => {
  'use strict';

  /* ---------- Nav: fundo ao rolar ---------- */
  const nav = document.querySelector('.nav');
  const onScroll = () => nav && nav.classList.toggle('scrolled', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Menu overlay ---------- */
  const burger = document.querySelector('.burger');
  if (burger) {
    burger.addEventListener('click', () => {
      document.documentElement.classList.toggle('menu-open');
    });
    document.querySelectorAll('.menu a').forEach(a =>
      a.addEventListener('click', () => document.documentElement.classList.remove('menu-open'))
    );
  }

  /* ---------- Reveals ao rolar ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.rv').forEach(el => io.observe(el));

  /* ---------- Contadores editoriais ---------- */
  const cio = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      cio.unobserve(e.target);
      const el = e.target;
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const dur = 1600, t0 = performance.now();
      const step = (t) => {
        const p = Math.min((t - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 4);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-count]').forEach(el => cio.observe(el));

  /* ---------- WhatsApp com mensagem contextual ---------- */
  // Qualquer elemento com [data-wa] abre o WhatsApp oficial com mensagem pré-preenchida.
  const WA_PHONE = '5567998834444';
  document.querySelectorAll('[data-wa]').forEach(el => {
    el.addEventListener('click', (ev) => {
      ev.preventDefault();
      const msg = el.dataset.wa || '¡Hola! Vengo del sitio web y me gustaría agendar una evaluación.';
      window.open(`https://api.whatsapp.com/send?phone=${WA_PHONE}&text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
    });
  });

  /* ---------- Formulários de lead → WhatsApp ---------- */
  // Sem backend na v1: o form redige a mensagem e envia pro WhatsApp oficial.
  document.querySelectorAll('form[data-lead]').forEach(form => {
    form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const d = new FormData(form);
      const nome = (d.get('nome') || '').toString().trim();
      const interesse = (d.get('interesse') || form.dataset.lead || '').toString().trim();
      const obs = (d.get('mensagem') || '').toString().trim();
      let msg;
      if (form.dataset.leadMode === 'b2b') {
        // Lead profissional (ex.: médico interessado em operar no hospital)
        msg = `¡Hola! Soy ${nome || 'médico(a)'}${interesse ? ` (${interesse})` : ''} y me gustaría conocer la estructura del hospital para realizar procedimientos.`;
        if (obs) msg += ` ${obs}`;
      } else {
        msg = `¡Hola! Soy ${nome || 'paciente que viene del sitio web'} y me gustaría agendar una evaluación`;
        if (interesse) msg += ` sobre ${interesse}`;
        msg += '.';
        if (obs) msg += ` ${obs}`;
      }
      window.open(`https://api.whatsapp.com/send?phone=${WA_PHONE}&text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
      const ok = form.querySelector('.form-ok');
      if (ok) { ok.hidden = false; form.reset(); }
    });
  });

  /* ---------- Mapa-resumo (organograma clicável, presente em todas as páginas) ---------- */
  // Botão flutuante "Resumo" -> overlay com o organograma de tudo que o hospital faz.
  // Cada quadro é um botão que leva à página daquele procedimento (dados: /data/especialidades.json).
  // Raiz do site autodetectada a partir do próprio script (funciona em domínio raiz E em subpasta/preview)
  const RAIZ = '/es/';
  const GRUPO_ORDEM = ['Mamas', 'Cuerpo', 'Rostro', 'Íntima', 'Capilar', 'No quirúrgico', 'Tecnología'];
  const TOPO = [
    ['El Hospital', RAIZ + 'estrutura/'], ['Cuerpo Clínico', RAIZ + 'medicos/'], ['Seguridad', RAIZ + 'seguranca/'],
    ['Hotelería', RAIZ + 'hotelaria/'], ['Simuladores', RAIZ + 'simuladores/'],
    ['Blog', RAIZ + 'blog/'], ['Contacto', RAIZ + 'contato/'],
  ];

  const mapaBtn = document.createElement('button');
  mapaBtn.className = 'mapa-btn';
  mapaBtn.setAttribute('aria-label', 'Abrir el resumen del sitio — mapa de procedimientos');
  mapaBtn.innerHTML = '<svg viewBox="0 0 16 16"><rect x="5.5" y="1" width="5" height="3.6"/><rect x="1" y="11.4" width="5" height="3.6"/><rect x="10" y="11.4" width="5" height="3.6"/><path d="M8 4.6v3M3.5 11.4V7.6h9v3.8"/></svg><span class="lbl">Resumen</span>';
  document.body.appendChild(mapaBtn);

  let mapaEl = null;
  const montarMapa = (dados) => {
    const grupos = {};
    dados.forEach(e => { (grupos[e.grupo] = grupos[e.grupo] || []).push(e); });
    const ordem = GRUPO_ORDEM.filter(g => grupos[g]).concat(Object.keys(grupos).filter(g => !GRUPO_ORDEM.includes(g)));
    const el = document.createElement('div');
    el.className = 'mapa';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', 'Resumen del sitio');
    el.innerHTML = `
      <button class="mapa-close" aria-label="Cerrar el resumen">✕</button>
      <div class="mapa-inner">
        <p class="overline">Resumen del sitio</p>
        <h2 class="mt-2">Todo lo que hacemos, en <em>un solo lugar</em>.</h2>
        <div class="mapa-topo">${TOPO.map(([n, u]) => `<a href="${u}">${n}</a>`).join('')}</div>
        <div class="mapa-tree">
          ${ordem.map(g => `
            <div class="mapa-grupo">
              <h3>${g} <small>${grupos[g].length}</small></h3>
              <ul>${grupos[g].map(e => `<li class="mapa-no"><a href="${RAIZ}especialidades/${e.slug}.html">${e.nome} <span class="arr">→</span></a></li>`).join('')}</ul>
            </div>`).join('')}
        </div>
      </div>`;
    el.querySelector('.mapa-close').addEventListener('click', () => el.classList.remove('open'));
    el.addEventListener('click', (e) => { if (e.target === el) el.classList.remove('open'); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') el.classList.remove('open'); });
    return el;
  };

  mapaBtn.addEventListener('click', async () => {
    if (!mapaEl) {
      try {
        const resp = await fetch('/data/especialidades-es-names.json');
        mapaEl = montarMapa(await resp.json());
        document.body.appendChild(mapaEl);
      } catch {
        window.location.href = RAIZ + 'especialidades/'; // degradação graciosa: vai pro hub
        return;
      }
    }
    setTimeout(() => mapaEl.classList.add('open'), 20);
  });

  /* ---------- Espaços reservados (fotos em produção) ---------- */
  // Foto ausente NÃO vira moldura quebrada: o contêiner .ph vira um "espaço reservado"
  // elegante com o nome do ambiente (alt da imagem). Preenche-se depois só trocando o arquivo.
  const marcarVazio = (img) => {
    const ph = img.closest('.ph');
    if (!ph) return;
    ph.classList.add('ph-vazio');
    const rotulo = (img.getAttribute('alt') || 'Fotografía').split('—')[0].trim();
    ph.setAttribute('data-rotulo', rotulo);
  };
  document.addEventListener('error', (e) => {
    if (e.target && e.target.tagName === 'IMG') marcarVazio(e.target);
  }, true);
  // varredura pós-carga: pega 404s que dispararam antes do listener existir
  window.addEventListener('load', () => {
    document.querySelectorAll('.ph img').forEach(img => {
      if (img.complete && img.naturalWidth === 0) marcarVazio(img);
    });
  });

  /* ---------- Ano no footer ---------- */
  const y = document.querySelector('[data-year]');
  if (y) y.textContent = new Date().getFullYear();
})();
