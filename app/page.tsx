import Link from "next/link";

export default function Home() {
  return (
    <main style={{ padding: "40px", textAlign: "center" }}>
      <h1>SafraFácil</h1>

      <p style={{ fontSize: "18px", marginTop: "10px" }}>
        Gestão simples e eficiente para produtores rurais
      </p>

      <Link href="/dashboard">
        <button
          style={{
            padding: "12px 20px",
            marginTop: "20px",
            cursor: "pointer",
            backgroundColor: "#1976d2",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontWeight: "bold",
          }}
        >
          Entrar no sistema
        </button>
      </Link>
    </main>
  );
}