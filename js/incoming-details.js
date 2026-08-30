(function () {
  const params = new URLSearchParams(location.search);
  const id = Number(params.get('id')) || 1;
  const records = JSON.parse(localStorage.getItem('municipalityIncoming') || 'null') || DemoData.incoming;
  const item = records.find(row => row.id === id) || records[0];
  let attachment = null;
  const saveRecords = () => localStorage.setItem('municipalityIncoming', JSON.stringify(records));
  const notify = data => {
    const key = 'correspondenceEmployeeNotifications';
    const current = JSON.parse(localStorage.getItem(key) || 'null') || [];
    current.unshift({id:Date.now(), title:data.title, message:data.message, number:item.number, employee:data.employee || item.employee || 'الموظف المسؤول', time:'الآن', read:false});
    localStorage.setItem(key, JSON.stringify(current));
    window.CorrespondenceNotifications?.render();
  };
  const icon = path => `<svg viewBox="0 0 24 24" aria-hidden="true">${path}</svg>`;
  const icons = {
    back: '<path d="M9 6l6 6-6 6"/>', transfer: '<path d="M7 7h11l-3-3m3 3-3 3M17 17H6l3 3m-3-3 3-3"/>',
    print: '<path d="M7 8V3h10v5M7 17h10v4H7z"/><path d="M5 17H3v-7h18v7h-2"/>', file: '<path d="M14 2H6v20h12V6z"/><path d="M14 2v4h4M9 13h6M9 17h4"/>',
    building: '<path d="M4 21V8l8-5 8 5v13M9 21v-6h6v6M8 10h1M15 10h1"/>', user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0116 0"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/>', clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    attachment: '<path d="M21 11.5l-8.5 8.5a6 6 0 01-8.5-8.5l9-9a4 4 0 015.7 5.7l-9 9a2 2 0 01-2.9-2.8l8.5-8.5"/>',
    note: '<path d="M21 15a4 4 0 01-4 4H8l-5 3V7a4 4 0 014-4h10a4 4 0 014 4z"/>', download: '<path d="M12 3v12m-4-4l4 4 4-4M5 21h14"/>', eye: '<path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="2.5"/>'
  };
  const detail = (label, value, glyph, wide = false) => `<div class="record-field ${wide ? 'wide' : ''}"><span>${icon(glyph)}</span><div><small>${label}</small><b>${value || '—'}</b></div></div>`;
  const app = document.querySelector('#app');
  app.innerHTML = `
    <nav class="record-breadcrumb"><a href="incoming.html">البريد الوارد</a><span>/</span><b>تفاصيل الكتاب ${item.number}</b></nav>
    <section class="record-hero">
      <div class="record-identity"><span class="record-file-icon">${icon(icons.file)}</span><div><span class="record-kicker">كتاب وارد</span><h2>${item.number} · ${item.subject}</h2><p>مسجل بتاريخ ${item.date} · السرية: ${item.confidentiality||'عادي'}</p></div></div>
      <div class="record-hero-side"><div class="record-state"><small>حالة المعاملة</small><span id="liveRecordStatus">${badge(item.status)}</span></div><div class="record-actions"><button class="btn btn-primary" id="openTransfer">${icon(icons.transfer)} تحويل / إعادة تحويل</button><button class="btn btn-light" id="waitRecord">بانتظار الرد</button><button class="btn btn-light" id="completeRecord">إنهاء المعاملة</button><button class="btn btn-light" id="archiveRecord">أرشفة</button><button class="btn btn-light" id="printRecord">${icon(icons.print)} طباعة</button><a class="btn btn-quiet" href="incoming.html">${icon(icons.back)} رجوع</a></div></div>
    </section>
    <section class="record-strip">
      <div><span>${icon(icons.building)}</span><small>الجهة المرسلة</small><b>${item.sender}</b></div>
      <div><span>${icon(icons.user)}</span><small>الموظف المسؤول</small><b>${item.employee || 'غير محدد'}</b></div>
      <div><span>${icon(icons.clock)}</span><small>الأولوية</small><b class="priority-value">${item.priority}</b></div>
      <div><span>${icon(icons.building)}</span><small>القسم الحالي</small><b>${item.department}</b></div>
    </section>
    <div class="record-layout">
      <main class="record-main">
        <section class="record-panel"><header><span>${icon(icons.file)}</span><div><h3>بيانات الكتاب</h3><p>البيانات الرسمية المسجلة في الديوان</p></div></header><div class="record-fields">
          ${detail('رقم الوارد', item.number, icons.file)}${detail('تاريخ الورود', item.date, icons.calendar)}
          ${detail('الجهة المرسلة', item.sender, icons.building)}${detail('القسم المحوّل إليه', item.department, icons.building)}
          ${detail('مستوى السرية', item.confidentiality||'عادي', icons.eye)}${detail('نوع المراسلة', item.kind||'كتاب رسمي', icons.file)}${detail('موضوع الكتاب', item.subject, icons.note, true)}
        </div></section><section class="record-panel"><header><span>${icon(icons.clock)}</span><div><h3>سجل نشاط الكتاب</h3><p>الإجراءات المرتبطة بهذه المراسلة</p></div></header><div class="record-activity" id="recordActivity">${(item.activity||[{action:'تم تسجيل الكتاب في سجل الوارد',user:'موظف الديوان',time:item.date}]).map(a=>`<article><i></i><div><b>${a.action}</b><small>${a.user||'مستخدم النظام'} · ${a.time||'—'}</small></div></article>`).join('')}</div></section>
        <section class="record-panel"><header><span>${icon(icons.note)}</span><div><h3>الملاحظات والإجراءات</h3><p>سجل الملاحظات المرتبطة بهذه المراسلة</p></div></header><div class="record-notes" id="notes"><article><span class="note-avatar">م</span><div><div><b>م. محمد أحمد</b><time>17/08/2026 · 11:00</time></div><p>تم الاطلاع على المخطط وسيتم إعداد التقرير الفني المطلوب.</p></div></article></div><form class="note-compose" id="noteForm"><textarea name="note" rows="3" placeholder="اكتب ملاحظة جديدة مرتبطة بالكتاب..."></textarea><button class="btn btn-primary">إضافة الملاحظة</button></form></section>
      </main>
      <aside class="record-side">
        <section class="record-panel"><header><span>${icon(icons.clock)}</span><div><h3>مسار المعاملة</h3><p>آخر تحديث اليوم 10:05</p></div></header><div class="record-timeline" id="timeline"><article class="done"><i></i><div><b>الديوان</b><p>تم تسجيل الكتاب في سجل الوارد</p><time>17/08/2026 · 09:20</time></div></article><article class="done"><i></i><div><b>رئيس البلدية</b><p>للعرض والتوجيه</p><time>17/08/2026 · 09:35</time></div></article><article class="current"><i></i><div><b>${item.department}</b><p>للدراسة وإبداء الرأي</p><time>17/08/2026 · 10:05</time></div></article></div></section>
        <section class="record-panel attachment-panel"><header><span>${icon(icons.attachment)}</span><div><h3>المرفقات</h3><p id="attachmentSummary">${attachment?'ملف واحد':'لا يوجد ملف مرفق'}</p></div><label class="attachment-add"><input id="attachmentInput" type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"><span>+ إرفاق ملف</span></label></header><div id="attachmentContent"></div></section>
      </aside>
    </div>
    <div class="modal" id="transferModal"><form class="modal-box record-modal" id="transferForm"><div class="modal-title"><span>${icon(icons.transfer)}</span><div><h3>تحويل الكتاب</h3><p>سيصل إشعار للموظف أو القسم المستلم</p></div></div><div class="field"><label>تحويل إلى قسم</label><select name="department">${DemoData.departments.map(x => `<option>${x}</option>`).join('')}</select></div><div class="field"><label>نوع الإجراء</label><select name="note"><option>للاطلاع</option><option>للمتابعة</option><option>للدراسة وإبداء الرأي</option><option>للتنفيذ</option><option>للرد</option></select></div><div class="field"><label>ملاحظات التحويل</label><textarea rows="3" placeholder="تعليمات إضافية للمستلم..."></textarea></div><div class="actions"><button class="btn btn-primary">تأكيد التحويل</button><button type="button" class="btn btn-light" data-close>إلغاء</button></div></form></div>`;

  const modal = document.querySelector('#transferModal');
  document.querySelector('.record-actions').insertAdjacentHTML('beforeend',`<a class="btn btn-light" href="registration-slip.html?id=${item.id}" target="_blank">بطاقة القيد</a>`);
  const notesRoot=document.querySelector('#notes');
  notesRoot.innerHTML=(item.notes||[]).map(note=>`<article><span class="note-avatar">${(note.author||'م').charAt(0)}</span><div><div><b>${note.author||'مستخدم البلدية'}</b><time>${note.time?new Date(note.time).toLocaleString('ar-PS'):'—'}</time></div><p>${note.text}</p></div></article>`).join('')||'<div class="empty-state compact">لا توجد ملاحظات على هذا الكتاب</div>';
  const transferForm=document.querySelector('#transferForm');
  const departmentField=transferForm.querySelector('[name="department"]').closest('.field');
  departmentField.insertAdjacentHTML('beforebegin',`<div class="field"><label>التأشير إلى</label><select name="targetType" id="transferTargetType"><option value="department">قسم / مجموعة</option><option value="employee">موظف محدد</option></select></div>`);
  departmentField.insertAdjacentHTML('afterend',`<div class="field" id="transferEmployeeField" hidden><label>الموظف المستلم</label><select name="employee"><option value="">اختر الموظف</option>${DemoData.users.map(x=>`<option>${x.name}</option>`).join('')}</select></div>`);
  transferForm.querySelector('[name="note"]').innerHTML=['للعلم','مع الموافقة','مع الاعتذار','للإفادة','للعمل اللازم والإفادة','للدراسة','للمتابعة','للاطلاع','للتنفيذ','للرد','للتذكير','للتعميم'].map(x=>`<option>${x}</option>`).join('');
  transferForm.querySelector('.actions').insertAdjacentHTML('beforebegin',`<div class="form-grid form-grid-2"><div class="field"><label>صلاحية الاطلاع</label><select name="access"><option>المستلم فقط</option><option>موظفو القسم</option><option>رئيس القسم والمستلم</option></select></div><div class="field"><label>آخر موعد للإنجاز</label><input name="dueDate" type="date"></div></div><div class="workflow-checks"><label><input type="checkbox" name="replyRequired" value="yes"> يتطلب ردًا أو إجراءً</label><label><input type="checkbox" name="reminder" value="yes"> إرسال تذكير قبل الموعد</label></div>`);
  document.querySelector('#transferTargetType').onchange=e=>{const employee=e.target.value==='employee';departmentField.hidden=employee;document.querySelector('#transferEmployeeField').hidden=!employee;transferForm.employee.required=employee;transferForm.department.required=!employee};
  document.querySelector('#openTransfer').onclick = () => modal.classList.add('open');
  document.querySelector('[data-close]').onclick = () => modal.classList.remove('open');
  transferForm.onsubmit = async event => {
    event.preventDefault();
    const values=Object.fromEntries(new FormData(event.target));
    if(values.reminder==='yes'&&!values.dueDate){toast('حددي آخر موعد لتفعيل التذكير','error');event.target.dueDate.focus();return}
    const department = values.targetType==='employee'?values.employee:values.department;
    const action = event.target.note.value;
    if(!(await confirmAction({title:'تأكيد تحويل الكتاب',message:`سيتم تحويل الكتاب ${item.number} إلى ${department} — ${action}${values.dueDate?`، والمهلة حتى ${values.dueDate}`:''}.`,confirmText:'تأكيد التحويل'})))return;
    try{const updated=CorrespondenceSystem.transfer('incoming',item.id,{targetType:values.targetType,target:department,action,access:values.access,dueDate:values.dueDate,replyRequired:values.replyRequired==='yes',note:values.note||''});Object.assign(item,updated);document.querySelector('#timeline').insertAdjacentHTML('beforeend', `<article class="current"><i></i><div><b>${department}</b><p>${action}</p><time>الآن</time></div></article>`);document.querySelector('#liveRecordStatus').innerHTML=badge(item.status);addActivity(`تم تحويل الكتاب إلى ${department} — ${action}`);saveRecords();modal.classList.remove('open');toast('تم تحويل المراسلة وإرسال الإشعار')}catch(error){toast(error.message||'تعذر تحويل المراسلة','error')}
  };
  document.querySelector('#noteForm').onsubmit = event => {
    event.preventDefault(); const note = event.target.note.value.trim(); if (!note) return;
    const author=window.AppContext?.currentUser?.name||'مستخدم البلدية';
    try{const updated=CorrespondenceSystem.addNote('incoming',item.id,note);Object.assign(item,updated);if(notesRoot.querySelector('.empty-state'))notesRoot.innerHTML='';notesRoot.insertAdjacentHTML('beforeend', `<article><span class="note-avatar">${author.charAt(0)}</span><div><div><b>${author}</b><time>الآن</time></div><p>${note}</p></div></article>`);event.target.reset();toast('تمت إضافة الملاحظة')}catch(error){toast(error.message||'تعذر إضافة الملاحظة','error')}
  };
  const addActivity=action=>{const entry={action,user:window.AppContext?.currentUser?.name||'مستخدم البلدية',time:new Date().toLocaleString('ar-PS')};item.activity=[...(item.activity||[]),entry];document.querySelector('#recordActivity').insertAdjacentHTML('beforeend',`<article><i></i><div><b>${entry.action}</b><small>${entry.user} · ${entry.time}</small></div></article>`)};
  const setStatus = status => {try{const updated=CorrespondenceSystem.setStatus('incoming',item.id,status);Object.assign(item,updated);addActivity(`تم تحديث الحالة إلى ${status}`);saveRecords();document.querySelector('#liveRecordStatus').innerHTML=badge(status);toast(`تم تحديث حالة الكتاب إلى ${status}`)}catch(error){toast(error.message||'تعذر تحديث الحالة','error')}};
  document.querySelector('#waitRecord').onclick = async () => {if(await confirmAction({title:'وضع الكتاب بانتظار الرد',message:'سيظهر الكتاب ضمن المراسلات التي تحتاج متابعة حتى وصول الرد.',confirmText:'تأكيد'}))setStatus('بانتظار الرد')};
  document.querySelector('#completeRecord').onclick = async () => {if(await confirmAction({title:'إنهاء المعاملة',message:'سيتم اعتبار جميع الإجراءات المطلوبة مكتملة.',confirmText:'إنهاء المعاملة'}))setStatus('تم الإنجاز')};
  document.querySelector('#archiveRecord').onclick = async () => {if(!(await confirmAction({title:'أرشفة الكتاب',message:'لا يمكن أرشفة الكتاب قبل إنهاء جميع الإجراءات المطلوبة.',confirmText:'أرشفة'})))return;try{const updated=CorrespondenceSystem.archive('incoming',item.id);Object.assign(item,updated);document.querySelector('#liveRecordStatus').innerHTML=badge('مؤرشف');addActivity('تمت أرشفة الكتاب إلكترونيًا');saveRecords();notify({title:'تمت أرشفة المراسلة',message:`تم حفظ الكتاب ${item.number} في الأرشيف الإلكتروني`});toast('تمت أرشفة الكتاب')}catch(error){toast(error.message||'تعذر أرشفة الكتاب','error')} };
  document.querySelector('#printRecord').onclick=()=>window.print();
  const formatSize = bytes => bytes < 1048576 ? `${Math.max(1,Math.round(bytes/1024))} KB` : `${(bytes/1048576).toFixed(1)} MB`;
  const renderAttachment = () => {
    const content=document.querySelector('#attachmentContent');
    document.querySelector('#attachmentSummary').textContent=attachment?`ملف واحد · ${formatSize(attachment.size)}`:'لا يوجد ملف مرفق';
    if(!attachment){content.innerHTML='<div class="attachment-empty">لا يوجد ملف مرفق بهذا الكتاب. اضغط «إرفاق ملف» لإضافته.</div>';return}
    content.innerHTML=`<div class="record-attachment"><span>${icon(icons.file)}</span><div><b>${attachment.name}</b><small>${attachment.type||'ملف'} · ${formatSize(attachment.size)}</small></div><button title="معاينة" id="previewAttachment" aria-label="معاينة الملف">${icon(icons.eye)}</button><button title="تنزيل" id="downloadAttachment" aria-label="تنزيل الملف">${icon(icons.download)}</button></div>`;
    document.querySelector('#previewAttachment').onclick=()=>{const w=window.open();if(w)w.location.href=attachment.url};
    document.querySelector('#downloadAttachment').onclick=()=>{const a=document.createElement('a');a.href=attachment.url;a.download=attachment.name;document.body.append(a);a.click();a.remove()};
  };
  document.querySelector('#attachmentInput').onchange=event=>{const file=event.target.files[0];if(!file)return;if(file.size>10*1024*1024){toast('حجم الملف أكبر من 10MB','error');event.target.value='';return}attachment={name:file.name,type:file.type,size:file.size,url:URL.createObjectURL(file)};renderAttachment();toast('تم تجهيز الملف للمعاينة؛ الحفظ الدائم يتم بعد ربط خادم الملفات','info')};
  renderAttachment();
})();
