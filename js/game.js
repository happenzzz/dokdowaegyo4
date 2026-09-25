"use strict";
/* ==========================================================
   독도 시간탐험대 v18 · 시간탐험대 여권(표지·여정 지도·도장·기재사항·메모)
   ========================================================== */
const $=s=>document.querySelector(s);
const cv=$("#game"), g=cv.getContext("2d",{alpha:false});
let VW=0,VH=0,DPR=1,DPR_CAP=2;
function setDprCap(c){if(DPR_CAP!==c){DPR_CAP=c;fit();}}
function fit(){
  DPR=Math.min(DPR_CAP,window.devicePixelRatio||1);
  VW=cv.clientWidth; VH=cv.clientHeight;
  cv.width=VW*DPR; cv.height=VH*DPR; g.setTransform(DPR,0,0,DPR,0,0);
  g.imageSmoothingEnabled=true;g.imageSmoothingQuality="medium";
}
addEventListener("resize",fit);

/* ---------- 내장 스프라이트 아틀라스 ---------- */
const ASSET_DATA={
  full1:"assets/characters-main.png",
  full2:"assets/characters-support.png",
  portrait1:"assets/portraits-main.png",
  portrait2:"assets/portraits-support.png",
  portrait3:"assets/portraits-modern.png",
  portrait4:"assets/portraits-ports.png",
  compass:"assets/time-compass.png"
};
const JK_FULL_ASSET="assets/japanese-official-full.png";
const JK_PORTRAIT_ASSET="assets/japanese-official-portrait.png";
ASSET_DATA.jkFull=JK_FULL_ASSET;
ASSET_DATA.jkPortrait=JK_PORTRAIT_ASSET;
const SHIP_ASSETS={
  player:"assets/ship-player.png",
  npc:"assets/ship-npc.png"
};
const SPRITE_IMAGES={};
["full1","full2","portrait1","portrait2","jkFull"].forEach(k=>{ const im=new Image(); im.src=ASSET_DATA[k]; SPRITE_IMAGES[k]=im; });
Object.entries(SHIP_ASSETS).forEach(([k,src])=>{ const im=new Image(); im.src=src; SPRITE_IMAGES["ship_"+k]=im; });
const CREATURE_ASSET="assets/creature-atlas.png";
const INTRO_ASSET="assets/school-intro.png";
const EXTRA_ASSETS={modern:"assets/modern-characters-atlas.png",ports:"assets/port-characters-atlas.png",legends:"assets/legend-characters-atlas.png"};
const STATUE_ASSET="assets/an-yong-bok-memorial.png";
const DOCK_ASSET="assets/busan-dock.png";
EXTRA_ASSETS.dock=DOCK_ASSET;
const DOKDO_BG_ASSET="assets/dokdo-natural-map.webp";
const JASAN_ASSET="assets/jasando-distant-view.webp";
const ECOLOGY_ASSET="assets/dokdo-ecology-atlas.webp";
const EVIDENCE_ASSET="assets/historical-evidence-atlas.webp";
const GENERATED_SPRITES={
  tch:["modern",0,0],stb:["modern",1,0],stg:["modern",2,0],tour1:["modern",0,1],tour2:["modern",1,1],guide:["modern",2,1],
  ul:["ports",0,0],ph:["ports",1,0],uj:["ports",2,0],gn:["ports",0,1],jc:["ports",1,1],gj:["ports",2,1],
  munmu:["legends",0,0],yushin:["legends",1,0],chy:["legends",2,0],bamboo:["legends",0,1],manpa:["legends",1,1],dragonking:["legends",2,1],
  inn:["dock",1,1],yard:["dock",2,1]
};
const DEX_ATLAS={cheoyongCharm:"chy",dragonScale:"munmu",bambooGift:"bamboo",manpaGift:"manpa"};
const CREATURE_SPRITES={gangchi:[0,0],gull:[1,0],squid:[2,0],abalone:[0,1],seaweed:[1,1],cod:[2,1]};
const ECOLOGY_SPRITES={
  spindle:[0,0],blackporgy:[1,0],egret:[2,0],petrel:[3,0],
  bluedamselfish:[0,1],aster:[1,1],ghosttunicate:[2,1],stonecrop:[3,1],
  fancoral:[0,2],pinkshrimp:[1,2],squid:[2,2],methane:[3,2]
};
const EVIDENCE_SPRITES={sejong:[0,0],paldo:[1,0],okidoc:[2,0]};
{ const im=new Image(); im.src=CREATURE_ASSET; SPRITE_IMAGES.creatures=im; }
{ const im=new Image(); im.src=ECOLOGY_ASSET; SPRITE_IMAGES.ecology=im; }
{ const im=new Image(); im.src=DOKDO_BG_ASSET; SPRITE_IMAGES.dokdoBg=im; }
{ const im=new Image(); im.src=JASAN_ASSET; SPRITE_IMAGES.jasan=im; }
Object.entries(EXTRA_ASSETS).forEach(([k,src])=>{const im=new Image();im.src=src;SPRITE_IMAGES[k]=im;});
{const im=new Image();im.src=STATUE_ASSET;SPRITE_IMAGES.statue=im;}
/* v13 · 새 주인공 걷기 스프라이트와 장면 배경 */
const PLAYER_WALK_ASSET="assets/player-walk.png";
const MAP_BG={suyeong:"assets/bg-suyeong.webp",busan:"assets/bg-busan.webp",oki:"assets/bg-oki-gate.webp",okicastle:"assets/bg-oki-hall.webp",busan2:"assets/bg-dongnae.webp",yangyang:"assets/bg-yangyang.webp"};
const DEPART_BG="assets/bg-departure.webp",CHART_BG="assets/bg-seachart.webp";
{const im=new Image();im.src=PLAYER_WALK_ASSET;SPRITE_IMAGES.playerWalk=im;}
Object.entries(MAP_BG).forEach(([k,src])=>{const im=new Image();im.src=src;SPRITE_IMAGES["bg_"+k]=im;});
[DEPART_BG,CHART_BG].forEach(src=>{const im=new Image();im.src=src;});
document.documentElement.style.setProperty("--departure-bg",`url("${new URL(DEPART_BG,location.href).href}")`);
document.documentElement.style.setProperty("--creature-atlas",`url("${CREATURE_ASSET}")`);
document.documentElement.style.setProperty("--ecology-atlas",`url("${ECOLOGY_ASSET}")`);
document.documentElement.style.setProperty("--evidence-atlas",`url("${EVIDENCE_ASSET}")`);
Object.entries(EXTRA_ASSETS).forEach(([k,src])=>document.documentElement.style.setProperty(`--${k}-atlas`,`url("${src}")`));
$("#school-intro-image").src=INTRO_ASSET;
addEventListener("DOMContentLoaded",()=>{
  $("#title-yb").style.backgroundImage=`url("${ASSET_DATA.full1}")`;
  $("#title-me").style.backgroundImage=`url("${PLAYER_WALK_ASSET}")`;
});

/* ---------- 상태 ---------- */
const G={ name:"탐험대원", mode:"title", scene:"", dex:[], flags:{}, caught:[], evidence:[], day:0, stampLog:{}, passportMemo:"",
  talkReturnMode:"field", pending:null, inputLock:false, overlayReturnMode:null, portNotice:"" };

/* ---------- 날짜 · 시각 · 밤낮 ---------- */
const CLOCK={year:2026,month:8,day:2,hour:10,minute:0,carry:0,last:""};
const pad2=n=>String(n).padStart(2,"0");
function daysInMonth(y,m){return [31,((y%4===0&&y%100!==0)||y%400===0)?29:28,31,30,31,30,31,31,30,31,30,31][m-1];}
function normalizeClock(){
  while(CLOCK.minute>=60){CLOCK.minute-=60;CLOCK.hour++;}
  while(CLOCK.hour>=24){CLOCK.hour-=24;CLOCK.day++;}
  while(CLOCK.day>daysInMonth(CLOCK.year,CLOCK.month)){CLOCK.day-=daysInMonth(CLOCK.year,CLOCK.month);CLOCK.month++;if(CLOCK.month>12){CLOCK.month=1;CLOCK.year++;}}
}
function eraForYear(y){return y>=1674&&y<=1720?`숙종 ${y-1674}년 · 조선`:(y>=1900?"현장체험학습 · 오늘":`${y}년`);}
function renderClock(){
  const date=`${CLOCK.year}년 ${CLOCK.month}월 ${CLOCK.day}일`,ampm=CLOCK.hour<12?"오전":"오후",hh=CLOCK.hour%12||12,time=`${ampm} ${hh}:${pad2(CLOCK.minute)}`;
  const signature=`${date}|${time}|${eraForYear(CLOCK.year)}`;if(signature!==CLOCK.last){CLOCK.last=signature;$("#era-label").textContent=eraForYear(CLOCK.year);$("#date-label").textContent=date;$("#clock-label").textContent=time;}
  const h=CLOCK.hour+CLOCK.minute/60;let darkness=0;if(h>=18.5)darkness=Math.min(.60,(h-18.5)*.105);else if(h<6.5)darkness=Math.min(.60,(6.5-h)*.105);
  const nf=$("#night-filter");nf.style.opacity=darkness.toFixed(2);nf.style.display=darkness>.005?"":"none";$("#stage").classList.toggle("night",darkness>.09);
}
function setGameClock(y,m,d,h,min=0){Object.assign(CLOCK,{year:y,month:m,day:d,hour:h,minute:min,carry:0,last:""});normalizeClock();renderClock();}
function advanceGameMinutes(minutes){
  CLOCK.carry+=Math.max(0,minutes);const whole=Math.floor(CLOCK.carry);if(whole<1)return;CLOCK.carry-=whole;CLOCK.minute+=whole;normalizeClock();renderClock();
}
function nextMorning(){CLOCK.day++;CLOCK.hour=7;CLOCK.minute=0;CLOCK.carry=0;normalizeClock();renderClock();}

/* ---------- 전체화면 ---------- */
function fullscreenElement(){return document.fullscreenElement||document.webkitFullscreenElement||null;}
function syncFullscreenButton(){const b=$("#b-full");if(b)b.textContent=fullscreenElement()?"전체화면 해제":"전체화면";}
async function toggleFullscreen(){
  try{if(fullscreenElement()){const exit=document.exitFullscreen||document.webkitExitFullscreen;if(exit)await exit.call(document);}else{const root=document.documentElement,req=root.requestFullscreen||root.webkitRequestFullscreen;if(req)await req.call(root);else flash("이 기기에서는 전체화면 기능을 지원하지 않습니다.");}}catch(_){flash("전체화면을 전환할 수 없습니다.");}syncFullscreenButton();
}
$("#b-full").onclick=toggleFullscreen;document.addEventListener("fullscreenchange",syncFullscreenButton);document.addEventListener("webkitfullscreenchange",syncFullscreenButton);

/* ==========================================================
   인물 · 초상화
   ========================================================== */
const CH={
  yb:{n:"안용복",  skin:"#c98f5e",cloth:"#5b7f8c",hat:"paeraengi",beard:"full",hair:"#241c14"},
  pd:{n:"박어둔",  skin:"#c98f5e",cloth:"#8a7f66",hat:"towel",beard:"none",hair:"#241c14"},
  nh:{n:"뇌헌 스님",skin:"#d4a271",cloth:"#7a6a4c",hat:"satgat",beard:"thin",hair:"#9a9a9a",bald:true},
  yi:{n:"유일부",  skin:"#b87b4a",cloth:"#a8562f",hat:"towel",beard:"none",hair:"#241c14"},
  jf:{n:"일본 어부",skin:"#c9925f",cloth:"#4a5f45",hat:"jsatgat",beard:"thin",hair:"#241c14"},
  ok:{n:"오키섬 관리",skin:"#dcb083",cloth:"#2f3540",hat:"eboshi",beard:"none",hair:"#241c14"},
  ho:{n:"호키주 관리",skin:"#c8955f",cloth:"#253a4e",hat:"eboshi",beard:"thin",hair:"#241c14"},
  jv:{n:"오키섬 마을 사람",skin:"#dcb083",cloth:"#4c6078",hat:"towel",beard:"none",hair:"#241c14"},
  jg:{n:"오키섬 성 안 수문장",skin:"#dcb083",cloth:"#303744",hat:"jsatgat",beard:"thin",hair:"#241c14"},
  jk:{n:"오키섬 관청 서기",skin:"#c8955f",cloth:"#384b5f",hat:"eboshi",beard:"thin",hair:"#241c14"},
  gw:{n:"조선 관원",skin:"#c8955f",cloth:"#3a4a6b",hat:"gwanmo",beard:"thin",hair:"#241c14"},
  np:{n:"부산포 인부 갑",skin:"#b8793f",cloth:"#8a7f66",hat:"towel",beard:"none",hair:"#241c14"},
  hj:{n:"부산포 인부 을",skin:"#dcae82",cloth:"#756d62",hat:"towel",beard:"none",hair:"#241c14"},
  me:{n:"나",      skin:"#e8bd93",cloth:"#b23425",hat:"cap",beard:"none",hair:"#241c14"},
  cp:{n:"시간 나침반",compass:true},
  tch:{n:"담임 선생님",skin:"#d7a57c",cloth:"#9a795a",hat:"none",beard:"none",hair:"#241c14"},
  stb:{n:"친구 민준",skin:"#e4b184",cloth:"#2f6fa3",hat:"none",beard:"none",hair:"#241c14"},
  stg:{n:"친구 서윤",skin:"#e4b184",cloth:"#a55f78",hat:"none",beard:"none",hair:"#3b261c"},
  tour1:{n:"사진 찍는 관광객",skin:"#d7a57c",cloth:"#66745e",hat:"none",beard:"thin",hair:"#3a2b22"},
  tour2:{n:"할머니 관광객",skin:"#e0b58d",cloth:"#8a6b82",hat:"none",beard:"none",hair:"#777"},
  guide:{n:"수영사적공원 문화해설사",skin:"#d7a57c",cloth:"#59704d",hat:"cap",beard:"none",hair:"#241c14"},
  ul:{n:"울산 개운포 어민",skin:"#d2a073",cloth:"#65705d",hat:"towel",beard:"none",hair:"#241c14"},
  ph:{n:"포항 영일만 어물전 상인",skin:"#c89161",cloth:"#536378",hat:"towel",beard:"thin",hair:"#241c14"},
  uj:{n:"울진항 뱃사공",skin:"#c89161",cloth:"#687389",hat:"towel",beard:"full",hair:"#555"},
  gn:{n:"강릉항 객주",skin:"#dfac82",cloth:"#8a6675",hat:"none",beard:"none",hair:"#241c14"},
  jc:{n:"일본 어선 선장",skin:"#c89161",cloth:"#3f5368",hat:"towel",beard:"thin",hair:"#241c14"},
  gj:{n:"경주 감포항 이야기꾼",skin:"#d2a073",cloth:"#68705b",hat:"gwanmo",beard:"thin",hair:"#241c14"},
  inn:{n:"주막 아주머니",skin:"#d6a278",cloth:"#6f7d58",hat:"towel",beard:"none",hair:"#241c14"},
  yard:{n:"배 정비소 주인",skin:"#c58c5e",cloth:"#435b72",hat:"towel",beard:"full",hair:"#241c14"},
  munmu:{n:"문무왕의 호국룡",compass:true},yushin:{n:"하늘의 김유신",compass:true},chy:{n:"처용",compass:true},dragonking:{n:"동해 용왕",compass:true}
};
const FULL_SPRITES={
  me:["full1",0,0],yb:["full1",1,0],pd:["full1",2,0],nh:["full1",0,1],yi:["full1",1,1],jv:["full1",2,1],
  ok:["full2",0,0],ho:["full2",0,0],jf:["full2",2,0],gw:["full2",0,1],np:["full2",1,1],hj:["full2",2,1],jg:["full2",2,0],jk:["jkFull",0,0,1,1],
  tch:["modern",0,0],stb:["modern",1,0],stg:["modern",2,0],tour1:["modern",0,1],tour2:["modern",1,1],guide:["modern",2,1],
  ul:["ports",0,0],ph:["ports",1,0],uj:["ports",2,0],gn:["ports",0,1],jc:["ports",1,1],gj:["ports",2,1]
};
const PORTRAIT_SPRITES={
  yb:["portrait1",0],me:["portrait1",1],pd:["portrait1",2],
  nh:["portrait2",0],yi:["portrait2",1],ok:["portrait2",2],
  ho:["portrait2",2],jf:["portrait3",1],jg:["portrait3",1],jk:["jkPortrait",0,1,1],gw:["portrait3",2],
  np:["portrait4",0],hj:["portrait4",1],jv:["portrait4",2]
};
CH.gy={...CH.gw,n:"양양 관아 관원"};CH.yv={...CH.np,n:"양양 관아 포졸"};CH.ym={...CH.hj,n:"양양 포구 어민"};
FULL_SPRITES.gy=FULL_SPRITES.gw;FULL_SPRITES.yv=FULL_SPRITES.np;FULL_SPRITES.ym=FULL_SPRITES.hj;
PORTRAIT_SPRITES.gy=PORTRAIT_SPRITES.gw;PORTRAIT_SPRITES.yv=PORTRAIT_SPRITES.np;PORTRAIT_SPRITES.ym=PORTRAIT_SPRITES.hj;
function portraitColumn(k,m,t){
  k={gy:"gw",yv:"np",ym:"hj"}[k]||k;
  const s=`${m||""} ${t||""}`;
  if(k==="yb") return /웃|허허|픽/.test(s)?2:/노기|호통|분노|눈이 좁|단호|남의 바다/.test(s)?1:0;
  if(k==="me"&&m==="동상을 올려다보며") return 0;
  if(k==="me") return /기억|기록|우리 땅|같이 갈|내민/.test(s)?2:/무서|위험|걱정|뭐지|너무해/.test(s)?1:0;
  if(k==="pd") return /형님|죽|끌려|왜인/.test(s)?1:/살아|돌아|안도/.test(s)?2:0;
  if(k==="nh") return /미소|놀랍|관세음/.test(s)?2:/한숨|무겁|허나|염려|걱정/.test(s)?1:0;
  if(k==="yi") return /놀|붙잡히/.test(s)?2:/!|다급|소리|붙잡|돛|물때|도망/.test(s)?1:0;
  if(k==="ok") return /기록|적어|붓/.test(s)?2:/근거|무엇|어디|다시|인가/.test(s)?1:0;
  if(k==="ho") return /기록|알리|결정/.test(s)?2:/들어|읽었|경청/.test(s)?1:0;
  if(k==="jf") return /달아|도망|물러/.test(s)?2:/삼 년|저 자|놀/.test(s)?1:0;
  if(k==="jg") return /엄숙|수문|소란|지키/.test(s)?2:/놀|조선/.test(s)?1:0;
  if(k==="gw") return /침묵|받아들|오래/.test(s)?2:/!|죄|사칭|추궁|할 말/.test(s)?1:0;
  if(k==="np") return /잘|빠르|칭찬/.test(s)?2:/!|비켜|나가|소리/.test(s)?1:0;
  if(k==="hj") return /친절|괜찮|평상/.test(s)?2:/수군|작게|소문/.test(s)?1:0;
  if(k==="jv") return /차분|평상/.test(s)?2:/!|들어왔다|외침/.test(s)?1:0;
  return 0;
}
function renderSpritePortrait(k,m,t){
  const holder=$("#portrait");
  holder.classList.toggle("portrait-jk",k==="jk");
  const generated=GENERATED_SPRITES[k];
  if(generated){
    holder.innerHTML='<div class="sprite-face generated"></div>';
    const d=holder.firstElementChild;d.style.backgroundImage=`url("${EXTRA_ASSETS[generated[0]]}")`;
    d.style.backgroundPosition=`${generated[1]*50}% ${generated[2]*100}%`;return true;
  }
  if(k==="cp"){
    const s=`${m||""} ${t||""}`;
    const col=/경고|다시|놓치|선택|입력/.test(s)?1:/이동|시간문|시간|완료/.test(s)?2:0;
    holder.innerHTML='<div class="sprite-face compass"></div>';
    const d=holder.firstElementChild; d.style.backgroundImage=`url("${ASSET_DATA.compass}")`; d.style.backgroundPosition=`${col*50}% 0%`;
    return true;
  }
  const spec=PORTRAIT_SPRITES[k]; if(!spec) return false;
  const cols=spec[2]||3, rows=spec[3]||3, col=portraitColumn(k,m,t), row=spec[1];
  holder.innerHTML='<div class="sprite-face"></div>';
  const d=holder.firstElementChild; d.style.backgroundImage=`url("${ASSET_DATA[spec[0]]}")`;
  d.style.backgroundSize=`${cols*100}% ${rows*100}%`;
  const x=cols===1?0:(col/(cols-1))*100, y=rows===1?0:(row/(rows-1))*100;
  d.style.backgroundPosition=`${x}% ${y}%`;
  return true;
}
function faceSVG(k,m){
  const c=CH[k]; if(!c) return "";
  if(c.compass) return `<svg viewBox="0 0 100 120"><rect width="100" height="120" fill="#0c2b3a"/>
  <circle cx="50" cy="60" r="30" fill="none" stroke="#d9a441" stroke-width="3"/>
  <circle cx="50" cy="60" r="21" fill="none" stroke="#2a8ba3" stroke-width="2"/>
  <path d="M50 34 L57 60 L50 86 L43 60 Z" fill="#b23425"/><circle cx="50" cy="60" r="4" fill="#f4e6c8"/></svg>`;
  const ang=m&&/노기|화|호통|버럭/.test(m), sm=m&&/웃|미소/.test(m), sd=m&&/낮|무겁|한숨|침묵|조용/.test(m);
  const bl=ang?"M26 46 L42 52":sd?"M26 52 L42 46":"M26 48 L42 47";
  const br=ang?"M74 46 L58 52":sd?"M74 52 L58 46":"M74 48 L58 47";
  const mo=ang?"M38 84 Q50 76 62 84":sm?"M38 80 Q50 92 62 80":"M40 83 L60 83";
  const hats={paeraengi:`<path d="M14 40 Q50 12 86 40 Q50 50 14 40Z" fill="#8a6b3a" stroke="#241c14" stroke-width="2"/><path d="M34 40 Q50 18 66 40Z" fill="#6d5330" stroke="#241c14" stroke-width="2"/>`,
    satgat:`<path d="M8 44 Q50 6 92 44 Q50 54 8 44Z" fill="#c8ab6e" stroke="#241c14" stroke-width="2"/>`,
    towel:`<path d="M22 40 Q50 24 78 40 L78 46 Q50 38 22 46Z" fill="#e0e0d4" stroke="#241c14" stroke-width="2"/>`,
    jsatgat:`<path d="M12 42 Q50 14 88 42 Q50 50 12 42Z" fill="#b09a63" stroke="#241c14" stroke-width="2"/>`,
    eboshi:`<path d="M32 40 L38 12 L62 12 L68 40Z" fill="#2b2b2b" stroke="#000" stroke-width="2"/>`,
    gwanmo:`<path d="M28 40 Q50 20 72 40Z" fill="#1b1b1b" stroke="#000" stroke-width="2"/><rect x="26" y="38" width="48" height="6" fill="#1b1b1b"/>`,
    cap:`<path d="M28 40 Q50 20 72 40 L74 44 L26 44Z" fill="#b23425" stroke="#241c14" stroke-width="2"/><path d="M72 42 L92 46 L72 48Z" fill="#b23425" stroke="#241c14" stroke-width="2"/>`,
    none:``};
  const bd={full:`<path d="M32 76 Q50 116 68 76 Q50 96 32 76Z" fill="${c.hair}" opacity=".9"/>`,
    thin:`<path d="M40 90 Q50 104 60 90 Q50 96 40 90Z" fill="${c.hair}" opacity=".85"/>`,none:``};
  return `<svg viewBox="0 0 100 120"><rect width="100" height="120" fill="#cbb98e"/>
  <path d="M18 120 Q22 88 50 86 Q78 88 82 120Z" fill="${c.cloth||"#6b5842"}"/>
  <ellipse cx="50" cy="62" rx="27" ry="32" fill="${c.skin}"/>
  ${c.bald?"":`<path d="M23 52 Q50 26 77 52 Q50 42 23 52Z" fill="${c.hair}"/>`}
  <path d="${bl}" stroke="${c.hair}" stroke-width="4" fill="none" stroke-linecap="round"/>
  <path d="${br}" stroke="${c.hair}" stroke-width="4" fill="none" stroke-linecap="round"/>
  <ellipse cx="37" cy="60" rx="4" ry="${sm?2:4}" fill="#241c14"/><ellipse cx="63" cy="60" rx="4" ry="${sm?2:4}" fill="#241c14"/>
  <path d="M50 62 L47 74 L53 74" stroke="#8a5a35" stroke-width="2" fill="none"/>
  <path d="${mo}" stroke="#7a3b2c" stroke-width="3" fill="none" stroke-linecap="round"/>
  ${bd[c.beard]||""}${hats[c.hat]||""}</svg>`;
}

/* ==========================================================
   도감
   ========================================================== */
const DEX={
  /* 인물 */
  yb:{c:"인물",em:"🧭",n:"안용복",d:"동래(오늘의 부산) 사람. 왜관을 드나들어 일본말을 할 줄 알았다. 1696년 울릉도에서 일본인의 침범에 항의하고 자산도도 조선 땅이라 주장했다."},
  pd:{c:"인물",em:"🪢",n:"박어둔",d:"1693년 안용복과 함께 울릉도에서 일본으로 끌려간 동료."},
  nh:{c:"인물",em:"📿",n:"뇌헌 스님",d:"1696년 항해에 함께한 승려. 바람과 별로 뱃길을 읽었다."},
  yi:{c:"인물",em:"⚓",n:"유일부",d:"키를 잡은 사공. 물빛만 보고도 바위를 안다."},
  ok:{c:"인물",em:"🖌️",n:"오키섬 관리",d:"안용복의 말을 듣고 조사 문서에 기록한 일본 관리."},
  ho:{c:"인물",em:"📜",n:"호키주 관리",d:"오키섬에서 올라온 기록을 확인하고 안용복의 말을 들은 관리."},
  /* 생물·자원 */
  gangchi:{c:"독도의 생물과 자원",em:"🦭",n:"강치(가제)",d:"독도 바위를 뒤덮고 살던 바다사자. 1900년대 초 남획으로 급격히 줄어, 지금은 볼 수 없다."},
  gull:{c:"독도의 생물과 자원",em:"🐦",n:"괭이갈매기",d:"고양이 울음 같은 소리를 낸다. 지금도 독도의 주인처럼 산다."},
  squid:{c:"독도의 생물과 자원",em:"🦑",n:"살오징어",d:"독도 주변의 깊고 깨끗한 바다를 오가는 대표적인 두족류. 밤에는 먹이를 따라 수면 가까이 올라온다."},
  abalone:{c:"독도의 생물과 자원",em:"🐚",n:"전복",d:"거센 물결이 드나드는 바위에 단단히 붙어 사는 연체동물. 독도 주변의 풍부한 바다 생태를 보여 준다."},
  seaweed:{c:"독도의 생물과 자원",em:"🌿",n:"미역",d:"차고 맑은 독도 바다의 바위에 붙어 자라는 해조류. 여러 바다 생물에게 먹이와 숨을 곳을 제공한다."},
  cod:{c:"독도의 생물과 자원",em:"🐟",n:"대구",d:"찬 물을 좋아하는 물고기. 겨울 동해에서 잡힌다."},
  spindle:{c:"독도의 생물과 자원",em:"🌳",n:"독도 사철나무",d:"강한 바닷바람과 염분을 견디며 독도에서 사계절 푸른 잎을 유지하는 상록식물."},
  blackporgy:{c:"독도의 생물과 자원",em:"🐟",n:"흑돔",d:"독도 주변 암초 지대에서 작은 물고기와 갑각류를 먹고 사는 물고기."},
  egret:{c:"독도의 생물과 자원",em:"🪶",n:"황로",d:"이동 중 독도에 잠시 내려앉아 쉬어 가는 여름철새. 번식기에는 머리와 가슴이 황갈색을 띤다."},
  petrel:{c:"독도의 생물과 자원",em:"🐦",n:"바다제비",d:"먼바다를 날다가 독도의 바위틈을 번식지와 쉼터로 이용하는 해양성 조류."},
  bluedamselfish:{c:"독도의 생물과 자원",em:"🐠",n:"파랑돔",d:"따뜻한 해류를 따라 독도 바다에 나타나는 선명한 파란빛의 작은 물고기."},
  aster:{c:"독도의 생물과 자원",em:"🌼",n:"해국",d:"가을이면 독도 바위틈에서 연보랏빛 꽃을 피우며 거센 바람을 견디는 해안식물."},
  ghosttunicate:{c:"독도의 생물과 자원",em:"🪸",n:"유령멍게",d:"빛이 적은 독도 수중 암반에 붙어 사는 반투명한 군체성 멍게."},
  stonecrop:{c:"독도의 생물과 자원",em:"🌱",n:"섬기린초",d:"독도 절벽의 얕은 흙과 바위틈에서도 노란 꽃을 피우는 여러해살이 식물."},
  fancoral:{c:"독도의 생물과 자원",em:"🪸",n:"부채뿔산호",d:"독도 주변의 차고 깊은 바다에서 부채처럼 가지를 펼쳐 작은 생물의 보금자리가 되는 산호."},
  pinkshrimp:{c:"독도의 생물과 자원",em:"🦐",n:"도화새우",d:"동해 깊은 바닷속에 사는 붉은빛 새우. 독도 주변의 풍부한 심해 생태계를 보여 준다."},
  methane:{c:"독도의 생물과 자원",em:"💎",n:"메탄 하이드레이트",d:"낮은 온도와 높은 압력에서 물 분자 속에 메탄이 갇힌 얼음 같은 해저 자원. 독도 주변 심해에도 분포한다."},
  /* 동해안 전설 */
  cheoyongCharm:{c:"동해안의 전설",em:"🌫️",n:"처용의 바람 부적",d:"울산 개운포 처용암에 전해지는 처용 이야기에서 얻은 선물. 짙은 안개를 걷고 바람의 길을 보여 준다."},
  dragonScale:{c:"동해안의 전설",em:"🐉",n:"문무왕 호국룡의 비늘",d:"경주 대왕암에서 나라를 지키는 동해의 용이 남긴 푸른 비늘. 파도에 흔들린 선체를 단단하게 한다."},
  bambooGift:{c:"동해안의 전설",em:"🎋",n:"이견대의 신비한 대나무",d:"문무왕의 용과 하늘의 김유신이 신문왕에게 주었다고 전하는 신비로운 대나무."},
  manpaGift:{c:"동해안의 전설",em:"🎶",n:"만파식적의 울림",d:"‘온갖 파도를 잠재우는 피리’라는 뜻. 불면 파도가 잔잔해지고 나라의 근심이 사라졌다고 전한다."},
  /* 기록 */

  sejong:{c:"기록",em:"📖",n:"《세종실록》〈지리지〉(1454)",kind:"관찬 지리 기록",d:"강원도 울진현의 정동쪽 바다에 우산도와 무릉도 두 섬이 있으며, 두 섬은 서로 바라볼 수 있다고 기록했다."},
  paldo:{c:"기록",em:"🗺️",n:"《신증동국여지승람》〈팔도총도〉(1531)",kind:"관찬 지도",d:"동해에 울릉도와 우산도 두 섬을 함께 그려 조선이 오래전부터 두 섬을 인식했음을 보여 준다."},
  sight:{c:"기록",em:"👁️",n:"울릉도에서 본 자산도",kind:"현장 관찰 자료",d:"맑은 날 울릉도에서 약 87km 떨어진 자산도(독도)를 육안으로 볼 수 있음을 보여 주는 관찰 자료."},
  life:{c:"기록",em:"⛵",n:"1693년 조선 어민의 울릉도 왕래 기록",kind:"민간 왕래 · 보조 근거",d:"안용복·박어둔을 포함한 조선 어민들이 울릉도에 갔다는 기록. 민간의 이용과 영토 인식을 보여 주지만, 공식 허가나 상시 정착을 뜻하지는 않는다."},
  suto:{c:"기록",em:"📜",n:"장한상의 울릉도 수토 기록(1694)",kind:"정부의 공식 조사 기록",d:"조선 조정이 삼척영장 장한상을 보내 울릉도를 직접 조사하게 한 기록. 주민의 상시 거주를 금하면서도 국가가 섬을 계속 살피고 관리했음을 보여 준다."},
  trace:{c:"기록",em:"🪵",n:"일본 어선의 벌목·어업 흔적",kind:"현장 정황 자료",d:"벌목한 나무와 낯선 매듭의 그물은 일본 어선이 단순히 지나간 것이 아니라 머물며 어업했음을 보여 주는 정황이다. 이것만으로 섬의 소속이 결정되지는 않는다."},
  okidoc:{c:"기록",em:"📜",n:"일본 관리의 《조선지팔도》 조사 문서",kind:"일본 측 진술 조사 기록",d:"오키섬 관리가 안용복의 진술을 조사하며 울릉도와 자산도가 조선 강원도에 속한다는 그의 설명을 일본 측 기록으로 남긴 문서. 안용복의 주장을 확인해 주지만 일본 정부의 영유권 승인서와 같은 문서는 아니다."},
  ban:{c:"기록",em:"🚫",n:"일본인의 울릉도 도해금지 조치(1696)",kind:"에도 막부의 울릉도 조치",d:"에도 막부가 일본인의 울릉도 도항을 금지한 조치. 울릉도 쟁계의 중요한 결과이지만 독도 자체를 직접 지칭한 문서로 과장해서는 안 된다."},
  badge:{c:"기록",em:"🛂",n:"시간탐험대 여권",d:"1696년의 항해를 끝까지 함께한 사람에게 발급된다. 만난 인물과 조사한 생물·자원이 도장으로 찍혀 있고, 모은 포인트가 적혀 있으며, PDF로 저장할 수 있다."}
};
const CATS=["인물","독도의 생물과 자원","동해안의 전설","기록"];

/* ==========================================================
   맵
   ========================================================== */
