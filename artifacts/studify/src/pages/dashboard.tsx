import { useListGroups } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { BookOpen } from "lucide-react";
import { Layout } from "@/components/layout";
import { Spinner } from "@/components/ui";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { data: groups, isLoading } = useListGroups();

  useEffect(() => {
    if (groups && groups.length > 0) {
      setLocation(`/groups/${groups[0].id}`);
    }
  }, [groups, setLocation]);

  return (
    <Layout>
      <div className="flex h-full w-full items-center justify-center p-8">
        {isLoading ? (
          <Spinner />
        ) : (
          <div className="text-center max-w-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary mb-6">
              <BookOpen className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-display font-bold mb-2">Bem-vindo ao Studify</h2>
            <p className="text-muted-foreground">
              Você ainda não participa de nenhum grupo. Crie um novo grupo no menu lateral ou aguarde um convite!
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}
