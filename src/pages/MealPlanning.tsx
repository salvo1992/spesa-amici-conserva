
import React, { useState, useEffect } from 'react';
import { format, addDays, startOfWeek, isSameDay } from "date-fns";
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
import { ChefHat, CalendarDays, Trash2, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { firebaseApi, type FamilyMember, type MealPlan } from '@/lib/firebase';
import FamilyMemberSelect from '@/components/FamilyMemberSelect';
import MealSchedule from '@/components/MealSchedule';
import AddFamilyMemberModal from '@/components/AddFamilyMemberModal';

const MealPlanning = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const queryClient = useQueryClient();

  // Genera le date della settimana corrente
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  const dateString = format(selectedDate, 'yyyy-MM-dd');

  // Queries
  const { data: familyMembers = [], isLoading: loadingMembers } = useQuery({
    queryKey: ['family-members'],
    queryFn: firebaseApi.getFamilyMembers,
    retry: 3,
  });

  const { data: mealPlans = [], isLoading: loadingMeals } = useQuery({
    queryKey: ['meal-plans', dateString],
    queryFn: () => firebaseApi.getMealPlans(dateString),
  });

  const { data: recipes = [] } = useQuery({
    queryKey: ['recipes'],
    queryFn: firebaseApi.getRecipes,
  });

  // Auto-creazione del membro "Io" se non ci sono membri
  useEffect(() => {
    if (!loadingMembers && familyMembers.length === 0) {
      console.log('Nessun membro trovato, creando "Io" automaticamente...');
      addMemberMutation.mutate({ name: 'Io' });
    }
  }, [familyMembers, loadingMembers]);

  // Mutations
  const addMemberMutation = useMutation({
    mutationFn: firebaseApi.createFamilyMember,
    onSuccess: (newMember) => {
      console.log('Successfully added member:', newMember);
      queryClient.invalidateQueries({ queryKey: ['family-members'] });
      toast({
        title: "Membro aggiunto",
        description: "Il membro è stato aggiunto con successo",
      });
    },
    onError: (error) => {
      console.error('Error adding member:', error);
      if (error.message === 'Non autenticato') {
        const mockMember = {
          id: 'mock-io-' + Date.now(),
          name: 'Io',
          user_id: 'mock-user',
          created_at: new Date().toISOString()
        };
        queryClient.setQueryData(['family-members'], [mockMember]);
        toast({
          title: "Membro aggiunto",
          description: "Il membro è stato aggiunto con successo (modalità demo)",
        });
      } else {
        toast({
          title: "Errore",
          description: "Errore nell'aggiungere il membro",
          variant: "destructive",
        });
      }
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

  // Funzioni di navigazione settimana
  const goToPreviousWeek = () => {
    const newWeekStart = addDays(currentWeekStart, -7);
    setCurrentWeekStart(newWeekStart);
    setSelectedDate(newWeekStart);
  };

  const goToNextWeek = () => {
    const newWeekStart = addDays(currentWeekStart, 7);
    setCurrentWeekStart(newWeekStart);
    setSelectedDate(newWeekStart);
  };

  const getMealsForMember = (memberId: string) => {
    return mealPlans.filter(plan => plan.member_id === memberId);
  };

  const handleAddMember = (name: string) => {
    console.log('Manually adding member:', name);
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

  if (loadingMembers) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center animate-fade-in">Caricamento...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header con titolo più grande e stilizzato */}
        <div className="mb-8 text-center animate-fade-in">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="relative">
              <ChefHat className="h-12 w-12 text-red-600 dark:text-red-400 animate-bounce" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full animate-ping"></div>
            </div>
            <h1 className="text-6xl font-extrabold bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 dark:from-red-400 dark:via-orange-400 dark:to-yellow-400 bg-clip-text text-transparent animate-slide-up tracking-tight drop-shadow-lg">
              Piano Alimentare Settimanale
            </h1>
            <div className="ml-4 p-4 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-xl shadow-lg">
              <Calendar className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-pulse" />
            </div>
          </div>
          <div className="text-xl text-muted-foreground animate-fade-in max-w-2xl mx-auto font-medium">
            Organizza i pasti per tutta la famiglia con facilità e precisione
          </div>
        </div>

        {/* Card membri con bottone più stilizzato */}
        <div className="mb-8">
          <Card className="border-0 shadow-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm animate-fade-in ring-1 ring-red-100 dark:ring-red-900/20">
            <CardContent className="p-8">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-gradient-to-r from-red-500 to-orange-500 shadow-lg">
                    <CalendarDays className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Seleziona i Partecipanti</h2>
                </div>
                <div className="animate-scale-in">
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 rounded-xl blur opacity-40 group-hover:opacity-70 transition duration-500 animate-pulse"></div>
                    <div className="relative bg-white dark:bg-gray-800 rounded-lg p-1">
                      <AddFamilyMemberModal onAddMember={handleAddMember} />
                    </div>
                  </div>
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
                <div className="text-center py-8 text-muted-foreground">
                  {addMemberMutation.isPending ? 'Creando membro di default...' : 'Caricamento membri...'}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Navigazione settimanale con calendario migliorato */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Button
              variant="outline"
              size="icon"
              onClick={goToPreviousWeek}
              className="h-12 w-12 rounded-full border-2 border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-600 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            
            <div className="text-lg font-semibold text-gray-700 dark:text-gray-200 min-w-[200px] text-center">
              {format(currentWeekStart, 'MMMM yyyy', { locale: it })}
            </div>
            
            <Button
              variant="outline"
              size="icon"
              onClick={goToNextWeek}
              className="h-12 w-12 rounded-full border-2 border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-600 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>

           <div className="grid grid-cols-7 gap-1 sm:gap-2 max-w-4xl mx-auto px-2">
             {weekDates.map((date, index) => (
               <Button
                 key={date.toISOString()}
                 variant={isSameDay(date, selectedDate) ? "default" : "outline"}
                 className={`h-[60px] sm:h-[80px] flex flex-col items-center justify-center gap-1 sm:gap-2 transition-all duration-500 transform hover:scale-105 text-xs sm:text-sm ${
                   isSameDay(date, selectedDate) 
                     ? 'bg-gradient-to-br from-red-600 via-orange-500 to-red-700 text-white shadow-xl shadow-red-500/25 scale-105 border-0' 
                     : 'hover:bg-gradient-to-br hover:from-red-50 hover:to-orange-50 dark:hover:from-red-900/20 dark:hover:to-orange-900/20 border-red-200 dark:border-red-700 hover:border-red-300 dark:hover:border-red-600 hover:shadow-lg'
                 }`}
                 onClick={() => setSelectedDate(date)}
               >
                 <span className={`text-xs sm:text-sm font-semibold leading-tight ${isSameDay(date, selectedDate) ? 'text-white' : 'text-gray-700 dark:text-gray-200'}`}>
                   {format(date, 'EEE', { locale: it })}
                 </span>
                 <span className={`text-xs leading-tight ${isSameDay(date, selectedDate) ? 'text-white/90' : 'text-gray-500 dark:text-gray-400'}`}>
                   {format(date, 'd/M', { locale: it })}
                 </span>
               </Button>
             ))}
           </div>
        </div>

        {/* Griglia piani pasto */}
        {selectedMembers.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3 animate-fade-in">
            {selectedMembers.map(memberId => {
              const member = familyMembers.find(m => m.id === memberId);
              if (!member) return null;
              
              return (
                <div key={memberId} className="animate-scale-in">
                  <MealSchedule
                    memberId={memberId}
                    memberName={member.name}
                    meals={getMealsForMember(memberId)}
                    onAddMeal={handleAddMeal}
                    date={selectedDate}
                    recipes={recipes}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 animate-fade-in">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-900/20 dark:to-orange-900/20 flex items-center justify-center">
                <ChefHat className="w-10 h-10 text-red-500" />
              </div>
              <p className="text-xl font-medium text-gray-600 dark:text-gray-300 mb-2">
                {familyMembers.length === 0 
                  ? 'Creando il primo membro della famiglia...' 
                  : 'Seleziona almeno un membro della famiglia'
                }
              </p>
              <p className="text-sm text-muted-foreground">
                {familyMembers.length === 0 
                  ? 'Un momento per favore...' 
                  : 'per visualizzare i piani alimentari personalizzati'
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MealPlanning;
