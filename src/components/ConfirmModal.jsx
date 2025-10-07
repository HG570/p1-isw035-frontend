// src/components/ConfirmModal.jsx
import React from "react";

/**
 * Modal genérico de confirmação para exclusões/ações críticas.
 * Props:
 * - show: boolean para exibir/ocultar
 * - title: título do modal
 * - message: conteúdo/descrição
 * - confirmText, cancelText: rótulos dos botões
 * - onConfirm, onCancel: handlers
 * - loading: desabilita botões enquanto processa
 */
export default function ConfirmModal({
  show,
  title = "Confirmar ação",
  message = "Tem certeza?",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
  loading = false,
}) {
  return (
    <div
      className={`modal ${show ? "d-block show" : ""}`}
      tabIndex="-1"
      role="dialog"
      style={{ backgroundColor: show ? "rgba(0,0,0,0.5)" : "transparent" }}
      aria-hidden={!show}
    >
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={() => !loading && onCancel?.()}
            />
          </div>
          <div className="modal-body">
            <p className="mb-0">{message}</p>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => onCancel?.()}
              disabled={loading}
            >
              {cancelText}
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => onConfirm?.()}
              disabled={loading}
            >
              {loading ? "Processando..." : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
