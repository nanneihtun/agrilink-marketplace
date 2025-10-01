import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { TrendingUp, TrendingDown, Equal, AlertCircle, ChevronLeft } from "lucide-react";

interface MarketData {
  product: string;
  currentPrice: number;
  weeklyChange: number;
  monthlyChange: number;
  farmerAvg: number;
  wholesalerAvg: number;
  unit: string;
}

interface MarketInsightsProps {
  marketData: MarketData[];
  onBack?: () => void;
}

export function MarketInsights({ marketData, onBack }: MarketInsightsProps) {
  const getTrendIcon = (change: number) => {
    if (change > 0) return TrendingUp;
    if (change < 0) return TrendingDown;
    return Equal;
  };

  const getTrendColor = (change: number) => {
    if (change > 0) return "text-red-500";
    if (change < 0) return "text-green-500";
    return "text-gray-500";
  };

  const getInsight = (data: MarketData) => {
    const farmerVsWholesaler = ((data.wholesalerAvg - data.farmerAvg) / data.farmerAvg) * 100;
    
    if (farmerVsWholesaler > 30) {
      return {
        type: "opportunity",
        message: `Significant price gap (${farmerVsWholesaler.toFixed(0)}%) - consider buying direct from farmers`,
        color: "text-primary"
      };
    } else if (data.weeklyChange > 15) {
      return {
        type: "alert",
        message: "Rapid price increase - market volatility detected",
        color: "text-red-600"
      };
    } else if (data.weeklyChange < -15) {
      return {
        type: "opportunity",
        message: "Price drop detected - good buying opportunity",
        color: "text-green-600"
      };
    }
    
    return {
      type: "stable",
      message: "Market stable - consistent pricing across sources",
      color: "text-gray-600"
    };
  };

  return (
    <div className="space-y-6">
      {onBack && (
        <Button variant="outline" size="sm" onClick={onBack}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Product Details
        </Button>
      )}
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Market Insights & Price Trends
          </CardTitle>
        </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {marketData.map((data) => {
            const WeeklyTrendIcon = getTrendIcon(data.weeklyChange);
            const weeklyTrendColor = getTrendColor(data.weeklyChange);
            const MonthlyTrendIcon = getTrendIcon(data.monthlyChange);
            const monthlyTrendColor = getTrendColor(data.monthlyChange);
            const insight = getInsight(data);

            return (
              <div key={data.product} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">{data.product}</h4>
                  <Badge variant="outline">{data.unit}</Badge>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Current Price</p>
                    <p className="font-semibold">{data.currentPrice.toLocaleString()} MMK</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Weekly Change</p>
                    <div className={`flex items-center gap-1 ${weeklyTrendColor}`}>
                      <WeeklyTrendIcon className="w-4 h-4" />
                      <span className="font-medium">{Math.abs(data.weeklyChange)}%</span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Farmer Avg</p>
                    <p className="font-medium text-green-600">{data.farmerAvg.toLocaleString()} MMK</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">Wholesaler Avg</p>
                    <p className="font-medium text-primary">{data.wholesalerAvg.toLocaleString()} MMK</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2 p-3 bg-gray-50 rounded">
                  <AlertCircle className={`w-4 h-4 mt-0.5 ${insight.color}`} />
                  <div>
                    <p className={`text-sm font-medium ${insight.color}`}>
                      {insight.type === 'alert' ? 'Market Alert' : 'Market Insight'}
                    </p>
                    <p className="text-sm text-muted-foreground">{insight.message}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 p-4 bg-primary/5 rounded-lg">
          <h4 className="font-medium mb-2">Understanding Price Transparency</h4>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h5 className="font-medium text-green-600 mb-1">Buying from Farmers</h5>
              <ul className="text-muted-foreground space-y-1">
                <li>• Usually lower base prices</li>
                <li>• Fresher products</li>
                <li>• Support direct farming</li>
                <li>• May require transport arrangements</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-primary mb-1">Buying from Wholesalers</h5>
              <ul className="text-muted-foreground space-y-1">
                <li>• Convenient bulk availability</li>
                <li>• Established logistics</li>
                <li>• Quality sorting and grading</li>
                <li>• Higher prices but less hassle</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
    </div>
  );
}