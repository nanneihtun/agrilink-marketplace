import { Button } from "./ui/button";

interface DemoAccountsLoginProps {
  onResetAccounts?: () => void;
}

export function DemoAccountsLogin({ onResetAccounts }: DemoAccountsLoginProps) {
  const demoAccounts = [
    { role: "Admin", email: "admin@agrilink.com", password: "admin123" },
    { role: "Farmer", email: "thura.farmer@gmail.com", password: "farmer123" },
    { role: "Trader", email: "kyaw.trader@gmail.com", password: "trader123" },
    { role: "Buyer", email: "su.buyer@gmail.com", password: "buyer123" }
  ];

  const handleResetAccounts = () => {
    console.log('🔄 Manually resetting demo accounts...');
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="text-xs text-muted-foreground bg-muted p-3 rounded space-y-2">
      <p className="font-medium">Demo Credentials:</p>
      <div className="grid grid-cols-1 gap-1">
        {demoAccounts.map((account) => (
          <p key={account.role}>
            {account.role}: {account.email} / {account.password}
          </p>
        ))}
      </div>
      <Button 
        type="button" 
        variant="outline" 
        size="sm" 
        onClick={onResetAccounts || handleResetAccounts}
        className="w-full mt-2 text-xs"
      >
        Reset Demo Accounts
      </Button>
    </div>
  );
}