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
  }, []);

  useEffect(() => {
    fetchTransactions();
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
      setPaymentMethods(paymentRes.data.data);
      setBankNames(bankRes.data.data);
      setPriorityLevels(priorityRes.data.data);
      setTransferStatuses(transferRes.data.data);
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = {
        search: searchQuery,
        type: filters.type,
        status: filters.status,
        payment_method: filters.payment_method,
        priority_level: filters.priority_level,
        from_date: filterFromDate,
        to_date: filterToDate,
        sort_field: sortField,
        sort_direction: sortDirection,
        per_page: itemsPerPage,
        page: currentPage,
      };
      const response = await getTransactions(params);
      setTransactions(response.data.data);
      setFilteredTransactions(response.data.data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const params = {};
      if (filterFromDate) params.from_date = filterFromDate;
      if (filterToDate) params.to_date = filterToDate;
      const response = await getFinanceSummary(params);
      setSummary(response.data.data);
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
        await updateTransaction(editingTransaction.id, formData);
        showSuccess("تم التحديث!", "تم تحديث الحوالة بنجاح");
      } else {
        await createTransaction(formData);
        showSuccess("تمت الإضافة!", "تم إضافة الحوالة بنجاح");
      }
      setShowModal(false);
      setEditingTransaction(null);
      fetchTransactions();
      fetchSummary();
      fetchAllData();
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
        fetchTransactions();
        fetchSummary();
      } catch (error) {
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
          <Button variant="dark" onClick={handleAddTransaction}>
            + حوالة جديدة
          </Button>
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
