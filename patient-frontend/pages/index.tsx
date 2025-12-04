import React from "react";
import { motion } from "framer-motion";
import { Sidebar } from "../components/sidebar";
import { Header } from "../components/header";
import { Dashboard } from "../components/dashboard";
import { OfferingsPage } from "../components/offerings-page";
import { MessengerPage } from "../components/messenger-page";
import { TreatmentsPage } from "../components/treatments-page";
import { AccountPage } from "../components/account-page";
import { BrandingPage } from "../components/branding-page";
import { SupportChat } from "../components/support-chat";
import { SupportBubble } from "../components/support-bubble";
import { Button, Avatar } from "@heroui/react";
import { Icon } from "@iconify/react";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { useAuth } from "../contexts/AuthContext";
import { getAvatarEmoji } from "../lib/avatarUtils";
import { apiCall } from "../lib/api";

function HomePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = React.useState("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isMobileView, setIsMobileView] = React.useState(false);
  const [hasTickets, setHasTickets] = React.useState(false);
  const [checkingTickets, setCheckingTickets] = React.useState(true);
  const [showSuccessToast, setShowSuccessToast] = React.useState(false);

  // Check if user has any tickets
  const checkHasTickets = React.useCallback(async () => {
    const token = localStorage.getItem('auth-token');
    if (!token) return;
    
    try {
      const response = await apiCall('/support/tickets', {
        method: 'GET',
      });

      if (response.success && response.data?.data?.tickets) {
        const ticketCount = response.data.data.tickets.length;
        setHasTickets(ticketCount > 0);
      } else {
        setHasTickets(false);
      }
    } catch (error) {
      console.error('Error checking tickets:', error);
      setHasTickets(false);
    } finally {
      setCheckingTickets(false);
    }
  }, []);

  // Handle ticket creation success
  const handleTicketCreated = React.useCallback(async () => {
    await checkHasTickets();
    setShowSuccessToast(true);
    setActiveTab("support");
    
    // Hide toast after 5 seconds
    setTimeout(() => {
      setShowSuccessToast(false);
    }, 5000);
  }, [checkHasTickets]);

  React.useEffect(() => {
    checkHasTickets();
  }, [checkHasTickets]);

  // Detect mobile view
  React.useEffect(() => {
    const checkIfMobile = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);

    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // Close mobile menu when tab changes
  React.useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [activeTab]);

  return (
    <ProtectedRoute>
      <div className="flex flex-col md:flex-row h-screen bg-background">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between h-16 border-b border-content3 bg-content1 px-4">
          <div className="flex items-center gap-2">
            <Button
              isIconOnly
              variant="light"
              onPress={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <Icon icon={isMobileMenuOpen ? "lucide:x" : "lucide:menu"} className="text-lg" />
            </Button>
            <div className="font-semibold text-lg text-foreground">
              <span className="text-primary">Fuse</span> Health
            </div>
          </div>
          <Avatar
            name={user?.firstName || user?.email || 'User'}
            className="cursor-pointer"
            size="sm"
            fallback={
              <span className="text-xl">{getAvatarEmoji(user)}</span>
            }
          />
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div
            className="md:hidden fixed inset-0 bg-overlay/50 z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar - Hidden on mobile unless menu is open */}
        <div className={`
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0 fixed md:relative z-50 h-full transition-transform duration-300 ease-in-out
          md:h-screen md:flex md:flex-col
        `}>
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user} hasTickets={hasTickets} />
        </div>

        {/* Main Content */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Desktop Header - Hidden on mobile */}
          <div className="hidden md:block">
            <Header />
          </div>

          {/* Content Area */}
          <motion.main
            className="flex-1 overflow-y-auto p-4 md:p-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {activeTab === "dashboard" && <Dashboard />}
            {activeTab === "offerings" && <OfferingsPage />}
            {activeTab === "treatments" && <TreatmentsPage />}
            {activeTab === "messenger" && <MessengerPage isMobileView={isMobileView} />}
            {activeTab === "support" && hasTickets && <SupportChat onTicketCreated={handleTicketCreated} />}
            {activeTab === "branding" && <BrandingPage />}
            {activeTab === "account" && <AccountPage />}
          </motion.main>

          {/* Success Toast */}
          {showSuccessToast && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-20 md:bottom-6 right-6 z-[80] pointer-events-none"
            >
              <div className="bg-success-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 min-w-[320px]">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Icon icon="lucide:check-circle" className="text-2xl" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">Support ticket created!</p>
                  <p className="text-xs opacity-90">We'll get back to you soon via email.</p>
                </div>
                <Button
                  isIconOnly
                  size="sm"
                  variant="light"
                  className="text-white pointer-events-auto"
                  onPress={() => setShowSuccessToast(false)}
                >
                  <Icon icon="lucide:x" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Support Bubble - Show on all pages except support and messenger tabs */}
          {activeTab !== "support" && activeTab !== "messenger" && (
            <SupportBubble onTicketCreated={handleTicketCreated} />
          )}

          {/* Mobile Bottom Navigation */}
          <div className="md:hidden flex items-center justify-around border-t border-content3 bg-content1 h-16">
            {[
              { id: "dashboard", icon: "lucide:layout-dashboard" },
              { id: "treatments", icon: "lucide:pill" },
              { id: "messenger", icon: "lucide:message-square" },
              ...(hasTickets ? [{ id: "support", icon: "lucide:headphones" }] : []),
              { id: "account", icon: "lucide:user" }
            ].map((item) => (
              <Button
                key={item.id}
                isIconOnly
                variant="light"
                className={activeTab === item.id ? "text-primary" : "text-foreground-500"}
                onPress={() => setActiveTab(item.id)}
                aria-label={item.id}
              >
                <Icon icon={item.icon} className="text-xl" />
              </Button>
            ))}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default function Home() {
  return <HomePage />;
}