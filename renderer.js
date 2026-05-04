const { ipcRenderer } = require('electron');

const canvas = document.getElementById('pet');
const ctx = canvas.getContext('2d');
const SCALE = 2;
const W = canvas.width  / SCALE;  // 64
const H = canvas.height / SCALE;  // 74

// ── Palette ───────────────────────────────────────────────────────────────
const PAL = [
  null,       // 0  transparent
  '#FFEAE0',  // 1  SKIN
  '#F4B8C4',  // 2  HAIR  (light pink)
  '#D88CAA',  // 3  HAIR_D (shadow)
  '#FFFFFF',  // 4  WHITE
  '#FFE0EC',  // 5  HAIR_H (highlight)
  '#C89818',  // 6  EYE   (amber/gold)
  '#1A1A1A',  // 7  DARK
  '#34C8B0',  // 8  TIE   (teal)
  '#F2F2F2',  // 9  SHIRT
  '#1E2030',  // 10 SKIRT
  '#C8DCFF',  // 11 HALO
  '#FF8090',  // 12 MOUTH (inside)
  '#DCDCDC',  // 13 SHIRT_S
];

const SKIN=1,HAIR=2,HAIR_D=3,WHITE=4,HAIR_H=5,EYE=6,DARK=7,TIE=8,SHIRT=9,SKIRT=10,HALO=11,MOUTH=12,SHIRT_S=13;

function buildFrame(blink) {
  const g = Array.from({length:H}, ()=>new Array(W).fill(0));
  const px  = (r,c,v) => { if(r>=0&&r<H&&c>=0&&c<W) g[r][c]=v; };
  const box = (r1,c1,r2,c2,v) => {
    for(let r=r1;r<=r2;r++) for(let c=c1;c<=c2;c++) px(r,c,v);
  };

  // ── 1. LONG PINK HAIR (drawn first — face skin covers centre) ───────────
  box(4,  19, 14, 45, HAIR);     // hair crown
  box(12,  6, 73, 21, HAIR);     // left long hair
  box(12, 43, 73, 58, HAIR);     // right long hair
  // crown highlight
  box(5, 22, 11, 38, HAIR_H);
  // shadow edges
  box(12,  6, 73,  8, HAIR_D);
  box(12, 56, 73, 58, HAIR_D);
  box(4,  19, 14, 20, HAIR_D);

  // Ahoge (small top spike)
  px(3,32,HAIR); box(4,31,6,33,HAIR);

  // ── 2. HALO (double oval ring above head) ──────────────────────────────
  // outer ring
  for(let c=23;c<=41;c++) { px(0,c,HALO); px(4,c,HALO); }
  px(1,21,HALO); px(1,43,HALO);
  px(2,20,HALO); px(2,44,HALO);
  px(3,21,HALO); px(3,43,HALO);
  // inner ring
  for(let c=26;c<=38;c++) { px(1,c,HALO); px(3,c,HALO); }
  px(2,25,HALO); px(2,39,HALO);

  // ── 3. FACE SKIN ────────────────────────────────────────────────────────
  box(10, 20, 17, 44, SKIN);    // forehead
  box(17, 18, 40, 46, SKIN);    // main face
  box(40, 21, 44, 43, SKIN);    // chin
  box(44, 26, 47, 38, SKIN);    // chin point

  // ── 4. EYEBROWS ─────────────────────────────────────────────────────────
  box(15, 20, 16, 29, DARK);
  px(15,20,SKIN); px(15,29,SKIN);
  box(15, 35, 16, 44, DARK);
  px(15,35,SKIN); px(15,44,SKIN);

  // ── 5. EYES ─────────────────────────────────────────────────────────────
  if(blink) {
    // both eyes briefly closed
    box(18,20,20,29,DARK);
    box(18,35,20,44,DARK);
  } else {
    // LEFT eye — fully open, amber iris
    box(17,20,18,29,DARK);         // thick top lash
    box(18,20,27,29,EYE);          // iris (amber)
    box(20,22,25,27,DARK);         // pupil
    px(18,20,WHITE); px(19,21,WHITE);  // sparkle
    for(let c=20;c<=29;c++) px(27,c,DARK);  // bottom lash
    px(20,19,DARK); px(23,19,DARK);          // side lashes

    // RIGHT eye — happy squint (signature expression)
    for(let c=35;c<=44;c++) { px(17,c,DARK); px(18,c,DARK); }  // thick top lash
    px(19,35,DARK); px(19,44,DARK);
    for(let c=36;c<=43;c++) px(20,c,DARK);   // lower curve
    px(21,37,DARK); px(21,42,DARK);
  }

  // ── 6. NOSE ─────────────────────────────────────────────────────────────
  px(31,29,SKIN); px(31,35,SKIN);   // subtle nostril shadow

  // ── 7. MOUTH — open laugh/smile ─────────────────────────────────────────
  px(34,25,DARK); px(34,38,DARK);       // smile corners (raised)
  for(let c=26;c<=37;c++) px(35,c,DARK); // upper lip
  box(36,26,39,37,MOUTH);                // open mouth interior (pink)
  for(let c=27;c<=36;c++) px(39,c,DARK); // lower lip
  px(40,29,DARK); px(40,34,DARK);        // lower curve

  // ── 8. NECK ─────────────────────────────────────────────────────────────
  box(47, 28, 53, 36, SKIN);

  // ── 9. SHIRT + COLLAR ───────────────────────────────────────────────────
  box(50, 12, 62, 52, SHIRT);        // shirt body
  // V-neck opening (skin shows)
  box(50, 28, 58, 36, SKIN);
  // Left collar flap
  box(50, 16, 57, 30, SHIRT);
  // Right collar flap
  box(50, 34, 57, 48, SHIRT);
  // Collar fold lines (hint of edge)
  for(let r=50;r<=56;r++) { px(r,28-(r-50)/2|0,SHIRT_S); px(r,36+(r-50)/2|0,SHIRT_S); }

  // ── 10. TIE (teal) ──────────────────────────────────────────────────────
  box(49, 29, 53, 35, TIE);    // knot (wider)
  box(53, 30, 62, 34, TIE);    // tail (narrower)

  // ── 11. SKIRT (dark, pleated) ───────────────────────────────────────────
  box(60, 10, 73, 54, SKIRT);
  // pleat lines
  for(let c=14;c<=52;c+=5) box(61,c,73,c,DARK);

  return g;
}

