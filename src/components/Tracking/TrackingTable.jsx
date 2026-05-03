import React, { useState, useCallback } from "react";
import { Table, Button, Badge, Image, Modal, Form } from "react-bootstrap";
import api from "../../services/apiService";
import { showSuccess, showError, showConfirm } from "../../utils/swalHelper";

const TrackingTable = ({
  tracking,
  onEdit,
  onDelete,
  onRefresh,
  priorityLevels,
  passportStatuses,
  transferStatuses,
  externalOffices,
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

  const getPriorityColor = (level) => {
    const found = priorityLevels?.find((p) => p.value === level);
    return found?.color || "#6c757d";
  };

  const getPriorityLabel = (level) => {
    const found = priorityLevels?.find((p) => p.value === level);
    return found?.label || level || "-";
  };

  const getPassportColor = (status) => {
    const found = passportStatuses?.find((s) => s.value === status);
    return found?.color || "#6c757d";
  };

  const getPassportLabel = (status) => {
    const found = passportStatuses?.find((s) => s.value === status);
    return found?.label || status || "-";
  };

  const getTransferColor = (status) => {
    const found = transferStatuses?.find((s) => s.value === status);
    return found?.color || "#6c757d";
  };

  const getTransferLabel = (status) => {
    const found = transferStatuses?.find((s) => s.value === status);
    return found?.label || status || "-";
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
      onRefresh();
    } catch (error) {
      showError(
        "خطأ",
        error.response?.data?.message || "حدث خطأ أثناء التحديث",
      );
    }
  };

  const renderPassportStatusDropdown = (item) => {
    const currentColor = getPassportColor(item.passport_status);

    return (
      <div className="d-flex justify-content-center">
        <Form.Select
          size="sm"
          value={item.passport_status || ""}
          onChange={(e) =>
            handleInlineUpdate(item.id, "passport_status", e.target.value)
          }
          className="rounded-pill border-0 shadow-sm text-center fw-bold px-3 py-1 status-select"
          style={{
            backgroundColor: currentColor,
            color: "#fff",
            cursor: "pointer",
            fontSize: "0.85rem",
            width: "fit-content",
            minWidth: "130px",
            transition: "all 0.2s ease-in-out",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
          title="اضغط لتغيير حالة ترشيح الجواز"
        >
          <option value="">-- اختر --</option>
          {passportStatuses.map((status) => (
            <option
              key={status.value}
              value={status.value}
              style={{ backgroundColor: status.color, color: "#fff" }}
            >
              {status.label}
            </option>
          ))}
        </Form.Select>
      </div>
    );
  };

  const renderTransferStatusDropdown = (item) => {
    const currentColor = getTransferColor(item.transfer_status);

    return (
      <div className="d-flex justify-content-center">
        <Form.Select
          size="sm"
          value={item.transfer_status || ""}
          onChange={(e) =>
            handleInlineUpdate(item.id, "transfer_status", e.target.value)
          }
          className="rounded-pill border-0 shadow-sm text-center fw-bold px-3 py-1 status-select"
          style={{
            backgroundColor: currentColor,
            color: "#fff",
            cursor: "pointer",
            fontSize: "0.85rem",
            width: "fit-content",
            minWidth: "130px",
            transition: "all 0.2s ease-in-out",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
          title="اضغط لتغيير حالة التحويل"
        >
          <option value="">-- اختر --</option>
          {transferStatuses.map((status) => (
            <option
              key={status.value}
              value={status.value}
              style={{ backgroundColor: status.color, color: "#fff" }}
            >
              {status.label}
            </option>
          ))}
        </Form.Select>
      </div>
    );
  };

  const renderPriorityDropdown = (item) => {
    const currentColor = getPriorityColor(item.priority_level);

    return (
      <div className="d-flex justify-content-center">
        <Form.Select
          size="sm"
          value={item.priority_level || ""}
          onChange={(e) =>
            handleInlineUpdate(item.id, "priority_level", e.target.value)
          }
          className="rounded-pill border-0 shadow-sm text-center fw-bold px-3 py-1 priority-select"
          style={{
            backgroundColor: currentColor,
            color: "#fff",
            cursor: "pointer",
            fontSize: "0.85rem",
            width: "fit-content",
            minWidth: "130px",
            transition: "all 0.2s ease-in-out",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
          title="اضغط لتغيير درجة الأهمية"
        >
          <option value="">-- اختر --</option>
          {priorityLevels.map((priority) => (
            <option
              key={priority.value}
              value={priority.value}
              style={{ backgroundColor: priority.color, color: "#fff" }}
            >
              {priority.label}
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

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (
      !["image/jpeg", "image/png", "image/jpg", "image/gif"].includes(file.type)
    ) {
      showError("خطأ", "صيغة غير مدعومة");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showError("خطأ", "الحجم أكبر من 5MB");
      return;
    }
    setSelectedFile(file);
  }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (
      !["image/jpeg", "image/png", "image/jpg", "image/gif"].includes(file.type)
    ) {
      showError("خطأ", "صيغة غير مدعومة");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showError("خطأ", "الحجم أكبر من 5MB");
      return;
    }
    setSelectedFile(file);
  };

  const openUploadModal = (trackingId) => {
    setCurrentTrackingId(trackingId);
    setImageTitle("");
    setSelectedFile(null);
    setShowUploadModal(true);
  };

  const handleUploadImage = async () => {
    if (!selectedFile) {
      showError("تنبيه", "اختر صورة أولاً");
      return;
    }
    if (!imageTitle.trim()) {
      showError("تنبيه", "أدخل عنوان الصورة");
      return;
    }
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

  return (
    <div className="table-responsive">
      <Table
        hover
        className="mb-0 align-middle"
        style={{ fontSize: "0.85rem" }}
      >
        <thead className="table-light">
          <tr>
            <th style={{ minWidth: "70px" }}># الطلب</th>
            <th style={{ minWidth: "170px" }}>صاحب التأشيرة</th>
            <th style={{ minWidth: "90px" }}>التأشيرة</th>
            <th style={{ minWidth: "80px" }}>الهوية</th>
            <th style={{ minWidth: "80px" }}>الكفيل</th>
            <th style={{ minWidth: "80px" }}>رقم الجواز</th>
            <th style={{ minWidth: "90px" }}>رقم التفويض</th>
            <th style={{ minWidth: "80px" }}>رقم التوثيق</th>
            <th style={{ minWidth: "90px" }}>تاريخ التوثيق</th>
            <th style={{ minWidth: "90px" }}>تاريخ التصديق</th>
            <th style={{ minWidth: "100px" }}>آخر إجراء</th>
            <th style={{ minWidth: "120px" }}>المكتب الخارجي</th>
            <th style={{ minWidth: "150px" }}>حالة ترشيح الجواز</th>
            <th style={{ minWidth: "150px" }}>حالة التحويل</th>
            <th style={{ minWidth: "150px" }}>درجة الأهمية</th>
            <th style={{ minWidth: "130px" }}>الصور</th>
            <th style={{ minWidth: "80px" }}>إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {tracking?.map((item) => {
            const priorityColor = getPriorityColor(item.priority_level);
            return (
              <tr
                key={item.id}
                style={{
                  borderRight: `4px solid ${priorityColor}`,
                  backgroundColor: `${priorityColor}10`,
                }}
              >
                <td className="fw-semibold">
                  #{item.order_number || item.order_id}
                </td>
                <td>
                  <div>{item.visa_holder_name || "-"}</div>
                  <small className="text-muted" style={{ fontSize: "0.72rem" }}>
                    {item.saudi_office_name &&
                      `سعودي: ${item.saudi_office_name}`}
                    {item.external_office_name && item.saudi_office_name && (
                      <br />
                    )}
                    {item.external_office_name &&
                      `خارجي: ${item.external_office_name}`}
                  </small>
                </td>
                <td dir="ltr">{item.visa_number || "-"}</td>
                <td dir="ltr">{item.id_number || "-"}</td>
                <td dir="ltr">{item.passport_number || "-"}</td>
                <td dir="ltr">{item.sponsor_number || "-"}</td>
                <td dir="ltr">{item.authorization_number || "-"}</td>
                <td dir="ltr">{item.authentication_number || "-"}</td>
                <td>{formatDate(item.authentication_date)}</td>
                <td>{formatDate(item.certification_date)}</td>
                <td>{formatDate(item.last_action_date)}</td>
                <td>
                  {item.external_office_name || "-"}
                  {item.external_office_country && (
                    <small className="text-muted d-block">
                      {item.external_office_country}
                    </small>
                  )}
                </td>
                <td>{renderPassportStatusDropdown(item)}</td>
                <td>{renderTransferStatusDropdown(item)}</td>
                <td>{renderPriorityDropdown(item)}</td>
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
                <td>
                  <div className="d-flex gap-1">
                    <Button
                      variant="link"
                      className="text-primary p-0 rounded-circle"
                      onClick={() => onEdit(item)}
                      style={{
                        width: "30px",
                        height: "30px",
                        background: "rgba(13,110,253,0.1)",
                        textDecoration: "none",
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
                        textDecoration: "none",
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
              </tr>
            );
          })}
          {(!tracking || tracking.length === 0) && (
            <tr>
              <td colSpan="17" className="text-center py-5 text-muted">
                لا توجد متابعات
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      <style>{`
        .status-select:hover, .priority-select:hover {
          transform: translateY(-1px);
          filter: brightness(1.1);
          box-shadow: 0 4px 6px rgba(0,0,0,0.15) !important;
        }
        .status-select:focus, .priority-select:focus {
          box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25) !important;
          outline: 0;
        }
      `}</style>

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
              className={`border rounded-3 p-4 text-center ${dragActive ? "border-primary bg-primary bg-opacity-10" : ""}`}
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
    </div>
  );
};

export default TrackingTable;
