import React, { useState, useEffect } from "react";
import { Container, Card, Button } from "react-bootstrap";
import RefreshButton from "../components/common/RefreshButton";
import DateFilterBar from "../components/common/DateFilterBar";
import api from "../services/apiService";
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getOrders,
  getClients,
  getEmployees,
  getSettingsPaymentMethods,
  getSettingsBankNames,
  getSettingsTransferStatuses,
  getSettingsPriorityLevels,
} from "../services/apiService";
import { showSuccess, showError, showConfirm } from "../utils/swalHelper";
import FinanceFormModal from "../components/Finance/FinanceFormModal";
import FinanceTable from "../components/Finance/FinanceTable";
import FinanceSearchBar from "../components/Finance/FinanceSearchBar";
import FinanceSummaryCards from "../components/Finance/FinanceSummaryCards";
import TableSkeleton from "../components/common/TableSkeleton";
import PaginationComponent from "../components/common/Pagination";
import { exportToExcel } from "../utils/excelHelper";
import { exportToPDF } from "../utils/pdfHelper";

const FinancePage = () => {
  const [transactions, setTransactions] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [clients, setClients] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [bankNames, setBankNames] = useState([]);
  const [transferStatuses, setTransferStatuses] = useState([]);
  const [priorityLevels, setPriorityLevels] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [submitError, setSubmitError] = useState(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [filters, setFilters] = useState({
    type: "",
    payment_method: "",
    status: "",
    priority_level: "",
  });
  const [sortField, setSortField] = useState("id");
  const [sortDirection, setSortDirection] = useState("desc");
  const itemsPerPage = 10;

  useEffect(() => {
    fetchAllData();
    fetchSummary();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [
    searchQuery,
    filters,
    sortField,
    sortDirection,
    fromDate,
    toDate,
    currentPage,
  ]);

  const fetchAllData = async () => {
    setInitialLoading(true);
    try {
      const [
        ordersRes,
        clientsRes,
        employeesRes,
        paymentMethodsRes,
        bankNamesRes,
        transferStatusesRes,
        priorityLevelsRes,
      ] = await Promise.all([
        getOrders({ per_page: 1000 }),
        getClients({ per_page: 500 }),
        getEmployees({ per_page: 500 }),
        getSettingsPaymentMethods(),
        getSettingsBankNames(),
        getSettingsTransferStatuses(),
        getSettingsPriorityLevels(),
      ]);

      setOrders(ordersRes.data.data || []);
      setClients(clientsRes.data.data || []);
      setEmployees(employeesRes.data.data || []);
      setPaymentMethods(paymentMethodsRes.data.data || []);
      setBankNames(bankNamesRes.data.data || []);
      setTransferStatuses(transferStatusesRes.data.data || []);
      setPriorityLevels(priorityLevelsRes.data.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const params = {};
      if (fromDate) params.from_date = fromDate;
      if (toDate) params.to_date = toDate;
      const response = await api.get("/finance/summary", { params });
      setSummary(response.data.data);
    } catch (error) {
      console.error("Error fetching summary:", error);
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = {
        search: searchQuery,
        type: filters.type,
        payment_method: filters.payment_method,
        status: filters.status,
        priority_level: filters.priority_level,
        from_date: fromDate,
        to_date: toDate,
        sort_field: sortField,
        sort_direction: sortDirection,
        per_page: 1000,
        page: 1,
      };
      const response = await getTransactions(params);
      const transactionsData = response.data.data || [];
      setAllTransactions(transactionsData);

      const start = (currentPage - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      const paginatedData = transactionsData.slice(start, end);
      setTransactions(paginatedData);
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
    fetchSummary();
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
      status: "",
      priority_level: "",
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

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setSubmitError(null);
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
      await fetchTransactions();
      await fetchSummary();
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
        await fetchTransactions();
        await fetchSummary();
      } catch (error) {
        showError("خطأ", "حدث خطأ أثناء الحذف");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleUpdateField = async (id, field, value) => {
    setLoading(true);
    try {
      await updateTransaction(id, { [field]: value });
      showSuccess("تم", "تم التحديث بنجاح");
      await fetchTransactions();
      await fetchSummary();
    } catch (error) {
      showError(
        "خطأ",
        error.response?.data?.message || "حدث خطأ أثناء التحديث",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = () => {
    const exportData =
      allTransactions.length > 0 ? allTransactions : transactions;
    const columns = [
      { header: "رقم الحوالة", key: "id" },
      { header: "النوع", key: "type_text" },
      { header: "المبلغ", key: "amount" },
      { header: "رقم الطلب", key: "order_number" },
      { header: "صاحب التأشيرة", key: "visa_holder_name" },
      { header: "رقم الحوالة", key: "transfer_number" },
      { header: "طريقة الدفع", key: "payment_method" },
      { header: "بنك المستفيد", key: "bank_name" },
      { header: "تاريخ الحوالة", key: "transfer_date" },
      { header: "الحالة", key: "status" },
      { header: "درجة الأهمية", key: "priority_level" },
      { header: "الملاحظات", key: "notes" },
    ];
    exportToExcel(exportData, columns, "الحوالات.xlsx");
  };

  const handleExportPDF = () => {
    const exportData =
      allTransactions.length > 0 ? allTransactions : transactions;
    const columns = [
      { header: "رقم الحوالة", key: "id" },
      { header: "النوع", key: "type_text" },
      { header: "المبلغ", key: "amount" },
      { header: "رقم الطلب", key: "order_number" },
      { header: "صاحب التأشيرة", key: "visa_holder_name" },
      { header: "رقم الحوالة", key: "transfer_number" },
      { header: "طريقة الدفع", key: "payment_method" },
      { header: "بنك المستفيد", key: "bank_name" },
      { header: "تاريخ الحوالة", key: "transfer_date" },
      { header: "الحالة", key: "status" },
      { header: "درجة الأهمية", key: "priority_level" },
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
            <h1 className="h3 mb-0 fw-bold">الحسابات والحوالات</h1>
            <Button variant="dark" disabled>
              + حوالة جديدة
            </Button>
          </div>
          <Card className="shadow-sm border-0 rounded-4">
            <Card.Body className="p-0">
              <div className="table-responsive">
                <TableSkeleton rows={5} columns={14} />
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
          <h1 className="h3 mb-0 fw-bold">الحسابات والحوالات</h1>
          <div className="d-flex gap-2 flex-wrap">
            <RefreshButton
              onClick={() => {
                fetchTransactions();
                fetchSummary();
              }}
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
            <Button
              variant="dark"
              onClick={handleAddTransaction}
              className="d-flex align-items-center gap-2 rounded-3 shadow px-3 py-2"
            >
              <i className="fa-solid fa-plus"></i>
              <span>حوالة جديدة</span>
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

        <FinanceSummaryCards summary={summary} />

        <FinanceSearchBar
          searchQuery={searchQuery}
          onSearch={handleSearch}
          onClear={handleClearSearch}
          loading={loading}
          paymentMethods={paymentMethods}
          transferStatuses={transferStatuses}
          priorityLevels={priorityLevels}
          filters={filters}
          onFilterChange={handleFilterChange}
          sortField={sortField}
          sortDirection={sortDirection}
          onSortChange={handleSortChange}
        />

        <Card className="shadow-sm border-0 rounded-4 overflow-hidden">
          <Card.Body className="p-0">
            {loading ? (
              <div className="text-center py-5">
                <div className="table-responsive">
                  <TableSkeleton rows={5} columns={14} />
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
                    transferStatuses={transferStatuses}
                    priorityLevels={priorityLevels}
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
        priorityLevels={priorityLevels}
        transferStatuses={transferStatuses}
        loading={loading}
        isEdit={!!editingTransaction}
        error={submitError}
      />
    </div>
  );
};

export default FinancePage;
