import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Container, Header } from '@/components/Layout';
import { RecordList } from '@/components/RecordCard';
import { useStore, useFilteredRecords } from '@/store';
import { Search as SearchIcon, X, Filter, Calendar, TrendingUp } from 'lucide-react';
import { cn, debounce, MOOD_CONFIG, WEATHER_CONFIG } from '@/utils';

export default function Search() {
  const navigate = useNavigate();
  const { 
    searchQuery, 
    setSearchQuery, 
    clearFilters,
    selectedCategory,
    selectedMood,
    selectedWeather,
    dateRange,
    records,
    setSelectedCategory,
    setSelectedMood,
    setSelectedWeather,
    setDateRange,
  } = useStore();
  
  const filteredRecords = useFilteredRecords();
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [showFilters, setShowFilters] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recent_searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Debounced search update
  const debouncedSearch = debounce((query: string) => {
    setSearchQuery(query);
    
    // Add to recent searches if query is not empty
    if (query.trim()) {
      const updated = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('recent_searches', JSON.stringify(updated));
    }
  }, 300);

  const handleQueryChange = (query: string) => {
    setLocalQuery(query);
    debouncedSearch(query);
  };

  const clearSearch = () => {
    setLocalQuery('');
    setSearchQuery('');
  };

  const handleRecentSearch = (query: string) => {
    setLocalQuery(query);
    setSearchQuery(query);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recent_searches');
  };

  const hasActiveFilters = 
    selectedCategory || 
    selectedMood || 
    selectedWeather || 
    dateRange.start || 
    dateRange.end;

  const showRecentSearches = !localQuery && recentSearches.length > 0;
  const showResults = localQuery || hasActiveFilters;

  return (
    <Layout>
      <Container>
        <Header 
          title="搜索记录" 
          subtitle="通过关键词、心情、天气等条件查找记录"
          actions={
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              返回
            </button>
          }
        />

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              placeholder="搜索记录内容、标题或标签..."
              value={localQuery}
              onChange={(e) => handleQueryChange(e.target.value)}
              className="w-full pl-12 pr-12 py-4 text-lg border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {localQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
                hasActiveFilters
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200"
                  : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              )}
            >
              <Filter className="h-4 w-4" />
              筛选
              {hasActiveFilters && (
                <span className="ml-1 px-2 py-0.5 bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-full text-xs">
                  已启用
                </span>
              )}
            </button>
            
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                清除筛选
              </button>
            )}
          </div>

          {showResults && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              找到 {filteredRecords.length} 条记录
            </p>
          )}
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    分类
                  </label>
                  <select
                    value={selectedCategory || ''}
                    onChange={(e) => setSelectedCategory(e.target.value || null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                    <option value="">全部分类</option>
                    {useStore.getState().categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Mood Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    心情
                  </label>
                  <select
                    value={selectedMood || ''}
                    onChange={(e) => setSelectedMood((e.target.value as any) || null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                    <option value="">全部心情</option>
                    {(Object.keys(MOOD_CONFIG) as (keyof typeof MOOD_CONFIG)[]).map((mood) => {
                      const config = MOOD_CONFIG[mood];
                      return (
                        <option key={mood} value={mood}>
                          {config.emoji} {config.label}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Weather Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    天气
                  </label>
                  <select
                    value={selectedWeather || ''}
                    onChange={(e) => setSelectedWeather((e.target.value as any) || null)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                    <option value="">全部天气</option>
                    {(Object.keys(WEATHER_CONFIG) as (keyof typeof WEATHER_CONFIG)[]).map((weather) => {
                      const config = WEATHER_CONFIG[weather];
                      return (
                        <option key={weather} value={weather}>
                          {config.icon} {config.label}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Date Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    时间范围
                  </label>
                  <div className="space-y-2">
                    <input
                      type="date"
                      value={dateRange.start ? dateRange.start.toISOString().split('T')[0] : ''}
                      onChange={(e) => setDateRange(
                        e.target.value ? new Date(e.target.value) : null,
                        dateRange.end
                      )}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      placeholder="开始日期"
                    />
                    <input
                      type="date"
                      value={dateRange.end ? dateRange.end.toISOString().split('T')[0] : ''}
                      onChange={(e) => setDateRange(
                        dateRange.start,
                        e.target.value ? new Date(e.target.value) : null
                      )}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      placeholder="结束日期"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Searches */}
        {showRecentSearches && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                最近搜索
              </h3>
              <button
                onClick={clearRecentSearches}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                清除
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleRecentSearch(search)}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {search}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search Results */}
        {showResults ? (
          <RecordList records={filteredRecords} />
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <SearchIcon className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              开始搜索
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              输入关键词或使用筛选条件来查找你的记录
            </p>
          </div>
        )}
      </Container>
    </Layout>
  );
}
