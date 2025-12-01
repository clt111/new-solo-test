import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Record, Category, AppSettings } from '@/types';

interface TreeHoleDB extends DBSchema {
  records: {
    key: string;
    value: Record;
    indexes: {
      category: string;
      createdAt: Date;
      mood: string;
      weather: string;
    };
  };
  categories: {
    key: string;
    value: Category;
    indexes: {
      name: string;
      recordCount: number;
    };
  };
  settings: {
    key: string;
    value: AppSettings;
  };
}

class StorageService {
  private db: IDBPDatabase<TreeHoleDB> | null = null;
  private dbName = 'treehole-db';
  private dbVersion = 1;

  async initDB(): Promise<void> {
    this.db = await openDB<TreeHoleDB>(this.dbName, this.dbVersion, {
      upgrade(db) {
        // 创建记录表
        const recordStore = db.createObjectStore('records', { keyPath: 'id' });
        recordStore.createIndex('category', 'category');
        recordStore.createIndex('createdAt', 'createdAt');
        recordStore.createIndex('mood', 'mood');
        recordStore.createIndex('weather', 'weather');

        // 创建分类表
        const categoryStore = db.createObjectStore('categories', { keyPath: 'id' });
        categoryStore.createIndex('name', 'name');
        categoryStore.createIndex('recordCount', 'recordCount');

        // 创建设置表
        db.createObjectStore('settings', { keyPath: 'key' });
      },
    });

    // 初始化默认分类
    await this.initDefaultCategories();
    
    // 初始化默认设置
    await this.initDefaultSettings();
  }

  private async initDefaultCategories(): Promise<void> {
    const categories = await this.getAllCategories();
    if (categories.length === 0) {
      const defaultCategories = [
        {
          id: 'work',
          name: '工作',
          color: '#3B82F6',
          recordCount: 0,
          createdAt: new Date(),
        },
        {
          id: 'life',
          name: '生活',
          color: '#10B981',
          recordCount: 0,
          createdAt: new Date(),
        },
        {
          id: 'emotion',
          name: '情感',
          color: '#F59E0B',
          recordCount: 0,
          createdAt: new Date(),
        },
        {
          id: 'health',
          name: '健康',
          color: '#EF4444',
          recordCount: 0,
          createdAt: new Date(),
        },
      ];

      for (const category of defaultCategories) {
        await this.createCategory(category);
      }
    }
  }

  private async initDefaultSettings(): Promise<void> {
    const settings = await this.getSettings();
    if (!settings) {
      const defaultSettings = {
        theme: 'auto' as const,
        fontSize: 'medium' as const,
        enableNotifications: true,
        enableLocation: false,
        enableWeather: false,
      };
      await this.saveSettings(defaultSettings);
    }
  }

  // Record operations
  async getAllRecords(): Promise<Record[]> {
    if (!this.db) await this.initDB();
    return await this.db!.getAll('records');
  }

  async getRecord(id: string): Promise<Record | undefined> {
    if (!this.db) await this.initDB();
    return await this.db!.get('records', id);
  }

  async createRecord(record: Record): Promise<void> {
    if (!this.db) await this.initDB();
    await this.db!.add('records', record);
    
    // 更新分类记录数
    if (record.category) {
      await this.incrementCategoryCount(record.category);
    }
  }

  async updateRecord(id: string, updates: Partial<Record>): Promise<void> {
    if (!this.db) await this.initDB();
    const record = await this.getRecord(id);
    if (record) {
      const updatedRecord = { ...record, ...updates, updatedAt: new Date() };
      await this.db!.put('records', updatedRecord);

      // 如果分类发生变化，更新分类记录数
      if (updates.category && updates.category !== record.category) {
        await this.decrementCategoryCount(record.category);
        await this.incrementCategoryCount(updates.category);
      }
    }
  }

  async deleteRecord(id: string): Promise<void> {
    if (!this.db) await this.initDB();
    const record = await this.getRecord(id);
    if (record) {
      await this.db!.delete('records', id);
      
      // 更新分类记录数
      if (record.category) {
        await this.decrementCategoryCount(record.category);
      }
    }
  }

  async getRecordsByCategory(categoryId: string): Promise<Record[]> {
    if (!this.db) await this.initDB();
    return await this.db!.getAllFromIndex('records', 'category', categoryId);
  }

  // Category operations
  async getAllCategories(): Promise<Category[]> {
    if (!this.db) await this.initDB();
    return await this.db!.getAll('categories');
  }

  async getCategory(id: string): Promise<Category | undefined> {
    if (!this.db) await this.initDB();
    return await this.db!.get('categories', id);
  }

  async createCategory(category: Category): Promise<void> {
    if (!this.db) await this.initDB();
    await this.db!.put('categories', category);
  }

  async updateCategory(id: string, updates: Partial<Category>): Promise<void> {
    if (!this.db) await this.initDB();
    const category = await this.getCategory(id);
    if (category) {
      const updatedCategory = { ...category, ...updates };
      await this.db!.put('categories', updatedCategory);
    }
  }

  async deleteCategory(id: string): Promise<void> {
    if (!this.db) await this.initDB();
    await this.db!.delete('categories', id);
  }

  private async incrementCategoryCount(categoryId: string): Promise<void> {
    const category = await this.getCategory(categoryId);
    if (category) {
      await this.updateCategory(categoryId, {
        recordCount: category.recordCount + 1,
      });
    }
  }

  private async decrementCategoryCount(categoryId: string): Promise<void> {
    const category = await this.getCategory(categoryId);
    if (category) {
      await this.updateCategory(categoryId, {
        recordCount: Math.max(0, category.recordCount - 1),
      });
    }
  }

  // Settings operations
  async getSettings(): Promise<AppSettings | undefined> {
    if (!this.db) await this.initDB();
    return await this.db!.get('settings', 'app');
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    if (!this.db) await this.initDB();
    await this.db!.put('settings', { ...(settings as any), key: 'app' });
  }

  // Utility methods
  async exportData(): Promise<{ records: Record[]; categories: Category[]; settings: AppSettings | undefined }> {
    const records = await this.getAllRecords();
    const categories = await this.getAllCategories();
    const settings = await this.getSettings();
    
    // Create downloadable JSON file
    const data = { records, categories, settings };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `treehole-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    return { records, categories, settings };
  }

  async importData(data: { records: Record[]; categories: Category[]; settings?: AppSettings }): Promise<void> {
    if (!this.db) await this.initDB();
    
    const tx = this.db!.transaction(['records', 'categories', 'settings'], 'readwrite');
    
    // Clear existing data
    await tx.objectStore('records').clear();
    await tx.objectStore('categories').clear();
    
    // Import new data
    for (const record of data.records) {
      await tx.objectStore('records').add(record);
    }
    
    for (const category of data.categories) {
      await tx.objectStore('categories').add(category);
    }
    
    if (data.settings) {
      await tx.objectStore('settings').put({ ...(data.settings as any), key: 'app' });
    }
    
    await tx.done;
  }

  async clearAllData(): Promise<void> {
    if (!this.db) await this.initDB();
    
    const tx = this.db!.transaction(['records', 'categories', 'settings'], 'readwrite');
    
    await tx.objectStore('records').clear();
    await tx.objectStore('categories').clear();
    await tx.objectStore('settings').clear();
    
    await tx.done;
    
    // Reinitialize default data
    await this.initDefaultCategories();
    await this.initDefaultSettings();
  }
}

export const storageService = new StorageService();

// Export standalone functions for use in components
export const exportData = () => storageService.exportData();
export const importData = (data: any) => storageService.importData(data);
export const clearAllData = () => storageService.clearAllData();
