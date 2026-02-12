'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, LogIn, LogOut, List, SlidersHorizontal, DoorOpen, Plus, Pencil, Trash2, Save, X, Check, Play, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Scenario {
  id: string;
  text: string;
  shortLabel: string | null;
  category: string | null;
  isActive: boolean;
}

interface Room {
  id: string;
  code: string;
  title: string;
  scenarioIds: string[];
  isActive: boolean;
  createdAt: string;
}

interface Slide {
  id: string;
  title: string;
  body: string | null;
  quote: string | null;
  quoteAuthor: string | null;
}

const CATEGORIES = [
  'Generosity', 'Patience', 'Sacrifice', 'Selfless Service',
  'Acceptance', 'Compassion', 'Trust', 'Service',
];

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [activeTab, setActiveTab] = useState<'scenarios' | 'slides' | 'rooms'>('scenarios');

  // Scenario editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editShortLabel, setEditShortLabel] = useState('');
  const [editCategory, setEditCategory] = useState('');

  // Add new scenario state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newText, setNewText] = useState('');
  const [newShortLabel, setNewShortLabel] = useState('');
  const [newCategory, setNewCategory] = useState('');

  // Feedback
  const [toast, setToast] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Room editing state
  const [showAddRoomForm, setShowAddRoomForm] = useState(false);
  const [newRoomTitle, setNewRoomTitle] = useState('');
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [editRoomTitle, setEditRoomTitle] = useState('');
  const [editRoomScenarioIds, setEditRoomScenarioIds] = useState<string[]>([]);
  const [deletingRoomId, setDeletingRoomId] = useState<string | null>(null);

  // Reveal trigger state
  const [revealTriggered, setRevealTriggered] = useState(false);
  const [triggerLoading, setTriggerLoading] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem('admin-auth');
    if (auth === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      loadData();
      loadTriggerState();
    }
  }, [isLoggedIn]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }, []);

  async function loadTriggerState() {
    try {
      const res = await fetch('/api/trigger', { cache: 'no-store' });
      const data = await res.json() as { success?: boolean; triggered?: boolean };
      if (data.success) setRevealTriggered(data.triggered || false);
    } catch (err) {
      console.error('Error loading trigger state:', err);
    }
  }

  const handleTriggerReveal = async () => {
    setTriggerLoading(true);
    try {
      const newState = !revealTriggered;
      const res = await fetch('/api/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ triggered: newState }),
      });
      const data = await res.json() as { success?: boolean; triggered?: boolean };
      if (data.success) {
        setRevealTriggered(data.triggered || false);
        showToast(newState ? 'Heart reveal triggered!' : 'Heart reveal reset');
      }
    } catch (err) {
      console.error('Error triggering reveal:', err);
    }
    setTriggerLoading(false);
  };

  async function loadData() {
    try {
      const [scenariosRes, slidesRes, roomsRes] = await Promise.all([
        fetch('/api/scenarios', { cache: 'no-store' }),
        fetch('/api/slides', { cache: 'no-store' }),
        fetch('/api/rooms', { cache: 'no-store' }),
      ]);

      const scenariosData = await scenariosRes.json() as { success?: boolean; scenarios?: Scenario[] };
      const slidesData = await slidesRes.json() as { success?: boolean; slides?: Slide[] };
      const roomsData = await roomsRes.json() as { success?: boolean; rooms?: Room[] };

      if (scenariosData.success) setScenarios(scenariosData.scenarios || []);
      if (slidesData.success) setSlides(slidesData.slides || []);
      if (roomsData.success) setRooms(roomsData.rooms || []);
    } catch (err) {
      console.error('Error loading admin data:', err);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (password === 'admin123') {
      localStorage.setItem('admin-auth', 'true');
      setIsLoggedIn(true);
    } else {
      setError('Invalid password');
    }
    setIsLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin-auth');
    setIsLoggedIn(false);
    setPassword('');
  };

  // ---- CRUD handlers ----

  const handleAdd = async () => {
    if (!newText.trim()) return;

    try {
      const res = await fetch('/api/scenarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: newText.trim(),
          shortLabel: newShortLabel.trim() || undefined,
          category: newCategory || undefined,
        }),
      });
      const data = await res.json() as { success?: boolean };
      if (data.success) {
        setShowAddForm(false);
        setNewText('');
        setNewShortLabel('');
        setNewCategory('');
        await loadData();
        showToast('Question added successfully');
      }
    } catch (err) {
      console.error('Error adding scenario:', err);
    }
  };

  const startEdit = (s: Scenario) => {
    setEditingId(s.id);
    setEditText(s.text);
    setEditShortLabel(s.shortLabel || '');
    setEditCategory(s.category || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
    setEditShortLabel('');
    setEditCategory('');
  };

  const handleSaveEdit = async () => {
    if (!editingId || !editText.trim()) return;

    try {
      const res = await fetch('/api/scenarios', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingId,
          text: editText.trim(),
          shortLabel: editShortLabel.trim() || undefined,
          category: editCategory || undefined,
        }),
      });
      const data = await res.json() as { success?: boolean };
      if (data.success) {
        cancelEdit();
        await loadData();
        showToast('Question updated successfully');
      }
    } catch (err) {
      console.error('Error updating scenario:', err);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
  };

  const confirmDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/scenarios?id=${id}`, { method: 'DELETE' });
      const data = await res.json() as { success?: boolean };
      if (data.success) {
        setDeletingId(null);
        await loadData();
        showToast('Question deleted');
      }
    } catch (err) {
      console.error('Error deleting scenario:', err);
    }
  };

  // ---- Room CRUD handlers ----

  const handleAddRoom = async () => {
    if (!newRoomTitle.trim()) return;
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newRoomTitle.trim(), scenarioIds: [] }),
      });
      const data = await res.json() as { success?: boolean };
      if (data.success) {
        setShowAddRoomForm(false);
        setNewRoomTitle('');
        await loadData();
        showToast('Room created');
      }
    } catch (err) {
      console.error('Error creating room:', err);
    }
  };

  const startEditRoom = (r: Room) => {
    setEditingRoomId(r.id);
    setEditRoomTitle(r.title);
    setEditRoomScenarioIds(r.scenarioIds || []);
  };

  const cancelEditRoom = () => {
    setEditingRoomId(null);
    setEditRoomTitle('');
    setEditRoomScenarioIds([]);
  };

  const toggleRoomScenario = (scenarioId: string) => {
    setEditRoomScenarioIds(prev =>
      prev.includes(scenarioId) ? prev.filter(id => id !== scenarioId) : [...prev, scenarioId]
    );
  };

  const handleSaveRoom = async () => {
    if (!editingRoomId || !editRoomTitle.trim()) return;
    try {
      const res = await fetch('/api/rooms', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingRoomId,
          title: editRoomTitle.trim(),
          scenarioIds: editRoomScenarioIds,
        }),
      });
      const data = await res.json() as { success?: boolean };
      if (data.success) {
        cancelEditRoom();
        await loadData();
        showToast('Room updated');
      }
    } catch (err) {
      console.error('Error updating room:', err);
    }
  };

  const confirmDeleteRoom = async (id: string) => {
    try {
      const res = await fetch(`/api/rooms?id=${id}`, { method: 'DELETE' });
      const data = await res.json() as { success?: boolean };
      if (data.success) {
        setDeletingRoomId(null);
        await loadData();
        showToast('Room deleted');
      }
    } catch (err) {
      console.error('Error deleting room:', err);
    }
  };

  // ---- LOGIN SCREEN ----

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <motion.div
          className="max-w-md w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="glass-card rounded-3xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Lock className="w-8 h-8 text-purple-400" />
              </div>
              <h1 className="text-2xl font-bold text-white">Admin Access</h1>
              <p className="text-white/60 mt-2">Enter your password to continue</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-white/70 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter admin password"
                />
                {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
                size="lg"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-5 h-5 mr-2" />
                    Login
                  </>
                )}
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  // ---- DASHBOARD ----

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl bg-green-500/90 text-white font-medium flex items-center gap-2 shadow-lg"
            >
              <Check className="w-4 h-4" />
              {toast}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <Button onClick={handleLogout} variant="glass" size="sm">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Reveal Trigger Card */}
        <motion.div
          className={`rounded-2xl p-5 mb-6 border transition-colors ${
            revealTriggered
              ? 'bg-emerald-500/10 border-emerald-500/30'
              : 'bg-white/5 border-white/10'
          }`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                revealTriggered
                  ? 'bg-emerald-500/20'
                  : 'bg-purple-500/20'
              }`}>
                {revealTriggered
                  ? <Play className="w-5 h-5 text-emerald-400" />
                  : <Square className="w-5 h-5 text-purple-400" />
                }
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">Heart Reveal</h3>
                <p className="text-white/40 text-xs mt-0.5">
                  {revealTriggered
                    ? 'Triggered — users will see the heart collage after the loader'
                    : 'Not triggered — users will wait on the loader screen'
                  }
                </p>
              </div>
            </div>
            <Button
              onClick={handleTriggerReveal}
              disabled={triggerLoading}
              className={`${
                revealTriggered
                  ? 'bg-rose-600 hover:bg-rose-500'
                  : 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400'
              }`}
              size="sm"
            >
              {triggerLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : revealTriggered ? (
                <>
                  <Square className="w-4 h-4 mr-2" />
                  Reset
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Trigger Reveal
                </>
              )}
            </Button>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('scenarios')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'scenarios'
                ? 'bg-purple-600 text-white'
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            <List className="w-4 h-4" />
            Questions ({scenarios.length})
          </button>
          <button
            onClick={() => setActiveTab('slides')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'slides'
                ? 'bg-purple-600 text-white'
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Slides ({slides.length})
          </button>
          <button
            onClick={() => setActiveTab('rooms')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'rooms'
                ? 'bg-purple-600 text-white'
                : 'bg-white/10 text-white/60 hover:bg-white/20'
            }`}
          >
            <DoorOpen className="w-4 h-4" />
            Rooms ({rooms.length})
          </button>
        </div>

        {/* Add Question Button */}
        {activeTab === 'scenarios' && !showAddForm && (
          <motion.button
            onClick={() => setShowAddForm(true)}
            className="w-full mb-4 py-3 px-4 rounded-xl border-2 border-dashed border-white/20 text-white/50 hover:border-purple-500/50 hover:text-purple-300 transition-colors flex items-center justify-center gap-2"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <Plus className="w-5 h-5" />
            Add New Question
          </motion.button>
        )}

        {/* Add Question Form */}
        <AnimatePresence>
          {activeTab === 'scenarios' && showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4"
            >
              <div className="glass-card rounded-xl p-5 border border-purple-500/30">
                <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-purple-400" />
                  New Question
                </h3>

                <div className="space-y-3">
                  <textarea
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    placeholder="Enter the question text..."
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[100px] resize-none"
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      value={newShortLabel}
                      onChange={(e) => setNewShortLabel(e.target.value)}
                      placeholder="Short label (optional)"
                      className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-sm placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
                    >
                      <option value="" className="bg-slate-800">Category (optional)</option>
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c} className="bg-slate-800">{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={handleAdd}
                      disabled={!newText.trim()}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 disabled:opacity-40"
                      size="sm"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Question
                    </Button>
                    <Button
                      onClick={() => { setShowAddForm(false); setNewText(''); setNewShortLabel(''); setNewCategory(''); }}
                      variant="glass"
                      size="sm"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content */}
        <div className="space-y-3">
          {activeTab === 'scenarios' &&
            scenarios.map((s, i) => (
              <motion.div
                key={s.id}
                className={`glass-card rounded-xl p-4 ${editingId === s.id ? 'border border-purple-500/40' : ''}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                {editingId === s.id ? (
                  /* Edit mode */
                  <div className="space-y-3">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[80px] resize-none text-sm"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        value={editShortLabel}
                        onChange={(e) => setEditShortLabel(e.target.value)}
                        placeholder="Short label"
                        className="px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-sm placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <select
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        className="px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none"
                      >
                        <option value="" className="bg-slate-800">No category</option>
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c} className="bg-slate-800">{c}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSaveEdit} className="bg-green-600 hover:bg-green-500" size="sm">
                        <Save className="w-4 h-4 mr-1" />
                        Save
                      </Button>
                      <Button onClick={cancelEdit} variant="glass" size="sm">
                        <X className="w-4 h-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : deletingId === s.id ? (
                  /* Delete confirmation */
                  <div className="flex items-center justify-between">
                    <p className="text-red-300 text-sm">Delete this question?</p>
                    <div className="flex gap-2">
                      <Button onClick={() => confirmDelete(s.id)} className="bg-red-600 hover:bg-red-500" size="sm">
                        <Trash2 className="w-4 h-4 mr-1" />
                        Yes, delete
                      </Button>
                      <Button onClick={() => setDeletingId(null)} variant="glass" size="sm">
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* View mode */
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-white text-sm">{s.text}</p>
                      <div className="flex gap-2 mt-2">
                        {s.category && (
                          <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-300">
                            {s.category}
                          </span>
                        )}
                        {s.shortLabel && (
                          <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/50">
                            {s.shortLabel}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <button
                        onClick={() => startEdit(s)}
                        className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-purple-300 transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}

          {activeTab === 'slides' &&
            slides.map((s, i) => (
              <motion.div
                key={s.id}
                className="glass-card rounded-xl p-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <h3 className="text-white font-semibold mb-1">{s.title}</h3>
                {s.body && (
                  <p className="text-white/60 text-sm line-clamp-2">{s.body}</p>
                )}
                {s.quote && (
                  <p className="text-white/40 text-xs italic mt-2">
                    &ldquo;{s.quote}&rdquo; {s.quoteAuthor && `— ${s.quoteAuthor}`}
                  </p>
                )}
              </motion.div>
            ))}

          {activeTab === 'rooms' && (
            <>
              {/* Add Room Button */}
              {!showAddRoomForm && (
                <motion.button
                  onClick={() => setShowAddRoomForm(true)}
                  className="w-full mb-4 py-3 px-4 rounded-xl border-2 border-dashed border-white/20 text-white/50 hover:border-purple-500/50 hover:text-purple-300 transition-colors flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <Plus className="w-5 h-5" />
                  Create New Room
                </motion.button>
              )}

              {/* Add Room Form */}
              <AnimatePresence>
                {showAddRoomForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4"
                  >
                    <div className="glass-card rounded-xl p-5 border border-purple-500/30">
                      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                        <Plus className="w-4 h-4 text-purple-400" />
                        New Room
                      </h3>
                      <div className="space-y-3">
                        <input
                          value={newRoomTitle}
                          onChange={(e) => setNewRoomTitle(e.target.value)}
                          placeholder="Room name (e.g. Wedding Party, Team Offsite)"
                          className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <div className="flex gap-2 pt-2">
                          <Button onClick={handleAddRoom} disabled={!newRoomTitle.trim()} className="bg-gradient-to-r from-purple-600 to-pink-600 disabled:opacity-40" size="sm">
                            <Save className="w-4 h-4 mr-2" />
                            Create Room
                          </Button>
                          <Button onClick={() => { setShowAddRoomForm(false); setNewRoomTitle(''); }} variant="glass" size="sm">
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Rooms List */}
              {rooms.map((r, i) => (
                <motion.div
                  key={r.id}
                  className={`glass-card rounded-xl p-4 mb-3 ${editingRoomId === r.id ? 'border border-purple-500/40' : ''}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  {editingRoomId === r.id ? (
                    /* Edit Room */
                    <div className="space-y-4">
                      <input
                        value={editRoomTitle}
                        onChange={(e) => setEditRoomTitle(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      />
                      <div>
                        <p className="text-white/60 text-xs mb-2 font-medium">Assign questions to this room:</p>
                        <div className="max-h-[250px] overflow-y-auto space-y-1 pr-2">
                          {scenarios.map((s) => (
                            <label key={s.id} className="flex items-start gap-2 p-2 rounded-lg hover:bg-white/5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={editRoomScenarioIds.includes(s.id)}
                                onChange={() => toggleRoomScenario(s.id)}
                                className="mt-1 accent-purple-500"
                              />
                              <span className="text-white/80 text-xs leading-relaxed">{s.text.substring(0, 100)}{s.text.length > 100 ? '...' : ''}</span>
                            </label>
                          ))}
                        </div>
                        <p className="text-white/40 text-xs mt-2">{editRoomScenarioIds.length} question(s) selected</p>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleSaveRoom} className="bg-green-600 hover:bg-green-500" size="sm">
                          <Save className="w-4 h-4 mr-1" />
                          Save
                        </Button>
                        <Button onClick={cancelEditRoom} variant="glass" size="sm">
                          <X className="w-4 h-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : deletingRoomId === r.id ? (
                    /* Delete confirmation */
                    <div className="flex items-center justify-between">
                      <p className="text-red-300 text-sm">Delete this room?</p>
                      <div className="flex gap-2">
                        <Button onClick={() => confirmDeleteRoom(r.id)} className="bg-red-600 hover:bg-red-500" size="sm">
                          <Trash2 className="w-4 h-4 mr-1" />
                          Yes, delete
                        </Button>
                        <Button onClick={() => setDeletingRoomId(null)} variant="glass" size="sm">
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* View mode */
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-white font-semibold">{r.title}</h3>
                        <p className="text-white/50 text-sm mt-1">
                          Code: <span className="font-mono text-purple-300 font-bold">{r.code}</span>
                          <span className="ml-3 text-white/30">{r.scenarioIds?.length || 0} questions</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            r.isActive ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                          }`}
                        >
                          {r.isActive ? 'Active' : 'Closed'}
                        </span>
                        <button onClick={() => startEditRoom(r)} className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-purple-300 transition-colors" title="Edit">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeletingRoomId(r.id)} className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-red-400 transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
