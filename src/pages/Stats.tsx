import React, { useMemo, useState } from 'react';
import { useStore } from '../store';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { MOOD_CONFIG } from '../utils';
import { WeatherType } from '@/types';
import { TrendingUp, Calendar, Heart, Cloud, MapPin, Tag } from 'lucide-react';

interface MoodStats {
  mood: string;
  count: number;
  percentage: number;
  color: string;
}

interface DailyStats {
  date: string;
  count: number;
  mood: string;
}

export default function Stats() {
  const { records } = useStore();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('week');

  const filteredRecords = useMemo(() => {
    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case 'week':
        startDate = startOfWeek(now, { weekStartsOn: 1 });
        break;
      case 'month':
        startDate = startOfMonth(now);
        break;
      case 'all':
        return records;
      default:
        startDate = startOfWeek(now, { weekStartsOn: 1 });
    }

    return records.filter(record => new Date(record.createdAt) >= startDate);
  }, [records, timeRange]);

  const moodStats = useMemo(() => {
    const moodCounts: Record<string, number> = {};
    filteredRecords.forEach(record => {
      moodCounts[record.mood] = (moodCounts[record.mood] || 0) + 1;
    });

    const total = filteredRecords.length;
    return Object.entries(moodCounts).map(([mood, count]) => ({
      mood,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      color: MOOD_CONFIG[mood as keyof typeof MOOD_CONFIG]?.color || '#9CA3AF'
    }));
  }, [filteredRecords]);

  const dailyStats = useMemo(() => {
    const dailyCounts: Record<string, { count: number; moods: string[] }> = {};
    
    filteredRecords.forEach(record => {
      const date = format(new Date(record.createdAt), 'yyyy-MM-dd');
      if (!dailyCounts[date]) {
        dailyCounts[date] = { count: 0, moods: [] };
      }
      dailyCounts[date].count++;
      dailyCounts[date].moods.push(record.mood);
    });

    return Object.entries(dailyCounts).map(([date, data]) => {
      const moodCounts: Record<string, number> = {};
      data.moods.forEach(mood => {
        moodCounts[mood] = (moodCounts[mood] || 0) + 1;
      });
      const dominantMood = Object.entries(moodCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || 'neutral';
      
      return {
        date,
        count: data.count,
        mood: dominantMood
      };
    }).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredRecords]);

  const weatherStats = useMemo(() => {
    const weatherCounts: Record<WeatherType, number> = {
      sunny: 0, cloudy: 0, rainy: 0, snowy: 0, windy: 0, foggy: 0
    };
    
    filteredRecords.forEach(record => {
      if (record.weather) {
        weatherCounts[record.weather]++;
      }
    });

    return Object.entries(weatherCounts).map(([weather, count]) => ({
      weather: weather as WeatherType,
      count,
      percentage: filteredRecords.length > 0 ? Math.round((count / filteredRecords.length) * 100) : 0
    }));
  }, [filteredRecords]);

  const tagStats = useMemo(() => {
    const tagCounts: Record<string, number> = {};
    filteredRecords.forEach(record => {
      record.tags?.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    return Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [filteredRecords]);

  const totalRecords = filteredRecords.length;
  const mostUsedMood = moodStats.sort((a, b) => b.count - a.count)[0];
  const averageMoodScore = useMemo(() => {
    const moodScores: Record<string, number> = {
      happy: 5, relaxed: 4, neutral: 3, sad: 2, angry: 1
    };
    
    const totalScore = filteredRecords.reduce((sum, record) => {
      return sum + (moodScores[record.mood] || 3);
    }, 0);
    
    return totalRecords > 0 ? (totalScore / totalRecords).toFixed(1) : '0';
  }, [filteredRecords, totalRecords]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">数据统计</h1>
          
          <div className="flex flex-wrap gap-2">
            {(['week', 'month', 'all'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {range === 'week' ? '本周' : range === 'month' ? '本月' : '全部'}
              </button>
            ))}
          </div>
        </div>

        {/* 概览统计 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold text-gray-900">{totalRecords}</span>
            </div>
            <p className="text-sm text-gray-600">总记录数</p>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Heart className="h-5 w-5 text-red-500" />
              <span className="text-2xl font-bold text-gray-900">{averageMoodScore}</span>
            </div>
            <p className="text-sm text-gray-600">平均心情指数</p>
          </div>

          {mostUsedMood && (
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <div className="flex items-center gap-2">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: mostUsedMood.color }}
                  />
                  <span className="text-lg font-bold text-gray-900">{mostUsedMood.percentage}%</span>
                </div>
              </div>
              <p className="text-sm text-gray-600">最常心情: {MOOD_CONFIG[mostUsedMood.mood as keyof typeof MOOD_CONFIG]?.label}</p>
            </div>
          )}

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Tag className="h-5 w-5 text-purple-500" />
              <span className="text-2xl font-bold text-gray-900">{tagStats.length}</span>
            </div>
            <p className="text-sm text-gray-600">活跃标签</p>
          </div>
        </div>

        {/* 心情分布 */}
        <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">心情分布</h2>
          <div className="space-y-3">
            {moodStats.map((stat) => (
              <div key={stat.mood} className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: stat.color }}
                />
                <span className="text-sm font-medium text-gray-700 w-16">
                  {MOOD_CONFIG[stat.mood as keyof typeof MOOD_CONFIG]?.label}
                </span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-300"
                    style={{ 
                      backgroundColor: stat.color,
                      width: `${stat.percentage}%`
                    }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">
                  {stat.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 每日记录趋势 */}
        <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">每日记录趋势</h2>
          <div className="grid grid-cols-7 md:grid-cols-14 gap-1">
            {dailyStats.slice(-14).map((day) => {
              const date = new Date(day.date);
              const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
              
              return (
                <div key={day.date} className="text-center">
                  <div 
                    className={`w-full h-8 rounded flex items-center justify-center text-xs font-medium transition-colors ${
                      day.count > 0
                        ? `text-white ${
                            day.count >= 3 ? 'bg-blue-600' :
                            day.count === 2 ? 'bg-blue-500' : 'bg-blue-400'
                          }`
                        : 'bg-gray-100 text-gray-400'
                    } ${isToday ? 'ring-2 ring-blue-300' : ''}`}
                    title={`${format(date, 'MM月dd日', { locale: zhCN })}: ${day.count}条记录`}
                  >
                    {day.count || ''}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {format(date, 'MM/dd')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 天气分布 */}
        <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            天气分布
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {weatherStats.map((stat) => (
              <div key={stat.weather} className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl mb-1">
                  {stat.weather === 'sunny' && '☀️'}
                  {stat.weather === 'cloudy' && '☁️'}
                  {stat.weather === 'rainy' && '🌧️'}
                  {stat.weather === 'snowy' && '❄️'}
                  {stat.weather === 'windy' && '💨'}
                  {stat.weather === 'foggy' && '🌫️'}
                </div>
                <div className="text-sm font-medium text-gray-700">
                  {stat.count}次 ({stat.percentage}%)
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 热门标签 */}
        {tagStats.length > 0 && (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Tag className="h-5 w-5" />
              热门标签
            </h2>
            <div className="flex flex-wrap gap-2">
              {tagStats.map((stat) => (
                <span
                  key={stat.tag}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                >
                  {stat.tag} ({stat.count})
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
