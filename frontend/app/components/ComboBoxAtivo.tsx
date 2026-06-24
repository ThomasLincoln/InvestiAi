import { ChevronsUpDown, Search } from "lucide-react";
import { useMemo, useRef, useState, useEffect } from "react";
import type { Ativo } from "~/types";

export function ComboboxAtivo({ items, placeholder, onChange }:
    { items: Ativo[], placeholder: string, onChange?: (option: Ativo) => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [ativoSelecionado, setAtivoSelecionado] = useState<Ativo | null>(null);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [selected, setSelected] = useState<Ativo | null>(null);

    const containerRef = useRef(null);
    console.log(items)

    const ativosFiltrados = useMemo(() => {
        if (!query) return items;
        return items.filter((item) =>
            item.ticker.toLowerCase().includes(query.toLowerCase())
        )
    }, [items, query])

    const selectedOption = (option: Ativo) => {
        setSelected(option);
        // setQuery(option.ticker);
        setIsOpen(false);
        onChange?.(option);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (!isOpen) return;
        switch (e.key) {
            case "ArrowDown":
                setSelectedIndex(i => Math.min(i + 1, ativosFiltrados.length - 1));
                break;
            case "ArrowUp":
                setSelectedIndex(i => Math.max(i - 1, ativosFiltrados.length - 1));
                break;
            case "Enter":
                setAtivoSelecionado(ativosFiltrados[selectedIndex]);
                break;
            case "Escape":
                setIsOpen(false);
                break;
            default:
                break;
        }
    };

    useEffect(() => {
        if (!isOpen) return;
        if (selected) {
            const index = ativosFiltrados.findIndex((opt) => opt.id === selected.id);
            setSelectedIndex(index >= 0 ? index : 0);
        } else {
            setSelectedIndex(0);
        }
    }, [isOpen, selected, ativosFiltrados]);
    return (
        <div ref={containerRef} className="relative w-full h-auto">
            <div className="flex items-center gap-2 flex-1 border p-2 border-gray-200
            rounded-md cursor-pointer" onClick={() => setIsOpen((prev) => !prev)}>
                <label className="text-base text-neutral-100 cursor-pointer select-none">
                    {selected?.ticker ? selected.ticker : placeholder}</label>
                <ChevronsUpDown size={16} className="text-neutral-400 ml-auto" />
            </div>
            {isOpen && (
                <div className="absolute inset-x-0 z-50 border border-gray-200 
            p-2 rounded-md flex flex-col items-start justify-start gap-4 mt-2
             shadow-sm max-h-64 bg-gray-900">
                    <div className="flex-1 w-full flex items-center gap-2 bg-neutral-100
                rounded-md p-2.5">
                        <Search size={16} className="text-neutral-600" />
                        <input type="text" placeholder="Search"
                            className="text-neutral-600 outline-none border-none"
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown} />
                    </div>

                    <div className="flex-1 flex flex-col items-start justify-start
                    gap-2 w-full overflow-y-auto">
                        {

                            ativosFiltrados.length > 0 ?
                                <>{ativosFiltrados.map((item, index) => (
                                    <div className={`text-neutral-200 p-1.5 cursor-pointer text-sm
                                rounded-md w-full hover:bg-neutral-500 select-none
                                ${selectedIndex === index ? "bg-gray-600" : "bg-transparent"}`}
                                        key={`${index}-${item.id}`}
                                        onClick={() => selectedOption(ativosFiltrados[index])}
                                    >
                                        {item.ticker}
                                    </div>
                                ))}</> :
                                <>
                                    <div className="w-full flex items-center justify-center">
                                        <p>Não encontrado</p>
                                    </div>
                                </>
                        }
                    </div>
                </div>
            )}
        </div>
    )
}