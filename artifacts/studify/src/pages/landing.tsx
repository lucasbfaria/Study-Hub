import { Link } from "wouter";
import { motion } from "framer-motion";
import { BookOpen, Users, Trophy, Flame, ArrowRight, CheckCircle2, TrendingUp, Shield } from "lucide-react";
import { Button } from "@/components/ui";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" } }),
};

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="Studify" className="h-8 w-8 rounded-lg" />
            <span className="font-bold text-xl bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">Studify</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Entrar</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Criar conta</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute top-40 right-0 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0}
            className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary font-medium mb-6"
          >
            <Flame className="h-4 w-4" />
            Consistência que transforma resultados
          </motion.div>

          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
            className="text-5xl sm:text-7xl font-bold tracking-tight mb-6 leading-none"
          >
            Estudar sozinho
            <span className="block bg-gradient-to-r from-primary via-violet-500 to-primary bg-clip-text text-transparent">
              não funciona.
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            O Studify transforma disciplina em hábito. Crie grupos com seus colegas, registre cada sessão de estudo e mantenha todos na trilha com ranking e streak em tempo real.
          </motion.p>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={3}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/register">
              <Button size="lg" className="gap-2 shadow-lg shadow-primary/25 w-full sm:w-auto">
                Começar agora <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Já tenho conta
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Mock preview card */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="relative mx-auto mt-16 max-w-3xl"
        >
          <div className="rounded-2xl border border-border/60 bg-card shadow-2xl shadow-primary/5 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-muted/30">
              <div className="h-3 w-3 rounded-full bg-red-400" />
              <div className="h-3 w-3 rounded-full bg-yellow-400" />
              <div className="h-3 w-3 rounded-full bg-green-400" />
              <span className="ml-2 text-xs text-muted-foreground font-mono">studify.app</span>
            </div>
            <div className="p-6 grid grid-cols-3 gap-4">
              {[
                { name: "Ana Silva", subject: "Algoritmos", hours: "3.5h", streak: 7, color: "text-amber-500" },
                { name: "Carlos M.", subject: "Banco de Dados", hours: "2h", streak: 3, color: "text-slate-500" },
                { name: "Júlia F.", subject: "React & TS", hours: "4h", streak: 5, color: "text-orange-500" },
              ].map((user, i) => (
                <div key={i} className="rounded-xl border border-border/50 bg-background p-3 text-center">
                  <div className="h-10 w-10 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center mx-auto mb-2">
                    {user.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="text-xs font-bold truncate">{user.name}</div>
                  <div className="text-[10px] text-muted-foreground truncate mt-0.5">{user.subject}</div>
                  <div className="mt-2 flex items-center justify-center gap-1">
                    <span className={`text-xs font-bold ${i === 0 ? "text-primary" : "text-muted-foreground"}`}>{user.hours}</span>
                    <span className="text-[10px] text-muted-foreground">• 🔥{user.streak}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* How it works */}
      <section className="py-24 px-4 sm:px-6 border-t border-border/50">
        <div className="mx-auto max-w-5xl">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-5xl font-bold mb-4">Como funciona</h2>
            <p className="text-muted-foreground text-lg">Três passos para transformar sua rotina de estudos</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Users className="h-8 w-8" />,
                step: "01",
                title: "Crie seu grupo",
                desc: "Monte um grupo privado com seus colegas. Apenas o administrador pode convidar pessoas — sem entrada livre.",
              },
              {
                icon: <BookOpen className="h-8 w-8" />,
                step: "02",
                title: "Registre seus estudos",
                desc: "Após cada sessão, publique a matéria, o tempo estudado e uma foto da sua anotação como prova.",
              },
              {
                icon: <Trophy className="h-8 w-8" />,
                step: "03",
                title: "Acompanhe o progresso",
                desc: "Veja o ranking semanal, mantenha seu streak e motive todos ao redor com sua consistência.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                className="relative group rounded-2xl border border-border/60 bg-card p-8 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all"
              >
                <div className="absolute top-4 right-4 text-5xl font-black text-border/40 select-none">{item.step}</div>
                <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-24 px-4 sm:px-6 bg-muted/30 border-t border-border/50">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-5xl font-bold mb-6">Por que o Studify funciona</h2>
              <p className="text-muted-foreground text-lg mb-8">
                A psicologia do comprometimento público e da competição saudável torna o aprendizado muito mais eficiente.
              </p>
              <div className="space-y-4">
                {[
                  { icon: <Shield className="h-5 w-5 text-primary" />, title: "Consistência real", desc: "O streak diário te responsabiliza mesmo quando a motivação cai." },
                  { icon: <Users className="h-5 w-5 text-violet-500" />, title: "Pressão social positiva", desc: "Ver seus colegas estudando te impulsiona a não ficar para trás." },
                  { icon: <TrendingUp className="h-5 w-5 text-green-500" />, title: "Progresso visível", desc: "Ranking semanal e histórico de horas mostram sua evolução real." },
                ].map((b, i) => (
                  <motion.div
                    key={i}
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    custom={i}
                    className="flex gap-4 items-start rounded-xl p-4 bg-background border border-border/50"
                  >
                    <div className="mt-0.5 h-9 w-9 rounded-lg bg-background flex-shrink-0 flex items-center justify-center border border-border/60">
                      {b.icon}
                    </div>
                    <div>
                      <div className="font-bold mb-0.5">{b.title}</div>
                      <div className="text-sm text-muted-foreground">{b.desc}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="space-y-4"
            >
              {[
                { user: "Maria K.", text: "Sem o Studify eu estudava 1 hora por semana no máximo. Agora são 15+ horas com consistência.", streak: 14 },
                { user: "Pedro A.", text: "O ranking semanal me fez estudar até nos fins de semana. A competição saudável funciona mesmo.", streak: 21 },
                { user: "Carla T.", text: "Criei um grupo para o concurso e todos passamos. A responsabilidade coletiva fez toda diferença.", streak: 30 },
              ].map((t, i) => (
                <div key={i} className="rounded-2xl border border-border/50 bg-background p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center">
                      {t.user.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <div className="font-bold text-sm">{t.user}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">🔥 {t.streak} dias de streak</div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">"{t.text}"</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 sm:px-6 border-t border-border/50">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 mb-6">
              {[CheckCircle2, CheckCircle2, CheckCircle2].map((Icon, i) => (
                <Icon key={i} className="h-5 w-5 text-primary" />
              ))}
            </div>
            <h2 className="text-4xl sm:text-6xl font-bold mb-6">
              Pronto para<br />
              <span className="bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">
                estudar diferente?
              </span>
            </h2>
            <p className="text-muted-foreground text-lg mb-10">
              Crie sua conta gratuitamente e convide seus colegas. Em menos de 2 minutos você tem seu grupo de estudos funcionando.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="gap-2 shadow-xl shadow-primary/20 w-full sm:w-auto">
                  Criar conta grátis <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 px-4 sm:px-6">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={`${import.meta.env.BASE_URL}images/logo.png`} alt="Studify" className="h-6 w-6 rounded" />
            <span className="font-bold text-sm">Studify</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2025 Studify. Feito para quem estuda de verdade.</p>
        </div>
      </footer>
    </div>
  );
}
