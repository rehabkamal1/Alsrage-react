import React, { useState, useEffect } from "react";
import { Container, Card, Button } from "react-bootstrap";
import {
  getOrderTracking,
  createOrderTracking,
  updateOrderTracking,
  deleteOrderTracking,
  getOrders,
} from "../services/apiService";
import api from "../services/apiService";
import { showSuccess, showError, showConfirm } from "../utils/swalHelper";
import TrackingFormModal from "../components/Tracking/TrackingFormModal";
import TrackingTable from "../components/Tracking/TrackingTable";
import TrackingSearchBar from "../components/Tracking/TrackingSearchBar";
import TableSkeleton from "../components/common/TableSkeleton";
import PaginationComponent from "../components/common/Pagination";

const TrackingPage = () => {
  const [tracking, setTracking] = useState([]);
  const [filteredTracking, setFilteredTracking] = useState([]);
  const [orders, setOrders] = useState([]);
  const [priorityLevels, setPriorityLevels] = useState([]);
  const [passportStatuses, setPassportStatuses] = useState([]);
  const [transferStatuses, setTransferStatuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTracking, setEditingTracking] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [submitError, setSubmitError] = useState(null);
  const [filters, setFilters] = useState({
    priority_level: "",
    passport_status: "",
    transfer_status: "",
  });
  const [sortField, setSortField] = useState("id");
  const [sortDirection, setSortDirection] = useState("desc");
  const itemsPerPage = 10;

  useEffect(() => {
    fetchAllData();
    fetchSettings();
  }, []);

  useEffect(() => {
    fetchTracking();
  }, [filters, sortField, sortDirection, searchQuery, currentPage]);

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
      const [priorityRes, passportRes, transferRes] = await Promise.all([
        api.get("/settings/priority-levels"),
        api.get("/settings/passport-statuses"),
        api.get("/settings/transfer-statuses"),
      ]);
      setPriorityLevels(priorityRes.data.data);
      setPassportStatuses(passportRes.data.data);
      setTransferStatuses(transferRes.data.data);
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  const fetchTracking = async () => {
    setLoading(true);
    try {
      const params = {
        search: searchQuery,
        priority_level: filters.priority_level,
        passport_status: filters.passport_status,
        transfer_status: filters.transfer_status,
        sort_field: sortField,
        sort_direction: sortDirection,
        per_page: itemsPerPage,
        page: currentPage,
      };
      const response = await getOrderTracking(params);
      setTracking(response.data.data);
      setFilteredTracking(response.data.data);
    } catch (error) {
      console.error("Error fetching tracking:", error);
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
      priority_level: "",
      passport_status: "",
      transfer_status: "",
    });
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

  const handleAddTracking = () => {
    setEditingTracking(null);
    setSubmitError(null);
    setShowModal(true);
  };

  const handleEditTracking = (item) => {
    setEditingTracking(item);
    setSubmitError(null);
    setShowModal(true);
  };

  const handleSubmit = async (formData) => {
    setLoading(true);
    setSubmitError(null);
    try {
      if (editingTracking) {
        await updateOrderTracking(editingTracking.id, formData);
        showSuccess("تم التحديث!", "تم تحديث متابعة الطلب بنجاح");
      } else {
        await createOrderTracking(formData);
        showSuccess("تمت الإضافة!", "تم إضافة متابعة الطلب بنجاح");
      }
      setShowModal(false);
      setEditingTracking(null);
      fetchTracking();
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

  const handleDeleteTracking = async (id) => {
    const result = await showConfirm(
      "هل أنت متأكد؟",
      "سيتم حذف المتابعة نهائياً",
    );
    if (result.isConfirmed) {
      setLoading(true);
      try {
        await deleteOrderTracking(id);
        showSuccess("تم الحذف", "تم حذف المتابعة بنجاح");
        fetchTracking();
      } catch (error) {
        showError("خطأ", "حدث خطأ أثناء الحذف");
      } finally {
        setLoading(false);
      }
    }
  };

  const totalPages = Math.ceil(tracking.length / itemsPerPage);

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
            <h1 className="h3 mb-0 fw-bold">متابعة الطلبات</h1>
            <Button variant="dark" disabled>
              + متابعة جديدة
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
          <h1 className="h3 mb-0 fw-bold">متابعة الطلبات</h1>
          <Button variant="dark" onClick={handleAddTracking}>
            + متابعة جديدة
          </Button>
        </div>

        <TrackingSearchBar
          searchQuery={searchQuery}
          onSearch={handleSearch}
          onClear={handleClearSearch}
          loading={loading}
          priorityLevels={priorityLevels}
          passportStatuses={passportStatuses}
          transferStatuses={transferStatuses}
          filters={filters}
          onFilterChange={handleFilterChange}
          sortField={sortField}
          sortDirection={sortDirection}
          onSortChange={handleSortChange}
        />

        <Card className="shadow-sm border-0 rounded-4">
          <Card.Body className="p-0">
            {loading ? (
              <div className="text-center py-5">
                <TableSkeleton rows={3} columns={12} />
              </div>
            ) : (
              <>
                <TrackingTable
                  tracking={filteredTracking}
                  onEdit={handleEditTracking}
                  onDelete={handleDeleteTracking}
                  onRefresh={fetchTracking}
                  priorityLevels={priorityLevels}
                  passportStatuses={passportStatuses}
                  transferStatuses={transferStatuses}
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

      <TrackingFormModal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setEditingTracking(null);
          setSubmitError(null);
        }}
        onSubmit={handleSubmit}
        initialData={editingTracking}
        orders={orders}
        priorityLevels={priorityLevels}
        passportStatuses={passportStatuses}
        transferStatuses={transferStatuses}
        loading={loading}
        isEdit={!!editingTracking}
        error={submitError}
      />
    </div>
  );
};

export default TrackingPage;
