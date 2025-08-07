import { Asset, Transaction, Portfolio } from '../types';
import { fetchMultiplePrices } from './api';

const ASSETS_KEY = 'portfolio_assets';
const TRANSACTIONS_KEY = 'portfolio_transactions';

export const getAssets = (userId: string): Asset[] => {
  const stored = localStorage.getItem(ASSETS_KEY);
  if (!stored) return [];
  
  try {
    const allAssets: Asset[] = JSON.parse(stored);
    return allAssets.filter(asset => asset.userId === userId);
  } catch {
    return [];
  }
};

export const addAsset = (asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>): Asset => {
  const assets = getAllAssets();
  const newAsset: Asset = {
    ...asset,
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  assets.push(newAsset);
  localStorage.setItem(ASSETS_KEY, JSON.stringify(assets));
  
  // Add transaction record
  addTransaction({
    userId: asset.userId,
    assetId: newAsset.id,
    type: 'buy',
    quantity: asset.quantity,
    price: asset.purchasePrice,
    date: asset.purchaseDate,
  });
  
  return newAsset;
};

export const updateAsset = (assetId: string, updates: Partial<Asset>): Asset => {
  const assets = getAllAssets();
  const index = assets.findIndex(a => a.id === assetId);
  
  if (index === -1) {
    throw new Error('Asset not found');
  }
  
  const updatedAsset = {
    ...assets[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  assets[index] = updatedAsset;
  localStorage.setItem(ASSETS_KEY, JSON.stringify(assets));
  
  // Add transaction record
  addTransaction({
    userId: updatedAsset.userId,
    assetId: assetId,
    type: 'edit',
    quantity: updatedAsset.quantity,
    price: updatedAsset.purchasePrice,
    date: new Date().toISOString(),
  });
  
  return updatedAsset;
};

export const deleteAsset = (assetId: string): void => {
  const assets = getAllAssets();
  const asset = assets.find(a => a.id === assetId);
  
  if (!asset) {
    throw new Error('Asset not found');
  }
  
  const filteredAssets = assets.filter(a => a.id !== assetId);
  localStorage.setItem(ASSETS_KEY, JSON.stringify(filteredAssets));
  
  // Add transaction record
  addTransaction({
    userId: asset.userId,
    assetId: assetId,
    type: 'delete',
    quantity: asset.quantity,
    price: asset.purchasePrice,
    date: new Date().toISOString(),
  });
};

export const updateAssetPrices = async (userId: string): Promise<Asset[]> => {
  const assets = getAssets(userId);
  if (assets.length === 0) return assets;
  
  const symbols = [...new Set(assets.map(a => a.symbol))];
  const prices = await fetchMultiplePrices(symbols);
  
  const updatedAssets = assets.map(asset => ({
    ...asset,
    currentPrice: prices[asset.symbol] || asset.currentPrice,
    updatedAt: new Date().toISOString(),
  }));
  
  // Update storage
  const allAssets = getAllAssets();
  updatedAssets.forEach(updatedAsset => {
    const index = allAssets.findIndex(a => a.id === updatedAsset.id);
    if (index !== -1) {
      allAssets[index] = updatedAsset;
    }
  });
  
  localStorage.setItem(ASSETS_KEY, JSON.stringify(allAssets));
  
  return updatedAssets;
};

export const calculatePortfolio = (assets: Asset[]): Portfolio => {
  const totalInvested = assets.reduce((sum, asset) => 
    sum + (asset.quantity * asset.purchasePrice), 0
  );
  
  const totalValue = assets.reduce((sum, asset) => 
    sum + (asset.quantity * asset.currentPrice), 0
  );
  
  const totalGainLoss = totalValue - totalInvested;
  const totalGainLossPercent = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;
  
  return {
    totalValue,
    totalInvested,
    totalGainLoss,
    totalGainLossPercent,
    assets,
  };
};

export const getTransactions = (userId: string): Transaction[] => {
  const stored = localStorage.getItem(TRANSACTIONS_KEY);
  if (!stored) return [];
  
  try {
    const allTransactions: Transaction[] = JSON.parse(stored);
    return allTransactions
      .filter(t => t.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch {
    return [];
  }
};

const addTransaction = (transaction: Omit<Transaction, 'id' | 'createdAt'>): void => {
  const transactions = getAllTransactions();
  const newTransaction: Transaction = {
    ...transaction,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  
  transactions.push(newTransaction);
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
};

const getAllAssets = (): Asset[] => {
  const stored = localStorage.getItem(ASSETS_KEY);
  if (!stored) return [];
  
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

const getAllTransactions = (): Transaction[] => {
  const stored = localStorage.getItem(TRANSACTIONS_KEY);
  if (!stored) return [];
  
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};