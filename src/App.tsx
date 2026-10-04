import { Navigate, Route, Routes } from "react-router"
import { AnimalsPage } from "./animals/pages/AnimalsPage"
import { AuthForm } from "./auth/pages/AuthPage"
import { CampaignsPage } from "./campaigns/pages/CampaignsPage"
import { DashboardPage } from "./dashboard/pages/DashboardPage"
import { InventoryPage } from "./inventory/pages/InventoryPage"
import { AlertsPage } from "./alerts/pages/AlertsPage"
import { MonitoringPage } from "./monitoring/pages/MonitoringPage"
import { AccessRoute } from "./shared/pages/AccessRoute"
import { PrivateRoute } from "./shared/pages/PrivateRoute"
import { PlusRoute } from "./shared/pages/PlusRoute"
import { StablesPage } from "./stables/pages/StablesPage"
import { StaffPage } from "./staff/pages/StaffPage"
import { SubscriptionManagementPage} from "./subscription/pages/SubscriptionManagementPage"
import { MockCheckoutPage } from "./subscription/pages/MockCheckoutPage"

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/auth" />} />
      <Route path="/auth" element={<AuthForm />} />
      <Route path="/checkout" element={<MockCheckoutPage />} />

      <Route element={<PrivateRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/animals" element={<AnimalsPage />} />
        <Route path="/stables" element={<StablesPage />} />
        <Route path="/campaigns" element={<CampaignsPage />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/alerts" element={<AlertsPage />} />

        <Route element={<AccessRoute permission="manageStaff" />}>
          <Route path="/staff" element={<StaffPage />} />
        </Route>

        <Route element={<PlusRoute />}>
          <Route path="/monitoring" element={<MonitoringPage />} />
        </Route>

        <Route element={<AccessRoute permission="manageSubscription" />}>
          <Route path="/subscription-management" element={<SubscriptionManagementPage />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
