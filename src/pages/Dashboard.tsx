
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Package, BookOpen, Users, TrendingUp, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const stats = [
    { title: 'Articoli in Lista', value: '12', icon: ShoppingCart, color: 'text-red-600' },
    { title: 'Conserve Disponibili', value: '24', icon: Package, color: 'text-green-600' },
    { title: 'Ricette Salvate', value: '8', icon: BookOpen, color: 'text-blue-600' },
    { title: 'Liste Condivise', value: '3', icon: Users, color: 'text-purple-600' },
  ];

  const recentActivity = [
    { action: 'Aggiunto Pomodori alla lista', time: '2 ore fa' },
    { action: 'Condivisa lista con Maria', time: '1 giorno fa' },
    { action: 'Salvata ricetta Pasta al Pomodoro', time: '2 giorni fa' },
  ];

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Benvenuto nella tua cucina digitale</p>
        </div>
        <Button className="bg-primary text-primary-foreground">
          <Plus className="h-4 w-4 mr-2" />
          Nuovo
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className={cn("p-2 rounded-full bg-secondary", stat.color)}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Azioni Rapide
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Link to="/shopping-list">
            <Button variant="outline" className="w-full justify-start">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Vai alla Lista della Spesa
            </Button>
          </Link>
          <Link to="/pantry">
            <Button variant="outline" className="w-full justify-start">
              <Package className="h-4 w-4 mr-2" />
              Controlla le Conserve
            </Button>
          </Link>
          <Link to="/recipes">
            <Button variant="outline" className="w-full justify-start">
              <BookOpen className="h-4 w-4 mr-2" />
              Cerca Nuove Ricette
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Attività Recente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-border last:border-b-0">
                <p className="text-sm text-foreground">{activity.action}</p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
