(()=>{
const $=s=>document.querySelector(s);
const nav=$('#menu'),btn=$('.burger');
const setMenu=o=>{nav.classList.toggle('open',o);btn.setAttribute('aria-expanded',o)};
btn.addEventListener('click',()=>setMenu(!nav.classList.contains('open')));
nav.addEventListener('click',e=>{if(e.target.tagName==='A')setMenu(false)});
document.addEventListener('keydown',e=>{if(e.key==='Escape')setMenu(false)});
$('#yr').textContent=new Date().getFullYear();
const f=$('#qf'),st=$('#status');
document.querySelectorAll('[data-service]').forEach(a=>a.addEventListener('click',()=>{f.service.value=a.dataset.service}));
const say=(m,c)=>{st.textContent=m;st.className='full '+c;st.focus()};
f.addEventListener('submit',async e=>{
 e.preventDefault();
 f.querySelectorAll('.err').forEach(n=>n.remove());
 let bad=null;
 for(const el of f.querySelectorAll('[required]')){
  const ok=el.type==='checkbox'?el.checked:el.checkValidity()&&el.value.trim();
  el.removeAttribute('aria-invalid');
  if(!ok){el.setAttribute('aria-invalid','true');bad=bad||el;
   const p=document.createElement('span');p.className='err';
   p.textContent=el.type==='email'?'Enter a valid email address.':el.type==='checkbox'?'Please agree to continue.':'This field is required.';
   (el.type==='checkbox'?el.closest('label'):el.parentNode).append(p)}}
 if(bad){bad.focus();say('Please fix the highlighted fields.','bad');return}
 const b=f.querySelector('button');b.disabled=true;b.textContent='Sending…';say('Sending your enquiry…','');
 try{
  const r=await fetch('/api/quote',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.fromEntries(new FormData(f)))});
  if(!r.ok)throw 0;
  f.reset();say('Thank you. Your enquiry has been sent to the studio.','ok');
 }catch{say('We couldn’t send your enquiry. Please try again, or email daniel@averostudios.co.za.','bad')}
 b.disabled=false;b.textContent='Send enquiry';
});
})();
