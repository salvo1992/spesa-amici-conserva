
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Calendar, Plus, ChefHat, Coffee, Sun, Sunset, Moon, ShoppingCart, Users, Edit, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const MealPlanning = () => {
  const { user } = useAuth();
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [showAddMealDialog, setShowAddMealDialog] = useState(false);
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedMeal, setSelectedMeal] = useState('');

  const [newMeal, setNewMeal] = useState({
    name: '',
    type: 'colazione',
    day: '',
    recipe: '',
    ingredients: [],
    servings: 1
  });

  const daysOfWeek = [
    'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica'
  ];

  const mealTypes = [
    { name: 'colazione', label: 'Colazione', icon: Coffee, color: 'orange' },
    { name: 'pranzo', label: 'Pranzo', icon: Sun, color: 'yellow' },
    { name: 'cena', label: 'Cena', icon: Sunset, color: 'purple' },
    { name: 'spuntino', label: 'Spuntino', icon: Moon, color: 'blue' }
  ];

  // Dati di esempio per i pasti pianificati
  const [plannedMeals, setPlannedMeals] = useState({
    'Lunedì': {
      colazione: { name: 'Cornetti e Cappuccino', servings: 2, ingredients: ['cornetti', 'latte', 'caffè'] },
      pranzo: { name: 'Pasta al Pomodoro', servings: 4, ingredients: ['pasta', 'pomodori', 'basilico', 'aglio'] }
    },
    'Martedì': {
      colazione: { name: 'Toast e Succo', servings: 2, ingredients: ['pane', 'marmellata', 'succo d\'arancia'] },
      cena: { name: 'Pesce alla Griglia', servings: 3, ingredients: ['pesce', 'limone', 'rosmarino', 'patate'] }
    }
  });

  const addMealToPlan = () => {
    if (!newMeal.name || !newMeal.day || !newMeal.type) return;
    
    setPlannedMeals(prev => ({
      ...prev,
      [newMeal.day]: {
        ...prev[newMeal.day],
        [newMeal.type]: {
          name: newMeal.name,
          servings: newMeal.servings,
          ingredients: newMeal.ingredients
        }
      }
    }));

    toast({
      title: "Pasto aggiunto",
      description: `${newMeal.name} aggiunto al piano pasti per ${newMeal.day}`
    });

    setNewMeal({ name: '', type: 'colazione', day: '', recipe: '', ingredients: [], servings: 1 });
    setShowAddMealDialog(false);
  };

  const generateShoppingList = () => {
    const allIngredients = [];
    Object.values(plannedMeals).forEach(dayMeals => {
      Object.values(dayMeals).forEach(meal => {
        if (meal.ingredients) {
          allIngredients.push(...meal.ingredients);
        }
      });
    });

    toast({
      title: "Lista spesa generata",
      description: `${allIngredients.length} ingredienti aggiunti alla lista spesa`
    });
  };

  const getMealIcon = (type) => {
    const mealType = mealTypes.find(m => m.name === type);
    return mealType ? mealType.icon : ChefHat;
  };

  const getMealColor = (type) => {
    const mealType = mealTypes.find(m => m.name === type);
    return mealType ? mealType.color : 'gray';
  };

  return (
    <div className="p-4 space-y-6 bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-teal-600 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="h-8 w-8 text-teal-600" />
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-700 to-teal-900 bg-clip-text text-transparent">
                Pianificazione Pasti
              </h1>
              <p className="text-muted-foreground mt-1">
                Organizza i tuoi pasti settimanali e genera la lista della spesa
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button 
              onClick={generateShoppingList}
              variant="outline" 
              className="bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-300 text-emerald-700 hover:from-emerald-100 hover:to-emerald-200"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Genera Lista Spesa
            </Button>
            
            <Dialog open={showAddMealDialog} onOpenChange={setShowAddMealDialog}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800">
                  <Plus className="h-4 w-4 mr-2" />
                  Aggiungi Pasto
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Aggiungi Nuovo Pasto</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Nome Pasto</Label>
                    <Input
                      value={newMeal.name}
                      onChange={(e) => setNewMeal({...newMeal, name: e.target.value})}
                      placeholder="Es. Pasta al Pomodoro"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Giorno</Label>
                      <Select value={newMeal.day} onValueChange={(value) => setNewMeal({...newMeal, day: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona giorno" />
                        </SelectTrigger>
                        <SelectContent>
                          {daysOfWeek.map(day => (
                            <SelectItem key={day} value={day}>{day}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Tipo Pasto</Label>
                      <Select value={newMeal.type} onValueChange={(value) => setNewMeal({...newMeal, type: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {mealTypes.map(type => (
                            <SelectItem key={type.name} value={type.name}>{type.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Porzioni</Label>
                    <Input
                      type="number"
                      value={newMeal.servings}
                      onChange={(e) => setNewMeal({...newMeal, servings: parseInt(e.target.value) || 1})}
                      min="1"
                    />
                  </div>

                  <Button onClick={addMealToPlan} className="w-full">
                    Aggiungi al Piano
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Weekly Planning Grid */}
      <div className="grid gap-6">
        {daysOfWeek.map((day) => (
          <Card key={day} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg animate-fade-in">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span className="text-xl font-bold text-gray-800">{day}</span>
                <Badge variant="secondary" className="bg-teal-100 text-teal-700">
                  {Object.keys(plannedMeals[day] || {}).length} pasti
                </Badge>
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {mealTypes.map((mealType) => {
                  const meal = plannedMeals[day]?.[mealType.name];
                  const IconComponent = mealType.icon;
                  
                  return (
                    <div
                      key={mealType.name}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${
                        meal 
                          ? `bg-gradient-to-br from-${mealType.color}-50 to-${mealType.color}-100 border-${mealType.color}-200` 
                          : 'bg-gray-50 border-gray-200 border-dashed hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <IconComponent className={`h-5 w-5 ${meal ? `text-${mealType.color}-600` : 'text-gray-400'}`} />
                        <span className={`font-semibold text-sm ${meal ? `text-${mealType.color}-800` : 'text-gray-500'}`}>
                          {mealType.label}
                        </span>
                      </div>
                      
                      {meal ? (
                        <div className="space-y-2">
                          <h4 className="font-semibold text-gray-900">{meal.name}</h4>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">{meal.servings} porzioni</span>
                          </div>
                          {meal.ingredients && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {meal.ingredients.slice(0, 3).map((ingredient, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {ingredient}
                                </Badge>
                              ))}
                              {meal.ingredients.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{meal.ingredients.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                          <div className="flex gap-1 mt-2">
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <p className="text-xs text-gray-500 mb-2">Nessun pasto pianificato</p>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-xs h-6"
                            onClick={() => {
                              setSelectedDay(day);
                              setSelectedMeal(mealType.name);
                              setNewMeal({...newMeal, day, type: mealType.name});
                              setShowAddMealDialog(true);
                            }}
                          >
                            + Aggiungi
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Card */}
      <Card className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white border-0 shadow-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold mb-2">Riepilogo Settimanale</h3>
              <p className="text-teal-100">
                {Object.values(plannedMeals).reduce((total, day) => total + Object.keys(day).length, 0)} pasti pianificati questa settimana
              </p>
            </div>
            <div className="flex gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {Object.values(plannedMeals).reduce((total, day) => 
                    total + Object.values(day).reduce((dayTotal, meal) => dayTotal + (meal.servings || 0), 0), 0
                  )}
                </div>
                <div className="text-sm text-teal-100">Porzioni Totali</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {Object.values(plannedMeals).reduce((total, day) => 
                    total + Object.values(day).reduce((dayTotal, meal) => 
                      dayTotal + (meal.ingredients ? meal.ingredients.length : 0), 0
                    ), 0
                  )}
                </div>
                <div className="text-sm text-teal-100">Ingredienti</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MealPlanning;
