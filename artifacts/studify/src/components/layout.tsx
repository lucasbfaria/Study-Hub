import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useGetMe, useListGroups, useLogout, getGetMeQueryKey, getListGroupsQueryKey, useCreateGroup } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { BookOpen, Mail, LogOut, Menu, X, Plus, Hash } from "lucide-react";
import { Button, Avatar, Spinner, Input } from "./ui";
import { Modal } from "./modal";
import { toast } from "sonner";
import { getInitials } from "@/lib/utils";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const redirectedRef = useRef(false);

  const { data: me, isLoading: isLoadingMe, isFetching, isError } = useGetMe({ query: { retry: false } });
  const { data: groups } = useListGroups({ query: { enabled: !!me } });

  const logoutMut = useLogout();
  const createGroupMut = useCreateGroup();

  useEffect(() => {
    if (!isLoadingMe && !isFetching && (isError || !me) && !redirectedRef.current) {
      redirectedRef.current = true;
      setLocation("/login");
    }
    if (me) {
      redirectedRef.current = false;
    }
  }, [isLoadingMe, isFetching, isError, me]);

  if (isLoadingMe || isFetching || isError || !me) {
    return <div className="flex h-screen items-center justify-center"><Spinner /></div>;
  }

  const handleLogout = () => {
    logoutMut.mutate(undefined, {
      onSuccess: () => {
        setLocation("/login");
        queryClient.setQueryData(getGetMeQueryKey(), undefined);
        queryClient.removeQueries({ queryKey: getGetMeQueryKey() });
      }
    });
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    createGroupMut.mutate({ data: { name: newGroupName } }, {
      onSuccess: (newGroup) => {
        toast.success("Grupo criado com sucesso!");
        queryClient.invalidateQueries({ queryKey: getListGroupsQueryKey() });
        setIsCreateGroupOpen(false);
        setNewGroupName("");
        setLocation(`/groups/${newGroup.id}`);
      },
      onError: () => toast.error("Erro ao criar grupo")
    });
  };

  const NavLinks = () => (
    <div className="flex flex-col gap-1">
      <div className="px-3 py-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">Menu</div>
      <Link
        href="/dashboard"
        onClick={() => setIsMobileMenuOpen(false)}
        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${location === "/dashboard" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
      >
        <BookOpen className="h-5 w-5" />
        Dashboard
      </Link>
      <Link
        href="/invites"
        onClick={() => setIsMobileMenuOpen(false)}
        className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${location === "/invites" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
      >
        <Mail className="h-5 w-5" />
        Convites
      </Link>

      <div className="mt-6 px-3 py-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase flex justify-between items-center">
        Seus Grupos
        <button onClick={() => setIsCreateGroupOpen(true)} className="text-primary hover:text-primary/80 transition-colors">
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {groups?.length === 0 && (
        <div className="px-3 py-4 text-center text-sm text-muted-foreground">
          Nenhum grupo ainda.
        </div>
      )}

      {groups?.map(group => (
        <Link
          key={group.id}
          href={`/groups/${group.id}`}
          onClick={() => setIsMobileMenuOpen(false)}
          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${location === `/groups/${group.id}` ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
        >
          <Hash className="h-4 w-4" />
          <span className="truncate">{group.name}</span>
        </Link>
      ))}
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-72 flex-col border-r border-border/50 bg-card/50 backdrop-blur-xl">
        <div className="flex h-20 items-center px-6">
          <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="Studify" className="h-10 w-10 rounded-xl" />
            <span className="font-display text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Studify</span>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          <NavLinks />
        </div>

        <div className="border-t border-border/50 p-4">
          <Link href="/profile" className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-muted">
            <Avatar initials={getInitials(me.name)} />
            <div className="flex flex-col flex-1 overflow-hidden">
              <span className="truncate text-sm font-bold">{me.name}</span>
              <span className="flex items-center text-xs text-muted-foreground">
                🔥 {me.streak} dias
              </span>
            </div>
          </Link>
          <Button variant="ghost" className="w-full mt-2 justify-start text-muted-foreground" onClick={handleLogout}>
            <LogOut className="mr-3 h-5 w-5" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Mobile Topbar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 border-b border-border/50 bg-card/80 backdrop-blur-xl z-30 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="Studify" className="h-8 w-8 rounded-lg" />
          <span className="font-display text-xl font-bold text-foreground">Studify</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-foreground">
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed inset-0 top-16 z-20 bg-background overflow-y-auto flex flex-col"
          >
            <div className="flex-1 p-4">
              <NavLinks />
            </div>
            <div className="p-4 border-t border-border/50 bg-card/50">
              <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 rounded-xl p-3 bg-muted/50">
                <Avatar initials={getInitials(me.name)} />
                <div className="flex flex-col">
                  <span className="font-bold">{me.name}</span>
                  <span className="text-sm text-muted-foreground">Ver perfil</span>
                </div>
              </Link>
              <Button variant="outline" className="w-full mt-4" onClick={handleLogout}>
                Sair da conta
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden pt-16 md:pt-0">
        <div className="flex-1 overflow-y-auto relative bg-background/50">
          {children}
        </div>
      </main>

      {/* Create Group Modal */}
      <Modal isOpen={isCreateGroupOpen} onClose={() => setIsCreateGroupOpen(false)} title="Criar Novo Grupo" description="Crie um grupo fechado e convide seus amigos para estudarem juntos.">
        <form onSubmit={handleCreateGroup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome do Grupo</label>
            <Input
              value={newGroupName}
              onChange={e => setNewGroupName(e.target.value)}
              placeholder="Ex: Estudos para o ENEM"
              autoFocus
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsCreateGroupOpen(false)}>Cancelar</Button>
            <Button type="submit" isLoading={createGroupMut.isPending}>Criar Grupo</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
