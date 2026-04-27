import React, { useState } from "react";
import Sidebar from "./Sidebar";
import ClientsPage from "../pages/ClientsPage";
import SaudiOfficesPage from "../pages/SaudiOfficesPage";
import ExternalOfficesPage from "../pages/ExternalOfficesPage";
import OrdersPage from "../pages/OrdersPage";
import EmployeesPage from "../pages/EmployeesPage";
import DashboardPage from "../pages/DashboardPage";
import TrackingPage from "../pages/TrackingPage";
import FinancePage from "../pages/FinancePage";

const DashboardLayout = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState("dashboard");

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
      case "tracking":
        return <TrackingPage />;
      case "finance":
        return <FinancePage />;
      default:
        return <ClientsPage />;
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={onLogout}
      />
      <main className="content-area">{renderContent()}</main>
    </div>
  );
};

export default DashboardLayout;
