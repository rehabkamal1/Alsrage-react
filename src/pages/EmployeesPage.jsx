import React, { useState, useEffect } from "react";
import { Container, Card, Button } from "react-bootstrap";
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../services/apiService";
import { showSuccess, showError, showConfirm } from "../utils/swalHelper";
import EmployeeFormModal from "../components/Employee/EmployeeFormModal";
import EmployeeTable from "../components/Employee/EmployeeTable";
import EmployeeSearchBar from "../components/Employee/EmployeeSearchBar";
import TableSkeleton from "../components/common/TableSkeleton";
import PaginationComponent from "../components/common/Pagination";

const EmployeesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [submitError, setSubmitError] = useState(null);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = employees.filter((emp) => {
        const nameMatch = emp.name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());
        const phoneMatch = emp.phone?.includes(searchQuery);
        const positionMatch = emp.position
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());
        return nameMatch || phoneMatch || positionMatch;
      });
      setFilteredEmployees(filtered);
    } else {
      setFilteredEmployees(employees);
    }
    setCurrentPage(1);
  }, [searchQuery, employees]);

  const fetchEmployees = async () => {
    setInitialLoading(true);
    try {
      const response = await getEmployees();
      setEmployees(response.data || []);
      setFilteredEmployees(response.data || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setFilteredEmployees(employees);
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

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedEmployees = filteredEmployees.slice(
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
          <Button variant="dark" onClick={handleAddEmployee}>
            + موظف جديد
          </Button>
        </div>

        <EmployeeSearchBar
          searchQuery={searchQuery}
          onSearch={handleSearch}
          onClear={handleClearSearch}
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