const T=32;
const MAPS={
suyeong:{name:"수영사적공원",sub:"현장체험학습 · 오늘",bg:true,fig:1.28,npcFig:1.28,
  rows:[
  "############################",
  "##############.#############",
  "####......###.........######",
  "####.....####...#.....######",
  "#######...###.....##..######",
  "....................#.#####.",
  "......................#####.",
  "############....###...#####.",
  "############......###..#####",
  "#############.....####.#####",
  "#############...##.....#####",
  "############....##.#...#####",
  "#########........#...#######",
  "..#.###...###...#...##.#####",
  "#######................#####",
  "############################",
  "############################"],
  spawn:[14,13]},
busan:{name:"부산포",sub:"1 6 9 6 · 조 선 의 포 구",bg:true,fig:1,npcFig:1,
  rows:[
  "################################",
  "################################",
  "################################",
  "################################",
  "################################",
  "####..............##############",
  "###................#############",
  "##.................#############",
  "##...........................###",
  "##...........................###",
  "##.................#############",
  "##.................#############",
  "##.................#############",
  "##.................#############",
  "##.................#############",
  "###................#############",
  "################################",
  "################################"],
  spawn:[5,8]},
dokdo:{name:"독도 · 서도와 동도",sub:"자 산 도",
  rows:[
  "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
  "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
  "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
  "~~~~~~^^^^^~~~~~~~~~~~~~~~~~~~",
  "~~~~^^^^^^^^^~~~~~~~~~~~~~~~~~",
  "~~~~^^^^^^^^^~~~~~~^^^^^^~~~~~",
  "~~~^^^^^^^^^^^~~~~^^^^^^^^~~~~",
  "~~~^^^^^^^^^^^~~~~^^^^^^^^~~~~",
  "~~~~^^^^^^^^^~~~~~^^^^^^^^~~~~",
  "~~~~~^^^^^^^~~~~~~^^^^^^^^~~~~",
  "~~~~~~~~~~~~~~~~~~~~^^^^~~~~~~",
  "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
  "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
  "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
  "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~",
  "~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~"],
  spawn:[15,14]},
oki:{name:"오키섬 성하길",sub:"隱 岐 · 성 문 밖",bg:true,fig:1.08,npcFig:1.08,
  rows:[
  "################################",
  "################################",
  "################################",
  "################################",
  "################################",
  "################################",
  "##############....##############",
  "##############....##############",
  "##############....##############",
  "##############....##############",
  "##############....##############",
  "##############....##############",
  "###########.##....##..##########",
  "###########...........##########",
  "#######....................#####",
  "#####.#....................#####",
  "##.......####......##.#.....#.##",
  "################################"],
  spawn:[15,15]},
okicastle:{name:"오키섬 성 안 · 관청 접견실",sub:"隱 岐 · 성 안",bg:true,fig:1.25,npcFig:1.5,
  rows:[
  "############################",
  "############################",
  "############################",
  "############################",
  "############################",
  "############################",
  "############################",
  "############....############",
  "#####..................#####",
  "#####..................#####",
  "#####..................#####",
  "#######..............#######",
  "#######....#....#....#######",
  "#######....#....#....#######",
  "############################"],
  spawn:[14,12]},
yangyang:{name:"양양도호부 관아",sub:"襄 陽 都 護 府 · 강 원 도",bg:true,fig:.98,npcFig:1.05,
  rows:[
  "####################################",
  "####################################",
  "####################################",
  "####################################",
  "####################################",
  "####################################",
  "####################################",
  "################.....###############",
  "###########..............###########",
  "#########......................#####",
  "#########......................#####",
  "###########....................#####",
  "#############............##.....####",
  "################....################",
  "################....################",
  "################....################",
  "###############......###############",
  "###############......###############",
  "###########............##..#########",
  "#########..................#########"],
  spawn:[18,18]},
busan2:{name:"동래성 · 귀항",sub:"東 萊 城 · 조 정 의 조 사",bg:true,fig:1.02,npcFig:1.1,
  rows:[
  "############################",
  "############################",
  "############################",
  "############################",
  "############################",
  "############################",
  "############################",
  "############################",
  "############################",
  "############################",
  "###########..####....####..#",
  "############.........#..####",
  "############.......###..####",
  "#####..............###..####",
  "#####....................###"],
  spawn:[16,12]}
};
const SOLID="#B~^TF";
function solidAt(map,tx,ty){
  const m=MAPS[map],r=m.rows;
  if(ty<0||ty>=r.length) return true;
  const row=r[ty]; if(tx<0||tx>=row.length) return true;
  if(m.bg) return row[tx]==="#";
  if(map==="dokdo") return row[tx]==="^";
  if(map==="oki") return "#WKGET".includes(row[tx]);
  if(map==="okicastle") return "#XE".includes(row[tx]);
  return SOLID.includes(row[tx]);
}

/* 엔티티(맵별) */
let ENT={};
function resetEntities(){
  /* baked: 배경 그림 속에 이미 그려진 인물·사물. 따로 그리지 않고 충돌과 대화만 맡는다. w·h는 여러 칸을 차지하는 대상 */
  ENT={
  suyeong:[
    {id:"statue",obj:"statue",tx:22,ty:3,w:5,h:5,talk:"opening",baked:1},
    {id:"teacher",ch:"tch",tx:8,ty:13,talk:"field_teacher",baked:1},
    {id:"student_b1",ch:"stb",tx:12,ty:14,talk:"field_student_b",baked:1},
    {id:"student_g1",ch:"stg",tx:19,ty:12,talk:"field_student_g",baked:1},
    {id:"student_b2",ch:"stb",tx:21,ty:10,talk:"field_student_b2",baked:1},
    {id:"student_g2",ch:"stg",tx:9,ty:4,talk:"field_student_g2",baked:1},
    {id:"tourist1",ch:"tour1",tx:20,ty:6,talk:"field_tourist1",baked:1},
    {id:"tourist2",ch:"tour2",tx:20,ty:11,talk:"field_tourist2",baked:1},
    {id:"guide",ch:"guide",tx:16,ty:4,talk:"field_guide",baked:1}
  ],
  busan:[
    {id:"yb",ch:"yb",tx:27,ty:8,dir:"l",talk:"yb_first"},
    {id:"nh",ch:"nh",tx:8,ty:7,dir:"d",talk:"chat_nh"},
    {id:"yi",ch:"yi",tx:16,ty:12,dir:"l",talk:"chat_yi"},
    {id:"np1",ch:"np",tx:12,ty:6,talk:"chat_np1"},
    {id:"hj",ch:"hj",tx:5,ty:11,talk:"chat_hj"},
    {id:"x1",ch:"ph",tx:9,ty:11,talk:"chat_busan_x1"},
    {id:"x2",ch:"np",tx:17,ty:7,talk:"chat_busan_x2"},
    {id:"x3",ch:"hj",tx:13,ty:14,talk:"chat_busan_x3"}
  ],
  dokdo:[
    {id:"c_gangchi",cr:"gangchi",tx:2,ty:7,wander:0},
    {id:"c_gull",cr:"gull",tx:11,ty:2,wander:1},
    {id:"c_squid",cr:"squid",tx:27,ty:11,wander:1},
    {id:"c_abalone",cr:"abalone",tx:14,ty:6,wander:0},
    {id:"c_seaweed",cr:"seaweed",tx:15,ty:9,wander:0},
    {id:"c_cod",cr:"cod",tx:16,ty:3,wander:1},
    {id:"c_spindle",cr:"spindle",tx:4,ty:3,wander:0},
    {id:"c_blackporgy",cr:"blackporgy",tx:24,ty:2,wander:1},
    {id:"c_egret",cr:"egret",tx:17,ty:5,wander:1},
    {id:"c_petrel",cr:"petrel",tx:28,ty:7,wander:1},
    {id:"c_bluedamselfish",cr:"bluedamselfish",tx:13,ty:11,wander:1},
    {id:"c_aster",cr:"aster",tx:19,ty:12,wander:0},
    {id:"c_ghosttunicate",cr:"ghosttunicate",tx:12,ty:9,wander:0},
    {id:"c_stonecrop",cr:"stonecrop",tx:25,ty:12,wander:0},
    {id:"c_fancoral",cr:"fancoral",tx:3,ty:12,wander:0},
    {id:"c_pinkshrimp",cr:"pinkshrimp",tx:27,ty:13,wander:1},
    {id:"c_methane",cr:"methane",tx:16,ty:12,wander:0}
  ],
  oki:[
    {id:"castle_gate",obj:"castleGate",tx:14,ty:5,w:4,h:1,talk:"enter_oki_castle",baked:1},
    {id:"guard_l",tx:11,ty:13,talk:"chat_oki_guard",baked:1},
    {id:"guard_r",tx:20,ty:13,talk:"chat_oki_guard",baked:1},
    {id:"jv_oki_1",ch:"jv",tx:8,ty:15,dir:"r",talk:"chat_jv_oki_1",wander:1},
    {id:"jv_oki_2",ch:"jv",tx:24,ty:15,dir:"l",talk:"chat_jv_oki_2",wander:1}
  ],
  okicastle:[
    {id:"ok",ch:"ok",tx:13,ty:6,w:3,h:1,talk:"oki_official",baked:1},
    {id:"jk",ch:"jk",tx:7,ty:10,talk:"chat_jk_oki",baked:1},
    {id:"jx",tx:4,ty:9,talk:"chat_oki_clerk2",baked:1},
    {id:"jr",tx:20,ty:9,talk:"chat_oki_clerk3",baked:1},
    {id:"jg",ch:"jg",tx:23,ty:9,talk:"chat_jg_oki",baked:1},
    {id:"yb",ch:"yb",tx:12,ty:9,dir:"u",talk:"chat_yb_oki"},
    {id:"nh",ch:"nh",tx:16,ty:9,dir:"u",talk:"chat_nh_oki"},
    {id:"yi",ch:"yi",tx:10,ty:10,dir:"u",talk:"chat_yi_oki"}
  ],
  yangyang:[
    {id:"gy",ch:"gy",tx:17,ty:6,w:3,h:1,talk:"trial",baked:1},
    {id:"nh",ch:"nh",tx:20,ty:8,dir:"l",talk:"chat_nh_trial"},
    {id:"g1",tx:14,ty:8,talk:"chat_yangyang_po",baked:1},
    {id:"g2",tx:22,ty:8,talk:"chat_yangyang_po",baked:1},
    {id:"gg1",tx:14,ty:18,talk:"chat_yangyang_po",baked:1},
    {id:"gg2",tx:21,ty:18,talk:"chat_yangyang_po",baked:1},
    {id:"o1",tx:22,ty:11,talk:"chat_yangyang_clerks",baked:1},
    {id:"o2",tx:23,ty:11,talk:"chat_yangyang_clerks",baked:1},
    {id:"l1",tx:10,ty:10,talk:"chat_yangyang_fisher",baked:1},
    {id:"l2",tx:12,ty:10,talk:"chat_yangyang_porter",baked:1},
    {id:"l3",tx:13,ty:12,talk:"chat_yangyang_fisher2",baked:1},
    {id:"l4",tx:30,ty:11,talk:"chat_yangyang_horse",baked:1},
    {id:"yb",ch:"yb",tx:17,ty:19,dir:"u",talk:"chat_yb_trial"},
    {id:"yi",ch:"yi",tx:19,ty:19,dir:"u",talk:"chat_yi_trial"}
  ],
  busan2:[
    {id:"gw",ch:"gw",tx:12,ty:13,talk:"trial",baked:1},
    {id:"gate_guard",tx:19,ty:10,talk:"chat_dongnae_guard",baked:1},
    {id:"blue_off",tx:23,ty:13,talk:"chat_dongnae_off",baked:1},
    {id:"yb",ch:"yb",tx:17,ty:12,dir:"l",talk:"chat_yb_trial"},
    {id:"yi",ch:"yi",tx:18,ty:13,dir:"l",talk:"chat_yi_trial"},
    {id:"nh",ch:"nh",tx:8,ty:14,dir:"r",talk:"chat_nh_trial",gone:true}
  ]};
}
function entById(id,m=P.map){return (ENT[m]||[]).find(e=>e.id===id);}
/* 생물 이모지 */
const CREM={gangchi:"🦭",gull:"🐦",squid:"🦑",abalone:"🐚",seaweed:"🌿",cod:"🐟",spindle:"🌳",blackporgy:"🐟",egret:"🪶",petrel:"🐦",bluedamselfish:"🐠",aster:"🌼",ghosttunicate:"🪸",stonecrop:"🌱",fancoral:"🪸",pinkshrimp:"🦐",methane:"💎"};
function creatureSpriteSpec(id){
  if(ECOLOGY_SPRITES[id])return{p:ECOLOGY_SPRITES[id],css:"--ecology-atlas",img:SPRITE_IMAGES.ecology,cols:4,rows:3};
  if(CREATURE_SPRITES[id])return{p:CREATURE_SPRITES[id],css:"--creature-atlas",img:SPRITE_IMAGES.creatures,cols:3,rows:2};
  return null;
}
function creatureStyle(id){
  const s=creatureSpriteSpec(id);if(!s)return"";const xp=s.cols===1?0:s.p[0]/(s.cols-1)*100,yp=s.rows===1?0:s.p[1]/(s.rows-1)*100;
  return `background-image:var(${s.css});background-size:${s.cols*100}% ${s.rows*100}%;background-position:${xp}% ${yp}%`;
}
function creatureHTML(id,cls=""){
  return creatureSpriteSpec(id)
    ? `<span class="creature-sprite ${cls}" role="img" aria-label="${DEX[id]?.n||"독도 생물"}" style="${creatureStyle(id)}"></span>`
    : `<span class="em">${DEX[id]?.em||"❔"}</span>`;
}
function evidenceStyle(id){const p=EVIDENCE_SPRITES[id];return p?`background-image:var(--evidence-atlas);background-position:${p[0]*50}% 0%`:"";}
function evidenceHTML(id,cls=""){return EVIDENCE_SPRITES[id]?`<span class="evidence-sprite ${cls}" role="img" aria-label="${DEX[id]?.n||"역사 문서"}" style="${evidenceStyle(id)}"></span>`:"";}
function atlasStyle(code){
  const s=GENERATED_SPRITES[code];if(!s)return"";
  return `background-position:${s[1]*50}% ${s[2]*100}%`;
}
function atlasHTML(code,cls="",label=""){
  const s=GENERATED_SPRITES[code];
  return s?`<span class="atlas-sprite ${cls}" data-atlas="${s[0]}" data-sprite-code="${code}" role="img" aria-label="${label||CH[code]?.n||"게임 인물"}" style="${atlasStyle(code)}"></span>`:"";
}
function hydrateAtlasSprites(root=document){
  root.querySelectorAll(".atlas-sprite[data-atlas]").forEach(el=>{
    const src=EXTRA_ASSETS[el.dataset.atlas];
    if(src)el.style.backgroundImage=`url("${src}")`;
  });
}

/* ==========================================================
   필드(걷기)
   ========================================================== */
const P={map:"suyeong",px:0,py:0,dir:"d",moving:false,tx:0,ty:0,fx:0,fy:0,anim:0};
const CAM={snap:true,map:"",ease:0,dbH:150,extra:0};
const BGC={key:"",c:null,f:1};
const keys={};
const padDir={u:0,d:0,l:0,r:0};
function resetInput(){
  Object.keys(keys).forEach(k=>keys[k]=false);
  Object.keys(padDir).forEach(k=>padDir[k]=0);
  document.querySelectorAll(".pk.on").forEach(k=>k.classList.remove("on"));
}
addEventListener("keydown",e=>{
  if(e.key==="Escape"&&!$("#dex").classList.contains("hide")){e.preventDefault();e.stopPropagation();closeDex();return;}
  if(e.target&&/INPUT|TEXTAREA/.test(e.target.tagName)) return;
  if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," ","Enter"].includes(e.key)) e.preventDefault();
  if((e.key===" "||e.key==="Enter")&&!e.repeat&&!$("#stamp").classList.contains("hide")){dismissStamp();return;}
  if(G.inputLock) return;
  if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","w","a","s","d"].includes(e.key)) keys[e.key]=true;
  if((e.key===" "||e.key==="Enter")&&!e.repeat) pressA();
});
addEventListener("keyup",e=>{keys[e.key]=false});
addEventListener("blur",resetInput);
document.querySelectorAll(".pk").forEach(k=>{
  const d=k.dataset.d;
  const on=e=>{e.preventDefault();if(G.inputLock||!(G.mode==="field"||G.mode==="sea"))return;
    padDir[d]=1;k.classList.add("on");if(k.setPointerCapture&&e.pointerId!=null)k.setPointerCapture(e.pointerId)};
  const off=e=>{e.preventDefault();padDir[d]=0;k.classList.remove("on")};
  k.addEventListener("pointerdown",on);
  k.addEventListener("pointerup",off);k.addEventListener("pointercancel",off);k.addEventListener("lostpointercapture",off);
});
$("#abtn").onclick=pressA;
$("#chart-btn").onclick=e=>{e.stopPropagation();toggleChart();};
$("#dock-btn").onclick=e=>{e.stopPropagation();if(G.mode==="sea"&&SEA.nearDock)openPort(SEA.nearDock.key);};

function enterMap(m,tx,ty,dir){
  P.map=m; P.tx=tx??MAPS[m].spawn[0]; P.ty=ty??MAPS[m].spawn[1];
  P.px=P.tx*T; P.py=P.ty*T; P.dir=dir||"d"; P.moving=false; P.anim=0; CAM.snap=true;
  $("#pl-n").textContent=MAPS[m].name; $("#pl-k").textContent=MAPS[m].sub;
  G.mode="field"; G.lastMode="field"; G.talkReturnMode="field"; resetInput(); ui();
}
function tryMove(){
  if(P.moving) return;
  let dx=0,dy=0;
  if(keys.ArrowUp||keys.w||padDir.u) dy=-1;
  else if(keys.ArrowDown||keys.s||padDir.d) dy=1;
  else if(keys.ArrowLeft||keys.a||padDir.l) dx=-1;
  else if(keys.ArrowRight||keys.d||padDir.r) dx=1;
  if(!dx&&!dy) return;
  P.dir=dy<0?"u":dy>0?"d":dx<0?"l":"r";
  const nx=P.tx+dx, ny=P.ty+dy;
  if(solidAt(P.map,nx,ny)) return;
  if(entityAt(P.map,nx,ny)) return;
  P.tx=nx;P.ty=ny;P.moving=true;P.fx=dx;P.fy=dy;
}
function entityAt(m,tx,ty){ return (ENT[m]||[]).find(e=>!e.gone&&tx>=e.tx&&tx<e.tx+(e.w||1)&&ty>=e.ty&&ty<e.ty+(e.h||1)); }
function pressA(){
  if(!$("#stamp").classList.contains("hide")){ dismissStamp(); return; }
  if(G.inputLock) return;
  if(G.mode==="catch"){ catchHit(); return; }
  if(G.mode==="sea"){ toggleSailTrim(); return; }
  if(G.mode==="talk"){ advance(); return; }
  if(G.mode!=="field") return;
  const d={u:[0,-1],d:[0,1],l:[-1,0],r:[1,0]}[P.dir];
  const e=entityAt(P.map,P.tx+d[0],P.ty+d[1]);
  if(!e) return;
  if(e.cr){ startCatch(e); return; }
  if(e.talk) play(SC[e.talk]());
}

/* ==========================================================
   렌더 — 필드
   ========================================================== */
let camX=0,camY=0,TICK=0;
function drawField(){
  const m=MAPS[P.map], rows=m.rows;
  const mw=rows[0].length*T, mh=rows.length*T;
  const scale=Math.max(1, Math.min(2.4, Math.min(VW/ (18*T), VH/(11*T)) ));
  const sw=VW/scale, sh=VH/scale;
  const fx=(WALK?WALK.e.px:P.px)+T/2, fy=(WALK?WALK.e.py:P.py)+T/2;
  // 대화 중에는 아래 대사창에 가려지는 만큼 화면을 더 내려, 맨 아래 줄의 인물도 보이게 한다
  const db=$("#dbox"),talkOpen=(G.mode==="talk"&&db&&!db.classList.contains("hide"))||!!WALK;
  if(talkOpen&&(TICK%20===0||!CAM.dbH))CAM.dbH=db.offsetHeight||150;
  const extra=talkOpen?Math.min(sh*.4,CAM.dbH/scale):0;
  if(extra!==CAM.extra){CAM.extra=extra;CAM.ease=450;}
  let tx=Math.max(0,Math.min(mw-sw, fx-sw/2)), ty=Math.max(0,Math.min(mh-sh+extra, fy-sh/2+extra*.5));
  if(mw<sw) tx=(mw-sw)/2; if(mh<sh) ty=(mh-sh)/2;
  /* 카메라: 평소에는 주인공을 곧바로 따라가고(끊김 없음), 장면 연출 때만 부드럽게 옮긴다 */
  if(CAM.snap||CAM.map!==P.map){camX=tx;camY=ty;CAM.snap=false;CAM.map=P.map;CAM.ease=0;}
  else if(WALK||CAM.ease>0){const a=1-Math.pow(.8,FRAME_DT/STEP_MS);camX+=(tx-camX)*a;camY+=(ty-camY)*a;if(!WALK)CAM.ease=Math.max(0,CAM.ease-FRAME_DT);}
  else{camX=tx;camY=ty;}
  const kpx=scale*DPR;camX=Math.round(camX*kpx)/kpx;camY=Math.round(camY*kpx)/kpx; // 화면 픽셀에 맞춰 흔들림 없이
  g.save(); g.scale(scale,scale); g.translate(-camX,-camY);
  g.fillStyle="#0b2230"; g.fillRect(camX,camY,sw,sh);
  const x0=Math.max(0,(camX/T|0)-1), x1=Math.min(rows[0].length,(camX+sw)/T+2|0);
  const y0=Math.max(0,(camY/T|0)-1), y1=Math.min(rows.length,(camY+sh)/T+2|0);
  const bc=fieldBgCanvas(m,mw,mh,scale);
  if(bc){
    /* 배경은 화면 배율로 한 번만 줄여 둔 그림을 그대로 옮겨 찍는다(매 프레임 큰 그림을 다시 줄이지 않음) */
    g.save();g.setTransform(1,0,0,1,0,0);
    /* 보이는 부분만 잘라 옮긴다 */
    const r=bc.f/kpx,dw=Math.round(VW*DPR),dh=Math.round(VH*DPR);
    let sx=camX*bc.f,sy=camY*bc.f,sw=dw*r,sh=dh*r,dx=0,dy=0,ddw=dw,ddh=dh;
    if(sx<0){dx=-sx/r;ddw-=dx;sw+=sx;sx=0;} if(sy<0){dy=-sy/r;ddh-=dy;sh+=sy;sy=0;}
    if(sx+sw>bc.c.width){const o=sx+sw-bc.c.width;sw-=o;ddw-=o/r;} if(sy+sh>bc.c.height){const o=sy+sh-bc.c.height;sh-=o;ddh-=o/r;}
    const same=Math.abs(r-1)<1e-3;g.imageSmoothingEnabled=!same;g.imageSmoothingQuality="low";
    if(sw>0&&sh>0)g.drawImage(bc.c,Math.round(sx),Math.round(sy),same?Math.round(ddw):sw,same?Math.round(ddh):sh,Math.round(dx),Math.round(dy),Math.round(ddw),Math.round(ddh));
    g.restore();g.imageSmoothingEnabled=true;g.imageSmoothingQuality="medium";
    if(P.map==="dokdo"){g.fillStyle="rgba(220,248,255,.35)";for(let i=0;i<65;i++){const x=(i*137+TICK*1.7)%mw,y=(i*71+(i%5)*29)%mh;g.fillRect(x,y,3+(i%3)*2,2);}}
  }else{
    for(let y=y0;y<y1;y++) for(let x=x0;x<x1;x++) drawTile(rows[y][x],x,y);
  }
  const ents=(ENT[P.map]||[]).filter(e=>!e.gone).slice();
  ents.push({player:true,tx:P.tx,ty:P.ty});
  ents.sort((a,b)=>(a.ty+(a.h||1))-(b.ty+(b.h||1)));
  ents.forEach(e=>{
    if(e.player){ if(P.map==="dokdo")drawDokdoBoatPlayer(); else if(!drawPlayerSprite(P.px,P.py,P.dir,P.moving?1+((P.walk/20|0)%4):0)) drawPerson(P.px,P.py,"me",P.dir,P.moving?((TICK/8|0)%2):0); }
    else if(e.baked){ if(e.obj) drawMapObject(e); }
    else if(e.cr) drawCreature(e);
    else if(e.obj) drawMapObject(e);
    else drawPerson(e.px??e.tx*T,e.py??e.ty*T,e.ch,e.dir||"d",e.walking?((TICK/8|0)%2):0);
  });
  ents.forEach(e=>{if(e.bubble)drawBubble(e);});
  // 상호작용 표시: 가까운 대화 상대에게 작은 말풍선, 바라보는 상대에게 화살표
  if(G.mode==="field"){
    const fig=m.npcFig||m.fig||1;
    ents.forEach(e=>{
      if(e.player||!(e.talk)||e.obj||Math.abs(e.tx-P.tx)+Math.abs(e.ty-P.ty)>4)return;
      const bx=(e.tx+(e.w||1)/2)*T,by=(e.ty+1)*T-66*fig+Math.sin(TICK/12+e.tx)*1.5;
      g.fillStyle="rgba(255,250,232,.92)";g.strokeStyle="#241c14";g.lineWidth=1.2;g.beginPath();g.ellipse(bx,by-6,7,5,0,0,7);g.fill();g.stroke();
      g.fillStyle="#241c14";[-3,0,3].forEach(o=>g.fillRect(bx+o-.8,by-6.8,1.6,1.6));
    });
    const d={u:[0,-1],d:[0,1],l:[-1,0],r:[1,0]}[P.dir];
    const t=entityAt(P.map,P.tx+d[0],P.ty+d[1]);
    if(t&&(t.talk||t.cr)){
      const bx=(t.tx+(t.w||1)/2)*T, by=(t.obj||t.cr?t.ty*T-6:(t.ty+1)*T-66*fig-12)+Math.sin(TICK/9)*2;
      g.fillStyle="#ffe9a8"; g.strokeStyle="#241c14"; g.lineWidth=2;
      g.beginPath(); g.moveTo(bx,by+8); g.lineTo(bx-6,by); g.lineTo(bx+6,by); g.closePath(); g.fill(); g.stroke();
    }
  }
  g.restore();
}
function fieldBgCanvas(m,mw,mh,scale){
  const im=m.bg?SPRITE_IMAGES["bg_"+P.map]:(P.map==="dokdo"?SPRITE_IMAGES.dokdoBg:null);
  if(!im||!im.complete||!im.naturalWidth)return null;
  const want=scale*DPR,f=Math.min(want,Math.sqrt(12.5e6/(mw*mh))),key=P.map+"|"+f.toFixed(4);
  if(BGC.key!==key){
    const c=document.createElement("canvas");c.width=Math.round(mw*f);c.height=Math.round(mh*f);
    const x=c.getContext("2d",{alpha:false});x.imageSmoothingEnabled=true;x.imageSmoothingQuality="high";x.drawImage(im,0,0,c.width,c.height);
    if(P.map==="dokdo"){x.fillStyle="rgba(3,44,78,.08)";x.fillRect(0,0,c.width,c.height);}
    BGC.key=key;BGC.c=c;BGC.f=f;
  }
  return BGC;
}
function drawPlayerSprite(px,py,dir,frame){
  const im=SPRITE_IMAGES.playerWalk;if(!im||!im.complete||!im.naturalWidth)return false;
  const cw=im.naturalWidth/5,chh=im.naturalHeight/4,row={d:0,u:1,l:2,r:3}[dir]||0;
  const h=63.36*((MAPS[P.map]&&MAPS[P.map].fig)||1),w=h*cw/chh,x=px+T/2,y=py+T-2;
  g.fillStyle="rgba(0,0,0,.26)";g.beginPath();g.ellipse(x,y,11,4,0,0,7);g.fill();
  g.imageSmoothingEnabled=true;g.drawImage(im,frame*cw,row*chh,cw,chh,x-w/2,y-h*129/132,w,h);g.imageSmoothingEnabled=true;
  return true;
}
function drawBubble(e){
  const mm=MAPS[P.map]||{},fig=mm.npcFig||mm.fig||1,x=(e.px??e.tx*T)+T/2,y=(e.py??e.ty*T)+T-68*fig;
  g.font="800 9px Pretendard,sans-serif";g.textAlign="center";const w=g.measureText(e.bubble).width+14;
  g.fillStyle="rgba(255,248,230,.96)";g.strokeStyle="#241c14";g.lineWidth=1.4;g.fillRect(x-w/2,y-18,w,15);g.strokeRect(x-w/2,y-18,w,15);
  g.beginPath();g.moveTo(x-3,y-3);g.lineTo(x+3,y-3);g.lineTo(x,y+2);g.closePath();g.fill();g.stroke();
  g.fillStyle="#6a1e14";g.fillText(e.bubble,x,y-7);g.textAlign="left";
}
function drawDokdoBoatPlayer(){
  const x=P.px+T/2,y=P.py+T/2,size=86,bob=Math.sin(TICK*.12)*1.4;
  g.save();g.globalAlpha=.45;g.fillStyle="#dff7fb";
  for(let i=0;i<7;i++){const yy=y+23+i*3,spread=17+i*3;g.fillRect(x-spread,yy,8,2);g.fillRect(x+spread-8,yy,8,2);}g.restore();
  drawShipSprite(SPRITE_IMAGES.ship_player,0,x,y+bob,size,0,.98);
  g.fillStyle="#b23425";g.strokeStyle="#fff0c8";g.lineWidth=1;g.beginPath();g.arc(x,y-5+bob,4,0,Math.PI*2);g.fill();g.stroke();
}
function drawDockAtlas(col,row,x,y,w,h){
  const im=SPRITE_IMAGES.dock;if(!im||!im.complete||!im.naturalWidth)return false;const sw=im.naturalWidth/3,sh=im.naturalHeight/2;
  g.save();g.shadowColor="rgba(20,14,9,.32)";g.shadowBlur=3;g.shadowOffsetY=3;g.drawImage(im,col*sw,row*sh,sw,sh,Math.round(x-w/2),Math.round(y-h),w,h);g.restore();return true;
}
function drawMapObject(e){
  const x=e.tx*T+T/2,y=e.ty*T+T;
  if(e.baked&&e.obj==="castleGate"){
    const cx=(e.tx+e.w/2)*T,cy=e.ty*T+4,pulse=.30+Math.sin(TICK*.1)*.14;
    g.save();g.globalAlpha=pulse;const gl=g.createRadialGradient(cx,cy,4,cx,cy,70);gl.addColorStop(0,"rgba(255,227,160,1)");gl.addColorStop(1,"rgba(255,227,160,0)");g.fillStyle=gl;g.fillRect(cx-72,cy-72,144,144);g.restore();
    g.textAlign="center";g.font="800 10px Pretendard,sans-serif";const label="▲ 성 안으로 들어가기",lw=g.measureText(label).width+16;
    g.fillStyle="rgba(28,20,14,.9)";g.fillRect(cx-lw/2,cy-44,lw,17);g.strokeStyle="#d5b66f";g.lineWidth=1;g.strokeRect(cx-lw/2,cy-44,lw,17);g.fillStyle="#fff0bd";g.fillText(label,cx,cy-32);g.textAlign="left";
    return;
  }
  if(e.baked&&e.obj==="statue"){
    if(G.flags.statueSeen||Math.hypot(P.tx-(e.tx+2),P.ty-(e.ty+2))>=9)return;
    const cx=(e.tx+e.w/2)*T,cy=2*T,glow=g.createRadialGradient(cx,cy,5,cx,cy,70);
    glow.addColorStop(0,"rgba(255,222,112,.45)");glow.addColorStop(1,"rgba(255,222,112,0)");g.fillStyle=glow;g.fillRect(cx-72,cy-72,144,144);
    g.textAlign="center";g.font="900 10px Pretendard,sans-serif";const label="▼ 안용복 충혼탑",lw=g.measureText(label).width+16;
    g.fillStyle="rgba(30,24,17,.9)";g.fillRect(cx-lw/2-40,6,lw,17);g.strokeStyle="#e9c86f";g.lineWidth=1;g.strokeRect(cx-lw/2-40,6,lw,17);g.fillStyle="#fff0bd";g.fillText(label,cx-40,18);g.textAlign="left";
    return;
  }
  if(e.obj==="castleGate"){
    const pulse=.45+Math.sin(TICK*.1)*.16;
    g.save();g.globalAlpha=pulse;g.fillStyle="#ffe3a0";g.beginPath();g.arc(x,y-19,21,0,Math.PI*2);g.fill();g.restore();
    g.fillStyle="#3b2417";g.strokeStyle="#d5b66f";g.lineWidth=1.5;g.fillRect(x-13,y-31,26,28);g.strokeRect(x-13,y-31,26,28);
    g.strokeStyle="#8c5a32";g.beginPath();g.moveTo(x,y-31);g.lineTo(x,y-3);g.moveTo(x-13,y-17);g.lineTo(x+13,y-17);g.stroke();
    g.textAlign="center";g.font="800 9px Pretendard,sans-serif";const label="▲ 성 안으로 들어가기",lw=g.measureText(label).width+14;
    g.fillStyle="rgba(28,20,14,.9)";g.fillRect(x-lw/2,y-49,lw,15);g.strokeStyle="#d5b66f";g.strokeRect(x-lw/2,y-49,lw,15);g.fillStyle="#fff0bd";g.fillText(label,x,y-38);g.textAlign="left";
  }else if(e.obj==="statue"){
    const im=SPRITE_IMAGES.statue,H=164,W=83,top=y-H+3,guide=P.map==="suyeong"&&!G.flags.statueSeen&&Math.hypot(P.tx-e.tx,P.ty-e.ty)<8;
    if(guide){
      const glow=g.createRadialGradient(x,y-H*.48,5,x,y-H*.48,58);
      glow.addColorStop(0,"rgba(255,222,112,.42)");glow.addColorStop(1,"rgba(255,222,112,0)");
      g.fillStyle=glow;g.fillRect(x-66,top-12,132,H+25);
    }
    g.fillStyle="rgba(20,17,13,.34)";g.beginPath();g.ellipse(x,y-2,40,7,0,0,Math.PI*2);g.fill();
    if(im&&im.complete&&im.naturalWidth){
      g.save();g.shadowColor="rgba(22,16,12,.42)";g.shadowBlur=5;g.shadowOffsetY=3;
      g.drawImage(im,x-W/2,top,W,H);g.restore();
      g.textAlign="center";g.font="700 4.4px Pretendard,sans-serif";g.fillStyle="#f0d79b";
      [..."안용복충혼탑"].forEach((ch,i)=>g.fillText(ch,x,top+H*.665+i*5.15));g.textAlign="left";
    }else{
      g.fillStyle="#d9d5cb";g.strokeStyle="#514b43";g.lineWidth=2;g.fillRect(x-22,y-59,44,56);g.strokeRect(x-22,y-59,44,56);
      g.fillStyle="#8a5639";g.fillRect(x-13,y-111,26,52);g.fillRect(x+8,y-145,7,42);g.fillStyle="#5a3524";g.fillRect(x+9,y-153,5,10);
    }
    if(guide){
      g.textAlign="center";g.font="900 9px Pretendard,sans-serif";const label="▲  안용복 충혼탑";
      const lw=g.measureText(label).width+14,ly=top-11;g.fillStyle="rgba(30,24,17,.88)";g.fillRect(x-lw/2,ly-10,lw,15);
      g.strokeStyle="#e9c86f";g.lineWidth=1;g.strokeRect(x-lw/2,ly-10,lw,15);g.fillStyle="#fff0bd";g.fillText(label,x,ly+1);g.textAlign="left";
    }
  }else if(e.obj==="mooredBoat"){
    if(!drawDockAtlas(0,0,x,y+6,126,86)){drawShipSprite(SPRITE_IMAGES.ship_player,0,x,y-18,94,0,.92);g.strokeStyle="#d9c69a";g.lineWidth=2;g.beginPath();g.moveTo(x-28,y+8);g.lineTo(x-48,y+18);g.stroke();}
  }else if(e.obj==="cargo"){
    if(!drawDockAtlas(1,0,x,y+2,68,50)){g.fillStyle="rgba(0,0,0,.2)";g.fillRect(x-15,y-3,30,5);g.fillStyle="#8b6b43";g.strokeStyle="#3d2b1b";g.lineWidth=2;g.fillRect(x-14,y-24,15,20);g.strokeRect(x-14,y-24,15,20);g.fillRect(x+1,y-19,14,15);g.strokeRect(x+1,y-19,14,15);}
  }else if(e.obj==="barrels"){
    if(!drawDockAtlas(2,0,x,y+2,70,50)){g.fillStyle="#72502f";g.strokeStyle="#2d2016";g.lineWidth=2;for(let i=0;i<2;i++){g.beginPath();g.ellipse(x-9+i*18,y-12,8,13,0,0,7);g.fill();g.stroke();g.strokeRect(x-16+i*18,y-17,14,3);}}
  }else if(e.obj==="sacks"){
    if(!drawDockAtlas(1,0,x,y+2,58,44)){g.fillStyle="#b7a078";g.strokeStyle="#4c3b28";g.lineWidth=1.5;for(let i=0;i<3;i++){g.beginPath();g.ellipse(x-12+i*12,y-9-(i%2)*5,9,12,0,0,7);g.fill();g.stroke();}}
  }else if(e.obj==="repairProps"){
    if(!drawDockAtlas(0,1,x,y+3,82,60)){g.fillStyle="#6d4a2b";g.fillRect(x-26,y-22,52,19);g.fillStyle="#b48a55";g.fillRect(x-22,y-36,4,34);g.fillRect(x+17,y-43,4,41);g.fillRect(x-22,y-43,43,4);}
  }
}
function drawOkiExteriorTile(c,x,y){
  const px=x*T,py=y*T,odd=(x+y)&1;
  if(c==="#"){
    g.fillStyle="#31372f";g.fillRect(px,py,T,T);g.fillStyle="#596052";g.fillRect(px+2,py+2,T-4,T-4);
    g.strokeStyle="#383d35";g.lineWidth=1;g.beginPath();g.moveTo(px,py+11);g.lineTo(px+T,py+11);g.moveTo(px,py+23);g.lineTo(px+T,py+23);g.moveTo(px+10,py);g.lineTo(px+8,py+T);g.moveTo(px+23,py);g.lineTo(px+21,py+T);g.stroke();
  }else if(c==="W"){
    g.fillStyle="#d8d3be";g.fillRect(px,py,T,T);g.fillStyle="#eee7d0";g.fillRect(px+2,py+3,T-4,20);g.fillStyle="#756d61";g.fillRect(px,py+24,T,8);
    g.strokeStyle="rgba(75,68,58,.36)";g.strokeRect(px+5,py+7,22,13);
  }else if(c==="K"){
    g.fillStyle="#242a2c";g.fillRect(px,py,T,T);g.fillStyle="#3f4a4d";for(let i=-8;i<40;i+=8){g.beginPath();g.moveTo(px+i,py+T);g.lineTo(px+i+20,py);g.lineTo(px+i+24,py);g.lineTo(px+i+4,py+T);g.fill();}
    g.fillStyle="#151a1c";g.fillRect(px,py+27,T,5);
  }else if(c==="G"){
    g.fillStyle="#d8d3be";g.fillRect(px,py,T,T);g.fillStyle="#22282a";g.beginPath();g.moveTo(px-3,py+10);g.lineTo(px+T/2,py);g.lineTo(px+T+3,py+10);g.closePath();g.fill();
    g.fillStyle="#4d3220";g.fillRect(px+8,py+13,16,19);g.fillStyle="#d5b66f";g.fillRect(px+10,py+17,3,3);g.fillRect(px+19,py+17,3,3);
  }else if(c==="E"){
    g.fillStyle="#201a16";g.fillRect(px,py,T,T);g.fillStyle="#56361f";g.fillRect(px+3,py+3,T-6,T-3);g.strokeStyle="#9a6d38";g.lineWidth=2;g.strokeRect(px+5,py+5,T-10,T-5);g.beginPath();g.moveTo(px+T/2,py+4);g.lineTo(px+T/2,py+T);g.stroke();
  }else if(c==="s"){
    g.fillStyle="#aa9b7d";g.fillRect(px,py,T,T);g.strokeStyle="#746a58";g.lineWidth=1;g.strokeRect(px+2,py+2,13,12);g.strokeRect(px+17,py+2,13,12);g.strokeRect(px+4,py+16,16,14);g.strokeRect(px+22,py+16,8,14);
  }else if(c==="r"){
    g.fillStyle=odd?"#b69869":"#bea274";g.fillRect(px,py,T,T);g.fillStyle="rgba(93,66,39,.22)";g.fillRect(px+6+(x*5%13),py+8+(y*7%12),4,3);g.fillRect(px+20,py+24,3,2);
  }else if(c==="T"){
    g.fillStyle="#5d754b";g.fillRect(px,py,T,T);g.fillStyle="#4c3522";g.fillRect(px+14,py+17,5,15);g.fillStyle="#223f31";g.beginPath();g.moveTo(px+16,py+1);g.lineTo(px+3,py+23);g.lineTo(px+29,py+23);g.closePath();g.fill();g.fillStyle="#315844";g.beginPath();g.moveTo(px+16,py+7);g.lineTo(px+7,py+27);g.lineTo(px+25,py+27);g.closePath();g.fill();
  }else{
    g.fillStyle=odd?"#718a58":"#789361";g.fillRect(px,py,T,T);g.fillStyle="rgba(255,255,255,.11)";g.fillRect(px+7+(x*3%18),py+9+(y*5%17),3,2);
  }
}
function drawOkiInteriorTile(c,x,y){
  const px=x*T,py=y*T,odd=(x+y)&1;
  if(c==="#"){
    g.fillStyle="#17191a";g.fillRect(px,py,T,T);g.fillStyle="#303436";g.fillRect(px+2,py+2,T-4,T-4);g.strokeStyle="#17191a";g.strokeRect(px+3,py+3,T-6,T-6);
  }else if(c==="X"){
    g.fillStyle="#3e2d21";g.fillRect(px,py,T,T);g.fillStyle="#e6dcc4";g.fillRect(px+4,py+3,T-8,T-7);g.strokeStyle="#7a5a3c";g.lineWidth=1.5;g.beginPath();g.moveTo(px+T/2,py+3);g.lineTo(px+T/2,py+T-4);g.moveTo(px+4,py+T/2);g.lineTo(px+T-4,py+T/2);g.stroke();g.fillStyle="#2a211a";g.fillRect(px,py+T-4,T,4);
  }else if(c==="I"){
    g.fillStyle=odd?"#c8b779":"#d1c184";g.fillRect(px,py,T,T);g.strokeStyle="#716a48";g.lineWidth=1;g.strokeRect(px+1,py+1,T-2,T-2);
    g.fillStyle="rgba(255,249,207,.18)";if(odd){for(let i=5;i<30;i+=7)g.fillRect(px+i,py+3,1,26);}else{for(let i=5;i<30;i+=7)g.fillRect(px+3,py+i,26,1);}
  }else if(c==="C"){
    g.fillStyle=odd?"#60422c":"#694a31";g.fillRect(px,py,T,T);g.strokeStyle="#352419";g.lineWidth=1;g.beginPath();g.moveTo(px,py+8);g.lineTo(px+T,py+8);g.moveTo(px,py+17);g.lineTo(px+T,py+17);g.moveTo(px,py+26);g.lineTo(px+T,py+26);g.stroke();g.fillStyle="rgba(255,225,164,.12)";g.fillRect(px+2,py+2,T-4,2);
  }else if(c==="E"){
    g.fillStyle="#342519";g.fillRect(px,py,T,T);g.fillStyle="#8b623c";g.fillRect(px+3,py+2,T-6,T-2);g.strokeStyle="#3c2819";g.strokeRect(px+5,py+4,T-10,T-6);g.fillStyle="#d1aa58";g.fillRect(px+8,py+15,3,3);
  }else{
    g.fillStyle="#c8b779";g.fillRect(px,py,T,T);
  }
}
function drawTile(c,x,y){
  if(P.map==="oki"){drawOkiExteriorTile(c,x,y);return;}
  if(P.map==="okicastle"){drawOkiInteriorTile(c,x,y);return;}
  const px=x*T,py=y*T;
  if(c==="~"){
    g.fillStyle="#1f6f93"; g.fillRect(px,py,T,T);
    g.fillStyle="rgba(160,225,245,.22)";
    const o=Math.sin((x*.9+y*.6)+TICK*.045)*3;
    g.fillRect(px+4,py+11+o,12,2); g.fillRect(px+18,py+21-o,10,2);
  } else if(c==="#"){
    g.fillStyle="#2b3a2a"; g.fillRect(px,py,T,T);
    g.fillStyle="#3d5138"; g.fillRect(px+2,py+2,T-4,T-4);
  } else if(c==="B"){
    g.fillStyle="#6f5334"; g.fillRect(px,py,T,T);
    g.fillStyle="#8a6a44"; g.fillRect(px+2,py+2,T-4,T-4);
    g.strokeStyle="#4a3722"; g.lineWidth=1; g.strokeRect(px+6,py+8,T-12,T-14);
  } else if(c==="D"){
    g.fillStyle="#9c7c4e"; g.fillRect(px,py,T,T);
    g.strokeStyle="#7a5e37"; g.lineWidth=2;
    g.beginPath(); g.moveTo(px,py+10);g.lineTo(px+T,py+10);g.moveTo(px,py+22);g.lineTo(px+T,py+22); g.stroke();
  } else if(c==="^"){
    g.fillStyle="#6d6b62"; g.fillRect(px,py,T,T);
    g.fillStyle="#8b887c"; g.beginPath(); g.moveTo(px+4,py+T-3);g.lineTo(px+T/2,py+5);g.lineTo(px+T-4,py+T-3);g.closePath(); g.fill();
    g.fillStyle="#57554d"; g.fillRect(px,py+T-5,T,5);
  } else if(c==="P"){
    g.fillStyle="#b9b5a8";g.fillRect(px,py,T,T);g.fillStyle="#a29e93";g.fillRect(px,py+T-2,T,2);g.fillRect(px+T-2,py,2,T);
    g.fillStyle="rgba(255,255,255,.22)";g.fillRect(px+4,py+5,8,2);g.fillRect(px+19,py+19,7,2);
  } else if(c==="F"){
    g.fillStyle="#669653";g.fillRect(px,py,T,T);g.fillStyle="#f4d55e";g.fillRect(px+7,py+9,3,3);g.fillRect(px+21,py+18,3,3);
    g.fillStyle="#efeee8";g.fillRect(px+14,py+24,3,3);g.fillStyle="#39743d";g.fillRect(px+8,py+12,2,7);g.fillRect(px+22,py+21,2,6);
  } else if(c==="T"){
    g.fillStyle=P.map==="dokdo"?"#8b9a6b":"#4d7a45"; g.fillRect(px,py,T,T);
    g.fillStyle="#6b4a28"; g.fillRect(px+14,py+18,5,12);
    g.fillStyle="#2f6b34"; g.beginPath(); g.arc(px+16,py+14,11,0,7); g.fill();
    g.fillStyle="#3d8a41"; g.beginPath(); g.arc(px+13,py+12,7,0,7); g.fill();
  } else {
    const base = P.map==="dokdo" ? "#9a9276" : (P.map==="oki" ? "#7d9464" : P.map==="suyeong"?"#6f9e59":"#7e9a58");
    g.fillStyle=base; g.fillRect(px,py,T,T);
    g.fillStyle="rgba(0,0,0,.06)";
    if((x+y)%2) g.fillRect(px,py,T,T);
    g.fillStyle="rgba(255,255,255,.10)";
    g.fillRect(px+((x*7+y*3)%22),py+((x*5+y*11)%24),3,2);
  }
}
function drawFullSprite(px,py,chk,dir,fr){
  const spec=FULL_SPRITES[chk], im=spec&&SPRITE_IMAGES[spec[0]];
  if(!spec||!im||!im.complete||!im.naturalWidth) return false;
  const cols=spec[3]||3, rows=spec[4]||2, sw=im.naturalWidth/cols, sh=im.naturalHeight/rows;
  const x=px+T/2, y=py+T, bob=fr?2:0;
  const mm=MAPS[P.map]||{},size=chk==="me"?60*(mm.fig||1):64*(mm.npcFig||mm.fig||1);
  g.fillStyle="rgba(0,0,0,.24)"; g.beginPath(); g.ellipse(x,y-2,11,4,0,0,7); g.fill();
  g.save(); g.translate(x,y-size+bob);
  if(dir==="l"){ g.scale(-1,1); g.drawImage(im,spec[1]*sw,spec[2]*sh,sw,sh,-size/2,0,size,size); }
  else g.drawImage(im,spec[1]*sw,spec[2]*sh,sw,sh,-size/2,0,size,size);
  g.restore();
  return true;
}
function drawPerson(px,py,chk,dir,fr){
  if(drawFullSprite(px,py,chk,dir,fr)) return;
  const c=CH[chk]||CH.me;
  const x=px+T/2, y=py+T;
  g.fillStyle="rgba(0,0,0,.25)"; g.beginPath(); g.ellipse(x,y-2,10,4,0,0,7); g.fill();
  const bob=fr?1:0;
  // 몸
  g.fillStyle=c.cloth||"#6b5842";
  g.fillRect(x-8,y-20+bob,16,15);
  // 팔
  g.fillStyle=c.skin; g.fillRect(x-11,y-18+bob,3,9); g.fillRect(x+8,y-18+bob,3,9);
  // 다리
  g.fillStyle="#3d3324";
  if(fr){ g.fillRect(x-7,y-6,5,6); g.fillRect(x+2,y-8,5,8); }
  else { g.fillRect(x-7,y-7,5,7); g.fillRect(x+2,y-7,5,7); }
  // 머리
  g.fillStyle=c.skin; g.beginPath(); g.arc(x,y-26+bob,8,0,7); g.fill();
  g.fillStyle=c.hair||"#241c14";
  if(!c.bald){ g.beginPath(); g.arc(x,y-28+bob,8,Math.PI,0); g.fill(); }
  // 눈
  g.fillStyle="#241c14";
  if(dir!=="u"){
    const ox=dir==="l"?-3:dir==="r"?3:0;
    g.fillRect(x-3+ox,y-27+bob,2,2); g.fillRect(x+2+ox,y-27+bob,2,2);
  }
  // 모자
  const h=c.hat;
  if(h==="paeraengi"||h==="satgat"||h==="jsatgat"){
    g.fillStyle=h==="satgat"?"#c8ab6e":h==="jsatgat"?"#b09a63":"#8a6b3a";
    g.beginPath(); g.ellipse(x,y-31+bob,13,4,0,0,7); g.fill();
    g.beginPath(); g.ellipse(x,y-34+bob,6,4,0,0,7); g.fill();
  } else if(h==="eboshi"){ g.fillStyle="#2b2b2b"; g.fillRect(x-4,y-40+bob,8,12); }
  else if(h==="gwanmo"){ g.fillStyle="#1b1b1b"; g.fillRect(x-9,y-33+bob,18,4); g.fillRect(x-5,y-38+bob,10,6); }
  else if(h==="towel"){ g.fillStyle="#e0e0d4"; g.fillRect(x-8,y-32+bob,16,4); }
  else if(h==="cap"){ g.fillStyle="#b23425"; g.fillRect(x-8,y-33+bob,16,5); g.fillRect(x+ (dir==="l"?-14:8),y-31+bob,6,3); }
}
function drawCreature(e){
  const x=e.tx*T+T/2, y=e.ty*T+T, near=Math.abs(e.tx-P.tx)+Math.abs(e.ty-P.ty)<=2;
  const bob=Math.sin(TICK/14+e.tx)*2, kind=catchStageKind(e.cr);
  // 물결 고리
  if(kind==="water"||kind==="deep"||kind==="rock"){
    for(let k=0;k<2;k++){const t=((TICK*.012+k*.5+e.tx*.13)%1);g.strokeStyle=`rgba(220,248,255,${(1-t)*.5})`;g.lineWidth=1.4;g.beginPath();g.ellipse(x,y-6,8+t*20,3+t*7,0,0,Math.PI*2);g.stroke();}
  }else{g.fillStyle="rgba(0,0,0,.2)";g.beginPath();g.ellipse(x,y-4,12,4,0,0,Math.PI*2);g.fill();}
  if(near){const pr=18+Math.sin(TICK*.15)*3;g.strokeStyle="rgba(255,226,120,.9)";g.lineWidth=2;g.setLineDash([4,4]);g.lineDashOffset=-TICK*.4;g.beginPath();g.ellipse(x,y-8,pr+6,pr*.45+4,0,0,Math.PI*2);g.stroke();g.setLineDash([]);}
  const s=creatureSpriteSpec(e.cr),im=s&&s.img,tier=CATCH_TIER[e.cr]||1;
  if(s&&im&&im.complete&&im.naturalWidth){
    const sw=im.naturalWidth/s.cols,sh=im.naturalHeight/s.rows,size=(e.cr==="methane"?66:58)*(near?1.08:1);
    g.drawImage(im,s.p[0]*sw,s.p[1]*sh,sw,sh,Math.round(x-size/2),Math.round(y-size+bob),size,size);
  }else{
    g.font="26px serif";g.textAlign="center";g.textBaseline="alphabetic";g.fillText(CREM[e.cr]||"❓",x,y-6+bob);g.textAlign="left";
  }
  // 반짝임과 난이도 별
  if((TICK+e.tx*13)%90<30){const a=((TICK+e.tx*13)%90)/30,sx=x+14,sy=y-46+bob;g.fillStyle=`rgba(255,250,210,${Math.sin(a*Math.PI)})`;g.fillRect(sx-1,sy-5,2,10);g.fillRect(sx-5,sy-1,10,2);}
  if(near){g.font="800 9px Pretendard,sans-serif";g.textAlign="center";g.lineWidth=3;g.strokeStyle="rgba(4,24,36,.85)";const st="★".repeat(tier);g.strokeText(st,x,y-62+bob);g.fillStyle="#ffe07a";g.fillText(st,x,y-62+bob);g.textAlign="left";}
}

