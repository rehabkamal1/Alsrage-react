import React, { lazy, Suspense, useEffect, useState } from "react";
import { Button, Card, Placeholder, Spinner } from "react-bootstrap";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import Sidebar from "./Sidebar";
import ErrorBoundary from "./common/ErrorBoundary";

const ClientsPage = lazy(() => import("../pages/ClientsPage"));
const SaudiOfficesPage = lazy(() => import("../pages/SaudiOfficesPage"));
const ExternalOfficesPage = lazy(() => import("../pages/ExternalOfficesPage"));
const OrdersPage = lazy(() => import("../pages/OrdersPage"));
const CompletedOrdersPage = lazy(() => import("../pages/CompletedOrdersPage"));
const ReachedOrdersPage = lazy(() => import("../pages/ReachedOrdersPage"));
const EmployeesPage = lazy(() => import("../pages/EmployeesPage"));
const DashboardPage = lazy(() => import("../pages/DashboardPage"));
const TrackingPage = lazy(() => import("../pages/TrackingPage"));
const FinancePage = lazy(() => import("../pages/FinancePage"));
const SettingsPage = lazy(() => import("../pages/SettingsPage"));
const MarketingPage = lazy(() => import("../pages/MarketingPage"));
const WhatsAppTemplatePage = lazy(() => import("../pages/WhatsAppTemplatePage"));
const OrderFollowUpReport = lazy(() => import("../pages/reports/OrderFollowUpReport"));
const CompletedOrdersReport = lazy(() => import("../pages/reports/CompletedOrdersReport"));
const OfficesPerformanceReport = lazy(() => import("../pages/reports/OfficesPerformanceReport"));
const FinancialCollectionsReport = lazy(() => import("../pages/reports/FinancialCollectionsReport"));
const EmployeesPerformanceReport = lazy(() => import("../pages/reports/EmployeesPerformanceReport"));

const DashboardLayout = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    NProgress.start();
    const timer = window.setTimeout(() => NProgress.done(), 250);
    return () => window.clearTimeout(timer);
  }, [activeTab]);

  useEffect(() => {
    const updateScrollButton = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", updateScrollButton, { passive: true });
    updateScrollButton();
    return () => window.removeEventListener("scroll", updateScrollButton);
  }, []);

  const isAdmin = user?.role === "admin";
  const hasPermission = (permission) => {
    if (isAdmin) return true;
    return user?.permissions?.includes(permission) || false;
  };

  const renderAccessDenied = () => (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "80vh" }}
    >
      <Card
        className="text-center p-5 shadow-sm border-0 rounded-4"
        style={{ maxWidth: "500px" }}
      >
        <Card.Body>
          <div className="fs-1 mb-3">🚫</div>
          <h3 className="fw-bold mb-3">غير مصرح بالدخول</h3>
          <p className="text-muted mb-0">
            عذراً، ليس لديك الصلاحية الكافية للوصول إلى هذه الصفحة.
          </p>
        </Card.Body>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardPage onNavigate={setActiveTab} />;
      case "clients":
        return hasPermission("view_clients") ? (
          <ClientsPage />
        ) : (
          renderAccessDenied()
        );
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
        return hasPermission("manage_employees") ? (
          <EmployeesPage />
        ) : (
          renderAccessDenied()
        );
      case "orders":
        return hasPermission("view_orders") ? (
          <OrdersPage />
        ) : (
          renderAccessDenied()
        );
      case "completed-orders":
        return hasPermission("view_orders") ? (
          <CompletedOrdersPage />
        ) : (
          renderAccessDenied()
        );
      case "reached-orders":
        return hasPermission("view_orders") ? (
          <ReachedOrdersPage />
        ) : (
          renderAccessDenied()
        );
      case "tracking":
        return hasPermission("view_orders") ? (
          <TrackingPage user={user} />
        ) : (
          renderAccessDenied()
        );
      case "finance":
        return isAdmin ? <FinancePage /> : renderAccessDenied();
      case "settings":
        return isAdmin ? <SettingsPage /> : renderAccessDenied();
      case "marketing":
        return isAdmin ? <MarketingPage /> : renderAccessDenied();
      case "whatsapp-template":
        return isAdmin ? <WhatsAppTemplatePage /> : renderAccessDenied();
      case "report-order-tracking":
        return hasPermission("view_reports") ? (
          <OrderFollowUpReport />
        ) : (
          renderAccessDenied()
        );
      case "report-completed-orders":
        return hasPermission("view_reports") ? (
          <CompletedOrdersReport />
        ) : (
          renderAccessDenied()
        );
      case "report-offices-performance":
        return hasPermission("view_reports") ? (
          <OfficesPerformanceReport />
        ) : (
          renderAccessDenied()
        );
      case "report-financial-collections":
        return hasPermission("view_reports") &&
          (isAdmin || !user?.permissions?.includes("hide_transactions")) ? (
          <FinancialCollectionsReport />
        ) : (
          renderAccessDenied()
        );
      case "report-employees-performance":
        return hasPermission("view_reports") ? (
          <EmployeesPerformanceReport />
        ) : (
          renderAccessDenied()
        );
      default:
        return <DashboardPage />;
    }
  };

  const pageLoader = (
    <div className="page-container py-4" aria-label="جاري تحميل الصفحة">
      <Placeholder as="div" animation="glow" className="mb-4">
        <Placeholder xs={4} size="lg" />
      </Placeholder>
      <Card className="border-0 shadow-sm rounded-4">
        <Card.Body className="p-4">
          <div className="d-flex justify-content-center py-4">
            <Spinner animation="border" role="status" aria-label="جاري التحميل" />
          </div>
          <Placeholder as="div" animation="glow">
            <Placeholder xs={12} className="mb-3" />
            <Placeholder xs={10} className="mb-3" />
            <Placeholder xs={11} />
          </Placeholder>
        </Card.Body>
      </Card>
    </div>
  );

  return (
    <div
      className={`dashboard-container ${isSidebarOpen ? "sidebar-open" : ""}`}
    >
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
          <div style={{ width: "24px" }}></div> {/* Spacer */}
        </div>
        <ErrorBoundary key={activeTab}>
          <Suspense fallback={pageLoader}>{renderContent()}</Suspense>
        </ErrorBoundary>
      </main>
      {showScrollTop && (
        <Button
          variant="primary"
          className="scroll-to-top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="العودة إلى أعلى الصفحة"
          title="العودة إلى أعلى الصفحة"
        >
          <i className="fa-solid fa-arrow-up" />
        </Button>
      )}

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
