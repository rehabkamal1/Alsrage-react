import React, { useState, useEffect } from "react";
import { Container, Card, Button, Dropdown } from "react-bootstrap";
import RefreshButton from "../components/common/RefreshButton";
import DateFilterBar from "../components/common/DateFilterBar";
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
  const [allLeads, setAllLeads] = useState([]);
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
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [filters, setFilters] = useState({
    type: "",
  });
  const [sortField, setSortField] = useState("id");
  const [sortDirection, setSortDirection] = useState("desc");
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
    fromDate,
    toDate,
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
        from_date: fromDate,
        to_date: toDate,
        sort_field: sortField,
        sort_direction: sortDirection,
        per_page: 1000,
        page: 1,
      };
      const response = await getMarketingLeads(params);
      const leadsData = response.data.data || [];
      setAllLeads(leadsData);

      const start = (currentPage - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      const paginatedData = leadsData.slice(start, end);
      setLeads(paginatedData);
    } catch (error) {
      console.error("Error fetching leads:", error);
    } finally {
      setLoading(false);
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
    setFilters({ type: "" });
    setFromDate("");
    setToDate("");
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
      await fetchLeads();
      await fetchAllData();
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
        await fetchLeads();
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
      await fetchAllData();
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
    const exportData = allLeads.length > 0 ? allLeads : leads;
    const columns = [
      { header: "اسم العميل", key: "name" },
      { header: "رقم الهاتف", key: "phone" },
      { header: "المصدر", key: "source_name" },
      { header: "تاريخ التواصل", key: "contact_date" },
      { header: "تاريخ المتابعة", key: "next_followup_date" },
      { header: "الملاحظات", key: "notes" },
    ];
    exportToExcel(exportData, columns, "التسويق.xlsx");
  };

  const handleExportPDF = () => {
    const exportData = allLeads.length > 0 ? allLeads : leads;
    const columns = [
      { header: "اسم العميل", key: "name" },
      { header: "رقم الهاتف", key: "phone" },
      { header: "المصدر", key: "source_name" },
      { header: "تاريخ التواصل", key: "contact_date" },
      { header: "تاريخ المتابعة", key: "next_followup_date" },
    ];
    exportToPDF(exportData, columns, "التسويق.pdf");
  };

  const totalPages = Math.ceil(allLeads.length / itemsPerPage);
  const currentData = leads;

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
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
            <h1 className="h3 mb-0 fw-bold">التسويق</h1>
            <Button variant="dark" disabled>
              + عميل جديد
            </Button>
          </div>
          <Card className="shadow-sm border-0 rounded-4">
            <Card.Body className="p-0">
              <div className="table-responsive">
                <TableSkeleton rows={5} columns={8} />
              </div>
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
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <h1 className="h3 mb-0 fw-bold">التسويق</h1>
          <div className="d-flex gap-2 flex-wrap">
            <RefreshButton
              onClick={fetchLeads}
              loading={loading}
              className="border shadow-sm text-primary fw-semibold"
            />
            <Button
              variant="light"
              onClick={handleExportExcel}
              className="d-flex align-items-center gap-2 rounded-3 border shadow-sm px-3 py-2 text-success fw-semibold"
              disabled={allLeads.length === 0}
            >
              <i className="fa-solid fa-file-excel fs-5"></i>
              <span>إكسيل</span>
            </Button>
            <Button
              variant="light"
              onClick={handleExportPDF}
              className="d-flex align-items-center gap-2 rounded-3 border shadow-sm px-3 py-2 text-danger fw-semibold"
              disabled={allLeads.length === 0}
            >
              <i className="fa-solid fa-file-pdf fs-5"></i>
              <span>بي دي اف</span>
            </Button>
            <Dropdown>
              <Dropdown.Toggle
                variant="dark"
                id="dropdown-basic"
                className="rounded-3"
              >
                + إضافة
              </Dropdown.Toggle>
              <Dropdown.Menu align="end">
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

        <DateFilterBar
          onFilterChange={handleDateFilterChange}
          initialFromDate={fromDate}
          initialToDate={toDate}
          initialPreset="all"
          size="md"
        />

        <div className="mb-4">
          <MarketingSearchBar
            searchQuery={searchQuery}
            onSearch={handleSearch}
            onClear={handleClearSearch}
            loading={loading}
            filters={filters}
            onFilterChange={handleFilterChange}
            sortField={sortField}
            sortDirection={sortDirection}
            onSortChange={handleSortChange}
            types={types}
          />
        </div>

        <Card className="shadow-sm border-0 rounded-4 overflow-hidden">
          <Card.Body className="p-0">
            {loading ? (
              <div className="text-center py-5">
                <div className="table-responsive">
                  <TableSkeleton rows={5} columns={8} />
                </div>
              </div>
            ) : (
              <>
                <div className="table-responsive">
                  <MarketingTable
                    leads={currentData}
                    onEdit={handleEditLead}
                    onDelete={handleDeleteLead}
                  />
                </div>
                {totalPages > 1 && (
                  <div className="d-flex justify-content-center py-3">
                    <PaginationComponent
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                    />
                  </div>
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
