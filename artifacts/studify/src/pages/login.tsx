import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useLogin, useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button, Input, Card } from "@/components/ui";
import { motion } from "framer-motion";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: me } = useGetMe({ query: { retry: false } });
  if (me) setLocation("/");

  const loginMut = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMut.mutate({ data: { email, password } }, {
      onSuccess: () => {
        toast.success("Login realizado com sucesso!");
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        setLocation("/");
      },
      onError: (err) => {
        toast.error(err.error?.error || "E-mail ou senha inválidos.");
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      <img src={`${import.meta.env.BASE_URL}images/auth-bg.png`} alt="Background" className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none" />
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md z-10 px-4">
        <div className="flex flex-col items-center mb-8">
          <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="Studify" className="h-16 w-16 mb-4 rounded-2xl shadow-xl shadow-primary/20" />
          <h1 className="font-display text-4xl font-bold text-foreground">Bem-vindo de volta</h1>
          <p className="text-muted-foreground mt-2">Entre para continuar seus estudos</p>
        </div>

        <Card className="p-8 shadow-2xl backdrop-blur-xl bg-card/90">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-foreground/80">E-mail</label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" required />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5 text-foreground/80">Senha</label>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            <Button type="submit" className="w-full mt-2" size="lg" isLoading={loginMut.isPending}>
              Entrar
            </Button>
          </form>
          
          <div className="mt-8 text-center text-sm text-muted-foreground">
            Ainda não tem uma conta?{" "}
            <Link href="/register" className="font-semibold text-primary hover:underline">Registre-se agora</Link>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
