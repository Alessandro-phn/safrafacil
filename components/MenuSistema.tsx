"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MenuSistema() {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "📊 Dashboard" },
    { href: "/pedidos", label: "🧾 Pedidos" },
    { href: "/clientes", label: "👥 Clientes" },
    { href: "/produtos", label: "📦 Produtos" },
    { href: "/custos", label: "💸 Custos" },
  ];

  return (
    <aside style={menuStyle}>
      <div style={logoArea}>
        <div style={logoIcon}>🌱</div>
        <div>
          <h2 style={logoText}>SafraFácil</h2>
          <p style={logoSubText}>Gestão rural inteligente</p>
        </div>
      </div>

      <nav style={navStyle}>
        {links.map((link) => {
          const ativo = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              style={{
                ...linkStyle,
                ...(ativo ? linkAtivoStyle : {}),
              }}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

const menuStyle = {
  width: "240px",
  minHeight: "100vh",
  background: "linear-gradient(180deg, #071f16, #0f2f22)",
  color: "white",
  padding: "28px 18px",
  position: "fixed" as const,
  left: 0,
  top: 0,
  boxShadow: "4px 0 20px rgba(0,0,0,0.25)",
  zIndex: 1000,
};

const logoArea = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  marginBottom: "40px",
};

const logoIcon = {
  width: "46px",
  height: "46px",
  borderRadius: "16px",
  backgroundColor: "#74c947",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "25px",
};

const logoText = {
  fontSize: "22px",
  margin: 0,
  color: "#ffffff",
};

const logoSubText = {
  fontSize: "12px",
  margin: "4px 0 0 0",
  color: "#bfe8c2",
};

const navStyle = {
  display: "flex",
  flexDirection: "column" as const,
  gap: "12px",
};

const linkStyle = {
  color: "#dfffe0",
  textDecoration: "none",
  padding: "13px 14px",
  borderRadius: "12px",
  backgroundColor: "rgba(255,255,255,0.06)",
  fontWeight: "bold",
  transition: "all 0.2s ease",
};

const linkAtivoStyle = {
  backgroundColor: "#74c947",
  color: "#071f16",
  boxShadow: "0 8px 18px rgba(116,201,71,0.35)",
};