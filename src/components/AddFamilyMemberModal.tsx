
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Plus, Users } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface AddFamilyMemberModalProps {
  onAddMember: (name: string) => void;
}

const AddFamilyMemberModal: React.FC<AddFamilyMemberModalProps> = ({ onAddMember }) => {
  const [memberName, setMemberName] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleAddMember = () => {
    if (memberName.trim()) {
      onAddMember(memberName);
      setMemberName('');
      setIsOpen(false);
      toast({
        title: "Membro aggiunto",
        description: `${memberName} è stato aggiunto alla famiglia`
      });
    } else {
      toast({
        title: "Errore",
        description: "Inserisci un nome valido",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
          <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
          <Users className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden xs:inline">Aggiungi</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[90vw] max-w-sm mx-2 rounded-lg max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">Aggiungi Membro</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 p-2">
          <Input
            placeholder="Nome del membro"
            value={memberName}
            onChange={(e) => setMemberName(e.target.value)}
            className="w-full text-sm"
          />
          <Button 
            onClick={handleAddMember} 
            className="w-full bg-gradient-to-r from-orange-600 to-red-600 h-10 text-sm font-medium"
          >
            Aggiungi
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddFamilyMemberModal;
