import { Wallet, TrendingUp } from "lucide-react";

interface Mudanca {
    crescimento?: boolean,
    porcentagem: number,
}

interface PatrimonioProps {
    valorTotal: number;
    mudanca: Mudanca;
}

export default function PatrimonioTotal({ valorTotal, mudanca }: PatrimonioProps) {
    const valorFormatado = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valorTotal);

    return (
        <div style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            width: '350px'
        }}>
            <div style={{
                backgroundColor: '#eff6ff', padding: '1rem',
                borderRadius: '50%', color: '#3b82f6', display: 'flex'
            }}>
                <Wallet size={28} />
            </div>
            <div>
                <p style={{ color: '#6b7280', margin: 0, fontSize: '0.875rem', fontWeight: '500' }}>
                    Patrimônio Total
                </p>
                <h2 style={{ color: '#111827', margin: '0.25rem 0 0 0', fontSize: '1.5rem' }}>
                    {valorFormatado}
                </h2>
            </div>
            <div>
                <div style={{
                    backgroundColor: '#e2eeff', padding: '0.3rem',
                    borderRadius: '10%', color: '#24c24c', display: 'flex',
                }}>
                    <div>
                        <TrendingUp size={18} />
                    </div>
                    <div style={{
                        paddingLeft: '0.6rem'
                    }}>
                        {mudanca.porcentagem}%
                    </div>
                </div>
            </div>

        </div>
    )
}