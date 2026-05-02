"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mensagem, setMensagem] = useState("");

  async function cadastrar() {
    const { error } = await supabase.auth.signUp({
      email,
      password: senha,
    });

    if (error) {
      setMensagem("Erro ao cadastrar: " + error.message);
      return;
    }

    setMensagem("Cadastro realizado. Agora faça login.");
  }

  async function entrar() {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error) {
      setMensagem("Erro ao entrar: " + error.message);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <main style={pageStyle}>
      <section style={cardStyle}>
        <h1>Entrar no SafraFácil</h1>

        <input
          style={inputStyle}
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          style={inputStyle}
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
        />

        <button style={buttonStyle} onClick={entrar}>
          Entrar
        </button>

        <button style={secondaryButtonStyle} onClick={cadastrar}>
          Criar conta
        </button>

        {mensagem && <p>{mensagem}</p>}
      </section>
    </main>
  );
}

const pageStyle = {
  minHeight: "100vh",
  backgroundColor: "#f4f6f8",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "Arial",
};

const cardStyle = {
  width: "100%",
  maxWidth: "420px",
  backgroundColor: "white",
  padding: "28px",
  borderRadius: "14px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
};

const inputStyle = {
  display: "block",
  width: "100%",
  padding: "12px",
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
  marginBottom: "10px",
};

const secondaryButtonStyle = {
  ...buttonStyle,
  backgroundColor: "#555",
};