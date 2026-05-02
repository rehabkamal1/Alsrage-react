import React, { useState, useEffect } from "react";
import { Container, Card, Button } from "react-bootstrap";
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getFinanceSummary,
  getOrders,
} from "../services/apiService";
import api from "../services/apiService";
import { showSuccess, showError, showConfirm } from "../utils/swalHelper";
import FinanceFormModal from "../components/Finance/FinanceFormModal";
import FinanceTable from "../components/Finance/FinanceTable";
import FinanceSummaryCards from "../components/Finance/FinanceSummaryCards";
import FinanceSearchBar from "../components/Finance/FinanceSearchBar";
import TableSkeleton from "../components/common/TableSkeleton";
import PaginationComponent from "../components/common/Pagination";
import { exportToExcel } from "../utils/excelHelper";
import { exportToPDF } from "../utils/pdfHelper";

const FinancePage = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [bankNames, setBankNames] = useState([]);
  const [priorityLevels, setPriorityLevels] = useState([]);
  const [transferStatuses, setTransferStatuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [submitError, setSubmitError] = useState(null);
  const [filters, setFilters] = useState({
    type: "",
    status: "",
    payment_method: "",
    priority_level: "",
  });
  const [sortField, setSortField] = useState("id");
  const [sortDirection, setSortDirection] = useState("desc");
  const [filterFromDate, setFilterFromDate] = useState("");
  const [filterToDate, setFilterToDate] = useState("");
  const itemsPerPage = 10;

  useEffect(() => {
    fetchAllData();
    fetchSettings();
    fetchSummary();
  }, []);

  useEffect(() => {
    fetchTransactions();
    fetchSummary();
  }, [
    searchQuery,
    filters,
    sortField,
    sortDirection,
    filterFromDate,
    filterToDate,
    currentPage,
  ]);

  const fetchAllData = async () => {
    setInitialLoading(true);
    try {
      const ordersRes = await getOrders();
      console.log("fetchAllData - Orders response:", ordersRes.data);
      setOrders(ordersRes.data.data || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const [paymentRes, bankRes, priorityRes, transferRes] = await Promise.all(
        [
          api.get("/settings/payment-methods"),
          api.get("/settings/bank-names"),
          api.get("/settings/priority-levels"),
          api.get("/settings/transfer-statuses"),
        ],
      );
      setPaymentMethods(paymentRes.data.data || []);
      setBankNames(bankRes.data.data || []);
      setPriorityLevels(priorityRes.data.data || []);
      setTransferStatuses(transferRes.data.data || []);
      console.log("Settings loaded:", {
        paymentMethods,
        bankNames,
        priorityLevels,
        transferStatuses,
      });
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = {
        per_page: itemsPerPage,
        page: currentPage,
        sort_field: sortField,
        sort_direction: sortDirection,
      };

      if (searchQuery && searchQuery.trim() !== "") {
        params.search = searchQuery;
      }
      if (filters.type && filters.type !== "") {
        params.type = filters.type;
      }
      if (filters.status && filters.status !== "") {
        params.status = filters.status;
      }
      if (filters.payment_method && filters.payment_method !== "") {
        params.payment_method = filters.payment_method;
      }
      if (filters.priority_level && filters.priority_level !== "") {
        params.priority_level = filters.priority_level;
      }
      if (filterFromDate && filterFromDate.trim() !== "") {
        params.from_date = filterFromDate;
      }
      if (filterToDate && filterToDate.trim() !== "") {
        params.to_date = filterToDate;
      }

      console.log("fetchTransactions - Params:", params);
      const response = await getTransactions(params);
      console.log("fetchTransactions - Response:", response.data);
      setTransactions(response.data.data || []);
      setFilteredTransactions(response.data.data || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const params = {};
      if (filterFromDate && filterFromDate.trim() !== "") {
        params.from_date = filterFromDate;
      }
      if (filterToDate && filterToDate.trim() !== "") {
        params.to_date = filterToDate;
      }
      console.log("===== fetchSummary START =====");
      console.log("Params:", params);
      console.log("filterFromDate:", filterFromDate);
      console.log("filterToDate:", filterToDate);

      const response = await getFinanceSummary(params);

      console.log("Raw response:", response);
      console.log("response.data:", response.data);
      console.log("response.data.data:", response.data?.data);
      console.log("===== fetchSummary END =====");

      if (response.data && response.data.data) {
        setSummary(response.data.data);
      } else if (response.data) {
        setSummary(response.data);
      }
    } catch (error) {
      console.error("Error fetching summary:", error);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setFilters({
      type: "",
      status: "",
      payment_method: "",
      priority_level: "",
    });
    setFilterFromDate("");
    setFilterToDate("");
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
        const response = await updateTransaction(
          editingTransaction.id,
          formData,
        );
        console.log("Update transaction response:", response.data);
        showSuccess("تم التحديث!", "تم تحديث الحوالة بنجاح");
      } else {
        const response = await createTransaction(formData);
        console.log("Create transaction response:", response.data);
        showSuccess("تمت الإضافة!", "تم إضافة الحوالة بنجاح");
      }
      setShowModal(false);
      setEditingTransaction(null);
      setCurrentPage(1);
      await fetchTransactions();
      await fetchSummary();
      await fetchAllData();
    } catch (error) {
      console.error("Submit error:", error.response?.data || error.message);
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
        fetchTransactions();
        fetchSummary();
      } catch (error) {
        console.error("Delete error:", error);
        showError("خطأ", "حدث خطأ أثناء الحذف");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDateFilter = async () => {
    setCurrentPage(1);
    await fetchTransactions();
    await fetchSummary();
  };

  const handleExportExcel = () => {
    const columns = [
      { header: "رقم الطلب", key: "order_id" },
      {
        header: "المبلغ",
        key: "amount",
        format: (item) => `${item.amount} ريال`,
      },
      {
        header: "النوع",
        key: "type",
        format: (item) => (item.type === "receipt" ? "قبض" : "صرف"),
      },
      {
        header: "طريقة الدفع",
        key: "payment_method",
        format: (item) => {
          const found = paymentMethods?.find(
            (p) => p.value === item.payment_method,
          );
          return found?.label || item.payment_method || "-";
        },
      },
      { header: "اسم البنك", key: "bank_name" },
      { header: "رقم الحوالة", key: "transfer_number" },
      { header: "تاريخ التحويل", key: "transfer_date" },
      {
        header: "الحالة",
        key: "status",
        format: (item) => {
          const found = transferStatuses?.find((s) => s.value === item.status);
          return found?.label || item.status || "-";
        },
      },
      {
        header: "درجة الأهمية",
        key: "priority_level",
        format: (item) => {
          const found = priorityLevels?.find(
            (p) => p.value === item.priority_level,
          );
          return found?.label || item.priority_level || "-";
        },
      },
      { header: "الملاحظات", key: "notes" },
    ];
    exportToExcel(filteredTransactions, columns, "الحسابات_والحوالات.xlsx");
  };

  const handleExportPDF = () => {
    const columns = [
      { header: "رقم الطلب", key: "order_id" },
      {
        header: "المبلغ",
        key: "amount",
        format: (item) => `${item.amount} ريال`,
      },
      {
        header: "النوع",
        key: "type",
        format: (item) => (item.type === "receipt" ? "قبض" : "صرف"),
      },
      {
        header: "طريقة الدفع",
        key: "payment_method",
        format: (item) => {
          const found = paymentMethods?.find(
            (p) => p.value === item.payment_method,
          );
          return found?.label || item.payment_method || "-";
        },
      },
      { header: "اسم البنك", key: "bank_name" },
      { header: "رقم الحوالة", key: "transfer_number" },
      { header: "تاريخ التحويل", key: "transfer_date" },
      {
        header: "الحالة",
        key: "status",
        format: (item) => {
          const found = transferStatuses?.find((s) => s.value === item.status);
          return found?.label || item.status || "-";
        },
      },
      {
        header: "درجة الأهمية",
        key: "priority_level",
        format: (item) => {
          const found = priorityLevels?.find(
            (p) => p.value === item.priority_level,
          );
          return found?.label || item.priority_level || "-";
        },
      },
    ];
    exportToPDF(filteredTransactions, columns, "الحسابات_والحوالات.pdf");
  };

  const totalPages = Math.ceil(transactions.length / itemsPerPage);

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
            <h1 className="h3 mb-0 fw-bold">الحسابات والحوالات</h1>
            <Button variant="dark" disabled>
              + حوالة جديدة
            </Button>
          </div>
          <Card className="shadow-sm border-0 rounded-4">
            <Card.Body className="p-0">
              <TableSkeleton rows={5} columns={12} />
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
          <h1 className="h3 mb-0 fw-bold">الحسابات والحوالات</h1>
          <div className="d-flex gap-2">
            <Button
              variant="light"
              onClick={handleExportExcel}
              disabled={filteredTransactions.length === 0}
              className="d-flex align-items-center gap-2 rounded-3 border shadow-sm px-3 py-2 text-success fw-semibold"
            >
              <i className="fa-solid fa-file-excel fs-5"></i>
              <span>إكسيل</span>
            </Button>
            <Button
              variant="light"
              onClick={handleExportPDF}
              disabled={filteredTransactions.length === 0}
              className="d-flex align-items-center gap-2 rounded-3 border shadow-sm px-3 py-2 text-danger fw-semibold"
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

        {summary && <FinanceSummaryCards summary={summary} />}

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
          filterFromDate={filterFromDate}
          filterToDate={filterToDate}
          setFilterFromDate={setFilterFromDate}
          setFilterToDate={setFilterToDate}
          onDateFilter={handleDateFilter}
        />

        <Card className="shadow-sm border-0 rounded-4">
          <Card.Body className="p-0">
            {loading ? (
              <div className="text-center py-5">
                <TableSkeleton rows={3} columns={12} />
              </div>
            ) : (
              <>
                <FinanceTable
                  transactions={filteredTransactions}
                  onEdit={handleEditTransaction}
                  onDelete={handleDeleteTransaction}
                  paymentMethods={paymentMethods}
                  transferStatuses={transferStatuses}
                  priorityLevels={priorityLevels}
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
