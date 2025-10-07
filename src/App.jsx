import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Veiculos from './pages/Veiculos';
import Clientes from './pages/Clientes';
import Locacoes from './pages/Locacoes';
import AdicionarVeiculo from './pages/AdicionarVeiculo';
import EditarVeiculo from './pages/EditarVeiculo';
import Navbar from "./components/Navbar";
import './App.css'

function App() {

  return (
    <>
      <BrowserRouter>
      <Navbar />
      <Suspense fallback={<div className="container py-4">Carregando...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/veiculos" element={<Veiculos />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/locacoes" element={<Locacoes />} />
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
    </>
  )
}

export default App
