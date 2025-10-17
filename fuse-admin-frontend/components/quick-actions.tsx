import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, BarChart3, FileText, Package } from "lucide-react";
import { useRouter } from "next/router";

export function QuickActions() {
  const router = useRouter();

  const actions = [
    {
      title: "View Products",
      description: "Manage your product catalog",
      icon: Package,
      onClick: () => router.push('/products'),
      variant: "default" as const
    },
    {
      title: "View Orders",
      description: "Review customer orders",
      icon: FileText,
      onClick: () => router.push('/orders'),
      variant: "outline" as const
    },
    {
      title: "Settings",
      description: "Manage your account",
      icon: Users,
      onClick: () => router.push('/settings'),
      variant: "outline" as const
    }
  ];

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">Quick Actions</CardTitle>
        <p className="text-sm text-muted-foreground">Common tasks and shortcuts</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3">
          {actions.map((action) => (
            <Button
              key={action.title}
              variant={action.variant}
              className="w-full justify-start h-auto py-4"
              onClick={action.onClick}
            >
              <action.icon className="h-5 w-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">{action.title}</div>
                <div className="text-xs text-muted-foreground">{action.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

