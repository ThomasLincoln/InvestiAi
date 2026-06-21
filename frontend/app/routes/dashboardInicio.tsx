import PatrimonioTotal from "~/components/PatrimonioTotal";
import { useOutletContext } from "react-router";
import SideBar from "~/components/SideBarComponent";
import { useState } from "react";

export default function DashboardInicio() {
    const { user } = useOutletContext<any>() || {};
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const mudanca = {
        crescimento: true,
        porcentagem: 3.4,
    }
    return (
        <div>
            <h1 style={{ fontSize: '2rem', color: '#111827', marginBottom: '1rem' }}>
                Painel de Controle
            </h1>
            <p style={{ color: '#4b5563', marginBottom: '2rem' }}>
                Bem-vindo! Aqui está o resumo dos seus investimentos.
            </p>

            <PatrimonioTotal valorTotal={user.saldo} mudanca={mudanca} />
        </div>
    );
}