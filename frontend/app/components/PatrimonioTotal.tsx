import { Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface Mudanca {
  crescimento?: boolean;
  porcentagem: number;
}

interface PatrimonioProps {
  valorTotal: number;
  mudanca: Mudanca;
}

function useCountUp(target: number, duration = 1400) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const prevTarget = useRef(0);

  useEffect(() => {
    const start = prevTarget.current;
    prevTarget.current = target;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    startRef.current = null;

    const step = (timestamp: number) => {
      if (!startRef.current) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(start + (target - start) * eased);
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration]);

  return value;
}

export default function PatrimonioTotal({ valorTotal, mudanca }: PatrimonioProps) {
  const animatedValue = useCountUp(valorTotal);

  const valorFormatado = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(animatedValue);

  const positivo = mudanca.crescimento !== false;

  return (
    <div className="
      relative flex items-center gap-5 p-5 rounded-2xl
      bg-white dark:bg-gray-800
      border border-violet-200/60 dark:border-violet-800/40
      shadow-sm
      hover:shadow-lg hover:shadow-violet-500/10 hover:-translate-y-0.5
      transition-all duration-300 ease-out
    ">
      <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-linear-to-br from-violet-500 to-indigo-600 text-white shrink-0 shadow-md shadow-violet-500/30">
        <Wallet size={22} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider select-none">
          Patrimônio Total
        </p>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-1 tabular-nums">
          {valorFormatado}
        </h2>
      </div>
      <div
        className={`
          flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold
          ${positivo
            ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
            : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
          }
        `}
      >
        {positivo ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
        {mudanca.porcentagem}%
      </div>
    </div>
  );
}