/* ==========================================================
   확대 항해 — 근거리 바다, 보급, 기항, 선단
   ========================================================== */
/* 실제 동해 지형을 게임용으로 단순화한 0~1 정규 좌표 */
const KOREA=[[0,0],[.105,0],[.132,.045],[.148,.115],[.158,.19],[.172,.255],[.19,.31],[.205,.36],[.222,.41],[.238,.455],
  [.245,.50],[.238,.545],[.222,.575],[.208,.605],[.198,.645],[.188,.69],[.176,.735],[.166,.775],[.15,.815],[.13,.855],
  [.10,.89],[.065,.925],[.03,.955],[0,.975]];
const JAPAN=[[.545,1],[.575,.955],[.61,.92],[.645,.885],[.68,.855],[.715,.825],[.745,.80],[.775,.775],[.80,.755],
  [.828,.735],[.855,.72],[.885,.712],[.915,.706],[.95,.70],[1,.688],[1,1]];
const MATSUE=[[.735,.735],[.755,.71],[.79,.70],[.825,.702],[.85,.715],[.83,.735],[.79,.745],[.755,.748]];
const SEAPT={
  busan:{n:"부산포",x:.167,y:.797},
  ulleung:{n:"울릉도",x:.459,y:.100},
  dokdo:{n:"자산도(독도)",x:.578,y:.156},
  oki:{n:"오키섬",x:.795,y:.446},
  yangyang:{n:"양양",x:.219,y:.290}
};
const OKIISL=[[.828,.478,.030],[.795,.512,.018],[.845,.520,.016],[.862,.470,.012]];

function detailedCoast(points){
  const result=[];
  for(let i=0;i<points.length;i++){
    const a=points[i],b=points[(i+1)%points.length],dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy),steps=Math.max(1,Math.ceil(len/.004));
    for(let k=0;k<steps;k++){
      const t=k/steps,edge=a[0]===b[0]&&(a[0]===0||a[0]===1)||a[1]===b[1]&&(a[1]===0||a[1]===1);
      const ripple=edge?0:Math.sin(Math.PI*t)*(.00085*Math.sin(k*1.83+i*7)+.0005*Math.sin(k*.65+i));
      result.push([a[0]+dx*t-dy/len*ripple,a[1]+dy*t+dx/len*ripple]);
    }
  }return result;
}
[KOREA,JAPAN,MATSUE].forEach(points=>{const fine=detailedCoast(points);points.splice(0,points.length,...fine);});

/* 중간 기항지는 현재 지명을 함께 적어 학습용 위치 감각을 돕는다. */
const PORTS={
  busan:{n:"부산포",short:"부산",x:.167,y:.797,dockable:true,
    story:"동래의 관문이자 조선과 일본을 잇는 큰 포구입니다. 왜관을 드나들던 안용복에게 부산포는 출항과 귀항의 출발점이었습니다.",fact:"조류가 복잡한 연안을 벗어나기 전에 돛과 물통을 다시 점검합니다."},
  ulsan:{n:"울산 개운포 앞바다",short:"울산",x:.205,y:.715,labelX:.142,labelY:.715,dockable:true,host:"ul",hostLine:"여기는 울산 개운포입니다. 소금과 곡물을 싣는 포구이고, 처용암의 안개 전설도 전해진다 아입니꺼.",
    story:"동해 남부의 긴 해안과 포구들이 이어집니다. 작은 어선과 소금·곡물을 싣고 오가는 연안선이 자주 보입니다.",fact:"해안을 따라가면 먼바다보다 바람을 피하기 쉽지만 암초를 더 세심히 살펴야 합니다."},
  gyeongju:{n:"경주 감포 · 대왕암 앞바다",short:"경주 감포",x:.219,y:.656,labelX:.147,labelY:.656,dockable:true,host:"gj",hostLine:"여기는 경주 감포항입니다. 대왕암과 이견대, 만파식적 이야기가 이어지는 바다라예.",
    story:"경주 감포 앞바다에는 문무왕이 동해의 용이 되어 나라를 지킨다는 대왕암 전설과, 신문왕이 신비한 대나무를 얻었다는 이견대 이야기가 이어집니다.",fact:"만파식적은 ‘온갖 파도를 잠재우는 피리’라는 뜻으로 전해집니다."},
  pohang:{n:"영일만 · 오늘날 포항",short:"포항",x:.234,y:.618,labelX:.155,labelY:.618,dockable:true,host:"ph",hostLine:"여기는 포항 영일만입니다. 어물전과 물통을 둘러보고, 먼바다 나가기 전 보급을 단디 챙기이소.",
    story:"육지 안쪽으로 깊게 들어온 영일만입니다. 오늘날 포항 일대에 해당하며, 동해 연안 항해에서 날씨를 살피고 물과 먹을거리를 다시 갖추기 좋은 지형입니다.",fact:"동해안의 만과 포구는 먼바다로 나가기 전 바람과 파도를 읽는 중요한 쉼터였습니다."},
  uljin:{n:"울진 연안",short:"울진",x:.265,y:.490,labelX:.18,labelY:.490,dockable:true,host:"uj",hostLine:"여기는 울진항입니다. 울릉도로 나갈라믄 파도와 구름을 보고 물때를 꼭 살펴야 하니더.",
    story:"울릉도와 마주 보는 강원도 남쪽 연안입니다. 북동쪽으로 나아갈수록 육지는 멀어지고 큰 파도가 배를 밀어냅니다.",fact:"울릉도로 건너가는 뱃길은 바람이 바뀌면 육지가 보이지 않는 먼바다가 됩니다."},
  gangneung:{n:"강릉 연안",short:"강릉",x:.243,y:.355,labelX:.145,labelY:.355,dockable:true,host:"gn",hostLine:"여기는 강릉항입니다. 해안 산줄기와 별을 보고 울릉도 가는 길을 가늠해 보우야.",
    story:"강원도 동해안의 큰 고을 앞바다입니다. 해안 산줄기와 별자리를 함께 보며 침로를 바로잡을 수 있습니다.",fact:"자산도는 당시 행정상 울릉도와 함께 강원도에 속한 섬으로 인식되었습니다."},
  yangyang:{n:"양양 포구",short:"양양",x:.219,y:.290,labelX:.13,labelY:.29,dockable:true,
    story:"설악의 산줄기 아래 자리한 강원도 양양의 포구입니다. 실제 역사에서 안용복 일행은 1696년 일본에서 돌아와 이곳 양양에 닿았습니다.",fact:"울릉도와 자산도는 당시 강원도에 딸린 섬이었기에, 강원도 관아가 이 일을 맡았습니다."},
  ulleung:{n:"울릉도 포구",short:"울릉도",x:.459,y:.100,dockable:true,
    story:"성인봉이 솟은 울릉도입니다. 맑은 날에는 동남쪽 수평선 너머 자산도를 바라볼 수 있습니다.",fact:"울릉도와 독도의 거리는 약 87km입니다."},
  dokdo:{n:"자산도 바위섬",short:"독도",x:.578,y:.156,dockable:false,
    story:"동도와 서도, 수많은 바위가 거센 물결을 막아 섭니다.",fact:"안전한 큰 포구가 없어 바람과 파도를 먼저 살펴야 합니다."},
  oki:{n:"오키섬 포구",short:"오키",x:.795,y:.446,dockable:true,
    story:"일본 서쪽 바다의 섬 고을입니다. 안용복의 진술은 이곳 관리의 조사 기록으로 남았습니다.",fact:"낯선 항구에서는 선원과 보급품을 지키며 관청의 지시를 따라야 합니다."},
  sakae:{n:"사카이 연안",short:"사카이",x:.742,y:.721,dockable:true,
    story:"오키섬 남쪽의 일본 본토 연안입니다. 많은 연안선과 어선이 좁은 물길을 오갑니다.",fact:"멀리서 보이는 배의 돛과 진로를 확인한 뒤 안전한 거리를 유지합니다."}
};
const LEGEND_ZONES=[
  {id:"cheoyong",name:"처용암의 안개",x:.205,y:.708,r:.028,script:"legend_cheoyong"},
  {id:"daewang",name:"대왕암의 호국룡",x:.258,y:.580,r:.030,script:"legend_daewang"},
  {id:"manpa",name:"이견대의 신비한 빛",x:.319,y:.435,r:.032,script:"legend_manpa"}
];

const SUPPLY={water:0,food:0,maxWater:90,maxFood:70,capacity:150,crew:8,waterDay:6,foodDay:4};
const PREP={leg:0,water:0,food:0};
const SEA={x:.167,y:.797,hx:0,hy:-1,wind:0,wstr:4,spd:0,target:"ulleung",leg:0,
  chase:null,days:0,msg:"",msgT:0,active:false,arrived:false,trim:1,hull:100,
  startDist:1,hazards:[],invul:0,trail:[],npcs:[],inStorm:false,mapExpanded:false,
  dockCooldown:0,lastDock:"busan",nearDock:null,warnWater:false,warnFood:false,portVisited:{},portWaitDays:0,japanWarned:false};
const LEGS=[
  {from:"busan",to:"ulleung",title:"울릉도로 항해하시오",arrival:"울릉도",desc:"성인봉이 구름 사이로 모습을 드러낸다",after:"leg_ulleung"},
  {from:"ulleung",to:"dokdo",title:"자산도(독도)로 항해하시오",arrival:"자산도(독도)",desc:"동도와 서도의 바위 절벽에 파도가 부서진다",after:"leg_dokdo"},
  {from:"dokdo",to:"oki",title:"낯선 왜선을 쫓으시오",arrival:"오키섬",desc:"낯선 항구의 배들이 하나둘 눈에 들어온다",after:"leg_oki",chase:true},
  {from:"oki",to:"busan",title:"부산포로 돌아가시오",arrival:"부산포",desc:"긴 항해 끝에 조선의 산줄기가 보인다",after:"leg_home"},
  {from:"busan",to:"yangyang",title:"강원도 양양으로 항해하시오",arrival:"양양 포구",desc:"설악의 봉우리 아래 작은 포구가 보인다",after:"leg_yangyang",curve:-1}
];

function voyageEstimate(i){
  const L=LEGS[i],a=SEAPT[L.from],b=SEAPT[L.to];
  return Math.max(2,Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)/.095));
}
function recommendedCargo(i){
  const d=voyageEstimate(i);
  return {water:Math.min(SUPPLY.maxWater,d*7+12),food:Math.min(SUPPLY.maxFood,d*5+8)};
}
function cargoTotal(w=PREP.water,f=PREP.food){return w+f;}
function prepareVoyage(i){
  const r=recommendedCargo(i); PREP.leg=i; PREP.water=r.water; PREP.food=r.food;
  resetInput(); G.pending=null; G.mode="prep"; G.inputLock=false; ui(); renderPrep();
}
function setPrepCargo(kind,delta){
  const max=kind==="water"?SUPPLY.maxWater:SUPPLY.maxFood;
  let next=Math.max(0,Math.min(max,PREP[kind]+delta));
  const other=kind==="water"?PREP.food:PREP.water;
  next=Math.min(next,SUPPLY.capacity-other); PREP[kind]=next; renderPrep();
}
function renderPrep(){
  const L=LEGS[PREP.leg],a=SEAPT[L.from],b=SEAPT[L.to],days=voyageEstimate(PREP.leg),r=recommendedCargo(PREP.leg);
  const load=cargoTotal(),pct=Math.min(100,load/SUPPLY.capacity*100),ready=PREP.water>0&&PREP.food>0;
  const el=$("#prep");
  el.innerHTML=`<div class="sea-ledger">
    <div class="ledger-kicker">出 航 準 備 · VOYAGE STORES</div><h2>${a.n} 출항 준비</h2>
    <p class="ledger-sub">물과 식량은 항해하는 동안 매일 줄어듭니다. 먼바다에서는 보급품이 하나라도 바닥나면 항해를 계속할 수 없습니다.</p>
    <div class="prep-grid">
      <div class="route-card"><h3>이번 항로</h3><div class="route-line"><span>${a.n}</span><i></i><span>${b.n}</span></div>
        <div class="estimate"><span>예상 항해<b>${days}일</b></span><span>승선원<b>${SUPPLY.crew}명</b></span><span>적재 한도<b>${SUPPLY.capacity}</b></span></div>
        <p class="ledger-sub" style="margin:13px 0 0">추천: 식수 ${r.water} · 식량 ${r.food}<br>하루 소비: 식수 ${SUPPLY.waterDay} · 식량 ${SUPPLY.foodDay}</p>
      </div>
      <div class="cargo-card"><h3>보급품 적재</h3>
        <div class="cargo-row"><span>식수</span><button class="stepper" data-kind="water" data-delta="-5">−</button><div class="cargo-value">${PREP.water} 통</div><button class="stepper" data-kind="water" data-delta="5">＋</button></div>
        <div class="cargo-row"><span>식량</span><button class="stepper" data-kind="food" data-delta="-5">−</button><div class="cargo-value">${PREP.food} 꾸러미</div><button class="stepper" data-kind="food" data-delta="5">＋</button></div>
        <div class="loadbar"><i style="width:${pct}%"></i></div><div class="loadnote"><span>총 적재량</span><b>${load} / ${SUPPLY.capacity}</b></div>
        <div id="prep-msg" style="min-height:20px;color:#a43124;font:700 12px var(--serif);margin-top:8px">${ready?"돛과 키, 물통 마개를 확인했습니다.":"식수와 식량을 모두 실어야 출항할 수 있습니다."}</div>
      </div>
    </div>
    <div class="ledger-actions"><button class="btn" id="prep-rec">추천량 적재</button><button class="btn" id="prep-max">가득 적재</button><button class="btn red" id="prep-go">출항한다</button></div>
  </div>`;
  el.classList.remove("hide");
  el.querySelectorAll(".stepper").forEach(b=>b.onclick=()=>setPrepCargo(b.dataset.kind,Number(b.dataset.delta)));
  $("#prep-rec").onclick=()=>{const q=recommendedCargo(PREP.leg);PREP.water=q.water;PREP.food=q.food;renderPrep();};
  $("#prep-max").onclick=()=>{PREP.water=SUPPLY.maxWater;PREP.food=SUPPLY.capacity-PREP.water;renderPrep();};
  $("#prep-go").onclick=()=>{
    if(PREP.water<=0||PREP.food<=0){$("#prep-msg").textContent="식수와 식량을 모두 실어야 합니다.";return;}
    const leg=PREP.leg,w=PREP.water,f=PREP.food;showVoyageChart(leg,()=>startSea(leg,w,f));
  };
}

function makeSeaHazards(a,b,leg){
  const out=[],dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)||1,px=-dy/len,py=dx/len;
  const count=leg===1?2:4;
  for(let i=0;i<count;i++){
    const q=(i+1)/(count+1),side=i%2?1:-1,off=(.025+(leg+i)*.0035)*side;
    const h={x:a.x+dx*q+px*off,y:a.y+dy*q+py*off,r:i%2?.028:.015,type:i%2?"storm":"reef",hit:false};
    if(!onLand(h.x,h.y)) out.push(h);
  }
  return out;
}
function waterLanePoint(a,b,u,lane){
  const dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)||1,px=-dy/len,py=dx/len;
  const offsets=[lane,-lane,lane*.55,-lane*.55,lane*1.45,-lane*1.45,0];
  for(const off of offsets){
    const x=a.x+dx*u+px*off,y=a.y+dy*u+py*off;
    if(x>.012&&x<.988&&y>.012&&y<.988&&!onLand(x,y))return{x,y,lane:off};
  }
  return null;
}
function makeNPCFleet(a,b,leg){
  const ships=[],dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)||1,ux=dx/len,uy=dy/len;
  const count=leg===1?3:6;
  for(let i=0;i<count;i++){
    const u=.08+(i/(Math.max(1,count-1)))*.84,lane=(.022+(i%3)*.011)*(i%2?1:-1);
    const p=waterLanePoint(a,b,u,lane);if(!p)continue;
    /* 조선 연안(부산·울산·경주 쪽)에는 조선 배만 다니고, 일본 배는 오키섬 가까운 바다에만 보인다 */
    const jp=p.x>.70;
    ships.push({x:p.x,y:p.y,u,lane:p.lane,dx:ux,dy:uy,du:.00014+(i%3)*.000035,type:jp?0:1+(i%2),nation:jp?"japan":"joseon",
      name:jp?"일본 연안 어선":(i%2?"조선 연안 어선":"조선 화물선"),seen:false});
  }
  /* 울릉도·독도 바다: 일본 어선들이 몰려와 그물을 치며 맴돈다 */
  const swarm=leg===1?10:8,cx=SEAPT.dokdo.x+.008,cy=SEAPT.dokdo.y+.004;
  for(let k=0;k<swarm;k++){
    const r=.036+(k%4)*.013,ang=k/swarm*Math.PI*2+(k%3)*.4,w=(k%2?1:-1)*(.0011+(k%3)*.00035);
    ships.push({orbit:true,cx,cy,r,ang,w,x:cx+Math.cos(ang)*r,y:cy+Math.sin(ang)*r*.8,dx:1,dy:0,type:0,nation:"japan",name:"일본 어선",seen:false});
  }
  return ships;
}
function startSea(i,water,food){
  const L=LEGS[i],a=SEAPT[L.from],t=SEAPT[L.to],dx=t.x-a.x,dy=t.y-a.y,len=Math.hypot(dx,dy)||1;
  const fallback=recommendedCargo(i);
  SUPPLY.water=Math.min(SUPPLY.maxWater,Number.isFinite(water)?water:(SUPPLY.water||fallback.water));
  SUPPLY.food=Math.min(SUPPLY.maxFood,Number.isFinite(food)?food:(SUPPLY.food||fallback.food));
  resetInput();G.pending=null;G.inputLock=false;G.talkReturnMode="sea";G.lastMode="sea";
  SEA.leg=i;SEA.x=a.x;SEA.y=a.y;SEA.hx=dx/len;SEA.hy=dy/len;SEA.days=0;SEA.target=L.to;
  SEA.wind=Math.random()*Math.PI*2;SEA.wstr=3+Math.random()*3;SEA.chase=L.chase?{x:a.x+dx*.11,y:a.y+dy*.11,t:.11}:null;
  SEA.msg="";SEA.msgT=0;SEA.active=true;SEA.arrived=false;SEA.trim=1;SEA.hull=100;SEA.startDist=Math.hypot(dx,dy);
  SEA.hazards=makeSeaHazards(a,t,i);SEA.invul=0;SEA.trail=[];SEA.npcs=makeNPCFleet(a,t,i);SEA.inStorm=false;
  SEA.dockCooldown=260;SEA.lastDock=L.from;SEA.nearDock=null;SEA.warnWater=false;SEA.warnFood=false;SEA.mapExpanded=false;SEA.portWaitDays=0;SEA.japanWarned=false;
  $("#prep").classList.add("hide");$("#port").classList.add("hide");$("#gameover").classList.add("hide");
  $("#arrival").classList.add("hide");$("#dbox").classList.add("hide");
  G.mode="sea";$("#pl-n").textContent="동해 근해 · "+a.n+" 출항";$("#pl-k").textContent="숙 종 2 2 년 · 1 6 9 6";
  SEA.promptSkip=L.from;quest(L.title);ui();updateGauge(0,true);updateDockControl();
  flash("출항! 배는 화면 중심에 있습니다. 오른쪽 해도로 항로를 확인하십시오.");
}
function toggleSailTrim(){
  if(G.mode!=="sea"||!SEA.active||SEA.arrived)return;
  SEA.trim=SEA.trim>.8?.50:1;
  flash(SEA.trim>.8?"돛을 모두 펼쳤소. 물결을 타고 속도가 오릅니다!":"돛을 절반 걷었소. 암초와 항구에 접근하기 좋습니다.");
  updateGauge(0,true);
}
function toggleChart(){
  if(G.mode!=="sea")return;SEA.mapExpanded=!SEA.mapExpanded;
  $("#chart-btn").textContent=SEA.mapExpanded?"항로도 축소":"항로도 확대";
}
function finishSeaLeg(){
  if(SEA.arrived||!SEA.active)return;
  const L=LEGS[SEA.leg];SEA.arrived=true;SEA.active=false;SEA.spd=0;resetInput();G.inputLock=true;
  G.day+=Math.max(1,Math.ceil(SEA.days));G.mode="arrival";ui();
  const a=$("#arrival");a.innerHTML=`<div class="arrival-card"><small>♪ 도 착</small><strong>${L.arrival}</strong><span>${L.desc}</span></div>`;a.classList.remove("hide");
  setTimeout(()=>{if(G.mode!=="arrival")return;a.classList.add("hide");G.inputLock=false;play(SC[L.after](),"sea");},1250);
}

