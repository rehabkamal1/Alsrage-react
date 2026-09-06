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
    getSettingsServiceTypes,
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
import { showWhatsAppNotificationModal } from "../utils/whatsappHelper";
import { getUser } from "../services/authService";
import { useDebounce } from "../hooks/useDebounce";

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [clients, setClients] = useState([]);
    const [saudiOffices, setSaudiOffices] = useState([]);
    const [externalOffices, setExternalOffices] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [orderStatuses, setOrderStatuses] = useState([]);
    const [serviceTypes, setServiceTypes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingOrder, setEditingOrder] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearch = useDebounce(searchQuery, 500);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    const [filters, setFilters] = useState({
        status: "",
        sort_by: "id",
        sort_dir: "desc",
        is_paid_by_office: "",
    });
    const [submitError, setSubmitError] = useState(null);
    const itemsPerPage = 8;

    const user = getUser();
    const isAdmin = user?.role === "admin";
    const hasPermission = (permission) => {
        if (isAdmin) return true;
        return user?.permissions?.includes(permission) || false;
    };

    useEffect(() => {
        fetchAllData();
    }, [currentPage, debouncedSearch, filters, fromDate, toDate]);

    const fetchAllData = async (isSilent = false) => {
        if (!isSilent) {
            if (initialLoading) {
                setInitialLoading(true);
            } else {
                setLoading(true);
            }
        }
        try {
            const params = {
                page: currentPage,
                per_page: itemsPerPage,
                search: debouncedSearch || undefined,
                status: filters.status || undefined,
                sort_by: filters.sort_by,
                sort_dir: filters.sort_dir,
                is_paid_by_office: filters.is_paid_by_office || undefined,
            };

            if (fromDate) params.from_date = fromDate;
            if (toDate) params.to_date = toDate;

            const [
                ordersRes,
                clientsRes,
                saudiRes,
                externalRes,
                employeesRes,
                orderStatusesRes,
                serviceTypesRes,
            ] = await Promise.all([
                getOrders(params),
                getClients({ per_page: 200, sort_by: "name", sort_dir: "asc" }),
                getSaudiOffices({ all: 1, per_page: 500 }),
                getExternalOffices({ all: 1, per_page: 500 }),
                getEmployees({
                    per_page: 200,
                    sort_by: "name",
                    sort_dir: "asc",
                }),
                getSettingsOrderStatuses(),
                getSettingsServiceTypes(),
            ]);
            setOrders(ordersRes.data?.data || []);
            setTotalPages(ordersRes.data?.meta?.last_page || 1);
            setClients(clientsRes.data?.data || []);
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
            setEmployees(employeesRes.data?.data || employeesRes.data || []);
            setOrderStatuses(orderStatusesRes.data?.data || []);
            setServiceTypes(serviceTypesRes.data?.data || []);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            if (!isSilent) {
                setLoading(false);
                setInitialLoading(false);
            }
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

    const handleSubmit = async (formData) => {
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
                if (isStatusChanged) {
                    const updatedOrder = response.data?.data || {
                        ...editingOrder,
                        status: newStatus,
                        visa_holder_name:
                            formData.get("visa_holder_name") ||
                            editingOrder.visa_holder_name,
                        visa_number:
                            formData.get("visa_number") ||
                            editingOrder.visa_number,
                        passport_number:
                            formData.get("passport_number") ||
                            editingOrder.passport_number,
                        saudi_office_id: formData.get("saudi_office_id"),
                        external_office_id: formData.get("external_office_id"),
                    };
                    handleWhatsAppNotification(updatedOrder, newStatus);
                }
            } else {
                const response = await createOrder(formData);
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
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteOrder = async (id) => {
        const result = await showConfirm(
            "هل أنت متأكد؟",
            "سيتم حذف الطلب نهائياً",
        );
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
            { header: "هاتف صاحب التأشيرة", key: "visa_holder_phone" },
            { header: "رقم التأشيرة", key: "visa_number" },
            { header: "نوع الخدمة", key: "service_type" },
            { header: "رقم الهوية", key: "id_number" },
            { header: "رقم عقد مساند", key: "musaned_contract_number" },
            { header: "إجمالي السعر", key: "total_price" },
            { header: "الرصيد المتبقي", key: "price_difference" },
            {
                header: "السداد من المكتب",
                format: (order) => (order.is_paid_by_office ? "نعم" : "لا"),
            },
            {
                header: "الحالة",
                format: (order) =>
                    orderStatuses.find((s) => (s.key || s.id) === order.status)
                        ?.label || order.status,
            },
            {
                header: "التاريخ",
                format: (order) =>
                    new Date(order.created_at).toLocaleDateString("ar-SA"),
            },
        ];
        exportToExcel(orders, columns, "الطلبات.xlsx");
    };

    const handleExportPDF = () => {
        const columns = [
            { header: "رقم الطلب", key: "id" },
            { header: "صاحب التأشيرة", key: "visa_holder_name" },
            { header: "هاتف صاحب التأشيرة", key: "visa_holder_phone" },
            { header: "رقم التأشيرة", key: "visa_number" },
            { header: "نوع الخدمة", key: "service_type" },
            { header: "رقم الهوية", key: "id_number" },
            { header: "رقم عقد مساند", key: "musaned_contract_number" },
            { header: "إجمالي السعر", key: "total_price" },
            { header: "الرصيد المتبقي", key: "price_difference" },
            {
                header: "السداد من المكتب",
                format: (order) => (order.is_paid_by_office ? "نعم" : "لا"),
            },
            {
                header: "الحالة",
                format: (order) =>
                    orderStatuses.find((s) => (s.key || s.id) === order.status)
                        ?.label || order.status,
            },
            {
                header: "التاريخ",
                format: (order) =>
                    new Date(order.created_at).toLocaleDateString("ar-SA"),
            },
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
                        {hasPermission("create_orders") && (
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
                                    onServiceTypeChange={
                                        handleServiceTypeChange
                                    }
                                    onWhatsApp={(order) =>
                                        handleWhatsAppNotification(order)
                                    }
                                    statusOptions={orderStatuses}
                                    serviceTypeOptions={serviceTypes}
                                    canEdit={hasPermission("edit_orders")}
                                    canDelete={hasPermission("delete_orders")}
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
                employees={employees}
                saudiOffices={saudiOffices}
                externalOffices={externalOffices}
                statusOptions={orderStatuses}
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
