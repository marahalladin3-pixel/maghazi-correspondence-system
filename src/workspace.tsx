import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  Eye,
  FileInput,
  Mail,
  Plus,
  Send,
  Star,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Deadline, deadlineState, Empty, PageHead, Status } from "./components";
import { label, useStore } from "./store";
import { isFinalMailStatus, MAIL_STATUSES, normalizeMailStatus } from "./mailStatuses";

export function ProfessionalDashboard() {
  const allMail = useStore((s) => s.mail),
    audit = useStore((s) => s.audit),
    user = useStore((s) => s.user),
    navigate = useNavigate();
  const mail = useMemo(()=>user.role==='موظف'?allMail.filter(m=>m.employee===user.name||m.department===user.department||m.copies?.includes(user.name)||m.copies?.includes(user.department)):allMail,[allMail,user]);
  const incomingToday = mail.filter(
    (m) =>
      m.type === "incoming" && m.date === new Date().toISOString().slice(0, 10),
  ).length;
  const outgoingToday = mail.filter(
    (m) =>
      m.type === "outgoing" && m.date === new Date().toISOString().slice(0, 10),
  ).length;
  const processing = mail.filter((m) => [MAIL_STATUSES.IN_PROGRESS, MAIL_STATUSES.REFERRED, MAIL_STATUSES.WAITING_REPLY].includes(normalizeMailStatus(m.status) as never)).length;
  const complete = mail.filter((m) => isFinalMailStatus(m.status)).length;
  const percentage = Math.round((complete / (mail.length || 1)) * 100);
  const priority = mail
    .filter(
      (m) =>
        m.priority !== "عادي" || [MAIL_STATUSES.OVERDUE, MAIL_STATUSES.WAITING_REPLY].includes(normalizeMailStatus(m.status) as never),
    )
    .slice(0, 6);
  const days = [
    "الأربعاء",
    "الخميس",
    "الجمعة",
    "السبت",
    "الأحد",
    "الاثنين",
    "الثلاثاء",
  ];
  const bars = days.map((day, i) => ({
    day,
    incoming: [1, 2, 1, 6, 2, 1, 1][i],
    outgoing: [1, 1, 1, 1, 1, 1, 0][i],
  }));
  const weeklyIncoming = bars.reduce((sum, day) => sum + day.incoming, 0);
  const weeklyOutgoing = bars.reduce((sum, day) => sum + day.outgoing, 0);
  const weeklyTotal = weeklyIncoming + weeklyOutgoing;
  const maxBar = Math.max(...bars.flatMap((day) => [day.incoming, day.outgoing]), 1);
  const chartPoint = (value: number, index: number) =>
    `${50 + index * 100},${178 - (value / maxBar) * 125}`;
  const incomingPoints = bars.map((day, index) => chartPoint(day.incoming, index)).join(" ");
  const outgoingPoints = bars.map((day, index) => chartPoint(day.outgoing, index)).join(" ");
  const incomingArea = `M ${incomingPoints.replaceAll(" ", " L ")} L 650,178 L 50,178 Z`;
  return (
    <>
      <div className="dashboard-breadcrumb">
        <span>نظام المراسلات والأرشيف الإلكتروني</span>
        <b>/</b>
        <strong>لوحة التحكم</strong>
      </div>
      <PageHead
        title="لوحة المتابعة التنفيذية"
        subtitle="مؤشرات مستخرجة مباشرة من سجلات الوارد والصادر والمراسلات الداخلية"
        action="تسجيل كتاب وارد"
        to="/app/compose/incoming"
      />
      <div className="dashboard-date">
        {new Intl.DateTimeFormat("ar-PS", {
          day: "numeric",
          month: "long",
          year: "numeric",
        }).format(new Date())}
      </div>
      <div className="stats executive-stats">
        {[
          ["الوارد اليوم", incomingToday, "من سجل الوارد", FileInput, "red"],
          ["الصادر اليوم", outgoingToday, "من سجل الصادر", Send, "gold"],
          [
            "قيد المعالجة",
            processing,
            `${mail.filter((m) => m.priority !== "عادي").length} ذات أولوية`,
            Clock3,
            "navy",
          ],
          [
            "نسبة الإنجاز",
            `${percentage}%`,
            `${complete} مراسلة مكتملة`,
            CheckCircle2,
            "green",
          ],
        ].map(([title, value, sub, Icon, color]) => (
          <button
            className={`stat executive ${color}`}
            key={String(title)}
            onClick={() =>
              navigate(
                title === "الوارد اليوم"
                  ? "/app/incoming"
                  : title === "الصادر اليوم"
                    ? "/app/outgoing"
                    : "/app/inbox",
              )
            }
          >
            <span>
              <small>{String(title)}</small>
              <b>{String(value)}</b>
              <em>{String(sub)}</em>
            </span>
            <i>
              {(() => {
                const I = Icon as typeof FileInput;
                return <I />;
              })()}
            </i>
          </button>
        ))}
      </div>
      <div className="dashboard-main-grid">
        <section className="panel movement-card">
          <div className="panel-head">
            <div>
              <small>آخر سبعة أيام</small>
              <h2>حركة المراسلات</h2>
            </div>
            <div className="chart-legend">
              <span className="incoming-dot">وارد</span>
              <span className="outgoing-dot">صادر</span>
            </div>
          </div>
          <div className="movement-summary">
            <div><span>إجمالي الحركة</span><b>{weeklyTotal}</b><small>مراسلة خلال الأسبوع</small></div>
            <div className="incoming"><span>الوارد</span><b>{weeklyIncoming}</b><small>{Math.round((weeklyIncoming/weeklyTotal)*100)}% من الحركة</small></div>
            <div className="outgoing"><span>الصادر</span><b>{weeklyOutgoing}</b><small>{Math.round((weeklyOutgoing/weeklyTotal)*100)}% من الحركة</small></div>
          </div>
          <div className="movement-chart">
            <svg viewBox="0 0 700 220" role="img" aria-label="حركة الوارد والصادر خلال سبعة أيام">
              <defs><linearGradient id="incoming-area" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#a8141b" stopOpacity=".22"/><stop offset="100%" stopColor="#a8141b" stopOpacity="0"/></linearGradient></defs>
              {[53,95,137,178].map(y=><line key={y} x1="40" y1={y} x2="660" y2={y} className="chart-grid-line"/>)}
              <path d={incomingArea} fill="url(#incoming-area)" />
              <polyline points={incomingPoints} className="chart-line incoming-line" />
              <polyline points={outgoingPoints} className="chart-line outgoing-line" />
              {bars.map((day,index)=>{const [ix,iy]=chartPoint(day.incoming,index).split(',');const [,oy]=chartPoint(day.outgoing,index).split(',');return <g key={day.day}><circle cx={ix} cy={iy} r="5" className="chart-point incoming-point"/><circle cx={ix} cy={oy} r="5" className="chart-point outgoing-point"/><text x={ix} y="208" textAnchor="middle">{day.day}</text></g>})}
            </svg>
          </div>
        </section>
        <section className="panel priority-card">
          <div className="panel-head">
            <div>
              <small>تحتاج تدخلك</small>
              <h2>أولوية المتابعة</h2>
            </div>
            <b className="count-pill">{priority.length}</b>
          </div>
          <div className="priority-grid">
            {priority.map((m) => (
              <button
                className={`priority-row ${deadlineState(m.dueDate,m.status)}`}
                key={m.id}
                onClick={() => navigate(`/app/mail/${m.id}`)}
              >
                <i><Mail /></i>
                <div>
                  <b>{m.subject}</b>
                  <small>{m.number} · {m.department}</small>
                  <em>{m.dueDate ? `الموعد: ${m.dueDate}` : "دون موعد محدد"}</em>
                </div>
                <span className="priority-state"><Status>{m.status}</Status><strong>{m.priority}</strong></span>
              </button>
            ))}
          </div>
          <button className="priority-more" onClick={()=>navigate('/app/followup')}>عرض جميع المتابعات</button>
        </section>
      </div>
      <div className="dashboard-secondary-grid">
        <section className="panel recent-mail-card">
          <div className="panel-head"><div><small>آخر ما سُجل</small><h2>آخر المراسلات</h2></div><button className="text-btn" onClick={()=>navigate('/app/inbox')}>عرض الكل</button></div>
          <div className="dashboard-mail-list">{mail.slice(0,5).map(m=><button key={m.id} onClick={()=>navigate(`/app/mail/${m.id}`)}><div><b>{m.subject}</b><small>{m.number} · {m.type==='incoming'?'وارد':m.type==='outgoing'?'صادر':'داخلي'} · {m.from||m.to}</small></div><span><Status>{m.status}</Status><time>{m.date}</time></span><Eye/></button>)}</div>
        </section>
        <section className="panel recent-activity-card">
          <div className="panel-head"><div><small>سجل رقابي</small><h2>النشاط الأخير</h2></div></div>
          <div className="dashboard-activity-list">{audit.slice(0,5).map(item=><article key={item.id}><i/><div><b>{item.action}</b><p>{item.details}</p><small>{item.user} · {new Date(item.time).toLocaleString('ar-PS')}</small></div></article>)}</div>
        </section>
      </div>
    </>
  );
}

