import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Star, Plus, ThumbsUp, Filter, Edit, Trash2, MessageSquare } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { firebaseAuth, firebaseApi, CATEGORIES, type Review } from '@/lib/firebase';
import AuthForm from '@/components/AuthForm';

const Reviews = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(firebaseAuth.isAuthenticated());
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterRating, setFilterRating] = useState('all');

  const [newReview, setNewReview] = useState({
    product_name: '',
    app_review: false,
    rating: 5,
    comment: '',
    category: ''
  });

  const queryClient = useQueryClient();

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['reviews'],
    queryFn: firebaseApi.getReviews,
    enabled: isAuthenticated
  });

  const createMutation = useMutation({
    mutationFn: firebaseApi.createReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      setShowAddDialog(false);
      setNewReview({ product_name: '', app_review: false, rating: 5, comment: '', category: '' });
      toast({ title: "Recensione salvata", description: "La tua recensione è stata pubblicata" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: firebaseApi.deleteReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      toast({ title: "Recensione eliminata", description: "La recensione è stata rimossa" });
    }
  });

  const handleAuthSuccess = (userData: any) => {
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return <AuthForm onAuthSuccess={handleAuthSuccess} />;
  }

  const addReview = () => {
    if (!newReview.comment.trim()) return;
    
    createMutation.mutate({
      product_name: newReview.app_review ? undefined : newReview.product_name,
      app_review: newReview.app_review,
      rating: newReview.rating,
      comment: newReview.comment,
      category: newReview.category || 'Generale',
      helpful_count: 0
    });
  };

  const deleteReview = (id: string) => {
    deleteMutation.mutate(id);
  };

  const renderStars = (rating: number, size = 'sm') => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'} ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const filteredReviews = reviews.filter(review => {
    const categoryMatch = filterCategory === 'all' || review.category === filterCategory;
    const ratingMatch = filterRating === 'all' || review.rating.toString() === filterRating;
    return categoryMatch && ratingMatch;
  });

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 bg-gradient-to-br from-gray-50 to-slate-100 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-yellow-600 animate-fade-in">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Star className="h-8 w-8 text-yellow-600" />
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-700 to-yellow-900 bg-clip-text text-transparent">
                Recensioni
              </h1>
              <p className="text-muted-foreground mt-1 flex items-center gap-2">
                {filteredReviews.length} recensioni • 
                <span className="flex items-center gap-1">
                  {renderStars(Math.round(averageRating))}
                  <span className="font-medium">{averageRating.toFixed(1)}</span>
                </span>
              </p>
            </div>
          </div>
          
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800">
                <Plus className="h-4 w-4 mr-2" />
                Nuova Recensione
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Scrivi una Recensione</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="app-review"
                    checked={newReview.app_review}
                    onChange={(e) => setNewReview({...newReview, app_review: e.target.checked})}
                    className="rounded"
                  />
                  <Label htmlFor="app-review">Recensione dell'app Food Manager</Label>
                </div>

                {!newReview.app_review && (
                  <div>
                    <Label>Nome Prodotto</Label>
                    <Input
                      value={newReview.product_name}
                      onChange={(e) => setNewReview({...newReview, product_name: e.target.value})}
                      placeholder="Es. Pasta Barilla, Olio Colavita..."
                    />
                  </div>
                )}

                <div>
                  <Label>Categoria</Label>
                  <Select value={newReview.category} onValueChange={(value) => setNewReview({...newReview, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {newReview.app_review ? (
                        <SelectItem value="App">App</SelectItem>
                      ) : (
                        <>
                          {CATEGORIES.food.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                          {CATEGORIES.home.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Valutazione</Label>
                  <div className="flex items-center gap-2 mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReview({...newReview, rating: star})}
                        className="p-1"
                      >
                        <Star
                          className={`h-6 w-6 ${
                            star <= newReview.rating 
                              ? 'fill-yellow-400 text-yellow-400' 
                              : 'text-gray-300 hover:text-yellow-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-muted-foreground">
                      {newReview.rating} stella{newReview.rating !== 1 ? 'e' : ''}
                    </span>
                  </div>
                </div>

                <div>
                  <Label>Commento</Label>
                  <Textarea
                    value={newReview.comment}
                    onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                    placeholder="Condividi la tua esperienza..."
                    rows={4}
                  />
                </div>

                <Button onClick={addReview} disabled={createMutation.isPending} className="w-full">
                  {createMutation.isPending ? 'Pubblicando...' : 'Pubblica Recensione'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg animate-fade-in">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filtri:</span>
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Tutte le categorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutte le categorie</SelectItem>
                <SelectItem value="App">App</SelectItem>
                {[...CATEGORIES.food, ...CATEGORIES.home].map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterRating} onValueChange={setFilterRating}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Tutte le valutazioni" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutte le valutazioni</SelectItem>
                <SelectItem value="5">5 stelle</SelectItem>
                <SelectItem value="4">4 stelle</SelectItem>
                <SelectItem value="3">3 stelle</SelectItem>
                <SelectItem value="2">2 stelle</SelectItem>
                <SelectItem value="1">1 stella</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reviews */}
      <div className="grid gap-4">
        {filteredReviews.map((review) => (
          <Card key={review.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg animate-fade-in transition-all duration-300 hover:shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {review.app_review ? (
                      <Badge variant="default" className="bg-purple-100 text-purple-800">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        Recensione App
                      </Badge>
                    ) : (
                      <Badge variant="secondary">{review.product_name}</Badge>
                    )}
                    <Badge variant="outline">{review.category}</Badge>
                    <div className="ml-auto flex items-center gap-2">
                      {renderStars(review.rating)}
                      <span className="text-sm text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-3">{review.comment}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <button className="flex items-center gap-1 hover:text-primary transition-colors">
                      <ThumbsUp className="h-4 w-4" />
                      <span>{review.helpful_count} utili</span>
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => setEditingReview(review)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => deleteReview(review.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredReviews.length === 0 && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-8 text-center">
              <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nessuna recensione trovata</h3>
              <p className="text-muted-foreground mb-4">
                {reviews.length === 0 ? 'Inizia scrivendo la tua prima recensione!' : 'Prova a modificare i filtri di ricerca.'}
              </p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Scrivi Recensione
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Reviews;
