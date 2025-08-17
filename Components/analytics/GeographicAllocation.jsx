
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Globe } from "lucide-react";

const COUNTRY_COLORS = {
  'United States': '#1e40af',
  'China': '#1e293b',
  'Japan': '#334155',
  'Germany': '#3730a3',
  'United Kingdom': '#475569',
  'France': '#1d4ed8',
  'Canada': '#4338ca',
  'South Korea': '#64748b',
  'Taiwan': '#374151',
  'India': '#1f2937',
  'Other': '#3b82f6',
  'Unknown': '#6b7280'
};

export default function GeographicAllocation({ stocks, isHedged = false }) {
  const getGeographicData = () => {
    const countryTotals = {};
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
      const country = stock.country || 'Unknown';
      const value = (stock.current_price || stock.purchase_price || 0) * stock.shares;
      countryTotals[country] = (countryTotals[country] || 0) + value;
    });

    // Add volatility hedge allocation if this is the hedged view
    if (isHedged) {
      const volHedgeValue = originalPortfolioValue * 0.1;
      countryTotals['Other'] = (countryTotals['Other'] || 0) + volHedgeValue;
    }

    const totalPortfolioValue = isHedged ? originalPortfolioValue : totalStockValue;

    return Object.entries(countryTotals)
      .map(([country, value]) => ({
        country: country,
        value: value,
        percentage: ((value / totalPortfolioValue) * 100).toFixed(0)
      }))
      .sort((a, b) => b.value - a.value);
  };

  const geoData = getGeographicData();

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
          <p className="font-medium navy-text">{data.payload.country}</p>
          <p className="text-sm text-slate-600">
            Value: ${data.value.toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </p>
          <p className="text-sm text-slate-600">
            Allocation: {data.payload.percentage}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 navy-text">
          <Globe className="w-5 h-5" />
          Geographic Allocation {isHedged && '(with Volatility Hedge)'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {geoData.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            No geographic data available
          </div>
        ) : (
          <div className="h-[500px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={geoData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={180}
                  innerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {geoData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COUNTRY_COLORS[entry.country] || '#6b7280'} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="mt-6 space-y-2 max-h-40 overflow-y-auto">
          {geoData.map((geo, index) => (
            <div key={geo.country} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COUNTRY_COLORS[geo.country] || '#6b7280' }}
                />
                <span className="font-medium">{geo.country}</span>
              </div>
              <div className="text-right">
                <div className="font-semibold">${geo.value.toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
                <div className="text-slate-500">{geo.percentage}%</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
