import { useState, useCallback, useMemo } from "react";
import LocationSelector from "../components/LocationSelector";
import { useRouter } from "next/router";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isFormValid = useMemo(() => email && senha, [email, senha]);

  const handleLogin = useCallback(async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(email, senha);
    
    if (result.success) {
      router.push("/");
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  }, [email, senha, login, router]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 py-4 px-6 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <button onClick={() => router.push("/")} className="flex items-center space-x-3 h-10">
              <img src="/images/logo.png" alt="CineTicket" className="h-full w-auto object-contain" />
            </button>
            
            {/* Location Selector */}
            <LocationSelector />
            
            <nav className="hidden lg:flex space-x-8">
              <button
                onClick={() => router.push("/filmes")}
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                Filmes
              </button>
              <button
                onClick={() => router.push("/eventos")}
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
              >
                Eventos
              </button>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-600 hover:text-blue-600 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </button>
            <button
              onClick={() => router.push("/register")}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full transition-colors font-medium"
            >
              Criar conta
            </button>
          </div>
        </div>
      </header>

      {/* Login Form */}
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
        <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
          <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Bem-vindo de volta!</h2>
          <p className="text-center text-gray-600 mb-8">
            Entre com suas credenciais para acessar sua conta
          </p>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                placeholder="exemplo@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label htmlFor="senha" className="block text-sm font-medium text-gray-700 mb-1">
                Senha
              </label>
              <input
                id="senha"
                type="password"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="lembrar"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="lembrar" className="ml-2 block text-sm text-gray-700">
                  Lembrar de mim
                </label>
              </div>
              <a href="#" className="text-sm text-blue-600 hover:text-blue-800">
                Esqueceu a senha?
              </a>
            </div>

            <button
              type="submit"
              disabled={!isFormValid || loading}
              className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-colors ${
                isFormValid && !loading
                  ? "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Ainda não tem uma conta?{" "}
              <a
                onClick={() => router.push("/register")}
                className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
              >
                Registre-se
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
