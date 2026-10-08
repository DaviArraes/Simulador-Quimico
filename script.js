const $=q=>document.querySelector(q),$$=q=>[...document.querySelectorAll(q)];
const S={M:30,A:70,F:5,T:28,H:60,W:10},cl=(v,a,b)=>Math.max(a,Math.min(b,v));
const tot=()=>S.M+S.A+S.F||1,conc=()=>S.M/tot(),fr=()=>S.F/tot();
const R=()=>{const c=Math.min(1,conc()*(1+3*fr()));return 97*c*c/(.0484+c*c)};
const P=()=>+(45*Math.pow(Math.max(0,(conc()-.5)/.5),2)+10*Math.max(0,(fr()-.12)/.2)).toFixed(1);
const K=()=>Math.max(.004,(.012+.0022*Math.max(0,S.T-12))*(1.3-S.H/100)*(1-2.2*fr()));
const eff=d=>R()*Math.exp(-K()*d),rad=d=>(.8+2.4*R()/100)*Math.exp(-K()*d);
const f1=v=>v.toFixed(1).replace('.',',');
const mixTxt=()=>`${S.M}:${S.A}:${S.F} ml`;
let ac;function beep(f,d=.12){try{ac=ac||new AudioContext();const o=ac.createOscillator(),g=ac.createGain();o.frequency.value=f;o.type='triangle';g.gain.value=.05;o.connect(g);g.connect(ac.destination);o.start();g.gain.exponentialRampToValueAtTime(.0001,ac.currentTime+d);o.stop(ac.currentTime+d)}catch(e){}}

/* controles */
const sl=(id,n,u,mn,mx,v,st)=>`<label>${n}<div class=row><input type=range id=s${id} min=${mn} max=${mx} step=${st} value=${v}><input type=number id=n${id} min=${mn} max=${mx} step=${st} value=${v} aria-label="${n}"><span>${u}</span></div></label>`;
$('#ctl').innerHTML=sl('M','Manipueira purificada','ml',0,100,S.M,.5)+sl('A','Água','ml',0,100,S.A,.5)+sl('F','Fixador natural (sabão de coco)','ml',0,20,S.F,.5);
$('#rn').innerHTML=sl('W','Chuva','mm/dia',0,60,S.W,1);
$('#clm').innerHTML=sl('T','Temperatura','°C',15,42,S.T,1)+sl('H','Umidade relativa','%',20,95,S.H,1);
['M','A','F','T','H','W'].forEach(k=>['s','n'].forEach(p=>$('#'+p+k).addEventListener('input',e=>{const el=$('#n'+k);S[k]=cl(parseFloat(e.target.value)||0,+el.min,+el.max);$('#s'+k).value=S[k];if(p=='s')el.value=S[k];sync();if(k=='M'||k=='A'||k=='F')beep(300+S[k]*4,.05)})));
function sync(){$('#oC').textContent=f1(conc()*100)+'%';$('#oR').textContent=f1(R())+'%';$('#oP').textContent=f1(P())+'%';$('#fm').textContent=mixTxt();$('#mm').textContent=mixTxt();
$('#ev').textContent=f1(K()*100)+'% ao dia';let d=0;while(d<=14&&eff(d)>=R()/2)d+=.25;$('#vu').textContent=d>14?'mais de 14 dias':f1(d)+' dias';$('#r0').textContent=f1(rad(0))+' m';if(room=='mon')drawMon();if(room=='rain')drawRain();if(room=='cmp')drawCmp()}

/* navegação */
let room='lab';
function go(r){room=r;$$('.room').forEach(x=>x.classList.toggle('on',x.id==r+'-r'));$$('#nav button').forEach(b=>b.classList.toggle('on',b.dataset.r==r));if(r=='field')resetF();if(r=='mon')drawMon();sync();beep(520)}
$('#nav').onclick=e=>{if(e.target.dataset.r)go(e.target.dataset.r)};
$('#go').onclick=()=>go('field');

