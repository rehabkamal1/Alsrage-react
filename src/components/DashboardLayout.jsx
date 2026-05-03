import React, { useState } from "react";
import { Button } from "react-bootstrap";
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

const DashboardLayout = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardPage />;
      case "clients":
        return <ClientsPage />;
      case "saudi-offices":
        return <SaudiOfficesPage />;
      case "external-offices":
        return <ExternalOfficesPage />;
      case "employees":
        return <EmployeesPage />;
      case "orders":
        return <OrdersPage />;
      case "completed-orders":
        return <CompletedOrdersPage />;
      case "tracking":
        return <TrackingPage />;
      case "finance":
        return <FinancePage />;
      case "settings":
        return <SettingsPage />;
      case "marketing":
        return <MarketingPage />;
      default:
        return <ClientsPage />;
    }
  };

  return (
    <div className={`dashboard-container ${isSidebarOpen ? "sidebar-open" : ""}`}>
      <Sidebar
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
