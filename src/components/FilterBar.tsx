import React from 'react';
import { useStore } from '@/store';
import { cn, MOOD_CONFIG, WEATHER_CONFIG } from '@/utils';
import { Calendar, X, Tag, Cloud, Heart } from 'lucide-react';

interface FilterBarProps {
  onClear: () => void;
  className?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({ onClear, className }) => {
  const {
    selectedCategory,
    setSelectedCategory,
    selectedMood,
    setSelectedMood,
    selectedWeather,
    setSelectedWeather,
    dateRange,
    setDateRange,
    categories,
  } = useStore();

  const hasActiveFilters = 
    selectedCategory || 
    selectedMood || 
    selectedWeather || 
    dateRange.start || 
    dateRange.end;

  return (
    <div className={cn("bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">筛选条件</h3>
        {hasActiveFilters && (
          <button
            onClick={onClear}
            className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <X className="h-3 w-3" />
            清除
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            分类
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(
                  selectedCategory === category.id ? null : category.id
                )}
                className={cn(
                  "px-3 py-1 rounded-full text-sm font-medium transition-colors",
                  "flex items-center gap-2",
                  selectedCategory === category.id
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                )}
              >
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: category.color }}
                />
                {category.name}
                <span className="text-xs opacity-60">({category.recordCount})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Mood Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            心情
          </label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(MOOD_CONFIG).map(([mood, config]) => (
              <button
                key={mood}
                onClick={() => setSelectedMood(
                  selectedMood === mood ? null : mood as any
                )}
                className={cn(
                  "px-3 py-1 rounded-full text-sm font-medium transition-colors",
                  "flex items-center gap-2",
                  selectedMood === mood
                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                    : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                )}
              >
                <span>{config.emoji}</span>
                {config.label}
              </button>
            ))}
          </div>
        </div>

        {/* Weather Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            天气
          </label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(WEATHER_CONFIG).map(([weather, config]) => (
              <button
                key={weather}
                onClick={() => setSelectedWeather(
                  selectedWeather === weather ? null : weather as any
                )}
                className={cn(
                  "px-3 py-1 rounded-full text-sm font-medium transition-colors",
                  "flex items-center gap-2",
                  selectedWeather === weather
                    ? "bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200"
                    : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                )}
              >
                <span>{config.icon}</span>
                {config.label}
              </button>
            ))}
          </div>
        </div>

        {/* Date Range Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            时间范围
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                开始日期
              </label>
              <input
                type="date"
                value={dateRange.start ? dateRange.start.toISOString().split('T')[0] : ''}
                onChange={(e) => setDateRange(
                  e.target.value ? new Date(e.target.value) : null,
                  dateRange.end
                )}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                结束日期
              </label>
              <input
                type="date"
                value={dateRange.end ? dateRange.end.toISOString().split('T')[0] : ''}
                onChange={(e) => setDateRange(
                  dateRange.start,
                  e.target.value ? new Date(e.target.value) : null
                )}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
            </div>
          </div>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              当前筛选条件：
              {selectedCategory && (
                <span className="inline-flex items-center gap-1 ml-2 px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs">
                  分类
                </span>
              )}
              {selectedMood && (
                <span className="inline-flex items-center gap-1 ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-full text-xs">
                  心情
                </span>
              )}
              {selectedWeather && (
                <span className="inline-flex items-center gap-1 ml-2 px-2 py-1 bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200 rounded-full text-xs">
                  天气
                </span>
              )}
              {(dateRange.start || dateRange.end) && (
                <span className="inline-flex items-center gap-1 ml-2 px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-xs">
                  时间
                </span>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};