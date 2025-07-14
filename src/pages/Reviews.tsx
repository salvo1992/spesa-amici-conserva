
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Star, ThumbsUp, MessageCircle, Plus, Filter, Search, StarIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Review {
  id: string;
  productName: string;
  rating: number;
  comment: string;
  date: string;
  author: string;
  helpful: number;
  replies: Reply[];
  category: string;
}

interface Reply {
  id: string;
  author: string;
  comment: string;
  date: string;
}

const Reviews = () => {
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: '1',
      productName: 'Pasta Barilla',
      rating: 5,
      comment: 'Ottima pasta, sempre perfetta al dente. La uso da anni e non mi ha mai deluso.',
      date: '2 giorni fa',
      author: 'Marco R.',
      helpful: 12,
      replies: [
        {
          id: '1',
          author: 'Giulia',
          comment: 'Sono d\'accordo, è la mia pasta preferita!',
          date: '1 giorno fa'
        }
      ],
      category: 'Alimentari'
    },
    {
      id: '2',
      productName: 'Olio Extra Vergine',
      rating: 4,
      comment: 'Buon olio, sapore intenso. Prezzo un po\' alto ma la qualità si sente.',
      date: '1 settimana fa',
      author: 'Anna M.',
      helpful: 8,
      replies: [],
      category: 'Alimentari'
    }
  ]);

  const [newReview, setNewReview] = useState({
    productName: '',
    rating: 5,
    comment: '',
    category: 'Alimentari'
  });

  const [replyText, setReplyText] = useState('');
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const categories = ['Alimentari', 'Casa', 'Bellezza', 'Elettronica', 'Abbigliamento'];

  const addReview = () => {
    if (newReview.productName.trim() && newReview.comment.trim()) {
      const review: Review = {
        id: Date.now().toString(),
        productName: newReview.productName,
        rating: newReview.rating,
        comment: newReview.comment,
        date: 'ora',
        author: 'Te',
        helpful: 0,
        replies: [],
        category: newReview.category
      };
      setReviews([review, ...reviews]);
      setNewReview({
        productName: '',
        rating: 5,
        comment: '',
        category: 'Alimentari'
      });
      setShowAddDialog(false);
      toast({
        title: "Recensione aggiunta!",
        description: `La tua recensione per ${review.productName} è stata pubblicata`,
      });
    }
  };

  const markHelpful = (reviewId: string) => {
    setReviews(reviews.map(review => 
      review.id === reviewId 
        ? { ...review, helpful: review.helpful + 1 }
        : review
    ));
    toast({
      title: "Grazie per il feedback!",
      description: "Hai segnalato questa recensione come utile",
    });
  };

  const addReply = (reviewId: string) => {
    if (replyText.trim()) {
      const newReplyObj: Reply = {
        id: Date.now().toString(),
        author: 'Te',
        comment: replyText,
        date: 'ora'
      };
      
      setReviews(reviews.map(review => 
        review.id === reviewId 
          ? { ...review, replies: [...review.replies, newReplyObj] }
          : review
      ));
      
      setReplyText('');
      setActiveReplyId(null);
      toast({
        title: "Risposta aggiunta!",
        description: "La tua risposta è stata pubblicata",
      });
    }
  };

  const renderStars = (rating: number, size: 'sm' | 'lg' = 'sm') => {
    const starSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.comment.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = !filterCategory || review.category === filterCategory;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-4 space-y-6 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-purple-500 animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Recensioni Prodotti
            </h1>
            <p className="text-muted-foreground mt-1">Condividi e leggi recensioni sui prodotti</p>
            <div className="flex items-center gap-2 mt-3">
              <Badge className="bg-purple-100 text-purple-700">{reviews.length} recensioni</Badge>
            </div>
          </div>
          
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg">
                <Plus className="h-4 w-4 mr-2" />
                Scrivi Recensione
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Nuova Recensione
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nome Prodotto</label>
                    <Input
                      placeholder="Es. Pasta Barilla"
                      value={newReview.productName}
                      onChange={(e) => setNewReview({...newReview, productName: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Categoria</label>
                    <select
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={newReview.category}
                      onChange={(e) => setNewReview({...newReview, category: e.target.value})}
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Valutazione</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReview({...newReview, rating: star})}
                      >
                        <Star
                          className={`h-6 w-6 ${
                            star <= newReview.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                          } hover:text-yellow-400 transition-colors`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Commento</label>
                  <Textarea
                    placeholder="Condividi la tua esperienza con questo prodotto..."
                    value={newReview.comment}
                    onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                    rows={4}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={addReview} className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600">
                    Pubblica Recensione
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddDialog(false)} className="flex-1">
                    Annulla
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Search and Filter */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cerca recensioni..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            className="rounded-md border border-input bg-background px-3 py-2 text-sm min-w-[140px]"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">Tutte le categorie</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {filteredReviews.map((review, index) => (
          <Card key={review.id} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-lg">{review.productName}</h3>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                      {review.category}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mb-3">
                    {renderStars(review.rating)}
                    <span className="text-sm text-muted-foreground">
                      da {review.author} • {review.date}
                    </span>
                  </div>
                </div>
              </div>
              
              <p className="text-muted-foreground mb-4 leading-relaxed">{review.comment}</p>
              
              <div className="flex items-center gap-4 mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => markHelpful(review.id)}
                  className="flex items-center gap-2"
                >
                  <ThumbsUp className="h-4 w-4" />
                  Utile ({review.helpful})
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveReplyId(activeReplyId === review.id ? null : review.id)}
                  className="flex items-center gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  Rispondi ({review.replies.length})
                </Button>
              </div>
              
              {/* Replies */}
              {review.replies.length > 0 && (
                <div className="space-y-3 border-l-2 border-purple-200 pl-4 ml-4">
                  {review.replies.map((reply) => (
                    <div key={reply.id} className="bg-purple-50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="text-xs bg-purple-200 text-purple-700">
                            {reply.author.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">{reply.author}</span>
                        <span className="text-xs text-muted-foreground">{reply.date}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{reply.comment}</p>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Reply Form */}
              {activeReplyId === review.id && (
                <div className="mt-4 border-t pt-4">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Scrivi una risposta..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      rows={2}
                      className="flex-1"
                    />
                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        onClick={() => addReply(review.id)}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        Invia
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setActiveReplyId(null);
                          setReplyText('');
                        }}
                      >
                        Annulla
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredReviews.length === 0 && (
        <Card className="p-12 text-center bg-white/80 backdrop-blur-sm">
          <Star className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">
            {searchTerm || filterCategory ? 'Nessuna recensione trovata' : 'Nessuna recensione disponibile'}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {searchTerm || filterCategory ? 'Prova a modificare i filtri di ricerca' : 'Inizia scrivendo la tua prima recensione!'}
          </p>
        </Card>
      )}
    </div>
  );
};

export default Reviews;
