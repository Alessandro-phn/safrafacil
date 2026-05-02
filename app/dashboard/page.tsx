"use client";

import { useEffect, useState } from "react";
import MenuSistema from "@/components/MenuSistema";
import { supabase } from "@/lib/supabase";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function Dashboard() {
  const [receita, setReceita] = useState(0);
  const [custos, setCustos] = useState(0);
  const [lucro, setLucro] = useState(0);
  const [erro, setErro] = useState("");
  const [dadosCultura, setDadosCultura] = useState<any[]>([]);
  const [lucroCultura, setLucroCultura] = useState<any[]>([]);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    setErro("");

    let queryCustos = supabase
      .from("custos_cultivo")
      .select("valor, cultura, data_custo");

    if (dataInicio) queryCustos = queryCustos.gte("data_custo", dataInicio);
    if (dataFim) queryCustos = queryCustos.lte("data_custo", dataFim);

    const { data: custosData, error: erroCustos } = await queryCustos;

    if (erroCustos) {
      setErro("Erro ao buscar custos: " + erroCustos.message);
      return;
    }

    const { data: pedidosData, error: erroPedidos } = await supabase
      .from("pedidos")
      .select("valor_total, cultura");

    if (erroPedidos) {
      setErro("Erro ao buscar pedidos: " + erroPedidos.message);
      return;
    }

    const totalCustos =
      custosData?.reduce((acc, item) => acc + Number(item.valor ?? 0), 0) ?? 0;

    const totalReceita =
      pedidosData?.reduce((acc, item: any) => {
        return acc + Number(item.valor_total ?? 0);
      }, 0) ?? 0;

    const mapaCustos: any = {};

    custosData?.forEach((item) => {
      const cultura = item.cultura || "Sem cultura";
      mapaCustos[cultura] =
        (mapaCustos[cultura] ?? 0) + Number(item.valor ?? 0);
    });

    const custosPorCultura = Object.keys(mapaCustos).map((cultura) => ({
      nome: cultura,
      valor: mapaCustos[cultura],
    }));

    const mapaReceita: any = {};

    pedidosData?.forEach((item: any) => {
      const cultura = item.cultura || "Sem cultura";
      mapaReceita[cultura] =
        (mapaReceita[cultura] ?? 0) + Number(item.valor_total ?? 0);
    });

    const culturas = new Set([
      ...Object.keys(mapaReceita),
      ...Object.keys(mapaCustos),
    ]);

    const resultadoLucro = Array.from(culturas).map((cultura) => ({
      nome: cultura,
      valor: (mapaReceita[cultura] ?? 0) - (mapaCustos[cultura] ?? 0),
    }));

    setReceita(totalReceita);
    setCustos(totalCustos);
    setLucro(totalReceita - totalCustos);
    setDadosCultura(custosPorCultura);
    setLucroCultura(resultadoLucro);
  }

  function limparFiltro() {
    setDataInicio("");
    setDataFim("");

    setTimeout(() => {
      carregarDados();
    }, 100);
  }

  function formatar(valor: number) {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  const dadosGrafico = [
    { nome: "Receita", valor: receita },
    { nome: "Custos", valor: custos },
    { nome: "Lucro", valor: lucro },
  ];

  return (
    <main style={pageStyle}>
      <MenuSistema />

      <h1 style={{ marginBottom: "30px" }}>Painel SafraFácil</h1>

      {erro && <p style={{ color: "red" }}>{erro}</p>}

      <section style={filtroStyle}>
        <h2>Filtrar por período (somente custos)</h2>

        <input
          type="date"
          value={dataInicio}
          onChange={(e) => setDataInicio(e.target.value)}
          style={inputStyle}
        />

        <input
          type="date"
          value={dataFim}
          onChange={(e) => setDataFim(e.target.value)}
          style={inputStyle}
        />

        <button onClick={carregarDados} style={botaoStyle}>
          Filtrar
        </button>

        <button onClick={limparFiltro} style={botaoLimparStyle}>
          Limpar
        </button>
      </section>

      <section style={cardGrid}>
        <div style={cardStyle}>
          <h2>💰 Receita</h2>
          <p style={valorStyle}>{formatar(receita)}</p>
        </div>

        <div style={cardStyle}>
          <h2>💸 Custos</h2>
          <p style={valorStyle}>{formatar(custos)}</p>
        </div>

        <div style={cardStyle}>
          <h2>📈 Lucro</h2>
          <p style={{ ...valorStyle, color: lucro >= 0 ? "green" : "red" }}>
            {formatar(lucro)}
          </p>
        </div>
      </section>

      <section style={graficoCardStyle}>
        <h2>Receita x Custos x Lucro</h2>

        <div style={{ width: "100%", height: "300px" }}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dadosGrafico}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nome" />
              <YAxis />
              <Tooltip formatter={(value) => formatar(Number(value ?? 0))} />
              <Bar dataKey="valor" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section style={{ ...graficoCardStyle, marginTop: "30px" }}>
        <h2>Custos por Cultura</h2>

        <div style={{ width: "100%", height: "300px" }}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dadosCultura}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nome" />
              <YAxis />
              <Tooltip formatter={(value) => formatar(Number(value ?? 0))} />
              <Bar dataKey="valor" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section style={{ ...graficoCardStyle, marginTop: "30px" }}>
        <h2>Lucro por Cultura</h2>

        <div style={{ width: "100%", height: "300px" }}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={lucroCultura}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nome" />
              <YAxis />
              <Tooltip formatter={(value) => formatar(Number(value ?? 0))} />
              <Bar dataKey="valor" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </main>
  );
}

const pageStyle = {
  padding: "40px",
  fontFamily: "Arial",
  backgroundColor: "#f4f6f8",
  minHeight: "100vh",
};

const filtroStyle = {
  backgroundColor: "white",
  padding: "24px",
  borderRadius: "14px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  marginBottom: "30px",
};

const cardGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "20px",
  marginBottom: "30px",
};

const cardStyle = {
  backgroundColor: "white",
  padding: "24px",
  borderRadius: "14px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
};

const valorStyle = {
  fontSize: "26px",
  fontWeight: "bold",
  marginTop: "10px",
};

const graficoCardStyle = {
  backgroundColor: "white",
  padding: "24px",
  borderRadius: "14px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
};

const inputStyle = {
  padding: "10px",
  marginRight: "10px",
  marginTop: "10px",
};

const botaoStyle = {
  padding: "10px 18px",
  backgroundColor: "#1976d2",
  color: "white",
  border: "none",
  cursor: "pointer",
  marginRight: "10px",
};

const botaoLimparStyle = {
  padding: "10px 18px",
  backgroundColor: "#777",
  color: "white",
  border: "none",
  cursor: "pointer",
};