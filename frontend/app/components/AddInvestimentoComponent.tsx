import { useState } from "react";
import type { Ativo } from "~/types";
import { ComboboxAtivo } from "./ComboBoxAtivo";
import InputCurrency from "./InputCurrency";

export default function AddInvestimento({ items }: { items: Ativo[] }) {
    console.log(items)
    const [isOpen, setIsOpen] = useState(false);
    const [quantidade, setQuantidade] = useState(0);

    const incrementar = () => setQuantidade(quantidade + 1);
    const decrementar = () => setQuantidade(quantidade > 0 ? quantidade - 1 : 0);
    return (
        <div>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center justify-center w-12 h-12 text-white bg-violet-950 rounded-full hover:bg-violet-900 transition-colors text-2xl"
            >
                +
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="relative bg-gray-900 rounded-lg shadow-lg w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-heading select-none">
                                Adicionar Lançamento</h3>
                            <button type="button" onClick={() => setIsOpen(false)}
                                className="hover:text-black 
                                text-body bg-transparent hover:bg-neutral-tertiary 
                                hover:text-heading rounded-base text-sm w-9 h-9 
                                ms-auto inline-flex justify-center items-center"
                                data-modal-hide="authentication-modal">
                                <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18 17.94 6M18 18 6.06 6" /></svg>
                                <span className="sr-only">Fechar modal</span>
                            </button>
                        </div>
                        <form action="#" className="pt-4 md:pt-6">
                            <div className="mb-4">
                                <label htmlFor="quantidade"
                                    className="block 
                                mb-2.5 text-sm font-medium text-heading select-none">
                                    Quantidade
                                </label>

                                <label htmlFor="quantity-input" className="block mb-2.5 text-sm font-medium text-heading">Choose quantity:</label>
                                <div className="relative flex items-center max-w-36 shadow-xs rounded-base">
                                    <button type="button" id="decrement-button" data-input-counter-decrement="quantity-input"
                                        className="text-body bg-neutral-secondary-medium box-border border border-default-medium 
                                     hover:bg-neutral-tertiary-medium hover:text-heading focus:ring-4 focus:ring-neutral-tertiary 
                                     font-medium leading-5 rounded-s-base text-sm px-3 focus:outline-none h-10"
                                        onClick={decrementar}>
                                        <svg className="w-4 h-4 text-heading" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14" /></svg>
                                    </button>
                                    <input type="text" id="quantity-input" data-input-counter aria-describedby="helper-text-explanation" className="border-x-0 h-10 placeholder:text-heading text-center w-full bg-neutral-secondary-medium border-default-medium py-2.5 placeholder:text-body" placeholder="999" required readOnly value={quantidade} />
                                    <button type="button" id="increment-button" data-input-counter-increment="quantity-input"
                                        className="text-body bg-neutral-secondary-medium box-border border border-default-medium 
                                    hover:bg-neutral-tertiary-medium hover:text-heading focus:ring-4 
                                    focus:ring-neutral-tertiary font-medium leading-5 rounded-e-base text-sm px-3 
                                    focus:outline-none h-10" onClick={incrementar}>
                                        <svg className="w-4 h-4 text-heading" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14m-7 7V5" /></svg>
                                    </button>
                                </div>
                            </div>
                            <div className="mb-4">
                                <label
                                    className="block 
                                mb-2.5 text-sm font-medium text-heading select-none">
                                    Ativo
                                </label>
                                <ComboboxAtivo items={items} placeholder="Selecione um ativo"
                                    onChange={(option) => {
                                        console.log(option)
                                    }}
                                ></ComboboxAtivo>
                            </div>
                            <div className="mb-4">
                                <label htmlFor="DataDeAquisicao"
                                    className="block 
                                mb-2.5 text-sm font-medium text-heading select-none">
                                    Data de Aquisição
                                </label>
                                <input type="date" id="DataDeAquisicao"
                                    className="bg-neutral-secondary-medium 
                                border border-default-medium text-heading text-sm
                                 rounded-base focus:ring-brand focus:border-brand 
                                 block w-full px-3 py-2.5 shadow-xs 
                                 placeholder:text-body" required />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="Preco"
                                    className="block 
                                mb-2.5 text-sm font-medium text-heading select-none">
                                    Preço
                                </label>
                                <input type="number" id="Preco"
                                    className="bg-neutral-secondary-medium 
                                border border-default-medium text-heading text-sm
                                 rounded-base focus:ring-brand focus:border-brand 
                                 block w-full px-3 py-2.5 shadow-xs 
                                 placeholder:text-body" required />
                            </div>
                            <div>
                                <InputCurrency/>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}