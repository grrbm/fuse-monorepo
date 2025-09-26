import { Card, CardContent } from "@/components/ui/card"
import { DollarSign, Activity, TrendingUp, ShoppingCart } from "lucide-react"

const metrics = [
  {
    title: "Total Revenue",
    value: "$5,833.00",
    description: "Revenue from successful payments",
    icon: DollarSign,
  },
  {
    title: "Total Treatments",
    value: "19",
    description: "No change from last period",
    icon: Activity,
  },
  {
    title: "Active Treatments",
    value: "8",
    description: "42.1% conversion rate",
    icon: TrendingUp,
  },
  {
    title: "Avg Order Value",
    value: "$307.00",
    description: "Based on 19 orders",
    icon: ShoppingCart,
  },
]

export function MetricCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric) => (
        <Card key={metric.title} className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">{metric.title}</h3>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-foreground">{metric.value}</p>
              <p className="text-xs text-muted-foreground">{metric.description}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}