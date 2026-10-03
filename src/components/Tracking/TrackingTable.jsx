import React, { useState, useCallback } from "react";
import { Button, Image, Modal, Form } from "react-bootstrap";
import SortableTable from "../common/SortableTable";
import api from "../../services/apiService";
import { showSuccess, showError, showConfirm } from "../../utils/swalHelper";
import { trackingColumns } from "../../constants/trackingColumns";

const TrackingTable = ({
  tracking,
  onEdit,
  onDelete,
  onRefresh,
  priorityLevels = [],
  passportStatuses = [],
  transferStatuses = [],
  authenticationStatuses = [],
  authorizationStatuses = [],
  onWhatsAppUpdate,
}) => {
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageTitle, setSelectedImageTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [currentTrackingId, setCurrentTrackingId] = useState(null);
  const [imageTitle, setImageTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const getColor = (value, options) => {
    const found = options?.find(
      (o) => String(o.value || o.key || o.id) === String(value),
    );
    return found?.color || "#6c757d";
  };

  const formatDate = (val) => {
    if (!val) return "-";
    const date = new Date(val);
    if (isNaN(date.getTime())) return val;
    return date.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const handleInlineUpdate = async (trackingId, field, value) => {
    try {
      await api.put(`/order-tracking/${trackingId}`, { [field]: value });
      showSuccess("تم", "تم التحديث بنجاح");
      onWhatsAppUpdate?.(trackingId, field, value);
      onRefresh();
    } catch (error) {
      showError(
        "خطأ",
        error.response?.data?.message || "حدث خطأ أثناء التحديث",
      );
    }
  };

  const renderInlineSelect = (item, field, options, extraClass = "") => {
    const current = getColor(item[field], options);

    return (
      <div className="d-flex justify-content-center">
        <Form.Select
          size="sm"
          value={item[field] || ""}
          onChange={(e) => handleInlineUpdate(item.id, field, e.target.value)}
          className={`rounded-pill border-0 shadow-sm text-center fw-bold px-3 py-1 status-select ${extraClass}`}
          style={{
            backgroundColor: current,
            color: "#fff",
            cursor: "pointer",
            fontSize: "0.85rem",
            width: "fit-content",
            minWidth: "130px",
          }}
        >
          <option value="">-- اختر --</option>
          {options.map((opt) => (
            <option
              key={opt.value || opt.key || opt.id}
              value={opt.value || opt.key || opt.id}
              style={{
                backgroundColor: opt.color || "#6c757d",
                color: "#fff",
              }}
            >
              {opt.label}
            </option>
          ))}
        </Form.Select>
      </div>
    );
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  }, []);

  const validateFile = (file) => {
    const allowed = ["image/jpeg", "image/png", "image/jpg", "image/gif"];
    if (!allowed.includes(file.type)) {
      showError("خطأ", "صيغة غير مدعومة");
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      showError("خطأ", "الحجم أكبر من 5MB");
      return false;
    }
    return true;
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file && validateFile(file)) setSelectedFile(file);
  }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file && validateFile(file)) setSelectedFile(file);
  };

  const openUploadModal = (trackingId) => {
    setCurrentTrackingId(trackingId);
    setImageTitle("");
    setSelectedFile(null);
    setShowUploadModal(true);
  };

  const handleUploadImage = async () => {
    if (!selectedFile) return showError("تنبيه", "اختر صورة أولاً");
    if (!imageTitle.trim()) return showError("تنبيه", "أدخل عنوان الصورة");
    setUploading(true);
    const formData = new FormData();
    formData.append("title", imageTitle);
    formData.append("file", selectedFile);
    try {
      await api.post(
        `/order-tracking/${currentTrackingId}/attachments`,
        formData,
      );
      showSuccess("تم", "تمت إضافة الصورة");
      onRefresh();
      setShowUploadModal(false);
      setImageTitle("");
      setSelectedFile(null);
    } catch (err) {
      showError("خطأ", err.response?.data?.message || "حدث خطأ");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (attachmentId) => {
    const result = await showConfirm(
      "هل أنت متأكد؟",
      "سيتم حذف الصورة نهائياً",
    );
    if (!result.isConfirmed) return;
    setDeleting(true);
    try {
      await api.delete(`/attachments/${attachmentId}`);
      showSuccess("تم الحذف", "تم حذف الصورة");
      onRefresh();
    } catch (err) {
      showError("خطأ", err.response?.data?.message || "حدث خطأ");
    } finally {
      setDeleting(false);
    }
  };

  const renderCell = (item, columnId) => {
    const priorityColor = getColor(item.priority_level, priorityLevels);

    switch (columnId) {
      case "strip":
        return (
          <td
            className="priority-strip"
            style={{
              padding: 0,
              width: "5px",
              minWidth: "5px",
              backgroundColor: priorityColor,
              border: "none",
            }}
          ></td>
        );

      case "order_number":
        return (
          <td className="fw-semibold">#{item.order_number || item.order_id}</td>
        );

      case "visa_holder":
        return (
          <td>
            <div>{item.visa_holder_name || "-"}</div>
            <small className="text-muted" style={{ fontSize: "0.72rem" }}>
              {item.saudi_office_name && `سعودي: ${item.saudi_office_name}`}
              {item.external_office_name && item.saudi_office_name && <br />}
              {item.external_office_name &&
                `خارجي: ${item.external_office_name}`}
            </small>
          </td>
        );

      case "visa_number":
        return <td dir="ltr">{item.visa_number || "-"}</td>;

      case "id_number":
        return <td dir="ltr">{item.id_number || "-"}</td>;

      case "delegate_phone":
        return (
          <td dir="ltr">{item.delegate_phone || item.sponsor_number || "-"}</td>
        );

      case "passport_number":
        return <td dir="ltr">{item.passport_number || "-"}</td>;

      case "authorization_number":
        return <td dir="ltr">{item.authorization_number || "-"}</td>;

      case "authentication_number":
        return <td dir="ltr">{item.authentication_number || "-"}</td>;

      case "authentication_date":
        return <td>{formatDate(item.authentication_date)}</td>;

      case "certification_date":
        return <td>{formatDate(item.certification_date)}</td>;

      case "last_action_date":
        return <td>{formatDate(item.last_action_date)}</td>;

      case "external_office":
        return (
          <td>
            {item.external_office_name || "-"}
            {item.external_office_country && (
              <small className="text-muted d-block">
                {item.external_office_country}
              </small>
            )}
          </td>
        );

      case "passport_status":
        return (
          <td>
            {renderInlineSelect(item, "passport_status", passportStatuses)}
          </td>
        );

      case "transfer_status":
        return (
          <td>
            {renderInlineSelect(item, "transfer_status", transferStatuses)}
          </td>
        );

      case "authentication_status":
        return (
          <td>
            {renderInlineSelect(
              item,
              "authentication_status",
              authenticationStatuses,
            )}
          </td>
        );

      case "authorization_status":
        return (
          <td>
            {renderInlineSelect(
              item,
              "authorization_status",
              authorizationStatuses,
            )}
          </td>
        );

      case "priority_level":
        return (
          <td>
            {renderInlineSelect(
              item,
              "priority_level",
              priorityLevels,
              "priority-select",
            )}
          </td>
        );

      case "attachments":
        return (
          <td className="align-middle">
            <div className="d-flex flex-wrap gap-1 mb-1">
              {item.attachments?.map((att) => (
                <div
                  key={att.id}
                  style={{
                    position: "relative",
                    display: "inline-flex",
                    alignItems: "center",
                  }}
                >
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 text-decoration-none text-primary"
                    style={{ fontSize: "0.78rem" }}
                    onClick={() => {
                      setSelectedImage(att.file_path);
                      setSelectedImageTitle(att.title);
                      setShowImageModal(true);
                    }}
                    title={att.title}
                  >
                    📷{" "}
                    {att.title?.length > 12
                      ? att.title.substring(0, 12) + "…"
                      : att.title}
                  </Button>
                  <button
                    onClick={() => handleDeleteImage(att.id)}
                    disabled={deleting}
                    title="حذف الصورة"
                    style={{
                      marginRight: "4px",
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      background: "#dc3545",
                      border: "none",
                      color: "#fff",
                      fontSize: "12px",
                      fontWeight: "bold",
                      lineHeight: 1,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <Button
              variant="outline-primary"
              size="sm"
              className="rounded-2"
              style={{ fontSize: "0.75rem" }}
              onClick={() => openUploadModal(item.id)}
            >
              + صورة
            </Button>
          </td>
        );

      case "actions":
        return (
          <td>
            <div className="d-flex gap-1 justify-content-center">
              <Button
                variant="link"
                className="text-primary p-0 rounded-circle"
                onClick={() => onEdit(item)}
                style={{
                  width: "30px",
                  height: "30px",
                  background: "rgba(13,110,253,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </Button>
              <Button
                variant="link"
                className="text-danger p-0 rounded-circle"
                onClick={() => onDelete(item.id)}
                style={{
                  width: "30px",
                  height: "30px",
                  background: "rgba(220,38,38,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </Button>
            </div>
          </td>
        );

      default:
        return <td>-</td>;
    }
  };

  const getRowProps = (item) => {
    const color = getColor(item.priority_level, priorityLevels);
    return {
      style: {
        "--priority-color": color,
      },
    };
  };

  return (
    <>
      <SortableTable
        data={tracking || []}
        columns={trackingColumns}
        storageKey="tracking_columns_order"
        renderCell={renderCell}
        getRowProps={getRowProps}
        emptyMessage="لا توجد متابعات"
        tableClassName="text-center tracking-table"
      />

      <Modal
        show={showImageModal}
        onHide={() => setShowImageModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>{selectedImageTitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <Image src={selectedImage} fluid />
        </Modal.Body>
      </Modal>

      <Modal
        show={showUploadModal}
        onHide={() => setShowUploadModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>إضافة صورة جديدة</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>
              عنوان الصورة <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="أدخل عنوان الصورة"
              value={imageTitle}
              onChange={(e) => setImageTitle(e.target.value)}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>
              رفع الصورة <span className="text-danger">*</span>
            </Form.Label>
            <div
              className={`border rounded-3 p-4 text-center ${
                dragActive ? "border-primary bg-primary bg-opacity-10" : ""
              }`}
              style={{ cursor: "pointer", borderStyle: "dashed" }}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => document.getElementById("fileInput").click()}
            >
              <input
                type="file"
                id="fileInput"
                accept="image/*"
                className="d-none"
                onChange={handleFileSelect}
              />
              {selectedFile ? (
                <div>
                  <div className="mb-1">📷 {selectedFile.name}</div>
                  <div className="small text-muted">انقر لتغيير الملف</div>
                </div>
              ) : (
                <div>
                  <div className="mb-1">📷 اسحب وأفلت الصورة هنا</div>
                  <div className="small text-muted">أو انقر لاختيار ملف</div>
                </div>
              )}
            </div>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={() => setShowUploadModal(false)}>
            إلغاء
          </Button>
          <Button
            variant="dark"
            onClick={handleUploadImage}
            disabled={!selectedFile || !imageTitle.trim() || uploading}
          >
            {uploading ? "جاري الرفع..." : "رفع الصورة"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default TrackingTable;
