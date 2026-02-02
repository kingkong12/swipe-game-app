'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, Reorder } from 'framer-motion';
import {
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  GripVertical,
  LogOut,
  Play,
  Eye,
  EyeOff,
  Copy,
  Check,
  LayoutGrid,
  Presentation,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  getAllScenarios,
  addScenario,
  updateScenario,
  deleteScenario,
  reorderScenarios,
  getAllRevealSlides,
  addRevealSlide,
  updateRevealSlide,
  deleteRevealSlide,
  reorderRevealSlides,
  getAllRooms,
  createRoom,
  closeRoom,
  MockScenario,
  MockRevealSlide,
  MockRoom,
  TEST_ROOM_CODE,
} from '@/lib/mock-data';
import { cn } from '@/lib/utils';

type Tab = 'scenarios' | 'slides' | 'rooms';

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('scenarios');
  const [scenarios, setScenarios] = useState<MockScenario[]>([]);
  const [slides, setSlides] = useState<MockRevealSlide[]>([]);
  const [rooms, setRooms] = useState<MockRoom[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Check auth
  useEffect(() => {
    const auth = sessionStorage.getItem('admin-auth');
    if (!auth) {
      router.push('/admin');
    }
  }, [router]);

  // Load data
  useEffect(() => {
    setScenarios(getAllScenarios());
    setSlides(getAllRevealSlides());
    setRooms(getAllRooms());
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('admin-auth');
    router.push('/admin');
  };

  const copyRoomCode = async (code: string) => {
    await navigator.clipboard.writeText(`${window.location.origin}/r/${code}`);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // ============ Scenarios ============
  const handleAddScenario = () => {
    const newScenario = addScenario({
      text: 'New scenario question?',
      shortLabel: null,
      category: 'General',
      isActive: true,
    });
    setScenarios([...scenarios, newScenario]);
    setEditingId(newScenario.id);
  };

  const handleUpdateScenario = (id: string, updates: Partial<MockScenario>) => {
    updateScenario(id, updates);
    setScenarios(scenarios.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const handleDeleteScenario = (id: string) => {
    if (confirm('Delete this scenario?')) {
      deleteScenario(id);
      setScenarios(scenarios.filter(s => s.id !== id));
    }
  };

  const handleReorderScenarios = (newOrder: MockScenario[]) => {
    setScenarios(newOrder);
    reorderScenarios(newOrder.map(s => s.id));
  };

  // ============ Slides ============
  const handleAddSlide = () => {
    const newSlide = addRevealSlide({
      title: 'New Slide',
      body: 'Slide content goes here...',
      imageUrl: null,
      quote: null,
      quoteAuthor: null,
    });
    setSlides([...slides, newSlide]);
    setEditingId(newSlide.id);
  };

  const handleUpdateSlide = (id: string, updates: Partial<MockRevealSlide>) => {
    updateRevealSlide(id, updates);
    setSlides(slides.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const handleDeleteSlide = (id: string) => {
    if (confirm('Delete this slide?')) {
      deleteRevealSlide(id);
      setSlides(slides.filter(s => s.id !== id));
    }
  };

  const handleReorderSlides = (newOrder: MockRevealSlide[]) => {
    setSlides(newOrder);
    reorderRevealSlides(newOrder.map(s => s.id));
  };

  // ============ Rooms ============
  const handleCreateRoom = () => {
    const title = prompt('Enter room title:');
    if (title) {
      const newRoom = createRoom(title);
      setRooms([...rooms, newRoom]);
    }
  };

  const handleCloseRoom = (id: string) => {
    if (confirm('Close this room?')) {
      closeRoom(id);
      setRooms(rooms.map(r => r.id === id ? { ...r, isActive: false } : r));
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/50 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <Button
              variant="glass"
              size="sm"
              onClick={() => window.open('/play', '_blank')}
            >
              <Play className="w-4 h-4 mr-2" />
              Preview Game
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex gap-2 mb-6">
          {[
            { id: 'scenarios' as Tab, label: 'Scenarios', icon: LayoutGrid, count: scenarios.length },
            { id: 'slides' as Tab, label: 'Reveal Slides', icon: Presentation, count: slides.length },
            { id: 'rooms' as Tab, label: 'Rooms', icon: Users, count: rooms.filter(r => r.isActive).length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl transition-all',
                activeTab === tab.id
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Scenarios Tab */}
        {activeTab === 'scenarios' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-white/60">Drag to reorder. Changes save automatically.</p>
              <Button onClick={handleAddScenario}>
                <Plus className="w-4 h-4 mr-2" />
                Add Scenario
              </Button>
            </div>

            <Reorder.Group
              axis="y"
              values={scenarios}
              onReorder={handleReorderScenarios}
              className="space-y-2"
            >
              {scenarios.map((scenario) => (
                <Reorder.Item
                  key={scenario.id}
                  value={scenario}
                  className="glass-card rounded-xl p-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="cursor-grab active:cursor-grabbing pt-1">
                      <GripVertical className="w-5 h-5 text-white/30" />
                    </div>

                    <div className="flex-1 min-w-0">
                      {editingId === scenario.id ? (
                        <div className="space-y-3">
                          <Textarea
                            value={scenario.text}
                            onChange={(e) => handleUpdateScenario(scenario.id, { text: e.target.value })}
                            className="bg-white/5 border-white/10 text-white"
                            rows={2}
                          />
                          <div className="grid grid-cols-2 gap-3">
                            <Input
                              placeholder="Short label"
                              value={scenario.shortLabel || ''}
                              onChange={(e) => handleUpdateScenario(scenario.id, { shortLabel: e.target.value || null })}
                              className="bg-white/5 border-white/10 text-white"
                            />
                            <Input
                              placeholder="Category"
                              value={scenario.category || ''}
                              onChange={(e) => handleUpdateScenario(scenario.id, { category: e.target.value || null })}
                              className="bg-white/5 border-white/10 text-white"
                            />
                          </div>
                        </div>
                      ) : (
                        <div>
                          <p className="text-white">{scenario.text}</p>
                          <div className="flex gap-2 mt-2">
                            {scenario.category && (
                              <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded">
                                {scenario.category}
                              </span>
                            )}
                            {scenario.shortLabel && (
                              <span className="text-xs text-white/40">
                                {scenario.shortLabel}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateScenario(scenario.id, { isActive: !scenario.isActive })}
                        className={cn(
                          'p-2 rounded-lg transition-colors',
                          scenario.isActive ? 'text-green-400 hover:bg-green-500/10' : 'text-white/30 hover:bg-white/5'
                        )}
                        title={scenario.isActive ? 'Active' : 'Inactive'}
                      >
                        {scenario.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>

                      <button
                        onClick={() => setEditingId(editingId === scenario.id ? null : scenario.id)}
                        className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5"
                      >
                        {editingId === scenario.id ? <Save className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                      </button>

                      <button
                        onClick={() => handleDeleteScenario(scenario.id)}
                        className="p-2 rounded-lg text-red-400/50 hover:text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </div>
        )}

        {/* Slides Tab */}
        {activeTab === 'slides' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-white/60">Manage reveal slideshow content.</p>
              <Button onClick={handleAddSlide}>
                <Plus className="w-4 h-4 mr-2" />
                Add Slide
              </Button>
            </div>

            <Reorder.Group
              axis="y"
              values={slides}
              onReorder={handleReorderSlides}
              className="space-y-2"
            >
              {slides.map((slide, index) => (
                <Reorder.Item
                  key={slide.id}
                  value={slide}
                  className="glass-card rounded-xl p-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="cursor-grab active:cursor-grabbing pt-1">
                      <GripVertical className="w-5 h-5 text-white/30" />
                    </div>

                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <span className="text-sm font-medium text-purple-400">{index + 1}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      {editingId === slide.id ? (
                        <div className="space-y-3">
                          <Input
                            placeholder="Slide title"
                            value={slide.title}
                            onChange={(e) => handleUpdateSlide(slide.id, { title: e.target.value })}
                            className="bg-white/5 border-white/10 text-white font-semibold"
                          />
                          <Textarea
                            placeholder="Slide body (supports markdown)"
                            value={slide.body || ''}
                            onChange={(e) => handleUpdateSlide(slide.id, { body: e.target.value || null })}
                            className="bg-white/5 border-white/10 text-white"
                            rows={4}
                          />
                          <div className="grid grid-cols-2 gap-3">
                            <Input
                              placeholder="Quote (optional)"
                              value={slide.quote || ''}
                              onChange={(e) => handleUpdateSlide(slide.id, { quote: e.target.value || null })}
                              className="bg-white/5 border-white/10 text-white"
                            />
                            <Input
                              placeholder="Quote author"
                              value={slide.quoteAuthor || ''}
                              onChange={(e) => handleUpdateSlide(slide.id, { quoteAuthor: e.target.value || null })}
                              className="bg-white/5 border-white/10 text-white"
                            />
                          </div>
                          <Input
                            placeholder="Image URL (optional)"
                            value={slide.imageUrl || ''}
                            onChange={(e) => handleUpdateSlide(slide.id, { imageUrl: e.target.value || null })}
                            className="bg-white/5 border-white/10 text-white"
                          />
                        </div>
                      ) : (
                        <div>
                          <h3 className="text-white font-semibold">{slide.title}</h3>
                          {slide.body && (
                            <p className="text-white/60 text-sm mt-1 line-clamp-2">{slide.body}</p>
                          )}
                          {slide.quote && (
                            <p className="text-purple-400/60 text-sm mt-2 italic">"{slide.quote}"</p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingId(editingId === slide.id ? null : slide.id)}
                        className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5"
                      >
                        {editingId === slide.id ? <Save className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                      </button>

                      <button
                        onClick={() => handleDeleteSlide(slide.id)}
                        className="p-2 rounded-lg text-red-400/50 hover:text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </div>
        )}

        {/* Rooms Tab */}
        {activeTab === 'rooms' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-white/60">
                Test room code: <code className="bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded">{TEST_ROOM_CODE}</code>
              </p>
              <Button onClick={handleCreateRoom}>
                <Plus className="w-4 h-4 mr-2" />
                Create Room
              </Button>
            </div>

            <div className="grid gap-4">
              {rooms.map((room) => (
                <motion.div
                  key={room.id}
                  layout
                  className={cn(
                    'glass-card rounded-xl p-4',
                    !room.isActive && 'opacity-50'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-semibold">{room.title}</h3>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-2xl font-mono font-bold text-purple-400">
                          {room.code}
                        </span>
                        <span className={cn(
                          'text-xs px-2 py-0.5 rounded',
                          room.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        )}>
                          {room.isActive ? 'Active' : 'Closed'}
                        </span>
                      </div>
                      <p className="text-white/40 text-sm mt-1">
                        Created: {new Date(room.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="glass"
                        size="sm"
                        onClick={() => copyRoomCode(room.code)}
                      >
                        {copiedCode === room.code ? (
                          <Check className="w-4 h-4 mr-2 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4 mr-2" />
                        )}
                        Copy Link
                      </Button>

                      {room.isActive && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCloseRoom(room.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Close
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
