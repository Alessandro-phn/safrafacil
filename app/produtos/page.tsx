"use client";

import { useEffect, useState } from "react";
import MenuSistema from "@/components/MenuSistema";
import { supabase } from "@/lib/supabase";

type Produto = {
  id: number;
  nome: string;
  cultura: string | null;
  categoria: string | null;
  unidade: string | null;
  preco_padrao: number | null;
};

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [nome, setNome] = useState("");
  const [cultura, setCultura] = useState("");
  const [categoria, setCategoria] = useState("");
  const [unidade, setUnidade] = useState("");
  const [precoPadrao, setPrecoPadrao] = useState("");
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    carregarProdutos();
  }, []);

  async function carregarProdutos() {
    const { data, error } = await supabase
      .from("produtos")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      setMensagem("Erro ao carregar produtos: " + error.message);
      return;
    }

    setProdutos(data || []);
  }

  async function salvarProduto(e: any) {
    e.preventDefault();

    if (!nome.trim()) {
      setMensagem("Preencha o nome do produto.");
      return;
    }

    const precoNumero = precoPadrao
      ? Number(precoPadrao.replace(",", "."))
      : null;

    const { error } = await supabase.from("produtos").insert([
      {
        nome,
        cultura,
        categoria,
        unidade,
        preco_padrao: precoNumero,
      },
    ]);

    if (error) {
      setMensagem("Erro ao salvar produto: " + error.message);
      return;
    }

    setMensagem("Produto cadastrado com sucesso!");
    setNome("");
    setCultura("");
    setCategoria("");
    setUnidade("");
    setPrecoPadrao("");
    carregarProdutos();
  }

  async function excluirProduto(id: number) {
    const confirmar = confirm("Deseja excluir este produto?");
    if (!confirmar) return;

    const { error } = await supabase.from("produtos").delete().eq("id", id);

    if (error) {
      setMensagem("Erro ao excluir produto: " + error.message);
      return;
    }

    setMensagem("Produto excluído com sucesso!");
    carregarProdutos();
  }

  function formatarMoeda(valor: number | null) {
    if (valor === null || valor === undefined) return "-";

    return Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  return (
    <main style={pageStyle}>
      <MenuSistema />

      <section style={cardStyle}>
        <h1>Produtos</h1>

        <form onSubmit={salvarProduto}>
          <input
            style={inputStyle}
            placeholder="Nome do produto (ex: Óleo de soja)"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />

          <input
            style={inputStyle}
            placeholder="Cultura de origem (ex: Soja, Milho, Café)"
            value={cultura}
            onChange={(e) => setCultura(e.target.value)}
          />

          <input
            style={inputStyle}
            placeholder="Categoria"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
          />

          <input
            style={inputStyle}
            placeholder="Unidade (kg, caixa, unidade...)"
            value={unidade}
            onChange={(e) => setUnidade(e.target.value)}
          />

          <input
            style={inputStyle}
            placeholder="Preço padrão (ex: 25,50)"
            value={precoPadrao}
            onChange={(e) => setPrecoPadrao(e.target.value)}
          />

          <button style={buttonStyle}>Salvar Produto</button>
        </form>

        {mensagem && <p style={{ marginTop: "20px" }}>{mensagem}</p>}
      </section>

      <section style={{ ...cardStyle, marginTop: "30px" }}>
        <h2>Produtos cadastrados</h2>

        {produtos.length === 0 ? (
          <p>Nenhum produto cadastrado.</p>
        ) : (
          produtos.map((produto) => (
            <div key={produto.id} style={itemStyle}>
              <p>
                <strong>Nome:</strong> {produto.nome}
              </p>

              <p>
                <strong>Cultura:</strong> {produto.cultura || "-"}
              </p>

              <p>
                <strong>Categoria:</strong> {produto.categoria || "-"}
              </p>

              <p>
                <strong>Unidade:</strong> {produto.unidade || "-"}
              </p>

              <p>
                <strong>Preço padrão:</strong>{" "}
                {formatarMoeda(produto.preco_padrao)}
              </p>

              <button
                onClick={() => excluirProduto(produto.id)}
                style={deleteButtonStyle}
              >
                Excluir
              </button>
            </div>
          ))
        )}
      </section>
    </main>
  );
}

const pageStyle = {
  marginLeft: "240px",
  padding: "40px",
  fontFamily: "Arial",
  background:
    "linear-gradient(135deg, #071f16 0%, #123524 35%, #f4f6f8 35%, #f4f6f8 100%)",
  minHeight: "100vh",
};

const cardStyle = {
  backgroundColor: "rgba(255,255,255,0.97)",
  padding: "28px",
  borderRadius: "22px",
  boxShadow: "0 10px 28px rgba(0,0,0,0.14)",
  border: "1px solid rgba(116,201,71,0.25)",
};

const inputStyle = {
  display: "block",
  width: "100%",
  padding: "13px",
  marginBottom: "14px",
  borderRadius: "12px",
  border: "1px solid #cfd8dc",
  fontSize: "15px",
};

const buttonStyle = {
  width: "100%",
  padding: "14px",
  backgroundColor: "#2e7d32",
  color: "white",
  border: "none",
  borderRadius: "12px",
  fontWeight: "bold",
  cursor: "pointer",
};

const deleteButtonStyle = {
  padding: "10px 14px",
  backgroundColor: "#c62828",
  color: "white",
  border: "none",
  borderRadius: "10px",
  cursor: "pointer",
  marginTop: "12px",
  fontWeight: "bold",
};

const itemStyle = {
  border: "1px solid rgba(116,201,71,0.25)",
  borderRadius: "18px",
  padding: "18px",
  marginTop: "14px",
  backgroundColor: "#ffffff",
  boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
};