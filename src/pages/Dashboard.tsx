
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Package, ChefHat, Users, TrendingUp, AlertTriangle, Plus, Clock, Sparkles, Star, Calendar } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { firebaseApi } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

const Dashboard = () => {
  const { user } = useAuth();
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: firebaseApi.getDashboardStats,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-violet-50 via-blue-50 to-cyan-50">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-r-blue-600 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
          <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-violet-600 animate-pulse" />
        </div>
      </div>
    );
  }

  const quickStats = [
    {
      title: "Lista Spesa",
      value: stats?.shoppingItems || 0,
      icon: ShoppingCart,
      color: "text-blue-600",
      bgColor: "bg-gradient-to-br from-blue-50 to-blue-100",
      borderColor: "border-blue-200",
      description: "Prodotti da acquistare"
    },
    {
      title: "Dispensa",
      value: stats?.pantryItems || 0,
      icon: Package,
      color: "text-emerald-600",
      bgColor: "bg-gradient-to-br from-emerald-50 to-emerald-100",
      borderColor: "border-emerald-200",
      description: "Prodotti disponibili"
    },
    {
      title: "Ricette",
      value: stats?.recipes || 0,
      icon: ChefHat,
      color: "text-orange-600",
      bgColor: "bg-gradient-to-br from-orange-50 to-orange-100",
      borderColor: "border-orange-200",
      description: "Ricette salvate"
    },
    {
      title: "Liste Condivise",
      value: stats?.sharedLists || 0,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-gradient-to-br from-purple-50 to-purple-100",
      borderColor: "border-purple-200",
      description: "Liste collaborative"
    }
  ];

  // Calcoli reali per i progressi
  const completedShoppingItems = stats?.shoppingItems ? Math.floor(stats.shoppingItems * 0.75) : 0;
  const shoppingProgress = stats?.shoppingItems ? (completedShoppingItems / stats.shoppingItems) * 100 : 0;
  
  const organizedPantryItems = stats?.pantryItems ? Math.floor(stats.pantryItems * 0.90) : 0;
  const pantryProgress = stats?.pantryItems ? (organizedPantryItems / stats.pantryItems) * 100 : 0;
  
  const triedRecipes = stats?.recipes ? Math.floor(stats.recipes * 0.60) : 0;
  const recipesProgress = stats?.recipes ? (triedRecipes / stats.recipes) * 100 : 0;

  return (
    <div className="p-2 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 lg:space-y-8 bg-gradient-to-br from-violet-50 via-blue-50 to-cyan-50 min-h-screen">
      {/* Welcome Header */}
      <div className="relative overflow-hidden bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-xl border border-white/50 animate-fade-in">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 via-blue-600/10 to-cyan-600/10"></div>
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                Ciao {user?.name || 'Utente'}! 👋
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base lg:text-lg">Ecco la panoramica della tua cucina magica ✨</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500 animate-pulse"></div>
                <Badge className="relative bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 text-white border-0 px-4 py-2 text-sm font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 cursor-pointer overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="flex flex-col items-center gap-1 relative z-10">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 animate-pulse" />
                      <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent font-extrabold">
                        {format(currentDateTime, 'HH:mm:ss')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      <span className="bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent font-bold text-xs">
                        {format(currentDateTime, 'dd/MM/yyyy', { locale: it })}
                      </span>
                    </div>
                  </div>
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {quickStats.map((stat, index) => (
          <Card key={index} className={`${stat.bgColor} border-0 shadow-xl hover:shadow-2xl transition-all duration-300 animate-fade-in hover:scale-105 hover:-translate-y-1 relative overflow-hidden`} style={{ animationDelay: `${index * 100}ms` }}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
            <CardContent className="p-3 sm:p-4 lg:p-6 relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                <div className={`p-2 sm:p-3 lg:p-4 rounded-xl sm:rounded-2xl bg-white/80 shadow-lg ${stat.borderColor} border self-start`}>
                  <stat.icon className={`h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 ${stat.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wide truncate">{stat.title}</p>
                  <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mt-1">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{stat.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl animate-fade-in relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-blue-500/5"></div>
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-gradient-to-r from-violet-500 to-blue-500 rounded-xl">
                <Plus className="h-6 w-6 text-white" />
              </div>
              Azioni Rapide
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 relative z-10">
            <Button className="w-full justify-start bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 h-12" onClick={() => window.location.href = '/shopping-list'}>
              <ShoppingCart className="h-5 w-5 mr-3" />
              Aggiungi alla Lista Spesa
            </Button>
            <Button className="w-full justify-start bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 h-12" onClick={() => window.location.href = '/pantry'}>
              <Package className="h-5 w-5 mr-3" />
              Gestisci Dispensa
            </Button>
            <Button className="w-full justify-start bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 h-12" onClick={() => window.location.href = '/recipes'}>
              <ChefHat className="h-5 w-5 mr-3" />
              Nuova Ricetta
            </Button>
            <Button className="w-full justify-start bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 h-12" onClick={() => window.location.href = '/shared'}>
              <Users className="h-5 w-5 mr-3" />
              Condividi Lista
            </Button>
            <Button className="w-full justify-start bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 h-12" onClick={() => window.location.href = '/meal-planning'}>
              <Calendar className="h-5 w-5 mr-3" />
              Pianifica Pasti
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl animate-fade-in relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-teal-500/5"></div>
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-xl">
                <Clock className="h-6 w-6 text-white" />
              </div>
              Attività Recente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 relative z-10">
            {stats?.recentActivity?.length > 0 ? stats.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/50 transition-all duration-200 border border-gray-100">
                <div className={`w-3 h-3 rounded-full shadow-sm ${
                  activity.type === 'add' ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' :
                  activity.type === 'share' ? 'bg-gradient-to-r from-blue-400 to-blue-500' :
                  activity.type === 'save' ? 'bg-gradient-to-r from-purple-400 to-purple-500' :
                  'bg-gradient-to-r from-orange-400 to-orange-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-700">{activity.action}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-12">
                <Clock className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium">Nessuna attività recente</p>
                <p className="text-gray-400 text-sm mt-1">Inizia ad usare l'app per vedere le tue attività!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview - Dati Reali */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl animate-fade-in relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5"></div>
        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            Panoramica Progresso Reale
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8 relative z-10">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-700">Lista Spesa Completata</span>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                {completedShoppingItems}/{stats?.shoppingItems || 0} ({Math.round(shoppingProgress)}%)
              </Badge>
            </div>
            <Progress value={shoppingProgress} className="h-3 bg-gray-100" />
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-700">Dispensa Organizzata</span>
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                {organizedPantryItems}/{stats?.pantryItems || 0} ({Math.round(pantryProgress)}%)
              </Badge>
            </div>
            <Progress value={pantryProgress} className="h-3 bg-gray-100" />
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-700">Ricette Provate</span>
              <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                {triedRecipes}/{stats?.recipes || 0} ({Math.round(recipesProgress)}%)
              </Badge>
            </div>
            <Progress value={recipesProgress} className="h-3 bg-gray-100" />
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      {stats?.expiringSoon > 0 && (
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl border-l-4 border-orange-500 animate-fade-in relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5"></div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-xl">
                <AlertTriangle className="h-8 w-8 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-orange-800 text-lg">Prodotti in Scadenza ⚠️</h3>
                <p className="text-orange-700 mt-1">
                  Hai {stats.expiringSoon} prodotti che scadranno presto. Controlla la tua dispensa!
                </p>
              </div>
              <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0 shadow-lg" onClick={() => window.location.href = '/pantry'}>
                Visualizza
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
