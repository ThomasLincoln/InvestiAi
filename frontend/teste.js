import { promisify } from 'util';
import YahooFinance from 'yahoo-finance2';
const yahooFinance = new YahooFinance()

const b3Tickers = [
  'PETR4.SA', // Petrobras PN
  'VALE3.SA', // Vale ON
  'ITUB4.SA', // Itaúsa PN
  'BBDC4.SA', // Bradesco PN
  'ABEV3.SA'   // Ambev ON
];

async function getStockData(ticker) {
  try {
    // CORREÇÃO 1: Usar o nome exato da importação (F maiúsculo)
    const stock = await yahooFinance.quote(ticker);

    if (!stock || !stock.regularMarketPrice) return null;

    return {
      ticker: ticker,
      name: stock.shortName || 'N/A',
      price: stock.regularMarketPrice,
      change: stock.regularMarketChangePercent,
      marketCap: stock.marketCap // CORREÇÃO 2: Removido o formatNumber
    };
  } catch (e) {
    // CORREÇÃO 3: Usar 'e.message' e não 'error.message'
    throw new Error(`Erro ao acessar ${ticker}: ${e.message}`);
  }
}

(async () => {
  try {
    const stockData = [];
    for (const ticker of b3Tickers) {
      try {
        const data = await getStockData(ticker);

        // CORREÇÃO 5: Verificar 'data.price', pois o 'regularMarketPrice' ficou para trás
        if (data && data.price) {
          stockData.push(data);
          console.log(`Ativo validado: ${data.ticker} - R$${data.price}`);
        }
      } catch (e) {
        console.log(`Ativo inválido ou indisponível no momento:`, ticker);
        console.log(e.message)
      }
    }
    console.log(`\nTotal de Ativos Encontrados: ${stockData.length}`);
  } catch (e) {
    console.error('Erro na API:', error);
  }
})();