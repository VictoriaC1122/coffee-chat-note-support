'use strict';
const languages=['en','zh-Hant','zh-Hans','ja','es','fr','ko','de','pt-BR','id','hi','ar'];
const picker=document.querySelector('#language');
const page=document.body.dataset.page;
const pageTitles={index:'navSupport',privacy:'navPrivacy',terms:'navTerms',contact:'navContact'};
function bestLanguage(value){
 if(languages.includes(value))return value;
 if(/^zh/i.test(value))return /TW|HK|Hant/i.test(value)?'zh-Hant':'zh-Hans';
 if(/^pt/i.test(value))return 'pt-BR';
 return languages.find(l=>l===value.split('-')[0])||'en';
}
let request=0;
async function setLanguage(language,save){
 if(!languages.includes(language))language='en';
 const current=++request;
 try{
  const response=await fetch(`locales/${language}.json?v=20261011-guide`);
  if(!response.ok)throw new Error('Locale unavailable');
  const copy=await response.json(); if(current!==request)return;
  document.querySelectorAll('[data-i18n]').forEach(node=>{if(copy[node.dataset.i18n])node.textContent=copy[node.dataset.i18n]});
  document.documentElement.lang=language;
  document.documentElement.dir=language==='ar'?'rtl':'ltr';
  document.title=`${copy[pageTitles[page]]} · Coffee Chat Note`;
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
