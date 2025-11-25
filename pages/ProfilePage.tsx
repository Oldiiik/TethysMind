import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { User, Camera, Save, UserMinus, Search, Users, Eye, MapPin, Globe2, ChevronDown, Check } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useAuth } from '../contexts/AuthContext';
import { getProfile, updateProfile, getFriends, removeFriend, getBooks } from '../utils/api';
import { useTranslation } from '../utils/i18n';
import { countries, searchCountries } from '../utils/countries';

interface Friend {
  id: string;
  name: string;
  direction: string;
  tethysPoints: number;
  avatar?: string;
}

export function ProfilePage() {
  const { t, language } = useTranslation();
  const { user, activeUserId, updateUser } = useAuth();
  
  // DEBUG: Log auth state
  useEffect(() => {
    console.log('🔐 ==================== PROFILE PAGE ====================');
    console.log('👤 user:', user);
    console.log('🆔 activeUserId:', activeUserId);
    console.log('📧 user?.id:', user?.id);
    console.log('🔐 =======================================================');
  }, [user, activeUserId]);
  
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [direction, setDirection] = useState('technology');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [booksRead, setBooksRead] = useState(0);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [countrySearchOpen, setCountrySearchOpen] = useState(false);
  const [countrySearchQuery, setCountrySearchQuery] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const directions = [
    { value: 'technology', label: t('technologyIT') },
    { value: 'science', label: t('naturalSciences') },
    { value: 'humanities', label: t('humanities') },
    { value: 'arts', label: t('artsDesign') },
    { value: 'business', label: t('businessEconomics') },
    { value: 'medicine', label: t('medicineHealth') },
    { value: 'engineering', label: t('engineering') },
    { value: 'law', label: t('law') },
  ];

  useEffect(() => {
    loadProfileData();
  }, [activeUserId]);

  const loadProfileData = async () => {
    if (!activeUserId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      console.log('📥 ===============================================');
      console.log('📥 LOADING PROFILE DATA');
      console.log('📥 ===============================================');
      console.log('🆔 User ID:', activeUserId);
      console.log('👤 User from AuthContext:', user);
      
      // Use data from AuthContext if available
      if (user) {
        console.log('✅ Using data from AuthContext directly!');
        setName(user.name || '');
        setBio(user.bio || '');
        setDirection(user.direction || 'technology');
        setCountry(user.country || '');
        setCity(user.city || '');
        setAvatarPreview(user.avatar || '');
        setBooksRead(user.booksRead || 0);
      } else {
        // Fallback: Load from server
        console.log('⚠️ No user in AuthContext, loading from server...');
        const profile = await getProfile(activeUserId);
        
        console.log('📦 Profile received from server:', profile);
        console.log('🌍 Country from server:', profile.country);
        console.log('🏙️  City from server:', profile.city);
        
        setName(profile.name || '');
        setBio(profile.bio || '');
        setDirection(profile.direction || 'technology');
        setCountry(profile.country || '');
        setCity(profile.city || '');
        setAvatarPreview(profile.avatar || '');
        setBooksRead(profile.booksRead || 0);
      }
      
      console.log('📥 ===============================================');
      
      // Load friends
      const friendsData = await getFriends(activeUserId);
      setFriends(friendsData);

      // Load books count
      try {
        const books = await getBooks(activeUserId);
        setBooksRead(books.length);
      } catch (error) {
        console.error('Error loading books:', error);
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
      toast.error(t('errorLoadingProfile'));
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
        toast.success(t('avatarUploaded'));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    console.log('🚀 ===============================================');
    console.log('🚀 handleSaveProfile CALLED!');
    console.log('🚀 ===============================================');
    console.log('👤 activeUserId:', activeUserId);
    console.log('👤 user object:', user);
    
    if (!activeUserId) {
      console.log('❌ No activeUserId, showing error');
      toast.error('Ошибка: пользователь не авторизован');
      return;
    }

    try {
      console.log('🔄 Setting savingProfile to TRUE');
      setSavingProfile(true);
      
      console.log('💾 ===============================================');
      console.log('💾 SAVING PROFILE DATA');
      console.log('💾 ===============================================');
      console.log('📝 Name:', name);
      console.log('📝 Bio:', bio);
      console.log('📝 Direction:', direction);
      console.log('🌍 Country:', country);
      console.log('🏙️  City:', city);
      console.log('👤 Avatar preview length:', avatarPreview?.length || 0);
      console.log('🆔 User ID:', activeUserId);
      
      const profileData = {
        name,
        bio,
        direction,
        country,
        city,
        avatar: avatarPreview,
      };
      console.log('📦 Profile data object:', profileData);
      console.log('💾 ===============================================');
      
      console.log('🌐 Making API request...');
      
      // Execute save request with minimum delay for visual feedback
      const result = await updateProfile(profileData, activeUserId);
      
      console.log('✅ ===============================================');
      console.log('✅ Profile saved successfully!');
      console.log('✅ ===============================================');
      console.log('📥 Server response:', result);
      console.log('✅ ===============================================');
      
      toast.success(t('profileSaved'));
      
      // Close dialog AFTER successful save
      console.log('🚪 Closing dialog...');
      setIsEditDialogOpen(false);
      
      // Update AuthContext ONLY (don't reload from server - causes race condition!)
      console.log('🔄 Updating AuthContext with fresh data...');
      await updateUser({
        name,
        bio,
        direction,
        country,
        city,
        ...(avatarPreview && { avatar: avatarPreview })
      });
      console.log('✅ AuthContext updated!');
      
    } catch (error) {
      console.error('❌ ===============================================');
      console.error('❌ ERROR SAVING PROFILE');
      console.error('❌ ===============================================');
      console.error('Error:', error);
      console.error('Error type:', typeof error);
      console.error('Error message:', error instanceof Error ? error.message : String(error));
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
      console.error('❌ ===============================================');
      toast.error(t('errorSavingProfile') + ': ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      console.log('🔄 Setting savingProfile to FALSE');
      setSavingProfile(false);
    }
  };

  const handleRemoveFriend = async (friendId: string) => {
    if (!activeUserId) return;

    try {
      await removeFriend(friendId, activeUserId);
      setFriends(friends.filter(f => f.id !== friendId));
      toast.success(t('friendRemovedSuccess'));
    } catch (error) {
      console.error('Error removing friend:', error);
      toast.error(t('errorRemovingFriend'));
    }
  };

  const filteredFriends = friends.filter(friend =>
    friend.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCountries = searchCountries(countrySearchQuery, language);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-cyan-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-blue-950/20 dark:to-indigo-950/20 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-cyan-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-blue-950/20 dark:to-indigo-950/20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Card className="border-2 border-blue-300 dark:border-blue-700">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="relative">
                  <Avatar className="w-24 h-24">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-3xl">
                        <User className="w-12 h-12" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors">
                    <Camera className="w-4 h-4 text-white" />
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-3xl mb-2 bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                    {name || t('user')}
                  </h1>
                  <p className="text-blue-600 dark:text-blue-400 mb-2">{bio || t('notSpecified')}</p>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-2">
                    <Badge className="bg-blue-600">
                      {directions.find(d => d.value === direction)?.label}
                    </Badge>
                    {country && (
                      <Badge className="bg-cyan-600 flex items-center gap-1">
                        <Globe2 className="w-3 h-3" />
                        {country}
                      </Badge>
                    )}
                    {city && (
                      <Badge className="bg-indigo-600 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {city}
                      </Badge>
                    )}
                  </div>
                </div>
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-blue-600 to-cyan-500">
                      <User className="w-4 h-4 mr-2" />
                      {t('editProfile')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{t('editProfile')}</DialogTitle>
                      <DialogDescription>{t('changeData')}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>{t('name')}</Label>
                        <Input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder={t('name')}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t('bio')}</Label>
                        <Textarea
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder={t('tellAboutYourself')}
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t('country')}</Label>
                        <Popover open={countrySearchOpen} onOpenChange={setCountrySearchOpen}>
                          <PopoverTrigger asChild>
                            <Button 
                              variant="outline" 
                              className="w-full justify-between"
                              role="combobox"
                            >
                              {country || t('selectCountry')}
                              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0" align="start">
                            <Command>
                              <CommandInput 
                                placeholder={t('searchCountries')} 
                                value={countrySearchQuery}
                                onValueChange={setCountrySearchQuery}
                              />
                              <CommandList>
                                <CommandEmpty>{t('noCountriesFound')}</CommandEmpty>
                                <CommandGroup>
                                  {filteredCountries.map((c) => (
                                    <CommandItem
                                      key={c.code}
                                      value={c.name}
                                      onSelect={() => {
                                        setCountry(language === 'ru' ? c.nameRu : language === 'kk' ? c.nameKk : c.name);
                                        setCountrySearchOpen(false);
                                        setCountrySearchQuery('');
                                      }}
                                    >
                                      <Check
                                        className={`mr-2 h-4 w-4 ${
                                          country === (language === 'ru' ? c.nameRu : language === 'kk' ? c.nameKk : c.name)
                                            ? 'opacity-100'
                                            : 'opacity-0'
                                        }`}
                                      />
                                      {language === 'ru' ? c.nameRu : language === 'kk' ? c.nameKk : c.name}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-2">
                        <Label>{t('city')}</Label>
                        <Input
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder={t('enterCity')}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t('directionField')}</Label>
                        <Select value={direction} onValueChange={setDirection}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {directions.map(dir => (
                              <SelectItem key={dir.value} value={dir.value}>
                                {dir.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button 
                        onClick={() => {
                          console.log('🔘 BUTTON CLICKED!');
                          handleSaveProfile();
                        }}
                        className="w-full bg-gradient-to-r from-blue-600 to-cyan-500" 
                        disabled={savingProfile}
                      >
                        {savingProfile ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            {t('saving')}
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            {t('saveChanges')}
                          </>
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-2 border-indigo-300 dark:border-indigo-700">
            <CardHeader>
              <CardDescription className="text-blue-600 dark:text-blue-400">{t('booksRead')}</CardDescription>
              <CardTitle className="text-4xl bg-gradient-to-r from-indigo-600 to-purple-500 bg-clip-text text-transparent">
                {booksRead}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                {t('total')}
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-cyan-300 dark:border-cyan-700">
            <CardHeader>
              <CardDescription className="text-blue-600 dark:text-blue-400">TethysPoints</CardDescription>
              <CardTitle className="text-4xl bg-gradient-to-r from-cyan-600 to-blue-500 bg-clip-text text-transparent">
                {user?.tethysPoints || 0}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                {t('totalScore')}
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-300 dark:border-purple-700">
            <CardHeader>
              <CardDescription className="text-blue-600 dark:text-blue-400">{t('friendsCount')}</CardDescription>
              <CardTitle className="text-4xl bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                {friends.length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                {t('onlineStatus')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Friends Section */}
        <Card className="border-2 border-blue-300 dark:border-blue-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <CardTitle className="text-blue-900 dark:text-blue-100">{t('yourFriends')}</CardTitle>
              </div>
              <Badge className="bg-blue-600">{friends.length}</Badge>
            </div>
            <CardDescription className="text-blue-600 dark:text-blue-400">
              {t('manageYourConnections')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 dark:text-blue-400" />
                <Input
                  placeholder={t('searchFriendsPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-blue-300 dark:border-blue-700 focus:border-blue-500 dark:focus:border-blue-500"
                />
              </div>
            </div>

            {/* Friends List */}
            <div className="space-y-3">
              {filteredFriends.length === 0 ? (
                <p className="text-center text-blue-500 dark:text-blue-400 py-8">
                  {friends.length === 0 ? t('noFriendsYet') : t('friendsNotFound')}
                </p>
              ) : (
                filteredFriends.map(friend => (
                  <Card key={friend.id} className="border border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="w-12 h-12 border-2 border-blue-400">
                          {friend.avatar ? (
                            <img src={friend.avatar} alt={friend.name} className="w-full h-full object-cover" />
                          ) : (
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                              {friend.name?.charAt(0) || '?'}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-blue-900 dark:text-blue-100">
                              {friend.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-sm">
                            <span className="text-blue-600 dark:text-blue-400">{friend.direction || t('notSpecified')}</span>
                            <span className="text-blue-500 dark:text-blue-300">•</span>
                            <span className="text-blue-600 dark:text-blue-400">{friend.tethysPoints || 0} TP</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900"
                                onClick={() => setSelectedFriend(friend)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>{t('friendProfile')}</DialogTitle>
                              </DialogHeader>
                              {selectedFriend && (
                                <div className="space-y-4">
                                  <div className="flex items-center gap-4">
                                    <Avatar className="w-16 h-16">
                                      {selectedFriend.avatar ? (
                                        <img src={selectedFriend.avatar} alt={selectedFriend.name} className="w-full h-full object-cover" />
                                      ) : (
                                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-xl">
                                          {selectedFriend.name?.charAt(0) || '?'}
                                        </AvatarFallback>
                                      )}
                                    </Avatar>
                                    <div>
                                      <h3 className="text-xl">{selectedFriend.name}</h3>
                                      <Badge className="mt-1 bg-blue-600">{selectedFriend.direction || t('notSpecified')}</Badge>
                                    </div>
                                  </div>
                                  <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                      <span className="text-muted-foreground">TethysPoints:</span>
                                      <span>{selectedFriend.tethysPoints || 0}</span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>

                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900"
                            onClick={() => handleRemoveFriend(friend.id)}
                          >
                            <UserMinus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}