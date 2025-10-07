import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Veiculos from './pages/Veiculos';
import AdicionarVeiculo from './pages/AdicionarVeiculo';
import EditarVeiculo from './pages/EditarVeiculo';
import './App.css'

function App() {

  return (
    <>
      <BrowserRouter>
        <nav>
          <Link to="/">Home</Link> | <Link to="/about">About</Link>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/adicionar-veiculo" element={<AdicionarVeiculo />} />
          <Route path="/editar-veiculo" element={<EditarVeiculo />} />
          <Route path="/veiculos" element={<Veiculos />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
