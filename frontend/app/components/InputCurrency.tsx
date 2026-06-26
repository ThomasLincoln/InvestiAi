import { useState, useRef, useEffect } from "react";
import { BR, US } from 'country-flag-icons/react/3x2'
import { ChevronDown } from "lucide-react";

export const moedas = [
    { codigo: 'BRL', nome: 'Real', simbolo: 'R$', Bandeira: BR },
    { codigo: 'USD', nome: 'Dólar', simbolo: '$', Bandeira: US },
] as const;

export type Moeda = typeof moedas[number];

export function formatarMoeda(valor: number): string {
    return valor.toFixed(2).replace('.', ',');
}

export function parsearValor(texto: string): number {
    const soNumeros = texto.replace(/[^\d]/g, '');
    return Number(soNumeros) / 100;
}

interface InputCurrencyProps {
    valor: number;
    moeda: Moeda;
    onValorChange: (valor: number) => void;
    onMoedaChange: (moeda: Moeda) => void;
}

export default function InputCurrency({ valor, moeda, onValorChange, onMoedaChange }: InputCurrencyProps) {
    const [menuAberto, setMenuAberto] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickFora(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setMenuAberto(false);
            }
        }
        document.addEventListener("mousedown", handleClickFora);
        return () => document.removeEventListener("mousedown", handleClickFora);
    }, []);

    const selecionarMoeda = (m: Moeda) => {
        onMoedaChange(m);
        setMenuAberto(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onValorChange(parsearValor(e.target.value));
    };

    const { Bandeira } = moeda;

    return (
        <div ref={containerRef} className="relative">
            <div className="flex items-stretch h-10.5 rounded-xl overflow-hidden
                bg-gray-800/60 border border-gray-700/50
                focus-within:ring-2 focus-within:ring-violet-500/40
                focus-within:border-violet-500/50 transition-all">
                <div className="flex items-center pl-3 pointer-events-none shrink-0">
                    <span className="text-sm font-semibold text-violet-400">
                        {moeda.simbolo}
                    </span>
                </div>
                <input
                    type="text"
                    inputMode="numeric"
                    className="flex-1 bg-transparent pl-2 pr-1
                        text-white text-sm font-medium
                        outline-none border-none
                        placeholder:text-gray-600"
                    placeholder="0,00"
                    value={formatarMoeda(valor)}
                    onChange={handleChange}
                    required
                />
                <button
                    type="button"
                    className="flex items-center gap-1.5 px-2.5 shrink-0
                        text-gray-400 hover:text-white
                        border-l border-gray-700/50
                        hover:bg-gray-700/40 transition-colors cursor-pointer"
                    onClick={() => setMenuAberto(!menuAberto)}
                >
                    <Bandeira
                        title={moeda.nome}
                        className="h-3.5 w-5 rounded-sm object-cover"
                    />
                    <span className="text-xs font-medium">{moeda.codigo}</span>
                    <ChevronDown
                        size={12}
                        className={`transition-transform ${menuAberto ? 'rotate-180' : ''}`}
                    />
                </button>
            </div>

            {menuAberto && (
                <ul className="absolute right-0 z-20 mt-1.5 w-40
                    bg-gray-800 border border-gray-700/50
                    rounded-xl shadow-xl shadow-black/40
                    overflow-hidden py-1"
                >
                    {moedas.map((m) => (
                        <li key={m.codigo}>
                            <button
                                type="button"
                                onClick={() => selecionarMoeda(m)}
                                className={`flex items-center gap-2 w-full px-3 py-2
                                    text-sm transition-colors cursor-pointer
                                    ${m.codigo === moeda.codigo
                                        ? 'text-white bg-violet-600/15'
                                        : 'text-gray-400 hover:text-white hover:bg-gray-700/50'}`}
                            >
                                <m.Bandeira
                                    title={m.nome}
                                    className="h-3.5 w-5 rounded-sm object-cover"
                                />
                                <span className="font-medium">{m.codigo}</span>
                                <span className="text-gray-500 text-xs">{m.nome}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
