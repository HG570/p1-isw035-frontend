import React, { useEffect, useState, useCallback } from "react";
import {
    listVehicles,
    createVehicle,
    updateVehicle,
    deleteVehicle,
} from "../services/TableServices.js";
import { uploadVehiclePhoto } from "../services/BlobServices.js";
import ConfirmModal from "../components/ConfirmModal.jsx";

export default function VeiculosPage() {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState(null);

    const [searchMarca, setSearchMarca] = useState("");
    const [searchModelo, setSearchModelo] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState(null);
    const [filterDisponibilidade, setFilterDisponibilidade] = useState("");

    const [showConfirm, setShowConfirm] = useState(false);
    const [vehicleToDelete, setVehicleToDelete] = useState(null);

    const [formData, setFormData] = useState({
        marca: "",
        modelo: "",
        ano: "",
        placa: "",
        disponibilidade: true,
        file: null,
    });

    const loadVehicles = useCallback(async () => {
        setLoading(true);
        setAlert(null);
        try {
            const result = await listVehicles({
                marca: searchMarca || undefined,
                modelo: searchModelo || undefined,
                disponibilidade:
                    filterDisponibilidade === ""
                        ? undefined
                        : filterDisponibilidade === "true",
            });
            if (result.success) {
                setVehicles(result.data);
            } else {
                setAlert({ type: "danger", message: result.error });
            }
        } catch (err) {
            setAlert({ type: "danger", message: err.message });
        } finally {
            setLoading(false);
        }
    }, [searchMarca, searchModelo, filterDisponibilidade]);

    useEffect(() => {
        loadVehicles();
    }, [loadVehicles]);

    function handleNew() {
        setEditingVehicle(null);
        setFormData({
            marca: "",
            modelo: "",
            ano: "",
            placa: "",
            disponibilidade: true,
            file: null,
        });
        setShowForm(true);
    }

    function handleEdit(vehicle) {
        setEditingVehicle(vehicle);
        setFormData({
            marca: vehicle.marca,
            modelo: vehicle.modelo,
            ano: vehicle.ano,
            placa: vehicle.placa,
            disponibilidade: vehicle.disponibilidade,
            file: null,
        });
        setShowForm(true);
    }

    function handleDelete(vehicle) {
        setVehicleToDelete(vehicle);
        setShowConfirm(true);
    }

    async function confirmDelete() {
        if (!vehicleToDelete) return;
        const { partitionKey, rowKey } = vehicleToDelete;
        const result = await deleteVehicle(partitionKey, rowKey);
        if (result.success) {
            setAlert({ type: "success", message: "Veículo excluído com sucesso." });
            loadVehicles();
        } else {
            setAlert({ type: "danger", message: result.error });
        }
        setShowConfirm(false);
        setVehicleToDelete(null);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        setAlert(null);

        try {
            let fotoUrl = editingVehicle?.fotos?.[0] || null;

            if (formData.file) {
                const upload = await uploadVehiclePhoto(formData.file);
                if (upload.success) {
                    fotoUrl = upload.url;
                } else {
                    setAlert({ type: "danger", message: upload.error });
                    setLoading(false);
                    return;
                }
            }

            const payload = {
                marca: formData.marca,
                modelo: formData.modelo,
                ano: formData.ano,
                placa: formData.placa,
                disponibilidade: formData.disponibilidade,
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
                setShowForm(false);
                loadVehicles();
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
        <div className="container py-4">
            <h1 className="h4 mb-3">Veículos</h1>

            {alert && <div className={`alert alert-${alert.type}`}>{alert.message}</div>}

            <div className="row mb-3">
                <div className="col-md-4">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Filtrar por marca"
                        value={searchMarca}
                        onChange={(e) => setSearchMarca(e.target.value)}
                    />
                </div>
                <div className="col-md-4">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Filtrar por modelo"
                        value={searchModelo}
                        onChange={(e) => setSearchModelo(e.target.value)}
                    />
                </div>
                <div className="col-md-3">
                    <select
                        className="form-select"
                        value={filterDisponibilidade}
                        onChange={(e) => setFilterDisponibilidade(e.target.value)}
                    >
                        <option value="">Todas</option>
                        <option value="true">Disponíveis</option>
                        <option value="false">Indisponíveis</option>
                    </select>
                </div>
                <div className="col-md-4">
                    <button className="btn btn-primary w-100" onClick={loadVehicles}>
                        Buscar
                    </button>
                </div>
            </div>

            <div className="mb-3">
                <button className="btn btn-success" onClick={handleNew}>
                    Novo Veículo
                </button>
            </div>

            {loading ? (
                <div>Carregando...</div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-striped align-middle">
                        <thead>
                            <tr>
                                <th>Foto</th>
                                <th>Marca</th>
                                <th>Modelo</th>
                                <th>Ano</th>
                                <th>Placa</th>
                                <th>Disponível</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vehicles.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="text-center">
                                        Nenhum veículo encontrado.
                                    </td>
                                </tr>
                            )}
                            {vehicles.map((v) => (
                                <tr key={v.rowKey}>
                                    <td>
                                        {v.fotos && v.fotos.length > 0 && (
                                            <img
                                                src={v.fotos[0]}
                                                alt="foto"
                                                className="img-thumbnail"
                                                style={{ width: "60px", height: "40px", objectFit: "cover" }}
                                            />
                                        )}
                                    </td>
                                    <td>{v.marca}</td>
                                    <td>{v.modelo}</td>
                                    <td>{v.ano}</td>
                                    <td>{v.placa}</td>
                                    <td>
                                        {v.disponibilidade ? (
                                            <span className="badge bg-success">Sim</span>
                                        ) : (
                                            <span className="badge bg-danger">Não</span>
                                        )}
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-sm btn-primary me-2"
                                            onClick={() => handleEdit(v)}
                                        >
                                            Editar
                                        </button>
                                        <button
                                            className="btn btn-sm btn-danger"
                                            onClick={() => handleDelete(v)}
                                        >
                                            Excluir
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showForm && (
                <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <form onSubmit={handleSubmit}>
                                <div className="modal-header">
                                    <h5 className="modal-title">
                                        {editingVehicle ? "Editar Veículo" : "Novo Veículo"}
                                    </h5>
                                    <button type="button" className="btn-close" onClick={() => setShowForm(false)} />
                                </div>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Marca</label>
                                        <input
                                            className="form-control"
                                            value={formData.marca}
                                            onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Modelo</label>
                                        <input
                                            className="form-control"
                                            value={formData.modelo}
                                            onChange={(e) =>
                                                setFormData({ ...formData, modelo: e.target.value })
                                            }
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Ano</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={formData.ano}
                                            onChange={(e) =>
                                                setFormData({ ...formData, ano: e.target.value })
                                            }
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Placa</label>
                                        <input
                                            className="form-control"
                                            value={formData.placa}
                                            onChange={(e) =>
                                                setFormData({ ...formData, placa: e.target.value })
                                            }
                                            required
                                        />
                                    </div>

                                    <div className="form-check mb-3">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id="disponibilidade"
                                            checked={formData.disponibilidade}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    disponibilidade: e.target.checked,
                                                })
                                            }
                                        />
                                        <label className="form-check-label" htmlFor="disponibilidade">
                                            Disponível
                                        </label>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Foto</label>
                                        <input
                                            type="file"
                                            className="form-control"
                                            onChange={(e) =>
                                                setFormData({ ...formData, file: e.target.files[0] })
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setShowForm(false)}
                                    >
                                        Cancelar
                                    </button>
                                    <button type="submit" className="btn btn-primary" disabled={loading}>
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Salvando...
                                            </>
                                        ) : editingVehicle ? (
                                            "Atualizar"
                                        ) : (
                                            "Criar"
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal
                show={showConfirm}
                title="Excluir Veículo"
                message={`Tem certeza que deseja excluir o veículo ${vehicleToDelete?.marca} ${vehicleToDelete?.modelo}?`}
                confirmText="Excluir"
                cancelText="Cancelar"
                onConfirm={confirmDelete}
                onCancel={() => setShowConfirm(false)}
            />
        </div>
    );
}

