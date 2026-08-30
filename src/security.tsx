import {Eye,FileDown,LockKeyhole,Printer,Save,ShieldAlert,ShieldCheck,Users} from 'lucide-react';
import {useState} from 'react';
import {PageHead} from './components';
import type {Mail} from './types';

type SessionUser={name:string;role:string;department:string};
export const canViewMail=(mail:Mail,user:SessionUser)=>{
 if(mail.employee===user.name)return true;
 const level=mail.confidentiality||'داخلي';
 if(level==='داخلي')return true;
 const elevated=['رئيس قسم','مدير دائرة','رئيس البلدية','مدير النظام'].includes(user.role);
 if(level==='مقيد')return mail.department===user.department||elevated;
 if(level==='سري')return (mail.department===user.department&&elevated)||['رئيس البلدية','مدير النظام'].includes(user.role);
 return ['رئيس البلدية','مدير النظام'].includes(user.role);
};

const rows=[
 {level:'داخلي',view:'المستخدمون ضمن نطاق العمل',download:'مسموح',print:'مسموح',forward:'حسب المسار'},
 {level:'مقيد',view:'الوحدة المالكة والإدارة',download:'حسب الصلاحية',print:'حسب الصلاحية',forward:'داخل النطاق'},
 {level:'سري',view:'المديرون والمخولون فقط',download:'مسجل رقابياً',print:'مسجل رقابياً',forward:'بصلاحية خاصة'},
 {level:'سري جداً',view:'الإدارة العليا والمخولون',download:'مقيد جداً',print:'مقيد جداً',forward:'محظور افتراضياً'}
];
export function SecurityPolicies(){
 const [settings,setSettings]=useState(()=>({...{maskSearch:true,auditOpen:true,auditDownload:true,auditPrint:true,blockForwardTopSecret:true},...JSON.parse(localStorage.getItem('municipality-security-policy')||'{}')})),[saved,setSaved]=useState(false);
 const toggle=(key:keyof typeof settings)=>setSettings({...settings,[key]:!settings[key]});
 return <><PageHead title="سياسات السرية والوصول" subtitle="تحديد من يستطيع فتح الوثيقة أو تنزيلها أو طباعتها أو إحالتها وفق المستوى التنظيمي"/><div className="security-overview"><article><ShieldCheck/><div><b>4</b><span>مستويات سرية</span></div></article><article><LockKeyhole/><div><b>أقل صلاحية</b><span>قاعدة الوصول المعتمدة</span></div></article><article><ShieldAlert/><div><b>سجل كامل</b><span>فتح وتنزيل وطباعة</span></div></article></div><section className="panel security-matrix"><div className="security-head"><b>المستوى</b><b>صلاحية العرض</b><b><FileDown/> التنزيل</b><b><Printer/> الطباعة</b><b><Users/> الإحالة</b></div>{rows.map(r=><div className="security-row" key={r.level}><strong className={`security security-${r.level}`}>{r.level}</strong><span>{r.view}</span><span>{r.download}</span><span>{r.print}</span><span>{r.forward}</span></div>)}</section><section className="panel security-controls"><h2>الضوابط الرقابية</h2>{[
 ['maskSearch','إخفاء موضوع المراسلة السرية في نتائج البحث لغير المخول'],['auditOpen','تسجيل فتح المراسلات المقيدة والسرية'],['auditDownload','تسجيل تنزيل المرفقات'],['auditPrint','تسجيل طباعة المراسلة'],['blockForwardTopSecret','منع إحالة سري جداً دون صلاحية خاصة']
 ].map(([key,title])=><label key={key}><input type="checkbox" checked={Boolean(settings[key as keyof typeof settings])} onChange={()=>toggle(key as keyof typeof settings)}/><span>{title}</span></label>)}</section><button className="primary" onClick={()=>{localStorage.setItem('municipality-security-policy',JSON.stringify(settings));setSaved(true);setTimeout(()=>setSaved(false),1400)}}><Save/> حفظ سياسة السرية</button>{saved&&<div className="toast">تم حفظ سياسة السرية</div>}</>;
}
