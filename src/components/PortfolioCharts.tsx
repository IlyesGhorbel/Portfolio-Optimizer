import React from 'react';
import { Portfolio } from '../types';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PortfolioChartsProps {
  portfolio: Portfolio;
}

export const PortfolioCharts: React.FC<PortfolioChartsProps> = ({ portfolio }) => {
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316', '#84CC16'];

  // Données pour la répartition par type d'actif
  const assetTypeData = portfolio.assets.reduce((acc: Record<string, number>, asset) => {
    const value = asset.quantity * asset.currentPrice;
    acc[asset.type] = (acc[asset.type] || 0) + value;
    return acc;
  }, {});

  const assetTypeChartData = Object.entries(assetTypeData).map(([type, value]) => ({
    name: type,
    value: value,
    percentage: ((value / portfolio.totalValue) * 100).toFixed(1),
  }));

  // Données pour la répartition par actif individuel
  const individualAssetData = portfolio.assets.map(asset => {
    const value = asset.quantity * asset.currentPrice;
    const gainLoss = value - (asset.quantity * asset.purchasePrice);
    
    return {
      name: asset.symbol,
      value: value,
      gainLoss: gainLoss,
      percentage: ((value / portfolio.totalValue) * 100).toFixed(1),
    };
  }).sort((a, b) => b.value - a.value);

  // Données pour les performances
  const performanceData = portfolio.assets.map(asset => {
    const invested = asset.quantity * asset.purchasePrice;
    const current = asset.quantity * asset.currentPrice;
    const gainLossPercent = invested > 0 ? ((current - invested) / invested) * 100 : 0;
    
    return {
      name: asset.symbol,
      invested,
      current,
      gainLossPercent,
    };
  }).sort((a, b) => b.gainLossPercent - a.gainLossPercent);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">
            {formatCurrency(data.value)} ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Analyse du portefeuille</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Répartition par type d'actif */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition par type d'actif</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={assetTypeChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} (${percentage}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {assetTypeChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Répartition par actif individuel */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition par actif</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={individualAssetData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} (${percentage}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {individualAssetData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Graphique des performances */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance par actif</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={performanceData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={formatCurrency} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="invested" fill="#94A3B8" name="Montant investi" />
            <Bar dataKey="current" fill="#3B82F6" name="Valeur actuelle" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tableau des performances détaillées */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Performance détaillée</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actif
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valeur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  % du portefeuille
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gain/Perte
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {individualAssetData.map((asset, index) => {
                const isPositive = asset.gainLoss >= 0;
                return (
                  <tr key={asset.name} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-3"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></div>
                        <div className="text-sm font-medium text-gray-900">{asset.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(asset.value)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {asset.percentage}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${
                        isPositive ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(asset.gainLoss)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};