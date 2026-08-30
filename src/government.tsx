import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Archive,
  ArrowLeftRight,
  Ban,
  CalendarClock,
  Check,
  ChevronDown,
  Clock3,
  Copy,
  Download,
  Eye,
  FileClock,
  FileText,
  Link2,
  LockKeyhole,
  MessageSquarePlus,
  Paperclip,
  Plus,
  Printer,
  Redo2,
  Reply,
  RotateCcw,
  Save,
  Send,
  Shield,
  ShieldCheck,
  Trash2,
  Upload,
  UserPlus,
  Users,
  XCircle,
} from "lucide-react";
import { Back, Empty, Field, Modal, PageHead, Status } from "./components";
import { departmentNames } from "./data";
import { getDirectoryEntities, getDistributionGroups } from "./directory";
import { canViewMail } from "./security";
import { label, useStore } from "./store";
import type {
  Attachment,
  Confidentiality,
  CorrespondenceKind,
  MailType,
  Priority,
  RoutingRecipient,
} from "./types";

const actions = [
  "للعلم",
  "مع الموافقة",
  "مع الاعتذار",
  "للإفادة",
  "لعمل اللازم والإفادة",
  "للدراسة",
  "للمتابعة",
  "للاطلاع",
  "للتنفيذ",
  "للاطلاع والتوجيه بالخصوص",
  "إجراءاتكم بالخصوص",
  "للتذكير",
  "للتعميم",
  "للعمل اللازم حسب الأصول",
];
const accessLevels = ["متاح للاطلاع", "المستلم فقط", "القسم المستلم", "سري"];
const employees = [
  "م. أحمد محمد",
  "سارة خالد",
  "محمد أحمد",
  "وسام علي",
  "رامي عادل",
  "نور خليل",
  "محمود يوسف",
  "ليلى حسن",
];

