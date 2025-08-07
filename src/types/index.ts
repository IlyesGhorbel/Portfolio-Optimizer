export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Asset {
  id: string;
  userId: string;
  symbol: string;
  name: string;
  type: AssetType;
  quantity: number;
  purchasePrice: number;
  purchaseDate: string;
  currentPrice: number;
  currency: Currency;
  createdAt: string;
  updatedAt: string;
}

export type AssetType = 'stock' | 'crypto' | 'etf' | 'option' | 'bond' | 'commodity';

export type Currency = 'USD' | 'EUR' | 'BTC';

export interface Portfolio {
  totalValue: number;
  totalInvested: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  assets: Asset[];
}

export interface Transaction {
  id: string;
  userId: string;
  assetId: string;
  type: 'buy' | 'sell' | 'edit' | 'delete';
  quantity: number;
  price: number;
  date: string;
  createdAt: string;
}

export interface PriceData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  lastUpdate: string;
}

export interface HistoricalData {
  date: string;
  price: number;
  volume: number;
}

export interface RealTimeData {
  symbol: string;
  name: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  historicalData: HistoricalData[];
  lastUpdate: string;
}