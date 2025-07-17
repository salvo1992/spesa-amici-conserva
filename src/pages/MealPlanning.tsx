
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Calendar, Plus, Clock, Users, ChefHat, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const MealPlanning = () => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newMeal, setNewMeal] = useState({
    name: '',
    date: '',
    time: '',
    servings: 4
  });

  const defaultMeals = [
    {
      id: 'meal-1',
      name: 'Pasta alla Carbonara',
      date: '2024-01-18',
      time: '19:30',
      servings: 4,
      category: 'Cena'
    },
    {
      id: 'meal-2',
      name: 'Insalata Caesar',
      date: '2024-01-18',
      time: '13:00',
      servings: 2,
      category: 'Pranzo'
    },
    {
      id: 'meal-3',
      name: 'Pancakes ai Mirtilli',
      date: '2024-01-19',
      time: '08:00',
      servings: 3,
      category: 'Colazione'
    }
  ];

  const handleAddMeal = () => {
    if (!newMeal.name.trim()) {
      toast({
        title: "Errore",
        description: "Inserisci il nome del pasto",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Pasto aggiunto",
      description: "Il pasto è stato aggiunto al piano alimentare"
    });
    
    setShowAddDialog(false);
    setNewMeal({ name: '', date: '', time: '', servings: 4 });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
            Piano Alimentare
          </h1>
          <div className="text-muted-foreground">
            Organizza i tuoi pasti settimanali
          </div>
        </div>

        <div className="grid gap-6">
          {defaultMeals.map((meal) => (
            <Card key={meal.id} className="card-hover shadow-lg border-0 bg-white/95 backdrop-blur-sm border-l-4 border-orange-500">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                      <ChefHat className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-foreground">
                        {meal.name}
                      </CardTitle>
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(meal.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 mr-1" />
                          {meal.time}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Users className="h-4 w-4 mr-1" />
                          {meal.servings} porzioni
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                      {meal.category}
                    </Badge>
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Card className="mt-8 card-hover shadow-lg border-0 bg-gradient-to-r from-orange-500 to-red-500 text-white cursor-pointer">
              <CardContent className="p-6 text-center">
                <Plus className="h-8 w-8 mx-auto mb-3" />
                <h3 className="text-xl font-semibold mb-2">Aggiungi Nuovo Pasto</h3>
                <div className="text-orange-100 mb-4">
                  Pianifica i tuoi pasti della settimana
                </div>
                <div className="inline-flex items-center gap-2 bg-white text-orange-600 px-6 py-2 rounded-lg font-medium hover:bg-orange-50 transition-colors">
                  <Plus className="h-4 w-4" />
                  Aggiungi Pasto
                </div>
              </CardContent>
            </Card>
          </DialogTrigger>
          
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Aggiungi Nuovo Pasto</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="meal-name">Nome Pasto</Label>
                <Input
                  id="meal-name"
                  value={newMeal.name}
                  onChange={(e) => setNewMeal({...newMeal, name: e.target.value})}
                  placeholder="Es. Spaghetti alla Carbonara"
                />
              </div>
              
              <div>
                <Label htmlFor="meal-date">Data</Label>
                <Input
                  id="meal-date"
                  type="date"
                  value={newMeal.date}
                  onChange={(e) => setNewMeal({...newMeal, date: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="meal-time">Ora</Label>
                <Input
                  id="meal-time"
                  type="time"
                  value={newMeal.time}
                  onChange={(e) => setNewMeal({...newMeal, time: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="meal-servings">Porzioni</Label>
                <Input
                  id="meal-servings"
                  type="number"
                  min="1"
                  value={newMeal.servings}
                  onChange={(e) => setNewMeal({...newMeal, servings: parseInt(e.target.value)})}
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={handleAddMeal}
                  className="flex-1 bg-orange-600 hover:bg-orange-700"
                >
                  Aggiungi Pasto
                </Button>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Annulla
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default MealPlanning;
