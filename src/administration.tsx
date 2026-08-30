import { useMemo, useState } from "react";
import {
  Building2,
  ChevronLeft,
  KeyRound,
  Network,
  Save,
  Search,
  ShieldCheck,
  UserRound,
  UserPlus,
  Users,
} from "lucide-react";
import { Field, Modal, PageHead, Status } from "./components";

const units = [
  {
    name: "الإدارة العليا",
    manager: "رئيس البلدية",
    kind: "إدارة عليا",
    children: ["نائب رئيس البلدية", "سكرتير البلدية"],
  },
  {
    name: "الوحدات المرتبطة مباشرة",
    manager: "رئيس البلدية",
    kind: "وحدات",
    children: [
      "الرقابة الداخلية",
      "العلاقات العامة وخدمات الجمهور",
      "المستشار القانوني",
    ],
  },
  {
    name: "الدائرة الفنية",
    manager: "مدير الدائرة الفنية",
    kind: "دائرة",
    children: ["المشاريع", "الأشغال العامة", "GIS"],
  },
  {
    name: "دائرة الصحة والمياه والصرف الصحي",
    manager: "مدير الدائرة",
    kind: "دائرة",
    children: ["الصحة والبيئة", "المياه", "الصرف الصحي"],
  },
  {
    name: "الشؤون الإدارية والمالية",
    manager: "مدير الدائرة",
    kind: "دائرة",
    children: [
      "الموارد البشرية",
      "الدائرة المالية",
      "الأرشيف المركزي",
      "تكنولوجيا المعلومات",
    ],
  },
];
const staff = [
  ["موظف الديوان", "مأمور مراسلات", "الديوان", "داخلي", "نشط"],
  ["محمد أحمد", "رئيس قسم", "الديوان", "مقيد", "نشط"],
  ["م. أحمد محمد", "رئيس قسم", "دائرة الهندسة", "سري", "نشط"],
  ["سارة خالد", "مدير دائرة", "الدائرة المالية", "سري", "نشط"],
  ["رامي عادل", "موظف", "الصحة والبيئة", "مقيد", "نشط"],
  ["وسام علي", "مدير النظام", "تكنولوجيا المعلومات", "داخلي", "نشط"],
];
type OrgEmployee = { id: string; name: string; title: string; unit: string; active: boolean };
const initialOrgEmployees: OrgEmployee[] = [
  { id: "oe-1", name: "محمود يوسف", title: "رئيس البلدية", unit: "الإدارة العليا", active: true },
  { id: "oe-2", name: "نور خليل", title: "سكرتير البلدية", unit: "سكرتير البلدية", active: true },
  { id: "oe-3", name: "م. أحمد محمد", title: "مهندس مشاريع", unit: "المشاريع", active: true },
  { id: "oe-4", name: "رامي عادل", title: "مراقب صحة", unit: "الصحة والبيئة", active: true },
  { id: "oe-5", name: "سارة خالد", title: "مدير مالي", unit: "الدائرة المالية", active: true },
  { id: "oe-6", name: "وسام علي", title: "مسؤول النظام", unit: "تكنولوجيا المعلومات", active: true },
];

