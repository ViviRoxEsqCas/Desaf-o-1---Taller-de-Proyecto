(() => {
  'use strict';

  const items = [...document.querySelectorAll('.db-item')];
  if (!items.length) return;

  const modal = document.createElement('div');
  modal.className = 'document-modal';
  modal.setAttribute('aria-hidden', 'true');
  modal.innerHTML = `
    <div class="document-dialog" role="dialog" aria-modal="true" aria-labelledby="documentTitle">
      <button class="document-close" type="button" aria-label="Cerrar visor">&times;</button>
      <aside class="document-details">
        <div class="document-profile">
          <img class="document-avatar" src="./assets/img/logo.jpeg" alt="Logo del proyecto">
          <div>
            <div class="document-kicker">Vivian Roxana Esquivel Castillo</div>
            <div class="document-author">Archivo de trabajo</div>
          </div>
        </div>
        <h3 id="documentTitle"></h3>
        <p class="document-description">Documento del proyecto disponible para consulta.</p>
        <div class="document-meta"><span>PDF</span><span class="document-page-label">Documento</span></div>
        <div class="document-rule"></div>
        <p class="document-note">Consulta el contenido en el visor. La página está configurada en modo solo lectura.</p>
      </aside>
      <section class="document-product" aria-label="Vista del producto">
        <div class="document-product-bar">
          <span>Vista previa</span>
          <a class="document-open-tab" href="#" target="_blank" rel="noopener noreferrer">Abrir en una pestaña nueva</a>
          <span class="document-file-type">PDF</span>
        </div>
        <div class="document-viewer" id="documentViewer"></div>
      </section>
    </div>`;
  document.body.appendChild(modal);

  const title = modal.querySelector('#documentTitle');
  const description = modal.querySelector('.document-description');
  const pageLabel = modal.querySelector('.document-page-label');
  const viewer = modal.querySelector('#documentViewer');
  const closeButton = modal.querySelector('.document-close');
  const fileType = modal.querySelector('.document-file-type');
  const openTab = modal.querySelector('.document-open-tab');

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function renderMedia(item, source, type) {
    const safeTitle = title.textContent.replace(/"/g, '&quot;');
    if (type === 'application/pdf' || /\.pdf(?:$|[?#])/i.test(source)) {
      viewer.innerHTML = `<iframe class="document-pdf" src="${source}" title="${safeTitle}"></iframe>`;
      return;
    }
    if (type.startsWith('video/') || /\.(mp4|webm|mov)(?:$|[?#])/i.test(source)) {
      viewer.innerHTML = `<video class="document-video" src="${source}" controls></video>`;
      return;
    }
    viewer.innerHTML = `<img class="document-media-image" src="${source}" alt="${safeTitle}">`;
  }

  function openModal(item) {
    const itemImage = item.querySelector('.db-cover img');
    const itemTitle = item.querySelector('.db-label');
    if (!itemImage || !itemTitle) return;

    title.textContent = itemTitle.textContent.trim();
    description.textContent = item.dataset.description || 'Documento del proyecto disponible para consulta.';
    pageLabel.textContent = item.dataset.pages || 'Documento';
    const source = item.dataset.media || item.dataset.pdf;
    const productSource = item.dataset.product;
    const mediaType = item.dataset.mediaType || (item.dataset.pdf ? 'application/pdf' : '');
    const activeSource = productSource || source;
    openTab.href = activeSource || '#';
    openTab.hidden = !activeSource;
    fileType.textContent = productSource
      ? 'SOFTWARE'
      : mediaType.startsWith('image/') || /\.(png|jpe?g|webp|gif)(?:$|[?#])/i.test(source || '')
      ? 'IMAGEN'
      : mediaType.startsWith('video/') || /\.(mp4|webm|mov)(?:$|[?#])/i.test(source || '')
        ? 'VIDEO'
        : 'PDF';
    if (productSource) {
      modal.querySelector('.document-dialog').classList.add('is-product');
      viewer.innerHTML = `<iframe class="document-product-app" src="${productSource}" title="${title.textContent}"></iframe>`;
    } else if (source) {
      modal.querySelector('.document-dialog').classList.remove('is-product');
      renderMedia(item, source, mediaType);
    } else {
      modal.querySelector('.document-dialog').classList.remove('is-product');
      viewer.innerHTML = `<div class="pdf-empty">
          <div class="pdf-symbol" aria-hidden="true">PDF</div>
          <strong>Documento PDF</strong>
          <span>El archivo PDF se mostrará aquí cuando esté vinculado al proyecto.</span>
          <img src="${itemImage.currentSrc || itemImage.src}" alt="Vista previa de ${title.textContent}">
        </div>`;
    }
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    closeButton.focus();
  }

  items.forEach((item) => {
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.setAttribute('aria-label', `Ver ${item.querySelector('.db-label')?.textContent.trim() || 'documento'}`);
    item.addEventListener('click', () => openModal(item));
    item.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openModal(item);
      }
    });
  });

  closeButton.addEventListener('click', closeModal);
  modal.addEventListener('click', (event) => {
    if (event.target === modal) closeModal();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
  });
})();
