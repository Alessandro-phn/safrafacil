"use client";

import { useEffect, useState } from "react";
import MenuSistema from "@/components/MenuSistema";
import { supabase } from "@/lib/supabase";

type PedidoItem = {
  quantidade: number | null;
  preco_unitario: number | null;
  cultura: string | null;
  produtos: {
    nome: string | null;
  } | null;
};

type Pedido = {
  id: number;
  valor_total: number | null;
  data: string | null;
  status: string | null;
  clientes: {
    nome: string | null;
  } | null;
  pedido_itens: PedidoItem[];
};

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [produtos, setProdutos] = useState<any[]>([]);

  const [clienteId, setClienteId] = useState("");
  const [produtoId, setProdutoId] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [data, setData] = useState("");
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    await Promise.all([carregarClientes(), carregarProdutos(), carregarPedidos()]);
  }

  async function carregarClientes() {
    const { data, error } = await supabase
      .from("clientes")
      .select("id, nome")
      .order("nome", { ascending: true });

    if (error) {
      setMensagem("Erro ao carregar clientes: " + error.message);
      return;
    }

    setClientes(data || []);
  }

  async function carregarProdutos() {
    const { data, error } = await supabase
      .from("produtos")
      .select("id, nome, preco_padrao, cultura")
      .order("nome", { ascending: true });

    if (error) {
      setMensagem("Erro ao carregar produtos: " + error.message);
      return;
    }

    setProdutos(data || []);
  }

  async function carregarPedidos() {
    const { data, error } = await supabase
      .from("pedidos")
      .select(`
        id,
        valor_total,
        data,
        status,
        clientes (
          nome
        ),
        pedido_itens (
          quantidade,
          preco_unitario,
          cultura,
          produtos (
            nome
          )
        )
      `)
      .order("id", { ascending: false });

    if (error) {
      setMensagem("Erro ao carregar pedidos: " + error.message);
      return;
    }

    setPedidos((data as Pedido[]) || []);
  }

  async function salvarPedido(e: any) {
    e.preventDefault();
    setMensagem("");

    const quantidadeNumero = quantidade
      ? Number(quantidade.replace(",", "."))
      : 0;

    if (!clienteId || !produtoId || quantidadeNumero <= 0) {
      setMensagem("Selecione cliente, produto e informe a quantidade.");
      return;
    }

    const produtoSelecionado = produtos.find(
      (produto) => String(produto.id) === String(produtoId)
    );

    if (!produtoSelecionado) {
      setMensagem("Produto não encontrado.");
      return;
    }

    const precoUnitario = Number(produtoSelecionado.preco_padrao || 0);
    const culturaProduto = produtoSelecionado.cultura || "Sem cultura";
    const valorTotal = quantidadeNumero * precoUnitario;

    const { data: pedidoCriado, error: erroPedido } = await supabase
      .from("pedidos")
      .insert([
        {
          cliente_id: Number(clienteId),
          valor_total: valorTotal,
          status: "Recebido",
          data: data || new Date().toISOString().slice(0, 10),
        },
      ])
      .select("id")
      .single();

    if (erroPedido) {
      setMensagem("Erro ao criar pedido: " + erroPedido.message);
      return;
    }

    const { error: erroItem } = await supabase.from("pedido_itens").insert([
      {
        pedido_id: pedidoCriado.id,
        produto_id: Number(produtoId),
        quantidade: quantidadeNumero,
        preco_unitario: precoUnitario,
        cultura: culturaProduto,
      },
    ]);

    if (erroItem) {
      setMensagem("Erro ao criar item do pedido: " + erroItem.message);
      return;
    }

    setMensagem("Pedido cadastrado com sucesso!");
    setClienteId("");
    setProdutoId("");
    setQuantidade("");
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

  function formatarMoeda(valor: number | null | undefined) {
    if (valor === null || valor === undefined) return "-";

    return Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  function formatarData(valor: string | null) {
    if (!valor) return "-";

    return new Date(valor + "T00:00:00").toLocaleDateString("pt-BR");
  }

  return (
    <main style={pageStyle}>
      <MenuSistema />

      <section style={cardStyle}>
        <h1>Pedidos</h1>

        <form onSubmit={salvarPedido}>
          <select
            style={inputStyle}
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
          >
            <option value="">Selecione o cliente</option>
            {clientes.map((cliente) => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nome}
              </option>
            ))}
          </select>

          <select
            style={inputStyle}
            value={produtoId}
            onChange={(e) => setProdutoId(e.target.value)}
          >
            <option value="">Selecione o produto</option>
            {produtos.map((produto) => (
              <option key={produto.id} value={produto.id}>
                {produto.nome} - {formatarMoeda(produto.preco_padrao)}
              </option>
            ))}
          </select>

          <input
            style={inputStyle}
            placeholder="Quantidade"
            value={quantidade}
            onChange={(e) => setQuantidade(e.target.value)}
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
              <p>
                <strong>Cliente:</strong> {pedido.clientes?.nome || "-"}
              </p>

              <p>
                <strong>Status:</strong> {pedido.status || "-"}
              </p>

              <p>
                <strong>Data:</strong> {formatarData(pedido.data)}
              </p>

              <p>
                <strong>Valor total:</strong>{" "}
                {formatarMoeda(pedido.valor_total)}
              </p>

              <div style={{ marginTop: "12px" }}>
                <strong>Itens:</strong>

                {pedido.pedido_itens?.length > 0 ? (
                  pedido.pedido_itens.map((item, index) => (
                    <div key={index} style={subItemStyle}>
                      <p>
                        <strong>Produto:</strong>{" "}
                        {item.produtos?.nome || "-"}
                      </p>

                      <p>
                        <strong>Cultura:</strong> {item.cultura || "-"}
                      </p>

                      <p>
                        <strong>Quantidade:</strong>{" "}
                        {item.quantidade ?? "-"}
                      </p>

                      <p>
                        <strong>Preço unitário:</strong>{" "}
                        {formatarMoeda(item.preco_unitario)}
                      </p>

                      <p>
                        <strong>Subtotal:</strong>{" "}
                        {formatarMoeda(
                          Number(item.quantidade || 0) *
                            Number(item.preco_unitario || 0)
                        )}
                      </p>
                    </div>
                  ))
                ) : (
                  <p>Nenhum item encontrado.</p>
                )}
              </div>

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
  marginTop: "12px",
};

const itemStyle = {
  border: "1px solid #ddd",
  borderRadius: "10px",
  padding: "16px",
  marginTop: "12px",
};

const subItemStyle = {
  backgroundColor: "#f7f7f7",
  padding: "10px",
  borderRadius: "8px",
  marginTop: "8px",
};