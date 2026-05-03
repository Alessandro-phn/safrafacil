"use client";

import { useEffect, useState } from "react";
import MenuSistema from "@/components/MenuSistema";
import { supabase } from "@/lib/supabase";

type Custo = {
  id: number;
  tipo_custo: string;
  cultura: string | null;
  descricao: string | null;
  valor: number;
  data_custo: string | null;
};

export default function CustosPage() {
  const [custos, setCustos] = useState<Custo[]>([]);
  const [tipoCusto, setTipoCusto] = useState("");
  const [cultura, setCultura] = useState("");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [dataCusto, setDataCusto] = useState("");
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    carregarCustos();
  }, []);

  async function carregarCustos() {
    const { data, error } = await supabase
      .from("custos_cultivo")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      setMensagem("Erro ao carregar custos: " + error.message);
      return;
    }

    setCustos(data || []);
  }

  async function salvarCusto(e: any) {
    e.preventDefault();

    const valorNumero = Number(valor.replace(",", "."));

    if (!tipoCusto || !valorNumero) {
      setMensagem("Preencha tipo de custo e valor corretamente.");
      return;
    }

    const { error } = await supabase.from("custos_cultivo").insert([
      {
        tipo_custo: tipoCusto,
        cultura,
        descricao,
        valor: valorNumero,
        data_custo: dataCusto || new Date().toISOString().slice(0, 10),
      },
    ]);

    if (error) {
      setMensagem("Erro ao salvar custo: " + error.message);
      return;
    }

    setMensagem("Custo cadastrado com sucesso!");
    setTipoCusto("");
    setCultura("");
    setDescricao("");
    setValor("");
    setDataCusto("");
    carregarCustos();
  }

  async function excluirCusto(id: number) {
    const confirmar = confirm("Deseja excluir este custo?");
    if (!confirmar) return;

    const { error } = await supabase.from("custos_cultivo").delete().eq("id", id);

    if (error) {
      setMensagem("Erro ao excluir custo: " + error.message);
      return;
    }

    setMensagem("Custo excluído com sucesso!");
    carregarCustos();
  }

  function formatarMoeda(valor: number) {
    return Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  return (
    <main style={pageStyle}>
      <MenuSistema />

      <section style={cardStyle}>
        <h1>Custos de Cultivo</h1>

        <form onSubmit={salvarCusto}>
          <input
            style={inputStyle}
            placeholder="Tipo de custo (Adubo, Diesel...)"
            value={tipoCusto}
            onChange={(e) => setTipoCusto(e.target.value)}
          />

          <input
            style={inputStyle}
            placeholder="Cultura (Soja, Milho...)"
            value={cultura}
            onChange={(e) => setCultura(e.target.value)}
          />

          <input
            style={inputStyle}
            placeholder="Descrição"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />

          <input
            style={inputStyle}
            placeholder="Valor (ex: 850,00)"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
          />

          <input
            style={inputStyle}
            type="date"
            value={dataCusto}
            onChange={(e) => setDataCusto(e.target.value)}
          />

          <button style={buttonStyle}>Salvar Custo</button>
        </form>

        {mensagem && <p style={{ marginTop: "20px" }}>{mensagem}</p>}
      </section>

      <section style={{ ...cardStyle, marginTop: "30px" }}>
        <h2>Custos cadastrados</h2>

        {custos.length === 0 ? (
          <p>Nenhum custo cadastrado.</p>
        ) : (
          custos.map((custo) => (
            <div key={custo.id} style={itemStyle}>
              <p><strong>Tipo:</strong> {custo.tipo_custo}</p>
              <p><strong>Cultura:</strong> {custo.cultura || "-"}</p>
              <p><strong>Descrição:</strong> {custo.descricao || "-"}</p>
              <p><strong>Valor:</strong> {formatarMoeda(custo.valor)}</p>
              <p><strong>Data:</strong> {custo.data_custo || "-"}</p>

              <button
                onClick={() => excluirCusto(custo.id)}
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