/* gráficos */
function chart(cv,sers,xm,ym){const c=cv.getContext('2d'),w=cv.width,h=cv.height,L=44,B=26,T=10,Rr=12;c.clearRect(0,0,w,h);c.font='12px Chakra Petch,system-ui';c.lineWidth=1;
for(let i=0;i<=4;i++){const y=T+(h-T-B)*i/4;c.strokeStyle='#2d2d33';c.beginPath();c.moveTo(L,y);c.lineTo(w-Rr,y);c.stroke();c.fillStyle='#a0a0a9';c.fillText((ym*(1-i/4)).toFixed(ym<10?1:0),4,y+4)}
for(let i=0;i<=xm;i+=Math.ceil(xm/7)){c.fillStyle='#a0a0a9';c.fillText(i,L+(w-L-Rr)*i/xm-4,h-8)}
sers.forEach(s=>{c.strokeStyle=s.c;c.lineWidth=2.5;c.setLineDash(s.d?[6,5]:[]);c.shadowColor=s.c;c.shadowBlur=s.d?0:8;c.beginPath();s.v.forEach((v,i)=>{const x=L+(w-L-Rr)*(i/(s.v.length-1))*(s.xe||xm)/xm,y=T+(h-T-B)*(1-cl(v,0,ym)/ym);i?c.lineTo(x,y):c.moveTo(x,y)});c.stroke();c.setLineDash([]);c.shadowBlur=0})}
function drawMon(){const d=[...Array(15).keys()];chart($('#c1'),[{v:d.map(eff),c:'#ff5143'},{v:d.map(x=>100*(1-Math.exp(-K()*x))),c:'#ececee',d:1}],14,100);chart($('#c2'),[{v:d.map(rad),c:'#ff5143'}],14,4)}

/* relatório */
function report(src,ser){const r=R(),p=P(),ok=r>=75&&p<=2,adv=[];
if(p>2)adv.push('Reduza a manipueira: acima de 50% de concentração a planta sofre dano.');
if(r<75)adv.push('Aumente a manipueira (até 50%) ou o fixador (até 12% do volume) para elevar a repelência.');
if(K()>.05)adv.push('Em clima quente e seco a mistura evapora rápido: reaplique a cada poucos dias ou use mais fixador.');
const q=S.M?[1,S.A/S.M,S.F/S.M].map(x=>f1(x)).join(' : '):'—';
$('#repb').innerHTML=`<h2 style="display:flex;align-items:center;gap:10px"><span class="lg"><img src="logo.png" alt=""></span>Relatório de Performance Científica</h2><div style="color:var(--mu);font-size:13px">Origem: ${src=='lab'?'Sala de Laboratório':'Sala de Teste de Campo'} · ${new Date().toLocaleString('pt-BR')}</div>
<div class=tiles><div class=tile><span>Proporção (manipueira : água : fixador)</span><b>${mixTxt()}</b><span>${q}</span></div>
<div class=tile><span>Concentração de manipueira</span><b>${f1(conc()*100)}%</b></div>
<div class=tile><span>Índice de repelência</span><b style="color:var(--rb)">${f1(r)}%</b></div>
<div class=tile><span>Impacto fitotóxico</span><b style="color:${p<=2?'var(--ok)':'var(--rb)'}">${f1(p)}%</b></div></div>
<div style="font-size:14px">Comportamento dos pulgões: % de pulgões sobre a planta ao longo do tempo (min simulados). Eles se afastam, não morrem.</div>
<canvas id="rc" width="600" height="220" style="width:100%"></canvas>
<div class="concl ${ok?'':'no'}"><b>${ok?'Mistura recomendada.':'Mistura precisa de ajustes.'}</b> ${ok?'Alta repelência com impacto nulo ou desprezível na planta.':''}${adv.length?'<ul>'+adv.map(a=>'<li>'+a+'</li>').join('')+'</ul>':''}</div>
<div style="display:flex;gap:8px"><button class="btn g" id="x1">Fechar</button><button class="btn" id="x2">${src=='lab'?'Testar na estufa':'Nova mistura'}</button></div>`;
$('#rep').classList.add('on');
const tau=2.5-1.5*r/100,v=ser||[...Array(15).keys()].map(i=>100*(1-r/100*(1-Math.exp(-i/tau))));chart($('#rc'),[{v,c:'#ff5143'}],14,100);
$('#x1').onclick=()=>$('#rep').classList.remove('on');$('#x2').onclick=()=>{$('#rep').classList.remove('on');go(src=='lab'?'field':'lab')};beep(660,.25);beep(880,.3)}

