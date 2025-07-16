
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Settings, User, Bell, Shield, Palette, Database, LogOut, Camera, Save, Download, Trash2, Key } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { firebaseAuth, firebaseApi } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

const SettingsPage = () => {
  const { user, logout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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
        phone: '' // Initialize phone as empty string since it's not in user object
      });
    }
  }, [user]);

  const updateSetting = (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    toast({
      title: "Impostazione aggiornata",
      description: `${key} ${value ? 'attivato' : 'disattivato'}`,
    });
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
        description: "Impossibile cambiare la password",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportData = async () => {
    setIsLoading(true);
    try {
      const data = await firebaseApi.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `food-manager-data-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      
      toast({
        title: "Dati esportati",
        description: "I tuoi dati sono stati scaricati con successo",
      });
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile esportare i dati",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAllData = async () => {
    setIsLoading(true);
    try {
      await firebaseApi.deleteAllData();
      toast({
        title: "Dati eliminati",
        description: "Tutti i tuoi dati sono stati eliminati",
      });
      setShowDeleteDialog(false);
      logout();
    } catch (error) {
      toast({
        title: "Errore",
        description: "Impossibile eliminare i dati",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createBackup = () => {
    const backupData = {
      profile,
      settings,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    
    toast({
      title: "Backup creato",
      description: "Backup locale salvato con successo",
    });
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

      {/* Dati */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-600" />
            Gestione Dati
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full" onClick={exportData} disabled={isLoading}>
            <Download className="h-4 w-4 mr-2" />
            {isLoading ? 'Esportando...' : 'Esporta Dati'}
          </Button>
          <Button variant="outline" className="w-full" onClick={createBackup}>
            <Database className="h-4 w-4 mr-2" />
            Backup Locale
          </Button>
          
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                <Trash2 className="h-4 w-4 mr-2" />
                Elimina Tutti i Dati
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Conferma Eliminazione</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Questa azione eliminerà permanentemente tutti i tuoi dati e non può essere annullata.
                </p>
                <div className="flex gap-2">
                  <Button variant="destructive" onClick={deleteAllData} disabled={isLoading} className="flex-1">
                    {isLoading ? 'Eliminando...' : 'Elimina Tutto'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                    Annulla
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
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