type InboxTab =
  | "all"
  | "unread"
  | "action"
  | "waiting"
  | "late"
  | "today"
  | "closure"
  | "extension"
  | "urgent"
  | "brief"
  | "assigned"
  | "favorite"
  | "drafts"
  | "returned"
  | "completed";
export function ProfessionalInbox() {
  const mail = useStore((s) => s.mail),
    user = useStore((s) => s.user),
    toggle = useStore((s) => s.toggleFavorite),
    mark = useStore((s) => s.markRead),
    navigate = useNavigate(),
    [params] = useSearchParams();
  const requestedView=params.get("view") as InboxTab|null;
  const [tab, setTab] = useState<InboxTab>(requestedView||"all"),
    [priority, setPriority] = useState("all"),
    [query, setQuery] = useState(params.get("q") || ""),
    [showMoreTabs, setShowMoreTabs] = useState(false);
  const assigned = mail.filter((m) => !m.archived && (user.role !== 'موظف' || m.employee === user.name || m.department === user.department || m.copies?.some((x) => x === user.name || x === user.department)));
  const match = (m: (typeof mail)[number], t: InboxTab) =>
    t === "all" ||
    (t === "unread" && !m.read) ||
    (t === "action" && [MAIL_STATUSES.RECEIVED, MAIL_STATUSES.IN_PROGRESS, MAIL_STATUSES.REFERRED].includes(normalizeMailStatus(m.status) as never)) ||
    (t === "waiting" && normalizeMailStatus(m.status) === MAIL_STATUSES.WAITING_REPLY) ||
    (t === "late" && deadlineState(m.dueDate, m.status) === "overdue") ||
    (t === "today" && deadlineState(m.dueDate, m.status) === "today") ||
    (t === "closure" &&
      Boolean(m.requiresClosure) &&
      !isFinalMailStatus(m.status)) ||
    (t === "extension" && Boolean(m.extensionRequested)) ||
    (t === "urgent" && Boolean(m.urgentReply || m.priority === "عاجل جداً")) ||
    (t === "brief" && Boolean(m.requiresBrief)) ||
    (t === "assigned" &&
      Boolean(
        m.copies?.some((x) => x === user.name || x === user.department),
      )) ||
    (t === "favorite" && Boolean(m.favorite)) ||
    (t === "drafts" && normalizeMailStatus(m.status) === MAIL_STATUSES.DRAFT) ||
    (t === "returned" && normalizeMailStatus(m.status) === MAIL_STATUSES.RETURNED) ||
    (t === "completed" && isFinalMailStatus(m.status));
  const tabs: [InboxTab, string][] = [
    ["all", "الكل"],
    ["unread", "غير مقروء"],
    ["action", "يتطلب إجراء"],
    ["waiting", "بانتظار الرد"],
    ["late", "انتهى موعد الرد"],
    ["today", "مستحق اليوم"],
    ["closure", "طلبات بحاجة إلى إغلاق"],
    ["extension", "طلبات تمديد"],
    ["urgent", "يتطلب رد عاجل"],
    ["brief", "يتطلب تقديم إفادة"],
    ["assigned", "نسخة إليّ"],
    ["favorite", "المفضلة"],
    ["drafts", "المسودات"],
    ["returned", "معادة للتعديل"],
    ["completed", "منجز"],
  ];
  const mainTabs = tabs.slice(0, 5),
    moreTabs = tabs.slice(5);
  const rows = useMemo(
    () =>
      assigned
        .filter((m) => match(m, tab))
        .filter((m) => priority === "all" || m.priority === priority)
        .filter(
          (m) =>
            !query ||
            [m.number, m.subject, m.from, m.to, m.department].some((v) =>
              v.includes(query),
            ),
        ),
    [assigned, tab, priority, query],
  );
  return (
    <>
      <PageHead
        title="صندوق الوارد الخاص بي"
        subtitle="جميع المراسلات والمهام المحولة إليك مع المتابعة حسب الأولوية والحالة"
      />
      <div className="inbox-kpis">
        <button onClick={()=>setTab("unread")}><Mail/><span><small>جديد وغير مقروء</small><b>{assigned.filter(m=>!m.read).length}</b></span></button>
        <button onClick={()=>setTab("action")}><Clock3/><span><small>مطلوب مني إجراء</small><b>{assigned.filter(m=>match(m,"action")).length}</b></span></button>
        <button onClick={()=>setTab("late")}><Clock3/><span><small>متجاوزة للموعد</small><b>{assigned.filter(m=>match(m,"late")).length}</b></span></button>
        <button onClick={()=>setTab("completed")}><CheckCircle2/><span><small>مكتملة ومؤرشفة</small><b>{assigned.filter(m=>match(m,"completed")).length}</b></span></button>
      </div>
      <section className="inbox-workspace">
        <div className="inbox-search">
          <div>
            <Mail />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث بالرقم أو الموضوع أو الجهة..."
            />
          </div>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="all">الأولوية أولاً</option>
            <option>عاجل جداً</option>
            <option>عاجل</option>
            <option>مهم</option>
            <option>عادي</option>
          </select>
        </div>
        <div className="inbox-tabs">
          <div className="inbox-tabs-main">
          {mainTabs.map(([value, title]) => (
            <button
              className={tab === value ? "active" : ""}
              key={value}
              onClick={() => setTab(value)}
            >
              {title}
              <b>{assigned.filter((m) => match(m, value)).length}</b>
            </button>
          ))}
          <button className={`more-tabs-button ${showMoreTabs?'open':''}`} onClick={()=>setShowMoreTabs(!showMoreTabs)}>
            {showMoreTabs ? "إخفاء التصنيفات" : "المزيد من التصنيفات"}
            <b>{moreTabs.reduce((sum,[value])=>sum+assigned.filter(m=>match(m,value)).length,0)}</b>
          </button>
          </div>
          {showMoreTabs&&<div className="inbox-tabs-more">
            {moreTabs.map(([value,title])=><button className={tab===value?'active':''} key={value} onClick={()=>setTab(value)}><span>{title}</span><b>{assigned.filter(m=>match(m,value)).length}</b></button>)}
          </div>}
        </div>
        <div className="inbox-heading">
          <b>جميع المراسلات</b>
          <span>{rows.length} مراسلة</span>
        </div>
        <div className="message-list">
          {rows.map((m) => (
            <article
              className={`${!m.read ? "unread " : ""}deadline-message ${deadlineState(m.dueDate, m.status)}`}
              key={m.id}
            >
              <i>
                <Mail />
              </i>
              <button
                className="message-main"
                onClick={() => {
                  mark(m.id);
                  navigate(`/app/mail/${m.id}`);
                }}
              >
                <b>
                  {m.subject}
                  {!m.read && <em>جديد</em>}
                </b>
                <small>
                  {m.number} · {m.type === "outgoing" ? m.to : m.from}
                </small>
                <span>المتابعة: {m.department}</span>
              </button>
              <div className="message-state">
                <span
                  className={`priority p-${m.priority.replaceAll(" ", "-")}`}
                >
                  {m.priority}
                </span>
                <Status>{m.status}</Status>
                <Deadline date={m.dueDate} status={m.status} />
              </div>
              <div className="message-actions">
                <button
                  title="إضافة إلى المفضلة"
                  className={m.favorite ? "star on" : "star"}
                  onClick={() => toggle(m.id)}
                >
                  <Star />
                </button>
                <button
                  title="عرض تفاصيل المراسلة"
                  onClick={() => {
                    mark(m.id);
                    navigate(`/app/mail/${m.id}`);
                  }}
                >
                  <Eye />
                </button>
              </div>
            </article>
          ))}
          {!rows.length&&<Empty text="لا توجد مراسلات مطابقة لهذا التصنيف"/>}
        </div>
      </section>
    </>
  );
}
