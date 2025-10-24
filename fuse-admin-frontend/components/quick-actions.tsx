import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, BarChart3, FileText, Package } from "lucide-react";
import { useRouter } from "next/router";

export function QuickActions() {
  const router = useRouter();

  const actions = [
    {
      title: "View Orders",
      description: "Review customer orders",
      icon: FileText,
      onClick: () => router.push('/orders'),
      variant: "default" as const
    },
    {
      title: "Manage Products",
      description: "Manage your product catalog",
      icon: Package,
      onClick: () => router.push('/products'),
      variant: "outline" as const
    },
    {
      title: "Settings",
      description: "Manage your account",
      icon: Users,
      onClick: () => router.push('/settings'),
      variant: "outline" as const
    },
    {
      title: "View Customers",
      description: "View your customers",
      icon: Users,
      onClick: () => router.push('/customers'),
      variant: "outline" as const
    }
  ];

  return (
    <Card className="bg-card border-border shadow-sm h-full">
      <CardHeader className="border-b border-border">
        <CardTitle className="text-lg font-semibold text-foreground">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-2">
          {actions.map((action) => (
            <button
              key={action.title}
              onClick={action.onClick}
              className="w-full p-4 border border-border rounded-lg hover:shadow-sm hover:border-muted-foreground/20 transition-all text-left bg-card"
            >
              <div className="flex items-center gap-3">
                <action.icon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <div>
                  <div className="font-medium text-foreground">{action.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{action.description}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

