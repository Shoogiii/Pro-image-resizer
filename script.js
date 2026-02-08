const dropzone = document.getElementById('dropzone');
const fileInput = document.getElementById('fileInput');
const pickFiles = document.getElementById('pickFiles');
const previewGrid = document.getElementById('previewGrid');
const formatSelect = document.getElementById('format');
const qualityRange = document.getElementById('quality');
const qualText = document.getElementById('qualText');
const widthInput = document.getElementById('widthInput');
const heightInput = document.getElementById('heightInput');
const keepRatio = document.getElementById('keepRatio');
const processBtn = document.getElementById('processBtn');
const toastRoot = document.getElementById('toastRoot');

// New Controls
const brightnessRange = document.getElementById('brightness');
const contrastRange = document.getElementById('contrast');
const saturationRange = document.getElementById('saturation');
const sepiaRange = document.getElementById('sepia');
const grayscaleRange = document.getElementById('grayscale');
const blurRange = document.getElementById('blur');

const brightVal = document.getElementById('brightVal');
const contrastVal = document.getElementById('contrastVal');
const satVal = document.getElementById('satVal');
const sepiaVal = document.getElementById('sepiaVal');
const grayVal = document.getElementById('grayVal');
const blurVal = document.getElementById('blurVal');

const sharpenCheck = document.getElementById('sharpen');
const resetFiltersBtn = document.getElementById('resetFiltersBtn');

// Transform controls
const rotateLeftBtn = document.getElementById('rotateLeftBtn');
const rotateRightBtn = document.getElementById('rotateRightBtn');
const flipHBtn = document.getElementById('flipHBtn');
const flipVBtn = document.getElementById('flipVBtn');

let files = [];
let rotation = 0;
let flipH = 1;
let flipV = 1;

// Templates
document.querySelectorAll('.template-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    widthInput.value = btn.dataset.w;
    heightInput.value = btn.dataset.h;
    // Uncheck keep ratio to allow exact fit if needed, or keep it?
    // Usually templates imply exact dimensions.
    // keepRatio.checked = false; 
    // Let's notify user or just set it.
    toast(`${translations[currentLang].templateApplied}: ${btn.dataset.w}x${btn.dataset.h}`, 'success', 2000);
  });
});

// Toast
function toast(msg, type = 'info', ms = 3000) {
  const n = document.createElement('div');
  n.className = 'toast';

  let icon = '<i class="fa-solid fa-info-circle" style="margin-right:8px"></i>';
  if (type === 'success') icon = '<i class="fa-solid fa-check-circle" style="margin-right:8px; color:#4ade80"></i>';
  if (type === 'error') icon = '<i class="fa-solid fa-triangle-exclamation" style="margin-right:8px; color:#f87171"></i>';

  n.innerHTML = icon + msg;
  toastRoot.appendChild(n);
  setTimeout(() => {
    n.style.opacity = '0';
    n.style.transform = 'translateY(20px)';
    setTimeout(() => n.remove(), 300);
  }, ms);
}

// Transform Events
rotateLeftBtn.addEventListener('click', () => { rotation -= 90; updatePreviewTransforms(); });
rotateRightBtn.addEventListener('click', () => { rotation += 90; updatePreviewTransforms(); });
flipHBtn.addEventListener('click', () => { flipH *= -1; updatePreviewTransforms(); });
flipVBtn.addEventListener('click', () => { flipV *= -1; updatePreviewTransforms(); });

function updatePreviewTransforms() {
  const images = document.querySelectorAll('.thumb img');
  const b = brightnessRange.value;
  const c = contrastRange.value;
  const s = saturationRange.value;
  const sep = sepiaRange.value;
  const g = grayscaleRange.value;
  const bl = blurRange.value;

  images.forEach(img => {
    img.style.transform = `rotate(${rotation}deg) scaleX(${flipH}) scaleY(${flipV})`;
    img.style.filter = `brightness(${b}%) contrast(${c}%) saturate(${s}%) sepia(${sep}%) grayscale(${g}%) blur(${bl}px)`;
  });
}

