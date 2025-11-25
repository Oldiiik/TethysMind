import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { PortfolioPage } from './pages/PortfolioPage';
import { LibraryPage } from './pages/LibraryPage';
import { AssistantPage } from './pages/AssistantPage';
import { SuperAIPage } from './pages/SuperAIPage';
import { CustomizationPage } from './pages/CustomizationPage';
import { PartnerPanelPage } from './pages/PartnerPanelPage';
import { ProfilePage } from './pages/ProfilePage';
import { SkillsMapPage } from './pages/SkillsMapPage';
import { IcebergPage } from './pages/IcebergPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { LinkStudentPage } from './pages/LinkStudentPage';
import { MarketplacePage } from './pages/MarketplacePage';
import { MarketplaceItemPage } from './pages/MarketplaceItemPage';
import { CreatorDashboardPage } from './pages/CreatorDashboardPage';
import { Toaster } from './components/ui/sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 dark:from-slate-900 dark:via-blue-950 dark:to-slate-900">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

function ParentCheck({ children }: { children: React.ReactNode }) {
  const { user, loading, activeUserId } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 dark:from-slate-900 dark:via-blue-950 dark:to-slate-900">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // If parent without linked student, redirect to link student page
  // Students can access directly
  if (user.role === 'parent' && !activeUserId) {
    return <Navigate to="/link-student" replace />;
  }
  
  return <>{children}</>;
}

function AppContent() {
  return (
    <div className="min-h-screen flex flex-col">
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Skills Map - Full Screen (no navbar/footer) */}
        <Route path="/skills-map" element={
          <ProtectedRoute>
            <SkillsMapPage />
          </ProtectedRoute>
        } />
        
        {/* Protected Routes - With Navbar/Footer */}
        <Route path="*" element={
          <ProtectedRoute>
            <>
              <Navbar />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/link-student" element={<LinkStudentPage />} />
                  <Route path="/portfolio" element={
                    <ParentCheck>
                      <PortfolioPage />
                    </ParentCheck>
                  } />
                  <Route path="/library" element={
                    <ParentCheck>
                      <LibraryPage />
                    </ParentCheck>
                  } />
                  <Route path="/assistant" element={
                    <ParentCheck>
                      <AssistantPage />
                    </ParentCheck>
                  } />
                  <Route path="/super-ai" element={
                    <ParentCheck>
                      <SuperAIPage />
                    </ParentCheck>
                  } />
                  <Route path="/iceberg" element={
                    <ParentCheck>
                      <IcebergPage />
                    </ParentCheck>
                  } />
                  <Route path="/leaderboard" element={<LeaderboardPage />} />
                  <Route path="/customization" element={<CustomizationPage />} />
                  <Route path="/partner-panel" element={<PartnerPanelPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/marketplace" element={<MarketplacePage />} />
                  <Route path="/marketplace/:id" element={<MarketplaceItemPage />} />
                  <Route path="/creator-dashboard" element={<CreatorDashboardPage />} />
                </Routes>
              </main>
              <Footer />
            </>
          </ProtectedRoute>
        } />
      </Routes>
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}