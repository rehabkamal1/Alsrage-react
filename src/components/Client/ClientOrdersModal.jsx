import React from "react";
import { Modal, Table, Badge } from "react-bootstrap";

const ClientOrdersModal = ({ show, onHide, client, orderStatuses = [] }) => {
    const orders = client?.orders || [];

    const getStatusBadge = (status) => {
        const found = orderStatuses.find(
            (s) => String(s.key || s.id) === String(status),
        );
        if (found) {
            return (
                <Badge
                    bg=""
                    style={{
                        backgroundColor: found.color || "#6c757d",
                        color: "#fff",
                    }}
                >
                    {found.label}
                </Badge>
            );
        }
        const statusMap = {
            pending: { label: "قيد الانتظار", bg: "warning" },
            processing: { label: "تحت المعالجة", bg: "info" },
            completed: { label: "مكتمل", bg: "success" },
            cancelled: { label: "ملغي", bg: "danger" },
            musaned_paid: { label: "تم سداد مساند", bg: "primary" },
        };
        const config = statusMap[status] || {
            label: status || "-",
            bg: "secondary",
        };
        return <Badge bg={config.bg}>{config.label}</Badge>;
    };

    const getPaidByOfficeBadge = (isPaidByOffice) => {
        if (isPaidByOffice) {
            return (
                <Badge bg="warning" text="dark">
                    ✅ نعم
                </Badge>
            );
        }
        return <Badge bg="secondary">❌ لا</Badge>;
    };

    return (
        <Modal show={show} onHide={onHide} size="xl" dir="rtl" scrollable>
            <Modal.Header closeButton className="border-0 pt-4 px-4">
                <Modal.Title className="fw-bold fs-5">
                    <i className="fa-solid fa-file-invoice me-2"></i>
                    طلبات العميل: {client?.name || "-"}
                    <span className="text-muted fs-6 me-2">
                        (رقم الهاتف: {client?.phone || "-"})
                    </span>
                </Modal.Title>
            </Modal.Header>

            <Modal.Body className="px-4">
                {orders && orders.length > 0 ? (
                    <div className="table-responsive">
                        <Table hover className="align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th># الطلب</th>
                                    <th>صاحب التأشيرة</th>
                                    <th>رقم صاحب التأشيرة</th>
                                    <th>رقم التأشيرة</th>
                                    <th>نوع الخدمة</th>
                                    <th>رقم عقد مساند</th>
                                    <th>إجمالي السعر</th>
                                    <th>سداد مساند</th>
                                    <th>الرصيد المتبقي</th>
                                    <th>السداد من المكتب</th>
                                    <th>حالة سداد مساند</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <tr key={order.id}>
                                        <td className="fw-semibold">
                                            #{order.id}
                                        </td>
                                        <td>{order.visa_holder_name || "-"}</td>
                                        <td>
                                            {order.visa_holder_phone || "-"}
                                        </td>
                                        <td>{order.visa_number || "-"}</td>
                                        <td>{order.service_type || "-"}</td>
                                        <td>
                                            {order.musaned_contract_number ||
                                                "-"}
                                        </td>
                                        <td>
                                            {order.total_price != null
                                                ? `${Number(order.total_price).toFixed(2)} ر.س`
                                                : "-"}
                                        </td>
                                        <td>
                                            {order.musaned_paid != null
                                                ? `${Number(order.musaned_paid).toFixed(2)} ر.س`
                                                : "-"}
                                        </td>
                                        <td
                                            className={
                                                order.price_difference >= 0
                                                    ? "text-success fw-bold"
                                                    : "text-danger fw-bold"
                                            }
                                        >
                                            {order.price_difference != null
                                                ? `${Number(order.price_difference).toFixed(2)} ر.س`
                                                : "0.00 ر.س"}
                                        </td>
                                        <td>
                                            {getPaidByOfficeBadge(
                                                order.is_paid_by_office,
                                            )}
                                        </td>
                                        <td>{getStatusBadge(order.status)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                ) : (
                    <div className="text-center py-5 text-muted">
                        <i className="fa-regular fa-folder-open display-4 d-block mb-3"></i>
                        <p>لا توجد طلبات لهذا العميل</p>
                    </div>
                )}
            </Modal.Body>
        </Modal>
    );
};

export default ClientOrdersModal;
