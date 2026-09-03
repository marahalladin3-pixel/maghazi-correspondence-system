import type {Audit,Department,Mail,Notification} from './types';
export const seedMail:Mail[]=[];
export const departments:Department[]=[['الديوان','محمد أحمد',4],['دائرة الهندسة','سليم النجار',12],['الدائرة المالية','سارة خالد',7],['الشؤون الإدارية','ليلى حسن',8],['الصحة والبيئة','رامي عادل',10],['المشاريع','محمود يوسف',6],['العلاقات العامة','نور خليل',5],['تكنولوجيا المعلومات','وسام علي',4]].map((d,i)=>({id:String(i+1),name:String(d[0]),manager:String(d[1]),employees:Number(d[2]),active:true}));
export const seedNotifications:Notification[]=[];
export const seedAudit:Audit[]=[];
export const departmentNames=departments.map(x=>x.name);
