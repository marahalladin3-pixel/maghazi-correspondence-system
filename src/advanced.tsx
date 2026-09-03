import { useMemo, useState } from 'react';
import { Activity, AlertTriangle, ArrowLeftRight, BarChart3, Building2, CheckCircle2, Clock3, Download, FileText, Paperclip, Printer, Search, ShieldCheck, UserRound } from 'lucide-react';
import { deadlineState, PageHead, Status } from './components';
import { label, useStore } from './store';

const downloadCsv = (name:string, rows:string[][]) => {
  const csv = rows.map(row => row.map(cell => `"${String(cell).replaceAll('"','""')}"`).join(',')).join('\n');
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob(['\ufeff'+csv], {type:'text/csv;charset=utf-8'}));
  link.download = name;
  link.click();
  URL.revokeObjectURL(link.href);
};

export function AdvancedReports(){
  const mail=useStore(s=>s.mail);
  const [period,setPeriod]=useState('all'),[fromDate,setFromDate]=useState(''),[toDate,setToDate]=useState(''),[filterType,setFilterType]=useState(''),[filterDepartment,setFilterDepartment]=useState(''),[filterStatus,setFilterStatus]=useState(''),[filterPriority,setFilterPriority]=useState(''),[qualityIssue,setQualityIssue]=useState<'owner'|'due'|'files'|null>(null),[reportType,setReportType]=useState<'overview'|'entities'|'users'|'followup'|'deadlines'|'classification'|'closed'>('overview');
  const visible=useMemo(()=>{const now=new Date(),today=now.toISOString().slice(0,10),startOfWeek=new Date(now);startOfWeek.setDate(now.getDate()-((now.getDay()+6)%7));const weekStart=startOfWeek.toISOString().slice(0,10),month=today.slice(0,7),year=today.slice(0,4);return mail.filter(m=>period==='all'||(period==='today'&&m.date===today)||(period==='week'&&m.date>=weekStart&&m.date<=today)||(period==='month'&&m.date.startsWith(month))||(period==='year'&&m.date.startsWith(year))||(period==='custom'&&(!fromDate||m.date>=fromDate)&&(!toDate||m.date<=toDate))).filter(m=>!filterType||m.type===filterType).filter(m=>!filterDepartment||m.department===filterDepartment).filter(m=>!filterStatus||m.status===filterStatus).filter(m=>!filterPriority||m.priority===filterPriority)},[mail,period,fromDate,toDate,filterType,filterDepartment,filterStatus,filterPriority]);
  const departmentsFilter=[...new Set(mail.map(m=>m.department).filter(Boolean))],statusesFilter=[...new Set(mail.map(m=>m.status))];
  const total=visible.length||1;
  const completed=visible.filter(m=>m.status==='تم الإنجاز'||m.status==='مؤرشف').length;
  const responseHours=visible.flatMap(m=>(m.replies||[]).map(r=>(new Date(r.time).getTime()-new Date(m.sentAt||`${m.date}T08:00:00`).getTime())/3600000)).filter(x=>x>=0);
  const completionHours=visible.filter(m=>m.closedAt).map(m=>(new Date(m.closedAt!).getTime()-new Date(m.sentAt||`${m.date}T08:00:00`).getTime())/3600000).filter(x=>x>=0);
  const avgResponse=responseHours.length?Math.round(responseHours.reduce((a,b)=>a+b,0)/responseHours.length):0,avgCompletion=completionHours.length?Math.round(completionHours.reduce((a,b)=>a+b,0)/completionHours.length):0;
  const statuses=[...new Set(visible.map(m=>m.status))].map(status=>({status,count:visible.filter(m=>m.status===status).length}));
  const departments=[...new Set(visible.map(m=>m.department).filter(Boolean))].map(name=>({name,count:visible.filter(m=>m.department===name).length})).sort((a,b)=>b.count-a.count);
  const reportMail=reportType==='followup'?visible.filter(m=>m.workflow.length||['قيد المعالجة','بانتظار الرد','تم التحويل'].includes(m.status)):reportType==='deadlines'?visible.filter(m=>deadlineState(m.dueDate,m.status)==='overdue'):reportType==='closed'?visible.filter(m=>['مغلقة','مؤرشف','تم الإنجاز'].includes(m.status)):visible;
  const entities=[...new Set(visible.flatMap(m=>[m.from,m.to]).filter(x=>x&&x!=='بلدية المغازي'))].map(name=>({name,count:visible.filter(m=>m.from===name||m.to===name).length,incoming:visible.filter(m=>m.from===name).length,outgoing:visible.filter(m=>m.to===name).length})).sort((a,b)=>b.count-a.count);
  const users=[...new Set(visible.map(m=>m.employee).filter(Boolean))].map(name=>({name,count:visible.filter(m=>m.employee===name).length,completed:visible.filter(m=>m.employee===name&&['تم الإنجاز','مؤرشف'].includes(m.status)).length,late:visible.filter(m=>m.employee===name&&deadlineState(m.dueDate,m.status)==='overdue').length})).sort((a,b)=>b.count-a.count);
  const classifications=[...new Set(visible.map(m=>m.correspondenceKind||'غير مصنف'))].map(name=>({name,count:visible.filter(m=>(m.correspondenceKind||'غير مصنف')===name).length}));
  const secrecy=[...new Set(visible.map(m=>m.confidentiality||'داخلي'))].map(name=>({name,count:visible.filter(m=>(m.confidentiality||'داخلي')===name).length}));
  const today=new Date().toISOString().slice(0,10),missingOwner=visible.filter(m=>!m.employee||!m.department),missingDue=visible.filter(m=>!m.dueDate&&!['تم الإنجاز','مؤرشف','تم الإرسال'].includes(m.status)),withoutFiles=visible.filter(m=>!m.attachments.length),exceptions=visible.filter(m=>m.dueDate&&m.dueDate<today&&!['تم الإنجاز','مؤرشف','مغلقة'].includes(m.status));
  const qualityRows=qualityIssue==='owner'?missingOwner:qualityIssue==='due'?missingDue:qualityIssue==='files'?withoutFiles:[];
  const exportReport=()=>downloadCsv(`تقرير-${reportType}.csv`,[['الرقم','النوع','الموضوع','القسم','الموظف','الحالة','التاريخ','المهلة'],...reportMail.map(m=>[m.number,label(m.type),m.subject,m.department,m.employee,m.status,m.date,m.dueDate||''])]);
  return <>
    <header className="report-print-header"><Building2/><div><b>بلدية المغازي</b><span>نظام المراسلات والأرشيف الإلكتروني</span></div><aside><strong>تقرير مؤشرات الأداء</strong><small>تاريخ الإصدار: {new Date().toLocaleDateString('ar-PS')}</small><small>الفترة: {period==='all'?'كل الفترات':period==='today'?'اليوم':period==='week'?'هذا الأسبوع':period==='month'?'هذا الشهر':period==='year'?'هذه السنة':`${fromDate||'البداية'} — ${toDate||'اليوم'}`}</small></aside></header>
    <PageHead title="التقارير ومؤشرات الأداء" subtitle="مؤشرات لحظية تساعد الإدارة على قياس الإنجاز والالتزام"/>
    <div className="report-switcher">{([['overview','إحصائيات المراسلات'],['entities','إحصائيات الجهات'],['users','إحصائيات المستخدمين'],['followup','متابعات المسؤول'],['deadlines','المواعيد المتأخرة'],['classification','النوع والسرية'],['closed','المعاملات المغلقة']] as const).map(([key,title])=><button className={reportType===key?'active':''} key={key} onClick={()=>setReportType(key)}>{title}</button>)}</div>
    <div className="toolbar-row report-filter-toolbar">
      <div className="filters compact"><label>الفترة<select value={period} onChange={e=>setPeriod(e.target.value)}><option value="all">كل الفترات</option><option value="today">اليوم</option><option value="week">هذا الأسبوع</option><option value="month">هذا الشهر</option><option value="year">هذه السنة</option><option value="custom">فترة مخصصة</option></select></label><label>النوع<select value={filterType} onChange={e=>setFilterType(e.target.value)}><option value="">كل الأنواع</option><option value="incoming">وارد</option><option value="outgoing">صادر</option><option value="internal">داخلي</option></select></label><label>القسم<select value={filterDepartment} onChange={e=>setFilterDepartment(e.target.value)}><option value="">كل الأقسام</option>{departmentsFilter.map(x=><option key={x}>{x}</option>)}</select></label><label>الحالة<select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}><option value="">كل الحالات</option>{statusesFilter.map(x=><option key={x}>{x}</option>)}</select></label><label>الأولوية<select value={filterPriority} onChange={e=>setFilterPriority(e.target.value)}><option value="">كل الأولويات</option>{['عادي','مهم','عاجل','عاجل جداً'].map(x=><option key={x}>{x}</option>)}</select></label>{period==='custom'&&<><label>من تاريخ<input type="date" value={fromDate} onChange={e=>setFromDate(e.target.value)}/></label><label>إلى تاريخ<input type="date" value={toDate} onChange={e=>setToDate(e.target.value)}/></label></>}</div>
      <div className="actions no-margin"><button className="secondary" onClick={exportReport}><Download/> تصدير CSV</button><button className="primary" onClick={()=>window.print()}><Printer/> طباعة التقرير</button></div>
    </div>
    <div className="stats report-stats">
      {[['الوارد',visible.filter(m=>m.type==='incoming').length,FileText],['الصادر',visible.filter(m=>m.type==='outgoing').length,BarChart3],['الداخلي',visible.filter(m=>m.type==='internal').length,ArrowLeftRight],['نسبة الإنجاز',`${Math.round(completed/total*100)}%`,CheckCircle2]].map(([title,value,Icon])=><div className="stat" key={String(title)}><span><small>{String(title)}</small><b>{String(value)}</b></span><i>{(() => {const I=Icon as typeof FileText;return <I/>})()}</i></div>)}
    </div>
    <div className="response-kpis"><article className="panel"><small>متوسط زمن الرد</small><b>{avgResponse?`${avgResponse} ساعة`:'لا توجد ردود كافية'}</b><span>من الإرسال حتى أول رد مسجل</span></article><article className="panel"><small>متوسط زمن الإنجاز</small><b>{avgCompletion?`${avgCompletion} ساعة`:'لا توجد إغلاقات كافية'}</b><span>من الإرسال حتى الإغلاق</span></article><article className="panel"><small>الإغلاقات خلال الفترة</small><b>{visible.filter(m=>['مغلقة','مؤرشف'].includes(m.status)).length}</b><span>مراسلات أغلقت أو أُرشفت</span></article></div>
    {reportType==='entities'&&<section className="panel report-detail"><div className="panel-head"><div><h2>حركة المراسلات مع الجهات</h2><p>الوارد والصادر لكل وزارة أو مؤسسة</p></div></div><div className="report-detail-head"><b>الجهة</b><b>الوارد</b><b>الصادر</b><b>الإجمالي</b></div>{entities.map(x=><div className="report-detail-row" key={x.name}><strong>{x.name}</strong><span>{x.incoming}</span><span>{x.outgoing}</span><b>{x.count}</b></div>)}</section>}
    {reportType==='users'&&<section className="panel report-detail"><div className="panel-head"><div><h2>أداء المستخدمين</h2><p>حجم التكليف والإنجاز والتأخير</p></div></div><div className="report-detail-head"><b>الموظف</b><b>المكلف بها</b><b>المنجزة</b><b>المتأخرة</b></div>{users.map(x=><div className="report-detail-row" key={x.name}><strong>{x.name}</strong><span>{x.count}</span><span className="good-number">{x.completed}</span><b className={x.late?'bad-number':''}>{x.late}</b></div>)}</section>}
    {reportType==='classification'&&<div className="report-grid"><section className="panel"><div className="panel-head"><div><h2>المراسلات حسب النوع</h2><p>الأنواع الوظيفية المعتمدة</p></div></div>{classifications.map(x=><div className="rank" key={x.name}><span>{x.name}</span><strong>{x.count} مراسلة</strong></div>)}</section><section className="panel"><div className="panel-head"><div><h2>المراسلات حسب السرية</h2><p>توزيع مستويات الوصول</p></div></div>{secrecy.map(x=><div className="rank" key={x.name}><span className={`security security-${x.name}`}>{x.name}</span><strong>{x.count} مراسلة</strong></div>)}</section></div>}
    {reportType==='closed'&&<section className="panel report-detail"><div className="panel-head"><div><h2>المعاملات المغلقة خلال الفترة</h2><p>{reportMail.length} معاملة منجزة أو مغلقة أو مؤرشفة</p></div></div><div className="report-mail-list">{reportMail.map(m=><article key={m.id}><div><b>{m.subject}</b><span>{m.number} · {m.department} · {m.employee}</span></div><Status>{m.status}</Status><strong>{m.closedAt?new Date(m.closedAt).toLocaleDateString('ar-PS'):m.date}</strong></article>)}</div></section>}
    {(reportType==='followup'||reportType==='deadlines')&&<section className="panel report-detail"><div className="panel-head"><div><h2>{reportType==='followup'?'المراسلات قيد المتابعة':'المراسلات المتجاوزة للمهلة'}</h2><p>{reportMail.length} مراسلة ضمن التقرير الحالي</p></div></div><div className="report-mail-list">{reportMail.map(m=><article key={m.id}><div><b>{m.subject}</b><span>{m.number} · {m.department} · {m.employee}</span></div><Status>{m.status}</Status><strong>{m.dueDate||'دون مهلة'}</strong></article>)}</div></section>}
    <div className="report-grid">
      <section className="panel"><div className="panel-head"><div><h2>توزيع الحالات</h2><p>عدد المراسلات حسب المرحلة الحالية</p></div></div>{statuses.map(x=><div className="bar" key={x.status}><div><span>{x.status}</span><b>{x.count}</b></div><i><em style={{width:`${x.count/total*100}%`}}/></i></div>)}</section>
      <section className="panel"><div className="panel-head"><div><h2>الأقسام الأعلى نشاطاً</h2><p>حجم المراسلات المسندة لكل قسم</p></div></div>{departments.slice(0,7).map((x,i)=><div className="rank" key={x.name}><b>{i+1}</b><span>{x.name}</span><strong>{x.count} مراسلة</strong></div>)}</section>
    </div>
    <div className="report-grid">
      <section className="panel"><h2>قياس الالتزام</h2><div className="kpi-list"><div><span>مراسلات منجزة</span><b>{completed}</b></div><div><span>متأخرة</span><b>{visible.filter(m=>m.status==='متأخر').length}</b></div><div><span>بانتظار الرد</span><b>{visible.filter(m=>m.status==='بانتظار الرد').length}</b></div></div></section>
      <section className="panel"><h2>الأولويات</h2>{['عاجل جداً','عاجل','مهم','عادي'].map(p=><div className="rank" key={p}><span>{p}</span><strong>{visible.filter(m=>m.priority===p).length} مراسلة</strong></div>)}</section>
    </div>
    <div className="report-grid report-audit-grid">
      <section className="panel"><div className="panel-head"><div><h2>جودة البيانات</h2><p>اضغط على المؤشر لمراجعة المراسلات المرتبطة</p></div><ShieldCheck/></div><div className="quality-list"><button className={qualityIssue==='owner'?'active':''} onClick={()=>setQualityIssue(qualityIssue==='owner'?null:'owner')}><span><UserRound/><b>دون مسؤول أو قسم</b></span><strong>{missingOwner.length}</strong></button><button className={qualityIssue==='due'?'active':''} onClick={()=>setQualityIssue(qualityIssue==='due'?null:'due')}><span><Clock3/><b>دون موعد متابعة</b></span><strong>{missingDue.length}</strong></button><button className={qualityIssue==='files'?'active':''} onClick={()=>setQualityIssue(qualityIssue==='files'?null:'files')}><span><Paperclip/><b>دون مرفقات</b></span><strong>{withoutFiles.length}</strong></button></div></section>
      <section className="panel"><div className="panel-head"><div><h2>الاستثناءات التشغيلية</h2><p>معاملات متجاوزة للموعد وتحتاج تدخلاً</p></div><AlertTriangle/></div><div className="exception-list">{exceptions.length?exceptions.slice(0,6).map(m=><button key={m.id} onClick={()=>location.assign(`/app/mail/${m.id}`)}><span><b>{m.subject}</b><small>{m.number} · {m.employee||'دون مسؤول'}</small></span><Status>متأخر منذ {m.dueDate}</Status></button>):<p className="muted">لا توجد استثناءات متأخرة ضمن الفترة.</p>}</div></section>
    </div>
    {qualityIssue&&<section className="panel quality-results"><div className="panel-head"><div><h2>مراسلات تحتاج مراجعة</h2><p>{qualityRows.length} مراسلة مرتبطة بالمؤشر المحدد</p></div><button className="secondary" onClick={()=>setQualityIssue(null)}>إغلاق القائمة</button></div><div className="report-mail-list">{qualityRows.map(m=><button key={m.id} onClick={()=>location.assign(`/app/mail/${m.id}`)}><div><b>{m.subject}</b><span>{m.number} · {m.department||'دون قسم'} · {m.employee||'دون مسؤول'}</span></div><Status>{m.status}</Status><strong>عرض</strong></button>)}</div></section>}
    <footer className="report-print-footer"><span>تقرير صادر عن نظام المراسلات — بلدية المغازي</span><span>صفحة 1</span></footer>
  </>;
}

