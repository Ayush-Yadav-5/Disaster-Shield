import { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { Features } from "./components/Features";
import { CallToAction } from "./components/CallToAction";
import { AlertTicker } from "./components/AlertTicker";
import { Dashboard } from "./components/Dashboard";
import { LiveMap } from "./components/LiveMap";
import { EmergencyReport } from "./components/EmergencyReport";
import { Volunteers } from "./components/Volunteers";
import { Donations } from "./components/Donations";
import { AdminPanel } from "./components/AdminPanel";
import { Footer } from "./components/Footer";
import { Toaster } from "./components/ui/sonner";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { disasterAPI } from "./utils/disaster-api";

// Force a browser refresh to ensure new components are loaded
console.log(
  "Dashboard updated with Admin Panel and comprehensive role-based features",
);

function AppContent() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("home");

  // Cleanup real-time connections on unmount
  useEffect(() => {
    return () => {
      disasterAPI.cleanup();
    };
  }, []);

  const renderContent = () => {
    // If user is not logged in, show landing page for home tab
    if (!user && activeTab === "home") {
      return (
        <div className="min-h-screen">
          <AlertTicker />
          <main>
            <Hero onNavigate={setActiveTab} />
            <Features onNavigate={setActiveTab} />
            <CallToAction onNavigate={setActiveTab} />
          </main>
          <Footer onNavigate={setActiveTab} />
        </div>
      );
    }

    // For logged-in users or other tabs, show the appropriate component
    const content = (() => {
      switch (activeTab) {
        case "home":
          return <Dashboard onNavigate={setActiveTab} />;
        case "live-map":
          return <LiveMap />;
        case "report":
          return <EmergencyReport />;
        case "volunteers":
          return <Volunteers />;
        case "donations":
          return <Donations />;
        case "admin":
          return <AdminPanel />;
        default:
          return user ? (
            <Dashboard onNavigate={setActiveTab} />
          ) : (
            <div className="min-h-screen">
              <AlertTicker />
              <main>
                <Hero onNavigate={setActiveTab} />
                <Features onNavigate={setActiveTab} />
                <CallToAction onNavigate={setActiveTab} />
              </main>
              <Footer onNavigate={setActiveTab} />
            </div>
          );
      }
    })();

    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1">{content}</main>
        <Footer onNavigate={setActiveTab} />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      {renderContent()}
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}