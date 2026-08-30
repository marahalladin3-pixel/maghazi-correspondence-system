window.AppContext={
  municipality:{name:"بلدية المغازي",email:"",address:"مخيم المغازي – فلسطين",fiscalYear:"2026",numbering:"سنوي"},
  currentUser:null,
  notifications:[
    {id:1,title:"تم تحويل كتاب جديد إليك",details:"الكتاب 145/2026 من الديوان",time:"منذ 5 دقائق",read:false},
    {id:2,title:"مراسلة تحتاج متابعة",details:"المراسلة 143/2026 متأخرة",time:"منذ ساعة",read:false},
    {id:3,title:"تم إنجاز معاملة",details:"أُنجز الكتاب 141/2026",time:"أمس",read:false}
  ]
};
window.DemoData={incoming:[
{id:1,number:"145/2026",date:"2026-08-17",sender:"وزارة الحكم المحلي",subject:"اعتماد مخطط شبكة الشوارع",department:"دائرة الهندسة",employee:"م. أحمد محمد",priority:"عاجل",status:"قيد المعالجة"},
{id:2,number:"144/2026",date:"2026-08-17",sender:"وزارة المالية",subject:"تعزيز مخصصات الموازنة السنوية",department:"الدائرة المالية",employee:"سارة خالد",priority:"عادي",status:"جديد"},
{id:3,number:"143/2026",date:"2026-08-16",sender:"سلطة جودة البيئة",subject:"تقرير تقييم الأثر البيئي",department:"الصحة والبيئة",employee:"رامي عادل",priority:"عاجل جداً",status:"متأخر"},
{id:4,number:"142/2026",date:"2026-08-16",sender:"وزارة الأشغال العامة",subject:"صيانة الطريق الرئيسي",department:"دائرة الهندسة",employee:"ليلى حسن",priority:"عاجل",status:"بانتظار الرد"},
{id:5,number:"141/2026",date:"2026-08-15",sender:"ديوان الموظفين العام",subject:"تحديث الهيكل التنظيمي",department:"الشؤون الإدارية",employee:"محمد أحمد",priority:"عادي",status:"تم الإنجاز"},
{id:6,number:"140/2026",date:"2026-08-15",sender:"وزارة الصحة",subject:"حملة مكافحة الحشرات",department:"الصحة والبيئة",employee:"هدى سمير",priority:"عاجل",status:"تم التحويل"},
{id:7,number:"139/2026",date:"2026-08-14",sender:"شركة توزيع الكهرباء",subject:"نقل أعمدة شبكة الكهرباء",department:"المشاريع",employee:"محمود يوسف",priority:"عادي",status:"قيد المعالجة"},
{id:8,number:"138/2026",date:"2026-08-13",sender:"وزارة الزراعة",subject:"تنظيم السوق الزراعي",department:"العلاقات العامة",employee:"نور خليل",priority:"عادي",status:"مؤرشف"},
{id:9,number:"137/2026",date:"2026-08-12",sender:"الدفاع المدني",subject:"اشتراطات السلامة العامة",department:"دائرة الهندسة",employee:"م. أحمد محمد",priority:"عاجل",status:"تمت المشاهدة"},
{id:10,number:"136/2026",date:"2026-08-11",sender:"وزارة الاتصالات",subject:"تطوير مركز خدمات الجمهور",department:"تكنولوجيا المعلومات",employee:"وسام علي",priority:"عادي",status:"تم الإنجاز"},
{id:11,number:"135/2026",date:"2026-08-10",sender:"مجلس الخدمات المشترك",subject:"جدول جمع النفايات",department:"الصحة والبيئة",employee:"رامي عادل",priority:"عادي",status:"قيد المعالجة"},
{id:12,number:"134/2026",date:"2026-08-09",sender:"وزارة الثقافة",subject:"رعاية المهرجان التراثي",department:"العلاقات العامة",employee:"نور خليل",priority:"عادي",status:"تم الإنجاز"},
{id:13,number:"133/2026",date:"2026-08-08",sender:"سلطة المياه",subject:"توسعة شبكة المياه",department:"المياه والصرف الصحي",employee:"عمر جمال",priority:"عاجل",status:"بانتظار الرد"},
{id:14,number:"132/2026",date:"2026-08-07",sender:"وزارة التربية والتعليم",subject:"تأهيل ساحات المدارس",department:"المشاريع",employee:"محمود يوسف",priority:"عادي",status:"مؤرشف"},
{id:15,number:"131/2026",date:"2026-08-06",sender:"المحافظة",subject:"محضر اجتماع لجنة الطوارئ",department:"الديوان",employee:"محمد أحمد",priority:"عاجل جداً",status:"متأخر"}],
outgoing:[{number:"88/2026",date:"2026-08-17",to:"وزارة الحكم المحلي",subject:"طلب اعتماد مشروع تأهيل الطرق",department:"المشاريع",employee:"محمود يوسف",status:"تم الإرسال"},{number:"87/2026",date:"2026-08-16",to:"سلطة المياه",subject:"متابعة مشروع شبكة المياه",department:"المياه والصرف الصحي",employee:"عمر جمال",status:"بانتظار الرد"},{number:"86/2026",date:"2026-08-15",to:"وزارة المالية",subject:"كشف النفقات الربعي",department:"الدائرة المالية",employee:"سارة خالد",status:"تم الإنجاز"}],
internal:[{number:"د-32/2026",type:"تعميم",from:"رئيس البلدية",to:"جميع الأقسام",subject:"الالتزام بساعات الدوام",date:"2026-08-17",status:"جديد"},{number:"د-31/2026",type:"تكليف",from:"المدير العام",to:"دائرة الهندسة",subject:"متابعة مشروع السوق المركزي",date:"2026-08-16",status:"قيد المعالجة"},{number:"د-30/2026",type:"مذكرة داخلية",from:"الدائرة المالية",to:"المشاريع",subject:"إغلاق السلف المالية",date:"2026-08-15",status:"تم الإنجاز"}],
departments:["مكتب رئيس البلدية","الديوان","دائرة الهندسة","الدائرة المالية","الشؤون الإدارية","الصحة والبيئة","المياه والصرف الصحي","المشاريع","العلاقات العامة","تكنولوجيا المعلومات"],
users:[{name:"أحمد محمد",email:"ahmad@municipality.ps",dept:"دائرة الهندسة",title:"مهندس تنظيم",role:"موظف",status:"نشط"},{name:"سارة خالد",email:"sara@municipality.ps",dept:"الدائرة المالية",title:"مدير الدائرة",role:"مدير قسم",status:"نشط"},{name:"محمد أحمد",email:"mohammad@municipality.ps",dept:"الديوان",title:"موظف ديوان",role:"موظف الديوان",status:"نشط"},{name:"وسام علي",email:"wisam@municipality.ps",dept:"تكنولوجيا المعلومات",title:"مدير النظام",role:"مدير النظام",status:"نشط"}],
notifications:["تم تحويل كتاب جديد إليك — 145/2026","المراسلة 143/2026 متأخرة","تم إنجاز الكتاب 141/2026"],
activities:["قام م. أحمد محمد بتحويل الكتاب 145/2026 إلى دائرة الهندسة","قامت سارة خالد بإنجاز الكتاب 141/2026","سجّل محمد أحمد كتابًا واردًا جديدًا 144/2026"]};

