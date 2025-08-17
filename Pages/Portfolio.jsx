
import React, { useState, useEffect } from "react";
import { Stock } from "@/entities/Stock";
import { User } from "@/entities/User";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, PieChart } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";

import PortfolioSummary from "../components/portfolio/PortfolioSummary";
import StocksList from "../components/portfolio/StocksList";

export default function Portfolio() {
  const [stocks, setStocks] = useState([]);
  const [portfolioMetrics, setPortfolioMetrics] = useState({
    totalValue: 0,
    totalCost: 0,
    totalGainLoss: 0,
    gainLossPercent: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPortfolio();
  }, []);

  const loadPortfolio = async () => {
    setIsLoading(true);
    try {
      const currentUser = await User.me();
      const stocksData = await Stock.filter({ created_by: currentUser.email }, '-created_date');
      setStocks(stocksData);
      calculateMetrics(stocksData);
    } catch (error) {
      console.error("Error loading portfolio:", error);
      // Handle case where user is not logged in, though Layout should prevent this
      setStocks([]);
      calculateMetrics([]);
    }
    setIsLoading(false);
  };

  const calculateMetrics = (stocksData) => {
    let totalValue = 0;
    let totalCost = 0;

    stocksData.forEach(stock => {
      const currentValue = (stock.current_price || stock.purchase_price || 0) * stock.shares;
      const costBasis = (stock.purchase_price || 0) * stock.shares;
      
      totalValue += currentValue;
      totalCost += costBasis;
    });

    const totalGainLoss = totalValue - totalCost;
    const gainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;

    setPortfolioMetrics({
      totalValue,
      totalCost,
      totalGainLoss,
      gainLossPercent
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="h-8 bg-slate-200 rounded animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-32 bg-slate-200 rounded-xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold navy-text mb-2">Portfolio Overview</h1>
              <p className="text-slate-600 text-lg">Track your investments and performance</p>
            </div>
            <div className="flex gap-3">
              <Link to={createPageUrl("Analytics")}>
                <Button className="bg-blue-800 hover:bg-blue-900 text-white gap-2">
                  <PieChart className="w-4 h-4" />
                  View Analytics
                </Button>
              </Link>
              <Link to={createPageUrl("AddStock")}>
                <Button className="bg-blue-800 hover:bg-blue-900 gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Add Stock
                </Button>
              </Link>
            </div>
          </div>

          <PortfolioSummary 
            metrics={portfolioMetrics}
            stockCount={stocks.length}
          />

          <div className="mt-8">
            <StocksList 
              stocks={stocks}
              onStockUpdate={loadPortfolio}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
