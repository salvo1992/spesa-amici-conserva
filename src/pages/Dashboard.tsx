
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Package, BookOpen, Users, TrendingUp, Plus, Clock, AlertTriangle, Star, Zap, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '@/lib/cloudflare';
import { toast } from '@/hooks/use-toast';

interface DashboardStats {
  shoppingItems: number;
  pantryItems: number;
  recipes: number;
  sharedLists: number;
  expiringSoon: number;
  recentActivity: Array<{
    action: string;
    time: string;
    type: string;
  }>;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    shoppingItems: 0,
    pantryItems: 0,
    recipes: 0,
    sharedLists: 0,
    expiringSoon: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const dashboardStats = await api.getDashboardStats();
      setStats(dashboardStats);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare i dati della dashboard",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const statsData = [
    { 
      title: 'Articoli in Lista', 
      value: stats.shoppingItems.toString(), 
      icon: ShoppingCart, 
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      change: '+3 oggi',
      changeType: 'positive',
      action: () => navigate('/shopping-list')
    },
    { 
      title: 'Conserve Disponibili', 
      value: stats.pantryItems.toString(), 
      icon: Package, 
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: '-2 usati',
      changeType: 'neutral',
      action: () => navigate('/pantry')
    },
    { 
      title: 'Ricette Salvate', 
      value: stats.recipes.toString(), 
      icon: BookOpen, 
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: '+1 questa settimana',
      changeType: 'positive',
      action: () => navigate('/recipes')
    },
    { 
      title: 'Liste Condivise', 
      value: stats.sharedLists.toString(), 
      icon: Users, 
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: 'Attive',
      changeType: 'neutral',
      action: () => navigate('/shared')
    },
  ];

  const quickActions = [
    { 
      title: 'Aggiungi alla Lista', 
      description: 'Aggiungi rapidamente un nuovo prodotto',
      icon: ShoppingCart, 
      to: '/shopping-list',
      color: 'from-red-500 to-pink-500',
      action: async () => {
        navigate('/shopping-list');
        toast({
          title: "Lista della Spesa",
          description: "Aggiungi i tuoi prodotti alla lista",
        });
      }
    },
    { 
      title: 'Controlla Conserve', 
      description: 'Vedi cosa hai in dispensa',
      icon: Package, 
      to: '/pantry',
      color: 'from-green-500 to-emerald-500',
      action: async () => {
        navigate('/pantry');
        toast({
          title: "Conserve",
          description: "Controlla i prodotti in dispensa",
        });
      }
    },
    { 
      title: 'Nuova Ricetta', 
      description: 'Crea una nuova ricetta',
      icon: BookOpen, 
      to: '/recipes',
      color: 'from-blue-500 to-cyan-500',
      action: async () => {
        navigate('/recipes');
        toast({
          title: "Ricette",
          description: "Crea e gestisci le tue ricette",
        });
      }
    },
    { 
      title: 'Condividi Lista', 
      description: 'Condividi con famiglia e amici',
      icon: Users, 
      to: '/shared',
      color: 'from-purple-500 to-indigo-500',
      action: async () => {
        navigate('/shared');
        toast({
          title: "Condivisioni",
          description: "Gestisci le liste condivise",
        });
      }
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'add': return 'text-green-600';
      case 'share': return 'text-blue-600';
      case 'save': return 'text-purple-600';
      case 'warning': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const handleQuickAdd = async () => {
    try {
      navigate('/shopping-list');
      toast({
        title: "Azione Rapida",
        description: "Vai alla lista della spesa per aggiungere prodotti",
      });
    } catch (error) {
      console.error('Quick add error:', error);
      toast({
        title: "Errore",
        description: "Errore durante l'azione rapida",
        variant: "destructive"
      });
    }
  };

  const handleSuggestionAction = () => {
    navigate('/pantry');
    toast({
      title: "Controllo Conserve",
      description: "Verifica i prodotti in scadenza",
    });
  };

  if (loading) {
    return (
      <div className="p-4 space-y-6 bg-gradient-to-br from-gray-50 via-blue-50 to-green-50 min-h-screen">
        <div className="bg-white rounded-2xl p-8 shadow-xl animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-xl animate-pulse">
              <div className="h-12 bg-gray-200 rounded-full w-12 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 bg-gradient-to-br from-gray-50 via-blue-50 to-green-50 min-h-screen">
      {/* Header con animazione */}
      <div className="bg-white rounded-2xl p-8 shadow-xl border-l-4 border-primary animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-green-600 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">Benvenuto nella tua cucina digitale</p>
            <div className="flex items-center gap-2 mt-3">
              <Badge className="bg-green-100 text-green-700">Tutto OK</Badge>
              <Badge variant="outline" className="border-blue-500 text-blue-700">
                {stats.recentActivity.length} attività oggi
              </Badge>
              {stats.expiringSoon > 0 && (
                <Badge variant="outline" className="border-orange-500 text-orange-700">
                  {stats.expiringSoon} in scadenza
                </Badge>
              )}
            </div>
          </div>
          <div className="text-right">
            <Button 
              onClick={handleQuickAdd}
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              <Plus className="h-5 w-5 mr-2" />
              Azione Rapida
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid migliorata */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
          <Card 
            key={stat.title} 
            className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 animate-fade-in bg-white/80 backdrop-blur-sm cursor-pointer" 
            style={{ animationDelay: `${index * 100}ms` }}
            onClick={stat.action}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground mb-1">{stat.value}</p>
                <p className="text-sm font-medium text-muted-foreground mb-2">{stat.title}</p>
                <p className={`text-xs ${
                  stat.changeType === 'positive' ? 'text-green-600' : 
                  stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {stat.change}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions migliorata */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl">
            <Zap className="h-6 w-6 text-yellow-500" />
            Azioni Rapide
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Card 
                key={action.title} 
                className="border-0 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 cursor-pointer overflow-hidden group"
                onClick={action.action}
              >
                <div className={`h-2 bg-gradient-to-r ${action.color}`} />
                <CardContent className="p-6 text-center">
                  <div className={`mx-auto w-12 h-12 rounded-full bg-gradient-to-r ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{action.title}</h3>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity migliorata */}
      <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-0 animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="h-6 w-6 text-blue-500" />
              Attività Recente
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="hover:bg-primary/10"
              onClick={() => navigate('/settings')}
            >
              Vedi Tutto
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentActivity.length > 0 ? (
            <div className="space-y-4">
              {stats.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200 border border-gray-100">
                  <div className={`p-2 rounded-full bg-gray-100`}>
                    <Clock className={`h-4 w-4 ${getActivityIcon(activity.type)}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                  {activity.type === 'warning' && (
                    <Badge variant="outline" className="border-orange-500 text-orange-700">
                      Urgente
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nessuna attività recente</p>
              <p className="text-sm text-muted-foreground mt-2">Le tue azioni appariranno qui</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sezione suggerimenti */}
      <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm shadow-xl border-0 animate-fade-in">
        <CardContent className="p-8">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-500">
              <Star className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-foreground mb-2">Suggerimento del giorno</h3>
              <p className="text-muted-foreground">
                {stats.expiringSoon > 0 
                  ? `Hai ${stats.expiringSoon} prodotti in scadenza questa settimana. Controlla la tua dispensa per evitare sprechi!`
                  : 'Tutto sotto controllo! Le tue conserve sono in ordine. Continua così!'
                }
              </p>
            </div>
            <Button 
              onClick={handleSuggestionAction}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
            >
              {stats.expiringSoon > 0 ? 'Controlla' : 'Gestisci'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
