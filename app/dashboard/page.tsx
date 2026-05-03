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

    // 🔹 BUSCA CUSTOS
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

    // 🔥 BUSCA VENDAS
    const { data: itensData, error: erroPedidos } = await supabase
      .from("pedido_itens")
      .select("cultura, quantidade, preco_unitario");

    if (erroPedidos) {
      setErro("Erro ao buscar vendas: " + erroPedidos.message);
      return;
    }

    // 🔹 TOTAL CUSTOS
    const totalCustos =
      custosData?.reduce((acc, item) => acc + Number(item.valor ?? 0), 0) ?? 0;

    // 🔥 TOTAL RECEITA
    const totalReceita =
      itensData?.reduce((acc: number, item: any) => {
        return acc + Number(item.quantidade || 0) * Number(item.preco_unitario || 0);
      }, 0) ?? 0;

    // 🔹 MAPA CUSTOS
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

    // 🔥 MAPA RECEITA
    const mapaReceita: any = {};
    itensData?.forEach((item: any) => {
      const cultura = item.cultura || "Sem cultura";
      const valor =
        Number(item.quantidade || 0) * Number(item.preco_unitario || 0);

      mapaReceita[cultura] = (mapaReceita[cultura] ?? 0) + valor;
    });

    // 🔹 LUCRO POR CULTURA
    const culturas = new Set([
      ...Object.keys(mapaReceita),
      ...Object.keys(mapaCustos),
    ]);

    const resultadoLucro = Array.from(culturas).map((cultura) => ({
      nome: cultura,
      valor:
        (mapaReceita[cultura] ?? 0) -
        (mapaCustos[cultura] ?? 0),
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
    carregarDados(); // 🔥 simplificado (sem timeout)
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

      {/* 🔥 HERO */}
      <section style={heroStyle}>
        <div>
          <p style={tagStyle}>SafraFácil Analytics</p>
          <h1 style={titleStyle}>Painel de gestão rural</h1>
          <p style={subtitleStyle}>
            Transformando dados em decisões estratégicas.
          </p>
        </div>

        <div style={heroCardStyle}>
          <p style={{ margin: 0 }}>Resultado atual</p>
          <strong style={{ fontSize: "32px", color: "#74c947" }}>
            {formatar(lucro)}
          </strong>
        </div>
      </section>

      {erro && <p style={erroStyle}>{erro}</p>}

      {/* 🔹 FILTRO */}
      <section style={filtroStyle}>
        <h2>Filtrar por período</h2>

        <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} style={inputStyle}/>
        <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} style={inputStyle}/>

        <button onClick={carregarDados} style={botaoStyle}>Filtrar</button>
        <button onClick={limparFiltro} style={botaoLimparStyle}>Limpar</button>
      </section>

      {/* 🔹 CARDS */}
      <section style={cardGrid}>
        <Card titulo="Receita" valor={receita} emoji="💰" />
        <Card titulo="Custos" valor={custos} emoji="💸" />
        <Card titulo="Lucro" valor={lucro} emoji="📈" />
      </section>

      {/* 🔹 GRÁFICOS */}
      <Grafico titulo="Receita x Custos x Lucro" dados={dadosGrafico} formatar={formatar}/>
      <Grafico titulo="Custos por Cultura" dados={dadosCultura} formatar={formatar}/>
      <Grafico titulo="Lucro por Cultura" dados={lucroCultura} formatar={formatar}/>
    </main>
  );
}

/* 🔹 COMPONENTES AUXILIARES */

function Card({ titulo, valor, emoji }: any) {
  return (
    <div style={cardStyle}>
      <span style={iconStyle}>{emoji}</span>
      <h2>{titulo}</h2>
      <p style={valorStyle}>
        {valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
      </p>
    </div>
  );
}

function Grafico({ titulo, dados, formatar }: any) {
  return (
    <section style={{ ...graficoCardStyle, marginTop: "30px" }}>
      <h2>{titulo}</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={dados}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="nome" />
          <YAxis />
          <Tooltip formatter={(value) => formatar(Number(value))} />
          <Bar dataKey="valor" />
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
}

/* 🔹 ESTILOS */

const pageStyle = {
  marginLeft: "240px",
  padding: "40px",
  background: "linear-gradient(135deg,#071f16 0%,#123524 45%,#f4f6f8 45%)",
  minHeight: "100vh",
};

const heroStyle = {
  display: "flex",
  justifyContent: "space-between",
  background: "#071f16",
  padding: "30px",
  borderRadius: "20px",
  color: "white",
};

const tagStyle = { color: "#74c947" };
const titleStyle = { fontSize: "34px", margin: "10px 0" };
const subtitleStyle = { color: "#dfffe0" };

const heroCardStyle = {
  background: "#0f2f22",
  padding: "20px",
  borderRadius: "12px",
};

const erroStyle = {
  background: "#ffe5e5",
  padding: "10px",
  borderRadius: "8px",
};

const filtroStyle = {
  background: "white",
  padding: "20px",
  borderRadius: "14px",
  marginTop: "20px",
};

const cardGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
  gap: "20px",
  marginTop: "20px",
};

const cardStyle = {
  background: "white",
  padding: "20px",
  borderRadius: "14px",
};

const iconStyle = { fontSize: "24px" };
const valorStyle = { fontSize: "24px", fontWeight: "bold" };

const graficoCardStyle = {
  background: "white",
  padding: "20px",
  borderRadius: "14px",
};

const inputStyle = { padding: "10px", margin: "5px" };
const botaoStyle = { padding: "10px", background: "#2e7d32", color: "white" };
const botaoLimparStyle = { padding: "10px", background: "#555", color: "white" };