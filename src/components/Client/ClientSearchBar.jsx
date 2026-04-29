import React from "react";
import { Form, InputGroup, Button, Spinner } from "react-bootstrap";
import Select from "react-select";

const ClientSearchBar = ({
  searchQuery,
  onSearch,
  onClear,
  loading,
  filters,
  onFilterChange,
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
          placeholder="ابحث باسم العميل أو رقم الهاتف..."
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
        <div style={{ minWidth: "180px" }}>
          <Select
            options={[
              { value: "", label: "كل الأنواع" },
              { value: "individual", label: "عميل فردي" },
              { value: "office", label: "مكتب خدمات" },
            ]}
            value={
              filters.client_type
                ? { value: filters.client_type, label: filters.client_type === "individual" ? "عميل فردي" : "مكتب خدمات" }
                : { value: "", label: "كل الأنواع" }
            }
            onChange={(opt) => onFilterChange("client_type", opt ? opt.value : "")}
            styles={customStyles}
            isRtl
          />
        </div>

        <div style={{ minWidth: "180px" }}>
          <Select
            options={[
              { value: "created_at", label: "ترتيب حسب تاريخ الإضافة" },
              { value: "name", label: "ترتيب حسب الاسم" },
              { value: "phone", label: "ترتيب حسب الهاتف" },
            ]}
            value={{
              value: filters.sort_by,
              label:
                filters.sort_by === "created_at"
                  ? "ترتيب حسب تاريخ الإضافة"
                  : filters.sort_by === "name"
                  ? "ترتيب حسب الاسم"
                  : "ترتيب حسب الهاتف",
            }}
            onChange={(opt) => onFilterChange("sort_by", opt ? opt.value : "created_at")}
            styles={customStyles}
            isRtl
          />
        </div>

        <div style={{ minWidth: "180px" }}>
          <Select
            options={[
              { value: "desc", label: "الأحدث/تنازلي" },
              { value: "asc", label: "الأقدم/تصاعدي" },
            ]}
            value={{
              value: filters.sort_dir,
              label: filters.sort_dir === "desc" ? "الأحدث/تنازلي" : "الأقدم/تصاعدي",
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

export default ClientSearchBar;