export function OrganizationManager() {
  const [orgUnits, setOrgUnits] = useState<typeof units>(() => {
      try {
        return JSON.parse(
          localStorage.getItem("municipality-org-units") || "null",
        ) || units;
      } catch {
        return units;
      }
    }),
    [selected, setSelected] = useState(units[0].name),
    [saved, setSaved] = useState(false),
    [showAdd, setShowAdd] = useState(false),
    [showAddEmployee, setShowAddEmployee] = useState(false),
    [orgEmployees, setOrgEmployees] = useState<OrgEmployee[]>(() => {
      try {
        return JSON.parse(localStorage.getItem("municipality-org-employees") || "null") || initialOrgEmployees;
      } catch {
        return initialOrgEmployees;
      }
    }),
    [newEmployee, setNewEmployee] = useState({ name: "", title: "", unit: "" }),
    [editingChild, setEditingChild] = useState<{
      parent: string;
      original: string;
      name: string;
    } | null>(null),
    [newUnit, setNewUnit] = useState({
      name: "",
      kind: "قسم",
      manager: "",
      parent: "",
    });
  const current = orgUnits.find((x) => x.name === selected) || orgUnits[0];
  const currentEmployees = orgEmployees.filter(
    (employee) =>
      employee.unit === current.name || current.children.includes(employee.unit),
  );
  const addEmployee = () => {
    if (!newEmployee.name.trim() || !newEmployee.title.trim())
      return alert("اسم الموظف والمسمى الوظيفي مطلوبان");
    const record: OrgEmployee = {
      id: crypto.randomUUID(),
      name: newEmployee.name.trim(),
      title: newEmployee.title.trim(),
      unit: newEmployee.unit || current.name,
      active: true,
    };
    const updated = [...orgEmployees, record];
    setOrgEmployees(updated);
    localStorage.setItem("municipality-org-employees", JSON.stringify(updated));
    setNewEmployee({ name: "", title: "", unit: "" });
    setShowAddEmployee(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1400);
  };
  const addUnit = () => {
    if (!newUnit.name.trim()) return alert("اسم الوحدة مطلوب");
    if (!newUnit.manager.trim()) return alert("المسؤول الإداري مطلوب");
    if (orgUnits.some((unit) => unit.name === newUnit.name.trim()))
      return alert("هذه الوحدة موجودة مسبقًا");
    let updated = [...orgUnits];
    if (newUnit.parent) {
      updated = updated.map((unit) =>
        unit.name === newUnit.parent
          ? { ...unit, children: [...unit.children, newUnit.name.trim()] }
          : unit,
      );
    } else {
      updated.push({
        name: newUnit.name.trim(),
        kind: newUnit.kind,
        manager: newUnit.manager.trim(),
        children: [],
      });
    }
    setOrgUnits(updated);
    localStorage.setItem("municipality-org-units", JSON.stringify(updated));
    setSelected(newUnit.parent || newUnit.name.trim());
    setNewUnit({ name: "", kind: "قسم", manager: "", parent: "" });
    setShowAdd(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1400);
  };
  const saveChildEdit = () => {
    if (!editingChild?.name.trim()) return alert("اسم الوحدة مطلوب");
    const duplicate = orgUnits.some(
      (unit) =>
        unit.name === editingChild.name.trim() ||
        unit.children.some(
          (child) =>
            child === editingChild.name.trim() &&
            child !== editingChild.original,
        ),
    );
    if (duplicate) return alert("هذا الاسم مستخدم في الهيكل مسبقًا");
    const updated = orgUnits.map((unit) =>
      unit.name === editingChild.parent
        ? {
            ...unit,
            children: unit.children.map((child) =>
              child === editingChild.original
                ? editingChild.name.trim()
                : child,
            ),
          }
        : unit,
    );
    setOrgUnits(updated);
    localStorage.setItem("municipality-org-units", JSON.stringify(updated));
    setEditingChild(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 1400);
  };
  return (
    <>
      <PageHead
        title="إدارة الهيكل التنظيمي"
        subtitle="إدارة الوحدات والوظائف والعلاقات الإدارية التي تُبنى عليها مسارات المراسلات"
        action="إضافة وحدة"
        onAction={() => setShowAdd(true)}
      />
      <div className="org-layout">
        <aside className="panel org-tree">
          <div className="panel-head">
            <div>
              <h2>شجرة الهيكل</h2>
              <p>{orgUnits.length} مستويات رئيسية</p>
            </div>
            <Network />
          </div>
          {orgUnits.map((u) => (
            <button
              className={selected === u.name ? "active" : ""}
              key={u.name}
              onClick={() => setSelected(u.name)}
            >
              <Building2 />
              <span>
                <b>{u.name}</b>
                <small>
                  {u.kind} · {u.children.length} وحدات تابعة
                </small>
              </span>
              <ChevronLeft />
            </button>
          ))}
        </aside>
        <section className="panel org-details">
          <div className="org-unit-head">
            <div>
              <small>{current.kind}</small>
              <h2>{current.name}</h2>
              <p>المسؤول الإداري: {current.manager}</p>
            </div>
            <Status>نشط</Status>
          </div>
          <h3>الوحدات والوظائف التابعة</h3>
          <div className="org-children">
            {current.children.map((x, i) => (
              <article key={x}>
                <i>{i + 1}</i>
                <div>
                  <b>{x}</b>
                  <span>وحدة تنظيمية قابلة لربط الموظفين ومسارات الاعتماد</span>
                </div>
                <button
                  onClick={() =>
                    setEditingChild({
                      parent: current.name,
                      original: x,
                      name: x,
                    })
                  }
                >
                  تعديل
                </button>
              </article>
            ))}
          </div>
          <div className="org-employees-head">
            <div>
              <h3>موظفو الوحدة</h3>
              <p>{currentEmployees.length} موظفين ضمن الوحدة والوحدات التابعة</p>
            </div>
            <button className="secondary" onClick={() => {setNewEmployee({...newEmployee,unit:current.name});setShowAddEmployee(true)}}>
              <UserPlus /> إضافة موظف
            </button>
          </div>
          <div className="org-employees">
            {currentEmployees.length ? currentEmployees.map((employee) => (
              <article key={employee.id}>
                <i><UserRound /></i>
                <div><b>{employee.name}</b><span>{employee.title} · {employee.unit}</span></div>
                <Status>{employee.active ? "نشط" : "موقوف"}</Status>
              </article>
            )) : <p className="org-no-employees">لا يوجد موظفون مرتبطون بهذه الوحدة بعد.</p>}
          </div>
          <div className="admin-note">
            <ShieldCheck />
            <div>
              <b>الربط بالوظيفة وليس باسم الشخص</b>
              <p>
                تغيير شاغل الوظيفة لا يقطع مسار المراسلات الحالية أو التاريخية.
              </p>
            </div>
          </div>
          <button
            className="primary"
            onClick={() => {
              setSaved(true);
              setTimeout(() => setSaved(false), 1400);
            }}
          >
            <Save /> حفظ الهيكل
          </button>
        </section>
      </div>
      {showAddEmployee && (
        <Modal title="إضافة موظف إلى الوحدة" onClose={() => setShowAddEmployee(false)}>
          <div className="form-grid one">
            <Field label="اسم الموظف"><input value={newEmployee.name} onChange={e=>setNewEmployee({...newEmployee,name:e.target.value})} placeholder="الاسم الكامل"/></Field>
            <Field label="المسمى الوظيفي"><input value={newEmployee.title} onChange={e=>setNewEmployee({...newEmployee,title:e.target.value})} placeholder="مثال: مهندس مدني"/></Field>
            <Field label="الوحدة التنظيمية"><select value={newEmployee.unit} onChange={e=>setNewEmployee({...newEmployee,unit:e.target.value})}><option>{current.name}</option>{current.children.map(child=><option key={child}>{child}</option>)}</select></Field>
          </div>
          <div className="actions"><button className="secondary" onClick={()=>setShowAddEmployee(false)}>إلغاء</button><button className="primary" onClick={addEmployee}><UserPlus/> إضافة الموظف</button></div>
        </Modal>
      )}
      {editingChild && (
        <Modal title="تعديل الوحدة التابعة" onClose={() => setEditingChild(null)}>
          <div className="edit-unit-context">
            <small>الوحدة الأم</small>
            <b>{editingChild.parent}</b>
          </div>
          <Field label="اسم الوحدة أو الوظيفة">
            <input
              autoFocus
              value={editingChild.name}
              onChange={(e) =>
                setEditingChild({ ...editingChild, name: e.target.value })
              }
              onKeyDown={(e) => e.key === "Enter" && saveChildEdit()}
            />
          </Field>
          <p className="copy-information-note">
            سيتم تحديث الاسم في الهيكل، مع بقاء الوحدة مرتبطة بالمسارات
            التنظيمية نفسها.
          </p>
          <div className="actions">
            <button className="secondary" onClick={() => setEditingChild(null)}>
              إلغاء
            </button>
            <button className="primary" onClick={saveChildEdit}>
              <Save /> حفظ التعديل
            </button>
          </div>
        </Modal>
      )}
      {showAdd && (
        <Modal title="إضافة وحدة تنظيمية" onClose={() => setShowAdd(false)}>
          <div className="form-grid one">
            <Field label="اسم الوحدة">
              <input
                value={newUnit.name}
                onChange={(e) =>
                  setNewUnit({ ...newUnit, name: e.target.value })
                }
                placeholder="مثال: قسم المشتريات"
              />
            </Field>
            <Field label="نوع الوحدة">
              <select
                value={newUnit.kind}
                onChange={(e) =>
                  setNewUnit({ ...newUnit, kind: e.target.value })
                }
              >
                <option>إدارة</option>
                <option>دائرة</option>
                <option>قسم</option>
                <option>شعبة</option>
                <option>وحدة</option>
              </select>
            </Field>
            <Field label="الوحدة الأم">
              <select
                value={newUnit.parent}
                onChange={(e) =>
                  setNewUnit({ ...newUnit, parent: e.target.value })
                }
              >
                <option value="">مستوى رئيسي جديد</option>
                {orgUnits.map((unit) => (
                  <option key={unit.name}>{unit.name}</option>
                ))}
              </select>
            </Field>
            <Field label="المسؤول الإداري">
              <input
                value={newUnit.manager}
                onChange={(e) =>
                  setNewUnit({ ...newUnit, manager: e.target.value })
                }
                placeholder="المسمى الوظيفي أو اسم المسؤول"
              />
            </Field>
          </div>
          <div className="actions">
            <button className="secondary" onClick={() => setShowAdd(false)}>
              إلغاء
            </button>
            <button className="primary" onClick={addUnit}>
              إضافة الوحدة
            </button>
          </div>
        </Modal>
      )}
      {saved && <div className="toast">تم حفظ إعدادات الهيكل</div>}
    </>
  );
}

