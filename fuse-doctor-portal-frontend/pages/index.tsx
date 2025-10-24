import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, FileText, TrendingUp } from "lucide-react";

export default function Dashboard() {
    const { user } = useAuth();

    return (
        <div className="flex h-screen bg-background">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Header Section */}
                    <div>
                        <h1 className="text-3xl font-semibold text-foreground mb-2">
                            Welcome back{user?.firstName ? `, Dr. ${user.firstName}` : ''}
                        </h1>
                        <p className="text-muted-foreground">Here's what's happening with your practice today</p>
                    </div>

                    {/* Metric Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">0</div>
                                <p className="text-xs text-muted-foreground">
                                    No patients yet
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Appointments Today</CardTitle>
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">0</div>
                                <p className="text-xs text-muted-foreground">
                                    No appointments scheduled
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Records</CardTitle>
                                <FileText className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">0</div>
                                <p className="text-xs text-muted-foreground">
                                    No records
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">This Month</CardTitle>
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">0</div>
                                <p className="text-xs text-muted-foreground">
                                    Visits this month
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Welcome Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Getting Started</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <p className="text-muted-foreground">
                                    Welcome to the Fuse Doctor Portal! This is your central hub for managing patients, appointments, and medical records.
                                </p>
                                <div className="space-y-2">
                                    <h3 className="font-semibold">Quick Actions:</h3>
                                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                        <li>View and manage your patient list</li>
                                        <li>Schedule and track appointments</li>
                                        <li>Access patient medical records</li>
                                        <li>Update your profile and settings</li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </main>
            </div>
        </div>
    );
}

