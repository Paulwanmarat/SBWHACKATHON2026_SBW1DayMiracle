import { Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Footer from './components/Footer';
import CommandPalette from './components/CommandPalette';
import { ToastProvider } from './components/ToastProvider';
import DashboardPage from './pages/DashboardPage';
import AssessmentPage from './pages/AssessmentPage';
import StudentsPage from './pages/StudentsPage';
import StudentProfilePage from './pages/StudentProfilePage';
import LearningGapsPage from './pages/LearningGapsPage';
import InterventionsPage from './pages/InterventionsPage';
import PostTestPage from './pages/PostTestPage';
import ReportPage from './pages/ReportPage';
import ReportsListPage from './pages/ReportsListPage';
import StudentLearningPage from './pages/StudentLearningPage';
import AboutPage from './pages/AboutPage';
import { api } from './api/client';

export default function App() {
  const [isDemo, setIsDemo] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);

  useEffect(() => {
    api.getDashboard().then((data) => {
      if (data.is_demo) setIsDemo(true);
    }).catch(() => {});
  }, []);

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col relative selection:bg-blue-600 selection:text-white">
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        {sidebarOpen && (
          <div
            className="sidebar-overlay lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Fixed Top Header (60px high) */}
        <TopBar
          isDemo={isDemo}
          onMenuClick={() => setSidebarOpen(true)}
          onOpenCommandPalette={() => setCmdOpen(true)}
        />
        
        {/* Command Palette Search Modal */}
        <CommandPalette isOpen={cmdOpen} onClose={() => setCmdOpen(false)} />

        {/* Main Content Area - Centered Layout Shell */}
        <div className="flex-1 flex flex-col items-center justify-start desktop-main-wrapper w-full">
          <main className="flex-1 px-4 sm:px-6 lg:px-8 max-w-5xl w-full mx-auto pb-16">
            <Routes>
              <Route path="/" element={<DashboardPage onDataLoaded={(demo) => setIsDemo(demo)} />} />
              <Route path="/assessment" element={<AssessmentPage onDataLoaded={(demo) => setIsDemo(demo)} />} />
              <Route path="/students" element={<StudentsPage />} />
              <Route path="/students/:studentId" element={<StudentProfilePage />} />
              <Route path="/learning-gaps" element={<LearningGapsPage />} />
              <Route path="/interventions" element={<InterventionsPage />} />
              <Route path="/post-test" element={<PostTestPage />} />
              <Route path="/reports" element={<ReportsListPage />} />
              <Route path="/reports/:studentId" element={<ReportPage />} />
              <Route path="/learn/:studentId" element={<StudentLearningPage />} />
              <Route path="/about" element={<AboutPage />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </div>
    </ToastProvider>
  );
}
