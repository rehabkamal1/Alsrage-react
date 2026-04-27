import React from "react";
import { Form, InputGroup, Button, Spinner } from "react-bootstrap";

const ExternalOfficeSearchBar = ({
  searchQuery,
  onSearch,
  onClear,
  loading,
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <Form onSubmit={handleSubmit} className="mb-4">
      <InputGroup>
        <Form.Control
          type="text"
          placeholder="ابحث باسم المكتب أو الدولة..."
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
    </Form>
  );
};

export default ExternalOfficeSearchBar;
