import { ChevronsUpDown, Search, Check } from "lucide-react";
import { useMemo, useRef, useState, useEffect } from "react";
import type { Ativo } from "~/types";

export function ComboboxAtivo({ items, placeholder, value = null, onChange }:
    { items: Ativo[], placeholder: string, value?: Ativo | null, onChange?: (option: Ativo) => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(0);

    const selected = value;
    const containerRef = useRef<HTMLDivElement>(null);

    const ativosFiltrados = useMemo(() => {
        if (!query) return items;
        return items.filter((item) =>
            item.ticker.toLowerCase().includes(query.toLowerCase()) ||
            item.nome?.toLowerCase().includes(query.toLowerCase())
        );
    }, [items, query]);

    const selectedOption = (option: Ativo) => {
        setQuery("");
        setIsOpen(false);
        onChange?.(option);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!isOpen) return;
        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setSelectedIndex(i => Math.min(i + 1, ativosFiltrados.length - 1));
                break;
            case "ArrowUp":
                e.preventDefault();
                setSelectedIndex(i => Math.max(i - 1, 0));
                break;
            case "Enter":
                e.preventDefault();
                if (ativosFiltrados[selectedIndex]) {
                    selectedOption(ativosFiltrados[selectedIndex]);
                }
                break;
            case "Escape":
                setIsOpen(false);
                break;
        }
    };

    useEffect(() => {
        if (!isOpen) return;
        const index = selected
            ? ativosFiltrados.findIndex((opt) => opt.id === selected.id)
            : 0;
        setSelectedIndex(index >= 0 ? index : 0);
    }, [isOpen, selected, ativosFiltrados]);

    useEffect(() => {
        function handleClickFora(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickFora);
        return () => document.removeEventListener("mousedown", handleClickFora);
    }, []);

    return (
        <div ref={containerRef} className="relative w-full">
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className={`flex items-center w-full h-10.5 px-3 gap-2
                    bg-gray-800/60 border rounded-xl
                    cursor-pointer transition-all text-sm
                    ${isOpen
                        ? 'border-violet-500/50 ring-2 ring-violet-500/40'
                        : 'border-gray-700/50 hover:border-gray-600'}`}
            >
                <span className={selected ? 'text-white font-medium' : 'text-gray-500'}>
                    {selected?.ticker ?? placeholder}
                </span>
                {selected?.nome && (
                    <span className="text-gray-500 text-xs truncate">
                        {selected.nome}
                    </span>
                )}
                <ChevronsUpDown size={14} className="text-gray-500 ml-auto shrink-0" />
            </button>

            {isOpen && (
                <div className="absolute inset-x-0 z-50 mt-2
                    bg-gray-800 border border-gray-700/50
                    rounded-xl shadow-xl shadow-black/40
                    overflow-hidden">
                    <div className="flex items-center gap-2 px-3 py-2.5
                        border-b border-gray-700/50">
                        <Search size={14} className="text-gray-500 shrink-0" />
                        <input
                            type="text"
                            placeholder="Buscar ticker ou nome..."
                            className="flex-1 bg-transparent text-sm text-white
                                placeholder:text-gray-500 outline-none border-none"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            autoFocus
                        />
                    </div>

                    <div className="max-h-48 overflow-y-auto py-1 pl-4">
                        {ativosFiltrados.length > 0 ? (
                            ativosFiltrados.map((item, index) => (
                                <button
                                    type="button"
                                    key={item.id}
                                    onClick={() => selectedOption(item)}
                                    className={`flex items-center gap-2 w-full px-3 py-2
                                        text-sm transition-colors cursor-pointer
                                        ${selectedIndex === index
                                            ? 'bg-violet-600/15 text-white'
                                            : 'text-gray-300 hover:bg-gray-700/50'}`}
                                >
                                    <span className="font-medium min-w-15 text-left">
                                        {item.ticker}
                                    </span>
                                    {item.nome && (
                                        <span className="text-gray-500 text-xs truncate">
                                            {item.nome}
                                        </span>
                                    )}
                                    {selected?.id === item.id && (
                                        <Check size={14} className="text-violet-400 ml-auto shrink-0" />
                                    )}
                                </button>
                            ))
                        ) : (
                            <div className="px-3 py-6 text-center text-sm text-gray-500">
                                Nenhum ativo encontrado
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
