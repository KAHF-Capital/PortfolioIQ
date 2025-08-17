
import React, { useState } from "react";
import { Stock } from "@/entities/Stock";
import { InvokeLLM } from "@/integrations/Core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, Search, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AddStock() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    symbol: "",
    shares: "",
    purchase_price: "",
    purchase_date: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [error, setError] = useState("");
  const [stockInfo, setStockInfo] = useState(null);

  const lookupStock = async () => {
    if (!formData.symbol) return;
    
    setIsLookingUp(true);
    setError("");
    
    try {
      const result = await InvokeLLM({
        prompt: `Get comprehensive current stock information for ${formData.symbol.toUpperCase()}. Include:
        1. Current price, company name, market cap
        2. GICS sector classification (Energy, Materials, Industrials, Consumer Discretionary, Consumer Staples, Health Care, Financials, Information Technology, Communication Services, Utilities, Real Estate)
        3. Country of headquarters
        4. Recent analyst sentiment (average rating and price target)
        
        Use current financial data sources.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            symbol: { type: "string" },
            company_name: { type: "string" },
            current_price: { type: "number" },
            gics_sector: { 
              type: "string",
              enum: ["Energy", "Materials", "Industrials", "Consumer Discretionary", "Consumer Staples", "Health Care", "Financials", "Information Technology", "Communication Services", "Utilities", "Real Estate"]
            },
            country: { type: "string" },
            market_cap: { type: "number" },
            analyst_sentiment: {
              type: "object",
              properties: {
                average_rating: { type: "string" },
                price_target: { type: "number" },
                num_analysts: { type: "number" },
                sources: { type: "array", items: { type: "string" } }
              }
            },
            valid: { type: "boolean" }
          },
          required: ["symbol", "company_name", "current_price", "gics_sector", "country", "market_cap", "valid"]
        }
      });

      if (result.valid) {
        setStockInfo(result);
      } else {
        setError("Stock symbol not found. Please check the symbol and try again.");
      }
    } catch (error) {
      setError("Error looking up stock information. Please try again.");
    }
    
    setIsLookingUp(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stockInfo) {
      setError("Please lookup the stock information first.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await Stock.create({
        ...formData,
        symbol: formData.symbol.toUpperCase(),
        shares: parseFloat(formData.shares),
        purchase_price: parseFloat(formData.purchase_price),
        company_name: stockInfo.company_name,
        current_price: stockInfo.current_price,
        sector: stockInfo.gics_sector,
        gics_sector: stockInfo.gics_sector,
        country: stockInfo.country,
        market_cap: stockInfo.market_cap,
        analyst_sentiment: stockInfo.analyst_sentiment,
        last_updated: new Date().toISOString()
      });

      navigate(createPageUrl("Portfolio"));
    } catch (error) {
      setError("Error adding stock to portfolio. Please try again.");
    }
    
    setIsLoading(false);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'symbol') {
      setStockInfo(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="p-6 md:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Link to={createPageUrl("Portfolio")}>
              <Button variant="outline" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold navy-text">Add Stock</h1>
              <p className="text-slate-600">Add a new stock to your portfolio</p>
            </div>
          </div>

          <Card className="shadow-xl border-0">
            <CardHeader className="gradient-bg text-white">
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Stock Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="symbol">Stock Symbol</Label>
                  <div className="flex gap-2">
                    <Input
                      id="symbol"
                      placeholder="e.g., AAPL, GOOGL, TSLA"
                      value={formData.symbol}
                      onChange={(e) => handleInputChange('symbol', e.target.value.toUpperCase())}
                      className="flex-1 bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                    <Button
                      type="button"
                      onClick={lookupStock}
                      disabled={isLookingUp || !formData.symbol}
                      variant="outline"
                      className="gap-2"
                    >
                      {isLookingUp ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Search className="w-4 h-4" />
                      )}
                      Lookup
                    </Button>
                  </div>
                </div>

                {stockInfo && (
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <h3 className="font-semibold text-blue-900">{stockInfo.company_name}</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-blue-700">Current Price:</span>
                            <span className="ml-2 font-medium">${stockInfo.current_price}</span>
                          </div>
                          <div>
                            <span className="text-blue-700">GICS Sector:</span>
                            <span className="ml-2 font-medium">{stockInfo.gics_sector}</span>
                          </div>
                          <div>
                            <span className="text-blue-700">Country:</span>
                            <span className="ml-2 font-medium">{stockInfo.country}</span>
                          </div>
                          <div>
                            <span className="text-blue-700">Market Cap:</span>
                            <span className="ml-2 font-medium">${(stockInfo.market_cap / 1e9).toFixed(1)}B</span>
                          </div>
                          {stockInfo.analyst_sentiment && (
                            <>
                              <div>
                                <span className="text-blue-700">Analyst Rating:</span>
                                <span className="ml-2 font-medium">{stockInfo.analyst_sentiment.average_rating}</span>
                              </div>
                              <div>
                                <span className="text-blue-700">Price Target:</span>
                                <span className="ml-2 font-medium">${stockInfo.analyst_sentiment.price_target?.toFixed(2)}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="shares">Number of Shares</Label>
                    <Input
                      id="shares"
                      type="number"
                      min="0"
                      step="0.001"
                      placeholder="100"
                      value={formData.shares}
                      onChange={(e) => handleInputChange('shares', e.target.value)}
                      className="bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="purchase_price">Purchase Price per Share</Label>
                    <Input
                      id="purchase_price"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="150.00"
                      value={formData.purchase_price}
                      onChange={(e) => handleInputChange('purchase_price', e.target.value)}
                      className="bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purchase_date">Purchase Date</Label>
                  <Input
                    id="purchase_date"
                    type="date"
                    value={formData.purchase_date}
                    onChange={(e) => handleInputChange('purchase_date', e.target.value)}
                    className="bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !stockInfo || !formData.shares || !formData.purchase_price}
                  className="w-full bg-blue-800 hover:bg-blue-900 py-3"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding Stock...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Add to Portfolio
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
