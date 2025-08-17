
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
// Button, Eye, EyeOff imports are removed as they are no longer used

const GICS_COLORS = {
  'Energy': '#1e293b',
  'Materials': '#334155',
  'Industrials': '#1e40af',
  'Consumer Discretionary': '#3730a3',
  'Consumer Staples': '#1f2937',
  'Health Care': '#374151',
  'Financials': '#0f172a',
  'Information Technology': '#1d4ed8',
  'Communication Services': '#4338ca',
  'Utilities': '#475569',
  'Real Estate': '#64748b',
  'Technology': '#1d4ed8',
  'Volatility Arbitrage': '#3b82f6',
  'Unknown': '#6b7280'
};

export default function SectorAllocation({ stocks, isHedged = false }) {
  // const [showLabels, setShowLabels] = useState(false); // Removed as labels are no longer toggled

  const getSectorData = () => {
    const sectorTotals = {};
    let totalStockValue = 0;

    // Calculate total stock value first
    stocks.forEach(stock => {
      const value = (stock.current_price || stock.purchase_price || 0) * stock.shares;
      totalStockValue += value;
    });

    // Calculate original portfolio value (before any hedging)
    const originalPortfolioValue = isHedged ? totalStockValue / 0.9 : totalStockValue;

    // Add stock allocations
    stocks.forEach(stock => {
      const sector = stock.gics_sector || stock.sector || 'Unknown';
      const value = (stock.current_price || stock.purchase_price || 0) * stock.shares;
      sectorTotals[sector] = (sectorTotals[sector] || 0) + value;
    });

    // Add volatility hedge allocation if this is the hedged view
    if (isHedged) {
      const volHedgeValue = originalPortfolioValue * 0.1;
      sectorTotals['Volatility Arbitrage'] = volHedgeValue;
    }

    const totalPortfolioValue = isHedged ? originalPortfolioValue : totalStockValue;

    return Object.entries(sectorTotals)
      .map(([sector, value]) => ({
        name: sector,
        value: value,
        percentage: ((value / totalPortfolioValue) * 100).toFixed(0)
      }))
      .sort((a, b) => b.value - a.value);
  };

  const sectorData = getSectorData();

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
 
