import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function RecentActivity() {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">Recent Activity</CardTitle>
        <p className="text-sm text-muted-foreground">Latest updates from your store</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
              <span className="text-xs font-medium">MM</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground">New treatment started for Michael Martinez</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}