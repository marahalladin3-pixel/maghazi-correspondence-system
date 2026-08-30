(function(){
  if(!document.querySelector('.main'))return;
  setTimeout(()=>{
    const app=document.querySelector('#app');if(!app)return;
    const title=document.querySelector('.topbar h1')?.textContent||'نظام المراسلات';
    if(!app.querySelector('.module-context'))app.insertAdjacentHTML('afterbegin',`<nav class="module-context" aria-label="مسار الصفحة"><div class="breadcrumbs"><a href="dashboard.html">نظام المراسلات والأرشيف الإلكتروني</a><span>/</span><b>${title}</b></div><a class="back-portal" href="portal.html">العودة إلى بوابة البلدية</a></nav>`);
  },0);
})();
