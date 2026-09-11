
const DATA = window.CHILDHOOD_DATA || [];
const EXTRA = window.EXTRA_DATA || [];
const $ = (q) => document.querySelector(q);
const $$ = (q) => Array.from(document.querySelectorAll(q));

const homeView = $('#homeView');
const loadingView = $('#loadingView');
const gameView = $('#gameView');
const endView = $('#endView');
const extraIntroView = $('#extraIntroView');
const extraView = $('#extraView');

const homeGameCard = $('#homeGameCard');
const homeExtraCard = $('#homeExtraCard');
const backHomeBtn = $('#backHomeBtn');
const extraBackHomeBtn = $('#extraBackHomeBtn');
const enterExtraBtn = $('#enterExtraBtn');
const closeExtraBtn = $('#closeExtraBtn');

const progressBar = $('#progressBar');
const loadedCount = $('#loadedCount');
const totalCount = $('#totalCount');
const homeLoadedCount = $('#homeLoadedCount');
const homeTotalCount = $('#homeTotalCount');
const startBtn = $('#startBtn');
const earlyBtn = $('#earlyBtn');

const exitBtn = $('#exitBtn');
const photo = $('#photo');
const photoShell = $('#photoShell');
const progressText = $('#progressText');
const revealBtn = $('#revealBtn');
const nameCard = $('#nameCard');
const nextBtn = $('#nextBtn');
const againBtn = $('#againBtn');
const homeBtn = $('#homeBtn');

const masonry = $('#masonry');
const extraCount = $('#extraCount');
const lightbox = $('#lightbox');
const lightboxImg = $('#lightboxImg');
const lightboxClose = $('#lightboxClose');

let loaded = 0, deck = [], index = 0, revealed = false;
const cache = new Set();
const rotations = ['-1.5deg','1.2deg','-.8deg','1.8deg','-.6deg','1deg'];
const offsets = ['0px','10px','4px','14px','6px','12px'];

totalCount.textContent = DATA.length;
homeTotalCount.textContent = DATA.length;
extraCount.textContent = `${EXTRA.length} 张`;

function setView(view){
  [homeView, loadingView, gameView, endView, extraIntroView, extraView].forEach(v=>v.classList.remove('active'));
  view.classList.add('active');
}
function shuffle(arr){
  const a=[...arr];
  for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}
  return a;
}
function updateLoad(){
  loadedCount.textContent = loaded;
  homeLoadedCount.textContent = loaded;
  const pct = Math.round(loaded / DATA.length * 100);
  progressBar.style.width = `${pct}%`;
  if(loaded === DATA.length){
    startBtn.disabled = false;
    startBtn.textContent = '开始游戏';
    homeGameCard.querySelector('.card-meta').textContent = 'READY';
    earlyBtn.style.visibility = 'hidden';
  } else {
    homeGameCard.querySelector('.card-meta').textContent = `${loaded} / ${DATA.length}`;
  }
}
function preload(){
  DATA.forEach(item=>{
    const im=new Image();
    const done=()=>{if(!cache.has(item.image)){cache.add(item.image);loaded++;updateLoad()}};
    im.onload=done; im.onerror=done; im.src=item.image;
    if(im.complete) done();
  })
}
function begin(){deck=shuffle(DATA);index=0;setView(gameView);showCard()}
function showCard(){
  revealed=false;
  nameCard.classList.remove('show');
  nameCard.textContent='';
  revealBtn.style.display='inline-flex';
  revealBtn.style.alignItems='center';
  revealBtn.style.justifyContent='center';
  nextBtn.disabled=true;
  const item=deck[index];
  progressText.textContent=`${String(index+1).padStart(2,'0')} / ${String(deck.length).padStart(2,'0')}`;
  photoShell.classList.add('waiting');
  const onReady=()=>photoShell.classList.remove('waiting');
  photo.onload=onReady; photo.onerror=onReady; photo.src=item.image;
  if(photo.complete) onReady();
}
function reveal(){
  if(revealed)return;
  revealed=true;
  const item=deck[index];
  revealBtn.style.display='none';
  nameCard.textContent=item.name;
  nameCard.classList.add('show');
  nextBtn.disabled=false;
}
function next(){
  if(!revealed)return;
  if(index>=deck.length-1){setView(endView);return}
  index++;showCard();
}
function openExtraIntro(){setView(extraIntroView)}
function renderExtra(){
  if(masonry.dataset.ready==='yes') return;
  EXTRA.forEach((item,i)=>{
    const btn=document.createElement('button');
    btn.className='tile';
    btn.style.setProperty('--rot', rotations[i % rotations.length]);
    btn.style.setProperty('--offset', offsets[i % offsets.length]);
    const img=document.createElement('img');
    img.loading='lazy';
    img.src=item.image;
    img.alt='番外照片';
    btn.appendChild(img);
    btn.addEventListener('click',()=>{
      lightboxImg.src=item.image;
      lightbox.hidden=false;
      document.body.style.overflow='hidden';
    });
    masonry.appendChild(btn);
  });
  masonry.dataset.ready='yes';
}
function closeLightbox(){
  lightbox.hidden=true;
  lightboxImg.src='';
  document.body.style.overflow='';
}

homeGameCard.addEventListener('click',()=>setView(loadingView));
homeExtraCard.addEventListener('click',openExtraIntro);
backHomeBtn.addEventListener('click',()=>setView(homeView));
extraBackHomeBtn.addEventListener('click',()=>setView(homeView));
enterExtraBtn.addEventListener('click',()=>{setView(extraView); renderExtra();});
closeExtraBtn.addEventListener('click',()=>setView(homeView));

startBtn.addEventListener('click',begin);
earlyBtn.addEventListener('click',begin);
exitBtn.addEventListener('click',()=>setView(homeView));
revealBtn.addEventListener('click',reveal);
nextBtn.addEventListener('click',next);
againBtn.addEventListener('click',begin);
homeBtn.addEventListener('click',()=>setView(homeView));
lightboxClose.addEventListener('click',closeLightbox);
lightbox.addEventListener('click',(e)=>{if(e.target===lightbox)closeLightbox()});
window.addEventListener('keydown',(e)=>{
  if(lightbox.hidden===false && e.code==='Escape'){closeLightbox(); return}
  if(gameView.classList.contains('active')){
    if(e.code==='Space'||e.code==='Enter'){e.preventDefault();revealed?next():reveal()}
    if(e.code==='ArrowRight'&&revealed)next();
    if(e.code==='Escape')setView(homeView);
  }
});
preload();
