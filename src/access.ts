export type SessionUser = { name: string; role: string; department: string };

const employeePaths = [
  '/app/dashboard',
  '/app/inbox',
  '/app/followup',
  '/app/search',
  '/app/internal',
  '/app/circulars',
  '/app/calendar',
  '/app/templates',
  '/app/directory',
  '/app/cases',
  '/app/compose',
  '/app/mail',
  '/app/profile',
  '/verify',
];

export const isOrdinaryEmployee = (user: SessionUser) => user.role === 'موظف';

export const canAccessPath = (user: SessionUser, path: string) =>
  !isOrdinaryEmployee(user) || employeePaths.some((allowed) => path.startsWith(allowed));
