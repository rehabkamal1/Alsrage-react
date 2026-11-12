import React, { useState, useEffect } from "react";
import { Container, Card, Button } from "react-bootstrap";
import RefreshButton from "../components/common/RefreshButton";
import DateFilterBar from "../components/common/DateFilterBar";
import {
  getOrders,
  createOrder,
  updateOrder,
  deleteOrder,
  getClients,
  getSaudiOffices,
  getExternalOffices,
  getEmployees,
  getSettingsOrderStatuses,
  getSettingsOrderProcessStatuses,
  getSettingsServiceTypes,
  getSettingsNationalities,
  searchClients,
  quickCreateClient,
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
import { getUser } from "../services/authService";
import { useDebounce } from "../hooks/useDebounce";

const OrdersPage = ({
  trackingStatus,
  pageTitle = "الطلبات",
  showCreateOrder = true,
}) => {
  const [orders, setOrders] = useState([]);
  const [clients, setClients] = useState([]);
  const [saudiOffices, setSaudiOffices] = useState([]);
  const [externalOffices, setExternalOffices] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [orderStatuses, setOrderStatuses] = useState([]);
  const [orderProcessStatuses, setOrderProcessStatuses] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [nationalityOptions, setNationalityOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [filters, setFilters] = useState({
    status: "",
    order_status: "",
    service_type: "",
    nationality: "",
    sort_by: "id",
    sort_dir: "desc",
    is_paid_by_office: "",
  });
  const [submitError, setSubmitError] = useState(null);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  const user = getUser();
  const isAdmin = user?.role === "admin";
  const hasPermission = (permission) => {
    if (isAdmin) return true;
    return user?.permissions?.includes(permission) || false;
  };

  useEffect(() => {
    fetchAllData();
  }, [debouncedSearch, filters, fromDate, toDate]);

  useEffect(() => {
    setTotalPages(Math.ceil(orders.length / itemsPerPage));
  }, [orders, itemsPerPage]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const params = {
        search: debouncedSearch || undefined,
        status: filters.status || undefined,
        order_status: filters.order_status || undefined,
        service_type: filters.service_type || undefined,
        sort_by: filters.sort_by,
        sort_dir: filters.sort_dir,
        is_paid_by_office: filters.is_paid_by_office || undefined,
        nationality: filters.nationality || undefined,
        tracking_status: trackingStatus || undefined,
      };

      if (fromDate) params.from_date = fromDate;
      if (toDate) params.to_date = toDate;

      const [
        ordersResult,
        clientsResult,
        saudiResult,
        externalResult,
        employeesResult,
        orderStatusesResult,
        orderProcessStatusesResult,
        serviceTypesResult,
        nationalitiesResult,
      ] = await Promise.allSettled([
        fetchAllPages(getOrders, params),
        fetchAllPages(getClients, { sort_by: "name", sort_dir: "asc" }),
        getSaudiOffices({ all: 1, per_page: 100 }),
        getExternalOffices({ all: 1, per_page: 100 }),
        fetchAllPages(getEmployees, {
          sort_by: "name",
          sort_dir: "asc",
        }),
        getSettingsOrderStatuses(),
        getSettingsOrderProcessStatuses(),
        getSettingsServiceTypes(),
        getSettingsNationalities(),
      ]);

      if (ordersResult.status === "rejected") {
        throw ordersResult.reason;
      }

      const ordersRes = ordersResult.value;
      setOrders(ordersRes);
      setTotalPages(Math.ceil(ordersRes.length / itemsPerPage));
      setTotalOrders(ordersRes.length);

      const failedLookups = [];
      if (clientsResult.status === "fulfilled") {
        setClients(clientsResult.value);
      } else {
        failedLookups.push("المندوبين");
        console.error("Error fetching clients:", clientsResult.reason);
      }

      const saudiRes =
        saudiResult.status === "fulfilled" ? saudiResult.value : null;
      if (saudiRes) {
        const saudiList = Array.isArray(saudiRes.data?.data)
          ? saudiRes.data.data
          : Array.isArray(saudiRes.data)
            ? saudiRes.data
            : [];
        setSaudiOffices(saudiList);
      } else {
        failedLookups.push("المكاتب السعودية");
        console.error("Error fetching Saudi offices:", saudiResult.reason);
      }

      const externalRes =
        externalResult.status === "fulfilled" ? externalResult.value : null;
      if (externalRes) {
        const externalList = Array.isArray(externalRes.data?.data)
          ? externalRes.data.data
          : Array.isArray(externalRes.data)
            ? externalRes.data
            : [];
        setExternalOffices(externalList);
      } else {
        failedLookups.push("المكاتب الخارجية");
        console.error("Error fetching external offices:", externalResult.reason);
      }

      if (employeesResult.status === "fulfilled") {
        setEmployees(employeesResult.value);
      } else {
        failedLookups.push("الموظفين");
        console.error("Error fetching employees:", employeesResult.reason);
      }

      if (orderStatusesResult.status === "fulfilled") {
        setOrderStatuses(orderStatusesResult.value.data?.data || []);
      } else {
        failedLookups.push("حالات سداد مساند");
        console.error(
          "Error fetching Musaned payment statuses:",
          orderStatusesResult.reason,
        );
      }

      if (orderProcessStatusesResult.status === "fulfilled") {
        setOrderProcessStatuses(
          (orderProcessStatusesResult.value.data?.data || []).filter(
            (status) => status.is_active,
          ),
        );
      } else {
        failedLookups.push("حالات الطلب");
        console.error(
          "Error fetching order process statuses:",
          orderProcessStatusesResult.reason,
        );
      }

      if (serviceTypesResult.status === "fulfilled") {
        setServiceTypes(serviceTypesResult.value.data?.data || []);
      } else {
        failedLookups.push("أنواع الخدمات");
        console.error("Error fetching service types:", serviceTypesResult.reason);
      }

      if (nationalitiesResult.status === "fulfilled") {
        const nationalities =
          nationalitiesResult.value.data?.data ||
          nationalitiesResult.value.data ||
          [];
        setNationalityOptions(
          Array.isArray(nationalities) ? nationalities : [],
        );
      } else {
        failedLookups.push("الجنسيات");
        console.error(
          "Error fetching nationalities:",
          nationalitiesResult.reason,
        );
      }

      if (failedLookups.length > 0) {
        showError(
          "تنبيه",
          `تم تحميل الطلبات، لكن تعذر تحميل: ${failedLookups.join("، ")}`,
        );
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      showError(
        "تعذر تحميل الطلبات",
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

  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setFilters({
      status: "",
      order_status: "",
      service_type: "",
      nationality: "",
      sort_by: "id",
      sort_dir: "desc",
      is_paid_by_office: "",
    });
    setFromDate("");
    setToDate("");
    setCurrentPage(1);
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setCurrentPage(1);
  };

  const handleAddOrder = () => {
    setEditingOrder(null);
    setSubmitError(null);
    setShowModal(true);
  };

  const handleEditOrder = (order) => {
    setEditingOrder(order);
    setSubmitError(null);
    setShowModal(true);
  };

  const handleWhatsAppNotification = (order, newStatus) => {
    showWhatsAppNotificationModal({
      order,
      newStatus,
      orderStatuses,
      saudiOffices,
      externalOffices,
      clients,
    });
  };

  const handleServiceTypeChange = async (order, newServiceType) => {
    setLoading(true);
    try {
      await updateOrder(order.id, { service_type: newServiceType });
      showSuccess("تم التحديث!", "تم تغيير نوع الخدمة بنجاح");
      handleWhatsAppNotification(
        { ...order, service_type: newServiceType },
        order.status,
      );
      fetchAllData();
    } catch (error) {
      console.error("Error updating service type:", error);
      showError("خطأ!", "حدث خطأ أثناء تحديث نوع الخدمة");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (order, newStatus) => {
    setLoading(true);
    try {
      const response = await updateOrder(order.id, { status: newStatus });
      showSuccess("تم تحديث الحالة!", "تم تغيير حالة الطلب بنجاح");

      const updatedOrder = response.data?.data || {
        ...order,
        status: newStatus,
      };
      handleWhatsAppNotification(updatedOrder, newStatus);

      fetchAllData();
    } catch (error) {
      console.error("Error updating status:", error);
      showError("خطأ!", "حدث خطأ أثناء تحديث الحالة");
    } finally {
      setLoading(false);
    }
  };

  const handleOrderStatusChange = async (order, newStatus) => {
    setLoading(true);
    try {
      await updateOrder(order.id, { order_status: newStatus || null });
      showSuccess("تم تحديث الحالة!", "تم تغيير حالة الطلب بنجاح");
      fetchAllData();
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

  const handleSubmit = async (formData, idempotencyKey) => {
    setLoading(true);
    setSubmitError(null);
    try {
      const newStatus = formData.get("status") || "";
      const oldStatus = editingOrder?.status || "";
      const isStatusChanged =
        editingOrder && String(newStatus) !== String(oldStatus);

      if (editingOrder) {
        const response = await updateOrder(editingOrder.id, formData);
        showSuccess("تم التحديث!", "تم تحديث الطلب بنجاح");
        const updatedOrder = response.data?.data || {
          ...editingOrder,
          status: newStatus || editingOrder.status,
          visa_holder_name:
            formData.get("visa_holder_name") || editingOrder.visa_holder_name,
          visa_number: formData.get("visa_number") || editingOrder.visa_number,
          passport_number:
            formData.get("passport_number") || editingOrder.passport_number,
          birth_date: formData.get("birth_date") || editingOrder.birth_date,
          saudi_office_id:
            formData.get("saudi_office_id") || editingOrder.saudi_office_id,
          external_office_id:
            formData.get("external_office_id") ||
            editingOrder.external_office_id,
        };
        handleWhatsAppNotification(updatedOrder, updatedOrder.status);
      } else {
        const response = await createOrder(formData, idempotencyKey);
        showSuccess("تمت الإضافة!", "تم إضافة الطلب بنجاح");
        if (newStatus) {
          const createdOrder = response.data?.data || {
            id: "?",
            visa_holder_name: formData.get("visa_holder_name"),
            visa_number: formData.get("visa_number"),
            passport_number: formData.get("passport_number"),
            saudi_office_id: formData.get("saudi_office_id"),
            external_office_id: formData.get("external_office_id"),
          };
          handleWhatsAppNotification(createdOrder, newStatus);
        }
      }
      setShowModal(false);
      setEditingOrder(null);
      fetchAllData();
    } catch (error) {
      const errorData = error.response?.data;
      setSubmitError(errorData);
      return { idempotencyConflict: error.response?.status === 409 };
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
        header: "السداد من المكتب",
        format: (order) => (order.is_paid_by_office ? "نعم" : "لا"),
      },
      {
        header: "حالة الطلب",
        format: (order) =>
          orderProcessStatuses.find(
            (status) => (status.key || status.id) === order.order_status,
          )?.label || order.order_status || "-",
      },
      {
        header: "حالة سداد مساند",
        format: (order) =>
          orderStatuses.find((s) => (s.key || s.id) === order.status)?.label ||
          order.status ||
          "-",
      },
      {
        header: "التاريخ",
        key: "created_at",
      },
    ];
    exportToExcel(orders, columns, "الطلبات.xlsx");
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
        header: "السداد من المكتب",
        format: (order) => (order.is_paid_by_office ? "نعم" : "لا"),
      },
      {
        header: "حالة الطلب",
        format: (order) =>
          orderProcessStatuses.find(
            (status) => (status.key || status.id) === order.order_status,
          )?.label || order.order_status || "-",
      },
      {
        header: "حالة سداد مساند",
        format: (order) =>
          orderStatuses.find((s) => (s.key || s.id) === order.status)?.label ||
          order.status ||
          "-",
      },
      {
        header: "التاريخ",
        key: "created_at",
      },
    ];
    exportToPDF(orders, columns, "الطلبات.pdf");
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedOrders = orders.slice(startIndex, startIndex + itemsPerPage);

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
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
            <h1 className="h3 mb-0 fw-bold">{pageTitle}</h1>
            <Button variant="dark" disabled className="w-fit">
              + طلب جديد
            </Button>
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
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div className="d-flex align-items-center gap-3">
            <h1 className="h3 mb-0 fw-bold">الطلبات</h1>
            <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-3 py-2 rounded-pill fs-7 fw-bold">
              عدد الطلبات: {totalOrders}
            </span>
          </div>
          <div className="d-flex flex-wrap gap-2">
            <RefreshButton
              onClick={fetchAllData}
              loading={loading}
              className="border shadow-sm text-primary fw-semibold"
            />
            <Button
              variant="light"
              onClick={handleExport}
              disabled={orders.length === 0}
              className="d-flex align-items-center gap-2 rounded-3 border shadow-sm px-3 py-2 text-success fw-semibold"
              style={{ transition: "all 0.3s ease" }}
            >
              <i className="fa-solid fa-file-excel fs-5"></i>
              <span>إكسيل</span>
            </Button>
            <Button
              variant="light"
              onClick={handleExportPDF}
              disabled={orders.length === 0}
              className="d-flex align-items-center gap-2 rounded-3 border shadow-sm px-3 py-2 text-danger fw-semibold"
              style={{ transition: "all 0.3s ease" }}
            >
              <i className="fa-solid fa-file-pdf fs-5"></i>
              <span>بي دي اف</span>
            </Button>
            {showCreateOrder && hasPermission("create_orders") && (
              <Button
                variant="dark"
                onClick={handleAddOrder}
                className="d-flex align-items-center gap-2 rounded-3 shadow px-3 py-2"
              >
                <i className="fa-solid fa-plus"></i>
                <span>طلب جديد</span>
              </Button>
            )}
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
          onClear={handleClearSearch}
          filters={filters}
          onFilterChange={handleFilterChange}
          serviceTypeOptions={serviceTypes}
          statusOptions={orderStatuses}
          orderStatusOptions={orderProcessStatuses}
          nationalityOptions={nationalityOptions}
          loading={loading}
        />

        <Card className="shadow-sm border-0 rounded-4">
          <Card.Body className="p-0">
            {loading ? (
              <div className="text-center py-5">
                <TableSkeleton rows={3} columns={8} />
              </div>
            ) : (
              <>
                <OrderTable
                  orders={displayedOrders}
                  onEdit={handleEditOrder}
                  onDelete={handleDeleteOrder}
                  onStatusChange={handleStatusChange}
                  onOrderStatusChange={handleOrderStatusChange}
                  onServiceTypeChange={handleServiceTypeChange}
                  onWhatsApp={(order) => handleWhatsAppNotification(order)}
                  statusOptions={orderStatuses}
                  orderStatusOptions={orderProcessStatuses}
                  serviceTypeOptions={serviceTypes}
                  canEdit={hasPermission("edit_orders")}
                  canDelete={hasPermission("delete_orders")}
                />

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
        employees={employees}
        saudiOffices={saudiOffices}
        externalOffices={externalOffices}
        statusOptions={orderStatuses}
        orderStatusOptions={orderProcessStatuses}
        serviceTypeOptions={serviceTypes}
        searchClients={searchClients}
        quickCreateClient={quickCreateClient}
        loading={loading}
        isEdit={!!editingOrder}
        error={submitError}
      />
    </div>
  );
};

export default OrdersPage;
