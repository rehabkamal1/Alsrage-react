import React from "react";
import { Form, InputGroup, Button, Spinner, Row, Col } from "react-bootstrap";
import Select from "react-select";

const FinanceSearchBar = ({
    searchQuery,
    onSearch,
    onClear,
    loading,
    paymentMethods,
    filters,
    onFilterChange,
    sortField,
    sortDirection,
    onSortChange,
}) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(searchQuery);
    };

    return (
        <Form onSubmit={handleSubmit} className="mb-4">
            <InputGroup className="mb-3">
                <Form.Control
                    type="text"
                    placeholder="ابحث برقم الطلب أو رقم الحوالة أو اسم العميل..."
                    value={searchQuery}
                    onChange={(e) => onSearch(e.target.value)}
                    className="rounded-3"
                />
                {searchQuery && (
                    <Button
                        variant="outline-secondary"
                        onClick={onClear}
                        className="rounded-3"
                    >
                        مسح
                    </Button>
                )}
                <Button
                    type="submit"
                    variant="dark"
                    disabled={loading}
                    className="rounded-3"
                >
                    {loading ? (
                        <>
                            <Spinner
                                as="span"
                                animation="border"
                                size="sm"
                                role="status"
                                aria-hidden="true"
                                className="me-1"
                            />
                            جاري البحث...
                        </>
                    ) : (
                        "بحث"
                    )}
                </Button>
            </InputGroup>

            <Row className="g-2 align-items-end">
                <Col md={3}>
                    <Form.Group>
                        <Form.Label className="small text-secondary">
                            النوع
                        </Form.Label>
                        <Select
                            options={[
                                { value: "", label: "الكل" },
                                { value: "receipt", label: "مقبوضات" },
                                { value: "payment", label: "مصروفات" },
                            ]}
                            value={
                                filters.type === "receipt"
                                    ? { value: "receipt", label: "مقبوضات" }
                                    : filters.type === "payment"
                                      ? { value: "payment", label: "مصروفات" }
                                      : { value: "", label: "الكل" }
                            }
                            onChange={(opt) =>
                                onFilterChange("type", opt ? opt.value : "")
                            }
                            placeholder="النوع"
                            isRtl
                        />
                    </Form.Group>
                </Col>
                <Col md={3}>
                    <Form.Group>
                        <Form.Label className="small text-secondary">
                            طريقة الدفع
                        </Form.Label>
                        <Select
                            options={[
                                { value: "", label: "الكل" },
                                ...paymentMethods.map((m) => ({
                                    value: m.value,
                                    label: m.label,
                                })),
                            ]}
                            value={
                                paymentMethods.find(
                                    (m) => m.value === filters.payment_method,
                                )
                                    ? {
                                          value: filters.payment_method,
                                          label: paymentMethods.find(
                                              (m) =>
                                                  m.value ===
                                                  filters.payment_method,
                                          ).label,
                                      }
                                    : { value: "", label: "الكل" }
                            }
                            onChange={(opt) =>
                                onFilterChange(
                                    "payment_method",
                                    opt ? opt.value : "",
                                )
                            }
                            placeholder="طريقة الدفع"
                            isRtl
                        />
                    </Form.Group>
                </Col>
                <Col md={3}>
                    <Form.Group>
                        <Form.Label className="small text-secondary">
                            مراجعة
                        </Form.Label>
                        <Select
                            options={[
                                { value: "", label: "الكل" },
                                { value: "1", label: "تمت المراجعة" },
                                { value: "0", label: "لم تتم المراجعة" },
                            ]}
                            value={
                                filters.is_reviewed === "1"
                                    ? { value: "1", label: "تمت المراجعة" }
                                    : filters.is_reviewed === "0"
                                      ? { value: "0", label: "لم تتم المراجعة" }
                                      : { value: "", label: "الكل" }
                            }
                            onChange={(opt) =>
                                onFilterChange(
                                    "is_reviewed",
                                    opt ? opt.value : "",
                                )
                            }
                            placeholder="الكل"
                            isRtl
                        />
                    </Form.Group>
                </Col>
                <Col md={3}>
                    <Form.Group>
                        <Form.Label className="small text-secondary">
                            ترتيب حسب
                        </Form.Label>
                        <Select
                            options={[
                                { value: "id", label: "رقم الحوالة" },
                                { value: "amount", label: "المبلغ" },
                                {
                                    value: "transfer_date",
                                    label: "تاريخ الحوالة",
                                },
                                { value: "created_at", label: "تاريخ الإنشاء" },
                            ]}
                            value={{
                                value: sortField,
                                label:
                                    sortField === "id"
                                        ? "رقم الحوالة"
                                        : sortField === "amount"
                                          ? "المبلغ"
                                          : sortField === "transfer_date"
                                            ? "تاريخ الحوالة"
                                            : "تاريخ الإنشاء",
                            }}
                            onChange={(opt) =>
                                onSortChange(
                                    opt ? opt.value : "id",
                                    sortDirection,
                                )
                            }
                            isRtl
                        />
                    </Form.Group>
                </Col>
            </Row>
        </Form>
    );
};

export default FinanceSearchBar;
