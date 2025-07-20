
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Clock, Users, ChefHat, ShoppingCart, Share2, Star, Facebook, Instagram, Search, Edit, Trash2, Send, MessageCircle, Phone } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { searchUsers, shareRecipeWithUser, firebaseApi } from '@/lib/firebase';

import { Recipe } from '@/lib/firebase';

interface RecipeDetailsModalProps {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToShoppingList: (ingredients: string[]) => void;
  onShare: (recipe: Recipe) => void;
  onEdit?: (recipe: Recipe) => void;
  onDelete?: (recipeId: string) => void;
  showEditDelete?: boolean;
}

const RecipeDetailsModal: React.FC<RecipeDetailsModalProps> = ({
  recipe,
  isOpen,
  onClose,
  onAddToShoppingList,
  onShare,
  onEdit,
  onDelete,
  showEditDelete = false
}) => {
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  if (!recipe) return null;

  const handleAddToShoppingList = async () => {
    try {
      await firebaseApi.addIngredientsToShoppingList(recipe.ingredients);
      toast({
        title: "Ingredienti aggiunti!",
        description: `${recipe.ingredients.length} ingredienti aggiunti alla lista della spesa`,
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Errore nell'aggiunta degli ingredienti alla lista della spesa",
        variant: "destructive"
      });
    }
  };

  const handleShare = () => {
    const appName = "Food Manager - Il Vikingo del Web";
    const appUrl = window.location.origin;
    const downloadMessage = "\n\n📲 Scarica l'app per salvare e organizzare le tue ricette preferite!";
    const text = `🍽️ ${appName}\n\n📝 Ricetta: ${recipe.name}\n\n${recipe.description}\n\n⏱️ Tempo: ${recipe.prep_time} min | 👥 Porzioni: ${recipe.servings}${downloadMessage}\n\n📱 Visita: ${appUrl}`;
    
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => {
        toast({
          title: "Ricetta condivisa!",
          description: `${recipe.name} è stata condivisa con invito a scaricare l'app`,
        });
      }).catch(() => {
        // Fallback se il clipboard non funziona
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        toast({
          title: "Ricetta condivisa!",
          description: `${recipe.name} è stata condivisa con invito a scaricare l'app`,
        });
      });
    }
  };

  const handleSocialShare = (platform: string) => {
    const appName = "Food Manager";
    const appUrl = window.location.origin;
    const downloadMessage = "\n\n📲 Scarica l'app per salvare e organizzare le tue ricette preferite!";
    const text = `🍽️ ${appName} - ${recipe.name}, ${recipe.prep_time} min\n\n${recipe.description}\n\n⏱️ Tempo: ${recipe.prep_time} min | 👥 Porzioni: ${recipe.servings}${downloadMessage}\n\n📱 Visita: ${appUrl} | Google Play Store`;
    
    let shareUrl = '';
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(appUrl)}&quote=${encodeURIComponent(text)}`;
        break;
      case 'instagram':
        // Per Instagram, creiamo un link che apre Instagram con un testo preimpostato
        const instagramText = encodeURIComponent(text.substring(0, 2200)); // Instagram ha limiti di caratteri
        shareUrl = `https://www.instagram.com/?text=${instagramText}`;
        
        // Fallback: copia negli appunti e mostra istruzioni
        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(text).then(() => {
            toast({
              title: "Testo copiato!",
              description: "Apri Instagram e incolla il testo nel tuo post o story"
            });
          }).catch(() => {
            // Fallback se il clipboard non funziona
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            toast({
              title: "Testo copiato!",
              description: "Apri Instagram e incolla il testo nel tuo post o story"
            });
          });
        }
        return;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodeURIComponent(appUrl)}&text=${encodeURIComponent(text)}`;
        break;
      case 'discord':
        // Discord non ha URL sharing diretto, copiamo negli appunti
        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(text).then(() => {
            toast({
              title: "Testo copiato!",
              description: "Apri Discord e incolla il testo nel canale desiderato"
            });
          }).catch(() => {
            // Fallback se il clipboard non funziona
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            toast({
              title: "Testo copiato!",
              description: "Apri Discord e incolla il testo nel canale desiderato"
            });
          });
        }
        return;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  const handleUserSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const users = await searchUsers(searchQuery);
      setSearchResults(users);
    } catch (error) {
      toast({
        title: "Errore",
        description: "Errore nella ricerca degli utenti",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShareWithUser = async (targetUserId: string, targetUserName: string) => {
    try {
      await shareRecipeWithUser(recipe.id, targetUserId);
      toast({
        title: "Ricetta inviata!",
        description: `Ricetta inviata a ${targetUserName}. L'utente riceverà una notifica per accettarla.`
      });
      setShowUserSearch(false);
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      toast({
        title: "Errore",
        description: "Errore nell'invio della ricetta",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {recipe.name}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">Dettagli completi della ricetta con ingredienti e preparazione</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {showEditDelete && (
                <>
                  <Button variant="outline" size="sm" onClick={() => onEdit?.(recipe)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Modifica
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => onDelete?.(recipe.id)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Elimina
                  </Button>
                </>
              )}
              <Button variant="outline" size="sm" onClick={() => setShowUserSearch(!showUserSearch)}>
                <Share2 className="h-4 w-4 mr-2" />
                Condividi con Utenti
              </Button>
              <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600 text-white">
                <Star className="h-4 w-4 mr-2" />
                Salva
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-6 mt-6">
          {/* Header con immagine */}
          <div className="relative h-64 bg-gradient-to-br from-orange-200 via-red-200 to-pink-200 rounded-xl flex items-center justify-center overflow-hidden">
            <ChefHat className="h-24 w-24 text-white/80" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
          
          {/* Info rapide */}
          <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <span className="font-medium">{recipe.prep_time} minuti</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-500" />
              <span className="font-medium">{recipe.servings} porzioni</span>
            </div>
            <Badge className="bg-primary/10 text-primary">
              {recipe.category}
            </Badge>
          </div>
          
          {/* Ricerca Utenti */}
          {showUserSearch && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="text-lg font-semibold mb-3">Condividi con Utenti Registrati</h3>
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="Cerca utenti per nome o cognome..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleUserSearch()}
                />
                <Button onClick={handleUserSearch} disabled={loading}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              {searchResults.length > 0 && (
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {searchResults.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-2 bg-white rounded border">
                      <span>{user.firstName} {user.lastName}</span>
                      <Button size="sm" onClick={() => handleShareWithUser(user.id, `${user.firstName} ${user.lastName}`)}>
                        <Send className="h-4 w-4 mr-1" />
                        Invia
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Descrizione */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Descrizione</h3>
            <p className="text-muted-foreground leading-relaxed">{recipe.description}</p>
          </div>

          {/* Social Share - Posizionato dopo la descrizione per mobile */}
          <div className="block md:hidden border-t pt-4">
            <h3 className="text-lg font-semibold mb-4 text-center">Condividi sui social</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => handleSocialShare('facebook')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Facebook className="h-4 w-4 mr-2" />
                Facebook
              </Button>
              <Button
                onClick={() => handleSocialShare('instagram')}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              >
                <Instagram className="h-4 w-4 mr-2" />
                Instagram
              </Button>
              <Button
                onClick={() => handleSocialShare('whatsapp')}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Phone className="h-4 w-4 mr-2" />
                WhatsApp
              </Button>
              <Button
                onClick={() => handleSocialShare('telegram')}
                className="bg-sky-500 hover:bg-sky-600 text-white"
              >
                <Send className="h-4 w-4 mr-2" />
                Telegram
              </Button>
              <Button
                onClick={() => handleSocialShare('discord')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white col-span-2"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Discord
              </Button>
            </div>
          </div>
          
          {/* Ingredienti */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Ingredienti</h3>
              <Button 
                onClick={handleAddToShoppingList}
                className="bg-gradient-to-r from-accent to-blue-500 hover:from-accent/90 hover:to-blue-500/90 text-white"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Aggiungi alla Lista
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {recipe.ingredients.map((ingredient, index) => (
                <div 
                  key={index} 
                  className="flex items-center gap-3 p-3 bg-white rounded-lg border hover:shadow-md transition-shadow duration-200"
                >
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span className="text-sm">{ingredient}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Istruzioni */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Preparazione</h3>
            <div className="space-y-4">
              {recipe.instructions.map((instruction, index) => (
                <div 
                  key={index}
                  className="flex gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border-l-4 border-primary hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-white dark:text-gray-900 rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <p className="text-sm leading-relaxed text-gray-900 dark:text-gray-100">{instruction}</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Social Share - Solo per desktop */}
          <div className="hidden md:block border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Condividi sui social</h3>
            <div className="grid grid-cols-3 gap-3">
              <Button
                onClick={() => handleSocialShare('facebook')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Facebook className="h-4 w-4 mr-2" />
                Facebook
              </Button>
              <Button
                onClick={() => handleSocialShare('instagram')}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              >
                <Instagram className="h-4 w-4 mr-2" />
                Instagram
              </Button>
              <Button
                onClick={() => handleSocialShare('whatsapp')}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Phone className="h-4 w-4 mr-2" />
                WhatsApp
              </Button>
              <Button
                onClick={() => handleSocialShare('telegram')}
                className="bg-sky-500 hover:bg-sky-600 text-white"
              >
                <Send className="h-4 w-4 mr-2" />
                Telegram
              </Button>
              <Button
                onClick={() => handleSocialShare('discord')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Discord
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RecipeDetailsModal;
