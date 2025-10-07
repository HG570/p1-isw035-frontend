import React, { useEffect, useState } from "react";
import {
  listClientes,
  createCliente,
  updateCliente,
  deleteCliente,
  getHistoricoLocacoesCliente,
} from "../services/TableServices.js";
import ConfirmModal from "../components/ConfirmModal.jsx";
import EntityForm from "../components/EntityForm.jsx";
import ClienteHistoricoModal from "../components/ClienteHistoricoModal.jsx";

export default function Cliente() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [editingCliente, setEditingCliente] = useState(null);

  const [showConfirm, setShowConfirm] = useState(false);
  const [clienteToDelete, setClienteToDelete] = useState(null);

  const [historico, setHistorico] = useState([]);
  const [showHistorico, setShowHistorico] = useState(false);
  const [clienteHistorico, setClienteHistorico] = useState(null);

  async function loadClientes() {
    setLoading(true);
    try {
      const result = await listClientes();
      if (result.success) setClientes(result.data);
      else setAlert({ type: "danger", message: result.error });
    } catch (err) {
      setAlert({ type: "danger", message: err.message });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadClientes();
  }, []);

  function handleNew() {
    setEditingCliente(null);
    setShowForm(true);
  }

  function handleEdit(cliente) {
    setEditingCliente(cliente);
    setShowForm(true);
  }

  function handleDelete(cliente) {
    setClienteToDelete(cliente);
    setShowConfirm(true);
  }

  async function confirmDelete() {
    if (!clienteToDelete) return;
    const { partitionKey, rowKey } = clienteToDelete;
    const result = await deleteCliente(partitionKey, rowKey);
    if (result.success) {
      setAlert({ type: "success", message: "Cliente excluído com sucesso." });
      loadClientes();
    } else {
      setAlert({ type: "danger", message: result.error });
    }
    setShowConfirm(false);
    setClienteToDelete(null);
  }

  async function handleSubmitCliente(data) {
    try {
      let result;
      if (editingCliente) {
        result = await updateCliente(
          editingCliente.partitionKey,
          editingCliente.rowKey,
          data
        );
      } else {
        result = await createCliente(data);
      }
      if (result.success) {
        setAlert({ type: "success", message: "Cliente salvo com sucesso." });
        setShowForm(false);
        loadClientes();
      }
      return result;
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async function handleHistorico(cliente) {
    const result = await getHistoricoLocacoesCliente(
      cliente.partitionKey,
      cliente.rowKey
    );
    if (result.success) {
      setClienteHistorico(cliente);
      setHistorico(result.data);
      setShowHistorico(true);
    } else {
      setAlert({ type: "danger", message: result.error });
    }
  }

  const formFields = [
    { name: "tipo_documento", label: "Tipo Documento", type: "text", required: true },
    { name: "documento", label: "Documento", type: "text", required: true },
    { name: "nome", label: "Nome", type: "text", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "telefone", label: "Telefone", type: "text", required: true },
  ];

  return (
    <div className="container py-4">
      <h1 className="h4 mb-3">Clientes</h1>

      {alert && <div className={`alert alert-${alert.type}`}>{alert.message}</div>}

      <div className="mb-3">
        <button className="btn btn-success" onClick={handleNew}>
          Novo Cliente
        </button>
      </div>

      {loading ? (
        <div>Carregando...</div>
      ) : (
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Documento</th>
              <th>Email</th>
              <th>Telefone</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((c) => (
              <tr key={c.rowKey}>
                <td>{c.nome}</td>
                <td>{c.documento}</td>
                <td>{c.email}</td>
                <td>{c.telefone}</td>
                <td>
                  <button className="btn btn-sm btn-primary me-2" onClick={() => handleEdit(c)}>
                    Editar
                  </button>
                  <button className="btn btn-sm btn-danger me-2" onClick={() => handleDelete(c)}>
                    Excluir
                  </button>
                  <button className="btn btn-sm btn-info" onClick={() => handleHistorico(c)}>
                    Histórico
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showForm && (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5>{editingCliente ? "Editar Cliente" : "Novo Cliente"}</h5>
                <button className="btn-close" onClick={() => setShowForm(false)} />
              </div>
              <div className="modal-body">
                <EntityForm
                  fields={formFields}
                  initialData={editingCliente || {}}
                  onSubmit={handleSubmitCliente}
                  submitText={editingCliente ? "Atualizar" : "Criar"}
                  onCancel={() => setShowForm(false)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Histórico */}
      <ClienteHistoricoModal
        show={showHistorico}
        cliente={clienteHistorico}
        historico={historico}
        onClose={() => setShowHistorico(false)}
      />

      <ConfirmModal
        show={showConfirm}
        title="Excluir Cliente"
        message={`Deseja excluir o cliente ${clienteToDelete?.nome}?`}
        onConfirm={confirmDelete}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  );
}
