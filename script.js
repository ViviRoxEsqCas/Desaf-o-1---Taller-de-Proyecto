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
        <div class="document-meta"><span>ARCHIVO</span><span class="document-page-label">Documento</span></div>
        <div class="document-rule"></div>
        <p class="document-note">Consulta el contenido en el visor. La página está configurada en modo solo lectura.</p>
      </aside>
      <section class="document-product" aria-label="Vista del producto">
        <div class="document-product-bar">
          <span>Vista previa</span>
          <a class="document-open-tab" href="#" target="_blank" rel="noopener noreferrer">Abrir en una pestaña nueva</a>
          <span class="document-file-type">PDF</span>
        </div>
        <div class="document-gallery" id="documentGallery" hidden>
          <button class="gallery-arrow gallery-prev" type="button" aria-label="Ver recurso anterior">&#8249;</button>
          <div class="document-gallery-stage">
            <div class="gallery-swipe-hint" aria-hidden="true"><span>&#8596;</span> Desliza para ver ambos recursos</div>
            <div class="document-viewer" id="documentViewer"></div>
          </div>
          <button class="gallery-arrow gallery-next" type="button" aria-label="Ver siguiente recurso">&#8250;</button>
          <div class="gallery-status" aria-live="polite"><span class="gallery-current">1</span>/2 <span class="gallery-resource-label">Imagen</span></div>
        </div>
        <div class="document-viewer document-viewer-regular" id="documentViewerRegular"></div>
      </section>
    </div>`;
  document.body.appendChild(modal);

  const title = modal.querySelector('#documentTitle');
  const description = modal.querySelector('.document-description');
  const pageLabel = modal.querySelector('.document-page-label');
  const viewer = modal.querySelector('#documentViewer');
  const regularViewer = modal.querySelector('#documentViewerRegular');
  const gallery = modal.querySelector('#documentGallery');
  const galleryStage = modal.querySelector('.document-gallery-stage');
  const galleryCurrent = modal.querySelector('.gallery-current');
  const galleryLabel = modal.querySelector('.gallery-resource-label');
  const galleryPrev = modal.querySelector('.gallery-prev');
  const galleryNext = modal.querySelector('.gallery-next');
  const closeButton = modal.querySelector('.document-close');
  const fileType = modal.querySelector('.document-file-type');
  const openTab = modal.querySelector('.document-open-tab');
  let galleryIndex = 0;
  let galleryItems = [];
  let touchStartX = 0;

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

  function renderGalleryItem() {
    const resource = galleryItems[galleryIndex];
    if (!resource) return;
    galleryCurrent.textContent = String(galleryIndex + 1);
    galleryLabel.textContent = resource.label;
    openTab.href = resource.source;
    openTab.hidden = false;
    if (resource.type === 'pdf') {
      viewer.innerHTML = `<iframe class="document-pdf" src="${resource.source}" title="${title.textContent} - ${resource.label}"></iframe>`;
    } else {
      viewer.innerHTML = `<img class="document-media-image" src="${resource.source}" alt="${title.textContent} - ${resource.label}">`;
    }
    galleryPrev.disabled = galleryIndex === 0;
    galleryNext.disabled = galleryIndex === galleryItems.length - 1;
    galleryStage.classList.remove('is-sliding');
    void galleryStage.offsetWidth;
    galleryStage.classList.add('is-sliding');
  }

  function openGallery(item) {
    galleryItems = [
      { source: item.dataset.galleryImage, type: 'image', label: 'Imagen' },
      { source: item.dataset.galleryPdf, type: 'pdf', label: 'PDF' },
    ].filter((resource) => resource.source);
    if (galleryItems.length < 2) return false;
    galleryIndex = 0;
    modal.querySelector('.document-dialog').classList.remove('is-product', 'is-video');
    regularViewer.hidden = true;
    gallery.hidden = false;
    galleryIndex = 0;
    renderGalleryItem();
    return true;
  }

  function openModal(item) {
    const itemTitle = item.querySelector('.db-label');
    if (!itemTitle) return;

    title.textContent = itemTitle.textContent.trim();
    description.textContent = item.dataset.description || 'Documento del proyecto disponible para consulta.';
    pageLabel.textContent = item.dataset.pages || 'Documento';
    const source = item.dataset.media || item.dataset.pdf;
    const productSource = item.dataset.product;
    const mediaType = item.dataset.mediaType || (item.dataset.pdf ? 'application/pdf' : '');
    const isVideo = mediaType.startsWith('video/') || /\.(mp4|webm|mov)(?:$|[?#])/i.test(source || '');
    const activeSource = productSource || source;
    regularViewer.hidden = false;
    gallery.hidden = true;
    if (openGallery(item)) {
      fileType.textContent = 'MOCKUP';
    } else {
      regularViewer.innerHTML = '';
    }
    if (gallery.hidden === false) {
      modal.classList.add('is-open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      closeButton.focus();
      return;
    }
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
      modal.querySelector('.document-dialog').classList.remove('is-video');
      regularViewer.innerHTML = `<iframe class="document-product-app" src="${productSource}" title="${title.textContent}"></iframe>`;
    } else if (source) {
      modal.querySelector('.document-dialog').classList.remove('is-product');
      modal.querySelector('.document-dialog').classList.toggle('is-video', isVideo);
      const previousViewer = viewer;
      renderMedia(item, source, mediaType);
      regularViewer.innerHTML = previousViewer.innerHTML;
      viewer.innerHTML = '';
    } else {
      modal.querySelector('.document-dialog').classList.remove('is-product');
      modal.querySelector('.document-dialog').classList.toggle('is-video', isVideo);
      regularViewer.innerHTML = `<div class="pdf-empty ${isVideo ? 'video-empty' : ''}">
          <div class="pdf-symbol" aria-hidden="true">${isVideo ? '▶' : 'PDF'}</div>
          <strong>${isVideo ? 'Video de presentación' : 'Documento PDF'}</strong>
          <span>El archivo ${isVideo ? 'de video se mostrará' : 'PDF se mostrará'} aquí cuando esté vinculado al proyecto.</span>
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
  galleryPrev.addEventListener('click', () => {
    if (galleryIndex > 0) { galleryIndex -= 1; renderGalleryItem(); }
  });
  galleryNext.addEventListener('click', () => {
    if (galleryIndex < galleryItems.length - 1) { galleryIndex += 1; renderGalleryItem(); }
  });
  galleryStage.addEventListener('touchstart', (event) => {
    touchStartX = event.changedTouches[0].screenX;
  }, { passive: true });
  galleryStage.addEventListener('touchend', (event) => {
    const distance = event.changedTouches[0].screenX - touchStartX;
    if (Math.abs(distance) < 40) return;
    if (distance < 0) galleryNext.click();
    else galleryPrev.click();
  }, { passive: true });
  modal.addEventListener('click', (event) => {
    if (event.target === modal) closeModal();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
    if (modal.classList.contains('is-open') && !gallery.hidden) {
      if (event.key === 'ArrowLeft') galleryPrev.click();
      if (event.key === 'ArrowRight') galleryNext.click();
    }
  });
})();