const frameNormal = buildFrame(false);
const frameBlink  = buildFrame(true);

// ── Animation ─────────────────────────────────────────────────────────────
function rand(a,b){return a+Math.random()*(b-a);}
let isBlinking=false, nextBlink=Date.now()+rand(2500,5000);

function draw(frame){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.save();
  ctx.fillStyle='rgba(0,0,0,0.12)';
  ctx.beginPath();
  ctx.ellipse(64,canvas.height-5,26,5,0,0,Math.PI*2);
  ctx.fill();
  ctx.restore();
  for(let r=0;r<H;r++) for(let c=0;c<W;c++){
    const v=frame[r][c];
    if(v){ctx.fillStyle=PAL[v]; ctx.fillRect(c*SCALE,r*SCALE,SCALE,SCALE);}
  }
}

function animate(){
  const now=Date.now();
  if(!isBlinking&&now>=nextBlink){
    isBlinking=true;
    setTimeout(()=>{isBlinking=false;nextBlink=Date.now()+rand(3000,6000);},120);
  }
  draw(isBlinking?frameBlink:frameNormal);
  requestAnimationFrame(animate);
}
animate();

// ── Drag ──────────────────────────────────────────────────────────────────
let dragging=false,ox=0,oy=0;
canvas.addEventListener('mousedown',async e=>{
  if(e.button!==0)return;
  dragging=true;
  const pos=await ipcRenderer.invoke('get-window-position');
  ox=e.screenX-pos[0]; oy=e.screenY-pos[1];
  e.preventDefault();
});
window.addEventListener('mousemove',e=>{
  if(!dragging)return;
  ipcRenderer.send('set-window-position',{x:e.screenX-ox,y:e.screenY-oy});
});
window.addEventListener('mouseup',()=>{dragging=false;});
canvas.addEventListener('contextmenu',e=>{e.preventDefault();ipcRenderer.send('show-context-menu');});
