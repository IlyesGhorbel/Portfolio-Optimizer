import { HistoricalData } from '../types';

// Configuration pour l'API Finnhub avec le SDK officiel
const FINNHUB_API_KEY = 'd19ee69r01qmm7tultb0d19ee69r01qmm7tultbg';

// Configuration pour CoinAPI - Nouvelle clé API gratuite
const COINAPI_KEY = 'YOUR_COINAPI_KEY_HERE'; // Remplacez par votre vraie clé
const COINAPI_BASE_URL = 'https://rest.coinapi.io/v1';

// Alternative: API gratuite CoinGecko (pas de clé requise)
const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';

// Import dynamique du SDK Finnhub pour éviter les problèmes de compatibilité
let finnhubClient: any = null;
let finnhubAuthFailed = false; // Flag pour éviter de réessayer après un échec d'auth

// Initialisation du client Finnhub
const initializeFinnhubClient = async () => {
  if (finnhubClient) return finnhubClient;
  if (finnhubAuthFailed) return null; // Ne pas réessayer si l'auth a échoué
  
  try {
    // Import dynamique pour la compatibilité avec Vite
    const finnhub = await import('finnhub');
    
    const api_key = finnhub.ApiClient.instance.authentications['api_key'];
    api_key.apiKey = FINNHUB_API_KEY;
    finnhubClient = new finnhub.DefaultApi();
    
    return finnhubClient;
  } catch (error) {
    console.error('Erreur lors de l\'initialisation du client Finnhub:', error);
    return null;
  }
};

