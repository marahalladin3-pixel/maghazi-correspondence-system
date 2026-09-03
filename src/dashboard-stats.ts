import type { Mail } from './types';
import { isFinalMailStatus, MAIL_STATUSES, normalizeMailStatus } from './mailStatuses';

export type DashboardPeriod = 'today'|'7days'|'week'|'month'|'previousMonth'|'year'|'custom';
export type AnalysisMode = 'daily'|'weekly'|'monthly';
export type DateRange = { from: string; to: string };
const DAY = 86400000;
const iso = (date:Date) => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
const atStart = (value:string) => new Date(`${value}T00:00:00`);
export const isCompleted = (mail:Mail) => isFinalMailStatus(mail.status) || Boolean(mail.archived);

export function getPeriodRange(period:DashboardPeriod, custom?:DateRange, reference=new Date()):DateRange {
  const today=new Date(reference);today.setHours(0,0,0,0);
  if(period==='today')return {from:iso(today),to:iso(today)};
  if(period==='7days'){const from=new Date(today);from.setDate(from.getDate()-6);return {from:iso(from),to:iso(today)}}
  if(period==='week'){const from=new Date(today);from.setDate(from.getDate()-today.getDay());const to=new Date(from);to.setDate(to.getDate()+6);return {from:iso(from),to:iso(to)}}
  if(period==='month')return {from:iso(new Date(today.getFullYear(),today.getMonth(),1)),to:iso(new Date(today.getFullYear(),today.getMonth()+1,0))};
  if(period==='previousMonth')return {from:iso(new Date(today.getFullYear(),today.getMonth()-1,1)),to:iso(new Date(today.getFullYear(),today.getMonth(),0))};
  if(period==='year')return {from:iso(new Date(today.getFullYear(),0,1)),to:iso(new Date(today.getFullYear(),11,31))};
  return custom?.from&&custom?.to?custom:{from:iso(today),to:iso(today)};
}

export function previousRange(range:DateRange):DateRange {
  const from=atStart(range.from),to=atStart(range.to),days=Math.round((to.getTime()-from.getTime())/DAY)+1;
  const previousTo=new Date(from.getTime()-DAY),previousFrom=new Date(previousTo.getTime()-(days-1)*DAY);
  return {from:iso(previousFrom),to:iso(previousTo)};
}

export const inRange=(mail:Mail,range:DateRange)=>mail.date>=range.from&&mail.date<=range.to;
export const getOverdueCorrespondence=(mail:Mail[],today=iso(new Date()))=>mail.filter(m=>m.dueDate!==undefined&&m.dueDate<today&&!isCompleted(m));
export const getDueTodayCorrespondence=(mail:Mail[],today=iso(new Date()))=>mail.filter(m=>m.dueDate===today&&!isCompleted(m));
export const getPriorityCorrespondence=(mail:Mail[])=>mail.filter(m=>['مهم','عاجل','عاجل جداً'].includes(m.priority)&&!isCompleted(m));
export const getCompletionRate=(mail:Mail[])=>mail.length?Math.round(mail.filter(isCompleted).length/mail.length*100):0;

export function getDashboardStatistics(all:Mail[],range:DateRange) {
  const rows=all.filter(m=>inRange(m,range));
  const completed=rows.filter(isCompleted);
  const activeStatuses=[MAIL_STATUSES.IN_PROGRESS,MAIL_STATUSES.REFERRED,MAIL_STATUSES.WAITING_REPLY,MAIL_STATUSES.PENDING_APPROVAL];
  return {rows,total:rows.length,incoming:rows.filter(m=>m.type==='incoming').length,outgoing:rows.filter(m=>m.type==='outgoing').length,processing:rows.filter(m=>activeStatuses.includes(normalizeMailStatus(m.status) as typeof activeStatuses[number])).length,completed:completed.length,completionRate:getCompletionRate(rows)};
}

export function comparison(current:number,previous:number) {
  if(!previous)return null;
  return Math.round((current-previous)/previous*100);
}

export function getTimeSeries(mail:Mail[],range:DateRange,mode:AnalysisMode) {
  const rows=mail.filter(m=>inRange(m,range));
  const buckets=new Map<string,{label:string;incoming:number;outgoing:number;completed:number}>();
  const from=atStart(range.from);
  rows.forEach(m=>{
    const date=atStart(m.date);let key=m.date,label=new Intl.DateTimeFormat('ar-PS',{day:'numeric',month:'short'}).format(date);
    if(mode==='weekly'){const week=Math.floor((date.getTime()-from.getTime())/(7*DAY))+1;key=`w-${week}`;label=`الأسبوع ${week}`}
    if(mode==='monthly'){key=m.date.slice(0,7);label=new Intl.DateTimeFormat('ar-PS',{month:'long',year:'numeric'}).format(date)}
    const bucket=buckets.get(key)||{label,incoming:0,outgoing:0,completed:0};
    if(m.type==='incoming')bucket.incoming++;if(m.type==='outgoing')bucket.outgoing++;if(isCompleted(m))bucket.completed++;buckets.set(key,bucket);
  });
  return [...buckets.entries()].sort(([a],[b])=>a.localeCompare(b)).map(([,value])=>value);
}

export function getDepartmentPerformance(mail:Mail[]) {
  return [...new Set(mail.map(m=>m.department).filter(Boolean))].map(department=>{const rows=mail.filter(m=>m.department===department),completed=rows.filter(isCompleted).length,overdue=getOverdueCorrespondence(rows).length;return {department,total:rows.length,completed,overdue,rate:getCompletionRate(rows)}}).sort((a,b)=>b.total-a.total);
}
