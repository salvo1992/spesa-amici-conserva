
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Utensils, SearchIcon } from 'lucide-react';

const AddMealModal = ({ 
  isOpen, 
  onClose, 
  mealType,
  onAddMeal 
}: {
  isOpen: boolean;
  onClose: () => void;
  mealType: string;
  onAddMeal: (meal: any) => void;
}) => {
  const [selectedRecipes, setSelectedRecipes] = useState<any[]>([]);
  const [customMeal, setCustomMeal] = useState({
    name: '',
    description: '',
    ingredients: [{ name: '', quantity: '', unit: '' }]
  });

  const handleAddIngredient = () => {
    setCustomMeal(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: '', quantity: '', unit: '' }]
    }));
  };

  const handleRecipeSelect = (recipe: any) => {
    setSelectedRecipes(prev => 
      prev.includes(recipe) 
        ? prev.filter(r => r !== recipe)
        : [...prev, recipe]
    );
  };

  const handleSubmit = () => {
    const mealData = {
      type: mealType,
      recipes: selectedRecipes,
      customMeal: customMeal
    };
    onAddMeal(mealData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Utensils className="h-6 w-6 text-orange-600" />
            Aggiungi {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="recipes" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="recipes">Ricette</TabsTrigger>
            <TabsTrigger value="custom">Pasto Personalizzato</TabsTrigger>
          </TabsList>
          
          <TabsContent value="recipes">
            <div className="flex items-center mb-4">
              <SearchIcon className="mr-2" />
              <Input placeholder="Cerca ricette..." />
            </div>
            {/* Lista ricette mock - da collegare al sistema di ricette */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { name: 'Colazione Proteica', description: 'Ricca di proteine' },
                { name: 'Smoothie Verde', description: 'Frullato di verdure' }
              ].map((recipe, index) => (
                <div 
                  key={index} 
                  className={`border p-4 rounded-lg flex items-center gap-2 ${
                    selectedRecipes.includes(recipe) 
                      ? 'bg-orange-100 border-orange-300' 
                      : ''
                  }`}
                >
                  <Checkbox 
                    checked={selectedRecipes.includes(recipe)}
                    onCheckedChange={() => handleRecipeSelect(recipe)}
                  />
                  <div>
                    <h3 className="font-semibold">{recipe.name}</h3>
                    <p className="text-sm text-muted-foreground">{recipe.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="custom">
            <div className="space-y-4">
              <Input 
                placeholder="Nome del pasto" 
                value={customMeal.name}
                onChange={(e) => setCustomMeal(prev => ({ ...prev, name: e.target.value }))}
              />
              <Input 
                placeholder="Descrizione" 
                value={customMeal.description}
                onChange={(e) => setCustomMeal(prev => ({ ...prev, description: e.target.value }))}
              />
              
              {customMeal.ingredients.map((ingredient, index) => (
                <div key={index} className="flex gap-2">
                  <Input 
                    placeholder="Ingrediente" 
                    value={ingredient.name}
                    onChange={(e) => {
                      const newIngredients = [...customMeal.ingredients];
                      newIngredients[index].name = e.target.value;
                      setCustomMeal(prev => ({ ...prev, ingredients: newIngredients }));
                    }}
                  />
                  <Input 
                    placeholder="Quantità" 
                    value={ingredient.quantity}
                    onChange={(e) => {
                      const newIngredients = [...customMeal.ingredients];
                      newIngredients[index].quantity = e.target.value;
                      setCustomMeal(prev => ({ ...prev, ingredients: newIngredients }));
                    }}
                  />
                  <Input 
                    placeholder="Unità" 
                    value={ingredient.unit}
                    onChange={(e) => {
                      const newIngredients = [...customMeal.ingredients];
                      newIngredients[index].unit = e.target.value;
                      setCustomMeal(prev => ({ ...prev, ingredients: newIngredients }));
                    }}
                  />
                </div>
              ))}
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleAddIngredient}
              >
                Aggiungi Ingrediente
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-4 mt-4">
          <Button variant="outline" onClick={onClose}>Annulla</Button>
          <Button 
            className="bg-gradient-to-r from-orange-600 to-red-600 text-white"
            onClick={handleSubmit}
          >
            Salva Pasto
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddMealModal;
