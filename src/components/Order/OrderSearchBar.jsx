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
  statusOptions = [],
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
      minWidth: "180px",
    }),
  };

  return (
    <Form onSubmit={handleSubmit} className="mb-4">
      <InputGroup>
        <Form.Control
          type="text"
          placeholder="ابحث برقم الطلب أو اسم العميل أو رقم الهاتف..."
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
      <div className="d-flex gap-2 mt-2 flex-wrap align-items-center">
        {!isCompletedPage && (
          <div style={{ minWidth: "180px" }}>
            <Select
              options={[
                { value: "", label: "كل الحالات" },
                ...statusOptions.map((s) => ({ value: s.key || s.id, label: s.label })),
              ]}
              value={
                filters.status
                  ? {
                      value: filters.status,
                      label:
                        statusOptions.find((s) => (s.key || s.id) === filters.status)?.label ||
                        filters.status,
                    }
                  : { value: "", label: "كل الحالات" }
              }
              onChange={(opt) => onFilterChange("status", opt ? opt.value : "")}
              styles={customStyles}
              placeholder="كل الحالات"
              isRtl
            />
          </div>
        )}

        <div style={{ minWidth: "180px" }}>
          <Select
            options={[
              { value: "id", label: "رقم الطلب" },
              { value: "created_at", label: "تاريخ الإضافة" },
              { value: "visa_holder_name", label: "اسم صاحب التأشيرة" },
              { value: "visa_number", label: "رقم التأشيرة" },
              { value: "id_number", label: "رقم الهوية" },
              { value: "musaned_contract_number", label: "رقم عقد مساند" },
              { value: "total_price", label: "إجمالي السعر" },
              { value: "musaned_paid", label: "المبلغ المدفوع" },
              { value: "status", label: "الحالة" },
            ]}
            value={
              [
                { value: "id", label: "رقم الطلب" },
                { value: "created_at", label: "تاريخ الإضافة" },
                { value: "visa_holder_name", label: "اسم صاحب التأشيرة" },
                { value: "visa_number", label: "رقم التأشيرة" },
                { value: "id_number", label: "رقم الهوية" },
                { value: "musaned_contract_number", label: "رقم عقد مساند" },
                { value: "total_price", label: "إجمالي السعر" },
                { value: "musaned_paid", label: "المبلغ المدفوع" },
                { value: "status", label: "الحالة" },
              ].find(opt => opt.value === filters.sort_by) || { value: "id", label: "رقم الطلب" }
            }
            onChange={(opt) => onFilterChange("sort_by", opt ? opt.value : "id")}
            styles={customStyles}
            isRtl
          />
        </div>

        <div style={{ minWidth: "180px" }}>
          <Select
            options={[
              { value: "desc", label: "تنازلي" },
              { value: "asc", label: "تصاعدي" },
            ]}
            value={{
              value: filters.sort_dir,
              label: filters.sort_dir === "desc" ? "تنازلي" : "تصاعدي",
            }}
            onChange={(opt) => onFilterChange("sort_dir", opt ? opt.value : "desc")}
            styles={customStyles}
            isRtl
          />
        </div>
      </div>
    </Form>
  );
};

export default OrderSearchBar;