function nearestDock(){
  if(SEA.dockCooldown>0)return null;
  let best=null,bd=.038;
  for(const [key,p] of Object.entries(PORTS)){
    if(!p.dockable||key===SEA.target)continue;
    const d=Math.hypot(SEA.x-p.x,SEA.y-p.y);
    if(d<bd){bd=d;best={key,p,d};}
  }
  return best;
}
function updateDockControl(){
  const b=$("#dock-btn");if(!b)return;
  SEA.nearDock=nearestDock();
  const k=SEA.nearDock?SEA.nearDock.key:"";if(b.dataset.k===k)return;b.dataset.k=k;
  if(SEA.promptSkip&&SEA.promptSkip!==k)SEA.promptSkip=null;
  if(SEA.nearDock){b.disabled=false;b.classList.add("ready");b.textContent="입항 · "+SEA.nearDock.p.short;}
  else{b.disabled=true;b.classList.remove("ready");b.textContent="입항 불가";}
}
const PORT_CALL_NAME={yangyang:"양양 포구",busan:"부산포",ulsan:"울산 개운포",gyeongju:"경주 감포항",pohang:"포항 영일만",uljin:"울진항",gangneung:"강릉항",ulleung:"울릉도 포구"};
function promptPortCall(key){
  const nm=PORT_CALL_NAME[key]||PORTS[key].n;SEA.active=false;SEA.spd=0;SEA.promptSkip=key;resetInput();updateGauge(0,true);
  play(sq(
    say("yi","뱃머리에서 손을 흔들며",`여기는 ${nm}입니다요!`,"잠시 쉬어 가시겠습니까?"),
    ask([
      {t:"“네, 잠시 쉬어 가요.”",then:run(()=>{G.pending=()=>{G.mode="sea";SEA.active=true;openPort(key);};})},
      {t:"“아니요, 계속 항해해요.”",then:sq(say("yi","키를 고쳐 잡으며","알겄소! 돛 올리고 그대로 갑시다."),run(()=>{G.pending=()=>{G.mode="sea";SEA.active=true;ui();};}))}
    ])
  ),"sea");
}
function forbiddenJapanesePort(key){return key==="sakae"||(key==="oki"&&SEA.target!=="oki");}
function pushOffPort(key){
  const p=PORTS[key],t=SEAPT[SEA.target],dx=t.x-p.x,dy=t.y-p.y,len=Math.hypot(dx,dy)||1,vectors=[[dx/len,dy/len],[1,0],[-1,0],[0,-1],[0,1]];let found=null;
  for(const d of [.025,.04,.06]){for(const v of vectors){const x=p.x+v[0]*d,y=p.y+v[1]*d;if(x>.01&&x<.99&&y>.01&&y<.99&&!onLand(x,y)){found={x,y};break;}}if(found)break;}
  SEA.x=found?found.x:p.x;SEA.y=found?found.y:p.y;SEA.hx=dx/len;SEA.hy=dy/len;SEA.active=true;SEA.dockCooldown=360;G.mode="sea";G.lastMode="sea";G.talkReturnMode="sea";$("#pl-n").textContent="동해 근해 · 일본 연안 밖";$("#pl-k").textContent="숙 종 2 2 년 · 1 6 9 6";ui();updateDockControl();flash("일본 항구에서 쫓겨나 다시 바다로 나왔습니다.");
}
function openPort(key){
  if(G.mode!=="sea"||!SEA.active)return;
  const p=PORTS[key];if(!p||!p.dockable)return;
  if(forbiddenJapanesePort(key)){
    SEA.active=false;SEA.spd=0;resetInput();G.pending=()=>pushOffPort(key);play(SC.japan_port_forbidden(),"sea");return;
  }
  const firstVisit=!SEA.portVisited[key];
  SEA.active=false;SEA.spd=0;SEA.x=p.x;SEA.y=p.y;SEA.lastDock=key;SEA.nearDock=null;SEA.portVisited[key]=true;
  $("#pl-n").textContent=p.n;$("#pl-k").textContent="기 항 · "+p.short;
  G.mode="port";resetInput();ui();
  const intro=SC[`port_${key}`];
  if(firstVisit&&intro){G.pending=()=>{G.mode="port";renderPort(key);ui();};play(intro(),"port");}
  else renderPort(key);
}
function addPortSupply(kind,amount){
  const other=kind==="water"?SUPPLY.food:SUPPLY.water,max=kind==="water"?SUPPLY.maxWater:SUPPLY.maxFood;
  SUPPLY[kind]=Math.min(max,SUPPLY.capacity-other,SUPPLY[kind]+amount);renderPort(SEA.lastDock);
}
function fillPortSupply(){SUPPLY.water=SUPPLY.maxWater;SUPPLY.food=SUPPLY.capacity-SUPPLY.water;renderPort(SEA.lastDock);}
function waitAtPort(){
  const key=SEA.lastDock;if(key!=="pohang"&&key!=="gangneung")return;
  const p=PORTS[key];SEA.days+=1;advanceGameMinutes(1440);SEA.portWaitDays++;SEA.hull=Math.min(100,SEA.hull+15);
  SUPPLY.water=Math.max(0,SUPPLY.water-2);SUPPLY.food=Math.max(0,SUPPLY.food-1);
  SEA.wind+=.45;SEA.wstr=2.5+Math.random()*2.5;
  renderPort(key,`${p.short}에서 하루 쉬며 선체를 손보고 바람이 잦아들기를 기다렸습니다. 식수 2 · 식량 1을 사용했습니다.`);
}
function sleepAtInn(){
  nextMorning();SEA.days+=1;SUPPLY.water=Math.min(SUPPLY.maxWater,SUPPLY.water+8);SUPPLY.food=Math.min(SUPPLY.maxFood,SUPPLY.capacity-SUPPLY.water,SUPPLY.food+6);
  G.portNotice=`${PORTS[SEA.lastDock].short} 주막에서 하룻밤을 묵었습니다. 하루가 지나 아침 7시가 되었고 식수 8 · 식량 6을 받았습니다.`;
}
function repairAtYard(){
  const before=Math.round(SEA.hull);SEA.hull=100;SEA.days+=.125;advanceGameMinutes(180);G.portNotice=`배 정비소에서 선체를 ${before}%에서 100%로 고쳤습니다. 정비에 3시간이 지났습니다.`;
}
function departPort(){
  const key=SEA.lastDock,p=PORTS[key],el=$("#port");if(SUPPLY.water<=0||SUPPLY.food<=0){flash("식수와 식량을 먼저 보급해야 출항할 수 있습니다.");return false;}
  const t=SEAPT[SEA.target],dx=t.x-SEA.x,dy=t.y-SEA.y,len=Math.hypot(dx,dy)||1;SEA.hx=dx/len;SEA.hy=dy/len;SEA.x+=SEA.hx*.012;SEA.y+=SEA.hy*.012;SEA.active=true;SEA.dockCooldown=300;SEA.promptSkip=key;
  el.classList.add("hide");G.mode="sea";G.lastMode="sea";G.talkReturnMode="sea";$("#pl-n").textContent="동해 근해 · "+p.short+" 출항";$("#pl-k").textContent="숙 종 2 2 년 · 1 6 9 6";ui();updateDockControl();flash(p.short+"에서 보급을 마치고 다시 돛을 올렸습니다.");return true;
}
function openPortFacility(kind){
  const key=SEA.lastDock;G.portNotice="";$("#port").classList.add("hide");G.pending=()=>{G.mode="port";renderPort(key,G.portNotice);ui();};play(kind==="inn"?SC.port_inn():SC.port_yard(),"port");
}
function requestDepartureAfterTalk(){G.pending=()=>{G.mode="port";renderPort(SEA.lastDock,G.portNotice);ui();if(!departPort())renderPort(SEA.lastDock,"식수와 식량을 먼저 보급하십시오.");};}
function renderPort(key,notice=""){
  const p=PORTS[key],load=SUPPLY.water+SUPPLY.food,canWait=key==="pohang"||key==="gangneung",hasFacilities=!!p.host;
  const el=$("#port");el.innerHTML=`<div class="sea-ledger">
    <div class="ledger-kicker">寄 港 · PORT OF CALL</div><h2>${p.n}</h2>
    <p class="ledger-sub">닻을 내렸습니다. 이곳은 임무 목적지가 아닌 중간 기항지이므로, 보급과 지역 기록을 확인한 뒤 같은 항로를 계속합니다.</p>
    <div class="prep-grid"><div class="port-story"><span class="now">현재 지명 기준</span><h3>항구 기록</h3>${p.story}<br><br><b>${p.fact}</b>
      ${p.host?`<div class="port-host">${atlasHTML(p.host,"port-host-sprite",CH[p.host].n)}<div><b>${CH[p.host].n}</b><p>“${p.hostLine}”</p></div></div>`:""}</div>
      <div class="cargo-card"><h3>남은 보급품</h3>
        <div class="cargo-row"><span>식수</span><div></div><div class="cargo-value">${Math.ceil(SUPPLY.water)} 통</div><div></div></div>
        <div class="cargo-row"><span>식량</span><div></div><div class="cargo-value">${Math.ceil(SUPPLY.food)} 꾸러미</div><div></div></div>
        <div class="loadbar"><i style="width:${load/SUPPLY.capacity*100}%"></i></div><div class="loadnote"><span>총 적재량</span><b>${Math.ceil(load)} / ${SUPPLY.capacity}</b></div>
        <div class="port-supplies"><button class="btn" id="port-water">식수 +20</button><button class="btn" id="port-food">식량 +15</button></div>
        <div class="port-status">항해 ${Math.floor(SEA.days)}일째 · 선체 ${Math.round(SEA.hull)}%${notice?`<br>${notice}`:canWait?"<br>이 항구에서는 하루 대기하며 바람을 살피고 선체를 정비할 수 있습니다.":""}</div>
      </div></div>
    ${hasFacilities?`<div class="port-facilities"><button class="facility-btn" id="port-inn"><span class="ico">🏮</span><span><b>${p.short} 주막</b><small>하룻밤 묵고 다음 날 아침 출발</small></span></button><button class="facility-btn" id="port-yard"><span class="ico">⚒</span><span><b>배 정비소</b><small>선체 수리 또는 이곳에서 바로 출항</small></span></button></div>`:""}
    <div class="ledger-actions">${canWait?'<button class="btn" id="port-wait">하루 대기 · 선체 정비</button>':""}<button class="btn" id="port-full">가득 보급</button><button class="btn red" id="port-go">항해를 계속한다</button></div>
  </div>`;hydrateAtlasSprites(el);el.classList.remove("hide");
  $("#port-water").onclick=()=>addPortSupply("water",20);$("#port-food").onclick=()=>addPortSupply("food",15);$("#port-full").onclick=fillPortSupply;
  const waitBtn=$("#port-wait");if(waitBtn)waitBtn.onclick=waitAtPort;
  const innBtn=$("#port-inn"),yardBtn=$("#port-yard");if(innBtn)innBtn.onclick=()=>openPortFacility("inn");if(yardBtn)yardBtn.onclick=()=>openPortFacility("yard");
  $("#port-go").onclick=departPort;
}
function showGameOver(reason){
  if(G.mode==="gameover")return;
  SEA.active=false;SEA.spd=0;resetInput();G.mode="gameover";ui();
  const p=PORTS[SEA.lastDock]||PORTS[LEGS[SEA.leg].from],el=$("#gameover");
  el.innerHTML=`<div class="sea-ledger gameover-ledger"><div class="gameover-icon">🌊</div><div class="ledger-kicker">航 海 中 斷</div><h2>항해 실패</h2>
    <p class="gameover-reason">${reason}</p><div class="gameover-tip">마지막 보급 지점: ${p.n}<br>출항 전에 예상 일수보다 여유 있게 물과 식량을 준비하고, 폭풍에서는 돛을 줄이십시오.</div>
    <div class="ledger-actions" style="justify-content:center"><button class="btn" id="retry-port">마지막 항구에서 다시 준비</button><button class="btn red" id="retry-all">처음부터</button></div></div>`;
  el.classList.remove("hide");$("#retry-port").onclick=retryFromLastPort;$("#retry-all").onclick=()=>location.reload();
}
function retryFromLastPort(){
  $("#gameover").classList.add("hide");SEA.hull=100;SUPPLY.water=0;SUPPLY.food=0;
  const from=LEGS[SEA.leg].from;
  if(SEA.lastDock===from){prepareVoyage(SEA.leg);return;}
  const p=PORTS[SEA.lastDock]||PORTS[from];SEA.x=p.x;SEA.y=p.y;G.mode="port";G.inputLock=false;renderPort(SEA.lastDock);ui();
}

function updateNPCFleet(){
  const L=LEGS[SEA.leg],a=SEAPT[L.from],b=SEAPT[L.to];
  for(const s of SEA.npcs){
    if(s.orbit){
      s.ang+=s.w;const wob=1+Math.sin(TICK*.004+s.r*90)*.12;
      s.x=s.cx+Math.cos(s.ang)*s.r*wob;s.y=s.cy+Math.sin(s.ang)*s.r*.8*wob;
      const sg=s.w>0?1:-1;s.dx=-Math.sin(s.ang)*sg;s.dy=Math.cos(s.ang)*.8*sg;
    }else{
      s.u+=s.du;if(s.u>.94){s.u=.06;s.seen=false;}
      let p=waterLanePoint(a,b,s.u,s.lane);
      for(let n=0;!p&&n<20;n++){s.u+=.004;if(s.u>.94)s.u=.06;p=waterLanePoint(a,b,s.u,s.lane);}
      if(p&&!onLand(p.x,p.y)){s.x=p.x;s.y=p.y;s.lane=p.lane;}
    }
    const d=Math.hypot(SEA.x-s.x,SEA.y-s.y);
    if(s.nation==="japan"&&!SEA.japanWarned&&SEA.leg<2&&SEA.days>.10&&d<.12&&G.mode==="sea"){
      SEA.japanWarned=true;SEA.spd=0;play(SC.japanese_sea(),"sea");return;
    }
    if(d<.058&&!s.seen){s.seen=true;flash(s.name+"이 가까이 지나갑니다. 서로의 침로를 확인하십시오.");}
    if(d<.014&&SEA.invul<=0){SEA.invul=110;SEA.hull=Math.max(0,SEA.hull-6);doShake();flash("다른 배와 부딪힐 뻔했습니다! 키를 꺾어 거리를 벌리십시오.");}
  }
}
function checkLegendEvent(){
  if(SEA.leg!==0||G.mode!=="sea")return false;
  for(const z of LEGEND_ZONES){
    if(G.flags["legend_"+z.id]||Math.hypot(SEA.x-z.x,SEA.y-z.y)>=z.r)continue;
    G.flags["legend_"+z.id]=1;SEA.spd=0;play(SC[z.script](),"sea");return true;
  }
  return false;
}
function seaStep(){
  if(!SEA.active||SEA.arrived)return;
  if(SEA.dockCooldown>0)SEA.dockCooldown--;
  SEA.wind+=Math.sin(TICK/220)*.004;SEA.wstr=Math.max(1.5,Math.min(8,SEA.wstr+Math.sin(TICK/310)*.012));
  let dx=0,dy=0;
  if(keys.ArrowUp||keys.w||padDir.u)dy-=1;if(keys.ArrowDown||keys.s||padDir.d)dy+=1;
  if(keys.ArrowLeft||keys.a||padDir.l)dx-=1;if(keys.ArrowRight||keys.d||padDir.r)dx+=1;
  if(dx||dy){const l=Math.hypot(dx,dy);SEA.hx=dx/l;SEA.hy=dy/l;}
  const moving=!!(SEA.hx||SEA.hy),wx=Math.cos(SEA.wind),wy=Math.sin(SEA.wind),dot=SEA.hx*wx+SEA.hy*wy;
  const eff=.30+.70*((dot+1)/2);SEA.inStorm=SEA.hazards.some(h=>h.type==="storm"&&Math.hypot(SEA.x-h.x,SEA.y-h.y)<h.r);
  const power=(.55+.45*(SEA.wstr/8))*(SEA.inStorm?.56:1),base=.00105;
  SEA.spd=moving?base*eff*power*1.55*SEA.trim:0;
  const oldDays=SEA.days;
  if(moving){
    let nx=SEA.x+SEA.hx*SEA.spd-.000035,ny=SEA.y+SEA.hy*SEA.spd+.000022;
    if(onLand(nx,ny)){if(TICK%70===0)flash("해안과 얕은 물이 가깝습니다. 뱃머리를 바다 쪽으로 돌리십시오.");}
    else{SEA.x=nx;SEA.y=ny;}
    SEA.days+=.0044*(.55+eff);
    if(TICK%4===0){SEA.trail.push([SEA.x,SEA.y]);if(SEA.trail.length>90)SEA.trail.shift();}
  }
  const spent=SEA.days-oldDays;
  if(spent>0){advanceGameMinutes(spent*1440);SUPPLY.water=Math.max(0,SUPPLY.water-spent*SUPPLY.waterDay);SUPPLY.food=Math.max(0,SUPPLY.food-spent*SUPPLY.foodDay);}
  if(!SEA.warnWater&&SUPPLY.water<=SUPPLY.maxWater*.25){SEA.warnWater=true;flash("식수가 얼마 남지 않았습니다. 가까운 항구를 찾으십시오!");}
  if(!SEA.warnFood&&SUPPLY.food<=SUPPLY.maxFood*.25){SEA.warnFood=true;flash("식량이 얼마 남지 않았습니다. 항로를 서두르거나 기항하십시오!");}
  if(SUPPLY.water<=0){updateGauge(dot);showGameOver("식수가 모두 떨어졌습니다. 선원들이 탈진하여 더는 키와 돛을 다룰 수 없습니다.");return;}
  if(SUPPLY.food<=0){updateGauge(dot);showGameOver("식량이 모두 떨어졌습니다. 선원들이 항해를 계속할 힘을 잃었습니다.");return;}
  SEA.x=Math.max(.01,Math.min(.99,SEA.x));SEA.y=Math.max(.01,Math.min(.99,SEA.y));
  if(checkLegendEvent()){updateGauge(dot);return;}
  if(SEA.chase){
    const t=SEAPT[SEA.target],a=SEAPT[LEGS[SEA.leg].from];SEA.chase.t=Math.min(1,SEA.chase.t+.00125);
    SEA.chase.x=a.x+(t.x-a.x)*SEA.chase.t+Math.sin(SEA.chase.t*9)*.012;SEA.chase.y=a.y+(t.y-a.y)*SEA.chase.t+Math.cos(SEA.chase.t*7)*.010;
  }
  if(SEA.invul>0)SEA.invul--;updateNPCFleet();if(G.mode!=="sea"){updateGauge(dot);return;}
  for(const h of SEA.hazards){
    const d=Math.hypot(SEA.x-h.x,SEA.y-h.y);
    if(d<h.r&&SEA.invul<=0){SEA.invul=125;SEA.hull=Math.max(0,SEA.hull-(h.type==="reef"?18:9));
      const rx=(SEA.x-h.x)/(d||1),ry=(SEA.y-h.y)/(d||1);SEA.x+=rx*.016;SEA.y+=ry*.016;doShake();
      flash(h.type==="reef"?"암초에 선체가 스쳤습니다! 돛을 줄이고 침로를 바꾸십시오.":"돌풍이 돛을 후려칩니다! 돛을 줄여 배의 기울기를 낮추십시오.");}
  }
  if(SEA.hull<=0){updateGauge(dot);showGameOver("선체가 크게 파손되어 물이 차올랐습니다. 더는 항해할 수 없습니다.");return;}
  const t=SEAPT[SEA.target];if(Math.hypot(SEA.x-t.x,SEA.y-t.y)<.026){finishSeaLeg();return;}
  updateDockControl();updateGauge(dot);
  const nd=SEA.nearDock;
  if(nd&&G.mode==="sea"&&nd.d<.032&&SEA.promptSkip!==nd.key&&!forbiddenJapanesePort(nd.key)){promptPortCall(nd.key);return;}
}
function onLand(x,y){if(x<0||y<0||x>=1||y>=1)return false;if(!LAND_MASK)buildLandMask();return LAND_MASK[(y*LM|0)*LM+(x*LM|0)]===1;}
function inPoly(x,y,pts){
  let c=false;for(let i=0,j=pts.length-1;i<pts.length;j=i++){
    const xi=pts[i][0],yi=pts[i][1],xj=pts[j][0],yj=pts[j][1];
    if(((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi))c=!c;
  }return c;
}
function flash(m){SEA.msg=m;SEA.msgT=170;}

function seaWorldScale(){return Math.max(950,Math.min(VW/.38,VH/.26));}
function seaPoint(x,y){const s=seaWorldScale();return [VW*.5+(x-SEA.x)*s,VH*.54+(y-SEA.y)*s];}
/* v14 · Screen rendering follows the same world coast used by collision checks. */
const SEA_ART={};
for(const [key,src] of Object.entries({terrain:'assets/sea-terrain.webp',islands:'assets/sea-islands.webp'})){
  const im=new Image();im.decoding='async';im.src=src;SEA_ART[key]=im;
}
let terrainPattern=null;
/* v15 · 항해 화면 최적화
   - 육지·섬은 512px 조각으로 한 번만 그려 두고(캐시) 다시 쓴다. 바다만 있는 조각은 아예 그리지 않는다.
   - 물결은 미리 그린 무늬를 두 겹으로 흘려 보낸다.
   - 육지 충돌은 다각형 계산 대신 미리 만든 1024칸 지도로 즉시 판정한다. */
const SEA_R={tr:1,s:0,paths:null,tiles:new Map(),T:512,wave:{},base:null,baseKey:"",vig:null,vigKey:"",mini:null,miniKey:""};
const OKI_LAND=[[.829,.472,.042,.034],[.795,.512,.028,.022],[.845,.521,.025,.020],[.862,.468,.019,.016]];
const LM=1024;let LAND_MASK=null;
function buildLandMask(){
  const c=document.createElement("canvas");c.width=c.height=LM;const x=c.getContext("2d",{willReadFrequently:true});
  x.setTransform(LM,0,0,LM,0,0);x.fillStyle="#000";
  [KOREA,JAPAN,MATSUE].forEach(pts=>{x.beginPath();pts.forEach((p,i)=>i?x.lineTo(p[0],p[1]):x.moveTo(p[0],p[1]));x.closePath();x.fill();});
  OKI_LAND.forEach(o=>{x.beginPath();x.ellipse(o[0],o[1],o[2],o[3],0,0,Math.PI*2);x.fill();});
  const d=x.getImageData(0,0,LM,LM).data;LAND_MASK=new Uint8Array(LM*LM);
  for(let i=0,n=LM*LM;i<n;i++)LAND_MASK[i]=d[i*4+3]>127?1:0;
}
function seaTR(){return DPR;}  /* 캔버스 해상도와 똑같이 맞춰 1:1로 복사되게 한다 */
const SEA_ISLANDS=()=>[
  ...OKIISL.map(o=>({x:o[0],y:o[1],r:o[2],col:"#78915b",kind:3})),
  {x:SEAPT.ulleung.x,y:SEAPT.ulleung.y,r:.014,col:"#789b5f",kind:0},
  {x:SEAPT.dokdo.x,y:SEAPT.dokdo.y,r:.007,col:"#8d8972",kind:1},
  {x:SEAPT.dokdo.x+.015,y:SEAPT.dokdo.y+.003,r:.0043,col:"#8d8972",kind:2}];
function tileHasLand(ix,iy,s){
  const TS=SEA_R.T,m=90,x0=(ix*TS-m)/s,y0=(iy*TS-m)/s,x1=((ix+1)*TS+m)/s,y1=((iy+1)*TS+m)/s;
  for(const il of SEA_ISLANDS()){const rr=il.r*2.2;if(il.x+rr>x0&&il.x-rr<x1&&il.y+rr>y0&&il.y-rr<y1)return true;}
  if(!LAND_MASK)buildLandMask();
  const a=Math.max(0,x0*LM|0),b=Math.min(LM-1,x1*LM|0),c=Math.max(0,y0*LM|0),d=Math.min(LM-1,y1*LM|0);
  for(let y=c;y<=d;y+=4)for(let x=a;x<=b;x+=4)if(LAND_MASK[y*LM+x])return true;
  return false;
}
function renderSeaTile(ix,iy,s){
  if(!tileHasLand(ix,iy,s))return null;
  const TS=SEA_R.T,pad=2,tr=SEA_R.tr,c=document.createElement("canvas");c.width=c.height=Math.round((TS+pad*2)*tr);
  const x=c.getContext("2d"),ox=ix*TS-pad,oy=iy*TS-pad;
  x.setTransform(tr,0,0,tr,-ox*tr,-oy*tr);x.imageSmoothingEnabled=true;x.imageSmoothingQuality="high";x.lineJoin="round";
  const im=SEA_ART.terrain,ready=im.complete&&im.naturalWidth;let pat=null;
  if(ready){pat=x.createPattern(im,"repeat");const sc=s*.17/im.naturalWidth;pat.setTransform(new DOMMatrix([sc,0,0,sc,0,0]));}
  for(const path of SEA_R.paths){
    for(const [w,col] of [[58,"rgba(68,171,169,.12)"],[35,"rgba(78,184,174,.20)"],[19,"rgba(182,222,205,.46)"],[10,"#c5b990"]]){x.strokeStyle=col;x.lineWidth=w;x.stroke(path);}
    x.fillStyle="#546d42";x.fill(path);x.save();x.clip(path);
    if(pat){x.fillStyle=pat;x.fillRect(ox,oy,TS+pad*2,TS+pad*2);}
    x.strokeStyle="rgba(88,80,53,.52)";x.lineWidth=13;x.stroke(path);x.restore();
    x.strokeStyle="rgba(238,229,197,.84)";x.lineWidth=2;x.stroke(path);
  }
  for(const il of SEA_ISLANDS()){
    const cx=il.x*s,cy=il.y*s,rx=il.r*s,ry=rx*.72;
    if(cx+rx*2.4<ox||cx-rx*2.4>ox+TS+pad*2||cy+rx*2.4<oy||cy-rx*2.4>oy+TS+pad*2)continue;
    const glow=x.createRadialGradient(cx,cy,rx*.35,cx,cy,rx*1.7);
    glow.addColorStop(0,"rgba(89,187,166,.54)");glow.addColorStop(.7,"rgba(64,162,160,.20)");glow.addColorStop(1,"rgba(64,162,160,0)");
    x.fillStyle=glow;x.beginPath();x.ellipse(cx,cy,rx*1.8,ry*1.7,0,0,Math.PI*2);x.fill();
    x.strokeStyle="rgba(226,248,230,.5)";x.lineWidth=1.2;x.beginPath();x.ellipse(cx,cy+ry*.14,rx*1.08,ry*.97,0,0,Math.PI*2);x.stroke();
    const art=SEA_ART.islands;
    if(art.complete&&art.naturalWidth){
      const rects=[[0,0,562,512],[562,0,527,512],[1103,0,433,512],[0,512,584,512],[586,512,496,512],[1090,512,446,512]];
      const [rx0,ry0,rw,rh]=rects[il.kind],sx=art.naturalWidth/1536,sy=art.naturalHeight/1024,size=rx*3.6,f=Math.min(size/rw,size/rh),dw=rw*f,dh=rh*f;
      x.drawImage(art,rx0*sx,ry0*sy,rw*sx,rh*sy,cx-dw/2,cy-dh*.59,dw,dh);
    }else{x.fillStyle=il.col;x.beginPath();x.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);x.fill();}
  }
  return c;
}
function getSeaTile(i,j,s){
  const key=i+","+j,t=SEA_R.tiles;
  if(t.has(key)){const v=t.get(key);t.delete(key);t.set(key,v);return v;}
  const v=renderSeaTile(i,j,s);t.set(key,v);
  while(t.size>70)t.delete(t.keys().next().value);
  return v;
}
function drawOceanClose(){
  const storm=SEA.inStorm,bk=VW+"x"+VH+storm;
  if(SEA_R.baseKey!==bk){const base=g.createLinearGradient(0,0,VW,VH);
    base.addColorStop(0,storm?"#163849":"#10627c");base.addColorStop(.48,storm?"#102d40":"#084760");base.addColorStop(1,storm?"#0a2338":"#07334e");SEA_R.base=base;SEA_R.baseKey=bk;}
  /* 바탕색은 물결 무늬 안에 함께 칠해 두어 화면을 한 번만 칠한다. 밝고 어두운 기울기는 가장자리 그늘에서 더한다. */
  /* 물결 무늬는 세 장을 미리 그려 두고 번갈아 쓴다(한 번 칠하기로 반짝이는 효과) */
  const tr=seaTR(),fr=Math.floor(TICK/22)%3,wk=(storm?"s":"c")+tr+"_"+fr;let wv=SEA_R.wave[wk];
  if(!wv){
    const W=420,H=368,c=document.createElement("canvas");c.width=Math.round(W*tr);c.height=Math.round(H*tr);const x=c.getContext("2d");x.scale(tr,tr);x.lineCap="round";
    x.fillStyle=storm?"#0f3244":"#0a5170";x.fillRect(0,0,W,H);
    for(let row=0;row<8;row++)for(let col=0;col<4;col++){
      const seed=Math.sin(row*127.1+col*311.7)*43758.5453,rand=seed-Math.floor(seed);
      const bx=col*105+Math.sin(row*7.3)*30,by=row*46+rand*28,len=24+rand*51,ph=row*.7+col+fr*2.1;
      for(const [ox,oy] of [[0,0],[-W,0],[W,0],[0,-H],[0,H]]){
        const px=bx+ox,py=by+oy,sw=Math.sin(ph);
        x.strokeStyle=storm?`rgba(150,190,205,${.10+(.5+.5*sw)*.14})`:`rgba(119,208,217,${.08+(.5+.5*sw)*.16})`;x.lineWidth=.8+rand;
        x.beginPath();x.moveTo(px,py);x.bezierCurveTo(px+len*.28,py-3-sw*2,px+len*.68,py+5,px+len,py);x.stroke();
        if(rand>.62&&(row+col+fr)%3!==0){x.strokeStyle="rgba(221,249,242,.26)";x.lineWidth=.9;x.beginPath();x.moveTo(px+8,py+2+sw);x.quadraticCurveTo(px+15,py-1,px+24,py+1);x.stroke();}
      }
    }
    wv=SEA_R.wave[wk]={c,W,H,p:g.createPattern(c,"repeat")};
  }
  const s=seaWorldScale(),ox=SEA.x*s,oy=SEA.y*s,k=1/tr,R=v=>Math.round(v*tr)/tr;
  wv.p.setTransform(new DOMMatrix([k,0,0,k,R(-(ox%wv.W)+(TICK*.15)%wv.W),R(-(oy%wv.H))]));
  g.fillStyle=wv.p;g.fillRect(0,0,VW,VH);
}
function drawSeaLand(){
  const s=seaWorldScale(),tr=seaTR();
  if(SEA_R.s!==s||SEA_R.tr!==tr){
    SEA_R.s=s;SEA_R.tr=tr;SEA_R.tiles.clear();
    SEA_R.paths=[KOREA,JAPAN,MATSUE].map(pts=>{const p=new Path2D();pts.forEach((q,i)=>i?p.lineTo(q[0]*s,q[1]*s):p.moveTo(q[0]*s,q[1]*s));p.closePath();return p;});
  }
  const TS=SEA_R.T,offX=SEA.x*s-VW*.5,offY=SEA.y*s-VH*.54;
  const i0=Math.floor(offX/TS),i1=Math.floor((offX+VW)/TS),j0=Math.floor(offY/TS),j1=Math.floor((offY+VH)/TS);
  const R=v=>Math.round(v*DPR)/DPR;
  for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const t=getSeaTile(i,j,s);if(t)g.drawImage(t,R(i*TS-2-offX),R(j*TS-2-offY),t.width/DPR,t.height/DPR);}
  /* 화면 바깥 한 줄은 한 프레임에 한 조각씩 미리 그려 둔다 */
  outer:for(let j=j0-1;j<=j1+1;j++)for(let i=i0-1;i<=i1+1;i++){if(!SEA_R.tiles.has(i+","+j)){getSeaTile(i,j,s);break outer;}}
}
function drawSeaVignette(){
  const k=VW+"x"+VH+"@"+DPR;
  if(SEA_R.vigKey!==k){const c=document.createElement("canvas"),w=Math.max(1,Math.round(VW*DPR)),h=Math.max(1,Math.round(VH*DPR));c.width=w;c.height=h;const x=c.getContext("2d");
    const lg=x.createLinearGradient(0,0,w,h);lg.addColorStop(0,"rgba(40,150,175,.20)");lg.addColorStop(.48,"rgba(0,0,0,0)");lg.addColorStop(1,"rgba(0,12,30,.30)");x.fillStyle=lg;x.fillRect(0,0,w,h);
    const v=x.createRadialGradient(w/2,h/2,Math.min(w,h)*.24,w/2,h/2,Math.max(w,h)*.73);v.addColorStop(.55,"rgba(0,0,0,0)");v.addColorStop(1,"rgba(0,8,15,.36)");x.fillStyle=v;x.fillRect(0,0,w,h);SEA_R.vig=c;SEA_R.vigKey=k;}
  g.drawImage(SEA_R.vig,0,0,VW,VH);
}
function drawIslandArt(col,row,x,y,w,h){
  const im=SEA_ART.islands;if(!im.complete||!im.naturalWidth)return false;
  // The artwork has unequal silhouettes; explicit source rectangles avoid clipped cliffs.
  const rects=[[0,0,562,512],[562,0,527,512],[1103,0,433,512],[0,512,584,512],[586,512,496,512],[1090,512,446,512]];
  const [rx,ry,rw,rh]=rects[row*3+col],sx=im.naturalWidth/1536,sy=im.naturalHeight/1024;
  const factor=Math.min(w/rw,h/rh),dw=rw*factor,dh=rh*factor;
  g.drawImage(im,rx*sx,ry*sy,rw*sx,rh*sy,x-dw/2,y-dh*.59,dw,dh);return true;
}
function drawIslandWorld(p,r,col='#879b65',kind=3){
  const c=seaPoint(p.x,p.y),s=seaWorldScale(),rx=r*s,ry=rx*.72;
  if(c[0]<-rx*3||c[0]>VW+rx*3||c[1]<-rx*3||c[1]>VH+rx*3)return;
  g.save();const glow=g.createRadialGradient(c[0],c[1],rx*.35,c[0],c[1],rx*1.7);
  glow.addColorStop(0,'rgba(89,187,166,.54)');glow.addColorStop(.7,'rgba(64,162,160,.20)');glow.addColorStop(1,'rgba(64,162,160,0)');
  g.fillStyle=glow;g.beginPath();g.ellipse(c[0],c[1],rx*1.8,ry*1.7,0,0,Math.PI*2);g.fill();
  g.strokeStyle='rgba(226,248,230,.5)';g.lineWidth=1.2;g.beginPath();g.ellipse(c[0],c[1]+ry*.14,rx*1.08,ry*.97,0,0,Math.PI*2);g.stroke();
  const size=rx*3.6;
  if(!drawIslandArt(kind%3,Math.floor(kind/3),c[0],c[1],size,size)){
    g.fillStyle=col;g.beginPath();g.ellipse(c[0],c[1],rx,ry,0,0,Math.PI*2);g.fill();
  }g.restore();
}
function drawLocalLand(){
  drawSeaLand();return;
  drawWorldPoly(KOREA);drawWorldPoly(JAPAN);drawWorldPoly(MATSUE);
  OKIISL.forEach(o=>drawIslandWorld({x:o[0],y:o[1]},o[2],'#78915b',3));
  drawIslandWorld(SEAPT.ulleung,.014,'#789b5f',0);
  drawIslandWorld(SEAPT.dokdo,.007,'#8d8972',1);
  drawIslandWorld({x:SEAPT.dokdo.x+.015,y:SEAPT.dokdo.y+.003},.0043,'#8d8972',2);
}

