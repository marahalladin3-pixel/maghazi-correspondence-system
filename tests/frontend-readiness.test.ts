import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { canAccessPath } from '../src/access';
import { getCompletionRate, getDashboardStatistics, getPeriodRange } from '../src/dashboard-stats';
import { seedMail } from '../src/data';

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
});
