import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import {
  getClients,
  createClient,
  updateClient,
  deleteClient,
} from "../services/apiService";
import { showSuccess, showError, showConfirm } from "../utils/swalHelper";
import ClientFormModal from "../components/Client/ClientFormModal";
import ClientTable from "../components/Client/ClientTable";
import ClientSearchBar from "../components/Client/ClientSearchBar";
import PaginationComponent from "../components/common/Pagination";
import LoadingSpinner from "../components/common/LoadingSpinner";
import TableSkeleton from "../components/common/TableSkeleton";
import { exportToExcel } from "../utils/excelHelper";

const ClientsPage = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    client_type: "",
    sort_by: "created_at",
    sort_dir: "desc",
  });
  const itemsPerPage = 8;

  useEffect(() => {
    fetchClients();
  }, [currentPage, searchQuery, filters]);

  const fetchClients = async () => {
    if (initialLoading) {
      setInitialLoading(true);
    } else {
      setLoading(true);
    }
    try {
      const params = {
        page: currentPage,
        per_page: itemsPerPage,
        search: searchQuery || undefined,
        client_type: filters.client_type || undefined,
        sort_by: filters.sort_by,
        sort_dir: filters.sort_dir,
      };
      const response = await getClients(params);
      setClients(response.data.data || []);
      setTotalPages(response.data.meta?.last_page || 1);
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setCurrentPage(1);
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setCurrentPage(1);
  };

  const handleAddClient = () => {
    setEditingClient(null);
    setShowModal(true);
  };

  const handleEditClient = (client) => {
    setEditingClient(client);
    setShowModal(true);
  };

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      if (editingClient) {
        await updateClient(editingClient.id, formData);
        showSuccess("تم التحديث!", "تم تحديث بيانات العميل بنجاح");
      } else {
        await createClient(formData);
        showSuccess("تمت الإضافة!", "تم إضافة العميل بنجاح");
      }
      setShowModal(false);
      setEditingClient(null);
      fetchClients();
    } catch (error) {
      const data = error.response?.data;
      let errorMsg = "حدث خطأ أثناء العملية.";
      if (data?.errors) {
        errorMsg = Object.values(data.errors).flat().join("\n");
      } else if (data?.message) {
        errorMsg = data.message;
      }
      showError("خطأ!", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClient = async (id) => {
    const result = await showConfirm(
      "هل أنت متأكد؟",
      "سيتم حذف العميل نهائياً",
    );
    if (result.isConfirmed) {
      setLoading(true);
      try {
        await deleteClient(id);
        showSuccess("تم الحذف", "تم حذف العميل بنجاح");
        fetchClients();
      } catch (error) {
        showError("خطأ", "حدث خطأ أثناء الحذف");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleExport = () => {
    const columns = [
      { header: "نوع العميل", key: "client_type" },
      { header: "الاسم بالكامل", key: "name" },
      { header: "اسم الموظف", format: (client) => client.employee?.name || "-" },
      { header: "رقم الهاتف", key: "phone" },
      { header: "رقم هاتف إضافي", key: "additional_phone" },
      { header: "المدينة", key: "city" },
      { header: "العنوان", key: "address" },
    ];
    exportToExcel(clients, columns, "العملاء.xlsx");
  };

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
          <h1 className="h3 mb-0 fw-bold">العملاء</h1>
          <div>
            <Button
              variant="outline-success"
              onClick={handleExport}
              className="me-2"
              disabled={clients.length === 0}
            >
              📊 تصدير إكسيل
            </Button>
            <Button variant="dark" onClick={handleAddClient}>
              + عميل جديد
            </Button>
          </div>
        </div>

        <ClientSearchBar
          searchQuery={searchQuery}
          onSearch={handleSearch}
          onClear={handleClearSearch}
          filters={filters}
          onFilterChange={handleFilterChange}
          loading={loading}
        />

        <Card className="shadow-sm border-0 rounded-4">
          <Card.Body className="p-0">
            {initialLoading ? (
              <TableSkeleton rows={5} columns={8} />
            ) : (
              <>
                <ClientTable
                  clients={clients}
                  onEdit={handleEditClient}
                  onDelete={handleDeleteClient}
                />

                <PaginationComponent
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </>
            )}
          </Card.Body>
        </Card>
      </Container>

      <ClientFormModal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setEditingClient(null);
        }}
        onSubmit={handleSubmit}
        initialData={editingClient}
        loading={loading}
        isEdit={!!editingClient}
      />
    </div>
  );
};

export default ClientsPage;
