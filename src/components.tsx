import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Archive,
  AlertTriangle,
  ArrowLeftRight,
  BarChart3,
  Bell,
  BookUser,
  Building2,
  ChevronDown,
  ChevronLeft,
  CheckCheck,
  Clock3,
  FileInput,
  FileOutput,
  FolderArchive,
  Home,
  Inbox,
  LockKeyhole,
  LogOut,
  Megaphone,
  Menu,
  MessageSquareText,
  PenLine,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  UserCheck,
  RefreshCw,
  UserRound,
  Users,
  History,
  X,
} from "lucide-react";
import { useStore } from "./store";
import { canAccessPath } from "./access";
import { mailStatusTone, normalizeMailStatus } from "./mailStatuses";
export const nav = [
  ["/app/dashboard", "لوحة التحكم", Home],
  ["/app/correspondence", "كل المراسلات", FolderArchive],
  ["/app/incoming", "البريد الوارد", FileInput],
  ["/app/outgoing", "البريد الصادر", FileOutput],
  ["/app/internal", "المراسلات الداخلية", MessageSquareText],
  ["/app/compose/outgoing", "إنشاء مراسلة", PenLine],
  ["/app/templates", "قوالب المراسلات", FileOutput],
  ["/app/circulars", "التعاميم", Megaphone],
  ["/app/inbox", "صندوق الوارد الخاص بي", Inbox],
  ["/app/approvals", "الاعتمادات", ShieldCheck],
  ["/app/followup", "الإحالات والمتابعة", ArrowLeftRight],
  ["/app/calendar", "أجندة المراسلات", Clock3],
  ["/app/search", "الاستعلام المتقدم", Search],
  ["/app/delegations", "التفويض والإنابة", UserCheck],
  ["/app/directory", "دليل الجهات والتوزيع", BookUser],
  ["/app/archive", "الأرشيف الإلكتروني", FolderArchive],
  ["/app/cases", "ملفات الموضوع", Archive],
  ["/app/reports", "التقارير", BarChart3],
  ["/app/departments", "الهيكل التنظيمي", Building2],
  ["/app/users", "المستخدمون والصلاحيات", Users],
  ["/app/workflows", "مسارات الاعتماد والتوجيه", ArrowLeftRight],
  ["/app/activity", "سجل العمليات", History],
  ["/app/security", "سياسات السرية", LockKeyhole],
  ["/app/settings", "إعدادات المراسلات", Settings],
] as const;
const navSections = [
  ["الرئيسية", ["/app/dashboard"]],
  ["المراسلات", ["/app/correspondence", "/app/incoming", "/app/outgoing", "/app/internal", "/app/compose/outgoing", "/app/templates", "/app/circulars"]],
  ["مساحة العمل", ["/app/inbox", "/app/approvals", "/app/followup", "/app/calendar", "/app/search", "/app/delegations"]],
  ["الأرشيف والأدوات", ["/app/archive", "/app/cases", "/app/directory"]],
  ["إدارة النظام", ["/app/reports", "/app/departments", "/app/users", "/app/workflows", "/app/activity", "/app/security", "/app/settings"]],
] as const;
function ProfileMenu() {
  const [open, setOpen] = useState(false),
    [avatar, setAvatar] = useState(
      () => localStorage.getItem("municipality-profile-avatar") || "",
    );
  const user = useStore((s) => s.user),
    setUser = useStore((s) => s.setUser),
    navigate = useNavigate();
  const chooseAccount = (kind: "registry" | "employee") => {
    setUser(kind === "registry"
      ? { name: "موظف الديوان", role: "مأمور المراسلات", department: "الديوان" }
      : { name: "سارة خالد", role: "موظف", department: "الدائرة المالية" });
    setOpen(false);
    navigate("/app/dashboard");
  };
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
          <div className="account-menu-label">حسابات العرض</div>
          <button className={user.role !== "موظف" ? "current-account" : ""} onClick={() => chooseAccount("registry")}>
            <UserCheck /> موظف الديوان <small>كامل الصلاحيات التشغيلية</small>
          </button>
          <button className={user.role === "موظف" ? "current-account" : ""} onClick={() => chooseAccount("employee")}>
            <RefreshCw /> سارة خالد <small>حساب موظف عادي</small>
          </button>
          <button onClick={()=>setOpen(false)}>
            <LogOut /> إغلاق القائمة
          </button>
        </div>
      )}
    </div>
  );
}
export function Layout({ children }: { children: React.ReactNode }) {
  const [side, setSide] = useState(false),
    [collapsed, setCollapsed] = useState(()=>localStorage.getItem("municipality-sidebar-collapsed")==="true"),
    [openSections,setOpenSections]=useState<Record<string,boolean>>(()=>({"الرئيسية":true,"المراسلات":true,"مساحة العمل":true,"الأرشيف والأدوات":true,"إدارة النظام":false})),
    [notes, setNotes] = useState(false),
    [notificationFilter, setNotificationFilter] = useState<"all"|"urgent"|"unread">("all"),
    [dismissedDue, setDismissedDue] = useState<string[]>(() => JSON.parse(localStorage.getItem("municipality-dismissed-deadlines") || "[]")),
    [searchOpen, setSearchOpen] = useState(false),
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
  const visibleDeadlineAlerts = deadlineAlerts.filter((n) => !dismissedDue.includes(n.id));
  const visibleNotifications = [...visibleDeadlineAlerts, ...notifications];
  const unread = visibleNotifications.filter((n) => !n.read).length;
  const isUrgentNotification = (n: (typeof visibleNotifications)[number]) => n.title.includes("متجاوزة") || n.title.includes("اليوم") || n.title.includes("عاجل") || n.details.includes("متأخرة");
  const filteredNotifications = visibleNotifications.filter((n) => notificationFilter === "all" || (notificationFilter === "urgent" && isUrgentNotification(n)) || (notificationFilter === "unread" && !n.read));
  const notificationGroups=([['اليوم',filteredNotifications.filter(n=>n.time!=='أمس'&&!n.time.includes('يومين')&&!n.time.includes('أسبوع'))],['أمس',filteredNotifications.filter(n=>n.time==='أمس')],['أقدم',filteredNotifications.filter(n=>n.time!=='أمس'&&(n.time.includes('يومين')||n.time.includes('أسبوع')))]] as const).filter(([,items])=>items.length);
  const markAllNotifications = () => {
    notifications.filter((n) => !n.read).forEach((n) => useStore.getState().markNotification(n.id));
    const ids = deadlineAlerts.map((n) => n.id);
    setDismissedDue(ids);
    localStorage.setItem("municipality-dismissed-deadlines", JSON.stringify(ids));
  };
  const search = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) navigate(`/app/inbox?q=${encodeURIComponent(q)}`);
  };
  const accessibleMail = user.role === "موظف"
    ? mail.filter((m) => m.employee === user.name || m.department === user.department || m.copies?.includes(user.name) || m.copies?.includes(user.department))
    : mail;
  const quickResults = q.trim().length < 2 ? [] : accessibleMail.filter((m) =>
    [m.number, m.subject, m.from, m.to, m.department, m.employee, m.keywords || ""].some((value) => value?.toLowerCase().includes(q.trim().toLowerCase())),
  ).slice(0, 6);
  return (
    <div className={`shell ${collapsed ? "sidebar-collapsed" : ""}`}>
      <aside className={`${side ? "sidebar open" : "sidebar"} ${collapsed ? "collapsed" : ""}`}>
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
        <nav aria-label="القائمة الرئيسية">
          {navSections.map(([section,paths])=>{
            const items=nav.filter(([to])=>paths.includes(to as never)&&canAccessPath(user,to));
            const active=items.some(([to])=>loc.pathname.startsWith(to));
            const opened=openSections[section]||active;
            return items.length?<section className={`nav-section ${opened?'open':''}`} key={section}><button className="nav-section-toggle" aria-expanded={opened} onClick={()=>setOpenSections(current=>({...current,[section]:!opened}))}><span>{section}</span><ChevronDown/></button><div className="nav-section-items">{items.map(([to,text,Icon])=><NavLink title={collapsed?text:undefined} to={to} key={to} onClick={()=>setSide(false)} className={({isActive})=>isActive?"active":""}><Icon/><span>{text}</span>{to==="/app/inbox"&&unread>0&&<b>{unread}</b>}</NavLink>)}</div></section>:null;
          })}
        </nav>
        <div className="side-foot">
          <button className="sidebar-collapse" title={collapsed?"توسيع القائمة":"طي القائمة"} onClick={()=>{const next=!collapsed;setCollapsed(next);localStorage.setItem("municipality-sidebar-collapsed",String(next))}}><ChevronLeft/></button>
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
          <form className="global-search" onSubmit={search} onFocus={() => setSearchOpen(true)} onBlur={() => setTimeout(() => setSearchOpen(false), 160)}>
            <Search />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ابحث برقم الكتاب أو الموضوع أو الجهة..."
            />
            {searchOpen && q.trim().length >= 2 && <div className="quick-search-results">
              <div className="quick-search-head"><b>نتائج سريعة</b><span>{quickResults.length} نتائج</span></div>
              {quickResults.map((m) => <button type="button" key={m.id} onClick={() => { navigate(`/app/mail/${m.id}`); setQ(""); setSearchOpen(false); }}><i>{m.type === "incoming" ? "و" : m.type === "outgoing" ? "ص" : "د"}</i><div><b>{m.subject}</b><span>{m.number} · {m.type === "outgoing" ? m.to : m.from}</span></div><small>{m.status}</small></button>)}
              {!quickResults.length && <div className="quick-search-empty"><Search/><b>لا توجد نتائج مطابقة</b><span>جرّبي رقم الكتاب أو اسم الجهة.</span></div>}
              <button type="submit" className="quick-search-all">فتح نتائج البحث الكاملة</button>
            </div>}
          </form>
          <button className="icon notify" onClick={() => setNotes(!notes)}>
            <Bell />
            {unread > 0 && <b>{unread}</b>}
          </button>
          <ProfileMenu />
          {notes && (
            <div className="notification-pop">
              <div className="notification-head"><div><h3>مركز الإشعارات</h3><span>{unread} غير مقروء</span></div><button onClick={markAllNotifications} disabled={!unread}><CheckCheck/> تعليم الكل كمقروء</button></div>
              <div className="notification-summary"><span className="urgent"><AlertTriangle/>{visibleNotifications.filter(isUrgentNotification).length} عاجلة</span><span><Clock3/>{visibleDeadlineAlerts.length} مرتبطة بموعد</span></div>
              <div className="notification-filters">{([['all','الكل'],['urgent','العاجلة'],['unread','غير المقروء']] as const).map(([value,title])=><button className={notificationFilter===value?'active':''} onClick={()=>setNotificationFilter(value)} key={value}>{title}</button>)}</div>
              <div className="notification-list">
              {notificationGroups.map(([group,items])=><section className="notification-day-group" key={group}><h4>{group}<span>{items.length}</span></h4>{items.map((n) => (
                <button
                  key={n.id}
                  className={`${!n.read ? "unread " : ""}${isUrgentNotification(n) ? "urgent" : "normal"}`}
                  onClick={() => {
                    if ("virtual" in n) {
                      const next=[...new Set([...dismissedDue,n.id])];
                      setDismissedDue(next);
                      localStorage.setItem("municipality-dismissed-deadlines",JSON.stringify(next));
                    } else
                      useStore.getState().markNotification(n.id);
                    if (n.mailId) navigate(`/app/mail/${n.mailId}`);
                    setNotes(false);
                  }}
                >
                  <i>{isUrgentNotification(n)?<AlertTriangle/>:<Bell/>}</i><div><b>{n.title}</b><span>{n.details}</span><small>{n.time}</small></div>
                </button>
              ))}</section>)}
              {!filteredNotifications.length&&<div className="notification-empty"><CheckCheck/><b>لا توجد إشعارات ضمن هذا التصنيف</b><span>أنت على اطلاع بكل المستجدات.</span></div>}
              </div>
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
  to = "/app/compose/outgoing",
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
export const normalizeStatus = normalizeMailStatus;
export const StatusBadge = ({ status }: { status: string }) => {
  const raw=status,value=normalizeMailStatus(raw),kind=mailStatusTone(value);
  const Icon=kind==="danger"?AlertTriangle:kind==="success"?CheckCheck:kind==="pending"?Clock3:RefreshCw;
  return <span className={`status status-${kind} s-${value.replaceAll(" ", "-")}`} title={raw!==value?`الحالة المسجلة: ${raw}`:value}><Icon aria-hidden="true"/><span>{value}</span></span>;
};
export const Status = ({ children }: { children: React.ReactNode }) => <StatusBadge status={String(children)} />;
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
