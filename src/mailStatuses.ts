export const MAIL_STATUSES = {
  DRAFT: "مسودة",
  PENDING_APPROVAL: "بانتظار الاعتماد",
  SENT: "مرسلة",
  RECEIVED: "مستلمة",
  IN_PROGRESS: "قيد الإجراء",
  REFERRED: "محالة",
  WAITING_REPLY: "بانتظار الرد",
  REPLIED: "تم الرد",
  COMPLETED: "مكتملة",
  CLOSED: "مغلقة",
  ARCHIVED: "مؤرشفة",
  OVERDUE: "متأخرة",
  RETURNED: "معادة للتعديل",
  REJECTED: "مرفوضة",
  CANCELLED: "ملغاة",
} as const;

export type MailStatus = typeof MAIL_STATUSES[keyof typeof MAIL_STATUSES];
export type StatusTone = "success" | "danger" | "pending" | "neutral";

const aliases: Record<string, MailStatus> = {
  جديد: MAIL_STATUSES.RECEIVED,
  "قيد المعالجة": MAIL_STATUSES.IN_PROGRESS,
  "تم التحويل": MAIL_STATUSES.REFERRED,
  "تم الإرسال": MAIL_STATUSES.SENT,
  "تم الإنجاز": MAIL_STATUSES.COMPLETED,
  مؤرشف: MAIL_STATUSES.ARCHIVED,
  معتمدة: MAIL_STATUSES.COMPLETED,
  ملغي: MAIL_STATUSES.CANCELLED,
  "معاد للتعديل": MAIL_STATUSES.RETURNED,
  "بانتظار التدقيق": MAIL_STATUSES.PENDING_APPROVAL,
};

export function normalizeMailStatus(status: string): string {
  if (status.startsWith("متأخر")) return status;
  return aliases[status] || status;
}

export function mailStatusTone(status: string): StatusTone {
  const value = normalizeMailStatus(status);
  if (value.includes("متأخر") || value.includes("مرفوض") || value.includes("ملغ")) return "danger";
  if ([MAIL_STATUSES.COMPLETED, MAIL_STATUSES.CLOSED, MAIL_STATUSES.ARCHIVED, MAIL_STATUSES.SENT, MAIL_STATUSES.RECEIVED, MAIL_STATUSES.REPLIED].some(x => value.includes(x))) return "success";
  if (value.includes("انتظار") || value.includes("مسودة") || value.includes("قيد")) return "pending";
  return "neutral";
}

const finalStatuses = new Set<MailStatus>([
  MAIL_STATUSES.COMPLETED,
  MAIL_STATUSES.CLOSED,
  MAIL_STATUSES.ARCHIVED,
  MAIL_STATUSES.CANCELLED,
  MAIL_STATUSES.REJECTED,
]);

export function isFinalMailStatus(status: string): boolean {
  return finalStatuses.has(normalizeMailStatus(status) as MailStatus);
}

export function isMailStatus(status: string, expected: MailStatus): boolean {
  return normalizeMailStatus(status) === expected;
}

export function isPendingReviewStatus(status: string): boolean {
  return status === "بانتظار التدقيق";
}
