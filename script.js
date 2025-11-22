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

let files = [];

// Toast
function toast(msg, ms = 2200){
  const n = document.createElement('div'); n.className='toast'; n.textContent=msg;
  toastRoot.appendChild(n); setTimeout(()=>n.remove(), ms);
}

// Dosya ekleme
pickFiles.addEventListener('click',()=>fileInput.click());
fileInput.addEventListener('change', e=>addFiles([...e.target.files]));
dropzone.addEventListener('dragover', e=>{ e.preventDefault(); dropzone.classList.add('drag'); });
dropzone.addEventListener('dragleave', e=>{ dropzone.classList.remove('drag'); });
dropzone.addEventListener('drop', e=>{ e.preventDefault(); dropzone.classList.remove('drag'); addFiles([...e.dataTransfer.files]); });

function addFiles(flist){
  flist.forEach(f=>{ if(f.type.startsWith('image/')) files.push({file:f,objectURL:URL.createObjectURL(f)}); else toast('Sadece resim'); });
  renderGrid();
}

function renderGrid(){
  previewGrid.innerHTML = '';
  files.forEach(f=>{
    const div=document.createElement('div'); div.className='thumb';
    const img=document.createElement('img'); img.src=f.objectURL;
    div.appendChild(img);
    previewGrid.appendChild(div);
  });
}

function calculateSize(img){
  let targetW = parseInt(widthInput.value)||img.width;
  let targetH = parseInt(heightInput.value)||img.height;
  if(keepRatio.checked){
    if(widthInput.value && !heightInput.value) targetH = Math.round(img.height*(targetW/img.width));
    else if(heightInput.value && !widthInput.value) targetW = Math.round(img.width*(targetH/img.height));
  }
  return {targetW,targetH};
}

function processFile(fileObj, callback){
  const img = new Image();
  img.onload = ()=>{
    const {targetW,targetH} = calculateSize(img);
    const canvas = document.createElement('canvas'); canvas.width=targetW; canvas.height=targetH;
    const ctx = canvas.getContext('2d'); ctx.drawImage(img,0,0,targetW,targetH);
    canvas.toBlob(
      blob => callback(blob),
      formatSelect.value==='original'?'image/png':formatSelect.value,
      qualityRange.value/100
    );
  };
  img.src=fileObj.objectURL;
}

// ZIP
processBtn.addEventListener('click',()=>{
  if(!files.length){ toast('Önce dosya ekleyin'); return; }
  const zip = new JSZip();
  let processed=0;
  files.forEach(f=>processFile(f,blob=>{
    zip.file(f.file.name,blob);
    processed++;
    if(processed===files.length) zip.generateAsync({type:'blob'}).then(content=>saveAs(content,'images.zip'));
  }));
});

qualityRange.addEventListener('input',()=>qualText.textContent=qualityRange.value);
