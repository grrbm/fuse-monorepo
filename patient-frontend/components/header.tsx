import React from "react";
import { Avatar, Badge, Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { getAvatarEmoji } from "../lib/avatarUtils";

export const Header: React.FC = () => {
  const { user, signOut } = useAuth();

  return (
    <motion.header 
      className="h-16 border-b border-content3 bg-content1 flex items-center justify-between px-6"
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Welcome Message */}
      <div className="flex items-center gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}
          </h2>
          <p className="text-sm text-foreground-600 capitalize">
            {user?.role || 'User'} Dashboard
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <Badge content="3" color="primary" placement="top-right">
          <Button
            isIconOnly
            variant="light"
            aria-label="Notifications"
            className="text-foreground-500"
          >
            <Icon icon="lucide:bell" className="text-lg" />
          </Button>
        </Badge>
        
        {/* User Profile Dropdown */}
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <Avatar
              name={user?.firstName || user?.email || 'User'}
              className="cursor-pointer transition-transform hover:scale-105"
              size="sm"
              fallback={
                <span className="text-2xl">{getAvatarEmoji(user)}</span>
              }
            />
          </DropdownTrigger>
          <DropdownMenu aria-label="Profile Actions" variant="flat">
            <DropdownItem key="profile" className="h-14 gap-2">
              <p className="font-semibold">Signed in as</p>
              <p className="font-semibold">{user?.email}</p>
            </DropdownItem>
            <DropdownItem key="settings" startContent={<Icon icon="lucide:settings" />}>
              Settings
            </DropdownItem>
            <DropdownItem key="help" startContent={<Icon icon="lucide:help-circle" />}>
              Help & Support
            </DropdownItem>
            <DropdownItem 
              key="logout" 
              color="danger" 
              startContent={<Icon icon="lucide:log-out" />}
              onPress={signOut}
            >
              Sign Out
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>
    </motion.header>
  );
};