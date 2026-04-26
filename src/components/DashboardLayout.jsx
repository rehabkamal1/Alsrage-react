import React, { useState } from 'react';
import Sidebar from './Sidebar';
import ClientsPage from '../pages/ClientsPage';
import SaudiOfficesPage from '../pages/SaudiOfficesPage';
import ExternalOfficesPage from '../pages/ExternalOfficesPage';
import OrdersPage from '../pages/OrdersPage';
import EmployeesPage from '../pages/EmployeesPage';

const DashboardLayout = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('clients');

  const renderContent = () => {
    switch (activeTab) {
      case 'clients':
        return <ClientsPage />;
      case 'saudi-offices':
        return <SaudiOfficesPage />;
      case 'external-offices':
        return <ExternalOfficesPage />;
      case 'employees':
        return <EmployeesPage />;
      case 'orders':
        return <OrdersPage />;
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
      <main className="content-area">
        {renderContent()}
      </main>
    </div>
  );
};

export default DashboardLayout;
