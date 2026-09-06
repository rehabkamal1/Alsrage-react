import React, { useState, useEffect } from "react";
import { Container, Card, Button, Form } from "react-bootstrap";
import Select from "react-select";
import RefreshButton from "../components/common/RefreshButton";
import DateFilterBar from "../components/common/DateFilterBar";
import api, {
    getTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getClients,
    getEmployees,
    getOrders,
} from "../services/apiService";
import { showSuccess, showError, showConfirm } from "../utils/swalHelper";
import FinanceTable from "../components/Finance/FinanceTable";
import FinanceFormModal from "../components/Finance/FinanceFormModal";
import FinanceSearchBar from "../components/Finance/FinanceSearchBar";
import TableSkeleton from "../components/common/TableSkeleton";
import PaginationComponent from "../components/common/Pagination";
import { exportToExcel } from "../utils/excelHelper";
import { exportToPDF } from "../utils/pdfHelper";
import { getUser } from "../services/authService";

const FinancePage = () => {
    const [transactions, setTransactions] = useState([]);
    const [orders, setOrders] = useState([]);
    const [clients, setClients] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [bankNames, setBankNames] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [submitError, setSubmitError] = useState(null);
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);

    const [filters, setFilters] = useState({
        type: "",
        payment_method: "",
        is_reviewed: "",
    });
    const [sortField, setSortField] = useState("id");
    const [sortDirection, setSortDirection] = useState("desc");
    const [allTransactions, setAllTransactions] = useState([]);
    const itemsPerPage = 10;

    const user = getUser();
    const isAdmin = user?.role === "admin";
    const hasPermission = (permission) => {
        if (isAdmin) return true;
        return user?.permissions?.includes(permission) || false;
    };

    useEffect(() => {
        fetchAllData();
        fetchSettings();
    }, []);

    useEffect(() => {
        fetchTransactions();
    }, [
        filters,
        sortField,
        sortDirection,
        searchQuery,
        currentPage,
        fromDate,
        toDate,
        refreshKey,
    ]);

    const fetchAllData = async () => {
        setInitialLoading(true);
        try {
            const [ordersRes, clientsRes, employeesRes] = await Promise.all([
                getOrders({ per_page: 1000 }),
                getClients({ per_page: 500 }),
                getEmployees({ per_page: 500 }),
            ]);
            setOrders(ordersRes.data.data || []);
            setClients(clientsRes.data.data || []);
            setEmployees(employeesRes.data.data || []);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setInitialLoading(false);
        }
    };

    const fetchSettings = async () => {
        try {
            const [paymentRes, bankRes] = await Promise.all([
                api.get("/settings/payment-methods"),
                api.get("/settings/bank-names"),
            ]);

            const normalizeData = (data) => {
                return (data || []).map((item) => ({
                    value: item.key || item.label,
                    label: item.label,
                    color: item.color,
                    key: item.key || item.label,
                }));
            };

            setPaymentMethods(normalizeData(paymentRes.data.data));
            setBankNames(normalizeData(bankRes.data.data));
        } catch (error) {
            console.error("Error fetching settings:", error);
        }
    };

    const fetchTransactions = async (page = currentPage) => {
        setLoading(true);
        try {
            const params = {
                sort_field: sortField,
                sort_direction: sortDirection,
                per_page: 1000,
                page: 1,
            };
            if (searchQuery) params.search = searchQuery;
            if (filters.type) params.type = filters.type;
            if (filters.payment_method) {
                params.payment_method = filters.payment_method;
            }
            if (fromDate) params.from_date = fromDate;
            if (toDate) params.to_date = toDate;

            const response = await getTransactions(params);
            const data = response.data.data || [];
            setAllTransactions(data);
            const start = (page - 1) * itemsPerPage;
            const end = start + itemsPerPage;
            setTransactions(data.slice(start, end));
        } catch (error) {
            console.error("Error fetching transactions:", error);
        } finally {
            setLoading(false);
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
            type: "",
            payment_method: "",
            is_reviewed: "",
        });
        setFromDate("");
        setToDate("");
        setCurrentPage(1);
    };

    const handleFilterChange = (key, value) => {
        setFilters({ ...filters, [key]: value });
        setCurrentPage(1);
    };

    const handleSortChange = (field, direction) => {
        setSortField(field);
        setSortDirection(direction);
        setCurrentPage(1);
    };

    const handleAddTransaction = () => {
        setEditingTransaction(null);
        setSubmitError(null);
        setShowModal(true);
    };

    const handleEditTransaction = (item) => {
        setEditingTransaction(item);
        setShowModal(true);
    };

    const handleSubmit = async (formData) => {
        setLoading(true);
        setSubmitError(null);
        try {
            if (editingTransaction) {
                await updateTransaction(editingTransaction.id, formData);
                showSuccess("تم التحديث!", "تم تحديث الحوالة بنجاح");
            } else {
                await createTransaction(formData);
                showSuccess("تمت الإضافة!", "تم إضافة الحوالة بنجاح");
            }
            setShowModal(false);
            setEditingTransaction(null);
            setRefreshKey((prev) => prev + 1);
            setCurrentPage(1);
            await fetchAllData();
            await fetchTransactions(1);
        } catch (error) {
            setSubmitError(error.response?.data);
            showError(
                "خطأ!",
                error.response?.data?.message || "حدث خطأ أثناء العملية",
            );
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTransaction = async (id) => {
        const result = await showConfirm(
            "هل أنت متأكد؟",
            "سيتم حذف الحوالة نهائياً",
        );
        if (result.isConfirmed) {
            setLoading(true);
            try {
                await deleteTransaction(id);
                showSuccess("تم الحذف", "تم حذف الحوالة بنجاح");
                setRefreshKey((prev) => prev + 1);
                await fetchTransactions();
            } catch (error) {
                showError("خطأ", "حدث خطأ أثناء الحذف");
            } finally {
                setLoading(false);
            }
        }
    };

    const handleUpdateField = async (id, field, value) => {
        try {
            await updateTransaction(id, { [field]: value });
            showSuccess("تم", "تم التحديث بنجاح");
            setRefreshKey((prev) => prev + 1);
        } catch (error) {
            showError(
                "خطأ",
                error.response?.data?.message || "حدث خطأ أثناء التحديث",
            );
        }
    };

    const handleExportExcel = () => {
        const exportData =
            allTransactions.length > 0 ? allTransactions : transactions;
        const columns = [
            { header: "رقم الحوالة", key: "id" },
            { header: "الموظف المسؤول", key: "employee_name" },
            {
                header: "نوع المعاملة",
                key: "type",
                format: (item) =>
                    item.type === "receipt" ? "مقبوضات" : "مصروفات",
            },
            { header: "رقم المندوب", key: "client_name" },
            { header: "رقم الطلب", key: "order_number" },
            { header: "المبلغ", key: "amount" },
            { header: "صاحب التأشيرة", key: "visa_holder_name" },
            { header: "رقم الحوالة", key: "transfer_number" },
            { header: "طريقة الدفع", key: "payment_method" },
            { header: "بنك المستفيد", key: "bank_name" },
            { header: "تاريخ الحوالة", key: "transfer_date" },
            {
                header: "مراجعة",
                key: "is_reviewed",
                format: (item) => (item.is_reviewed ? "✅ تمت" : "❌ لم تتم"),
            },
            { header: "تاريخ الإنشاء", key: "created_at" },
        ];
        exportToExcel(exportData, columns, "الحوالات.xlsx");
    };

    const handleExportPDF = () => {
        const exportData =
            allTransactions.length > 0 ? allTransactions : transactions;
        const columns = [
            { header: "رقم الحوالة", key: "id" },
            { header: "الموظف المسؤول", key: "employee_name" },
            {
                header: "نوع المعاملة",
                key: "type",
                format: (item) =>
                    item.type === "receipt" ? "مقبوضات" : "مصروفات",
            },
            { header: "رقم المندوب", key: "client_name" },
            { header: "رقم الطلب", key: "order_number" },
            { header: "المبلغ", key: "amount" },
            { header: "صاحب التأشيرة", key: "visa_holder_name" },
            { header: "رقم الحوالة", key: "transfer_number" },
            { header: "طريقة الدفع", key: "payment_method" },
            { header: "بنك المستفيد", key: "bank_name" },
            { header: "تاريخ الحوالة", key: "transfer_date" },
            {
                header: "مراجعة",
                key: "is_reviewed",
                format: (item) => (item.is_reviewed ? "✅ تمت" : "❌ لم تتم"),
            },
            { header: "تاريخ الإنشاء", key: "created_at" },
        ];
        exportToPDF(exportData, columns, "الحوالات.pdf");
    };

    const totalPages = Math.ceil(allTransactions.length / itemsPerPage);
    const currentData = transactions;

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
                    <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                        <h1 className="h3 mb-0 fw-bold">الحوالات</h1>
                        <Button variant="dark" disabled>
                            + حوالة جديدة
                        </Button>
                    </div>
                    <Card className="shadow-sm border-0 rounded-4">
                        <Card.Body className="p-0">
                            <div className="table-responsive">
                                <TableSkeleton rows={5} columns={16} />
                            </div>
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
                <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                    <h1 className="h3 mb-0 fw-bold">الحوالات</h1>
                    <div className="d-flex gap-2 flex-wrap">
                        <RefreshButton
                            onClick={() => setRefreshKey((prev) => prev + 1)}
                            loading={loading}
                            className="border shadow-sm text-primary fw-semibold"
                        />
                        <Button
                            variant="light"
                            onClick={handleExportExcel}
                            className="d-flex align-items-center gap-2 rounded-3 border shadow-sm px-3 py-2 text-success fw-semibold"
                            disabled={allTransactions.length === 0}
                        >
                            <i className="fa-solid fa-file-excel fs-5"></i>
                            <span>إكسيل</span>
                        </Button>
                        <Button
                            variant="light"
                            onClick={handleExportPDF}
                            className="d-flex align-items-center gap-2 rounded-3 border shadow-sm px-3 py-2 text-danger fw-semibold"
                            disabled={allTransactions.length === 0}
                        >
                            <i className="fa-solid fa-file-pdf fs-5"></i>
                            <span>بي دي اف</span>
                        </Button>
                        {hasPermission("create_transactions") && (
                            <Button
                                variant="dark"
                                onClick={handleAddTransaction}
                                className="d-flex align-items-center gap-2 rounded-3 shadow px-3 py-2"
                            >
                                <i className="fa-solid fa-plus"></i>
                                <span>حوالة جديدة</span>
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

                <div className="mb-4">
                    <FinanceSearchBar
                        searchQuery={searchQuery}
                        onSearch={handleSearch}
                        onClear={handleClearSearch}
                        loading={loading}
                        paymentMethods={paymentMethods}
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        sortField={sortField}
                        sortDirection={sortDirection}
                        onSortChange={handleSortChange}
                    />
                </div>

                <Card className="shadow-sm border-0 rounded-4 overflow-hidden">
                    <Card.Body className="p-0">
                        {loading ? (
                            <div className="text-center py-5">
                                <div className="table-responsive">
                                    <TableSkeleton rows={5} columns={16} />
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="table-responsive">
                                    <FinanceTable
                                        transactions={currentData}
                                        onEdit={handleEditTransaction}
                                        onDelete={handleDeleteTransaction}
                                        onUpdateField={handleUpdateField}
                                        paymentMethods={paymentMethods}
                                        bankNames={bankNames}
                                    />
                                </div>
                                {totalPages > 1 && (
                                    <div className="d-flex justify-content-center py-3">
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

            <FinanceFormModal
                show={showModal}
                onHide={() => {
                    setShowModal(false);
                    setEditingTransaction(null);
                    setSubmitError(null);
                }}
                onSubmit={handleSubmit}
                initialData={editingTransaction}
                orders={orders}
                clients={clients}
                employees={employees}
                paymentMethods={paymentMethods}
                bankNames={bankNames}
                loading={loading}
                isEdit={!!editingTransaction}
                error={submitError}
            />
        </div>
    );
};

export default FinancePage;
