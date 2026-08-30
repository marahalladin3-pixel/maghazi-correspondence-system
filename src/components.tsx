import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Archive,
  ArrowLeftRight,
  BarChart3,
  Bell,
  BookUser,
  Building2,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  Clock3,
  FileInput,
  FileOutput,
  FileSignature,
  FolderArchive,
  FolderKanban,
  Home,
  Inbox,
  LockKeyhole,
  LogOut,
  Megaphone,
  Menu,
  MessageSquareText,
  PenLine,
  Plus,
  ScanLine,
  Search,
  Settings,
  ShieldCheck,
  UserCheck,
  UserRound,
  Users,
  History,
  X,
} from "lucide-react";
import { useStore } from "./store";
export const nav = [
  ["/app/dashboard", "لوحة التحكم", Home],
  ["/app/inbox", "صندوق الوارد الخاص بي", Inbox],
  ["/app/approvals", "الاعتمادات", ShieldCheck],
  ["/app/followup", "الإحالات والمتابعة", ArrowLeftRight],
  ["/app/search", "الاستعلام المتقدم", Search],
  ["/app/incoming", "البريد الوارد", FileInput],
  ["/app/outgoing", "البريد الصادر", FileOutput],
  ["/app/internal", "المراسلات الداخلية", MessageSquareText],
  ["/app/circulars", "التعاميم", Megaphone],
  ["/app/calendar", "أجندة المراسلات", CalendarDays],
  ["/app/delegations", "التفويض والإنابة", UserCheck],
  ["/app/templates", "قوالب المراسلات", FileSignature],
  ["/app/directory", "دليل الجهات والتوزيع", BookUser],
  ["/app/cases", "ملفات الموضوع", FolderKanban],
  ["/app/compose/outgoing", "إنشاء مراسلة", PenLine],
  ["/app/scanner", "مركز المسح الضوئي", ScanLine],
  ["/app/archive", "الأرشيف الإلكتروني", FolderArchive],
  ["/app/reports", "التقارير", BarChart3],
  ["/app/departments", "الهيكل التنظيمي", Building2],
  ["/app/users", "المستخدمون والصلاحيات", Users],
  ["/app/workflows", "مسارات الاعتماد والتوجيه", ArrowLeftRight],
  ["/app/activity", "سجل العمليات", History],
  ["/app/security", "سياسات السرية", LockKeyhole],
  ["/app/settings", "إعدادات المراسلات", Settings],
] as const;
function ProfileMenu() {
  const [open, setOpen] = useState(false),
    [avatar, setAvatar] = useState(
      () => localStorage.getItem("municipality-profile-avatar") || "",
    );
  const user = useStore((s) => s.user),
    navigate = useNavigate();
  useEffect(() => {
    const handler = (event: Event) =>
      setAvatar(String((event as CustomEvent).detail || ""));
    window.addEventListener("profile-avatar-updated", handler);
    return () => window.removeEventListener("profile-avatar-updated", handler);
  }, []);
  return (
    <div className="profile-wrap">
      <button className="profile" onClick={() => setOpen(!open)}>
        <ChevronDown />
        <div className="avatar">
          {avatar ? <img src={avatar} alt="صورة المستخدم" /> : "م"}
        </div>
        <div>
          <strong>{user.name}</strong>
          <small>{user.role}</small>
        </div>
      </button>
      {open && (
        <div className="profile-menu">
          <button
            onClick={() => {
              navigate("/app/profile");
              setOpen(false);
            }}
          >
            <UserRound /> الملف الشخصي
          </button>
          <button
            onClick={() => {
              navigate("/app/settings");
              setOpen(false);
            }}
          >
            <Settings /> الإعدادات
          </button>
          <button>
            <LogOut /> تسجيل الخروج
          </button>
        </div>
      )}
    </div>
  );
}
export function Layout({ children }: { children: React.ReactNode }) {
  const [side, setSide] = useState(false),
    [notes, setNotes] = useState(false),
    [q, setQ] = useState("");
  const { notifications, user, mail } = useStore();
  const navigate = useNavigate(),
    loc = useLocation();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const alertDays = Number(
    JSON.parse(localStorage.getItem("municipality-system-settings") || "{}")
      .alertDays || 3,
  );
  const deadlineAlerts = mail
    .filter(
      (m) =>
        m.dueDate &&
        !["تم الإنجاز", "مغلقة", "مؤرشف", "ملغي"].includes(m.status),
    )
    .map((m) => {
      const due = new Date(`${m.dueDate}T00:00:00`),
        days = Math.ceil((due.getTime() - today.getTime()) / 86400000);
      return { ...m, days };
    })
    .filter((m) => m.days <= alertDays)
    .map((m) => ({
      id: `due-${m.id}`,
      title:
        m.days < 0
          ? "مراسلة متجاوزة للمهلة"
          : m.days === 0
            ? "موعد المراسلة اليوم"
            : "اقتراب موعد الاستحقاق",
      details: `${m.number} — ${m.subject}`,
      time:
        m.days < 0
          ? `متأخرة ${Math.abs(m.days)} يوم`
          : m.days === 0
            ? "اليوم"
            : `متبقي ${m.days} أيام`,
      read: false,
      mailId: m.id,
      virtual: true,
    }));
  const visibleNotifications = [...deadlineAlerts, ...notifications];
  const unread = visibleNotifications.filter((n) => !n.read).length;
  const search = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) navigate(`/app/inbox?q=${encodeURIComponent(q)}`);
  };
  return (
    <div className="shell">
      <aside className={side ? "sidebar open" : "sidebar"}>
        <div className="brand">
          <div className="seal">م</div>
          <div>
            <strong>بلدية المغازي</strong>
            <small>نظام المراسلات والأرشيف الإلكتروني</small>
          </div>
          <button className="icon mobile" onClick={() => setSide(false)}>
            <X />
          </button>
        </div>
        <nav>
          {nav.map(([to, text, Icon]) => (
            <NavLink
              to={to}
              key={to}
              onClick={() => setSide(false)}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <Icon />
              <span>{text}</span>
              {to === "/app/inbox" && unread > 0 && <b>{unread}</b>}
            </NavLink>
          ))}
        </nav>
        <div className="side-foot">
          <Users /> <span>متصل بالنظام الرئيسي</span>
        </div>
      </aside>
      <main>
        <header className="top">
          <div className="top-title">
            <button className="icon" onClick={() => setSide(!side)}>
              <Menu />
            </button>
            <div>
              <strong>
                {nav.find(([p]) => loc.pathname.startsWith(p))?.[1] ||
                  "نظام المراسلات"}
              </strong>
              <small>نظام بلدية المغازي المؤسسي</small>
            </div>
          </div>
          <form className="global-search" onSubmit={search}>
            <Search />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ابحث برقم الكتاب أو الموضوع أو الجهة..."
            />
          </form>
          <button className="icon notify" onClick={() => setNotes(!notes)}>
            <Bell />
            {unread > 0 && <b>{unread}</b>}
          </button>
          <ProfileMenu />
          {notes && (
            <div className="notification-pop">
              <h3>
                الإشعارات <span>{unread} جديد</span>
              </h3>
              {visibleNotifications.map((n) => (
                <button
                  key={n.id}
                  className={!n.read ? "unread" : ""}
                  onClick={() => {
                    if (!("virtual" in n))
                      useStore.getState().markNotification(n.id);
                    if (n.mailId) navigate(`/app/mail/${n.mailId}`);
                    setNotes(false);
                  }}
                >
                  <b>{n.title}</b>
                  <span>{n.details}</span>
                  <small>{n.time}</small>
                </button>
              ))}
            </div>
          )}
        </header>
        <div className="content">{children}</div>
      </main>
    </div>
  );
}
export function PageHead({
  title,
  subtitle,
  action,
  to = "/app/compose/app/outgoing",
  onAction,
}: {
  title: string;
  subtitle: string;
  action?: string;
  to?: string;
  onAction?: () => void;
}) {
  const n = useNavigate();
  return (
    <div className="page-head">
      <div>
        <small>نظام المراسلات / {title}</small>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {action && (
        <button className="primary" onClick={() => (onAction ? onAction() : n(to))}>
          <Plus /> {action}
        </button>
      )}
    </div>
  );
}
export const Status = ({ children }: { children: React.ReactNode }) => (
  <span className={`status s-${String(children).replaceAll(" ", "-")}`}>
    {children}
  </span>
);
export function deadlineState(date?: string, status?: string) {
  if (!date) return "none";
  if (["تم الإنجاز", "مؤرشف", "ملغي"].includes(status || "")) return "done";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(`${date}T00:00:00`);
  if (due.getTime() < today.getTime()) return "overdue";
  if (due.getTime() === today.getTime()) return "today";
  return "ontime";
}
export function Deadline({ date, status }: { date?: string; status?: string }) {
  const state = deadlineState(date, status);
  if (state === "none") return <span className="deadline none">دون موعد</span>;
  const label =
    state === "overdue"
      ? "متأخرة"
      : state === "today"
        ? "موعدها اليوم"
        : state === "done"
          ? "مغلقة ضمن السجل"
          : "ضمن الموعد";
  return (
    <span className={`deadline ${state}`}>
      <Clock3 />
      {label}
      {date && ` · ${date}`}
    </span>
  );
}
export function Empty({ text = "لا توجد نتائج مطابقة" }: { text?: string }) {
  return (
    <div className="empty">
      <Archive />
      <h3>{text}</h3>
      <p>جرّب تعديل خيارات البحث أو إضافة مراسلة جديدة.</p>
    </div>
  );
}
export function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [onClose]);
  return (
    <div className="modal-bg" onMouseDown={onClose}>
      <section className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <header>
          <h2>{title}</h2>
          <button className="icon" onClick={onClose}>
            <X />
          </button>
        </header>
        <div className="modal-content">{children}</div>
      </section>
    </div>
  );
}
export const Field = ({
  label,
  children,
  wide = false,
}: {
  label: string;
  children: React.ReactNode;
  wide?: boolean;
}) => (
  <label className={wide ? "field wide" : "field"}>
    <span>{label}</span>
    {children}
  </label>
);
export const Back = () => {
  const n = useNavigate();
  return (
    <button className="text-btn" onClick={() => n(-1)}>
      <ChevronLeft /> رجوع
    </button>
  );
};