// Filter Events
brightnessRange.addEventListener('input', () => { brightVal.textContent = brightnessRange.value + '%'; updatePreviewTransforms(); });
contrastRange.addEventListener('input', () => { contrastVal.textContent = contrastRange.value + '%'; updatePreviewTransforms(); });
saturationRange.addEventListener('input', () => { satVal.textContent = saturationRange.value + '%'; updatePreviewTransforms(); });
sepiaRange.addEventListener('input', () => { sepiaVal.textContent = sepiaRange.value + '%'; updatePreviewTransforms(); });
grayscaleRange.addEventListener('input', () => { grayVal.textContent = grayscaleRange.value + '%'; updatePreviewTransforms(); });
blurRange.addEventListener('input', () => { blurVal.textContent = blurRange.value + 'px'; updatePreviewTransforms(); });

// Reset Filters
resetFiltersBtn.addEventListener('click', () => {
  brightnessRange.value = 100; brightVal.textContent = '100%';
  contrastRange.value = 100; contrastVal.textContent = '100%';
  saturationRange.value = 100; satVal.textContent = '100%';
  sepiaRange.value = 0; sepiaVal.textContent = '0%';
  grayscaleRange.value = 0; grayVal.textContent = '0%';
  blurRange.value = 0; blurVal.textContent = '0px';
  sharpenCheck.checked = false;

  // Also reset rotation/flip? Maybe user wants to keep them.
  // Let's reset for full "clean slate"
  rotation = 0; flipH = 1; flipV = 1;
  updatePreviewTransforms();

  toast(translations[currentLang].filtersReset, 'info');
});

// Dosya ekleme
pickFiles.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', e => addFiles([...e.target.files]));

dropzone.addEventListener('dragover', e => {
  e.preventDefault();
  dropzone.classList.add('drag');
});

dropzone.addEventListener('dragleave', e => {
  dropzone.classList.remove('drag');
});

dropzone.addEventListener('drop', e => {
  e.preventDefault();
  dropzone.classList.remove('drag');
  addFiles([...e.dataTransfer.files]);
});

function addFiles(flist) {
  let added = 0;
  flist.forEach(f => {
    if (f.type.startsWith('image/')) {
      files.push({
        file: f,
        objectURL: URL.createObjectURL(f),
        size: (f.size / 1024).toFixed(1) + ' KB',
        isNew: true
      });
      added++;
    } else {
      toast(translations[currentLang].toastOnlyImages, 'error');
    }
  });
  if (added > 0) renderGrid();
}

