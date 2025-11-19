import { useState, useEffect, ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

interface ResponsiveLayoutProps {
  children: ReactNode;
  role?: 'teacher' | 'student';
  showSidebar?: boolean;
}

export const ResponsiveLayout = ({ 
  children, 
  role, 
  showSidebar = true 
}: ResponsiveLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      // Auto-close sidebar on mobile when resizing to desktop
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar 
        role={role} 
        onMenuToggle={showSidebar ? toggleSidebar : undefined}
      />

      <div className="flex">
        {/* Sidebar */}
        {showSidebar && (
          <Sidebar 
            role={role} 
            isOpen={isSidebarOpen || !isMobile}
            onClose={closeSidebar}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 w-full lg:w-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
