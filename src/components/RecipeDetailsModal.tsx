
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, ChefHat, ShoppingCart, Share2, Star } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Recipe {
  id: string;
  name: string;
  description: string;
  image: string;
  prepTime: number;
  servings: number;
  ingredients: string[];
  instructions: string[];
  category: string;
}

interface RecipeDetailsModalProps {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToShoppingList: (ingredients: string[]) => void;
  onShare: (recipe: Recipe) => void;
}

const RecipeDetailsModal: React.FC<RecipeDetailsModalProps> = ({
  recipe,
  isOpen,
  onClose,
  onAddToShoppingList,
  onShare
}) => {
  if (!recipe) return null;

  const handleAddToShoppingList = () => {
    onAddToShoppingList(recipe.ingredients);
    toast({
      title: "Ingredienti aggiunti!",
      description: `${recipe.ingredients.length} ingredienti aggiunti alla lista della spesa`,
    });
  };

  const handleShare = () => {
    onShare(recipe);
    toast({
      title: "Ricetta condivisa!",
      description: `${recipe.name} è stata condivisa`,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {recipe.name}
            </DialogTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Condividi
              </Button>
              <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600 text-white">
                <Star className="h-4 w-4 mr-2" />
                Salva
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-6 mt-6">
          {/* Header con immagine */}
          <div className="relative h-64 bg-gradient-to-br from-orange-200 via-red-200 to-pink-200 rounded-xl flex items-center justify-center overflow-hidden">
            <ChefHat className="h-24 w-24 text-white/80" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
          
          {/* Info rapide */}
          <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <span className="font-medium">{recipe.prepTime} minuti</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-500" />
              <span className="font-medium">{recipe.servings} porzioni</span>
            </div>
            <Badge className="bg-primary/10 text-primary">
              {recipe.category}
            </Badge>
          </div>
          
          {/* Descrizione */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Descrizione</h3>
            <p className="text-muted-foreground leading-relaxed">{recipe.description}</p>
          </div>
          
          {/* Ingredienti */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Ingredienti</h3>
              <Button 
                onClick={handleAddToShoppingList}
                className="bg-gradient-to-r from-accent to-blue-500 hover:from-accent/90 hover:to-blue-500/90 text-white"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Aggiungi alla Lista
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {recipe.ingredients.map((ingredient, index) => (
                <div 
                  key={index} 
                  className="flex items-center gap-3 p-3 bg-white rounded-lg border hover:shadow-md transition-shadow duration-200"
                >
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span className="text-sm">{ingredient}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Istruzioni */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Preparazione</h3>
            <div className="space-y-4">
              {recipe.instructions.map((instruction, index) => (
                <div 
                  key={index}
                  className="flex gap-4 p-4 bg-white rounded-lg border-l-4 border-primary hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <p className="text-sm leading-relaxed">{instruction}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RecipeDetailsModal;
