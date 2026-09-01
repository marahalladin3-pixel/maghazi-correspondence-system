export type MailType='incoming'|'outgoing'|'internal';
export type Priority='عادي'|'عاجل'|'عاجل جداً';
export type CorrespondenceKind='مراسلة داخلية'|'مذكرة داخلية'|'إحالة'|'تعميم'|'نسخة للعلم'|'طلب إجراء';
export type Confidentiality='داخلي'|'مقيد'|'سري'|'سري جداً';
export interface Attachment {id:string;name:string;size:string;url?:string}
export interface Note {id:string;text:string;author:string;time:string}
export interface ReplyEntry {id:string;text:string;author:string;time:string;attachments?:Attachment[]}
export interface Workflow {id:string;from:string;to:string;action:string;time:string;status:string;note?:string}
export interface DocumentVersion {id:string;version:number;subject:string;body:string;reason:string;author:string;time:string}
export interface OriginalSnapshot {subject:string;body:string;attachments:Attachment[];sealedAt:string}
export interface Mail extends MailOptions {id:string;type:MailType;number:string;date:string;subject:string;from:string;to:string;department:string;employee:string;priority:Priority;status:string;dueDate?:string;body?:string;archived?:boolean;favorite?:boolean;read?:boolean;attachments:Attachment[];notes:Note[];replies?:ReplyEntry[];workflow:Workflow[]}
export interface RoutingRecipient {id:string;name:string;kind:'employee'|'department'|'group';action:string;access:string;dueDate?:string;replyRequired:boolean;note?:string}
export interface MailOptions {delegatedBy?:string;jobTitle?:string;correspondenceKind?:CorrespondenceKind;confidentiality?:Confidentiality;requiresReply?:boolean;linkedMailIds?:string[];reminderDate?:string;addToCalendar?:boolean;recipients?:RoutingRecipient[];copies?:string[];copyCategory?:string;confidential?:boolean;requiresClosure?:boolean;extensionRequested?:boolean;urgentReply?:boolean;requiresBrief?:boolean;archiveCategory?:string;archiveCode?:string;archivedAt?:string;archivedBy?:string;keywords?:string;sentAt?:string;viewedAt?:string;closedAt?:string;closeReason?:string;rejectedAt?:string;rejectionReason?:string;cancelledAt?:string;cancellationReason?:string;reopenedAt?:string;reopenReason?:string;originalSnapshot?:OriginalSnapshot;versions?:DocumentVersion[]}
export interface Audit {id:string;action:string;details:string;user:string;time:string;number?:string}
export interface Notification {id:string;title:string;details:string;time:string;read:boolean;mailId?:string}
export interface Department {id:string;name:string;manager:string;employees:number;active:boolean}
