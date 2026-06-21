import { useState } from "react";
import type { Ativo } from "~/types";

export default function SearchComponent({ items }: { items: Ativo[] }) {
    const [searchTerm, setSearchTerm] = useState("");

    return (
        <div className="w-full max-w-md mx-auto p-4 bg-white rounded-xl shadow-lg
        border border-gray-100">
            <input type="text"
                placeholder="Buscar..."
                className="text-stone-900 w-full px-4 py-2 mb-4 bg-gray-50 border border-gray-200
                rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500
                transition-all"
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <ul className="space-y-1">
                {filterItems(items, searchTerm).map((item) => (
                    <TreeItem key={item.id} item={item} />
                ))}
            </ul>
        </div>
    );
}

function TreeItem({ item }: { item: Ativo }) {
    return (
        <li className="ml-4">
            <div className="py-1 px-2 hover:bg-blue-50 rounded cursor-pointer text-gray-700 font-medium transition-colors">
                {item.ticker} - {item.nome}
            </div>
        </li>
    );
}

function filterItems(items: Ativo[], term: string): Ativo[] {
    if (!term) {
        return []
    }
    return items.reduce((acc: Ativo[], item) => {
        const matches = item.ticker.toLowerCase().includes(term.toLowerCase());

        if (matches) {
            acc.push({ ...item });
        }
        return acc;
    }, []);
}