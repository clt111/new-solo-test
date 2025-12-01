import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navigation } from '@/components/Navigation';
import { Home } from '@/pages/Home';
import { NewRecord } from '@/pages/NewRecord';
import { Detail } from '@/pages/Detail';
import Search from '@/pages/Search';
import Stats from '@/pages/Stats';
import Calendar from '@/pages/Calendar';
import Tags from '@/pages/Tags';
import Settings from '@/pages/Settings';
import { useStore } from '@/store';

function App() {
  const { loadData } = useStore();

  useEffect(() => {
    // Initialize app data
    loadData();
  }, [loadData]);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
        <Navigation />
        <main className="pb-20 md:pb-0">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/new" element={<NewRecord />} />
            <Route path="/edit/:id" element={<NewRecord />} />
            <Route path="/detail/:id" element={<Detail />} />
            <Route path="/search" element={<Search />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/tags" element={<Tags />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;