(function(){
  if(document.body.dataset.page!=='login')return;
  const form=document.querySelector('#loginForm');
  const message=document.createElement('p');message.className='login-message';message.setAttribute('role','status');form?.append(message);
  form?.addEventListener('submit',async event=>{event.preventDefault();message.textContent='';const email=form.querySelector('[type="email"]').value,password=form.querySelector('[type="password"]').value;if(!email||!password)return;if(!window.MunicipalityConfig?.useBackend){message.textContent='تسجيل الدخول سيتم من خلال بوابة بلدية المغازي بعد ربط خدمة المصادقة.';return}try{await MunicipalityAPI.request('/api/auth/login',{method:'POST',body:JSON.stringify({email,password})});location.href='dashboard.html'}catch{message.textContent='تعذر تسجيل الدخول. تحقق من البيانات أو اتصل بمسؤول النظام.'}});
})();