function renderGrid() {
  const newFilesIndices = files.map((f, i) => f.isNew ? i : -1).filter(i => i !== -1);
  const dropzoneRect = dropzone.getBoundingClientRect();

  previewGrid.innerHTML = '';
  files.forEach((f, index) => {
    const div = document.createElement('div');
    div.className = 'thumb';

    // Remove button
    const removeBtn = document.createElement('div');
    removeBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
    removeBtn.style.cssText = 'position:absolute; top:4px; right:4px; background:rgba(0,0,0,0.6); color:white; width:20px; height:20px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:12px; z-index:10;';
    removeBtn.onclick = (e) => {
      e.stopPropagation();
      files.splice(index, 1);
      renderGrid();
    };

    // Info Badge (Size)
    const infoBadge = document.createElement('div');
    infoBadge.textContent = f.size;
    infoBadge.style.cssText = 'position:absolute; bottom:4px; left:4px; background:rgba(0,0,0,0.6); color:white; padding:2px 6px; border-radius:4px; font-size:10px; z-index:10;';

    const img = document.createElement('img');
    img.src = f.objectURL;
    img.style.transform = `rotate(${rotation}deg) scaleX(${flipH}) scaleY(${flipV})`;
    img.style.transition = 'transform 0.3s ease';

    div.appendChild(removeBtn);
    div.appendChild(infoBadge);
    div.appendChild(img);

    img.onload = () => {
      const dimBadge = document.createElement('div');
      dimBadge.textContent = `${img.naturalWidth}x${img.naturalHeight}`;
      dimBadge.style.cssText = 'position:absolute; bottom:4px; right:4px; background:rgba(0,0,0,0.6); color:white; padding:2px 6px; border-radius:4px; font-size:10px; z-index:10;';
      div.appendChild(dimBadge);
      updatePreviewTransforms();

      // Trigger Flight Animation if it's a new file
      if (f.isNew) {
        f.isNew = false; // Mark as no longer new
        const targetRect = div.getBoundingClientRect();

        const flyer = document.createElement('div');
        flyer.className = 'flying-thumb';
        flyer.style.width = '100px';
        flyer.style.height = '100px';
        flyer.style.left = (dropzoneRect.left + dropzoneRect.width / 2 - 50) + 'px';
        flyer.style.top = (dropzoneRect.top + dropzoneRect.height / 2 - 50) + 'px';

        const flyerImg = document.createElement('img');
        flyerImg.src = f.objectURL;
        flyerImg.style.width = '100%';
        flyerImg.style.height = '100%';
        flyerImg.style.objectFit = 'cover';
        flyer.appendChild(flyerImg);

        document.body.appendChild(flyer);

        // Hide the actual grid thumb temporarily
        div.style.opacity = '0';

        // Use timeout to ensure DOM placement before animation
        setTimeout(() => {
          flyer.style.left = targetRect.left + 'px';
          flyer.style.top = targetRect.top + 'px';
          flyer.style.width = targetRect.width + 'px';
          flyer.style.height = targetRect.height + 'px';
          flyer.style.opacity = '0.8';

          setTimeout(() => {
            div.style.opacity = '1';
            div.style.animation = 'fadeIn 0.4s ease-out';
            flyer.remove();
          }, 700);
        }, 10);
      }
    };

    previewGrid.appendChild(div);
  });
}

function calculateSize(img) {
  let targetW = parseInt(widthInput.value) || img.width;
  let targetH = parseInt(heightInput.value) || img.height;

  // Eğer rotate 90 veya 270 ise boyutları takas etmemiz gerekebilir (mantıksal olarak)
  // Ancak canvas rotate işlemi yapacağımız için, tuval boyutunu doğru ayarlamalıyız.
  // Kullanıcı boyut girmişse, bu boyut ÇIKTI boyutudur.

  if (keepRatio.checked) {
    if (widthInput.value && !heightInput.value) {
      targetH = Math.round(img.height * (targetW / img.width));
      heightInput.value = targetH;
    }
    else if (heightInput.value && !widthInput.value) {
      targetW = Math.round(img.width * (targetH / img.height));
      widthInput.value = targetW;
    }
  }
  return { targetW, targetH };
}

// Sharpening Kernel
function sharpenImage(ctx, w, h, mix) {
  const weights = [0, -1, 0, -1, 5, -1, 0, -1, 0];
  const katet = Math.round(Math.sqrt(weights.length));
  const half = (katet * 0.5) | 0;

  const dstData = ctx.createImageData(w, h);
  const dstBuff = dstData.data;
  const srcBuff = ctx.getImageData(0, 0, w, h).data;
  let y = h;

  while (y--) {
    let x = w;
    while (x--) {
      const sy = y;
      const sx = x;
      const dstOff = (y * w + x) * 4;
      let r = 0, g = 0, b = 0, a = 0;

      for (let cy = 0; cy < katet; cy++) {
        for (let cx = 0; cx < katet; cx++) {
          const scy = sy + cy - half;
          const scx = sx + cx - half;
          if (scy >= 0 && scy < h && scx >= 0 && scx < w) {
            const srcOff = (scy * w + scx) * 4;
            const wt = weights[cy * katet + cx];
            r += srcBuff[srcOff] * wt;
            g += srcBuff[srcOff + 1] * wt;
            b += srcBuff[srcOff + 2] * wt;
            a += srcBuff[srcOff + 3] * wt;
          }
        }
      }
      dstBuff[dstOff] = r * mix + srcBuff[dstOff] * (1 - mix);
      dstBuff[dstOff + 1] = g * mix + srcBuff[dstOff + 1] * (1 - mix);
      dstBuff[dstOff + 2] = b * mix + srcBuff[dstOff + 2] * (1 - mix);
      dstBuff[dstOff + 3] = srcBuff[dstOff + 3];
    }
  }
  ctx.putImageData(dstData, 0, 0);
}

