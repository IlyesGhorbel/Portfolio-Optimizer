import React, { useState } from 'react';
import { AssetType, Currency } from '../types';
import { addAsset } from '../services/portfolio';
import { searchSymbol, fetchCurrentPrice } from '../services/api';
import { Plus, Search, TrendingUp } from 'lucide-react';

interface AssetFormProps {
  userId: string;
  onAssetAdded: () => void;
}

export const AssetForm: React.FC<AssetFormProps> = ({ userId, onAssetAdded }) => {
  const [formData, setFormData] = useState({
    symbol: '',
    name: '',
    type: 'stock' as AssetType,
    quantity: '',
    purchasePrice: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    currency: 'USD' as Currency,
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState<Array<{ symbol: string; name: string; type: string }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [fetchingPrice, setFetchingPrice] = useState(false);

  const assetTypes: { value: AssetType; label: string }[] = [
    { value: 'stock', label: 'Action' },
    { value: 'crypto', label: 'Cryptomonnaie' },
    { value: 'etf', label: 'ETF' },
    { value: 'option', label: 'Option' },
    { value: 'bond', label: 'Obligation' },
    { value: 'commodity', label: 'Matière première' },
  ];

  const currencies: { value: Currency; label: string }[] = [
    { value: 'USD', label: 'USD ($)' },
    { value: 'EUR', label: 'EUR (€)' },
    { value: 'BTC', label: 'BTC (₿)' },
  ];

  const handleSymbolSearch = async (query: string) => {
    setFormData(prev => ({ ...prev, symbol: query }));
    
    if (query.length > 1) {
      try {
        const results = await searchSymbol(query);
        setSuggestions(results);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Erreur lors de la recherche:', error);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionSelect = (suggestion: { symbol: string; name: string; type: string }) => {
    setFormData(prev => ({
      ...prev,
      symbol: suggestion.symbol,
      name: suggestion.name,
      type: suggestion.type as AssetType,
    }));
    setShowSuggestions(false);
  };

  const fetchCurrentPriceForSymbol = async () => {
    if (!formData.symbol) return;
    
    setFetchingPrice(true);
    try {
      const price = await fetchCurrentPrice(formData.symbol);
      setFormData(prev => ({ ...prev, purchasePrice: price.toFixed(2) }));
    } catch (error) {
      console.error('Erreur lors de la récupération du prix:', error);
    } finally {
      setFetchingPrice(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const currentPrice = await fetchCurrentPrice(formData.symbol);
      
      await addAsset({
        userId,
        symbol: formData.symbol.toUpperCase(),
        name: formData.name || formData.symbol,
        type: formData.type,
        quantity: parseFloat(formData.quantity),
        purchasePrice: parseFloat(formData.purchasePrice),
        purchaseDate: formData.purchaseDate,
        currentPrice,
        currency: formData.currency,
      });

      // Reset form
      setFormData({
        symbol: '',
        name: '',
        type: 'stock',
        quantity: '',
        purchasePrice: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        currency: 'USD',
      });

      onAssetAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'ajout de l\'actif');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-blue-100 p-2 rounded-lg">
          <Plus className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Ajouter un actif</h2>
          <p className="text-sm text-gray-500">Ajoutez un nouvel actif à votre portefeuille</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Symbole */}
          <div className="relative">
            <label htmlFor="symbol" className="block text-sm font-medium text-gray-700 mb-2">
              Symbole *
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                id="symbol"
                name="symbol"
                value={formData.symbol}
                onChange={(e) => handleSymbolSearch(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="AAPL, BTC, SPY..."
              />
            </div>
            
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSuggestionSelect(suggestion)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium text-gray-900">{suggestion.symbol}</div>
                    <div className="text-sm text-gray-500">{suggestion.name}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Nom */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Nom de l'actif
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Apple Inc."
            />
          </div>

          {/* Type */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
              Type d'actif *
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {assetTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Devise */}
          <div>
            <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-2">
              Devise *
            </label>
            <select
              id="currency"
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {currencies.map((currency) => (
                <option key={currency.value} value={currency.value}>
                  {currency.label}
                </option>
              ))}
            </select>
          </div>

          {/* Quantité */}
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
              Quantité *
            </label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              required
              min="0"
              step="0.000001"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="10"
            />
          </div>

          {/* Prix d'achat */}
          <div>
            <label htmlFor="purchasePrice" className="block text-sm font-medium text-gray-700 mb-2">
              Prix d'achat * ({formData.currency})
            </label>
            <div className="flex space-x-2">
              <input
                type="number"
                id="purchasePrice"
                name="purchasePrice"
                value={formData.purchasePrice}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="150.00"
              />
              <button
                type="button"
                onClick={fetchCurrentPriceForSymbol}
                disabled={!formData.symbol || fetchingPrice}
                className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50"
              >
                {fetchingPrice ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
                ) : (
                  <TrendingUp className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Date d'achat */}
        <div>
          <label htmlFor="purchaseDate" className="block text-sm font-medium text-gray-700 mb-2">
            Date d'achat *
          </label>
          <input
            type="date"
            id="purchaseDate"
            name="purchaseDate"
            value={formData.purchaseDate}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              <Plus className="h-5 w-5" />
              <span>Ajouter l'actif</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};