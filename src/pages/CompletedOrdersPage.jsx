import React, { useState, useEffect } from "react";
import { Container, Card, Button } from "react-bootstrap";
import {
  getOrders,
  updateOrder,
  deleteOrder,
  getSaudiOffices,
  getExternalOffices,
  getEmployees,
  searchClients,
  quickCreateClient,
  getSettingsOrderStatuses,
} from "../services/apiService";
import { showSuccess, showError, showConfirm } from "../utils/swalHelper";
import OrderFormModal from "../components/Order/OrderFormModal";
import OrderTable from "../components/Order/OrderTable";
import OrderSearchBar from "../components/Order/OrderSearchBar";
import TableSkeleton from "../components/common/TableSkeleton";
import PaginationComponent from "../components/common/Pagination";
import { exportToExcel } from "../utils/excelHelper";
import { exportToPDF } from "../utils/pdfHelper";

const CompletedOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [orderStatuses, setOrderStatuses] = useState([]);
  const [saudiOffices, setSaudiOffices] = useState([]);
  const [externalOffices, setExternalOffices] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    status: "completed",
    sort_by: "id",
    sort_dir: "desc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [currentPage, filters, searchQuery]);

  const fetchInitialData = async () => {
    try {
      const [saudiRes, externalRes, employeesRes, statusRes] = await Promise.all([
        getSaudiOffices(),
        getExternalOffices(),
        getEmployees(),
        getSettingsOrderStatuses(),
      ]);
      setSaudiOffices(saudiRes.data?.data || []);
      setExternalOffices(externalRes.data?.data || []);
      setEmployees(employeesRes.data?.data || []);
      setOrderStatuses(statusRes.data?.data || []);
    } catch (error) {
      console.error("Error fetching initial data:", error);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await getOrders({
        page: currentPage,
        search: searchQuery,
        ...filters,
        per_page: 15,
      });
      setOrders(response.data.data);
      setTotalPages(response.data.meta?.last_page || 1);
      setTotalOrders(response.data.meta?.total || 0);
    } catch (error) {
      console.error("Error fetching orders:", error);
      showError("خطأ", "حدث خطأ أثناء تحميل الطلبات");
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
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
      fetchOrders();
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
        fetchOrders();
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
      { header: "صاحب التأشيرة", key: "visa_holder_name" },
      { header: "رقم التأشيرة", key: "visa_number" },
      { header: "رقم الهوية", key: "id_number" },
      { header: "رقم عقد مساند", key: "musaned_contract_number" },
      { header: "إجمالي السعر", key: "total_price" },
      { header: "الرصيد المتبقي", key: "price_difference" },
      { header: "الحالة", format: (o) => orderStatuses.find(s => (s.key || s.id) === o.status)?.label || o.status },
      { header: "التاريخ", format: (o) => new Date(o.created_at).toLocaleDateString("ar-SA") },
    ];
    exportToExcel(orders, columns, "الطلبات_المكتملة.xlsx");
  };

  const handleExportPDF = () => {
    const columns = [
      { header: "رقم الطلب", key: "id" },
      { header: "صاحب التأشيرة", key: "visa_holder_name" },
      { header: "رقم التأشيرة", key: "visa_number" },
      { header: "رقم الهوية", key: "id_number" },
      { header: "رقم عقد مساند", key: "musaned_contract_number" },
      { header: "إجمالي السعر", key: "total_price" },
      { header: "الرصيد المتبقي", key: "price_difference" },
      { header: "الحالة", format: (o) => orderStatuses.find(s => (s.key || s.id) === o.status)?.label || o.status },
      { header: "التاريخ", format: (o) => new Date(o.created_at).toLocaleDateString("ar-SA") },
    ];
    exportToPDF(orders, columns, "الطلبات_المكتملة.pdf");
  };

  if (initialLoading) {
    return (
      <div className="page-container">
        <Container fluid>
          <TableSkeleton rows={5} columns={8} />
        </Container>
      </div>
    );
  }

  return (
    <div className="page-container">
      <Container fluid>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="h3 mb-1 fw-bold">✅ الطلبات المكتملة</h1>
            <p className="text-muted small mb-0">إجمالي الطلبات المكتملة: {totalOrders}</p>
          </div>
          <div className="d-flex gap-2">
            <Button
              variant="light"
              onClick={handleExport}
              disabled={orders.length === 0}
              className="d-flex align-items-center gap-2 rounded-3 border shadow-sm px-3 py-2 text-success fw-semibold"
            >
              <i className="fa-solid fa-file-excel fs-5"></i>
              <span>إكسيل</span>
            </Button>
            <Button
              variant="light"
              onClick={handleExportPDF}
              disabled={orders.length === 0}
              className="d-flex align-items-center gap-2 rounded-3 border shadow-sm px-3 py-2 text-danger fw-semibold"
            >
              <i className="fa-solid fa-file-pdf fs-5"></i>
              <span>بي دي اف</span>
            </Button>
          </div>
        </div>

        <OrderSearchBar
          searchQuery={searchQuery}
          onSearch={handleSearch}
          onClear={() => setSearchQuery("")}
          loading={loading}
          filters={filters}
          onFilterChange={handleFilterChange}
          statusOptions={orderStatuses.filter(s => s.key === 'completed')}
          isCompletedPage={true}
        />

        <Card className="shadow-sm border-0 rounded-4 overflow-hidden">
          <Card.Body className="p-0">
            {loading && orders.length === 0 ? (
              <TableSkeleton rows={5} columns={8} />
            ) : orders.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <div className="mb-3">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                </div>
                <h5>لا توجد طلبات مكتملة</h5>
                <p className="small">جرب تغيير معايير البحث أو تصفية الطلبات</p>
              </div>
            ) : (
              <>
                <OrderTable
                  orders={orders}
                  onEdit={handleEditOrder}
                  onDelete={handleDeleteOrder}
                  statusOptions={orderStatuses}
                />
                {totalPages > 1 && (
                  <div className="p-3 border-top bg-light bg-opacity-50">
                    <PaginationComponent
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </div>
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
        saudiOffices={saudiOffices}
        externalOffices={externalOffices}
        employees={employees}
        searchClients={searchClients}
        quickCreateClient={quickCreateClient}
        statusOptions={orderStatuses}
        loading={loading}
        isEdit={!!editingOrder}
        error={submitError}
      />
    </div>
  );
};

export default CompletedOrdersPage;
