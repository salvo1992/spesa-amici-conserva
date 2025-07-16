import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Package, ChefHat, Users, TrendingUp, AlertTriangle, Plus, Clock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { firebaseAuth, firebaseApi } from '@/lib/firebase';
import AuthForm from '@/components/AuthForm';
import FirebaseSetup from '@/components/FirebaseSetup';

const Dashboard = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const currentUser = firebaseAuth.getCurrentUser();
    if (currentUser) {
      setIsAuthenticated(true);
      setUser(currentUser);
    }
  }, []);

  // Verifica se Firebase è configurato
  const isFirebaseConfigured = () => {
    return import.meta.env.VITE_FIREBASE_API_KEY && 
           import.meta.env.VITE_FIREBASE_AUTH_DOMAIN && 
           import.meta.env.VITE_FIREBASE_PROJECT_ID;
  };

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: firebaseApi.getDashboardStats,
    enabled: isAuthenticated
  });

  const handleAuthSuccess = (userData: any) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  // Mostra la schermata di configurazione se Firebase non è configurato
  if (!isFirebaseConfigured()) {
    return <FirebaseSetup />;
  }

  if (!isAuthenticated) {
    return <AuthForm onAuthSuccess={handleAuthSuccess} />;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const quickStats = [
    {
      title: "Lista Spesa",
      value: stats?.shoppingItems || 0,
      icon: ShoppingCart,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: "Prodotti da acquistare"
    },
    {
      title: "Dispensa",
      value: stats?.pantryItems || 0,
      icon: Package,
      color: "text-green-600",
      bgColor: "bg-green-50",
      description: "Prodotti disponibili"
    },
    {
      title: "Ricette",
      value: stats?.recipes || 0,
      icon: ChefHat,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      description: "Ricette salvate"
    },
    {
      title: "Liste Condivise",
      value: stats?.sharedLists || 0,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      description: "Liste collaborative"
    }
  ];

  return (
    <div className="p-4 space-y-6 bg-gradient-to-br from-gray-50 to-slate-100 min-h-screen">
      {/* Welcome Header */}
      <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-primary animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Ciao {user?.name}! 👋
            </h1>
            <p className="text-muted-foreground mt-1">Ecco la panoramica della tua cucina</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              <TrendingUp className="h-3 w-3 mr-1" />
              Tutto OK
            </Badge>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => (
          <Card key={index} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Azioni Rapide
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline" onClick={() => window.location.href = '/shopping-list'}>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Aggiungi alla Lista Spesa
            </Button>
            <Button className="w-full justify-start" variant="outline" onClick={() => window.location.href = '/pantry'}>
              <Package className="h-4 w-4 mr-2" />
              Gestisci Dispensa
            </Button>
            <Button className="w-full justify-start" variant="outline" onClick={() => window.location.href = '/recipes'}>
              <ChefHat className="h-4 w-4 mr-2" />
              Nuova Ricetta
            </Button>
            <Button className="w-full justify-start" variant="outline" onClick={() => window.location.href = '/shared'}>
              <Users className="h-4 w-4 mr-2" />
              Condividi Lista
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-accent" />
              Attività Recente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats?.recentActivity?.map((activity, index) => (
              <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'add' ? 'bg-green-500' :
                  activity.type === 'share' ? 'bg-blue-500' :
                  activity.type === 'save' ? 'bg-purple-500' :
                  'bg-orange-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Panoramica Progresso
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Lista Spesa Completata</span>
              <span className="text-sm text-muted-foreground">75%</span>
            </div>
            <Progress value={75} className="h-2" />
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Dispensa Organizzata</span>
              <span className="text-sm text-muted-foreground">90%</span>
            </div>
            <Progress value={90} className="h-2" />
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Ricette Provate</span>
              <span className="text-sm text-muted-foreground">60%</span>
            </div>
            <Progress value={60} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      {stats?.expiringSoon > 0 && (
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg border-l-4 border-orange-500 animate-fade-in">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-orange-500" />
              <div>
                <h3 className="font-semibold text-orange-800">Prodotti in Scadenza</h3>
                <p className="text-sm text-orange-700">
                  Hai {stats.expiringSoon} prodotti che scadranno presto. Controlla la tua dispensa!
                </p>
              </div>
              <Button size="sm" variant="outline" className="ml-auto" onClick={() => window.location.href = '/pantry'}>
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
