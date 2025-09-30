import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import Link from "next/link"
import { useRouter } from "next/router"
import { useState } from "react"
import {
  BarChart3,
  Users,
  Stethoscope,
  ShoppingCart,
  Package,
  Gift,
  Network,
  Building2,
  CreditCard,
  Settings,
  ChevronDown,
  LogOut,
  Crown,
  Lock,
} from "lucide-react"

const navigation = [
  { name: "Overview", icon: BarChart3, current: true, href: "/" },
  { name: "Customers", icon: Users, current: false, href: "/customers" },
  { name: "Plans", icon: Crown, current: false, href: "/plans" },
]

const operations = [
  { name: "Treatments", icon: Stethoscope, current: false, href: "/treatments" },
  { name: "Offerings", icon: Gift, current: false, href: "/offerings" },
  { name: "Products", icon: Package, current: false, href: "/products" },
  { name: "Orders", icon: ShoppingCart, current: false, href: "/orders", hasSubmenu: true },
]

const networks = [
  { name: "Provider Networks", icon: Network, current: false },
  { name: "Pharmacies", icon: Building2, current: false },
  { name: "Coupon Codes", icon: Gift, current: false },
  { name: "Payments", icon: CreditCard, current: false },
]

const services: { name: string; icon: any; current: boolean; href?: string; hasSubmenu?: boolean }[] = [
  // Add services here when needed
]

const configuration = [{ name: "Settings", icon: Settings, current: false, href: "/settings" }]

export function Sidebar() {
  const { user, logout, hasActiveSubscription, refreshSubscription } = useAuth()
  const router = useRouter()
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefreshSubscription = async () => {
    if (isRefreshing) return
    setIsRefreshing(true)
    try {
      await refreshSubscription()
    } catch (error) {
      console.error('Error refreshing subscription:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  // Helper function to check if a navigation item should be disabled
  const isItemDisabled = (itemName: string) => {
    // Plans page is always accessible
    if (itemName === 'Plans') return false

    // If no active subscription, disable everything except Plans and Settings
    if (!hasActiveSubscription) {
      return itemName !== 'Settings'
    }

    return false
  }

  // Helper function to handle clicks on disabled items
  const handleDisabledClick = (e: React.MouseEvent, itemName: string) => {
    e.preventDefault()
    if (!hasActiveSubscription && itemName !== 'Plans' && itemName !== 'Settings') {
      // Redirect to plans page
      router.push('/plans?message=Please select a plan to access this feature.')
    }
  }

  // Helper function to render a sidebar item
  const renderSidebarItem = (item: { name: string; icon: any; current: boolean; href?: string; hasSubmenu?: boolean }, _section: string) => {
    const isActive = router.pathname === item.href
    const disabled = isItemDisabled(item.name)
    const isHovered = hoveredItem === item.name

    return (
      <div key={item.name} className="relative">
        {disabled && !hasActiveSubscription ? (
          <div
            className={cn(
              "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all cursor-pointer opacity-60 grayscale",
              isActive
                ? "bg-sidebar-accent/50 text-sidebar-accent-foreground/70"
                : "text-muted-foreground/60 hover:bg-sidebar-accent/30 hover:opacity-70"
            )}
            onClick={(e) => handleDisabledClick(e, item.name)}
            onMouseEnter={() => setHoveredItem(item.name)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <div className="flex items-center">
              <item.icon className="mr-3 h-4 w-4 opacity-50" />
              <span className="opacity-75">{item.name}</span>
            </div>
            <Lock className="ml-auto h-3 w-3 text-muted-foreground/50" />
          </div>
        ) : (
          <Link
            href={item.href || "#"}
            className={cn(
              "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
            onClick={disabled ? (e) => handleDisabledClick(e, item.name) : undefined}
          >
            <div className="flex items-center">
              <item.icon className="mr-3 h-4 w-4" />
              {item.name}
            </div>
            {item.hasSubmenu && <ChevronDown className="ml-auto h-4 w-4" />}
          </Link>
        )}

        {/* Tooltip for disabled items */}
        {disabled && isHovered && !hasActiveSubscription && (
          <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg z-50 whitespace-nowrap">
            Live Plan Required
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="p-6">
        <h1 className="text-xl font-bold text-sidebar-foreground">Fuse</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        {/* Main Navigation */}
        <div className="space-y-1">
          {(hasActiveSubscription ? navigation.filter((item) => item.name !== 'Plans') : navigation).map((item) =>
            renderSidebarItem(item, 'navigation')
          )}
        </div>

        {/* Operations Section */}
        <div className="pt-6">
          <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Operations</h3>
          <div className="space-y-1">
            {operations.map((item) => renderSidebarItem(item, 'operations'))}
          </div>
        </div>

        {/* Services Section */}
        <div className="pt-6">
          <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Services</h3>
          <div className="space-y-1">
            {services.map((item) => renderSidebarItem(item, 'services'))}
          </div>
        </div>

        {/* Networks Section */}
        <div className="pt-6">
          <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Networks</h3>
          <div className="space-y-1">
            {networks.map((item) => renderSidebarItem(item, 'networks'))}
          </div>
        </div>

        {/* Configuration Section */}
        <div className="pt-6">
          <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Configuration
          </h3>
          <div className="space-y-1">
            {configuration.map((item) => renderSidebarItem(item, 'configuration'))}
          </div>
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center justify-between space-x-3">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {user?.name?.charAt(0).toUpperCase() || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user?.name || 'Admin User'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email || 'admin@example.com'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefreshSubscription}
              className="p-1 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent rounded"
              title="Refresh subscription status"
              aria-label="Refresh subscription status"
            >
              <CreditCard className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => logout()}
              className="p-1 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent rounded"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}