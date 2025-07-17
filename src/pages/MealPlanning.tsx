
import React, { useState, useEffect } from 'react';
import { format, addDays, isSameDay } from "date-fns";
import { it } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ChefHat, CalendarDays, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { firebaseApi, type FamilyMember, type MealPlan } from '@/lib/firebase';
import FamilyMemberSelect from '@/components/FamilyMemberSelect';
import MealSchedule from '@/components/MealSchedule';
import AddFamilyMemberModal from '@/components/AddFamilyMemberModal';

const MealPlanning = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const queryClient = useQueryClient();

  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));
  const dateString = format(selectedDate, 'yyyy-MM-dd');

  // Queries
  const { data: familyMembers = [], isLoading: loadingMembers } = useQuery({
    queryKey: ['family-members'],
    queryFn: firebaseApi.getFamilyMembers,
  });

  const { data: mealPlans = [], isLoading: loadingMeals } = useQuery({
    queryKey: ['meal-plans', dateString],
    queryFn: () => firebaseApi.getMealPlans(dateString),
  });

  const { data: recipes = [] } = useQuery({
    queryKey: ['recipes'],
    queryFn: firebaseApi.getRecipes,
  });

  // Mutations
  const addMemberMutation = useMutation({
    mutationFn: firebaseApi.createFamilyMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-members'] });
      toast({
        title: "Membro aggiunto",
        description: "Il membro è stato aggiunto con successo",
      });
    },
  });

  const deleteMemberMutation = useMutation({
    mutationFn: firebaseApi.deleteFamilyMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-members'] });
      queryClient.invalidateQueries({ queryKey: ['meal-plans'] });
      toast({
        title: "Membro eliminato",
        description: "Il membro e i suoi piani alimentari sono stati eliminati",
      });
    },
  });

  const addMealMutation = useMutation({
    mutationFn: firebaseApi.createMealPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-plans', dateString] });
      toast({
        title: "Pasto aggiunto",
        description: "Il pasto è stato aggiunto con successo",
      });
    },
  });

  // Inizializzazione: crea automaticamente il membro "Io" se necessario
  useEffect(() => {
    if (!loadingMembers && !isInitialized) {
      if (familyMembers.length === 0 && !addMemberMutation.isPending) {
        console.log('Adding default member "Io"');
        addMemberMutation.mutate({ name: 'Io' });
      }
      setIsInitialized(true);
    }
  }, [loadingMembers, familyMembers.length, isInitialized, addMemberMutation]);

  // Seleziona automaticamente il primo membro se disponibile
  useEffect(() => {
    if (familyMembers.length > 0 && selectedMembers.length === 0) {
      console.log('Setting first member as selected:', familyMembers[0]);
      setSelectedMembers([familyMembers[0].id]);
    }
  }, [familyMembers, selectedMembers.length]);

  const handleAddMember = (name: string) => {
    addMemberMutation.mutate({ name });
  };

  const handleDeleteMember = (memberId: string) => {
    deleteMemberMutation.mutate(memberId);
    setSelectedMembers(prev => prev.filter(id => id !== memberId));
  };

  const handleMemberToggle = (memberId: string) => {
    setSelectedMembers(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleAddMeal = (mealData: { memberId: string; mealType: string; recipes: any[]; customMeal: any }) => {
    const newMealPlan: Omit<MealPlan, 'id' | 'user_id' | 'created_at'> = {
      member_id: mealData.memberId,
      date: dateString,
      meal_type: mealData.mealType as MealPlan['meal_type'],
      recipes: mealData.recipes.map(r => r.id || r.name),
      custom_meal: mealData.customMeal,
    };
    
    addMealMutation.mutate(newMealPlan);
  };

  const getMealsForMember = (memberId: string) => {
    return mealPlans.filter(plan => plan.member_id === memberId);
  };

  if (loadingMembers) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">Caricamento...</div>
        </div>
      </div>
    );
  }

  console.log('Rendering with:', {
    familyMembers,
    selectedMembers,
    isInitialized,
    addMemberPending: addMemberMutation.isPending
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center animate-fade-in">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 dark:from-red-400 dark:to-orange-400 bg-clip-text text-transparent mb-2 animate-slide-up">
            Piano Alimentare Settimanale
          </h1>
          <div className="text-muted-foreground animate-fade-in">
            Organizza i pasti per tutta la famiglia
          </div>
        </div>

        <div className="mb-8">
          <Card className="border-0 shadow-lg bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm animate-fade-in">
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <CalendarDays className="w-6 h-6 text-red-600 dark:text-red-400" />
                  <h2 className="text-xl font-semibold">Seleziona i Partecipanti</h2>
                </div>
                <div className="animate-scale-in">
                  <AddFamilyMemberModal onAddMember={handleAddMember} />
                </div>
              </div>
              {familyMembers.length > 0 ? (
                <FamilyMemberSelect
                  members={familyMembers}
                  selectedMembers={selectedMembers}
                  onMemberToggle={handleMemberToggle}
                  onDeleteMember={handleDeleteMember}
                />
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  {loadingMembers || addMemberMutation.isPending ? 'Caricamento membri...' : 'Nessun membro trovato. Aggiungine uno!'}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mb-8 relative">
          <Carousel
            opts={{ align: "start" }}
            className="w-full max-w-5xl mx-auto"
          >
            <CarouselContent className="-ml-4">
              {weekDates.map((date, index) => (
                <CarouselItem key={date.toISOString()} className="pl-4 basis-auto">
                  <Button
                    variant={isSameDay(date, selectedDate) ? "default" : "outline"}
                    className={`w-[120px] h-[64px] flex flex-col items-center justify-center gap-1 transition-all duration-200 ${
                      isSameDay(date, selectedDate) 
                        ? 'bg-gradient-to-r from-red-600 to-orange-600 dark:from-red-500 dark:to-orange-500 text-white' 
                        : 'hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-700'
                    }`}
                    onClick={() => setSelectedDate(date)}
                  >
                    <span className="text-sm font-medium">
                      {format(date, 'EEEE', { locale: it })}
                    </span>
                    <span className="text-xs opacity-75">
                      {format(date, 'd MMMM', { locale: it })}
                    </span>
                  </Button>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-700 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 -left-12" />
            <CarouselNext className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-700 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 -right-12" />
          </Carousel>
        </div>

        {selectedMembers.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 animate-fade-in">
            {selectedMembers.map(memberId => {
              const member = familyMembers.find(m => m.id === memberId);
              if (!member) return null;
              
              return (
                <MealSchedule
                  key={memberId}
                  memberId={memberId}
                  memberName={member.name}
                  meals={getMealsForMember(memberId)}
                  onAddMeal={handleAddMeal}
                  date={selectedDate}
                  recipes={recipes}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Seleziona almeno un membro della famiglia per visualizzare i piani alimentari
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MealPlanning;
