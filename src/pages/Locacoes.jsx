import React, { useEffect, useState } from "react";
import {
  listLocacoes,
  createLocacao,
  updateLocacao,
  cancelLocacao,
} from "../services/TableServices.js";
import { listClientes, listVehicles } from "../services/TableServices.js";
import ConfirmModal from "../components/ConfirmModal.jsx";
import EntityForm from "../components/EntityForm.jsx";
import { formatDate } from "../utils/formatDate.js";


export default function Locacoes() {
  const [locacoes, setLocacoes] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [veiculos, setVeiculos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [editingLocacao, setEditingLocacao] = useState(null);

  const [showConfirm, setShowConfirm] = useState(false);
  const [locacaoToCancel, setLocacaoToCancel] = useState(null);

  async function loadData() {
    setLoading(true);
    try {
      const [locs, cls, vhs] = await Promise.all([
        listLocacoes(),
        listClientes(),
        listVehicles(),
      ]);
      if (locs.success) setLocacoes(locs.data);
      if (cls.success) setClientes(cls.data);
      if (vhs.success) setVeiculos(vhs.data.filter((v) => v.disponibilidade));
    } catch (err) {
      setAlert({ type: "danger", message: err.message });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function handleNew() {
    setEditingLocacao(null);
    setShowForm(true);
  }

  function handleEdit(loc) {
    setEditingLocacao(loc);
    setShowForm(true);
  }

  function handleCancel(loc) {
    setLocacaoToCancel(loc);
    setShowConfirm(true);
  }

  async function confirmCancel() {
    if (!locacaoToCancel) return;
    const { partitionKey, rowKey } = locacaoToCancel;
    const result = await cancelLocacao(partitionKey, rowKey);
    if (result.success) {
      setAlert({ type: "success", message: "Locação cancelada." });
      loadData();
    } else {
      setAlert({ type: "danger", message: result.error });
    }
    setShowConfirm(false);
    setLocacaoToCancel(null);
  }

  async function handleSubmitLocacao(data) {
    try {
      const payload = {
        fk_cliente_id: data.fk_cliente_id,
        fk_veiculo_id: data.fk_veiculo_id,
        horario_inicio: data.horario_inicio,
        horario_fim: data.horario_fim,
        valor: data.valor,
        status: data.status || "ativo",
      };

      let result;
      if (editingLocacao) {
        result = await updateLocacao(
          editingLocacao.partitionKey,
          editingLocacao.rowKey,
          payload
        );
      } else {
        result = await createLocacao(payload);
      }

      if (result.success) {
        setAlert({ type: "success", message: "Locação salva com sucesso." });
        setShowForm(false);
        loadData();
      }
      return result;
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  const formFields = [
    {
      name: "fk_cliente_id",
      label: "Cliente",
      type: "select",
      required: true,
      options: clientes.map((c) => ({ value: c.rowKey, label: c.nome })),
    },
    {
      name: "fk_veiculo_id",
      label: "Veículo",
      type: "select",
      required: true,
      options: veiculos.map((v) => ({
        value: v.rowKey,
        label: `${v.marca} ${v.modelo} (${v.placa})`,
      })),
    },
    {
      name: "horario_inicio",
      label: "Início",
      type: "datetime-local",
      required: true,
      transform: (val) => new Date(val).toISOString(),
    },
    {
      name: "horario_fim",
      label: "Fim",
      type: "datetime-local",
      required: true,
      transform: (val) => new Date(val).toISOString(),
    },
    { name: "valor", label: "Valor", type: "number", required: true },
    {
      name: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "ativo", label: "Ativo" },
        { value: "finalizado", label: "Finalizado" },
        { value: "cancelada", label: "Cancelada" },
      ],
    },
  ];

  return (
    <div className="container py-4">
      <h1 className="h4 mb-3">Locações</h1>

      {alert && <div className={`alert alert-${alert.type}`}>{alert.message}</div>}

      <div className="mb-3">
        <button className="btn btn-success" onClick={handleNew}>
          Nova Locação
        </button>
      </div>

      {loading ? (
        <div>Carregando...</div>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Veículo</th>
              <th>Início</th>
              <th>Fim</th>
              <th>Valor</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {locacoes.map((l) => (
              <tr key={l.rowKey}>
                <td>{l.fk_cliente_id}</td>
                <td>{l.fk_veiculo_id}</td>
                <td>{formatDate(l.horario_inicio)}</td>
                <td>{formatDate(l.horario_fim)}</td>
                <td>{l.valor}</td>
                <td>
                  {l.status === "ativo" && <span className="badge bg-success">Ativo</span>}
                  {l.status === "finalizado" && <span className="badge bg-secondary">Finalizado</span>}
                  {l.status === "cancelada" && <span className="badge bg-danger">Cancelada</span>}
                </td>
                <td>
                  <button className="btn btn-sm btn-primary me-2" onClick={() => handleEdit(l)}>
                    Editar
                  </button>
                  {l.status !== "cancelada" && (
                    <button className="btn btn-sm btn-warning" onClick={() => handleCancel(l)}>
                      Cancelar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showForm && (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5>{editingLocacao ? "Editar Locação" : "Nova Locação"}</h5>
                <button className="btn-close" onClick={() => setShowForm(false)} />
              </div>
              <div className="modal-body">
                <EntityForm
                  fields={formFields}
                  initialData={editingLocacao || {}}
                  onSubmit={handleSubmitLocacao}
                  submitText={editingLocacao ? "Atualizar" : "Criar"}
                  onCancel={() => setShowForm(false)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        show={showConfirm}
        title="Cancelar Locação"
        message={`Deseja cancelar esta locação?`}
        confirmText="Cancelar"
        cancelText="Fechar"
        onConfirm={confirmCancel}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
}
