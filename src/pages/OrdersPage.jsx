import React, { useState, useEffect } from "react";
/* global Swal */
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
  getSettingsOrderStatuses,
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
import { exportToPDF } from "../utils/pdfHelper";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [clients, setClients] = useState([]);
  const [saudiOffices, setSaudiOffices] = useState([]);
  const [externalOffices, setExternalOffices] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [orderStatuses, setOrderStatuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: "",
    sort_by: "id",
    sort_dir: "desc",
  });
  const [submitError, setSubmitError] = useState(null);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchAllData();
  }, [currentPage, searchQuery, filters]);

  const fetchAllData = async () => {
    if (initialLoading) {
      setInitialLoading(true);
    } else {
      setLoading(true);
    }
    try {
      const [ordersRes, clientsRes, saudiRes, externalRes, employeesRes, orderStatusesRes] = await Promise.all([
        getOrders({
          page: currentPage,
          per_page: itemsPerPage,
          search: searchQuery || undefined,
          status: filters.status || undefined,
          sort_by: filters.sort_by,
          sort_dir: filters.sort_dir,
        }),
        getClients({ per_page: 200, sort_by: "name", sort_dir: "asc" }),
        getSaudiOffices(),
        getExternalOffices(),
        getEmployees({ per_page: 200, sort_by: "name", sort_dir: "asc" }),
        getSettingsOrderStatuses(),
      ]);
      setOrders(ordersRes.data?.data || []);
      setTotalPages(ordersRes.data?.meta?.last_page || 1);
      setClients(clientsRes.data?.data || []);
      setSaudiOffices(saudiRes.data?.data || []);
      setExternalOffices(externalRes.data?.data || []);
      setEmployees(employeesRes.data?.data || employeesRes.data || []);
      setOrderStatuses(orderStatusesRes.data?.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
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
    const statusLabel = orderStatuses.find(s => (s.key || s.id) === newStatus)?.label || newStatus;

    const message = `تحديث بخصوص الطلب رقم: ${order.id} / Update for Order No: ${order.id}\n` +
                    `الاسم: ${order.visa_holder_name || "غير محدد"} / Name: ${order.visa_holder_name || "N/A"}\n` +
                    `رقم التأشيرة: ${order.visa_number || "غير محدد"} / Visa No: ${order.visa_number || "N/A"}\n` +
                    `رقم الجواز: ${order.passport_number || "غير محدد"} / Passport No: ${order.passport_number || "N/A"}\n` +
                    `آخر تحديث للحالة: ${statusLabel} / Latest Status: ${statusLabel}`;
    const encodedMessage = encodeURIComponent(message);

    const saudiOffice = saudiOffices.find(o => String(o.id) === String(order.saudi_office_id));
    const supplier = saudiOffices.find(o => String(o.id) === String(order.supplier_id));
    const externalOffice = externalOffices.find(o => String(o.id) === String(order.external_office_id));

    const hasAny = saudiOffice?.mobile || supplier?.mobile || externalOffice?.phone;
    if (!hasAny) return;

    Swal.fire({
      title: "تم تحديث الحالة بنجاح",
      text: "هل ترغب في إرسال تنبيه عبر الواتساب؟",
      icon: "question",
      showCancelButton: true,
      showDenyButton: !!supplier?.mobile,
      showConfirmButton: !!saudiOffice?.mobile,
      confirmButtonText: "المكتب السعودي",
      denyButtonText: "المورد",
      cancelButtonText: "لا، شكراً",
      confirmButtonColor: "#212529",
      denyButtonColor: "#198754",
      reverseButtons: true,
      footer: externalOffice?.phone
        ? `<button id="wa-external-btn" style="background:#0d6efd;color:#fff;border:none;border-radius:6px;padding:6px 16px;cursor:pointer;">🌍 المكتب الخارجي</button>`
        : undefined,
      didOpen: () => {
        document.getElementById("wa-external-btn")?.addEventListener("click", () => {
          window.open(`https://wa.me/${externalOffice.phone.replace(/\D/g, "")}?text=${encodedMessage}`, "_blank");
          Swal.close();
        });
      },
    }).then((result) => {
      if (result.isConfirmed && saudiOffice?.mobile) {
        window.open(`https://wa.me/${saudiOffice.mobile.replace(/\D/g, "")}?text=${encodedMessage}`, "_blank");
      } else if (result.isDenied && supplier?.mobile) {
        window.open(`https://wa.me/${supplier.mobile.replace(/\D/g, "")}?text=${encodedMessage}`, "_blank");
      }
    });
  };


  const handleStatusChange = async (order, newStatus) => {
    setLoading(true);
    try {
      const response = await updateOrder(order.id, { status: newStatus });
      showSuccess("تم تحديث الحالة!", "تم تغيير حالة الطلب بنجاح");
      
      const updatedOrder = response.data?.data || { ...order, status: newStatus };
      handleWhatsAppNotification(updatedOrder, newStatus);
      
      fetchAllData();
    } catch (error) {
      console.error("Error updating status:", error);
      showError("خطأ!", "حدث خطأ أثناء تحديث الحالة");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {

    setLoading(true);
    setSubmitError(null);
    try {
      const newStatus = formData.get("status") || "";
      const oldStatus = editingOrder?.status || "";
      const isStatusChanged = editingOrder && String(newStatus) !== String(oldStatus);

      if (editingOrder) {
        const response = await updateOrder(editingOrder.id, formData);
        showSuccess("تم التحديث!", "تم تحديث الطلب بنجاح");
        if (isStatusChanged) {
          const updatedOrder = response.data?.data || {
            ...editingOrder,
            status: newStatus,
            visa_holder_name: formData.get("visa_holder_name") || editingOrder.visa_holder_name,
            visa_number: formData.get("visa_number") || editingOrder.visa_number,
            passport_number: formData.get("passport_number") || editingOrder.passport_number,
            saudi_office_id: formData.get("saudi_office_id"),
            supplier_id: formData.get("supplier_id"),
            external_office_id: formData.get("external_office_id"),
          };
          handleWhatsAppNotification(updatedOrder, newStatus);
        }
      } else {
        const response = await createOrder(formData);
        showSuccess("تمت الإضافة!", "تم إضافة الطلب بنجاح");
        // Show WhatsApp notification for new orders that have a status set
        if (newStatus) {
          const createdOrder = response.data?.data || {
            id: "?",
            visa_holder_name: formData.get("visa_holder_name"),
            visa_number: formData.get("visa_number"),
            passport_number: formData.get("passport_number"),
            saudi_office_id: formData.get("saudi_office_id"),
            supplier_id: formData.get("supplier_id"),
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
      { header: "صاحب التأشيرة", key: "visa_holder_name" },
      { header: "رقم التأشيرة", key: "visa_number" },
      { header: "رقم الهوية", key: "id_number" },
      { header: "رقم عقد مساند", key: "musaned_contract_number" },
      { header: "إجمالي السعر", key: "total_price" },
      { header: "الرصيد المتبقي", key: "price_difference" },
      {
        header: "الحالة",
        format: (order) => orderStatuses.find(s => (s.key || s.id) === order.status)?.label || order.status
      },
      { header: "التاريخ", format: (order) => new Date(order.created_at).toLocaleDateString("ar-SA") },
    ];
    exportToExcel(orders, columns, "الطلبات.xlsx");
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
      {
        header: "الحالة",
        format: (order) => orderStatuses.find(s => (s.key || s.id) === order.status)?.label || order.status
      },
      { header: "التاريخ", format: (order) => new Date(order.created_at).toLocaleDateString("ar-SA") },
    ];
    exportToPDF(orders, columns, "الطلبات.pdf");
  };

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
            <h1 className="h3 mb-0 fw-bold">الطلبات</h1>
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
          <h1 className="h3 mb-0 fw-bold">الطلبات</h1>
          <div className="d-flex flex-wrap gap-2">
            <Button
              variant="light"
              onClick={handleExport}
              disabled={orders.length === 0}
              className="d-flex align-items-center gap-2 rounded-3 border shadow-sm px-3 py-2 text-success fw-semibold"
              style={{ transition: 'all 0.3s ease' }}
            >
              <i className="fa-solid fa-file-excel fs-5"></i>
              <span>إكسيل</span>
            </Button>
            <Button
              variant="light"
              onClick={handleExportPDF}
              disabled={orders.length === 0}
              className="d-flex align-items-center gap-2 rounded-3 border shadow-sm px-3 py-2 text-danger fw-semibold"
              style={{ transition: 'all 0.3s ease' }}
            >
              <i className="fa-solid fa-file-pdf fs-5"></i>
              <span>بي دي اف</span>
            </Button>
            <Button
              variant="dark"
              onClick={handleAddOrder}
              className="d-flex align-items-center gap-2 rounded-3 shadow px-3 py-2"
            >
              <i className="fa-solid fa-plus"></i>
              <span>طلب جديد</span>
            </Button>
          </div>
        </div>

        <OrderSearchBar
          searchQuery={searchQuery}
          onSearch={handleSearch}
          onClear={handleClearSearch}
          filters={filters}
          onFilterChange={handleFilterChange}
          statusOptions={orderStatuses}
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
                  orders={orders}
                  onEdit={handleEditOrder}
                  onDelete={handleDeleteOrder}
                  onStatusChange={handleStatusChange}
                  statusOptions={orderStatuses}
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
        statusOptions={orderStatuses}
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
