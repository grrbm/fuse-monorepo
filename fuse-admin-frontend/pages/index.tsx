import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { MetricCards } from "@/components/metric-cards"
import { StoreAnalytics } from "@/components/store-analytics"
import { ConversionFunnel } from "@/components/conversion-funnel"
import { RecentActivity } from "@/components/recent-activity"

export default function Dashboard() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <h1 className="text-3xl font-semibold text-foreground mb-2">Overview</h1>
            <p className="text-muted-foreground">Monitor your business performance and insights</p>
          </div>

          <MetricCards />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <StoreAnalytics />
            </div>
            <div className="space-y-6">
              <ConversionFunnel />
              <RecentActivity />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}