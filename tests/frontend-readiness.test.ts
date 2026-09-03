import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { canAccessPath } from '../src/access';
import { getCompletionRate, getDashboardStatistics, getPeriodRange } from '../src/dashboard-stats';
import { seedMail } from '../src/data';
import { isFinalMailStatus, MAIL_STATUSES, normalizeMailStatus } from '../src/mailStatuses';
import { deadlineState } from '../src/components';

describe('جاهزية واجهة النظام', () => {
  it('يفصل صلاحيات الموظف العادي عن مسؤول الديوان', () => {
    const employee = { name: 'سارة خالد', role: 'موظف', department: 'الدائرة المالية' };
    const registry = { name: 'موظف الديوان', role: 'مأمور المراسلات', department: 'الديوان' };

    expect(canAccessPath(employee, '/app/inbox')).toBe(true);
    expect(canAccessPath(employee, '/app/users')).toBe(false);
    expect(canAccessPath(registry, '/app/users')).toBe(true);
  });

  it('يحسب مؤشرات لوحة التحكم دون تجاوز 100%', () => {
    expect(getCompletionRate(seedMail)).toBeGreaterThanOrEqual(0);
    expect(getCompletionRate(seedMail)).toBeLessThanOrEqual(100);
    const stats = getDashboardStatistics(seedMail, getPeriodRange('year', undefined, new Date('2026-09-01')));
    expect(stats.total).toBe(seedMail.length);
    expect(stats.completionRate).toBeLessThanOrEqual(100);
  });

  it('يحتوي إعداد Vercel على إعادة كتابة لمسارات React', () => {
    const config = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'vercel.json'), 'utf8'));
    expect(config.rewrites).toContainEqual({ source: '/(.*)', destination: '/index.html' });
  });

  it('يوحد جميع الحالات القديمة ويحمي الحالات النهائية من تنبيهات التأخير', () => {
    expect(normalizeMailStatus('تم الإنجاز')).toBe(MAIL_STATUSES.COMPLETED);
    expect(normalizeMailStatus('مؤرشف')).toBe(MAIL_STATUSES.ARCHIVED);
    expect(normalizeMailStatus('ملغي')).toBe(MAIL_STATUSES.CANCELLED);
    expect(normalizeMailStatus('تم التحويل')).toBe(MAIL_STATUSES.REFERRED);
    expect(normalizeMailStatus('قيد المعالجة')).toBe(MAIL_STATUSES.IN_PROGRESS);
    expect(normalizeMailStatus('معاد للتعديل')).toBe(MAIL_STATUSES.RETURNED);
    [MAIL_STATUSES.COMPLETED, MAIL_STATUSES.CLOSED, MAIL_STATUSES.ARCHIVED, MAIL_STATUSES.CANCELLED, MAIL_STATUSES.REJECTED].forEach(status => {
      expect(isFinalMailStatus(status)).toBe(true);
      expect(deadlineState('2020-01-01', status)).toBe('done');
    });
  });

  it('يغطي المرجع الموحد جميع حالات المراسلات الخمس عشرة', () => {
    expect(Object.values(MAIL_STATUSES)).toHaveLength(15);
    expect(new Set(Object.values(MAIL_STATUSES)).size).toBe(15);
  });
});