(function(){
  const STORAGE={incoming:'municipalityIncoming',outgoing:'municipalityOutgoing',internal:'municipalityInternal',notifications:'correspondenceEmployeeNotifications',audit:'municipalityAuditLog'};
  const CLOSED=['تم الإنجاز','ملغي','مؤرشف'];
  const transitions={
    'مسودة':['بانتظار التدقيق','ملغي'],
    'بانتظار التدقيق':['بانتظار الاعتماد','معاد للتعديل','ملغي'],
    'بانتظار الاعتماد':['تم الإرسال','معاد للتعديل','ملغي'],
    'معتمدة':['تم الإرسال','ملغي'],
    'معاد للتعديل':['بانتظار التدقيق','ملغي'],
    'جديد':['تم التحويل','قيد المعالجة','ملغي'],
    'غير مقروء':['قيد المعالجة','تم التحويل'],
    'تم التحويل':['قيد المعالجة','بانتظار الرد','تم الإنجاز','معاد'],
    'قيد المعالجة':['بانتظار الرد','تم الإنجاز','تم التحويل','معاد'],
    'بانتظار الرد':['قيد المعالجة','تم الإنجاز','متأخر'],
    'متأخر':['قيد المعالجة','بانتظار الرد','تم الإنجاز'],
    'تم الإرسال':['بانتظار الرد','تم الإنجاز'],
    'تم الإنجاز':['مؤرشف','قيد المعالجة'],
    'معاد':['قيد المعالجة','تم التحويل'],
    'مؤرشف':['قيد المعالجة'],
    'ملغي':[]
  };
  const clone=value=>JSON.parse(JSON.stringify(value));
  const read=(key,fallback=[])=>{try{const value=JSON.parse(localStorage.getItem(key));return Array.isArray(value)?value:clone(fallback)}catch{return clone(fallback)}};
  const write=(key,value)=>{localStorage.setItem(key,JSON.stringify(value));return value};
  const actor=()=>window.AppContext?.currentUser||{id:null,name:'مستخدم البلدية',role:'موظف',department:null};
  const typeInfo=type=>({incoming:{key:STORAGE.incoming,seed:DemoData.incoming,label:'وارد'},outgoing:{key:STORAGE.outgoing,seed:DemoData.outgoing,label:'صادر'},internal:{key:STORAGE.internal,seed:DemoData.internal,label:'داخلي'}}[type]);
  const list=type=>{const info=typeInfo(type);if(!info)throw new Error('نوع المراسلة غير معروف');return read(info.key,info.seed)};
  const audit=(action,details={})=>{const user=actor(),events=read(STORAGE.audit);const event={id:Date.now()+Math.random(),action,details,userId:user.id,user:user.name,role:user.role,time:new Date().toISOString()};write(STORAGE.audit,[event,...events].slice(0,3000));return event};
  const notify=({title,message,number='',employee=null,department=null,href='inbox.html',recordId=null,dedupeKey=null})=>{const rows=read(STORAGE.notifications);if(dedupeKey&&rows.some(x=>x.dedupeKey===dedupeKey))return null;const notification={id:Date.now()+Math.random(),title,message,number,employee,department,href,recordId,dedupeKey,time:new Date().toISOString(),read:false};write(STORAGE.notifications,[notification,...rows].slice(0,500));return notification};
  const save=(type,rows)=>write(typeInfo(type).key,rows);
  const find=(type,id)=>list(type).find(row=>String(row.id)===String(id)||String(row.number)===String(id));
  const create=(type,data)=>{const rows=list(type),user=actor(),now=new Date().toISOString(),record={id:data.id||Date.now(),status:data.status||'مسودة',createdAt:now,createdBy:user.name,workflow:data.workflow||[],notes:data.notes||[],attachments:data.attachments||[],...data};save(type,[record,...rows]);audit('إنشاء مراسلة',{type,id:record.id,number:record.number,status:record.status});return record};
  const update=(type,id,changes,action='تحديث بيانات المراسلة')=>{const rows=list(type),index=rows.findIndex(row=>String(row.id)===String(id)||String(row.number)===String(id));if(index<0)throw new Error('المراسلة غير موجودة');rows[index]={...rows[index],...changes,updatedAt:new Date().toISOString()};save(type,rows);audit(action,{type,id:rows[index].id,number:rows[index].number,changes:Object.keys(changes)});return rows[index]};
  const setStatus=(type,id,status,{reason='',force=false}={})=>{const current=find(type,id);if(!current)throw new Error('المراسلة غير موجودة');const allowed=transitions[current.status]||[];if(!force&&!allowed.includes(status))throw new Error(`لا يمكن نقل الحالة من «${current.status}» إلى «${status}»`);return update(type,id,{status,statusReason:reason},`تغيير الحالة إلى ${status}`)};
  const transfer=(type,id,{targetType='department',target,action='للمتابعة',access='المستلم فقط',dueDate='',replyRequired=false,note=''})=>{if(!target)throw new Error('يجب تحديد المستلم');const current=find(type,id);if(!current)throw new Error('المراسلة غير موجودة');const user=actor(),step={id:Date.now(),from:user.name,to:target,targetType,action,access,dueDate,replyRequired,note,time:new Date().toISOString(),status:'مفتوح'};const changes={workflow:[...(current.workflow||[]),step],assignedTo:target,requiredAction:action,access,dueDate,replyRequired,status:'تم التحويل'};if(targetType==='employee')changes.employee=target;else changes.department=target;const record=update(type,id,changes,'تحويل المراسلة');notify({title:'وصلتك مراسلة جديدة',message:`${current.number||current.subject} — ${action}`,number:current.number||'',employee:targetType==='employee'?target:null,department:targetType==='department'?target:null,recordId:current.id,href:type==='incoming'?`incoming-details.html?id=${current.id}`:'inbox.html'});return record};
  const addNote=(type,id,text)=>{const current=find(type,id);if(!current||!String(text).trim())throw new Error('الملاحظة غير صالحة');const user=actor(),note={id:Date.now(),text:String(text).trim(),author:user.name,time:new Date().toISOString()};return update(type,id,{notes:[...(current.notes||[]),note]},'إضافة ملاحظة')};
  const archive=(type,id)=>{const current=find(type,id);if(!current)throw new Error('المراسلة غير موجودة');if(current.status!=='تم الإنجاز')throw new Error('يجب إنهاء المعاملة قبل أرشفتها');return update(type,id,{status:'مؤرشف',archived:true,archivedAt:new Date().toISOString()},'أرشفة المراسلة')};
  const markNotificationRead=id=>{const rows=read(STORAGE.notifications),row=rows.find(x=>String(x.id)===String(id));if(row)row.read=true;write(STORAGE.notifications,rows)};
  const permissions={
    'موظف':['view_assigned','create','comment','request_extension'],
    'موظف الديوان':['view_registry','create_incoming','number_outgoing','scan','print_registry'],
    'مدير قسم':['view_department','transfer','review','approve_extension','reports_department'],
    'مدير البلدية':['view_all','transfer','approve','reopen','reports_all'],
    'مسؤول الأرشيف':['view_archive','archive','restore','export_archive'],
    'مدير النظام':['*']
  };
  const can=action=>{const current=window.AppContext?.currentUser;if(!current)return true;const granted=permissions[current.role]||[];return granted.includes('*')||granted.includes(action)||(Array.isArray(current.permissions)&&current.permissions.includes(action))};
  const submitForApproval=(type,id)=>{const current=find(type,id);if(!current)throw new Error('المراسلة غير موجودة');if(!['مسودة','معاد للتعديل'].includes(current.status))throw new Error('هذه المراسلة ليست جاهزة للإرسال للتدقيق');return update(type,id,{status:'بانتظار التدقيق',submittedAt:new Date().toISOString()},'إرسال المراسلة للتدقيق')};
  const approve=(type,id,note='')=>{const current=find(type,id);if(!current)throw new Error('المراسلة غير موجودة');if(current.status==='بانتظار التدقيق'){const updated=update(type,id,{status:'بانتظار الاعتماد',reviewedAt:new Date().toISOString(),reviewNote:note},'اجتياز التدقيق');notify({title:'مراسلة بانتظار اعتمادك',message:`${current.number||current.subject} اجتازت التدقيق`,number:current.number||'',recordId:current.id});return updated}if(current.status==='بانتظار الاعتماد'){return update(type,id,{status:'معتمدة',approvedAt:new Date().toISOString(),approvalNote:note,approvedBy:actor().name},'اعتماد المراسلة')}throw new Error('حالة المراسلة لا تسمح بالاعتماد')};
  const returnForEdit=(type,id,note)=>{if(!String(note||'').trim())throw new Error('يجب كتابة سبب الإعادة');const current=find(type,id);if(!current||!['بانتظار التدقيق','بانتظار الاعتماد'].includes(current.status))throw new Error('لا يمكن إعادة المراسلة في حالتها الحالية');notify({title:'أُعيدت المراسلة للتعديل',message:`${current.number||current.subject} — ${note}`,number:current.number||'',recordId:current.id});return update(type,id,{status:'معاد للتعديل',returnReason:note,returnedAt:new Date().toISOString()},'إعادة المراسلة للتعديل')};
  const requestExtension=(type,id,{newDueDate,reason})=>{if(!newDueDate||!String(reason||'').trim())throw new Error('الموعد الجديد والسبب مطلوبان');return update(type,id,{extensionRequest:{newDueDate,reason,status:'بانتظار الموافقة',requestedAt:new Date().toISOString(),requestedBy:actor().name}},'طلب تمديد المهلة')};
  const decideExtension=(type,id,approved,note='')=>{const current=find(type,id);if(!current?.extensionRequest)throw new Error('لا يوجد طلب تمديد');const extensionRequest={...current.extensionRequest,status:approved?'مقبول':'مرفوض',decisionNote:note,decidedAt:new Date().toISOString(),decidedBy:actor().name},changes={extensionRequest};if(approved)changes.dueDate=extensionRequest.newDueDate;return update(type,id,changes,approved?'اعتماد تمديد المهلة':'رفض تمديد المهلة')};
  const sla=record=>{if(CLOSED.includes(record.status))return {state:'closed',label:'مغلقة',days:0};if(!record.dueDate)return {state:'none',label:'دون مهلة',days:null};const due=new Date(`${record.dueDate}T23:59:59`),diff=Math.ceil((due-Date.now())/86400000);return diff<0?{state:'late',label:`متأخرة ${Math.abs(diff)} يوم`,days:diff}:diff<=2?{state:'soon',label:`متبقي ${diff} يوم`,days:diff}:{state:'on-time',label:`متبقي ${diff} أيام`,days:diff}};
  const processDeadlines=()=>{['incoming','internal'].forEach(type=>list(type).forEach(record=>{const state=sla(record);if(!['late','soon'].includes(state.state))return;const day=new Date().toISOString().slice(0,10);notify({title:state.state==='late'?'مراسلة متأخرة':'المهلة تقترب',message:`${record.number||record.subject} — ${state.label}`,number:record.number||'',employee:record.employee||null,department:record.department||null,recordId:record.id,href:type==='incoming'?`incoming-details.html?id=${record.id}`:'inbox.html',dedupeKey:`sla:${type}:${record.id||record.number}:${state.state}:${day}`})}))};
  window.CorrespondenceSystem={version:'1.2.0',states:Object.keys(transitions),transitions,permissions,can,list,find,create,update,setStatus,transfer,addNote,archive,submitForApproval,approve,returnForEdit,requestExtension,decideExtension,sla,processDeadlines,audit,notify,notifications:()=>read(STORAGE.notifications),auditLog:()=>read(STORAGE.audit),markNotificationRead};
})();
