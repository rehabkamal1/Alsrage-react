import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import api, {
  deletePriorityLevel,
  deletePassportStatus,
  deleteTransferStatus,
  deletePaymentMethod,
  deleteBankName,
  deleteOrderStatus,
  deleteServiceType,
  deleteAuthenticationStatus,
  deleteAuthorizationStatus,
  deleteNationality,
  deleteProfession,
  deleteArrivalDestination,
  getSettingsArrivalDestinations,
} from "../services/apiService";
import { showSuccess, showError } from "../utils/swalHelper";
import TableSkeleton from "../components/common/TableSkeleton";
import SettingsCard from "../components/Settings/SettingsCard";

const SectionTitle = ({ title, subtitle, icon }) => (
  <div className="d-flex align-items-center gap-3 mb-4 mt-5">
    {icon && (
      <div
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "14px",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontSize: "22px",
          boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
        }}
      >
        {icon}
      </div>
    )}
    <div>
      <h5
        className="mb-0 fw-bold"
        style={{ color: "#1a202c", fontSize: "1.1rem" }}
      >
        {title}
      </h5>
      {subtitle && (
        <small style={{ color: "#718096", fontSize: "0.85rem" }}>
          {subtitle}
        </small>
      )}
    </div>
    <div
      style={{
        flex: 1,
        height: "1px",
        background: "linear-gradient(to left, #e2e8f0, transparent)",
      }}
    />
  </div>
);