/* laboratório */
const lc=$('#lab').getContext('2d');let stir=0,bub=[];
function mixCol(){const a=[[232,217,160,S.M],[90,169,255,S.A],[123,216,143,S.F*2]];let w=0,r=0,g=0,b=0;a.forEach(x=>{w+=x[3];r+=x[0]*x[3];g+=x[1]*x[3];b+=x[2]*x[3]});w=w||1;return`rgb(${r/w|0},${g/w|0},${b/w|0})`}
function vessel(c,x,y,w,h,col,lvl,name,val,t){const top=y+h*(1-lvl);if(lvl>0){c.fillStyle=col;c.globalAlpha=.85;c.beginPath();c.moveTo(x,y+h);c.lineTo(x,top);for(let i=0;i<=w;i+=4)c.lineTo(x+i,top+Math.sin(i*.09+t*2.5)*2);c.lineTo(x+w,y+h);c.fill();c.globalAlpha=1}
c.strokeStyle='rgba(255,255,255,.45)';c.lineWidth=2.5;c.beginPath();c.moveTo(x,y);c.lineTo(x,y+h);c.lineTo(x+w,y+h);c.lineTo(x+w,y);c.stroke();c.lineWidth=1;c.strokeStyle='rgba(255,255,255,.3)';for(let i=1;i<10;i++){const yy=y+h*i/10;c.beginPath();c.moveTo(x,yy);c.lineTo(x+(i%5?10:20),yy);c.stroke()}
c.fillStyle='#ececee';c.font='13px Chakra Petch,system-ui';c.textAlign='center';c.fillText(name,x+w/2,y+h+20);c.fillStyle='#ff5143';c.fillText(val+' ml',x+w/2,y+h+37);c.textAlign='left'}
function drawLab(t,dt){const c=lc;c.clearRect(0,0,760,340);c.fillStyle='#0f0f12';c.fillRect(0,0,760,340);
c.strokeStyle='rgba(163,8,8,.18)';for(let i=0;i<760;i+=40){c.beginPath();c.moveTo(i,0);c.lineTo(i,340);c.stroke()}for(let j=0;j<340;j+=40){c.beginPath();c.moveTo(0,j);c.lineTo(760,j);c.stroke()}
c.fillStyle='#1d1d21';c.fillRect(0,282,760,58);c.fillStyle='#a30808';c.fillRect(0,280,760,3);
const bx=470,bw=230,bh=210,by=70,tt=tot(),cols=['#e8d9a0','#5aa9ff','#7bd88f'],xs=[40,150,260],vs=[S.M,S.A,S.F],mx=[100,100,20],nm=['Manipueira','Água','Fixador'];
vs.forEach((v,i)=>{if(v>0){c.save();c.strokeStyle=cols[i];c.globalAlpha=.8;c.lineWidth=1+v/mx[i]*4;c.setLineDash([7,8]);c.lineDashOffset=-t*50;c.beginPath();c.moveTo(xs[i]+35,70);c.quadraticCurveTo(xs[i]+35,30,bx+bw/2-60+i*60,by-8);c.stroke();c.restore()}
vessel(c,xs[i],80,70,200,cols[i],v/mx[i],nm[i],v,t)});
vessel(c,bx,by,bw,bh,mixCol(),Math.min(1,tt/220),'Béquer de mistura',f1(tt),t);
if(stir>0){stir-=dt;const rx=bx+bw/2+Math.sin(t*9)*38;c.strokeStyle='#ececee';c.lineWidth=5;c.beginPath();c.moveTo(rx+20,by-30);c.lineTo(rx,by+bh-12);c.stroke();if(Math.random()<.7)bub.push({x:rx,y:by+bh-14,v:30+Math.random()*50})}
bub=bub.filter(b=>{b.y-=b.v*dt;b.x+=Math.sin(b.y*.1)*.6;c.fillStyle='rgba(255,255,255,.55)';c.beginPath();c.arc(b.x,b.y,2+b.v/30,0,7);c.fill();return b.y>by+bh*(1-Math.min(1,tt/220))&&b.y>by});
c.fillStyle='#a0a0a9';c.font='12px Chakra Petch,system-ui';c.fillText('Capacidade do béquer: 220 ml',bx,by-14)}
$('#mix').onclick=()=>{stir=2.6;$('#mix').disabled=true;beep(240,.5);setTimeout(()=>{$('#mix').disabled=false;report('lab')},2700)};

