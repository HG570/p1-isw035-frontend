import React from "react";

export default function ClienteHistoricoModal({ show, cliente, historico = [], onClose }) {
    if (!show) return null;

    return (
        <div
            className="modal d-block"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5>Histórico de Locações - {cliente?.nome}</h5>
                        <button className="btn-close" onClick={onClose} />
                    </div>
                    <div className="modal-body">
                        {historico.length === 0 ? (
                            <div className="alert alert-info">Nenhuma locação encontrada.</div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-striped">
                                    <thead>
                                        <tr>
                                            <th>Veículo ID</th>
                                            <th>Início</th>
                                            <th>Fim</th>
                                            <th>Valor</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {historico.map((l) => (
                                            <tr key={l.rowKey}>
                                                <td>{l.fk_veiculo_id}</td>
                                                <td>{new Date(l.horario_inicio).toLocaleString()}</td>
                                                <td>{new Date(l.horario_fim).toLocaleString()}</td>
                                                <td>R$ {l.valor}</td>
                                                <td>
                                                    {l.status === "ativo" && (
                                                        <span className="badge bg-success">Ativo</span>
                                                    )}
                                                    {l.status === "finalizado" && (
                                                        <span className="badge bg-secondary">Finalizado</span>
                                                    )}
                                                    {l.status === "cancelada" && (
                                                        <span className="badge bg-danger">Cancelada</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-secondary" onClick={onClose}>
                            Fechar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
