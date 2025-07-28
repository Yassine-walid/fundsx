import { Link, useLocation } from "wouter";
import { 
  Home, 
  Wallet, 
  Receipt, 
  Target, 
  RotateCcw, 
  Calendar, 
  Settings, 
  HelpCircle,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Salary Management", href: "/salary", icon: Wallet },
  { name: "Expenses", href: "/expenses", icon: Receipt },
  { name: "Savings Goals", href: "/savings", icon: Target },
  { name: "Recurring", href: "/recurring", icon: RotateCcw },
  { name: "Calendar View", href: "/calendar", icon: Calendar },
];

const secondaryNav = [
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Help", href: "/help", icon: HelpCircle },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="w-64 bg-white dark:bg-gray-800 shadow-lg transition-colors duration-300 flex flex-col">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <TrendingUp className="text-white" size={20} />
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">MyBudgetFlow</h1>
        </div>
        
        <nav className="space-y-2">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <div className={cn(
                  "flex items-center space-x-3 p-3 rounded-lg transition-colors",
                  isActive 
                    ? "bg-blue-600 text-white" 
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                )}>
                  <item.icon size={20} />
                  <span>{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          {secondaryNav.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <div className={cn(
                  "flex items-center space-x-3 p-3 rounded-lg transition-colors",
                  isActive 
                    ? "bg-blue-600 text-white" 
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                )}>
                  <item.icon size={20} />
                  <span>{item.name}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
