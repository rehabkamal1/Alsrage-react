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
    return found?.color || "#e9ecef";
  };

  const getPriorityLabel = (level) => {
    const found = priorityLevels?.find((p) => p.value === level);
    return found?.label || level;
  };

  const getPassportStatusColor = (status) => {
    const found = passportStatuses?.find((s) => s.value === status);
    return found?.color || "#6c757d";
  };

  const getPassportStatusLabel = (status) => {
    const found = passportStatuses?.find((s) => s.value === status);
    return found?.label || status;
  };

  const getTransferStatusColor = (status) => {
    const found = transferStatuses?.find((s) => s.value === status);
    return found?.color || "#6c757d";
  };

  const getTransferStatusLabel = (status) => {
    const found = transferStatuses?.find((s) => s.value === status);
    return found?.label || status;
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/gif"];
      if (!validTypes.includes(file.type)) {
        showError(
          "خطأ",
          "نوع الملف غير مدعوم. يرجى رفع صورة بصيغة JPEG, PNG, أو GIF",
        );
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showError("خطأ", "حجم الملف لا يتجاوز 5 ميجابايت");
        return;
      }
      setSelectedFile(file);
    }
  }, []);

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/gif"];
      if (!validTypes.includes(file.type)) {
        showError(
          "خطأ",
          "نوع الملف غير مدعوم. يرجى رفع صورة بصيغة JPEG, PNG, أو GIF",
        );
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showError("خطأ", "حجم الملف لا يتجاوز 5 ميجابايت");
        return;
      }
      setSelectedFile(file);
    }
  };

  const openUploadModal = (trackingId) => {
    setCurrentTrackingId(trackingId);
    setImageTitle("");
    setSelectedFile(null);
    setShowUploadModal(true);
  };

  const handleUploadImage = async () => {
    if (!selectedFile) {
      showError("تنبيه", "يرجى اختيار صورة أولاً");
      return;
    }
    if (!imageTitle.trim()) {
      showError("تنبيه", "يرجى إدخال عنوان الصورة");
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
      showSuccess("تم", "تم إضافة الصورة بنجاح");
      onRefresh();
      setShowUploadModal(false);
      setImageTitle("");
      setSelectedFile(null);
    } catch (error) {
      const message =
        error.response?.data?.message || "حدث خطأ أثناء رفع الصورة";
      showError("خطأ", message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (attachmentId) => {
    const result = await showConfirm(
      "هل أنت متأكد؟",
      "سيتم حذف الصورة نهائياً",
    );
    if (result.isConfirmed) {
      setDeleting(true);
      try {
        await api.delete(`/attachments/${attachmentId}`);
        showSuccess("تم الحذف", "تم حذف الصورة بنجاح");
        onRefresh();
      } catch (error) {
        const message =
          error.response?.data?.message || "حدث خطأ أثناء حذف الصورة";
        showError("خطأ", message);
      } finally {
        setDeleting(false);
      }
    }
  };

  return (
    <div className="table-responsive">
      <Table hover className="mb-0 align-middle">
        <thead className="table-light">
          <tr>
            <th># الطلب</th>
            <th>المكتب السعودي</th>
            <th>صاحب التأشيرة</th>
            <th>رقم التأشيرة</th>
            <th>رقم الكفيل</th>
            <th>رقم الجواز</th>
            <th>رقم التفويض</th>
            <th>رقم التوثيق</th>
            <th>تاريخ آخر إجراء</th>
            <th>حالة ترشيح الجواز</th>
            <th>حالة التحويل</th>
            <th>درجة الأهمية</th>
            <th>الصور</th>
            <th>الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {tracking &&
            tracking.map((item) => {
              const priorityColor = getPriorityColor(item.priority_level);
              return (
                <tr
                  key={item.id}
                  style={{
                    borderRight: `4px solid ${priorityColor}`,
                    backgroundColor: `${priorityColor}08`,
                  }}
                >
                  <td className="fw-semibold">#{item.order_number}</td>
                  <td>{item.saudi_office_name || "-"}</td>
                  <td>{item.visa_holder_name || "-"}</td>
                  <td dir="ltr">{item.visa_number || "-"}</td>
                  <td dir="ltr">{item.sponsor_number || "-"}</td>
                  <td>{item.passport_number || "-"}</td>
                  <td dir="ltr">{item.authorization_number || "-"}</td>
                  <td dir="ltr">{item.authentication_number || "-"}</td>
                  <td>{item.last_action_date || "-"}</td>
                  <td>
                    <Badge
                      style={{
                        backgroundColor: getPassportStatusColor(
                          item.passport_status,
                        ),
                        color: "#fff",
                      }}
                      className="rounded-pill px-2 py-1"
                    >
                      {getPassportStatusLabel(item.passport_status)}
                    </Badge>
                  </td>
                  <td>
                    <Badge
                      style={{
                        backgroundColor: getTransferStatusColor(
                          item.transfer_status,
                        ),
                        color: "#fff",
                      }}
                      className="rounded-pill px-2 py-1"
                    >
                      {getTransferStatusLabel(item.transfer_status)}
                    </Badge>
                  </td>
                  <td>
                    <Badge
                      style={{
                        backgroundColor: priorityColor,
                        color: "#fff",
                      }}
                      className="rounded-pill px-2 py-1"
                    >
                      {getPriorityLabel(item.priority_level)}
                    </Badge>
                  </td>
                  <td className="align-middle">
                    <div className="d-flex flex-wrap gap-1">
                      {item.attachments &&
                        item.attachments.map((att) => (
                          <div
                            key={att.id}
                            className="position-relative d-inline-block"
                          >
                            <Button
                              variant="link"
                              size="sm"
                              className="p-0 text-decoration-none"
                              onClick={() => {
                                setSelectedImage(att.file_path);
                                setSelectedImageTitle(att.title);
                                setShowImageModal(true);
                              }}
                              title={att.title}
                            >
                              📷{" "}
                              {att.title.length > 15
                                ? att.title.substring(0, 15) + "..."
                                : att.title}
                            </Button>
                            <Button
                              variant="link"
                              size="sm"
                              className="text-danger p-0 position-absolute top-0 start-0"
                              style={{
                                fontSize: "10px",
                                marginTop: "-8px",
                                marginLeft: "-8px",
                              }}
                              onClick={() => handleDeleteImage(att.id)}
                              disabled={deleting}
                              title="حذف"
                            >
                              ×
                            </Button>
                          </div>
                        ))}
                    </div>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="mt-1"
                      onClick={() => openUploadModal(item.id)}
                    >
                      + إضافة صورة
                    </Button>
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <Button
                        variant="link"
                        className="text-primary p-0 rounded-circle"
                        onClick={() => onEdit(item)}
                        style={{
                          width: "32px",
                          height: "32px",
                          background: "rgba(13, 110, 253, 0.1)",
                          textDecoration: "none",
                        }}
                      >
                        <svg
                          width="16"
                          height="16"
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
                          width: "32px",
                          height: "32px",
                          background: "rgba(220, 38, 38, 0.1)",
                          textDecoration: "none",
                        }}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          <line x1="10" y1="11" x2="10" y2="17" />
                          <line x1="14" y1="11" x2="14" y2="17" />
                        </svg>
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          {(!tracking || tracking.length === 0) && (
            <tr>
              <td colSpan="14" className="text-center py-5 text-muted">
                لا توجد متابعات
              </td>
            </tr>
          )}
        </tbody>
      </Table>

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
              className={`border rounded-3 p-4 text-center ${dragActive ? "border-primary bg-primary bg-opacity-10" : "border-dashed"}`}
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
                accept="image/jpeg,image/png,image/jpg"
                className="d-none"
                onChange={handleFileSelect}
              />
              {selectedFile ? (
                <div>
                  <div className="mb-2">📷 {selectedFile.name}</div>
                  <div className="small text-muted">انقر لتغيير الملف</div>
                </div>
              ) : (
                <div>
                  <div className="mb-2">📷 اسحب وأفلت الصورة هنا</div>
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

      <style>{`
        .border-dashed {
          border-style: dashed !important;
        }
      `}</style>
    </div>
  );
};

export default TrackingTable;
