import React, { useState, useEffect } from "react";
import { Container, Card, Button, Dropdown } from "react-bootstrap";
import api, {
  getMarketingLeads,
  createMarketingLead,
  updateMarketingLead,
  deleteMarketingLead,
  getMarketingSaudiOffices,
  getMarketingExternalOffices,
  getMarketingServiceOffices,
  getMarketingStatuses,
  getMarketingPriorityLevels,
  createMarketingSaudiOffice,
  createMarketingExternalOffice,
  createMarketingServiceOffice,
} from "../services/apiService";
import { showSuccess, showError, showConfirm } from "../utils/swalHelper";
import MarketingTable from "../components/Marketing/MarketingTable";
import MarketingFormModal from "../components/Marketing/MarketingFormModal";
import MarketingSearchBar from "../components/Marketing/MarketingSearchBar";
import MarketingAddOfficeModal from "../components/Marketing/MarketingAddOfficeModal";
import TableSkeleton from "../components/common/TableSkeleton";
import PaginationComponent from "../components/common/Pagination";
import { exportToExcel } from "../utils/excelHelper";
import { exportToPDF } from "../utils/pdfHelper";

const MarketingPage = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showAddOfficeModal, setShowAddOfficeModal] = useState(false);
  const [addOfficeType, setAddOfficeType] = useState(null);
  const [editingLead, setEditingLead] = useState(null);
  const [saudiOffices, setSaudiOffices] = useState([]);
  const [externalOffices, setExternalOffices] = useState([]);
  const [serviceOffices, setServiceOffices] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [priorityLevels, setPriorityLevels] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    type: "",
    status: "",
    priority_level: "",
  });
  const [sortField, setSortField] = useState("id");
  const [sortDirection, setSortDirection] = useState("desc");
  const [filterFromDate, setFilterFromDate] = useState("");
  const [filterToDate, setFilterToDate] = useState("");
  const [submitError, setSubmitError] = useState(null);
  const [addingOffice, setAddingOffice] = useState(false);
  const itemsPerPage = 10;

  const types = [
    { value: "saudi_office", label: "مكتب سعودي" },
    { value: "external_office", label: "مكتب خارجي" },
    { value: "service_office", label: "مكتب خدمات" },
  ];

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    fetchLeads();
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
      const [saudiRes, externalRes, serviceRes, statusesRes, priorityRes] =
        await Promise.all([
          getMarketingSaudiOffices(),
          getMarketingExternalOffices(),
          getMarketingServiceOffices(),
          getMarketingStatuses(),
          getMarketingPriorityLevels(),
        ]);
      setSaudiOffices(saudiRes.data.data);
      setExternalOffices(externalRes.data.data);
      setServiceOffices(serviceRes.data.data);
      setStatuses(statusesRes.data.data);
      setPriorityLevels(priorityRes.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params = {
        search: searchQuery,
        type: filters.type,
        status: filters.status,
        priority_level: filters.priority_level,
        from_date: filterFromDate,
        to_date: filterToDate,
        sort_field: sortField,
        sort_direction: sortDirection,
        per_page: itemsPerPage,
        page: currentPage,
      };
      const response = await getMarketingLeads(params);
      setLeads(response.data.data);
    } catch (error) {
      console.error("Error fetching leads:", error);
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
    setFilters({ type: "", status: "", priority_level: "" });
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

  const handleDateFilter = () => {
    setCurrentPage(1);
    fetchLeads();
  };

  const handleAddLead = () => {
    setEditingLead(null);
    setSubmitError(null);
    setShowModal(true);
  };

  const handleEditLead = (lead) => {
    setEditingLead(lead);
    setSubmitError(null);
    setShowModal(true);
  };

  const handleSubmitLead = async (formData) => {
    setLoading(true);
    setSubmitError(null);
    try {
      if (editingLead) {
        await updateMarketingLead(editingLead.id, formData);
        showSuccess("تم التحديث!", "تم تحديث العميل التسويقي بنجاح");
      } else {
        await createMarketingLead(formData);
        showSuccess("تمت الإضافة!", "تم إضافة العميل التسويقي بنجاح");
      }
      setShowModal(false);
      setEditingLead(null);
      fetchLeads();
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

  const handleDeleteLead = async (id) => {
    const result = await showConfirm(
      "هل أنت متأكد؟",
      "سيتم حذف العميل التسويقي نهائياً",
    );
    if (result.isConfirmed) {
      setLoading(true);
      try {
        await deleteMarketingLead(id);
        showSuccess("تم الحذف", "تم حذف العميل التسويقي بنجاح");
        fetchLeads();
      } catch (error) {
        showError("خطأ", "حدث خطأ أثناء الحذف");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddOffice = async (formData) => {
    setAddingOffice(true);
    try {
      if (addOfficeType === "saudi") {
        await createMarketingSaudiOffice(formData);
        showSuccess("تم", "تم إضافة المكتب السعودي بنجاح");
      } else if (addOfficeType === "external") {
        await createMarketingExternalOffice(formData);
        showSuccess("تم", "تم إضافة المكتب الخارجي بنجاح");
      } else {
        await createMarketingServiceOffice(formData);
        showSuccess("تم", "تم إضافة مكتب الخدمات بنجاح");
      }
      setShowAddOfficeModal(false);
      setAddOfficeType(null);
      fetchAllData();
    } catch (error) {
      showError(
        "خطأ",
        error.response?.data?.message || "حدث خطأ أثناء الإضافة",
      );
    } finally {
      setAddingOffice(false);
    }
  };

  const handleExportExcel = () => {
    const columns = [
      { header: "اسم العميل", key: "name" },
      { header: "رقم الهاتف", key: "phone" },
      { header: "المصدر", key: "source_name" },
      {
        header: "النوع",
        key: "type",
        format: (item) => {
          const found = types.find((t) => t.value === item.type);
          return found?.label || item.type || "-";
        },
      },
      {
        header: "الحالة",
        key: "status",
        format: (item) => {
          const found = statuses?.find((s) => s.key === item.status);
          return found?.label || item.status || "-";
        },
      },
      {
        header: "درجة الأهمية",
        key: "priority_level",
        format: (item) => {
          const found = priorityLevels?.find(
            (p) => p.key === item.priority_level,
          );
          return found?.label || item.priority_level || "-";
        },
      },
      { header: "تاريخ التواصل", key: "contact_date" },
      { header: "تاريخ المتابعة", key: "next_followup_date" },
      { header: "الملاحظات", key: "notes" },
    ];
    exportToExcel(leads, columns, "التسويق.xlsx");
  };

  const handleExportPDF = () => {
    const columns = [
      { header: "اسم العميل", key: "name" },
      { header: "رقم الهاتف", key: "phone" },
      { header: "المصدر", key: "source_name" },
      {
        header: "النوع",
        key: "type",
        format: (item) => {
          const found = types.find((t) => t.value === item.type);
          return found?.label || item.type || "-";
        },
      },
      {
        header: "الحالة",
        key: "status",
        format: (item) => {
          const found = statuses?.find((s) => s.key === item.status);
          return found?.label || item.status || "-";
        },
      },
      {
        header: "درجة الأهمية",
        key: "priority_level",
        format: (item) => {
          const found = priorityLevels?.find(
            (p) => p.key === item.priority_level,
          );
          return found?.label || item.priority_level || "-";
        },
      },
      { header: "تاريخ التواصل", key: "contact_date" },
      { header: "تاريخ المتابعة", key: "next_followup_date" },
    ];
    exportToPDF(leads, columns, "التسويق.pdf");
  };

  const totalPages = Math.ceil(leads.length / itemsPerPage);

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
            <h1 className="h3 mb-0 fw-bold">التسويق</h1>
            <Button variant="dark" disabled>
              + عميل جديد
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
          <h1 className="h3 mb-0 fw-bold">التسويق</h1>
          <div className="d-flex gap-2">
            <Button
              variant="light"
              onClick={handleExportExcel}
              className="d-flex align-items-center gap-2 rounded-3 border shadow-sm px-3 py-2 text-success fw-semibold"
              disabled={leads.length === 0}
            >
              <i className="fa-solid fa-file-excel fs-5"></i>
              <span>إكسيل</span>
            </Button>
            <Button
              variant="light"
              onClick={handleExportPDF}
              className="d-flex align-items-center gap-2 rounded-3 border shadow-sm px-3 py-2 text-danger fw-semibold"
              disabled={leads.length === 0}
            >
              <i className="fa-solid fa-file-pdf fs-5"></i>
              <span>بي دي اف</span>
            </Button>
            <Dropdown>
              <Dropdown.Toggle variant="dark" id="dropdown-basic">
                + إضافة
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item
                  onClick={() => {
                    setAddOfficeType("saudi");
                    setShowAddOfficeModal(true);
                  }}
                >
                  مكتب سعودي جديد
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => {
                    setAddOfficeType("external");
                    setShowAddOfficeModal(true);
                  }}
                >
                  مكتب خارجي جديد
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => {
                    setAddOfficeType("service");
                    setShowAddOfficeModal(true);
                  }}
                >
                  مكتب خدمات جديد
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={handleAddLead}>
                  عميل تسويقي جديد
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>

        <MarketingSearchBar
          searchQuery={searchQuery}
          onSearch={handleSearch}
          onClear={handleClearSearch}
          loading={loading}
          statuses={statuses}
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
          types={types}
        />

        <Card className="shadow-sm border-0 rounded-4">
          <Card.Body className="p-0">
            {loading ? (
              <div className="text-center py-5">
                <TableSkeleton rows={3} columns={10} />
              </div>
            ) : (
              <>
                <MarketingTable
                  leads={leads}
                  onEdit={handleEditLead}
                  onDelete={handleDeleteLead}
                  statuses={statuses}
                  priorityLevels={priorityLevels}
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

      <MarketingFormModal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setEditingLead(null);
          setSubmitError(null);
        }}
        onSubmit={handleSubmitLead}
        initialData={editingLead}
        saudiOffices={saudiOffices}
        externalOffices={externalOffices}
        serviceOffices={serviceOffices}
        statuses={statuses}
        priorityLevels={priorityLevels}
        loading={loading}
        isEdit={!!editingLead}
        error={submitError}
      />

      <MarketingAddOfficeModal
        show={showAddOfficeModal}
        onHide={() => {
          setShowAddOfficeModal(false);
          setAddOfficeType(null);
        }}
        onSubmit={handleAddOffice}
        type={addOfficeType}
        loading={addingOffice}
      />
    </div>
  );
};

export default MarketingPage;
