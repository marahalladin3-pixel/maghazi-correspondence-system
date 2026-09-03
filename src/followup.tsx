import {useMemo,useState} from 'react';
import {Archive,ArrowLeftRight,CheckCircle2,Clock3,Download,Eye,FileSearch,FolderArchive,Printer,Search,TimerReset} from 'lucide-react';
import {useNavigate} from 'react-router-dom';
import {Deadline,deadlineState,Empty,PageHead,Status} from './components';
import {departmentNames} from './data';
import {label,useStore} from './store';
import {isFinalMailStatus,MAIL_STATUSES,normalizeMailStatus} from './mailStatuses';

export function ReferralFollowup(){
  const mail=useStore(s=>s.mail),navigate=useNavigate();
  const [query,setQuery]=useState(''),[department,setDepartment]=useState(''),[state,setState]=useState('open');
  const referrals=useMemo(()=>mail.filter(m=>m.workflow.length>0||[MAIL_STATUSES.REFERRED,MAIL_STATUSES.IN_PROGRESS,MAIL_STATUSES.WAITING_REPLY,MAIL_STATUSES.OVERDUE].includes(normalizeMailStatus(m.status) as never)),[mail]);
  const matchState=(m:typeof mail[number])=>state==='all'||(state==='late'&&deadlineState(m.dueDate,m.status)==='overdue')||(state==='waiting'&&normalizeMailStatus(m.status)===MAIL_STATUSES.WAITING_REPLY)||(state==='open'&&!isFinalMailStatus(m.status))||(state==='done'&&isFinalMailStatus(m.status));
  const rows=referrals.filter(m=>matchState(m)&&(!department||m.department===department)&&(!query||[m.number,m.subject,m.employee,m.department].some(v=>v.includes(query))));
  const exportFollowup=()=>{const quote=(value:string)=>`"${value.replaceAll('"','""')}"`;const lines=[['رقم المراسلة','الموضوع','المسؤول الحالي','الوحدة','الإجراء المطلوب','المهلة','الحالة'],...rows.map(m=>{const last=m.workflow.at(-1);return [m.number,m.subject,m.employee||m.department,m.department,last?.action||'متابعة المراسلة',m.dueDate||'دون مهلة',m.status]})];const url=URL.createObjectURL(new Blob(['\ufeff'+lines.map(line=>line.map(value=>quote(String(value))).join(',')).join('\n')],{type:'text/csv;charset=utf-8'}));const anchor=document.createElement('a');anchor.href=url;anchor.download=`متابعة-الإحالات-${new Date().toISOString().slice(0,10)}.csv`;anchor.click();URL.revokeObjectURL(url)};
  const stats=[
    ['إحالات مفتوحة',referrals.filter(m=>!isFinalMailStatus(m.status)).length,ArrowLeftRight,'open'],
    ['متجاوزة للمهلة',referrals.filter(m=>deadlineState(m.dueDate,m.status)==='overdue').length,Clock3,'late'],
    ['بانتظار الرد',referrals.filter(m=>normalizeMailStatus(m.status)===MAIL_STATUSES.WAITING_REPLY).length,TimerReset,'waiting'],
    ['مكتملة',referrals.filter(m=>isFinalMailStatus(m.status)).length,CheckCircle2,'done']
  ] as const;
  return <>
    <PageHead title="الإحالات والمتابعة" subtitle="متابعة المحال إليه والمطلوب وتاريخ الاستحقاق والمسؤول الحالي"/>
    <div className="actions end followup-export-actions"><button className="secondary" onClick={()=>window.print()}><Printer/> طباعة النتائج</button><button className="primary" onClick={exportFollowup} disabled={!rows.length}><Download/> تصدير المتابعة</button></div>
    <div className="followup-stats">{stats.map(([title,count,Icon,key])=><button className={state===key?'active':''} key={title} onClick={()=>setState(key)}><i><Icon/></i><div><b>{count}</b><span>{title}</span></div></button>)}</div>
    <section className="panel followup-filters">
      <div><Search/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="ابحث بالرقم أو الموضوع أو المسؤول..."/></div>
      <select value={department} onChange={e=>setDepartment(e.target.value)}><option value="">جميع الوحدات</option>{departmentNames.map(x=><option key={x}>{x}</option>)}</select>
      <select value={state} onChange={e=>setState(e.target.value)}><option value="all">جميع الحالات</option><option value="open">مفتوحة</option><option value="late">متأخرة</option><option value="waiting">بانتظار الرد</option><option value="done">مكتملة</option></select>
      <button className="secondary" onClick={()=>{setQuery('');setDepartment('');setState('all')}}>مسح الفلاتر</button>
    </section>
    <section className="panel followup-table">
      <div className="followup-head"><b>المراسلة</b><b>المحال إليه / المسؤول</b><b>المطلوب</b><b>تاريخ الإحالة</b><b>المهلة</b><b>الحالة</b><b/></div>
      {rows.length?rows.map(m=>{const last=m.workflow.at(-1);return <div className={`followup-row ${deadlineState(m.dueDate,m.status)}`} key={m.id}><div><b>{m.subject}</b><small>{m.number} · {label(m.type)}</small></div><div><b>{m.employee||m.department}</b><small>{m.department}</small></div><span>{last?.action||'متابعة المراسلة'}</span><span>{last?new Date(last.time).toLocaleDateString('ar-PS'):m.date}</span><Deadline date={m.dueDate} status={m.status}/><Status>{m.status}</Status><button className="icon" title="عرض المراسلة" onClick={()=>navigate(`/app/mail/${m.id}`)}><Eye/></button></div>}):<Empty text="لا توجد إحالات مطابقة للفلاتر المحددة"/>}
    </section>
  </>;
}