/* estufa */
const fc=$('#fld').getContext('2d'),EX=470,EY=340,PX=380,PY=250;let F={};
function resetF(){F={on:false,done:false,t:0,h:60,ser:[100],ns:1,z:0,a:[...Array(40).keys()].map(()=>{const g=Math.random()*6.28,d=Math.random()*85;return{x:PX+Math.cos(g)*d,y:PY+Math.sin(g)*d*.9,vx:0,vy:0,sus:0,rt:0}})};$('#app').disabled=false}
const onP=()=>F.a.filter(a=>Math.hypot(a.x-PX,a.y-PY)<100).length;
$('#app').onclick=()=>{if(F.on||F.done)return;const r=R();F.on=true;F.z=Math.min(240,rad(0)*80);F.a.forEach(a=>{a.sus=Math.random()<r/100;a.rt=Math.random()*(1.5+3*(1-r/100))});$('#app').disabled=true;beep(180,.6)};
$('#rst').onclick=()=>{resetF();beep(400)};$('#pl').onchange=()=>beep(500);
function updF(dt){const v=20+95*R()/100;F.a.forEach(a=>{const dx=a.x-EX,dy=a.y-EY,d=Math.hypot(dx,dy)||1;
if(F.on&&a.sus&&F.t>a.rt&&d<F.z){a.vx+=(dx/d*v-a.vx)*dt*3;a.vy+=(dy/d*v-a.vy)*dt*3}
else{a.vx+=(Math.random()-.5)*70*dt-a.vx*dt*1.5;a.vy+=(Math.random()-.5)*70*dt-a.vy*dt*1.5;if(!a.sus||!F.on){a.vx+=(PX-a.x)*.6*dt;a.vy+=(PY-a.y)*.6*dt}}
a.x=cl(a.x+a.vx*dt,8,752);a.y=cl(a.y+a.vy*dt,50,335)});
const fo=onP()/40;if(F.on){F.t+=dt;if(F.t>=F.ns){F.ser.push(fo*100);F.ns++}if(F.t>=14){F.on=false;F.done=true;F.ser.push(fo*100);F.ser=F.ser.slice(0,15);while(F.ser.length<15)F.ser.push(fo*100);report('field',F.ser)}}
F.h+=(cl(100-40*fo-P()*1.2,0,100)-F.h)*Math.min(1,dt*.8);
$('#hv').textContent=Math.round(F.h)+'%';$('#hb').style.width=F.h+'%';$('#av').textContent=Math.round(fo*100)+'%';$('#ab').style.width=fo*100+'%';$('#al').textContent='40 de 40';$('#tm').textContent=Math.floor(F.t)+' min'}
function plant(c,t,hp,ty){const x=PX,yb=345,col=`hsl(${40+70*hp/100},55%,${28+hp/8}%)`;c.strokeStyle=col;c.fillStyle=col;c.lineWidth=7;c.beginPath();c.moveTo(x,yb);c.quadraticCurveTo(x-10+Math.sin(t)*2,yb-80,x,yb-165);c.stroke();
const L=ty?[[-70,-40],[65,-50],[-55,-90],[60,-100],[-30,-140],[30,-150]]:[[-60,-60],[55,-80],[-50,-115],[60,-140],[-30,-165],[35,-185]];
L.forEach(([dx,dy],i)=>{const cx=x+dx,cy=yb+dy+Math.sin(t*1.5+i)*1.5;c.lineWidth=3;c.beginPath();c.moveTo(x,cy+22);c.lineTo(cx,cy);c.stroke();c.beginPath();c.ellipse(cx,cy,ty?34:26,ty?20:12,dx<0?-.4:.4,0,7);c.fill()});
if(!ty)[[-35,-75],[40,-105],[-25,-130]].forEach(([dx,dy])=>{c.fillStyle='#d8341f';c.beginPath();c.arc(x+dx,yb+dy,9,0,7);c.fill()})}
function drawF(t){const c=fc;c.clearRect(0,0,760,400);c.fillStyle='#0f0f12';c.fillRect(0,0,760,400);
c.strokeStyle='rgba(255,255,255,.07)';c.lineWidth=2;for(let i=0;i<=760;i+=95){c.beginPath();c.moveTo(i,345);c.quadraticCurveTo(i,60,380,20);c.stroke()}
c.fillStyle='#1d1d21';c.fillRect(0,345,760,55);c.fillStyle='#a30808';c.fillRect(0,343,760,3);
if(F.z){const g=c.createRadialGradient(EX,EY,0,EX,EY,F.z);g.addColorStop(0,'rgba(255,81,67,.22)');g.addColorStop(1,'rgba(255,81,67,0)');c.fillStyle=g;c.beginPath();c.arc(EX,EY,F.z,0,7);c.fill();c.strokeStyle='rgba(255,81,67,.6)';c.setLineDash([8,8]);c.lineWidth=2;c.beginPath();c.arc(EX,EY,F.z,0,7);c.stroke();c.setLineDash([]);
if(F.on){const pr=(F.t*1.6)%3/3;c.strokeStyle=`rgba(255,81,67,${1-pr})`;c.beginPath();c.arc(EX,EY,F.z*pr,0,7);c.stroke()}}
plant(c,t,F.h,+$('#pl').value);
c.fillStyle='#2d2d33';c.fillRect(EX-16,EY-34,32,34);c.fillStyle='#ececee';c.fillRect(EX-10,EY-44,20,10);c.fillStyle=F.on&&Math.sin(t*10)>0?'#ff5143':'#a30808';c.beginPath();c.arc(EX,EY-18,4,0,7);c.fill();c.fillStyle='#a0a0a9';c.font='12px Chakra Petch,system-ui';c.fillText('Recipiente repelente',EX-60,EY+16);
F.a.forEach(a=>{c.fillStyle='#b6f23a';c.beginPath();c.ellipse(a.x,a.y,3.4,2.4,Math.atan2(a.vy,a.vx),0,7);c.fill()})}

