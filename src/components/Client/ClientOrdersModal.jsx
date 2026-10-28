import React from "react";
import { Modal, Table, Badge } from "react-bootstrap";

const ClientOrdersModal = ({ show, onHide, client, orderStatuses = [] }) => {
    const orders = client?.orders || [];
    const openingBalance = Number(client?.opening_balance || 0);
    const totalOrdersPrice = orders.reduce((sum, o) => sum + (Number(o.total_price) || 0), 0);
    const totalMusanedPaid = orders.reduce((sum, o) => sum + (Number(o.musaned_paid) || 0), 0);
    const totalOrdersRemaining = orders.reduce((sum, o) => sum + (Number(o.price_difference) || 0), 0);
    const grandTotalRemaining = totalOrdersRemaining + openingBalance;

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
                <div className="row g-3 mb-4">
                    <div className="col-12 col-sm-6 col-md-3">
                        <div className="p-3 bg-light rounded-3 border text-center">
                            <div className="text-muted small mb-1">💰 الرصيد الافتتاحي</div>
                            <div className="fw-bold fs-6 text-dark font-monospace">
                                {openingBalance.toLocaleString()} ر.س
                            </div>
                        </div>
                    </div>
                    <div className="col-12 col-sm-6 col-md-3">
                        <div className="p-3 bg-light rounded-3 border text-center">
                            <div className="text-muted small mb-1">📋 إجمالي العقود</div>
                            <div className="fw-bold fs-6 text-dark font-monospace">
                                {totalOrdersPrice.toLocaleString()} ر.س
                            </div>
                        </div>
                    </div>
                    <div className="col-12 col-sm-6 col-md-3">
                        <div className="p-3 bg-light rounded-3 border text-center">
                            <div className="text-muted small mb-1">✅ إجمالي المحصل</div>
                            <div className="fw-bold fs-6 text-success font-monospace">
                                {totalMusanedPaid.toLocaleString()} ر.س
                            </div>
                        </div>
                    </div>
                    <div className="col-12 col-sm-6 col-md-3">
                        <div className="p-3 bg-light rounded-3 border text-center">
                            <div className="text-muted small mb-1">⚠️ إجمالي المتبقي (شامل الافتتاحي)</div>
                            <div className="fw-bold fs-6 text-danger font-monospace">
                                {grandTotalRemaining.toLocaleString()} ر.س
                            </div>
                        </div>
                    </div>
                </div>

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
                            <tfoot className="table-light border-top border-2 align-middle">
                                <tr>
                                    <td colSpan={6} className="fw-bold text-dark py-3">
                                        الإجمالي (طلبات العميل)
                                    </td>
                                    <td className="fw-bold text-dark font-monospace py-3">
                                        {totalOrdersPrice.toFixed(2)} ر.س
                                    </td>
                                    <td className="fw-bold text-success font-monospace py-3">
                                        {totalMusanedPaid.toFixed(2)} ر.س
                                    </td>
                                    <td className="fw-bold text-danger font-monospace py-3">
                                        {totalOrdersRemaining.toFixed(2)} ر.س
                                    </td>
                                    <td colSpan={2} className="text-muted small py-3">-</td>
                                </tr>
                                {openingBalance > 0 && (
                                    <tr className="bg-warning bg-opacity-10">
                                        <td colSpan={6} className="fw-bold text-dark py-2">
                                            + الرصيد الافتتاحي (مديونية سابقة)
                                        </td>
                                        <td className="fw-bold text-dark font-monospace py-2">
                                            {openingBalance.toFixed(2)} ر.س
                                        </td>
                                        <td className="text-muted small py-2">-</td>
                                        <td className="fw-bold text-danger font-monospace py-2">
                                            {openingBalance.toFixed(2)} ر.س
                                        </td>
                                        <td colSpan={2} className="text-muted small py-2">-</td>
                                    </tr>
                                )}
                                <tr className="border-top border-primary border-2">
                                    <td colSpan={6} className="fw-bold text-primary py-3">
                                        المستحق الكلي النهائي المطلوب سداده
                                    </td>
                                    <td className="fw-bold text-primary font-monospace py-3">
                                        {(totalOrdersPrice + openingBalance).toFixed(2)} ر.س
                                    </td>
                                    <td className="fw-bold text-success font-monospace py-3">
                                        {totalMusanedPaid.toFixed(2)} ر.س
                                    </td>
                                    <td className="fw-bold text-danger font-monospace py-3">
                                        {grandTotalRemaining.toFixed(2)} ر.س
                                    </td>
                                    <td colSpan={2} className="text-muted small py-3">-</td>
                                </tr>
                            </tfoot>
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
