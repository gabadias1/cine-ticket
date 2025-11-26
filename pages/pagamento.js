import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import Layout from '../components/Layout';
import Button from '../components/ui/Button';
import { CreditCard, Wallet, Smartphone, Check, AlertCircle, ArrowLeft, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
      const price = parseFloat(router.query.price) || 0;
      const qty = parseInt(router.query.qty) || 1;

      setTipoCompra('evento');
      setEventoData({
        id: router.query.eventId,
        name: router.query.eventName,
        sector: router.query.sector,
        price: price,
        date: router.query.eventDate
      });
      setIngressos([{
        tipo: router.query.sector,
        preco: price
      }]);
      setTotalPreco(price * qty);
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
          eventId: i.eventId,
          seatId: i.seatId,
          price: i.preco,
          areaNome: i.areaNome,
          tipo: i.tipo
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
            eventId: i.eventId,
            seatId: i.seatId,
            price: i.preco,
            areaNome: i.areaNome,
            tipo: i.tipo
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
    <Layout title="Pagamento - CineTicket">
      <div className="pt-24 pb-12 px-6 max-w-4xl mx-auto min-h-screen">

        {/* Header */}
        <div className="mb-8">
          <button
            onClick={voltarAssentos}
            className="text-gray-400 hover:text-white mb-4 flex items-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar
          </button>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Lock className="w-8 h-8 text-primary" />
            Pagamento Seguro
          </h1>
          <p className="text-gray-400">Escolha a forma de pagamento para finalizar sua compra</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="md:col-span-1 order-2 md:order-1">
            <div className="bg-surface border border-white/10 rounded-2xl p-6 sticky top-24">
              <h2 className="text-xl font-bold text-white mb-4">Resumo do Pedido</h2>

              <div className="space-y-4 mb-6">
                {(ingressos.length > 0 || eventoData) && (
                  <>
                    {tipoCompra === 'evento' && eventoData ? (
                      <div className="space-y-2 text-sm text-gray-400">
                        <div className="flex justify-between">
                          <span>Evento</span>
                          <span className="text-white text-right">{eventoData.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Setor</span>
                          <span className="text-white">{eventoData.sector}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Data</span>
                          <span className="text-white">{eventoData.date}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Qtd.</span>
                          <span className="text-white">{router.query.qty || 1}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2 text-sm text-gray-400">
                        {ingressos.map((ing, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span>Ingresso {idx + 1} ({ing.tipo})</span>
                            <span className="text-white">R$ {ing.preco?.toFixed(2) || '0.00'}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="border-t border-white/10 pt-4">
                <div className="flex justify-between items-end">
                  <span className="text-gray-400">Total</span>
                  <span className="text-2xl font-bold text-primary">R$ {totalPreco.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="md:col-span-2 order-1 md:order-2">
            {/* Error/Success Messages */}
            <AnimatePresence>
              {erro && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-red-500/10 border border-red-500/50 text-red-200 px-6 py-4 rounded-xl mb-6 flex items-center gap-3"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  {erro}
                </motion.div>
              )}
              {sucesso && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-green-500/10 border border-green-500/50 text-green-200 px-6 py-4 rounded-xl mb-6 flex items-center gap-3"
                >
                  <Check className="w-5 h-5 flex-shrink-0" />
                  {sucesso}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="bg-surface border border-white/10 rounded-2xl p-6 mb-6">
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                  { id: 'CREDITO', nome: 'Crédito', icon: CreditCard },
                  { id: 'DEBITO', nome: 'Débito', icon: Wallet },
                  { id: 'PIX', nome: 'PIX', icon: Smartphone }
                ].map(opcao => (
                  <button
                    key={opcao.id}
                    onClick={() => {
                      setMetodo(opcao.id);
                      setPixCode('');
                      setErro('');
                    }}
                    className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${metodo === opcao.id
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                      }`}
                  >
                    <opcao.icon className="w-6 h-6" />
                    <span className="font-semibold text-sm">{opcao.nome}</span>
                  </button>
                ))}
              </div>

              {/* Credit/Debit Form */}
              {(metodo === 'CREDITO' || metodo === 'DEBITO') && (
                <form onSubmit={handlePagarCartao} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Número do Cartão
                    </label>
                    <div className="relative">
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
                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                        maxLength="23"
                      />
                      <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Nome do Titular
                    </label>
                    <input
                      type="text"
                      placeholder="NOME COMO NO CARTÃO"
                      value={cartao.titular}
                      onChange={(e) =>
                        setCartao({ ...cartao, titular: e.target.value.toUpperCase() })
                      }
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
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
                          className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-center"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
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
                          className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-center"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        CVV
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          placeholder="123"
                          value={cartao.cvv}
                          onChange={(e) =>
                            setCartao({
                              ...cartao,
                              cvv: e.target.value.slice(0, 4)
                            })
                          }
                          maxLength="4"
                          className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-center"
                        />
                        <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={carregando}
                    className="w-full mt-6"
                    size="lg"
                  >
                    {carregando ? 'Processando...' : `Pagar R$ ${totalPreco.toFixed(2)}`}
                  </Button>
                </form>
              )}

              {/* PIX Form */}
              {metodo === 'PIX' && (
                <form onSubmit={handlePagarPix} className="space-y-6">
                  {!pixCode ? (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          Nome Completo
                        </label>
                        <input
                          type="text"
                          placeholder="Digite seu nome completo"
                          value={titularPix}
                          onChange={(e) => setTitularPix(e.target.value)}
                          className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                        />
                      </div>

                      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 text-sm text-blue-200">
                        <p className="mb-2 font-semibold">Como funciona:</p>
                        <ul className="list-disc list-inside space-y-1 text-blue-300/80">
                          <li>Ao clicar em "Gerar Código PIX", um código será gerado.</li>
                          <li>Copie o código e pague no app do seu banco.</li>
                          <li>A aprovação é instantânea e seus ingressos serão liberados.</li>
                        </ul>
                      </div>

                      <Button
                        type="submit"
                        disabled={carregando}
                        className="w-full"
                        size="lg"
                      >
                        {carregando ? 'Gerando código...' : 'Gerar Código PIX'}
                      </Button>
                    </>
                  ) : (
                    <div className="space-y-6">
                      <div className="bg-white p-6 rounded-xl text-center">
                        <div className="w-48 h-48 bg-gray-900 mx-auto mb-4 rounded-lg flex items-center justify-center text-gray-500 text-xs">
                          QR CODE SIMULADO
                        </div>
                        <p className="text-sm text-gray-600 mb-2">Código PIX Copia e Cola:</p>
                        <div className="bg-gray-100 p-3 rounded-lg break-all font-mono text-xs text-gray-800 mb-4 border border-gray-200">
                          {pixCode}
                        </div>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={copiarCodigoPix}
                          className="w-full"
                        >
                          {copiado ? 'Copiado!' : 'Copiar Código'}
                        </Button>
                      </div>

                      <div className="flex items-center justify-center gap-3 text-blue-400 animate-pulse">
                        <div className="w-2 h-2 bg-blue-400 rounded-full" />
                        <span className="text-sm font-medium">Aguardando pagamento...</span>
                      </div>
                    </div>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
