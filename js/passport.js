"use strict";
/* ==========================================================
   독도 시간탐험대 v18 · 시간탐험대 여권
   표지 → 안내 · 인적사항 → 여정 지도 → 도장(인물 · 생물과 자원 · 전설 · 기록)
   → 기재사항(모은 포인트) · 메모 → 뒤표지
   화면에서는 책처럼 넘겨 보고, 같은 여권을 PDF(인쇄)로 저장한다.
   game.js의 G · DEX · CLOCK · DOKDO_SCORE · CATCH_TIER · esc · $ 를 그대로 쓴다.
   ========================================================== */

/* ---------- 도장 그림 아틀라스(assets/passport-stamps.png, 6×5칸) ---------- */
const PP_ICONS=["yb","pd","nh","yi","ok","ho","gangchi","gull","abalone","seaweed","cod","spindle","blackporgy","egret","petrel",
  "bluedamselfish","aster","ghosttunicate","stonecrop","fancoral","pinkshrimp","squid","methane","dragonScale","cheoyongCharm","bambooGift","manpaGift"];
const PP_ICON_COLS=6,PP_ICON_ROWS=5;
const PP_ISSUE={y:2026,m:8,d:2},PP_DEPART={y:1696,m:4,d:18};
const PP_MON=["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];

/* 도장에 찍을 장소와 짧은 이름 */
const PP_PLACE={yb:"부산포",pd:"울릉도",nh:"부산포",yi:"부산포",ok:"오키섬",ho:"오키섬",
  cheoyongCharm:"울산 앞바다",dragonScale:"감포 앞바다",bambooGift:"동해 한가운데",manpaGift:"동해 한가운데",
  sejong:"울릉도",paldo:"울릉도",sight:"울릉도",life:"울릉도",suto:"울릉도",trace:"독도",okidoc:"오키섬",ban:"오키섬"};
const PP_SHORT={gangchi:"강치",cheoyongCharm:"처용의 바람 부적",dragonScale:"호국룡의 비늘",bambooGift:"신비한 대나무",manpaGift:"만파식적",
  sejong:"세종실록 지리지",paldo:"팔도총도",sight:"울릉도에서 본 자산도",life:"울릉도 왕래 기록",suto:"장한상 수토 기록",
  trace:"일본 어선 흔적",okidoc:"오키섬 조사 문서",ban:"울릉도 도해금지"};
/* 기록 도장: 가운데 한자와 기록이 만들어진 해 */
const PP_RECORD={sejong:["錄","1454"],paldo:["圖","1531"],sight:["見","1696"],life:["往","1693"],suto:["搜","1694"],trace:["痕","1696"],okidoc:["文","1696"],ban:["禁","1696"]};
/* 잉크 색: 인물 빨강, 바다 생물 파랑, 식물 초록, 바닷새 청록, 해저 자원 보라, 전설 자주, 기록 주홍 */
const PP_INK={person:"#b3302b",sea:"#1f59a6",plant:"#2b774a",bird:"#0d737c",res:"#5a3da0",legend:"#8a3689",record:"#c33f28",depart:"#b3302b",arrive:"#1f4f9a"};
const PP_PLANTS=new Set(["seaweed","spindle","aster","stonecrop"]),PP_BIRDS=new Set(["gull","egret","petrel"]);
const PP_ROUTE=[["부산포","출발"],["울릉도",""],["자산도(독도)",""],["오키섬","일본"],["부산포 · 동래성","귀항"],["양양","관아 조사"],["수영사적공원","귀환"]];

/* ---------- 작은 도구 ---------- */
let PP_UID=0;const ppUid=()=>`pp${++PP_UID}`;
function ppHash(s){let h=2166136261;for(const ch of String(s)){h^=ch.codePointAt(0);h=Math.imul(h,16777619);}return h>>>0;}
function ppRand(seed){let a=seed>>>0;return()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function ppShuffle(arr,rnd){const a=arr.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
const ppName=()=>(G.name||"탐험대원").trim()||"탐험대원";
const ppDate=o=>`${o.y}. ${o.m}. ${o.d}.`;
const ppDateEn=o=>`${String(o.d).padStart(2,"0")} ${PP_MON[o.m-1]} ${o.y}`;
const ppLog=k=>(G.stampLog&&G.stampLog[k])||PP_DEPART;
const ppIssued=()=>G.dex.includes("badge");
function ppIconStyle(k){const i=PP_ICONS.indexOf(k);if(i<0)return"";return `--ix:${(i%PP_ICON_COLS)/(PP_ICON_COLS-1)*100}%;--iy:${Math.floor(i/PP_ICON_COLS)/(PP_ICON_ROWS-1)*100}%`;}
/* SVG 글자 폭이 넘치면 줄여서 맞춘다(한글 1자 ≈ 글자 크기) */
function ppTextFit(text,size,max){const w=[...text].reduce((s,c)=>s+(/[\u0000-\u00ff]/.test(c)?.55:1),0)*size;return w>max?` textLength="${max}" lengthAdjust="spacingAndGlyphs"`:"";}

/* ---------- 한글 이름 로마자 표기(국어의 로마자 표기법, 음절 단위) ---------- */
const RR_I=["g","kk","n","d","tt","r","m","b","pp","s","ss","","j","jj","ch","k","t","p","h"];
const RR_V=["a","ae","ya","yae","eo","e","yeo","ye","o","wa","wae","oe","yo","u","wo","we","wi","yu","eu","ui","i"];
const RR_F=["","k","k","k","n","n","n","t","l","k","m","l","l","l","p","l","m","p","p","t","t","ng","t","t","k","t","p","t"];
const RR_SUR={김:"KIM",이:"LEE",박:"PARK",최:"CHOI",정:"JUNG",강:"KANG",조:"CHO",윤:"YOON",장:"JANG",임:"LIM",한:"HAN",오:"OH",서:"SEO",신:"SHIN",
  권:"KWON",황:"HWANG",안:"AHN",송:"SONG",유:"YOO",류:"RYU",전:"JEON",홍:"HONG",고:"KO",문:"MOON",양:"YANG",손:"SON",배:"BAE",백:"BAEK",허:"HEO",
  남:"NAM",심:"SIM",노:"NOH",하:"HA",곽:"KWAK",성:"SUNG",차:"CHA",주:"JOO",우:"WOO",구:"KOO",민:"MIN",진:"JIN",나:"NA",지:"JI",엄:"EOM",채:"CHAE",
  원:"WON",천:"CHEON",방:"BANG",공:"KONG",현:"HYUN",함:"HAM",변:"BYUN",염:"YEOM",여:"YEO",추:"CHOO",도:"DO",소:"SO",석:"SEOK",선:"SUN",설:"SEOL",
  마:"MA",길:"GIL",연:"YEON",표:"PYO",명:"MYUNG",기:"KI",반:"BAN",왕:"WANG",금:"KEUM",옥:"OK",육:"YOOK",인:"IN",맹:"MAENG",제:"JE",모:"MO",탁:"TAK",
  국:"KOOK",은:"EUN",편:"PYUN",용:"YONG",예:"YE",경:"KYUNG",봉:"BONG",사:"SA",부:"BOO",황보:"HWANGBO",남궁:"NAMGUNG",제갈:"JEGAL",선우:"SEONWOO",
  독고:"DOKGO",사공:"SAGONG",서문:"SEOMUN"};
const RR_SUR2=["황보","남궁","제갈","선우","독고","사공","서문"];
function rrSyl(ch){const c=ch.charCodeAt(0)-0xAC00;if(c<0||c>11171)return /[A-Za-z0-9]/.test(ch)?ch:"";return RR_I[Math.floor(c/588)]+RR_V[Math.floor(c%588/28)]+RR_F[c%28];}
const rrWord=s=>[...s].map(rrSyl).join("").toUpperCase();
function ppNameParts(){
  const n=ppName().replace(/\s+/g," ");
  if(/^[\uAC00-\uD7A3]/.test(n)){
    const flat=n.replace(/ /g,""),two=RR_SUR2.find(p=>flat.startsWith(p)&&flat.length>=3),s=two||flat[0];
    return{sur:RR_SUR[s]||rrWord(s),given:rrWord(flat.slice(s.length))};
  }
  const parts=n.split(" ");
  return parts.length>1?{sur:rrWord(parts[parts.length-1]),given:rrWord(parts.slice(0,-1).join(""))}:{sur:rrWord(n)||"EXPLORER",given:""};
}
/* ---------- 기계 판독 영역(MRZ): ICAO 7·3·1 검사 숫자까지 실제 규칙대로 ---------- */
function mrzCheck(s){const w=[7,3,1];let t=0;[...s].forEach((c,i)=>{const v=c==="<"?0:/[0-9]/.test(c)?+c:c.charCodeAt(0)-55;t+=v*w[i%3];});return String(t%10);}
const mrzClean=s=>s.toUpperCase().replace(/[^A-Z0-9<]/g,"");
const ppPassportNo=()=>`T1696${String(ppHash(ppName())%10000).padStart(4,"0")}`;
function ppMRZ(parts){
  const l1=("PMDTE"+mrzClean(parts.sur)+"<<"+mrzClean(parts.given)).padEnd(44,"<").slice(0,44);
  const doc=ppPassportNo().slice(0,9),d1=doc+mrzCheck(doc),b1="960418"+mrzCheck("960418"),e1="991231"+mrzCheck("991231");
  const opt="DOKDO1696".padEnd(14,"<"),o1=opt+mrzCheck(opt);
  return[l1,d1+"KOR"+b1+"<"+e1+o1+mrzCheck(d1+b1+e1+o1)];
}

/* ---------- 모은 기록 ---------- */
function ppStats(){
  const all=Object.keys(DEX).filter(k=>k!=="badge"),has=k=>G.dex.includes(k);
  const cat=c=>{const list=all.filter(k=>DEX[k].c===c);return{all:list,got:list.filter(has)};};
  return{all,got:all.filter(has),people:cat("인물"),life:cat("독도의 생물과 자원"),legend:cat("동해안의 전설"),record:cat("기록"),
    score:(typeof DOKDO_SCORE!=="undefined"?DOKDO_SCORE.score:0),best:(typeof DOKDO_SCORE!=="undefined"?DOKDO_SCORE.best:0),days:G.day||0};
}

/* ==========================================================
   그림 조각: 표지 문장, 도장
   ========================================================== */
function ppEmblem(color="gold"){
  const id=ppUid(),gold=color==="gold",stroke=gold?`url(#${id}g)`:color,fill=gold?"#1b2a4c":"none";
  const petal="M0,-18 C-30,-24 -42,-58 -24,-78 C-15,-88 -5,-85 0,-76 C5,-85 15,-88 24,-78 C42,-58 30,-24 0,-18Z";
  const veins="M0,-24 L0,-66 M-7,-27 Q-12,-46 -17,-64 M7,-27 Q12,-46 17,-64";
  const petals=[0,72,144,216,288].map(r=>`<g transform="rotate(${r})"><path d="${petal}" fill="${fill}" stroke="${stroke}" stroke-width="2.6" stroke-linejoin="round"/><path d="${veins}" fill="none" stroke="${stroke}" stroke-width="1.3" stroke-linecap="round"/></g>`).join("");
  return `<svg class="pp-emblem" viewBox="0 0 200 222" aria-hidden="true">
    ${gold?`<defs><linearGradient id="${id}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f3dc95"/><stop offset=".48" stop-color="#c79d45"/><stop offset=".72" stop-color="#e9cc7d"/><stop offset="1" stop-color="#b98d38"/></linearGradient></defs>`:""}
    <g transform="translate(100,96)">${petals}
      <circle r="31" fill="${fill}" stroke="${stroke}" stroke-width="2.6"/><circle r="25.5" fill="none" stroke="${stroke}" stroke-width="1"/>
      <path d="M-20,9 L-15,-3 L-11,-14 L-7,-9 L-3,-3 L0,9Z M2,9 L6,1 L11,-6 L15,-2 L20,9Z" fill="${stroke}"/>
      <path d="M-22,14 q5.5,-3.5 11,0 t11,0 t11,0 t11,0 M-15,19.5 q5,-3 10,0 t10,0 t10,0" fill="none" stroke="${stroke}" stroke-width="1.8" stroke-linecap="round"/>
    </g>
    <path id="${id}r" d="M34,190 Q100,212 166,190" fill="none"/>
    <path d="M26,176 Q100,200 174,176 L182,196 Q100,222 18,196Z" fill="${fill}" stroke="${stroke}" stroke-width="2.2" stroke-linejoin="round"/>
    <path d="M26,176 L8,182 L16,188 L10,196 L18,196 M174,176 L192,182 L184,188 L190,196 L182,196" fill="none" stroke="${stroke}" stroke-width="2" stroke-linejoin="round"/>
    <text class="pp-ribbon" fill="${stroke}"><textPath href="#${id}r" startOffset="50%" text-anchor="middle">시간탐험대</textPath></text>
  </svg>`;
}
function ppChip(){return `<svg class="pp-chip" viewBox="0 0 40 26" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="2"><rect x="1.5" y="1.5" width="37" height="23" rx="3.5"/><circle cx="20" cy="13" r="6"/><path d="M1.5 13H14M26 13H38.5"/></g></svg>`;}

/* 도장 하나의 SVG. 잉크 결과 도장 그림을 모두 SVG mask로 처리한다.
   CSS mask는 크롬에서 인쇄(PDF)할 때 빠지므로 쓰지 않는다. */
function ppStampSVG(seed,ink,vb,body,iconKey=null,box=null){
  const id=ppUid(),[,,W,H]=vb.split(" ").map(Number),rnd=ppRand(ppHash(ppName()+seed+"ink"));
  const tx=-(6+rnd()*120),ty=-(6+rnd()*120);let ico="",fil="";
  const i=iconKey?PP_ICONS.indexOf(iconKey):-1;
  if(i>=0&&box){
    const cx=(i%PP_ICON_COLS)*160,cy=Math.floor(i/PP_ICON_COLS)*160;
    fil=`<mask id="${id}i" maskUnits="userSpaceOnUse" x="${cx}" y="${cy}" width="160" height="160"><image href="assets/passport-stamps.png" width="960" height="800"/></mask>`;
    ico=`<svg x="${box[0]}" y="${box[1]}" width="${box[2]}" height="${box[2]}" overflow="hidden" viewBox="${cx} ${cy} 160 160"><rect x="${cx}" y="${cy}" width="160" height="160" fill="${ink}" mask="url(#${id}i)"/></svg>`;
  }
  return `<svg viewBox="${vb}" aria-hidden="true"><defs><mask id="${id}m" maskUnits="userSpaceOnUse" x="-5" y="-5" width="${W+10}" height="${H+10}"><image href="assets/passport-ink.png" x="${tx.toFixed(1)}" y="${ty.toFixed(1)}" width="240" height="240" preserveAspectRatio="none"/></mask>${fil}</defs><g mask="url(#${id}m)">${body}${ico}</g></svg>`;
}
/* 생물과 자원: 둥근 도장 */
function ppStampCircle(k){
  const id=ppUid(),name=PP_SHORT[k]||DEX[k].n,stars="★".repeat((typeof CATCH_TIER!=="undefined"&&CATCH_TIER[k])||1);
  const top=k==="methane"?"獨島 해저 자원":PP_PLANTS.has(k)?"獨島 식물":PP_BIRDS.has(k)?"獨島 바닷새":"獨島 바다 생물";
  return ppStampSVG(k,ppInk(k),"0 0 100 100",`<defs><path id="${id}t" d="M13.5,50 A36.5,36.5 0 0 1 86.5,50"/><path id="${id}b" d="M8.2,50 A41.8,41.8 0 0 0 91.8,50"/></defs>
    <circle cx="50" cy="50" r="47" fill="none" stroke="currentColor" stroke-width="3.4"/><circle cx="50" cy="50" r="33.5" fill="none" stroke="currentColor" stroke-width="1.3"/>
    <text class="pp-t-arc"><textPath href="#${id}t" startOffset="50%">${esc(top)}</textPath></text>
    <text class="pp-t-arc"><textPath href="#${id}b" startOffset="50%">${ppDate(ppLog(k))}</textPath></text>
    <text x="9.6" y="52.6" class="pp-t-sep">✦</text><text x="90.4" y="52.6" class="pp-t-sep">✦</text>
    <text x="50" y="71.5" class="pp-t-name"${ppTextFit(name,8.2,52)}>${esc(name)}</text><text x="50" y="80" class="pp-t-star">${stars}</text>`,k,[31,21,38]);
}
/* 인물: 네모 입국 도장 */
function ppStampRect(k){
  const name=DEX[k].n,size=Math.min(12,40/[...name].length);
  return ppStampSVG(k,ppInk(k),"0 0 100 74",`
    <rect x="2" y="2" width="96" height="70" rx="6" fill="none" stroke="currentColor" stroke-width="3.2"/><rect x="6.8" y="6.8" width="86.4" height="60.4" rx="3" fill="none" stroke="currentColor" stroke-width="1.2"/>
    <line x1="6.8" y1="20" x2="93.2" y2="20" stroke="currentColor" stroke-width="1.2"/>
    <text x="11" y="16.2" class="pp-t-head pp-ta-s">人物</text><text x="89" y="16.2" class="pp-t-head pp-ta-e">${ppDate(ppLog(k))}</text>
    <text x="69" y="44" class="pp-t-big" style="font-size:${size.toFixed(1)}px">${esc(name)}</text>
    <line x1="52" y1="50" x2="86" y2="50" stroke="currentColor" stroke-width=".9"/>
    <text x="69" y="59" class="pp-t-small">${esc(PP_PLACE[k]||"")}</text>`,k,[8,22.2,37]);
}
/* 동해안의 전설: 팔각 도장 */
function ppStampOct(k){
  const name=PP_SHORT[k]||DEX[k].n;
  return ppStampSVG(k,ppInk(k),"0 0 100 100",`
    <path d="M30,3H70L97,30V70L70,97H30L3,70V30Z" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linejoin="round"/>
    <path d="M32.2,8.4H67.8L91.6,32.2V67.8L67.8,91.6H32.2L8.4,67.8V32.2Z" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>
    <text x="50" y="22.5" class="pp-t-head"${ppTextFit(PP_PLACE[k]||"",6.6,56)}>${esc(PP_PLACE[k]||"")}</text><text x="15.5" y="52.5" class="pp-t-sep">傳</text><text x="84.5" y="52.5" class="pp-t-sep">說</text>
    <text x="50" y="75" class="pp-t-name"${ppTextFit(name,8,66)}>${esc(name)}</text><text x="50" y="85.5" class="pp-t-small">${ppDate(ppLog(k))}</text>`,k,[30,24,40]);
}
/* 기록: 네모난 인장 */
function ppStampSeal(k){
  const [han,year]=PP_RECORD[k]||["記","1696"],name=PP_SHORT[k]||DEX[k].n;
  return ppStampSVG(k,ppInk(k),"0 0 100 100",`
    <rect x="3" y="3" width="94" height="94" rx="4" fill="none" stroke="currentColor" stroke-width="4.4"/><rect x="9.5" y="9.5" width="81" height="81" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.2"/>
    <text x="50" y="22" class="pp-t-head">記錄 · ${year}</text><text x="50" y="61" class="pp-t-han">${han}</text>
    <line x1="9.5" y1="69" x2="90.5" y2="69" stroke="currentColor" stroke-width="1.2"/>
    <text x="50" y="79.5" class="pp-t-name"${ppTextFit(name,7.4,74)}>${esc(name)}</text><text x="50" y="88" class="pp-t-small">${ppDate(ppLog(k))}</text>`);
}
const PP_SHAPE={"인물":["rect",ppStampRect,37,"person"],"독도의 생물과 자원":["circle",ppStampCircle,29,null],"동해안의 전설":["oct",ppStampOct,26,"legend"],"기록":["seal",ppStampSeal,23,"record"]};
function ppInk(k){const c=DEX[k].c;if(c!=="독도의 생물과 자원")return PP_INK[PP_SHAPE[c][3]];return PP_INK[k==="methane"?"res":PP_PLANTS.has(k)?"plant":PP_BIRDS.has(k)?"bird":"sea"];}

/* 도장 여러 개를 칸에 흩어 찍는다. 대원 이름으로 섞어서 사람마다 배치가 다르다 */
function ppStampField(keys,cols,rows,seed,top=14,bottom=131){
  const rnd=ppRand(ppHash(ppName()+seed)),cells=ppShuffle([...Array(cols*rows).keys()],rnd);
  const cw=90/cols,ch=(bottom-top)/rows;
  return keys.map((k,i)=>{
    const [shape,draw,w]=PP_SHAPE[DEX[k].c],cell=cells[i%cells.length],cx=5+(cell%cols+.5)*cw+(rnd()-.5)*cw*.22,cy=top+(Math.floor(cell/cols)+.5)*ch+(rnd()-.5)*ch*.2;
    const r=((rnd()-.5)*28).toFixed(1);
    return `<div class="pp-stamp pp-s-${shape}" role="img" aria-label="${esc(DEX[k].n)} 도장" style="--ink:${ppInk(k)};left:${cx.toFixed(2)}cqw;top:${cy.toFixed(2)}cqw;width:${w}cqw;--r:${r}deg;--d:${i*95}ms">${draw(k)}</div>`;
  }).join("");
}

/* ==========================================================
   쪽 만들기
   ========================================================== */
function ppCoverHTML(){
  return `<section class="pp-cover pp-front"><div class="pp-cover-grain"></div>
    <div class="pp-cover-title"><b>시간탐험대 여권</b><span>DOKDO TIME EXPEDITION</span><span>PASSPORT</span></div>
    ${ppEmblem()}<div class="pp-cover-chip">${ppChip()}</div></section>`;
}
function ppBackHTML(){
  return `<section class="pp-cover pp-back"><div class="pp-cover-grain"></div><div class="pp-back-emboss">${ppEmblem("rgba(0,0,0,.28)")}</div>
    <p class="pp-back-line">DOKDO TIME EXPEDITION</p></section>`;
}
const ppPageNo=n=>`<span class="pp-no">${n}</span>`;
const ppHead=(l,r)=>`<header class="pp-head"><span>${l}</span><b>${r}</b></header>`;

function ppNoticePage(){
  return `<section class="pp-page pp-left pp-notice">
    <div class="pp-notice-emblem">${ppEmblem("#2a4478")}</div>
    <p class="pp-notice-ko">독도 시간탐험대 대장은 이 여권을 지닌 대원이 1696년의 동해를 자유로이 오가고, 가는 곳마다 필요한 도움과 보호를 받으며, 오늘로 무사히 돌아올 수 있도록 관계자 여러분께 요청합니다.</p>
    <p class="pp-notice-en">The Captain of the Dokdo Time Expedition requests all whom it may concern to allow the bearer to pass freely across the East Sea of 1696, to afford the bearer every assistance and protection, and to see the bearer safely home to the present day.</p>
    <div class="pp-notice-sign"><span>독도 시간탐험대 대장</span><i class="pp-seal-sq">隊長<br>之印</i></div>
    ${ppPageNo(1)}</section>`;
}
function ppDataPage(){
  const parts=ppNameParts(),[m1,m2]=ppMRZ(parts),s=ppStats(),no=ppPassportNo(),row=(ko,en,v,cls="")=>`<div class="pp-f ${cls}"><small>${ko} / ${en}</small><b>${v}</b></div>`;
  return `<section class="pp-page pp-right pp-data">
    ${ppHead("여권 PASSPORT","독도 시간탐험대 DOKDO TIME EXPEDITION")}
    <div class="pp-photo"><i></i></div>
    <div class="pp-fields">
      <div class="pp-f3">${row("종류","Type","PM")}${row("발행국","Issuing","DTE")}${row("여권번호","Passport No.",no)}</div>
      ${row("성","Surname",esc(parts.sur))}${row("이름","Given names",esc(parts.given||"—"))}
      ${row("한글성명","Name in Korean",esc(ppName()),"pp-f-ko")}${row("국적","Nationality","대한민국 REPUBLIC OF KOREA")}
    </div>
    <div class="pp-fields2">
      ${row("시간문 통과일","Date of departure",ppDateEn(PP_DEPART))}${row("항해 일수","Days at sea",`${s.days}일`)}
      ${row("발급일","Date of issue",ppDateEn(PP_ISSUE))}${row("기간만료일","Date of expiry","기록이 남는 한")}
      ${row("발행관청","Authority","수영사적공원 시간문","pp-f-wide")}
    </div>
    <div class="pp-sign"><small>소지인 서명 / Signature of bearer</small><span class="pp-hand">${esc(ppName())}</span></div>
    <div class="pp-ghost" aria-hidden="true"><i></i></div>
    <div class="pp-seal-round" aria-label="임무 완료 도장"><b>任務完了</b><span>임무 완료</span><small>1696 東海</small></div>
    <svg class="pp-mrz" viewBox="0 0 440 34" aria-label="기계 판독 영역"><text x="0" y="13" textLength="440" lengthAdjust="spacing">${m1.replace(/</g,"&lt;")}</text><text x="0" y="31" textLength="440" lengthAdjust="spacing">${m2.replace(/</g,"&lt;")}</text></svg>
    ${ppPageNo(2)}</section>`;
}
function ppMapSheet(){
  const s=ppStats();
  return `<div class="pp-sheet pp-spread pp-mapsheet" data-name="여정 지도">
    <section class="pp-page pp-left">${ppHead("여정 기록 VOYAGE RECORD","1696")}
      <ol class="pp-route">${PP_ROUTE.map(([p,n])=>`<li><b>${p}</b>${n?`<small>${n}</small>`:""}</li>`).join("")}</ol>
      ${ppPageNo(3)}</section>
    <section class="pp-page pp-right">${ppHead("안용복의 독도 수호 여정","2026")}
      <p class="pp-map-cap">〈안용복 항로도〉 1696년<br>부산포에서 울릉도·자산도를 지나 오키섬까지 갔다가,<br>양양을 거쳐 오늘의 수영사적공원으로 돌아왔습니다.<br><b>모두 ${s.days}일</b></p>
      <div class="pp-stamp pp-s-trip" style="--ink:${PP_INK.depart};left:27cqw;top:112cqw;width:36cqw;--r:-9deg;--d:0ms" role="img" aria-label="1696년 4월 18일 부산포 출발 도장">
        ${ppStampSVG("depart",PP_INK.depart,"0 0 100 64",`<ellipse cx="50" cy="32" rx="47" ry="29" fill="none" stroke="currentColor" stroke-width="3.2"/><ellipse cx="50" cy="32" rx="40.5" ry="23" fill="none" stroke="currentColor" stroke-width="1.2"/>
        <text x="50" y="22" class="pp-t-head">出發 · DEPARTURE</text><text x="50" y="39" class="pp-t-big" style="font-size:12px">${ppDate(PP_DEPART)}</text><text x="50" y="49" class="pp-t-small">부산포</text>`)}</div>
      <div class="pp-stamp pp-s-trip" style="--ink:${PP_INK.arrive};left:69cqw;top:119cqw;width:40cqw;--r:7deg;--d:120ms" role="img" aria-label="2026년 8월 2일 수영사적공원 귀환 도장">
        ${ppStampSVG("arrive",PP_INK.arrive,"0 0 100 60",`<rect x="2" y="2" width="96" height="56" rx="5" fill="none" stroke="currentColor" stroke-width="3.2"/><path d="M8,20H92" stroke="currentColor" stroke-width="1.2"/>
        <text x="50" y="15" class="pp-t-head">歸還 · ARRIVAL</text><text x="50" y="36" class="pp-t-big" style="font-size:12px">${ppDate(PP_ISSUE)}</text>
        <path d="M20,44H74M68,40L75,44L68,48" fill="none" stroke="currentColor" stroke-width="1.4"/><text x="50" y="54" class="pp-t-small">수영사적공원 · 시간문</text>`)}</div>
      ${ppPageNo(4)}</section>
    <figure class="pp-map"><img src="assets/passport-map.jpg" width="2171" height="724" decoding="async" alt="안용복의 독도 수호 여정 지도(1696년)"></figure>
    <i class="pp-gutter"></i></div>`;
}
function ppStampPage(side,no,title,keys,total,cols,rows,seed){
  return `<section class="pp-page pp-${side} pp-visa">${ppHead("사증 VISAS",`${title} ${keys.length} / ${total}`)}
    ${keys.length?ppStampField(keys,cols,rows,seed):`<p class="pp-empty">이 쪽에는 아직 찍힌 도장이 없습니다.</p>`}${ppPageNo(no)}</section>`;
}
function ppEndorsePage(){
  const s=ppStats(),n=v=>v.toLocaleString();
  return `<section class="pp-page pp-left pp-endorse">${ppHead("AMENDMENTS AND ENDORSEMENTS","기재사항")}
    <div class="pp-e-points"><small>모은 포인트</small>
      <span class="pp-e-num"><span class="pp-hand pp-e-big">${n(s.score)}점</span><svg class="pp-e-ring" viewBox="0 0 200 80" preserveAspectRatio="none" aria-hidden="true"><path d="M30,44 C28,18 90,6 142,12 C184,17 196,40 178,58 C156,78 70,80 36,64 C18,55 22,34 52,24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg></span>
      <span class="pp-hand pp-e-sub">독도 생태 조사에서 모은 점수</span></div>
    <ul class="pp-e-lines">
      <li class="pp-hand">최고 연속 명중 ${n(s.best)}번</li>
      <li class="pp-hand">탐험 도감 ${s.got.length} / ${s.all.length} 기록</li>
      <li class="pp-hand">받은 도장 ${s.got.length}개<small>인물 ${s.people.got.length} · 생물과 자원 ${s.life.got.length} · 전설 ${s.legend.got.length} · 기록 ${s.record.got.length}</small></li>
      <li class="pp-hand">동해 항해 ${s.days}일</li>
    </ul>
    <div class="pp-e-confirm"><span class="pp-hand">위 기록이 사실임을 확인함.</span><span class="pp-hand pp-e-date">${ppDate(PP_ISSUE)}</span>
      <span class="pp-e-by"><small>확인</small><span class="pp-hand">안용복</span><i class="pp-seal-mini">確<br>認</i></span></div>
    ${ppPageNo(9)}</section>`;
}
function ppMemoPage(print){
  const memo=G.passportMemo||"";
  return `<section class="pp-page pp-right pp-memo">${ppHead("MEMO","메모")}
    <p class="pp-memo-hint">시간 여행에서 오래 기억하고 싶은 것을 적어 보세요.</p>
    ${print?`<div class="pp-memo-text pp-hand">${esc(memo)}</div>`:`<textarea class="pp-memo-text pp-hand" id="pp-memo" maxlength="300" spellcheck="false" aria-label="여권 메모" placeholder="여기에 적거나, 인쇄한 뒤 손으로 적어도 됩니다.">${esc(memo)}</textarea>`}
    ${ppPageNo(10)}</section>`;
}
/* 여권 전체: 한 장(sheet)은 펼친 두 쪽 크기. 표지와 뒤표지는 가운데에 닫힌 여권으로 놓는다 */
function ppSheets(print=false){
  const s=ppStats(),life1=s.life.got.slice(0,9),life2=s.life.got.slice(9),lr=[...s.legend.got,...s.record.got];
  const spread=(name,inner)=>`<div class="pp-sheet pp-spread" data-name="${name}">${inner}<i class="pp-gutter"></i></div>`;
  return[
    `<div class="pp-sheet pp-closed" data-name="표지">${ppCoverHTML()}</div>`,
    spread("인적사항",ppNoticePage()+ppDataPage()),
    ppMapSheet(),
    spread("도장 · 인물과 생물",ppStampPage("left",5,"인물",s.people.got,s.people.all.length,2,3,"people")+ppStampPage("right",6,"생물과 자원",life1,s.life.all.length,3,3,"life1")),
    spread("도장 · 자원과 기록",ppStampPage("left",7,"생물과 자원",life2,s.life.all.length,3,3,"life2")+ppStampPage("right",8,"전설 · 기록",lr,s.legend.all.length+s.record.all.length,3,4,"legrec")),
    spread("기재사항 · 메모",ppEndorsePage()+ppMemoPage(print)),
    `<div class="pp-sheet pp-closed" data-name="뒤표지">${ppBackHTML()}</div>`
  ];
}
/* 엔딩 · 도감 · 발급 창에 놓는 작은 여권 */
function passportMiniHTML(id="",still=false){return still?`<div class="pp-mini pp-mini-still" aria-hidden="true">${ppCoverHTML()}</div>`:`<button class="pp-mini" type="button"${id?` id="${id}"`:""} aria-label="시간탐험대 여권 펼치기">${ppCoverHTML()}</button>`;}

/* ==========================================================
   화면에서 넘겨 보기
   ========================================================== */
const PPV={open:false,i:0,half:"l",els:[],busy:false,returnMode:null,opener:null,seen:new Set()};
function ppViewer(){
  let v=$("#passport");if(v)return v;
  v=document.createElement("div");v.id="passport";v.className="hide";v.setAttribute("role","dialog");v.setAttribute("aria-modal","true");v.setAttribute("aria-label","시간탐험대 여권");
  v.innerHTML=`<header class="pp-bar"><b>시간탐험대 여권</b><span id="pp-where"></span>
      <div class="pp-actions"><button class="ibtn" id="pp-save" type="button">PDF로 저장</button><button class="ibtn" id="pp-close" type="button">닫기</button></div></header>
    <div class="pp-desk" id="pp-desk"><div class="pp-view" id="pp-view"><div class="pp-book" id="pp-book"></div></div></div>
    <nav class="pp-nav"><button class="pp-navbtn" id="pp-prev" type="button">이전 장</button><div class="pp-dots" id="pp-dots"></div><button class="pp-navbtn" id="pp-next" type="button">다음 장</button></nav>
    <p class="pp-foot">태블릿에서는 인쇄 화면이 열리면 그곳에서 PDF로 저장하거나 공유를 고르세요.</p>`;
  $("#stage").appendChild(v);
  $("#pp-close").onclick=closePassport;$("#pp-save").onclick=printPassport;
  $("#pp-prev").onclick=()=>ppStep(-1);$("#pp-next").onclick=()=>ppStep(1);
  const book=$("#pp-book");let sx=null,sy=0;
  book.addEventListener("pointerdown",e=>{if(e.target.closest("textarea"))return;sx=e.clientX;sy=e.clientY;});
  book.addEventListener("pointerup",e=>{
    if(sx===null)return;const dx=e.clientX-sx,dy=e.clientY-sy;sx=null;
    if(e.target.closest("textarea,.pp-map"))return;
    if(Math.abs(dx)>46&&Math.abs(dx)>Math.abs(dy)){ppStep(dx<0?1:-1);return;}
    if(Math.abs(dx)>8)return;
    const r=$("#pp-view").getBoundingClientRect(),x=(e.clientX-r.left)/r.width,cur=PPV.els[PPV.i];
    if(cur&&cur.classList.contains("pp-closed")){ppStep(PPV.i===0?1:-1);return;}
    if(x>.64)ppStep(1);else if(x<.36)ppStep(-1);
  });
  addEventListener("resize",()=>{if(PPV.open)ppLayout();});
  return v;
}
/* 넓은 화면은 펼친 두 쪽, 좁은 세로 화면(휴대폰)은 한 쪽씩 크게 보여 준다 */
const ppSingle=()=>{const v=$("#passport");return !!v&&v.classList.contains("pp-single");};
function ppLayout(){
  const desk=$("#pp-desk"),view=$("#pp-view"),book=$("#pp-book");if(!desk||!book)return;
  const r=desk.getBoundingClientRect(),single=r.width<r.height*.95;
  $("#passport").classList.toggle("pp-single",single);
  const w=single?Math.min((r.width-16)*2,(r.height-14)*250/176):Math.min(r.width-18,(r.height-14)*250/176,1280);
  book.style.width=`${Math.floor(Math.max(240,w))}px`;view.style.width=single?`${Math.floor(Math.max(240,w)/2)}px`:"";
  ppPlace(false);
}
function ppPlace(animate){
  const book=$("#pp-book");if(!book)return;const cur=PPV.els[PPV.i];
  book.classList.toggle("pp-slide",!!animate&&!ppReduced());
  book.style.transform=!ppSingle()||!cur?"":cur.classList.contains("pp-closed")?"translateX(-25%)":PPV.half==="r"?"translateX(-50%)":"";
}
/* 한 쪽 보기에서는 펼친 장의 왼쪽 → 오른쪽 쪽을 먼저 옮겨 다닌 뒤 다음 장으로 넘어간다 */
function ppStep(dir){
  if(PPV.busy)return;const cur=PPV.els[PPV.i];
  if(ppSingle()&&cur&&cur.classList.contains("pp-spread")){
    if(dir>0&&PPV.half==="l"){PPV.half="r";ppPlace(true);ppSync();return;}
    if(dir<0&&PPV.half==="r"){PPV.half="l";ppPlace(true);ppSync();return;}
  }
  ppGo(PPV.i+dir);
}
function openPassport(){
  if(!ppIssued()){if(typeof flash==="function")flash("임무를 완료하면 시간탐험대 여권이 발급됩니다.");return;}
  const v=ppViewer();PPV.opener=document.activeElement;
  if(!PPV.open){PPV.returnMode=G.mode;G.mode="passport";if(typeof resetInput==="function")resetInput();if(typeof ui==="function")ui();}
  PPV.open=true;PPV.i=0;PPV.half="l";PPV.busy=false;PPV.seen=new Set();
  const book=$("#pp-book");book.innerHTML="";
  PPV.els=ppSheets(false).map((html,i)=>{const t=document.createElement("template");t.innerHTML=html.trim();const el=t.content.firstElementChild;
    if(el.querySelector(".pp-visa .pp-stamp,.pp-s-trip"))el.classList.add("pp-fresh");el.hidden=i!==0;book.appendChild(el);return el;});
  const memo=$("#pp-memo");if(memo)memo.addEventListener("input",()=>{G.passportMemo=memo.value;});
  book.querySelectorAll(".pp-map").forEach(m=>m.addEventListener("click",e=>{e.stopPropagation();if(typeof openJourneyMap==="function")openJourneyMap();}));
  $("#pp-dots").innerHTML=PPV.els.map((el,i)=>`<button type="button" class="pp-dot" data-i="${i}" aria-label="${el.dataset.name}"></button>`).join("");
  $("#pp-dots").querySelectorAll(".pp-dot").forEach(b=>b.onclick=()=>{if(+b.dataset.i===PPV.i){if(PPV.half!=="l"){PPV.half="l";ppPlace(true);ppSync();}}else ppGo(+b.dataset.i,"l");});
  v.classList.remove("hide");ppLayout();ppSync();
  requestAnimationFrame(()=>{ppLayout();try{$("#pp-next").focus({preventScroll:true});}catch(_){}});
}
function closePassport(){
  const v=$("#passport");if(!v||v.classList.contains("hide"))return;
  const memo=$("#pp-memo");if(memo)G.passportMemo=memo.value;
  v.classList.add("hide");PPV.open=false;PPV.busy=false;$("#pp-book").innerHTML="";PPV.els=[];
  G.mode=PPV.returnMode||"ending";PPV.returnMode=null;if(typeof resetInput==="function")resetInput();if(typeof ui==="function")ui();
  const o=PPV.opener;PPV.opener=null;if(o&&o.isConnected){try{o.focus({preventScroll:true});}catch(_){}}
}
function ppSync(){
  const el=PPV.els[PPV.i];$("#pp-where").textContent=`${el.dataset.name} · ${PPV.i+1} / ${PPV.els.length}`;
  const sp=ppSingle()&&el.classList.contains("pp-spread");
  $("#pp-prev").disabled=PPV.i===0;$("#pp-next").disabled=PPV.i===PPV.els.length-1&&!(sp&&PPV.half==="l");
  $("#pp-next").textContent=PPV.i===0?"여권 펼치기":"다음 장";
  $("#pp-dots").querySelectorAll(".pp-dot").forEach((d,i)=>d.setAttribute("aria-current",i===PPV.i?"true":"false"));
  if(el.classList.contains("pp-fresh")&&!PPV.seen.has(PPV.i)){PPV.seen.add(PPV.i);el.classList.remove("pp-fresh");el.classList.add("pp-drop");}
}
const ppReduced=()=>matchMedia("(prefers-reduced-motion: reduce)").matches;
function ppClone(el){
  const c=el.cloneNode(true),map={};c.hidden=false;c.removeAttribute("id");c.classList.remove("pp-drop");
  c.querySelectorAll("[id]").forEach(n=>{const nid=ppUid()+"c";map[n.id]=nid;n.id=nid;});
  c.querySelectorAll("[href],[mask],[filter],[fill],[stroke]").forEach(n=>["href","mask","filter","fill","stroke"].forEach(a=>{
    const v=n.getAttribute(a);if(!v||v.indexOf("#")<0)return;
    const m=v.match(/#([\w-]+)/);if(m&&map[m[1]])n.setAttribute(a,v.replace("#"+m[1],"#"+map[m[1]]));
  }));
  const src=el.querySelector("textarea"),dst=c.querySelector("textarea");if(src&&dst){dst.value=src.value;dst.tabIndex=-1;}
  return c;
}
/* 펼친 쪽끼리는 가운데 접힌 곳을 축으로 한 장을 넘기고, 표지는 부드럽게 바꾼다 */
function ppGo(to,half){
  if(PPV.busy||to<0||to>=PPV.els.length||to===PPV.i)return;
  const book=$("#pp-book"),a=PPV.els[PPV.i],b=PPV.els[to],fwd=to>PPV.i;
  const done=()=>{a.hidden=true;b.hidden=false;PPV.i=to;PPV.half=half||(fwd||!ppSingle()?"l":"r");PPV.busy=false;
    book.querySelectorAll(".pp-fx").forEach(n=>n.remove());ppPlace(false);ppSync();};
  if(ppReduced()){done();return;}
  PPV.busy=true;
  if(!ppSingle()&&Math.abs(to-PPV.i)===1&&a.classList.contains("pp-spread")&&b.classList.contains("pp-spread")){
    b.hidden=false;
    const still=ppClone(a);still.classList.add("pp-fx","pp-half-"+(fwd?"l":"r"));
    const flip=document.createElement("div");flip.className="pp-fx pp-flip";
    const front=ppClone(fwd?a:b),back=ppClone(fwd?b:a);front.classList.add("pp-face","pp-half-r");back.classList.add("pp-face","pp-face-back","pp-half-l");
    flip.append(front,back);a.hidden=true;book.append(still,flip);
    const anim=flip.animate([{transform:`rotateY(${fwd?0:-180}deg)`},{transform:`rotateY(${fwd?-180:0}deg)`}],{duration:720,easing:"cubic-bezier(.45,.05,.3,1)"});
    anim.onfinish=done;anim.oncancel=done;return;
  }
  if(ppSingle()){ /* 한 쪽 보기: 지금 쪽이 사라진 뒤 자리를 옮기고 새 쪽을 띄운다 */
    a.classList.add("pp-fx-out");
    setTimeout(()=>{a.classList.remove("pp-fx-out");a.hidden=true;PPV.i=to;PPV.half=half||(fwd?"l":"r");ppPlace(false);
      b.hidden=false;b.classList.add("pp-fade-in");setTimeout(()=>{b.classList.remove("pp-fade-in");done();},340);},280);
    return;
  }
  b.hidden=false;b.classList.add("pp-fade-in");a.classList.add("pp-fx-out");
  setTimeout(()=>{a.classList.remove("pp-fx-out");b.classList.remove("pp-fade-in");done();},360);
}
/* 여권이 열려 있으면 방향키로 넘기고 Esc로 닫는다. 메모를 쓰는 동안에는 글자 입력을 막지 않는다 */
addEventListener("keydown",e=>{
  if(!PPV.open)return;
  if(e.target&&e.target.tagName==="TEXTAREA"){if(e.key==="Escape"){e.target.blur();e.stopPropagation();}else e.stopPropagation();return;}
  if(e.key==="Escape"){e.preventDefault();e.stopPropagation();closePassport();return;}
  if(e.key==="ArrowRight"||e.key==="PageDown"){e.preventDefault();e.stopPropagation();ppStep(1);return;}
  if(e.key==="ArrowLeft"||e.key==="PageUp"){e.preventDefault();e.stopPropagation();ppStep(-1);return;}
  if(["ArrowUp","ArrowDown"," ","Enter"].includes(e.key)&&!(e.target&&e.target.tagName==="BUTTON")){e.preventDefault();e.stopPropagation();}
  else e.stopPropagation();
},true);

/* ==========================================================
   PDF(인쇄)로 저장
   ========================================================== */
function ppWaitImages(root){
  const imgs=[...root.querySelectorAll("img")].map(im=>im.complete?Promise.resolve():new Promise(r=>{im.onload=im.onerror=r;}));
  const css=["assets/passport-stamps.png","assets/passport-ink.png","assets/passport-leather.png","assets/portraits-main.png","assets/passport-map.jpg"].map(src=>new Promise(r=>{const im=new Image();im.onload=im.onerror=r;im.src=src;}));
  return Promise.all([...imgs,...css]);
}
function ppWaitFonts(){
  if(!document.fonts||!document.fonts.load)return Promise.resolve();
  const loads=[document.fonts.load('40px "Nanum Pen Script"',"모은포인트 0123456789점 안용복"),document.fonts.load('40px "Song Myung"',"시간탐험대 여권"),document.fonts.load('20px "Gowun Batang"',"독도")];
  return Promise.race([Promise.all(loads).catch(()=>{}),new Promise(r=>setTimeout(r,2500))]);
}
async function printPassport(){
  if(!ppIssued()){if(typeof flash==="function")flash("임무를 완료하면 시간탐험대 여권이 발급됩니다.");return;}
  const memo=$("#pp-memo");if(memo)G.passportMemo=memo.value;
  const pack=$("#print-pack"),btn=$("#pp-save");
  if(btn){btn.disabled=true;btn.textContent="준비 중…";}
  pack.innerHTML=`<div class="pp-print">${ppSheets(true).join("")}</div>`;pack.setAttribute("aria-hidden","false");
  try{await Promise.all([ppWaitImages(pack),ppWaitFonts()]);}catch(_){}
  if(btn){btn.disabled=false;btn.textContent="PDF로 저장";}
  window.print();
}
addEventListener("afterprint",()=>{const pack=$("#print-pack");if(pack)pack.setAttribute("aria-hidden","true");});
