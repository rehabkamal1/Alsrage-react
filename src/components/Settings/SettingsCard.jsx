import React from "react";
import { Card, Button, Form, Row, Col, Badge } from "react-bootstrap";
import { showConfirm } from "../../utils/swalHelper";

const SettingsCard = ({
  title,
  items,
  onAdd,
  onUpdate,
  onDelete,
  onSave,
  saving,
  emptyMessage,
  showTargetDays = false,
}) => {
  const handleDelete = async (id, isNew, idx, label) => {
    const result = await showConfirm(
      "هل أنت متأكد؟",
      `هل تريد حذف العنصر "${label}" من ${title}؟`,
    );
    if (result.isConfirmed) {
      onDelete(id, isNew, idx);
    }
  };

  return (
    <Card className="shadow-sm border-0 rounded-4 h-100">
      <Card.Header className="bg-white border-0 pt-3 pb-2">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <h6 className="mb-0 fw-bold">{title}</h6>
          <Button
            variant="outline-primary"
            size="sm"
            onClick={onAdd}
            style={{ fontSize: "12px", padding: "4px 12px" }}
            className="flex-shrink-0"
          >
            + إضافة
          </Button>
        </div>
      </Card.Header>
      <Card.Body className="d-flex flex-column p-3">
        <div
          className="flex-grow-1"
          style={{ maxHeight: "400px", overflowY: "auto" }}
        >
          {items.length === 0 ? (
            <div className="text-center py-3 text-muted small">
              {emptyMessage || "لا توجد عناصر"}
            </div>
          ) : (
            items.map((item, idx) => (
              <div
                key={item.uniqueId || item.id || item.key || idx}
                className="mb-2 p-2 border rounded-3"
              >
                <Row className="g-2 align-items-center">
                  <Col xs={12} sm={showTargetDays ? 4 : 5} md={showTargetDays ? 4 : 5}>
                    <Form.Control
                      type="text"
                      placeholder="اسم المرحلة"
                      size="sm"
                      value={item.label}
                      onChange={(e) => onUpdate(idx, "label", e.target.value)}
                      style={{ fontSize: "13px" }}
                    />
                  </Col>

                  {showTargetDays && (
                    <Col xs={6} sm={3} md={3}>
                      <Form.Control
                        type="number"
                        placeholder="الأيام مسموحة"
                        title="الفترة الزمنية المسموحة بالأيام لهذه المرحلة"
                        size="sm"
                        value={item.target_days ?? 60}
                        onChange={(e) => onUpdate(idx, "target_days", e.target.value)}
                        style={{ fontSize: "12px" }}
                      />
                    </Col>
                  )}

                  <Col xs={showTargetDays ? 3 : 3} sm={showTargetDays ? 2 : 2} md={showTargetDays ? 2 : 2}>
                    <Form.Control
                      type="color"
                      size="sm"
                      value={item.color || "#6c757d"}
                      onChange={(e) => onUpdate(idx, "color", e.target.value)}
                      style={{ height: "31px", width: "100%" }}
                    />
                  </Col>
                  <Col xs={3} sm={showTargetDays ? 3 : 5} md={showTargetDays ? 3 : 5} className="d-flex align-items-center justify-content-between gap-1">
                    {item.label && (
                      <Badge
                        style={{
                          backgroundColor: item.color || "#6c757d",
                          fontSize: "10px",
                          flex: 1,
                          textAlign: "center",
                        }}
                        className="py-1 px-1 text-truncate"
                      >
                        {item.label}
                      </Badge>
                    )}
                    <Button
                      variant="link"
                      size="sm"
                      className="text-danger p-0 ms-1 flex-shrink-0"
                      onClick={() =>
                        handleDelete(item.id, item.isNew, idx, item.label)
                      }
                      style={{ fontSize: "12px", textDecoration: "none" }}
                    >
                      حذف
                    </Button>
                  </Col>
                </Row>
              </div>
            ))
          )}
        </div>
        <Button
          variant="dark"
          onClick={onSave}
          disabled={saving}
          className="w-100 mt-3"
          size="sm"
        >
          {saving ? "جاري الحفظ..." : "حفظ"}
        </Button>
      </Card.Body>
    </Card>
  );
};

export default SettingsCard;
