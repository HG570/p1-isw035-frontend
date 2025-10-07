import React, { useEffect, useState } from "react";

export default function EntityForm({
  fields = [],
  initialData = {},
  onSubmit,
  submitText = "Salvar",
  onCancel,
}) {
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    setValues(initialData || {});
  }, [initialData]);
  
  function handleChange(name, value, type) {
    setValues((prev) => ({
      ...prev,
      [name]:
        type === "number"
          ? value === "" ? "" : Number(value)
          : type === "checkbox"
          ? Boolean(value)
          : value,
    }));
  }

  function validate() {
    const nextErrors = {};
    for (const field of fields) {
      const val = values[field.name];

      if (field.required && (val === undefined || val === null || val === "")) {
        nextErrors[field.name] = "Campo obrigatório.";
        continue;
      }

      if (typeof field.validate === "function") {
        const msg = field.validate(val, values);
        if (msg) nextErrors[field.name] = msg;
      }
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setAlert(null);

    if (!validate()) {
      setAlert({ type: "danger", message: "Corrija os campos destacados." });
      return;
    }

    const payload = {};
    for (const field of fields) {
      const val = values[field.name];
      if (field.transform && typeof field.transform === "function") {
        payload[field.name] = field.transform(val, values);
      } else {
        payload[field.name] = val;
      }
    }

    try {
      setSubmitting(true);
      const result = await onSubmit?.(payload);
      if (result?.success) {
        setAlert({ type: "success", message: "Salvo com sucesso." });
      } else {
        const msg = result?.error || "Falha ao salvar.";
        setAlert({ type: "danger", message: msg });
      }
    } catch (err) {
      setAlert({ type: "danger", message: err.message || "Erro inesperado." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {alert && (
        <div className={`alert alert-${alert.type}`} role="alert">
          {alert.message}
        </div>
      )}

      {fields.map((field) => {
        const id = `field-${field.name}`;
        const error = errors[field.name];
        const value = values[field.name] ?? (field.type === "checkbox" ? false : "");

        return (
          <div className="mb-3" key={field.name}>
            <label htmlFor={id} className="form-label">
              {field.label} {field.required && <span className="text-danger">*</span>}
            </label>

            {field.type === "select" ? (
              <select
                id={id}
                className={`form-select ${error ? "is-invalid" : ""}`}
                value={String(value)}
                onChange={(e) => handleChange(field.name, e.target.value, "select")}
              >
                <option value="">Selecione...</option>
                {(field.options || []).map((opt) => (
                  <option key={opt.value ?? opt} value={opt.value ?? opt}>
                    {opt.label ?? opt}
                  </option>
                ))}
              </select>
            ) : field.type === "checkbox" ? (
              <div className="form-check">
                <input
                  id={id}
                  type="checkbox"
                  className={`form-check-input ${error ? "is-invalid" : ""}`}
                  checked={Boolean(value)}
                  onChange={(e) => handleChange(field.name, e.target.checked, "checkbox")}
                />
                <label className="form-check-label" htmlFor={id}>
                  {field.label}
                </label>
              </div>
            ) : field.type === "textarea" ? (
              <textarea
                id={id}
                className={`form-control ${error ? "is-invalid" : ""}`}
                placeholder={field.placeholder}
                value={value}
                onChange={(e) => handleChange(field.name, e.target.value, "text")}
                rows={field.rows || 3}
              />
            ) : (
              <input
                id={id}
                type={field.type || "text"}
                className={`form-control ${error ? "is-invalid" : ""}`}
                placeholder={field.placeholder}
                value={field.type === "number" && value === 0 ? 0 : value}
                onChange={(e) => handleChange(field.name, e.target.value, field.type || "text")}
              />
            )}

            {error && <div className="invalid-feedback">{error}</div>}
          </div>
        );
      })}

      <div className="d-flex gap-2">
        {onCancel && (
          <button type="button" className="btn btn-outline-secondary" onClick={onCancel} disabled={submitting}>
            Cancelar
          </button>
        )}
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Salvando..." : submitText}
        </button>
      </div>
    </form>
  );
}
