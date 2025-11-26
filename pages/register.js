import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import Button from '../components/ui/Button';
import GlassCard from '../components/ui/GlassCard';
import { User, Mail, Lock, ArrowRight } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      return setError('As senhas não coincidem');
    }

    setIsLoading(true);

    try {
      const result = await register(name, email, password);
      if (result.success) {
        router.push('/');
      } else {
        setError(result.error || 'Erro ao criar conta. Tente novamente.');
      }
    } catch (err) {
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout title="Criar Conta - CineTicket">
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px]" />
        </div>

        <GlassCard className="w-full max-w-md p-8 relative z-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Crie sua conta</h1>
            <p className="text-gray-400">Junte-se a nós para a melhor experiência</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl mb-6 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 ml-1">Nome Completo</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  placeholder="Seu nome"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 ml-1">Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 ml-1">Confirmar Senha</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-4"
              disabled={isLoading}
              icon={isLoading ? null : ArrowRight}
            >
              {isLoading ? 'Criando conta...' : 'Criar Conta'}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-400">
            Já tem uma conta?{' '}
            <Link href="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
              Faça login
            </Link>
          </div>
        </GlassCard>
      </div>
    </Layout>
  );
}
