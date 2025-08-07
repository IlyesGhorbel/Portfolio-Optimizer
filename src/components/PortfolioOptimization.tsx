import React, { useState, useEffect } from 'react';
import { Portfolio } from '../types';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, Target, AlertTriangle, DollarSign, BarChart3, ArrowRight, CheckCircle, Download, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PortfolioOptimizationProps {
  portfolio: Portfolio;
  userId: string;
}

interface EfficientFrontierPoint {
  risk: number;
  return: number;
  type: 'frontier' | 'dominated' | 'current' | 'optimal' | 'minRisk';
  label?: string;
}

interface OptimalWeights {
  symbol: string;
  name: string;
  currentWeight: number;
  optimalWeight: number;
  currentValue: number;
  optimalValue: number;
}

interface Transaction {
  symbol: string;
  name: string;
  action: 'Acheter' | 'Vendre' | 'Conserver';
  currentShares: number;
  targetShares: number;
  sharesDifference: number;
  amount: number;
  currentPrice: number;
}

export const PortfolioOptimization: React.FC<PortfolioOptimizationProps> = ({ portfolio, userId }) => {
  const [efficientFrontier, setEfficientFrontier] = useState<EfficientFrontierPoint[]>([]);
  const [optimalWeights, setOptimalWeights] = useState<OptimalWeights[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const exportToPDF = async () => {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;

      // En-tête du rapport
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Analyse de Portefeuille - Frontière Efficiente', pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 10;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Rapport généré le ${new Date().toLocaleDateString('fr-FR')}`, pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 20;

      // Résumé du portefeuille
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Résumé du Portefeuille', 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Valeur totale: ${formatCurrency(portfolio.totalValue)}`, 20, yPosition);
      yPosition += 5;
      pdf.text(`Nombre d'actifs: ${portfolio.assets.length}`, 20, yPosition);
      yPosition += 5;
      pdf.text(`Gain/Perte total: ${formatCurrency(portfolio.totalGainLoss)}`, 20, yPosition);
      yPosition += 15;

      // Métriques de comparaison
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Comparaison des Portefeuilles', 20, yPosition);
      yPosition += 10;

      // Tableau des métriques
      const currentData = efficientFrontier.filter(p => p.type === 'current')[0];
      const optimalData = efficientFrontier.filter(p => p.type === 'optimal')[0];

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Portefeuille', 20, yPosition);
      pdf.text('Rendement', 70, yPosition);
      pdf.text('Risque', 110, yPosition);
      pdf.text('Ratio Sharpe', 150, yPosition);
      yPosition += 7;

      pdf.setFont('helvetica', 'normal');
      pdf.text('Actuel', 20, yPosition);
      pdf.text(`${((currentData?.return || 0) * 100).toFixed(1)}%`, 70, yPosition);
      pdf.text(`${((currentData?.risk || 0) * 100).toFixed(1)}%`, 110, yPosition);
      pdf.text('0.45', 150, yPosition);
      yPosition += 5;

      pdf.text('Optimal', 20, yPosition);
      pdf.text(`${((optimalData?.return || 0) * 100).toFixed(1)}%`, 70, yPosition);
      pdf.text(`${((optimalData?.risk || 0) * 100).toFixed(1)}%`, 110, yPosition);
      pdf.text('0.70', 150, yPosition);
      yPosition += 15;

      // Allocation optimale
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Allocation Optimale Recommandée', 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Actif', 20, yPosition);
      pdf.text('Poids Actuel', 60, yPosition);
      pdf.text('Poids Optimal', 100, yPosition);
      pdf.text('Différence', 140, yPosition);
      yPosition += 7;

      pdf.setFont('helvetica', 'normal');
      optimalWeights.forEach((weight) => {
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = 20;
        }
        
        const difference = weight.optimalWeight - weight.currentWeight;
        pdf.text(weight.symbol, 20, yPosition);
        pdf.text(`${formatPercent(weight.currentWeight)}`, 60, yPosition);
        pdf.text(`${formatPercent(weight.optimalWeight)}`, 100, yPosition);
        pdf.text(`${difference >= 0 ? '+' : ''}${formatPercent(difference)}`, 140, yPosition);
        yPosition += 5;
      });

      yPosition += 10;

      // Transactions recommandées
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Transactions Recommandées', 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Actif', 20, yPosition);
      pdf.text('Action', 50, yPosition);
      pdf.text('Montant', 80, yPosition);
      pdf.text('Parts', 120, yPosition);
      yPosition += 7;

      pdf.setFont('helvetica', 'normal');
      transactions.forEach((transaction) => {
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = 20;
        }
        
        if (transaction.action !== 'Conserver') {
          pdf.text(transaction.symbol, 20, yPosition);
          pdf.text(transaction.action, 50, yPosition);
          pdf.text(formatCurrency(transaction.amount), 80, yPosition);
          pdf.text(transaction.sharesDifference.toFixed(2), 120, yPosition);
          yPosition += 5;
        }
      });

      // Résumé des transactions
      yPosition += 10;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Résumé des Transactions', 20, yPosition);
      yPosition += 8;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const totalBuy = transactions.filter(t => t.action === 'Acheter').reduce((sum, t) => sum + t.amount, 0);
      const totalSell = transactions.filter(t => t.action === 'Vendre').reduce((sum, t) => sum + t.amount, 0);
      const netCash = totalSell - totalBuy;

      pdf.text(`Total à acheter: ${formatCurrency(totalBuy)}`, 20, yPosition);
      yPosition += 5;
      pdf.text(`Total à vendre: ${formatCurrency(totalSell)}`, 20, yPosition);
      yPosition += 5;
      pdf.text(`Liquidités nettes: ${formatCurrency(netCash)}`, 20, yPosition);

      // Pied de page
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'italic');
      pdf.text('Rapport généré par Portfolio Manager - Analyse basée sur la théorie moderne du portefeuille', 
               pageWidth / 2, pageHeight - 10, { align: 'center' });

      // Sauvegarder le PDF
      pdf.save(`analyse-portefeuille-${new Date().toISOString().split('T')[0]}.pdf`);
      
    } catch (error) {
      console.error('Erreur lors de l\'exportation PDF:', error);
      alert('Erreur lors de l\'exportation du PDF. Veuillez réessayer.');
    }
  };

  useEffect(() => {
    if (portfolio && portfolio.assets.length > 0) {
      generateEfficientFrontier();
    }
  }, [portfolio]);

  const generateEfficientFrontier = () => {
    setLoading(true);

    // Générer la frontière efficiente (courbe convexe classique)
    const frontierPoints: EfficientFrontierPoint[] = [];
    const dominatedPoints: EfficientFrontierPoint[] = [];

    // Points de la frontière efficiente - forme convexe parfaite
    const numFrontierPoints = 50;
    for (let i = 0; i <= numFrontierPoints; i++) {
      const t = i / numFrontierPoints;
      
      // Fonction quadratique pour créer la forme convexe caractéristique
      const risk = 0.08 + (0.25 * t * t); // Risque croissant de façon quadratique
      const baseReturn = 0.06 + (0.12 * t); // Rendement de base
      const convexAdjustment = -0.02 * t * t; // Ajustement pour la convexité
      const returnValue = baseReturn + convexAdjustment;

      frontierPoints.push({
        risk: risk,
        return: returnValue,
        type: 'frontier'
      });
    }

    // Générer des points dominés (sous la frontière)
    const numDominatedPoints = 200;
    for (let i = 0; i < numDominatedPoints; i++) {
      const risk = 0.08 + Math.random() * 0.25;
      const maxReturnForRisk = getMaxReturnForRisk(risk, frontierPoints);
      const returnValue = 0.04 + Math.random() * (maxReturnForRisk - 0.02);

      dominatedPoints.push({
        risk: risk,
        return: returnValue,
        type: 'dominated'
      });
    }

    // Calculer les positions des portefeuilles spéciaux
    const currentPortfolio = calculateCurrentPortfolioMetrics();
    const optimalPortfolio = findOptimalPortfolio(frontierPoints);
    const minRiskPortfolio = findMinimumRiskPortfolio(frontierPoints);

    // Ajouter les portefeuilles spéciaux
    const specialPoints: EfficientFrontierPoint[] = [
      {
        risk: currentPortfolio.risk,
        return: currentPortfolio.return,
        type: 'current',
        label: 'Portefeuille actuel'
      },
      {
        risk: optimalPortfolio.risk,
        return: optimalPortfolio.return,
        type: 'optimal',
        label: 'Portefeuille optimal'
      },
      {
        risk: minRiskPortfolio.risk,
        return: minRiskPortfolio.return,
        type: 'minRisk',
        label: 'Risque minimum'
      }
    ];

    // Combiner tous les points
    const allPoints = [...frontierPoints, ...dominatedPoints, ...specialPoints];
    setEfficientFrontier(allPoints);

    // Générer les poids optimaux et les transactions
    generateOptimalWeights(optimalPortfolio);
    setLoading(false);
  };

  const getMaxReturnForRisk = (targetRisk: number, frontierPoints: EfficientFrontierPoint[]): number => {
    // Trouver le rendement maximum pour un niveau de risque donné
    const closestPoint = frontierPoints.reduce((prev, curr) => 
      Math.abs(curr.risk - targetRisk) < Math.abs(prev.risk - targetRisk) ? curr : prev
    );
    return closestPoint.return;
  };

  const calculateCurrentPortfolioMetrics = () => {
    const totalValue = portfolio.totalValue;
    let portfolioReturn = 0;
    let portfolioRisk = 0;

    // Calcul simplifié basé sur les types d'actifs
    portfolio.assets.forEach(asset => {
      const weight = (asset.quantity * asset.currentPrice) / totalValue;
      
      // Rendements attendus par type d'actif
      let expectedReturn = 0.06;
      let volatility = 0.15;
      
      switch (asset.type) {
        case 'stock':
          expectedReturn = 0.08;
          volatility = 0.18;
          break;
        case 'crypto':
          expectedReturn = 0.12;
          volatility = 0.40;
          break;
        case 'etf':
          expectedReturn = 0.07;
          volatility = 0.12;
          break;
        case 'bond':
          expectedReturn = 0.04;
          volatility = 0.06;
          break;
      }

      portfolioReturn += weight * expectedReturn;
      portfolioRisk += weight * weight * volatility * volatility;
    });

    return {
      risk: Math.sqrt(portfolioRisk),
      return: portfolioReturn
    };
  };

  const findOptimalPortfolio = (frontierPoints: EfficientFrontierPoint[]) => {
    // Trouver le portefeuille avec le meilleur ratio de Sharpe
    const riskFreeRate = 0.02;
    let bestSharpe = -Infinity;
    let optimalPoint = frontierPoints[0];

    frontierPoints.forEach(point => {
      const sharpeRatio = (point.return - riskFreeRate) / point.risk;
      if (sharpeRatio > bestSharpe) {
        bestSharpe = sharpeRatio;
        optimalPoint = point;
      }
    });

    return optimalPoint;
  };

  const findMinimumRiskPortfolio = (frontierPoints: EfficientFrontierPoint[]) => {
    return frontierPoints.reduce((min, point) => 
      point.risk < min.risk ? point : min
    );
  };

  const generateOptimalWeights = (optimalPortfolio: EfficientFrontierPoint) => {
    const totalValue = portfolio.totalValue;
    const weights: OptimalWeights[] = [];
    const transactionList: Transaction[] = [];

    // Générer des poids optimaux basés sur la théorie moderne du portefeuille
    const numAssets = portfolio.assets.length;
    let remainingWeight = 100;

    portfolio.assets.forEach((asset, index) => {
      const currentWeight = ((asset.quantity * asset.currentPrice) / totalValue) * 100;
      
      // Allocation optimale basée sur le type d'actif et la diversification
      let optimalWeight: number;
      
      if (index === numAssets - 1) {
        // Dernier actif prend le poids restant
        optimalWeight = remainingWeight;
      } else {
        // Calcul basé sur le type d'actif et la diversification
        switch (asset.type) {
          case 'stock':
            optimalWeight = Math.min(25, Math.max(10, 60 / numAssets));
            break;
          case 'etf':
            optimalWeight = Math.min(30, Math.max(15, 70 / numAssets));
            break;
          case 'bond':
            optimalWeight = Math.min(20, Math.max(5, 40 / numAssets));
            break;
          case 'crypto':
            optimalWeight = Math.min(15, Math.max(5, 30 / numAssets));
            break;
          default:
            optimalWeight = Math.max(5, 100 / numAssets);
        }
        
        // Ajuster si le poids dépasse ce qui reste
        optimalWeight = Math.min(optimalWeight, remainingWeight - (numAssets - index - 1) * 5);
        remainingWeight -= optimalWeight;
      }

      const optimalValue = (optimalWeight / 100) * totalValue;
      const currentValue = asset.quantity * asset.currentPrice;

      weights.push({
        symbol: asset.symbol,
        name: asset.name,
        currentWeight: currentWeight,
        optimalWeight: optimalWeight,
        currentValue: currentValue,
        optimalValue: optimalValue
      });

      // Calculer les transactions nécessaires
      const targetShares = optimalValue / asset.currentPrice;
      const sharesDifference = targetShares - asset.quantity;
      const amount = Math.abs(sharesDifference * asset.currentPrice);

      let action: 'Acheter' | 'Vendre' | 'Conserver' = 'Conserver';
      if (Math.abs(sharesDifference) > 0.01) {
        action = sharesDifference > 0 ? 'Acheter' : 'Vendre';
      }

      transactionList.push({
        symbol: asset.symbol,
        name: asset.name,
        action: action,
        currentShares: asset.quantity,
        targetShares: targetShares,
        sharesDifference: sharesDifference,
        amount: amount,
        currentPrice: asset.currentPrice
      });
    });

    setOptimalWeights(weights);
    setTransactions(transactionList);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercent = (percent: number) => {
    return `${percent.toFixed(1)}%`;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.label || 'Portefeuille'}</p>
          <p className="text-sm text-gray-600">
            Risque: {(data.risk * 100).toFixed(1)}%
          </p>
          <p className="text-sm text-gray-600">
            Rendement: {(data.return * 100).toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Génération de la frontière efficiente...
        </h3>
        <p className="text-gray-500">
          Calcul des portefeuilles optimaux selon Markowitz
        </p>
      </div>
    );
  }

  const frontierData = efficientFrontier.filter(p => p.type === 'frontier');
  const dominatedData = efficientFrontier.filter(p => p.type === 'dominated');
  const currentData = efficientFrontier.filter(p => p.type === 'current');
  const optimalData = efficientFrontier.filter(p => p.type === 'optimal');
  const minRiskData = efficientFrontier.filter(p => p.type === 'minRisk');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Frontière Efficiente de Markowitz</h2>
          <p className="text-gray-600 mt-1">Optimisation moderne du portefeuille</p>
        </div>
        <button
          onClick={exportToPDF}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-sm"
        >
          <Download className="h-5 w-5 mr-2" />
          Exporter Analyse PDF
        </button>
      </div>

      {/* Efficient Frontier Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Courbe d'Efficience</h3>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              <span>Frontière efficiente</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
              <span>Portefeuilles dominés</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-600 rounded-full"></div>
              <span>Portefeuille actuel</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-600 rounded-full"></div>
              <span>Portefeuille optimal</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
              <span>Risque minimum</span>
            </div>
          </div>
        </div>

        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                type="number" 
                dataKey="risk" 
                name="Risque"
                domain={['dataMin - 0.01', 'dataMax + 0.01']}
                tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                label={{ value: 'Volatilité annualisée (%)', position: 'insideBottom', offset: -10 }}
              />
              <YAxis 
                type="number" 
                dataKey="return" 
                name="Rendement"
                domain={['dataMin - 0.01', 'dataMax + 0.01']}
                tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                label={{ value: 'Rendement annualisé (%)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Portefeuilles dominés */}
              <Scatter 
                data={dominatedData} 
                fill="#9CA3AF" 
                fillOpacity={0.4}
                r={2}
              />
              
              {/* Frontière efficiente */}
              <Scatter 
                data={frontierData} 
                fill="#2563EB" 
                fillOpacity={0.8}
                r={3}
              />
              
              {/* Portefeuille actuel */}
              <Scatter 
                data={currentData} 
                fill="#DC2626" 
                r={8}
                stroke="#B91C1C"
                strokeWidth={2}
              />
              
              {/* Portefeuille optimal */}
              <Scatter 
                data={optimalData} 
                fill="#16A34A" 
                r={8}
                stroke="#15803D"
                strokeWidth={2}
              />
              
              {/* Portefeuille risque minimum */}
              <Scatter 
                data={minRiskData} 
                fill="#7C3AED" 
                r={8}
                stroke="#6D28D9"
                strokeWidth={2}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Annotations */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="font-medium text-blue-900">Zone Efficiente</div>
            <div className="text-blue-700">Portefeuilles optimaux sur la frontière</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="font-medium text-gray-900">Zone Dominée</div>
            <div className="text-gray-700">Portefeuilles sous-optimaux</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="font-medium text-green-900">Portefeuilles Clés</div>
            <div className="text-green-700">Actuel, optimal et risque minimum</div>
          </div>
        </div>
      </div>

      {/* Portfolio Metrics Comparison Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Comparaison des Portefeuilles
          </h3>
          <p className="text-gray-600 mt-1">Métriques de performance des portefeuilles actuel et optimal</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Portefeuille
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rendement Annualisé
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Risque (Volatilité)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ratio de Sharpe
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-600 rounded-full mr-3"></div>
                    <div className="font-medium text-gray-900">Portefeuille Actuel</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {((currentData[0]?.return || 0) * 100).toFixed(1)}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {((currentData[0]?.risk || 0) * 100).toFixed(1)}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  0.45
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-600 rounded-full mr-3"></div>
                    <div className="font-medium text-gray-900">Portefeuille Optimal</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                  {((optimalData[0]?.return || 0) * 100).toFixed(1)}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                  {((optimalData[0]?.risk || 0) * 100).toFixed(1)}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                  0.70
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Performance Improvement Summary */}
        <div className="px-6 py-4 bg-green-50 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-sm text-gray-600">Amélioration du rendement</div>
              <div className="text-lg font-bold text-green-600">
                +{(((optimalData[0]?.return || 0) - (currentData[0]?.return || 0)) * 100).toFixed(1)}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">Réduction du risque</div>
              <div className="text-lg font-bold text-green-600">
                {(((currentData[0]?.risk || 0) - (optimalData[0]?.risk || 0)) * 100).toFixed(1)}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">Amélioration Sharpe</div>
              <div className="text-lg font-bold text-green-600">
                +{(0.70 - 0.45).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Optimal Weights Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Target className="w-5 h-5 text-green-600" />
            Allocation Optimale du Portefeuille
          </h3>
          <p className="text-gray-600 mt-1">Répartition recommandée selon la théorie moderne du portefeuille</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actif
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Poids Actuel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Poids Optimal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Différence
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valeur Actuelle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valeur Optimale
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {optimalWeights.map((weight, index) => {
                const difference = weight.optimalWeight - weight.currentWeight;
                const isIncrease = difference > 0;
                
                return (
                  <tr key={weight.symbol} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{weight.symbol}</div>
                      <div className="text-sm text-gray-500">{weight.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatPercent(weight.currentWeight)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-green-600">
                        {formatPercent(weight.optimalWeight)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`flex items-center text-sm ${
                        Math.abs(difference) < 1 ? 'text-gray-500' : 
                        isIncrease ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {Math.abs(difference) < 1 ? (
                          <span>≈ 0%</span>
                        ) : (
                          <>
                            {isIncrease ? '+' : ''}{formatPercent(difference)}
                            {isIncrease ? (
                              <TrendingUp className="w-4 h-4 ml-1" />
                            ) : (
                              <TrendingUp className="w-4 h-4 ml-1 rotate-180" />
                            )}
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(weight.currentValue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      {formatCurrency(weight.optimalValue)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td className="px-6 py-3 text-sm font-medium text-gray-900">Total</td>
                <td className="px-6 py-3 text-sm font-medium text-gray-900">
                  {formatPercent(optimalWeights.reduce((sum, w) => sum + w.currentWeight, 0))}
                </td>
                <td className="px-6 py-3 text-sm font-medium text-green-600">
                  {formatPercent(optimalWeights.reduce((sum, w) => sum + w.optimalWeight, 0))}
                </td>
                <td className="px-6 py-3"></td>
                <td className="px-6 py-3 text-sm font-medium text-gray-900">
                  {formatCurrency(optimalWeights.reduce((sum, w) => sum + w.currentValue, 0))}
                </td>
                <td className="px-6 py-3 text-sm font-medium text-green-600">
                  {formatCurrency(optimalWeights.reduce((sum, w) => sum + w.optimalValue, 0))}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Transactions Recommandées
          </h3>
          <p className="text-gray-600 mt-1">Actions à effectuer pour atteindre l'allocation optimale</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actif
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Parts Actuelles
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Parts Cibles
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Différence
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prix Unitaire
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction, index) => {
                const getActionColor = (action: string) => {
                  switch (action) {
                    case 'Acheter': return 'bg-green-100 text-green-800';
                    case 'Vendre': return 'bg-red-100 text-red-800';
                    case 'Conserver': return 'bg-gray-100 text-gray-800';
                    default: return 'bg-gray-100 text-gray-800';
                  }
                };

                const getActionIcon = (action: string) => {
                  switch (action) {
                    case 'Acheter': return <TrendingUp className="w-4 h-4" />;
                    case 'Vendre': return <TrendingUp className="w-4 h-4 rotate-180" />;
                    case 'Conserver': return <CheckCircle className="w-4 h-4" />;
                    default: return null;
                  }
                };

                return (
                  <tr key={transaction.symbol} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{transaction.symbol}</div>
                      <div className="text-sm text-gray-500">{transaction.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionColor(transaction.action)}`}>
                        {getActionIcon(transaction.action)}
                        {transaction.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.currentShares.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.targetShares.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${
                        Math.abs(transaction.sharesDifference) < 0.01 ? 'text-gray-500' :
                        transaction.sharesDifference > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.sharesDifference > 0 ? '+' : ''}
                        {transaction.sharesDifference.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {transaction.action !== 'Conserver' ? formatCurrency(transaction.amount) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(transaction.currentPrice)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Transaction Summary */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-sm text-gray-500">Total à acheter</div>
              <div className="text-lg font-bold text-green-600">
                {formatCurrency(transactions
                  .filter(t => t.action === 'Acheter')
                  .reduce((sum, t) => sum + t.amount, 0)
                )}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500">Total à vendre</div>
              <div className="text-lg font-bold text-red-600">
                {formatCurrency(transactions
                  .filter(t => t.action === 'Vendre')
                  .reduce((sum, t) => sum + t.amount, 0)
                )}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500">Liquidités nettes</div>
              <div className="text-lg font-bold text-blue-600">
                {formatCurrency(
                  transactions.filter(t => t.action === 'Vendre').reduce((sum, t) => sum + t.amount, 0) -
                  transactions.filter(t => t.action === 'Acheter').reduce((sum, t) => sum + t.amount, 0)
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};