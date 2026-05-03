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
import { sendWhatsAppNotification } from "../utils/sendWhatsAppNotification";
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
  const [allTransactionsData, setAllTransactionsData] = useState([]);
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

      setPaymentMethods(
        (paymentRes.data.data || []).map((item) => ({
          value: item.value || item.key,
          label: item.label,
          color: item.color || "#6c757d",
        })),
      );

      setBankNames(
        (bankRes.data.data || []).map((item) => ({
          value: item.value || item.key,
          label: item.label,
          color: item.color || "#6c757d",
        })),
      );

      setPriorityLevels(
        (priorityRes.data.data || []).map((item) => ({
          value: item.value || item.key,
          label: item.label,
          color: item.color || "#6c757d",
        })),
      );

      setTransferStatuses(
        (transferRes.data.data || []).map((item) => ({
          value: item.value || item.key,
          label: item.label,
          color: item.color || "#6c757d",
        })),
      );
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  const enrichTransactionWithOrderData = (transactionsData) => {
    console.log("========== enrichTransactionWithOrderData ==========");
    console.log("Orders available:", orders);

    return transactionsData.map((item) => {
      const order = orders.find((o) => o.id === item.order_id);
      console.log(
        `Processing transaction ${item.id}, order_id: ${item.order_id}`,
      );
      console.log(`Found order:`, order);

      if (order) {
        const enriched = {
          ...item,
          visa_holder_name:
            order.visa_holder_name || order.client?.visa_holder_name || "-",
          visa_number: order.visa_number || "-",
          client_name: order.client?.name,
          client_phone: order.client?.phone || order.client?.mobile,
          order_number: order.id,
        };
        console.log(`Enriched visa_holder_name:`, enriched.visa_holder_name);
        console.log(`Enriched transfer_number:`, enriched.transfer_number);
        return enriched;
      }
      return {
        ...item,
        visa_holder_name: "-",
        visa_number: "-",
        order_number: item.order_id,
      };
    });
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = {
        per_page: 1000,
        page: 1,
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

      const response = await getTransactions(params);
      const transactionsData = response.data.data || [];
      console.log("Raw transactions data from API:", transactionsData);

      if (transactionsData.length > 0) {
        console.log("First transaction:", transactionsData[0]);
        console.log(
          "transfer_number in API:",
          transactionsData[0].transfer_number,
        );
        console.log(
          "visa_holder_name in API:",
          transactionsData[0].visa_holder_name,
        );
      }

      const enrichedData = enrichTransactionWithOrderData(transactionsData);
      console.log("Enriched transactions data:", enrichedData);

      if (enrichedData.length > 0) {
        console.log("First enriched transaction:", enrichedData[0]);
        console.log(
          "transfer_number after enrich:",
          enrichedData[0].transfer_number,
        );
        console.log(
          "visa_holder_name after enrich:",
          enrichedData[0].visa_holder_name,
        );
      }

      setAllTransactionsData(enrichedData);

      const start = (currentPage - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      const paginatedData = enrichedData.slice(start, end);
      setTransactions(paginatedData);
      setFilteredTransactions(paginatedData);
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

      const response = await getFinanceSummary(params);

      if (response.data && response.data.data) {
        setSummary(response.data.data);
      } else if (response.data) {
        setSummary(response.data);
      }
    } catch (error) {
      console.error("Error fetching summary:", error);
    }
  };

  const getFieldLabel = (field) => {
    const labels = {
      payment_method: "طريقة الدفع",
      bank_name: "بنك المستفيد",
      status: "حالة الحوالة",
      priority_level: "درجة الأهمية",
    };
    return labels[field] || field;
  };

  const handleUpdateField = async (transactionId, field, value) => {
    setLoading(true);
    try {
      const oldTransaction = allTransactionsData.find(
        (t) => t.id === transactionId,
      );
      const oldStatus = oldTransaction?.status;

      const response = await updateTransaction(transactionId, {
        [field]: value,
      });
      showSuccess("تم", `تم تحديث ${getFieldLabel(field)} بنجاح`);

      const updatedTransaction = response.data?.data || {
        ...oldTransaction,
        [field]: value,
      };

      await fetchTransactions();
      await fetchSummary();

      if (field === "status" && oldStatus && oldStatus !== value) {
        const updated = allTransactionsData.find((t) => t.id === transactionId);
        if (updated) {
          await sendWhatsAppNotification(
            updated,
            oldStatus,
            value,
            orders,
            paymentMethods,
            transferStatuses,
            allTransactionsData,
          );
        }
      }
    } catch (error) {
      showError(
        "خطأ",
        error.response?.data?.message || "حدث خطأ أثناء التحديث",
      );
    } finally {
      setLoading(false);
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
    console.log("========== handleEditTransaction ==========");
    console.log("Original transaction from table:", transaction);
    console.log("transaction.transfer_number:", transaction.transfer_number);
    console.log("transaction.visa_holder_name:", transaction.visa_holder_name);

    setEditingTransaction(transaction);
    setSubmitError(null);
    setShowModal(true);
  };

const handleSubmit = async (formData) => {
  setLoading(true);
  setSubmitError(null);
  try {
    if (editingTransaction) {
      const oldTransaction = allTransactionsData.find(
        (t) => t.id === editingTransaction.id,
      );
      const oldStatus = oldTransaction?.status;
      const newStatus = formData.status;

      const response = await updateTransaction(editingTransaction.id, formData);
      showSuccess("تم التحديث!", "تم تحديث الحوالة بنجاح");

      await fetchTransactions();
      await fetchSummary();

      if (oldStatus && newStatus && oldStatus !== newStatus) {
        const updated = allTransactionsData.find(
          (t) => t.id === editingTransaction.id,
        );
        if (updated) {
          await sendWhatsAppNotification(
            updated,
            oldStatus,
            newStatus,
            orders,
            paymentMethods,
            transferStatuses,
            allTransactionsData,
          );
        }
      }
    } else {
      const response = await createTransaction(formData);
      showSuccess("تمت الإضافة!", "تم إضافة الحوالة بنجاح");

      await fetchTransactions();
      await fetchSummary();
      await fetchAllData();

      const newTransaction = response.data?.data;
      if (newTransaction && newTransaction.status) {
        await sendWhatsAppNotification(
          newTransaction,
          null,
          newTransaction.status,
          orders,
          paymentMethods,
          transferStatuses,
          allTransactionsData,
        );
      }
    }
    setShowModal(false);
    setEditingTransaction(null);
    setCurrentPage(1);
  } catch (error) {
    setSubmitError(error.response?.data);
    showError("خطأ!", error.response?.data?.message || "حدث خطأ أثناء العملية");
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

  const handleDateFilter = async () => {
    setCurrentPage(1);
    await fetchTransactions();
    await fetchSummary();
  };

  const handleExportExcel = () => {
    const exportData =
      allTransactionsData.length > 0
        ? allTransactionsData
        : filteredTransactions;
    const columns = [
      { header: "رقم الطلب", key: "order_id" },
      { header: "صاحب التأشيرة", key: "visa_holder_name" },
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
    exportToExcel(exportData, columns, "الحسابات_والحوالات.xlsx");
  };

  const handleExportPDF = () => {
    const exportData =
      allTransactionsData.length > 0
        ? allTransactionsData
        : filteredTransactions;
    const columns = [
      { header: "رقم الطلب", key: "order_id" },
      { header: "صاحب التأشيرة", key: "visa_holder_name" },
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
    exportToPDF(exportData, columns, "الحسابات_والحوالات.pdf");
  };

  const totalPages = Math.ceil(allTransactionsData.length / itemsPerPage);
  const currentData = transactions;

  useEffect(() => {
    fetchSummary();
  }, [filterFromDate, filterToDate]);

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
                <TableSkeleton rows={5} columns={12} />
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
            <Button
              variant="light"
              onClick={handleExportExcel}
              disabled={allTransactionsData.length === 0}
              className="d-flex align-items-center gap-2 rounded-3 border shadow-sm px-3 py-2 text-success fw-semibold"
            >
              <i className="fa-solid fa-file-excel fs-5"></i>
              <span>إكسيل</span>
            </Button>
            <Button
              variant="light"
              onClick={handleExportPDF}
              disabled={allTransactionsData.length === 0}
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

        {summary && (
          <div className="mb-4">
            <FinanceSummaryCards summary={summary} />
          </div>
        )}

        <div className="mb-4">
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
        </div>

        <Card className="shadow-sm border-0 rounded-4 overflow-hidden">
          <Card.Body className="p-0">
            {loading ? (
              <div className="text-center py-5">
                <div className="table-responsive">
                  <TableSkeleton rows={5} columns={12} />
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
