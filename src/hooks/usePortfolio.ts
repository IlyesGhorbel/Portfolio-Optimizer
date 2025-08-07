import { useState, useEffect, useCallback } from 'react';
import { Asset, Portfolio } from '../types';
import { getAssets, updateAssetPrices, calculatePortfolio } from '../services/portfolio';

export const usePortfolio = (userId: string | null) => {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPortfolio = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const assets = getAssets(userId);
      const updatedAssets = await updateAssetPrices(userId);
      const portfolioData = calculatePortfolio(updatedAssets);
      setPortfolio(portfolioData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement du portefeuille');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const refreshPrices = useCallback(async () => {
    if (!userId) return;

    try {
      const updatedAssets = await updateAssetPrices(userId);
      const portfolioData = calculatePortfolio(updatedAssets);
      setPortfolio(portfolioData);
    } catch (err) {
      console.error('Erreur lors de la mise à jour des prix:', err);
    }
  }, [userId]);

  // Mise à jour automatique des prix crypto toutes les 5 minutes
  useEffect(() => {
    if (!userId || !portfolio) return;

    const cryptoAssets = portfolio.assets.filter(asset => 
      asset.symbol.includes('BINANCE:') || 
      asset.symbol.includes('USDT') || 
      ['BTC', 'ETH', 'XRP', 'ADA', 'SOL', 'DOT', 'AVAX', 'MATIC', 'LINK', 'UNI'].includes(asset.symbol)
    );

    if (cryptoAssets.length === 0) return;

    console.log(`🔄 Setting up automatic crypto price updates for ${cryptoAssets.length} cryptocurrencies`);
    console.log(`📋 Crypto assets: ${cryptoAssets.map(a => a.symbol).join(', ')}`);

    const interval = setInterval(() => {
      console.log('⏰ Automatic crypto price update triggered...');
      refreshPrices();
    }, 5 * 60 * 1000); // 5 minutes

    return () => {
      console.log('🛑 Stopping automatic crypto price updates');
      clearInterval(interval);
    };
  }, [userId, portfolio, refreshPrices]);

  useEffect(() => {
    loadPortfolio();
  }, [loadPortfolio]);

  return {
    portfolio,
    loading,
    error,
    refreshPortfolio: loadPortfolio,
    refreshPrices,
  };
};