function drawCoastLabels(){
  g.save();g.textAlign="center";g.font="800 15px Pretendard,sans-serif";
  for(const key of ["ulsan","gyeongju","pohang","uljin","gangneung","yangyang"]){
    const p=PORTS[key],q=seaPoint(p.labelX,p.labelY);if(q[0]<-80||q[0]>VW+80||q[1]<-40||q[1]>VH+40)continue;
    const w=g.measureText(p.short).width+22;g.fillStyle="rgba(35,55,38,.84)";g.fillRect(q[0]-w/2,q[1]-14,w,25);
    g.strokeStyle="#18251a";g.lineWidth=2;g.strokeRect(q[0]-w/2,q[1]-14,w,25);g.fillStyle="#f3e2b7";g.fillText(p.short,q[0],q[1]+4);
  }g.restore();
}
function drawLocalPorts(){
  g.textAlign="center";for(const [key,p] of Object.entries(PORTS)){
    if(!p.dockable)continue;const q=seaPoint(p.x,p.y);if(q[0]<-90||q[0]>VW+90||q[1]<-90||q[1]>VH+90)continue;
    const near=SEA.nearDock&&SEA.nearDock.key===key,pulse=near?5+Math.sin(TICK*.08)*3:0;
    g.fillStyle=near?"rgba(255,214,103,.30)":"rgba(245,231,194,.15)";g.beginPath();g.arc(q[0],q[1],24+pulse,0,7);g.fill();
    g.strokeStyle="#ead9a8";g.lineWidth=4;g.beginPath();g.moveTo(q[0]-16,q[1]+8);g.lineTo(q[0]+8,q[1]-8);g.lineTo(q[0]+22,q[1]-8);g.stroke();
    g.fillStyle="#b23425";g.fillRect(q[0]+7,q[1]-25,2,18);g.beginPath();g.moveTo(q[0]+9,q[1]-25);g.lineTo(q[0]+20,q[1]-20);g.lineTo(q[0]+9,q[1]-15);g.fill();
    if(!p.labelX){g.font="800 12px Pretendard,sans-serif";g.lineWidth=4;g.strokeStyle="rgba(4,21,30,.85)";g.strokeText(p.short,q[0],q[1]-34);g.fillStyle="#fff0c8";g.fillText(p.short,q[0],q[1]-34);}
  }g.textAlign="left";
}
function drawHazardsLocal(){
  const s=seaWorldScale();for(let i=0;i<SEA.hazards.length;i++){
    const h=SEA.hazards[i],q=seaPoint(h.x,h.y),r=Math.max(22,h.r*s);if(q[0]<-r||q[0]>VW+r||q[1]<-r||q[1]>VH+r)continue;
    if(h.type==="reef"){
      const foam=g.createRadialGradient(q[0],q[1],3,q[0],q[1],r);foam.addColorStop(0,"rgba(230,247,250,.56)");foam.addColorStop(1,"rgba(230,247,250,0)");g.fillStyle=foam;g.beginPath();g.arc(q[0],q[1],r,0,7);g.fill();
      if(!drawIslandArt(1,1,q[0],q[1],r*1.65,r*1.65)){
        g.fillStyle="#726b59";g.beginPath();g.ellipse(q[0],q[1],r*.45,r*.25,0,0,Math.PI*2);g.fill();
      }
    }else{
      const storm=g.createRadialGradient(q[0],q[1],4,q[0],q[1],r);storm.addColorStop(0,"rgba(13,27,42,.72)");storm.addColorStop(.65,"rgba(25,43,57,.38)");storm.addColorStop(1,"rgba(25,43,57,0)");g.fillStyle=storm;g.beginPath();g.arc(q[0],q[1],r,0,7);g.fill();
      g.strokeStyle="rgba(223,239,244,.68)";g.lineWidth=2;for(let k=-3;k<=3;k++){const ox=k*r*.18+Math.sin(TICK*.05+i)*5;g.beginPath();g.moveTo(q[0]+ox,q[1]-r*.48);g.lineTo(q[0]+ox-14,q[1]+r*.48);g.stroke();}
    }
  }
}
function drawLegendSigns(){
  if(SEA.leg!==0)return;g.save();g.textAlign="center";
  for(const z of LEGEND_ZONES){
    const found=!!G.flags["legend_"+z.id],q=seaPoint(z.x,z.y);if(q[0]<-100||q[0]>VW+100||q[1]<-100||q[1]>VH+100)continue;
    const pulse=8+(Math.floor(TICK/8)%3)*4;g.globalAlpha=found?.38:.25;g.fillStyle=found?"#8feaff":"#ffe481";g.fillRect(q[0]-pulse,q[1]-2,pulse*2,4);g.fillRect(q[0]-2,q[1]-pulse,4,pulse*2);
    g.globalAlpha=1;g.fillStyle=found?"#baf5ff":"#ffe9a5";for(let i=0;i<8;i++){const a=i*Math.PI/4+TICK*.025,r=16+(i%2)*7;g.fillRect(Math.round(q[0]+Math.cos(a)*r)-2,Math.round(q[1]+Math.sin(a)*r)-2,4,4);}
    if(found){g.font="800 11px Pretendard,sans-serif";g.lineWidth=4;g.strokeStyle="rgba(5,24,34,.9)";g.strokeText(z.name,q[0],q[1]-29);g.fillStyle="#d9f8ff";g.fillText(z.name,q[0],q[1]-29);}
    else{g.font="900 18px Pretendard,sans-serif";g.lineWidth=5;g.strokeStyle="rgba(5,24,34,.9)";g.strokeText("?",q[0],q[1]+6);g.fillStyle="#fff0b1";g.fillText("?",q[0],q[1]+6);}
  }g.restore();
}
function drawWake(x,y,hx,hy,size,alpha=.8){
  if(!hx&&!hy)return;const sx=-hy,sy=hx;
  g.save();g.lineCap='round';
  for(let side=-1;side<=1;side+=2)for(let k=0;k<10;k++){
    const t=k/10,t2=(k+1)/10;
    const point=u=>{const d=size*(.15+u*.7),spread=side*size*(.06+u*.16)+Math.sin(TICK*.06+u*12)*2;return[x-hx*d+sx*spread,y-hy*d+sy*spread];};
    const a=point(t),b=point(t2);
    g.strokeStyle=`rgba(214,248,244,${alpha*Math.pow(1-t,1.5)*.4})`;g.lineWidth=2.3*(1-t)+.7;
    g.beginPath();g.moveTo(...a);g.lineTo(...b);g.stroke();
  }
  for(let k=0;k<12;k++){
    const t=((k/12+TICK*.003)%1),d=size*(.15+t*.7),spread=Math.sin(k*7.3)*size*(.018+t*.09);
    g.fillStyle=`rgba(231,252,246,${alpha*(1-t)*.40})`;g.beginPath();g.ellipse(x-hx*d+sx*spread,y-hy*d+sy*spread,1.3+t*2,.7+t,0,0,Math.PI*2);g.fill();
  }g.restore();
}
function drawFallbackVessel(x,y,size,ang,npc=false){
  g.save();g.translate(x,y);const s=size/100;g.scale(s,s);g.fillStyle=npc?"#6e4d2f":"#4c2f1d";g.strokeStyle="#21170f";g.lineWidth=2;
  g.beginPath();g.moveTo(0,-42);g.lineTo(25,28);g.lineTo(0,43);g.lineTo(-25,28);g.closePath();g.fill();g.stroke();g.strokeStyle="#251c13";g.beginPath();g.moveTo(-12,20);g.lineTo(-12,-20);g.moveTo(11,25);g.lineTo(11,-15);g.stroke();g.fillStyle="#ead8ab";g.fillRect(-10,-23,20,26);g.fillRect(12,-15,18,23);g.restore();
}
function drawShipSprite(img,frame,x,y,size,ang,alpha=1){
  if(!img||!img.complete||!img.naturalWidth){drawFallbackVessel(x,y,size,ang,img===SPRITE_IMAGES.ship_npc);return;}
  const sw=img.naturalWidth/3,sh=img.naturalHeight;g.save();g.globalAlpha=alpha;g.drawImage(img,frame*sw,0,sw,sh,Math.round(x-size/2),Math.round(y-size/2),size,size);g.restore();
}
function drawTargetGuide(){
  const t=SEAPT[SEA.target],q=seaPoint(t.x,t.y),margin=72,visible=q[0]>margin&&q[0]<VW-margin&&q[1]>margin&&q[1]<VH-margin;
  const cx=VW*.5,cy=VH*.54,ang=Math.atan2(q[1]-cy,q[0]-cx),dist=Math.hypot(t.x-SEA.x,t.y-SEA.y);
  let x=q[0],y=q[1];if(!visible){const dx=Math.cos(ang),dy=Math.sin(ang),tx=dx>0?(VW-margin-cx)/dx:(margin-cx)/dx,ty=dy>0?(VH-margin-cy)/dy:(margin-cy)/dy,k=Math.min(Math.abs(tx),Math.abs(ty));x=cx+dx*k;y=cy+dy*k;}
  g.save();g.translate(x,y);g.rotate(ang);g.fillStyle="rgba(217,164,65,.92)";g.strokeStyle="#3a2a16";g.lineWidth=2;g.beginPath();g.moveTo(18,0);g.lineTo(-10,-10);g.lineTo(-5,0);g.lineTo(-10,10);g.closePath();g.fill();g.stroke();g.restore();
  g.font="800 12px Pretendard,sans-serif";g.textAlign="center";g.lineWidth=4;g.strokeStyle="rgba(5,24,34,.9)";const label=SEAPT[SEA.target].n+" · "+Math.max(1,Math.round(dist*130))+"리";g.strokeText(label,x,y-18);g.fillStyle="#ffe6a5";g.fillText(label,x,y-18);g.textAlign="left";
}
function drawWindField(){
  g.save();g.strokeStyle='rgba(191,226,231,.12)';g.lineWidth=1;g.lineCap='round';
  const step=Math.max(180,VW/5);
  for(let x=step/2;x<VW;x+=step)for(let y=step/2;y<VH;y+=step){
    const ph=(TICK*.65+x*.4+y*.2)%step,cx=x+Math.cos(SEA.wind)*(ph-step/2),cy=y+Math.sin(SEA.wind)*(ph-step/2);
    g.beginPath();g.moveTo(cx,cy);g.quadraticCurveTo(cx+Math.cos(SEA.wind)*20+3,cy+Math.sin(SEA.wind)*20-3,cx+Math.cos(SEA.wind)*44,cy+Math.sin(SEA.wind)*44);g.stroke();
  }g.restore();
}
function drawFleetLocal(){
  for(const s of SEA.npcs){if(onLand(s.x,s.y))continue;const q=seaPoint(s.x,s.y);if(q[0]<-150||q[0]>VW+150||q[1]<-150||q[1]>VH+150)continue;const size=Math.max(90,Math.min(150,Math.min(VW,VH)*.23)),ang=Math.atan2(s.dy,s.dx);drawWake(q[0],q[1],s.dx,s.dy,size,.43);drawShipSprite(SPRITE_IMAGES.ship_npc,s.type,q[0],q[1],size,ang,.94);if(Math.hypot(SEA.x-s.x,SEA.y-s.y)<.052){g.font="700 11px Pretendard,sans-serif";g.textAlign="center";g.lineWidth=4;g.strokeStyle="rgba(3,18,27,.85)";g.strokeText(s.name,q[0],q[1]-size*.37);g.fillStyle="#f4e6c8";g.fillText(s.name,q[0],q[1]-size*.37);g.textAlign="left";}}
  if(SEA.chase&&!onLand(SEA.chase.x,SEA.chase.y)){const q=seaPoint(SEA.chase.x,SEA.chase.y),t=SEAPT[SEA.target],ang=Math.atan2(t.y-SEA.chase.y,t.x-SEA.chase.x),size=Math.max(105,Math.min(170,Math.min(VW,VH)*.25));drawWake(q[0],q[1],Math.cos(ang),Math.sin(ang),size,.5);drawShipSprite(SPRITE_IMAGES.ship_npc,0,q[0],q[1],size,ang);}
}
function drawWeatherOverlay(){
  if(!SEA.inStorm)return;g.save();g.fillStyle="rgba(3,13,23,.18)";g.fillRect(0,0,VW,VH);g.strokeStyle="rgba(220,239,245,.37)";g.lineWidth=1.4;
  for(let i=0;i<90;i++){const x=(i*83+TICK*7)%(VW+100)-50,y=(i*47+TICK*13)%(VH+100)-50;g.beginPath();g.moveTo(x,y);g.lineTo(x-14,y+29);g.stroke();}if(TICK%170<3){g.fillStyle="rgba(235,247,255,.18)";g.fillRect(0,0,VW,VH);}g.restore();
}
function drawMiniMap(){
  if(VW<620&&!SEA.mapExpanded)return;
  const w=SEA.mapExpanded?Math.min(470,VW*.58):Math.min(260,VW*.25),h=w*.61,x=VW-w-12,y=SEA.mapExpanded?Math.max(76,(VH-h)/2):VH-h-112;
  const mk=Math.round(w)+"x"+Math.round(h)+"@"+DPR;
  if(SEA_R.miniKey!==mk){const c=document.createElement("canvas");c.width=Math.ceil(w*DPR);c.height=Math.ceil(h*DPR);const m=c.getContext("2d");m.scale(DPR,DPR);
    m.fillStyle="#3e7a93";m.fillRect(0,0,w,h);m.fillStyle="rgba(240,226,190,.14)";for(let i=0;i<w;i+=9)m.fillRect(i,((i*7)%h),5,1);
    const fp=(pts,col)=>{m.beginPath();pts.forEach((p,i)=>i?m.lineTo(p[0]*w,p[1]*h):m.moveTo(p[0]*w,p[1]*h));m.closePath();m.fillStyle=col;m.fill();};
    fp(KOREA,"#d8c08a");fp(JAPAN,"#d8c08a");fp(MATSUE,"#d8c08a");OKIISL.forEach(o=>{m.beginPath();m.arc(o[0]*w,o[1]*h,o[2]*w,0,7);m.fillStyle="#9aae72";m.fill();});
    m.strokeStyle="#d3b884";m.lineWidth=3;m.strokeRect(1.5,1.5,w-3,h-3);SEA_R.mini=c;SEA_R.miniKey=mk;}
  g.save();g.drawImage(SEA_R.mini,x,y,w,h);g.beginPath();g.rect(x+4,y+4,w-8,h-8);g.clip();
  g.setLineDash([5,5]);g.strokeStyle="#d9a441";g.lineWidth=1.5;const L=LEGS[SEA.leg],a=SEAPT[L.from],b=SEAPT[L.to];g.beginPath();g.moveTo(x+a.x*w,y+a.y*h);g.lineTo(x+b.x*w,y+b.y*h);g.stroke();g.setLineDash([]);
  for(const p of Object.values(PORTS)){if(!p.dockable)continue;g.fillStyle="#e9ddbd";g.fillRect(x+p.x*w-1.5,y+p.y*h-1.5,3,3);}
  for(const s of SEA.npcs){if(onLand(s.x,s.y))continue;g.fillStyle=s.nation==="japan"?"#e2745f":"#9ccbd6";g.fillRect(x+s.x*w-1,y+s.y*h-1,2,2);}
  const t=SEAPT[SEA.target];g.strokeStyle="#f1c75d";g.lineWidth=2;g.beginPath();g.arc(x+t.x*w,y+t.y*h,6+Math.sin(TICK*.08)*2,0,7);g.stroke();
  g.fillStyle="#c9422f";g.strokeStyle="#fff0c8";g.lineWidth=1.5;g.beginPath();g.arc(x+SEA.x*w,y+SEA.y*h,5,0,7);g.fill();g.stroke();g.restore();
  g.fillStyle="#f2e3c2";g.font="800 10px Pretendard,sans-serif";g.textAlign="left";g.fillText(SEA.mapExpanded?"동해 항로도 · 항구와 주변 선박":"항로도",x+10,y+16);
}
function drawSea(){
  drawOceanClose();drawLocalLand();drawCoastLabels();
  if(SEA.trail.length>1){g.save();g.beginPath();SEA.trail.forEach((p,i)=>{const q=seaPoint(p[0],p[1]);i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]);});g.strokeStyle="rgba(220,247,252,.26)";g.lineWidth=2;g.setLineDash([4,7]);g.stroke();g.restore();}
  drawLocalPorts();drawHazardsLocal();drawLegendSigns();drawTargetGuide();drawWindField();drawFleetLocal();
  const cx=VW*.5,cy=VH*.54,size=Math.max(130,Math.min(240,Math.min(VW,VH)*.34)),ang=Math.atan2(SEA.hy,SEA.hx),state=SEA.hull<=52?2:(SEA.trim<.8?1:0);
  drawWake(cx,cy,SEA.hx,SEA.hy,size,.84);drawShipSprite(SPRITE_IMAGES.ship_player,state,cx,cy,size,ang);drawWeatherOverlay();drawMiniMap();
  drawSeaVignette();
  if(SEA.msgT>0){SEA.msgT--;const w=Math.min(VW*.72,610),y=Math.max(88,VH-112);g.fillStyle="rgba(31,24,17,.91)";g.strokeStyle="#d3b884";g.lineWidth=2;g.fillRect(VW/2-w/2,y-38,w,38);g.strokeRect(VW/2-w/2,y-38,w,38);g.font="700 "+Math.max(12,Math.min(16,VW*.015))+"px Pretendard,sans-serif";g.textAlign="center";g.fillStyle="#fff0c8";g.fillText(SEA.msg,VW/2,y-14);g.textAlign="left";}
}
function updateGauge(dot,force){
  if(!force&&G.mode==="sea"&&SEA.active&&TICK%4!==0)return;
  const deg=a=>((a*180/Math.PI)+90+360)%360;$("#d-wind").firstElementChild.style.transform=`translate(-50%,-100%) rotate(${deg(SEA.wind)}deg)`;$("#v-wind").textContent=Math.round(SEA.wstr);
  const has=SEA.hx||SEA.hy;$("#d-head").firstElementChild.style.transform=`translate(-50%,-100%) rotate(${has?deg(Math.atan2(SEA.hy,SEA.hx)):0}deg)`;$("#v-head").textContent=has?compassName(Math.atan2(SEA.hy,SEA.hx)):"―";
  const kn=Math.max(0,Math.round(SEA.spd*18000)),vs=$("#v-spd");vs.textContent=kn+" 노트";vs.className="v"+(has&&dot<-.35?" wind-bad":"");$("#v-day").textContent=Math.floor(SEA.days)+" 일";
  const t=SEAPT[SEA.target],remain=Math.hypot(SEA.x-t.x,SEA.y-t.y),progress=Math.max(0,Math.min(100,(1-remain/(SEA.startDist||1))*100));$("#m-route").style.width=progress+"%";$("#v-route").textContent=Math.round(progress)+"%";
  $("#m-hull").style.width=SEA.hull+"%";$("#v-hull").textContent=Math.round(SEA.hull);$("#v-sail").textContent=SEA.trim>.8?"전개 · 빠름":"축범 · 안전";
  const wp=Math.max(0,Math.min(100,SUPPLY.water/SUPPLY.maxWater*100)),fp=Math.max(0,Math.min(100,SUPPLY.food/SUPPLY.maxFood*100));$("#m-water").style.width=wp+"%";$("#m-food").style.width=fp+"%";
  $("#v-water").textContent=Math.ceil(SUPPLY.water);$("#v-food").textContent=Math.ceil(SUPPLY.food);$("#water-row").classList.toggle("low",wp<=25);$("#food-row").classList.toggle("low",fp<=25);
}
function compassName(a){const d=((a*180/Math.PI)+90+360)%360,N=["북","북동","동","남동","남","남서","서","북서"];return N[Math.round(d/45)%8];}


/* ==========================================================
   대사 엔진
   ========================================================== */
const say=(c,m,...ls)=>ls.map(t=>({k:"say",c,m,t}));
const nar=(...ls)=>ls.map(t=>({k:"nar",t}));
const rec=t=>[{k:"rec",t}];
const got=id=>[{k:"got",id}];
const ask=o=>[{k:"ask",o}];
const run=f=>[{k:"run",f}];
const sq=(...a)=>a.flat();

let SCR=[],SP=0,typing=null,fullT="";
function fillVars(t){return String(t).replace(/\{name\}/g,G.name||"탐험대원");}
function play(s,returnMode){
  const fallback=(G.lastMode==="sea"||G.lastMode==="field")?G.lastMode:"field";
  const prev=returnMode||((G.mode==="sea"||G.mode==="field")?G.mode:fallback);
  G.talkReturnMode=prev; resetInput();
  SCR=s; SP=0; G.mode="talk"; ui();
  $("#dbox").classList.remove("hide");
  step();
}
function step(){
  $("#dbox").classList.remove("mission-focus");
  $("#choices").classList.add("hide"); $("#choices").innerHTML="";
  $("#rec").classList.add("hide");
  if(SP>=SCR.length){ endTalk(); return; }
  const n=SCR[SP++];
  switch(n.k){
    case "run": n.f(); step(); break;
    case "say": renderSay(n.c,n.m,n.t); break;
    case "nar": renderNar(n.t); break;
    case "rec": renderRec(n.t); break;
    case "got": award(n.id); break;
    case "ask": renderAsk(n.o); break;
    case "shake": doShake(); setTimeout(step,400); break;
    case "timewarp": runTimeWarp(); break;
    case "memory": showMemoryScene(n.show,n.title); step(); break;
    case "jasan": showJasanScene(n.show); step(); break;
    case "goto": n.f(); break;
    case "walk": startWalk(n); break;
    case "bubble": {const e=entById(n.id);if(e)e.bubble=n.t||null;step();break;}
    case "banner": showBanner(n.t); step(); break;
    case "exhibit": showExhibit(n.id); step(); break;
    default: step();
  }
}
function endTalk(){
  clearInterval(typing); typing=null; showBanner(null); showExhibit(null);
  $("#dbox").classList.add("hide");
  if(G.pending){ const f=G.pending; G.pending=null; f(); return; }
  if(G.mode==="talk") G.mode=G.talkReturnMode||"field";
  ui();
}
function typeOut(t){
  fullT=fillVars(t); const el=$("#dline"); el.textContent="";
  let i=0; clearInterval(typing);
  typing=setInterval(()=>{ el.textContent=fullT.slice(0,++i); if(i>=fullT.length) clearInterval(typing); },24);
}
function renderSay(c,m,t){
  const ch=CH[c]||{n:"?"};
  const missionFocus=c==="cp"&&m==="항해 임무";
  if(missionFocus) $("#dbox").classList.add("mission-focus");
  if(!renderSpritePortrait(c,m,t)) $("#portrait").innerHTML=faceSVG(c,m);
  $("#portrait").style.display="";
  $("#dname").style.display=""; $("#dname").innerHTML=(c==="me"?esc(G.name):ch.n)+(m?` <span class="mood">(${m})</span>`:"");
  $("#dline").className="dline"; typeOut("“"+(missionFocus?t.replace(/\s{2,}/g,"\n"):t)+"”");
}
function renderNar(t){
  $("#portrait").style.display="none"; $("#dname").style.display="none";
  $("#dline").className="dline nar"; typeOut(t);
}
function renderRec(t){
  const r=$("#rec"); r.innerHTML="<b>기 록</b>"+fillVars(t); r.classList.remove("hide");
  $("#portrait").style.display="none"; $("#dname").style.display="none";
  $("#dline").className="dline nar"; typeOut("― 기록이 남았다.");
}
function renderAsk(opts){
  const c=$("#choices"); c.innerHTML=""; c.classList.remove("hide");
  opts.forEach(o=>{
    const b=document.createElement("button"); b.className="choice"; b.textContent=fillVars(o.t);
    b.onclick=e=>{ e.stopPropagation(); c.classList.add("hide"); c.innerHTML="";
      SCR=o.then.concat(SCR.slice(SP)); SP=0; step(); };
    c.appendChild(b);
  });
  $("#portrait").style.display="none"; $("#dname").style.display="none";
  $("#dline").className="dline nar"; typeOut("무어라 답하겠소?");
}
function advance(){
  if(G.mode!=="talk"||G.inputLock) return;
  if(!$("#choices").classList.contains("hide")) return;
  if(typing && $("#dline").textContent.length<fullT.length){ clearInterval(typing); $("#dline").textContent=fullT; return; }
  step();
}
$("#dbox").onclick=advance;
/* v13 · 장면 속 인물 걷기(연출) */
let WALK=null;
function startWalk(n){
  const e=entById(n.id);if(!e){step();return;}
  e.gone=false;e.px=e.tx*T;e.py=e.ty*T;e.walking=true;
  const [gx,gy]=n.to,pts=n.yFirst?[[e.tx,gy],[gx,gy]]:[[gx,e.ty],[gx,gy]];
  WALK={e,pts,sp:n.speed||1.5,face:n.face};G.inputLock=true;resetInput();$("#dbox").classList.add("hide");
}
function updateWalk(){
  if(!WALK)return;const w=WALK,e=w.e,p=w.pts[0],gx=p[0]*T,gy=p[1]*T,dx=gx-e.px,dy=gy-e.py,d=Math.hypot(dx,dy);
  if(d>w.sp){e.px+=dx/d*w.sp;e.py+=dy/d*w.sp;e.dir=Math.abs(dx)>Math.abs(dy)?(dx<0?"l":"r"):(dy<0?"u":"d");return;}
  e.px=gx;e.py=gy;w.pts.shift();if(w.pts.length)return;
  e.tx=p[0];e.ty=p[1];delete e.px;delete e.py;e.walking=false;if(w.face)e.dir=w.face;
  WALK=null;CAM.ease=500;G.inputLock=false;$("#dbox").classList.remove("hide");step();
}
function showBanner(t){const b=$("#scene-banner");if(!b)return;if(!t){b.classList.add("hide");return;}b.textContent=t;b.classList.remove("hide");}
function doShake(){ const s=$("#stage"); s.classList.remove("shake"); void s.offsetWidth; s.classList.add("shake"); }
function drawMemoryActors(){
  const c=$("#memory-canvas");if(!c)return;
  const x=c.getContext("2d"),W=c.width,H=c.height;
  x.clearRect(0,0,W,H);x.imageSmoothingEnabled=true;
  const actors=[
    {id:"yb",cx:.19,size:.30,scale:.91},
    {id:"pd",cx:.50,size:.33,scale:1},
    {id:"jf",cx:.81,size:.29,scale:.9}
  ];
  let waiting=false;
  actors.forEach(a=>{
    const s=FULL_SPRITES[a.id],im=s&&SPRITE_IMAGES[s[0]];
    if(!im||!im.complete||!im.naturalWidth){
      if(im&&!waiting){waiting=true;im.addEventListener("load",drawMemoryActors,{once:true});}
      return;
    }
    const sw=im.naturalWidth/3,sh=im.naturalHeight/2;
    const size=Math.min(W*a.size,H*a.scale),dx=W*a.cx-size/2,dy=H-size-14;
    x.save();x.globalAlpha=.44;x.fillStyle="#0d0907";x.beginPath();x.ellipse(W*a.cx,H-7,size*.29,size*.055,0,0,Math.PI*2);x.fill();x.restore();
    x.drawImage(im,s[1]*sw,s[2]*sh,sw,sh,dx,dy,size,size);
  });
}
function showMemoryScene(show,title="1693년 울릉도 · 빛바랜 기억"){
  const el=$("#memory-stage");
  if(!show){el.classList.add("hide");el.innerHTML="";el.style.backgroundImage="";return;}
  el.style.backgroundImage=`url("${DOKDO_BG_ASSET}")`;
  el.innerHTML=`<div class="memory-kicker">${title}</div><canvas id="memory-canvas" class="memory-canvas" width="1200" height="560"></canvas><b class="memory-label yb">안용복</b><b class="memory-label pd">박어둔</b><b class="memory-label jf">일본 어부</b>`;
  el.classList.remove("hide");
  drawMemoryActors();
}
function showJasanScene(show){
  const el=$("#jasan-stage");
  if(!show){el.classList.add("hide");el.innerHTML="";return;}
  el.innerHTML=`<img src="${JASAN_ASSET}" alt="울릉도에서 수평선 너머로 바라본 자산도"><div class="jasan-title">울릉도에서 바라본 자산도</div><div class="jasan-note">맑은 날, 동남쪽 수평선 너머로 또렷하게 보이는 섬</div>`;
  el.classList.remove("hide");
}
function runTimeWarp(){
  G.inputLock=true;resetInput();const s=$("#stage"),w=$("#time-warp");s.classList.remove("time-shake");w.classList.remove("on");void s.offsetWidth;s.classList.add("time-shake");w.classList.add("on");
  setTimeout(()=>{setGameClock(1696,4,18,8,0);step();},520);
  setTimeout(()=>{s.classList.remove("time-shake");w.classList.remove("on");G.inputLock=false;},1080);
}

/* 발견 인장 */
function dismissStamp(){
  const w=$("#stamp");
  if(w.classList.contains("hide")) return;
  w.classList.add("hide"); w.onclick=null; step();
}
function award(id){
  if(G.dex.indexOf(id)<0) G.dex.push(id);
  if(!G.stampLog[id]) G.stampLog[id]={y:CLOCK.year,m:CLOCK.month,d:CLOCK.day};
  const it=DEX[id], w=$("#stamp"),visual=id==="badge"&&typeof passportMiniHTML==="function"?passportMiniHTML("",true):creatureSpriteSpec(id)?creatureHTML(id,"creature-stamp"):EVIDENCE_SPRITES[id]?evidenceHTML(id,"evidence-stamp"):DEX_ATLAS[id]?atlasHTML(DEX_ATLAS[id],"atlas-stamp",it.n):`<div class="em">${it.em}</div>`;
  w.innerHTML=`<div class="scard"><div class="k">도 감 기 록</div>${visual}
    <div class="n">${it.n}</div><div class="d">${it.d}</div><div class="seal">記<br>錄</div></div>`;
  hydrateAtlasSprites(w);
  w.classList.remove("hide");
  w.onclick=dismissStamp;
}


/* ==========================================================
   v13 · 관원 앞 자료 제시 — 자료 한 장씩 전체화면 복습
   ========================================================== */
const EXHIBIT_ORDER=["eco","sejong","paldo","sight","life","suto","trace","okidoc","ban"];
const EXHIBITS={
  eco:{n:"독도 생태 조사 기록",year:"1696년 · 독도",kind:"탐사선 현장 관찰 기록",point:"독도는 바위섬 두 개가 아니라, 수많은 생물이 기대어 사는 바다다.",quote:"강치 · 괭이갈매기 · 살오징어 · 전복 · 미역 · 도화새우 · 부채뿔산호 · 해국 · 섬기린초 · 메탄 하이드레이트…"},
  sejong:{n:"《세종실록》 〈지리지〉",year:"1454년",kind:"조선 조정이 만든 지리 기록",point:"울진현 정동쪽 바다에 우산도와 무릉도, 두 섬이 있다고 적었다.",quote:"“우산과 무릉 두 섬이 현의 정동쪽 바다 가운데 있다. 두 섬은 서로 멀지 않아 날씨가 맑으면 바라볼 수 있다.”"},
  paldo:{n:"〈팔도총도〉 · 《신증동국여지승람》",year:"1531년",kind:"조선 조정이 만든 지도",point:"동해에 울릉도와 우산도, 두 섬을 함께 그려 넣었다.",note:"옛 지도라 섬의 위치가 오늘날과 다르게 그려져 있다."},
  sight:{n:"울릉도에서 본 자산도",year:"1696년 · 울릉도",kind:"눈으로 확인한 관찰 자료",point:"맑은 날 울릉도에서 약 87km 떨어진 독도가 눈으로 보인다.",note:"보인다는 사실은 두 섬을 한 짝으로 여겨 온 까닭을 설명해 준다."},
  life:{n:"1693년 조선 어민의 울릉도 왕래",year:"1693년",kind:"백성이 오간 기록 · 보조 근거",point:"안용복과 박어둔 등 조선 어민들이 울릉도 바다를 오가며 이용했다.",note:"나라가 공식으로 관리했다는 증거는 아니다. 다음 자료와 함께 봐야 한다."},
  suto:{n:"장한상의 울릉도 수토 기록",year:"1694년",kind:"조정이 관원을 보내 조사한 기록",point:"백성이 섬에 살지 못하게 하면서도, 나라는 관원을 보내 섬을 직접 살폈다.",quote:"“동쪽 바다를 바라보니 동남쪽에 섬 하나가 희미하게 보인다. 크기는 울릉도의 3분의 1이 안 되고 거리는 300여 리쯤이다.”",note:"쇄환정책은 섬을 버린 것이 아니다."},
  trace:{n:"일본 어선의 벌목·어업 흔적",year:"1696년 · 독도",kind:"현장 정황 자료",point:"일본 배가 잠시 지나간 것이 아니라 머물며 나무를 베고 그물을 쳤다.",note:"이것만으로 섬의 주인이 정해지지는 않는다."},
  okidoc:{n:"오키섬 관리의 조사 문서",year:"1696년 5월",kind:"일본 관리가 남긴 진술 조사 기록",point:"‘울릉도와 자산도는 조선 강원도에 속한다’는 안용복의 말이 일본 쪽 기록에 남았다.",note:"일본 정부의 영유권 승인서와는 다른, 진술을 적은 조사 문서다."},
  ban:{n:"일본인의 울릉도 도해금지",year:"1696년 1월",kind:"에도 막부의 조치",point:"막부가 일본 사람이 울릉도로 건너가는 것을 금했다.",note:"안용복의 두 번째 도일보다 앞선 일이며, 울릉도를 두고 내린 조치다."}
};
function fullFigureHTML(id,left){
  const s=FULL_SPRITES[id];if(!s)return"";
  return `<span class="ex-fig" style="left:${left}%;background-image:url('${ASSET_DATA[s[0]]}');background-position:${s[1]*50}% ${s[2]*100}%"></span>`;
}
function exhibitVisual(id){
  if(id==="eco"){const ids=DOKDO_TARGETS.filter(k=>G.dex.includes(k));return `<div class="ex-eco">${(ids.length?ids:DOKDO_TARGETS).map(k=>`<figure>${creatureHTML(k,"ex-creature")}<figcaption>${esc(DEX[k].n)}</figcaption></figure>`).join("")}</div>`;}
  if(EVIDENCE_SPRITES[id])return `<span class="ex-ev" role="img" aria-label="${esc(EXHIBITS[id].n)}" style="background-image:var(--evidence-atlas);background-position:${EVIDENCE_SPRITES[id][0]*50}% 0%"></span>`;
  if(id==="sight")return `<img src="${JASAN_ASSET}" alt="울릉도에서 바라본 자산도">`;
  if(id==="life")return `<div class="ex-life" style="background-image:url('${DOKDO_BG_ASSET}')">${fullFigureHTML("yb",3)}${fullFigureHTML("pd",35)}${fullFigureHTML("jf",67)}</div>`;
  if(id==="suto")return `<div class="ex-scroll"><b>蔚陵島事蹟</b><span>張漢相 · 甲戌</span><i>三陟營將</i></div>`;
  if(id==="ban")return `<div class="ex-scroll ban"><b>竹島渡海禁止</b><span>元祿九年 正月</span><i>江戶幕府</i></div><p class="ex-cap">竹島(다케시마) = 당시 일본이 울릉도를 부르던 이름</p>`;
  if(id==="trace")return `<div class="ex-trace"><span class="ex-ship" style="background-image:url('${SHIP_ASSETS.npc}')"></span><span class="ex-prop a">🪵</span><span class="ex-prop b">🪵</span><span class="ex-prop c">🕸️</span></div>`;
  return "";
}
function showExhibit(id){
  const el=$("#exhibit");if(!el)return;
  $("#stage").classList.toggle("exhibiting",!!id);
  if(!id){el.classList.add("hide");el.innerHTML="";return;}
  if(id==="recap"){
    el.innerHTML=`<div class="ex-card ex-recap"><div class="ex-text"><span class="ex-count">기 록 복 습 · 모두 ${EXHIBIT_ORDER.length}장</span><h2 class="ex-title">안용복이 바다를 건넌 까닭을 보여 주는 기록</h2>
      <div class="ex-grid">${EXHIBIT_ORDER.map((k,i)=>{const x=EXHIBITS[k];return `<div class="ex-mini"><small>${i+1} · ${esc(x.year)}</small><b>${esc(x.n)}</b><p>${esc(x.point)}</p></div>`;}).join("")}</div></div></div>`;
  }else{
    const x=EXHIBITS[id],i=EXHIBIT_ORDER.indexOf(id)+1;
    el.innerHTML=`<div class="ex-card"><div class="ex-visual">${exhibitVisual(id)}</div>
      <div class="ex-text"><span class="ex-count">자 료 ${i} / ${EXHIBIT_ORDER.length}</span><h2 class="ex-title">${esc(x.n)}</h2>
      <div class="ex-tags"><span>${esc(x.year)}</span><span class="kind">${esc(x.kind)}</span></div>
      <p class="ex-point">${esc(x.point)}</p>${x.quote?`<p class="ex-quote">${esc(x.quote)}</p>`:""}${x.note?`<p class="ex-note"><b>살펴볼 점</b> ${esc(x.note)}</p>`:""}</div>
      <div class="ex-seal">記<br>錄</div></div>`;
  }
  el.classList.remove("hide");el.onclick=advance;
}

