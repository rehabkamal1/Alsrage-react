import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import {
  getClients,
  createClient,
  updateClient,
  deleteClient,
  searchClients,
} from "../services/apiService";
import { showSuccess, showError, showConfirm } from "../utils/swalHelper";
import ClientFormModal from "../components/Client/ClientFormModal";
import ClientTable from "../components/Client/ClientTable";
import ClientSearchBar from "../components/Client/ClientSearchBar";
import PaginationComponent from "../components/common/Pagination";
import LoadingSpinner from "../components/common/LoadingSpinner";
import TableSkeleton from "../components/common/TableSkeleton";

const ClientsPage = () => {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = clients.filter(
        (client) =>
          client.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          client.phone?.includes(searchQuery),
      );
      setFilteredClients(filtered);
    } else {
      setFilteredClients(clients);
    }
    setCurrentPage(1);
  }, [searchQuery, clients]);

  const fetchClients = async () => {
    setInitialLoading(true);
    try {
      const response = await getClients();
      setClients(response.data.data);
      setFilteredClients(response.data.data);
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (query.length >= 2) {
      setLoading(true);
      try {
        const response = await searchClients(query);
        setFilteredClients(response.data.data);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setFilteredClients(clients);
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

  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedClients = filteredClients.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

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
          <Button variant="dark" onClick={handleAddClient}>
            + عميل جديد
          </Button>
        </div>

        <ClientSearchBar
          searchQuery={searchQuery}
          onSearch={handleSearch}
          onClear={handleClearSearch}
          loading={loading}
        />

        <Card className="shadow-sm border-0 rounded-4">
          <Card.Body className="p-0">
            {initialLoading ? (
              <TableSkeleton rows={5} columns={8} />
            ) : (
              <>
                <ClientTable
                  clients={displayedClients}
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