export function GovernmentCompose() {
  const { type = "internal" } = useParams(),
    mailType = (
      ["incoming", "outgoing", "internal"].includes(type) ? type : "internal"
    ) as MailType;
  const selectedTemplate = useMemo<{
    subject?: string;
    body?: string;
    category?: string;
  } | null>(() => {
    try {
      const value = JSON.parse(
        sessionStorage.getItem("municipality-selected-template") || "null",
      ) as { subject?: string; body?: string; category?: string } | null;
      sessionStorage.removeItem("municipality-selected-template");
      return value;
    } catch {
      return null;
    }
  }, []);
  const all = useStore((s) => s.mail),
    add = useStore((s) => s.addMail),
    navigate = useNavigate();
  const directoryEntities = useMemo(
      () => getDirectoryEntities().filter((x) => x.active),
      [],
    ),
    distributionGroups = useMemo(
      () => getDistributionGroups().filter((x) => x.active),
      [],
    ),
    organizationEmployees = useMemo(() => {
      try {
        const saved = JSON.parse(
          localStorage.getItem("municipality-org-employees") || "[]",
        ) as { name: string; active: boolean }[];
        return [...new Set([...employees, ...saved.filter((x) => x.active).map((x) => x.name)])];
      } catch {
        return employees;
      }
    }, []);
  const [recipientMode, setRecipientMode] = useState<"employee" | "group">(
    "employee",
  );
  const [recipient, setRecipient] = useState(""),
    [recipientAction, setRecipientAction] = useState("للإفادة"),
    [recipientAccess, setRecipientAccess] = useState("متاح للاطلاع"),
    [recipientNote, setRecipientNote] = useState(""),
    [replyRequired, setReplyRequired] = useState(false),
    [recipientDue, setRecipientDue] = useState(""),
    [recipientFeedback, setRecipientFeedback] = useState<{
      kind: "error" | "success";
      text: string;
    } | null>(null);
  const [formFeedback, setFormFeedback] = useState<{ kind: "error" | "success"; text: string } | null>(null);
  const [recipients, setRecipients] = useState<RoutingRecipient[]>([]),
    [copies, setCopies] = useState<string[]>([]),
    [copy, setCopy] = useState(""),
    [linked, setLinked] = useState<string[]>([]),
    [linkNumber, setLinkNumber] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [form, setForm] = useState({
    subject: selectedTemplate?.subject || "",
    delegatedBy: "نفسه",
    jobTitle: "مأمور المراسلات",
    from: mailType === "incoming" ? "" : "بلدية المغازي",
    to: mailType === "incoming" ? "بلدية المغازي" : "",
    department: "",
    employee: "",
    priority: "عادي" as Priority,
    correspondenceKind: (selectedTemplate?.category === "تعاميم"
      ? "تعميم"
      : "مراسلة داخلية") as CorrespondenceKind,
    confidentiality: "داخلي" as Confidentiality,
    requiresReply: false,
    dueDate: "",
    reminderDate: "",
    body: selectedTemplate?.body || "",
    copyCategory: "حكومي",
    archiveCategory: "",
    keywords: "",
    addToCalendar: false,
    confidential: false,
  });
  const editorRef = useRef<HTMLTextAreaElement>(null),
    [bodyAlign, setBodyAlign] = useState<"right" | "center" | "left">("right");
  const editSelection = (
    before: string,
    after = before,
    linePrefix = false,
  ) => {
    const el = editorRef.current;
    if (!el) return;
    const start = el.selectionStart,
      end = el.selectionEnd,
      selected = form.body.slice(start, end);
    const replacement = linePrefix
      ? selected
          .split("\n")
          .map((line) => `${before}${line}`)
          .join("\n")
      : `${before}${selected}${after}`;
    setForm({
      ...form,
      body: form.body.slice(0, start) + replacement + form.body.slice(end),
    });
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(
        start + before.length,
        start + replacement.length - (linePrefix ? 0 : after.length),
      );
    });
  };
  const undoRedo = (command: "undo" | "redo") => {
    editorRef.current?.focus();
    document.execCommand(command);
  };
  const addLink = () => {
    const url = window.prompt("أدخلي رابط الموقع أو المستند");
    if (url) editSelection("[", `](${url})`);
  };
  const insertTemplate = () => {
    const template = `السادة/ ................................ المحترمين،\n\nتحية طيبة وبعد،\n\n${form.body}\n\nوتفضلوا بقبول فائق الاحترام.\nبلدية المغازي`;
    setForm({ ...form, body: template });
  };
  const addRecipient = () => {
    if (!recipient) {
      setRecipientFeedback({ kind: "error", text: "اختاري الموظف أو المجموعة أولًا" });
      return;
    }
    if (recipients.some((item) => item.name === recipient)) {
      setRecipientFeedback({ kind: "error", text: "هذا المستلم مضاف مسبقًا" });
      return;
    }
    setRecipients([
      ...recipients,
      {
        id: crypto.randomUUID(),
        name: recipient,
        kind: recipientMode === "employee" ? "employee" : "group",
        action: recipientAction,
        access: recipientAccess,
        dueDate: recipientDue,
        replyRequired,
        note: recipientNote,
      },
    ]);
    setRecipient("");
    setRecipientNote("");
    setRecipientFeedback({ kind: "success", text: `تمت إضافة ${recipient} إلى مسار المراسلة` });
  };
  const addLinked = () => {
    const found = all.find((m) => m.number === linkNumber.trim());
    if (!found) {
      setFormFeedback({ kind: "error", text: "رقم المراسلة المرتبطة غير موجود في النظام." });
      return;
    }
    if (!linked.includes(found.id)) setLinked([...linked, found.id]);
    setLinkNumber("");
    setFormFeedback({ kind: "success", text: `تم ربط المراسلة ${found.number} بنجاح.` });
  };
  const save = (status: string) => {
    if (!form.subject.trim()) {
      setFormFeedback({ kind: "error", text: "اكتب عنوان المراسلة قبل الحفظ أو الإرسال." });
      document.querySelector<HTMLInputElement>('input[placeholder="عنوان واضح ومختصر للمراسلة"]')?.focus();
      return;
    }
    if (status !== "مسودة" && mailType !== "incoming" && !recipients.length) {
      setFormFeedback({ kind: "error", text: "أضف مستلمًا واحدًا على الأقل إلى مسار المراسلة قبل الإرسال." });
      return;
    }
    const recipientDates = recipients
      .map((r) => r.dueDate)
      .filter(Boolean)
      .sort();
    const record = add({
      ...form,
      dueDate: form.dueDate || recipientDates[0] || "",
      type: mailType,
      status,
      recipients,
      copies,
      attachments,
      linkedMailIds: linked,
      requiresClosure: recipients.some((r) => r.replyRequired),
      requiresBrief: recipients.some((r) => r.action.includes("الإفادة")),
      urgentReply: form.priority === "عاجل جداً",
    });
    navigate(`/app/mail/${record.id}`);
  };
  return (
    <>
      <PageHead
        title={
          mailType === "internal"
            ? "إنشاء مراسلة داخلية"
            : mailType === "incoming"
              ? "تسجيل كتاب وارد"
              : "إنشاء كتاب صادر"
        }
        subtitle="إنشاء مراسلة مؤسسية مع التأشير والنسخ والربط والمتابعة"
      />
      <Back />
      {formFeedback && <div className={`compose-feedback ${formFeedback.kind}`} role="alert">{formFeedback.text}<button onClick={() => setFormFeedback(null)}>×</button></div>}
      <div className="gov-compose-grid">
        <main>
          <section className="panel gov-main-form">
            <h2>بيانات المراسلة</h2>
            <div className="form-grid">
              <Field label="بالتفويض عن">
                <select
                  value={form.delegatedBy}
                  onChange={(e) =>
                    setForm({ ...form, delegatedBy: e.target.value })
                  }
                >
                  <option>نفسه</option>
                  <option>رئيس البلدية</option>
                  <option>المدير العام</option>
                </select>
              </Field>
              <Field label="المسمى الوظيفي">
                <input
                  value={form.jobTitle}
                  onChange={(e) =>
                    setForm({ ...form, jobTitle: e.target.value })
                  }
                />
              </Field>
              <Field label="عنوان الرسالة" wide>
                <input
                  value={form.subject}
                  onChange={(e) =>
                    setForm({ ...form, subject: e.target.value })
                  }
                  placeholder="عنوان واضح ومختصر للمراسلة"
                />
              </Field>
              <Field label="الجهة">
                <input
                  list="official-entities"
                  value={mailType === "incoming" ? form.from : form.to}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      [mailType === "incoming" ? "from" : "to"]: e.target.value,
                    })
                  }
                />
                <datalist id="official-entities">
                  {directoryEntities.map((x) => (
                    <option key={x.id} value={x.name} />
                  ))}
                </datalist>
              </Field>
              <Field label="الأولوية">
                <select
                  value={form.priority}
                  onChange={(e) =>
                    setForm({ ...form, priority: e.target.value as Priority })
                  }
                >
                  <option>عادي</option>
                  <option>عاجل</option>
                  <option>عاجل جداً</option>
                </select>
              </Field>
            </div>
          </section>
          <section className="panel correspondence-controls">
            <div className="panel-head">
              <div>
                <h2>التصنيف والتحكم</h2>
                <p>نوع المراسلة والسرية والرد والأرشفة</p>
              </div>
              <Shield />
            </div>
            <div className="form-grid">
              <Field label="نوع المراسلة">
                <select
                  value={form.correspondenceKind}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      correspondenceKind: e.target.value as CorrespondenceKind,
                    })
                  }
                >
                  {[
                    "مراسلة داخلية",
                    "مذكرة داخلية",
                    "إحالة",
                    "تعميم",
                    "نسخة للعلم",
                    "طلب إجراء",
                  ].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </Field>
              <Field label="مستوى السرية">
                <select
                  value={form.confidentiality}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      confidentiality: e.target.value as Confidentiality,
                    })
                  }
                >
                  {["داخلي", "مقيد", "سري", "سري جداً"].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </Field>
              <Field label="تاريخ الاستحقاق">
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) =>
                    setForm({ ...form, dueDate: e.target.value })
                  }
                />
              </Field>
              <Field label="التصنيف الأرشيفي">
                <select
                  value={form.archiveCategory}
                  onChange={(e) =>
                    setForm({ ...form, archiveCategory: e.target.value })
                  }
                >
                  <option value="">يحدد عند الإغلاق</option>
                  {[
                    "عقود",
                    "مشاريع",
                    "موارد بشرية",
                    "مياه وصرف صحي",
                    "شكاوى",
                    "قرارات وتعاميم",
                  ].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </Field>
              <Field label="الكلمات المفتاحية" wide>
                <input
                  value={form.keywords}
                  onChange={(e) =>
                    setForm({ ...form, keywords: e.target.value })
                  }
                  placeholder="افصلي الكلمات بفاصلة، مثال: مشروع، طرق، اعتماد"
                />
              </Field>
            </div>
            <label className="check-line reply-required">
              <input
                type="checkbox"
                checked={form.requiresReply}
                onChange={(e) =>
                  setForm({ ...form, requiresReply: e.target.checked })
                }
              />{" "}
              تتطلب هذه المراسلة رداً رسمياً
            </label>
          </section>
          <section className="panel">
            <div className="panel-head">
              <div>
                <h2>رسائل مرتبطة</h2>
                <p>إرفاق مراسلات سابقة بالرقم لتكوين ملف موضوع متكامل</p>
              </div>
              <Link2 />
            </div>
            <div className="linked-add">
              <input
                value={linkNumber}
                onChange={(e) => setLinkNumber(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addLinked()}
                placeholder="اكتب رقم المراسلة ثم اضغط Enter"
              />
              <button className="secondary" onClick={addLinked}>
                <Plus /> إضافة
              </button>
            </div>
            {linked.length > 0 && (
              <div className="chips">
                {linked.map((id) => {
                  const m = all.find((x) => x.id === id);
                  return (
                    <span key={id}>
                      {m?.number} — {m?.subject}
                      <button
                        onClick={() =>
                          setLinked(linked.filter((x) => x !== id))
                        }
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
          </section>
          <section className="panel">
            <div className="reminder-line">
              <label>
                <input
                  type="checkbox"
                  checked={form.addToCalendar}
                  onChange={(e) =>
                    setForm({ ...form, addToCalendar: e.target.checked })
                  }
                />{" "}
                ذكّرني وإضافة إلى أجندة الأحداث
              </label>
              <input
                type="date"
                value={form.reminderDate}
                onChange={(e) =>
                  setForm({ ...form, reminderDate: e.target.value })
                }
              />
              <CalendarClock />
            </div>
          </section>
          <section className="panel editor-card">
            <div className="editor-title">
              <div>
                <h2>نص المراسلة</h2>
                <p>اكتبي النص وحددي جزءًا منه ثم اختاري أداة التنسيق</p>
              </div>
              <span>حفظ تلقائي داخل المسودة</span>
            </div>
            <div className="editor-toolbar">
              <button
                type="button"
                title="تراجع"
                onClick={() => undoRedo("undo")}
              >
                <RotateCcw />
              </button>
              <button
                type="button"
                title="إعادة"
                onClick={() => undoRedo("redo")}
              >
                <Redo2 />
              </button>
              <button
                type="button"
                title="خط عريض"
                onClick={() => editSelection("**")}
              >
                <b>B</b>
              </button>
              <button
                type="button"
                title="خط مائل"
                onClick={() => editSelection("_")}
              >
                <i>I</i>
              </button>
              <button
                type="button"
                title="اقتباس"
                onClick={() => editSelection("> ", "", true)}
              >
                اقتباس
              </button>
              <button
                type="button"
                title="قائمة نقطية"
                onClick={() => editSelection("• ", "", true)}
              >
                قائمة
              </button>
              <button
                type="button"
                title="تغيير المحاذاة"
                onClick={() =>
                  setBodyAlign(
                    bodyAlign === "right"
                      ? "center"
                      : bodyAlign === "center"
                        ? "left"
                        : "right",
                  )
                }
              >
                محاذاة:{" "}
                {bodyAlign === "right"
                  ? "يمين"
                  : bodyAlign === "center"
                    ? "وسط"
                    : "يسار"}
              </button>
              <button type="button" title="إضافة رابط" onClick={addLink}>
                <Link2 />
              </button>
              <button
                type="button"
                title="إدراج قالب كتاب رسمي"
                onClick={insertTemplate}
              >
                <FileText />
              </button>
            </div>
            <textarea
              ref={editorRef}
              style={{ textAlign: bodyAlign }}
              rows={13}
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              placeholder="اكتب نص المراسلة الرسمي هنا..."
            />
          </section>
          <section className="panel upload-card">
            <Upload />
            <div>
              <h3>تحميل المرفقات</h3>
              <p>PDF، Word أو صور — يمكن رفع عدة ملفات</p>
            </div>
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,image/*"
              onChange={(e) =>
                setAttachments(
                  Array.from(e.target.files || []).map((f) => ({
                    id: crypto.randomUUID(),
                    name: f.name,
                    size:
                      f.size > 1048576
                        ? `${(f.size / 1048576).toFixed(1)} MB`
                        : `${Math.ceil(f.size / 1024)} KB`,
                    url: URL.createObjectURL(f),
                  })),
                )
              }
            />
          </section>
          {attachments.length > 0 && (
            <section className="panel selected-attachments">
              <div className="panel-head">
                <div>
                  <h3>الملفات المختارة</h3>
                  <p>{attachments.length} مرفقات جاهزة للحفظ</p>
                </div>
                <button
                  className="secondary"
                  onClick={() => setAttachments([])}
                >
                  حذف الجميع
                </button>
              </div>
              {attachments.map((a) => (
                <article key={a.id}>
                  <FileText />
                  <div>
                    <b>{a.name}</b>
                    <small>{a.size}</small>
                  </div>
                  <button
                    onClick={() =>
                      setAttachments(attachments.filter((x) => x.id !== a.id))
                    }
                  >
                    <Trash2 /> إزالة
                  </button>
                </article>
              ))}
            </section>
          )}
        </main>
        <aside>
          <section className="panel routing-card">
            <h2>إعدادات التأشير</h2>
            <div className="mode-tabs">
              <button
                className={recipientMode === "employee" ? "active" : ""}
                onClick={() => setRecipientMode("employee")}
              >
                أفراد
              </button>
              <button
                className={recipientMode === "group" ? "active" : ""}
                onClick={() => setRecipientMode("group")}
              >
                مجموعات
              </button>
            </div>
            <Field
              label={
                recipientMode === "employee"
                  ? "الموظف المراد التحويل له"
                  : "المجموعة أو القسم"
              }
            >
              <select
                value={recipient}
                onChange={(e) => {
                  setRecipient(e.target.value);
                  setRecipientFeedback(null);
                }}
              >
                <option value="">اختر المستلم</option>
                {(recipientMode === "employee"
                  ? organizationEmployees
                  : [
                      ...departmentNames,
                      ...distributionGroups.map((x) => x.name),
                    ]
                ).map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </Field>
            <Field label="التأشير المطلوب">
              <select
                value={recipientAction}
                onChange={(e) => setRecipientAction(e.target.value)}
              >
                {actions.map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </Field>
            <Field label="صلاحية الاطلاع">
              <select
                value={recipientAccess}
                onChange={(e) => setRecipientAccess(e.target.value)}
              >
                {accessLevels.map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </Field>
            <Field label="آخر موعد للرد">
              <input
                type="date"
                value={recipientDue}
                onChange={(e) => setRecipientDue(e.target.value)}
              />
            </Field>
            <label className="check-line">
              <input
                type="checkbox"
                checked={replyRequired}
                onChange={(e) => setReplyRequired(e.target.checked)}
              />{" "}
              الرد مطلوب
            </label>
            <Field label="ملاحظة للمستلم">
              <textarea
                value={recipientNote}
                onChange={(e) => setRecipientNote(e.target.value)}
              />
            </Field>
            <button className="primary full" onClick={addRecipient}>
              <UserPlus /> إضافة المستلم
            </button>
            {recipientFeedback && (
              <div className={`recipient-feedback ${recipientFeedback.kind}`}>
                {recipientFeedback.kind === "success" ? <Check /> : <XCircle />}
                <span>{recipientFeedback.text}</span>
              </div>
            )}
            <div className="recipient-list">
              {recipients.map((r) => (
                <article key={r.id}>
                  <Users />
                  <div>
                    <b>{r.name}</b>
                    <small>
                      {r.action} · {r.access}
                    </small>
                  </div>
                  <button
                    onClick={() =>
                      setRecipients(recipients.filter((x) => x.id !== r.id))
                    }
                  >
                    <Trash2 />
                  </button>
                </article>
              ))}
            </div>
          </section>
          <section className="panel copy-card">
            <h2>إعدادات النسخ</h2>
            <Field label="تصنيف الجهة">
              <select
                value={form.copyCategory}
                onChange={(e) =>
                  setForm({ ...form, copyCategory: e.target.value })
                }
              >
                <option>حكومي</option>
                <option>بلديات</option>
                <option>مؤسسات أهلية</option>
                <option>داخلي</option>
              </select>
            </Field>
            <div className="copy-add">
              <select value={copy} onChange={(e) => setCopy(e.target.value)}>
                <option value="">اختر جهة أو قسمًا</option>
                {[
                  ...departmentNames,
                  ...directoryEntities.map((x) => x.name),
                ].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
              <button
                onClick={() => {
                  if (copy && !copies.includes(copy)) {
                    setCopies([...copies, copy]);
                    setCopy("");
                  }
                }}
              >
                <Plus />
              </button>
            </div>
            <div className="chips">
              {copies.map((x) => (
                <span key={x}>
                  {x}
                  <button
                    onClick={() => setCopies(copies.filter((c) => c !== x))}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <label className="check-line">
              <input
                type="checkbox"
                checked={form.confidential}
                onChange={(e) =>
                  setForm({ ...form, confidential: e.target.checked })
                }
              />{" "}
              مراسلة سرية
            </label>
          </section>
          <div className="sticky-actions">
            <button className="secondary" onClick={() => save("مسودة")}>
              <Save /> حفظ كمسودة
            </button>
            <button
              className="primary"
              onClick={() =>
                save(mailType === "incoming" ? "جديد" : "بانتظار التدقيق")
              }
            >
              <Send /> إرسال المراسلة
            </button>
          </div>
        </aside>
      </div>
    </>
  );
}

export function GovernmentDetails() {
  const { id = "" } = useParams(),
    all = useStore((s) => s.mail),
    audit = useStore((s) => s.audit),
    user = useStore((s) => s.user),
    m = all.find((x) => x.id === id),
    update = useStore((s) => s.updateMail),
    recordAudit = useStore((s) => s.recordAudit),
    transfer = useStore((s) => s.transfer),
    addNote = useStore((s) => s.addNote),
    closeMail = useStore((s) => s.closeMail),
    archive = useStore((s) => s.archive),
    navigate = useNavigate();
  const [selectedId, setSelectedId] = useState(id),
    [note, setNote] = useState(""),
    [target, setTarget] = useState(""),
    [action, setAction] = useState("للمتابعة"),
    [showTransfer, setShowTransfer] = useState(false),
    [showExtension, setShowExtension] = useState(false),
    [showCopy, setShowCopy] = useState(false),
    [showCorrection, setShowCorrection] = useState(false),
    [showReply, setShowReply] = useState(false),
    [showClose, setShowClose] = useState(false),
    [showArchiveForm, setShowArchiveForm] = useState(false),
    [copyTarget, setCopyTarget] = useState(""),
    [newDue, setNewDue] = useState(""),
    [replySubject, setReplySubject] = useState(""),
    [replyBody, setReplyBody] = useState(""),
    [replyAttachments, setReplyAttachments] = useState<Attachment[]>([]),
    [replyError, setReplyError] = useState(""),
    [closeReasonText, setCloseReasonText] = useState(""),
    [archiveCategory, setArchiveCategory] = useState("عام"),
    [archiveKeywords, setArchiveKeywords] = useState(""),
    [actionError, setActionError] = useState(""),
    [actionReason, setActionReason] = useState(""),
    [pendingAction, setPendingAction] = useState<null | { status: string; label: string; field: "rejectionReason" | "cancellationReason" | "reopenReason" }>(null),
    [correction, setCorrection] = useState({
      subject: "",
      body: "",
      reason: "",
    });
  const selected = all.find((x) => x.id === selectedId) || m;
  const related = useMemo(
    () => all.filter((x) => x.type === m?.type && !x.archived).slice(0, 8),
    [all, m?.type],
  );
  const threadEvents = useMemo(
    () =>
      selected
        ? [
            {
              id: `created-${selected.id}`,
              time: selected.sentAt || `${selected.date}T08:00:00`,
              kind: "إنشاء",
              title: "إنشاء وإرسال المراسلة",
              details: `${selected.from} ← ${selected.to}`,
            },
            ...selected.workflow.map((w) => ({
              id: `workflow-${w.id}`,
              time: w.time,
              kind: w.action === "نسخة للعلم" ? "نسخة" : "إحالة",
              title: w.action,
              details: `${w.from} ← ${w.to}${w.note ? ` · ${w.note}` : ""}`,
            })),
            ...(selected.replies || []).map((r) => ({
              id: `reply-${r.id}`,
              time: r.time,
              kind: "رد",
              title: "رد رسمي",
              details: `${r.author}: ${r.text}`,
            })),
            ...selected.notes.map((n) => ({
              id: `note-${n.id}`,
              time: n.time,
              kind: "ملاحظة",
              title: "ملاحظة إدارية",
              details: `${n.author}: ${n.text}`,
            })),
            ...audit
              .filter(
                (a) =>
                  a.number === selected.number &&
                  ![
                    "فتح مراسلة",
                    "معاينة مرفق",
                    "تنزيل مرفق",
                    "طباعة مراسلة",
                  ].includes(a.action),
              )
              .map((a) => ({
                id: `audit-${a.id}`,
                time: a.time,
                kind: "إجراء",
                title: a.action,
                details: a.details,
              })),
          ].sort(
            (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime(),
          )
        : [],
    [selected, audit],
  );
  const allowed = Boolean(selected && canViewMail(selected, user));
  useEffect(() => {
    if (selected && allowed)
      recordAudit(
        "فتح مراسلة",
        `فتح المراسلة ${selected.subject}`,
        selected.number,
      );
  }, [selected?.id, allowed]);
  if (!m || !selected) return <Empty text="المراسلة غير موجودة" />;
  if (!allowed)
    return (
      <section className="panel security-denied">
        <LockKeyhole />
        <h2>لا تملك صلاحية فتح هذه المراسلة</h2>
        <p>
          مستوى السرية: <b>{selected.confidentiality || "داخلي"}</b>. يتطلب فتح
          الوثيقة دوراً وظيفياً أو نطاقاً تنظيمياً مخولاً.
        </p>
        <button className="primary" onClick={() => navigate(-1)}>
          العودة
        </button>
      </section>
    );
  const doStatus = (status: string, actionName: string) =>
    update(selected.id, { status }, actionName);
  const replyDraftKey = `municipality-reply-draft-${selected.id}`;
  const openReply = () => {
    try {
      const draft = JSON.parse(localStorage.getItem(replyDraftKey) || "{}");
      setReplySubject(draft.subject || `رد: ${selected.subject}`);
      setReplyBody(draft.body || "");
    } catch {
      setReplySubject(`رد: ${selected.subject}`);
      setReplyBody("");
    }
    setReplyAttachments([]);
    setReplyError("");
    setShowReply(true);
  };
  const saveReplyDraft = () => {
    localStorage.setItem(replyDraftKey, JSON.stringify({ subject: replySubject, body: replyBody }));
    recordAudit("حفظ مسودة رد", `حفظ مسودة رد على ${selected.subject}`, selected.number);
    setShowReply(false);
  };
  const sendOfficialReply = () => {
    if (!replySubject.trim() || !replyBody.trim()) {
      setReplyError("عنوان الرد ونصه مطلوبان قبل الإرسال.");
      return;
    }
    update(selected.id, {
      replies: [...(selected.replies || []), {
        id: crypto.randomUUID(),
        text: `${replySubject.trim()}\n\n${replyBody.trim()}`,
        author: user.name,
        time: new Date().toISOString(),
        attachments: replyAttachments,
      }],
      status: "تم الرد",
    }, "إرسال رد رسمي");
    localStorage.removeItem(replyDraftKey);
    setShowReply(false);
    setReplyBody("");
    setReplyAttachments([]);
  };
  const reasonedStatus = (
    status: string,
    label: string,
    field: "rejectionReason" | "cancellationReason" | "reopenReason",
  ) => {
    setPendingAction({ status, label, field });
    setActionReason("");
    setActionError("");
  };
  const confirmReasonedStatus = () => {
    if (!pendingAction) return;
    if (!actionReason.trim()) return setActionError("اكتب سبب الإجراء قبل المتابعة.");
    const { status, label, field } = pendingAction;
    const dateField =
      field === "rejectionReason"
        ? "rejectedAt"
        : field === "cancellationReason"
          ? "cancelledAt"
          : "reopenedAt";
    update(
      selected.id,
      {
        status,
        [field]: actionReason.trim(),
        [dateField]: new Date().toISOString(),
        archived: field === "reopenReason" ? false : selected.archived,
      },
      `${label}: ${actionReason.trim()}`,
    );
    setPendingAction(null);
  };
  const openCorrection = () => {
    setCorrection({
      subject: selected.subject,
      body: selected.body || "",
      reason: "",
    });
    setShowCorrection(true);
  };
  const saveCorrection = () => {
    if (!correction.reason.trim()) return alert("سبب التصحيح إلزامي");
    if (!correction.subject.trim()) return alert("عنوان المراسلة مطلوب");
    const time = new Date().toISOString(),
      originalSnapshot = selected.originalSnapshot || {
        subject: selected.subject,
        body: selected.body || "",
        attachments: selected.attachments,
        sealedAt: selected.sentAt || `${selected.date}T08:00:00`,
      },
      versions = [
        ...(selected.versions || []),
        {
          id: crypto.randomUUID(),
          version: (selected.versions?.length || 0) + 2,
          subject: correction.subject.trim(),
          body: correction.body,
          reason: correction.reason.trim(),
          author: user.name,
          time,
        },
      ];
    update(
      selected.id,
      {
        subject: correction.subject.trim(),
        body: correction.body,
        originalSnapshot,
        versions,
      },
      `إصدار نسخة مصححة رقم ${versions.length + 1}: ${correction.reason.trim()}`,
    );
    setShowCorrection(false);
  };
  return (
    <>
      <PageHead
        title={`تفاصيل المراسلة ${selected.number}`}
        subtitle="عرض الكتاب وسجل التحويلات والإجراءات التشغيلية في مساحة واحدة"
      />
      <section className="panel lifecycle-strip">
        <div>
          <small>نوع المراسلة</small>
          <b>{selected.correspondenceKind || "مراسلة داخلية"}</b>
        </div>
        <div>
          <small>مستوى السرية</small>
          <b
            className={`security security-${selected.confidentiality || "داخلي"}`}
          >
            {selected.confidentiality || "داخلي"}
          </b>
        </div>
        <div>
          <small>الرد الرسمي</small>
          <b>
            {selected.requiresReply
              ? selected.replies?.length
                ? "تم الرد"
                : "مطلوب"
              : "غير مطلوب"}
          </b>
        </div>
        <div>
          <small>المسؤول الحالي</small>
          <b>{selected.employee || selected.department || "غير محدد"}</b>
        </div>
        <div className="lifecycle-actions">
          <button
            onClick={openReply}
          >
            <Reply /> رد رسمي
          </button>
          <button
            onClick={() => { setCloseReasonText(""); setActionError(""); setShowClose(true); }}
          >
            <Check /> إغلاق
          </button>
          <button
            onClick={() => { setArchiveCategory(selected.archiveCategory || "عام"); setArchiveKeywords(selected.keywords || ""); setCloseReasonText(""); setActionError(""); setShowArchiveForm(true); }}
          >
            <Archive /> إغلاق وأرشفة
          </button>
        </div>
      </section>
      <details className="panel correspondence-thread">
        <summary className="panel-head">
          <div>
            <h2>السلسلة الزمنية الكاملة</h2>
            <p>الأصل والإحالات والنسخ والردود والإجراءات ضمن سجل مترابط واحد</p>
          </div>
          <b>{threadEvents.length} أحداث</b>
        </summary>
        <div className="thread-flow">
          {threadEvents.map((e) => (
            <article key={e.id} className={`thread-${e.kind}`}>
              <i />
              <time>{new Date(e.time).toLocaleString("ar-PS")}</time>
              <div>
                <span>{e.kind}</span>
                <b>{e.title}</b>
                <p>{e.details}</p>
              </div>
            </article>
          ))}
        </div>
      </details>
      <div className="tri-workspace">
        <aside className="panel mail-rail">
          <div className="panel-head">
            <h2>سجل {label(m.type)}</h2>
            <b>{related.length}</b>
          </div>
          {related.map((x) => (
            <button
              className={x.id === selected.id ? "active" : ""}
              key={x.id}
              onClick={() => {
                setSelectedId(x.id);
                navigate(`/app/mail/${x.id}`);
              }}
            >
              <Paperclip />
              <div>
                <b>{x.subject}</b>
                <small>
                  {x.number} · {x.from}
                </small>
              </div>
              <Status>{x.status}</Status>
            </button>
          ))}
        </aside>
        <main className="panel mail-document">
          <div className="document-head">
            <div>
              <small>
                {selected.from} ← {selected.to}
              </small>
              <h2>{selected.subject}</h2>
              <p>
                رقم المراسلة: <b>{selected.number}</b>
              </p>
            </div>
            <div>
              <button
                className="icon"
                onClick={() => {
                  recordAudit(
                    "طباعة مراسلة",
                    `طباعة المراسلة ${selected.subject}`,
                    selected.number,
                  );
                  window.print();
                }}
              >
                <Printer />
              </button>
              <Status>{selected.status}</Status>
            </div>
          </div>
          <div className="original-seal">
            <ShieldCheck />
            <div>
              <b>الأصل الإلكتروني محفوظ وغير قابل للاستبدال</b>
              <small>
                الإصدار الحالي: {1 + (selected.versions?.length || 0)} · أي
                تصحيح يُحفظ كنسخة جديدة موثقة
              </small>
            </div>
            <button onClick={openCorrection}>
              <FileClock /> إصدار تصحيح
            </button>
          </div>
          <div className="document-meta">
            <span>
              تاريخ المراسلة <b>{selected.date}</b>
            </span>
            <span>
              القسم الحالي <b>{selected.department || "غير محدد"}</b>
            </span>
            <span>
              الموظف <b>{selected.employee || "غير محدد"}</b>
            </span>
            <span>
              آخر موعد <b>{selected.dueDate || "دون مهلة"}</b>
            </span>
          </div>
          <div className="official-body">
            {selected.body || "لا يوجد نص تفصيلي مسجل لهذه المراسلة."}
          </div>
          {(selected.originalSnapshot || Boolean(selected.versions?.length)) && (
            <details className="version-history">
              <summary>
                <FileClock /> سجل النسخ والتصحيحات (
                {1 + (selected.versions?.length || 0)})
              </summary>
              <article>
                <div>
                  <b>الإصدار 1 — الأصل المثبّت</b>
                  <span>
                    {new Date(
                      selected.originalSnapshot?.sealedAt ||
                        selected.sentAt ||
                        `${selected.date}T08:00:00`,
                    ).toLocaleString("ar-PS")}
                  </span>
                </div>
                <p>{selected.originalSnapshot?.subject || selected.subject}</p>
              </article>
              {selected.versions?.map((version) => (
                <article key={version.id}>
                  <div>
                    <b>الإصدار {version.version} — نسخة مصححة</b>
                    <span>
                      {version.author} · {new Date(version.time).toLocaleString("ar-PS")}
                    </span>
                  </div>
                  <p>سبب التصحيح: {version.reason}</p>
                </article>
              ))}
            </details>
          )}
          <div className="attachment-block">
            <h3>المرفقات</h3>
            {selected.attachments.length ? (
              selected.attachments.map((a) => (
                <article key={a.id}>
                  <FileText />
                  <div>
                    <b>{a.name}</b>
                    <small>{a.size}</small>
                  </div>
                  <button
                    className="icon"
                    title="معاينة المرفق"
                    disabled={!a.url}
                    onClick={() => {
                      if (a.url) {
                        recordAudit(
                          "معاينة مرفق",
                          `معاينة ${a.name}`,
                          selected.number,
                        );
                        window.open(a.url, "_blank", "noopener,noreferrer");
                      }
                    }}
                  >
                    <Eye />
                  </button>
                  {a.url ? (
                    <a
                      className="icon"
                      title="تنزيل المرفق"
                      href={a.url}
                      download={a.name}
                      onClick={() =>
                        recordAudit(
                          "تنزيل مرفق",
                          `تنزيل ${a.name}`,
                          selected.number,
                        )
                      }
                    >
                      <Download />
                    </a>
                  ) : (
                    <button
                      className="icon"
                      title="الملف غير متاح للتنزيل"
                      disabled
                    >
                      <Download />
                    </button>
                  )}
                </article>
              ))
            ) : (
              <p>لا توجد مرفقات.</p>
            )}
          </div>
          <div className="workflow-actions">
            <button className="danger" onClick={() => setShowTransfer(true)}>
              <ArrowLeftRight /> تحويل
            </button>
            <button onClick={() => setShowCopy(true)}>
              <Copy /> نسخة للعلم
            </button>
            <button
              className="success"
              onClick={() => doStatus("تم الإنجاز", "تنفيذ المراسلة")}
            >
              <Check /> تنفيذ
            </button>
            <button onClick={() => setShowExtension(true)}>
              <Clock3 /> تمديد
            </button>
            <button onClick={() => doStatus("معاد للتعديل", "إرجاع المراسلة")}>
              <Reply /> إرجاع
            </button>
            <button
              onClick={() =>
                reasonedStatus("مرفوضة", "رفض المراسلة", "rejectionReason")
              }
            >
              <XCircle /> رفض
            </button>
            <button
              onClick={() =>
                reasonedStatus("ملغاة", "إلغاء المراسلة", "cancellationReason")
              }
            >
              <Ban /> إلغاء
            </button>
            {["مغلقة", "مؤرشف"].includes(selected.status) ? (
              <button
                className="success"
                onClick={() =>
                  reasonedStatus(
                    "قيد الإجراء",
                    "إعادة فتح المراسلة",
                    "reopenReason",
                  )
                }
              >
                <RotateCcw /> إعادة فتح
              </button>
            ) : (
              <button onClick={() => archive(selected.id)}>
                <Archive /> أرشفة
              </button>
            )}
            <button
              onClick={() => document.getElementById("note-box")?.focus()}
            >
              <MessageSquarePlus /> ملاحظة
            </button>
          </div>
          <label className="calendar-check">
            <input type="checkbox" defaultChecked={selected.addToCalendar} />{" "}
            ذكّرني وإضافة إلى أجندة الأحداث
          </label>
        </main>
        <aside className="panel movement-log">
          <div className="panel-head">
            <div>
              <h2>سجل التحويلات</h2>
              <p>الحركة الكاملة للمراسلة</p>
            </div>
            <ArrowLeftRight />
          </div>
          {selected.workflow.length ? (
            selected.workflow.map((w) => (
              <article key={w.id}>
                <i />
                <div>
                  <b>{w.from}</b>
                  <span>← {w.to}</span>
                  <p>{w.action}</p>
                  <small>{new Date(w.time).toLocaleString("ar-PS")}</small>
                </div>
              </article>
            ))
          ) : (
            <Empty text="لا توجد تحويلات بعد" />
          )}
          <div className="notes-area">
            <h3>الملاحظات</h3>
            {selected.notes.map((n) => (
              <p key={n.id}>
                <b>{n.author}</b>
                {n.text}
              </p>
            ))}
            <textarea
              id="note-box"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="اكتب ملاحظة..."
            />
            <button
              className="primary full"
              onClick={() => {
                addNote(selected.id, note);
                setNote("");
              }}
            >
              حفظ الملاحظة
            </button>
          </div>
        </aside>
      </div>
      {pendingAction && (
        <Modal title={pendingAction.label} onClose={() => setPendingAction(null)}>
          <p className="copy-information-note">سيتم تسجيل هذا القرار وسببه ضمن سجل العمليات والسلسلة الزمنية للمراسلة.</p>
          <Field label={`سبب ${pendingAction.label} (إلزامي)`}>
            <textarea rows={5} value={actionReason} onChange={(e) => { setActionReason(e.target.value); setActionError(""); }} placeholder={`اكتب سبب ${pendingAction.label} بوضوح...`} />
          </Field>
          {actionError && <p className="form-error">{actionError}</p>}
          <div className="actions">
            <button className="secondary" onClick={() => setPendingAction(null)}>تراجع</button>
            <button className="primary" onClick={confirmReasonedStatus}><Check /> تأكيد الإجراء</button>
          </div>
        </Modal>
      )}
      {showClose && (
        <Modal title="إغلاق المراسلة" onClose={() => setShowClose(false)}>
          <p className="copy-information-note">سيتم إنهاء متابعة المراسلة وتسجيل سبب الإغلاق في سجلها الزمني. يمكن إعادة فتحها لاحقًا بصلاحية مناسبة.</p>
          <Field label="سبب الإغلاق (إلزامي)">
            <textarea rows={5} value={closeReasonText} onChange={(e) => { setCloseReasonText(e.target.value); setActionError(""); }} placeholder="مثال: تم تنفيذ المطلوب واستلام الرد النهائي..." />
          </Field>
          {actionError && <p className="form-error">{actionError}</p>}
          <div className="actions">
            <button className="secondary" onClick={() => setShowClose(false)}>تراجع</button>
            <button className="primary" onClick={() => { if (!closeReasonText.trim()) return setActionError("اكتب سبب الإغلاق قبل المتابعة."); closeMail(selected.id, closeReasonText); setShowClose(false); }}><Check /> تأكيد الإغلاق</button>
          </div>
        </Modal>
      )}
      {showArchiveForm && (
        <Modal title="إغلاق المراسلة وأرشفتها" onClose={() => setShowArchiveForm(false)}>
          <p className="copy-information-note">ستُغلق المراسلة وتنتقل إلى الأرشيف الإلكتروني مع الاحتفاظ بالأصل وجميع الحركات والردود.</p>
          <div className="form-grid one">
            <Field label="التصنيف الأرشيفي">
              <select value={archiveCategory} onChange={(e) => setArchiveCategory(e.target.value)}><option>عام</option><option>إداري</option><option>مالي</option><option>مشاريع وأشغال</option><option>مياه وصرف صحي</option><option>شؤون موظفين</option><option>قرارات وتعاميم</option></select>
            </Field>
            <Field label="الكلمات المفتاحية"><input value={archiveKeywords} onChange={(e) => setArchiveKeywords(e.target.value)} placeholder="افصل الكلمات بفاصلة، مثال: مياه، صيانة، 2026" /></Field>
            <Field label="سبب الإغلاق (إلزامي)"><textarea rows={4} value={closeReasonText} onChange={(e) => { setCloseReasonText(e.target.value); setActionError(""); }} placeholder="سبب إنهاء المعاملة وأرشفتها" /></Field>
          </div>
          {actionError && <p className="form-error">{actionError}</p>}
          <div className="actions">
            <button className="secondary" onClick={() => setShowArchiveForm(false)}>تراجع</button>
            <button className="primary" onClick={() => { if (!closeReasonText.trim()) return setActionError("اكتب سبب الإغلاق قبل الأرشفة."); update(selected.id, { archiveCategory, keywords: archiveKeywords }, "استكمال بيانات الأرشفة"); closeMail(selected.id, closeReasonText); archive(selected.id); setShowArchiveForm(false); }}><Archive /> إغلاق وأرشفة</button>
          </div>
        </Modal>
      )}
      {showReply && (
        <Modal title="إعداد رد رسمي" onClose={() => setShowReply(false)}>
          <div className="reply-mail-context">
            <Reply />
            <div>
              <small>رد على المراسلة {selected.number}</small>
              <b>{selected.subject}</b>
              <span>{selected.from} ← {selected.to}</span>
            </div>
          </div>
          <div className="form-grid one official-reply-form">
            <Field label="عنوان الرد">
              <input value={replySubject} onChange={(e) => { setReplySubject(e.target.value); setReplyError(""); }} placeholder="عنوان الرد الرسمي" />
            </Field>
            <Field label="نص الرد الرسمي">
              <textarea rows={10} value={replyBody} onChange={(e) => { setReplyBody(e.target.value); setReplyError(""); }} placeholder="اكتب نص الرد الرسمي هنا..." />
            </Field>
            <Field label="مرفقات الرد (اختياري)">
              <input type="file" multiple onChange={(e) => setReplyAttachments(Array.from(e.target.files || []).map((file) => ({ id: crypto.randomUUID(), name: file.name, size: `${Math.max(1, Math.round(file.size / 1024))} KB`, url: URL.createObjectURL(file) })))} />
            </Field>
          </div>
          {replyAttachments.length > 0 && <div className="reply-attachment-list">{replyAttachments.map((file) => <span key={file.id}><Paperclip />{file.name}</span>)}</div>}
          {replyError && <p className="form-error">{replyError}</p>}
          <div className="actions reply-modal-actions">
            <button className="secondary" onClick={() => setShowReply(false)}>إلغاء</button>
            <button className="secondary" onClick={saveReplyDraft}><Save /> حفظ كمسودة</button>
            <button className="primary" onClick={sendOfficialReply}><Send /> إرسال الرد</button>
          </div>
        </Modal>
      )}
      {showCorrection && (
        <Modal
          title="إصدار نسخة مصححة"
          onClose={() => setShowCorrection(false)}
        >
          <p className="copy-information-note">
            لن يتم حذف أو استبدال الأصل. سيُنشئ النظام إصدارًا جديدًا موثقًا مع
            الاحتفاظ بجميع النسخ السابقة.
          </p>
          <div className="form-grid one">
            <Field label="عنوان النسخة المصححة">
              <input
                value={correction.subject}
                onChange={(e) =>
                  setCorrection({ ...correction, subject: e.target.value })
                }
              />
            </Field>
            <Field label="نص النسخة المصححة">
              <textarea
                rows={8}
                value={correction.body}
                onChange={(e) =>
                  setCorrection({ ...correction, body: e.target.value })
                }
              />
            </Field>
            <Field label="سبب التصحيح (إلزامي)">
              <textarea
                value={correction.reason}
                onChange={(e) =>
                  setCorrection({ ...correction, reason: e.target.value })
                }
                placeholder="مثال: تصحيح رقم الكتاب أو اسم الجهة..."
              />
            </Field>
          </div>
          <div className="actions">
            <button
              className="secondary"
              onClick={() => setShowCorrection(false)}
            >
              إلغاء
            </button>
            <button className="primary" onClick={saveCorrection}>
              <ShieldCheck /> اعتماد النسخة المصححة
            </button>
          </div>
        </Modal>
      )}
      {showTransfer && (
        <Modal title="تحويل المراسلة" onClose={() => setShowTransfer(false)}>
          <div className="form-grid one">
            <Field label="الجهة أو القسم">
              <select
                value={target}
                onChange={(e) => setTarget(e.target.value)}
              >
                <option value="">اختر المستلم</option>
                {departmentNames.map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </Field>
            <Field label="الإجراء المطلوب">
              <select
                value={action}
                onChange={(e) => setAction(e.target.value)}
              >
                {actions.map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </Field>
          </div>
          <div className="actions">
            <button
              className="secondary"
              onClick={() => setShowTransfer(false)}
            >
              إلغاء
            </button>
            <button
              className="primary"
              onClick={() => {
                if (target) {
                  transfer(selected.id, target, action, "");
                  setShowTransfer(false);
                }
              }}
            >
              إرسال التحويل
            </button>
          </div>
        </Modal>
      )}
      {showExtension && (
        <Modal
          title="تمديد موعد المتابعة"
          onClose={() => setShowExtension(false)}
        >
          <Field label="الموعد الجديد">
            <input
              type="date"
              value={newDue}
              onChange={(e) => setNewDue(e.target.value)}
            />
          </Field>
          <div className="actions">
            <button
              className="secondary"
              onClick={() => setShowExtension(false)}
            >
              إلغاء
            </button>
            <button
              className="primary"
              onClick={() => {
                if (newDue) {
                  update(
                    selected.id,
                    { dueDate: newDue, extensionRequested: true },
                    "تمديد المهلة",
                  );
                  setShowExtension(false);
                }
              }}
            >
              اعتماد التمديد
            </button>
          </div>
        </Modal>
      )}
      {showCopy && (
        <Modal title="إرسال نسخة للعلم" onClose={() => setShowCopy(false)}>
          <Field label="الجهة المطلعة">
            <select
              value={copyTarget}
              onChange={(e) => setCopyTarget(e.target.value)}
            >
              <option value="">اختر جهة أو قسمًا</option>
              {departmentNames.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </Field>
          <p className="copy-information-note">
            نسخة العلم تمنح الجهة حق الاطلاع ولا تنقل إليها مسؤولية الإجراء.
          </p>
          <div className="actions">
            <button className="secondary" onClick={() => setShowCopy(false)}>
              إلغاء
            </button>
            <button
              className="primary"
              onClick={() => {
                if (copyTarget) {
                  update(
                    selected.id,
                    {
                      copies: [
                        ...new Set([...(selected.copies || []), copyTarget]),
                      ],
                      workflow: [
                        ...selected.workflow,
                        {
                          id: crypto.randomUUID(),
                          from: selected.department || user.name,
                          to: copyTarget,
                          action: "نسخة للعلم",
                          time: new Date().toISOString(),
                          status: "للاطلاع",
                        },
                      ],
                    },
                    "إرسال نسخة للعلم",
                  );
                  setCopyTarget("");
                  setShowCopy(false);
                }
              }}
            >
              <Copy /> إرسال النسخة
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