const SettingsPage = () => {
  const [priorityLevels, setPriorityLevels] = useState([]);
  const [passportStatuses, setPassportStatuses] = useState([]);
  const [transferStatuses, setTransferStatuses] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [bankNames, setBankNames] = useState([]);
  const [orderStatuses, setOrderStatuses] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [authenticationStatuses, setAuthenticationStatuses] = useState([]);
  const [authorizationStatuses, setAuthorizationStatuses] = useState([]);
  const [nationalities, setNationalities] = useState([]);
  const [professions, setProfessions] = useState([]);
  const [arrivalDestinations, setArrivalDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const [
        priorityRes,
        passportRes,
        transferRes,
        paymentRes,
        bankRes,
        orderRes,
        serviceTypesRes,
        authRes,
        authzRes,
        nationalitiesRes,
        professionsRes,
        arrivalDestinationsRes,
      ] = await Promise.all([
        api.get("/settings/priority-levels"),
        api.get("/settings/passport-statuses"),
        api.get("/settings/transfer-statuses"),
        api.get("/settings/payment-methods"),
        api.get("/settings/bank-names"),
        api.get("/settings/order-statuses"),
        api.get("/settings/service-types"),
        api.get("/settings/authentication-statuses"),
        api.get("/settings/authorization-statuses"),
        api.get("/settings/nationalities"),
        api.get("/settings/professions"),
        getSettingsArrivalDestinations(),
      ]);

      const withMeta = (arr) =>
        (arr || []).map((item) => ({
          ...item,
          isNew: false,
          uniqueId: Date.now() + Math.random(),
        }));

      setPriorityLevels(withMeta(priorityRes.data.data));
      setPassportStatuses(withMeta(passportRes.data.data));
      setTransferStatuses(withMeta(transferRes.data.data));
      setPaymentMethods(withMeta(paymentRes.data.data));
      setBankNames(withMeta(bankRes.data.data));
      setOrderStatuses(withMeta(orderRes.data.data));
      setServiceTypes(withMeta(serviceTypesRes.data.data));
      setAuthenticationStatuses(withMeta(authRes.data?.data));
      setAuthorizationStatuses(withMeta(authzRes.data?.data));
      setNationalities(withMeta(nationalitiesRes.data?.data));
      setProfessions(withMeta(professionsRes.data?.data));
      setArrivalDestinations(withMeta(arrivalDestinationsRes.data?.data));
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const addItem = (setter, extras = {}) => {
    setter((prev) => [
      ...prev,
      {
        id: null,
        key: "",
        label: "",
        color: "#6c757d",
        sort_order: prev.length + 1,
        is_active: true,
        isNew: true,
        uniqueId: Date.now() + Math.random(),
        ...extras,
      },
    ]);
  };

  const deleteItem = async (
    id,
    isNew,
    index,
    items,
    setter,
    deleteApiFunction,
  ) => {
    if (isNew || !id) {
      setter(items.filter((_, i) => i !== index));
      showSuccess("تم", "تم الحذف بنجاح");
    } else if (id) {
      try {
        await deleteApiFunction(id);
        showSuccess("تم", "تم الحذف بنجاح");
        await fetchSettings();
      } catch (error) {
        showError(
          "خطأ",
          error.response?.data?.message || "حدث خطأ أثناء الحذف",
        );
      }
    }
  };

  const updateItem = (setter, index, field, value) => {
    setter((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      if (
        field === "label" &&
        value &&
        (!updated[index].key || updated[index].isNew)
      ) {
        updated[index].key = value.toLowerCase().replace(/\s/g, "_");
      }
      return updated;
    });
  };

  const saveItems = async (items, apiUrl, dataKey, successMessage) => {
    setSaving(true);
    try {
      const dataToSend = items
        .filter((item) => item.label && item.label.trim())
        .map((item) => ({
          key: item.key || item.label.toLowerCase().replace(/\s/g, "_"),
          label: item.label,
          color: item.color || "#6c757d",
          sort_order: item.sort_order || 0,
          target_days: item.target_days ? parseInt(item.target_days, 10) : 60,
          is_active: item.is_active !== undefined ? item.is_active : true,
          ...(item.nationality_key !== undefined
            ? { nationality_key: item.nationality_key }
            : {}),
        }));

      await api.post(apiUrl, { [dataKey]: dataToSend });
      showSuccess("تم", successMessage);
      await fetchSettings();
    } catch (error) {
      showError(
        "خطأ",
        error.response?.data?.message || "حدث خطأ أثناء حفظ الإعدادات",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          backgroundColor: "#f7f9fc",
          minHeight: "100vh",
          padding: "32px 16px",
        }}
      >
        <Container fluid>
          <div className="mb-4">
            <h1 className="h3 fw-bold mb-1" style={{ color: "#1a202c" }}>
              الإعدادات
            </h1>
            <p className="text-muted mb-0">
              إدارة جميع إعدادات النظام من مكان واحد
            </p>
          </div>
          <div className="table-responsive">
            <TableSkeleton rows={3} columns={3} />
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: "#f7f9fc",
        minHeight: "100vh",
        padding: "32px 16px",
      }}
    >
      <Container fluid>
        <div className="mb-4">
          <h1 className="h3 fw-bold mb-1" style={{ color: "#1a202c" }}>
            الإعدادات
          </h1>
          <p className="text-muted mb-0">
            إدارة جميع إعدادات النظام من مكان واحد
          </p>
        </div>

        <SectionTitle
          title="البيانات الأساسية"
          subtitle="الجنسيات والمهن وجهات القدوم"
          icon="📋"
        />
        <Row className="g-4">
          <Col xs={12} lg={6}>
            <SettingsCard
              title="الجنسيات"
              items={nationalities}
              onAdd={() => addItem(setNationalities)}
              onUpdate={(idx, field, val) =>
                updateItem(setNationalities, idx, field, val)
              }
              onDelete={(id, isNew, idx) =>
                deleteItem(
                  id,
                  isNew,
                  idx,
                  nationalities,
                  setNationalities,
                  deleteNationality,
                )
              }
              onSave={() =>
                saveItems(
                  nationalities,
                  "/settings/nationalities",
                  "nationalities",
                  "تم حفظ الجنسيات بنجاح",
                )
              }
              saving={saving}
              emptyMessage="لا توجد جنسيات"
            />
          </Col>
          <Col xs={12} lg={6}>
            <SettingsCard
              title="المهن"
              items={professions}
              onAdd={() => addItem(setProfessions)}
              onUpdate={(idx, field, val) =>
                updateItem(setProfessions, idx, field, val)
              }
              onDelete={(id, isNew, idx) =>
                deleteItem(
                  id,
                  isNew,
                  idx,
                  professions,
                  setProfessions,
                  deleteProfession,
                )
              }
              onSave={() =>
                saveItems(
                  professions,
                  "/settings/professions",
                  "professions",
                  "تم حفظ المهن بنجاح",
                )
              }
              saving={saving}
              emptyMessage="لا توجد مهن"
            />
          </Col>
          <Col xs={12}>
            <SettingsCard
              title="جهات القدوم حسب الجنسية"
              items={arrivalDestinations}
              onAdd={() =>
                addItem(setArrivalDestinations, { nationality_key: "" })
              }
              onUpdate={(idx, field, val) =>
                updateItem(setArrivalDestinations, idx, field, val)
              }
              onDelete={(id, isNew, idx) =>
                deleteItem(
                  id,
                  isNew,
                  idx,
                  arrivalDestinations,
                  setArrivalDestinations,
                  deleteArrivalDestination,
                )
              }
              onSave={() =>
                saveItems(
                  arrivalDestinations,
                  "/settings/arrival-destinations",
                  "destinations",
                  "تم حفظ جهات القدوم بنجاح",
                )
              }
              nationalityOptions={nationalities.map((item) => ({
                value: item.key,
                label: item.label,
              }))}
              showNationality
              saving={saving}
              emptyMessage="لا توجد جهات قدوم"
            />
          </Col>
        </Row>

        <SectionTitle
          title="حالات الطلبات والمراحل"
          subtitle="تتبع دورة حياة الطلب"
          icon="🔄"
        />
        <Row className="g-4">
          <Col xs={12} lg={6}>
            <SettingsCard
              title="حالات الطلبات (والمراحل المستهدفة بالأيام)"
              items={orderStatuses}
              showTargetDays={true}
              onAdd={() => addItem(setOrderStatuses)}
              onUpdate={(idx, field, val) =>
                updateItem(setOrderStatuses, idx, field, val)
              }
              onDelete={(id, isNew, idx) =>
                deleteItem(
                  id,
                  isNew,
                  idx,
                  orderStatuses,
                  setOrderStatuses,
                  deleteOrderStatus,
                )
              }
              onSave={() =>
                saveItems(
                  orderStatuses,
                  "/settings/order-statuses",
                  "statuses",
                  "تم حفظ حالات الطلبات والمدد المستهدفة بنجاح",
                )
              }
              saving={saving}
              emptyMessage="لا توجد حالات طلبات"
            />
          </Col>
          <Col xs={12} lg={6}>
            <SettingsCard
              title="درجات الأهمية"
              items={priorityLevels}
              onAdd={() => addItem(setPriorityLevels)}
              onUpdate={(idx, field, val) =>
                updateItem(setPriorityLevels, idx, field, val)
              }
              onDelete={(id, isNew, idx) =>
                deleteItem(
                  id,
                  isNew,
                  idx,
                  priorityLevels,
                  setPriorityLevels,
                  deletePriorityLevel,
                )
              }
              onSave={() =>
                saveItems(
                  priorityLevels,
                  "/settings/priority-levels",
                  "levels",
                  "تم حفظ درجات الأهمية بنجاح",
                )
              }
              saving={saving}
              emptyMessage="لا توجد درجات أهمية"
            />
          </Col>
          <Col xs={12} lg={6}>
            <SettingsCard
              title="حالات ترشيح الجواز"
              items={passportStatuses}
              onAdd={() => addItem(setPassportStatuses)}
              onUpdate={(idx, field, val) =>
                updateItem(setPassportStatuses, idx, field, val)
              }
              onDelete={(id, isNew, idx) =>
                deleteItem(
                  id,
                  isNew,
                  idx,
                  passportStatuses,
                  setPassportStatuses,
                  deletePassportStatus,
                )
              }
              onSave={() =>
                saveItems(
                  passportStatuses,
                  "/settings/passport-statuses",
                  "statuses",
                  "تم حفظ حالات ترشيح الجواز بنجاح",
                )
              }
              saving={saving}
              emptyMessage="لا توجد حالات ترشيح جواز"
            />
          </Col>
          <Col xs={12} lg={6}>
            <SettingsCard
              title="حالات التحويل"
              items={transferStatuses}
              onAdd={() => addItem(setTransferStatuses)}
              onUpdate={(idx, field, val) =>
                updateItem(setTransferStatuses, idx, field, val)
              }
              onDelete={(id, isNew, idx) =>
                deleteItem(
                  id,
                  isNew,
                  idx,
                  transferStatuses,
                  setTransferStatuses,
                  deleteTransferStatus,
                )
              }
              onSave={() =>
                saveItems(
                  transferStatuses,
                  "/settings/transfer-statuses",
                  "statuses",
                  "تم حفظ حالات التحويل بنجاح",
                )
              }
              saving={saving}
              emptyMessage="لا توجد حالات تحويل"
            />
          </Col>
        </Row>

        <SectionTitle
          title="البيانات المالية"
          subtitle="البنوك وطرق الدفع"
          icon="💰"
        />
        <Row className="g-4">
          <Col xs={12} lg={6}>
            <SettingsCard
              title="أسماء البنوك"
              items={bankNames}
              onAdd={() => addItem(setBankNames)}
              onUpdate={(idx, field, val) =>
                updateItem(setBankNames, idx, field, val)
              }
              onDelete={(id, isNew, idx) =>
                deleteItem(
                  id,
                  isNew,
                  idx,
                  bankNames,
                  setBankNames,
                  deleteBankName,
                )
              }
              onSave={() =>
                saveItems(
                  bankNames,
                  "/settings/bank-names",
                  "banks",
                  "تم حفظ أسماء البنوك بنجاح",
                )
              }
              saving={saving}
              emptyMessage="لا توجد أسماء بنوك"
            />
          </Col>
          <Col xs={12} lg={6}>
            <SettingsCard
              title="طرق الدفع"
              items={paymentMethods}
              onAdd={() => addItem(setPaymentMethods)}
              onUpdate={(idx, field, val) =>
                updateItem(setPaymentMethods, idx, field, val)
              }
              onDelete={(id, isNew, idx) =>
                deleteItem(
                  id,
                  isNew,
                  idx,
                  paymentMethods,
                  setPaymentMethods,
                  deletePaymentMethod,
                )
              }
              onSave={() =>
                saveItems(
                  paymentMethods,
                  "/settings/payment-methods",
                  "methods",
                  "تم حفظ طرق الدفع بنجاح",
                )
              }
              saving={saving}
              emptyMessage="لا توجد طرق دفع"
            />
          </Col>
        </Row>

        <SectionTitle
          title="الخدمات والتوثيق"
          subtitle="أنواع الخدمات وحالات التوثيق والتفويض"
          icon="📑"
        />
        <Row className="g-4">
          <Col xs={12} lg={4}>
            <SettingsCard
              title="أنواع الخدمات"
              items={serviceTypes}
              onAdd={() => addItem(setServiceTypes)}
              onUpdate={(idx, field, val) =>
                updateItem(setServiceTypes, idx, field, val)
              }
              onDelete={(id, isNew, idx) =>
                deleteItem(
                  id,
                  isNew,
                  idx,
                  serviceTypes,
                  setServiceTypes,
                  deleteServiceType,
                )
              }
              onSave={() =>
                saveItems(
                  serviceTypes,
                  "/settings/service-types",
                  "types",
                  "تم حفظ أنواع الخدمات بنجاح",
                )
              }
              saving={saving}
              emptyMessage="لا توجد أنواع خدمات"
            />
          </Col>
          <Col xs={12} lg={4}>
            <SettingsCard
              title="حالات التوثيق"
              items={authenticationStatuses}
              onAdd={() => addItem(setAuthenticationStatuses)}
              onUpdate={(idx, field, val) =>
                updateItem(setAuthenticationStatuses, idx, field, val)
              }
              onDelete={(id, isNew, idx) =>
                deleteItem(
                  id,
                  isNew,
                  idx,
                  authenticationStatuses,
                  setAuthenticationStatuses,
                  deleteAuthenticationStatus,
                )
              }
              onSave={() =>
                saveItems(
                  authenticationStatuses,
                  "/settings/authentication-statuses",
                  "statuses",
                  "تم حفظ حالات التوثيق بنجاح",
                )
              }
              saving={saving}
              emptyMessage="لا توجد حالات توثيق"
            />
          </Col>
          <Col xs={12} lg={4}>
            <SettingsCard
              title="حالات التفويض"
              items={authorizationStatuses}
              onAdd={() => addItem(setAuthorizationStatuses)}
              onUpdate={(idx, field, val) =>
                updateItem(setAuthorizationStatuses, idx, field, val)
              }
              onDelete={(id, isNew, idx) =>
                deleteItem(
                  id,
                  isNew,
                  idx,
                  authorizationStatuses,
                  setAuthorizationStatuses,
                  deleteAuthorizationStatus,
                )
              }
              onSave={() =>
                saveItems(
                  authorizationStatuses,
                  "/settings/authorization-statuses",
                  "statuses",
                  "تم حفظ حالات التفويض بنجاح",
                )
              }
              saving={saving}
              emptyMessage="لا توجد حالات تفويض"
            />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default SettingsPage;
