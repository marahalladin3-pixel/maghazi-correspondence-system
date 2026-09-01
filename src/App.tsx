import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Layout } from './components';
import { Registry } from './pages';
import { AdvancedReports, AdvancedActivity } from './advanced';
import { ProfessionalInbox } from './workspace';
import { ExecutiveDashboard } from './executive-dashboard';
import { GovernmentCompose, GovernmentDetails } from './government';
import { ProfilePage } from './profile';
import { ApprovalCenter } from './approvals-center';
import { AdvancedSearch } from './search';
import { OrganizationManager, UsersPermissions, WorkflowSettings } from './administration';
import { ArchiveCenter, ReferralFollowup } from './followup';
import { SystemSettings } from './configuration';
import { CircularsCenter, CorrespondenceCalendar } from './operational';
import { DelegationCenter, TemplatesCenter } from './productivity';
import { CorrespondenceDirectory } from './directory';
import { CaseFilesCenter } from './casefiles';
import { SecurityPolicies } from './security';
import { AllCorrespondence } from './correspondence';
import { canAccessPath } from './access';
import { useStore } from './store';

function AccessGate({ children }: { children: React.ReactNode }) {
  const user = useStore((s) => s.user), location = useLocation();
  return canAccessPath(user, location.pathname) ? children : <Navigate to="/app/dashboard" replace />;
}

export default function App() {
  return <Layout><AccessGate><Routes>
    <Route path="/" element={<Navigate to="/app/dashboard" replace />} />
    <Route path="/app/dashboard" element={<ExecutiveDashboard />} />
    <Route path="/app/inbox" element={<ProfessionalInbox />} />
    <Route path="/app/correspondence" element={<AllCorrespondence />} />
    <Route path="/app/approvals" element={<ApprovalCenter />} />
    <Route path="/app/followup" element={<ReferralFollowup />} />
    <Route path="/app/search" element={<AdvancedSearch />} />
    <Route path="/app/incoming" element={<Registry />} />
    <Route path="/app/outgoing" element={<Registry />} />
    <Route path="/app/internal" element={<Registry />} />
    <Route path="/app/circulars" element={<CircularsCenter />} />
    <Route path="/app/calendar" element={<CorrespondenceCalendar />} />
    <Route path="/app/delegations" element={<DelegationCenter />} />
    <Route path="/app/templates" element={<TemplatesCenter />} />
    <Route path="/app/directory" element={<CorrespondenceDirectory />} />
    <Route path="/app/cases" element={<CaseFilesCenter />} />
    <Route path="/app/compose/:type" element={<GovernmentCompose />} />
    <Route path="/app/mail/:id" element={<GovernmentDetails />} />
    <Route path="/app/scanner" element={<Navigate to="/app/compose/incoming" replace />} />
    <Route path="/app/archive" element={<ArchiveCenter />} />
    <Route path="/app/reports" element={<AdvancedReports />} />
    <Route path="/app/departments" element={<OrganizationManager />} />
    <Route path="/app/users" element={<UsersPermissions />} />
    <Route path="/app/workflows" element={<WorkflowSettings />} />
    <Route path="/app/activity" element={<AdvancedActivity />} />
    <Route path="/app/security" element={<SecurityPolicies />} />
    <Route path="/app/settings" element={<SystemSettings />} />
    <Route path="/app/profile" element={<ProfilePage />} />
    <Route path="*" element={<div className="empty"><h2>الصفحة غير موجودة</h2></div>} />
  </Routes></AccessGate></Layout>;
}
