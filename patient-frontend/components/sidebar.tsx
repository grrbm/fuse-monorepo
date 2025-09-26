import React from "react";
import { Button, Avatar, Badge } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { apiCall } from "../lib/api";

interface User {
  id: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin';
  firstName?: string;
  lastName?: string;
  clinicId?: string;
}

interface Clinic {
  id: string;
  name: string;
  slug: string;
  logo: string;
}

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user?: User | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, user }) => {
  const [clinic, setClinic] = React.useState<Clinic | null>(null);
  const [loadingClinic, setLoadingClinic] = React.useState(false);
  const [loadingLogo, setLoadingLogo] = React.useState(false);

  // Function to preload logo image
  const preloadLogoImage = (logoUrl: string): Promise<void> => {
    return new Promise((resolve) => {
      if (!logoUrl) {
        resolve(); // No logo to load
        return;
      }

      const img = new Image();
      img.onload = () => {
        console.log('✅ Sidebar logo image loaded successfully:', logoUrl);
        resolve();
      };
      img.onerror = () => {
        console.log('⚠️ Sidebar logo image failed to load:', logoUrl);
        resolve(); // Still resolve so UI doesn't hang
      };
      img.src = logoUrl;
    });
  };

  // Load clinic data if user has a clinicId
  React.useEffect(() => {
    const loadClinicData = async () => {
      console.log('🔍 Sidebar - User object:', user);
      console.log('🔍 Sidebar - User clinicId:', user?.clinicId);

      if (!user?.clinicId) {
        console.log('❌ Sidebar - No clinicId found, showing default branding');
        setClinic(null);
        return;
      }

      setLoadingClinic(true);
      try {
        console.log('🏥 Loading clinic data for clinicId:', user.clinicId);
        const result = await apiCall(`/clinic/${user.clinicId}`);
        if (result.success && result.data && result.data.data) {
          const clinicData = result.data.data as Clinic;
          console.log('✅ Loaded clinic data for sidebar:', clinicData);

          // Preload logo image before showing final UI
          if (clinicData.logo) {
            setLoadingLogo(true);
            console.log('🖼️ Sidebar - Starting logo preload...');
            await preloadLogoImage(clinicData.logo);
            setLoadingLogo(false);
          }

          setClinic(clinicData);
        } else {
          console.error('❌ Failed to load clinic data for sidebar:', result);
          setClinic(null);
        }
      } catch (error) {
        console.error('❌ Error loading clinic data for sidebar:', error);
        setClinic(null);
      } finally {
        setLoadingClinic(false);
      }
    };

    loadClinicData();
  }, [user?.clinicId]);

  const baseNavItems = [
    { id: "dashboard", label: "Dashboard", icon: "lucide:layout-dashboard" },
    { id: "treatments", label: "Treatments", icon: "lucide:pill" },
    { id: "messenger", label: "Messenger", icon: "lucide:message-square" },
    { id: "account", label: "Account", icon: "lucide:user" },
  ];

  // Add Branding item for doctors
  const navItems = user?.role === 'doctor'
    ? [
      ...baseNavItems.slice(0, 3), // dashboard, treatments, messenger
      { id: "branding", label: "Branding", icon: "lucide:palette" },
      ...baseNavItems.slice(3), // account
    ]
    : baseNavItems;

  return (
    <motion.div
      className="w-56 bg-content1 border-r border-content3 flex flex-col h-full"
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Logo */}
      <div className="p-4 border-b border-content3">
        <div className="flex items-center gap-3">
          {loadingClinic || loadingLogo ? (
            // Loading state (including logo loading)
            <div className="flex items-center gap-3 animate-pulse">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="h-5 bg-gray-200 rounded w-24"></div>
            </div>
          ) : clinic ? (
            // Clinic branding
            <>
              <Avatar
                src={clinic.logo || undefined}
                icon={!clinic.logo ? <Icon icon="lucide:building" className="text-lg" /> : undefined}
                className="w-8 h-8"
                classNames={{
                  base: clinic.logo ? "" : "bg-primary-100",
                  icon: "text-primary-600"
                }}
              />
              <div className="font-semibold text-lg text-foreground">
                {clinic.name}
              </div>
            </>
          ) : (
            // Default branding
            <div className="font-semibold text-lg text-foreground">
              <span className="text-primary">Fuse</span> Health
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.id}>
              <Button
                variant="flat"
                color={activeTab === item.id ? "primary" : "default"}
                className={`w-full justify-start ${activeTab === item.id ? "bg-primary-50" : "bg-transparent"
                  } transition-all duration-200`}
                startContent={
                  <Icon
                    icon={item.icon}
                    className={`text-lg ${activeTab === item.id ? "text-primary" : "text-foreground-500"
                      }`}
                  />
                }
                onPress={() => setActiveTab(item.id)}
              >
                <span className={activeTab === item.id ? "font-medium" : ""}>
                  {item.label}
                </span>
              </Button>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Profile - Added at bottom */}
      <div className="mt-auto p-3 border-t border-content3">
        <div className="flex items-center gap-3 py-2">
          <Avatar
            src="https://img.heroui.chat/image/avatar?w=200&h=200&u=1"
            size="sm"
          />
          <div className="flex-1">
            <p className="font-medium text-sm">
              {user?.firstName && user?.lastName
                ? `${user.firstName} ${user.lastName}`
                : user?.email || "User"
              }
            </p>
            <p className="text-xs text-foreground-500 capitalize">
              {user?.role || "User"}
            </p>
          </div>
          <Badge content="3" color="primary" size="sm" placement="top-right">
            <Button isIconOnly variant="light" size="sm">
              <Icon icon="lucide:bell" className="text-foreground-500" width={18} height={18} />
            </Button>
          </Badge>
        </div>
      </div>

      {/* Help Button - Moved above user profile */}
      <div className="p-3 border-t border-content3">
        <Button
          variant="flat"
          color="default"
          className="w-full justify-start"
          startContent={<Icon icon="lucide:help-circle" className="text-lg text-foreground-500" />}
        >
          Help
        </Button>
      </div>
    </motion.div>
  );
};