/* ==========================================================
   v13 · 출항 항해지도 연출
   ========================================================== */
const CHART_PTS={busan:[.4553,.784],ulleung:[.6075,.332],dokdo:[.710,.461],oki:[.787,.845],yangyang:[.4468,.129]};
function showVoyageChart(i,done){
  const L=LEGS[i],a=CHART_PTS[L.from],b=CHART_PTS[L.to],el=$("#voyage-chart"),W=1531,H=310;
  const cs=L.curve||1,ax=a[0]*W,ay=a[1]*H,bx=b[0]*W,by=b[1]*H,mx=(ax+bx)/2+(by-ay)*.22*cs,my=(ay+by)/2-(bx-ax)*.10*cs;
  const d=`M${ax.toFixed(1)} ${ay.toFixed(1)} Q${mx.toFixed(1)} ${my.toFixed(1)} ${bx.toFixed(1)} ${by.toFixed(1)}`;
  G.mode="chart";G.inputLock=true;resetInput();ui();$("#prep").classList.add("hide");
  el.innerHTML=`<div class="vc-card"><div class="vc-kicker">航 海 圖 · ${i+1}번째 뱃길</div><h2>${esc(SEAPT[L.from].n)} <span>→</span> ${esc(SEAPT[L.to].n)}</h2>
    <div class="vc-map"><img src="${CHART_BG}" alt="조선시대 동해 항해지도"><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">
      <path class="vc-route-bg" d="${d}"/><path class="vc-route" d="${d}" pathLength="1"/>
      <circle class="vc-dot" cx="${ax}" cy="${ay}" r="8"/><circle class="vc-dot goal" cx="${bx}" cy="${by}" r="10"/>
</svg><span class="vc-ship" style="background-image:url('${SHIP_ASSETS.player}')"></span></div>
    <p class="vc-note">${esc(L.title)}</p><small class="vc-skip">화면을 누르면 바로 출항합니다</small></div>`;
  el.classList.remove("hide");
  const ship=el.querySelector(".vc-ship"),t0=performance.now()+250;
  const sail=now=>{if(!ship.isConnected)return;const t=Math.max(0,Math.min(1,(now-t0)/2600)),u=1-t;
    const px=u*u*ax+2*u*t*mx+t*t*bx,py=u*u*ay+2*u*t*my+t*t*by;ship.style.left=(px/W*100)+"%";ship.style.top=(py/H*100)+"%";if(t<1)requestAnimationFrame(sail);};
  requestAnimationFrame(sail);
  let closed=false;const finish=()=>{if(closed)return;closed=true;clearTimeout(timer);el.classList.add("hide");el.innerHTML="";el.onclick=null;G.inputLock=false;done();};
  const timer=setTimeout(finish,3400);setTimeout(()=>{if(!closed)el.onclick=finish;},350);
}

/* ==========================================================
   포획 미니게임
   ========================================================== */
let CG=null;
const DOKDO_TARGETS=["gangchi","gull","squid","abalone","seaweed","cod","spindle","blackporgy","egret","petrel","bluedamselfish","aster","ghosttunicate","stonecrop","fancoral","pinkshrimp","methane"];
const OBSERVE_ONLY=new Set(["gangchi","gull","spindle","egret","petrel","aster","stonecrop","methane"]);
function catchButtonLabel(id){return id==="methane"?"해저를 살핀다":OBSERVE_ONLY.has(id)?"가까이서 기록한다":"그물을 던진다";}
function caughtNarration(id,perfect){
  if(id==="methane")return perfect?"― 수면의 빛을 피해 해저의 결정층을 정확히 찾아냈다!":"― 해저의 낯선 결정층을 발견했다!";
  if(OBSERVE_ONLY.has(id))return perfect?"― 움직임과 생김새를 한 번에 정확히 기록했다!":"― 가까이 관찰해 도감에 기록했다!";
  return perfect?"― 단번에! 그물의 위치가 정확했다.":"― 잡았다! 관찰을 마친 뒤 다시 바다에 놓아주었다.";
}
/* v15 · 독도 생태 조사 미니게임
   생물마다 난이도(★)가 있고, 난이도만큼 성공해야 기록된다. 초록 칸은 명중, 금빛 칸은 완벽(2칸 진행).
   어려운 생물은 칸이 움직이고 바늘도 물결처럼 빨라졌다 느려진다. 연속 명중하면 점수가 커진다. */
const CATCH_TIER={gangchi:3,gull:3,petrel:3,squid:3,egret:2,cod:2,blackporgy:2,bluedamselfish:2,pinkshrimp:2,methane:2,
  abalone:1,seaweed:1,ghosttunicate:1,fancoral:1,stonecrop:1,aster:1,spindle:1};
const DOKDO_SCORE={score:0,combo:0,best:0};
function catchStageKind(cr){return cr==="methane"?"deep":["gull","petrel","egret","spindle","aster","stonecrop"].includes(cr)?"sky":cr==="gangchi"?"rock":"water";}
function startCatch(ent){
  G.lastMode="field";
  const tier=CATCH_TIER[ent.cr]||1,it=DEX[ent.cr],el=$("#catch");
  /* 난이도는 예전과 같다: 바늘 속도 1.35, 초록 칸 22~32%, 한 번 명중하면 기록. ★은 희귀도(점수)만 뜻한다 */
  const zw=22+Math.random()*10;
  CG={ent,tier,t:0,pos:0,dir:1,speed:1.35,tries:3,need:1,prog:0,zw,z0:Math.min(18+Math.random()*54,98-zw),lock:false,perfects:0,trackW:0};
  const stars="★".repeat(tier)+"☆".repeat(3-tier);
  el.innerHTML=`<div class="ccard catch2 tier${tier}">
    <div class="c-top"><span class="c-tier">희귀도 ${stars}</span><span class="c-score">조사 점수 <b id="c-score">${DOKDO_SCORE.score.toLocaleString()}</b></span><span class="c-combo ${DOKDO_SCORE.combo>1?"on":""}" id="c-combo">연속 ×${DOKDO_SCORE.combo}</span></div>
    <div class="c-stage ${catchStageKind(ent.cr)}" id="c-stage"><i class="c-ripple"></i><i class="c-ripple r2"></i><i class="c-ripple r3"></i>
      <div class="c-actor" id="c-actor">${creatureHTML(ent.cr,"creature-catch")}</div><div class="c-net" id="c-net"></div><div class="c-fx" id="c-fx"></div><div class="c-pop" id="c-pop"></div></div>
    <h3>${it.n}</h3><p>${CATCHLINE[ent.cr]}</p>
    <div class="c-prog"><span>${OBSERVE_ONLY.has(ent.cr)?"관찰 기록":"끌어올리기"}</span><div class="c-bar"><i id="c-bar"></i></div><b id="c-need">0 / ${CG.need}</b></div>
    <div class="track" id="tr"><div class="zone" id="cz"></div><div class="zone perfect" id="cpf"></div><div class="needle" id="nd"></div></div>
    <div class="ctry" id="ctry">기회 ● ● ●</div>
    <button class="btn red" id="cbtn">${catchButtonLabel(ent.cr)}</button>
    <button class="btn ghost" id="cesc" style="margin-left:8px">물러난다</button>
    <p class="c-help">스페이스 · 말걸기 버튼으로도 누를 수 있어요</p>
  </div>`;
  el.classList.remove("hide"); G.mode="catch"; ui();
  $("#cbtn").onclick=e=>{e.stopPropagation();catchHit();};
  $("#cesc").onclick=()=>{ el.classList.add("hide"); CG=null; G.mode="field"; ui(); };
  updateCatchVisual();
}
function catchZone(){const z0=CG.z0;return [z0,z0+CG.zw,z0+CG.zw*.36,z0+CG.zw*.64];}
function updateCatch(){
  if(!CG||CG.lock)return;CG.t++;
  CG.pos+=CG.dir*CG.speed;if(CG.pos>100){CG.pos=100;CG.dir=-1}if(CG.pos<0){CG.pos=0;CG.dir=1}
  moveCatchNeedle();
}
function moveCatchNeedle(){
  const nd=CG&&CG.nd;if(!nd)return;
  if(!CG.trackW||CG.t%60===0)CG.trackW=CG.tr.clientWidth;
  nd.style.transform=`translate3d(${(CG.pos/100*(CG.trackW-5)).toFixed(1)}px,0,0)`;
}
function updateCatchVisual(){
  if(!CG)return;const z=catchZone(),cz=$("#cz"),cp=$("#cpf");
  CG.nd=$("#nd");CG.tr=$("#tr");
  if(cz){cz.style.left=z[0]+"%";cz.style.width=(z[1]-z[0])+"%";}
  if(cp){cp.style.left=z[2]+"%";cp.style.width=(z[3]-z[2])+"%";}
  moveCatchNeedle();
}
function replayClass(el,cls){if(!el)return;el.classList.remove(cls);void el.offsetWidth;el.classList.add(cls);}
function catchFX(text,kind,pts){
  const pop=$("#c-pop"),fx=$("#c-fx");
  if(pop){pop.className="c-pop "+kind;pop.innerHTML=`${text}${pts?`<small>+${pts}</small>`:""}`;replayClass(pop,"show");}
  if(fx){const n=kind==="miss"?6:kind==="win"?22:12;let h="";
    for(let i=0;i<n;i++){const a=(i/n)*Math.PI*2+Math.random()*.4,d=50+Math.random()*(kind==="win"?110:70);
      h+=`<i class="${kind}" style="--dx:${(Math.cos(a)*d).toFixed(0)}px;--dy:${(Math.sin(a)*d*.8-20).toFixed(0)}px;--dl:${(Math.random()*.12).toFixed(2)}s"></i>`;}
    fx.innerHTML=h;}
  const actor=$("#c-actor");if(actor)replayClass(actor,kind==="miss"?"dodge":"hit");
}
function refreshCatchHUD(){
  const s=$("#c-score"),c=$("#c-combo"),b=$("#c-bar"),n=$("#c-need");
  if(s)s.textContent=DOKDO_SCORE.score.toLocaleString();
  if(c){c.textContent="연속 ×"+DOKDO_SCORE.combo;c.classList.toggle("on",DOKDO_SCORE.combo>1);replayClass(c,"bump");}
  if(CG&&b)b.style.width=Math.min(100,CG.prog/CG.need*100)+"%";
  if(CG&&n)n.textContent=Math.min(CG.prog,CG.need)+" / "+CG.need;
}
function catchHit(){
  if(!CG||CG.lock) return;
  const z=catchZone(),p=CG.pos,ok=p>=z[0]&&p<=z[1],perf=p>=z[2]&&p<=z[3];
  if(ok){
    DOKDO_SCORE.combo++;DOKDO_SCORE.best=Math.max(DOKDO_SCORE.best,DOKDO_SCORE.combo);
    const pts=(perf?120:60)+Math.min(10,DOKDO_SCORE.combo-1)*15;DOKDO_SCORE.score+=pts;
    CG.prog+=perf?2:1;if(perf)CG.perfects++;
    catchFX(perf?"완벽!":"명중!",perf?"perfect":"good",pts);refreshCatchHUD();
    if(CG.prog>=CG.need){
      const bonus=50*CG.tier+(CG.tries===3?50:0);DOKDO_SCORE.score+=bonus;CG.lock=true;
      setTimeout(()=>{catchFX(OBSERVE_ONLY.has(CG.ent.cr)?"기록 완료!":"조사 성공!","win",bonus);refreshCatchHUD();const net=$("#c-net");if(net)net.classList.add("drop");const st=$("#c-stage");if(st)st.classList.add("won");},260);
      setTimeout(()=>{
        $("#catch").classList.add("hide");
        const cr=CG.ent.cr,perfAny=CG.perfects>0; CG.ent.gone=true; G.caught.push(cr); CG=null;
        G.lastMode="field";
        G.pending=()=>{ G.mode="field"; ui(); checkDokdoDone(); };
        play(sq(nar(caughtNarration(cr,perfAny)),got(cr),dokdoCatchLine(cr)));
      },1250);
    }
  }else{
    DOKDO_SCORE.combo=0;CG.tries--;catchFX("놓쳤다!","miss",0);refreshCatchHUD();
    $("#ctry").textContent="기회 "+"● ".repeat(CG.tries)+"○ ".repeat(3-CG.tries);
    doShake();
    if(CG.tries<=0){
      CG.lock=true;const st=$("#c-stage");if(st)st.classList.add("lost");
      setTimeout(()=>{
        $("#catch").classList.add("hide"); CG=null; G.mode="field"; ui();
        G.lastMode="field";
        play(say("yi","","놓쳤구먼. 괜찮여, 바다는 도망 안 간다니께.","숨 고르고 다시 해보쇼."));
      },800);
    }else{ CG.speed+=0.25; }
  }
}
const CATCHLINE={
  gangchi:"바위 위에서 몸을 뒤척인다. 놀라게 하면 물로 뛰어든다.",
  gull:"머리 위를 낮게 스친다. 날갯짓의 박자를 읽으시오.",
  squid:"살오징어가 먹물을 뿜고 달아난다. 그물을 던질 때를 노리시오.",
  abalone:"바위에 딱 붙었다. 힘이 아니라 때가 중요하오.",
  seaweed:"파도에 실려 흔들린다. 물이 빠질 때 뜯으시오.",
  cod:"찬물 속에서 천천히 돈다. 낚싯줄을 당길 순간이오.",
  spindle:"서도의 가파른 바위틈에서 푸른 잎이 흔들린다. 배를 너무 가까이 대지 말고 망원경으로 살피시오.",
  blackporgy:"검은 등지느러미가 암초 사이를 가른다. 물결이 낮아질 때 그물을 내리시오.",
  egret:"황갈색 머리깃의 새가 바위 끝에 내려앉았다. 날아오르기 전에 특징을 기록하시오.",
  petrel:"바다제비가 수면을 스치며 빠르게 돈다. 선회하는 순간을 기다리시오.",
  bluedamselfish:"선명한 파란빛의 작은 물고기가 산호 곁을 돈다. 무리를 놀라게 하지 마시오.",
  aster:"바닷바람 속에서 연보랏빛 꽃이 흔들린다. 파도 사이로 꽃 모양을 기록하시오.",
  ghosttunicate:"반투명한 유령멍게 군체가 수중 암반에 붙어 있다. 채집망을 조심히 내리시오.",
  stonecrop:"노란 섬기린초가 절벽 틈에 피었다. 배 위에서 잎과 꽃을 관찰하시오.",
  fancoral:"부채처럼 펼쳐진 산호가 깊은 바다에서 흔들린다. 줄이 걸리지 않게 천천히 채집하시오.",
  pinkshrimp:"붉은 도화새우가 깊은 물속으로 숨는다. 잠시 떠오르는 때를 노리시오.",
  methane:"독도 주변 밑바닥에 얼음 결정처럼 반짝이는 것이 있다. 수면의 흔들림이 잦아들 때 자세히 살피시오."
};
const dokdoCatchLine=cr=>({
  gangchi:say("yb","조용히","가제요. 이 바위가 저놈들 안방인 셈이오.","울릉도 사람들이 저 기름을 얻으러 여기까지 온다오."),
  gull:say("nh","","괭이갈매기일세. 우는 소리가 꼭 고양이 같아서 그리 부르지.","새가 사는 곳엔 반드시 섬이 있는 법이야."),
  squid:say("yi","","살오징어여! 여기가 찬물하고 더운물이 만나는 데라 고기가 이만치 몰린다니께."),
  abalone:say("yb","","전복이오. 이 거센 물결 속에서도 바위를 놓지 않는구려.","생물 기록은 생물 기록대로, 섬의 주인을 밝힐 문서는 문서대로. 이 둘은 섞지 맙시다."),
  seaweed:say("nh","","미역일세. 온갖 바다 생물이 먹고 또 숨는 터전이지.","허나 누가 미역을 뜯었느냐로 섬 주인이 정해지지는 않네. 그건 나라의 문서로 따질 일이야."),
  cod:say("yi","","대구여! 겨울이면 여기가 아주 그득해진당께."),
  spindle:say("cp","식생 기록","독도 사철나무입니다. 겨울에도 푸른 잎을 지키며 강한 바닷바람을 견딥니다."),
  blackporgy:say("yi","그물을 걷으며","흑돔이구먼! 암초가 많은 바다라 숨을 데도 먹을 것도 넉넉하당께."),
  egret:say("nh","바위를 바라보며","황로일세. 먼 길을 오가다 이 섬에서 날개를 쉬어 가는 손님이지."),
  petrel:say("yb","수평선을 보며","바다제비요. 저 작은 날개로 먼바다를 건너와 이 바위틈에 깃드는구려."),
  bluedamselfish:say("cp","수온 기록","파랑돔입니다. 따뜻한 해류가 독도 바다까지 이어져 있다는 뜻입니다."),
  aster:say("nh","미소","해국이 바위틈에 피었네. 흙도 적고 바람도 센데 기어이 뿌리를 내렸어."),
  ghosttunicate:say("cp","수중 기록","유령멍게 군체입니다. 반투명한 몸으로 암반에 붙어 바닷물을 걸러 먹습니다."),
  stonecrop:say("yb","절벽을 올려다보며","섬기린초요. 저 노란 꽃도 이 섬에서 사철을 견디며 사는 주인이오."),
  fancoral:say("cp","심해 기록","부채뿔산호입니다. 깊은 바다의 여러 생물에게 숨을 곳과 먹이터를 만들어 줍니다."),
  pinkshrimp:say("yi","놀라며","도화새우여! 꽃처럼 붉은 놈이 이 깊은 물속에 살고 있었구먼."),
  methane:sq(say("me","바닷속을 내려다보며","어? 저기 이상한 게 보여요. 바닥에서 얼음처럼 반짝여요!"),say("cp","해저 분석","메탄 하이드레이트입니다. 차갑고 압력이 높은 깊은 바다에서 만들어지는 얼음 같은 해저 자원입니다."))
}[cr]||[]);

function checkDokdoDone(){
  if(DOKDO_TARGETS.every(c=>G.caught.includes(c)) && !G.flags.dokdoDone){
    G.flags.dokdoDone=1;
    G.lastMode="field";
    G.pending=()=>{ prepareVoyage(2); };
    play(sq(nar(`생태 조사 완료! 조사 점수 ${DOKDO_SCORE.score.toLocaleString()}점 · 최고 연속 명중 ${DOKDO_SCORE.best}번`),SC.strange_ship()));
  }
}

/* ==========================================================
   논박 (일본 관청)
   ========================================================== */
const CLAIMS=[
  {say:"그대들이 말하는 그 섬은 우리가 다케시마라 부르는 곳이오. 조선의 옛 문서에 그런 섬이 두 개나 적혀 있단 말이오?",
   need:"sejong", ok:"…과연. 1454년 《세종실록》 〈지리지〉라. 우산도와 무릉도, 두 섬 이름이 분명히 적혀 있군.",
   no:"이것으로는 어림도 없소. 조선 조정이 손수 만든 옛 문서부터 내미시오."},
  {say:"이름을 적어 두었다 한들, 그 섬이 어디 있는지 안다는 뜻은 아니오. 조선의 지도에 두 섬이 함께 그려져 있소?",
   need:"paldo", ok:"…과연. 1531년 〈팔도총도〉로군. 동해에 두 섬을 나란히 그려 두었어.",
   no:"이것으로는 어림도 없소. 두 섬의 자리가 함께 그려진 지도를 내미시오."},
  {say:"자산도라 하였소? 조선 사람이 눈으로 본 적조차 없는 먼 바위가 아니오?",
   need:"sight", ok:"…과연. 맑은 날이면 울릉도에서 보인다고. 눈이 닿는 거리라는 말이군.",
   no:"이것으로는 어림도 없소. 보지도 못한 섬을 어찌 제 땅이라 하겠소."},
  {say:"조선은 그 섬에 사람이 살지 못하게 하지 않았소? 스스로 버린 섬이 아니오?",
   need:"suto", ok:"…과연. 백성은 뭍으로 돌려보내면서도 1694년에 장한상이라는 관원을 보내 섬을 직접 살폈군. 사람을 못 살게 한 것과 땅을 버린 것은 다른 일이라, 이 말이오?",
   no:"이것으로는 어림도 없소. 백성이 오갔다는 이야기 말고, 조선 조정이 직접 섬을 살피고 관리한 기록을 내놓으시오.",
   wrong:{life:"어부들이 다녀갔다는 종이가 아니오. 그건 백성의 발자취일 뿐, 나라가 관리했다는 증거는 되지 못하오. 관원을 보낸 기록을 찾아오시오."}},
  {say:"우리 어부들은 그저 지나가다 잠시 들렀을 뿐이오. 그것이 무슨 죄란 말이오?",
   need:"trace", ok:"…과연. 베어 낸 나무와 걷다 만 그물이라. 지나간 것이 아니라 머물러 일을 한 흔적이군. 다만 섬의 주인이 누구냐는 문서로 따질 일이오.",
   no:"이것으로는 어림도 없소. 증거도 없이 남을 탓할 수는 없는 법이오."}
];
let DB=null;
function startDebate(){
  DB={i:0,hp:3,used:[],feedback:null};
  G.mode="debate"; ui();
  $("#debate").classList.remove("hide");
  renderDebate();
}
function drawDebateFace(canvas,id,mood,text){
  if(!canvas)return;const x=canvas.getContext("2d"),spec=PORTRAIT_SPRITES[id],im=spec&&SPRITE_IMAGES[spec[0]];
  x.clearRect(0,0,canvas.width,canvas.height);x.fillStyle="#10232f";x.fillRect(0,0,canvas.width,canvas.height);x.imageSmoothingEnabled=true;
  if(!spec||!im||!im.complete||!im.naturalWidth){if(im)im.addEventListener("load",()=>drawDebateFace(canvas,id,mood,text),{once:true});return;}
  const sw=im.naturalWidth/3,sh=im.naturalHeight/3,col=portraitColumn(id,mood,text),row=spec[1];
  x.drawImage(im,col*sw,row*sh,sw,sh,0,0,canvas.width,canvas.height);
}
function renderDebate(){
  const c=CLAIMS[DB.i],el=$("#debate"),fb=DB.feedback;
  const cards=G.evidence.map(id=>{
    const e=DEX[id];
    const visual=EVIDENCE_SPRITES[id]?evidenceHTML(id,"evidence-card"):`<div class="n" style="font-size:32px">${e.em}</div>`;
    const used=DB.used.includes(id);
    return `<button class="ecard ${used?"used":""}" data-id="${id}" ${used||fb?"disabled":""}>${visual}${e.kind?`<span class="etype">${esc(e.kind)}</span>`:""}<div class="n">${e.n}</div><div class="d">${e.d}</div></button>`;
  }).join("");
  const reply=fb
    ? `<div class="debate-reply ${fb.correct?"good":"bad"}" id="dbm"><b>【오키섬 관리】</b> ${fb.text}</div><button class="btn debate-next ${fb.correct?"":"red"}" id="db-next">${fb.correct?(DB.i===CLAIMS.length-1?"문서 작성 계속":"다음 질문"):fb.restart?"근거를 처음부터 정리":"다른 근거 고르기"}</button>`
    : `<div class="debate-reply" id="dbm"><b>【${esc(G.name)}】</b> 도감에서 이 질문에 가장 알맞은 근거를 골라 내미세요.</div>`;
  el.innerHTML=`
  <div class="dh"><h2>오키섬 성 안 · 근거 논박</h2>
    <div class="sub">관리의 말에 맞는 자료를 내미시오 <span class="hp">${
      [0,1,2].map(i=>`<i class="${i<DB.hp?"":"off"}"></i>`).join("")}</span></div></div>
  <div class="claim">
    <div class="debate-stage">
      <div class="debater player"><canvas class="debate-face" id="debate-player-face" width="360" height="360"></canvas><b>${esc(G.name)}</b><span>도감에서 근거를 찾는 중</span></div>
      <div class="debate-center"><div class="bubble"><span class="who">오 키 섬 관 리 · 질 문 ${DB.i+1}/${CLAIMS.length}</span>“${c.say}”</div>${reply}</div>
      <div class="debater official"><canvas class="debate-face" id="debate-official-face" width="360" height="360"></canvas><b>오키섬 관리</b><span>${fb?(fb.correct?"근거를 인정함":"근거를 반박함"):"문서를 심문 중"}</span></div>
    </div>
    <div class="evidence-ledger"><h3>근거 모음 · 자료의 성격과 힘을 따져 선택하시오</h3><div class="cards">${cards}</div></div>
  </div>`;
  drawDebateFace($("#debate-player-face"),"me",fb?(fb.correct?"기록을 내민다":"걱정"):"근거를 고르며",fb?.text||c.say);
  drawDebateFace($("#debate-official-face"),"ok",fb?(fb.correct?"붓을 멈추고 기록":"근거를 따지며"):"근거를 묻는다",fb?.text||c.say);
  el.querySelectorAll(".ecard").forEach(b=>{
    b.onclick=()=>pickEvidence(b.dataset.id);
  });
  const next=$("#db-next");if(next)next.onclick=continueDebate;
  el.scrollTop=0;
}
function pickEvidence(id){
  if(DB.feedback)return;const c=CLAIMS[DB.i];
  if(id===c.need){
    DB.used.push(id);DB.feedback={correct:true,text:c.ok,restart:false};renderDebate();showDebateZoom(id,c.ok,DB.i===CLAIMS.length-1);
  }else{
    DB.hp--; doShake();
    DB.feedback={correct:false,text:(c.wrong&&c.wrong[id])||c.no,restart:DB.hp<=0};renderDebate();
  }
}
let dzTyping=null;
function showDebateZoom(id,text,last){
  const old=$("#debate-zoom");if(old)old.remove();
  const x=EXHIBITS[id]||{n:(DEX[id]&&DEX[id].n)||"",year:"",kind:(DEX[id]&&DEX[id].kind)||"",point:(DEX[id]&&DEX[id].d)||""};
  const el=document.createElement("div");el.id="debate-zoom";
  el.innerHTML=`<div class="ex-card dz-card"><div class="ex-visual">${exhibitVisual(id)}</div>
      <div class="ex-text"><span class="ex-count">제 시 한 근 거 · 질 문 ${DB.i+1} / ${CLAIMS.length}</span><h2 class="ex-title">${esc(x.n)}</h2>
      <div class="ex-tags">${x.year?`<span>${esc(x.year)}</span>`:""}<span class="kind">${esc(x.kind||"")}</span></div><p class="ex-point">${esc(x.point||"")}</p></div>
      <div class="ex-seal dz-seal">認<br>定</div></div>
    <div class="dz-talk"><canvas class="dz-face" width="240" height="240"></canvas>
      <div class="dz-body"><span class="dname">오키섬 관리 <span class="mood">(붓을 멈추고 문서를 들여다본다)</span></span><div class="dz-line" id="dz-line"></div></div>
      <button class="btn red dz-next" id="dz-next">${last?"문서 작성 계속":"다음 질문"}</button></div>`;
  $("#debate").appendChild(el);
  drawDebateFace(el.querySelector(".dz-face"),"ok","붓을 멈추고 기록",text);
  const line=$("#dz-line");let i=0;clearInterval(dzTyping);
  dzTyping=setInterval(()=>{line.textContent="“"+text.slice(0,++i)+(i>=text.length?"”":"");if(i>=text.length)clearInterval(dzTyping);},26);
  const go=e=>{if(e)e.stopPropagation();if(i<text.length){clearInterval(dzTyping);i=text.length;line.textContent="“"+text+"”";return;}clearInterval(dzTyping);el.remove();continueDebate();};
  $("#dz-next").onclick=go;el.onclick=e=>{if(i<text.length)go(e);};
}
function continueDebate(){
  const fb=DB&&DB.feedback;if(!fb)return;
  if(fb.correct){
    DB.i++;
    if(DB.i>=CLAIMS.length){
      $("#debate").classList.add("hide");G.lastMode="field";G.pending=()=>{G.mode="field";ui();};play(SC.debate_win());return;
    }
  }else if(fb.restart){DB.hp=3;DB.i=0;DB.used=[];}
  DB.feedback=null;renderDebate();
}

/* ==========================================================
   시나리오
   ========================================================== */
const SC={};

/* --- 오프닝 --- */
SC.fieldtrip_start=()=>sq(
  nar("오늘의 현장체험학습 장소는 부산 수영사적공원이다. 선생님과 친구들, 관광객들이 공원 곳곳을 둘러보고 있다."),
  say("tch","출석표를 확인하며","{name} 학생, 왔군요! 오늘은 이 공원에서 부산을 지킨 사람들의 이야기를 찾아볼 거예요.","친구들이랑 관광객에게도 말을 걸어 보고, 공원 오른쪽 위에 있는 안용복 충혼탑까지 꼭 가 보세요."),
  say("stg","손을 흔들며","{name}! 저기 오른쪽 위에 손을 번쩍 든 동상이 있대. 같이 가 볼래?"),
  run(()=>{quest("공원 오른쪽 위의 안용복 충혼탑을 찾아가 말을 걸어 보시오");})
);
SC.opening=()=>sq(
  nar("안용복 충혼탑 앞. 높이 든 오른손과 굳게 선 모습이 햇빛 아래 길게 그림자를 드리운다."),
  say("me","동상을 올려다보며","안용복… 혼자 일본까지 건너가서 독도가 우리 땅이라고 말한 사람이랬지?","그런데 어떻게 혼자 바다를 건너가서 독도가 우리 땅이라고 말할 수 있었지?"),
  nar("그때 충혼탑 기단의 ‘安龍福忠魂塔’ 글자 아래에서 낡은 나침반 하나가 푸른빛을 낸다."),
  say("cp","처음 깨어나며","{name}. 이름을 확인했습니다.","나는 시간 나침반. 기록이 남아 있는 곳이라면 어디든 길을 열 수 있습니다."),
  say("me","놀라며","어…? 나침반이 말을 해! 내 이름은 또 어떻게 알아?"),
  say("cp","","이 탑에는 안용복의 기억이 남아 있습니다. 1696년, 그가 바다를 건너던 그날로 가 보시겠습니까?"),
  say("cp","시간문 전개","{name} 대원, 1696년 부산포로 이동합니다.","방향키로 걷고, 사람 앞에서 ‘말걸기’를 눌러 그날의 기록을 모으십시오."),
  {k:"timewarp"},
  run(()=>{ G.flags.statueSeen=true;resetEntities(); enterMap("busan",5,8,"r"); quest("부두 끝의 사내에게 말을 걸어 보시오"); })
);

SC.field_teacher=()=>say("tch","","{name} 학생, 충혼탑 앞에 있는 비문도 천천히 읽어 보세요.","눈으로 본 것을 자기 말로 적어 두는 게 현장체험학습의 진짜 공부예요.");
SC.field_student_b=()=>say("stb","","{name}, 저 동상 오른손에 뭔가 들고 있는 것 같지 않아?","혹시 일본에 가서 내밀었다는 그 문서 아닐까?");
SC.field_student_g=()=>say("stg","","나는 수영사적공원에 이런 탑이 있는 줄 오늘 처음 알았어.","{name}은 안용복 이야기 알고 있었어?");
SC.field_student_b2=()=>say("stb","카메라를 들며","선생님이 충혼탑 전체가 다 나오게 찍으래.","{name}, 이따가 우리 모둠 기록지에 같이 붙이자!");
SC.field_student_g2=()=>say("stg","공원 지도를 보며","여기 수영성 흔적이랑 기념물이 여러 개 있대.","충혼탑은 오른쪽 위쪽 길로 쭉 올라가면 나온다고 적혀 있어!");
SC.field_tourist1=()=>say("tour1","사진을 확인하며","사진만 찍으러 왔는데, 사연을 알고 보니 동상 표정이 달라 보이는군요.","벼슬도 없는 백성이 바다를 건너가 제 나라 땅 이야기를 하고 왔다니 말입니다.");
SC.field_tourist2=()=>say("tour2","미소 지으며","학생들이 체험학습을 왔구나.","{name} 학생은 저 사람이 왜 목숨까지 걸고 바다를 건넜을지 한번 생각해 보렴.");
SC.field_guide=()=>say("guide","설명판을 가리키며","여기가 부산 수영사적공원입니다.","안용복은 바로 이 부산에서 배를 띄워 울릉도와 독도의 일을 세상에 알렸지요. 그 뜻을 기억하려고 세운 탑입니다.");

