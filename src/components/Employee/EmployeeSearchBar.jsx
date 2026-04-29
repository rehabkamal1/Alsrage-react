import React from "react";
import { Form, InputGroup, Button, Spinner } from "react-bootstrap";
import Select from "react-select";

const EmployeeSearchBar = ({
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
          placeholder="ابحث باسم الموظف أو اسم المستخدم أو رقم الهاتف..."
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
              { value: "created_at", label: "ترتيب حسب التاريخ" },
              { value: "name", label: "ترتيب حسب الاسم" },
              { value: "position", label: "ترتيب حسب المنصب" },
              { value: "username", label: "ترتيب حسب اسم المستخدم" },
            ]}
            value={{
              value: filters.sort_by,
              label:
                filters.sort_by === "created_at"
                  ? "ترتيب حسب التاريخ"
                  : filters.sort_by === "name"
                  ? "ترتيب حسب الاسم"
                  : filters.sort_by === "position"
                  ? "ترتيب حسب المنصب"
                  : "ترتيب حسب اسم المستخدم",
            }}
            onChange={(opt) => onFilterChange("sort_by", opt ? opt.value : "created_at")}
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

export default EmployeeSearchBar;
