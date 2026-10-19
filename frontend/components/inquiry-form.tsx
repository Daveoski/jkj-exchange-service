'use client';
import {useRef,useState,type FormEvent} from 'react';
import Link from 'next/link';
import {Send,CheckCircle2,ShieldCheck,AlertCircle,LoaderCircle,Copy,Check,MessageCircle} from 'lucide-react';
import {Turnstile,type TurnstileInstance} from '@marsidev/react-turnstile';
import {api,ApiError} from '@/lib/api';
import {DEFAULT_CURRENCY,SERVICE_OPTIONS,whatsappLink} from '@/lib/constants';

const blank={full_name:'',email:'',phone:'',company:'',service:'rmb',currency:'CNY',amount:'',contact_method:'WhatsApp',message:'',consent:false,website:''};
type FormState=typeof blank;
type Field=keyof FormState;
const siteKey=process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const EMAIL=/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(f:FormState){
 const e:Partial<Record<Field,string>>={};
 if(f.full_name.trim().length<2)e.full_name='Please enter your full name.';
 if(!EMAIL.test(f.email.trim()))e.email='Enter a valid email address.';
 if(!/^[+()\d\s.-]+$/.test(f.phone.trim())||f.phone.replace(/\D/g,'').length<7)e.phone='Enter a valid phone or WhatsApp number.';
 if(f.amount&&!(Number(f.amount)>0))e.amount='Amount must be greater than zero.';
 if(f.message.trim().length<10)e.message='Please tell us a little more (at least 10 characters).';
 if(!f.consent)e.consent='Please confirm so we can respond to your enquiry.';
 return e;
}

