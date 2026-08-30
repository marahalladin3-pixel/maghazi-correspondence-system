(function(){
  const context=window.AppContext||{};
  const municipality=JSON.parse(localStorage.getItem('municipalitySettings')||'null')||context.municipality||{name:'بلدية المغازي'};
  const user=context.currentUser||{name:'مستخدم البلدية',jobTitle:'موظف'};
  const notifications=context.notifications||[];
  const firstName=user.name.split(' ')[0];
  document.querySelector('#portalUserName').textContent=user.name;
  document.querySelector('#portalUserRole').textContent=user.jobTitle||user.department;
  document.querySelector('#portalAvatar').textContent=user.name[0];
  document.querySelector('#heroUserName').textContent=firstName;
  const portalBrand=document.querySelector('.portal-brand b');
  if(portalBrand)portalBrand.textContent=municipality.name;
  document.title=`بوابة ${municipality.name}`;

  const today=new Date();
  document.querySelector('#currentDay').textContent=new Intl.DateTimeFormat('ar-PS',{weekday:'long'}).format(today);
  document.querySelector('#currentDate').textContent=new Intl.DateTimeFormat('ar-PS',{day:'numeric'}).format(today);
  document.querySelector('#currentMonth').textContent=new Intl.DateTimeFormat('ar-PS',{month:'long',year:'numeric'}).format(today);

  const bell=document.querySelector('#portalBell');
  const menu=document.querySelector('#portalNotificationMenu');
  const count=document.querySelector('#portalNotificationCount');
  const list=document.querySelector('#portalNotificationList');
  function renderNotifications(){
    const unread=notifications.filter(item=>!item.read).length;
    count.textContent=unread;
    count.hidden=unread===0;
    list.innerHTML=notifications.length?notifications.map(item=>`<a class="portal-alert ${item.read?'':'unread'}" href="inbox.html"><span class="alert-dot"></span><span><b>${item.title}</b><small>${item.details}</small><em>${item.time}</em></span></a>`).join(''):'<p class="empty">لا توجد إشعارات</p>';
  }
  renderNotifications();
  bell.addEventListener('click',event=>{event.stopPropagation();const open=menu.classList.toggle('open');bell.setAttribute('aria-expanded',String(open))});
  document.querySelector('#markPortalRead').addEventListener('click',()=>{notifications.forEach(item=>item.read=true);renderNotifications()});
  document.addEventListener('click',event=>{if(!event.target.closest('.portal-notifications')){menu.classList.remove('open');bell.setAttribute('aria-expanded','false')}});

  const search=document.querySelector('#systemSearch');
  const cards=[...document.querySelectorAll('.system-card')];
  search?.addEventListener('input',()=>{const query=search.value.trim().toLowerCase();cards.forEach(card=>card.hidden=query&&!card.textContent.toLowerCase().includes(query))});
  document.querySelectorAll('.system-card[href="#"]').forEach(card=>card.addEventListener('click',event=>{event.preventDefault();let note=document.querySelector('.portal-note');if(!note){note=document.createElement('div');note.className='portal-note';document.body.append(note)}note.textContent='هذه الخدمة تجريبية وستتاح ضمن المرحلة القادمة';note.classList.add('show');setTimeout(()=>note.classList.remove('show'),2400)}));
})();
