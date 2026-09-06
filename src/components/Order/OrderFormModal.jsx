import React, { useState, useEffect } from "react";
import {
    Modal,
    Button,
    Form,
    Row,
    Col,
    Tab,
    Tabs,
    InputGroup,
} from "react-bootstrap";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import { showSuccess, showError } from "../../utils/swalHelper";
import {
    getSaudiOffices,
    getExternalOffices,
    createSaudiOffice,
    createExternalOffice,
    getClients,
    getEmployees,
    createEmployee,
    getSettingsNationalities,
    getSettingsProfessions,
} from "../../services/apiService";
import "../../styles/FormModal.css";

const API_URL =
    import.meta.env.VITE_API_URL || "https://alserage.alfanar-rec.com";

const OrderFormModal = ({
    show,
    onHide,
    onSubmit,
    initialData,
    clients = [],
    employees = [],
    saudiOffices = [],
    externalOffices = [],
    statusOptions = [],
    serviceTypeOptions = [],
    searchClients,
    quickCreateClient,
    loading,
    isEdit,
    error,
}) => {
    const [localSaudiOffices, setLocalSaudiOffices] = useState([]);
    const [localExternalOffices, setLocalExternalOffices] = useState([]);
    const [localClients, setLocalClients] = useState([]);
    const [localEmployees, setLocalEmployees] = useState([]);
    const [nationalityOptions, setNationalityOptions] = useState([]);
    const [professionOptions, setProfessionOptions] = useState([]);

    const [showQuickEmployee, setShowQuickEmployee] = useState(false);
    const [newEmpName, setNewEmpName] = useState("");
    const [newEmpPhone, setNewEmpPhone] = useState("");
    const [newEmpPosition, setNewEmpPosition] = useState("");
    const [quickEmployeeLoading, setQuickEmployeeLoading] = useState(false);

    useEffect(() => {
        if (show) {
            getSaudiOffices({ all: 1, per_page: 500 })
                .then((res) => {
                    const list = res.data?.data || res.data || [];
                    if (Array.isArray(list) && list.length > 0) {
                        setLocalSaudiOffices(list);
                    }
                })
                .catch((err) =>
                    console.error("Error fetching local saudi offices:", err),
                );

            getExternalOffices({ all: 1, per_page: 500 })
                .then((res) => {
                    const list = res.data?.data || res.data || [];
                    if (Array.isArray(list) && list.length > 0) {
                        setLocalExternalOffices(list);
                    }
                })
                .catch((err) =>
                    console.error(
                        "Error fetching local external offices:",
                        err,
                    ),
                );

            getClients({ all: 1, per_page: 500 })
                .then((res) => {
                    const list = res.data?.data || res.data || [];
                    if (Array.isArray(list) && list.length > 0) {
                        setLocalClients(list);
                    }
                })
                .catch((err) =>
                    console.error("Error fetching local clients:", err),
                );

            getEmployees({ all: 1, per_page: 500 })
                .then((res) => {
                    const list = res.data?.data || res.data || [];
                    if (Array.isArray(list) && list.length > 0) {
                        setLocalEmployees(list);
                    }
                })
                .catch((err) =>
                    console.error("Error fetching local employees:", err),
                );

            Promise.all([
                getSettingsNationalities().catch(() => ({
                    data: { data: [] },
                })),
                getSettingsProfessions().catch(() => ({ data: { data: [] } })),
            ]).then(([nationalitiesRes, professionsRes]) => {
                const nationalities = nationalitiesRes.data?.data || [];
                const professions = professionsRes.data?.data || [];
                setNationalityOptions(
                    nationalities.map((item) => ({
                        value: item.key,
                        label: item.label,
                        color: item.color,
                    })),
                );
                setProfessionOptions(
                    professions.map((item) => ({
                        value: item.key,
                        label: item.label,
                        color: item.color,
                    })),
                );
            });
        }
    }, [show]);

    useEffect(() => {
        if (Array.isArray(saudiOffices) && saudiOffices.length > 0) {
            setLocalSaudiOffices(saudiOffices);
        }
    }, [saudiOffices]);

    useEffect(() => {
        if (Array.isArray(externalOffices) && externalOffices.length > 0) {
            setLocalExternalOffices(externalOffices);
        }
    }, [externalOffices]);

    useEffect(() => {
        if (Array.isArray(clients) && clients.length > 0) {
            setLocalClients(clients);
        }
    }, [clients]);

    useEffect(() => {
        if (Array.isArray(employees) && employees.length > 0) {
            setLocalEmployees(employees);
        }
    }, [employees]);

    const effectiveSaudiOffices =
        localSaudiOffices.length > 0 ? localSaudiOffices : saudiOffices;
    const effectiveExternalOffices =
        localExternalOffices.length > 0
            ? localExternalOffices
            : externalOffices;
    const effectiveClients = localClients.length > 0 ? localClients : clients;
    const effectiveEmployees =
        localEmployees.length > 0 ? localEmployees : employees;

    const [formData, setFormData] = useState({
        client_id: "",
        employee_id: "",
        visa_holder_name: "",
        visa_holder_phone: "",
        saudi_office_id: "",
        external_office_id: "",
        visa_number: "",
        service_type: "",
        id_number: "",
        musaned_contract_number: "",
        nationality: "",
        arrival_destination: "",
        profession: "",
        passport_number: "",
        contract_date: "",
        total_price: "",
        musaned_paid: "",
        is_paid_by_office: false,
        status: "",
        notes: "",
        visa_image: null,
        contract_image: null,
    });

    const [previewImages, setPreviewImages] = useState({
        visa_image: null,
        contract_image: null,
    });

    const [validated, setValidated] = useState(false);
    const [activeTab, setActiveTab] = useState("basic");
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [searching, setSearching] = useState(false);
    const [showQuickCreate, setShowQuickCreate] = useState(false);
    const [newClientName, setNewClientName] = useState("");
    const [newClientPhone, setNewClientPhone] = useState("");
    const [newClientType, setNewClientType] = useState("individual");
    const [quickCreateLoading, setQuickCreateLoading] = useState(false);

    const [showQuickSaudiOffice, setShowQuickSaudiOffice] = useState(false);
    const [newSaudiOfficeName, setNewSaudiOfficeName] = useState("");
    const [newSaudiOfficeCity, setNewSaudiOfficeCity] = useState("");
    const [newSaudiOfficePhone, setNewSaudiOfficePhone] = useState("");
    const [quickSaudiOfficeLoading, setQuickSaudiOfficeLoading] =
        useState(false);

    const [showQuickExternalOffice, setShowQuickExternalOffice] =
        useState(false);
    const [newExternalOfficeName, setNewExternalOfficeName] = useState("");
    const [newExternalOfficeCountry, setNewExternalOfficeCountry] =
        useState("");
    const [newExternalOfficePhone, setNewExternalOfficePhone] = useState("");
    const [quickExternalOfficeLoading, setQuickExternalOfficeLoading] =
        useState(false);

    const [fieldErrors, setFieldErrors] = useState({});
    const [attachmentRows, setAttachmentRows] = useState([
        { title: "", file: null },
    ]);

    useEffect(() => {
        if (initialData) {
            setFormData({
                client_id: initialData.client_id || "",
                employee_id: initialData.employee_id || "",
                visa_holder_name: initialData.visa_holder_name || "",
                visa_holder_phone: initialData.visa_holder_phone || "",
                saudi_office_id: initialData.saudi_office_id || "",
                supplier_id: initialData.supplier_id || "",
                external_office_id: initialData.external_office_id || "",
                visa_number: initialData.visa_number || "",
                service_type: initialData.service_type || "",
                id_number: initialData.id_number || "",
                musaned_contract_number:
                    initialData.musaned_contract_number || "",
                nationality: initialData.nationality || "",
                arrival_destination: initialData.arrival_destination || "",
                profession: initialData.profession || "",
                passport_number: initialData.passport_number || "",
                contract_date: initialData.contract_date || "",
                total_price: initialData.total_price || "",
                musaned_paid: initialData.musaned_paid || "",
                is_paid_by_office: initialData.is_paid_by_office || false,
                status: initialData.status || "",
                notes: initialData.notes || "",
                visa_image: null,
                contract_image: null,
            });
            setPreviewImages({});
            if (initialData.client) {
                setSearchQuery(
                    `${initialData.client.phone} (${initialData.client.name || "بدون اسم"})`,
                );
            } else if (initialData.client_id) {
                const client = clients?.find(
                    (c) => c.id === initialData.client_id,
                );
                if (client) {
                    setSearchQuery(
                        `${client.phone} (${client.name || "بدون اسم"})`,
                    );
                }
            }
        } else {
            setFormData({
                client_id: "",
                employee_id: "",
                visa_holder_name: "",
                visa_holder_phone: "",
                saudi_office_id: "",
                supplier_id: "",
                external_office_id: "",
                visa_number: "",
                service_type: "",
                id_number: "",
                musaned_contract_number: "",
                nationality: "",
                arrival_destination: "",
                profession: "",
                passport_number: "",
                contract_date: "",
                total_price: "",
                musaned_paid: "",
                is_paid_by_office: false,
                status: "",
                notes: "",
                visa_image: null,
                contract_image: null,
            });
            setPreviewImages({});
            setSearchQuery("");
        }
        setAttachmentRows([{ title: "", file: null }]);
        setValidated(false);
        setFieldErrors({});
        setActiveTab("basic");
    }, [initialData, show, clients]);

    useEffect(() => {
        if (error) {
            if (error.errors) {
                setFieldErrors(error.errors);
            }
        }
    }, [error]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === "checkbox") {
            setFormData((prev) => {
                const newData = { ...prev, [name]: checked };
                if (name === "is_paid_by_office" && checked) {
                    newData.musaned_paid = 0;
                }
                return newData;
            });
        } else {
            setFormData((prev) => ({ ...prev, [name]: value || "" }));
        }
        if (fieldErrors[name]) {
            setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        const file = files[0];
        if (file) {
            setFormData((prev) => ({ ...prev, [name]: file }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImages((prev) => ({
                    ...prev,
                    [name]: reader.result,
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = (imageName) => {
        setFormData((prev) => ({ ...prev, [imageName]: null }));
        setPreviewImages((prev) => ({ ...prev, [imageName]: null }));
    };

    const selectClient = (client) => {
        setFormData((prev) => ({
            ...prev,
            client_id: client.id,
        }));
        setSearchQuery(`${client.phone} (${client.name || "بدون اسم"})`);
        setShowSearchResults(false);
        if (fieldErrors.client_id) {
            setFieldErrors((prev) => ({ ...prev, client_id: undefined }));
        }
    };

    const handleClientSearch = async (value) => {
        setSearchQuery(value);
        if (value.length >= 2) {
            setSearching(true);
            try {
                const response = await searchClients(value);
                setSearchResults(response.data?.data || []);
                setShowSearchResults(true);
            } catch (err) {
                console.error("Search error:", err);
                setSearchResults([]);
            } finally {
                setSearching(false);
            }
        } else {
            setSearchResults([]);
            setShowSearchResults(false);
        }
    };

    const handleQuickCreate = async () => {
        if (!newClientName.trim() || !newClientPhone.trim()) {
            showError("خطأ", "يرجى إدخال اسم ورقم هاتف المندوب / العميل");
            return;
        }
        setQuickCreateLoading(true);
        try {
            const response = await quickCreateClient({
                name: newClientName.trim(),
                phone: newClientPhone.trim(),
                client_type: newClientType,
            });
            const newClient = response.data?.data || response.data;
            setLocalClients((prev) => [newClient, ...prev]);
            setFormData((prev) => ({
                ...prev,
                client_id: newClient.id,
            }));
            if (fieldErrors.client_id) {
                setFieldErrors((prev) => ({ ...prev, client_id: undefined }));
            }
            showSuccess(
                "تمت الإضافة",
                "تم إضافة المندوب / العميل بنجاح واختياره للطلب",
            );
            setShowQuickCreate(false);
            setNewClientName("");
            setNewClientPhone("");
        } catch (err) {
            const errorData = err.response?.data;
            if (errorData?.errors) {
                setFieldErrors(errorData.errors);
            }
            showError(
                "خطأ",
                errorData?.message || "حدث خطأ أثناء إضافة المندوب",
            );
        } finally {
            setQuickCreateLoading(false);
        }
    };

    const handleQuickCreateSaudiOffice = async () => {
        if (!newSaudiOfficeName.trim()) {
            showError("خطأ", "يرجى إدخال اسم المكتب السعودي");
            return;
        }
        setQuickSaudiOfficeLoading(true);
        try {
            const res = await createSaudiOffice({
                name: newSaudiOfficeName.trim(),
                city: newSaudiOfficeCity.trim(),
                phone: newSaudiOfficePhone.trim(),
            });
            const newOffice = res.data?.data || res.data;
            setLocalSaudiOffices((prev) => [newOffice, ...prev]);
            setFormData((prev) => ({
                ...prev,
                saudi_office_id: newOffice.id,
            }));
            if (fieldErrors.saudi_office_id) {
                setFieldErrors((prev) => ({
                    ...prev,
                    saudi_office_id: undefined,
                }));
            }
            showSuccess(
                "تمت الإضافة",
                "تم إضافة المكتب السعودي بنجاح واختياره للطلب",
            );
            setShowQuickSaudiOffice(false);
            setNewSaudiOfficeName("");
            setNewSaudiOfficeCity("");
            setNewSaudiOfficePhone("");
        } catch (err) {
            const errorMsg =
                err.response?.data?.message ||
                "حدث خطأ أثناء إضافة المكتب السعودي";
            showError("خطأ", errorMsg);
        } finally {
            setQuickSaudiOfficeLoading(false);
        }
    };

    const handleQuickCreateExternalOffice = async () => {
        if (!newExternalOfficeName.trim()) {
            showError("خطأ", "يرجى إدخال اسم المكتب الخارجي");
            return;
        }
        setQuickExternalOfficeLoading(true);
        try {
            const res = await createExternalOffice({
                name: newExternalOfficeName.trim(),
                country: newExternalOfficeCountry.trim(),
                phone: newExternalOfficePhone.trim() || "0",
            });
            const newOffice = res.data?.data || res.data;
            setLocalExternalOffices((prev) => [newOffice, ...prev]);
            setFormData((prev) => ({
                ...prev,
                external_office_id: newOffice.id,
            }));
            if (fieldErrors.external_office_id) {
                setFieldErrors((prev) => ({
                    ...prev,
                    external_office_id: undefined,
                }));
            }
            showSuccess(
                "تمت الإضافة",
                "تم إضافة المكتب الخارجي بنجاح واختياره للطلب",
            );
            setShowQuickExternalOffice(false);
            setNewExternalOfficeName("");
            setNewExternalOfficeCountry("");
            setNewExternalOfficePhone("");
        } catch (err) {
            const errorMsg =
                err.response?.data?.message ||
                "حدث خطأ أثناء إضافة المكتب الخارجي";
            showError("خطأ", errorMsg);
        } finally {
            setQuickExternalOfficeLoading(false);
        }
    };

    const handleQuickCreateEmployee = async () => {
        if (!newEmpName.trim() || !newEmpPhone.trim()) {
            showError("خطأ", "يرجى إدخال اسم ورقم هاتف المسوق / الموظف");
            return;
        }
        setQuickEmployeeLoading(true);
        try {
            const res = await createEmployee({
                name: newEmpName.trim(),
                phone: newEmpPhone.trim(),
                position: newEmpPosition.trim() || "مسوق",
            });
            const newEmp = res.data?.data || res.data;
            setLocalEmployees((prev) => [newEmp, ...prev]);
            setFormData((prev) => ({
                ...prev,
                employee_id: newEmp.id,
            }));
            if (fieldErrors.employee_id) {
                setFieldErrors((prev) => ({
                    ...prev,
                    employee_id: undefined,
                }));
            }
            showSuccess(
                "تمت الإضافة",
                "تم إضافة المسوق / الموظف بنجاح واختياره للطلب",
            );
            setShowQuickEmployee(false);
            setNewEmpName("");
            setNewEmpPhone("");
            setNewEmpPosition("");
        } catch (err) {
            const errorMsg =
                err.response?.data?.message ||
                "حدث خطأ أثناء إضافة المسوق / الموظف";
            showError("خطأ", errorMsg);
        } finally {
            setQuickEmployeeLoading(false);
        }
    };

    const clientOptions = [
        {
            value: "__ADD_NEW__",
            label: "➕ إضافة مندوب / عميل جديد...",
        },
        ...(effectiveClients || []).map((c) => ({
            value: c.id,
            label: c.phone
                ? `${c.name || "بدون اسم"} - (${c.phone})`
                : c.name || `عميل #${c.id}`,
        })),
    ];

    const getSelectedClient = () => {
        if (!formData.client_id) return null;
        const client = effectiveClients.find(
            (c) => String(c.id) === String(formData.client_id),
        );
        return client
            ? {
                  value: client.id,
                  label: client.phone
                      ? `${client.name || "بدون اسم"} - (${client.phone})`
                      : client.name || `عميل #${client.id}`,
              }
            : null;
    };

    const employeeOptions = [
        {
            value: "__ADD_NEW__",
            label: "➕ إضافة مسوق / موظف جديد...",
        },
        ...(effectiveEmployees || []).map((emp) => ({
            value: emp.id,
            label: emp.name || emp.employee_name || `موظف #${emp.id}`,
        })),
    ];

    const getSelectedEmployee = () => {
        if (!formData.employee_id) return null;
        const employee = effectiveEmployees.find(
            (e) => String(e.id) === String(formData.employee_id),
        );
        return employee
            ? {
                  value: employee.id,
                  label:
                      employee.name ||
                      employee.employee_name ||
                      `موظف #${employee.id}`,
              }
            : null;
    };

    const totalPrice = parseFloat(formData.total_price) || 0;
    const musanedPaid = formData.is_paid_by_office
        ? 0
        : parseFloat(formData.musaned_paid) || 0;
    const priceDifference = totalPrice - musanedPaid;

    const getFieldError = (fieldName) => {
        if (fieldErrors[fieldName]) {
            return fieldErrors[fieldName][0];
        }
        return null;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        setValidated(true);
        if (form.checkValidity() === false || !formData.saudi_office_id) {
            e.stopPropagation();
        }

        const submitData = new FormData();
        Object.keys(formData).forEach((key) => {
            if (
                formData[key] !== null &&
                formData[key] !== undefined &&
                key !== "price_difference"
            ) {
                if (key === "is_paid_by_office") {
                    submitData.append(key, formData[key] ? "1" : "0");
                } else if (
                    key === "status" &&
                    (!formData[key] || formData[key] === "")
                ) {
                    submitData.append(key, "");
                } else {
                    submitData.append(key, formData[key]);
                }
            }
        });
        submitData.append("price_difference", priceDifference);
        attachmentRows.forEach((item, idx) => {
            if (item.file) {
                submitData.append(`attachment_files[${idx}]`, item.file);
                submitData.append(
                    `attachment_titles[${idx}]`,
                    item.title || `attachment-${idx + 1}`,
                );
            }
        });

        onSubmit(submitData);
    };

    const updateAttachmentRow = (index, field, value) => {
        setAttachmentRows((prev) =>
            prev.map((row, i) =>
                i === index ? { ...row, [field]: value } : row,
            ),
        );
    };

    const addAttachmentRow = () => {
        setAttachmentRows((prev) => [...prev, { title: "", file: null }]);
    };

    const removeAttachmentRow = (index) => {
        setAttachmentRows((prev) => prev.filter((_, i) => i !== index));
    };

    const getImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith("data:image")) return url;
        if (url.startsWith("http")) return url;
        if (url.startsWith("/storage")) return `${API_URL}${url}`;
        return `${API_URL}/storage/${url.replace(/^\/?storage\//, "")}`;
    };

    return (
        <>
            <Modal
                show={show}
                onHide={onHide}
                centered
                size="xl"
                dialogClassName="order-modal-xl"
                dir="rtl"
            >
                <Modal.Header closeButton className="border-0 pt-4 px-4">
                    <Modal.Title className="fw-bold fs-5">
                        {isEdit ? "✏️ تعديل الطلب" : "➕ إضافة طلب جديد"}
                    </Modal.Title>
                </Modal.Header>

                <Form onSubmit={handleSubmit} noValidate validated={validated}>
                    <Modal.Body className="px-4">
                        <Tabs
                            activeKey={activeTab}
                            onSelect={(k) => setActiveTab(k)}
                            className="mb-4 custom-tabs"
                            fill
                        >
                            <Tab eventKey="basic" title="معلومات الطلب">
                                <div className="mt-3">
                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="fw-semibold small text-secondary">
                                                    المكتب السعودي{" "}
                                                    <span className="text-danger">
                                                        *
                                                    </span>
                                                </Form.Label>
                                                <Select
                                                    className="react-select-container"
                                                    classNamePrefix="react-select"
                                                    options={[
                                                        {
                                                            value: "__ADD_NEW__",
                                                            label: "➕ إضافة مكتب سعودي جديد...",
                                                        },
                                                        ...(
                                                            effectiveSaudiOffices ||
                                                            []
                                                        ).map((office) => ({
                                                            value: office.id,
                                                            label: office.name,
                                                        })),
                                                    ]}
                                                    value={
                                                        (
                                                            effectiveSaudiOffices ||
                                                            []
                                                        ).find(
                                                            (o) =>
                                                                String(o.id) ===
                                                                String(
                                                                    formData.saudi_office_id,
                                                                ),
                                                        )
                                                            ? {
                                                                  value: formData.saudi_office_id,
                                                                  label: (
                                                                      effectiveSaudiOffices ||
                                                                      []
                                                                  ).find(
                                                                      (o) =>
                                                                          String(
                                                                              o.id,
                                                                          ) ===
                                                                          String(
                                                                              formData.saudi_office_id,
                                                                          ),
                                                                  ).name,
                                                              }
                                                            : null
                                                    }
                                                    onChange={(option) => {
                                                        if (
                                                            option?.value ===
                                                            "__ADD_NEW__"
                                                        ) {
                                                            setShowQuickSaudiOffice(
                                                                true,
                                                            );
                                                            return;
                                                        }
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            saudi_office_id:
                                                                option
                                                                    ? option.value
                                                                    : "",
                                                        }));
                                                    }}
                                                    placeholder="اختر المكتب السعودي..."
                                                    noOptionsMessage={() =>
                                                        "لا توجد خيارات"
                                                    }
                                                    isClearable
                                                    isRtl
                                                    styles={{
                                                        control: (base) => ({
                                                            ...base,
                                                            borderColor:
                                                                getFieldError(
                                                                    "saudi_office_id",
                                                                )
                                                                    ? "#dc3545"
                                                                    : base.borderColor,
                                                        }),
                                                        option: (
                                                            base,
                                                            state,
                                                        ) => {
                                                            if (
                                                                state.data
                                                                    ?.value ===
                                                                "__ADD_NEW__"
                                                            ) {
                                                                return {
                                                                    ...base,
                                                                    fontWeight:
                                                                        "bold",
                                                                    color: "#0d6efd",
                                                                    backgroundColor:
                                                                        state.isFocused
                                                                            ? "#e7f1ff"
                                                                            : "#f8f9fa",
                                                                    borderBottom:
                                                                        "1px solid #e9ecef",
                                                                    cursor: "pointer",
                                                                };
                                                            }
                                                            return base;
                                                        },
                                                    }}
                                                />
                                                {getFieldError(
                                                    "saudi_office_id",
                                                ) && (
                                                    <div className="text-danger small mt-1">
                                                        {getFieldError(
                                                            "saudi_office_id",
                                                        )}
                                                    </div>
                                                )}
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="fw-semibold small text-secondary">
                                                    المكتب الخارجي
                                                </Form.Label>
                                                <Select
                                                    className="react-select-container"
                                                    classNamePrefix="react-select"
                                                    options={[
                                                        {
                                                            value: "__ADD_NEW__",
                                                            label: "➕ إضافة مكتب خارجي جديد...",
                                                        },
                                                        ...(
                                                            effectiveExternalOffices ||
                                                            []
                                                        ).map((office) => ({
                                                            value: office.id,
                                                            label: office.name,
                                                        })),
                                                    ]}
                                                    value={
                                                        (
                                                            effectiveExternalOffices ||
                                                            []
                                                        ).find(
                                                            (o) =>
                                                                String(o.id) ===
                                                                String(
                                                                    formData.external_office_id,
                                                                ),
                                                        )
                                                            ? {
                                                                  value: formData.external_office_id,
                                                                  label: (
                                                                      effectiveExternalOffices ||
                                                                      []
                                                                  ).find(
                                                                      (o) =>
                                                                          String(
                                                                              o.id,
                                                                          ) ===
                                                                          String(
                                                                              formData.external_office_id,
                                                                          ),
                                                                  ).name,
                                                              }
                                                            : null
                                                    }
                                                    onChange={(option) => {
                                                        if (
                                                            option?.value ===
                                                            "__ADD_NEW__"
                                                        ) {
                                                            setShowQuickExternalOffice(
                                                                true,
                                                            );
                                                            return;
                                                        }
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            external_office_id:
                                                                option
                                                                    ? option.value
                                                                    : "",
                                                        }));
                                                    }}
                                                    placeholder="اختر المكتب الخارجي..."
                                                    noOptionsMessage={() =>
                                                        "لا توجد خيارات"
                                                    }
                                                    isClearable
                                                    isRtl
                                                    styles={{
                                                        control: (base) => ({
                                                            ...base,
                                                            borderColor:
                                                                getFieldError(
                                                                    "external_office_id",
                                                                )
                                                                    ? "#dc3545"
                                                                    : base.borderColor,
                                                        }),
                                                        option: (
                                                            base,
                                                            state,
                                                        ) => {
                                                            if (
                                                                state.data
                                                                    ?.value ===
                                                                "__ADD_NEW__"
                                                            ) {
                                                                return {
                                                                    ...base,
                                                                    fontWeight:
                                                                        "bold",
                                                                    color: "#0d6efd",
                                                                    backgroundColor:
                                                                        state.isFocused
                                                                            ? "#e7f1ff"
                                                                            : "#f8f9fa",
                                                                    borderBottom:
                                                                        "1px solid #e9ecef",
                                                                    cursor: "pointer",
                                                                };
                                                            }
                                                            return base;
                                                        },
                                                    }}
                                                />
                                                {getFieldError(
                                                    "external_office_id",
                                                ) && (
                                                    <div className="text-danger small mt-1">
                                                        {getFieldError(
                                                            "external_office_id",
                                                        )}
                                                    </div>
                                                )}
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="fw-semibold small text-secondary">
                                                    المندوب / العميل{" "}
                                                    <span className="text-danger">
                                                        *
                                                    </span>
                                                </Form.Label>
                                                <Select
                                                    className="react-select-container"
                                                    classNamePrefix="react-select"
                                                    options={clientOptions}
                                                    value={getSelectedClient()}
                                                    onChange={(option) => {
                                                        if (
                                                            option?.value ===
                                                            "__ADD_NEW__"
                                                        ) {
                                                            setShowQuickCreate(
                                                                true,
                                                            );
                                                            return;
                                                        }
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            client_id: option
                                                                ? option.value
                                                                : "",
                                                        }));
                                                        if (
                                                            fieldErrors.client_id
                                                        ) {
                                                            setFieldErrors(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    client_id:
                                                                        undefined,
                                                                }),
                                                            );
                                                        }
                                                    }}
                                                    placeholder="اختر أو ابحث عن المندوب / العميل..."
                                                    noOptionsMessage={() =>
                                                        "لا توجد نتائج"
                                                    }
                                                    isClearable
                                                    isSearchable
                                                    isRtl
                                                    styles={{
                                                        control: (base) => ({
                                                            ...base,
                                                            borderColor:
                                                                getFieldError(
                                                                    "client_id",
                                                                )
                                                                    ? "#dc3545"
                                                                    : base.borderColor,
                                                        }),
                                                        option: (
                                                            base,
                                                            state,
                                                        ) => {
                                                            if (
                                                                state.data
                                                                    ?.value ===
                                                                "__ADD_NEW__"
                                                            ) {
                                                                return {
                                                                    ...base,
                                                                    fontWeight:
                                                                        "bold",
                                                                    color: "#0d6efd",
                                                                    backgroundColor:
                                                                        state.isFocused
                                                                            ? "#e7f1ff"
                                                                            : "#f8f9fa",
                                                                    borderBottom:
                                                                        "1px solid #e9ecef",
                                                                    cursor: "pointer",
                                                                };
                                                            }
                                                            return base;
                                                        },
                                                    }}
                                                />
                                                {getFieldError("client_id") && (
                                                    <div className="text-danger small mt-1">
                                                        {getFieldError(
                                                            "client_id",
                                                        )}
                                                    </div>
                                                )}
                                            </Form.Group>
                                        </Col>

                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="fw-semibold small text-secondary">
                                                    المسوق / الموظف
                                                </Form.Label>
                                                <Select
                                                    className="react-select-container"
                                                    classNamePrefix="react-select"
                                                    options={employeeOptions}
                                                    value={getSelectedEmployee()}
                                                    onChange={(option) => {
                                                        if (
                                                            option?.value ===
                                                            "__ADD_NEW__"
                                                        ) {
                                                            setShowQuickEmployee(
                                                                true,
                                                            );
                                                            return;
                                                        }
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            employee_id: option
                                                                ? option.value
                                                                : "",
                                                        }));
                                                        if (
                                                            fieldErrors.employee_id
                                                        ) {
                                                            setFieldErrors(
                                                                (prev) => ({
                                                                    ...prev,
                                                                    employee_id:
                                                                        undefined,
                                                                }),
                                                            );
                                                        }
                                                    }}
                                                    placeholder="اختر أو ابحث عن المسوق / الموظف..."
                                                    noOptionsMessage={() =>
                                                        "لا توجد نتائج"
                                                    }
                                                    isClearable
                                                    isSearchable
                                                    isRtl
                                                    styles={{
                                                        control: (base) => ({
                                                            ...base,
                                                            borderColor:
                                                                getFieldError(
                                                                    "employee_id",
                                                                )
                                                                    ? "#dc3545"
                                                                    : base.borderColor,
                                                        }),
                                                        option: (
                                                            base,
                                                            state,
                                                        ) => {
                                                            if (
                                                                state.data
                                                                    ?.value ===
                                                                "__ADD_NEW__"
                                                            ) {
                                                                return {
                                                                    ...base,
                                                                    fontWeight:
                                                                        "bold",
                                                                    color: "#0d6efd",
                                                                    backgroundColor:
                                                                        state.isFocused
                                                                            ? "#e7f1ff"
                                                                            : "#f8f9fa",
                                                                    borderBottom:
                                                                        "1px solid #e9ecef",
                                                                    cursor: "pointer",
                                                                };
                                                            }
                                                            return base;
                                                        },
                                                    }}
                                                />
                                                {getFieldError(
                                                    "employee_id",
                                                ) && (
                                                    <div className="text-danger small mt-1">
                                                        {getFieldError(
                                                            "employee_id",
                                                        )}
                                                    </div>
                                                )}
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="fw-semibold small text-secondary">
                                                    اسم صاحب التأشيرة{" "}
                                                    <span className="text-danger">
                                                        *
                                                    </span>
                                                </Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="visa_holder_name"
                                                    value={
                                                        formData.visa_holder_name
                                                    }
                                                    onChange={handleChange}
                                                    required
                                                    placeholder="أدخل اسم صاحب التأشيرة"
                                                    isInvalid={
                                                        !!getFieldError(
                                                            "visa_holder_name",
                                                        )
                                                    }
                                                    className="rounded-3"
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {getFieldError(
                                                        "visa_holder_name",
                                                    ) ||
                                                        "يرجى إدخال اسم صاحب التأشيرة"}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="fw-semibold small text-secondary">
                                                    رقم هاتف صاحب التأشيرة
                                                </Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="visa_holder_phone"
                                                    value={
                                                        formData.visa_holder_phone
                                                    }
                                                    onChange={handleChange}
                                                    placeholder="أدخل رقم هاتف صاحب التأشيرة"
                                                    isInvalid={
                                                        !!getFieldError(
                                                            "visa_holder_phone",
                                                        )
                                                    }
                                                    className="rounded-3"
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {getFieldError(
                                                        "visa_holder_phone",
                                                    )}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col md={4}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="fw-semibold small text-secondary">
                                                    رقم الهوية{" "}
                                                    <span className="text-danger">
                                                        *
                                                    </span>
                                                </Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="id_number"
                                                    placeholder="أدخل رقم الهوية"
                                                    value={formData.id_number}
                                                    onChange={handleChange}
                                                    required
                                                    isInvalid={
                                                        !!getFieldError(
                                                            "id_number",
                                                        )
                                                    }
                                                    className="rounded-3"
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {getFieldError(
                                                        "id_number",
                                                    ) ||
                                                        "يرجى إدخال رقم الهوية"}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="fw-semibold small text-secondary">
                                                    رقم التأشيرة{" "}
                                                    <span className="text-danger">
                                                        *
                                                    </span>
                                                </Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="visa_number"
                                                    placeholder="أدخل رقم التأشيرة"
                                                    value={formData.visa_number}
                                                    onChange={handleChange}
                                                    required
                                                    isInvalid={
                                                        !!getFieldError(
                                                            "visa_number",
                                                        )
                                                    }
                                                    className="rounded-3"
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {getFieldError(
                                                        "visa_number",
                                                    ) ||
                                                        "يرجى إدخال رقم التأشيرة"}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="fw-semibold small text-secondary">
                                                    نوع الخدمة
                                                </Form.Label>
                                                <Select
                                                    className="react-select-container"
                                                    classNamePrefix="react-select"
                                                    options={serviceTypeOptions.map(
                                                        (st) => ({
                                                            value:
                                                                st.key ||
                                                                st.label,
                                                            label: st.label,
                                                        }),
                                                    )}
                                                    value={
                                                        formData.service_type
                                                            ? {
                                                                  value: formData.service_type,
                                                                  label:
                                                                      serviceTypeOptions.find(
                                                                          (
                                                                              st,
                                                                          ) =>
                                                                              (st.key ||
                                                                                  st.label) ===
                                                                              formData.service_type,
                                                                      )
                                                                          ?.label ||
                                                                      formData.service_type,
                                                              }
                                                            : null
                                                    }
                                                    onChange={(option) =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            service_type: option
                                                                ? option.value
                                                                : "",
                                                        }))
                                                    }
                                                    placeholder="اختر نوع الخدمة..."
                                                    isClearable
                                                    isRtl
                                                    styles={{
                                                        control: (base) => ({
                                                            ...base,
                                                            borderColor:
                                                                getFieldError(
                                                                    "service_type",
                                                                )
                                                                    ? "#dc3545"
                                                                    : base.borderColor,
                                                        }),
                                                    }}
                                                />
                                                {getFieldError(
                                                    "service_type",
                                                ) && (
                                                    <div className="text-danger small mt-1">
                                                        {getFieldError(
                                                            "service_type",
                                                        )}
                                                    </div>
                                                )}
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="fw-semibold small text-secondary">
                                                    رقم الجواز{" "}
                                                    <span className="text-danger">
                                                        *
                                                    </span>
                                                </Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="passport_number"
                                                    value={
                                                        formData.passport_number
                                                    }
                                                    onChange={handleChange}
                                                    required
                                                    isInvalid={
                                                        !!getFieldError(
                                                            "passport_number",
                                                        )
                                                    }
                                                    placeholder="أدخل رقم الجواز"
                                                    className="rounded-3"
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {getFieldError(
                                                        "passport_number",
                                                    ) ||
                                                        "يرجى إدخال رقم الجواز"}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="fw-semibold small text-secondary">
                                                    الجنسية{" "}
                                                    <span className="text-danger">
                                                        *
                                                    </span>
                                                </Form.Label>
                                                <Select
                                                    className="react-select-container"
                                                    classNamePrefix="react-select"
                                                    options={nationalityOptions}
                                                    value={
                                                        formData.nationality
                                                            ? {
                                                                  value: formData.nationality,
                                                                  label:
                                                                      nationalityOptions.find(
                                                                          (n) =>
                                                                              n.value ===
                                                                              formData.nationality,
                                                                      )
                                                                          ?.label ||
                                                                      formData.nationality,
                                                              }
                                                            : null
                                                    }
                                                    onChange={(option) =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            nationality: option
                                                                ? option.value
                                                                : "",
                                                        }))
                                                    }
                                                    placeholder="اختر أو ابحث عن الجنسية..."
                                                    isClearable
                                                    isSearchable
                                                    isRtl
                                                    styles={{
                                                        control: (base) => ({
                                                            ...base,
                                                            borderColor:
                                                                getFieldError(
                                                                    "nationality",
                                                                )
                                                                    ? "#dc3545"
                                                                    : base.borderColor,
                                                        }),
                                                    }}
                                                />
                                                {getFieldError(
                                                    "nationality",
                                                ) && (
                                                    <div className="text-danger small mt-1">
                                                        {getFieldError(
                                                            "nationality",
                                                        )}
                                                    </div>
                                                )}
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="fw-semibold small text-secondary">
                                                    جهة القدوم{" "}
                                                    <span className="text-danger">
                                                        *
                                                    </span>
                                                </Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="arrival_destination"
                                                    value={
                                                        formData.arrival_destination
                                                    }
                                                    onChange={handleChange}
                                                    required
                                                    isInvalid={
                                                        !!getFieldError(
                                                            "arrival_destination",
                                                        )
                                                    }
                                                    placeholder="أدخل جهة القدوم"
                                                    className="rounded-3"
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {getFieldError(
                                                        "arrival_destination",
                                                    ) ||
                                                        "يرجى إدخال جهة القدوم"}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="fw-semibold small text-secondary">
                                                    المهنة
                                                </Form.Label>
                                                <Select
                                                    className="react-select-container"
                                                    classNamePrefix="react-select"
                                                    options={professionOptions}
                                                    value={
                                                        formData.profession
                                                            ? {
                                                                  value: formData.profession,
                                                                  label:
                                                                      professionOptions.find(
                                                                          (p) =>
                                                                              p.value ===
                                                                              formData.profession,
                                                                      )
                                                                          ?.label ||
                                                                      formData.profession,
                                                              }
                                                            : null
                                                    }
                                                    onChange={(option) =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            profession: option
                                                                ? option.value
                                                                : "",
                                                        }))
                                                    }
                                                    placeholder="اختر أو ابحث عن المهنة..."
                                                    isClearable
                                                    isSearchable
                                                    isRtl
                                                    styles={{
                                                        control: (base) => ({
                                                            ...base,
                                                            borderColor:
                                                                getFieldError(
                                                                    "profession",
                                                                )
                                                                    ? "#dc3545"
                                                                    : base.borderColor,
                                                        }),
                                                    }}
                                                />
                                                {getFieldError(
                                                    "profession",
                                                ) && (
                                                    <div className="text-danger small mt-1">
                                                        {getFieldError(
                                                            "profession",
                                                        )}
                                                    </div>
                                                )}
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col md={12}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="fw-semibold small text-secondary">
                                                    رقم عقد مساند
                                                </Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    name="musaned_contract_number"
                                                    value={
                                                        formData.musaned_contract_number
                                                    }
                                                    onChange={handleChange}
                                                    isInvalid={
                                                        !!getFieldError(
                                                            "musaned_contract_number",
                                                        )
                                                    }
                                                    className="rounded-3"
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {getFieldError(
                                                        "musaned_contract_number",
                                                    )}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="fw-semibold small text-secondary">
                                                    تاريخ العقد
                                                </Form.Label>
                                                <Form.Control
                                                    type="date"
                                                    name="contract_date"
                                                    value={
                                                        formData.contract_date
                                                    }
                                                    onChange={handleChange}
                                                    isInvalid={
                                                        !!getFieldError(
                                                            "contract_date",
                                                        )
                                                    }
                                                    className="rounded-3"
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {getFieldError(
                                                        "contract_date",
                                                    )}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                        <Col md={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="fw-semibold small text-secondary">
                                                    حالة سداد مساند
                                                </Form.Label>
                                                <Select
                                                    className="react-select-container"
                                                    classNamePrefix="react-select"
                                                    options={statusOptions.map(
                                                        (status) => ({
                                                            value:
                                                                status.key ||
                                                                status.id,
                                                            label: status.label,
                                                        }),
                                                    )}
                                                    value={
                                                        formData.status &&
                                                        formData.status !== ""
                                                            ? {
                                                                  value: formData.status,
                                                                  label:
                                                                      statusOptions.find(
                                                                          (s) =>
                                                                              (s.key ||
                                                                                  s.id) ===
                                                                              formData.status,
                                                                      )
                                                                          ?.label ||
                                                                      formData.status,
                                                              }
                                                            : null
                                                    }
                                                    onChange={(option) =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            status: option
                                                                ? option.value
                                                                : "",
                                                        }))
                                                    }
                                                    placeholder="اختر الحالة..."
                                                    isClearable
                                                    isRtl
                                                    styles={{
                                                        control: (base) => ({
                                                            ...base,
                                                            borderColor:
                                                                getFieldError(
                                                                    "status",
                                                                )
                                                                    ? "#dc3545"
                                                                    : base.borderColor,
                                                        }),
                                                    }}
                                                />
                                                {getFieldError("status") && (
                                                    <div className="text-danger small mt-1">
                                                        {getFieldError(
                                                            "status",
                                                        )}
                                                    </div>
                                                )}
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-semibold small text-secondary">
                                            الملاحظات
                                        </Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={2}
                                            name="notes"
                                            value={formData.notes}
                                            onChange={handleChange}
                                            isInvalid={!!getFieldError("notes")}
                                            className="rounded-3"
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {getFieldError("notes")}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </div>
                            </Tab>

                            <Tab eventKey="prices" title="الأسعار">
                                <div className="mt-3">
                                    <Row>
                                        <Col md={4}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="fw-semibold small text-secondary">
                                                    إجمالي السعر (ر.س)
                                                </Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    step="0.01"
                                                    name="total_price"
                                                    value={formData.total_price}
                                                    onChange={handleChange}
                                                    disabled={
                                                        formData.is_paid_by_office
                                                    }
                                                    isInvalid={
                                                        !!getFieldError(
                                                            "total_price",
                                                        )
                                                    }
                                                    className="rounded-3"
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {getFieldError(
                                                        "total_price",
                                                    )}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="fw-semibold small text-secondary">
                                                    سداد مساند (ر.س)
                                                </Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    step="0.01"
                                                    name="musaned_paid"
                                                    value={
                                                        formData.musaned_paid
                                                    }
                                                    onChange={handleChange}
                                                    disabled={
                                                        formData.is_paid_by_office
                                                    }
                                                    isInvalid={
                                                        !!getFieldError(
                                                            "musaned_paid",
                                                        )
                                                    }
                                                    className="rounded-3"
                                                />
                                                <Form.Control.Feedback type="invalid">
                                                    {getFieldError(
                                                        "musaned_paid",
                                                    )}
                                                </Form.Control.Feedback>
                                            </Form.Group>
                                        </Col>
                                        <Col md={4}>
                                            <Form.Group className="mb-3">
                                                <Form.Label className="fw-semibold small text-secondary">
                                                    متبقي (ر.س)
                                                </Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    value={`${isNaN(priceDifference) ? "0.00" : priceDifference.toFixed(2)} ر.س`}
                                                    readOnly
                                                    disabled
                                                    className={`rounded-3 fw-bold ${priceDifference >= 0 ? "text-success bg-success bg-opacity-10" : "text-danger bg-danger bg-opacity-10"}`}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col md={12}>
                                            <Form.Group className="mb-3">
                                                <Form.Check
                                                    type="checkbox"
                                                    id="is_paid_by_office"
                                                    name="is_paid_by_office"
                                                    label="السداد من قبل المكتب (سيتم احتساب سداد مساند بصفر والقيمة كاملة علينا)"
                                                    checked={
                                                        formData.is_paid_by_office ||
                                                        false
                                                    }
                                                    onChange={handleChange}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>

                                    {(totalPrice > 0 || musanedPaid > 0) && (
                                        <div
                                            className={`p-3 rounded-3 mt-3 ${priceDifference >= 0 ? "bg-success bg-opacity-10" : "bg-danger bg-opacity-10"}`}
                                        >
                                            <div className="d-flex justify-content-between align-items-center">
                                                <span className="fw-semibold">
                                                    الرصيد المتبقي:
                                                </span>
                                                <span
                                                    className={`fs-4 fw-bold ${priceDifference >= 0 ? "text-success" : "text-danger"}`}
                                                >
                                                    {priceDifference.toFixed(2)}{" "}
                                                    ر.س
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Tab>

                            <Tab eventKey="images" title="الصور والمرفقات">
                                <div className="mt-3">
                                    <div className="alert alert-info border-0 rounded-3 small">
                                        💡 يمكنك إضافة عدة مرفقات وتسميتها
                                        (مثال: صورة الجواز، صورة الهوية، إلخ...)
                                    </div>

                                    {attachmentRows.map((row, index) => (
                                        <div
                                            key={`attachment-${index}`}
                                            className="attachment-row p-4 mb-3 border rounded-4 bg-white shadow-sm border-light position-relative overflow-hidden"
                                        >
                                            <div
                                                className="position-absolute top-0 start-0 w-100 h-1 bg-primary bg-opacity-25"
                                                style={{ height: "4px" }}
                                            ></div>
                                            <Row className="align-items-end g-3">
                                                <Col md={5}>
                                                    <Form.Group>
                                                        <Form.Label className="fw-bold small text-dark mb-2">
                                                            🏷️ عنوان المرفق
                                                        </Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            value={row.title}
                                                            onChange={(e) =>
                                                                updateAttachmentRow(
                                                                    index,
                                                                    "title",
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="مثال: صورة الجواز، صورة الهوية..."
                                                            className="rounded-3 border-light-subtle shadow-none"
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={5}>
                                                    <Form.Group>
                                                        <Form.Label className="fw-bold small text-dark mb-2">
                                                            📁 اختيار الملف
                                                        </Form.Label>
                                                        <div className="custom-file-upload">
                                                            <Form.Control
                                                                type="file"
                                                                accept="image/*,application/pdf"
                                                                onChange={(e) =>
                                                                    updateAttachmentRow(
                                                                        index,
                                                                        "file",
                                                                        e.target
                                                                            .files?.[0] ||
                                                                            null,
                                                                    )
                                                                }
                                                                className="rounded-3 border-light-subtle shadow-none"
                                                            />
                                                        </div>
                                                    </Form.Group>
                                                </Col>
                                                <Col md={2}>
                                                    <Button
                                                        variant="link"
                                                        className="w-100 text-danger text-decoration-none fw-semibold"
                                                        disabled={
                                                            attachmentRows.length ===
                                                                1 &&
                                                            !row.file &&
                                                            !row.title
                                                        }
                                                        onClick={() =>
                                                            removeAttachmentRow(
                                                                index,
                                                            )
                                                        }
                                                    >
                                                        🗑️ إزالة
                                                    </Button>
                                                </Col>
                                            </Row>
                                            {row.file && (
                                                <div className="mt-3 p-2 rounded-3 bg-success bg-opacity-10 border border-success border-opacity-10 d-flex align-items-center gap-2">
                                                    <span className="text-success small fw-bold">
                                                        ✅ تم اختيار:{" "}
                                                        {row.file.name}
                                                    </span>
                                                    <span className="text-muted extra-small">
                                                        {(
                                                            row.file.size / 1024
                                                        ).toFixed(1)}{" "}
                                                        KB
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    <Button
                                        variant="outline-dark"
                                        onClick={addAttachmentRow}
                                        className="w-100 py-2 border-dashed rounded-3"
                                        style={{ borderStyle: "dashed" }}
                                    >
                                        + إضافة مرفق جديد
                                    </Button>
                                </div>
                            </Tab>
                        </Tabs>
                    </Modal.Body>

                    <Modal.Footer className="border-0 pb-4 px-4">
                        <Button
                            variant="light"
                            onClick={onHide}
                            className="px-4 rounded-3"
                            style={{ border: "1px solid #dee2e6" }}
                        >
                            إلغاء
                        </Button>
                        <Button
                            type="submit"
                            variant="dark"
                            disabled={loading}
                            className="px-4 rounded-3"
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" />
                                    جاري الحفظ...
                                </>
                            ) : isEdit ? (
                                "💾 حفظ التغييرات"
                            ) : (
                                "➕ إضافة طلب"
                            )}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            <Modal
                show={showQuickCreate}
                onHide={() => setShowQuickCreate(false)}
                centered
                size="sm"
                dir="rtl"
            >
                <Modal.Header closeButton className="border-0 pt-4 px-4">
                    <Modal.Title className="fw-bold fs-5">
                        إضافة مندوب جديد
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="px-4">
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold small text-secondary">
                            اسم المندوب
                        </Form.Label>
                        <Form.Control
                            type="text"
                            value={newClientName}
                            onChange={(e) => setNewClientName(e.target.value)}
                            placeholder="أدخل اسم العميل"
                            className="rounded-3"
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold small text-secondary">
                            نوع العميل
                        </Form.Label>
                        <div className="d-flex gap-3">
                            <Form.Check
                                type="radio"
                                label="فردي"
                                name="clientType"
                                checked={newClientType === "individual"}
                                onChange={() => setNewClientType("individual")}
                            />
                            <Form.Check
                                type="radio"
                                label="مكتب خدمات"
                                name="clientType"
                                checked={newClientType === "office"}
                                onChange={() => setNewClientType("office")}
                            />
                        </div>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold small text-secondary">
                            رقم الهاتف{" "}
                            <span className="text-danger small">
                                (يجب أن يكون فريداً)
                            </span>
                        </Form.Label>
                        <Form.Control
                            type="text"
                            value={newClientPhone}
                            onChange={(e) => setNewClientPhone(e.target.value)}
                            placeholder="أدخل رقم الهاتف"
                            isInvalid={!!getFieldError("phone")}
                            className="rounded-3"
                        />
                        <Form.Control.Feedback type="invalid">
                            {getFieldError("phone")}
                        </Form.Control.Feedback>
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer className="border-0 pb-4 px-4">
                    <Button
                        variant="light"
                        onClick={() => setShowQuickCreate(false)}
                        className="px-3 rounded-3"
                    >
                        إلغاء
                    </Button>
                    <Button
                        variant="dark"
                        onClick={handleQuickCreate}
                        disabled={quickCreateLoading}
                        className="px-3 rounded-3"
                    >
                        {quickCreateLoading ? "جاري الإضافة..." : "حفظ المندوب"}
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal
                show={showQuickSaudiOffice}
                onHide={() => setShowQuickSaudiOffice(false)}
                centered
                size="sm"
                dir="rtl"
            >
                <Modal.Header closeButton className="border-0 pt-4 px-4">
                    <Modal.Title className="fw-bold fs-5">
                        🏢 إضافة مكتب سعودي جديد
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="px-4">
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold small text-secondary">
                            اسم المكتب <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                            type="text"
                            value={newSaudiOfficeName}
                            onChange={(e) =>
                                setNewSaudiOfficeName(e.target.value)
                            }
                            placeholder="أدخل اسم المكتب السعودي"
                            className="rounded-3"
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold small text-secondary">
                            المدينة
                        </Form.Label>
                        <Form.Control
                            type="text"
                            value={newSaudiOfficeCity}
                            onChange={(e) =>
                                setNewSaudiOfficeCity(e.target.value)
                            }
                            placeholder="أدخل المدينة"
                            className="rounded-3"
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold small text-secondary">
                            رقم الهاتف / الجوال
                        </Form.Label>
                        <Form.Control
                            type="text"
                            value={newSaudiOfficePhone}
                            onChange={(e) =>
                                setNewSaudiOfficePhone(e.target.value)
                            }
                            placeholder="أدخل رقم الهاتف"
                            className="rounded-3"
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer className="border-0 pb-4 px-4">
                    <Button
                        variant="light"
                        onClick={() => setShowQuickSaudiOffice(false)}
                        className="px-3 rounded-3"
                    >
                        إلغاء
                    </Button>
                    <Button
                        variant="dark"
                        onClick={handleQuickCreateSaudiOffice}
                        disabled={quickSaudiOfficeLoading}
                        className="px-3 rounded-3"
                    >
                        {quickSaudiOfficeLoading
                            ? "جاري الإضافة..."
                            : "حفظ المكتب"}
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal
                show={showQuickExternalOffice}
                onHide={() => setShowQuickExternalOffice(false)}
                centered
                size="sm"
                dir="rtl"
            >
                <Modal.Header closeButton className="border-0 pt-4 px-4">
                    <Modal.Title className="fw-bold fs-5">
                        🌍 إضافة مكتب خارجي جديد
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="px-4">
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold small text-secondary">
                            اسم المكتب <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                            type="text"
                            value={newExternalOfficeName}
                            onChange={(e) =>
                                setNewExternalOfficeName(e.target.value)
                            }
                            placeholder="أدخل اسم المكتب الخارجي"
                            className="rounded-3"
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold small text-secondary">
                            الدولة
                        </Form.Label>
                        <Form.Control
                            type="text"
                            value={newExternalOfficeCountry}
                            onChange={(e) =>
                                setNewExternalOfficeCountry(e.target.value)
                            }
                            placeholder="أدخل الدولة"
                            className="rounded-3"
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold small text-secondary">
                            رقم الهاتف
                        </Form.Label>
                        <Form.Control
                            type="text"
                            value={newExternalOfficePhone}
                            onChange={(e) =>
                                setNewExternalOfficePhone(e.target.value)
                            }
                            placeholder="أدخل رقم الهاتف"
                            className="rounded-3"
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer className="border-0 pb-4 px-4">
                    <Button
                        variant="light"
                        onClick={() => setShowQuickExternalOffice(false)}
                        className="px-3 rounded-3"
                    >
                        إلغاء
                    </Button>
                    <Button
                        variant="dark"
                        onClick={handleQuickCreateExternalOffice}
                        disabled={quickExternalOfficeLoading}
                        className="px-3 rounded-3"
                    >
                        {quickExternalOfficeLoading
                            ? "جاري الإضافة..."
                            : "حفظ المكتب"}
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal
                show={showQuickEmployee}
                onHide={() => setShowQuickEmployee(false)}
                centered
                size="sm"
                dir="rtl"
            >
                <Modal.Header closeButton className="border-0 pt-4 px-4">
                    <Modal.Title className="fw-bold fs-5">
                        👔 إضافة مسوق / موظف جديد
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="px-4">
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold small text-secondary">
                            اسم المسوق / الموظف{" "}
                            <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                            type="text"
                            value={newEmpName}
                            onChange={(e) => setNewEmpName(e.target.value)}
                            placeholder="أدخل اسم المسوق / الموظف"
                            className="rounded-3"
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold small text-secondary">
                            رقم الجوال <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                            type="text"
                            value={newEmpPhone}
                            onChange={(e) => setNewEmpPhone(e.target.value)}
                            placeholder="أدخل رقم الجوال"
                            className="rounded-3"
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold small text-secondary">
                            المسمى الوظيفي / المنصب
                        </Form.Label>
                        <Form.Control
                            type="text"
                            value={newEmpPosition}
                            onChange={(e) => setNewEmpPosition(e.target.value)}
                            placeholder="مثال: مسوق / مندوب مبيعات"
                            className="rounded-3"
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer className="border-0 pb-4 px-4">
                    <Button
                        variant="light"
                        onClick={() => setShowQuickEmployee(false)}
                        className="px-3 rounded-3"
                    >
                        إلغاء
                    </Button>
                    <Button
                        variant="dark"
                        onClick={handleQuickCreateEmployee}
                        disabled={quickEmployeeLoading}
                        className="px-3 rounded-3"
                    >
                        {quickEmployeeLoading
                            ? "جاري الإضافة..."
                            : "حفظ وتحديد"}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default OrderFormModal;
