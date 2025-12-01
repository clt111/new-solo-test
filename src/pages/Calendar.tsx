import React, { useState, useMemo } from 'react';
import { useStore } from '../store';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { MOOD_CONFIG } from '../utils';
import { ChevronLeft, ChevronRight, Calendar, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Record as RecordItem } from '@/types';

export default function CalendarPage() {
  const { records } = useStore();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());

  const recordsByDate = useMemo(() => {
    const grouped: { [key: string]: RecordItem[] } = {};
    records.forEach(record => {
      const dateKey = format(new Date(record.createdAt), 'yyyy-MM-dd');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(record);
    });
    return grouped;
  }, [records]);

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const weekDays = ['一', '二', '三', '四', '五', '六', '日'];

  const getDayRecords = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return recordsByDate[dateKey] || [];
  };

  const getDominantMood = (records: RecordItem[]) => {
    if (records.length === 0) return null;
    const moodCounts: { [key: string]: number } = {};
    records.forEach(record => {
      moodCounts[record.mood] = (moodCounts[record.mood] || 0) + 1;
    });
    return Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0][0];
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const goToPreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleDayClick = (date: Date) => {
    const dayRecords = getDayRecords(date);
    if (dayRecords.length > 0) {
      const firstRecord = dayRecords[0];
      navigate(`/detail/${firstRecord.id}`);
    }
  };

  const handleNewRecord = () => {
    navigate('/new');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* 日历头部 */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold text-gray-900">日历</h1>
              <button
                onClick={handleNewRecord}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Plus className="h-4 w-4" />
                新记录
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={goToPreviousMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="h-5 w-5 text-gray-600" />
                </button>
                <h2 className="text-lg font-semibold text-gray-900">
                  {format(currentDate, 'yyyy年MM月', { locale: zhCN })}
                </h2>
                <button
                  onClick={goToNextMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="h-5 w-5 text-gray-600" />
                </button>
              </div>
              
              <button
                onClick={goToToday}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                今天
              </button>
            </div>
          </div>

          {/* 星期标题 */}
          <div className="grid grid-cols-7 border-b border-gray-200">
            {weekDays.map((day) => (
              <div key={day} className="p-3 text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>

          {/* 日历网格 */}
          <div className="grid grid-cols-7">
            {calendarDays.map((date, index) => {
              const dayRecords = getDayRecords(date);
              const dominantMood = getDominantMood(dayRecords);
              const isToday = isSameDay(date, new Date());
              const isCurrentMonth = isSameMonth(date, currentDate);
              const hasRecords = dayRecords.length > 0;

              return (
                <div
                  key={index}
                  onClick={() => handleDayClick(date)}
                  className={`
                    min-h-[80px] p-2 border-r border-b border-gray-100 cursor-pointer transition-colors
                    ${!isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white text-gray-900'}
                    ${hasRecords ? 'hover:bg-blue-50' : 'hover:bg-gray-50'}
                    ${isToday ? 'ring-2 ring-blue-500 ring-inset' : ''}
                    ${index % 7 === 6 ? 'border-r-0' : ''}
                  `}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-sm font-medium ${
                      isToday ? 'text-blue-600' : ''
                    }`}>
                      {format(date, 'd')}
                    </span>
                    {hasRecords && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">
                        {dayRecords.length}
                      </span>
                    )}
                  </div>

                  {dominantMood && (
                    <div className="flex items-center justify-center mt-1">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{
                          backgroundColor: MOOD_CONFIG[dominantMood as keyof typeof MOOD_CONFIG]?.color || '#9CA3AF'
                        }}
                        title={MOOD_CONFIG[dominantMood as keyof typeof MOOD_CONFIG]?.label}
                      >
                        {MOOD_CONFIG[dominantMood as keyof typeof MOOD_CONFIG]?.emoji}
                      </div>
                    </div>
                  )}

                  {dayRecords.length > 1 && (
                    <div className="flex justify-center mt-1">
                      <div className="flex -space-x-1">
                        {dayRecords.slice(0, 3).map((record, i) => (
                          <div
                            key={record.id}
                            className="w-2 h-2 rounded-full bg-blue-400 border border-white"
                            style={{ zIndex: 3 - i }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 今日记录 */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              {format(new Date(), '今天 (MM月dd日)', { locale: zhCN })}
            </h3>
          </div>
          
          <div className="p-4">
            {(() => {
              const todayRecords = getDayRecords(new Date());
              if (todayRecords.length === 0) {
                return (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 mb-4">今天还没有记录</p>
                    <button
                      onClick={handleNewRecord}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      写下今天的心情
                    </button>
                  </div>
                );
              }

              return (
                <div className="space-y-3">
                  {todayRecords.map((record) => (
                    <div
                      key={record.id}
                      onClick={() => navigate(`/detail/${record.id}`)}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
                        style={{
                          backgroundColor: MOOD_CONFIG[record.mood as keyof typeof MOOD_CONFIG]?.color || '#9CA3AF'
                        }}
                      >
                        {MOOD_CONFIG[record.mood as keyof typeof MOOD_CONFIG]?.emoji}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-gray-900">
                            {MOOD_CONFIG[record.mood as keyof typeof MOOD_CONFIG]?.label}
                          </span>
                          {record.weather && (
                            <span className="text-xs text-gray-500">
                              {record.weather === 'sunny' && '☀️'}
                              {record.weather === 'cloudy' && '☁️'}
                              {record.weather === 'rainy' && '🌧️'}
                              {record.weather === 'snowy' && '❄️'}
                              {record.weather === 'windy' && '💨'}
                              {record.weather === 'foggy' && '🌫️'}
                            </span>
                          )}
                        </div>
                        
                        {record.content && (
                          <p className="text-sm text-gray-600 truncate">
                            {record.content}
                          </p>
                        )}
                        
                        {record.tags && record.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {record.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        {format(new Date(record.createdAt), 'HH:mm')}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
