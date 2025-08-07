import React, { useState } from 'react';
import { User } from '../types';
import { usePortfolio } from '../hooks/usePortfolio';
import { Header } from './Header';
import { PortfolioOverview } from './PortfolioOverview';
import { AssetForm } from './AssetForm';
import { AssetList } from './AssetList';
import { PortfolioCharts } from './PortfolioCharts';
import { TransactionHistory } from './TransactionHistory';
import { PortfolioOptimization } from './PortfolioOptimization';
import { Plus, TrendingUp, List, BarChart3, History, Target } from 'lucide-react';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

type ActiveTab = 'overview' | 'add' | 'assets' | 'charts' | 'history' | 'optimization';

export const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const { portfolio, loading, refreshPortfolio, refreshPrices } = usePortfolio(user.id);
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');

  const tabs = [
    { id: 'overview' as ActiveTab, label: 'Vue d\'ensemble', icon: TrendingUp },
    { id: 'add' as ActiveTab, label: 'Ajouter', icon: Plus },
    { id: 'assets' as ActiveTab, label: 'Mes actifs', icon: List },
    { id: 'charts' as ActiveTab, label: 'Graphiques', icon: BarChart3 },
    { id: 'optimization' as ActiveTab, label: 'Optimisation', icon: Target },
    { id: 'history' as ActiveTab, label: 'Historique', icon: History },
  ];

  const handleAssetAdded = () => {
    refreshPortfolio();
    setActiveTab('assets');
  };

  const handleAssetUpdated = () => {
    refreshPortfolio();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={onLogout} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === 'overview' && (
            <>
              <PortfolioOverview 
                portfolio={portfolio} 
                loading={loading} 
                onRefresh={refreshPrices}
              />
              {portfolio && portfolio.assets.length > 0 && (
                <PortfolioCharts portfolio={portfolio} />
              )}
            </>
          )}

          {activeTab === 'add' && (
            <AssetForm userId={user.id} onAssetAdded={handleAssetAdded} />
          )}

          {activeTab === 'assets' && (
            <AssetList 
              portfolio={portfolio} 
              loading={loading} 
              onAssetUpdated={handleAssetUpdated}
            />
          )}

          {activeTab === 'charts' && portfolio && (
            <PortfolioCharts portfolio={portfolio} />
          )}

          {activeTab === 'optimization' && portfolio && (
            <PortfolioOptimization portfolio={portfolio} userId={user.id} />
          )}

          {activeTab === 'history' && (
            <TransactionHistory userId={user.id} />
          )}
        </div>
      </div>
    </div>
  );
};