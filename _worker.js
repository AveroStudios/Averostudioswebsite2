// Cloudflare Pages Function: POST /api/quote
// Secrets (Cloudflare > Settings > Variables and Secrets): RESEND_API_KEY, QUOTE_TO_EMAIL, QUOTE_FROM_EMAIL
// Optional: TURNSTILE_SECRET (needs a Turnstile widget on the form sending "cf-turnstile-response")
const json=(o,s=200)=>new Response(JSON.stringify(o),{status:s,headers:{'Content-Type':'application/json'}});
const clean=(v,n)=>String(v??'').replace(/[\u0000-\u001f\u007f]/g,' ').trim().slice(0,n);
const esc=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function onRequestPost({request,env}){
 if(!env.RESEND_API_KEY||!env.QUOTE_TO_EMAIL||!env.QUOTE_FROM_EMAIL)return json({error:'not_configured'},503);
 if(Number(request.headers.get('content-length')||0)>10000)return json({error:'too_large'},413);
 let b;try{b=await request.json()}catch{return json({error:'bad_request'},400)}
 if(b.website)return json({ok:true}); // honeypot: silently drop bots
 const d={name:clean(b.name,100),email:clean(b.email,150),company:clean(b.company,120),service:clean(b.service,60),budget:clean(b.budget,60),message:clean(b.message,3000)};
 if(!d.name||!d.message||!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email)||!b.consent)return json({error:'invalid'},400);
 if(env.TURNSTILE_SECRET){
  const t=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body:new URLSearchParams({secret:env.TURNSTILE_SECRET,response:clean(b['cf-turnstile-response'],2048),remoteip:request.headers.get('CF-Connecting-IP')||''})});
  if(!(await t.json()).success)return json({error:'bot_check'},400);
 }
 const rows=Object.entries(d).map(([k,v])=>`<p><b>${k}:</b> ${esc(v)||'-'}</p>`).join('');
 const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{Authorization:`Bearer ${env.RESEND_API_KEY}`,'Content-Type':'application/json'},
  body:JSON.stringify({from:env.QUOTE_FROM_EMAIL,to:[env.QUOTE_TO_EMAIL],reply_to:d.email,subject:`Quote enquiry from ${d.name}`.slice(0,120),html:rows})});
 return r.ok?json({ok:true}):json({error:'delivery_failed'},502);
}

// Pages "advanced mode": this single file handles /api/quote and serves every other request as a normal static file.
export default {
 async fetch(request,env){
  const url=new URL(request.url);
  if(url.pathname==='/api/quote')return request.method==='POST'?onRequestPost({request,env}):new Response('Method not allowed',{status:405});
  return env.ASSETS.fetch(request);
 }
};
