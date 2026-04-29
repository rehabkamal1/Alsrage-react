import React, { useState, useEffect } from "react";
import { Container, Card, Button } from "react-bootstrap";
import {
  getOrders,
  createOrder,
  updateOrder,
  deleteOrder,
  getClients,
  getSaudiOffices,
  getExternalOffices,
  getEmployees,
  searchClients,
  quickCreateClient,
} from "../services/apiService";
import { showSuccess, showError, showConfirm } from "../utils/swalHelper";
import OrderFormModal from "../components/Order/OrderFormModal";
import OrderTable from "../components/Order/OrderTable";
import OrderSearchBar from "../components/Order/OrderSearchBar";
import TableSkeleton from "../components/common/TableSkeleton";
import PaginationComponent from "../components/common/Pagination";
import { exportToExcel } from "../utils/excelHelper";

const CompletedOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [clients, setClients] = useState([]);
  const [saudiOffices, setSaudiOffices] = useState([]);
  const [externalOffices, setExternalOffices] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [submitError, setSubmitError] = useState(null);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    // Filter completed orders first
    const completedOrders = orders.filter(
      (order) => order.status === "مكتمل" || order.status === "completed"
    );

    // Then apply search filter
    if (searchQuery.trim()) {
      const filtered = completedOrders.filter((order) => {
        const orderIdMatch = order.id?.toString().includes(searchQuery);
        const clientNameMatch = order.client?.name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());
        const clientPhoneMatch = order.client?.phone?.includes(searchQuery);
        const visaNumberMatch = order.visa_number
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());
        const contractNumberMatch = order.musaned_contract_number
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());
        return (
          orderIdMatch ||
          clientNameMatch ||
          clientPhoneMatch ||
          visaNumberMatch ||
          contractNumberMatch
        );
      });
      setFilteredOrders(filtered);
    } else {
      setFilteredOrders(completedOrders);
    }
    setCurrentPage(1);
  }, [searchQuery, orders]);

  const fetchAllData = async () => {
    setInitialLoading(true);
    try {
      const [ordersRes, clientsRes, saudiRes, externalRes, employeesRes] =
        await Promise.all([
          getOrders(),
          getClients(),
          getSaudiOffices(),
          getExternalOffices(),
          getEmployees(),
        ]);
      setOrders(ordersRes.data?.data || []);
      setClients(clientsRes.data?.data || []);
      setSaudiOffices(saudiRes.data?.data || []);
      setExternalOffices(externalRes.data?.data || []);
      setEmployees(employeesRes.data?.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const handleEditOrder = (order) => {
    setEditingOrder(order);
    setSubmitError(null);
    setShowModal(true);
  };

  const handleSubmit = async (formData) => {
    setLoading(true);
    setSubmitError(null);
    try {
      if (editingOrder) {
        await updateOrder(editingOrder.id, formData);
        showSuccess("تم التحديث!", "تم تحديث الطلب بنجاح");
      }
      setShowModal(false);
      setEditingOrder(null);
      fetchAllData();
    } catch (error) {
      const errorData = error.response?.data;
      setSubmitError(errorData);
      showError("خطأ!", errorData?.message || "حدث خطأ أثناء العملية");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async (id) => {
    const result = await showConfirm("هل أنت متأكد؟", "سيتم حذف الطلب نهائياً");
    if (result.isConfirmed) {
      setLoading(true);
      try {
        await deleteOrder(id);
        showSuccess("تم الحذف", "تم حذف الطلب بنجاح");
        fetchAllData();
      } catch (error) {
        showError("خطأ", "حدث خطأ أثناء الحذف");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleExport = () => {
    const columns = [
      { header: "رقم الطلب", key: "id" },
      { header: "العميل", format: (order) => order.client?.name || "-" },
      { header: "رقم مساند", key: "musaned_contract_number" },
      {
        header: "المكتب السعودي",
        format: (order) => order.saudiOffice?.name || "-",
      },
      {
        header: "المكتب الخارجي",
        format: (order) => order.externalOffice?.name || "-",
      },
      { header: "المهنة", key: "profession" },
      { header: "الجنسية", key: "nationality" },
      { header: "الديانة", key: "religion" },
      { header: "رقم التأشيرة", key: "visa_number" },
      { header: "رقم الهوية", key: "id_number" },
      { header: "اسم العامل", key: "worker_name" },
      { header: "المبلغ", key: "amount" },
      { header: "الضريبة", key: "tax" },
      { header: "الإجمالي", key: "total" },
      { header: "الحالة", key: "status" },
    ];
    exportToExcel(filteredOrders, columns, "الطلبات_المكتملة.xlsx");
  };

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedOrders = filteredOrders.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  if (initialLoading) {
    return (
      <div
        style={{
          backgroundColor: "#f5f7fa",
          minHeight: "100vh",
          padding: "24px",
        }}
      >
        <Container fluid>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1 className="h3 mb-0 fw-bold">الطلبات المكتملة</h1>
          </div>
          <Card className="shadow-sm border-0 rounded-4">
            <Card.Body className="p-0">
              <TableSkeleton rows={5} columns={8} />
            </Card.Body>
          </Card>
        </Container>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: "#f5f7fa",
        minHeight: "100vh",
        padding: "24px",
      }}
    >
      <Container fluid>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="h3 mb-0 fw-bold">
            الطلبات المكتملة ({filteredOrders.length})
          </h1>
          <Button
            variant="outline-success"
            onClick={handleExport}
            disabled={filteredOrders.length === 0}
          >
            📊 تصدير إكسيل
          </Button>
        </div>

        <OrderSearchBar
          searchQuery={searchQuery}
          onSearch={handleSearch}
          onClear={handleClearSearch}
          loading={loading}
        />

        <Card className="shadow-sm border-0 rounded-4">
          <Card.Body className="p-0">
            {loading ? (
              <div className="text-center py-5">
                <TableSkeleton rows={3} columns={8} />
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <p>لا توجد طلبات مكتملة</p>
              </div>
            ) : (
              <>
                <OrderTable
                  orders={displayedOrders}
                  onEdit={handleEditOrder}
                  onDelete={handleDeleteOrder}
                />
                {totalPages > 1 && (
                  <PaginationComponent
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                )}
              </>
            )}
          </Card.Body>
        </Card>
      </Container>

      <OrderFormModal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setEditingOrder(null);
          setSubmitError(null);
        }}
        onSubmit={handleSubmit}
        initialData={editingOrder}
        clients={clients}
        saudiOffices={saudiOffices}
        externalOffices={externalOffices}
        employees={employees}
        searchClients={searchClients}
        quickCreateClient={quickCreateClient}
        loading={loading}
        isEdit={!!editingOrder}
        error={submitError}
      />
    </div>
  );
};

export default CompletedOrdersPage;
