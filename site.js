'use strict';
const languages=['en','zh-Hant','zh-Hans','ja','es','fr','ko','de','pt-BR','id','hi','ar'];
const picker=document.querySelector('#language');
const page=document.body.dataset.page;
const pageTitles={index:'navSupport',privacy:'navPrivacy',terms:'navTerms',contact:'navContact'};
const nodes=Array.from(document.querySelectorAll('[data-i18n]'));
const fallback=new Map(nodes.map(node=>[node,node.textContent]));
function bestLanguage(value){
 value=String(value||'').trim();
 const exact=languages.find(l=>l.toLowerCase()===value.toLowerCase());
 if(exact)return exact;
 if(/^zh/i.test(value))return /TW|HK|MO|Hant/i.test(value)?'zh-Hant':'zh-Hans';
 if(/^pt/i.test(value))return 'pt-BR';
 const base=value.split('-')[0].toLowerCase();
 return languages.find(l=>l===base)||'en';
}
let request=0;
async function setLanguage(language,save){
 if(!languages.includes(language))language='en';
 const current=++request;
 try{
  const response=await fetch(`locales/${language}.json?v=20261011-i18n`);
  if(!response.ok)throw new Error('Locale unavailable');
  const copy=await response.json(); if(current!==request)return;
  nodes.forEach(node=>{node.textContent=copy[node.dataset.i18n]||fallback.get(node)});
  document.documentElement.lang=language;
  document.documentElement.dir=language==='ar'?'rtl':'ltr';
  const label=copy[pageTitles[page]];
  document.title=label?`${label} · Coffee Chat Note`:'Coffee Chat Note';
  picker.value=language;
  document.querySelectorAll('a[href]').forEach(a=>{
   const link=new URL(a.href);
   if(link.origin===location.origin && link.pathname.endsWith('.html'))a.search=`?lang=${language}`;
  });
  const url=new URL(location.href);url.searchParams.set('lang',language);history.replaceState(null,'',url);
  if(save){try{localStorage.setItem('coffeeChatLanguage',language)}catch{}}
 }catch{picker.value=document.documentElement.lang;}
}
let saved;try{saved=localStorage.getItem('coffeeChatLanguage')}catch{}
setLanguage(bestLanguage(new URL(location.href).searchParams.get('lang')||saved||navigator.language||'en'),false);
picker.addEventListener('change',event=>setLanguage(event.target.value,true));