export function AdvancedActivity(){
  const audit=useStore(s=>s.audit), mail=useStore(s=>s.mail);
  const [query,setQuery]=useState(''),[user,setUser]=useState(''),[kind,setKind]=useState(''),[date,setDate]=useState('');
  const users=[...new Set(audit.map(x=>x.user))], kinds=[...new Set(audit.map(x=>x.action))];
  const rows=audit.filter(x=>(!query||[x.user,x.action,x.details,x.number||''].some(v=>v.includes(query)))&&(!user||x.user===user)&&(!kind||x.action===kind)&&(!date||x.time.startsWith(date)));
  const today=new Date().toISOString().slice(0,10);
  const transfers=audit.filter(x=>x.action.includes('تحويل')).length;
  const reset=()=>{setQuery('');setUser('');setKind('');setDate('')};
  const exportLog=()=>downloadCsv('سجل-العمليات.csv',[['المستخدم','العملية','التفاصيل','رقم الكتاب','التاريخ'],...rows.map(x=>[x.user,x.action,x.details,x.number||'',x.time])]);
  return <>
    <PageHead title="سجل العمليات" subtitle="سجل غير قابل للتعديل لكل إنشاء وتحويل وتغيير حالة وأرشفة داخل النظام"/>
    <div className="actions end no-top"><button className="secondary" onClick={exportLog}><Download/> تصدير CSV</button></div>
    <div className="stats audit-stats">
      {[['عمليات اليوم',audit.filter(x=>x.time.startsWith(today)).length,Activity,'مسجلة في هذه الواجهة'],['منفّذو العمليات',users.length,UserRound,'نفذوا عمليات مسجلة'],['عمليات التحويل',transfers,ArrowLeftRight,'تحويلات في السجل'],['سلامة السجل','مفعّل',ShieldCheck,'الحذف غير متاح']].map(([title,value,Icon,sub])=><div className="stat" key={String(title)}><span><small>{String(title)}</small><b className="small-value">{String(value)}</b><em>{String(sub)}</em></span><i>{(() => {const I=Icon as typeof FileText;return <I/>})()}</i></div>)}
    </div>
    <div className="filters activity-filters">
      <div className="search"><Search/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="ابحث باسم منفذ العملية أو نوعها أو رقم الكتاب..."/></div>
      <label>منفّذ العملية<select value={user} onChange={e=>setUser(e.target.value)}><option value="">جميع المستخدمين</option>{users.map(x=><option key={x}>{x}</option>)}</select></label>
      <label>نوع العملية<select value={kind} onChange={e=>setKind(e.target.value)}><option value="">جميع العمليات</option>{kinds.map(x=><option key={x}>{x}</option>)}</select></label>
      <label>تاريخ التنفيذ<input type="date" value={date} onChange={e=>setDate(e.target.value)}/></label>
      <button className="reset-btn" onClick={reset}>إعادة التعيين</button>
    </div>
    <div className="activity-layout">
      <section className="panel"><div className="panel-head"><div><h2>النشاط المسجل</h2><p>{rows.length} عمليات ظاهرة</p></div><span className="live-chip">● سجل محلي مباشر</span></div><div className="audit-list">{rows.map(x=><article key={x.id}><i><ShieldCheck/></i><div><div className="audit-user"><b>{x.user}</b><small>{x.action}</small></div><p>{x.details} {x.number&&<strong>{x.number}</strong>}</p><small>{new Date(x.time).toLocaleString('ar-PS')}</small></div><Status>{x.action}</Status></article>)}</div></section>
      <aside className="panel controls-card"><h2>ضوابط السجل</h2><p>سجل رقابي للأحداث التشغيلية</p><dl><div><dt>اسم المستخدم والوقت</dt><dd>مفعّل</dd></div><div><dt>نوع العملية والمرجع</dt><dd>مفعّل</dd></div><div><dt>عنوان IP والجهاز</dt><dd>بعد الربط</dd></div><div><dt>عدد المراسلات الحالية</dt><dd>{mail.length}</dd></div></dl><div className="engineering-note"><b>تنبيه هندسي</b><span>الخادم النهائي هو المسؤول عن سجل التدقيق غير القابل للتلاعب.</span></div></aside>
    </div>
  </>;
}