function processFile(fileObj, callback) {
  const img = new Image();
  img.onload = () => {
    // 1. Calculate dimensions
    const { targetW, targetH } = calculateSize(img);

    // 2. Prepare Canvas
    // Rotation logic: if 90 or 270, swap w/h for the canvas container? 
    // Basitlik için: Kullanıcının girdiği width/height, SONUÇ resminin width/height'ıdır.
    // Ancak resmi 'rotate' edip çizmemiz lazım.

    const canvas = document.createElement('canvas');

    // Eğer 90-270 derece döndürülmüşse ve en boy oranı korunuyorsa mantık karmaşıklaşabilir.
    // Basit yaklaşım: Tuvali hedef boyuta ayarla.
    canvas.width = targetW;
    canvas.height = targetH;

    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // 3. Apply Filters
    const b = brightnessRange.value;
    const c = contrastRange.value;
    const s = saturationRange.value;
    const sep = sepiaRange.value;
    const g = grayscaleRange.value;
    const bl = blurRange.value;

    ctx.filter = `brightness(${b}%) contrast(${c}%) saturate(${s}%) sepia(${sep}%) grayscale(${g}%) blur(${bl}px)`;

    // 4. Draw & Transform
    ctx.save();

    // Center logic
    ctx.translate(targetW / 2, targetH / 2);
    ctx.rotate(rotation * Math.PI / 180);
    ctx.scale(flipH, flipV);

    // Resmin tuvale sığması için draw mantığı.
    // Eğer döndürülmüşse çizilecek resmin en/boyu yer değiştirmeli mi?
    // Kullanıcının girdiği boyut, dönmüş resmin son hali olmalı.
    // O yüzden resmi çizdirirken eğer 90/270 ise boyutlar sw ap olmalı.

    const isRotated = (Math.abs(rotation / 90) % 2 === 1);
    if (isRotated) {
      ctx.drawImage(img, -targetH / 2, -targetW / 2, targetH, targetW);
    } else {
      ctx.drawImage(img, -targetW / 2, -targetH / 2, targetW, targetH);
    }

    ctx.restore();

    // 5. Sharpening (Optional)
    if (sharpenCheck.checked) {
      sharpenImage(ctx, targetW, targetH, 0.3);
    }

    // 6. Watermark
    const enableWm = document.getElementById('enableWatermark').checked;
    if (enableWm) {
      const text = document.getElementById('wmText').value || '© Watermark';
      const color = document.getElementById('wmColor').value;
      const opacity = document.getElementById('wmOpacity').value;
      const pos = document.getElementById('wmPosition').value;

      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.fillStyle = color;

      // Font size relative to image height (e.g., 5%)
      const fontSize = Math.max(12, targetH * 0.05);
      ctx.font = `bold ${fontSize}px sans-serif`;

      const metrics = ctx.measureText(text);
      const textW = metrics.width;
      const textH = fontSize; // approx
      const pad = targetW * 0.02;

      let x = 0, y = 0;

      switch (pos) {
        case 'top-left': x = pad; y = textH + pad; break;
        case 'top-right': x = targetW - textW - pad; y = textH + pad; break;
        case 'bottom-left': x = pad; y = targetH - pad; break;
        case 'bottom-right': x = targetW - textW - pad; y = targetH - pad; break;
        case 'center': x = (targetW - textW) / 2; y = (targetH + textH) / 2; break;
      }

      // Add shadow for better visibility
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      ctx.fillText(text, x, y);
      ctx.restore();
    }

    canvas.toBlob(
      blob => callback(blob),
      formatSelect.value === 'original' ? fileObj.file.type : 'image/' + formatSelect.value,
      qualityRange.value / 100
    );
  };
  img.src = fileObj.objectURL;
}

