import React, { useState, useEffect } from "react";
import { Container, Card, Button } from "react-bootstrap";
import RefreshButton from "../components/common/RefreshButton";
import DateFilterBar from "../components/common/DateFilterBar";
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
  getSettingsOrderProcessStatuses,
  getSettingsServiceTypes,
  fetchAllPages,
} from "../services/apiService";
import { showSuccess, showError, showConfirm } from "../utils/swalHelper";
import OrderFormModal from "../components/Order/OrderFormModal";
import OrderTable from "../components/Order/OrderTable";
import OrderSearchBar from "../components/Order/OrderSearchBar";
import TableSkeleton from "../components/common/TableSkeleton";
import PaginationComponent from "../components/common/Pagination";
import { exportToExcel, normalizePhoneValue } from "../utils/excelHelper";
import { exportToPDF } from "../utils/pdfHelper";
import { showWhatsAppNotificationModal } from "../utils/whatsappHelper";
import { useDebounce } from "../hooks/useDebounce";

const ReachedOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [orderStatuses, setOrderStatuses] = useState([]);
  const [orderProcessStatuses, setOrderProcessStatuses] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [saudiOffices, setSaudiOffices] = useState([]);
  const [externalOffices, setExternalOffices] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 400);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [filters, setFilters] = useState({
    sort_by: "id",
    sort_dir: "desc",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedOrders = orders.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [filters, debouncedSearch, fromDate, toDate]);

  useEffect(() => {
    setTotalPages(Math.ceil(orders.length / itemsPerPage));
  }, [orders, itemsPerPage]);

  const fetchInitialData = async () => {
    try {
      const [
        saudiRes,
        externalRes,
        employeesRes,
        statusRes,
        orderProcessStatusesRes,
        serviceTypesRes,
      ] = await Promise.all([
        getSaudiOffices({ all: 1, per_page: 100 }),
        getExternalOffices({ all: 1, per_page: 100 }),
        fetchAllPages(getEmployees),
        getSettingsOrderStatuses(),
        getSettingsOrderProcessStatuses(),
        getSettingsServiceTypes(),
      ]);

      const saudiList = Array.isArray(saudiRes.data?.data)
        ? saudiRes.data.data
        : Array.isArray(saudiRes.data)
          ? saudiRes.data
          : [];
      setSaudiOffices(saudiList);

      const externalList = Array.isArray(externalRes.data?.data)
        ? externalRes.data.data
        : Array.isArray(externalRes.data)
          ? externalRes.data
          : [];
      setExternalOffices(externalList);

      setEmployees(employeesRes);
      setOrderStatuses(statusRes.data?.data || []);

      const activeOrderStatuses = (
        orderProcessStatusesRes.data?.data || []
      ).filter((status) => status.is_active);

      setOrderProcessStatuses(activeOrderStatuses);

      setServiceTypes(serviceTypesRes.data?.data || []);
    } catch (error) {
      console.error("Error fetching reached orders settings:", error);
      showError(
        "خطأ",
        error.response?.data?.message || "حدث خطأ أثناء تحميل إعدادات الطلبات",
      );
      setInitialLoading(false);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {
        search: debouncedSearch,
        ...filters,
        tracking_status: "reviewed",
      };
      if (fromDate) params.from_date = fromDate;
      if (toDate) params.to_date = toDate;

      const allOrders = await fetchAllPages(getOrders, params);
      setOrders(allOrders);
      setTotalPages(Math.ceil(allOrders.length / itemsPerPage));
      setTotalOrders(allOrders.length);
    } catch (error) {
      console.error("Error fetching reached orders:", error);
      showError(
        "خطأ",
        error.response?.data?.message || "حدث خطأ أثناء تحميل الطلبات",
      );
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  const handleDateFilterChange = ({ fromDate, toDate, preset }) => {
    setFromDate(fromDate);
    setToDate(toDate);
    setCurrentPage(1);
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

  const handleWhatsAppNotification = (order) => {
    showWhatsAppNotificationModal({
      order,
      orderStatuses,
      saudiOffices,
      externalOffices,
    });
  };

  const handleStatusChange = async (order, newStatus) => {
    setLoading(true);
    try {
      const response = await updateOrder(order.id, { status: newStatus });
      showSuccess("تم تحديث الحالة!", "تم تغيير حالة سداد مساند بنجاح");
      handleWhatsAppNotification(
        response.data?.data || { ...order, status: newStatus },
      );
      fetchOrders();
    } catch (error) {
      console.error("Error updating Musaned payment status:", error);
      showError(
        "خطأ!",
        error.response?.data?.message || "حدث خطأ أثناء تحديث حالة سداد مساند",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOrderStatusChange = async (order, newStatus) => {
    setLoading(true);
    try {
      await updateOrder(order.id, { order_status: newStatus || null });
      showSuccess("تم تحديث الحالة!", "تم تغيير حالة الطلب بنجاح");
      fetchOrders();
    } catch (error) {
      console.error("Error updating order status:", error);
      showError(
        "خطأ!",
        error.response?.data?.message || "حدث خطأ أثناء تحديث حالة الطلب",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    setLoading(true);
    setSubmitError(null);
    try {
      if (editingOrder) {
        const response = await updateOrder(editingOrder.id, formData);
        showSuccess("تم التحديث!", "تم تحديث الطلب بنجاح");
        handleWhatsAppNotification(response.data?.data || editingOrder);
      }
      setShowModal(false);
      setEditingOrder(null);
      fetchOrders();
    } catch (error) {
      const errorData = error.response?.data;
      console.error("Error submitting order:", error);
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
        console.error("Error deleting order:", error);
        showError("خطأ", "حدث خطأ أثناء الحذف");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleExport = () => {
    const columns = [
      { header: "#", key: "id" },
      { header: "المكتب السعودي", format: (order) => order.saudi_office?.name || "-" },
      {
        header: "المندوب",
        width: 30,
        wrapText: false,
        format: (order) => {
          const phone = normalizePhoneValue(order.client?.phone);
          return [order.client?.name, phone !== "-" ? phone : null]
            .filter(Boolean)
            .join(" - ") || "-";
        },
      },
      { header: "الموظف", format: (order) => order.employee?.name || "-" },
      { header: "صاحب التأشيرة", key: "visa_holder_name" },
      { header: "هاتف صاحب التأشيرة", key: "visa_holder_phone" },
      { header: "رقم التأشيرة", key: "visa_number" },
      { header: "نوع الخدمة", key: "service_type" },
      { header: "رقم عقد مساند", key: "musaned_contract_number" },
      {
        header: "المرفقات",
        format: (order) => order.attachments?.length ? `${order.attachments.length} مرفقات` : "-",
      },
      { header: "إجمالي السعر (ر.س)", key: "total_price" },
      { header: "سداد مساند (ر.س)", key: "musaned_paid" },
      { header: "الرصيد المتبقي (ر.س)", key: "price_difference" },
      {
        header: "حالة الطلب",
        format: (o) =>
          orderProcessStatuses.find(
            (status) => (status.key || status.id) === o.order_status,
          )?.label ||
          o.order_status ||
          "-",
      },
      {
        header: "حالة سداد مساند",
        format: (o) =>
          orderStatuses.find((s) => (s.key || s.id) === o.status)?.label ||
          o.status ||
          "-",
      },
      { header: "التاريخ", key: "created_at" },
    ];
    exportToExcel(orders, columns, "تم_الوصول.xlsx");
  };

  const handleExportPDF = () => {
    const columns = [
      { header: "#", key: "id" },
      { header: "المكتب السعودي", format: (order) => order.saudi_office?.name || "-" },
      {
        header: "المندوب",
        format: (order) => [order.client?.name, order.client?.phone].filter(Boolean).join(" - ") || "-",
      },
      { header: "الموظف", format: (order) => order.employee?.name || "-" },
      { header: "صاحب التأشيرة", key: "visa_holder_name" },
      { header: "هاتف صاحب التأشيرة", key: "visa_holder_phone" },
      { header: "رقم التأشيرة", key: "visa_number" },
      { header: "نوع الخدمة", key: "service_type" },
      { header: "رقم عقد مساند", key: "musaned_contract_number" },
      {
        header: "المرفقات",
        format: (order) => order.attachments?.length ? `${order.attachments.length} مرفقات` : "-",
      },
      { header: "إجمالي السعر (ر.س)", key: "total_price" },
      { header: "سداد مساند (ر.س)", key: "musaned_paid" },
      { header: "الرصيد المتبقي (ر.س)", key: "price_difference" },
      {
        header: "حالة الطلب",
        format: (o) =>
          orderProcessStatuses.find(
            (status) => (status.key || status.id) === o.order_status,
          )?.label ||
          o.order_status ||
          "-",
      },
      {
        header: "حالة سداد مساند",
        format: (o) =>
          orderStatuses.find((s) => (s.key || s.id) === o.status)?.label ||
          o.status ||
          "-",
      },
      { header: "التاريخ", key: "created_at" },
    ];
    exportToPDF(orders, columns, "تم_الوصول.pdf");
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
        <div
          className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4"
          style={{ minWidth: 0 }}
        >
          <div className="w-100" style={{ minWidth: 0 }}>
            <h1 className="h3 mb-1 fw-bold">📥 تم الوصول</h1>
            <p className="text-muted small mb-0">
              إجمالي الطلبات التي تم الوصول إليها: {totalOrders}
            </p>
          </div>
          <div
            className="d-flex flex-wrap gap-2 justify-content-md-end w-100 w-md-auto"
            style={{ minWidth: 0, flex: "1 1 auto" }}
          >
            <RefreshButton
              onClick={fetchOrders}
              loading={loading}
              className="border shadow-sm text-primary fw-semibold"
            />
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

        <DateFilterBar
          onFilterChange={handleDateFilterChange}
          initialFromDate={fromDate}
          initialToDate={toDate}
          initialPreset="all"
          size="md"
        />

        <OrderSearchBar
          searchQuery={searchQuery}
          onSearch={handleSearch}
          onClear={() => {
            setSearchQuery("");
            setFromDate("");
            setToDate("");
          }}
          loading={loading}
          filters={filters}
          onFilterChange={handleFilterChange}
          statusOptions={orderStatuses}
          orderStatusOptions={orderProcessStatuses}
          isCompletedPage={true}
        />

        <Card className="shadow-sm border-0 rounded-4 overflow-hidden">
          <Card.Body className="p-0">
            {loading && orders.length === 0 ? (
              <TableSkeleton rows={5} columns={8} />
            ) : orders.length === 0 ? (
              <div className="text-center py-5 text-muted">
                <div className="mb-3">
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                </div>
                <h5>لا توجد طلبات تم الوصول إليها</h5>
                <p className="small">جرب تغيير معايير البحث أو تصفية الطلبات</p>
              </div>
            ) : (
              <>
                <OrderTable
                  orders={displayedOrders}
                  onEdit={handleEditOrder}
                  onDelete={handleDeleteOrder}
                  onStatusChange={handleStatusChange}
                  onOrderStatusChange={handleOrderStatusChange}
                  onWhatsApp={(order) =>
                    showWhatsAppNotificationModal({
                      order,
                      orderStatuses,
                      saudiOffices,
                      externalOffices,
                    })
                  }
                  statusOptions={orderStatuses}
                  orderStatusOptions={orderProcessStatuses}
                  serviceTypeOptions={serviceTypes}
                />
                <div className="p-3 border-top bg-light bg-opacity-50">
                  <PaginationComponent
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    totalItems={orders.length}
                    pageSize={itemsPerPage}
                    onPageSizeChange={(size) => {
                      setItemsPerPage(size);
                      setCurrentPage(1);
                    }}
                  />
                </div>
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
        orderStatusOptions={orderProcessStatuses}
        serviceTypeOptions={serviceTypes}
        loading={loading}
        isEdit={!!editingOrder}
        error={submitError}
      />
    </div>
  );
};

export default ReachedOrdersPage;
