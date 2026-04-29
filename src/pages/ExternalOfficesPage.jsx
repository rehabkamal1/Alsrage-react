import React, { useState, useEffect } from "react";
import { Container, Card, Button } from "react-bootstrap";
import {
  getExternalOffices,
  createExternalOffice,
  updateExternalOffice,
  deleteExternalOffice,
} from "../services/apiService";
import { showSuccess, showError, showConfirm } from "../utils/swalHelper";
import ExternalOfficeFormModal from "../components/ExternalOffice/ExternalOfficeFormModal";
import ExternalOfficeTable from "../components/ExternalOffice/ExternalOfficeTable";
import ExternalOfficeSearchBar from "../components/ExternalOffice/ExternalOfficeSearchBar";
import TableSkeleton from "../components/common/TableSkeleton";
import PaginationComponent from "../components/common/Pagination";
import { exportToExcel } from "../utils/excelHelper";

const ExternalOfficesPage = () => {
  const [offices, setOffices] = useState([]);
  const [filteredOffices, setFilteredOffices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingOffice, setEditingOffice] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [submitError, setSubmitError] = useState(null);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchOffices();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = offices.filter((office) => {
        const nameMatch = office.name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());
        const countryMatch = office.country
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());
        return nameMatch || countryMatch;
      });
      setFilteredOffices(filtered);
    } else {
      setFilteredOffices(offices);
    }
    setCurrentPage(1);
  }, [searchQuery, offices]);

  const fetchOffices = async () => {
    setInitialLoading(true);
    try {
      const response = await getExternalOffices();
      setOffices(response.data.data || []);
      setFilteredOffices(response.data.data || []);
    } catch (error) {
      console.error("Error fetching offices:", error);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setFilteredOffices(offices);
  };

  const handleAddOffice = () => {
    setEditingOffice(null);
    setSubmitError(null);
    setShowModal(true);
  };

  const handleEditOffice = (office) => {
    setEditingOffice(office);
    setSubmitError(null);
    setShowModal(true);
  };

  const handleSubmit = async (formData) => {
    setLoading(true);
    setSubmitError(null);
    try {
      if (editingOffice) {
        await updateExternalOffice(editingOffice.id, formData);
        showSuccess("تم التحديث!", "تم تحديث بيانات المكتب بنجاح");
      } else {
        await createExternalOffice(formData);
        showSuccess("تمت الإضافة!", "تم إضافة المكتب الخارجي بنجاح");
      }
      setShowModal(false);
      setEditingOffice(null);
      fetchOffices();
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

  const handleDeleteOffice = async (id) => {
    const result = await showConfirm(
      "هل أنت متأكد؟",
      "سيتم حذف المكتب الخارجي نهائياً",
    );
    if (result.isConfirmed) {
      setLoading(true);
      try {
        await deleteExternalOffice(id);
        showSuccess("تم الحذف", "تم حذف المكتب الخارجي بنجاح");
        fetchOffices();
      } catch (error) {
        showError("خطأ", "حدث خطأ أثناء الحذف");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleExport = () => {
    const columns = [
      { header: "الدولة", key: "country" },
      { header: "اسم المكتب", key: "name" },
      {
        header: "أسماء الموظفين",
        format: (office) =>
          office.contacts?.map((c) => c.name).join("، ") || "-",
      },
      {
        header: "أرقام التواصل",
        format: (office) =>
          office.contacts?.map((c) => c.phone).join("، ") || "-",
      },
      { header: "ملاحظات", key: "notes" },
    ];
    exportToExcel(filteredOffices, columns, "المكاتب_الخارجية.xlsx");
  };

  const totalPages = Math.ceil(filteredOffices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedOffices = filteredOffices.slice(
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
            <h1 className="h3 mb-0 fw-bold">المكاتب الخارجية</h1>
            <Button variant="dark" disabled>
              + مكتب جديد
            </Button>
          </div>
          <Card className="shadow-sm border-0 rounded-4">
            <Card.Body className="p-0">
              <TableSkeleton rows={5} columns={5} />
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
          <h1 className="h3 mb-0 fw-bold">المكاتب الخارجية</h1>
          <div>
            <Button
              variant="outline-success"
              onClick={handleExport}
              className="me-2"
              disabled={filteredOffices.length === 0}
            >
              📊 تصدير إكسيل
            </Button>
            <Button variant="dark" onClick={handleAddOffice}>
              + مكتب جديد
            </Button>
          </div>
        </div>

        <ExternalOfficeSearchBar
          searchQuery={searchQuery}
          onSearch={handleSearch}
          onClear={handleClearSearch}
          loading={loading}
        />

        <Card className="shadow-sm border-0 rounded-4">
          <Card.Body className="p-0">
            {loading ? (
              <div className="text-center py-5">
                <TableSkeleton rows={3} columns={5} />
              </div>
            ) : (
              <>
                <ExternalOfficeTable
                  offices={displayedOffices}
                  onEdit={handleEditOffice}
                  onDelete={handleDeleteOffice}
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

      <ExternalOfficeFormModal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setEditingOffice(null);
          setSubmitError(null);
        }}
        onSubmit={handleSubmit}
        initialData={editingOffice}
        loading={loading}
        isEdit={!!editingOffice}
        error={submitError}
      />
    </div>
  );
};

export default ExternalOfficesPage;
