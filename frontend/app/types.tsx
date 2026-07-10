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
}

export interface TransacaoBackend {
  id: number;
  Quantidade: number;
  preco_unitario: number;
  Ativo: {
    ticker: string;
    nome: string;
  };
}
