import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Building2, 
  Users, 
  FileText, 
  Activity,
  Plus,
  MoreHorizontal,
  ExternalLink
} from "lucide-react"

const stats = [
  {
    title: "Total Tenants",
    value: "24",
    description: "Active clinic partners",
    icon: Building2,
    change: "+3 this month"
  },
  {
    title: "Total Patients",
    value: "1,847",
    description: "Across all tenants",
    icon: Users,
    change: "+127 this week"
  },
  {
    title: "Active Forms",
    value: "12",
    description: "Questionnaire templates",
    icon: FileText,
    change: "2 updated recently"
  },
  {
    title: "System Health",
    value: "99.9%",
    description: "Platform uptime",
    icon: Activity,
    change: "All systems operational"
  },
]

const recentTenants = [
  {
    name: "Wellness Medical Group",
    domain: "wellness.health",
    patients: 234,
    status: "Active",
    lastActive: "2 hours ago"
  },
  {
    name: "City Health Clinic",
    domain: "cityhealth.com",
    patients: 156,
    status: "Active", 
    lastActive: "5 hours ago"
  },
  {
    name: "Premier Care Center",
    domain: "premiercare.health",
    patients: 89,
    status: "Setup",
    lastActive: "1 day ago"
  }
]

export default function Overview() {
  return (
    <div className="flex h-screen bg-background dark">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Page Header */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-semibold text-foreground mb-2">Tenant Overview</h1>
              <p className="text-muted-foreground">Manage and monitor all clinic partners</p>
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Onboard New Tenant
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <Card key={stat.title} className="bg-card border-border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-muted-foreground">{stat.title}</h3>
                    <stat.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.description}</p>
                    <p className="text-xs text-green-600">{stat.change}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Tenants */}
            <div className="lg:col-span-2">
              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-foreground">Recent Tenants</CardTitle>
                    <p className="text-sm text-muted-foreground">Latest clinic onboarding activity</p>
                  </div>
                  <Button variant="outline" size="sm">
                    View All
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentTenants.map((tenant, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-medium text-foreground">{tenant.name}</h4>
                            <p className="text-sm text-muted-foreground">{tenant.domain}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              tenant.status === 'Active' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {tenant.status}
                            </span>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{tenant.patients} patients</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="space-y-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-foreground">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Form
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Building2 className="mr-2 h-4 w-4" />
                    Tenant Settings
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <FileText className="mr-2 h-4 w-4" />
                    View Reports
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Activity className="mr-2 h-4 w-4" />
                    System Status
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-foreground">System Info</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Platform Version:</span>
                      <span className="text-foreground">v2.1.4</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Database:</span>
                      <span className="text-green-600">Healthy</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">API Status:</span>
                      <span className="text-green-600">Online</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last Backup:</span>
                      <span className="text-foreground">2h ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}