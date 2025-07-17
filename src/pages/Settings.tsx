import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Settings as SettingsIcon, Moon, Sun, Globe, Bell, Shield, Cookie, Info, Calendar } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true' || 
             (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  const [notifications, setNotifications] = useState(true);
  const [cookiesAccepted, setCookiesAccepted] = useState(() => {
    return localStorage.getItem('cookiesAccepted') === 'true';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('darkMode', String(darkMode));
      if (darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [darkMode]);

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    toast({
      title: t('languageChanged'),
      description: `${t('languageSetTo')} ${newLanguage === 'it' ? 'Italiano' : newLanguage === 'en' ? 'English' : newLanguage === 'es' ? 'Español' : 'Français'}`
    });
  };

  const handleCookieSettings = () => {
    navigate('/privacy');
  };

  const handleDarkModeToggle = () => {
    setDarkMode(!darkMode);
  };

  const handleNotificationsToggle = () => {
    setNotifications(!notifications);
    toast({
      title: notifications ? t('notificationsDisabled') : t('notificationsEnabled'),
      description: notifications ? t('youWontReceive') : t('youWillReceive')
    });
  };

  const handleAcceptCookies = () => {
    setCookiesAccepted(true);
    localStorage.setItem('cookiesAccepted', 'true');
    toast({
      title: t('cookiesAccepted'),
      description: t('thankYouForAccepting')
    });
  };

  const handleRejectCookies = () => {
    setCookiesAccepted(false);
    localStorage.setItem('cookiesAccepted', 'false');
    toast({
      title: t('cookiesRejected'),
      description: t('someFeaturesMayBeLimited')
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border-l-4 border-blue-500 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
              <SettingsIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                {t('settings')}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <img 
                  src="/lovable-uploads/7c75a14f-99a4-4250-a4c1-00b33d7be67b.png" 
                  alt="Il Vikingo del Web" 
                  className="w-6 h-6 rounded-full"
                />
                <p className="text-muted-foreground">Il Vikingo del Web - Food Manager</p>
              </div>
            </div>
          </div>
        </div>

        {/* Language Settings */}
        <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-0 shadow-lg animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Globe className="h-5 w-5 text-blue-600" />
              {t('languageSettings')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-foreground">{t('selectLanguage')}</div>
                <div className="text-sm text-muted-foreground">
                  {t('chooseAppLanguage')}
                </div>
              </div>
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t('selectLanguage')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="it">Italiano</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-0 shadow-lg animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              {darkMode ? <Moon className="h-5 w-5 text-yellow-500" /> : <Sun className="h-5 w-5 text-yellow-500" />}
              {t('appearanceSettings')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-foreground">{t('darkMode')}</div>
                <div className="text-sm text-muted-foreground">
                  {t('toggleDarkMode')}
                </div>
              </div>
              <Switch checked={darkMode} onCheckedChange={handleDarkModeToggle} />
            </div>
            <Separator />
            <div className="text-center">
              <Badge variant="outline">
                {darkMode ? t('usingDarkMode') : t('usingLightMode')}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-0 shadow-lg animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Bell className="h-5 w-5 text-orange-500" />
              {t('notificationSettings')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-foreground">{t('enableNotifications')}</div>
                <div className="text-sm text-muted-foreground">
                  {t('receiveUpdates')}
                </div>
              </div>
              <Switch checked={notifications} onCheckedChange={handleNotificationsToggle} />
            </div>
            <Separator />
            <div className="text-center">
              <Badge variant="outline">
                {notifications ? t('notificationsEnabled') : t('notificationsDisabled')}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Cookies */}
        <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-0 shadow-lg animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Shield className="h-5 w-5 text-green-600" />
              Privacy & Cookie
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-foreground">Cookie Accettati</div>
                <div className="text-sm text-muted-foreground">
                  Gestisci le tue preferenze sui cookie
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={cookiesAccepted ? "default" : "secondary"}>
                  {cookiesAccepted ? "Accettati" : "Non Accettati"}
                </Badge>
                <Button variant="outline" size="sm" onClick={handleCookieSettings}>
                  <Cookie className="h-4 w-4 mr-2" />
                  Gestisci Cookie
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* App Info */}
        <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-0 shadow-lg animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Info className="h-5 w-5 text-blue-600" />
              Informazioni App
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Versione</div>
                <div className="font-medium text-foreground">v2.1.0</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Ultimo Aggiornamento</div>
                <div className="font-medium text-foreground flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date().toLocaleDateString('it-IT')}
                </div>
              </div>
            </div>
            <Separator />
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <img 
                  src="/lovable-uploads/7c75a14f-99a4-4250-a4c1-00b33d7be67b.png" 
                  alt="Il Vikingo del Web" 
                  className="w-8 h-8 rounded-full"
                />
                <span className="font-bold text-blue-600 dark:text-blue-400">Il Vikingo del Web</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Food Manager - La tua app per gestire cibo e ricette
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
