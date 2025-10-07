import React, { useState } from "react";
import { uploadVehiclePhoto } from "../services/BlobServices.js";
import { createVehicle, updateVehicle } from "../services/TableServices.js";

export default function VehicleForm({ editingVehicle, onSaved, onCancel }) {
  const [marca, setMarca] = useState(editingVehicle?.marca || "");
  const [modelo, setModelo] = useState(editingVehicle?.modelo || "");
  const [ano, setAno] = useState(editingVehicle?.ano || "");
  const [placa, setPlaca] = useState(editingVehicle?.placa || "");
  const [disponibilidade, setDisponibilidade] = useState(
    editingVehicle?.disponibilidade ?? true
  );
  const [file, setFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setAlert(null);

    try {
      let fotoUrl = editingVehicle?.fotos?.[0] || null;

      // Upload da foto se houver arquivo novo
      if (file) {
        const upload = await uploadVehiclePhoto(file);
        if (upload.success) {
          fotoUrl = upload.url;
        } else {
          setAlert({ type: "danger", message: upload.error });
          setLoading(false);
          return;
        }
      }

      const payload = {
        marca,
        modelo,
        ano,
        placa,
        disponibilidade,
        fotos: fotoUrl ? [fotoUrl] : [],
      };

      let result;
      if (editingVehicle) {
        result = await updateVehicle(
          editingVehicle.partitionKey,
          editingVehicle.rowKey,
          payload
        );
      } else {
        result = await createVehicle(payload);
      }

      if (result.success) {
        setAlert({ type: "success", message: "Veículo salvo com sucesso." });
        onSaved?.();
      } else {
        setAlert({ type: "danger", message: result.error });
      }
    } catch (err) {
      setAlert({ type: "danger", message: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {alert && <div className={`alert alert-${alert.type}`}>{alert.message}</div>}

      <div className="mb-3">
        <label className="form-label">Marca</label>
        <input className="form-control" value={marca} onChange={(e) => setMarca(e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="form-label">Modelo</label>
        <input className="form-control" value={modelo} onChange={(e) => setModelo(e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="form-label">Ano</label>
        <input type="number" className="form-control" value={ano} onChange={(e) => setAno(e.target.value)} />
      </div>

      <div className="mb-3">
        <label className="form-label">Placa</label>
        <input className="form-control" value={placa} onChange={(e) => setPlaca(e.target.value)} />
      </div>

      <div className="form-check mb-3">
        <input
          type="checkbox"
          className="form-check-input"
          checked={disponibilidade}
          onChange={(e) => setDisponibilidade(e.target.checked)}
        />
        <label className="form-check-label">Disponível</label>
      </div>

      <div className="mb-3">
        <label className="form-label">Foto</label>
        <input type="file" className="form-control" onChange={(e) => setFile(e.target.files[0])} />
      </div>

      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? (
          <>
            <span className="spinner-border spinner-border-sm me-2"></span>
            Salvando...
          </>
        ) : editingVehicle ? "Atualizar" : "Criar"}
      </button>
      <button type="button" className="btn btn-secondary ms-2" onClick={onCancel}>
        Cancelar
      </button>
    </form>
  );
}
