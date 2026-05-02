"use client";

import { useEffect, useState } from "react";
import MenuSistema from "@/components/MenuSistema";
import { supabase } from "@/lib/supabase";

type Cliente = {
  id: number;
  nome: string;
  telefone: string | null;
  cidade: string | null;
  documento: string | null;
};

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cidade, setCidade] = useState("");
  const [documento, setDocumento] = useState("");
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    carregarClientes();
  }, []);

  async function carregarClientes() {
    const { data, error } = await supabase
      .from("clientes")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      alert("Erro ao carregar clientes: " + error.message);
      return;
    }

    setClientes(data || []);
  }

  function limparFormulario() {
    setNome("");
    setTelefone("");
    setCidade("");
    setDocumento("");
    setEditandoId(null);
  }

  async function salvarCliente() {
    if (!nome.trim()) {
      alert("Digite o nome do cliente.");
      return;
    }

    setCarregando(true);

    const cliente = { nome, telefone, cidade, documento };

    if (editandoId) {
      const { error } = await supabase
        .from("clientes")
        .update(cliente)
        .eq("id", editandoId);

      if (error) {
        alert("Erro ao atualizar cliente: " + error.message);
        setCarregando(false);
        return;
      }
    } else {
      const { error } = await supabase.from("clientes").insert(cliente);

      if (error) {
        alert("Erro ao cadastrar cliente: " + error.message);
        setCarregando(false);
        return;
      }
    }

    limparFormulario();
    await carregarClientes();
    setCarregando(false);
  }

  function editarCliente(cliente: Cliente) {
    setEditandoId(cliente.id);
    setNome(cliente.nome);
    setTelefone(cliente.telefone || "");
    setCidade(cliente.cidade || "");
    setDocumento(cliente.documento || "");
  }

  async function excluirCliente(id: number) {
    const confirmar = confirm("Deseja excluir este cliente?");
    if (!confirmar) return;

    const { error } = await supabase.from("clientes").delete().eq("id", id);

    if (error) {
      alert("Erro ao excluir cliente: " + error.message);
      return;
    }

    await carregarClientes();
  }

  return (
    <main style={pageStyle}>
      <MenuSistema />

      <section style={cardStyle}>
        <h1>Clientes</h1>
        <p style={{ color: "#555" }}>Cadastro de clientes compradores.</p>

        <h2>{editandoId ? "Editar cliente" : "Cadastrar cliente"}</h2>

        <input
          placeholder="Nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          style={inputStyle}
        />

        <input
          placeholder="Telefone"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          style={inputStyle}
        />

        <input
          placeholder="Cidade"
          value={cidade}
          onChange={(e) => setCidade(e.target.value)}
          style={inputStyle}
        />

        <input
          placeholder="CPF/CNPJ"
          value={documento}
          onChange={(e) => setDocumento(e.target.value)}
          style={inputStyle}
        />

        <button onClick={salvarCliente} style={buttonStyle} disabled={carregando}>
          {carregando ? "Salvando..." : editandoId ? "Atualizar" : "Cadastrar"}
        </button>

        <button onClick={limparFormulario} style={secondaryButtonStyle}>
          Limpar
        </button>
      </section>

      <section style={{ ...cardStyle, marginTop: "30px" }}>
        <h2>Clientes cadastrados</h2>

        {clientes.length === 0 ? (
          <p>Nenhum cliente cadastrado.</p>
        ) : (
          clientes.map((cliente) => (
            <div key={cliente.id} style={itemStyle}>
              <h3>{cliente.nome}</h3>
              <p><strong>Telefone:</strong> {cliente.telefone || "-"}</p>
              <p><strong>Cidade:</strong> {cliente.cidade || "-"}</p>
              <p><strong>Documento:</strong> {cliente.documento || "-"}</p>

              <button onClick={() => editarCliente(cliente)} style={buttonStyle}>
                Editar
              </button>

              <button onClick={() => excluirCliente(cliente.id)} style={deleteButtonStyle}>
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
  marginBottom: "10px",
  borderRadius: "6px",
  border: "1px solid #ccc",
};

const buttonStyle = {
  padding: "10px 15px",
  marginRight: "10px",
  borderRadius: "6px",
  border: "none",
  background: "#2563eb",
  color: "white",
  cursor: "pointer",
};

const secondaryButtonStyle = {
  padding: "10px 15px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  background: "#f5f5f5",
  cursor: "pointer",
};

const deleteButtonStyle = {
  padding: "10px 15px",
  borderRadius: "6px",
  border: "none",
  background: "#b91c1c",
  color: "white",
  cursor: "pointer",
};

const itemStyle = {
  border: "1px solid #ddd",
  padding: "15px",
  borderRadius: "10px",
  marginTop: "12px",
};