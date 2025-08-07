import React from 'react';
import { getTransactions } from '../services/portfolio';
import { Transaction } from '../types';
import { Calendar, TrendingUp, Edit2, Trash2, Plus } from 'lucide-react';

interface TransactionHistoryProps {
  userId: string;
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({ userId }) => {
  const transactions = getTransactions(userId);

  const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'buy':
        return <Plus className="h-4 w-4 text-green-600" />;
      case 'sell':
        return <TrendingUp className="h-4 w-4 text-blue-600" />;
      case 'edit':
        return <Edit2 className="h-4 w-4 text-yellow-600" />;
      case 'delete':
        return <Trash2 className="h-4 w-4 text-red-600" />;
      default:
        return <Calendar className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTransactionLabel = (type: Transaction['type']) => {
    switch (type) {
      case 'buy':
        return 'Achat';
      case 'sell':
        return 'Vente';
      case 'edit':
        return 'Modification';
      case 'delete':
        return 'Suppression';
      default:
        return 'Transaction';
    }
  };

  const getTransactionColor = (type: Transaction['type']) => {
    switch (type) {
      case 'buy':
        return 'bg-green-100 text-green-800';
      case 'sell':
        return 'bg-blue-100 text-blue-800';
      case 'edit':
        return 'bg-yellow-100 text-yellow-800';
      case 'delete':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Aucune transaction
        </h3>
        <p className="text-gray-500">
          Vos transactions apparaîtront ici une fois que vous commencerez à gérer votre portefeuille
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Historique des transactions</h2>
        <p className="text-sm text-gray-500 mt-1">
          {transactions.length} transaction{transactions.length > 1 ? 's' : ''} enregistrée{transactions.length > 1 ? 's' : ''}
        </p>
      </div>

      <div className="divide-y divide-gray-200">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="px-6 py-4 hover:bg-gray-50 transition-colors duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {getTransactionIcon(transaction.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {getTransactionLabel(transaction.type)}
                    </p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTransactionColor(transaction.type)}`}>
                      {getTransactionLabel(transaction.type)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 mt-1">
                    <p className="text-sm text-gray-500">
                      Quantité: {transaction.quantity.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      Prix: {formatCurrency(transaction.price)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Total: {formatCurrency(transaction.quantity * transaction.price)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0 text-right">
                <p className="text-sm text-gray-900">
                  {formatDate(transaction.date)}
                </p>
                <p className="text-xs text-gray-500">
                  {formatDate(transaction.createdAt)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};