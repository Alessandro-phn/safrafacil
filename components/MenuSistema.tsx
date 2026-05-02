import Link from "next/link";

export default function MenuSistema() {
  return (
    <nav style={menuStyle}>
      <Link href="/dashboard" style={linkStyle}>Dashboard</Link>
      <Link href="/custos" style={linkStyle}>Custos</Link>
      <Link href="/pedidos" style={linkStyle}>Pedidos</Link>
      <Link href="/produtos" style={linkStyle}>Produtos</Link>
      <Link href="/clientes" style={linkStyle}>Clientes</Link>

      <Link href="/" style={sairStyle}>
        Sair
      </Link>
    </nav>
  );
}

const menuStyle = {
  display: "flex",
  gap: "12px",
  flexWrap: "wrap" as const,
  backgroundColor: "#1976d2",
  padding: "16px",
  marginBottom: "30px",
};

const linkStyle = {
  textDecoration: "none",
  backgroundColor: "white",
  color: "#1976d2",
  padding: "8px 14px",
  borderRadius: "6px",
  fontWeight: "bold",
};

const sairStyle = {
  textDecoration: "none",
  backgroundColor: "#c62828",
  color: "white",
  padding: "8px 14px",
  borderRadius: "6px",
  fontWeight: "bold",
};