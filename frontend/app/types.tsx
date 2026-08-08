export interface User {
  fullname: string;
  email: string;
  picture: string;
  saldo: number;
}

export interface Ativo {
  id?: string;
  ticker: string;
  nome: string;
  quantidade?: number;
  preco?: number;
  preco_medio?: number;
}

export interface TransacaoBackend {
  ID: number;
  Quantidade: number;
  preco_unitario?: number;
  preco_medio?: number;
  Ativo: {
    ticker: string;
    nome: string;
  };
}

export interface HistoricoAtivo {
  data: string;
  preco_unitario: number;
  tipo: string;
}