/* --- 안용복 첫 만남 --- */
function joinedCrewCount(){return (G.flags.nhJoined?1:0)+(G.flags.yiJoined?1:0);}
function updateCompanionQuest(){
  const n=joinedCrewCount(),yb=(ENT.busan||[]).find(e=>e.id==="yb");if(yb)yb.talk="yb_ready";
  quest(n>=2?"뇌헌 스님과 유일부가 합류했습니다. 안용복에게 돌아가시오":`뇌헌 스님과 유일부를 찾아 말을 거시오 (${n}/2)`);
}
SC.yb_first=()=>sq(
  nar("부두 끝. 한 사내가 이마의 땀을 훔치며 낡은 배에 짐을 싣고 있다."),
  say("me","조심스럽게","저기… 안녕하세요. 저는 {name}이라고 해요."),
  say("yb","짐을 내려놓고 돌아본다","오, 놀랐소. 나는 안용복이오. 여기 동래 사람이지."),
  say("yb","위아래를 훑어보며","한데 그 옷차림은 뭐요? 왜인 옷도 아니고 조선 옷도 아니고…","대체 어디서 온 아이요?"),
  ask([
    {t:"“먼 미래에서 왔어요.”",then:say("yb","픽 웃는다","미래? 허허, 별 재미난 소리를 다 듣는구려.","거짓말을 하려거든 좀 더 그럴듯하게 하시오.")},
    {t:"“바다 건너에서 왔어요.”",then:say("yb","눈이 커진다","바다 건너라…","그러고 보니 그 말이 차라리 그럴듯하구려.")},
    {t:"“…저도 잘 모르겠어요.”",then:say("yb","","길을 잃었구려. 사람이 살다 보면 그런 날도 있는 법이오.","여기 앉아 숨이나 좀 돌리시오.")}
  ]),
  got("yb"),
  rec("안용복 — 동래(오늘의 부산) 출신. 왜관을 드나들어 일본말을 할 줄 알았고, 벼슬 없는 백성이었다."),
  say("me","배에 실린 짐을 보며","그런데 아저씨, 짐이 엄청 많네요. 어디 멀리 가세요?"),
  say("yb","손을 멈춘다","…멀리 가오. 아주 멀리.","삼 년 전에 시작된 일을 아직 끝내지 못했거든."),
  say("me","","삼 년 전에 무슨 일이 있었는데요?"),
  say("yb","먼바다를 보며","…들려주리다. 눈을 감아도 어제 일처럼 훤한 이야기요."),
  run(()=>setGameClock(1693,6,18,14,0)),
  {k:"memory",show:true,title:"1693년 울릉도 · 박어둔과 안용복의 기억"},
  nar("1693년 울릉도. 조선 어민들의 배가 흩어져 고기를 잡던 아침, 낯선 배 두 척이 해안으로 다가온다."),
  say("pd","떨리는 목소리로","형님, 저 배… 왜인들이에요.","우리 배는 다 흩어졌는데 저쪽은 크고 사람도 많아요. 어쩌죠?"),
  say("yb","앞으로 나서며","어쩌긴 뭘 어째. 여긴 우리 바다요. 우리가 물러날 까닭이 없소."),
  say("jf","호통","여기는 다케시마다! 우리는 허가를 받고 온 사람들이다!","조선 배는 당장 물러가라!"),
  say("yb","노기","허가라니, 그건 그대들 관청이 그대들에게 내준 종이 한 장일 뿐이오!","여기는 다케시마가 아니라 울릉도요. 조선 강원도 땅이란 말이오!"),
  nar("말이 통하지 않자 일본 어부들이 두 사람을 제 배로 끌어올린다."),
  say("pd","끌려가며","형님! 형님―!"),
  got("pd"),
  rec("1693년, 조선 동남해안 어민들이 선단을 꾸려 울릉도에 갔다가 일본 어민들과 마주쳤고, 안용복과 박어둔이 일본으로 끌려갔다. 안용복은 그곳에서도 울릉도가 조선 땅임을 주장했다."),
  {k:"memory",show:false},
  got("life"),
  run(()=>{ if(!G.evidence.includes("life"))G.evidence.push("life"); }),
  say("cp","근거 기록","1693년 울릉도의 일을 도감에 저장했습니다. 아직은 힘이 약한 근거입니다."),
  run(()=>setGameClock(1696,4,18,10,0)),
  say("yb","","{name}, 마침 잘 만났소. 이번 뱃길에 사람이 하나 더 필요했거든.","눈 밝고 입 무거운 사람 말이오."),
  say("yb","동쪽 바다를 가리키며","여기서 사흘을 가면 울릉도요. 그 곁 바다엔 자산도라는 섬이 하나 더 있소."),
  say("yb","일부러 목소리를 높이며","그 바다엔 가제가 바위를 통째로 덮고, 오징어가 그물을 찢을 만큼 몰려든다오!","전복이며 미역이며, 빈손으로 돌아올 일은 없을 게요!"),
  say("me","의아해하며","어…? 그러니까 고기 잡아서 돈 벌러 가는 거예요?"),
  say("yb","주위를 살핀 뒤 목소리를 낮춘다","쉿. 사람을 모으려면 그런 말이 먼저 귀에 들어오는 법이오.","물론 그 바다가 정말 풍요로운 것도 사실이고."),
  say("yb","굳은 표정","허나 내가 가려는 진짜 까닭은 삼 년 전 그 일이오.","왜선이 아직도 울릉도와 자산도에 드나드는지, 이 두 눈으로 봐야겠소."),
  say("yb","짐에서 지도와 종이, 붓을 꺼내 보이며","그래서 지도도 챙기고 종이와 붓도 챙겼소.","적어 두지 않으면, 있었던 일도 없던 일이 되고 마니까."),
  say("me","","적어 두면 뭐가 달라지는데요?"),
  say("yb","","달라지오. 내 입에서 나온 말은 바람에 흩어져도, 종이에 남은 말은 삼 년이 지나도 그대로요.","필요하다면 일본 관청까지 찾아가, 두 섬이 조선 땅임을 밝히겠소."),
  say("me","","그럼… 해산물은요?"),
  say("yb","옅게 웃으며","바다를 살피는 길에 물고기까지 얻는다면야 그거야 좋은 일이지.","허나 순서가 있소. 먼저 확인하고, 먼저 따진다. 돈벌이는 그다음이오."),
  say("yb","손을 내밀며","{name}, 그래도 나와 함께 가겠소?"),
  ask([
    {t:"“그런 일이라면 저도 갈래요.”",then:say("yb","힘 있게 고개를 끄덕인다","좋소, {name}! 그럼 우리가 본 것은 하나도 빼놓지 말고 적읍시다.")},
    {t:"“진짜 일본 관청까지 갈 생각이에요?”",then:say("yb","단호","일이 그리 된다면 피하지 않겠소.","벼슬 없는 백성이라고 제 나라 땅 이야기를 못 할 까닭이 어디 있소.")},
    {t:"“왜 하필 저를 데려가려고요?”",then:say("yb","","본 사람이 많아야 하오.","나 혼자 봤다 하면 우기는 것이 되지만, 둘이 봤다 하면 그건 사실이 되오.")}
  ]),
  say("yb","부두를 가리키며","허나 나 혼자로는 안 되오. 뇌헌 스님과 사공 유일부, 두 사람을 데려와야 하오.","해물이 많다는 말만 하지 말고, 내 진짜 뜻까지 그대로 전한 뒤에 함께 오시오."),
  run(()=>{G.flags.ybMet=1;updateCompanionQuest();})
);

SC.yb_ready=()=>{
  if(joinedCrewCount()<2)return say("yb","","아직 두 사람의 대답을 듣지 못했소.","부두를 한 바퀴 돌며 뇌헌 스님과 유일부에게 직접 말을 걸어 주시오.");
  return sq(
    say("yb","두 사람 앞에 조선팔도지도를 펼치며","좋소, {name}. 이제 다들 이 뱃길의 참뜻을 알겠구려."),
    say("yb","지도에서 울릉도와 자산도를 짚으며","할 일은 셋이오. 왜선이 드나드는지 확인하고, 섬과 바다를 낱낱이 기록하고, 마주치면 물러서지 않고 따진다.","물고기와 해초를 살피는 일은 그 길에 덤으로 얻는 것이고."),
    say("nh","합장하며","해물이 풍성하다는 말에 먼저 귀가 솔깃했던 건 사실이네.","허나 남의 침범을 밝히러 가는 길이라면, 더더욱 따라나서야지."),
    say("yi","밧줄을 단단히 조이며","돈벌이 배라믄 이만한 위험을 무릅쓸 까닭이 없제.","항로하고 왜선 움직임은 내가 눈 부릅뜨고 보겄소."),
    say("yb","","그럼 물과 식량, 지도와 종이·붓까지 빠짐없이 싣고 떠납시다."),
    say("cp","항해 임무","① 왜선 침범 확인  ② 섬과 바다 기록  ③ 독도 생태 조사"),
    say("cp","항해 안내","방향키로 침로를 정하면 키에서 손을 떼어도 배가 나아갑니다.","암초나 돌풍이 보이면 ‘돛 조절’을 눌러 속도를 낮추십시오."),
    say("yb","뱃머리에서","{name}, 우리가 본 것은 반드시 기록으로 남깁시다. 자, 갑시다!"),
    run(()=>{G.pending=()=>prepareVoyage(0);})
  );
};

/* --- 잡담 --- */
SC.chat_np1=()=>say("np","","왜관에 왜인들이 또 한 무리 들어왔다더구먼.","요새 바다가 어째 영 시끄러워.");
SC.chat_hj=()=>say("hj","수군거리며","울릉도 미역이 그렇게 좋다더구먼.","작년엔 배가 못 갔다지. 헌데 올해는 누가 간다는 소문이 있어.");
SC.chat_yi=()=>{
  if(!G.flags.ybMet)return say("yi","","지금은 배에 실을 밧줄 고르는 중이여.","할 말이 있거들랑 부두 끝의 안용복한테 먼저 가 보쇼.");
  if(G.flags.yiJoined)return say("yi","","동해는 파도가 짧고 높아. 남해랑은 아주 딴판이여.","왜선 항로까지 살피려면 정신 바짝 차려야 혀. 자, 용복 형님한테 갑시다.");
  return sq(
    say("me","","아저씨, 이번 뱃길은 고기잡이가 아니에요.","우리 섬에 왜선이 들어오는지 보고, 그걸 적어서 따지러 가는 거예요."),
    say("yi","표정이 굳어지며","…그럴 줄 알았구먼. 용복 형님이 지도까지 챙기길래 이상하다 했제."),
    say("yi","밧줄을 움켜쥐며","그라믄 사공이 있어야제. 키는 내가 잡으리다. 같이 갑시다!"),
    got("yi"),run(()=>{G.flags.yiJoined=1;updateCompanionQuest();})
  );
};
SC.chat_nh=()=>{
  if(!G.flags.ybMet)return say("nh","","바람은 사람 말을 듣지 않네.","저 부두 끝의 사내가 무슨 일을 벌이려는지 먼저 들어 보게.");
  if(G.flags.nhJoined)return say("nh","","마음은 정했네. 안용복에게 돌아가게.","바람을 읽고 기록을 지키는 일은 내가 맡겠네.");
  return sq(
    say("nh","안용복 쪽을 바라보며","해물이 많다기에 솔깃했던 건 사실이네.","헌데 그 사람 눈빛은 장사꾼의 눈빛이 아니더군."),
    say("me","","왜선이 울릉도랑 자산도에 들어왔는지 보러 가는 거예요.","그리고 본 걸 전부 적어서 따지려고요."),
    say("nh","눈을 감았다 뜨며","…역시. 안용복에게 그런 뜻이 있었군.","그렇다면 나도 가겠네. 기록은 내가 지키지."),
    got("nh"),run(()=>{G.flags.nhJoined=1;updateCompanionQuest();})
  );
};
SC.chat_yb_dokdo=()=>say("yb","","여기 있는 것들을 눈에 꼭 담아 두시오.","본 사람이 있어야 기록도 남는 법이오.");
SC.chat_nh_dokdo=()=>say("nh","","여섯일세. 여섯을 다 담아야 도감이 찬다네.");
SC.chat_yb_oki=()=>say("yb","","저 관리에게 말을 붙여야 하오.","맨손으로 가지 마시오. 자료를 손에 쥐고 가시오.");
SC.chat_jv_oki_1=()=>say("jv","놀라며","조선 사람이 오키섬 성하길에 나타나다니!","바다 건너에서 곧장 관청을 찾아온 사람들이라니, 이런 일은 처음이오.");
SC.chat_jv_oki_2=()=>say("jv","수군거리며","조선에서 온 이들이라더군.","울릉도와 자산도 일로 성 안 관리에게 따지러 왔다는 소문이 벌써 퍼졌소.");
SC.chat_jk_oki=()=>say("jk","문서함을 지키며","여기는 성 안 관청의 문서 접수처요.","섬에 관한 이야기는 접견실 관리 앞에서 근거와 함께 밝히시오.");
SC.chat_jg_oki=()=>say("jg","엄숙하게","여기는 오키섬 성 안이오. 관청 안에서 소란은 용납되지 않소.","관리께서는 금빛 병풍 앞에 계시오.");
SC.chat_nh_oki=()=>say("nh","","말이 통하지 않는 곳에서 기어이 말로 싸우려는 사람일세.","곁에 꼭 붙어 있게.");
SC.chat_yi_oki=()=>say("yi","작게","성 밖에서 볼 때도 컸는디, 안은 아주 미로 같구먼.","{name}, 저 관리 얼굴 똑바로 보고 침착하게 근거를 고르쇼.");
SC.chat_busan_x1=()=>nar("갓 쓴 상인이 소금 가마니를 두드리며 값을 흥정하고 있다. “왜관 쪽 배가 들어오면 값이 또 뛰겠구먼.”");
SC.chat_busan_x2=()=>nar("짐꾼이 어깨에 멘 새끼줄을 고쳐 매며 부두 끝을 턱으로 가리킨다. “저 끝에서 배 손보는 양반이 안용복이오.”");
SC.chat_busan_x3=()=>nar("뱃사람이 바람 냄새를 맡는다. “이런 날엔 동쪽으로 나가는 배가 많지. 물통은 넉넉히 채우는 게 좋소.”");
SC.chat_oki_guard=()=>nar("창을 든 병사가 조선 옷차림의 일행을 한참 훑어보더니, 말없이 턱으로 성문을 가리킨다.");
SC.chat_oki_clerk2=()=>nar("두루마리를 든 서기가 붓끝을 적시며 일행을 곁눈질한다. 오늘 오간 말이 모두 적힐 모양이다.");
SC.chat_oki_clerk3=()=>nar("관복 차림의 관리가 낮게 헛기침을 한다. “접견은 금빛 병풍 앞에서 하시오.”");
SC.chat_dongnae_guard=()=>nar("성문을 지키는 군졸이 창을 곧게 세운다. “사또의 명이 있기 전에는 아무도 들이지 않소.”");
SC.chat_dongnae_off=()=>nar("푸른 옷의 군관이 붉은 옷의 관원 쪽을 흘끗 본다. “저분께 먼저 말씀드리시오.”");
SC.chat_yb_trial=()=>say("yb","조용히","괜찮소. 법을 어겼다면 벌은 달게 받겠소.","허나 내가 한 말은 한 마디도 거두지 않겠소.");
SC.chat_nh_trial=()=>say("nh","미소","버텨 봐야 소용없네, {name}.","관원 나리께서는 이미 내 말을 믿으셨어.");
SC.chat_yi_trial=()=>say("yi","낮게","스님이 그럴 줄은 꿈에도 몰랐구먼…","{name}, 우리가 바다에서 본 걸 빠짐없이 보여 주시오. 기록이 대신 말해 줄 것이오.");

/* --- 동해안 중간 기항지 --- */
SC.port_ulsan=()=>sq(
  nar("울산 개운포 앞바다. 항구의 어민이 밧줄을 받아 배를 단단히 매어 준다."),
  say("ul","반갑게","{name} 대원, 여기가 울산 개운포라예.","소금이랑 곡물 싣는 포구니까, 물하고 식량부터 채워 가이소."),
  say("ul","바다를 가리키며","여기가 동해 용왕하고 처용 이야기가 전해 오는 바다라예.","파도 잔잔해질 때 떠나이소. 서두르면 손해라예."),
  say("cp","지역 기록","울산 개운포를 항로도에 표시했습니다.")
);
SC.port_gyeongju=()=>sq(
  nar("경주 감포 앞바다. 대왕암 쪽을 바라보던 이야기꾼이 뱃줄을 받아 주고 손짓한다."),
  say("gj","대왕암을 가리키며","{name} 대원, 여기는 경주 감포항입니다.","저 바위 보이지예? 문무왕이 돌아가신 뒤 동해 용이 되어 나라를 지킨다 카는 대왕암이라예."),
  say("gj","대나무 피리 모양 패를 보이며","이견대 대나무로 만든 만파식적은 온갖 파도를 잠재웠다 카데예.","물하고 식량 넉넉히 채우고, 바다 이야기도 하나 적어 가이소."),
  say("cp","지역 기록","경주 감포와 대왕암을 항로도에 표시했습니다.")
);
SC.port_pohang=()=>sq(
  nar("육지 안쪽으로 깊게 들어온 영일만. 말린 생선과 물통을 든 상인이 배로 다가온다."),
  say("ph","힘차게","잘 왔니더, {name}! 여기는 포항 영일만입니다.","먼바다 나가기 전에 물하고 먹을거리 단디 챙기고, 바람도 한 번 살펴보고 가이소."),
  say("ph","생선 바구니를 들며","남쪽 감포 바다에는 대왕암하고 만파식적 전설도 있다 아입니꺼.","이 동해가 품은 이야기가 한둘이 아이라예."),
  say("cp","지역 기록","포항 영일만을 항로도에 표시했습니다.")
);
SC.port_uljin=()=>sq(
  nar("울진 연안. 노를 든 늙은 뱃사공이 하늘과 먼바다를 번갈아 살핀다."),
  say("uj","구름을 보며","왔니껴, {name} 대원? 여기가 울진항이시더.","여서 울릉도 갈라 카믄 육지가 안 보일 만치 멀리 나가야 되니더. 구름하고 물빛을 꼭 보시더."),
  say("uj","노를 세우며","맑을 때 떠나고, 파도가 짧아지믄 항구로 돌아온다.","이 바다에서 오래 사는 법은 그거 하나뿐이니더."),
  say("cp","지역 기록","울진 연안의 바람과 울릉도 방향을 기록했습니다.")
);
SC.port_gangneung=()=>sq(
  nar("강릉 앞바다. 접어 둔 항로 지도를 든 객주가 산줄기 쪽을 가리킨다."),
  say("gn","정답게","어서 오우야, {name}. 여기가 강릉항이래요.","저 산줄기하고 밤별을 같이 보고 울릉도 가는 길을 가늠해 보우야."),
  say("gn","지도를 펴며","울릉도랑 자산도는 여기 강원도 바다에 함께 딸린 섬이래요.","물이랑 식량도 넉넉히 챙겨 가우야."),
  say("cp","지역 기록","강릉항을 항로도에 표시했습니다.")
);

SC.port_inn=()=>{
  const p=PORTS[SEA.lastDock];return sq(
    say("inn","반갑게 맞으며",`어서 오세요, {name} 대원. 여기는 ${p.short} 주막이에요.`,`먼바다 바람을 맞았는지 얼굴이 많이 상했네요. 따뜻한 밥과 잠자리를 봐 둘 테니, 하룻밤 묵고 가시겠어요?`),
    ask([
      {t:"묵고 간다",then:sq(say("inn","등잔을 낮추며","푹 주무세요. 날이 밝으면 물이랑 먹을거리도 조금 챙겨 드릴게요."),run(sleepAtInn))},
      {t:"묵지 않고 나온다",then:say("inn","고개를 끄덕이며","그러면 바람이 거세지기 전에 필요한 것만 얼른 챙겨 가세요.")}
    ])
  );
};
SC.port_yard=()=>{
  const p=PORTS[SEA.lastDock];return sq(
    say("yard","나무망치를 들며",`오셨소, {name} 대원. 여기는 ${p.short} 배 정비소요.`,`널빤지랑 밧줄을 보아하니 손볼 데가 여럿이구려. 배를 좀 고쳐 보시겠소?`),
    ask([
      {t:"고친다",then:sq(say("yard","선체를 두드리며","갈라진 틈을 메우고 밧줄도 새로 조이겠소. 세 시간이면 말끔해질 거요."),run(repairAtYard))},
      {t:"고치지 않는다",then:say("yard","도구를 내려놓으며","알겠소. 허나 파도가 높아지기 전에 선체는 자주 살펴보시오.")},
      {t:"출항한다",then:sq(say("yard","바다를 가리키며","이 정비소 앞이 바로 항구요. 돛과 밧줄을 확인했으니 곧장 나가시오."),run(requestDepartureAfterTalk))}
    ])
  );
};

/* --- 항해 중 다른 배와 동해안 전설 --- */
SC.japan_port_forbidden=()=>sq(
  nar("일본 항구 안쪽으로 배를 붙이자 무장한 관리와 항구 사람들이 급히 길을 막는다."),
  say("ok","호통치며","멈춰라! 여기는 함부로 들어올 수 있는 곳이 아니다!","허가 없는 조선 배는 당장 닻을 올리고 물러가라!"),
  say("yb","낮게","{name}, 지금은 문서를 꺼낼 때가 아니오.","괜한 싸움을 만들 것 없소. 조용히 바다로 물러납시다.")
);
SC.japanese_sea=()=>sq(
  nar("물결 너머로 낯선 돛이 하나둘 늘어난다. 울릉도와 자산도 바다에 일본 어선 여러 척이 몰려와 그물을 내리고 있다."),
  say("jc","갑판에서 외치며","이 바다는 고기가 많다! 먼저 그물 놓는 배가 임자다. 비켜라!"),
  say("me","","안용복 아저씨, 일본 배가 우리 쪽으로 들어오고 있어요!"),
  say("yb","뱃전에 서서 호통친다","여기는 조선의 바다요! 남의 바다에 함부로 그물을 놓지 마시오!"),
  say("yb","","{name}, 저 배의 돛무늬와 자리를 적어 두시오.","오늘 적어 둔 한 줄이 훗날 증거가 되오."),
  say("jc","당황하며","…조선 배가 이렇게 가까이 올 줄이야. 오늘은 물러난다!"),
  say("cp","항해 기록","일본 어선 조우를 기록했습니다. 거리를 벌려 항해하십시오.")
);

SC.legend_cheoyong=()=>sq(
  nar("울산 개운포에서 흘러온 듯한 안개가 먼바다의 배를 에워싸고, 파도 위로 춤추는 사람의 형상이 나타난다."),
  say("me","","저게 뭐예요? 안개 속에서 누가 춤을 추고 있어요!"),
  say("nh","합장하며","동해 용왕의 아들 처용일세.","울산 개운포에 용왕과 일곱 아들이 나타났다는 옛이야기가 전해 오지."),
  say("chy","춤을 멈추며","먼바다로 가는구나, {name}.","안개를 걷어 줄 바람의 부적을 하나 주고 가겠다."),
  nar("처용이 손을 펼치자 푸른 바람이 한 바퀴 돌고, 작은 부적 하나를 남긴 채 안개와 함께 사라졌다."),
  got("cheoyongCharm"),
  run(()=>{SEA.wind=Math.atan2(SEA.hy,SEA.hx);SEA.wstr=Math.max(5,SEA.wstr);SEA.hull=Math.min(100,SEA.hull+5);flash("처용의 부적이 안개를 걷고 순풍의 방향을 보여 줍니다.");})
);

SC.legend_daewang=()=>sq(
  nar("경주 감포에서 멀어진 바다 한가운데. 검푸른 물결이 갈라지더니 푸른 비늘의 거대한 용이 솟아오른다."),
  say("me","","저게 뭐예요? 바닷속에서 용이 솟아올랐어요!"),
  say("gj","피리를 내려놓으며","문무왕께서 돌아가신 뒤 동해의 용이 되어 나라를 지킨다는, 대왕암의 호국룡입니다."),
  say("munmu","깊은 물소리로","나라의 바다를 지키러 가는구나, {name}.","거친 파도에도 배가 견디도록 이 비늘을 지니고 가거라."),
  nar("호국룡이 푸른 비늘 하나를 갑판에 내려놓고 대왕암의 파도 속으로 사라졌다."),
  got("dragonScale"),
  run(()=>{SEA.hull=Math.min(100,SEA.hull+25);flash("호국룡의 비늘이 선체를 감싸 선체 내구도가 회복되었습니다.");})
);

SC.legend_manpa=()=>sq(
  nar("육지가 희미해진 동해 한가운데. 구름 사이에서 하늘의 장군이 내려오고, 바다의 용이 신비로운 두 줄기 대나무를 밀어 올린다."),
  say("me","","저 빛나는 대나무는 뭐예요? 바다의 신과 하늘의 신이 같이 나타났어요!"),
  say("nh","놀라며","문무왕의 용과, 하늘의 신이 된 김유신 장군이 신문왕에게 주었다는 바로 그 대나무일세."),
  say("yushin","","{name}, 이 대나무로 피리를 만들어 불면 온갖 파도가 잠잠해지고 나라의 근심이 물러난다 하였다."),
  say("munmu","","그 피리의 이름이 만파식적. ‘온갖 파도를 잠재우는 피리’라는 뜻이니라."),
  nar("두 신이 신비로운 대나무를 선물하고 빛 속으로 사라졌다. 시간 나침반이 대나무의 울림을 기록한다."),
  got("bambooGift"),
  say("cp","울림 분석","신비로운 대나무의 소리를 만파식적의 울림으로 변환합니다. 주변 돌풍이 잦아듭니다."),
  got("manpaGift"),
  run(()=>{SEA.hazards=SEA.hazards.filter(h=>h.type!=="storm");SEA.wind=Math.atan2(SEA.hy,SEA.hx);SEA.wstr=6;SUPPLY.water=Math.min(SUPPLY.maxWater,SUPPLY.water+8);SUPPLY.food=Math.min(SUPPLY.maxFood,SUPPLY.food+5);flash("만파식적의 울림이 파도를 잠재우고 식수 8 · 식량 5를 되찾았습니다.");})
);

/* --- 항해 도착 --- */
SC.leg_ulleung=()=>sq(
  nar("사흘 만에 뭍이 보인다."),
  say("yi","","뭍이다! 저기 성인봉이여!"),
  say("nh","","울릉도일세. 저 봉우리엔 늘 구름이 걸려 있지."),
  say("yb","손을 들어 동남쪽을 가리키며","{name}, 오늘은 하늘이 유난히 맑구려. 저기를 보시오."),
  {k:"jasan",show:true},
  say("me","","…섬이에요! 저 멀리 섬이 하나 보여요!"),
  say("yb","","자산도요. 여기서 이백 리 남짓."),
  say("yb","","울릉도에서 눈으로 보이는 섬이오.","옛날부터 조선 사람들이 저 섬을 울릉도와 한 짝으로 여겨 왔다는 뜻이지."),
  {k:"jasan",show:false},
  got("sight"),
  rec("울릉도에서 독도까지 약 87km. 맑은 날에는 울릉도 성인봉에서 독도가 육안으로 보인다."),
  run(()=>{ if(!G.evidence.includes("sight"))G.evidence.push("sight"); }),
  say("me","기록을 넘겨보며","그런데요, 조선은 울릉도에 사람이 못 살게 했다면서요?","그럼 섬을 버린 거 아니에요?"),
  say("nh","고개를 젓는다","그것을 쇄환정책이라 하네. 왜구가 자꾸 들이닥쳐 백성이 다치니, 뭍으로 불러들이고 함부로 먼바다에 나가지 못하게 한 것이지."),
  say("yb","단호","사람을 못 살게 한 것과 땅을 버린 것은 전혀 다른 일이오.","조정은 오히려 관원을 보내 섬을 직접 살피게 했소."),
  nar("뇌헌 스님이 책갑 깊숙한 곳에서 1694년에 작성된 울릉도 조사 기록의 베껴 쓴 장계를 꺼낸다."),
  say("nh","기록을 펼치며","안용복이 돌아온 이듬해, 조정은 삼척영장 장한상을 울릉도로 보냈네.","장한상은 섬을 두루 살피고 동쪽 먼바다의 섬까지 적어 두었지."),
  got("suto"),
  run(()=>{ if(!G.evidence.includes("suto"))G.evidence.push("suto"); }),
  rec("1694년 장한상의 울릉도 수토 기록은 조선이 주민의 상시 거주를 금하면서도 관원을 파견해 울릉도를 조사하고 관리했음을 보여 준다. 쇄환은 영토 포기와 같은 뜻이 아니다."),
  say("nh","책갑을 열며","{name}, 일본 관리 앞에서 말만으로 다투어서는 못 이기네.","조선 조정이 오래전부터 두 섬을 적어 둔 자료를 챙겨 왔지."),
  say("yb","낡은 책장을 펼치며","1454년에 완성된 《세종실록》 〈지리지〉요.","울진현 정동쪽 바다에 우산도와 무릉도, 두 섬이 있다고 분명히 적혀 있소."),
  got("sejong"),
  run(()=>{ if(!G.evidence.includes("sejong"))G.evidence.push("sejong"); }),
  say("nh","두루마리 지도를 펴며","그리고 1531년 《신증동국여지승람》에 실린 〈팔도총도〉일세.","동해에 울릉도와 우산도를 나란히 그려 놓았으니, 이것도 꼭 지니고 가게."),
  got("paldo"),
  run(()=>{ if(!G.evidence.includes("paldo"))G.evidence.push("paldo"); }),
  rec("《세종실록》 〈지리지〉(1454)와 《신증동국여지승람》 〈팔도총도〉(1531)는 조선이 오래전부터 울릉도와 우산도(독도)를 인식하고 기록했음을 보여 준다."),
  say("yb","","자, {name}. 이제 자산도로 가서 그 바다와 섬을 직접 눈에 담읍시다."),
  run(()=>{ G.pending=()=>prepareVoyage(1); })
);

SC.leg_dokdo=()=>sq(
  nar("안개가 걷힌다. 동도와 서도의 가파른 절벽, 하얀 포말과 괭이갈매기 떼가 눈앞을 가득 채운다."),
  say("yb","모자를 벗는다","…왔소. 삼 년 만이오."),
  say("yi","","워메, 저것 좀 보쇼! 가제가 바위를 통째로 덮었구먼!"),
  say("nh","합장","사람이 살지 못하는 땅에도 주인은 있는 법이지."),
  say("yb","탐사선의 밧줄을 풀며","{name}, 작은 배를 몰고 동도와 서도 둘레를 돌아봅시다.","물고기와 해초는 살펴본 뒤 놓아주고, 새와 풀은 배 위에서 그대로 적읍시다."),
  say("cp","생태 조사 모드","탐사선은 방향키로 움직입니다. 생물이나 반짝이는 해저 자원 앞에서 말걸기를 누르십시오.","막대가 초록 칸에 들어왔을 때 조사 버튼을 누르면 도감에 기록됩니다."),
  run(()=>{ resetEntities(); enterMap("dokdo",15,14,"u"); quest(`탐사선을 몰아 독도의 생물과 해저 자원 ${DOKDO_TARGETS.length}종을 조사하시오 (0/${DOKDO_TARGETS.length})`); })
);

/* --- 낯선 배 --- */
SC.strange_ship=()=>sq(
  nar("독도의 생물과 해저 자원을 모두 도감에 담았다. 그때 유일부가 소리친다."),
  say("yi","다급히","저기! 저기 배가 있어요!"),
  {k:"shake"},
  nar("바위섬 뒤에서 배 한 척이 미끄러져 나온다. 돛의 무늬가 낯설다."),
  say("me","","…저 배 뭐지? 우리나라 배는 아닌 것 같은데…"),
  say("yb","눈이 좁아진다","…왜선이오."),
  say("nh","","그물을 걷고 있네. 지나가던 게 아니라 여기서 고기를 잡고 있었어."),
  say("yb","호통","여기는 조선의 자산도요! 어찌 남의 바다에서 그물을 놓소!"),
  nar("배 위의 사내들이 황급히 닻을 올린다. 벌목한 나무와 낯선 매듭의 그물이 갑판에 그대로 있다."),
  got("trace"),
  run(()=>{ G.evidence.push("trace"); }),
  say("jf","달아나며","다케시마다! 여기는 우리 어장이란 말이다!"),
  say("yb","","…이대로 보내면 없던 일이 되오."),
  say("yb","돌아보며","쫓읍시다. 저 배가 어디로 돌아가는지, 그것부터 봐야겠소."),
  say("cp","","{name} 대원, 달아나는 배를 놓치지 마십시오.","바람을 등지면 배가 빨라집니다."),
  rec("독도 주변은 한류와 난류가 만나는 풍부한 어장이다. 조선과 일본 어민의 현장 활동은 이용 정황을 보여 주지만, 섬의 소속은 관찬 기록·지도·정부의 수토 같은 자료와 함께 따져야 한다.")
);

SC.leg_oki=()=>sq(
  nar("배가 닿은 곳은 낯선 항구였다. 황토빛 성하길이 높은 석축으로 이어지고, 검은 기와와 흰 회벽으로 둘러싸인 성문이 길 끝을 막아선다."),
  say("nh","","오키섬일세. 여기서부터는 일본 땅이야."),
  say("yi","작게","…이러다 우리 붙잡히는 거 아녀요?"),
  say("yb","옷매무새를 고친다","붙잡히러 온 게 아니오. 말하러 온 게요."),
  say("cp","성곽 경로 표시","길을 따라 성문까지 이동하십시오. 관리는 성 안 접견실에 있습니다."),
  run(()=>{ resetEntities(); enterMap("oki",15,15,"u"); quest("성하길을 따라 오키섬 성문 안으로 들어가시오"); })
);

SC.enter_oki_castle=()=>sq(
  nar("묵직한 성문이 열리고, 두꺼운 석벽 사이의 통로가 모습을 드러낸다. 나무 복도를 지나자 다다미 접견실과 문서방이 이어진다."),
  say("yb","성 안을 살피며","{name}, 여기서부터는 한마디 한마디가 전부 문서로 남소.","서두르지 말고 근거를 차분히 고르시오."),
  run(()=>{ enterMap("okicastle",14,12,"u"); quest("성 안의 일본 관리에게 자료를 제시하시오"); })
);

/* --- 오키섬 논박 --- */
SC.oki_official=()=>sq(
  nar("오키섬 성 안 관청. 높은 천장 아래 다다미가 길게 이어지고, 서기와 수문장이 지켜보는 가운데 금빛 병풍 앞 관리가 붓과 벼루를 꺼내 종이를 편다."),
  say("ok","","어디서 온 자들인가."),
  say("yb","","조선 강원도에서 왔소."),
  say("ok","붓을 멈춘다","강원도라. …무슨 일로 바다까지 건너 일본에 왔는가."),
  say("yb","","울릉도와 자산도에서 그대 나라 어부들을 만났소.","그 두 섬은 조선 땅이오. 그 말을 하러 왔소."),
  say("ok","다시 붓을 든다","…근거를 대라. 말만으로는 한 줄도 적을 수 없다."),
  say("nh","귓속말","자료를 하나씩 내밀게. 여기서는 말보다 물건이 이기네."),
  run(()=>{ G.pending=()=>startDebate(); })
);
SC.debate_win=()=>sq(
  nar("관리가 한참을 들여다보다가, 붓을 든다."),
  say("ok","","…그대가 내민 조선 조정의 기록과 수토 기록은 확인하여 적어 두겠소."),
  say("ok","","그리고 이렇게 적겠소. ‘울릉도와 자산도는 조선 강원도에 속한다고, 조선 사람 안용복이 진술하였다.’"),
  say("yb","고개를 젓는다","나는 상을 받으러 온 것이 아니오.","두 섬이 조선의 섬이라는 사실을 남기러 왔을 뿐이오."),
  got("ok"),
  got("okidoc"),
  rec("1696년 오키섬의 일본 관리가 작성한 조사 기록이 오늘날까지 남아 있어 안용복이 울릉도와 자산도를 조선 강원도에 속한 섬이라고 설명한 사실을 확인할 수 있다. 다만 이 문서는 안용복의 진술을 적은 조사 기록이지, 일본 정부의 독도 영유권 승인서와 같은 문서는 아니다."),
  say("ok","기록을 말아 쥐며","이 문서는 호키주 관청으로 올려 보내겠소.","그곳에서도 그대의 말을 직접 들을 것이오."),
  nar("며칠 뒤, 호키주 관청. 오키섬에서 올라온 조사 문서가 관리의 손에 펼쳐진다."),
  say("ho","경청","오키에서 온 기록은 읽었소.","울릉도와 자산도가 조선 강원도에 속한다는 그 말, 사실인가."),
  say("yb","단호","그러하오. 그러니 귀국 어부들이 다시는 두 섬에 들어오지 않게 해 주시오."),
  say("ho","결정","막부는 이미 올해 정월에, 일본 사람이 울릉도로 건너가는 것을 금하였소.","그대의 진술과 오키의 조사 기록도 따로 남겨 관청에 전하겠소."),
  got("ho"),
  got("ban"),
  rec("에도 막부의 일본인 울릉도 도해금지 조치는 1696년 1월에 내려졌다. 그 뒤 5월에 일본으로 건너간 안용복의 항해가 이 명령을 새로 만들어 낸 것은 아니다. 게임에서는 두 사건의 앞뒤 관계를 구분해 기록한다."),
  say("nh","밖으로 나오며","…허, 놀랍구먼. 칼로 지킨 것이 아니라 말로 지켰네."),
  say("yb","","돌아갑시다. 부산으로."),
  run(()=>{ G.flags.oki=1; G.pending=()=>prepareVoyage(3); })
);

