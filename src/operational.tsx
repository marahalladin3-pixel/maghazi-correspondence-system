import {useMemo,useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {BellRing,CalendarDays,CheckCircle2,Clock3,Eye,Megaphone,Plus,Search,Users} from 'lucide-react';
import {Deadline,Empty,PageHead,Status} from './components';
import {useStore} from './store';

export function CircularsCenter(){
 const mail=useStore(s=>s.mail),navigate=useNavigate();
 const [q,setQ]=useState(''),[scope,setScope]=useState('الكل');
 const rows=mail.filter(m=>m.correspondenceKind==='تعميم'||m.subject.includes('تعميم')).filter(m=>!q||[m.number,m.subject,m.from,m.to,m.department].some(v=>String(v||'').includes(q))).filter(m=>scope==='الكل'||(scope==='منشور'&&m.status!=='مسودة')||(scope==='مسودة'&&m.status==='مسودة'));
 return <><PageHead title="مركز التعاميم" subtitle="إنشاء ونشر ومتابعة التعاميم البلدية على الموظفين والأقسام" action="إنشاء تعميم" to="/app/compose/internal"/>
 <div className="ops-summary"><article><Megaphone/><div><b>{rows.length}</b><span>إجمالي التعاميم</span></div></article><article><Users/><div><b>{rows.filter(x=>x.recipients?.length).reduce((n,x)=>n+(x.recipients?.length||0),0)}</b><span>جهات مستلمة</span></div></article><article><CheckCircle2/><div><b>{rows.filter(x=>['تم الإنجاز','معتمدة','مؤرشف'].includes(x.status)).length}</b><span>مكتملة أو معتمدة</span></div></article></div>
 <section className="panel ops-filter"><div className="search"><Search/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="ابحث برقم التعميم أو الموضوع..."/></div><select value={scope} onChange={e=>setScope(e.target.value)}><option>الكل</option><option>منشور</option><option>مسودة</option></select></section>
 <section className="panel circular-list"><div className="panel-head"><div><h2>سجل التعاميم</h2><p>{rows.length} تعميم ظاهر</p></div><Megaphone/></div>{rows.length?rows.map(m=><article key={m.id}><div className="circular-icon"><Megaphone/></div><button className="circular-main" onClick={()=>navigate(`/app/mail/${m.id}`)}><small>{m.number} · {m.date}</small><b>{m.subject}</b><span>{m.from} ← {m.to}</span></button><div className="circular-audience"><Users/><span>{m.recipients?.length?`${m.recipients.length} مستلمين`:'جميع الموظفين'}</span></div><Status>{m.status}</Status><button className="icon" title="عرض التعميم" onClick={()=>navigate(`/app/mail/${m.id}`)}><Eye/></button></article>):<Empty text="لا توجد تعاميم مسجلة"/>}</section></>;
}

export function CorrespondenceCalendar(){
 const mail=useStore(s=>s.mail),navigate=useNavigate();
 const [month,setMonth]=useState(new Date().toISOString().slice(0,7)),[onlyOpen,setOnlyOpen]=useState(true);
 const items=useMemo(()=>mail.filter(m=>m.dueDate||m.reminderDate).filter(m=>!onlyOpen||!['تم الإنجاز','مغلقة','مؤرشف','ملغي'].includes(m.status)).filter(m=>(m.dueDate||m.reminderDate||'').startsWith(month)).sort((a,b)=>(a.dueDate||a.reminderDate||'').localeCompare(b.dueDate||b.reminderDate||'')),[mail,month,onlyOpen]);
 const today=new Date().toISOString().slice(0,10);
 return <><PageHead title="أجندة المراسلات" subtitle="عرض المهل والتذكيرات والاجتماعات المرتبطة بالمراسلات في مكان واحد"/>
 <section className="panel calendar-toolbar"><label>الشهر<input type="month" value={month} onChange={e=>setMonth(e.target.value)}/></label><label className="calendar-toggle"><input type="checkbox" checked={onlyOpen} onChange={e=>setOnlyOpen(e.target.checked)}/> إظهار المراسلات المفتوحة فقط</label><button className="secondary" onClick={()=>setMonth(today.slice(0,7))}><CalendarDays/> الشهر الحالي</button></section>
 <div className="calendar-layout"><section className="panel calendar-list"><div className="panel-head"><div><h2>المواعيد والاستحقاقات</h2><p>{items.length} موعد خلال الشهر المحدد</p></div><BellRing/></div>{items.length?items.map(m=>{const date=m.dueDate||m.reminderDate||'';return <button key={m.id} onClick={()=>navigate(`/app/mail/${m.id}`)} className={date<today?'late':date===today?'today':''}><time><b>{new Date(`${date}T00:00:00`).toLocaleDateString('ar-PS',{day:'2-digit'})}</b><span>{new Date(`${date}T00:00:00`).toLocaleDateString('ar-PS',{weekday:'long'})}</span></time><div><small>{m.number}</small><strong>{m.subject}</strong><span>{m.department||m.to}</span></div><Deadline date={date} status={m.status}/></button>}):<Empty text="لا توجد مواعيد في هذا الشهر"/>}</section><aside className="panel calendar-guide"><Clock3/><h3>دليل الألوان</h3><p><i className="green"/> ضمن الموعد</p><p><i className="gold"/> موعدها اليوم</p><p><i className="red"/> متجاوزة للموعد</p><hr/><b>قاعدة المتابعة</b><span>يبقى الموعد ظاهرًا حتى تنفيذ المراسلة أو إغلاقها وأرشفتها.</span></aside></div></>;
}
