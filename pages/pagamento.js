import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import LocationSelector from '../components/LocationSelector';

export default function Pagamento() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [metodo, setMetodo] = useState('CREDITO');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [pixCode, setPixCode] = useState('');
  const [copiado, setCopiado] = useState(false);

  // Detalhes dos ingressos vindos da página anterior
  const [ingressos, setIngressos] = useState([]);
  const [totalPreco, setTotalPreco] = useState(0);
  const [tipoCompra, setTipoCompra] = useState('cinema'); // 'cinema' ou 'evento'
  const [eventoData, setEventoData] = useState(null);

  // Dados do cartão
  const [cartao, setCartao] = useState({
    numero: '',
    titular: '',
    mes: '',
    ano: '',
    cvv: ''
  });

  // Dados do titular para PIX
  const [titularPix, setTitularPix] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    // Verificar se é compra de evento
    if (router.query.tipo === 'evento') {
      setTipoCompra('evento');
      setEventoData({
        id: router.query.eventId,
        name: router.query.eventName,
        sector: router.query.sector,
        price: parseFloat(router.query.price),
        date: router.query.eventDate
      });
      setIngressos([{
        tipo: router.query.sector,
        preco: parseFloat(router.query.price)
      }]);
      setTotalPreco(parseFloat(router.query.price));
      return;
    }

    // Obter dados dos ingressos do sessionStorage ou router.query (cinema)
    if (router.query.ingressos) {
      try {
        const ing = JSON.parse(router.query.ingressos);
        setIngressos(ing);
        const total = Array.isArray(ing)
          ? ing.reduce((acc, i) => acc + (i.preco || 0), 0)
          : 0;
        setTotalPreco(total);
      } catch (e) {
        console.error('Erro ao parsear ingressos:', e);
      }
    }

    // Tentar obter do sessionStorage como fallback
    const ingresso = sessionStorage.getItem('ingressoData');
    if (ingresso && ingressos.length === 0) {
      try {
        const ing = JSON.parse(ingresso);
        setIngressos(Array.isArray(ing) ? ing : [ing]);
        const total = Array.isArray(ing)
          ? ing.reduce((acc, i) => acc + (i.preco || 0), 0)
          : ing.preco || 0;
        setTotalPreco(total);
      } catch (e) {
        console.error('Erro ao obter ingressos do sessionStorage:', e);
      }
    }
  }, [user, router]);

  // Validações
  const validarNumeroCartao = (numero) => {
    const limpo = numero.replace(/\s/g, '');
    return limpo.length >= 13 && limpo.length <= 19 && /^\d+$/.test(limpo);
  };

  const validarDataExpiracao = (mes, ano) => {
    if (!mes || !ano) return false;
    const mesNum = parseInt(mes);
    const anoNum = parseInt(ano);
    if (mesNum < 1 || mesNum > 12) return false;
    if (anoNum < new Date().getFullYear() % 100) return false;
    return true;
  };

  const validarCVV = (cvv) => {
    return /^\d{3,4}$/.test(cvv);
  };

  const formatarNumeroCartao = (valor) => {
    const limpo = valor.replace(/\s/g, '');
    return limpo.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const gerarCodigoPix = () => {
    return 'PIX-' + Math.random().toString(36).substring(2, 15).toUpperCase();
  };

  const copiarCodigoPix = () => {
    navigator.clipboard.writeText(pixCode);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const handlePagarCartao = async (e) => {
    e.preventDefault();
    setErro('');

    // Validações
    if (!cartao.numero || !validarNumeroCartao(cartao.numero)) {
      setErro('Número do cartão inválido (deve ter 13-19 dígitos)');
      return;
    }

    if (!cartao.titular || cartao.titular.trim().length < 3) {
      setErro('Nome do titular inválido');
      return;
    }

    if (!validarDataExpiracao(cartao.mes, cartao.ano)) {
      setErro('Data de expiração inválida');
      return;
    }

    if (!validarCVV(cartao.cvv)) {
      setErro('CVV inválido (deve ter 3-4 dígitos)');
      return;
    }

    setCarregando(true);

    try {
      const paymentData = {
        tipo: metodo,
        ultimosDigitos: cartao.numero.slice(-4),
        titular: cartao.titular
      };

      if (tipoCompra === 'evento') {
        // Pagamento de evento
        await api.purchaseEventTicket(
          user.id,
          eventoData.id,
          totalPreco,
          eventoData.sector,
          null // seatNumber
        );

        setSucesso('Ingresso do evento comprado com sucesso!');
        
        setTimeout(() => {
          router.push(`/perfil?tab=eventos`);
        }, 2000);
      } else {
        // Pagamento de cinema
        const ticketDetails = ingressos.map(i => ({
          sessionId: i.sessionId,
          seatId: i.seatId,
          price: i.preco
        }));

        await api.processPayment(
          user.id,
          metodo,
          totalPreco,
          paymentData,
          ticketDetails
        );

        setSucesso('Pagamento realizado com sucesso! Seus ingressos foram salvos.');
        sessionStorage.removeItem('ingressoData');
        
        setTimeout(() => {
          router.push(`/perfil?tab=ingressos`);
        }, 2000);
      }
    } catch (erro) {
      setErro(erro.message || 'Erro ao processar pagamento');
      setCarregando(false);
    }
  };

  const handlePagarPix = async (e) => {
    e.preventDefault();
    setErro('');

    if (!titularPix || titularPix.trim().length < 3) {
      setErro('Nome do titular é obrigatório');
      return;
    }

    const novoPix = gerarCodigoPix();
    setPixCode(novoPix);

    // Auto-processar após 2 segundos para simular confirmação de PIX
    setTimeout(async () => {
      try {
        if (tipoCompra === 'evento') {
          // Pagamento de evento
          await api.purchaseEventTicket(
            user.id,
            eventoData.id,
            totalPreco,
            eventoData.sector,
            null // seatNumber
          );

          setSucesso('Pagamento via PIX confirmado! Seu ingresso foi salvo.');
          
          setTimeout(() => {
            router.push(`/perfil?tab=eventos`);
          }, 2000);
        } else {
          // Pagamento de cinema
          const paymentData = {
            tipo: 'PIX',
            pixCode: novoPix,
            titular: titularPix
          };

          const ticketDetails = ingressos.map(i => ({
            sessionId: i.sessionId,
            seatId: i.seatId,
            price: i.preco
          }));

          await api.processPayment(
            user.id,
            'PIX',
            totalPreco,
            paymentData,
            ticketDetails
          );

          setSucesso('Pagamento via PIX confirmado! Seus ingressos foram salvos.');
          sessionStorage.removeItem('ingressoData');
          
          setTimeout(() => {
            router.push(`/perfil?tab=ingressos`);
          }, 2000);
        }
      } catch (erro) {
        setErro(erro.message || 'Erro ao processar pagamento PIX');
      }
    }, 2000);
  };

  const voltarAssentos = () => {
    router.back();
  };

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
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-gray-700 hidden sm:inline text-sm font-medium">Olá, {user.name}</span>
                <button
                  onClick={() => router.push("/perfil")}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg text-sm font-medium"
                  title="Meu Perfil"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Perfil</span>
                </button>
                <button
                  onClick={() => {
                    logout();
                    router.push('/');
                  }}
                  className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg text-sm font-medium"
                  title="Sair"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Sair</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => router.push("/login")}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full transition-colors font-medium"
              >
                Entrar
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <button
            onClick={voltarAssentos}
            className="text-gray-600 hover:text-blue-600 mb-4 flex items-center gap-2 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Voltar
          </button>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">💳 Pagamento</h1>
          <p className="text-gray-600">Escolha a forma de pagamento para seus ingressos</p>
        </div>

        {/* Resumo dos ingressos */}
        {(ingressos.length > 0 || eventoData) && (
          <div className="bg-white rounded-lg p-6 mb-8 border border-gray-200 shadow-md">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Resumo do Pedido</h2>
            
            {tipoCompra === 'evento' && eventoData ? (
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-gray-700">
                  <span>Evento: {eventoData.name}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Setor: {eventoData.sector}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Data: {eventoData.date}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Ingresso</span>
                  <span>R$ {eventoData.price?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-2 mb-4">
                {ingressos.map((ing, idx) => (
                  <div key={idx} className="flex justify-between text-gray-700">
                    <span>Ingresso {idx + 1} ({ing.tipo})</span>
                    <span>R$ {ing.preco?.toFixed(2) || '0.00'}</span>
                  </div>
                ))}
              </div>
            )}
            
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between text-xl font-bold">
                <span className="text-gray-800">Total</span>
                <span className="text-red-600">R$ {totalPreco.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Mensagens */}
        {erro && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
            {erro}
          </div>
        )}
        {sucesso && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-6">
            {sucesso}
          </div>
        )}

        {/* Métodos de pagamento */}
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-md">
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { id: 'CREDITO', nome: 'Crédito', icon: '💳' },
              { id: 'DEBITO', nome: 'Débito', icon: '🏦' },
              { id: 'PIX', nome: 'PIX', icon: '📱' }
            ].map(opcao => (
              <button
                key={opcao.id}
                onClick={() => {
                  setMetodo(opcao.id);
                  setPixCode('');
                  setErro('');
                }}
                className={`p-4 rounded-lg border-2 transition ${
                  metodo === opcao.id
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300 bg-gray-50'
                }`}
              >
                <div className="text-2xl mb-2">{opcao.icon}</div>
                <div className={`font-semibold ${metodo === opcao.id ? 'text-red-600' : 'text-gray-700'}`}>{opcao.nome}</div>
              </button>
            ))}
          </div>

          {/* Formulário de Crédito/Débito */}
          {(metodo === 'CREDITO' || metodo === 'DEBITO') && (
            <form onSubmit={handlePagarCartao} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Número do Cartão
                </label>
                <input
                  type="text"
                  placeholder="0000 0000 0000 0000"
                  value={cartao.numero}
                  onChange={(e) =>
                    setCartao({
                      ...cartao,
                      numero: formatarNumeroCartao(e.target.value)
                    })
                  }
                  className="w-full bg-white border border-gray-300 rounded px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  maxLength="23"
                />
                <p className="text-xs text-gray-400 mt-1">
                  {cartao.numero ? `✓ ${cartao.numero.length - (cartao.numero.match(/\s/g)?.length || 0)} dígitos` : ''}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Titular do Cartão
                </label>
                <input
                  type="text"
                  placeholder="Nome completo"
                  value={cartao.titular}
                  onChange={(e) =>
                    setCartao({ ...cartao, titular: e.target.value.toUpperCase() })
                  }
                  className="w-full bg-white border border-gray-300 rounded px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Mês
                  </label>
                  <input
                    type="number"
                    placeholder="MM"
                    value={cartao.mes}
                    onChange={(e) =>
                      setCartao({
                        ...cartao,
                        mes: e.target.value.slice(0, 2)
                      })
                    }
                    min="1"
                    max="12"
                    className="w-full bg-white border border-gray-300 rounded px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Ano
                  </label>
                  <input
                    type="number"
                    placeholder="YY"
                    value={cartao.ano}
                    onChange={(e) =>
                      setCartao({
                        ...cartao,
                        ano: e.target.value.slice(0, 2)
                      })
                    }
                    min={new Date().getFullYear() % 100}
                    className="w-full bg-white border border-gray-300 rounded px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    CVV
                  </label>
                  <input
                    type="password"
                    placeholder="XXX"
                    value={cartao.cvv}
                    onChange={(e) =>
                      setCartao({
                        ...cartao,
                        cvv: e.target.value.slice(0, 4)
                      })
                    }
                    maxLength="4"
                    className="w-full bg-white border border-gray-300 rounded px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={carregando}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-900 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition mt-6"
              >
                {carregando ? 'Processando...' : `Pagar R$ ${totalPreco.toFixed(2)}`}
              </button>
            </form>
          )}

          {/* Formulário de PIX */}
          {metodo === 'PIX' && (
            <form onSubmit={handlePagarPix} className="space-y-4">
              {!pixCode ? (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Nome do Titular
                    </label>
                    <input
                      type="text"
                      placeholder="Seu nome"
                      value={titularPix}
                      onChange={(e) => setTitularPix(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded px-4 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                    />
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-gray-700">
                    <p className="mb-2">
                      Ao clicar em "Gerar código PIX", você receberá um código único para copiar e colar em seu aplicativo bancário.
                    </p>
                    <p>Após completar a transferência PIX, seus ingressos serão salvos automaticamente.</p>
                  </div>

                  <button
                    type="submit"
                    disabled={carregando}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-900 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition"
                  >
                    {carregando ? 'Gerando código...' : 'Gerar Código PIX'}
                  </button>
                </>
              ) : (
                <>
                  <div className="bg-gray-50 p-6 rounded-lg text-center border-2 border-green-500">
                    <p className="text-sm text-gray-600 mb-4">Seu código PIX:</p>
                    <p className="text-2xl font-mono font-bold mb-4 break-all text-gray-800">
                      {pixCode}
                    </p>
                    <button
                      type="button"
                      onClick={copiarCodigoPix}
                      className={`w-full py-2 rounded-lg font-semibold transition ${
                        copiado
                          ? 'bg-green-600 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {copiado ? '✓ Copiado!' : 'Copiar Código'}
                    </button>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg text-sm">
                    <p>
                      ⏱️ Processando pagamento... Seus ingressos serão salvos em breve!
                    </p>
                  </div>
                </>
              )}
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
