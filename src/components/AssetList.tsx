import React, { useState } from 'react';
import { Portfolio, Asset } from '../types';
import { updateAsset, deleteAsset } from '../services/portfolio';
import { Edit2, Trash2, TrendingUp, TrendingDown, Save, X } from 'lucide-react';

interface AssetListProps {
  portfolio: Portfolio | null;
  loading: boolean;
  onAssetUpdated: () => void;
}

export const AssetList: React.FC<AssetListProps> = ({ portfolio, loading, onAssetUpdated }) => {
  const [editingAsset, setEditingAsset] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<Asset>>({});

  if (loading && !portfolio) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!portfolio || portfolio.assets.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Aucun actif dans votre portefeuille
        </h3>
        <p className="text-gray-500">
          Ajoutez votre premier actif pour commencer à suivre vos investissements
        </p>
      </div>
    );
  }

  const formatCurrency = (amount: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency === 'BTC' ? 'EUR' : currency,
    }).format(amount);
  };

  const formatPercent = (percent: number) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  const handleEditStart = (asset: Asset) => {
    setEditingAsset(asset.id);
    setEditFormData({
      quantity: asset.quantity,
      purchasePrice: asset.purchasePrice,
      purchaseDate: asset.purchaseDate,
    });
  };

  const handleEditSave = async (assetId: string) => {
    try {
      await updateAsset(assetId, editFormData);
      setEditingAsset(null);
      setEditFormData({});
      onAssetUpdated();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  const handleEditCancel = () => {
    setEditingAsset(null);
    setEditFormData({});
  };

  const handleDelete = async (assetId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet actif ?')) {
      try {
        await deleteAsset(assetId);
        onAssetUpdated();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const calculateAssetGainLoss = (asset: Asset) => {
    const invested = asset.quantity * asset.purchasePrice;
    const current = asset.quantity * asset.currentPrice;
    const gainLoss = current - invested;
    const gainLossPercent = invested > 0 ? (gainLoss / invested) * 100 : 0;
    return { gainLoss, gainLossPercent };
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Mes actifs</h2>
        <p className="text-sm text-gray-500 mt-1">
          {portfolio.assets.length} actif{portfolio.assets.length > 1 ? 's' : ''} dans votre portefeuille
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actif
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantité
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prix d'achat
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prix actuel
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Valeur
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Gain/Perte
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {portfolio.assets.map((asset) => {
              const { gainLoss, gainLossPercent } = calculateAssetGainLoss(asset);
              const isPositive = gainLoss >= 0;
              const isEditing = editingAsset === asset.id;

              return (
                <tr key={asset.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">
                          {asset.symbol}
                        </div>
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {asset.type}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">{asset.name}</div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    {isEditing ? (
                      <input
                        type="number"
                        value={editFormData.quantity || ''}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, quantity: parseFloat(e.target.value) }))}
                        step="0.000001"
                        className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="text-sm text-gray-900">
                        {asset.quantity.toLocaleString()}
                      </div>
                    )}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    {isEditing ? (
                      <input
                        type="number"
                        value={editFormData.purchasePrice || ''}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, purchasePrice: parseFloat(e.target.value) }))}
                        step="0.01"
                        className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="text-sm text-gray-900">
                        {formatCurrency(asset.purchasePrice, asset.currency)}
                      </div>
                    )}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(asset.currentPrice, asset.currency)}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatCurrency(asset.quantity * asset.currentPrice, asset.currency)}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {isPositive ? (
                        <TrendingUp className="h-4 w-4 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 mr-1" />
                      )}
                      <div className="text-sm font-medium">
                        {formatCurrency(gainLoss, asset.currency)}
                      </div>
                    </div>
                    <div className={`text-xs ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {formatPercent(gainLossPercent)}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {isEditing ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditSave(asset.id)}
                          className="text-green-600 hover:text-green-900 transition-colors duration-200"
                        >
                          <Save className="h-4 w-4" />
                        </button>
                        <button
                          onClick={handleEditCancel}
                          className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditStart(asset)}
                          className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(asset.id)}
                          className="text-red-600 hover:text-red-900 transition-colors duration-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};