export function UsersPermissions() {
  const [users, setUsers] = useState<string[][]>(() => {
      try {
        return JSON.parse(localStorage.getItem("municipality-users") || "null") || staff;
      } catch {
        return staff;
      }
    }),
    [query, setQuery] = useState(""),
    [role, setRole] = useState(""),
    [selected, setSelected] = useState<string | null>(null),
    [showAddUser, setShowAddUser] = useState(false),
    [saved, setSaved] = useState(false),
    [newUser, setNewUser] = useState({
      name: "",
      role: "موظف",
      unit: "الديوان",
      secrecy: "داخلي",
    });
  const rows = useMemo(
    () =>
      users.filter(
        (x) =>
          (!query || [x[0], x[2]].some((v) => v.includes(query))) &&
          (!role || x[1] === role),
      ),
    [query, role, users],
  );
  const addUser = () => {
    if (!newUser.name.trim()) return alert("اسم المستخدم مطلوب");
    if (users.some((user) => user[0] === newUser.name.trim()))
      return alert("المستخدم موجود مسبقًا");
    const updated = [
      ...users,
      [newUser.name.trim(), newUser.role, newUser.unit, newUser.secrecy, "نشط"],
    ];
    setUsers(updated);
    localStorage.setItem("municipality-users", JSON.stringify(updated));
    setNewUser({ name: "", role: "موظف", unit: "الديوان", secrecy: "داخلي" });
    setShowAddUser(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1400);
  };
  return (
    <>
      <PageHead
        title="المستخدمون والصلاحيات"
        subtitle="ربط المستخدم بالموظف والوظيفة والوحدة وتطبيق أقل صلاحية لازمة"
        action="إضافة مستخدم"
        onAction={() => setShowAddUser(true)}
      />
      <section className="panel user-filters">
        <div>
          <Search />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث باسم المستخدم أو الوحدة..."
          />
        </div>
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">جميع الأدوار</option>
          {[
            "موظف",
            "رئيس قسم",
            "مدير دائرة",
            "رئيس البلدية",
            "الأرشيف",
            "مدير النظام",
          ].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
      </section>
      <section className="panel users-table">
        <div className="users-head">
          <b>المستخدم</b>
          <b>الدور الوظيفي</b>
          <b>الوحدة</b>
          <b>أقصى سرية</b>
          <b>الحالة</b>
          <b></b>
        </div>
        {rows.map((x) => (
          <div className="users-row" key={x[0]}>
            <span className="user-name">
              <i>
                <UserRound />
              </i>
              <b>{x[0]}</b>
            </span>
            <span>{x[1]}</span>
            <span>{x[2]}</span>
            <span>
              <KeyRound /> {x[3]}
            </span>
            <Status>{x[4]}</Status>
            <button onClick={() => setSelected(x[0])}>إدارة الصلاحيات</button>
          </div>
        ))}
      </section>
      {selected && (
        <section className="panel permission-panel">
          <div className="panel-head">
            <div>
              <h2>صلاحيات {selected}</h2>
              <p>الصلاحيات ناتجة عن الدور والموقع التنظيمي ومستوى السرية</p>
            </div>
            <button className="secondary" onClick={() => setSelected(null)}>
              إغلاق
            </button>
          </div>
          <div className="permission-grid">
            {[
              "إنشاء مراسلة",
              "عرض مراسلات الوحدة",
              "اعتماد المراسلات",
              "الإحالة للموظفين",
              "إغلاق المراسلة",
              "طباعة الوثائق",
              "تنزيل المرفقات",
              "عرض التقارير",
            ].map((x, i) => (
              <label key={x}>
                <input type="checkbox" defaultChecked={i < 4} />
                <span>
                  <b>{x}</b>
                  <small>
                    {i < 4 ? "مسموح حسب نطاق الوحدة" : "يحتاج تفويضاً إضافياً"}
                  </small>
                </span>
              </label>
            ))}
          </div>
          <button
            className="primary"
            onClick={() => {
              const permissions = Array.from(
                document.querySelectorAll<HTMLInputElement>(
                  ".permission-grid input:checked",
                ),
              ).map((input) => input.closest("label")?.querySelector("b")?.textContent);
              localStorage.setItem(
                `municipality-permissions-${selected}`,
                JSON.stringify(permissions),
              );
              setSaved(true);
              setTimeout(() => setSaved(false), 1400);
            }}
          >
            <Save /> حفظ الصلاحيات
          </button>
        </section>
      )}
      {showAddUser && (
        <Modal title="إضافة مستخدم" onClose={() => setShowAddUser(false)}>
          <div className="form-grid">
            <Field label="اسم المستخدم">
              <input value={newUser.name} onChange={(e) => setNewUser({...newUser,name:e.target.value})} placeholder="الاسم الكامل" />
            </Field>
            <Field label="الدور الوظيفي">
              <select value={newUser.role} onChange={(e) => setNewUser({...newUser,role:e.target.value})}>{["موظف","رئيس قسم","مدير دائرة","رئيس البلدية","الأرشيف","مدير النظام"].map(x=><option key={x}>{x}</option>)}</select>
            </Field>
            <Field label="الوحدة التنظيمية">
              <input value={newUser.unit} onChange={(e) => setNewUser({...newUser,unit:e.target.value})} />
            </Field>
            <Field label="أقصى مستوى سرية">
              <select value={newUser.secrecy} onChange={(e) => setNewUser({...newUser,secrecy:e.target.value})}>{["داخلي","مقيد","سري","سري جداً"].map(x=><option key={x}>{x}</option>)}</select>
            </Field>
          </div>
          <div className="actions"><button className="secondary" onClick={()=>setShowAddUser(false)}>إلغاء</button><button className="primary" onClick={addUser}>إضافة المستخدم</button></div>
        </Modal>
      )}
      {saved && <div className="toast">تم حفظ بيانات المستخدمين والصلاحيات</div>}
    </>
  );
}

const initialRules = [
  {
    name: "موظف إلى رئيس قسمه",
    path: "الموظف ← رئيس القسم",
    approval: false,
    active: true,
  },
  {
    name: "موظف إلى قسم آخر",
    path: "رئيس القسم ← الجهة المستلمة",
    approval: true,
    active: true,
  },
  {
    name: "بين دائرتين مختلفتين",
    path: "مدير الدائرة المرسلة ← مدير الدائرة المستلمة",
    approval: true,
    active: true,
  },
  {
    name: "مراسلة إلى رئيس البلدية",
    path: "مدير الدائرة ← سكرتير البلدية ← رئيس البلدية",
    approval: true,
    active: true,
  },
  {
    name: "صادرة من رئيس البلدية",
    path: "توجيه مباشر إلى أي وحدة",
    approval: false,
    active: true,
  },
  {
    name: "تعميم جماعي",
    path: "المستخدم المخول ← الوحدات المحددة",
    approval: true,
    active: true,
  },
];
export function WorkflowSettings() {
  const [rules, setRules] = useState<typeof initialRules>(() => {
      try {
        return JSON.parse(localStorage.getItem("municipality-workflow-rules") || "null") || initialRules;
      } catch {
        return initialRules;
      }
    }),
    [saved, setSaved] = useState(false),
    [showAddRule, setShowAddRule] = useState(false),
    [newRule, setNewRule] = useState({name:"",path:"",approval:true,active:true});
  const toggle = (i: number, key: "approval" | "active") =>
    setRules(rules.map((r, n) => (n === i ? { ...r, [key]: !r[key] } : r)));
  const addRule = () => {
    if (!newRule.name.trim() || !newRule.path.trim()) return alert("اسم القاعدة والمسار مطلوبان");
    if (rules.some((rule) => rule.name === newRule.name.trim())) return alert("اسم القاعدة مستخدم مسبقًا");
    const updated=[...rules,{...newRule,name:newRule.name.trim(),path:newRule.path.trim()}];
    setRules(updated);
    localStorage.setItem("municipality-workflow-rules",JSON.stringify(updated));
    setNewRule({name:"",path:"",approval:true,active:true});
    setShowAddRule(false);
    setSaved(true);
    setTimeout(()=>setSaved(false),1400);
  };
  return (
    <>
      <PageHead
        title="مسارات الاعتماد والتوجيه"
        subtitle="تحديد الطريق الإداري الذي تسلكه المراسلة قبل وصولها إلى الجهة المستلمة"
        action="إضافة مسار جديد"
        onAction={() => setShowAddRule(true)}
      />
      <div className="admin-note workflow-guide">
        <ShieldCheck />
        <div>
          <b>إعدادات إدارية خاصة بمسؤول النظام</b>
          <p>
            كل قاعدة تحدد من يستلم المراسلة أولًا، ومن يراجعها أو يعتمدها، ثم
            إلى أي جهة تنتقل. إيقاف القاعدة يمنع تطبيقها على المراسلات الجديدة
            دون حذفها.
          </p>
        </div>
      </div>
      <div className="workflow-summary">
        <article>
          <Network />
          <div>
            <b>{rules.length}</b>
            <span>مسارات مسجّلة</span>
          </div>
        </article>
        <article>
          <ShieldCheck />
          <div>
            <b>{rules.filter((x) => x.approval).length}</b>
            <span>تتطلب موافقة</span>
          </div>
        </article>
        <article>
          <Users />
          <div>
            <b>{rules.filter((x) => x.active).length}</b>
            <span>مسارات قيد التشغيل</span>
          </div>
        </article>
      </div>
      <section className="panel workflow-rules">
        <div className="rules-head">
          <b>حالة الإرسال</b>
          <b>طريق انتقال المراسلة</b>
          <b>تحتاج موافقة</b>
          <b>قيد التشغيل</b>
        </div>
        {rules.map((r, i) => (
          <div className="rule-row" key={r.name}>
            <div>
              <b>{r.name}</b>
              <small>يُطبّق هذا المسار تلقائيًا عند تحقق الحالة</small>
            </div>
            <span>{r.path}</span>
            <label className="mini-switch">
              <input
                type="checkbox"
                checked={r.approval}
                onChange={() => toggle(i, "approval")}
              />
              <i />
            </label>
            <label className="mini-switch">
              <input
                type="checkbox"
                checked={r.active}
                onChange={() => toggle(i, "active")}
              />
              <i />
            </label>
          </div>
        ))}
      </section>
      <div className="admin-note">
        <ShieldCheck />
        <div>
          <b>ماذا تعني الإحالة ونسخة العلم؟</b>
          <p>
            عند الإحالة تنتقل المسؤولية للجهة المحال إليها، بينما نسخة العلم لا
            تنقل المسؤولية.
          </p>
        </div>
      </div>
      <button
        className="primary"
        onClick={() => {
          localStorage.setItem(
            "municipality-workflow-rules",
            JSON.stringify(rules),
          );
          setSaved(true);
          setTimeout(() => setSaved(false), 1400);
        }}
      >
        <Save /> حفظ قواعد المسارات
      </button>
      {showAddRule && (
        <Modal title="إضافة قاعدة مسار" onClose={()=>setShowAddRule(false)}>
          <div className="form-grid one">
            <Field label="اسم القاعدة"><input value={newRule.name} onChange={e=>setNewRule({...newRule,name:e.target.value})} placeholder="مثال: إحالة الدائرة إلى قسم تابع"/></Field>
            <Field label="المسار التنظيمي"><input value={newRule.path} onChange={e=>setNewRule({...newRule,path:e.target.value})} placeholder="المرسل ← المدقق ← المعتمد ← المستلم"/></Field>
          </div>
          <label className="setting-toggle"><input type="checkbox" checked={newRule.approval} onChange={e=>setNewRule({...newRule,approval:e.target.checked})}/><span><b>تحتاج اعتمادًا</b><small>لن تُرسل قبل اعتماد المسؤول المخول</small></span></label>
          <label className="setting-toggle"><input type="checkbox" checked={newRule.active} onChange={e=>setNewRule({...newRule,active:e.target.checked})}/><span><b>تفعيل القاعدة مباشرة</b><small>تدخل ضمن قواعد التوجيه فور الحفظ</small></span></label>
          <div className="actions"><button className="secondary" onClick={()=>setShowAddRule(false)}>إلغاء</button><button className="primary" onClick={addRule}>إضافة القاعدة</button></div>
        </Modal>
      )}
      {saved && <div className="toast">تم حفظ قواعد المسارات</div>}
    </>
  );
}