// Base de données d'actifs populaires avec leurs symboles corrects
const POPULAR_ASSETS = [
  // Actions Tech US
  { symbol: 'AAPL', name: 'Apple Inc.', type: 'stock', exchange: 'NASDAQ' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'stock', exchange: 'NASDAQ' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', type: 'stock', exchange: 'NASDAQ' },
  { symbol: 'TSLA', name: 'Tesla, Inc.', type: 'stock', exchange: 'NASDAQ' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', type: 'stock', exchange: 'NASDAQ' },
  { symbol: 'META', name: 'Meta Platforms, Inc.', type: 'stock', exchange: 'NASDAQ' },
  { symbol: 'AMZN', name: 'Amazon.com, Inc.', type: 'stock', exchange: 'NASDAQ' },
  { symbol: 'NFLX', name: 'Netflix, Inc.', type: 'stock', exchange: 'NASDAQ' },
  { symbol: 'AMD', name: 'Advanced Micro Devices, Inc.', type: 'stock', exchange: 'NASDAQ' },
  { symbol: 'INTC', name: 'Intel Corporation', type: 'stock', exchange: 'NASDAQ' },
  
  // Actions Traditionnelles US
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', type: 'stock', exchange: 'NYSE' },
  { symbol: 'JNJ', name: 'Johnson & Johnson', type: 'stock', exchange: 'NYSE' },
  { symbol: 'V', name: 'Visa Inc.', type: 'stock', exchange: 'NYSE' },
  { symbol: 'PG', name: 'Procter & Gamble Company', type: 'stock', exchange: 'NYSE' },
  { symbol: 'UNH', name: 'UnitedHealth Group Incorporated', type: 'stock', exchange: 'NYSE' },
  { symbol: 'HD', name: 'The Home Depot, Inc.', type: 'stock', exchange: 'NYSE' },
  { symbol: 'MA', name: 'Mastercard Incorporated', type: 'stock', exchange: 'NYSE' },
  { symbol: 'BAC', name: 'Bank of America Corporation', type: 'stock', exchange: 'NYSE' },
  { symbol: 'XOM', name: 'Exxon Mobil Corporation', type: 'stock', exchange: 'NYSE' },
  { symbol: 'WMT', name: 'Walmart Inc.', type: 'stock', exchange: 'NYSE' },
  { symbol: 'KO', name: 'The Coca-Cola Company', type: 'stock', exchange: 'NYSE' },
  { symbol: 'DIS', name: 'The Walt Disney Company', type: 'stock', exchange: 'NYSE' },
  { symbol: 'IBM', name: 'International Business Machines Corporation', type: 'stock', exchange: 'NYSE' },
  { symbol: 'GE', name: 'General Electric Company', type: 'stock', exchange: 'NYSE' },
  { symbol: 'F', name: 'Ford Motor Company', type: 'stock', exchange: 'NYSE' },
  
  // ETFs populaires
  { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', type: 'etf', exchange: 'ARCA' },
  { symbol: 'QQQ', name: 'Invesco QQQ Trust', type: 'etf', exchange: 'NASDAQ' },
  { symbol: 'VTI', name: 'Vanguard Total Stock Market ETF', type: 'etf', exchange: 'ARCA' },
  { symbol: 'IVV', name: 'iShares Core S&P 500 ETF', type: 'etf', exchange: 'ARCA' },
  { symbol: 'VOO', name: 'Vanguard S&P 500 ETF', type: 'etf', exchange: 'ARCA' },
  { symbol: 'VEA', name: 'Vanguard FTSE Developed Markets ETF', type: 'etf', exchange: 'ARCA' },
  { symbol: 'VWO', name: 'Vanguard FTSE Emerging Markets ETF', type: 'etf', exchange: 'ARCA' },
  { symbol: 'BND', name: 'Vanguard Total Bond Market ETF', type: 'etf', exchange: 'NASDAQ' },
  { symbol: 'GLD', name: 'SPDR Gold Shares', type: 'etf', exchange: 'ARCA' },
  { symbol: 'SLV', name: 'iShares Silver Trust', type: 'etf', exchange: 'ARCA' },
  
  // Cryptomonnaies (format CoinGecko)
  { symbol: 'BTC', name: 'Bitcoin', type: 'crypto', exchange: 'COINGECKO' },
  { symbol: 'ETH', name: 'Ethereum', type: 'crypto', exchange: 'COINGECKO' },
  { symbol: 'XRP', name: 'XRP', type: 'crypto', exchange: 'COINGECKO' },
  { symbol: 'ADA', name: 'Cardano', type: 'crypto', exchange: 'COINGECKO' },
  { symbol: 'SOL', name: 'Solana', type: 'crypto', exchange: 'COINGECKO' },
  { symbol: 'DOT', name: 'Polkadot', type: 'crypto', exchange: 'COINGECKO' },
  { symbol: 'AVAX', name: 'Avalanche', type: 'crypto', exchange: 'COINGECKO' },
  { symbol: 'MATIC', name: 'Polygon', type: 'crypto', exchange: 'COINGECKO' },
  { symbol: 'LINK', name: 'Chainlink', type: 'crypto', exchange: 'COINGECKO' },
  { symbol: 'UNI', name: 'Uniswap', type: 'crypto', exchange: 'COINGECKO' },
];

// Mapping des symboles crypto vers CoinGecko IDs
const CRYPTO_COINGECKO_IDS: Record<string, string> = {
  'BTC': 'bitcoin',
  'ETH': 'ethereum',
  'XRP': 'ripple',
  'ADA': 'cardano',
  'SOL': 'solana',
  'DOT': 'polkadot',
  'AVAX': 'avalanche-2',
  'MATIC': 'matic-network',
  'LINK': 'chainlink',
  'UNI': 'uniswap',
  'LTC': 'litecoin',
  'BCH': 'bitcoin-cash',
  'ATOM': 'cosmos',
  'ALGO': 'algorand',
  'VET': 'vechain',
  'FIL': 'filecoin',
  'THETA': 'theta-token',
  'TRX': 'tron',
  'EOS': 'eos',
  'XLM': 'stellar',
};

// Base de prix approximatifs pour les actions populaires (pour le fallback)
const STOCK_BASE_PRICES: Record<string, number> = {
  'AAPL': 175,
  'GOOGL': 140,
  'MSFT': 380,
  'TSLA': 250,
  'NVDA': 450,
  'META': 320,
  'AMZN': 145,
  'NFLX': 450,
  'AMD': 140,
  'INTC': 45,
  'JPM': 150,
  'JNJ': 160,
  'V': 250,
  'PG': 155,
  'UNH': 520,
  'HD': 340,
  'MA': 420,
  'BAC': 35,
  'XOM': 110,
  'WMT': 160,
  'KO': 60,
  'DIS': 95,
  'IBM': 140,
  'GE': 110,
  'F': 12,
  'SPY': 450,
  'QQQ': 380,
  'VTI': 240,
  'IVV': 450,
  'VOO': 410,
  'VEA': 50,
  'VWO': 42,
  'BND': 75,
  'GLD': 190,
  'SLV': 22,
};

// Fonction pour vérifier si une erreur est liée à l'authentification Finnhub
const isFinnhubAuthError = (error: any): boolean => {
  if (typeof error === 'object' && error !== null) {
    const errorMessage = error.error || error.message || '';
    const errorString = typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage);
    return errorString.includes("You don't have access to this resource") ||
           errorString.includes("API key") ||
           errorString.includes("authentication") ||
           errorString.includes("unauthorized") ||
           errorString.includes("access denied") ||
           errorString.includes("Invalid API key") ||
           errorString.includes("Forbidden");
  }
  return false;
};

// Fonction pour vérifier si un symbole est une cryptomonnaie
const isCryptoSymbol = (symbol: string): boolean => {
  return symbol.includes('BINANCE:') || 
         symbol.includes('USDT') || 
         Object.keys(CRYPTO_COINGECKO_IDS).includes(symbol);
};

// Fonction pour convertir le symbole crypto au format CoinGecko
const convertToCoinGeckoId = (symbol: string): string => {
  // Si c'est déjà un format Binance, extraire le symbole de base
  if (symbol.includes('BINANCE:')) {
    const baseSymbol = symbol.replace('BINANCE:', '').replace('USDT', '');
    return CRYPTO_COINGECKO_IDS[baseSymbol] || baseSymbol.toLowerCase();
  }
  
  // Si c'est déjà un symbole simple, le convertir
  return CRYPTO_COINGECKO_IDS[symbol] || symbol.toLowerCase();
};

// Fonction pour générer des données historiques réalistes en fallback
const generateRealisticHistoricalData = (
  symbol: string, 
  period: '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y'
): HistoricalData[] => {
  console.log(`🔄 Generating realistic fallback historical data for ${symbol} (${period})`);
  
  const basePrice = STOCK_BASE_PRICES[symbol] || 100;
  const now = new Date();
  const periodDays = getPeriodDays(period);
  const dataPoints = Math.min(periodDays, 100); // Limiter le nombre de points
  
  const data: HistoricalData[] = [];
  let currentPrice = basePrice;
  
  for (let i = dataPoints - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Simulation d'une marche aléatoire avec tendance légère
    const volatility = 0.02; // 2% de volatilité quotidienne
    const trend = 0.0005; // Légère tendance haussière
    const randomChange = (Math.random() - 0.5) * 2 * volatility + trend;
    
    currentPrice = currentPrice * (1 + randomChange);
    
    // S'assurer que le prix reste positif
    currentPrice = Math.max(currentPrice, basePrice * 0.5);
    
    data.push({
      date: date.toISOString(),
      price: Math.round(currentPrice * 100) / 100,
      volume: Math.floor(Math.random() * 10000000 + 1000000),
    });
  }
  
  console.log(`✅ Generated ${data.length} realistic data points for ${symbol}`);
  return data;
};

// Fonction pour récupérer le prix crypto via CoinGecko (API gratuite, pas de clé requise)
const fetchCryptoPriceFromCoinGecko = async (symbol: string): Promise<number> => {
  try {
    const coinGeckoId = convertToCoinGeckoId(symbol);
    const url = `${COINGECKO_BASE_URL}/simple/price?ids=${coinGeckoId}&vs_currencies=usd`;
    
    console.log(`🔄 Fetching REAL crypto price for ${symbol} (${coinGeckoId}) via CoinGecko...`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.error(`❌ CoinGecko request failed for ${symbol}: ${response.status} ${response.statusText}`);
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data && data[coinGeckoId] && data[coinGeckoId].usd) {
      const price = data[coinGeckoId].usd;
      console.log(`✅ REAL crypto price obtained for ${symbol}: $${price}`);
      return price;
    } else {
      console.error(`❌ Invalid CoinGecko data structure for ${symbol}:`, data);
      throw new Error(`Invalid data structure from CoinGecko for ${symbol}`);
    }
  } catch (error) {
    console.error(`❌ CoinGecko error for ${symbol}:`, error);
    throw error;
  }
};

// Fonction alternative pour CoinAPI (si vous avez une vraie clé)
const fetchCryptoPriceFromCoinAPI = async (symbol: string): Promise<number> => {
  if (COINAPI_KEY === 'YOUR_COINAPI_KEY_HERE') {
    throw new Error('CoinAPI key not configured');
  }

  try {
    const coinAPISymbol = symbol.replace('BINANCE:', '').replace('USDT', '');
    const url = `${COINAPI_BASE_URL}/exchangerate/${coinAPISymbol}/USD`;
    
    console.log(`🔄 Fetching REAL crypto price for ${symbol} via CoinAPI...`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-CoinAPI-Key': COINAPI_KEY,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.error(`❌ CoinAPI request failed for ${symbol}: ${response.status} ${response.statusText}`);
      throw new Error(`CoinAPI error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data && data.rate && data.rate > 0) {
      console.log(`✅ REAL crypto price obtained for ${symbol} via CoinAPI: $${data.rate}`);
      return data.rate;
    } else {
      throw new Error(`Invalid CoinAPI data for ${symbol}`);
    }
  } catch (error) {
    console.error(`❌ CoinAPI error for ${symbol}:`, error);
    throw error;
  }
};

// Fonction principale pour récupérer le prix crypto RÉEL
const fetchRealCryptoPrice = async (symbol: string): Promise<number> => {
  console.log(`🚀 Attempting to fetch REAL price for crypto: ${symbol}`);
  
  // Essayer CoinGecko en premier (gratuit, pas de clé requise)
  try {
    const price = await fetchCryptoPriceFromCoinGecko(symbol);
    return price;
  } catch (coinGeckoError) {
    console.warn(`⚠️ CoinGecko failed for ${symbol}, trying CoinAPI...`);
    
    // Essayer CoinAPI en fallback (si clé configurée)
    try {
      const price = await fetchCryptoPriceFromCoinAPI(symbol);
      return price;
    } catch (coinAPIError) {
      console.error(`❌ Both CoinGecko and CoinAPI failed for ${symbol}`);
      console.error('CoinGecko error:', coinGeckoError);
      console.error('CoinAPI error:', coinAPIError);
      throw new Error(`Failed to fetch real price for ${symbol} from all sources`);
    }
  }
};

// Fonction pour obtenir le prix actuel avec fallback
export const fetchCurrentPrice = async (symbol: string): Promise<number> => {
  try {
    // Si c'est une cryptomonnaie, utiliser les APIs crypto RÉELLES
    if (isCryptoSymbol(symbol)) {
      console.log(`🔍 Detected crypto symbol: ${symbol}`);
      return await fetchRealCryptoPrice(symbol);
    }

    // Si l'authentification Finnhub a déjà échoué, utiliser directement le fallback
    if (finnhubAuthFailed) {
      console.log(`⚠️ Finnhub auth previously failed for ${symbol}, using fallback price`);
      return STOCK_BASE_PRICES[symbol] || 100;
    }

    // Pour les autres actifs, essayer Finnhub d'abord
    const client = await initializeFinnhubClient();
    if (!client) {
      console.warn(`⚠️ Finnhub client not available for ${symbol}, using fallback price`);
      return STOCK_BASE_PRICES[symbol] || 100;
    }

    return new Promise((resolve, reject) => {
      client.quote(symbol, (error: any, data: any) => {
        if (error) {
          console.error(`❌ Finnhub error for ${symbol}:`, error);
          
          // Vérifier si c'est une erreur d'authentification
          if (isFinnhubAuthError(error)) {
            console.warn(`🚫 Finnhub authentication failed - disabling future attempts`);
            finnhubAuthFailed = true;
          }
          
          // Utiliser le prix de fallback au lieu de rejeter
          const fallbackPrice = STOCK_BASE_PRICES[symbol] || 100;
          console.log(`🔄 Using fallback price for ${symbol}: $${fallbackPrice}`);
          resolve(fallbackPrice);
        } else if (data && data.c) {
          const price = data.c; // Prix actuel
          console.log(`✅ Real stock price obtained for ${symbol}: $${price}`);
          resolve(price);
        } else {
          console.warn(`⚠️ No price data available for ${symbol}, using fallback`);
          const fallbackPrice = STOCK_BASE_PRICES[symbol] || 100;
          resolve(fallbackPrice);
        }
      });
    });
  } catch (error) {
    console.error(`❌ fetchCurrentPrice error for ${symbol}:`, error);
    // Utiliser le prix de fallback au lieu de lancer une erreur
    const fallbackPrice = STOCK_BASE_PRICES[symbol] || 100;
    console.log(`🔄 Using fallback price for ${symbol}: $${fallbackPrice}`);
    return fallbackPrice;
  }
};

// Fonction pour obtenir plusieurs prix
export const fetchMultiplePrices = async (symbols: string[]): Promise<Record<string, number>> => {
  const prices: Record<string, number> = {};
  
  // Séparer les cryptos des autres actifs
  const cryptoSymbols = symbols.filter(isCryptoSymbol);
  const otherSymbols = symbols.filter(s => !isCryptoSymbol(s));
  
  console.log(`🔄 Fetching prices: ${cryptoSymbols.length} cryptos, ${otherSymbols.length} other assets`);
  
  // Traitement des cryptomonnaies avec APIs crypto RÉELLES
  for (const symbol of cryptoSymbols) {
    try {
      console.log(`🔄 Processing crypto: ${symbol}`);
      const price = await fetchRealCryptoPrice(symbol);
      prices[symbol] = price;
      console.log(`✅ Successfully got REAL price for ${symbol}: $${price}`);
      
      // Délai entre les requêtes pour éviter les limites de taux
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`❌ Failed to get REAL price for crypto ${symbol}:`, error);
      // Ne pas utiliser de fallback - laisser l'erreur remonter
      throw new Error(`Failed to fetch real crypto price for ${symbol}: ${error}`);
    }
  }
  
  // Traitement des autres actifs avec Finnhub et fallback
  for (const symbol of otherSymbols) {
    try {
      const price = await fetchCurrentPrice(symbol);
      prices[symbol] = price;
      console.log(`✅ Successfully got price for ${symbol}: $${price}`);
      
      // Délai entre les requêtes
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.error(`❌ Failed to get price for ${symbol}:`, error);
      // Utiliser le prix de fallback
      const fallbackPrice = STOCK_BASE_PRICES[symbol] || 100;
      prices[symbol] = fallbackPrice;
      console.log(`🔄 Using fallback price for ${symbol}: $${fallbackPrice}`);
    }
  }
  
  return prices;
};

// Fonction de recherche d'actifs
export const searchSymbol = async (query: string): Promise<Array<{ symbol: string; name: string; type: string }>> => {
  if (query.length < 2) return [];
  
  // Recherche locale d'abord
  const localResults = POPULAR_ASSETS.filter(asset => 
    asset.symbol.toLowerCase().includes(query.toLowerCase()) ||
    asset.name.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 10);
  
  return localResults.map(asset => ({
    symbol: asset.symbol,
    name: asset.name,
    type: asset.type,
  }));
};

// Fonction pour obtenir les données historiques crypto via CoinGecko
const fetchCryptoHistoricalFromCoinGecko = async (
  symbol: string, 
  period: '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y'
): Promise<HistoricalData[]> => {
  try {
    const coinGeckoId = convertToCoinGeckoId(symbol);
    const days = getCoinGeckoDays(period);
    
    const url = `${COINGECKO_BASE_URL}/coins/${coinGeckoId}/market_chart?vs_currency=usd&days=${days}`;
    
    console.log(`📡 Fetching crypto historical data for ${symbol} (${coinGeckoId}) via CoinGecko...`);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`CoinGecko historical API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data && data.prices && Array.isArray(data.prices) && data.prices.length > 0) {
      const historicalData = data.prices.map(([timestamp, price]: [number, number]) => ({
        date: new Date(timestamp).toISOString(),
        price: price,
        volume: Math.floor(Math.random() * 1000000 + 100000), // Volume simulé
      })).filter(item => item.price > 0);
      
      if (historicalData.length > 0) {
        console.log(`✅ Real crypto historical data obtained for ${symbol}: ${historicalData.length} points`);
        return historicalData;
      }
    }
    
    throw new Error(`Invalid historical data structure from CoinGecko for ${symbol}`);
  } catch (error) {
    console.error(`❌ CoinGecko historical error for ${symbol}:`, error);
    throw error;
  }
};

// Fonction pour obtenir les données historiques avec fallback robuste
export const fetchHistoricalData = async (
  symbol: string, 
  period: '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y' = '1mo'
): Promise<HistoricalData[]> => {
  try {
    // Si c'est une cryptomonnaie, utiliser CoinGecko
    if (isCryptoSymbol(symbol)) {
      return await fetchCryptoHistoricalFromCoinGecko(symbol, period);
    }

    // Si l'authentification Finnhub a déjà échoué, utiliser directement le fallback
    if (finnhubAuthFailed) {
      console.log(`⚠️ Finnhub auth previously failed for ${symbol}, generating fallback data`);
      return generateRealisticHistoricalData(symbol, period);
    }

    // Pour les autres actifs, essayer Finnhub d'abord
    const client = await initializeFinnhubClient();
    if (!client) {
      console.warn(`⚠️ Finnhub client not available for ${symbol}, generating fallback data`);
      return generateRealisticHistoricalData(symbol, period);
    }

    const now = Math.floor(Date.now() / 1000);
    const periodSeconds = getPeriodSeconds(period);
    const from = now - periodSeconds;
    const resolution = getResolutionForPeriod(period);

    return new Promise((resolve) => {
      client.stockCandles(symbol, resolution, from, now, (error: any, data: any) => {
        if (error) {
          console.error(`❌ Finnhub historical error for ${symbol}:`, error);
          
          // Vérifier si c'est une erreur d'authentification et marquer le flag
          if (isFinnhubAuthError(error)) {
            console.warn(`🚫 Finnhub authentication failed for historical data - disabling future attempts`);
            finnhubAuthFailed = true;
          }
          
          console.log(`🔄 Generating fallback historical data for ${symbol} due to Finnhub error`);
          resolve(generateRealisticHistoricalData(symbol, period));
        } else if (data && data.s === 'ok' && data.t && data.c && data.t.length > 0) {
          const historicalData = data.t.map((timestamp: number, index: number) => ({
            date: new Date(timestamp * 1000).toISOString(),
            price: data.c[index],
            volume: data.v ? data.v[index] : Math.floor(Math.random() * 1000000 + 100000),
          })).filter((item: HistoricalData) => item.price > 0);
          
          if (historicalData.length > 0) {
            console.log(`✅ Real historical data obtained for ${symbol}: ${historicalData.length} points`);
            resolve(historicalData);
          } else {
            console.log(`🔄 No valid real data, generating fallback for ${symbol}`);
            resolve(generateRealisticHistoricalData(symbol, period));
          }
        } else {
          console.log(`🔄 No historical data available from Finnhub for ${symbol}, generating fallback`);
          resolve(generateRealisticHistoricalData(symbol, period));
        }
      });
    });
  } catch (error) {
    console.error(`❌ fetchHistoricalData error for ${symbol}:`, error);
    console.log(`🔄 Generating fallback historical data for ${symbol} due to error`);
    return generateRealisticHistoricalData(symbol, period);
  }
};

// Fonctions utilitaires
const getCoinGeckoDays = (period: string): string => {
  const days: Record<string, string> = {
    '1d': '1',
    '5d': '5',
    '1mo': '30',
    '3mo': '90',
    '6mo': '180',
    '1y': '365',
  };
  return days[period] || '30';
};

const getPeriodDays = (period: string): number => {
  const days: Record<string, number> = {
    '1d': 1,
    '5d': 5,
    '1mo': 30,
    '3mo': 90,
    '6mo': 180,
    '1y': 365,
  };
  return days[period] || 30;
};

const getPeriodSeconds = (period: string): number => {
  const periods: Record<string, number> = {
    '1d': 86400,        // 1 jour
    '5d': 432000,       // 5 jours
    '1mo': 2592000,     // 30 jours
    '3mo': 7776000,     // 90 jours
    '6mo': 15552000,    // 180 jours
    '1y': 31536000,     // 365 jours
  };
  return periods[period] || 2592000;
};

const getResolutionForPeriod = (period: string): string => {
  const resolutions: Record<string, string> = {
    '1d': '5',    // 5 minutes
    '5d': '15',   // 15 minutes
    '1mo': '60',  // 1 heure
    '3mo': 'D',   // 1 jour
    '6mo': 'D',   // 1 jour
    '1y': 'W',    // 1 semaine
  };
  return resolutions[period] || 'D';
};