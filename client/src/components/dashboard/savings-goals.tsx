import { Plus, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { SavingsGoal } from "@shared/schema";

interface SavingsGoalsProps {
  goals: SavingsGoal[];
}

export function SavingsGoals({ goals }: SavingsGoalsProps) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm transition-colors duration-300">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Savings Goals</h3>
        <Button
          variant="outline"
          size="sm"
          className="text-blue-600 hover:text-blue-700 border-blue-600 hover:border-blue-700"
        >
          <Plus size={16} />
        </Button>
      </div>
      
      <div className="space-y-4">
        {goals.length === 0 ? (
          <div className="text-center py-8">
            <Target className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              No savings goals yet. Create your first goal to start tracking your progress.
            </p>
          </div>
        ) : (
          goals.map((goal) => {
            const currentAmount = parseFloat(goal.currentAmount || "0");
            const targetAmount = parseFloat(goal.targetAmount);
            const progress = (currentAmount / targetAmount) * 100;
            
            return (
              <div key={goal.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900 dark:text-white">{goal.name}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    ${currentAmount.toLocaleString()} / ${targetAmount.toLocaleString()}
                  </span>
                </div>
                <Progress value={progress} className="mb-1" />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {Math.round(progress)}% complete
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
