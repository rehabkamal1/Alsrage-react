import React, { useState, useEffect } from "react";
import { Container, Card, Button, Form } from "react-bootstrap";
import Select from "react-select";
import api, {
  getOrderTracking,
  createOrderTracking,
  updateOrderTracking,
  deleteOrderTracking,
  getOrders,
  getExternalOffices,
  createExternalOffice,
} from "../services/apiService";
import { showSuccess, showError, showConfirm } from "../utils/swalHelper";
import TrackingFormModal from "../components/Tracking/TrackingFormModal";
import TrackingTable from "../components/Tracking/TrackingTable";
import TrackingSearchBar from "../components/Tracking/TrackingSearchBar";
import TableSkeleton from "../components/common/TableSkeleton";
import PaginationComponent from "../components/common/Pagination";
import { exportToExcel } from "../utils/excelHelper";
import { exportToPDF } from "../utils/pdfHelper";
import ExternalOfficeFormModal from "../components/Tracking/ExternalOfficeFormModal";

const TrackingPage = () => {
  const [tracking, setTracking] = useState([]);
  const [filteredTracking, setFilteredTracking] = useState([]);
  const [orders, setOrders] = useState([]);
  const [externalOffices, setExternalOffices] = useState([]);
  const [priorityLevels, setPriorityLevels] = useState([]);
  const [passportStatuses, setPassportStatuses] = useState([]);
  const [transferStatuses, setTransferStatuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showExternalOfficeModal, setShowExternalOfficeModal] = useState(false);
  const [editingTracking, setEditingTracking] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [submitError, setSubmitError] = useState(null);
  const [filters, setFilters] = useState({
    priority_level: "",
    passport_status: "",
    transfer_status: "",
  });
  const [sortField, setSortField] = useState("id");
  const [sortDirection, setSortDirection] = useState("desc");
  const [allTrackingData, setAllTrackingData] = useState([]);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchAllData();
    fetchSettings();
  }, []);

  useEffect(() => {
    if (orders.length > 0) {
      fetchTracking();
    }
  }, [filters, sortField, sortDirection, searchQuery, currentPage, orders]);

  const fetchAllData = async () => {
    setInitialLoading(true);
    try {
      const [ordersRes, externalOfficesRes] = await Promise.all([
        getOrders(),
        getExternalOffices(),
      ]);
      setOrders(ordersRes.data.data || []);
      setExternalOffices(externalOfficesRes.data.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const [priorityRes, passportRes, transferRes] = await Promise.all([
        api.get("/settings/priority-levels"),
        api.get("/settings/passport-statuses"),
        api.get("/settings/transfer-statuses"),
      ]);

      const normalizeData = (data) => {
        return (data || []).map((item) => ({
          value: item.key,
          label: item.label,
          color: item.color,
          key: item.key,
        }));
      };

      setPriorityLevels(normalizeData(priorityRes.data.data));
      setPassportStatuses(normalizeData(passportRes.data.data));
      setTransferStatuses(normalizeData(transferRes.data.data));
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

const enrichTrackingWithOrderData = (trackingData) => {
  return trackingData.map((item) => {
    const order = orders.find((o) => o.id === item.order_id);

    // ✅ ابحثي عن المكتب الخارجي في قائمة externalOffices باستخدام external_office_id من الـ tracking
    const externalOffice = externalOffices.find(
      (office) => office.id === item.external_office_id,
    );

    if (order) {
      return {
        ...item,
        visa_holder_name:
          order.visa_holder_name || order.client?.visa_holder_name,
        visa_number: order.visa_number,
        id_number: order.id_number,
        passport_number: order.passport_number,
        sponsor_number: item.sponsor_number || order.sponsor_number,
        order_number: order.id,
        saudi_office_name: order.saudi_office?.name,
        // ✅ هذه القيم تأتي من جدول external_offices
        external_office_id: item.external_office_id, // من tracking نفسه
        external_office_name: externalOffice?.name,
        external_office_country: externalOffice?.country,
      };
    }
    return item;
  });
};

const fetchTracking = async () => {
  setLoading(true);
  try {
    const params = {
      search: searchQuery,
      priority_level: filters.priority_level,
      passport_status: filters.passport_status,
      transfer_status: filters.transfer_status,
      sort_field: sortField,
      sort_direction: sortDirection,
      per_page: 1000,
      page: 1,
    };
    const response = await getOrderTracking(params);
    const trackingData = response.data.data || [];
    console.log("Raw tracking data from API:", trackingData);

    // طباعة أول عنصر لمعرفة البيانات القادمة
    if (trackingData.length > 0) {
      console.log("First tracking item:", trackingData[0]);
      console.log(
        "external_office_id in tracking:",
        trackingData[0].external_office_id,
      );
    }

    const enrichedData = enrichTrackingWithOrderData(trackingData);
    console.log("Enriched tracking data:", enrichedData);

    // طباعة أول عنصر بعد الإثراء
    if (enrichedData.length > 0) {
      console.log("First enriched item:", enrichedData[0]);
      console.log(
        "external_office_id after enrich:",
        enrichedData[0].external_office_id,
      );
    }

    setAllTrackingData(enrichedData);

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedData = enrichedData.slice(start, end);
    setTracking(paginatedData);
    setFilteredTracking(paginatedData);
  } catch (error) {
    console.error("Error fetching tracking:", error);
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
    setFilters({
      priority_level: "",
      passport_status: "",
      transfer_status: "",
    });
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
  // ✅ external_office_id موجود بالفعل في item من الـ API
  // لا تحتاجي إلى order.external_office_id
  const enrichedItem = {
    ...item,
    external_office_id: item.external_office_id || "",
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

  const handleAddExternalOffice = async (formData) => {
    try {
      await createExternalOffice(formData);
      showSuccess("تم", "تم إضافة المكتب الخارجي بنجاح");
      setShowExternalOfficeModal(false);
      await fetchAllData();
    } catch (error) {
      showError(
        "خطأ",
        error.response?.data?.message || "حدث خطأ أثناء الإضافة",
      );
    }
  };

  const handleRefreshExternalOffices = async () => {
    try {
      const externalOfficesRes = await getExternalOffices();
      setExternalOffices(externalOfficesRes.data.data || []);
    } catch (error) {
      console.error("Error refreshing external offices:", error);
    }
  };

  const handleExportExcel = () => {
    const exportData =
      allTrackingData.length > 0 ? allTrackingData : filteredTracking;
    const columns = [
      { header: "رقم الطلب", key: "order_number" },
      { header: "صاحب التأشيرة", key: "visa_holder_name" },
      { header: "التأشيرة", key: "visa_number" },
      { header: "الهوية", key: "id_number" },
      { header: "الجواز", key: "passport_number" },
      { header: "الكفيل", key: "sponsor_number" },
      { header: "رقم التفويض", key: "authorization_number" },
      { header: "رقم التوثيق", key: "authentication_number" },
      { header: "تاريخ التوثيق", key: "authentication_date" },
      { header: "تاريخ التصديق", key: "certification_date" },
      { header: "تاريخ آخر إجراء", key: "last_action_date" },
      {
        header: "حالة ترشيح الجواز",
        key: "passport_status",
        format: (item) => {
          const found = passportStatuses?.find(
            (s) => s.value === item.passport_status,
          );
          return found?.label || item.passport_status || "-";
        },
      },
      {
        header: "حالة التحويل",
        key: "transfer_status",
        format: (item) => {
          const found = transferStatuses?.find(
            (s) => s.value === item.transfer_status,
          );
          return found?.label || item.transfer_status || "-";
        },
      },
      {
        header: "درجة الأهمية",
        key: "priority_level",
        format: (item) => {
          const found = priorityLevels?.find(
            (p) => p.value === item.priority_level,
          );
          return found?.label || item.priority_level || "-";
        },
      },
      { header: "الملاحظات", key: "notes" },
    ];
    exportToExcel(exportData, columns, "متابعة_الطلبات.xlsx");
  };

  const handleExportPDF = () => {
    const exportData =
      allTrackingData.length > 0 ? allTrackingData : filteredTracking;
    const columns = [
      { header: "رقم الطلب", key: "order_number" },
      { header: "صاحب التأشيرة", key: "visa_holder_name" },
      { header: "التأشيرة", key: "visa_number" },
      { header: "الهوية", key: "id_number" },
      { header: "الجواز", key: "passport_number" },
      { header: "الكفيل", key: "sponsor_number" },
      { header: "تاريخ التوثيق", key: "authentication_date" },
      { header: "تاريخ التصديق", key: "certification_date" },
      { header: "تاريخ آخر إجراء", key: "last_action_date" },
      {
        header: "حالة ترشيح الجواز",
        key: "passport_status",
        format: (item) => {
          const found = passportStatuses?.find(
            (s) => s.value === item.passport_status,
          );
          return found?.label || item.passport_status || "-";
        },
      },
      {
        header: "حالة التحويل",
        key: "transfer_status",
        format: (item) => {
          const found = transferStatuses?.find(
            (s) => s.value === item.transfer_status,
          );
          return found?.label || item.transfer_status || "-";
        },
      },
      {
        header: "درجة الأهمية",
        key: "priority_level",
        format: (item) => {
          const found = priorityLevels?.find(
            (p) => p.value === item.priority_level,
          );
          return found?.label || item.priority_level || "-";
        },
      },
    ];
    exportToPDF(exportData, columns, "متابعة_الطلبات.pdf");
  };

  const totalPages = Math.ceil(allTrackingData.length / itemsPerPage);
  const currentData = tracking;

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
            <Button variant="dark" disabled>
              + متابعة جديدة
            </Button>
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
            <Button
              variant="dark"
              onClick={handleAddTracking}
              className="d-flex align-items-center gap-2 rounded-3 shadow px-3 py-2"
            >
              <i className="fa-solid fa-plus"></i>
              <span>متابعة جديدة</span>
            </Button>
          </div>
        </div>

        <div className="mb-4">
          <TrackingSearchBar
            searchQuery={searchQuery}
            onSearch={handleSearch}
            onClear={handleClearSearch}
            loading={loading}
            priorityLevels={priorityLevels}
            passportStatuses={passportStatuses}
            transferStatuses={transferStatuses}
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
                    priorityLevels={priorityLevels}
                    passportStatuses={passportStatuses}
                    transferStatuses={transferStatuses}
                    externalOffices={externalOffices}
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

      <TrackingFormModal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setEditingTracking(null);
          setSubmitError(null);
        }}
        onSubmit={handleSubmit}
        initialData={editingTracking}
        orders={orders}
        priorityLevels={priorityLevels}
        passportStatuses={passportStatuses}
        transferStatuses={transferStatuses}
        externalOffices={externalOffices}
        loading={loading}
        isEdit={!!editingTracking}
        error={submitError}
        onRefreshExternalOffices={handleRefreshExternalOffices}
      />

      <ExternalOfficeFormModal
        show={showExternalOfficeModal}
        onHide={() => setShowExternalOfficeModal(false)}
        onSubmit={handleAddExternalOffice}
        loading={loading}
        isEdit={false}
        error={null}
      />
    </div>
  );
};

export default TrackingPage;
