import { useState } from "react";
import { BR } from 'country-flag-icons/react/3x2'

export default function InputCurrency() {
    const [menuAberto, setMenuAberto] = useState(false);
    const [moedaSelecionada, setMoedaSelecionada] = useState('BRL');

    // 2. Função para atualizar a moeda e fechar o menu logo em seguida
    const selecionarMoeda = (novaMoeda: string) => {
        setMoedaSelecionada(novaMoeda);
        setMenuAberto(false);
    };

    return (
        <>
            <div className="relative w-full">
                <div className="absolute inset-y-0 inset-s-0 top-0 flex items-center ps-3.5 pointer-events-none">
                    <svg className="w-4 h-4 text-body" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M8 7V6a1 1 0 0 1 1-1h11a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-1M3 18v-7a1 1 0 0 1 1-1h11a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Zm8-3.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" /></svg>
                </div>
                <input type="number" id="currency-input" className="block w-full ps-9 pe-3 py-2.5 bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-s-base focus:ring-brand focus:border-brand placeholder:text-body" placeholder="Enter amount" required />
            </div>
            <button id="dropdown-currency-button"
                data-dropdown-toggle="dropdown-currency"
                type="button"
                className="inline-flex items-center shrink-0 z-10 
                    text-body bg-neutral-secondary-medium box-border border 
                    border-default-medium hover:bg-neutral-tertiary-medium 
                    hover:text-fg-brand focus:ring-4 focus:ring-neutral-tertiary 
                    font-medium leading-5 rounded-e-base text-sm px-4 py-2.5 
                    focus:outline-none"
                onClick={() => setMenuAberto(!menuAberto)}
            >
                <BR title="Brasil" className="h-6 w-6 rounded-full object-cover mr-2" />
                {moedaSelecionada}
            </button>
            <div className={`z-10 absolute mt-2 bg-neutral-primary-medium border 
                border-default-medium rounded-base shadow-lg w-32 overflow-y-auto max-h-20
                ${menuAberto ? 'block' : 'hidden'}`}>
                <ul className="p-2 text-sm text-body font-medium bg-gray-900" aria-labelledby="dropdown-currency-button">
                    <li>
                        <button
                            type="button"
                            onClick={() => selecionarMoeda('BRL')}
                            className="inline-flex items-center w-full p-2 hover:bg-neutral-tertiary-medium rounded-md"
                        >
                            <BR title="Brasil" className="h-6 w-6 rounded-full object-cover mr-2" />
                            BRL
                        </button>
                    </li>
                </ul>
            </div>
        </>
    )
}