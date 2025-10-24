import { Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";

// الصيدلي
import { PharmacistHome } from "./pages/pharmacist";
import { POSPage } from "./components/pharmacist/pos";
import Inventory from "./pages/pharmacist/Inventory/Inventory";
import Suppliers from "./pages/pharmacist/Suppliers/Suppliers";
import { Users } from "./pages/pharmacist/users/Users";
import DashboardToday from "./pages/pharmacist/dashboard/DashboardToday";
import DashboardBranches from "./pages/pharmacist/dashboard/DashboardBranches";
import DashboardAnalytics from "./pages/pharmacist/dashboard/DashboardAnalytics";
import POSInvoicesPage from "./pages/pharmacist/POS/POSInvoices";
import POSDraftsPage from "./pages/pharmacist/POS/POSDrafts";
import POSPostedPage from "./pages/pharmacist/POS/POSPosted";
import POSReceiptsPage from "./pages/pharmacist/POS/POSReceipts";
import POSReportsPage from "./pages/pharmacist/POS/POSReports";
import POSShiftsPage from "./pages/pharmacist/POS/POSShifts";
import AccountingDepartment from "./pages/pharmacist/POS/AccountingDepartment";
import { DashboardSel } from "./pages/pharmacist/dashboard/DashboardSel";
import InventoryStock from "./pages/pharmacist/Inventory/InventoryStock";
import InventoryAdjustments from "./pages/pharmacist/Inventory/InventoryAdjustments";
import InventoryMovements from "./pages/pharmacist/Inventory/InventoryMovements";
import SuppliersPurchaseOrders from "./pages/pharmacist/Suppliers/SuppliersPurchaseOrders";
import SuppliersFinance from "./pages/pharmacist/Suppliers/SuppliersFinance";
import UsersList from "./pages/pharmacist/users/UsersList";
import UsersRoles from "./pages/pharmacist/users/UsersRoles";
import UsersAudit from "./pages/pharmacist/users/UsersAudit";
import Reports from "./pages/pharmacist/Reports/Reports";

// الطبيب
import {
  DoctorLayout,
  DoctorDashboard,
  DoctorConditions,
  DoctorPrescription,
  DoctorPrescriptions,
  DoctorVisits,
  DoctorLabs,
  DoctorNotifications,
} from "./pages/doctors";

// المريض
import {
  PatientLayout,
  PatientHome,
  PatientMedicalReports,
  PatientOrders,
  PatientMedicalRecords,
  PatientPayments,
  PatientProfile,
  PatientAddresses,
  PatientInsurance,
  PatientPharmacies,
  PatientSettings,
} from "./pages/patient";

// تسجيل الدخول
import { LoginSelect } from "./pages/loginPages/LoginSelect";
import { LoginDoctor } from "./pages/loginPages/LoginDoctor";
import LoginPharmacist from "./pages/loginPages/LoginPharmacist";
import { LoginPatient } from "./pages/loginPages/LoginPatient";
import { VerifyCode } from "./pages/VerifyCode";
import RegisterPharmacist from "./pages/loginPages/RegisterPharmacist";
import PharmacistProfile from "./pages/pharmacist/Profile";

export default function AppRoutes() {
  return (
    <Routes>
      {/* تسجيل الدخول */}
      <Route path="/login" element={<LoginSelect />} />
      <Route path="/login/doctor" element={<LoginDoctor />} />
      <Route path="/login/pharmacist" element={<LoginPharmacist />} />
      <Route path="/register/pharmacist" element={<RegisterPharmacist />} />
      <Route path="/login/patient" element={<LoginPatient />} />
      <Route path="/verify" element={<VerifyCode />} />

      {/* مخطط عام */}
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />

        {/* الصيدلي */}
        <Route path="/dashboard" element={<PharmacistHome />} />
        <Route path="/dashboard/today" element={<DashboardToday />} />
        <Route path="/dashboard/branches" element={<DashboardBranches />} />
        <Route path="/dashboard/analytics" element={<DashboardAnalytics />} />
        <Route path="/pos" element={<POSPage />} />
        <Route path="/pos/dashboard/dashboardsel" element={<DashboardSel />} />
        <Route path="/pos/AccountingDepartment" element={<AccountingDepartment />} />
        <Route path="/pos/invoices" element={<POSInvoicesPage />} />
        <Route path="/pos/drafts" element={<POSDraftsPage invoices={[]} onViewReceipt={() => {}} />} />
        <Route path="/pos/posted" element={<POSPostedPage invoices={[]} onViewReceipt={() => {}} />} />
        <Route path="/pos/receipts" element={<POSReceiptsPage receipt={null} />} />
        <Route path="/pos/reports" element={<POSReportsPage invoices={[]} payments={[]} kpis={{ totalSales: 0, draftCount: 0, postedCount: 0, avgSale: 0 }} />} />
        <Route path="/pos/shifts" element={<POSShiftsPage shifts={[]} />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/inventory/stock" element={<InventoryStock />} />
        <Route path="/inventory/adjustments" element={<InventoryAdjustments />} />
        <Route path="/inventory/movements" element={<InventoryMovements />} />
        <Route path="/suppliers" element={<Suppliers />} />
        <Route path="/suppliers/purchase-orders" element={<SuppliersPurchaseOrders />} />
        <Route path="/suppliers/finance" element={<SuppliersFinance />} />
        <Route path="/users" element={<Users />} />
        <Route path="/users/list" element={<UsersList />} />
        <Route path="/users/roles" element={<UsersRoles />} />
        <Route path="/users/audit" element={<UsersAudit />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/profile" element={<PharmacistProfile />} />


        {/* الطبيب */}
        <Route path="/doctor" element={<DoctorLayout />}>
          <Route index element={<DoctorDashboard />} />
          <Route path="conditions" element={<DoctorConditions />} />
          <Route path="prescribe" element={<DoctorPrescription />} />
          <Route path="prescriptions" element={<DoctorPrescriptions />} />
          <Route path="visits" element={<DoctorVisits />} />
          <Route path="labs" element={<DoctorLabs />} />
          <Route path="notifications" element={<DoctorNotifications />} />
        </Route>

        {/* المريض */}
        <Route path="/patient" element={<PatientLayout />}>
          <Route index element={<PatientHome />} />
          <Route path="prescriptions" element={<PatientMedicalReports />} />
          <Route path="orders" element={<PatientOrders />} />
          <Route path="invoices" element={<PatientMedicalRecords />} />
          <Route path="payments" element={<PatientPayments />} />
          <Route path="profile" element={<PatientProfile />} />
          <Route path="addresses" element={<PatientAddresses />} />
          <Route path="insurance" element={<PatientInsurance />} />
          <Route path="pharmacies" element={<PatientPharmacies />} />
          <Route path="settings" element={<PatientSettings />} />
        </Route>
      </Route>
    </Routes>
  );
}

