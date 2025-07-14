
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Settings, User, Bell, Shield, Palette, Database, LogOut, Camera } from 'lucide-react';

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    notifications: true,
    shareData: false,
    darkMode: false,
    autoSync: true,
    publicProfile: false
  });

  const [profile, setProfile] = useState({
    name: 'Mario Rossi',
    email: 'mario.rossi@email.com',
    phone: '+39 123 456 7890'
  });

  const updateSetting = (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateProfile = (key: string, value: string) => {
    setProfile(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="p-4 space-y-6 bg-gradient-to-br from-gray-50 to-slate-100 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-slate-600">
        <div className="flex items-center gap-3">
          <Settings className="h-8 w-8 text-slate-600" />
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
              Impostazioni
            </h1>
            <p className="text-muted-foreground mt-1">Personalizza la tua esperienza</p>
          </div>
        </div>
      </div>

      {/* Profilo */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Profilo Utente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="w-20 h-20">
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-2xl">
                  {profile.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <Button size="sm" className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0">
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => updateProfile('name', e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => updateProfile('email', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="phone">Telefono</Label>
              <Input
                id="phone"
                value={profile.phone}
                onChange={(e) => updateProfile('phone', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifiche */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-accent" />
            Notifiche
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Notifiche Push</Label>
              <p className="text-sm text-muted-foreground">Ricevi notifiche per aggiornamenti importanti</p>
            </div>
            <Switch
              checked={settings.notifications}
              onCheckedChange={(checked) => updateSetting('notifications', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Sincronizzazione Automatica</Label>
              <p className="text-sm text-muted-foreground">Sincronizza automaticamente i dati</p>
            </div>
            <Switch
              checked={settings.autoSync}
              onCheckedChange={(checked) => updateSetting('autoSync', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Privacy */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            Privacy e Sicurezza
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Condividi Dati Anonimi</Label>
              <p className="text-sm text-muted-foreground">Aiutaci a migliorare l'app</p>
            </div>
            <Switch
              checked={settings.shareData}
              onCheckedChange={(checked) => updateSetting('shareData', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label>Profilo Pubblico</Label>
              <p className="text-sm text-muted-foreground">Rendi visibili le tue ricette agli altri</p>
            </div>
            <Switch
              checked={settings.publicProfile}
              onCheckedChange={(checked) => updateSetting('publicProfile', checked)}
            />
          </div>
          
          <Button variant="outline" className="w-full">
            <Shield className="h-4 w-4 mr-2" />
            Cambia Password
          </Button>
        </CardContent>
      </Card>

      {/* Aspetto */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-purple-600" />
            Aspetto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Modalità Scura</Label>
              <p className="text-sm text-muted-foreground">Utilizza tema scuro per l'interfaccia</p>
            </div>
            <Switch
              checked={settings.darkMode}
              onCheckedChange={(checked) => updateSetting('darkMode', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Dati */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-600" />
            Gestione Dati
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full">
            <Database className="h-4 w-4 mr-2" />
            Esporta Dati
          </Button>
          <Button variant="outline" className="w-full">
            Backup Locale
          </Button>
          <Button variant="destructive" className="w-full">
            Elimina Tutti i Dati
          </Button>
        </CardContent>
      </Card>

      {/* Logout */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardContent className="p-6">
          <Button variant="destructive" className="w-full" size="lg">
            <LogOut className="h-4 w-4 mr-2" />
            Esci dall'Account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
