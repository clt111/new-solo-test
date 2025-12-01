import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { Settings as SettingsIcon, Download, Upload, Trash2, Bell, Palette, Database, Info, Moon, Sun } from 'lucide-react';
import { exportData, importData, clearAllData } from '../services/storage';

interface SettingsState {
  theme: 'light' | 'dark' | 'auto';
  notifications: boolean;
  autoBackup: boolean;
  language: 'zh-CN' | 'en-US';
}

export default function Settings() {
  const { records, settings, updateSettings } = useStore();
  const [localSettings, setLocalSettings] = useState<SettingsState>({
    theme: 'auto',
    notifications: true,
    autoBackup: false,
    language: 'zh-CN'
  });
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);

  useEffect(() => {
    if (settings) {
      setLocalSettings({
        theme: settings.theme,
        notifications: !!settings.enableNotifications,
        autoBackup: false,
        language: 'zh-CN'
      });
    }
  }, [settings]);

  const handleSettingChange = async (key: keyof SettingsState, value: any) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);

    if (key === 'theme') {
      await updateSettings({ theme: value });
    }
    if (key === 'notifications') {
      await updateSettings({ enableNotifications: !!value });
    }

    // 应用主题设置
    if (key === 'theme') {
      applyTheme(value);
    }

    // 应用通知设置
    if (key === 'notifications') {
      if (value) {
        requestNotificationPermission();
      }
    }
  };

  const applyTheme = (theme: string) => {
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      // auto - 根据系统设置
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('通知权限已授予');
      }
    }
  };

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      await exportData();
      alert('数据导出成功！');
    } catch (error) {
      console.error('导出失败:', error);
      alert('数据导出失败，请重试');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportData = async () => {
    if (!importFile) {
      alert('请选择要导入的文件');
      return;
    }

    try {
      setIsImporting(true);
      const text = await importFile.text();
      const data = JSON.parse(text);
      await importData(data);
      alert('数据导入成功！页面将重新加载。');
      window.location.reload();
    } catch (error) {
      console.error('导入失败:', error);
      alert('数据导入失败，请检查文件格式');
    } finally {
      setIsImporting(false);
      setImportFile(null);
    }
  };

  const handleClearAllData = async () => {
    if (confirm('⚠️ 警告：此操作将删除所有数据，包括所有记录、标签和设置。此操作不可恢复。\n\n确定要继续吗？')) {
      if (confirm('再次确认：您真的要删除所有数据吗？')) {
        try {
          await clearAllData();
          alert('所有数据已清除！页面将重新加载。');
          window.location.reload();
        } catch (error) {
          console.error('清除数据失败:', error);
          alert('数据清除失败，请重试');
        }
      }
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImportFile(file);
    }
  };

  const appInfo = {
    name: '树洞空间',
    version: '1.0.0',
    description: '一个私密的心情记录和日常笔记应用',
    author: 'TreeHole App',
    buildDate: new Date().toLocaleDateString('zh-CN')
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">设置</h1>
          <p className="text-gray-600">管理您的应用偏好和数据</p>
        </div>

        {/* 外观设置 */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">外观设置</h2>
            </div>
          </div>
          
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                主题模式
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'light', label: '浅色', icon: Sun },
                  { value: 'dark', label: '深色', icon: Moon },
                  { value: 'auto', label: '自动', icon: SettingsIcon }
                ].map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    onClick={() => handleSettingChange('theme', value)}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      localSettings.theme === value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <Icon className="h-5 w-5 mx-auto mb-1" />
                    <div className="text-sm font-medium">{label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">启用通知</span>
                <input
                  type="checkbox"
                  checked={localSettings.notifications}
                  onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </label>
              <p className="text-xs text-gray-500 mt-1">
                开启后，应用可以发送提醒和更新通知
              </p>
            </div>
          </div>
        </div>

        {/* 数据管理 */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">数据管理</h2>
            </div>
          </div>
          
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  导出数据
                </label>
                <button
                  onClick={handleExportData}
                  disabled={isExporting}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Download className="h-4 w-4" />
                  {isExporting ? '导出中...' : '导出所有数据'}
                </button>
                <p className="text-xs text-gray-500 mt-1">
                  将您的所有记录、标签和设置导出为JSON文件
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  导入数据
                </label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileSelect}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <button
                    onClick={handleImportData}
                    disabled={!importFile || isImporting}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Upload className="h-4 w-4" />
                    {isImporting ? '导入中...' : '导入数据'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  从JSON文件导入数据（将覆盖现有数据）
                </p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                清除所有数据
              </label>
              <button
                onClick={handleClearAllData}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                清除所有数据
              </button>
              <p className="text-xs text-red-600 mt-1">
                ⚠️ 此操作不可恢复，将删除所有记录、标签和设置
              </p>
            </div>
          </div>
        </div>

        {/* 应用信息 */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">应用信息</h2>
            </div>
          </div>
          
          <div className="p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">应用名称</span>
              <span className="text-sm font-medium text-gray-900">{appInfo.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">版本</span>
              <span className="text-sm font-medium text-gray-900">{appInfo.version}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">数据记录数</span>
              <span className="text-sm font-medium text-gray-900">{records.length} 条</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">构建日期</span>
              <span className="text-sm font-medium text-gray-900">{appInfo.buildDate}</span>
            </div>
            <div className="pt-3 border-t border-gray-200">
              <p className="text-sm text-gray-600">{appInfo.description}</p>
              <p className="text-xs text-gray-500 mt-2">© 2024 {appInfo.author}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
