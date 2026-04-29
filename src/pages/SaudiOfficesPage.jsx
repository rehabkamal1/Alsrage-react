import React, { useState, useEffect } from "react";
import { Container, Card, Button } from "react-bootstrap";
import {
  getSaudiOffices,
  createSaudiOffice,
  updateSaudiOffice,
  deleteSaudiOffice,
} from "../services/apiService";
import { showSuccess, showError, showConfirm } from "../utils/swalHelper";
import SaudiOfficeFormModal from "../components/SaudiOffice/SaudiOfficeFormModal";
import SaudiOfficeTable from "../components/SaudiOffice/SaudiOfficeTable";
import SaudiOfficeSearchBar from "../components/SaudiOffice/SaudiOfficeSearchBar";
import TableSkeleton from "../components/common/TableSkeleton";
import PaginationComponent from "../components/common/Pagination";
import { exportToExcel } from "../utils/excelHelper";
import { exportToPDF } from "../utils/pdfHelper";

const SaudiOfficesPage = () => {
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
        const employeeMatch = office.responsible_employee
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());
        const destinationMatch = office.destination
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());
        return nameMatch || employeeMatch || destinationMatch;
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
      const response = await getSaudiOffices();
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
        await updateSaudiOffice(editingOffice.id, formData);
        showSuccess("تم التحديث!", "تم تحديث بيانات المكتب بنجاح");
      } else {
        await createSaudiOffice(formData);
        showSuccess("تمت الإضافة!", "تم إضافة المكتب السعودي بنجاح");
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
      "سيتم حذف المكتب السعودي نهائياً",
    );
    if (result.isConfirmed) {
      setLoading(true);
      try {
        await deleteSaudiOffice(id);
        showSuccess("تم الحذف", "تم حذف المكتب السعودي بنجاح");
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
      { header: "اسم المكتب", key: "name" },
      { header: "جهة الوصول", key: "destination" },
      { header: "المدينة", key: "city" },
      { header: "الموظف المسؤول", key: "responsible_employee" },
      { header: "رقم الجوال", key: "mobile" },
      { header: "رقم الهاتف", key: "phone" },
      { header: "العنوان", key: "address" },
      { header: "ملاحظات", key: "notes" },
    ];
    exportToExcel(filteredOffices, columns, "المكاتب_السعودية.xlsx");
  };

  const handleExportPDF = () => {
    const columns = [
      { header: "اسم المكتب", key: "name" },
      { header: "جهة الوصول", key: "destination" },
      { header: "المدينة", key: "city" },
      { header: "الموظف المسؤول", key: "responsible_employee" },
      { header: "رقم الجوال", key: "mobile" },
      { header: "رقم الهاتف", key: "phone" },
      { header: "العنوان", key: "address" },
      { header: "ملاحظات", key: "notes" },
    ];
    exportToPDF(filteredOffices, columns, "المكاتب_السعودية.pdf");
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
            <h1 className="h3 mb-0 fw-bold">المكاتب السعودية</h1>
            <Button variant="dark" disabled>
              + مكتب جديد
            </Button>
          </div>
          <Card className="shadow-sm border-0 rounded-4">
            <Card.Body className="p-0">
              <TableSkeleton rows={5} columns={7} />
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
          <h1 className="h3 mb-0 fw-bold">المكاتب السعودية</h1>
          <div className="d-flex gap-2">
            <Button
              variant="light"
              onClick={handleExport}
              className="d-flex align-items-center gap-2 rounded-3 border shadow-sm px-3 py-2 text-success fw-semibold"
              disabled={filteredOffices.length === 0}
            >
              <i className="fa-solid fa-file-excel fs-5"></i>
              <span>إكسيل</span>
            </Button>
            <Button
              variant="light"
              onClick={handleExportPDF}
              className="d-flex align-items-center gap-2 rounded-3 border shadow-sm px-3 py-2 text-danger fw-semibold"
              disabled={filteredOffices.length === 0}
            >
              <i className="fa-solid fa-file-pdf fs-5"></i>
              <span>بي دي اف</span>
            </Button>
            <Button
              variant="dark"
              onClick={handleAddOffice}
              className="d-flex align-items-center gap-2 rounded-3 shadow px-3 py-2"
            >
              <i className="fa-solid fa-plus"></i>
              <span>مكتب جديد</span>
            </Button>
          </div>
        </div>

        <SaudiOfficeSearchBar
          searchQuery={searchQuery}
          onSearch={handleSearch}
          onClear={handleClearSearch}
          loading={loading}
        />

        <Card className="shadow-sm border-0 rounded-4">
          <Card.Body className="p-0">
            {loading ? (
              <div className="text-center py-5">
                <TableSkeleton rows={3} columns={7} />
              </div>
            ) : (
              <>
                <SaudiOfficeTable
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

      <SaudiOfficeFormModal
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

export default SaudiOfficesPage;
