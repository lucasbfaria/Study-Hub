import { useListInvites, useAcceptInvite, useRejectInvite, getListGroupsQueryKey, getListInvitesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Layout } from "@/components/layout";
import { Card, Button, Spinner, Badge } from "@/components/ui";
import { Check, X, MailOpen } from "lucide-react";
import { motion } from "framer-motion";
import { timeAgo } from "@/lib/utils";

export default function Invites() {
  const queryClient = useQueryClient();
  const { data: invites, isLoading } = useListInvites();
  
  const acceptMut = useAcceptInvite();
  const rejectMut = useRejectInvite();

  const handleAction = (id: number, action: 'accept' | 'reject') => {
    const mut = action === 'accept' ? acceptMut : rejectMut;
    const msg = action === 'accept' ? 'Convite aceito! Você entrou no grupo.' : 'Convite recusado.';
    
    mut.mutate({ inviteId: id }, {
      onSuccess: () => {
        toast.success(msg);
        queryClient.invalidateQueries({ queryKey: getListInvitesQueryKey() });
        if (action === 'accept') {
          queryClient.invalidateQueries({ queryKey: getListGroupsQueryKey() });
        }
      },
      onError: (err) => toast.error(err.error?.error || "Ocorreu um erro.")
    });
  };

  const pending = invites?.filter(i => i.status === 'pending') || [];

  return (
    <Layout>
      <div className="p-6 md:p-12 max-w-4xl mx-auto w-full">
        <div className="mb-10">
          <h1 className="font-display text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
            <MailOpen className="w-8 h-8 text-primary" /> Convites
          </h1>
          <p className="text-muted-foreground text-lg">Gerencie seus convites para participar de grupos de estudo.</p>
        </div>

        {isLoading ? (
          <div className="py-20 text-center"><Spinner className="mx-auto" /></div>
        ) : pending.length === 0 ? (
          <div className="text-center py-20 px-4">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <MailOpen className="w-10 h-10 text-muted-foreground opacity-50" />
            </div>
            <h2 className="text-xl font-bold mb-2">Nenhum convite pendente</h2>
            <p className="text-muted-foreground">Você não possui novos convites no momento.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pending.map((invite, idx) => (
              <motion.div key={invite.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}>
                <Card className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:shadow-md transition-shadow border-l-4 border-l-primary">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold font-display">{invite.groupName}</h3>
                      <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">Novo</Badge>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      Convidado por <strong className="text-foreground">{invite.invitedByName}</strong> • {timeAgo(invite.createdAt)}
                    </p>
                  </div>
                  <div className="flex w-full sm:w-auto gap-3">
                    <Button 
                      variant="outline" 
                      className="flex-1 sm:flex-none border-destructive text-destructive hover:bg-destructive/10"
                      onClick={() => handleAction(invite.id, 'reject')}
                      disabled={rejectMut.isPending || acceptMut.isPending}
                    >
                      <X className="w-4 h-4 mr-2" /> Recusar
                    </Button>
                    <Button 
                      className="flex-1 sm:flex-none"
                      onClick={() => handleAction(invite.id, 'accept')}
                      isLoading={acceptMut.isPending && acceptMut.variables?.inviteId === invite.id}
                      disabled={rejectMut.isPending}
                    >
                      <Check className="w-4 h-4 mr-2" /> Aceitar
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
