
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Users, ChefHat, ShoppingCart, Eye, Share2 } from 'lucide-react';

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

interface RecipeCardProps {
  recipe: Recipe;
  onViewDetails: (recipe: Recipe) => void;
  onAddToShoppingList: (ingredients: string[]) => void;
  onShare: (recipe: Recipe) => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ 
  recipe, 
  onViewDetails, 
  onAddToShoppingList, 
  onShare 
}) => {
  return (
    <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm transform hover:-translate-y-2 group">
      <div className="h-48 bg-gradient-to-br from-orange-200 via-red-200 to-pink-200 flex items-center justify-center relative overflow-hidden">
        <ChefHat className="h-16 w-16 text-white/80 group-hover:scale-110 transition-transform duration-300" />
        <div className="absolute top-3 right-3">
          <Button
            variant="ghost"
            size="sm"
            className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white"
            onClick={() => onShare(recipe)}
            title="Condividi ricetta e app"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>
      
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-bold text-xl text-foreground group-hover:text-primary transition-colors duration-200">
            {recipe.name}
          </h3>
          <Badge variant="secondary" className="bg-primary/10 text-primary font-medium">
            {recipe.category}
          </Badge>
        </div>
        
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2 leading-relaxed">
          {recipe.description}
        </p>
        
        <div className="flex items-center gap-6 mb-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-500" />
            <span className="font-medium">{recipe.prepTime} min</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-green-500" />
            <span className="font-medium">{recipe.servings} porzioni</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 hover:bg-primary/10 border-primary/20 group-hover:border-primary/40 transition-all duration-200"
            onClick={() => onViewDetails(recipe)}
          >
            <Eye className="h-4 w-4 mr-2" />
            Dettagli
          </Button>
          <Button 
            size="sm" 
            onClick={() => onAddToShoppingList(recipe.ingredients)}
            className="bg-gradient-to-r from-accent to-blue-500 hover:from-accent/90 hover:to-blue-500/90 text-white flex-1 transform hover:scale-105 transition-all duration-200"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Lista
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onShare(recipe)}
            className="hover:bg-purple-50 dark:hover:bg-purple-900/20 border-purple-200 text-purple-600 hover:border-purple-400"
            title="Condividi ricetta e app"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecipeCard;
