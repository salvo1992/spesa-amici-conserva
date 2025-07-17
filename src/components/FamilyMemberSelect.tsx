
import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FamilyMember {
  id: string;
  name: string;
  avatar?: string;
}

interface FamilyMemberSelectProps {
  members: FamilyMember[];
  selectedMembers: string[];
  onMemberToggle: (memberId: string) => void;
}

const FamilyMemberSelect = ({ members, selectedMembers, onMemberToggle }: FamilyMemberSelectProps) => {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {members.map((member) => (
        <button
          key={member.id}
          onClick={() => onMemberToggle(member.id)}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200",
            selectedMembers.includes(member.id)
              ? "bg-primary text-primary-foreground shadow-lg scale-105"
              : "bg-muted hover:bg-muted/80"
          )}
        >
          <div className="w-6 h-6 rounded-full bg-background flex items-center justify-center text-xs font-medium">
            {member.name[0].toUpperCase()}
          </div>
          <span className="font-medium">{member.name}</span>
          {selectedMembers.includes(member.id) && (
            <Check className="w-4 h-4" />
          )}
        </button>
      ))}
    </div>
  );
};

export default FamilyMemberSelect;
