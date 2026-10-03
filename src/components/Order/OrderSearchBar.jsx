import React from "react";
import { Form, InputGroup, Button, Spinner } from "react-bootstrap";
import Select from "react-select";

const OrderSearchBar = ({
    searchQuery,
    onSearch,
    onClear,
    loading,
    filters,
    onFilterChange,
    serviceTypeOptions = [],
    statusOptions = [],
    orderStatusOptions = [],
    isCompletedPage = false,
}) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(searchQuery);
    };

    const customStyles = {
        control: (base) => ({
            ...base,
            borderRadius: "8px",
            minWidth: window.innerWidth < 768 ? "100%" : "180px",
        }),
    };

    return (
        <Form onSubmit={handleSubmit} className="mb-4">
            <InputGroup className="shadow-sm rounded-3 overflow-hidden">
                <Form.Control
                    type="text"
                    placeholder="ابحث برقم الطلب أو اسم العميل أو رقم الهاتف..."
                    value={searchQuery}
                    onChange={(e) => onSearch(e.target.value)}
                    className="border-0 py-2 px-3"
                />
                {searchQuery && (
                    <Button
                        variant="white"
                        onClick={onClear}
                        className="border-0 text-muted"
                    >
                        <i className="fa-solid fa-xmark"></i>
                    </Button>
                )}
                <Button
                    type="submit"
                    variant="dark"
                    disabled={loading}
                    className="px-4 border-0"
                >
                    {loading ? (
                        <Spinner as="span" animation="border" size="sm" />
                    ) : (
                        <i className="fa-solid fa-magnifying-glass"></i>
                    )}
                </Button>
            </InputGroup>
            <div className="d-flex flex-wrap gap-2 mt-3">
                {!isCompletedPage && (
                    <div className="flex-grow-1" style={{ minWidth: "160px" }}>
                        <Select
                            options={[
                                { value: "", label: "كل حالات سداد مساند" },
                                ...statusOptions.map((s) => ({
                                    value: s.key || s.id,
                                    label: s.label,
                                })),
                            ]}
                            value={
                                filters.status
                                    ? {
                                          value: filters.status,
                                          label:
                                              statusOptions.find(
                                                  (s) =>
                                                      (s.key || s.id) ===
                                                      filters.status,
                                              )?.label || filters.status,
                                      }
                                    : { value: "", label: "كل حالات سداد مساند" }
                            }
                            onChange={(opt) =>
                                onFilterChange("status", opt ? opt.value : "")
                            }
                            styles={customStyles}
                            placeholder="حالة سداد مساند"
                            isRtl
                        />
                    </div>
                )}

                {!isCompletedPage && orderStatusOptions.length > 0 && (
                    <div className="flex-grow-1" style={{ minWidth: "160px" }}>
                        <Select
                            options={[
                                { value: "", label: "كل حالات الطلب" },
                                ...orderStatusOptions.map((status) => ({
                                    value: status.key || status.id,
                                    label: status.label,
                                })),
                            ]}
                            value={
                                filters.order_status
                                    ? {
                                          value: filters.order_status,
                                          label:
                                              orderStatusOptions.find(
                                                  (status) =>
                                                      (status.key || status.id) ===
                                                      filters.order_status,
                                              )?.label || filters.order_status,
                                      }
                                    : { value: "", label: "كل حالات الطلب" }
                            }
                            onChange={(option) =>
                                onFilterChange(
                                    "order_status",
                                    option ? option.value : "",
                                )
                            }
                            styles={customStyles}
                            placeholder="حالة الطلب"
                            isRtl
                        />
                    </div>
                )}

                {serviceTypeOptions.length > 0 && (
                    <div className="flex-grow-1" style={{ minWidth: "160px" }}>
                        <Select
                            options={[
                                { value: "", label: "كل أنواع الخدمات" },
                                ...serviceTypeOptions.map((serviceType) => ({
                                    value: serviceType.key || serviceType.label,
                                    label: serviceType.label,
                                })),
                            ]}
                            value={
                                filters.service_type
                                    ? {
                                          value: filters.service_type,
                                          label:
                                              serviceTypeOptions.find(
                                                  (serviceType) =>
                                                      (serviceType.key ||
                                                          serviceType.label) ===
                                                      filters.service_type,
                                              )?.label || filters.service_type,
                                      }
                                    : { value: "", label: "كل أنواع الخدمات" }
                            }
                            onChange={(option) =>
                                onFilterChange(
                                    "service_type",
                                    option ? option.value : "",
                                )
                            }
                            styles={customStyles}
                            placeholder="نوع الخدمة"
                            isClearable
                            isRtl
                        />
                    </div>
                )}

                <div className="flex-grow-1" style={{ minWidth: "160px" }}>
                    <Select
                        options={[
                            { value: "id", label: "رقم الطلب" },
                            { value: "created_at", label: "تاريخ الإضافة" },
                            {
                                value: "visa_holder_name",
                                label: "اسم صاحب التأشيرة",
                            },
                            { value: "visa_number", label: "رقم التأشيرة" },
                            { value: "id_number", label: "رقم الهوية" },
                            {
                                value: "musaned_contract_number",
                                label: "رقم عقد مساند",
                            },
                            { value: "total_price", label: "إجمالي السعر" },
                            { value: "musaned_paid", label: "المبلغ المدفوع" },
                            { value: "order_status", label: "حالة الطلب" },
                            { value: "status", label: "حالة سداد مساند" },
                        ]}
                        value={
                            [
                                { value: "id", label: "رقم الطلب" },
                                { value: "created_at", label: "تاريخ الإضافة" },
                                {
                                    value: "visa_holder_name",
                                    label: "اسم صاحب التأشيرة",
                                },
                                { value: "visa_number", label: "رقم التأشيرة" },
                                { value: "id_number", label: "رقم الهوية" },
                                {
                                    value: "musaned_contract_number",
                                    label: "رقم عقد مساند",
                                },
                                { value: "total_price", label: "إجمالي السعر" },
                                {
                                    value: "musaned_paid",
                                    label: "المبلغ المدفوع",
                                },
                                { value: "order_status", label: "حالة الطلب" },
                                { value: "status", label: "حالة سداد مساند" },
                            ].find((opt) => opt.value === filters.sort_by) || {
                                value: "id",
                                label: "رقم الطلب",
                            }
                        }
                        onChange={(opt) =>
                            onFilterChange("sort_by", opt ? opt.value : "id")
                        }
                        styles={customStyles}
                        isRtl
                    />
                </div>

                <div className="flex-grow-1" style={{ minWidth: "120px" }}>
                    <Select
                        options={[
                            { value: "desc", label: "تنازلي" },
                            { value: "asc", label: "تصاعدي" },
                        ]}
                        value={{
                            value: filters.sort_dir,
                            label:
                                filters.sort_dir === "desc"
                                    ? "تنازلي"
                                    : "تصاعدي",
                        }}
                        onChange={(opt) =>
                            onFilterChange("sort_dir", opt ? opt.value : "desc")
                        }
                        styles={customStyles}
                        isRtl
                    />
                </div>

                <div className="flex-grow-1" style={{ minWidth: "160px" }}>
                    <Select
                        options={[
                            { value: "", label: "السداد من المكتب (الكل)" },
                            { value: "true", label: "✅ نعم" },
                            { value: "false", label: "❌ لا" },
                        ]}
                        value={
                            filters.is_paid_by_office === "true"
                                ? { value: "true", label: "✅ نعم" }
                                : filters.is_paid_by_office === "false"
                                  ? { value: "false", label: "❌ لا" }
                                  : {
                                        value: "",
                                        label: "السداد من المكتب (الكل)",
                                    }
                        }
                        onChange={(opt) =>
                            onFilterChange(
                                "is_paid_by_office",
                                opt ? opt.value : "",
                            )
                        }
                        styles={customStyles}
                        placeholder="السداد من المكتب (الكل)"
                        isRtl
                    />
                </div>
            </div>
        </Form>
    );
};

export default OrderSearchBar;
