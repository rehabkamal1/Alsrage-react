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
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [submitError, setSubmitError] = useState(null);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = transactions.filter((item) => {
        const orderIdMatch = item.order_number
          ?.toString()
          .includes(searchQuery);
        const clientNameMatch = item.client_name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());
        return orderIdMatch || clientNameMatch;
      });
      setFilteredTransactions(filtered);
    } else {
      setFilteredTransactions(transactions);
    }
    setCurrentPage(1);
  }, [searchQuery, transactions]);

  const fetchAllData = async () => {
    setInitialLoading(true);
    try {
      const [transactionsRes, summaryRes, ordersRes] = await Promise.all([
        getTransactions(),
        getFinanceSummary(),
        getOrders(),
      ]);
      setTransactions(transactionsRes.data.data || []);
      setFilteredTransactions(transactionsRes.data.data || []);
      setSummary(summaryRes.data.data);
      setOrders(ordersRes.data.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setFilteredTransactions(transactions);
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
        fetchAllData();
      } catch (error) {
        showError("خطأ", "حدث خطأ أثناء الحذف");
      } finally {
        setLoading(false);
      }
    }
  };

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedTransactions = filteredTransactions.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

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
              <TableSkeleton rows={5} columns={10} />
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
        />

        <Card className="shadow-sm border-0 rounded-4">
          <Card.Body className="p-0">
            {loading ? (
              <div className="text-center py-5">
                <TableSkeleton rows={3} columns={10} />
              </div>
            ) : (
              <>
                <FinanceTable
                  transactions={displayedTransactions}
                  onEdit={handleEditTransaction}
                  onDelete={handleDeleteTransaction}
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
        loading={loading}
        isEdit={!!editingTransaction}
        error={submitError}
      />
    </div>
  );
};

export default FinancePage;
