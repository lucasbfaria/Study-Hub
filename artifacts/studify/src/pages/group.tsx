import React, { useState, useRef } from "react";
import { useRoute } from "wouter";
import { motion } from "framer-motion";
import {
  useGetGroup,
  useListGroupPosts,
  useGetGroupRanking,
  useCreatePost,
  useSendInvite,
  useGetMe,
  getListGroupPostsQueryKey,
  getGetGroupRankingQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Clock,
  Plus,
  Users,
  BookOpen,
  Send,
  Trophy,
  ImageIcon,
  X,
} from "lucide-react";

import { Layout } from "@/components/layout";
import {
  Button,
  Card,
  Input,
  Textarea,
  Avatar,
  Badge,
  Spinner,
} from "@/components/ui";
import { Modal } from "@/components/modal";
import { timeAgo, formatDate, getInitials, cn } from "@/lib/utils";

const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("image", file);
  const res = await fetch(`${API_BASE}/api/upload`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  if (!res.ok) throw new Error("Falha no upload da imagem");
  const data = await res.json();
  return `${API_BASE}${data.url}`;
}

export default function GroupPage() {
  const [, params] = useRoute("/groups/:id");
  const groupId = parseInt(params?.id || "0", 10);
  const queryClient = useQueryClient();

  const { data: me } = useGetMe();
  const { data: group, isLoading: isLoadingGroup } = useGetGroup(groupId, {
    query: { enabled: !!groupId },
  });
  const { data: posts, isLoading: isLoadingPosts } = useListGroupPosts(
    groupId,
    { query: { enabled: !!groupId } },
  );
  const { data: ranking, isLoading: isLoadingRanking } = useGetGroupRanking(
    groupId,
    { query: { enabled: !!groupId } },
  );

  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [postSubject, setPostSubject] = useState("");
  const [postHours, setPostHours] = useState("");
  const [postDesc, setPostDesc] = useState("");
  const [postImageFile, setPostImageFile] = useState<File | null>(null);
  const [postImagePreview, setPostImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");

  const createPostMut = useCreatePost();
  const sendInviteMut = useSendInvite();

  const isAdmin = group?.adminId === me?.id;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPostImageFile(file);
    setPostImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setPostImageFile(null);
    setPostImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const closePostModal = () => {
    setIsPostModalOpen(false);
    setPostSubject("");
    setPostHours("");
    setPostDesc("");
    removeImage();
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postSubject || !postHours) return;

    let imageUrl: string | null = null;
    if (postImageFile) {
      try {
        setIsUploading(true);
        imageUrl = await uploadImage(postImageFile);
      } catch {
        toast.error("Erro ao fazer upload da imagem.");
        setIsUploading(false);
        return;
      } finally {
        setIsUploading(false);
      }
    }

    createPostMut.mutate(
      {
        groupId,
        data: {
          subject: postSubject,
          hours: Number(postHours),
          description: postDesc || null,
          imageUrl,
        },
      },
      {
        onSuccess: () => {
          toast.success("Sessão de estudo registrada!");
          queryClient.invalidateQueries({
            queryKey: getListGroupPostsQueryKey(groupId),
          });
          queryClient.invalidateQueries({
            queryKey: getGetGroupRankingQueryKey(groupId),
          });
          closePostModal();
        },
        onError: (err) => toast.error(err.error?.error || "Erro ao registrar."),
      },
    );
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    sendInviteMut.mutate(
      { groupId, data: { email: inviteEmail } },
      {
        onSuccess: () => {
          toast.success("Convite enviado com sucesso!");
          setIsInviteModalOpen(false);
          setInviteEmail("");
        },
        onError: (err) =>
          toast.error(err.error?.error || "Erro ao enviar convite."),
      },
    );
  };

  if (isLoadingGroup || !group) {
    return (
      <Layout>
        <div className="flex h-full items-center justify-center">
          <Spinner />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex h-full w-full flex-col md:flex-row">
        {/* Main Feed Area */}
        <div className="flex-1 overflow-y-auto pb-24">
          {/* Group Header */}
          <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b px-6 py-6 md:px-10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-3">
                  {group.name}
                  {isAdmin && (
                    <Badge variant="secondary" className="text-xs">
                      Admin
                    </Badge>
                  )}
                </h1>
                <p className="text-muted-foreground flex items-center gap-4 mt-2 text-sm">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" /> {group.memberCount} membros
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" /> Criado{" "}
                    {formatDate(group.createdAt)}
                  </span>
                </p>
              </div>
              <div className="flex gap-3">
                {isAdmin && (
                  <Button
                    variant="outline"
                    className="hidden sm:flex"
                    onClick={() => setIsInviteModalOpen(true)}
                  >
                    <Send className="w-4 h-4 mr-2" /> Convidar
                  </Button>
                )}
                <Button onClick={() => setIsPostModalOpen(true)}>
                  <Plus className="w-5 h-5 mr-2" /> Registrar Estudo
                </Button>
              </div>
            </div>
          </div>

          <div className="p-6 md:px-10 max-w-4xl mx-auto space-y-6">
            {isLoadingPosts ? (
              <div className="py-20 text-center">
                <Spinner className="mx-auto" />
              </div>
            ) : posts?.length === 0 ? (
              <div className="py-20 text-center text-muted-foreground">
                <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p className="text-lg">Nenhum estudo registrado ainda.</p>
                <p className="text-sm mt-1">
                  Seja o primeiro a compartilhar seu progresso!
                </p>
              </div>
            ) : (
              posts?.map((post, idx) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className="p-5 flex gap-4 transition-all hover:shadow-md hover:border-primary/20">
                    <Avatar
                      initials={getInitials(post.userName)}
                      className="w-12 h-12 flex-shrink-0 text-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div>
                          <span className="font-bold text-foreground mr-2">
                            {post.userName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {timeAgo(post.createdAt)}
                          </span>
                        </div>
                        <Badge className="bg-primary/10 text-primary border-primary/20 font-bold px-3 py-1 text-sm">
                          {post.hours} {post.hours === 1 ? "hora" : "horas"}
                        </Badge>
                      </div>
                      <h3 className="text-lg font-bold font-display text-foreground mb-1">
                        {post.subject}
                      </h3>
                      {post.description && (
                        <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap mb-3">
                          {post.description}
                        </p>
                      )}
                      {post.imageUrl && (
                        <div className="mt-2 rounded-xl overflow-hidden border border-border/50 max-w-sm">
                          <img
                            src={`${API_BASE}${post.imageUrl}`}
                            alt="Prova de estudo"
                            className="w-full object-cover max-h-80"
                          />
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Right Sidebar - Ranking */}
        <aside className="w-full md:w-80 border-l bg-card/30 flex-shrink-0 flex flex-col h-full">
          <div className="p-6 border-b bg-card/50">
            <h2 className="font-display font-bold text-xl flex items-center gap-2">
              <Trophy className="w-5 h-5 text-accent" /> Ranking da Semana
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {isLoadingRanking ? (
              <Spinner className="mx-auto mt-10" />
            ) : ranking?.length === 0 ? (
              <p className="text-center text-muted-foreground mt-10 text-sm">
                Ninguém pontuou ainda essa semana.
              </p>
            ) : (
              ranking?.map((entry) => {
                const medals: Record<number, string> = {
                  1: "🥇",
                  2: "🥈",
                  3: "🥉",
                };
                const accentBorder: Record<number, string> = {
                  1: "border-l-4 border-l-amber-400",
                  2: "border-l-4 border-l-slate-400",
                  3: "border-l-4 border-l-orange-400",
                };
                const medal = medals[entry.rank];
                const accent = accentBorder[entry.rank] ?? "";

                return (
                  <div
                    key={entry.userId}
                    className={cn(
                      "p-4 rounded-xl border bg-card flex items-center gap-3 transition-transform hover:scale-[1.02]",
                      accent,
                    )}
                  >
                    <div className="font-display font-black text-xl w-8 text-center flex-shrink-0">
                      {medal ?? (
                        <span className="text-muted-foreground text-base">
                          {entry.rank}º
                        </span>
                      )}
                    </div>
                    <Avatar
                      initials={getInitials(entry.name)}
                      className="w-10 h-10 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-foreground truncate">
                        {entry.name}
                        {entry.userId === me?.id && (
                          <span className="text-primary font-normal text-xs ml-1">
                            (Você)
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-2 mt-0.5">
                        <span className="font-semibold text-foreground">
                          {entry.weeklyHours}h
                        </span>
                        <span>•</span>
                        <span>🔥 {entry.streak}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>
      </div>

      {/* Post Modal */}
      <Modal
        isOpen={isPostModalOpen}
        onClose={closePostModal}
        title="Registrar Estudo"
        description="O que você estudou hoje? Compartilhe com o grupo."
      >
        <form onSubmit={handleCreatePost} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Matéria / Assunto
            </label>
            <Input
              value={postSubject}
              onChange={(e) => setPostSubject(e.target.value)}
              placeholder="Ex: Cálculo I, Redação..."
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Horas Estudadas
            </label>
            <Input
              type="number"
              step="0.5"
              min="0.5"
              value={postHours}
              onChange={(e) => setPostHours(e.target.value)}
              placeholder="Ex: 2.5"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Descrição (opcional)
            </label>
            <Textarea
              value={postDesc}
              onChange={(e) => setPostDesc(e.target.value)}
              placeholder="Resumo do que foi estudado..."
            />
          </div>

          {/* Image upload */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Foto de prova (opcional)
            </label>
            {postImagePreview ? (
              <div className="relative rounded-xl overflow-hidden border border-border max-h-48">
                <img
                  src={postImagePreview}
                  alt="Preview"
                  className="w-full object-cover max-h-48"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-full p-1 border border-border hover:bg-destructive hover:text-destructive-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-6 text-sm text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
              >
                <ImageIcon className="w-5 h-5" />
                Clique para adicionar uma foto
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={closePostModal}>
              Cancelar
            </Button>
            <Button
              type="submit"
              isLoading={isUploading || createPostMut.isPending}
            >
              Publicar
            </Button>
          </div>
        </form>
      </Modal>

      {/* Invite Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Convidar Membro"
        description="Envie um convite para o e-mail do seu colega."
      >
        <form onSubmit={handleSendInvite} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              E-mail do colega
            </label>
            <Input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="amigo@email.com"
              required
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsInviteModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" isLoading={sendInviteMut.isPending}>
              Enviar Convite
            </Button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}
