
import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ChefHat } from 'lucide-react';
import AddMealModal from './AddMealModal';

interface Meal {
  id: string;
  name: string;
  time: string;
  recipeId?: string;
}

interface MealScheduleProps {
  memberId: string;
  memberName: string;
  meals: Meal[];
  onAddMeal: (memberId: string, mealType: string) => void;
  date: Date;
}

const mealTypes = [
  { id: 'breakfast', label: 'Colazione', time: '08:00' },
  { id: 'morningSnack', label: 'Spuntino', time: '10:30' },
  { id: 'lunch', label: 'Pranzo', time: '13:00' },
  { id: 'afternoonSnack', label: 'Merenda', time: '16:30' },
  { id: 'dinner', label: 'Cena', time: '20:00' },
];

const MealSchedule = ({ memberId, memberName, meals, onAddMeal, date }: MealScheduleProps) => {
  const [selectedMealType, setSelectedMealType] = useState<string | null>(null);

  return (
    <Card className="bg-card shadow-lg border-0">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-semibold">{memberName[0].toUpperCase()}</span>
          </div>
          <h3 className="font-semibold text-lg">{memberName}</h3>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {mealTypes.map((type) => {
          const meal = meals.find(m => m.time === type.time);
          
          return (
            <div key={type.id} className="flex items-center gap-4">
              <div className="w-20 text-sm text-muted-foreground">
                {type.time}
              </div>
              {meal ? (
                <div className="flex-1 bg-muted/50 rounded-lg p-2 flex items-center gap-2">
                  <ChefHat className="w-4 h-4 text-primary" />
                  <span>{meal.name}</span>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="flex-1 border-dashed"
                  onClick={() => {
                    setSelectedMealType(type.id);
                    onAddMeal(memberId, type.id);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Aggiungi {type.label}
                </Button>
              )}
            </div>
          );
        })}
        <AddMealModal
          isOpen={selectedMealType !== null}
          onClose={() => setSelectedMealType(null)}
          mealType={selectedMealType || ''}
          onAddMeal={(meal) => {
            console.log('Meal added:', meal);
            // Logica per salvare il pasto
          }}
        />
      </CardContent>
    </Card>
  );
};

export default MealSchedule;
