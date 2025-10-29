import { useEffect, useMemo, useRef, useState } from "react";

const STATE_NAME_TO_UF = {
  "Acre": "AC",
  "Alagoas": "AL",
  "Amapá": "AP",
  "Amazonas": "AM",
  "Bahia": "BA",
  "Ceará": "CE",
  "Distrito Federal": "DF",
  "Espírito Santo": "ES",
  "Goiás": "GO",
  "Maranhão": "MA",
  "Mato Grosso": "MT",
  "Mato Grosso do Sul": "MS",
  "Minas Gerais": "MG",
  "Pará": "PA",
  "Paraíba": "PB",
  "Paraná": "PR",
  "Pernambuco": "PE",
  "Piauí": "PI",
  "Rio de Janeiro": "RJ",
  "Rio Grande do Norte": "RN",
  "Rio Grande do Sul": "RS",
  "Rondônia": "RO",
  "Roraima": "RR",
  "Santa Catarina": "SC",
  "São Paulo": "SP",
  "Sergipe": "SE",
  "Tocantins": "TO",
};

const UF_TO_STATE = Object.fromEntries(Object.entries(STATE_NAME_TO_UF).map(([name, uf]) => [uf, name]));

// Minimal list: fallback to capital for all UFs
const STATE_CAPITAL = {
  AC: "Rio Branco",
  AL: "Maceió",
  AP: "Macapá",
  AM: "Manaus",
  BA: "Salvador",
  CE: "Fortaleza",
  DF: "Brasília",
  ES: "Vitória",
  GO: "Goiânia",
  MA: "São Luís",
  MT: "Cuiabá",
  MS: "Campo Grande",
  MG: "Belo Horizonte",
  PA: "Belém",
  PB: "João Pessoa",
  PR: "Curitiba",
  PE: "Recife",
  PI: "Teresina",
  RJ: "Rio de Janeiro",
  RN: "Natal",
  RS: "Porto Alegre",
  RO: "Porto Velho",
  RR: "Boa Vista",
  SC: "Florianópolis",
  SP: "São Paulo",
  SE: "Aracaju",
  TO: "Palmas",
};

const STATES_CITIES = {
  SP: ["São Paulo", "Campinas", "Santos", "Sorocaba", "Osasco", "Ribeirão Preto"],
  RJ: ["Rio de Janeiro", "Niterói", "Campos dos Goytacazes", "Volta Redonda"],
  MG: ["Belo Horizonte", "Uberlândia", "Juiz de Fora", "Contagem"],
  PR: ["Curitiba", "Londrina", "Maringá", "Cascavel"],
  BA: ["Salvador", "Feira de Santana", "Vitória da Conquista", "Camaçari"],
  RS: ["Porto Alegre", "Caxias do Sul", "Pelotas"],
  PE: ["Recife", "Olinda", "Caruaru"],
  CE: ["Fortaleza", "Caucaia", "Juazeiro do Norte"],
  PA: ["Belém", "Ananindeua", "Santarem"],
  DF: ["Brasília"],
  GO: ["Goiânia", "Anápolis"],
  MT: ["Cuiabá", "Várzea Grande"],
  MS: ["Campo Grande", "Dourados"],
  AM: ["Manaus"]
};

export default function LocationSelector() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const [stateUF, setStateUF] = useState("");
  const [city, setCity] = useState("");

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("location") || "null");
      if (saved?.stateUF) setStateUF(saved.stateUF);
      if (saved?.city) setCity(saved.city);
    } catch {}
  }, []);

  const cities = useMemo(() => {
    const list = stateUF ? (STATES_CITIES[stateUF] || []) : [];
    if (list.length) return list;
    return stateUF ? [STATE_CAPITAL[stateUF]].filter(Boolean) : [];
  }, [stateUF]);

  const label = useMemo(() => {
    if (city) return city;
    if (stateUF) return UF_TO_STATE[stateUF] || stateUF;
    return "Localidade";
  }, [stateUF, city]);

  const onConfirm = () => {
    localStorage.setItem("location", JSON.stringify({ stateUF, city }));
    setOpen(false);
  };

  const onClear = () => {
    setStateUF("");
    setCity("");
    localStorage.removeItem("location");
    setOpen(false);
  };

  // outside click / ESC close
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => { if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-full hover:bg-blue-100"
        onClick={() => setOpen((v) => !v)}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
        <span className="text-blue-600 font-medium text-sm">{label}</span>
        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
        </svg>
      </button>

      {open && (
        <div className="absolute z-[60] top-full mt-2 right-0 w-80">
          <div className="relative">
            <div className="absolute -top-2 right-6 w-4 h-4 bg-white rotate-45 border-l border-t border-gray-200"></div>
            <div className="bg-white border border-gray-200 rounded-xl shadow-xl p-4">
              <h3 className="text-sm font-semibold mb-3">Selecionar localidade</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Estado</label>
                  <select
                    className="w-full border rounded-md p-2 text-sm"
                    value={stateUF}
                    onChange={(e) => { setStateUF(e.target.value); setCity(""); }}
                  >
                    <option value="">Selecione um estado</option>
                    {Object.entries(UF_TO_STATE).map(([uf, name]) => (
                      <option key={uf} value={uf}>{name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-600 mb-1">Cidade</label>
                  <select
                    className="w-full border rounded-md p-2 text-sm"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    disabled={!stateUF}
                  >
                    <option value="">{stateUF ? "Selecione uma cidade" : "Escolha um estado primeiro"}</option>
                    {cities.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <button className="px-3 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm" onClick={onClear} type="button">Limpar</button>
                <button className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 text-sm" onClick={onConfirm} disabled={!stateUF || !city} type="button">Confirmar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
