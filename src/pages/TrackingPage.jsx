import React, { useState, useEffect } from "react";
import { Container, Card, Button, Form } from "react-bootstrap";
import Select from "react-select";
import RefreshButton from "../components/common/RefreshButton";
import DateFilterBar from "../components/common/DateFilterBar";
import api, {
  getOrderTracking,
  createOrderTracking,
  updateOrderTracking,
  deleteOrderTracking,
  getOrders,
  getExternalOffices,
  getSaudiOffices,
  getClients,
  getEmployees,
  fetchAllPages,
} from "../services/apiService";
import { showSuccess, showError, showConfirm } from "../utils/swalHelper";
import TrackingFormModal from "../components/Tracking/TrackingFormModal";
import TrackingTable from "../components/Tracking/TrackingTable";
import TrackingSearchBar from "../components/Tracking/TrackingSearchBar";
import TableSkeleton from "../components/common/TableSkeleton";
import PaginationComponent from "../components/common/Pagination";
import { exportToExcel } from "../utils/excelHelper";
import { exportToPDF } from "../utils/pdfHelper";
import { useDebounce } from "../hooks/useDebounce";

const TrackingPage = ({ user }) => {
  const isAdmin = user?.role === "admin";
  const hasPermission = (permission) =>
    isAdmin || user?.permissions?.includes(permission) || false;
  const canCreate = hasPermission("create_tracking");
  const canEdit = hasPermission("edit_tracking");
  const canDelete = hasPermission("delete_tracking");

  const [tracking, setTracking] = useState([]);
  const [filteredTracking, setFilteredTracking] = useState([]);
  const [orders, setOrders] = useState([]);
  const [externalOffices, setExternalOffices] = useState([]);
  const [saudiOffices, setSaudiOffices] = useState([]);
  const [clients, setClients] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [priorityLevels, setPriorityLevels] = useState([]);
  const [passportStatuses, setPassportStatuses] = useState([]);
  const [transferStatuses, setTransferStatuses] = useState([]);
  const [authenticationStatuses, setAuthenticationStatuses] = useState([]);
  const [authorizationStatuses, setAuthorizationStatuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTracking, setEditingTracking] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [currentPage, setCurrentPage] = useState(1);
  const [submitError, setSubmitError] = useState(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [filters, setFilters] = useState({
    priority_level: "",
    passport_status: "",
    transfer_status: "",
    service_type: "",
    saudi_office_id: "",
    external_office_id: "",
    client_id: "",
    employee_id: "",
  });
  const [sortField, setSortField] = useState("id");
  const [sortDirection, setSortDirection] = useState("desc");
  const [allTrackingData, setAllTrackingData] = useState([]);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    fetchAllData();
    fetchSettings();
  }, []);

  useEffect(() => {
    if (orders.length > 0) {
      fetchTracking();
    }
  }, [
    filters,
    sortField,
    sortDirection,
    debouncedSearch,
    orders,
    fromDate,
    toDate,
  ]);

  const fetchAllData = async () => {
    setInitialLoading(true);
    try {
      const [
        ordersRes,
        externalOfficesRes,
        saudiOfficesRes,
        clientsRes,
        employeesRes,
        serviceTypesRes,
      ] = await Promise.all([
        fetchAllPages(getOrders),
        fetchAllPages(getExternalOffices),
        fetchAllPages(getSaudiOffices),
        fetchAllPages(getClients),
        fetchAllPages(getEmployees),
        api.get("/settings/service-types"),
      ]);
      setOrders(ordersRes);
      setExternalOffices(externalOfficesRes);
      setSaudiOffices(saudiOfficesRes);
      setClients(clientsRes);
      setEmployees(employeesRes);
      setServiceTypes(serviceTypesRes.data.data || serviceTypesRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const [priorityRes, passportRes, transferRes, authRes, authzRes] =
        await Promise.all([
          api.get("/settings/priority-levels"),
          api.get("/settings/passport-statuses"),
          api.get("/settings/transfer-statuses"),
          api.get("/settings/authentication-statuses"),
          api.get("/settings/authorization-statuses"),
        ]);

      const normalizeData = (data) => {
        return (data || []).map((item) => ({
          value: item.key || item.label,
          label: item.label,
          color: item.color,
          key: item.key || item.label,
        }));
      };

      setPriorityLevels(normalizeData(priorityRes.data.data));
      setPassportStatuses(normalizeData(passportRes.data.data));
      setTransferStatuses(normalizeData(transferRes.data.data));
      setAuthenticationStatuses(
        normalizeData(authRes.data.data || authRes.data || []),
      );
      setAuthorizationStatuses(
        normalizeData(authzRes.data.data || authzRes.data || []),
      );
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  const enrichTrackingWithOrderData = (trackingData) => {
    if (!orders || orders.length === 0) {
      return trackingData.map((item) => ({
        ...item,
        order_number: item.order_id,
        visa_holder_name: item.visa_holder_name || "-",
        visa_number: item.visa_number || "-",
        id_number: item.id_number || "-",
        passport_number: item.passport_number || "-",
      }));
    }

    return trackingData.map((item) => {
      const order = orders.find((o) => o.id === item.order_id);
      const externalOffice = externalOffices.find(
        (office) => office.id === item.external_office_id,
      );
      const saudiOffice = saudiOffices.find(
        (office) =>
          office.id === item.saudi_office_id ||
          office.id === order?.saudi_office_id,
      );

      if (order) {
        return {
          ...item,
          visa_holder_name:
            order.visa_holder_name || order.client?.visa_holder_name,
          visa_number: order.visa_number,
          id_number: order.id_number,
          passport_number: order.passport_number,
          delegate_phone:
            item.delegate_phone ||
            order.client?.phone ||
            item.sponsor_number ||
            "",
          sponsor_number: item.sponsor_number || order.client?.phone || "",
          order_number: order.id,
          saudi_office_name: saudiOffice?.name || order.saudi_office?.name,
          saudi_office_id: order.saudi_office_id || item.saudi_office_id,
          external_office_id:
            item.external_office_id || order.external_office_id,
          external_office_name:
            externalOffice?.name || order.external_office?.name,
          external_office_country:
            externalOffice?.country || order.external_office?.country,
          authorization_number: item.authorization_number,
          authentication_number: item.authentication_number,
          authentication_date: item.authentication_date,
          certification_date: item.certification_date,
          last_action_date: item.last_action_date,
          passport_status: item.passport_status,
          transfer_status: item.transfer_status,
          authentication_status: item.authentication_status,
          authorization_status: item.authorization_status,
          priority_level: item.priority_level,
          attachments: item.attachments,
        };
      }
      return {
        ...item,
        order_number: item.order_id,
      };
    });
  };

  const fetchTracking = async () => {
    setLoading(true);
    try {
      const params = {
        search: debouncedSearch,
        priority_level: filters.priority_level,
        passport_status: filters.passport_status,
        transfer_status: filters.transfer_status,
        service_type: filters.service_type,
        saudi_office_id: filters.saudi_office_id,
        external_office_id: filters.external_office_id,
        client_id: filters.client_id,
        employee_id: filters.employee_id,
        from_date: fromDate,
        to_date: toDate,
        sort_field: sortField,
        sort_direction: sortDirection,
      };
      const trackingData = await fetchAllPages(getOrderTracking, params);

      const enrichedData = enrichTrackingWithOrderData(trackingData);
      setAllTrackingData(enrichedData);
      setTracking(enrichedData);
      setFilteredTracking(enrichedData);
    } catch (error) {
      console.error("Error fetching tracking:", error);
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
    setFilters({
      priority_level: "",
      passport_status: "",
      transfer_status: "",
      service_type: "",
      saudi_office_id: "",
      external_office_id: "",
      client_id: "",
      employee_id: "",
    });
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

  const handleAddTracking = () => {
    setEditingTracking(null);
    setSubmitError(null);
    setShowModal(true);
  };

  const handleEditTracking = (item) => {
    const enrichedItem = {
      ...item,
      external_office_id: item.external_office_id || "",
      saudi_office_id: item.saudi_office_id || "",
    };
    setEditingTracking(enrichedItem);
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
      await fetchAllData();
      await fetchTracking();
    } catch (error) {
      setSubmitError(error.response?.data);
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
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
        await fetchTracking();
      } catch (error) {
        showError("خطأ", "حدث خطأ أثناء الحذف");
      } finally {
        setLoading(false);
      }
    }
  };

  const getTrackingExportColumns = () => {
    const getStatusLabel = (options, value) =>
      options?.find((option) => option.value === value)?.label || value || "-";
    return [
      { header: "# الطلب", key: "order_number" },
      {
        header: "صاحب التأشيرة",
        format: (item) =>
          [
            item.visa_holder_name,
            item.saudi_office_name && `سعودي: ${item.saudi_office_name}`,
            item.external_office_name && `خارجي: ${item.external_office_name}`,
          ].filter(Boolean).join(" - ") || "-",
      },
      { header: "التأشيرة", key: "visa_number" },
      { header: "الهوية", key: "id_number" },
      { header: "رقم المندوب", format: (item) => item.delegate_phone || item.sponsor_number || "-" },
      { header: "رقم الجواز", key: "passport_number" },
      { header: "رقم التفويض", key: "authorization_number" },
      { header: "رقم التوثيق", key: "authentication_number" },
      { header: "تاريخ التوثيق", key: "authentication_date" },
      { header: "تاريخ التصديق", key: "certification_date" },
      { header: "آخر إجراء", key: "last_action_date" },
      {
        header: "المكتب الخارجي",
        format: (item) =>
          [item.external_office_name, item.external_office_country].filter(Boolean).join(" - ") || "-",
      },
      {
        header: "حالة ترشيح الجواز",
        format: (item) => getStatusLabel(passportStatuses, item.passport_status),
      },
      {
        header: "حالة التحويل",
        format: (item) => getStatusLabel(transferStatuses, item.transfer_status),
      },
      {
        header: "حالة التوثيق",
        format: (item) => getStatusLabel(authenticationStatuses, item.authentication_status),
      },
      {
        header: "حالة التفويض",
        format: (item) => getStatusLabel(authorizationStatuses, item.authorization_status),
      },
      {
        header: "درجة الأهمية",
        format: (item) => getStatusLabel(priorityLevels, item.priority_level),
      },
      {
        header: "المرفقات",
        format: (item) =>
          item.attachments?.map((attachment) => attachment.title || attachment.file_name)
            .filter(Boolean).join("، ") || "-",
      },
    ];
  };

  const handleExportExcel = () =>
    exportToExcel(allTrackingData, getTrackingExportColumns(), "متابعة_الطلبات.xlsx");

  const handleExportPDF = () =>
    exportToPDF(allTrackingData, getTrackingExportColumns(), "متابعة_الطلبات.pdf");

  const totalPages = Math.ceil(allTrackingData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = allTrackingData.slice(startIndex, startIndex + itemsPerPage);

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
            <h1 className="h3 mb-0 fw-bold">متابعة الطلبات</h1>
            {canCreate && (
              <Button variant="dark" disabled>
                + متابعة جديدة
              </Button>
            )}
          </div>
          <Card className="shadow-sm border-0 rounded-4">
            <Card.Body className="p-0">
              <div className="table-responsive">
                <TableSkeleton rows={5} columns={16} />
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
          <h1 className="h3 mb-0 fw-bold">متابعة الطلبات</h1>
          <div className="d-flex gap-2 flex-wrap">
            <RefreshButton
              onClick={fetchTracking}
              loading={loading}
              className="border shadow-sm text-primary fw-semibold"
            />
            <Button
              variant="light"
              onClick={handleExportExcel}
              className="d-flex align-items-center gap-2 rounded-3 border shadow-sm px-3 py-2 text-success fw-semibold"
              disabled={allTrackingData.length === 0}
            >
              <i className="fa-solid fa-file-excel fs-5"></i>
              <span>إكسيل</span>
            </Button>
            <Button
              variant="light"
              onClick={handleExportPDF}
              className="d-flex align-items-center gap-2 rounded-3 border shadow-sm px-3 py-2 text-danger fw-semibold"
              disabled={allTrackingData.length === 0}
            >
              <i className="fa-solid fa-file-pdf fs-5"></i>
              <span>بي دي اف</span>
            </Button>
            {canCreate && (
              <Button
                variant="dark"
                onClick={handleAddTracking}
                className="d-flex align-items-center gap-2 rounded-3 shadow px-3 py-2"
              >
                <i className="fa-solid fa-plus"></i>
                <span>متابعة جديدة</span>
              </Button>
            )}
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
          <TrackingSearchBar
            searchQuery={searchQuery}
            onSearch={handleSearch}
            onClear={handleClearSearch}
            loading={loading}
            priorityLevels={priorityLevels}
            passportStatuses={passportStatuses}
            transferStatuses={transferStatuses}
            serviceTypes={serviceTypes}
            saudiOffices={saudiOffices}
            externalOffices={externalOffices}
            clients={clients}
            employees={employees}
            filters={filters}
            onFilterChange={handleFilterChange}
            sortField={sortField}
            sortDirection={sortDirection}
            onSortChange={handleSortChange}
          />
        </div>

        <Card className="shadow-sm border-0 rounded-4 overflow-hidden">
          <Card.Body className="p-0">
            {loading ? (
              <div className="text-center py-5">
                <div className="table-responsive">
                  <TableSkeleton rows={5} columns={16} />
                </div>
              </div>
            ) : (
              <>
                <div className="table-responsive">
                  <TrackingTable
                    tracking={currentData}
                    onEdit={handleEditTracking}
                    onDelete={handleDeleteTracking}
                    onRefresh={fetchTracking}
                    canEdit={canEdit}
                    canDelete={canDelete}
                    priorityLevels={priorityLevels}
                    passportStatuses={passportStatuses}
                    transferStatuses={transferStatuses}
                    authenticationStatuses={authenticationStatuses}
                    authorizationStatuses={authorizationStatuses}
                    externalOffices={externalOffices}
                  />
                </div>
                <PaginationComponent
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  totalItems={allTrackingData.length}
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

      <TrackingFormModal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setEditingTracking(null);
          setSubmitError(null);
        }}
        onSubmit={handleSubmit}
        initialData={editingTracking}
        canCreate={canCreate}
        canEdit={canEdit}
        orders={orders}
        priorityLevels={priorityLevels}
        passportStatuses={passportStatuses}
        transferStatuses={transferStatuses}
        authenticationStatuses={authenticationStatuses}
        authorizationStatuses={authorizationStatuses}
        externalOffices={externalOffices}
        saudiOffices={saudiOffices}
        loading={loading}
        isEdit={!!editingTracking}
        error={submitError}
      />
    </div>
  );
};

export default TrackingPage;
