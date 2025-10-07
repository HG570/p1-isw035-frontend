import { Link } from 'react-router-dom'

export default function Home() {
    return (
        <div>
            <h1>Home</h1>
            <p>Bem-vindo.</p>
            <Link to="/adicionar-veiculo">Adicionar Veiculo</Link><br/>
            <Link to="/editar-veiculo">Editar Veiculo</Link>
        </div>
    )
}
