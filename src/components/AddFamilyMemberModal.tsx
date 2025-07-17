
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
        <Button variant="outline" className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <Users className="h-4 w-4" />
          Aggiungi Famiglia
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Aggiungi un Membro della Famiglia</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Nome del membro"
            value={memberName}
            onChange={(e) => setMemberName(e.target.value)}
            className="w-full"
          />
          <Button 
            onClick={handleAddMember} 
            className="w-full bg-gradient-to-r from-orange-600 to-red-600"
          >
            Aggiungi
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddFamilyMemberModal;
