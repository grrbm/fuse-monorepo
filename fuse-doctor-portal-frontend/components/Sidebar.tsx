import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import Link from "next/link"
import { useRouter } from "next/router"
import {
    BarChart3,
    Users,
    Calendar,
    FileText,
    Settings,
    LogOut,
} from "lucide-react"

const navigation = [
    { name: "Dashboard", icon: BarChart3, current: true, href: "/" },
    { name: "Patients", icon: Users, current: false, href: "/patients" },
    { name: "Appointments", icon: Calendar, current: false, href: "/appointments" },
    { name: "Records", icon: FileText, current: false, href: "/records" },
]

const configuration = [
    { name: "Settings", icon: Settings, current: false, href: "/settings" }
]

export function Sidebar() {
    const { user, logout } = useAuth()
    const router = useRouter()

    const renderSidebarItem = (item: { name: string; icon: any; current: boolean; href?: string }) => {
        const isActive = router.pathname === item.href

        return (
            <Link
                key={item.name}
                href={item.href || "#"}
                className={cn(
                    "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
            >
                <div className="flex items-center">
                    <item.icon className="mr-3 h-4 w-4" />
                    {item.name}
                </div>
            </Link>
        )
    }

    return (
        <div className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
            {/* Logo */}
            <div className="p-6">
                <h1 className="text-xl font-bold text-sidebar-foreground">Fuse Doctor Portal</h1>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-1">
                {/* Main Navigation */}
                <div className="space-y-1">
                    {navigation.map((item) => renderSidebarItem(item))}
                </div>

                {/* Configuration Section */}
                <div className="pt-6">
                    <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Configuration
                    </h3>
                    <div className="space-y-1">
                        {configuration.map((item) => renderSidebarItem(item))}
                    </div>
                </div>
            </nav>

            {/* User Profile */}
            <div className="p-4 border-t border-sidebar-border">
                <div className="flex items-center justify-between space-x-3">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                                {user?.name?.charAt(0).toUpperCase() || 'D'}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-sidebar-foreground truncate">
                                {user?.name || 'Doctor'}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                                {user?.email || 'doctor@example.com'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
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

