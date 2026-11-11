import React from "react";
import { Alert, Button } from "react-bootstrap";

class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error("Page render failed:", error);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <Alert variant="danger" className="m-4 text-center" role="alert">
        <Alert.Heading>تعذر عرض الصفحة</Alert.Heading>
        <p>حدث خطأ غير متوقع. يمكنك إعادة المحاولة.</p>
        <Button
          variant="outline-danger"
          onClick={() => this.setState({ hasError: false })}
        >
          إعادة المحاولة
        </Button>
      </Alert>
    );
  }
}

export default ErrorBoundary;
