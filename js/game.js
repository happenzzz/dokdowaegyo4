"use strict";
/* ==========================================================
   독도 시간탐험대 v12 · 안용복의 항의 목적과 생태 조사
   ========================================================== */
const $=s=>document.querySelector(s);
const cv=$("#game"), g=cv.getContext("2d");
let VW=0,VH=0,DPR=1;
function fit(){
  DPR=Math.min(2,window.devicePixelRatio||1);
  VW=cv.clientWidth; VH=cv.clientHeight;
  cv.width=VW*DPR; cv.height=VH*DPR; g.setTransform(DPR,0,0,DPR,0,0);
  g.imageSmoothingEnabled=false;
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
document.documentElement.style.setProperty("--creature-atlas",`url("${CREATURE_ASSET}")`);
document.documentElement.style.setProperty("--ecology-atlas",`url("${ECOLOGY_ASSET}")`);
document.documentElement.style.setProperty("--evidence-atlas",`url("${EVIDENCE_ASSET}")`);
Object.entries(EXTRA_ASSETS).forEach(([k,src])=>document.documentElement.style.setProperty(`--${k}-atlas`,`url("${src}")`));
$("#school-intro-image").src=INTRO_ASSET;
addEventListener("DOMContentLoaded",()=>{
  $("#title-yb").style.backgroundImage=`url("${ASSET_DATA.full1}")`;
  $("#title-me").style.backgroundImage=`url("${ASSET_DATA.full1}")`;
});

/* ---------- 상태 ---------- */
const G={ name:"탐험대원", mode:"title", scene:"", dex:[], flags:{}, caught:[], evidence:[], day:0,
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
  $("#night-filter").style.opacity=darkness.toFixed(2);$("#stage").classList.toggle("night",darkness>.09);
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
function portraitColumn(k,m,t){
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
  badge:{c:"기록",em:"🎖️",n:"독도 시간탐험대 대원증",d:"1696년의 항해를 끝까지 함께한 사람에게 주어지며, 수집한 도감과 함께 PDF로 발급할 수 있다."}
};
const CATS=["인물","독도의 생물과 자원","동해안의 전설","기록"];

/* ==========================================================
   맵
   ========================================================== */
const T=32;
const MAPS={
suyeong:{name:"수영사적공원",sub:"현장체험학습 · 오늘",
  rows:[
  "############################",
  "#...TT.....PP.....TT.......#",
  "#..........PP..............#",
  "#..FFFF....PP....FFFF......#",
  "#..........PP..............#",
  "#PPPPPPPPPPPPPPPPPPPPPPPPPP#",
  "#PPPPPPPPPPPPPPPPPPPPPPPPPP#",
  "#....TT....PP......TT......#",
  "#..........PP..............#",
  "#..BBBB....PP..............#",
  "#..BBBB....PP..............#",
  "#..........PP....FFFF......#",
  "#..TT......PP......TT......#",
  "#..........PP..............#",
  "#..........PP..............#",
  "############################"],
  spawn:[12,13]},
busan:{name:"부산포",sub:"1 6 9 6 · 동 래",
  rows:[
  "##########################",
  "#.....TT........TT.......#",
  "#........................#",
  "#..BBBB.........BBB......#",
  "#..BBBB.........BBB......#",
  "#..BBBB.........BBB....~~#",
  "#....................DD~~#",
  "#..TT................DD~~#",
  "#....................DD~~#",
  "#........TT..........DD~~#",
  "#....................DD~~#",
  "#..BBB...............DD~~#",
  "#..BBB.....TT........~~~~#",
  "#........................#",
  "##########################"],
  spawn:[5,7]},
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
oki:{name:"오키섬 성하길",sub:"隱 岐 · 성 문 밖",
  rows:[
  "############################",
  "#....TT............TT......#",
  "#..........................#",
  "#.....WWWWWWWWWWWWWWW......#",
  "#.....WKKKKKKKKKKKKKW......#",
  "#.....WKKKKKKKKKKKKKW......#",
  "#.....WWWWWWGEGWWWWWW......#",
  "#............sss...........#",
  "#...rrrrrrrrrsssrrrrrrrrr..#",
  "#...rrrrrrrrrsssrrrrrrrrr..#",
  "#..TrrrrrrrrrsssrrrrrrrrrT.#",
  "#...rrrrrrrrrsssrrrrrrrrr..#",
  "#...rrrrrrrrrsssrrrrrrrrr..#",
  "#............sss...........#",
  "#............sss...........#",
  "############################"],
  spawn:[13,14]},
okicastle:{name:"오키섬 성 안 · 관청 접견실",sub:"隱 岐 · 성 안",
  rows:[
  "############################",
  "#XXXXXXXXXXXXXXXXXXXXXXXXXX#",
  "#XIIIIIIIIIIIIIIIIIIIIIIIIX#",
  "#XIIIIIIIIIIIIIIIIIIIIIIIIX#",
  "#XIIIIIIIIIIIIIIIIIIIIIIIIX#",
  "#XIIIIIIIIIIIIIIIIIIIIIIIIX#",
  "#XCCCCCCCCCCCCCCCCCCCCCCCCX#",
  "#XCCCCCCXXXXXXXXXXCCCCCCCCX#",
  "#XIIIIIIXIIIIIIIIXIIIIIIIIX#",
  "#XIIIIIIXIIIIIIIIXIIIIIIIIX#",
  "#XIIIIIIXIIIIIIIIXIIIIIIIIX#",
  "#XIIIIIIIIIIIIIIIIIIIIIIIIX#",
  "#XIIIIIIIIIIIIIIIIIIIIIIIIX#",
  "#XXXXXXXXXXXXEEXXXXXXXXXXXX#",
  "############################"],
  spawn:[13,12]},
busan2:{name:"부산포 · 귀항",sub:"조 정 의 조 사",
  rows:[
  "##########################",
  "#.....TT........TT.......#",
  "#........................#",
  "#..BBBB.........BBB......#",
  "#..BBBB.........BBB......#",
  "#..BBBB.........BBB....~~#",
  "#....................DD~~#",
  "#..TT................DD~~#",
  "#....................DD~~#",
  "#........TT..........DD~~#",
  "#....................DD~~#",
  "#..BBB...............DD~~#",
  "#..BBB.....TT........~~~~#",
  "#........................#",
  "##########################"],
  spawn:[20,8]}
};
const SOLID="#B~^TF";
function solidAt(map,tx,ty){
  const r=MAPS[map].rows;
  if(ty<0||ty>=r.length) return true;
  const row=r[ty]; if(tx<0||tx>=row.length) return true;
  if(map==="dokdo") return row[tx]==="^";
  if(map==="oki") return "#WKGET".includes(row[tx]);
  if(map==="okicastle") return "#XE".includes(row[tx]);
  return SOLID.includes(row[tx]);
}

/* 엔티티(맵별) */
let ENT={};
function resetEntities(){
  ENT={
  suyeong:[
    {id:"statue",obj:"statue",tx:23,ty:5,talk:"opening"},
    {id:"teacher",ch:"tch",tx:5,ty:12,dir:"r",talk:"field_teacher"},
    {id:"student_b1",ch:"stb",tx:8,ty:13,dir:"u",talk:"field_student_b",wander:1},
    {id:"student_g1",ch:"stg",tx:16,ty:12,dir:"l",talk:"field_student_g",wander:1},
    {id:"student_b2",ch:"stb",tx:20,ty:8,dir:"d",talk:"field_student_b2",wander:1},
    {id:"student_g2",ch:"stg",tx:7,ty:4,dir:"r",talk:"field_student_g2",wander:1},
    {id:"tourist1",ch:"tour1",tx:21,ty:5,dir:"l",talk:"field_tourist1",wander:1},
    {id:"tourist2",ch:"tour2",tx:19,ty:10,dir:"u",talk:"field_tourist2"},
    {id:"guide",ch:"guide",tx:15,ty:4,dir:"l",talk:"field_guide"}
  ],
  busan:[
    {id:"yb",ch:"yb",tx:19,ty:7,dir:"l",talk:"yb_first"},
    {id:"np1",ch:"np",tx:8,ty:4,dir:"d",talk:"chat_np1"},
    {id:"hj",ch:"hj",tx:14,ty:11,dir:"l",talk:"chat_hj"},
    {id:"yi",ch:"yi",tx:20,ty:10,dir:"l",talk:"chat_yi"},
    {id:"nh",ch:"nh",tx:17,ty:8,dir:"d",talk:"chat_nh"},
    {id:"dockboat",obj:"mooredBoat",tx:23,ty:8},
    {id:"cargo1",obj:"cargo",tx:17,ty:5},
    {id:"cargo2",obj:"cargo",tx:18,ty:10},
    {id:"cargo3",obj:"cargo",tx:15,ty:6},
    {id:"barrels",obj:"barrels",tx:20,ty:4},
    {id:"sacks",obj:"sacks",tx:17,ty:12},
    {id:"fishgear",obj:"barrels",tx:20,ty:12},
    {id:"repairRack",obj:"repairProps",tx:21,ty:6}
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
    {id:"jv_oki_1",ch:"jv",tx:8,ty:9,dir:"r",talk:"chat_jv_oki_1"},
    {id:"jv_oki_2",ch:"jv",tx:19,ty:11,dir:"l",talk:"chat_jv_oki_2"},
    {id:"castle_gate",obj:"castleGate",tx:13,ty:6,talk:"enter_oki_castle"}
  ],
  okicastle:[
    {id:"ok",ch:"ok",tx:13,ty:3,dir:"d",talk:"oki_official"},
    {id:"jk",ch:"jk",tx:8,ty:4,dir:"r",talk:"chat_jk_oki"},
    {id:"jg",ch:"jg",tx:18,ty:4,dir:"l",talk:"chat_jg_oki"},
    {id:"yb",ch:"yb",tx:11,ty:10,dir:"r",talk:"chat_yb_oki"},
    {id:"nh",ch:"nh",tx:15,ty:10,dir:"l",talk:"chat_nh_oki"},
    {id:"yi",ch:"yi",tx:9,ty:11,dir:"u",talk:"chat_yi_oki"}
  ],
  busan2:[
    {id:"gw",ch:"gw",tx:12,ty:8,dir:"r",talk:"trial"},
    {id:"yb",ch:"yb",tx:15,ty:8,dir:"l",talk:"chat_yb_trial"},
    {id:"nh",ch:"nh",tx:16,ty:10,dir:"u",talk:"chat_nh_trial"},
    {id:"yi",ch:"yi",tx:14,ty:10,dir:"u",talk:"chat_yi_trial"}
  ]};
}

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
  P.px=P.tx*T; P.py=P.ty*T; P.dir=dir||"d"; P.moving=false;
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
function entityAt(m,tx,ty){ return (ENT[m]||[]).find(e=>e.tx===tx&&e.ty===ty&&!e.gone); }
function pressA(){
  if(!$("#stamp").classList.contains("hide")){ dismissStamp(); return; }
  if(G.inputLock) return;
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
  const focusY=P.py+T/2;
  camX=Math.max(0,Math.min(mw-sw, P.px+T/2-sw/2));
  camY=Math.max(0,Math.min(mh-sh, focusY-sh/2));
  if(mw<sw) camX=(mw-sw)/2; if(mh<sh) camY=(mh-sh)/2;
  g.save(); g.scale(scale,scale); g.translate(-camX,-camY);
  g.fillStyle="#0b2230"; g.fillRect(camX,camY,sw,sh);
  const x0=Math.max(0,(camX/T|0)-1), x1=Math.min(rows[0].length,(camX+sw)/T+2|0);
  const y0=Math.max(0,(camY/T|0)-1), y1=Math.min(rows.length,(camY+sh)/T+2|0);
  const scenic=P.map==="dokdo"?SPRITE_IMAGES.dokdoBg:null;
  if(scenic&&scenic.complete&&scenic.naturalWidth){
    g.drawImage(scenic,0,0,mw,mh);
    if(P.map==="dokdo"){
      g.fillStyle="rgba(3,44,78,.08)";g.fillRect(0,0,mw,mh);
      g.fillStyle="rgba(220,248,255,.35)";for(let i=0;i<65;i++){const x=(i*137+TICK*1.7)%mw,y=(i*71+(i%5)*29)%mh;g.fillRect(x,y,3+(i%3)*2,2);}
    }
  }else{
    for(let y=y0;y<y1;y++) for(let x=x0;x<x1;x++) drawTile(rows[y][x],x,y);
  }
  const ents=(ENT[P.map]||[]).filter(e=>!e.gone).slice();
  ents.push({player:true,tx:P.tx,ty:P.ty});
  ents.sort((a,b)=>a.ty-b.ty);
  ents.forEach(e=>{
    if(e.player) P.map==="dokdo"?drawDokdoBoatPlayer():drawPerson(P.px,P.py,"me",P.dir,P.moving?((TICK/8|0)%2):0);
    else if(e.cr) drawCreature(e);
    else if(e.obj) drawMapObject(e);
    else drawPerson(e.tx*T,e.ty*T,e.ch,e.dir||"d",0);
  });
  // 상호작용 표시
  const d={u:[0,-1],d:[0,1],l:[-1,0],r:[1,0]}[P.dir];
  const t=entityAt(P.map,P.tx+d[0],P.ty+d[1]);
  if(t&&(t.talk||t.cr)){
    const bx=t.tx*T+T/2, by=t.ty*T-6+Math.sin(TICK/9)*2;
    g.fillStyle="#ffe9a8"; g.strokeStyle="#241c14"; g.lineWidth=2;
    g.beginPath(); g.moveTo(bx,by+8); g.lineTo(bx-6,by); g.lineTo(bx+6,by); g.closePath(); g.fill(); g.stroke();
  }
  g.restore();
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
  const size=chk==="me"?60:64;
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
  const x=e.tx*T+T/2, y=e.ty*T+T;
  const bob=Math.sin(TICK/14+e.tx)*2;
  g.fillStyle="rgba(0,0,0,.22)";g.fillRect(x-13,y-5,26,5);
  const s=creatureSpriteSpec(e.cr),im=s&&s.img;
  if(s&&im&&im.complete&&im.naturalWidth){
    const sw=im.naturalWidth/s.cols,sh=im.naturalHeight/s.rows,size=e.cr==="methane"?66:58;
    g.drawImage(im,s.p[0]*sw,s.p[1]*sh,sw,sh,Math.round(x-size/2),Math.round(y-size+bob),size,size);
  }else{
    g.font="26px serif";g.textAlign="center";g.textBaseline="alphabetic";g.fillText(CREM[e.cr]||"❓",x,y-6+bob);g.textAlign="left";
  }
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
  oki:{n:"오키섬",x:.843,y:.492}
};
const OKIISL=[[.828,.478,.030],[.795,.512,.018],[.845,.520,.016],[.862,.470,.012]];

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
  ulleung:{n:"울릉도 포구",short:"울릉도",x:.459,y:.100,dockable:true,
    story:"성인봉이 솟은 울릉도입니다. 맑은 날에는 동남쪽 수평선 너머 자산도를 바라볼 수 있습니다.",fact:"울릉도와 독도의 거리는 약 87km입니다."},
  dokdo:{n:"자산도 바위섬",short:"독도",x:.578,y:.156,dockable:false,
    story:"동도와 서도, 수많은 바위가 거센 물결을 막아 섭니다.",fact:"안전한 큰 포구가 없어 바람과 파도를 먼저 살펴야 합니다."},
  oki:{n:"오키섬 포구",short:"오키",x:.843,y:.492,dockable:true,
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
  {from:"oki",to:"busan",title:"부산포로 돌아가시오",arrival:"부산포",desc:"긴 항해 끝에 조선의 산줄기가 보인다",after:"leg_home"}
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
    startSea(PREP.leg,PREP.water,PREP.food);
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
    ships.push({x:p.x,y:p.y,u,lane:p.lane,dx:ux,dy:uy,du:.00014+(i%3)*.000035,type:i%3,nation:i%3===0?"japan":"joseon",
      name:["일본 연안 어선","조선 화물선","연안 어선"][i%3],seen:false});
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
  quest(L.title);ui();updateGauge(0);updateDockControl();
  flash("출항! 배는 화면 중심에 있습니다. 오른쪽 해도로 항로를 확인하십시오.");
}
function toggleSailTrim(){
  if(G.mode!=="sea"||!SEA.active||SEA.arrived)return;
  SEA.trim=SEA.trim>.8?.50:1;
  flash(SEA.trim>.8?"돛을 모두 펼쳤소. 물결을 타고 속도가 오릅니다!":"돛을 절반 걷었소. 암초와 항구에 접근하기 좋습니다.");
  updateGauge(0);
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
  if(SEA.nearDock){b.disabled=false;b.classList.add("ready");b.textContent="입항 · "+SEA.nearDock.p.short;}
  else{b.disabled=true;b.classList.remove("ready");b.textContent="입항 불가";}
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
  const t=SEAPT[SEA.target],dx=t.x-SEA.x,dy=t.y-SEA.y,len=Math.hypot(dx,dy)||1;SEA.hx=dx/len;SEA.hy=dy/len;SEA.x+=SEA.hx*.012;SEA.y+=SEA.hy*.012;SEA.active=true;SEA.dockCooldown=300;
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
    s.u+=s.du;if(s.u>.94){s.u=.06;s.seen=false;}
    let p=waterLanePoint(a,b,s.u,s.lane);
    for(let n=0;!p&&n<20;n++){s.u+=.004;if(s.u>.94)s.u=.06;p=waterLanePoint(a,b,s.u,s.lane);}
    if(p&&!onLand(p.x,p.y)){s.x=p.x;s.y=p.y;s.lane=p.lane;}
    const d=Math.hypot(SEA.x-s.x,SEA.y-s.y);
    if(s.nation==="japan"&&!SEA.japanWarned&&SEA.days>.10&&d<.18&&G.mode==="sea"){
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
}
function onLand(x,y){return inPoly(x,y,KOREA)||inPoly(x,y,JAPAN)||inPoly(x,y,MATSUE);}
function inPoly(x,y,pts){
  let c=false;for(let i=0,j=pts.length-1;i<pts.length;j=i++){
    const xi=pts[i][0],yi=pts[i][1],xj=pts[j][0],yj=pts[j][1];
    if(((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi))c=!c;
  }return c;
}
function flash(m){SEA.msg=m;SEA.msgT=170;}

function seaWorldScale(){return Math.max(950,Math.min(VW/.38,VH/.26));}
function seaPoint(x,y){const s=seaWorldScale();return [VW*.5+(x-SEA.x)*s,VH*.54+(y-SEA.y)*s];}
function drawOceanClose(){
  const storm=SEA.inStorm,px=Math.max(4,Math.min(8,Math.round(Math.min(VW,VH)/125)));
  g.fillStyle=storm?"#0a3045":"#075779";g.fillRect(0,0,VW,VH);g.save();
  const bands=storm?["#0d3b50","#11516a","#1b6178"]:["#08668a","#0b7094","#1781a2"];
  for(let y=0,row=0;y<VH+px*8;y+=px*7,row++){
    const shift=(Math.floor(TICK*1.35)+row*px*5)%(px*18),bob=((Math.floor(TICK*.42)+row)%3)*px;
    g.fillStyle=bands[row%bands.length];
    for(let x=-px*20;x<VW+px*20;x+=px*18){
      const xx=Math.floor((x+shift)/px)*px,yy=Math.floor((y+bob)/px)*px;
      g.fillRect(xx,yy,px*7,px);g.fillRect(xx+px*7,yy+px,px*3,px);g.fillRect(xx-px*3,yy+px,px*3,px);
    }
  }
  g.globalAlpha=storm?.28:.42;g.fillStyle=storm?"#9fc7d0":"#a8e2e8";
  for(let i=0;i<120;i++){
    const speed=1+(i%3),x=Math.floor((((i*97+TICK*speed*1.8)%(VW+px*12))-px*6)/px)*px;
    const y=Math.floor((((i*53+(i%5)*px*9)%(VH+px*8))-px*4)/px)*px;
    g.fillRect(x,y,px*(i%4===0?3:1),px);
  }
  g.globalAlpha=.22;g.fillStyle="#032f4d";
  for(let i=0;i<70;i++){const x=(i*151+Math.floor(TICK*.8))%(VW+px*6)-px*3,y=(i*71)%(VH+px*4)-px*2;g.fillRect(Math.floor(x/px)*px,Math.floor(y/px)*px,px*2,px);}
  g.restore();
}
function drawWorldPoly(pts){
  g.beginPath();pts.forEach((p,i)=>{const q=seaPoint(p[0],p[1]);i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]);});g.closePath();
  g.strokeStyle="#d4c28d";g.lineWidth=18;g.stroke();g.fillStyle="#78905c";g.fill();g.strokeStyle="#40543c";g.lineWidth=4;g.stroke();
}
function drawIslandWorld(p,r,col="#879b65"){
  const c=seaPoint(p.x,p.y),s=seaWorldScale();g.beginPath();
  for(let i=0;i<=18;i++){const a=i/18*Math.PI*2,rr=r*(.78+.18*Math.sin(i*2.3+1));const x=c[0]+Math.cos(a)*rr*s,y=c[1]+Math.sin(a)*rr*s*.82;i?g.lineTo(x,y):g.moveTo(x,y);}g.closePath();
  g.strokeStyle="#d4c28d";g.lineWidth=10;g.stroke();g.fillStyle=col;g.fill();g.strokeStyle="#40543c";g.lineWidth=3;g.stroke();
}
function drawLocalLand(){
  drawWorldPoly(KOREA);drawWorldPoly(JAPAN);drawWorldPoly(MATSUE);
  OKIISL.forEach(o=>drawIslandWorld({x:o[0],y:o[1]},o[2]));drawIslandWorld(SEAPT.ulleung,.014,"#789b5f");drawIslandWorld(SEAPT.dokdo,.007,"#8d8972");
  drawIslandWorld({x:SEAPT.dokdo.x+.015,y:SEAPT.dokdo.y+.003},.0043,"#8d8972");
}
function drawCoastLabels(){
  g.save();g.textAlign="center";g.font="800 15px Pretendard,sans-serif";
  for(const key of ["ulsan","gyeongju","pohang","uljin","gangneung"]){
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
      g.fillStyle="#514d46";g.strokeStyle="#262a2b";g.lineWidth=3;g.beginPath();g.moveTo(q[0]-r*.5,q[1]+r*.28);g.lineTo(q[0]-r*.16,q[1]-r*.52);g.lineTo(q[0]+r*.08,q[1]-r*.14);g.lineTo(q[0]+r*.42,q[1]-r*.36);g.lineTo(q[0]+r*.58,q[1]+r*.32);g.closePath();g.fill();g.stroke();
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
  const sideX=-hy,sideY=hx,unit=Math.max(3,Math.round(size*.015));g.save();g.globalAlpha=alpha;g.fillStyle="#dff7fb";
  for(let side=-1;side<=1;side+=2)for(let k=0;k<12;k++){
    const d=size*(.14+k*.068),spread=side*size*(.055+k*.021),flick=((Math.floor(TICK*.9)+k)%3-1)*unit;
    const xx=x-hx*d+sideX*(spread+flick),yy=y-hy*d+sideY*(spread+flick),w=unit*(k%4===0?3:2);
    g.fillRect(Math.round(xx/unit)*unit,Math.round(yy/unit)*unit,w,unit);
  }
  g.globalAlpha=alpha*.42;for(let k=0;k<16;k++){
    const d=size*(.18+k*.048),w=((k*7+Math.floor(TICK*.7))%9-4)*unit;
    g.fillRect(Math.round((x-hx*d+sideX*w)/unit)*unit,Math.round((y-hy*d+sideY*w)/unit)*unit,unit,unit);
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
  g.save();g.globalAlpha=.28;g.fillStyle="#d9f3f6";const step=Math.max(100,VW/8),unit=4;
  for(let x=step/2;x<VW;x+=step)for(let y=step/2;y<VH;y+=step){const ph=(TICK*1.15+x*.4+y*.2)%step,cx=x+Math.cos(SEA.wind)*(ph-step/2),cy=y+Math.sin(SEA.wind)*(ph-step/2);for(let j=0;j<5;j++)g.fillRect(Math.round((cx+Math.cos(SEA.wind)*j*unit)/unit)*unit,Math.round((cy+Math.sin(SEA.wind)*j*unit)/unit)*unit,unit,unit);}g.restore();
}
function drawFleetLocal(){
  for(const s of SEA.npcs){if(onLand(s.x,s.y))continue;const q=seaPoint(s.x,s.y);if(q[0]<-150||q[0]>VW+150||q[1]<-150||q[1]>VH+150)continue;const size=Math.max(105,Math.min(190,Math.min(VW,VH)*.27)),ang=Math.atan2(s.dy,s.dx);drawWake(q[0],q[1],s.dx,s.dy,size,.43);drawShipSprite(SPRITE_IMAGES.ship_npc,s.type,q[0],q[1],size,ang,.94);if(Math.hypot(SEA.x-s.x,SEA.y-s.y)<.052){g.font="700 11px Pretendard,sans-serif";g.textAlign="center";g.lineWidth=4;g.strokeStyle="rgba(3,18,27,.85)";g.strokeText(s.name,q[0],q[1]-size*.37);g.fillStyle="#f4e6c8";g.fillText(s.name,q[0],q[1]-size*.37);g.textAlign="left";}}
  if(SEA.chase&&!onLand(SEA.chase.x,SEA.chase.y)){const q=seaPoint(SEA.chase.x,SEA.chase.y),t=SEAPT[SEA.target],ang=Math.atan2(t.y-SEA.chase.y,t.x-SEA.chase.x),size=Math.max(125,Math.min(205,Math.min(VW,VH)*.29));drawWake(q[0],q[1],Math.cos(ang),Math.sin(ang),size,.5);drawShipSprite(SPRITE_IMAGES.ship_npc,0,q[0],q[1],size,ang);}
}
function drawWeatherOverlay(){
  if(!SEA.inStorm)return;g.save();g.fillStyle="rgba(3,13,23,.18)";g.fillRect(0,0,VW,VH);g.strokeStyle="rgba(220,239,245,.37)";g.lineWidth=1.4;
  for(let i=0;i<90;i++){const x=(i*83+TICK*7)%(VW+100)-50,y=(i*47+TICK*13)%(VH+100)-50;g.beginPath();g.moveTo(x,y);g.lineTo(x-14,y+29);g.stroke();}if(TICK%170<3){g.fillStyle="rgba(235,247,255,.18)";g.fillRect(0,0,VW,VH);}g.restore();
}
function drawMiniMap(){
  if(VW<620&&!SEA.mapExpanded)return;
  const w=SEA.mapExpanded?Math.min(470,VW*.58):Math.min(260,VW*.25),h=w*.61,x=VW-w-12,y=SEA.mapExpanded?Math.max(76,(VH-h)/2):VH-h-112;
  g.save();g.fillStyle="rgba(7,29,42,.94)";g.strokeStyle="#d3b884";g.lineWidth=3;g.fillRect(x,y,w,h);g.strokeRect(x,y,w,h);g.beginPath();g.rect(x+4,y+4,w-8,h-8);g.clip();
  const mp=p=>[x+p[0]*w,y+p[1]*h],fp=(pts,c)=>{g.beginPath();pts.forEach((p,i)=>{const q=mp(p);i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]);});g.closePath();g.fillStyle=c;g.fill();};
  fp(KOREA,"#78905c");fp(JAPAN,"#78905c");fp(MATSUE,"#78905c");OKIISL.forEach(o=>{g.beginPath();g.arc(x+o[0]*w,y+o[1]*h,o[2]*w,0,7);g.fillStyle="#78905c";g.fill();});
  g.setLineDash([5,5]);g.strokeStyle="#d9a441";g.lineWidth=1.5;const L=LEGS[SEA.leg],a=SEAPT[L.from],b=SEAPT[L.to];g.beginPath();g.moveTo(x+a.x*w,y+a.y*h);g.lineTo(x+b.x*w,y+b.y*h);g.stroke();g.setLineDash([]);
  for(const p of Object.values(PORTS)){if(!p.dockable)continue;g.fillStyle="#e9ddbd";g.fillRect(x+p.x*w-1.5,y+p.y*h-1.5,3,3);}
  for(const s of SEA.npcs){if(onLand(s.x,s.y))continue;g.fillStyle="#9ccbd6";g.fillRect(x+s.x*w-1,y+s.y*h-1,2,2);}
  const t=SEAPT[SEA.target];g.strokeStyle="#f1c75d";g.lineWidth=2;g.beginPath();g.arc(x+t.x*w,y+t.y*h,6+Math.sin(TICK*.08)*2,0,7);g.stroke();
  g.fillStyle="#c9422f";g.strokeStyle="#fff0c8";g.lineWidth=1.5;g.beginPath();g.arc(x+SEA.x*w,y+SEA.y*h,5,0,7);g.fill();g.stroke();g.restore();
  g.fillStyle="#f2e3c2";g.font="800 10px Pretendard,sans-serif";g.textAlign="left";g.fillText(SEA.mapExpanded?"동해 항로도 · 항구와 주변 선박":"항로도",x+10,y+16);
}
function drawSea(){
  drawOceanClose();drawLocalLand();drawCoastLabels();
  if(SEA.trail.length>1){g.save();g.beginPath();SEA.trail.forEach((p,i)=>{const q=seaPoint(p[0],p[1]);i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]);});g.strokeStyle="rgba(220,247,252,.26)";g.lineWidth=2;g.setLineDash([4,7]);g.stroke();g.restore();}
  drawLocalPorts();drawHazardsLocal();drawLegendSigns();drawTargetGuide();drawWindField();drawFleetLocal();
  const cx=VW*.5,cy=VH*.54,size=Math.max(165,Math.min(330,Math.min(VW,VH)*.45)),ang=Math.atan2(SEA.hy,SEA.hx),state=SEA.hull<=52?2:(SEA.trim<.8?1:0);
  drawWake(cx,cy,SEA.hx,SEA.hy,size,.84);drawShipSprite(SPRITE_IMAGES.ship_player,state,cx,cy,size,ang);drawWeatherOverlay();drawMiniMap();
  const vig=g.createRadialGradient(VW/2,VH/2,Math.min(VW,VH)*.24,VW/2,VH/2,Math.max(VW,VH)*.73);vig.addColorStop(.55,"rgba(0,0,0,0)");vig.addColorStop(1,"rgba(0,8,15,.36)");g.fillStyle=vig;g.fillRect(0,0,VW,VH);
  if(SEA.msgT>0){SEA.msgT--;const w=Math.min(VW*.72,610),y=Math.max(88,VH-112);g.fillStyle="rgba(31,24,17,.91)";g.strokeStyle="#d3b884";g.lineWidth=2;g.fillRect(VW/2-w/2,y-38,w,38);g.strokeRect(VW/2-w/2,y-38,w,38);g.font="700 "+Math.max(12,Math.min(16,VW*.015))+"px Pretendard,sans-serif";g.textAlign="center";g.fillStyle="#fff0c8";g.fillText(SEA.msg,VW/2,y-14);g.textAlign="left";}
}
function updateGauge(dot){
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
    default: step();
  }
}
function endTalk(){
  clearInterval(typing); typing=null;
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
function doShake(){ const s=$("#stage"); s.classList.remove("shake"); void s.offsetWidth; s.classList.add("shake"); }
function drawMemoryActors(){
  const c=$("#memory-canvas");if(!c)return;
  const x=c.getContext("2d"),W=c.width,H=c.height;
  x.clearRect(0,0,W,H);x.imageSmoothingEnabled=false;
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
  const it=DEX[id], w=$("#stamp"),visual=creatureSpriteSpec(id)?creatureHTML(id,"creature-stamp"):EVIDENCE_SPRITES[id]?evidenceHTML(id,"evidence-stamp"):DEX_ATLAS[id]?atlasHTML(DEX_ATLAS[id],"atlas-stamp",it.n):`<div class="em">${it.em}</div>`;
  w.innerHTML=`<div class="scard"><div class="k">도 감 기 록</div>${visual}
    <div class="n">${it.n}</div><div class="d">${it.d}</div><div class="seal">記<br>錄</div></div>`;
  hydrateAtlasSprites(w);
  w.classList.remove("hide");
  w.onclick=dismissStamp;
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
function startCatch(ent){
  G.lastMode="field";
  CG={ent,pos:0,dir:1,speed:1.35,tries:3,zone:0,perfect:0};
  const it=DEX[ent.cr];
  const zw=22+Math.random()*10, zs=18+Math.random()*54;
  CG.zone=[zs,zs+zw]; CG.perfect=[zs+zw*0.36,zs+zw*0.64];
  const el=$("#catch");
  el.innerHTML=`<div class="ccard">
    ${creatureHTML(ent.cr,"creature-catch")}
    <h3>${it.n}</h3>
    <p>${CATCHLINE[ent.cr]}</p>
    <div class="track" id="tr">
      <div class="zone" style="left:${CG.zone[0]}%;width:${CG.zone[1]-CG.zone[0]}%"></div>
      <div class="zone perfect" style="left:${CG.perfect[0]}%;width:${CG.perfect[1]-CG.perfect[0]}%"></div>
      <div class="needle" id="nd" style="left:0%"></div>
    </div>
    <div class="ctry" id="ctry">기회 ● ● ●</div>
    <button class="btn red" id="cbtn">${catchButtonLabel(ent.cr)}</button>
    <button class="btn ghost" id="cesc" style="margin-left:8px">물러난다</button>
  </div>`;
  el.classList.remove("hide"); G.mode="catch"; ui();
  $("#cbtn").onclick=catchHit;
  $("#cesc").onclick=()=>{ el.classList.add("hide"); CG=null; G.mode="field"; ui(); };
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
function catchHit(){
  if(!CG) return;
  const p=CG.pos, ok=p>=CG.zone[0]&&p<=CG.zone[1], perf=p>=CG.perfect[0]&&p<=CG.perfect[1];
  if(ok){
    $("#catch").classList.add("hide");
    const cr=CG.ent.cr; CG.ent.gone=true; G.caught.push(cr); CG=null;
    G.lastMode="field";
    G.pending=()=>{ G.mode="field"; ui(); checkDokdoDone(); };
    play(sq(
      nar(caughtNarration(cr,perf)),
      got(cr),
      dokdoCatchLine(cr)
    ));
  }else{
    CG.tries--;
    $("#ctry").textContent="기회 "+"● ".repeat(CG.tries)+"○ ".repeat(3-CG.tries);
    doShake();
    if(CG.tries<=0){
      $("#catch").classList.add("hide"); CG=null; G.mode="field"; ui();
      G.lastMode="field";
      play(say("yi","","놓쳤구먼. 괜찮여, 바다는 도망 안 간다니께.","숨 고르고 다시 해보쇼."));
    }else{ CG.speed+=0.25; }
  }
}
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
    play(SC.strange_ship());
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
  x.clearRect(0,0,canvas.width,canvas.height);x.fillStyle="#10232f";x.fillRect(0,0,canvas.width,canvas.height);x.imageSmoothingEnabled=false;
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
      <div class="debater player"><canvas class="debate-face" id="debate-player-face" width="180" height="180"></canvas><b>${esc(G.name)}</b><span>도감에서 근거를 찾는 중</span></div>
      <div class="debate-center"><div class="bubble"><span class="who">오 키 섬 관 리 · 질 문 ${DB.i+1}/${CLAIMS.length}</span>“${c.say}”</div>${reply}</div>
      <div class="debater official"><canvas class="debate-face" id="debate-official-face" width="180" height="180"></canvas><b>오키섬 관리</b><span>${fb?(fb.correct?"근거를 인정함":"근거를 반박함"):"문서를 심문 중"}</span></div>
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
    DB.used.push(id);DB.feedback={correct:true,text:c.ok,restart:false};renderDebate();
  }else{
    DB.hp--; doShake();
    DB.feedback={correct:false,text:(c.wrong&&c.wrong[id])||c.no,restart:DB.hp<=0};renderDebate();
  }
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
  run(()=>{ G.flags.statueSeen=true;resetEntities(); enterMap("busan",5,7,"r"); quest("부두 끝의 사내에게 말을 걸어 보시오"); })
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
SC.chat_yb_trial=()=>say("yb","조용히","괜찮소. 법을 어겼다면 벌은 달게 받겠소.","허나 내가 한 말은 한 마디도 거두지 않겠소.");
SC.chat_nh_trial=()=>say("nh","","{name}, 자네 손에 든 그것은 무엇인가.","…어쩌면 그것이 저 사람을 살릴지도 모르네.");
SC.chat_yi_trial=()=>say("yi","낮게","{name}, 우리가 바다에서 본 걸 빠짐없이 보여 주시오.","용복 형님이 왜 그 먼 길을 건넜는지, 기록이 대신 말해 줄 것이오.");

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
  nar("물결 너머로 낯선 돛이 점점 커진다. 일본 어선이 조선 연안 쪽으로 뱃머리를 틀며 그물을 내리려 한다."),
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
  run(()=>{ resetEntities(); enterMap("oki",13,14,"u"); quest("성하길을 따라 오키섬 성문 안으로 들어가시오"); })
);

SC.enter_oki_castle=()=>sq(
  nar("묵직한 성문이 열리고, 두꺼운 석벽 사이의 통로가 모습을 드러낸다. 나무 복도를 지나자 다다미 접견실과 문서방이 이어진다."),
  say("yb","성 안을 살피며","{name}, 여기서부터는 한마디 한마디가 전부 문서로 남소.","서두르지 말고 근거를 차분히 고르시오."),
  run(()=>{ enterMap("okicastle",13,12,"u"); quest("성 안의 일본 관리에게 자료를 제시하시오"); })
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
  nar("부산포. 사람들이 배를 맞는다. 그러나 곧 관원들이 앞을 막는다."),
  say("gw","","안용복! 나라의 허락도 없이 국경을 넘었다!","게다가 남의 나라에서 관리 행세를 했다는 말까지 들린다!"),
  say("yi","막아서며","이 사람이 뭘 잘못했다고요! 우리 섬 지키고 오는 길인디!"),
  say("yb","손을 들어 말린다","…괜찮소. 물러서시오."),
  say("cp","","기록되지 않은 일은, 없던 일이 됩니다."),
  say("cp","","그대의 도감에는 모든 것이 적혀 있습니다. 관원에게 말을 거십시오."),
  run(()=>{ resetEntities(); enterMap("busan2",20,8,"l"); quest("관원에게 말을 걸어 안용복을 변호하시오"); })
);

SC.trial=()=>sq(
  say("gw","","이 자는 벼슬도 없는 몸으로 남의 나라에 들어가 조선의 이름을 팔았다.","할 말이 있는가."),
  ask([
    {t:"“그냥 두세요. 저는 상관없는 사람이에요.”",then:sq(
      say("gw","","…그렇다면 물러서라."),
      say("nh","조용히","{name}, 자네 손에 든 그것은 무엇인가.","보이지 않으면, 없는 것이 되네."),
      say("cp","","다시 선택하십시오."),
      {k:"goto",f:()=>play(SC.trial())}
    )},
    {t:"“안용복 아저씨는 잘못한 게 없어요!”",then:sq(
      say("gw","","말로 하는 변호는 듣지 않는다.","증좌를 대라. 종이로 가져오란 말이다."),
      say("cp","","말이 아니라 기록을 내미십시오."),
      {k:"goto",f:()=>play(SC.trial())}
    )},
    {t:"【도감을 펼쳐 기록을 내민다】",then:SC_present()}
  ])
);
function SC_present(){
  return sq(
    nar("도감을 펼친다. 탐사선에서 조사한 독도의 생태 기록과 여러 장의 역사 자료가 차례로 드러난다."),
    say("me","","강치와 괭이갈매기, 살오징어와 흑돔, 도화새우, 부채뿔산호까지 전부 독도 바다에서 직접 만났어요.","사철나무와 해국, 섬기린초도 그 거센 바닷바람 속에서 살고 있었고요."),
    say("me","","바닷속에서는 메탄 하이드레이트도 봤어요.","독도는 그냥 바위섬 두 개가 아니라, 어마어마한 생태계를 품은 바다예요."),
    say("me","","그리고 이건 1454년 《세종실록》 〈지리지〉, 이건 1531년 〈팔도총도〉예요.","조선이 아주 오래전부터 울릉도와 우산도, 두 섬을 적고 그려 왔다는 증거예요."),
    say("me","","1693년에 조선 어민들이 울릉도에 갔다는 기록도 있어요.","다만 이건 백성이 오갔다는 보조 자료지, 나라가 허락한 정착이나 공식 관리를 뜻하지는 않아요."),
    say("me","","더 중요한 건 1694년 장한상의 수토 기록이에요.","조선은 백성을 뭍으로 부르면서도 관원을 보내 섬을 계속 살폈어요. 쇄환은 섬을 버린 게 아니었어요."),
    say("me","","여기에 울릉도에서 자산도를 직접 본 기록과, 일본 배가 남기고 간 벌목·어업 흔적도 함께 있어요.","자료마다 무엇을 말해 주는지 나눠서 봐야 해요."),
    say("me","","그리고… 마지막으로 이거요."),
    nar("마지막 두루마리. 오키섬 관리가 제 손으로 적고 도장을 찍은 《조선지팔도》 문서."),
    say("me","","일본 관리가 안용복 아저씨의 말을 직접 듣고 적은 문서예요.","‘울릉도와 자산도는 조선 강원도에 속한다’고 안용복이 말했다는 사실이, 일본 쪽 기록에도 그대로 남아 있는 거예요."),
    {k:"shake"},
    say("gw","문서를 받아들고","…이 글씨는."),
    say("gw","","일본 관리의 붓이다. 조선 사람이 쓴 것이 아니야."),
    nar("관원이 오래 침묵한다."),
    say("gw","","…이 자가 나라의 허락 없이 바다를 건넌 것은 분명한 죄다."),
    say("gw","","허나 이 문서는, 조정이 몇 해를 두고도 받아내지 못한 것이다."),
    say("gw","붓을 든다","죄는 죄대로, 공은 공대로 적겠다.","조정에 올려 판단을 받게 하겠다."),
    say("yb","돌아본다","{name}… 어느 틈에 이런 것을 다 적어 두었소."),
    say("me","","아저씨가 그랬잖아요. 본 사람이 많아야 한다고.","그래서 하나도 안 빼고 다 적어 뒀어요."),
    say("yb","오래 웃는다","허허… 허허."),
    say("yb","","그렇구려. 그게 바로 지키는 것이오."),
    say("nh","","기억은 흩어지고, 기록은 남네.","오늘 자네가 한 일이 바로 그것일세."),
    rec("실제 역사에서 안용복은 귀국 후 국경을 넘고 관리를 사칭한 죄로 조사와 처벌을 받았다. 에도 막부의 일본인 울릉도 도해금지 조치는 그의 1696년 도일보다 앞선 그해 1월에 내려졌고, 안용복의 1696년 진술은 오키섬 일본 측 조사 기록으로 오늘까지 전한다."),
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
    setGameClock(2026,8,2,15,42);resetEntities();arrangeReunion();enterMap("suyeong",12,13,"u");G.inputLock=true;
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
function crewIdCode(){
  let hash=1696;for(const ch of (G.name||"탐험대원"))hash=(Math.imul(hash,31)+ch.charCodeAt(0))>>>0;
  return `DT-1696-${String(hash%100000).padStart(5,"0")}`;
}
function crewPassHTML(extraClass=""){
  const recordKeys=Object.keys(DEX).filter(k=>k!=="badge"),found=recordKeys.filter(k=>G.dex.includes(k)).length;
  return `<div class="crew-pass ${extraClass}">
    <div class="crew-pass-head"><div class="crew-pass-mark">獨島</div><div class="crew-pass-title"><small>1 6 9 6 · 東 海</small><b>독도 시간탐험대 대원증</b></div></div>
    <div class="crew-pass-body"><div class="crew-pass-name"><small>대 원 이 름</small><strong>${esc(G.name||"탐험대원")}</strong><div class="crew-pass-role">안용복의 항해에 함께해 독도의 생태와 역사 기록을 완성한 대원</div></div><div class="crew-pass-seal">임무<br>완료</div></div>
    <div class="crew-pass-meta"><span><small>발급 번호</small><b>${crewIdCode()}</b></span><span><small>도감 기록</small><b>${found} / ${recordKeys.length}</b></span><span><small>발급일</small><b>2026. 08. 02.</b></span></div>
  </div>`;
}
function buildPrintPack(){
  const recordKeys=Object.keys(DEX).filter(k=>k!=="badge"&&G.dex.includes(k));let sections="";
  CATS.forEach(cat=>{const keys=recordKeys.filter(k=>DEX[k].c===cat);if(!keys.length)return;
    sections+=`<section class="print-cat"><h2>${esc(cat)}</h2><div class="print-grid">${keys.map(k=>{const v=DEX[k];return `<article class="print-entry"><h3>${esc(v.n)}</h3><p>${esc(v.d)}</p></article>`;}).join("")}</div></section>`;
  });
  $("#print-pack").innerHTML=`<section class="print-cover"><div class="print-kicker">독 도 시 간 탐 험 대</div><h1>대원증 · 시간탐험 도감</h1><p class="print-lead">1696년의 항해에서 모은 생태와 역사 기록을 함께 발급합니다.</p><div class="print-card-cut">${crewPassHTML("print-pass")}</div><p class="print-summary">발급 대원 ${esc(G.name||"탐험대원")} · 수록 도감 ${recordKeys.length} / ${Object.keys(DEX).filter(k=>k!=="badge").length}<br>점선을 따라 자르면 실제 대원증 크기로 보관할 수 있습니다.</p></section><main class="print-dex"><header><small>DOKDO TIME EXPEDITION</small><h1>시간탐험 도감</h1><p>${esc(G.name||"탐험대원")} 대원이 직접 확인하고 수집한 기록</p></header>${sections}</main>`;
}
function printExplorerPack(){
  if(!G.dex.includes("badge")){flash("임무를 완료하면 대원증을 발급할 수 있습니다.");return;}
  buildPrintPack();const pack=$("#print-pack");pack.setAttribute("aria-hidden","false");window.print();
}
addEventListener("afterprint",()=>{const pack=$("#print-pack");if(pack)pack.setAttribute("aria-hidden","true");});
const DEX_RETURN_MODES=new Set(["title","field","sea","talk","port","prep","ending"]);
let dexOpener=null;
function openDex(){
  const el=$("#dex");
  if(!el.classList.contains("hide")){const existing=$("#dxc");if(existing){try{existing.focus({preventScroll:true});}catch(_){existing.focus();}}return;}
  dexOpener=document.activeElement;
  G.overlayReturnMode=G.mode; G.mode="overlay"; resetInput(); ui();
  const issued=G.dex.includes("badge"),recordKeys=Object.keys(DEX).filter(k=>k!=="badge"),collected=recordKeys.filter(k=>G.dex.includes(k)).length;
  let h=`<div class="dexh"><h2 id="dex-title">시간탐험 도감</h2><span style="font-family:var(--serif);color:var(--paper-2);font-size:14px">기록 ${collected} / ${recordKeys.length}</span>
    <div class="dex-actions"><button class="ibtn" id="dx-print" ${issued?"":"disabled"}>${issued?"대원증·도감 PDF 저장":"임무 완료 후 PDF 발급"}</button><button class="ibtn" id="dxc" aria-label="시간탐험 도감 닫기">닫기</button></div></div>
    <div class="dex-scroll"><div class="dex-pass-wrap">${issued?crewPassHTML("dex-pass"):`<div class="crew-id-pending"><b>독도 시간탐험대 대원증</b><span>임무를 완료하면 수집한 도감과 함께 PDF로 발급할 수 있습니다.</span></div>`}</div><div class="dexg">`;
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
  if(issued)$("#dx-print").onclick=printExplorerPack;
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
    <canvas id="route" width="720" height="470"></canvas>
    <p class="q" style="font-size:15px;margin-top:12px">〈안용복 항로도〉 1696년<br>부산포 → 울릉도 → 자산도 → 오키섬 → 부산포 → 수영사적공원 · 모두 ${G.day}일</p>
    ${crewPassHTML("ending-pass")}
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
      · 장한상 수토 기록을 안용복 일행이 자료 카드로 지니고 일본 관리와 논박하는 구성, 유일부·뇌헌의 성격과 대사, 시간문과 시간 나침반, 생태 조사 장면은 학습을 위한 창작입니다.</div>
    <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:18px">
      <button class="btn" id="e-dex">도감·대원증 보기</button>
      <button class="btn" id="e-print">대원증·도감 PDF 저장</button>
      <button class="btn red" id="e-again">처음부터 다시</button>
    </div><p class="pdf-note">태블릿에서는 기기의 인쇄 화면이 열리며, 그곳에서 PDF 저장 또는 공유를 선택할 수 있습니다.</p></div>`;
  $("#ending").classList.remove("hide");
  drawRoute();
  $("#e-dex").onclick=openDex;
  $("#e-print").onclick=printExplorerPack;
  $("#e-again").onclick=()=>location.reload();
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
  const legs=[["busan","ulleung"],["ulleung","dokdo"],["dokdo","oki"],["oki","busan"]];
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
function loop(){
  TICK++;
  if(G.mode==="field"){
    tryMove();
    if(P.moving){
      const sp=P.map==="dokdo"?4.4:3.2;
      P.px+=P.fx*sp; P.py+=P.fy*sp;
      if(Math.abs(P.px-P.tx*T)<sp&&Math.abs(P.py-P.ty*T)<sp){ P.px=P.tx*T;P.py=P.ty*T;P.moving=false; }
    }
    // 생물 배회
    if(TICK%42===0) (ENT[P.map]||[]).forEach(e=>{
      if(!e.wander||e.gone) return;
      const d=[[0,1],[0,-1],[1,0],[-1,0]][Math.random()*4|0];
      const nx=e.tx+d[0], ny=e.ty+d[1];
      if(!solidAt(P.map,nx,ny)&&!entityAt(P.map,nx,ny)&&!(nx===P.tx&&ny===P.ty)){ e.tx=nx;e.ty=ny; }
    });
    if(P.map==="dokdo"&&!G.flags.dokdoDone) quest(`탐사선을 몰아 독도의 생물과 해저 자원 ${DOKDO_TARGETS.length}종을 조사하시오 (${G.caught.length}/${DOKDO_TARGETS.length})`);
    drawField();
  } else if(G.mode==="talk"){
    if(G.talkReturnMode==="sea"||G.talkReturnMode==="port") drawSea(); else drawField();
  } else if(G.mode==="sea"){ seaStep(); drawSea(); }
  else if(G.mode==="catch"&&CG){
    CG.pos+=CG.dir*CG.speed;
    if(CG.pos>100){CG.pos=100;CG.dir=-1} if(CG.pos<0){CG.pos=0;CG.dir=1}
    const n=$("#nd"); if(n) n.style.left=CG.pos+"%";
    drawField();
  }
  requestAnimationFrame(loop);
}

/* ---------- 시작 ---------- */
$("#b-start").onclick=()=>{
  const v=$("#pname").value.trim();
  G.name=v||"탐험대원";
  $("#title").classList.add("hide");
  fit(); resetEntities();
  setGameClock(2026,8,2,10,0);enterMap("suyeong",12,13,"u");
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
