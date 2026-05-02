"use client";

import { useEffect, useState } from "react";
import MenuSistema from "@/components/MenuSistema";
import { supabase } from "@/lib/supabase";

type Pedido = {
  id: number;
  cliente: string | null;
  produto: string | null;
  cultura: string | null;
  quantidade: number | null;
  valor_total: number | null;
  data: string | null;
};

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [cliente, setCliente] = useState("");
  const [produto, setProduto] = useState("");
  const [cultura, setCultura] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [valorTotal, setValorTotal] = useState("");
  const [data, setData] = useState("");
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    carregarPedidos();
  }, []);

  async function carregarPedidos() {
    const { data, error } = await supabase
      .from("pedidos")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      setMensagem("Erro ao carregar pedidos: " + error.message);
      return;
    }

    setPedidos(data || []);
  }

  async function salvarPedido(e: any) {
    e.preventDefault();

    const quantidadeNumero = quantidade
      ? Number(quantidade.replace(",", "."))
      : null;

    const valorNumero = valorTotal
      ? Number(valorTotal.replace(",", "."))
      : null;

    if (!cliente || !produto || !valorNumero) {
      setMensagem("Preencha cliente, produto e valor total.");
      return;
    }

    const { error } = await supabase.from("pedidos").insert([
      {
        cliente,
        produto,
        cultura,
        quantidade: quantidadeNumero,
        valor_total: valorNumero,
        data: data || new Date().toISOString().slice(0, 10),
      },
    ]);

    if (error) {
      setMensagem("Erro ao salvar pedido: " + error.message);
      return;
    }

    setMensagem("Pedido cadastrado com sucesso!");
    setCliente("");
    setProduto("");
    setCultura("");
    setQuantidade("");
    setValorTotal("");
    setData("");
    carregarPedidos();
  }

  async function excluirPedido(id: number) {
    const confirmar = confirm("Deseja excluir este pedido?");
    if (!confirmar) return;

    const { error } = await supabase.from("pedidos").delete().eq("id", id);

    if (error) {
      setMensagem("Erro ao excluir pedido: " + error.message);
      return;
    }

    setMensagem("Pedido excluído com sucesso!");
    carregarPedidos();
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
        <h1>Pedidos</h1>

        <form onSubmit={salvarPedido}>
          <input
            style={inputStyle}
            placeholder="Cliente"
            value={cliente}
            onChange={(e) => setCliente(e.target.value)}
          />

          <input
            style={inputStyle}
            placeholder="Produto"
            value={produto}
            onChange={(e) => setProduto(e.target.value)}
          />

          <input
            style={inputStyle}
            placeholder="Cultura (Soja, Milho...)"
            value={cultura}
            onChange={(e) => setCultura(e.target.value)}
          />

          <input
            style={inputStyle}
            placeholder="Quantidade"
            value={quantidade}
            onChange={(e) => setQuantidade(e.target.value)}
          />

          <input
            style={inputStyle}
            placeholder="Valor total (ex: 2500,00)"
            value={valorTotal}
            onChange={(e) => setValorTotal(e.target.value)}
          />

          <input
            style={inputStyle}
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
          />

          <button style={buttonStyle}>Salvar Pedido</button>
        </form>

        {mensagem && <p style={{ marginTop: "20px" }}>{mensagem}</p>}
      </section>

      <section style={{ ...cardStyle, marginTop: "30px" }}>
        <h2>Pedidos cadastrados</h2>

        {pedidos.length === 0 ? (
          <p>Nenhum pedido cadastrado.</p>
        ) : (
          pedidos.map((pedido) => (
            <div key={pedido.id} style={itemStyle}>
              <p><strong>Cliente:</strong> {pedido.cliente || "-"}</p>
              <p><strong>Produto:</strong> {pedido.produto || "-"}</p>
              <p><strong>Cultura:</strong> {pedido.cultura || "-"}</p>
              <p><strong>Quantidade:</strong> {pedido.quantidade || "-"}</p>
              <p><strong>Valor total:</strong> {formatarMoeda(pedido.valor_total)}</p>
              <p><strong>Data:</strong> {pedido.data || "-"}</p>

              <button
                onClick={() => excluirPedido(pedido.id)}
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
  padding: "40px",
  fontFamily: "Arial",
  backgroundColor: "#f4f6f8",
  minHeight: "100vh",
};

const cardStyle = {
  backgroundColor: "white",
  padding: "24px",
  borderRadius: "14px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
};

const inputStyle = {
  display: "block",
  width: "100%",
  padding: "10px",
  marginBottom: "12px",
};

const buttonStyle = {
  width: "100%",
  padding: "12px",
  backgroundColor: "#1976d2",
  color: "white",
  border: "none",
  borderRadius: "8px",
  fontWeight: "bold",
  cursor: "pointer",
};

const deleteButtonStyle = {
  padding: "8px 12px",
  backgroundColor: "#c62828",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

const itemStyle = {
  border: "1px solid #ddd",
  borderRadius: "10px",
  padding: "16px",
  marginTop: "12px",
};