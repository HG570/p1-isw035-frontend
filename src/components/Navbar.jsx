import React from 'react';
import { NavLink } from 'react-router-dom';

const navLinks = [
  { path: '/', name: 'Home', end: true },
  { path: '/veiculos', name: 'Veículos' },
  { path: '/clientes', name: 'Clientes' },
  { path: '/locacoes', name: 'Locações' },
];

export default function Navbar() {
  const getNavLinkClass = ({ isActive }) => {
    return isActive ? 'nav-link active fw-bold' : 'nav-link';
  };

  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary shadow-sm fixed-top" data-bs-theme="dark">
      <div className="container-fluid">
        <NavLink to="/" className="navbar-brand d-flex align-items-center">
          Locadora
        </NavLink>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNavbar"
          aria-controls="mainNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="mainNavbar">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {navLinks.map((link) => (
              <li className="nav-item" key={link.name}>
                <NavLink to={link.path} className={getNavLinkClass} end={link.end}>
                  {link.name}
                </NavLink>
              </li>
            ))}

          </ul>
        </div>
      </div>
    </nav>
  );
}