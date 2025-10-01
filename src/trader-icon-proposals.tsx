import React from 'react';
import { 
  Truck, 
  Store, 
  Package, 
  ArrowRightLeft, 
  Building2, 
  Warehouse, 
  ShoppingBag, 
  Scale, 
  Users, 
  Network,
  PackageOpen,
  ShoppingCart,
  Building,
  Boxes
} from 'lucide-react';

// Icon proposals for traders with context explanations
export const TraderIconProposals = () => {
  const iconOptions = [
    {
      icon: <Truck className="w-6 h-6" />,
      name: "Truck",
      description: "Transportation & Logistics",
      context: "Represents moving goods from farms to markets",
      pros: "Clear logistics meaning, currently used",
      cons: "Might be too specific to transport only"
    },
    {
      icon: <Store className="w-6 h-6" />,
      name: "Store",
      description: "Commerce & Retail",
      context: "Represents trading business and market presence",
      pros: "Universal commerce symbol, widely understood",
      cons: "Might suggest retail store vs wholesale trading"
    },
    {
      icon: <Package className="w-6 h-6" />,
      name: "Package",
      description: "Goods Handling",
      context: "Represents packaging and distribution of products",
      pros: "Shows product handling, clean design",
      cons: "Could be confused with shipping/delivery"
    },
    {
      icon: <ArrowRightLeft className="w-6 h-6" />,
      name: "ArrowRightLeft",
      description: "Exchange & Trading",
      context: "Represents buying and selling, exchange of goods",
      pros: "Perfect trading metaphor, shows two-way flow",
      cons: "Might be abstract for some users"
    },
    {
      icon: <Building2 className="w-6 h-6" />,
      name: "Building2",
      description: "Business Operations",
      context: "Represents established trading business",
      pros: "Professional, shows business establishment",
      cons: "Generic business symbol, less specific"
    },
    {
      icon: <Warehouse className="w-6 h-6" />,
      name: "Warehouse",
      description: "Storage & Distribution",
      context: "Represents storage facilities and bulk handling",
      pros: "Perfect for wholesale traders, storage focus",
      cons: "Might suggest storage only vs active trading"
    },
    {
      icon: <Scale className="w-6 h-6" />,
      name: "Scale",
      description: "Weighing & Measuring",
      context: "Represents agricultural product measurement and fair trade",
      pros: "Agricultural relevance, fairness symbol",
      cons: "Might be too specific to weighing function"
    },
    {
      icon: <PackageOpen className="w-6 h-6" />,
      name: "PackageOpen",
      description: "Product Inspection",
      context: "Represents quality checking and product handling",
      pros: "Shows active product management",
      cons: "Less universally understood"
    },
    {
      icon: <Boxes className="w-6 h-6" />,
      name: "Boxes",
      description: "Bulk Goods",
      context: "Represents handling multiple products in volume",
      pros: "Shows bulk trading, multiple products",
      cons: "Might suggest storage vs active trading"
    },
    {
      icon: <Network className="w-6 h-6" />,
      name: "Network",
      description: "Distribution Network",
      context: "Represents connecting farmers to buyers through networks",
      pros: "Shows intermediary role perfectly",
      cons: "Might be too abstract, tech-focused"
    }
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Trader Icon Proposals for AgriLink</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {iconOptions.map((option, index) => (
          <div key={index} className="border rounded-lg p-4 bg-card">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-primary/10 rounded-lg text-primary">
                {option.icon}
              </div>
              <div>
                <h3 className="font-semibold">{option.name}</h3>
                <p className="text-sm text-muted-foreground">{option.description}</p>
              </div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Context: </span>
                <span className="text-muted-foreground">{option.context}</span>
              </div>
              <div>
                <span className="font-medium text-green-700">Pros: </span>
                <span className="text-green-600">{option.pros}</span>
              </div>
              <div>
                <span className="font-medium text-orange-700">Cons: </span>
                <span className="text-orange-600">{option.cons}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-primary/5 rounded-lg">
        <h3 className="font-semibold mb-2">Recommendations:</h3>
        <div className="space-y-2 text-sm">
          <p><strong>Best Overall:</strong> <strong>Store</strong> - Universal commerce symbol that clearly represents trading business</p>
          <p><strong>Most Agricultural:</strong> <strong>Scale</strong> - Directly relates to agricultural product measurement and fair trading</p>
          <p><strong>Most Specific:</strong> <strong>ArrowRightLeft</strong> - Perfect metaphor for trading/exchange activities</p>
          <p><strong>Current Choice:</strong> <strong>Truck</strong> - Works well but focuses on logistics vs trading</p>
        </div>
      </div>

      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <h3 className="font-semibold mb-2">Usage Context in AgriLink:</h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Sprout className="w-4 h-4 text-green-600" />
            <span>Farmers (current)</span>
          </div>
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-primary" />
            <span>Traders (current)</span>
          </div>
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-purple-600" />
            <span>Buyers (current)</span>
          </div>
        </div>
      </div>
    </div>
  );
};