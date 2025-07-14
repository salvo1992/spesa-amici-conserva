
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Package, BookOpen, Users, TrendingUp, Plus, Clock, AlertTriangle, Star, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const stats = [
    { 
      title: 'Articoli in Lista', 
      value: '12', 
      icon: ShoppingCart, 
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      change: '+3 oggi',
      changeType: 'positive'
    },
    { 
      title: 'Conserve Disponibili', 
      value: '24', 
      icon: Package, 
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: '-2 usati',
      changeType: 'neutral'
    },
    { 
      title: 'Ricette Salvate', 
      value: '8', 
      icon: BookOpen, 
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: '+1 questa settimana',
      changeType: 'positive'
    },
    { 
      title: 'Liste Condivise', 
      value: '3', 
      icon: Users, 
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: 'Attive',
      changeType: 'neutral'
    },
  ];

  const recentActivity = [
    { action: 'Aggiunto Pomodori alla lista', time: '2 ore fa', icon: Plus, type: 'add' },
    { action: 'Condivisa lista con Maria', time: '1 giorno fa', icon: Users, type: 'share' },
    { action: 'Salvata ricetta Pasta al Pomodoro', time: '2 giorni fa', icon: BookOpen, type: 'save' },
    { action: 'Prodotto in scadenza: Latte', time: '3 ore fa', icon: AlertTriangle, type: 'warning' },
  ];

  const quickActions = [
    { 
      title: 'Aggiungi alla Lista', 
      description: 'Aggiungi rapidamente un nuovo prodotto',
      icon: ShoppingCart, 
      to: '/shopping-list',
      color: 'from-red-500 to-pink-500'
    },
    { 
      title: 'Controlla Conserve', 
      description: 'Vedi cosa hai in dispensa',
      icon: Package, 
      to: '/pantry',
      color: 'from-green-500 to-emerald-500'
    },
    { 
      title: 'Nuova Ricetta', 
      description: 'Crea una nuova ricetta',
      icon: BookOpen, 
      to: '/recipes',
      color: 'from-blue-500 to-cyan-500'
    },
    { 
      title: 'Condividi Lista', 
      description: 'Condividi con famiglia e amici',
      icon: Users, 
      to: '/shared',
      color: 'from-purple-500 to-indigo-500'
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
              <Badge variant="outline" className="border-blue-500 text-blue-700">3 attività oggi</Badge>
            </div>
          </div>
          <div className="text-right">
            <Button className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-lg transform hover:scale-105 transition-all duration-200">
              <Plus className="h-5 w-5 mr-2" />
              Azione Rapida
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid migliorata */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={stat.title} className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 animate-fade-in bg-white/80 backdrop-blur-sm" style={{ animationDelay: `${index * 100}ms` }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <TrendingUp className="h-4 w-4 text-green-500" />
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
              <Link key={action.title} to={action.to}>
                <Card className="border-0 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 cursor-pointer overflow-hidden group">
                  <div className={`h-2 bg-gradient-to-r ${action.color}`} />
                  <CardContent className="p-6 text-center">
                    <div className={`mx-auto w-12 h-12 rounded-full bg-gradient-to-r ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                      <action.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{action.title}</h3>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </CardContent>
                </Card>
              </Link>
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
            <Button variant="outline" size="sm" className="hover:bg-primary/10">
              Vedi Tutto
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200 border border-gray-100">
                <div className={`p-2 rounded-full bg-gray-100`}>
                  <activity.icon className={`h-4 w-4 ${getActivityIcon(activity.type)}`} />
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
                Hai 3 prodotti in scadenza questa settimana. Controlla la tua dispensa per evitare sprechi!
              </p>
            </div>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600">
              Controlla
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