export function InquiryForm({defaultService}:{defaultService?:string}){
 const initialService=SERVICE_OPTIONS.some(o=>o.value===defaultService)?defaultService!:'rmb';
 const initial={...blank,service:initialService,currency:DEFAULT_CURRENCY[initialService]};
 const [f,setF]=useState<FormState>(initial);
 const [errors,setErrors]=useState<Partial<Record<Field,string>>>({});
 const [turnstileToken,setTurnstileToken]=useState('');
 const [loading,setLoading]=useState(false);
 const [reference,setReference]=useState('');
 const [copied,setCopied]=useState(false);
 const [error,setError]=useState('');
 const turnstile=useRef<TurnstileInstance>(null);
 const formRef=useRef<HTMLFormElement>(null);

 const update=(name:Field,value:string|boolean)=>{setF(old=>({...old,[name]:value}));if(errors[name])setErrors(old=>({...old,[name]:undefined}));};
 const changeService=(service:string)=>setF(old=>({...old,service,currency:old.currency===DEFAULT_CURRENCY[old.service]?DEFAULT_CURRENCY[service]:old.currency}));

 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();if(loading)return;setError('');
  const found=validate(f);setErrors(found);
  if(Object.keys(found).length){formRef.current?.querySelector<HTMLElement>(`[name="${Object.keys(found)[0]}"]`)?.focus();return;}
  if(siteKey&&!turnstileToken){setError('Please complete the security check before submitting.');return;}
  setLoading(true);
  try{
   const res=await api<{reference:string}>('/inquiries',{method:'POST',body:JSON.stringify({...f,email:f.email.trim(),amount:f.amount?Number(f.amount):null,turnstile_token:turnstileToken})});
   setReference(res.reference);setF(initial);setTurnstileToken('');
   formRef.current?.closest('section')?.scrollIntoView({behavior:'smooth',block:'start'});
  }catch(err){
   if(err instanceof ApiError&&Object.keys(err.fields).length)setErrors(err.fields as Partial<Record<Field,string>>);
   setError(err instanceof Error?err.message:'We could not send your enquiry.');
   turnstile.current?.reset();setTurnstileToken('');
  }finally{setLoading(false)}
 }

 async function copy(){try{await navigator.clipboard.writeText(reference);setCopied(true);setTimeout(()=>setCopied(false),1800)}catch{}}

 if(reference)return <div className="animate-fade-up rounded-[28px] border border-emerald-200 bg-white p-8 shadow-soft md:p-12" role="status" aria-live="polite">
  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50"><CheckCircle2 className="text-emerald-600" size={36}/></div>
  <h2 className="mt-6 font-display text-4xl text-midnight">Enquiry received.</h2>
  <p className="mt-4 max-w-md leading-8 text-slate-600">Thank you for contacting JKJ. Our team will review your request and reach out using your preferred method. A confirmation has been sent to your email where available.</p>
  <div className="mt-7 flex flex-wrap items-center gap-3 rounded-2xl border border-dashed border-amber-300 bg-amber-50/60 p-5"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-amber-800">Your reference</p><p className="mt-1 font-mono text-2xl font-bold tracking-wider text-midnight">{reference}</p></div><button type="button" onClick={copy} className="ml-auto inline-flex items-center gap-2 rounded-full border border-amber-300 bg-white px-4 py-2 text-sm font-bold text-midnight hover:border-amber-500">{copied?<><Check size={16}/> Copied</>:<><Copy size={16}/> Copy</>}</button></div>
  <p className="mt-4 text-sm text-slate-500">Quote this reference if you follow up by phone or WhatsApp.</p>
  <div className="mt-8 flex flex-wrap gap-3"><a href={whatsappLink(`Hello JKJ, I just sent enquiry ${reference} on your website.`)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-green-600 px-6 py-3 font-bold text-white hover:bg-green-700"><MessageCircle size={18}/> Follow up on WhatsApp</a><button type="button" onClick={()=>setReference('')} className="rounded-full border border-slate-300 px-6 py-3 font-bold text-midnight hover:border-gold">Send another enquiry</button></div>
 </div>;

 const err=(name:Field)=>errors[name]?<p id={`${name}-error`} className="field-error">{errors[name]}</p>:null;
 const aria=(name:Field)=>({'aria-invalid':errors[name]?true:undefined,'aria-describedby':errors[name]?`${name}-error`:undefined});

 return <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft sm:p-8 md:p-10"><div className="mb-8"><p className="eyebrow">DIRECT TO OUR TEAM</p><h2 className="mt-4 font-display text-3xl text-midnight md:text-4xl">Tell us about your request.</h2><p className="mt-3 text-sm leading-7 text-slate-600">Complete the form and we'll get back to you. Fields marked * are required.</p></div>
 <form ref={formRef} onSubmit={submit} className="space-y-5" noValidate>
 <div className="hidden" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" value={f.website} onChange={e=>update('website',e.target.value)}/></label></div>
 <div className="grid gap-5 sm:grid-cols-2">
  <div><label className="field-label" htmlFor="full_name">Your name *</label><input className="field" id="full_name" name="full_name" autoComplete="name" maxLength={120} value={f.full_name} onChange={e=>update('full_name',e.target.value)} placeholder="Your full name" {...aria('full_name')}/>{err('full_name')}</div>
  <div><label className="field-label" htmlFor="phone">Phone / WhatsApp *</label><input className="field" id="phone" name="phone" autoComplete="tel" inputMode="tel" maxLength={30} value={f.phone} onChange={e=>update('phone',e.target.value)} placeholder="e.g. +234 803 ..." {...aria('phone')}/>{err('phone')}</div>
 </div>
 <div className="grid gap-5 sm:grid-cols-2">
  <div><label className="field-label" htmlFor="email">Email address *</label><input type="email" className="field" id="email" name="email" autoComplete="email" maxLength={254} value={f.email} onChange={e=>update('email',e.target.value)} placeholder="you@company.com" {...aria('email')}/>{err('email')}</div>
  <div><label className="field-label" htmlFor="company">Business name <span className="font-normal text-slate-400">(optional)</span></label><input className="field" id="company" name="company" autoComplete="organization" maxLength={160} value={f.company} onChange={e=>update('company',e.target.value)} placeholder="Your company"/></div>
 </div>
 <div className="grid gap-5 sm:grid-cols-2">
  <div><label className="field-label" htmlFor="service">Payment enquiry *</label><select className="field" id="service" name="service" value={f.service} onChange={e=>changeService(e.target.value)}>{SERVICE_OPTIONS.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
  <div><label className="field-label" htmlFor="currency">Currency *</label><select className="field" value={f.currency} id="currency" name="currency" onChange={e=>update('currency',e.target.value)}><option value="CNY">CNY / RMB (¥)</option><option value="USD">USD ($)</option><option value="NGN">NGN (₦)</option><option value="OTHER">Other / Not sure</option></select></div>
 </div>
 <div className="grid gap-5 sm:grid-cols-2">
  <div><label className="field-label" htmlFor="amount">Approximate amount <span className="font-normal text-slate-400">(optional)</span></label><input className="field" id="amount" name="amount" type="number" min="0.01" max="999999999999" step="any" inputMode="decimal" placeholder="e.g. 5000" value={f.amount} onChange={e=>update('amount',e.target.value)} {...aria('amount')}/>{err('amount')}</div>
  <div><label className="field-label" htmlFor="contact_method">How should we reply? *</label><select id="contact_method" name="contact_method" className="field" value={f.contact_method} onChange={e=>update('contact_method',e.target.value)}><option>WhatsApp</option><option>Email</option><option>Phone call</option></select></div>
 </div>
 <div><label className="field-label" htmlFor="message">Tell us what you need *</label><textarea className="field min-h-[140px] resize-y" id="message" name="message" maxLength={3000} value={f.message} onChange={e=>update('message',e.target.value)} placeholder="What currency does your supplier require? What would you like to discuss? Please don't include bank details or passwords." {...aria('message')}/><div className="flex justify-between">{err('message')||<span/>}<span className="mt-1.5 text-xs text-slate-400">{f.message.length}/3000</span></div></div>
 <div><label className="flex items-start gap-3 text-sm leading-6 text-slate-600"><input name="consent" className="mt-1 h-4 w-4 shrink-0 accent-amber-600" type="checkbox" checked={f.consent} onChange={e=>update('consent',e.target.checked)} {...aria('consent')}/><span>I agree that JKJ may use the details in this form to respond to my enquiry. I have read the <Link href="/privacy" className="font-semibold text-amber-700 underline">privacy notice</Link>. *</span></label>{err('consent')}</div>
 {siteKey&&<div><Turnstile ref={turnstile} siteKey={siteKey} options={{theme:'light'}} onSuccess={setTurnstileToken} onExpire={()=>setTurnstileToken('')} onError={()=>setTurnstileToken('')}/></div>}
 {error&&<div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800"><AlertCircle className="mt-0.5 shrink-0" size={18}/>{error}</div>}
 <button disabled={loading} type="submit" className="group flex w-full items-center justify-center gap-2 rounded-full bg-midnight px-6 py-4 text-sm font-extrabold text-white transition hover:bg-ocean disabled:cursor-wait disabled:opacity-60">{loading?<><LoaderCircle size={19} className="animate-spin"/>Sending your enquiry...</>:<>Send my enquiry <Send size={18} className="transition group-hover:translate-x-1"/></>}</button>
 <p className="flex gap-2 text-xs leading-6 text-slate-500"><ShieldCheck size={16} className="mt-0.5 shrink-0 text-teal"/>This form is for customer enquiries only. JKJ does not accept funds on this website.</p>
 </form></div>;
}
