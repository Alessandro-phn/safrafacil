"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import MenuSistema from "@/components/MenuSistema";

type Pedido = {
  id: number;
  created_at: string;
  valor_total: number;
  status: string;
  clientes: {
    nome: string;
  }[];
};

export default function ListaPedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    buscarPedidos();
  }, []);

  async function buscarPedidos() {
    setCarregando(true);

    const { data, error } = await supabase
      .from("pedidos")
      .select(`
        id,
        created_at,
        valor_total,
        status,
        clientes ( nome )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar pedidos:", error.message);
      setCarregando(false);
      return;
    }

    setPedidos(data || []);
    setCarregando(false);
  }

  function formatar(valor: number) {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  return (
    <main style={pageStyle}>
      <MenuSistema />

      <h1>Lista de Pedidos</h1>

      {carregando ? (
        <p>Carregando...</p>
      ) : (
        <table style={tabelaStyle}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Data</th>
              <th>Cliente</th>
              <th>Valor</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {pedidos.map((pedido) => (
              <tr key={pedido.id}>
                <td>{pedido.id}</td>
                <td>
                  {new Date(pedido.created_at).toLocaleDateString("pt-BR")}
                </td>
                <td>{pedido.clientes?.[0]?.nome || "Sem cliente"}</td>
                <td>{formatar(pedido.valor_total)}</td>
                <td>{pedido.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}

const pageStyle = {
  padding: "40px",
};

const tabelaStyle = {
  width: "100%",
  borderCollapse: "collapse" as const,
};
