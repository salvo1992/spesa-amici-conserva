
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Settings, User, Bell, Shield, Palette, LogOut, Camera, Save, Key, ExternalLink, Cookie, FileText, Scale } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { firebaseAuth, firebaseApi } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const SettingsPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);

  const [settings, setSettings] = useState({
    notifications: true,
    shareData: false,
    darkMode: false,
    autoSync: true,
    publicProfile: false
  });

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || '',
        email: user.email || '',
        phone: ''
      });
    }

    // Carica impostazioni dal localStorage
    const savedSettings = localStorage.getItem('app-settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(parsed);
        
        // Applica dark mode se attivo
        if (parsed.darkMode) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } catch (error) {
        console.error('Errore nel caricamento delle impostazioni:', error);
      }
    }
  }, [user]);

  const updateSetting = (key: string, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    // Salva nel localStorage
    localStorage.setItem('app-settings', JSON.stringify(newSettings));
    
    // Applica dark mode immediatamente
    if (key === 'darkMode') {
      if (value) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }

    // Simula notifica reale per alcune impostazioni
    if (key === 'notifications' && value) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification('Food Manager', {
              body: 'Notifiche attivate con successo!',
              icon: '/favicon.ico'
            });
          }
        });
      } else if (Notification.permission === 'granted') {
        new Notification('Food Manager', {
          body: 'Notifiche attivate!',
          icon: '/favicon.ico'
        });
      }
    }
    
    toast({
      title: "Impostazione aggiornata",
      description: `${getSettingLabel(key)} ${value ? 'attivato' : 'disattivato'}`,
    });
  };

  const getSettingLabel = (key: string) => {
    const labels: { [key: string]: string } = {
      notifications: 'Notifiche',
      shareData: 'Condivisione dati',
      darkMode: 'Modalità scura',
      autoSync: 'Sincronizzazione automatica',
      publicProfile: 'Profilo pubblico'
    };
    return labels[key] || key;
  };

  const updateProfile = (key: string, value: string) => {
    setProfile(prev => ({ ...prev, [key]: value }));
  };

  const saveProfile = async () => {
    setIsLoading(true);
    try {
      await firebaseApi.updateProfile(profile);
      toast({
        title: "Profilo aggiornato",
        description: "Le modifiche sono state salvate con successo",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile salvare le modifiche",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Errore",
        description: "Le password non coincidono",
        variant: "destructive"
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast({
        title: "Errore",
        description: "La password deve essere di almeno 6 caratteri",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      await firebaseApi.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      toast({
        title: "Password cambiata",
        description: "La password è stata aggiornata con successo",
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordDialog(false);
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile cambiare la password. Verifica la password attuale.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-6 bg-gradient-to-br from-gray-50 to-slate-100 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-slate-600 animate-fade-in">
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
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg animate-fade-in">
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
                disabled
                className="bg-gray-100"
              />
              <p className="text-xs text-gray-500 mt-1">L'email non può essere modificata</p>
            </div>
            <div>
              <Label htmlFor="phone">Telefono</Label>
              <Input
                id="phone"
                value={profile.phone}
                onChange={(e) => updateProfile('phone', e.target.value)}
                placeholder="Inserisci il tuo numero"
              />
            </div>
          </div>
          
          <Button onClick={saveProfile} disabled={isLoading} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? 'Salvataggio...' : 'Salva Profilo'}
          </Button>
        </CardContent>
      </Card>

      {/* Notifiche */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg animate-fade-in">
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
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg animate-fade-in">
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
          
          <div className="space-y-3 pt-4 border-t">
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/privacy')}
                className="flex items-center gap-2"
              >
                <Shield className="h-4 w-4" />
                Privacy Policy
                <ExternalLink className="h-3 w-3" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/terms')}
                className="flex items-center gap-2"
              >
                <Scale className="h-4 w-4" />
                Termini di Servizio
                <ExternalLink className="h-3 w-3" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/cookies')}
                className="flex items-center gap-2"
              >
                <Cookie className="h-4 w-4" />
                Cookie Policy
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <Key className="h-4 w-4 mr-2" />
                Cambia Password
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cambia Password</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Password Attuale</Label>
                  <Input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Nuova Password</Label>
                  <Input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Conferma Nuova Password</Label>
                  <Input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={changePassword} disabled={isLoading} className="flex-1">
                    {isLoading ? 'Cambiando...' : 'Cambia Password'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
                    Annulla
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Aspetto */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg animate-fade-in">
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

      {/* Info App */}
      <Card className="bg-gradient-to-r from-slate-100 to-gray-100 border-0 shadow-lg animate-fade-in">
        <CardContent className="p-6 text-center">
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Food Manager</h3>
            <p className="text-slate-600 mb-2">
              Sviluppato da <strong>Il Vikingo del Web</strong>
            </p>
            <p className="text-sm text-slate-500">
              Versione 1.0.0 • © 2024 Il Vikingo del Web
            </p>
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
            <p className="text-amber-800 text-sm">
              <strong>Disclaimer:</strong> Il Vikingo del Web non si assume responsabilità 
              per l'uso che viene fatto di questa applicazione.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Logout */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg animate-fade-in">
        <CardContent className="p-6">
          <Button variant="destructive" className="w-full" size="lg" onClick={logout}>
            <LogOut className="h-4 w-4 mr-2" />
            Esci dall'Account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
