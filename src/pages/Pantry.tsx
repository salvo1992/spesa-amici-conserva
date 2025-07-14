
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Package, AlertTriangle, CheckCircle, Plus, Search } from 'lucide-react';

interface PantryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  expiryDate: string;
  status: 'abbondante' | 'normale' | 'scarso' | 'scaduto';
}

const Pantry = () => {
  const [items, setItems] = useState<PantryItem[]>([
    { id: '1', name: 'Conserva di Pomodoro', quantity: 5, unit: 'barattoli', category: 'Conserve', expiryDate: '2025-06-15', status: 'abbondante' },
    { id: '2', name: 'Olio Extravergine', quantity: 2, unit: 'litri', category: 'Condimenti', expiryDate: '2025-12-31', status: 'normale' },
    { id: '3', name: 'Pasta Integrale', quantity: 1, unit: 'kg', category: 'Cereali', expiryDate: '2025-03-20', status: 'scarso' },
    { id: '4', name: 'Miele', quantity: 1, unit: 'barattolo', category: 'Dolcificanti', expiryDate: '2024-12-01', status: 'scaduto' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'abbondante': return 'bg-green-500';
      case 'normale': return 'bg-blue-500';
      case 'scarso': return 'bg-yellow-500';
      case 'scaduto': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'abbondante': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'normale': return <Package className="h-4 w-4 text-blue-600" />;
      case 'scarso': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'scaduto': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const getProgressValue = (status: string) => {
    switch (status) {
      case 'abbondante': return 100;
      case 'normale': return 60;
      case 'scarso': return 30;
      case 'scaduto': return 0;
      default: return 50;
    }
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totale: items.length,
    abbondanti: items.filter(i => i.status === 'abbondante').length,
    scarsi: items.filter(i => i.status === 'scarso').length,
    scaduti: items.filter(i => i.status === 'scaduto').length,
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Le Mie Conserve</h1>
          <p className="text-muted-foreground">Gestisci la tua dispensa</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Aggiungi
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{stats.totale}</p>
            <p className="text-sm text-muted-foreground">Totale Articoli</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{stats.abbondanti}</p>
            <p className="text-sm text-muted-foreground">Abbondanti</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{stats.scarsi}</p>
            <p className="text-sm text-muted-foreground">Scarsi</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{stats.scaduti}</p>
            <p className="text-sm text-muted-foreground">Scaduti</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Cerca nelle conserve..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Items List */}
      <div className="space-y-3">
        {filteredItems.map((item) => (
          <Card key={item.id} className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(item.status)}
                    <h3 className="font-medium text-foreground">{item.name}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {item.category}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {item.quantity} {item.unit}
                      </span>
                      <span className="text-muted-foreground">
                        Scade: {new Date(item.expiryDate).toLocaleDateString('it-IT')}
                      </span>
                    </div>
                    
                    <Progress 
                      value={getProgressValue(item.status)} 
                      className="h-2"
                    />
                    
                    <div className="flex justify-between items-center">
                      <span className={`text-xs font-medium ${
                        item.status === 'scaduto' ? 'text-red-600' :
                        item.status === 'scarso' ? 'text-yellow-600' :
                        item.status === 'normale' ? 'text-blue-600' :
                        'text-green-600'
                      }`}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </span>
                      
                      {item.status === 'scarso' && (
                        <Button size="sm" variant="outline">
                          Aggiungi alla Lista
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nessuna conserva trovata</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Pantry;