export function ArchiveCenter(){
  const mail=useStore(s=>s.mail),navigate=useNavigate();
  const [query,setQuery]=useState(''),[year,setYear]=useState(''),[kind,setKind]=useState(''),[security,setSecurity]=useState(''),[category,setCategory]=useState('');
  const archived=mail.filter(m=>m.archived||normalizeMailStatus(m.status)===MAIL_STATUSES.ARCHIVED);
  const rows=archived.filter(m=>(!query||[m.number,m.subject,m.from,m.to,m.keywords||''].some(v=>v.includes(query)))&&(!year||m.date.startsWith(year))&&(!kind||m.correspondenceKind===kind)&&(!security||(m.confidentiality||'داخلي')===security)&&(!category||m.archiveCategory===category));
  const categories=[...new Set(archived.map(m=>m.archiveCategory).filter(Boolean))];
  const exportResults=()=>{const quote=(value:string)=>`"${value.replaceAll('"','""')}"`;const lines=[['رقم المراسلة','الموضوع','التاريخ','الجهة','التصنيف','السرية','رمز الأرشيف'],...rows.map(m=>[m.number,m.subject,m.date,m.type==='outgoing'?m.to:m.from,m.archiveCategory||'عام',m.confidentiality||'داخلي',m.archiveCode||''])];const url=URL.createObjectURL(new Blob(['\ufeff'+lines.map(line=>line.map(value=>quote(String(value))).join(',')).join('\n')],{type:'text/csv;charset=utf-8'}));const anchor=document.createElement('a');anchor.href=url;anchor.download=`نتائج-الأرشيف-${new Date().toISOString().slice(0,10)}.csv`;anchor.click();URL.revokeObjectURL(url)};
  return <>
    <PageHead title="الأرشيف الإلكتروني" subtitle="حفظ السجل المترابط واسترجاع الأصل والردود والإحالات والمرفقات وفق الصلاحية"/>
    <div className="actions end archive-export-actions"><button className="secondary" onClick={()=>window.print()}><Printer/> طباعة النتائج</button><button className="primary" onClick={exportResults} disabled={!rows.length}><Download/> تصدير النتائج</button></div>
    <div className="archive-kpis"><article><FolderArchive/><div><b>{archived.length}</b><span>سجل مؤرشف</span></div></article><article><Archive/><div><b>{categories.length}</b><span>تصنيفات أرشيفية</span></div></article><article><Clock3/><div><b>7 سنوات</b><span>مدة الاحتفاظ الافتراضية</span></div></article></div>
    <section className="panel archive-filter-card">
      <div className="archive-query"><Search/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="ابحث بالرقم أو الموضوع أو الجهة أو الكلمات المفتاحية..."/></div>
      <div className="archive-filter-grid">
        <select value={year} onChange={e=>setYear(e.target.value)}><option value="">كل السنوات</option><option>2026</option></select>
        <select value={kind} onChange={e=>setKind(e.target.value)}><option value="">كل الأنواع</option>{['مراسلة داخلية','مذكرة داخلية','إحالة','تعميم','نسخة للعلم','طلب إجراء'].map(x=><option key={x}>{x}</option>)}</select>
        <select value={security} onChange={e=>setSecurity(e.target.value)}><option value="">كل مستويات السرية</option>{['داخلي','مقيد','سري','سري جداً'].map(x=><option key={x}>{x}</option>)}</select>
        <select value={category} onChange={e=>setCategory(e.target.value)}><option value="">كل التصنيفات</option>{categories.map(x=><option key={x}>{x}</option>)}</select>
        <button className="secondary archive-reset" onClick={()=>{setQuery('');setYear('');setKind('');setSecurity('');setCategory('')}}>مسح الفلاتر</button>
      </div>
    </section>
    <section className="panel archive-results">
      <div className="panel-head"><div><h2>نتائج الأرشيف</h2><p>{rows.length} سجلات مطابقة</p></div><FileSearch/></div>
      {rows.length?rows.map(m=><button key={m.id} onClick={()=>navigate(`/app/mail/${m.id}`)}><FolderArchive/><div><b>{m.subject}</b><span>{m.number} · {m.date} · {m.department}</span><small>رمز الأرشيف: {m.archiveCode||'غير محدد'} · {m.archiveCategory||'عام'} · {m.confidentiality||'داخلي'}{m.archivedBy&&` · أرشفها ${m.archivedBy}`}{m.keywords&&` · ${m.keywords}`}</small></div><Status>{m.status}</Status><Eye/></button>):<div className="archive-empty"><FileSearch/><h3>لا توجد نتائج مطابقة</h3><p>ستظهر المراسلات هنا بعد إغلاقها وأرشفتها.</p></div>}
    </section>
  </>;
}
