import React, { useState, useEffect } from "react";
import { Form, Button, Badge } from "react-bootstrap";

const DateFilterBar = ({
  onFilterChange,
  initialFromDate = "",
  initialToDate = "",
  initialPreset = "all",
  showReset = true,
  className = "",
  size = "md",
}) => {
  const [fromDate, setFromDate] = useState(initialFromDate);
  const [toDate, setToDate] = useState(initialToDate);
  const [activePreset, setActivePreset] = useState(initialPreset);

  const presets = [
    { key: "all", label: "الكل" },
    { key: "today", label: "اليوم" },
    { key: "week", label: "هذا الأسبوع" },
    { key: "month", label: "هذا الشهر" },
    { key: "year", label: "هذه السنة" },
  ];

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toISOString().split("T")[0];
  };

  const handlePresetSelect = (presetKey) => {
    setActivePreset(presetKey);
    const today = new Date();
    let from = "";
    let to = "";

    switch (presetKey) {
      case "all":
        from = "";
        to = "";
        break;
      case "today":
        from = formatDate(today);
        to = formatDate(today);
        break;
      case "week":
        const dayOfWeek = today.getDay();
        const firstDayOfWeek = new Date(today);
        firstDayOfWeek.setDate(today.getDate() - dayOfWeek);
        from = formatDate(firstDayOfWeek);
        to = formatDate(today);
        break;
      case "month":
        const firstDayOfMonth = new Date(
          today.getFullYear(),
          today.getMonth(),
          1,
        );
        from = formatDate(firstDayOfMonth);
        to = formatDate(today);
        break;
      case "year":
        const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
        from = formatDate(firstDayOfYear);
        to = formatDate(today);
        break;
      default:
        break;
    }

    setFromDate(from);
    setToDate(to);
    onFilterChange({ fromDate: from, toDate: to, preset: presetKey });
  };

  const handleDateChange = (type, value) => {
    const newFrom = type === "from" ? value : fromDate;
    const newTo = type === "to" ? value : toDate;
    setFromDate(newFrom);
    setToDate(newTo);
    setActivePreset("custom");
    onFilterChange({ fromDate: newFrom, toDate: newTo, preset: "custom" });
  };

  const handleReset = () => {
    setFromDate("");
    setToDate("");
    setActivePreset("all");
    onFilterChange({ fromDate: "", toDate: "", preset: "all" });
  };

  useEffect(() => {
    if (initialFromDate !== fromDate || initialToDate !== toDate) {
      setFromDate(initialFromDate);
      setToDate(initialToDate);
    }
  }, [initialFromDate, initialToDate]);

  const isFilterActive = fromDate || toDate || activePreset !== "all";

  return (
    <div className={`dash-glass-card p-3 p-md-4 mb-4 ${className}`}>
      <div className="d-flex flex-column flex-lg-row align-items-stretch align-items-lg-center gap-3">
        {/* Label */}
        <span
          className="fw-bold text-dark d-flex align-items-center gap-1"
          style={{ whiteSpace: "nowrap" }}
        >
          <i className="fa-solid fa-sliders text-primary"></i> التصفية الزمنية:
        </span>

        {/* Preset Buttons */}
        <div className="d-flex align-items-center gap-2 flex-wrap">
          {presets.map((preset) => (
            <button
              key={preset.key}
              className={`preset-pill-btn ${activePreset === preset.key ? "active" : ""}`}
              onClick={() => handlePresetSelect(preset.key)}
              style={{
                background: "transparent",
                border: "1px solid #e2e8f0",
                borderRadius: "50px",
                padding: "4px 16px",
                fontSize: "0.8rem",
                fontWeight: "600",
                color: activePreset === preset.key ? "#fff" : "#475569",
                backgroundColor:
                  activePreset === preset.key ? "#6366f1" : "transparent",
                borderColor:
                  activePreset === preset.key ? "#6366f1" : "#e2e8f0",
                transition: "all 0.2s ease",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Spacer */}
        <div className="flex-grow-1 d-none d-lg-block"></div>

        {/* Date Inputs + Reset */}
        <div className="d-flex align-items-stretch align-items-sm-center gap-2 flex-column flex-sm-row">
          <div className="d-flex align-items-center gap-2 bg-light p-1.5 rounded-3 border flex-wrap flex-sm-nowrap">
            <span className="text-muted small fw-bold">من:</span>
            <Form.Control
              type="date"
              size="sm"
              value={fromDate}
              onChange={(e) => handleDateChange("from", e.target.value)}
              className="border-0 bg-transparent shadow-none px-1 small font-monospace flex-grow-1"
              style={{ minWidth: "120px" }}
            />

            <span className="text-muted opacity-50 d-none d-sm-inline">|</span>

            <span className="text-muted small fw-bold">إلى:</span>
            <Form.Control
              type="date"
              size="sm"
              value={toDate}
              onChange={(e) => handleDateChange("to", e.target.value)}
              className="border-0 bg-transparent shadow-none px-1 small font-monospace flex-grow-1"
              style={{ minWidth: "120px" }}
            />
          </div>

          {/* Reset Button */}
          {showReset && isFilterActive && (
            <Button
              variant="outline-danger"
              size="sm"
              className="rounded-circle p-0 d-flex align-items-center justify-content-center border-0 bg-danger bg-opacity-10 text-danger align-self-center align-self-sm-auto"
              style={{ width: "34px", height: "34px", flexShrink: 0 }}
              onClick={handleReset}
              title="إعادة ضبط الفلتر"
            >
              <i className="fa-solid fa-xmark"></i>
            </Button>
          )}
        </div>
      </div>

      {/* Active filter summary */}
      {isFilterActive && (
        <div className="mt-3 pt-3 border-top d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-2">
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <Badge
              bg="primary"
              className="rounded-pill px-3 py-1.5 fw-medium shadow-sm"
            >
              <i className="fa-regular fa-calendar-check me-1"></i>
              الفترة المحددة: {fromDate || "من البداية"} ⬅️{" "}
              {toDate || "حتى الآن"}
            </Badge>
            {activePreset !== "all" && activePreset !== "custom" && (
              <Badge
                bg="secondary"
                className="rounded-pill px-3 py-1.5 fw-medium"
              >
                {presets.find((p) => p.key === activePreset)?.label}
              </Badge>
            )}
          </div>
          <span className="text-muted small fw-semibold">
            يتم عرض البيانات والرسوم البيانية بناءً على الفلتر الحالي
          </span>
        </div>
      )}
    </div>
  );
};

export default DateFilterBar;
