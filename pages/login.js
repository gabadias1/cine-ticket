import { useState } from "react";
import { useRouter } from "next/router";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");

  const isFormValid = email && senha;

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    if (email === "teste@mail.com" && senha === "123456") {
      router.push("/");
    } else {
      setError("E-mail ou senha inválidos");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-900 text-white py-4 px-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-bold cursor-pointer" onClick={() => router.push("/")}>
            CineTicket
          </h1>
          <button
            onClick={() => router.push("/register")}
            className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-full transition-colors"
          >
            Criar conta
          </button>
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
              disabled={!isFormValid}
              className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-colors ${
                isFormValid
                  ? "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              Entrar
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
