
import React from 'react';
import { Check, X } from 'lucide-react';
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
  onDeleteMember: (memberId: string) => void;
}

const FamilyMemberSelect = ({ members, selectedMembers, onMemberToggle, onDeleteMember }: FamilyMemberSelectProps) => {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {members.map((member) => (
        <div
          key={member.id}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-200 group",
            selectedMembers.includes(member.id)
              ? "bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg scale-105"
              : "bg-red-50 hover:bg-red-100 border border-red-200"
          )}
        >
          <button
            onClick={() => onMemberToggle(member.id)}
            className="flex items-center gap-2"
          >
            <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-xs font-medium text-red-600">
              {member.name[0].toUpperCase()}
            </div>
            <span className="font-medium">{member.name}</span>
            {selectedMembers.includes(member.id) && (
              <Check className="w-4 h-4" />
            )}
          </button>
          
          <button
            onClick={() => onDeleteMember(member.id)}
            className="ml-1 p-1 rounded-full hover:bg-red-500/20 transition-colors"
            title="Elimina membro"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default FamilyMemberSelect;
