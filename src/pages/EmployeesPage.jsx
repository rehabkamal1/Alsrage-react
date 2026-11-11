import React, { useState, useEffect } from "react";
import { Container, Card, Button } from "react-bootstrap";
import RefreshButton from "../components/common/RefreshButton";
import DateFilterBar from "../components/common/DateFilterBar";
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  fetchAllPages,
} from "../services/apiService";
import { showSuccess, showError, showConfirm } from "../utils/swalHelper";
import EmployeeFormModal from "../components/Employee/EmployeeFormModal";
import EmployeeTable from "../components/Employee/EmployeeTable";
import EmployeeSearchBar from "../components/Employee/EmployeeSearchBar";
import TableSkeleton from "../components/common/TableSkeleton";
import PaginationComponent from "../components/common/Pagination";
import { exportToExcel } from "../utils/excelHelper";
import { exportToPDF } from "../utils/pdfHelper";
import { useDebounce } from "../hooks/useDebounce";

const EmployeesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 400);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [filters, setFilters] = useState({
    sort_by: "created_at",
    sort_dir: "desc",
  });
  const [submitError, setSubmitError] = useState(null);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  useEffect(() => {
    fetchEmployees();
  }, [debouncedSearch, filters, fromDate, toDate]);

  useEffect(() => {
    setTotalPages(Math.ceil(employees.length / itemsPerPage));
  }, [employees, itemsPerPage]);

  const fetchEmployees = async () => {
    if (initialLoading) {
      setInitialLoading(true);
    } else {
      setLoading(true);
    }
    try {
      const params = {
        search: debouncedSearch || undefined,
        sort_by: filters.sort_by,
        sort_dir: filters.sort_dir,
      };
      if (fromDate) params.from_date = fromDate;
      if (toDate) params.to_date = toDate;

      const employeeList = await fetchAllPages(getEmployees, params);
      setEmployees(employeeList);
      setTotalPages(Math.ceil(employeeList.length / itemsPerPage));
    } catch (error) {
      console.error("Error fetching employees:", error);
    } finally {
      setLoading(false);
      setInitialLoading(false);
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
      sort_by: "created_at",
      sort_dir: "desc",
    });
    setFromDate("");
    setToDate("");
    setCurrentPage(1);
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setCurrentPage(1);
  };

  const handleAddEmployee = () => {
    setEditingEmployee(null);
    setSubmitError(null);
    setShowModal(true);
  };

  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee);
    setSubmitError(null);
    setShowModal(true);
  };

  const handleSubmit = async (formData) => {
    setLoading(true);
    setSubmitError(null);
    try {
      if (editingEmployee) {
        await updateEmployee(editingEmployee.id, formData);
        showSuccess("تم التحديث!", "تم تحديث بيانات الموظف بنجاح");
      } else {
        await createEmployee(formData);
        showSuccess("تمت الإضافة!", "تم إضافة الموظف بنجاح");
      }
      setShowModal(false);
      setEditingEmployee(null);
      fetchEmployees();
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

  const handleDeleteEmployee = async (id) => {
    const result = await showConfirm(
      "هل أنت متأكد؟",
      "سيتم حذف الموظف نهائياً",
    );
    if (result.isConfirmed) {
      setLoading(true);
      try {
        await deleteEmployee(id);
        showSuccess("تم الحذف", "تم حذف الموظف بنجاح");
        fetchEmployees();
      } catch (error) {
        showError("خطأ", "حدث خطأ أثناء الحذف");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleExport = () => {
    const columns = [
      { header: "#", format: (_, index) => index + 1 },
      { header: "الاسم", key: "name" },
      { header: "اسم المستخدم", key: "username" },
      { header: "رقم الجوال", key: "phone" },
      { header: "المنصب", key: "position" },
      {
        header: "الصلاحيات",
        format: (employee) =>
          employee.permissions?.length
            ? `${employee.permissions.length} صلاحيات`
            : "-",
      },
    ];
    exportToExcel(employees, columns, "الموظفين.xlsx");
  };

  const handleExportPDF = () => {
    const columns = [
      { header: "#", format: (_, index) => index + 1 },
      { header: "الاسم", key: "name" },
      { header: "اسم المستخدم", key: "username" },
      { header: "رقم الجوال", key: "phone" },
      { header: "المنصب", key: "position" },
      {
        header: "الصلاحيات",
        format: (employee) =>
          employee.permissions?.length
            ? `${employee.permissions.length} صلاحيات`
            : "-",
      },
    ];
    exportToPDF(employees, columns, "الموظفين.pdf");
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedEmployees = employees.slice(
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
            <h1 className="h3 mb-0 fw-bold">الموظفين</h1>
            <Button variant="dark" disabled>
              + موظف جديد
            </Button>
          </div>
          <Card className="shadow-sm border-0 rounded-4">
            <Card.Body className="p-0">
              <TableSkeleton rows={5} columns={6} />
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
          <h1 className="h3 mb-0 fw-bold">الموظفين</h1>
          <div className="d-flex gap-2">
            <RefreshButton
              onClick={fetchEmployees}
              loading={loading}
              className="border shadow-sm text-primary fw-semibold"
            />
            <Button
              variant="light"
              onClick={handleExport}
              className="d-flex align-items-center gap-2 rounded-3 border shadow-sm px-3 py-2 text-success fw-semibold"
              disabled={employees.length === 0}
            >
              <i className="fa-solid fa-file-excel fs-5"></i>
              <span>إكسيل</span>
            </Button>
            <Button
              variant="light"
              onClick={handleExportPDF}
              className="d-flex align-items-center gap-2 rounded-3 border shadow-sm px-3 py-2 text-danger fw-semibold"
              disabled={employees.length === 0}
            >
              <i className="fa-solid fa-file-pdf fs-5"></i>
              <span>بي دي اف</span>
            </Button>
            <Button
              variant="dark"
              onClick={handleAddEmployee}
              className="d-flex align-items-center gap-2 rounded-3 shadow px-3 py-2"
            >
              <i className="fa-solid fa-plus"></i>
              <span>موظف جديد</span>
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

        <EmployeeSearchBar
          searchQuery={searchQuery}
          onSearch={handleSearch}
          onClear={handleClearSearch}
          filters={filters}
          onFilterChange={handleFilterChange}
          loading={loading}
        />

        <Card className="shadow-sm border-0 rounded-4">
          <Card.Body className="p-0">
            {loading ? (
              <div className="text-center py-5">
                <TableSkeleton rows={3} columns={6} />
              </div>
            ) : (
              <>
                <EmployeeTable
                  employees={displayedEmployees}
                  onEdit={handleEditEmployee}
                  onDelete={handleDeleteEmployee}
                  rowNumberOffset={(currentPage - 1) * itemsPerPage}
                />
                <PaginationComponent
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  totalItems={employees.length}
                  pageSize={itemsPerPage}
                  onPageSizeChange={(size) => {
                    setItemsPerPage(size);
                    setCurrentPage(1);
                  }}
                />
              </>
            )}
          </Card.Body>
        </Card>
      </Container>

      <EmployeeFormModal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setEditingEmployee(null);
          setSubmitError(null);
        }}
        onSubmit={handleSubmit}
        initialData={editingEmployee}
        loading={loading}
        isEdit={!!editingEmployee}
        error={submitError}
      />
    </div>
  );
};

export default EmployeesPage;
