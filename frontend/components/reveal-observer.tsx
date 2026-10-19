'use client';
import {useEffect} from 'react';
import {usePathname} from 'next/navigation';
// Fades in any element with the `reveal` class as it scrolls into view. Server components
// only need the class name; this single observer handles every page.
export function RevealObserver(){
 const path=usePathname();
 useEffect(()=>{
  const items=Array.from(document.querySelectorAll<HTMLElement>('.reveal:not(.is-visible)'));
  if(!('IntersectionObserver' in window)){items.forEach(el=>el.classList.add('is-visible'));return;}
  const observer=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}}},{rootMargin:'0px 0px -8% 0px',threshold:.08});
  items.forEach(el=>observer.observe(el));
  return()=>observer.disconnect();
 },[path]);
 return null;
}
