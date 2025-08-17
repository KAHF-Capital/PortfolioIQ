import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Briefcase } from "lucide-react";

export default function PortfolioSummary({ metrics, stockCount }) {
  const { totalValue, totalCost, totalGainLoss, gainLossPercent } = metrics;

  const summaryCards = [
    {
      title: "Total Portfolio Value",
      value: `$${totalValue.toLocaleString()}`,
      icon: DollarSign,
      bgColor: "bg-blue-500",
      textColor: "text-blue-600"
    },
    {
      title: "Total Cost Basis",
      value: `$${totalCost.toLocaleString()}`,
      icon: Briefcase,
      bgColor: "bg-slate-500",
      textColor: "text-slate-600"
    },
    {
      title: "Total Gain/Loss",
      value: `$${totalGainLoss.toLocaleString()}`,
      icon: totalGainLoss >= 0 ? TrendingUp : TrendingDown,
      bgColor: totalGainLoss >= 0 ? "bg-green-500" : "bg-red-500",
      textColor: totalGainLoss >= 0 ? "text-green-600" : "text-red-600"
    },
    {
      title: "Return %",
      value: `${gainLossPercent >= 0 ? '+' : ''}${gainLossPercent.toFixed(2)}%`,
      icon: totalGainLoss >= 0 ? TrendingUp : TrendingDown,
      bgColor: totalGainLoss >= 0 ? "bg-green-500" : "bg-red-500",
      textColor: totalGainLoss >= 0 ? "text-green-600" : "text-red-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {summaryCards.map((card, index) => (
        <Card key={index} className="relative overflow-hidden shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <div className={`absolute top-0 right-0 w-20 h-20 ${card.bgColor} opacity-10 rounded-full transform translate-x-6 -translate-y-6`} />
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-sm font-medium text-slate-600">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${card.bgColor} bg-opacity-20`}>
                <card.icon className={`w-4 h-4 ${card.textColor}`} />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold navy-text">
              {card.value}
            </div>
            {index === 0 && stockCount > 0 && (
              <p className="text-xs text-slate-500 mt-1">
                {stockCount} {stockCount === 1 ? 'position' : 'positions'}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
