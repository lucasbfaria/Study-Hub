import { useGetMe, useGetUserProfile } from "@workspace/api-client-react";
import { Layout } from "@/components/layout";
import { Avatar, Card, Spinner } from "@/components/ui";
import { Flame, Clock, Hash, Calendar } from "lucide-react";
import { getInitials, formatDate } from "@/lib/utils";
import { motion } from "framer-motion";

export default function Profile() {
  const { data: me } = useGetMe();
  const { data: profile, isLoading } = useGetUserProfile(me?.id || 0, { query: { enabled: !!me?.id } });

  if (isLoading || !profile) {
    return <Layout><div className="flex h-full items-center justify-center"><Spinner /></div></Layout>;
  }

  const stats = [
    { label: "Ofensiva Atual", value: `${profile.streak} dias`, icon: Flame, color: "text-orange-500", bg: "bg-orange-500/10" },
    { label: "Horas Totais", value: `${profile.totalHours}h`, icon: Clock, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Grupos Ativos", value: profile.groups.length, icon: Hash, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "Membro desde", value: formatDate(profile.createdAt).split(' às')[0], icon: Calendar, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  ];

  return (
    <Layout>
      <div className="p-6 md:p-12 max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12">
            <Avatar initials={getInitials(profile.name)} className="w-32 h-32 text-4xl shadow-xl shadow-primary/20" />
            <div className="text-center md:text-left mt-2">
              <h1 className="font-display text-4xl font-bold text-foreground mb-2">{profile.name}</h1>
              <p className="text-lg text-muted-foreground">{profile.email}</p>
              <div className="mt-4 inline-flex items-center gap-2 bg-muted px-4 py-2 rounded-full text-sm font-semibold">
                <Flame className="w-5 h-5 text-orange-500" />
                {profile.streak} dias em chamas! Continue assim!
              </div>
            </div>
          </div>

          <h2 className="font-display text-2xl font-bold mb-6">Estatísticas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {stats.map((stat, i) => (
              <Card key={i} className="p-6 flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
                  <stat.icon className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold font-display">{stat.value}</p>
                </div>
              </Card>
            ))}
          </div>

          <h2 className="font-display text-2xl font-bold mb-6">Meus Grupos</h2>
          {profile.groups.length === 0 ? (
            <p className="text-muted-foreground">Você ainda não participa de nenhum grupo.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profile.groups.map(g => (
                <Card key={g.id} className="p-6 hover:border-primary/50 transition-colors">
                  <h3 className="font-bold text-lg mb-2">{g.name}</h3>
                  <div className="text-sm text-muted-foreground flex justify-between items-center mt-4">
                    <span>{g.memberCount} membros</span>
                    <span className="text-xs">Criado em {formatDate(g.createdAt).split(' às')[0]}</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}
