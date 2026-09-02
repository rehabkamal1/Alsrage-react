import React, { useState } from "react";
import { Button, Card } from "react-bootstrap";
import Sidebar from "./Sidebar";
import ClientsPage from "../pages/ClientsPage";
import SaudiOfficesPage from "../pages/SaudiOfficesPage";
import ExternalOfficesPage from "../pages/ExternalOfficesPage";
import OrdersPage from "../pages/OrdersPage";
import CompletedOrdersPage from "../pages/CompletedOrdersPage";
import EmployeesPage from "../pages/EmployeesPage";
import DashboardPage from "../pages/DashboardPage";
import TrackingPage from "../pages/TrackingPage";
import FinancePage from "../pages/FinancePage";
import SettingsPage from "../pages/SettingsPage";
import MarketingPage from "../pages/MarketingPage";
import WhatsAppTemplatePage from "../pages/WhatsAppTemplatePage";
import OrderFollowUpReport from "../pages/reports/OrderFollowUpReport";
import CompletedOrdersReport from "../pages/reports/CompletedOrdersReport";
import OfficesPerformanceReport from "../pages/reports/OfficesPerformanceReport";
import FinancialCollectionsReport from "../pages/reports/FinancialCollectionsReport";
import EmployeesPerformanceReport from "../pages/reports/EmployeesPerformanceReport";

const DashboardLayout = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isAdmin = user?.role === "admin";
  const hasPermission = (permission) => {
    if (isAdmin) return true;
    return user?.permissions?.includes(permission) || false;
  };

  const renderAccessDenied = () => (
    <div className="d-flex align-items-center justify-content-center" style={{ minHeight: "80vh" }}>
      <Card className="text-center p-5 shadow-sm border-0 rounded-4" style={{ maxWidth: "500px" }}>
        <Card.Body>
          <div className="fs-1 mb-3">🚫</div>
          <h3 className="fw-bold mb-3">غير مصرح بالدخول</h3>
          <p className="text-muted mb-0">عذراً، ليس لديك الصلاحية الكافية للوصول إلى هذه الصفحة.</p>
        </Card.Body>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardPage />;
      case "clients":
        return hasPermission("view_clients") ? <ClientsPage /> : renderAccessDenied();
      case "saudi-offices":
        return hasPermission("view_saudi_offices") ? (
          <SaudiOfficesPage user={user} />
        ) : (
          renderAccessDenied()
        );
      case "external-offices":
        return hasPermission("view_external_offices") ? (
          <ExternalOfficesPage user={user} />
        ) : (
          renderAccessDenied()
        );
      case "employees":
        return hasPermission("manage_employees") ? <EmployeesPage /> : renderAccessDenied();
      case "orders":
        return hasPermission("view_orders") ? <OrdersPage /> : renderAccessDenied();
      case "completed-orders":
        return hasPermission("view_orders") ? <CompletedOrdersPage /> : renderAccessDenied();
      case "tracking":
        return hasPermission("view_orders") ? <TrackingPage /> : renderAccessDenied();
      case "finance":
        return isAdmin ? <FinancePage /> : renderAccessDenied();
      case "settings":
        return isAdmin ? <SettingsPage /> : renderAccessDenied();
      case "marketing":
        return isAdmin ? <MarketingPage /> : renderAccessDenied();
      case "whatsapp-template":
        return isAdmin ? <WhatsAppTemplatePage /> : renderAccessDenied();
      case "report-order-tracking":
        return hasPermission("view_reports") ? <OrderFollowUpReport /> : renderAccessDenied();
      case "report-completed-orders":
        return hasPermission("view_reports") ? <CompletedOrdersReport /> : renderAccessDenied();
      case "report-offices-performance":
        return hasPermission("view_reports") ? <OfficesPerformanceReport /> : renderAccessDenied();
      case "report-financial-collections":
        return hasPermission("view_reports") ? <FinancialCollectionsReport /> : renderAccessDenied();
      case "report-employees-performance":
        return hasPermission("view_reports") ? <EmployeesPerformanceReport /> : renderAccessDenied();
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className={`dashboard-container ${isSidebarOpen ? "sidebar-open" : ""}`}>
      <Sidebar
        user={user}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setIsSidebarOpen(false); // Close on mobile after selection
        }}
        onLogout={onLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <main className="content-area">
        <div className="mobile-top-bar d-lg-none shadow-sm mb-3">
          <Button 
            variant="link" 
            className="text-dark p-0" 
            onClick={() => setIsSidebarOpen(true)}
          >
            <i className="fa-solid fa-bars fs-4"></i>
          </Button>
          <div className="fw-bold text-primary fs-5">السراج</div>
          <div style={{ width: '24px' }}></div> {/* Spacer */}
        </div>
        {renderContent()}
      </main>
      
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="sidebar-overlay d-lg-none" 
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default DashboardLayout;

