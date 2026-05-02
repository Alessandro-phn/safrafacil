export default function VendasPage() {
  return (
    <main style={{ maxWidth: "900px", margin: "40px auto", padding: "20px" }}>
      <h1>Vendas</h1>
      <p>Registro e acompanhamento de vendas.</p>

      <a href="/dashboard">
        <button style={{ padding: "8px 14px", borderRadius: "8px", border: "1px solid #ccc" }}>
          Voltar para Dashboard
        </button>
      </a>
    </main>
  );
}