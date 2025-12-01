import { create } from 'zustand';
import { Record, Category, FilterOptions, AppSettings, MoodType, WeatherType } from '@/types';
import { storageService } from '@/services/storage';

interface AppState {
  // Data
  records: Record[];
  categories: Category[];
  settings: AppSettings | null;
  
  // UI State
  isLoading: boolean;
  searchQuery: string;
  selectedCategory: string | null;
  selectedMood: MoodType | null;
  selectedWeather: WeatherType | null;
  dateRange: { start: Date | null; end: Date | null };
  
  // Actions
  loadData: () => Promise<void>;
  getRecord: (id: string) => Promise<Record | null>;
  createRecord: (record: Omit<Record, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateRecord: (id: string, updates: Partial<Record>) => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;
  createCategory: (category: Omit<Category, 'id' | 'createdAt' | 'recordCount'>) => Promise<void>;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
  
  // Filter actions
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string | null) => void;
  setSelectedMood: (mood: MoodType | null) => void;
  setSelectedWeather: (weather: WeatherType | null) => void;
  setDateRange: (start: Date | null, end: Date | null) => void;
  clearFilters: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  // Initial state
  records: [],
  categories: [],
  settings: null,
  isLoading: true,
  searchQuery: '',
  selectedCategory: null,
  selectedMood: null,
  selectedWeather: null,
  dateRange: { start: null, end: null },

  // Load data from storage
  loadData: async () => {
    set({ isLoading: true });
    try {
      const [records, categories, settings] = await Promise.all([
        storageService.getAllRecords(),
        storageService.getAllCategories(),
        storageService.getSettings(),
      ]);
      
      set({
        records: records.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
        categories,
        settings: settings || null,
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to load data:', error);
      set({ isLoading: false });
    }
  },

  // Get single record
  getRecord: async (id) => {
    const state = get();
    const found = state.records.find((r) => r.id === id) || null;
    if (found) return found;
    const record = await storageService.getRecord(id);
    return record || null;
  },

  // Record operations
  createRecord: async (recordData) => {
    const newRecord = {
      ...recordData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await storageService.createRecord(newRecord);
    set((state) => ({
      records: [newRecord, ...state.records].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
    }));
  },

  updateRecord: async (id, updates) => {
    await storageService.updateRecord(id, updates);
    set((state) => ({
      records: state.records.map((record) =>
        record.id === id ? { ...record, ...updates, updatedAt: new Date() } : record
      ),
    }));
  },

  deleteRecord: async (id) => {
    await storageService.deleteRecord(id);
    set((state) => ({
      records: state.records.filter((record) => record.id !== id),
    }));
  },

  // Category operations
  createCategory: async (categoryData) => {
    const newCategory = {
      ...categoryData,
      id: crypto.randomUUID(),
      recordCount: 0,
      createdAt: new Date(),
    };
    
    await storageService.createCategory(newCategory);
    set((state) => ({
      categories: [...state.categories, newCategory],
    }));
  },

  // Settings operations
  updateSettings: async (updates) => {
    const currentSettings = get().settings;
    const newSettings = { ...currentSettings, ...updates } as AppSettings;
    
    await storageService.saveSettings(newSettings);
    set({ settings: newSettings });
  },

  // Filter actions
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSelectedMood: (mood) => set({ selectedMood: mood }),
  setSelectedWeather: (weather) => set({ selectedWeather: weather }),
  setDateRange: (start, end) => set({ dateRange: { start, end } }),
  clearFilters: () => set({
    searchQuery: '',
    selectedCategory: null,
    selectedMood: null,
    selectedWeather: null,
    dateRange: { start: null, end: null },
  }),
}));

// Computed selectors
export const useFilteredRecords = () => {
  const { records, searchQuery, selectedCategory, selectedMood, selectedWeather, dateRange } = useStore();
  
  return records.filter((record) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        record.title.toLowerCase().includes(query) ||
        record.content.toLowerCase().includes(query) ||
        (record.tags && record.tags.some(tag => tag.toLowerCase().includes(query)));
      if (!matchesSearch) return false;
    }
    
    // Category filter
    if (selectedCategory && record.category !== selectedCategory) {
      return false;
    }
    
    // Mood filter
    if (selectedMood && record.mood !== selectedMood) {
      return false;
    }
    
    // Weather filter
    if (selectedWeather && record.weather !== selectedWeather) {
      return false;
    }
    
    // Date range filter
    if (dateRange.start && record.createdAt < dateRange.start) {
      return false;
    }
    if (dateRange.end && record.createdAt > dateRange.end) {
      return false;
    }
    
    return true;
  });
};
