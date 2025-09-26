import { cn } from "@/lib/utils"
import { useRouter } from "next/router"
import { useAuth } from "@/contexts/AuthContext"
import {
  BarChart3,
  FileText,
  LogOut,
  Building2,
} from "lucide-react"

const navigation = [
  { name: "Overview", icon: BarChart3, href: "/" },
  { name: "Forms", icon: FileText, href: "/forms" },
]

export function Sidebar() {
  const router = useRouter()
  const { user, logout } = useAuth()
  
  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Building2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-sidebar-foreground">Tenant Portal</h1>
            <p className="text-sm text-muted-foreground">Clinic Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        {/* Main Navigation */}
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = router.pathname === item.href
            return (
              <a
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <item.icon className="mr-3 h-4 w-4" />
                {item.name}
              </a>
            )
          })}
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center justify-between space-x-3">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {user?.name?.charAt(0).toUpperCase() || 'T'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user?.name || 'Tenant User'}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.organization || 'Organization'}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="p-1 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent rounded"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}