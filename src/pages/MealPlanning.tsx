import React, { useState } from 'react';
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
import { ChefHat, CalendarDays } from 'lucide-react';
import FamilyMemberSelect from '@/components/FamilyMemberSelect';
import MealSchedule from '@/components/MealSchedule';
import AddFamilyMemberModal from '@/components/AddFamilyMemberModal';

const defaultFamilyMembers = [
  { id: 'member-1', name: 'Io' }
];

const MealPlanning = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [familyMembers, setFamilyMembers] = useState(defaultFamilyMembers);
  const [selectedMembers, setSelectedMembers] = useState(['member-1']);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [activeMealConfig, setActiveMealConfig] = useState<{
    memberId: string;
    mealType: string;
  } | null>(null);

  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));

  const handleAddMember = (name: string) => {
    const newMemberId = `member-${familyMembers.length + 1}`;
    const newMember = { id: newMemberId, name };
    setFamilyMembers([...familyMembers, newMember]);
    setSelectedMembers([...selectedMembers, newMemberId]);
  };

  const handleMemberToggle = (memberId: string) => {
    setSelectedMembers(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleAddMeal = (memberId: string, mealType: string) => {
    setActiveMealConfig({ memberId, mealType });
    setShowAddDialog(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
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
                  <CalendarDays className="w-6 h-6 text-primary" />
                  <h2 className="text-xl font-semibold">Seleziona i Partecipanti</h2>
                </div>
                <AddFamilyMemberModal onAddMember={handleAddMember} />
              </div>
              <FamilyMemberSelect
                members={familyMembers}
                selectedMembers={selectedMembers}
                onMemberToggle={handleMemberToggle}
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
                    className="w-[120px] h-[64px] flex flex-col items-center justify-center gap-1"
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
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {selectedMembers.map(memberId => {
            const member = familyMembers.find(m => m.id === memberId)!;
            return (
              <MealSchedule
                key={memberId}
                memberId={memberId}
                memberName={member.name}
                meals={[]}
                onAddMeal={handleAddMeal}
                date={selectedDate}
              />
            );
          })}
        </div>

        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Aggiungi Pasto</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <p>Implementare la selezione delle ricette o l'aggiunta di un nuovo pasto</p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default MealPlanning;
