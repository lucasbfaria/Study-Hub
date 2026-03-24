import { useListGroups, useGetMe } from "@workspace/api-client-react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { BookOpen, Plus, Hash, Users, Clock, Flame, Trophy } from "lucide-react";
import { Layout } from "@/components/layout";
import { Card, Spinner, Button, Badge } from "@/components/ui";
import { formatDate } from "@/lib/utils";

export default function Dashboard() {
  const { data: me } = useGetMe();
  const { data: groups, isLoading } = useListGroups();

  const totalGroups = groups?.length ?? 0;
  const isAdmin = (g: { adminId: number }) => g.adminId === me?.id;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-6 py-8 md:px-10 pb-24">
        {/* Welcome header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-3xl font-bold font-display">
            Olá, {me?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-muted-foreground mt-1">Aqui está um resumo dos seus grupos de estudo.</p>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10"
        >
          {[
            {
              icon: <Flame className="h-5 w-5 text-orange-500" />,
              label: "Streak atual",
              value: `${me?.streak ?? 0} dias`,
              color: "bg-orange-500/10",
            },
            {
              icon: <Clock className="h-5 w-5 text-primary" />,
              label: "Total de horas",
              value: `${me?.totalHours ?? 0}h`,
              color: "bg-primary/10",
            },
            {
              icon: <Users className="h-5 w-5 text-violet-500" />,
              label: "Grupos",
              value: String(totalGroups),
              color: "bg-violet-500/10",
            },
          ].map((stat, i) => (
            <Card key={i} className="p-5 flex items-center gap-4">
              <div className={`h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 ${stat.color}`}>
                {stat.icon}
              </div>
              <div>
                <div className="text-2xl font-bold font-display">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            </Card>
          ))}
        </motion.div>

        {/* Groups section */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold font-display flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" /> Seus Grupos
          </h2>
        </div>

        {isLoading ? (
          <div className="py-20 flex justify-center"><Spinner /></div>
        ) : groups?.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-16 text-center"
          >
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary mb-6">
              <BookOpen className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-bold mb-2">Nenhum grupo ainda</h3>
            <p className="text-muted-foreground max-w-xs mx-auto mb-6">
              Crie um grupo clicando no <strong>+</strong> na barra lateral, ou aguarde um convite de um colega.
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {groups?.map((group, i) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Link href={`/groups/${group.id}`}>
                  <Card className="p-5 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all cursor-pointer group">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <Hash className="h-5 w-5" />
                      </div>
                      {isAdmin(group) && (
                        <Badge variant="secondary" className="text-xs">Admin</Badge>
                      )}
                    </div>
                    <h3 className="font-bold text-lg font-display leading-tight mb-1">{group.name}</h3>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-2">
                      <span className="flex items-center gap-1.5">
                        <Users className="h-4 w-4" />
                        {group.memberCount} {group.memberCount === 1 ? "membro" : "membros"}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        {formatDate(group.createdAt)}
                      </span>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
