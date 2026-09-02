import {lazy,Suspense} from 'react';
import type {ComponentType,ReactNode} from 'react';
import {Navigate,Route,Routes,useLocation} from 'react-router-dom';
import {Layout} from './components';
import {canAccessPath} from './access';
import {useStore} from './store';

const named=<T extends Record<string,unknown>,K extends keyof T>(loader:()=>Promise<T>,key:K)=>lazy(()=>loader().then(module=>({default:module[key] as ComponentType})));
const Registry=named(()=>import('./pages'),'Registry');
const AdvancedReports=named(()=>import('./advanced'),'AdvancedReports'),AdvancedActivity=named(()=>import('./advanced'),'AdvancedActivity');
const ProfessionalInbox=named(()=>import('./workspace'),'ProfessionalInbox');
const ExecutiveDashboard=named(()=>import('./executive-dashboard'),'ExecutiveDashboard');
const GovernmentCompose=named(()=>import('./government'),'GovernmentCompose'),GovernmentDetails=named(()=>import('./government'),'GovernmentDetails'),CorrespondenceVerification=named(()=>import('./government'),'CorrespondenceVerification');
const ProfilePage=named(()=>import('./profile'),'ProfilePage');
const ApprovalCenter=named(()=>import('./approvals-center'),'ApprovalCenter');
const AdvancedSearch=named(()=>import('./search'),'AdvancedSearch');
const OrganizationManager=named(()=>import('./administration'),'OrganizationManager'),UsersPermissions=named(()=>import('./administration'),'UsersPermissions'),WorkflowSettings=named(()=>import('./administration'),'WorkflowSettings');
const ArchiveCenter=named(()=>import('./followup'),'ArchiveCenter'),ReferralFollowup=named(()=>import('./followup'),'ReferralFollowup');
const SystemSettings=named(()=>import('./configuration'),'SystemSettings');
const CircularsCenter=named(()=>import('./operational'),'CircularsCenter'),CorrespondenceCalendar=named(()=>import('./operational'),'CorrespondenceCalendar');
const DelegationCenter=named(()=>import('./productivity'),'DelegationCenter'),TemplatesCenter=named(()=>import('./productivity'),'TemplatesCenter');
const CorrespondenceDirectory=named(()=>import('./directory'),'CorrespondenceDirectory');
const CaseFilesCenter=named(()=>import('./casefiles'),'CaseFilesCenter');
const SecurityPolicies=named(()=>import('./security'),'SecurityPolicies');
const AllCorrespondence=named(()=>import('./correspondence'),'AllCorrespondence');

function AccessGate({children}:{children:ReactNode}){const user=useStore(s=>s.user),location=useLocation();return canAccessPath(user,location.pathname)?children:<Navigate to="/app/dashboard" replace/>}
const loading=<div className="route-loading"><span/><b>جارٍ تحميل الصفحة...</b></div>;
export default function App(){return <Layout><AccessGate><Suspense fallback={loading}><Routes>
 <Route path="/" element={<Navigate to="/app/dashboard" replace/>}/>
 <Route path="/app/dashboard" element={<ExecutiveDashboard/>}/><Route path="/app/inbox" element={<ProfessionalInbox/>}/><Route path="/app/correspondence" element={<AllCorrespondence/>}/><Route path="/app/approvals" element={<ApprovalCenter/>}/><Route path="/app/followup" element={<ReferralFollowup/>}/><Route path="/app/search" element={<AdvancedSearch/>}/>
 <Route path="/app/incoming" element={<Registry/>}/><Route path="/app/outgoing" element={<Registry/>}/><Route path="/app/internal" element={<Registry/>}/><Route path="/app/circulars" element={<CircularsCenter/>}/><Route path="/app/calendar" element={<CorrespondenceCalendar/>}/><Route path="/app/delegations" element={<DelegationCenter/>}/><Route path="/app/templates" element={<TemplatesCenter/>}/><Route path="/app/directory" element={<CorrespondenceDirectory/>}/><Route path="/app/cases" element={<CaseFilesCenter/>}/>
 <Route path="/app/compose/:type" element={<GovernmentCompose/>}/><Route path="/app/mail/:id" element={<GovernmentDetails/>}/><Route path="/verify/:id" element={<CorrespondenceVerification/>}/><Route path="/app/scanner" element={<Navigate to="/app/compose/incoming" replace/>}/>
 <Route path="/app/archive" element={<ArchiveCenter/>}/><Route path="/app/reports" element={<AdvancedReports/>}/><Route path="/app/departments" element={<OrganizationManager/>}/><Route path="/app/users" element={<UsersPermissions/>}/><Route path="/app/workflows" element={<WorkflowSettings/>}/><Route path="/app/activity" element={<AdvancedActivity/>}/><Route path="/app/security" element={<SecurityPolicies/>}/><Route path="/app/settings" element={<SystemSettings/>}/><Route path="/app/profile" element={<ProfilePage/>}/><Route path="*" element={<Navigate to="/app/dashboard" replace/>}/>
</Routes></Suspense></AccessGate></Layout>}