let last=0;function loop(ms){const t=ms/1000,dt=Math.min(.05,t-last);last=t;if(room=='lab')drawLab(t,dt);if(room=='field'){updF(dt);drawF(t)}requestAnimationFrame(loop)}
/* comparador */
const PRE=[['Leve',15,85,3],['Equilibrada',30,70,5],['Reforçada',40,60,8],['Concentrada',60,40,5],['Pura',100,0,0],['Muito fixador',30,60,15]];
function drawCmp(){const o={...S};$('#tb').innerHTML='<tr><th>Mistura</th><th>M:A:F (ml)</th><th>Repelência</th><th>Fitotoxicidade</th><th>Dias úteis</th><th>Veredito</th><th></th></tr>'+PRE.map(([n,m,a,f],i)=>{Object.assign(S,{M:m,A:a,F:f});const r=R(),p=P();let d=0;while(d<=14&&eff(d)>=r/2)d+=.25;const ok=r>=75&&p<=2;return`<tr><td>${n}</td><td>${m}:${a}:${f}</td><td>${f1(r)}%</td><td>${f1(p)}%</td><td>${d>14?'>14':f1(d)}</td><td style="color:${ok?'var(--ok)':'var(--rb)'}">${ok?'Recomendada':'Ajustar'}</td><td><button class="btn g" style="margin:0;padding:6px 10px;width:auto" data-i="${i}">Carregar</button></td></tr>`}).join('');Object.assign(S,o)}
function load(m,a,f){Object.assign(S,{M:m,A:a,F:f});['M','A','F'].forEach(k=>{$('#s'+k).value=$('#n'+k).value=S[k]});go('lab')}
$('#tb').onclick=e=>{const i=e.target.dataset.i;if(i!=null){const[,m,a,f]=PRE[i];load(m,a,f)}};
/* dosagem ideal */
$('#sO').oninput=e=>$('#oO').textContent=e.target.value+'%';
$('#bo').onclick=()=>{const o={...S},tg=+$('#sO').value;let b=null;
for(let m=5;m<=100&&!b;m+=2.5)for(let f=0;f<=15&&!b;f++){S.M=m;S.A=100-m;S.F=f;const r=R(),p=P();if(r>=tg&&p<=2)b={m,a:100-m,f,r,p,k:K()}}
Object.assign(S,o);
$('#ro').innerHTML=b?`<div class="tiles"><div class="tile"><span>Proporção ideal (ml)</span><b>${b.m}:${b.a}:${b.f}</b></div><div class="tile"><span>Repelência</span><b>${f1(b.r)}%</b></div><div class="tile"><span>Fitotoxicidade</span><b>${f1(b.p)}%</b></div><div class="tile"><span>Evaporação</span><b>${f1(b.k*100)}%/dia</b></div></div><button class="btn" id="ap">Aplicar no laboratório</button>`:'<div class="concl no">Nenhuma mistura atinge essa meta sem dano à planta. Diminua a repelência mínima.</div>';
if(b)$('#ap').onclick=()=>load(b.m,b.a,b.f);beep(700,.2)};
/* chuva */
function drawRain(){const k0=K(),kr=.012*S.W*Math.max(.15,1-4*fr()),d=[...Array(15).keys()],r=R(),t=Math.log(2)/(k0+kr);
chart($('#c3'),[{v:d.map(x=>r*Math.exp(-k0*x)),c:'#ececee',d:1},{v:d.map(x=>r*Math.exp(-(k0+kr)*x)),c:'#ff5143'}],14,100);
$('#rw').textContent=f1(kr*100)+'% ao dia';$('#r50').textContent=t>14?'mais de 14 dias':f1(t)+' dias';$('#rr').textContent=Math.max(0,Math.ceil(14/t)-1)+' em 14 dias'}
resetF();sync();requestAnimationFrame(loop);
