export default function DespesasPage() {
  return (
    <main style={{ maxWidth: "900px", margin: "40px auto", padding: "20px" }}>
      <h1>Despesas</h1>
      <p>Controle de gastos da produção rural.</p>

      <a href="/dashboard">
        <button style={{ padding: "8px 14px", borderRadius: "8px", border: "1px solid #ccc" }}>
          Voltar para Dashboard
        </button>
      </a>
    </main>
  );
}