/* --- 귀항 · 분기 --- */
SC.leg_home=()=>sq(
  nar("부산포. 긴 항해 끝에 배가 닿는다. 사람들이 몰려나와 일행을 맞는다."),
  say("nh","짐을 챙기며","나는 먼저 뭍에 올라 절에 다녀오겠네.","무사히 돌아왔다고 부처님께 아뢰어야지."),
  say("yb","","그러시오, 스님. 우리는 동래성에 가서 이번 뱃길의 일을 아뢰겠소."),
  say("yi","작게","…스님 발걸음이 오늘따라 어째 급하구먼."),
  nar("뇌헌 스님의 잿빛 승복이 사람들 틈으로 사라진다. 일행은 짐을 내려놓고 동래성으로 향한다."),
  run(()=>{ resetEntities(); enterMap("busan2",16,12,"l"); quest("동래성 앞에서 벌어지는 일을 지켜보시오"); G.pending=()=>play(SC.dongnae_twist(),"field"); })
);

/* --- 반전: 뇌헌 스님의 밀고 (게임 속 상상 장면) --- */
SC.dongnae_twist=()=>sq(
  {k:"banner",t:"반전 · 게임 속 상상 장면"},
  nar("동래성 문 앞. 붉은 옷의 관원이 굳은 얼굴로 성문 앞을 지키고 서 있다."),
  say("yi","눈을 가늘게 뜨며","…어? 저기 천막 뒤로 지나가는 사람, 스님 아녀요?"),
  run(()=>{const e=entById("nh");if(e){e.gone=false;e.tx=8;e.ty=14;e.dir="r";}}),
  {k:"walk",id:"nh",to:[13,13],face:"l"},
  {k:"bubble",id:"nh",t:"소곤소곤…"},
  nar("뇌헌 스님이 관원의 귀에 무언가를 속삭인다. 관원의 눈빛이 순식간에 날카로워진다."),
  {k:"bubble",id:"nh",t:null},
  say("me","놀라며","…뇌헌 스님? 절에 간다고 하셨잖아요!"),
  say("gw","호통","안용복! 나라의 허락 없이 국경을 넘었다는 고발이 들어왔다!","게다가 남의 나라에서 조선 관리 행세까지 했다지!"),
  say("yi","막아서며","고발이라니요! 대체 누가 그런 말을…"),
  {k:"shake"},
  say("nh","미소","내가 했네."),
  say("nh","","해물이 많다기에 따라나섰건만, 돌아와 보니 남은 건 국경을 넘은 죄뿐이더군.","먼저 알린 사람은 벌을 면하고 상까지 받는 법이지."),
  say("yb","천천히 돌아보며","…스님. 바람과 별을 함께 읽던 그 밤들은 다 무엇이었소."),
  say("nh","한숨","바람은 누구 편도 들지 않네. 나도 내 살길을 찾았을 뿐일세."),
  say("nh","미소","{name}, 그 도감도 이리 주게. 저 사람이 죄를 지었다는 증거로 관아에 바치겠네."),
  say("me","도감을 꼭 끌어안으며","싫어요! 이건 죄의 증거가 아니에요.","아저씨가 왜 바다를 건넜는지 보여 주는 기록이에요!"),
  say("gw","엄하게","그만! 시비는 이 자리에서 가릴 일이 아니다."),
  say("gw","","울릉도와 자산도는 강원도에 딸린 섬. 이 일은 강원도 관아에서 가려야 한다.","너희는 배를 몰아 양양으로 가라. 그곳 관아에서 조사를 받게 될 것이다!"),
  say("gw","","뇌헌, 너는 내 호송선을 타고 먼저 가서 양양 관아에 이 일을 아뢰어라."),
  say("nh","미소","분부대로 하겠습니다, 나리."),
  say("yb","담담하게","좋소. 어디서든 할 말은 하겠소."),
  say("yi","키를 움켜쥐며","양양이면 강원도 북쪽 바다구먼. 배는 내가 몰겄소!"),
  {k:"banner",t:null},
  run(()=>{G.flags.twist=1;G.pending=()=>prepareVoyage(4);})
);

SC.leg_yangyang=()=>sq(
  nar("강원도 양양. 설악의 산줄기 아래 작은 포구에 배가 닿자, 기다리던 관아의 포졸들이 일행을 에워싼다."),
  say("yv","","동래에서 기별이 왔소. 모두 배에서 내리시오!"),
  say("yi","작게","…스님은 벌써 와 있구먼. 관원 곁에 딱 붙어 섰네."),
  say("nh","미소","먼 길 오느라 수고했네. 이제 이 바다의 일은 나리께서 가려 주실 걸세."),
  say("yb","담담하게","강원도 땅의 일이니 강원도 관아에서 따지는 게 이치에 맞소."),
  say("me","도감을 꼭 쥐며","아저씨, 이번엔 제가 기록을 하나씩 보여 드릴게요."),
  nar("포졸들을 따라 양양도호부 관아의 솟을대문을 들어선다. 대청 위에서 관원이 붓을 들고 일행을 기다리고 있다."),
  run(()=>{ preloadJourneyMap(); resetEntities(); enterMap("yangyang",18,18,"u"); quest("대청 위 관원에게 말을 걸어 도감의 기록으로 안용복을 변호하시오"); })
);
SC.chat_yangyang_po=()=>say("yv","창을 세우며","관원 나리께서 기다리고 계시오.","할 말이 있거든 나리 앞에서 하시오.");
SC.chat_yangyang_clerks=()=>nar("푸른 도포의 향리와 붉은 옷의 군관이 동래에서 온 기별을 두고 소곤거린다. “일본까지 건너갔다 왔다니, 보통 일이 아니오.”");
SC.chat_yangyang_porter=()=>nar("짐을 멘 사내가 대청 쪽을 흘끗 본다. “부사 나리 앞에서는 말을 또박또박 해야 하오.”");
SC.chat_yangyang_fisher2=()=>nar("삿갓 쓴 어부가 짐을 고쳐 멘다. “울릉도 바다에 일본 배가 바글바글했다던데, 그게 참말이오?”");
SC.chat_yangyang_horse=()=>nar("말고삐를 쥔 사내가 말의 목을 쓰다듬는다. “한양으로 올릴 장계를 싣고 갈 말이라오.”");
SC.chat_yangyang_fisher=()=>say("ym","수군거리며","저 사람이 일본까지 건너갔다 온 그 사람이래.","울릉도가 우리 땅이라고 일본 관리 앞에서 따졌다지 뭐여.");

SC.trial=()=>sq(
  say("gy","","이 자는 벼슬도 없는 몸으로 남의 나라에 들어가 조선의 이름을 팔았다.","할 말이 있는가."),
  say("nh","끼어들며","나리, 속지 마십시오. 저 사람은 해물 욕심에 바다를 건넜을 뿐입니다.","섬을 지킨다는 말은 핑계일 뿐입니다."),
  ask([
    {t:"“…저는 상관없는 사람이에요.”",then:sq(
      say("gy","","…그렇다면 물러서라."),
      say("yb","조용히","{name}, 그대가 본 것은 그대만이 말할 수 있소.","보이지 않으면, 없는 것이 되오."),
      say("cp","","다시 선택하십시오."),
      {k:"goto",f:()=>play(SC.trial())}
    )},
    {t:"“안용복 아저씨는 잘못한 게 없어요!”",then:sq(
      say("gy","","말로 하는 변호는 듣지 않는다.","증좌를 대라. 종이로 가져오란 말이다."),
      say("nh","미소","보십시오. 말뿐이지 않습니까."),
      say("cp","","말이 아니라 기록을 내미십시오."),
      {k:"goto",f:()=>play(SC.trial())}
    )},
    {t:"【도감을 펼쳐 기록을 하나씩 내민다】",then:SC_present()}
  ])
);
function SC_present(){
  return sq(
    nar("도감을 펼친다. 바다에서 모은 기록이 한 장씩 관원 앞에 펼쳐진다."),
    {k:"exhibit",id:"eco"},
    say("me","","강치와 괭이갈매기, 도화새우와 부채뿔산호까지 독도 바다에서 직접 만난 생물들이에요.","독도는 바위섬 두 개가 아니라, 생명이 가득한 바다예요."),
    say("gy","","물고기 이야기는 됐다. 그 섬이 누구의 땅이냐를 말하라."),
    {k:"exhibit",id:"sejong"},
    say("me","","1454년에 완성된 《세종실록》 〈지리지〉예요.","울진현 정동쪽 바다에 우산도와 무릉도, 두 섬이 있다고 적혀 있어요."),
    {k:"exhibit",id:"paldo"},
    say("me","","이건 1531년 〈팔도총도〉예요.","조선이 만든 지도에 두 섬이 나란히 그려져 있어요."),
    {k:"exhibit",id:"sight"},
    say("me","","울릉도에서 맑은 날 자산도를 직접 봤어요.","눈으로 보이는 가까운 섬이라, 옛사람들은 두 섬을 한 짝으로 여겼어요."),
    {k:"exhibit",id:"life"},
    say("me","","1693년에 조선 어민들이 울릉도에 드나들었다는 기록이에요.","다만 이건 백성이 오간 보조 자료예요. 나라가 관리한 증거는 다음 자료예요."),
    say("nh","끼어들며","보십시오, 나리! 결국 고기 잡으러 드나든 것 아닙니까!"),
    {k:"exhibit",id:"suto"},
    say("me","단호하게","아니에요. 1694년, 조정은 장한상을 울릉도에 보내 섬을 직접 살폈어요.","백성을 못 살게 했다고 섬을 버린 게 아니에요. 나라가 계속 지켜보고 있었어요."),
    {k:"exhibit",id:"trace"},
    say("me","","이건 독도에서 일본 배가 남긴 벌목과 그물 흔적이에요.","누군가 우리 섬에 들어와 머물렀다는 걸 보여 줘요."),
    {k:"exhibit",id:"okidoc"},
    say("me","","그리고 이거요. 오키섬 일본 관리가 아저씨 말을 직접 듣고 적은 문서예요.","‘울릉도와 자산도는 조선 강원도에 속한다’는 말이 일본 쪽 기록에도 남은 거예요."),
    {k:"shake"},
    say("gy","문서를 받아들고","…이 글씨는. 일본 관리의 붓이다."),
    {k:"exhibit",id:"ban"},
    say("me","","일본은 1696년 1월에 자기 나라 사람이 울릉도로 건너가는 걸 막았어요.","아저씨가 건너가기 전의 일이지만, 울릉도를 두고 두 나라가 다툰 끝에 나온 결과예요."),
    {k:"exhibit",id:"recap"},
    say("me","","이 기록들을 모아 보면 보여요.","아저씨는 해물 때문이 아니라, 우리 섬을 지키려고 바다를 건넜어요."),
    {k:"exhibit",id:null},
    nar("관원이 오래 침묵한다. 뇌헌 스님의 얼굴에서 핏기가 가신다."),
    say("gy","","…이 자가 나라의 허락 없이 바다를 건넌 것은 분명한 죄다."),
    say("gy","","허나 이 기록들은, 조정이 몇 해를 두고도 받아내지 못한 것이다."),
    say("gy","침묵","그리고 뇌헌. 함께 바다를 건넜으면서 동료를 팔아 제 죄를 덮으려 했구나.","그대 또한 국경을 넘은 몸이다. 조사를 피할 수는 없다."),
    say("nh","한숨","…기록이 이렇게 남아 있을 줄은 몰랐네."),
    say("gy","붓을 든다","죄는 죄대로, 공은 공대로 적겠다.","조정에 올려 판단을 받게 하겠다."),
    say("yb","돌아본다","{name}… 어느 틈에 이런 것을 다 적어 두었소."),
    say("me","","아저씨가 그랬잖아요. 본 사람이 많아야 한다고.","그래서 하나도 안 빼고 다 적어 뒀어요."),
    say("yb","오래 웃는다","허허… 허허."),
    say("yb","","그렇구려. 그게 바로 지키는 것이오."),
    say("yi","","기억은 흩어져도 기록은 남는구먼.","오늘 {name}이 그걸 똑똑히 보여 줬소."),
    rec("실제 역사에서 안용복 일행은 일본에서 돌아와 강원도 양양에 닿았고, 안용복은 국경을 넘고 관리를 사칭한 죄로 조사와 처벌을 받았다. 실제 기록 속 뇌헌은 안용복과 함께 일본에 건너갔다가 함께 조사를 받은 동행자이며, 관원에게 몰래 알렸다는 이야기는 게임을 위한 상상이다. 에도 막부의 일본인 울릉도 도해금지 조치는 1696년 1월에 내려졌다."),
    say("cp","","기록이 남았으므로, 여정이 완성되었습니다."),
    got("badge"),
    say("yb","시간문 앞에서","{name}, 그대가 사는 시대에도 이 바다와 두 섬을 기억해 주시오."),
    say("me","","네. 아저씨가 한 일도 꼭 기억할게요."),
    say("yb","마지막으로 웃는다","…그거면 충분하오."),
    run(()=>{ G.pending=()=>returnToPresent(); })
  );
}

function arrangeReunion(){
  const spots={teacher:[12,10,"d"],student_b1:[10,12,"r"],student_g1:[14,12,"l"],student_b2:[9,10,"d"],student_g2:[15,10,"d"],tourist1:[7,9,"r"],tourist2:[17,9,"l"],guide:[12,7,"d"]};
  (ENT.suyeong||[]).forEach(e=>{const s=spots[e.id];if(!s)return;e.tx=s[0];e.ty=s[1];e.dir=s[2];e.wander=0;});
}
function returnToPresent(){
  G.mode="transition";G.inputLock=true;resetInput();ui();
  const s=$("#stage"),w=$("#time-warp");s.classList.remove("time-shake");w.classList.remove("on");void s.offsetWidth;s.classList.add("time-shake");w.classList.add("on");
  setTimeout(()=>{
    setGameClock(2026,8,2,15,42);resetEntities();enterMap("suyeong",21,6,"r");G.inputLock=true;
    quest("선생님과 친구들에게 시간탐험 이야기를 들려주시오");
  },520);
  setTimeout(()=>{
    s.classList.remove("time-shake");w.classList.remove("on");G.inputLock=false;
    play(SC.return_reunion(),"field");
  },1080);
}
SC.return_reunion=()=>sq(
  nar("눈부신 빛과 흔들림이 잦아든다. 짠 바닷바람 대신 풀 냄새가 스치고, 다시 수영사적공원의 오후 햇살이 눈앞에 번진다."),
  say("stg","달려오며","{name}! 방금 충혼탑 앞에서 빛이 번쩍했어. 너 어디 갔었어?"),
  say("tch","걱정스럽게 살피며","{name} 학생, 괜찮아요? 갑자기 안 보여서 다들 찾고 있었어요.","무슨 일이 있었던 거예요?"),
  say("stb","숨을 고르며","{name}, 잠깐만. 너한테서 진짜 바다 냄새가 나는데?"),
  say("me","친구들을 바라보며","…믿기 힘들겠지만, 나 방금 1696년에 다녀왔어.","안용복 아저씨 배를 타고 울릉도랑 독도를 지나서 일본까지."),
  say("me","시간 나침반을 꼭 쥐며","독도에서 강치도 보고, 독도가 우리 땅이라는 옛 기록도 직접 모았어.","기억은 흩어져도 기록은 남는다는 것도 배웠고."),
  say("tch","미소 지으며","굉장한 이야기네요. 그럼 오늘 기록지에 하나도 빠짐없이 남겨 볼까요?"),
  say("stg","손을 내밀며","우리도 같이 정리할게! 독도 생물 이야기부터 해 줘."),
  say("me","환하게 웃으며","응. 우리 모두 오래오래 기억할 수 있게, 전부 적어 두자."),
  nar("친구들과 선생님이 충혼탑 앞에 둥글게 모인다. 시간 나침반의 바늘이 마지막으로 푸른빛을 내고 조용히 멈춘다."),
  run(()=>{G.pending=()=>showEnding();})
);

/* ==========================================================
   도감 · 엔딩
   ========================================================== */
/* v18 · 대원증·도감 PDF 대신 시간탐험대 여권(js/passport.js)을 발급한다 */
function passportPanelHTML(issued){
  return issued
    ? `<div class="dex-passport">${passportMiniHTML("dx-passport-mini")}<div><b>시간탐험대 여권</b><span>여권을 눌러 펼치면 만난 인물과 조사한 생물·자원 도장, 모은 포인트를 볼 수 있고 PDF로 저장할 수 있습니다.</span></div></div>`
    : `<div class="crew-id-pending"><b>시간탐험대 여권</b><span>임무를 완료하면 도장이 찍힌 시간탐험대 여권이 발급됩니다.</span></div>`;
}
const DEX_RETURN_MODES=new Set(["title","field","sea","talk","port","prep","ending"]);
let dexOpener=null;
function openDex(){
  const el=$("#dex");
  if(!el.classList.contains("hide")){const existing=$("#dxc");if(existing){try{existing.focus({preventScroll:true});}catch(_){existing.focus();}}return;}
  dexOpener=document.activeElement;
  G.overlayReturnMode=G.mode; G.mode="overlay"; resetInput(); ui();
  const issued=G.dex.includes("badge"),recordKeys=Object.keys(DEX).filter(k=>k!=="badge"),collected=recordKeys.filter(k=>G.dex.includes(k)).length;
  let h=`<div class="dexh"><h2 id="dex-title">시간탐험 도감</h2><span style="font-family:var(--serif);color:var(--paper-2);font-size:14px">기록 ${collected} / ${recordKeys.length}</span>
    <div class="dex-actions"><button class="ibtn" id="dx-print" ${issued?"":"disabled"}>${issued?"시간탐험대 여권":"임무 완료 후 여권 발급"}</button><button class="ibtn" id="dxc" aria-label="시간탐험 도감 닫기">닫기</button></div></div>
    <div class="dex-scroll"><div class="dex-pass-wrap">${passportPanelHTML(issued)}</div><div class="dexg">`;
  CATS.forEach(cat=>{
    h+=`<div class="dexcat">${cat}</div>`;
    Object.entries(DEX).filter(([k,v])=>k!=="badge"&&v.c===cat).forEach(([k,v])=>{
      const has=G.dex.includes(k);
      h+=has
        ? `<div class="di">${creatureSpriteSpec(k)?creatureHTML(k,"creature-dex"):EVIDENCE_SPRITES[k]?evidenceHTML(k,"evidence-dex"):DEX_ATLAS[k]?atlasHTML(DEX_ATLAS[k],"atlas-dex",v.n):`<span class="em">${v.em}</span>`}<div><div class="n">${v.n}</div><div class="d">${v.d}</div></div></div>`
        : `<div class="di lock"><span class="em">❔</span><div><div class="n">? ? ?</div><div class="d">아직 발견하지 못했다.</div></div></div>`;
    });
  });
  h+="</div></div>";el.innerHTML=h;hydrateAtlasSprites(el);el.classList.remove("hide");el.setAttribute("aria-hidden","false");
  const scroller=el.querySelector(".dex-scroll"),closeButton=$("#dxc");
  if(scroller)scroller.scrollTop=0;
  closeButton.onclick=closeDex;
  requestAnimationFrame(()=>{if(scroller)scroller.scrollTop=0;try{closeButton.focus({preventScroll:true});}catch(_){closeButton.focus();}});
  if(issued){$("#dx-print").onclick=openPassport;$("#dx-passport-mini").onclick=openPassport;}
}
function closeDex(){
  const el=$("#dex");
  if(el.classList.contains("hide")) return;
  el.classList.add("hide");el.setAttribute("aria-hidden","true");
  const back=G.overlayReturnMode;
  G.overlayReturnMode=null;
  G.mode=DEX_RETURN_MODES.has(back)?back:(SEA.active?"sea":(G.lastMode||"title"));
  resetInput();ui();
  const opener=dexOpener;dexOpener=null;
  if(opener&&opener.isConnected){try{opener.focus({preventScroll:true});}catch(_){opener.focus();}}
}
$("#b-dex").onclick=openDex; $("#b-dex0").onclick=openDex;
$("#b-title").onclick=()=>{ location.reload(); };

function showEnding(){
  G.mode="ending"; ui();
  const found=G.dex.filter(k=>k!=="badge").map(k=>DEX[k]).filter(Boolean);
  $("#ending").innerHTML=`<div class="ew">
    <h2>독도 시간탐험대 임무 완료</h2>
    <p class="q">시간문을 넘어 부산 수영사적공원으로 무사히 돌아왔습니다.<br>그가 남긴 것은 섬이 아니라, 기록이었습니다.</p>
    <figure class="journey"><img id="route-map" src="assets/journey-map.webp" width="2171" height="724" decoding="async" alt="안용복의 독도 수호 여정 지도(1696년)"><figcaption>지도를 누르면 크게 볼 수 있습니다</figcaption></figure>
    <p class="q" style="font-size:15px;margin-top:12px">〈안용복 항로도〉 1696년<br>부산포 → 울릉도 → 자산도 → 오키섬 → 부산포·동래성 → 양양 → 수영사적공원 · 모두 ${G.day}일</p>
    <div class="pp-issued">${passportMiniHTML("e-passport-mini")}<div><b>시간탐험대 여권이 발급되었습니다</b><span>여권을 눌러 펼쳐 보세요. 만난 인물과 조사한 생물·자원이 도장으로 찍혀 있고, 모은 포인트가 적혀 있습니다. 맨 뒷장 메모란에 기억하고 싶은 것을 적은 뒤 PDF로 저장할 수 있습니다.</span></div></div>
    <p class="q" style="font-size:15px">모은 기록 ${found.length} / ${Object.keys(DEX).filter(k=>k!=="badge").length}<br>
      ${found.map(f=>f.em+" "+f.n).join(" · ")}</p>
    <div class="fact"><b>사 실 과 상 상</b>
      · 안용복이 동래 사람이며 왜관을 드나들어 일본말을 했다는 것, 1693년 박어둔과 함께 일본에 끌려간 일, 1696년 승려 뇌헌 등과 다시 일본으로 건너간 일, 오키섬에서 일본 관리가 그의 진술을 문서로 남긴 일은 모두 <b style="display:inline">사실</b>입니다.<br>
      · 조선이 주민의 상시 거주와 허가 없는 도항을 금한 쇄환정책을 시행한 것, 1694년 장한상을 보내 울릉도를 수토한 것도 <b style="display:inline">사실</b>입니다. 쇄환은 영토 포기와 같은 뜻이 아닙니다.<br>
      · 1693년 조선 어민의 울릉도 왕래는 민간의 이용과 인식을 보여 주는 보조 자료입니다. 조정의 공식 관리는 관찬 지리서·지도와 수토 기록을 함께 살펴 판단해야 합니다.<br>
      · 일본의 오야·무라카와 두 가문이 막부로부터 울릉도 도해 허가를 받은 것은 사실이지만, 이는 일본인의 울릉도 조업을 허가한 문서이지 영유권을 확정한 문서가 아닙니다. 게임 속 일본 어민의 주장은 당시의 충돌을 보여 주기 위한 대사입니다.<br>
      · 《숙종실록》에는 1696년 안용복이 뇌헌에게 울릉도의 풍부한 해물을 말해 동행을 권했고, 울릉도에서 일본인을 만나자 침범을 강하게 항의했다고 기록되어 있습니다. 그가 출항 전부터 일본 관청에 항의할 뜻을 굳혔다는 대사는 지도 휴대와 이후의 행동을 바탕으로 한 <b style="display:inline">게임의 역사적 해석</b>입니다.<br>
      · 에도 막부의 일본인 울릉도 도해금지 조치는 1696년 1월에 내려졌고, 안용복의 두 번째 도일은 그 뒤에 이루어졌습니다. 도해금지 조치는 울릉도에 관한 것이므로 독도를 직접 지칭한 문서로 과장하지 않습니다.<br>
      · 실제 안용복은 귀국 뒤 국경을 넘고 관리를 사칭한 죄로 처벌을 받았습니다. 이 게임의 마지막 변호와 현대로 돌아오는 장면은 학습을 위해 구성한 <b style="display:inline">가정</b>입니다.<br>
      · 귀항 뒤 뇌헌 스님이 관원에게 몰래 알리는 반전과 그를 악역으로 그린 장면은 <b style="display:inline">게임을 위한 상상</b>입니다. 실제 뇌헌은 안용복과 함께 일본에 건너갔다가 함께 조사를 받은 동행자입니다. 실제 일행은 일본에서 곧바로 강원도 양양에 닿아 붙잡혔고 조정의 조사를 받았습니다. 게임에서는 부산포에 먼저 들렀다가 뇌헌의 밀고로 양양 관아로 보내지는 순서로 구성했습니다.<br>
      · 장한상 수토 기록을 안용복 일행이 자료 카드로 지니고 일본 관리와 논박하는 구성, 유일부·뇌헌의 성격과 대사, 시간문과 시간 나침반, 생태 조사 장면은 학습을 위한 창작입니다.</div>
    <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:18px">
      <button class="btn" id="e-dex">도감 보기</button>
      <button class="btn" id="e-print">여권 펼치기</button>
      <button class="btn red" id="e-again">처음부터 다시</button>
    </div></div>`;
  $("#ending").classList.remove("hide");
  $("#route-map").onclick=openJourneyMap;
  $("#e-dex").onclick=openDex;
  $("#e-print").onclick=openPassport;$("#e-passport-mini").onclick=openPassport;
  $("#e-again").onclick=()=>location.reload();
}
/* v17 · 엔딩 여정 지도: 미리 받아 두었다가(양양 도착 때) 그림 한 장으로 보여 준다 */
let JOURNEY_IMG=null;
function preloadJourneyMap(){if(JOURNEY_IMG)return;JOURNEY_IMG=new Image();JOURNEY_IMG.decoding="async";JOURNEY_IMG.src="assets/journey-map.webp";if(JOURNEY_IMG.decode)JOURNEY_IMG.decode().catch(()=>{});}
function openJourneyMap(){
  const z=document.createElement("div");z.id="map-zoom";z.setAttribute("role","dialog");z.setAttribute("aria-label","안용복의 독도 수호 여정 지도 크게 보기");
  z.innerHTML=`<img src="assets/journey-map.webp" alt="안용복의 독도 수호 여정 지도(1696년)"><span>화면을 누르면 닫힙니다</span>`;
  z.onclick=()=>z.remove();$("#stage").appendChild(z);
}
function drawRoute(){
  const c=$("#route"); if(!c) return;
  const x=c.getContext("2d"), w=c.width, h=c.height;
  const bg=x.createLinearGradient(0,0,0,h); bg.addColorStop(0,"#1c7ea3"); bg.addColorStop(1,"#12506e");
  x.fillStyle=bg; x.fillRect(0,0,w,h);
  const fp=(pts,col)=>{x.beginPath();pts.forEach((p,i)=>{const a=p[0]*w,b=p[1]*h;i?x.lineTo(a,b):x.moveTo(a,b)});
    x.closePath();x.fillStyle=col;x.fill();x.strokeStyle="#6d8a56";x.lineWidth=2;x.stroke();};
  fp(KOREA,"#a9c98a"); fp(JAPAN,"#a9c98a"); fp(MATSUE,"#a9c98a");
  OKIISL.forEach(o=>{x.beginPath();x.arc(o[0]*w,o[1]*h,o[2]*w,0,7);x.fillStyle="#a9c98a";x.fill();x.strokeStyle="#6d8a56";x.stroke();});
  x.beginPath();x.arc(SEAPT.ulleung.x*w,SEAPT.ulleung.y*h,11,0,7);x.fillStyle="#9dc47e";x.fill();x.stroke();
  x.beginPath();x.arc(SEAPT.dokdo.x*w,SEAPT.dokdo.y*h,6,0,7);x.fillStyle="#a8a184";x.fill();x.stroke();
  const legs=[["busan","ulleung"],["ulleung","dokdo"],["dokdo","oki"],["oki","busan"],["busan","yangyang"]];
  x.setLineDash([9,7]); x.strokeStyle="#b23425"; x.lineWidth=3;
  legs.forEach(l=>{const a=SEAPT[l[0]],b=SEAPT[l[1]];
    x.beginPath();x.moveTo(a.x*w,a.y*h);x.lineTo(b.x*w,b.y*h);x.stroke();});
  x.setLineDash([]);
  Object.values(SEAPT).forEach(p=>{
    x.beginPath();x.arc(p.x*w,p.y*h,7,0,7);x.fillStyle="#d9a441";x.fill();x.strokeStyle="#241c14";x.lineWidth=2.5;x.stroke();
    x.font="700 15px Pretendard,sans-serif";x.textAlign="center";
    x.lineWidth=4;x.strokeStyle="rgba(10,40,55,.85)";x.strokeText(p.n,p.x*w,p.y*h-14);
    x.fillStyle="#f4e6c8";x.fillText(p.n,p.x*w,p.y*h-14);
  });
}
const esc=s=>String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));

/* ==========================================================
   UI 토글 · 루프
   ========================================================== */
function quest(t){ $("#q-t").textContent=t; }
function ui(){
  const f=G.mode==="field", s=G.mode==="sea", t=G.mode==="talk";
  renderClock();
  $("#topbar").classList.toggle("hide", !(f||s||t||G.mode==="port"||G.mode==="prep"));
  $("#quest").classList.toggle("hide", !(f||s));
  $("#gauge").classList.toggle("hide", !s);
  $("#voyage-state").classList.toggle("hide", !s);
  $("#sea-commands").classList.toggle("hide", !s);
  $("#pad").classList.toggle("hide", !(f||s));
  $("#sea-hint").classList.toggle("hide",!s);
  $("#abtn").classList.toggle("hide", !(f||s||t));
  $("#abtn").classList.toggle("sea-action",s);
  $("#abtn").textContent = s ? "돛 조절" : t ? "다음" : "말걸기";
}
/* v15 · 게임 속도는 초당 60번으로 고정하고, 화면은 그릴 수 있을 때마다 그린다.
   60Hz 화면에서 프레임을 건너뛰던 문제와 120Hz 화면에서 빨라지던 문제를 함께 막는다. */
let lastFrame=0,frameAcc=0,FRAME_DT=1000/60;const STEP_MS=1000/60;
/* 걷기는 화면 한 장마다 흐른 시간만큼 움직여, 60·90·120Hz 어느 화면에서도 매끄럽게 보이게 한다 */
function fieldMove(dt){
  if(G.mode!=="field")return;
  if(!P.moving){tryMove();if(!P.moving){P.walk=0;return;}}
  let dist=(P.map==="dokdo"?4.4:3.2)*Math.min(3,dt/STEP_MS),guard=0;
  while(dist>0&&P.moving&&guard++<4){
    const rem=Math.abs(P.tx*T-P.px)+Math.abs(P.ty*T-P.py),d=Math.min(dist,rem);
    P.px+=P.fx*d;P.py+=P.fy*d;P.walk=(P.walk||0)+d;dist-=d;
    if(d>=rem-1e-6){P.px=P.tx*T;P.py=P.ty*T;P.moving=false;tryMove();}
  }
}
/* 항해 화면 해상도: 기본 1.25배. 기기가 버거워하면(평균 20ms 넘게 걸리면) 자동으로 1배로 낮춘다. */
let SEA_DPR=1.25;const SEA_PERF={n:0,sum:0};
function updateFrame(){
  TICK++;
  if(G.mode==="field"){
    if(TICK%42===0) (ENT[P.map]||[]).forEach(e=>{
      if(!e.wander||e.gone) return;
      const d=[[0,1],[0,-1],[1,0],[-1,0]][Math.random()*4|0];
      const nx=e.tx+d[0], ny=e.ty+d[1];
      if(!solidAt(P.map,nx,ny)&&!entityAt(P.map,nx,ny)&&!(nx===P.tx&&ny===P.ty)){ e.tx=nx;e.ty=ny; }
    });
    if(P.map==="dokdo"&&!G.flags.dokdoDone&&TICK%15===0) quest(`탐사선으로 독도의 생물과 해저 자원을 조사하시오 (${G.caught.length}/${DOKDO_TARGETS.length}) · 조사 점수 ${DOKDO_SCORE.score.toLocaleString()}`);
  } else if(G.mode==="talk"){ updateWalk(); }
  else if(G.mode==="sea"){ seaStep(); }
  else if(G.mode==="catch"&&CG){ updateCatch(); }
}
function renderFrame(){
  const seaView=G.mode==="sea"||(G.mode==="talk"&&(G.talkReturnMode==="sea"||G.talkReturnMode==="port"));
  setDprCap(seaView?SEA_DPR:2);
  if(G.mode==="field") drawField();
  else if(G.mode==="talk"){ if(G.talkReturnMode==="sea"||G.talkReturnMode==="port") drawSea(); else drawField(); }
  else if(G.mode==="sea") drawSea();
}
function loop(now){
  requestAnimationFrame(loop);
  if(now===undefined)now=performance.now();
  if(document.hidden){lastFrame=now;return;}
  if(!lastFrame)lastFrame=now;
  const dt=now-lastFrame;frameAcc+=Math.min(120,dt);lastFrame=now;
  if(G.mode==="sea"&&SEA_DPR>1&&dt<250){SEA_PERF.n++;SEA_PERF.sum+=dt;if(SEA_PERF.n>=120){if(SEA_PERF.sum/SEA_PERF.n>20)SEA_DPR=1;SEA_PERF.n=0;SEA_PERF.sum=0;}}
  FRAME_DT=Math.max(0,Math.min(50,dt));
  let n=Math.min(4,Math.floor(frameAcc/STEP_MS+.35));
  frameAcc=Math.max(-STEP_MS,frameAcc-n*STEP_MS);
  fieldMove(FRAME_DT);
  for(let i=0;i<n;i++)updateFrame();
  const fieldView=G.mode==="field"||(G.mode==="talk"&&G.talkReturnMode!=="sea"&&G.talkReturnMode!=="port");
  if(n>0||fieldView)renderFrame();
}

/* ---------- 시작 ---------- */
$("#b-start").onclick=async()=>{
  const start=$("#b-start");if(start.disabled)return;start.disabled=true;start.textContent="탐험 준비 중…";
  const initial=["bg_suyeong","playerWalk","full1","full2"];
  const ready=await Promise.allSettled(initial.map(k=>SPRITE_IMAGES[k].decode()));
  start.disabled=false;start.textContent="시간문 열기";
  if(ready.some(r=>r.status==="rejected")){start.textContent="그림을 불러오지 못했습니다 · 다시 시도";return;}
  const v=$("#pname").value.trim();
  G.name=v||"탐험대원";
  $("#title").classList.add("hide");
  fit(); resetEntities();
  setGameClock(2026,8,2,10,0);enterMap("suyeong",14,13,"u");
  G.lastMode="field";
  play(SC.fieldtrip_start(),"field");
};
const schoolIntro=$("#school-intro");
let introTimer=setTimeout(closeSchoolIntro,3000);
function closeSchoolIntro(){
  if(schoolIntro.classList.contains("out")) return;
  clearTimeout(introTimer);schoolIntro.classList.add("out");
  setTimeout(()=>schoolIntro.classList.add("hide"),720);
}
schoolIntro.addEventListener("pointerdown",e=>{e.preventDefault();closeSchoolIntro();});
renderClock();fit(); loop();
