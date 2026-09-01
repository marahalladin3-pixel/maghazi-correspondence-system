import { useState } from 'react';
import { BellRing, Building2, DatabaseBackup, Hash, Mail, RotateCcw, Save, ShieldCheck } from 'lucide-react';
import { PageHead } from './components';

const defaults = { municipalityName:'بلدية المغازي', officialEmail:'info@maghazi.ps', numberPrefix:'MUN', sequenceStart:'1', numberLength:'5', retentionYears:'7', alertDays:'3', annualReset:true, blockDelete:true, auditDownloads:true, backupDaily:true };

export function SystemSettings() {
  const [settings,setSettings]=useState(()=>({...defaults,...JSON.parse(localStorage.getItem('municipality-system-settings')||'{}')}));
  const [saved,setSaved]=useState(false);
  const set=(key:string,value:string|boolean)=>setSettings({...settings,[key]:value});
  const save=()=>{localStorage.setItem('municipality-system-settings',JSON.stringify(settings));setSaved(true);setTimeout(()=>setSaved(false),1400)};
  const preview=`${settings.numberPrefix||'MUN'}-${new Date().getFullYear()}-${String(settings.sequenceStart||1).padStart(Number(settings.numberLength),'0')}`;
  return <div className="settings-page">
    <PageHead title="إعدادات المراسلات" subtitle="الهوية الرسمية والترقيم والمواعيد وسياسات حفظ المراسلات" />
    <div className="settings-overview">
      <article><Hash/><span><small>مثال الرقم القادم</small><b dir="ltr">{preview}</b></span></article>
      <article><BellRing/><span><small>التنبيه قبل الموعد</small><b>{settings.alertDays} أيام</b></span></article>
      <article><DatabaseBackup/><span><small>مدة الاحتفاظ</small><b>{settings.retentionYears==='0'?'دائم':`${settings.retentionYears} سنوات`}</b></span></article>
    </div>
    <div className="settings-layout">
      <section className="panel settings-card identity-settings">
        <div className="settings-title"><Building2/><div><h2>هوية الجهة</h2><p>البيانات التي تظهر في الكتب والتقارير الرسمية</p></div></div>
        <div className="settings-grid two">
          <label>اسم الجهة<input value={settings.municipalityName} onChange={e=>set('municipalityName',e.target.value)}/></label>
          <label>البريد الرسمي<div className="settings-input-icon"><Mail/><input type="email" value={settings.officialEmail} onChange={e=>set('officialEmail',e.target.value)}/></div></label>
        </div>
      </section>
      <section className="panel settings-card deadlines-settings">
        <div className="settings-title"><BellRing/><div><h2>المهل والأرشفة</h2><p>مواعيد التنبيه وفترة الاحتفاظ بالسجلات</p></div></div>
        <div className="settings-grid two">
          <label>التنبيه قبل الاستحقاق<select value={settings.alertDays} onChange={e=>set('alertDays',e.target.value)}><option value="1">يوم واحد</option><option value="2">يومان</option><option value="3">3 أيام</option><option value="7">7 أيام</option></select></label>
          <label>مدة الاحتفاظ<select value={settings.retentionYears} onChange={e=>set('retentionYears',e.target.value)}><option value="7">7 سنوات</option><option value="10">10 سنوات</option><option value="0">حفظ دائم</option></select></label>
        </div>
      </section>
      <section className="panel settings-card numbering-settings">
        <div className="settings-title"><Hash/><div><h2>ترقيم المراسلات</h2><p>تكوين رقم مرجعي واضح لكل مراسلة جديدة</p></div></div>
        <div className="settings-grid numbering-grid">
          <label>بادئة الرقم<input dir="ltr" value={settings.numberPrefix} maxLength={8} onChange={e=>set('numberPrefix',e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g,''))}/></label>
          <label>بداية التسلسل<input type="number" min="1" value={settings.sequenceStart} onChange={e=>set('sequenceStart',e.target.value)}/></label>
          <label>عدد الخانات<select value={settings.numberLength} onChange={e=>set('numberLength',e.target.value)}><option>4</option><option>5</option><option>6</option></select></label>
          <label>معاينة الرقم<input value={preview} readOnly/></label>
        </div>
        <label className="setting-toggle"><input type="checkbox" checked={settings.annualReset} onChange={e=>set('annualReset',e.target.checked)}/><span><b>بدء تسلسل جديد سنويًا</b><small>يعود العداد إلى البداية مع أول مراسلة في السنة الجديدة</small></span></label>
      </section>
      <section className="panel settings-card policies-settings">
        <div className="settings-title"><ShieldCheck/><div><h2>سياسات الحماية</h2><p>ضوابط الأصل الإلكتروني وسجل العمليات</p></div></div>
        <div className="settings-toggle-list">{[
          ['blockDelete','منع الحذف النهائي','لا يمكن حذف المراسلة بعد إرسالها أو اعتمادها'],
          ['auditDownloads','تسجيل التعامل مع المرفقات','يحفظ النظام عمليات الفتح والتنزيل والطباعة'],
          ['backupDaily','نسخة احتياطية يومية','تُفعّل فعليًا عند ربط النظام بالخادم'],
        ].map(([key,title,description])=><label className="setting-toggle" key={key}><input type="checkbox" checked={Boolean(settings[key as keyof typeof settings])} onChange={e=>set(key,e.target.checked)}/><span><b>{title}</b><small>{description}</small></span>{key==='backupDaily'?<DatabaseBackup/>:<ShieldCheck/>}</label>)}</div>
      </section>
    </div>
    <div className="settings-actionbar">
      <div><b>إعدادات المراسلات</b><small>تُحفظ التغييرات على هذا الجهاز حاليًا حتى ربط الخادم.</small></div>
      <button className="secondary" onClick={()=>setSettings({...defaults})}><RotateCcw/> استعادة الافتراضي</button>
      <button className="primary" onClick={save}><Save/> حفظ التغييرات</button>
    </div>
    {saved&&<div className="toast">تم حفظ إعدادات المراسلات</div>}
  </div>;
}
