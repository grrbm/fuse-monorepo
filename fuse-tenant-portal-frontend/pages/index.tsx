import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
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
    <div className="flex h-screen bg-[#F9FAFB]">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* Page Header */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-semibold text-[#1F2937] mb-2">Tenant Overview</h1>
              <p className="text-[#6B7280] text-base">Manage and monitor all clinic partners</p>
            </div>
            <button className="rounded-full px-6 py-2.5 bg-[#4FA59C] hover:bg-[#478F87] text-white shadow-sm transition-all text-sm font-medium flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Onboard New Tenant
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div key={stat.title} className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-6 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wide">{stat.title}</h3>
                  <div className="bg-[#F3F4F6] rounded-xl p-2">
                    <stat.icon className="h-5 w-5 text-[#4FA59C]" />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-3xl font-bold text-[#1F2937]">{stat.value}</p>
                  <p className="text-sm text-[#6B7280]">{stat.description}</p>
                  <div className="pt-2 border-t border-[#E5E7EB]">
                    <p className="text-xs text-[#10B981] font-medium">{stat.change}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Tenants */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] overflow-hidden">
                <div className="p-6 pb-4 flex flex-row items-center justify-between border-b border-[#E5E7EB]">
                  <div>
                    <h2 className="text-lg font-semibold text-[#1F2937]">Recent Tenants</h2>
                    <p className="text-sm text-[#6B7280] mt-0.5">Latest clinic onboarding activity</p>
                  </div>
                  <button className="rounded-full px-4 py-2 border border-[#E5E7EB] text-[#4B5563] hover:bg-[#F3F4F6] transition-all text-sm font-medium flex items-center gap-2">
                    View All
                    <ExternalLink className="h-4 w-4" />
                  </button>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {recentTenants.map((tenant, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl hover:bg-white hover:shadow-sm transition-all">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-[#4FA59C] to-[#3d8580] rounded-xl flex items-center justify-center shadow-sm">
                            <Building2 className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-[#1F2937]">{tenant.name}</h4>
                            <p className="text-sm text-[#9CA3AF]">{tenant.domain}</p>
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-3">
                          <div>
                            <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                              tenant.status === 'Active' 
                                ? 'bg-green-50 text-[#10B981] border border-green-200' 
                                : 'bg-yellow-50 text-[#F59E0B] border border-yellow-200'
                            }`}>
                              {tenant.status}
                            </span>
                            <p className="text-xs text-[#9CA3AF] mt-1">{tenant.patients} patients</p>
                          </div>
                          <button className="p-2 text-[#6B7280] hover:bg-white hover:text-[#1F2937] rounded-xl transition-all">
                            <MoreHorizontal className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] overflow-hidden">
                <div className="p-6 pb-4 border-b border-[#E5E7EB]">
                  <h2 className="text-lg font-semibold text-[#1F2937]">Quick Actions</h2>
                </div>
                <div className="p-6 space-y-2">
                  <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#4B5563] bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl hover:bg-white hover:border-[#4FA59C] hover:text-[#4FA59C] transition-all">
                    <Plus className="h-5 w-5" />
                    Create New Form
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#4B5563] bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl hover:bg-white hover:border-[#4FA59C] hover:text-[#4FA59C] transition-all">
                    <Building2 className="h-5 w-5" />
                    Tenant Settings
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#4B5563] bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl hover:bg-white hover:border-[#4FA59C] hover:text-[#4FA59C] transition-all">
                    <FileText className="h-5 w-5" />
                    View Reports
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#4B5563] bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl hover:bg-white hover:border-[#4FA59C] hover:text-[#4FA59C] transition-all">
                    <Activity className="h-5 w-5" />
                    System Status
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-[#E5E7EB] overflow-hidden">
                <div className="p-6 pb-4 border-b border-[#E5E7EB]">
                  <h2 className="text-lg font-semibold text-[#1F2937]">System Info</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between items-center py-2">
                      <span className="text-[#6B7280]">Platform Version:</span>
                      <span className="text-[#1F2937] font-medium">v2.1.4</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-t border-[#E5E7EB]">
                      <span className="text-[#6B7280]">Database:</span>
                      <span className="text-[#10B981] font-medium flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-[#10B981] rounded-full"></div>
                        Healthy
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-t border-[#E5E7EB]">
                      <span className="text-[#6B7280]">API Status:</span>
                      <span className="text-[#10B981] font-medium flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-[#10B981] rounded-full"></div>
                        Online
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-t border-[#E5E7EB]">
                      <span className="text-[#6B7280]">Last Backup:</span>
                      <span className="text-[#1F2937] font-medium">2h ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}