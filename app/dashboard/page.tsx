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
  Cell,
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

    const { data: itensData, error: erroPedidos } = await supabase
      .from("pedido_itens")
      .select("cultura, quantidade, preco_unitario");

    if (erroPedidos) {
      setErro("Erro ao buscar vendas: " + erroPedidos.message);
      return;
    }

    const totalCustos =
      custosData?.reduce((acc, item) => acc + Number(item.valor ?? 0), 0) ?? 0;

    const totalReceita =
      itensData?.reduce((acc: number, item: any) => {
        return acc + Number(item.quantidade || 0) * Number(item.preco_unitario || 0);
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
    itensData?.forEach((item: any) => {
      const cultura = item.cultura || "Sem cultura";
      const valor =
        Number(item.quantidade || 0) * Number(item.preco_unitario || 0);

      mapaReceita[cultura] = (mapaReceita[cultura] ?? 0) + valor;
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
    carregarDados();
  }

  function formatar(valor: number) {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  const dadosGrafico = [
    { nome: "Receita", valor: receita, cor: "#2e7d32" },
    { nome: "Custos", valor: custos, cor: "#c62828" },
    { nome: "Lucro", valor: lucro, cor: "#1565c0" },
  ];

  return (
    <main style={pageStyle}>
      <MenuSistema />

      <section style={heroStyle}>
        <div>
          <p style={tagStyle}>SafraFácil Analytics</p>
          <h1 style={titleStyle}>Painel de gestão rural</h1>
          <p style={subtitleStyle}>
            Transformando dados de vendas, custos e culturas em decisões mais claras.
          </p>
        </div>

        <div style={heroCardStyle}>
          <p style={{ margin: 0, color: "#dfffe0" }}>Resultado atual</p>
          <strong style={{ fontSize: "34px", color: lucro >= 0 ? "#74c947" : "#ff7043" }}>
            {formatar(lucro)}
          </strong>
        </div>
      </section>

      {erro && <p style={erroStyle}>{erro}</p>}

      <section style={filtroStyle}>
        <h2 style={sectionTitleStyle}>Filtrar por período</h2>

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
        <Card titulo="Receita" valor={receita} emoji="💰" cor="#2e7d32" />
        <Card titulo="Custos" valor={custos} emoji="💸" cor="#c62828" />
        <Card titulo="Lucro" valor={lucro} emoji="📈" cor="#1565c0" />
      </section>

      <GraficoPrincipal
        titulo="Receita x Custos x Lucro"
        dados={dadosGrafico}
        formatar={formatar}
      />

      <Grafico
        titulo="Custos por Cultura"
        dados={dadosCultura}
        formatar={formatar}
        corPadrao="#ef6c00"
      />

      <Grafico
        titulo="Lucro por Cultura"
        dados={lucroCultura}
        formatar={formatar}
        corPadrao="#2e7d32"
      />
    </main>
  );
}

function Card({ titulo, valor, emoji, cor }: any) {
  return (
    <div
      style={{
        ...cardStyle,
        borderLeft: `7px solid ${cor}`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <span style={{ ...iconStyle, backgroundColor: `${cor}18`, color: cor }}>
        {emoji}
      </span>

      <h2 style={{ marginBottom: "8px", color: "#123524" }}>{titulo}</h2>

      <p style={{ ...valorStyle, color: cor }}>
        {valor.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })}
      </p>
    </div>
  );
}

function GraficoPrincipal({ titulo, dados, formatar }: any) {
  return (
    <section style={{ ...graficoCardStyle, marginTop: "30px" }}>
      <h2 style={sectionTitleStyle}>{titulo}</h2>

      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={dados}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="nome" />
          <YAxis />
          <Tooltip formatter={(value) => formatar(Number(value))} />
          <Bar dataKey="valor" radius={[10, 10, 0, 0]}>
            {dados.map((entry: any, index: number) => (
              <Cell key={`cell-${index}`} fill={entry.cor} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
}

function Grafico({ titulo, dados, formatar, corPadrao }: any) {
  return (
    <section style={{ ...graficoCardStyle, marginTop: "30px" }}>
      <h2 style={sectionTitleStyle}>{titulo}</h2>

      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={dados}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="nome" />
          <YAxis />
          <Tooltip formatter={(value) => formatar(Number(value))} />
          <Bar dataKey="valor" fill={corPadrao} radius={[10, 10, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
}

const pageStyle = {
  marginLeft: "240px",
  padding: "40px",
  fontFamily: "Arial",
  background:
    "linear-gradient(135deg, #071f16 0%, #123524 38%, #f4f6f8 38%, #f4f6f8 100%)",
  minHeight: "100vh",
};

const heroStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "24px",
  alignItems: "center",
  background:
    "linear-gradient(135deg, rgba(7,31,22,0.98), rgba(18,53,36,0.96))",
  padding: "34px",
  borderRadius: "28px",
  color: "white",
  boxShadow: "0 18px 42px rgba(0,0,0,0.28)",
  border: "1px solid rgba(116,201,71,0.25)",
};

const tagStyle = {
  color: "#74c947",
  fontWeight: "bold",
  margin: "0 0 10px 0",
  letterSpacing: "0.5px",
};

const titleStyle = {
  fontSize: "40px",
  margin: "0 0 12px 0",
};

const subtitleStyle = {
  color: "#dfffe0",
  fontSize: "17px",
  margin: 0,
  maxWidth: "680px",
  lineHeight: 1.5,
};

const heroCardStyle = {
  minWidth: "240px",
  background: "rgba(255,255,255,0.08)",
  padding: "24px",
  borderRadius: "20px",
  border: "1px solid rgba(116,201,71,0.35)",
  boxShadow: "0 10px 24px rgba(0,0,0,0.2)",
};

const erroStyle = {
  background: "#ffe5e5",
  color: "#b71c1c",
  padding: "12px 16px",
  borderRadius: "12px",
  marginTop: "20px",
  fontWeight: "bold",
};

const filtroStyle = {
  background: "rgba(255,255,255,0.97)",
  padding: "24px",
  borderRadius: "22px",
  marginTop: "24px",
  boxShadow: "0 10px 28px rgba(0,0,0,0.14)",
  border: "1px solid rgba(116,201,71,0.22)",
};

const sectionTitleStyle = {
  marginTop: 0,
  color: "#123524",
};

const cardGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "20px",
  marginTop: "24px",
};

const cardStyle = {
  background: "linear-gradient(145deg, #ffffff, #f0f3f5)",
  padding: "26px",
  borderRadius: "22px",
  boxShadow: "0 10px 28px rgba(0,0,0,0.14)",
  border: "1px solid rgba(116,201,71,0.25)",
  transition: "all 0.2s ease",
};

const iconStyle = {
  display: "inline-flex",
  width: "48px",
  height: "48px",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "16px",
  fontSize: "25px",
};

const valorStyle = {
  fontSize: "30px",
  fontWeight: "bold",
  marginTop: "10px",
  marginBottom: 0,
};

const graficoCardStyle = {
  background: "rgba(255,255,255,0.98)",
  padding: "28px",
  borderRadius: "24px",
  boxShadow: "0 10px 28px rgba(0,0,0,0.14)",
  border: "1px solid rgba(116,201,71,0.25)",
};

const inputStyle = {
  padding: "12px",
  marginRight: "10px",
  marginTop: "10px",
  borderRadius: "10px",
  border: "1px solid #cfd8dc",
};

const botaoStyle = {
  padding: "12px 18px",
  background: "#2e7d32",
  color: "white",
  border: "none",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "bold",
  marginRight: "10px",
};

const botaoLimparStyle = {
  padding: "12px 18px",
  background: "#455a64",
  color: "white",
  border: "none",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "bold",
};