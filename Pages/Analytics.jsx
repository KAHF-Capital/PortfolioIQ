
import React, { useState, useEffect } from "react";
import { Stock } from "@/entities/Stock";
import { User } from "@/entities/User";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, BarChart3, Globe, Target, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import SectorAllocation from "../components/analytics/SectorAllocation";
import GeographicAllocation from "../components/analytics/GeographicAllocation";
import RiskMetrics from "../components/analytics/RiskMetrics";
import CorrelationAnalysis from "../components/analytics/CorrelationAnalysis";

export default function Analytics() {
  const [stocks, setStocks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [portfolioValue, setPortfolioValue] = useState(0);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const currentUser = await User.me();
      const stocksData = await Stock.filter({ created_by: currentUser.email });
      setStocks(stocksData);
      
      const totalValue = stocksData.reduce((sum, stock) => {
        const currentPrice = stock.current_price || stock.purchase_price || 0;
        return sum + (currentPrice * stock.shares);
      }, 0);
      
      setPortfolioValue(totalValue);
    } catch (error) {
      console.error("Error loading analytics:", error);
    }
    setIsLoading(false);
  };

  // Create hedged portfolio with 90% current holdings + 10% vol arbitrage
  const createHedgedPortfolio = () => {
    return stocks.map(stock => ({
      ...stock,
      shares: stock.shares * 0.9, // Reduce by 10% pro rata
      hedged: true
    }));
  };

  const hedgedStocks = createHedgedPortfolio();

  if (isLoading) {
    return (
      <div className="p-6 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="h-8 bg-slate-200 rounded animate-pulse"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-96 bg-slate-200 rounded-xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (stocks.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="max-w-md mx-auto shadow-xl">
          <CardHeader className="text-center">
            <BarChart3 className="w-16 h-16 mx-auto text-slate-400 mb-4" />
            <CardTitle className="text-2xl navy-text">No Data Available</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-slate-600 mb-6">
              Add some stocks to your portfolio to see analytics
            </p>
            <Link to={createPageUrl("AddStock")}>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Add Your First Stock
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold navy-text mb-2">Portfolio Analytics</h1>
            <p className="text-slate-600 text-lg">
              Advanced insights and risk analysis for your ${portfolioValue.toLocaleString()} portfolio
            </p>
          </div>

          <Tabs defaultValue="current" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8 bg-blue-800">
              <TabsTrigger value="current" className="flex items-center gap-2 data-[state=active]:bg-blue-900 data-[state=active]:text-white text-blue-100">
                <BarChart3 className="w-4 h-4" />
                Current Portfolio
              </TabsTrigger>
              <TabsTrigger value="hedged" className="flex items-center gap-2 data-[state=active]:bg-blue-900 data-[state=active]:text-white text-blue-100">
                <Shield className="w-4 h-4" />
                With Volatility Hedge
              </TabsTrigger>
            </TabsList>

            <TabsContent value="current">
              <div className="mb-4">
                <h3 className="text-xl font-semibold navy-text mb-2">Current Portfolio Analysis</h3>
                <p className="text-slate-600">Your existing stock allocations and risk metrics</p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <SectorAllocation stocks={stocks} />
                <GeographicAllocation stocks={stocks} />
                <RiskMetrics stocks={stocks} />
                <CorrelationAnalysis stocks={stocks} />
              </div>
            </TabsContent>

            <TabsContent value="hedged">
              <div className="mb-4">
                <Card className="bg-blue-50 border-blue-200 mb-6">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold text-blue-900">Volatility Hedge Strategy</h3>
                    </div>
                    <p className="text-sm text-blue-800">
                      This analysis shows your portfolio with 90% of current holdings and 10% allocated to 
                      volatility arbitrage options strategies.
                    </p>
                  </CardContent>
                </Card>
                <h3 className="text-xl font-semibold navy-text mb-2">Portfolio with Volatility Hedge</h3>
                <p className="text-slate-600 mb-6">Reduced stock positions with defensive volatility strategies</p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <SectorAllocation stocks={hedgedStocks} isHedged={true} />
                <GeographicAllocation stocks={hedgedStocks} isHedged={true} />
                <RiskMetrics stocks={hedgedStocks} isHedged={true} />
                <CorrelationAnalysis stocks={hedgedStocks} isHedged={true} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
