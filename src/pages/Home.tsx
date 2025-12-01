import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Container, Header, LoadingSpinner, EmptyState } from '@/components/Layout';
import { RecordList } from '@/components/RecordCard';
import { FilterBar } from '@/components/FilterBar';
import { DailyTip } from '@/components/DailyTip';
import { useStore, useFilteredRecords } from '@/store';
import { dailyTipService } from '@/services/daily';
import { Plus, Search, Filter } from 'lucide-react';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { 
    loadData, 
    isLoading, 
    searchQuery, 
    setSearchQuery,
    clearFilters,
    deleteRecord 
  } = useStore();
  
  const filteredRecords = useFilteredRecords();
  const [showFilters, setShowFilters] = useState(false);
  const [dailyTip, setDailyTip] = useState('');

  useEffect(() => {
    loadData();
    setDailyTip(dailyTipService.getTipOfTheDay());
  }, [loadData]);

  const handleDeleteRecord = async (id: string) => {
    await deleteRecord(id);
  };

  const handleEditRecord = (id: string) => {
    navigate(`/edit/${id}`);
  };

  if (isLoading) {
    return (
      <Layout>
        <Container>
          <LoadingSpinner size="lg" className="mt-20" />
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container>
        {/* Header */}
        <Header 
          title="树洞空间" 
          subtitle="记录生活，珍藏心情"
          actions={
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/search')}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 md:hidden"
              >
                <Search className="h-5 w-5" />
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Filter className="h-4 w-4" />
                筛选
              </button>
              <button
                onClick={() => navigate('/new')}
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
              >
                <Plus className="h-4 w-4" />
                新建
              </button>
            </div>
          }
        />

        {/* Daily Tip */}
        <DailyTip tip={dailyTip} className="mb-6" />

        {/* Search Bar (Desktop) */}
        <div className="hidden md:block mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索记录..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mb-6">
            <FilterBar onClear={clearFilters} />
          </div>
        )}

        {/* Records List */}
        <RecordList
          records={filteredRecords}
          onDelete={handleDeleteRecord}
          onEdit={handleEditRecord}
        />

        {/* Mobile New Record Button */}
        <div className="md:hidden fixed bottom-20 right-4">
          <button
            onClick={() => navigate('/new')}
            className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center"
          >
            <Plus className="h-6 w-6" />
          </button>
        </div>
      </Container>
    </Layout>
  );
};