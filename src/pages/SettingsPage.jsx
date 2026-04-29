import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import api, {
  deletePriorityLevel,
  deletePassportStatus,
  deleteTransferStatus,
  deletePaymentMethod,
  deleteBankName,
  deleteMarketingStatus,
  deleteOrderStatus,
} from "../services/apiService";
import { showSuccess, showError, showConfirm } from "../utils/swalHelper";
import TableSkeleton from "../components/common/TableSkeleton";
import SettingsCard from "../components/Settings/SettingsCard";

const SettingsPage = () => {
  const [priorityLevels, setPriorityLevels] = useState([]);
  const [passportStatuses, setPassportStatuses] = useState([]);
  const [transferStatuses, setTransferStatuses] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [bankNames, setBankNames] = useState([]);
  const [marketingStatuses, setMarketingStatuses] = useState([]);
  const [orderStatuses, setOrderStatuses] = useState([]);
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
        marketingRes,
        orderRes,
      ] = await Promise.all([
        api.get("/settings/priority-levels"),
        api.get("/settings/passport-statuses"),
        api.get("/settings/transfer-statuses"),
        api.get("/settings/payment-methods"),
        api.get("/settings/bank-names"),
        api.get("/settings/marketing-statuses"),
        api.get("/settings/order-statuses"),
      ]);
      setPriorityLevels(
        priorityRes.data.data.map((item) => ({ ...item, isNew: false })),
      );
      setPassportStatuses(
        passportRes.data.data.map((item) => ({ ...item, isNew: false })),
      );
      setTransferStatuses(
        transferRes.data.data.map((item) => ({ ...item, isNew: false })),
      );
      setPaymentMethods(
        paymentRes.data.data.map((item) => ({ ...item, isNew: false })),
      );
      setBankNames(
        bankRes.data.data.map((item) => ({ ...item, isNew: false })),
      );
      setMarketingStatuses(
        marketingRes.data.data.map((item) => ({ ...item, isNew: false })),
      );
      setOrderStatuses(
        orderRes.data.data.map((item) => ({ ...item, isNew: false })),
      );
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const addItem = (setter) => {
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
    groupName,
  ) => {
    if (isNew || !id) {
      const updated = items.filter((_, i) => i !== index);
      setter(updated);
      showSuccess("تم", "تم الحذف بنجاح");
    } else if (id) {
      const result = await showConfirm(
        "هل أنت متأكد؟",
        `سيتم حذف هذا العنصر من ${groupName} نهائياً`,
      );
      if (result.isConfirmed) {
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
    }
  };

  const updateItem = (setter, index, field, value) => {
    setter((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
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
          is_active: item.is_active !== undefined ? item.is_active : true,
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
          backgroundColor: "#f5f7fa",
          minHeight: "100vh",
          padding: "24px",
        }}
      >
        <Container fluid>
          <h1 className="h3 mb-4 fw-bold">الإعدادات</h1>
          <TableSkeleton rows={3} columns={3} />
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
        <h1 className="h3 mb-4 fw-bold">الإعدادات</h1>

        <Row className="g-4">
          <Col md={6}>
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
                  "درجات الأهمية",
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

          <Col md={6}>
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
                  "حالات ترشيح الجواز",
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
        </Row>

        <Row className="mt-4">
          <Col md={6}>
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
                  "حالات التحويل",
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

          <Col md={6}>
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
                  "طرق الدفع",
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

        <Row className="mt-4">
          <Col md={6}>
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
                  "أسماء البنوك",
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

          <Col md={6}>
            <SettingsCard
              title="حالات التسويق"
              items={marketingStatuses}
              onAdd={() => addItem(setMarketingStatuses)}
              onUpdate={(idx, field, val) =>
                updateItem(setMarketingStatuses, idx, field, val)
              }
              onDelete={(id, isNew, idx) =>
                deleteItem(
                  id,
                  isNew,
                  idx,
                  marketingStatuses,
                  setMarketingStatuses,
                  deleteMarketingStatus,
                  "حالات التسويق",
                )
              }
              onSave={() =>
                saveItems(
                  marketingStatuses,
                  "/settings/marketing-statuses",
                  "statuses",
                  "تم حفظ حالات التسويق بنجاح",
                )
              }
              saving={saving}
              emptyMessage="لا توجد حالات تسويق"
            />
          </Col>
          <Col md={6}>
            <SettingsCard
              title="حالات الطلبات"
              items={orderStatuses}
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
                  "حالات الطلبات",
                )
              }
              onSave={() =>
                saveItems(
                  orderStatuses,
                  "/settings/order-statuses",
                  "statuses",
                  "تم حفظ حالات الطلبات بنجاح",
                )
              }
              saving={saving}
              emptyMessage="لا توجد حالات طلبات"
            />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default SettingsPage;
