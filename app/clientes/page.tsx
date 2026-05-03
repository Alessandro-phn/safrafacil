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
  padding: "12px 18px",
  marginRight: "10px",
  borderRadius: "10px",
  border: "none",
  background: "#2e7d32",
  color: "white",
  cursor: "pointer",
  fontWeight: "bold",
};

const secondaryButtonStyle = {
  padding: "12px 18px",
  borderRadius: "10px",
  border: "1px solid #ccc",
  background: "#f5f5f5",
  cursor: "pointer",
  fontWeight: "bold",
};

const deleteButtonStyle = {
  padding: "10px 14px",
  borderRadius: "10px",
  border: "none",
  background: "#c62828",
  color: "white",
  cursor: "pointer",
  marginTop: "10px",
  fontWeight: "bold",
};

const itemStyle = {
  border: "1px solid rgba(116,201,71,0.25)",
  padding: "18px",
  borderRadius: "18px",
  marginTop: "14px",
  backgroundColor: "#ffffff",
  boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
};