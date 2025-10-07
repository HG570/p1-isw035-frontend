import React, { useState } from "react";

export default function VehicleList({ vehicles }) {
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  return (
    <div className="table-responsive">
      <table className="table table-striped align-middle">
        <thead>
          <tr>
            <th>Marca</th>
            <th>Modelo</th>
            <th>Ano</th>
            <th>Placa</th>
            <th>Foto</th>
            <th>Disponível</th>
          </tr>
        </thead>
        <tbody>
          {vehicles.map((v) => (
            <tr key={v.rowKey}>
              <td>{v.marca}</td>
              <td>{v.modelo}</td>
              <td>{v.ano}</td>
              <td>{v.placa}</td>
              <td>
                {v.fotos && v.fotos.length > 0 && (
                  <img
                    src={v.fotos[0]}
                    alt="foto"
                    className="img-thumbnail"
                    style={{ width: "60px", height: "40px", objectFit: "cover", cursor: "pointer" }}
                    onClick={() => setSelectedPhoto(v.fotos[0])}
                  />
                )}
              </td>
              <td>
                {v.disponibilidade ? (
                  <span className="badge bg-success">Sim</span>
                ) : (
                  <span className="badge bg-danger">Não</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal para foto ampliada */}
      {selectedPhoto && (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-body text-center">
                <img src={selectedPhoto} alt="foto grande" className="img-fluid" />
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setSelectedPhoto(null)}>
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
