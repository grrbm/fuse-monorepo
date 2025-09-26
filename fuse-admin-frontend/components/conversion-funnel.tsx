import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function ConversionFunnel() {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">Conversion Funnel</CardTitle>
        <p className="text-sm text-muted-foreground">Customer journey from visit to treatment</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-foreground">Registered Customers</span>
            </div>
            <span className="text-sm font-medium text-foreground">5</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}