// Watermark UI Toggle
document.getElementById('enableWatermark').addEventListener('change', (e) => {
  document.getElementById('watermarkControls').style.display = e.target.checked ? 'block' : 'none';
});

// Helper for native download
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

// Bireysel İndirme
processBtn.addEventListener('click', () => {
  if (!files.length) {
    toast(translations[currentLang].toastNoFiles, 'error');
    return;
  }

  processBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> ${translations[currentLang].processBtnProcessing}`;

  let processed = 0;

  files.forEach((f, index) => processFile(f, blob => {
    // Determine extension
    let ext = formatSelect.value;
    if (ext === 'original') {
      ext = f.file.name.split('.').pop();
    }

    let finalName = '';
    const pattern = document.getElementById('filenamePattern').value.trim();

    if (pattern) {
      // Replace {n} with index+1
      const namePart = pattern.replace('{n}', index + 1);
      finalName = `${namePart}.${ext}`;
    } else {
      const originalName = f.file.name.substring(0, f.file.name.lastIndexOf('.')) || f.file.name;
      finalName = `${originalName}_resized.${ext}`;
    }

    // Download immediately
    downloadBlob(blob, finalName);
    processed++;

    if (processed === files.length) {
      toast(translations[currentLang].toastDownloaded, 'success');
      processBtn.innerHTML = `<span class="btn-content"><i class="fa-solid fa-check"></i> <span>${translations[currentLang].processBtnDone}</span></span>`;
      setTimeout(() => {
        processBtn.innerHTML = `<span class="btn-content"><i class="fa-solid fa-bolt"></i> <span>${translations[currentLang].processBtn}</span></span><div class="btn-glow"></div>`;
      }, 3000);
    }
  }));
});

// Kalite göstergesi güncelleme
qualityRange.addEventListener('input', () => {
  qualText.textContent = qualityRange.value + '%';
});

// Language Dictionary
const translations = {
  tr: {
    appDesc: 'Görsellerinizi saniyeler içinde mükemmelleştirin.',
    dropText: 'Dosyaları Buraya Sürükleyin',
    or: 'veya',
    pickFiles: 'Dosya Seç',
    pickFiles: 'Dosya Seç',
    supportText: 'PNG, JPG, WEBP desteklenir',
    templatesLabel: 'Hazır Şablonlar',
    templateApplied: 'Şablon uygulandı',
    sizeHeader: 'Boyut & Yön',
    widthLabel: 'Genişlik',
    heightLabel: 'Yükseklik',
    keepRatio: 'Oranı Koru',
    effectsHeader: 'Efektler & Çıktı',
    brightness: 'Parlaklık',
    contrast: 'Kontrast',
    sharpenLabel: 'Ekstra Keskinlik',
    formatLabel: 'Format',
    originalFormat: 'Orijinal Format',
    qualityLabel: 'Kalite',
    processBtn: 'İşle ve İndir',
    processBtnProcessing: 'İşleniyor...',
    processBtnDone: 'Tamamlandı',
    toastOnlyImages: 'Sadece resim dosyaları kabul edilir',
    toastNoFiles: 'Lütfen önce dosya ekleyin',
    toastDownloaded: 'İndirme başlatıldı!',
    rotateLeft: 'Sola Döndür',
    rotateRight: 'Sağa Döndür',
    flipH: 'Yatay Çevir',
    flipV: 'Dikey Çevir',
    filenameLabel: 'Dosya Adı (örn: tatil_{n})',
    watermarkHeader: 'Filigran',
    enableWatermark: 'Filigran Ekle',
    watermarkText: 'Metin',
    wmColor: 'Renk',
    wmOpacity: 'Opaklık',
    wmPosition: 'Konum',
    saturation: 'Doygunluk',
    sepia: 'Sepya',
    grayscale: 'Siyah-Beyaz',
    blur: 'Bulanıklık',
    resetFilters: 'Ayarları Sıfırla',
    filtersReset: 'Ayarlar sıfırlandı.',
    pageTitle: 'Pro Fotoğraf Düzenleyici'
  },
  en: {
    appDesc: 'Perfect your images in seconds.',
    dropText: 'Drag Files Here',
    or: 'or',
    pickFiles: 'Pick Files',
    pickFiles: 'Pick Files',
    supportText: 'PNG, JPG, WEBP supported',
    templatesLabel: 'Templates',
    templateApplied: 'Template applied',
    sizeHeader: 'Size & Orientation',
    widthLabel: 'Width',
    heightLabel: 'Height',
    keepRatio: 'Maintain Aspect Ratio',
    effectsHeader: 'Effects & Output',
    brightness: 'Brightness',
    contrast: 'Contrast',
    sharpenLabel: 'Extra Sharpness',
    formatLabel: 'Format',
    originalFormat: 'Original Format',
    qualityLabel: 'Quality',
    processBtn: 'Process & Download',
    processBtnProcessing: 'Processing...',
    processBtnDone: 'Done',
    toastOnlyImages: 'Only image files are accepted',
    toastNoFiles: 'Please add files first',
    toastDownloaded: 'Download started!',
    rotateLeft: 'Rotate Left',
    rotateRight: 'Rotate Right',
    flipH: 'Flip Horizontal',
    flipV: 'Flip Vertical',
    filenameLabel: 'Filename Pattern (e.g. img_{n})',
    watermarkHeader: 'Watermark',
    enableWatermark: 'Add Watermark',
    watermarkText: 'Text',
    wmColor: 'Color',
    wmOpacity: 'Opacity',
    wmPosition: 'Position',
    saturation: 'Saturation',
    sepia: 'Sepia',
    grayscale: 'Grayscale',
    blur: 'Blur',
    resetFilters: 'Reset Settings',
    filtersReset: 'Settings reset.',
    pageTitle: 'Pro Photo Editor'
  }
};

let currentLang = 'tr';

const langBtn = document.getElementById('langBtn');
const langText = document.getElementById('langText');

langBtn.addEventListener('click', () => {
  currentLang = currentLang === 'tr' ? 'en' : 'tr';
  updateLanguage();
});

function updateLanguage() {
  langText.textContent = currentLang.toUpperCase();

  // Update all data-i18n elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[currentLang][key]) {
      el.textContent = translations[currentLang][key];
    }
  });

  // Update tooltips for buttons
  rotateLeftBtn.title = translations[currentLang].rotateLeft;
  rotateRightBtn.title = translations[currentLang].rotateRight;
  flipHBtn.title = translations[currentLang].flipH;
  flipVBtn.title = translations[currentLang].flipV;
  document.title = translations[currentLang].pageTitle;
}

// Input temizleme helper (seçenek)
widthInput.addEventListener('input', () => {
  if (!widthInput.value && keepRatio.checked) heightInput.value = '';
});

heightInput.addEventListener('input', () => {
  if (!heightInput.value && keepRatio.checked) widthInput.value = '';
});

// Theme Logic
const themes = {
  purple: { primary: '#6366f1', accent: '#a855f7' },
  blue: { primary: '#3b82f6', accent: '#06b6d4' },
  orange: { primary: '#f97316', accent: '#ec4899' },
  green: { primary: '#10b981', accent: '#84cc16' }
};

document.querySelectorAll('.theme-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    applyTheme(btn.dataset.color);
  });
});

function applyTheme(colorName) {
  if (!themes[colorName]) return;
  const t = themes[colorName];
  document.documentElement.style.setProperty('--primary', t.primary);
  document.documentElement.style.setProperty('--primary-hover', t.primary);
  document.documentElement.style.setProperty('--accent', t.accent);

  // Update Orbs manually if they don't update (they should via CSS var)
  localStorage.setItem('resizer_theme', colorName);
}

// Init Theme
const savedTheme = localStorage.getItem('resizer_theme');
if (savedTheme) applyTheme(savedTheme);

// Accordion Logic
document.querySelectorAll('.section-header').forEach(header => {
  header.addEventListener('click', () => {
    const section = header.parentElement;
    section.classList.toggle('collapsed');
  });
});

// Cursor Glow Effect Removed
// Mouse Particle Effect (Diamond Constellation)
const canvas = document.getElementById("particleCanvas");
if (canvas) {
  const ctx = canvas.getContext("2d");
  let width, height;
  let particles = [];

  // Configuration
  const particleCount = 50;
  const connectionDistance = 140;
  const mouseDistance = 250;

  const mouse = { x: null, y: null };

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  window.addEventListener("resize", resize);
  resize();

  window.addEventListener("mousemove", (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener("mouseleave", () => {
    mouse.x = null;
    mouse.y = null;
  });

  function getThemeColors() {
    const style = getComputedStyle(document.documentElement);
    const primary = style.getPropertyValue('--primary').trim() || '#6366f1';
    const accent = style.getPropertyValue('--accent').trim() || '#a855f7';
    return { primary, accent };
  }

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 1.0;
      this.vy = (Math.random() - 0.5) * 1.0;
      this.size = Math.random() * 3 + 2;
      this.angle = Math.random() * Math.PI * 2;
      this.spin = (Math.random() - 0.5) * 0.05; // Rotation speed
      this.baseColorTag = Math.random() > 0.5 ? 'primary' : 'accent';
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.angle += this.spin;

      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;

      // Mouse Interaction (Push)
      if (mouse.x != null) {
        let dx = this.x - mouse.x;
        let dy = this.y - mouse.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouseDistance) {
          const forceDirectionX = dx / distance;
          const forceDirectionY = dy / distance;
          const force = (mouseDistance - distance) / mouseDistance;
          const push = force * 4;

          this.x += forceDirectionX * push;
          this.y += forceDirectionY * push;
        }
      }
    }

    draw(colors) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);

      const color = this.baseColorTag === 'primary' ? colors.primary : colors.accent;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;

      // Draw Diamond
      ctx.beginPath();
      // Only outline for "tech" look, or fill? Let's do outline + slight fill opacity
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.6; // slightly transparent fill

      const s = this.size;
      ctx.moveTo(0, -s);
      ctx.lineTo(s, 0);
      ctx.lineTo(0, s);
      ctx.lineTo(-s, 0);
      ctx.closePath();

      ctx.fill();
      ctx.stroke();

      ctx.restore();
    }
  }

  function init() {
    particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }
  }

  // Re-init on theme change to catch colors if strictly needed, 
  // but we fetch colors every frame in draw loop so it's dynamic.
  init();

  function animateParticles() {
    ctx.clearRect(0, 0, width, height);
    const colors = getThemeColors();

    particles.forEach((p, index) => {
      p.update();
      p.draw(colors);

      // Connections
      for (let j = index + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < connectionDistance) {
          ctx.beginPath();
          const opacity = 1 - (dist / connectionDistance);

          // Line color can be mix or white. Let's make it subtle white.
          ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.1})`;
          ctx.lineWidth = 1;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }

      // Mouse Connections
      if (mouse.x != null) {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouseDistance) {
          ctx.beginPath();
          const opacity = 1 - (dist / mouseDistance);
          const color = p.baseColorTag === 'primary' ? colors.primary : colors.accent;

          // Hex to RGB for opacity is tricky if we don't have helper.
          // But we can assign strokeStyle = color and use globalAlpha.
          ctx.save();
          ctx.strokeStyle = color;
          ctx.globalAlpha = opacity * 0.3;
          ctx.lineWidth = 1;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
          ctx.restore();
        }
      }
    });

    requestAnimationFrame(animateParticles);
  }
  animateParticles();
}
