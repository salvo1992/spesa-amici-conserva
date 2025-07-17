
import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ChefHat, Trash2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { firebaseApi, type MealPlan, type Recipe } from '@/lib/firebase';
import { format } from 'date-fns';
import AddMealModal from './AddMealModal';

interface MealScheduleProps {
  memberId: string;
  memberName: string;
  meals: MealPlan[];
  onAddMeal: (mealData: { memberId: string; mealType: string; recipes: any[]; customMeal: any }) => void;
  date: Date;
  recipes: Recipe[];
}

const mealTypes = [
  { id: 'breakfast', label: 'Colazione', time: '08:00' },
  { id: 'morningSnack', label: 'Spuntino', time: '10:30' },
  { id: 'lunch', label: 'Pranzo', time: '13:00' },
  { id: 'afternoonSnack', label: 'Merenda', time: '16:30' },
  { id: 'dinner', label: 'Cena', time: '20:00' },
];

const MealSchedule = ({ memberId, memberName, meals, onAddMeal, date, recipes }: MealScheduleProps) => {
  const [selectedMealType, setSelectedMealType] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const deleteMealMutation = useMutation({
    mutationFn: firebaseApi.deleteMealPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-plans', format(date, 'yyyy-MM-dd')] });
      toast({
        title: "Pasto eliminato",
        description: "Il pasto è stato eliminato con successo",
      });
    },
  });

  const getMealForType = (mealType: string) => {
    return meals.find(meal => meal.meal_type === mealType);
  };

  const handleAddMealClick = (mealType: string) => {
    setSelectedMealType(mealType);
  };

  const handleAddMealSubmit = (mealData: { recipes: any[]; customMeal: any }) => {
    if (!selectedMealType) return;
    
    onAddMeal({
      memberId,
      mealType: selectedMealType,
      recipes: mealData.recipes,
      customMeal: mealData.customMeal,
    });
    
    setSelectedMealType(null);
  };

  const handleDeleteMeal = (mealId: string) => {
    deleteMealMutation.mutate(mealId);
  };

  const renderMealContent = (meal: MealPlan) => {
    const hasRecipes = meal.recipes && meal.recipes.length > 0;
    const hasCustomMeal = meal.custom_meal && meal.custom_meal.name;

    return (
      <div className="space-y-2">
        {hasRecipes && (
          <div className="space-y-1">
            {meal.recipes.map((recipeId, index) => {
              const recipe = recipes.find(r => r.id === recipeId || r.name === recipeId);
              return (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <ChefHat className="w-3 h-3 text-red-600" />
                  <span>{recipe?.name || recipeId}</span>
                </div>
              );
            })}
          </div>
        )}
        
        {hasCustomMeal && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm font-medium">
              <ChefHat className="w-3 h-3 text-red-600" />
              <span>{meal.custom_meal.name}</span>
            </div>
            {meal.custom_meal.description && (
              <p className="text-xs text-muted-foreground ml-5">{meal.custom_meal.description}</p>
            )}
            {meal.custom_meal.ingredients && meal.custom_meal.ingredients.length > 0 && (
              <div className="ml-5 space-y-1">
                {meal.custom_meal.ingredients.map((ingredient, index) => (
                  <div key={index} className="text-xs text-muted-foreground">
                    {ingredient.quantity} {ingredient.unit} {ingredient.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Card className="bg-card shadow-lg border-0 border-l-4 border-l-red-500">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-600 to-orange-600 flex items-center justify-center">
              <span className="text-white font-semibold text-sm">{memberName[0].toUpperCase()}</span>
            </div>
            <h3 className="font-semibold text-lg">{memberName}</h3>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {mealTypes.map((type) => {
            const meal = getMealForType(type.id);
            
            return (
              <div key={type.id} className="flex items-start gap-4">
                <div className="w-16 text-sm text-red-600 font-medium mt-2">
                  {type.time}
                </div>
                <div className="flex-1">
                  {meal ? (
                    <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium text-red-800">{type.label}</span>
                          </div>
                          {renderMealContent(meal)}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteMeal(meal.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full border-dashed border-red-300 hover:bg-red-50 hover:border-red-400 text-red-600"
                      onClick={() => handleAddMealClick(type.id)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Aggiungi {type.label}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
      
      <AddMealModal
        isOpen={selectedMealType !== null}
        onClose={() => setSelectedMealType(null)}
        mealType={selectedMealType || ''}
        onAddMeal={handleAddMealSubmit}
        recipes={recipes}
      />
    </>
  );
};

export default MealSchedule;
