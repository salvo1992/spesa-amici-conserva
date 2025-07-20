
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Utensils, SearchIcon, Plus, Trash2 } from 'lucide-react';
import { type Recipe } from '@/lib/firebase';

interface AddMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  mealType: string;
  onAddMeal: (meal: { recipes: any[]; customMeal: any }) => void;
  recipes: Recipe[];
}

const AddMealModal = ({ 
  isOpen, 
  onClose, 
  mealType,
  onAddMeal,
  recipes 
}: AddMealModalProps) => {
  const [selectedRecipes, setSelectedRecipes] = useState<Recipe[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [customMeal, setCustomMeal] = useState({
    name: '',
    description: '',
    ingredients: [{ name: '', quantity: '', unit: '' }]
  });

  const filteredRecipes = recipes.filter(recipe =>
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipe.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddIngredient = () => {
    setCustomMeal(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: '', quantity: '', unit: '' }]
    }));
  };

  const handleRemoveIngredient = (index: number) => {
    setCustomMeal(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const handleRecipeSelect = (recipe: Recipe) => {
    setSelectedRecipes(prev => 
      prev.some(r => r.id === recipe.id)
        ? prev.filter(r => r.id !== recipe.id)
        : [...prev, recipe]
    );
  };

  const handleSubmit = () => {
    const mealData = {
      recipes: selectedRecipes,
      customMeal: customMeal
    };
    onAddMeal(mealData);
    
    // Reset form
    setSelectedRecipes([]);
    setSearchTerm('');
    setCustomMeal({
      name: '',
      description: '',
      ingredients: [{ name: '', quantity: '', unit: '' }]
    });
    onClose();
  };

  const getMealTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'breakfast': 'Colazione',
      'morningSnack': 'Spuntino',
      'lunch': 'Pranzo',
      'afternoonSnack': 'Merenda',
      'dinner': 'Cena'
    };
    return labels[type] || type;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[90vw] max-w-3xl max-h-[85vh] overflow-y-auto mx-2 rounded-lg">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Utensils className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
            <span className="break-words">Aggiungi {getMealTypeLabel(mealType)}</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="recipes" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="recipes">Ricette Salvate</TabsTrigger>
            <TabsTrigger value="custom">Pasto Personalizzato</TabsTrigger>
          </TabsList>
          
          <TabsContent value="recipes" className="space-y-4">
            <div className="flex items-center gap-2">
              <SearchIcon className="w-4 h-4 text-red-600" />
              <Input 
                placeholder="Cerca ricette..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
              {filteredRecipes.length > 0 ? (
                filteredRecipes.map((recipe) => (
                  <div 
                    key={recipe.id} 
                    className={`border rounded-lg p-3 cursor-pointer transition-all ${
                      selectedRecipes.some(r => r.id === recipe.id)
                        ? 'bg-red-50 border-red-300 shadow-md' 
                        : 'hover:bg-gray-50 border-gray-200'
                    }`}
                    onClick={() => handleRecipeSelect(recipe)}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox 
                        checked={selectedRecipes.some(r => r.id === recipe.id)}
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-red-800 text-sm sm:text-base break-words">{recipe.name}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1 break-words">{recipe.description}</p>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-xs text-muted-foreground">
                          <span>⏱️ {recipe.prep_time} min</span>
                          <span>👥 {recipe.servings} porzioni</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm ? 'Nessuna ricetta trovata' : 'Nessuna ricetta salvata'}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="custom" className="space-y-4">
            <div className="space-y-4">
              <Input 
                placeholder="Nome del pasto" 
                value={customMeal.name}
                onChange={(e) => setCustomMeal(prev => ({ ...prev, name: e.target.value }))}
              />
              <Input 
                placeholder="Descrizione (opzionale)" 
                value={customMeal.description}
                onChange={(e) => setCustomMeal(prev => ({ ...prev, description: e.target.value }))}
              />
              
              <div className="space-y-2">
                <h4 className="font-medium text-red-800">Ingredienti</h4>
                 {customMeal.ingredients.map((ingredient, index) => (
                   <div key={index} className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                     <Input 
                       placeholder="Ingrediente" 
                       value={ingredient.name}
                       onChange={(e) => {
                         const newIngredients = [...customMeal.ingredients];
                         newIngredients[index].name = e.target.value;
                         setCustomMeal(prev => ({ ...prev, ingredients: newIngredients }));
                       }}
                       className="flex-1 text-sm"
                     />
                     <div className="flex gap-2">
                       <Input 
                         placeholder="Quantità" 
                         value={ingredient.quantity}
                         onChange={(e) => {
                           const newIngredients = [...customMeal.ingredients];
                           newIngredients[index].quantity = e.target.value;
                           setCustomMeal(prev => ({ ...prev, ingredients: newIngredients }));
                         }}
                         className="w-24 text-sm"
                       />
                       <Input 
                         placeholder="Unità" 
                         value={ingredient.unit}
                         onChange={(e) => {
                           const newIngredients = [...customMeal.ingredients];
                           newIngredients[index].unit = e.target.value;
                           setCustomMeal(prev => ({ ...prev, ingredients: newIngredients }));
                         }}
                         className="w-20 text-sm"
                       />
                       {customMeal.ingredients.length > 1 && (
                         <Button
                           variant="ghost"
                           size="sm"
                           onClick={() => handleRemoveIngredient(index)}
                           className="text-red-600 hover:text-red-700 px-2"
                         >
                           <Trash2 className="w-4 h-4" />
                         </Button>
                       )}
                     </div>
                   </div>
                 ))}
                
                <Button 
                  variant="outline" 
                  className="w-full border-dashed border-red-300 text-red-600 hover:bg-red-50"
                  onClick={handleAddIngredient}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Aggiungi Ingrediente
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-4 mt-6">
          <Button variant="outline" onClick={onClose}>
            Annulla
          </Button>
          <Button 
            className="bg-gradient-to-r from-red-600 to-orange-600 text-white hover:from-red-700 hover:to-orange-700"
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
