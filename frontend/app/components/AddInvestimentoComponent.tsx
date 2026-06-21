import { useState } from "react";

export default function AddInvestimento() {
    // 1. Criamos um estado para controlar se o modal está aberto ou não
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div>
            {/* 2. Ao clicar, mudamos o estado para true */}
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center justify-center w-12 h-12 text-white bg-violet-950 rounded-full hover:bg-violet-900 transition-colors text-2xl"
            >
                +
            </button>

            {/* 3. Renderização condicional: só mostra o modal se isOpen for true */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-heading text-black">Adicionar Lançamento</h3>
                            <button type="button" onClick={() => setIsOpen(false)}
                                className="text-gray-500 hover:text-black 
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
                                    className="text-black block 
                                mb-2.5 text-sm font-medium text-heading">
                                    Quantidade
                                </label>
                                <input type="float" id="quantidade"
                                    className="text-black bg-neutral-secondary-medium 
                                border border-default-medium text-heading text-sm
                                 rounded-base focus:ring-brand focus:border-brand 
                                 block w-full px-3 py-2.5 shadow-xs 
                                 placeholder:text-body" placeholder="120" required />
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}