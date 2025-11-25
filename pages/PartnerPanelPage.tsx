import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Briefcase, Plus, Trash2, Eye, Users } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface Mission {
  id: number;
  title: string;
  description: string;
  bonus: string;
  status: 'active' | 'draft' | 'completed';
}

interface Friend {
  id: number;
  name: string;
  direction: string;
  points: number;
  status: 'online' | 'offline';
}

export function PartnerPanelPage() {
  const [missions, setMissions] = useState<Mission[]>([
    {
      id: 1,
      title: 'Стажировка в IT компании',
      description: 'Пройди стажировку в нашей компании и получи опыт работы',
      bonus: '50000 ₽',
      status: 'active'
    },
    {
      id: 2,
      title: 'Участие в хакатоне',
      description: 'Прими участие в нашем хакатоне и реши реальную задачу',
      bonus: '30000 ₽',
      status: 'active'
    }
  ]);

  const [newMission, setNewMission] = useState({
    title: '',
    description: '',
    bonus: ''
  });

  const addMission = () => {
    if (newMission.title && newMission.description && newMission.bonus) {
      const mission: Mission = {
        id: Date.now(),
        ...newMission,
        status: 'draft'
      };
      setMissions([...missions, mission]);
      setNewMission({ title: '', description: '', bonus: '' });
      toast.success('Миссия добавлена');
    }
  };

  const deleteMission = (id: number) => {
    setMissions(missions.filter(m => m.id !== id));
    toast.success('Миссия удалена');
  };

  const activateMission = (id: number) => {
    setMissions(missions.map(m =>
      m.id === id ? { ...m, status: 'active' as const } : m
    ));
    toast.success('Миссия активирована');
  };

  const getStatusBadge = (status: Mission['status']) => {
    const variants = {
      active: { variant: 'default' as const, label: 'Активна' },
      draft: { variant: 'secondary' as const, label: 'Черновик' },
      completed: { variant: 'outline' as const, label: 'Завершена' }
    };
    const { variant, label } = variants[status];
    return <Badge variant={variant}>{label}</Badge>;
  };

  const [friends, setFriends] = useState<Friend[]>([
    {
      id: 1,
      name: 'Иван Иванов',
      direction: 'IT',
      points: 1500,
      status: 'online'
    },
    {
      id: 2,
      name: 'Мария Петрова',
      direction: 'Дизайн',
      points: 1200,
      status: 'offline'
    }
  ]);

  const [newFriend, setNewFriend] = useState({
    name: '',
    direction: '',
    points: 0
  });

  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);

  const addFriend = () => {
    if (newFriend.name && newFriend.direction && newFriend.points) {
      const friend: Friend = {
        id: Date.now(),
        ...newFriend,
        status: 'offline'
      };
      setFriends([...friends, friend]);
      setNewFriend({ name: '', direction: '', points: 0 });
      toast.success('Друг добавлен');
    }
  };

  const deleteFriend = (id: number) => {
    setFriends(friends.filter(f => f.id !== id));
    toast.success('Друг удален');
  };

  const activateFriend = (id: number) => {
    setFriends(friends.map(f =>
      f.id === id ? { ...f, status: 'online' as const } : f
    ));
    toast.success('Друг активирован');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Briefcase className="w-8 h-8" />
          <h1 className="text-4xl">Панель партнёра</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Создавайте и управляйте миссиями для студентов
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Новая миссия
              </CardTitle>
              <CardDescription>Создайте задание для студентов</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Название</Label>
                <Input
                  id="title"
                  placeholder="Название миссии"
                  value={newMission.title}
                  onChange={(e) => setNewMission({ ...newMission, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  placeholder="Подробное описание задания"
                  rows={4}
                  value={newMission.description}
                  onChange={(e) => setNewMission({ ...newMission, description: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bonus">Бонус</Label>
                <Input
                  id="bonus"
                  placeholder="50000 ₽"
                  value={newMission.bonus}
                  onChange={(e) => setNewMission({ ...newMission, bonus: e.target.value })}
                />
              </div>

              <Button onClick={addMission} className="w-full gap-2">
                <Plus className="w-4 h-4" />
                Добавить миссию
              </Button>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-base">Статистика</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Активных миссий</span>
                <span>{missions.filter(m => m.status === 'active').length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Черновиков</span>
                <span>{missions.filter(m => m.status === 'draft').length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Завершённых</span>
                <span>{missions.filter(m => m.status === 'completed').length}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Все миссии</CardTitle>
              <CardDescription>Управление опубликованными заданиями</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Название</TableHead>
                    <TableHead>Бонус</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {missions.map((mission) => (
                    <TableRow key={mission.id}>
                      <TableCell>
                        <div>
                          <p>{mission.title}</p>
                          <p className="text-sm text-muted-foreground truncate max-w-xs">
                            {mission.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{mission.bonus}</TableCell>
                      <TableCell>{getStatusBadge(mission.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {mission.status === 'draft' && (
                            <Button
                              size="sm"
                              onClick={() => activateMission(mission.id)}
                            >
                              Активировать
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteMission(mission.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Friends Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Form */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Новый друг
              </CardTitle>
              <CardDescription>Добавьте нового друга</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="friendName">Имя</Label>
                <Input
                  id="friendName"
                  placeholder="Имя друга"
                  value={newFriend.name}
                  onChange={(e) => setNewFriend({ ...newFriend, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="friendDirection">Направление</Label>
                <Input
                  id="friendDirection"
                  placeholder="Направление"
                  value={newFriend.direction}
                  onChange={(e) => setNewFriend({ ...newFriend, direction: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="friendPoints">Очки</Label>
                <Input
                  id="friendPoints"
                  placeholder="Очки"
                  type="number"
                  value={newFriend.points}
                  onChange={(e) => setNewFriend({ ...newFriend, points: parseInt(e.target.value) || 0 })}
                />
              </div>

              <Button onClick={addFriend} className="w-full gap-2">
                <Plus className="w-4 h-4" />
                Добавить друга
              </Button>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-base">Статистика друзей</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Онлайн</span>
                <span>{friends.filter(f => f.status === 'online').length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Оффлайн</span>
                <span>{friends.filter(f => f.status === 'offline').length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Всего друзей</span>
                <span>{friends.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Все друзья</CardTitle>
              <CardDescription>Управление друзьями</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Имя</TableHead>
                    <TableHead>Направление</TableHead>
                    <TableHead>Очки</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {friends.map((friend) => (
                    <TableRow key={friend.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar>
                            <AvatarFallback className={friend.status === 'online' ? 'bg-green-500' : 'bg-gray-500'}>
                              {friend.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <p>{friend.name}</p>
                        </div>
                      </TableCell>
                      <TableCell>{friend.direction}</TableCell>
                      <TableCell>{friend.points} TP</TableCell>
                      <TableCell>
                        <Badge variant={friend.status === 'online' ? 'default' : 'secondary'}>
                          {friend.status === 'online' ? 'Онлайн' : 'Оффлайн'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {friend.status === 'offline' && (
                            <Button
                              size="sm"
                              onClick={() => activateFriend(friend.id)}
                            >
                              Активировать
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedFriend(friend)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteFriend(friend.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Friend Profile Dialog */}
      <Dialog open={selectedFriend !== null} onOpenChange={(open) => !open && setSelectedFriend(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Профиль друга</DialogTitle>
            <DialogDescription>Информация о пользователе</DialogDescription>
          </DialogHeader>
          {selectedFriend && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className={selectedFriend.status === 'online' ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}>
                    {selectedFriend.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl">{selectedFriend.name}</h3>
                  <Badge variant={selectedFriend.status === 'online' ? 'default' : 'secondary'}>
                    {selectedFriend.status === 'online' ? 'Онлайн' : 'Оффлайн'}
                  </Badge>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Направление:</span>
                  <span>{selectedFriend.direction}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Очки:</span>
                  <span>{selectedFriend.points} TP</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
