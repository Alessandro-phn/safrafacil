"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Pedido = {
  id: number;
  created_at: string;
  valor_total: number | null;
  status: string | null;
  clientes: {
    nome: string;
  } | null;
};

export default function ListaPedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarPedidos();
  }, []);

  async function carregarPedidos() {
    const { data, error } = await supabase
      .from("pedidos")
      .select(`
        id,
        created_at,
        valor_total,
        status,
        clientes (nome)
      `)
      .order("id", { ascending: false });

    if (error) {
      alert("Erro ao carregar pedidos: " + error.message);
      return;
    }

    setPedidos(data || []);
    setCarregando(false);
  }

  async function atualizarStatus(id: number, novoStatus: string) {
    const { error } = await supabase
      .from("pedidos")
      .update({ status: novoStatus })
      .eq("id", id);

    if (error) {
      alert("Erro ao atualizar status: " + error.message);
      return;
    }

    carregarPedidos();
  }

  async function excluirPedido(id: number) {
    const confirmar = confirm("Deseja excluir este pedido?");
    if (!confirmar) return;

    const { error } = await supabase
      .from("pedidos")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Erro ao excluir pedido: " + error.message);
      return;
    }

    carregarPedidos();
  }

  return (
    <main style={{ maxWidth: "1000px", margin: "40px auto", padding: "20px" }}>
      <a href="/pedidos" style={{ marginBottom: "20px", display: "inline-block" }}>
        ← Voltar
      </a>

      <h1>Lista de pedidos</h1>

      {carregando ? (
        <p>Carregando...</p>
      ) : pedidos.length === 0 ? (
        <p>Nenhum pedido encontrado</p>
      ) : (
        pedidos.map((pedido) => (
          <div key={pedido.id} style={cardStyle}>
            <h2>Pedido #{pedido.id}</h2>

            <p><strong>Cliente:</strong> {pedido.clientes?.nome}</p>
            <p><strong>Total:</strong> R$ {pedido.valor_total?.toFixed(2)}</p>

            <p>
              <strong>Status:</strong>{" "}
              <select
                value={pedido.status || "aberto"}
                onChange={(e) => atualizarStatus(pedido.id, e.target.value)}
              >
                <option value="aberto">Aberto</option>
                <option value="fechado">Fechado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </p>

            <button onClick={() => excluirPedido(pedido.id)} style={deleteButtonStyle}>
              Excluir
            </button>
          </div>
        ))
      )}
    </main>
  );
}

const cardStyle = {
  border: "1px solid #ddd",
  padding: "15px",
  borderRadius: "10px",
  marginBottom: "10px",
};

const deleteButtonStyle = {
  padding: "8px 12px",
  borderRadius: "6px",
  border: "none",
  background: "#b91c1c",
  color: "white",
  cursor: "pointer",
};