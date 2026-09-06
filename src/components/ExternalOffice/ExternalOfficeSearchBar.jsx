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
            <InputGroup className="shadow-sm rounded-3 overflow-hidden">
                <Form.Control
                    type="text"
                    placeholder="ابحث باسم المكتب أو الدولة..."
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
        </Form>
    );
};

export default ExternalOfficeSearchBar;
