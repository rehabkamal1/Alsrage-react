import React, { useState, useEffect } from "react";
import { Container, Card, Button } from "react-bootstrap";
import {
  getOrderTracking,
  createOrderTracking,
  updateOrderTracking,
  deleteOrderTracking,
} from "../services/apiService";
import { showSuccess, showError, showConfirm } from "../utils/swalHelper";
import TrackingFormModal from "../components/Tracking/TrackingFormModal";
import TrackingTable from "../components/Tracking/TrackingTable";
import TrackingSearchBar from "../components/Tracking/TrackingSearchBar";
import TableSkeleton from "../components/common/TableSkeleton";
import PaginationComponent from "../components/common/Pagination";

const TrackingPage = () => {
  const [tracking, setTracking] = useState([]);
  const [filteredTracking, setFilteredTracking] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTracking, setEditingTracking] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [submitError, setSubmitError] = useState(null);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchTracking();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = tracking.filter((item) => {
        const orderIdMatch = item.order_id?.toString().includes(searchQuery);
        const clientNameMatch = item.client_name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());
        const clientPhoneMatch = item.client_phone?.includes(searchQuery);
        const visaNumberMatch = item.visa_number
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());
        return (
          orderIdMatch || clientNameMatch || clientPhoneMatch || visaNumberMatch
        );
      });
      setFilteredTracking(filtered);
    } else {
      setFilteredTracking(tracking);
    }
    setCurrentPage(1);
  }, [searchQuery, tracking]);

  const fetchTracking = async () => {
    setInitialLoading(true);
    try {
      const response = await getOrderTracking();
      setTracking(response.data.data || []);
      setFilteredTracking(response.data.data || []);
    } catch (error) {
      console.error("Error fetching tracking:", error);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setFilteredTracking(tracking);
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

  const totalPages = Math.ceil(filteredTracking.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedTracking = filteredTracking.slice(
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
            <h1 className="h3 mb-0 fw-bold">متابعة الطلبات</h1>
            <Button variant="dark" disabled>
              + متابعة جديدة
            </Button>
          </div>
          <Card className="shadow-sm border-0 rounded-4">
            <Card.Body className="p-0">
              <TableSkeleton rows={5} columns={11} />
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
        />

        <Card className="shadow-sm border-0 rounded-4">
          <Card.Body className="p-0">
            {loading ? (
              <div className="text-center py-5">
                <TableSkeleton rows={3} columns={11} />
              </div>
            ) : (
              <>
                <TrackingTable
                  tracking={displayedTracking}
                  onEdit={handleEditTracking}
                  onDelete={handleDeleteTracking}
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
        loading={loading}
        isEdit={!!editingTracking}
      />
    </div>
  );
};

export default TrackingPage;
