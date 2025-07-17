
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

  // Inizializza con il primo membro se disponibile
  useEffect(() => {
    if (familyMembers.length > 0 && selectedMembers.length === 0) {
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
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">Caricamento...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent mb-2">
            Piano Alimentare Settimanale
          </h1>
          <div className="text-muted-foreground">
            Organizza i pasti per tutta la famiglia
          </div>
        </div>

        <div className="mb-8">
          <Card className="border-0 shadow-lg bg-white/95 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <CalendarDays className="w-6 h-6 text-red-600" />
                  <h2 className="text-xl font-semibold">Seleziona i Partecipanti</h2>
                </div>
                <AddFamilyMemberModal onAddMember={handleAddMember} />
              </div>
              <FamilyMemberSelect
                members={familyMembers}
                selectedMembers={selectedMembers}
                onMemberToggle={handleMemberToggle}
                onDeleteMember={handleDeleteMember}
              />
            </CardContent>
          </Card>
        </div>

        <div className="mb-8">
          <Carousel
            opts={{ align: "start" }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {weekDates.map((date, index) => (
                <CarouselItem key={date.toISOString()} className="pl-4 basis-auto">
                  <Button
                    variant={isSameDay(date, selectedDate) ? "default" : "outline"}
                    className={`w-[120px] h-[64px] flex flex-col items-center justify-center gap-1 ${
                      isSameDay(date, selectedDate) 
                        ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white' 
                        : 'hover:bg-red-50 border-red-200'
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
            <CarouselPrevious className="text-red-600 border-red-200" />
            <CarouselNext className="text-red-600 border-red-200" />
          </Carousel>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
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
      </div>
    </div>
  );
};

export default MealPlanning;
