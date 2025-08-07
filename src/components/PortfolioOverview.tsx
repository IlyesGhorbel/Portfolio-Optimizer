import React from 'react';
import { Portfolio } from '../types';
import { TrendingUp, TrendingDown, DollarSign, RefreshCw } from 'lucide-react';

interface PortfolioOverviewProps {
  portfolio: Portfolio | null;
  loading: boolean;
  onRefresh: () => void;
}

export const PortfolioOverview: React.FC<PortfolioOverviewProps> = ({ 
  portfolio, 
  loading, 
  onRefresh 
}) => {
  if (loading && !portfolio) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Commencer votre portefeuille
        </h3>
        <p className="text-gray-500">
          Ajoutez vos premiers actifs pour voir votre performance
        </p>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const formatPercent = (percent: number) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  const isPositive = portfolio.totalGainLoss >= 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Vue d'ensemble du portefeuille</h2>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Valeur totale */}
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Valeur totale</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(portfolio.totalValue)}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Montant investi */}
        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-gray-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Montant investi</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(portfolio.totalInvested)}
              </p>
            </div>
            <div className="bg-gray-100 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-gray-600" />
            </div>
          </div>
        </div>

        {/* Gain/Perte */}
        <div className={`bg-white rounded-xl shadow-sm p-6 border-l-4 ${
          isPositive ? 'border-green-500' : 'border-red-500'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Gain/Perte</p>
              <p className={`text-3xl font-bold ${
                isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(portfolio.totalGainLoss)}
              </p>
              <p className={`text-sm font-medium ${
                isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatPercent(portfolio.totalGainLossPercent)}
              </p>
            </div>
            <div className={`p-3 rounded-full ${
              isPositive ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {isPositive ? (
                <TrendingUp className="h-6 w-6 text-green-600" />
              ) : (
                <TrendingDown className="h-6 w-6 text-red-600" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques supplémentaires */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques du portefeuille</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{portfolio.assets.length}</p>
            <p className="text-sm text-gray-500">Actifs</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {new Set(portfolio.assets.map(a => a.type)).size}
            </p>
            <p className="text-sm text-gray-500">Types d'actifs</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {new Set(portfolio.assets.map(a => a.currency)).size}
            </p>
            <p className="text-sm text-gray-500">Devises</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {Math.round(portfolio.totalValue / portfolio.assets.length)}€
            </p>
            <p className="text-sm text-gray-500">Valeur moyenne</p>
          </div>
        </div>
      </div>
    </div>
  );
};