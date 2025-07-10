"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Settings,
  Users,
  Trophy,
  Bell,
  Activity,
  TestTube,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  BarChart3,
  MessageSquare,
  Calendar,
  ImageIcon,
  UserCheck,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface ApiTestResult {
  endpoint: string;
  method: string;
  status: "success" | "error" | "pending";
  response?: any;
  error?: string;
  duration?: number;
}

interface TeamInvitation {
  email: string;
  status: "pending" | "sent" | "error";
  error?: string;
}

export default function AdminDashboard() {
  const [apiResults, setApiResults] = useState<ApiTestResult[]>([]);
  const [isTestingAll, setIsTestingAll] = useState(false);
  const [pushMessage, setPushMessage] = useState("");
  const [pushTitle, setPushTitle] = useState("");
  const [teamInvitations, setTeamInvitations] = useState<TeamInvitation[]>([]);
  const [newInvitationEmail, setNewInvitationEmail] = useState("");

  const apiEndpoints = [
    {
      endpoint: "/api/achievements",
      method: "GET",
      description: "Get user achievements",
    },
    {
      endpoint: "/api/achievements",
      method: "POST",
      description: "Update achievement progress",
      body: { category: "participation", increment: 1 },
    },
    {
      endpoint: "/api/achievements",
      method: "PUT",
      description: "Initialize user achievements",
    },
    {
      endpoint: "/api/leaderboard",
      method: "GET",
      description: "Get global leaderboard",
    },
    {
      endpoint: "/api/leaderboard?eventId=1",
      method: "GET",
      description: "Get event leaderboard",
    },
    {
      endpoint: "/api/user-stats",
      method: "POST",
      description: "Update user activity",
    },
    {
      endpoint: "/api/notifications",
      method: "GET",
      description: "Get notifications",
    },
    {
      endpoint: "/api/notifications",
      method: "POST",
      description: "Create notification",
      body: { title: "Test", message: "Test notification", type: "info" },
    },
    {
      endpoint: "/api/push-subscription",
      method: "GET",
      description: "Get push subscriptions",
    },
    {
      endpoint: "/api/admin/send-push",
      method: "POST",
      description: "Send push notification",
      body: { title: "Test Push", message: "Test push notification" },
    },
  ];

  const testApiEndpoint = async (
    endpoint: string,
    method: string,
    body?: any
  ) => {
    const startTime = Date.now();

    setApiResults((prev) =>
      prev.map((result) =>
        result.endpoint === endpoint && result.method === method
          ? { ...result, status: "pending" }
          : result
      )
    );

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      const duration = Date.now() - startTime;
      const data = await response.json();

      setApiResults((prev) =>
        prev.map((result) =>
          result.endpoint === endpoint && result.method === method
            ? {
                ...result,
                status: response.ok ? "success" : "error",
                response: data,
                duration,
                error: response.ok ? undefined : data.error || "Unknown error",
              }
            : result
        )
      );

      if (response.ok) {
        toast.success(`${method} ${endpoint} - Success (${duration}ms)`);
      } else {
        toast.error(`${method} ${endpoint} - Error: ${data.error}`);
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      setApiResults((prev) =>
        prev.map((result) =>
          result.endpoint === endpoint && result.method === method
            ? {
                ...result,
                status: "error",
                error: error instanceof Error ? error.message : "Network error",
                duration,
              }
            : result
        )
      );
      toast.error(`${method} ${endpoint} - Network Error`);
    }
  };

  const testAllEndpoints = async () => {
    setIsTestingAll(true);

    // Initialize results
    setApiResults(
      apiEndpoints.map((api) => ({
        endpoint: api.endpoint,
        method: api.method,
        status: "pending" as const,
      }))
    );

    // Test each endpoint with a delay
    for (const api of apiEndpoints) {
      await testApiEndpoint(api.endpoint, api.method, api.body);
      await new Promise((resolve) => setTimeout(resolve, 500)); // Small delay between requests
    }

    setIsTestingAll(false);
  };

  const sendTestPushNotification = async () => {
    if (!pushTitle || !pushMessage) {
      toast.error("Please enter both title and message");
      return;
    }

    try {
      const response = await fetch("/api/admin/send-push", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: pushTitle,
          message: pushMessage,
        }),
      });

      if (response.ok) {
        toast.success("Push notification sent successfully!");
        setPushTitle("");
        setPushMessage("");
      } else {
        const error = await response.json();
        toast.error(`Failed to send push notification: ${error.error}`);
      }
    } catch (error) {
      toast.error("Network error while sending push notification");
    }
  };

  const inviteTeamMember = async (email: string) => {
    setTeamInvitations((prev) =>
      prev.concat({ email, status: "pending" as const })
    );

    try {
      const response = await fetch("/api/admin/invite-team-member", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      setTeamInvitations((prev) =>
        prev.map((invitation) =>
          invitation.email === email
            ? {
                ...invitation,
                status: response.ok ? "sent" : "error",
                error: response.ok ? undefined : data.error || "Unknown error",
              }
            : invitation
        )
      );

      if (response.ok) {
        toast.success(`Invitation sent to ${email} successfully!`);
        setNewInvitationEmail("");
      } else {
        toast.error(`Failed to send invitation to ${email}: ${data.error}`);
      }
    } catch (error) {
      setTeamInvitations((prev) =>
        prev.map((invitation) =>
          invitation.email === email
            ? {
                ...invitation,
                status: "error",
                error: error instanceof Error ? error.message : "Network error",
              }
            : invitation
        )
      );
      toast.error(`Network error while sending invitation to ${email}`);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "error":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  useEffect(() => {
    // Initialize results on component mount
    setApiResults(
      apiEndpoints.map((api) => ({
        endpoint: api.endpoint,
        method: api.method,
        status: "pending" as const,
      }))
    );
  }, []);

  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-[#F7374F] to-[#6ba348] flex items-center justify-center">
            <Settings className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-[#D4D4D6]">
              Test and manage all carnival features
            </p>
          </div>
        </div>

        <Tabs defaultValue="api-testing" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-[#556492]/20">
            <TabsTrigger
              value="api-testing"
              className="data-[state=active]:bg-[#F7374F]"
            >
              <TestTube className="h-4 w-4 mr-2" />
              API Testing
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="data-[state=active]:bg-[#F7374F]"
            >
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="data-[state=active]:bg-[#F7374F]"
            >
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-[#F7374F]"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger
              value="pages"
              className="data-[state=active]:bg-[#F7374F]"
            >
              <Activity className="h-4 w-4 mr-2" />
              Page Tests
            </TabsTrigger>
            <TabsTrigger
              value="team-invitations"
              className="data-[state=active]:bg-[#F7374F]"
            >
              <Users className="h-4 w-4 mr-2" />
              Team Invitations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="api-testing" className="space-y-6">
            <Card className="bg-[#556492]/20 border-[#556492]/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TestTube className="h-5 w-5 text-[#F7374F]" />
                  API Endpoint Testing
                </CardTitle>
                <CardDescription className="text-[#D4D4D6]">
                  Test all API endpoints to ensure they're working correctly
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <Button
                    onClick={testAllEndpoints}
                    disabled={isTestingAll}
                    className="bg-[#F7374F] hover:bg-[#6ba348] text-white"
                  >
                    {isTestingAll ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Testing All...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Test All Endpoints
                      </>
                    )}
                  </Button>
                  <Badge
                    variant="outline"
                    className="border-[#F7374F] text-[#F7374F]"
                  >
                    {apiResults.filter((r) => r.status === "success").length} /{" "}
                    {apiResults.length} Passed
                  </Badge>
                </div>

                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {apiEndpoints.map((api, index) => {
                      const result = apiResults.find(
                        (r) =>
                          r.endpoint === api.endpoint && r.method === api.method
                      );
                      return (
                        <motion.div
                          key={`${api.endpoint}-${api.method}`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card
                            className={`border ${getStatusColor(result?.status || "pending")}`}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  {getStatusIcon(result?.status || "pending")}
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {api.method}
                                      </Badge>
                                      <code className="text-sm font-mono">
                                        {api.endpoint}
                                      </code>
                                    </div>
                                    <p className="text-xs text-[#D4D4D6] mt-1">
                                      {api.description}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {result?.duration && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {result.duration}ms
                                    </Badge>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      testApiEndpoint(
                                        api.endpoint,
                                        api.method,
                                        api.body
                                      )
                                    }
                                    disabled={result?.status === "pending"}
                                    className="border-[#F7374F] text-[#F7374F] hover:bg-[#F7374F]/20"
                                  >
                                    Test
                                  </Button>
                                </div>
                              </div>
                              {result?.error && (
                                <Alert className="mt-3 border-red-500/30 bg-red-500/10">
                                  <XCircle className="h-4 w-4" />
                                  <AlertDescription className="text-red-400">
                                    {result.error}
                                  </AlertDescription>
                                </Alert>
                              )}
                              {result?.response &&
                                result.status === "success" && (
                                  <details className="mt-3">
                                    <summary className="text-sm text-[#F7374F] cursor-pointer">
                                      View Response
                                    </summary>
                                    <pre className="text-xs bg-[#131943] p-2 rounded mt-2 overflow-auto">
                                      {JSON.stringify(result.response, null, 2)}
                                    </pre>
                                  </details>
                                )}
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card className="bg-[#556492]/20 border-[#556492]/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Bell className="h-5 w-5 text-[#F7374F]" />
                  Push Notification Testing
                </CardTitle>
                <CardDescription className="text-[#D4D4D6]">
                  Send test push notifications to all subscribed users
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="push-title" className="text-[#D4D4D6]">
                      Notification Title
                    </Label>
                    <Input
                      id="push-title"
                      value={pushTitle}
                      onChange={(e) => setPushTitle(e.target.value)}
                      placeholder="Enter notification title..."
                      className="bg-[#7683A4]/20 border-[#7683A4]/30 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="push-message" className="text-[#D4D4D6]">
                      Notification Message
                    </Label>
                    <Textarea
                      id="push-message"
                      value={pushMessage}
                      onChange={(e) => setPushMessage(e.target.value)}
                      placeholder="Enter notification message..."
                      className="bg-[#7683A4]/20 border-[#7683A4]/30 text-white"
                      rows={3}
                    />
                  </div>
                  <Button
                    onClick={sendTestPushNotification}
                    className="bg-[#F7374F] hover:bg-[#6ba348] text-white"
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    Send Test Push Notification
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pages" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  name: "Home",
                  path: "/",
                  icon: <Activity className="h-5 w-5" />,
                  description: "Main landing page",
                },
                {
                  name: "Events",
                  path: "/events",
                  icon: <Calendar className="h-5 w-5" />,
                  description: "Event listings",
                },
                {
                  name: "Live",
                  path: "/live",
                  icon: <Zap className="h-5 w-5" />,
                  description: "Live streams & leaderboard",
                },
                {
                  name: "Schedule",
                  path: "/schedule",
                  icon: <Clock className="h-5 w-5" />,
                  description: "Event schedule",
                },
                {
                  name: "Teams",
                  path: "/teams",
                  icon: <Users className="h-5 w-5" />,
                  description: "Team management",
                },
                {
                  name: "Gallery",
                  path: "/gallery",
                  icon: <ImageIcon className="h-5 w-5" />,
                  description: "Photo gallery",
                },
                {
                  name: "Profile",
                  path: "/profile",
                  icon: <UserCheck className="h-5 w-5" />,
                  description: "User profile",
                },
                {
                  name: "About",
                  path: "/about",
                  icon: <MessageSquare className="h-5 w-5" />,
                  description: "About page",
                },
              ].map((page) => (
                <motion.div
                  key={page.path}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="bg-[#556492]/20 border-[#556492]/30 hover:border-[#F7374F]/50 transition-colors">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-white flex items-center gap-2 text-lg">
                        {page.icon}
                        {page.name}
                      </CardTitle>
                      <CardDescription className="text-[#D4D4D6]">
                        {page.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <Button
                          asChild
                          className="flex-1 bg-[#F7374F] hover:bg-[#6ba348] text-white"
                        >
                          <a
                            href={page.path}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Visit Page
                          </a>
                        </Button>
                        <Button
                          variant="outline"
                          className="border-[#556492] text-[#D4D4D6] hover:bg-[#556492]/20"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              window.location.origin + page.path
                            );
                            toast.success("URL copied to clipboard!");
                          }}
                        >
                          Copy URL
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card className="bg-[#556492]/20 border-[#556492]/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#F7374F]" />
                  User Management
                </CardTitle>
                <CardDescription className="text-[#D4D4D6]">
                  Manage users, achievements, and statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <Button
                    variant="outline"
                    className="border-[#F7374F] text-[#F7374F] hover:bg-[#F7374F]/20"
                    onClick={() => testApiEndpoint("/api/achievements", "PUT")}
                  >
                    <Trophy className="h-4 w-4 mr-2" />
                    Initialize User Achievements
                  </Button>
                  <Button
                    variant="outline"
                    className="border-[#F7374F] text-[#F7374F] hover:bg-[#F7374F]/20"
                    onClick={() => testApiEndpoint("/api/user-stats", "POST")}
                  >
                    <Activity className="h-4 w-4 mr-2" />
                    Update User Activity
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card className="bg-[#556492]/20 border-[#556492]/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-[#F7374F]" />
                  Analytics & Monitoring
                </CardTitle>
                <CardDescription className="text-[#D4D4D6]">
                  View system analytics and performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-4 bg-[#F7374F]/20 rounded-lg border border-[#F7374F]/30">
                    <div className="text-2xl font-bold text-[#F7374F]">
                      {apiResults.filter((r) => r.status === "success").length}
                    </div>
                    <div className="text-sm text-[#D4D4D6]">
                      API Tests Passed
                    </div>
                  </div>
                  <div className="text-center p-4 bg-[#556492]/20 rounded-lg border border-[#556492]/30">
                    <div className="text-2xl font-bold text-[#F7374F]">
                      {apiResults
                        .filter((r) => r.duration)
                        .reduce((avg, r) => avg + (r.duration || 0), 0) /
                        apiResults.filter((r) => r.duration).length || 0}
                      ms
                    </div>
                    <div className="text-sm text-[#D4D4D6]">
                      Avg Response Time
                    </div>
                  </div>
                  <div className="text-center p-4 bg-[#556492]/20 rounded-lg border border-[#556492]/30">
                    <div className="text-2xl font-bold text-[#F7374F]">
                      {Math.round(
                        (apiResults.filter((r) => r.status === "success")
                          .length /
                          apiResults.length) *
                          100
                      ) || 0}
                      %
                    </div>
                    <div className="text-sm text-[#D4D4D6]">Success Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team-invitations" className="space-y-6">
            <Card className="bg-[#556492]/20 border-[#556492]/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#F7374F]" />
                  Team Invitations
                </CardTitle>
                <CardDescription className="text-[#D4D4D6]">
                  Invite new team members via email
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <Label
                      htmlFor="new-invitation-email"
                      className="text-[#D4D4D6]"
                    >
                      Email Address
                    </Label>
                    <Input
                      id="new-invitation-email"
                      value={newInvitationEmail}
                      onChange={(e) => setNewInvitationEmail(e.target.value)}
                      placeholder="Enter team member's email..."
                      className="bg-[#7683A4]/20 border-[#7683A4]/30 text-white"
                    />
                  </div>
                  <Button
                    onClick={() => inviteTeamMember(newInvitationEmail)}
                    className="bg-[#F7374F] hover:bg-[#6ba348] text-white"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Invite Team Member
                  </Button>
                </div>

                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {teamInvitations.map((invitation, index) => (
                      <motion.div
                        key={invitation.email}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card
                          className={`border ${getStatusColor(invitation.status)}`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {getStatusIcon(invitation.status)}
                                <div>
                                  <div className="flex items-center gap-2">
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {invitation.status
                                        .charAt(0)
                                        .toUpperCase() +
                                        invitation.status.slice(1)}
                                    </Badge>
                                    <code className="text-sm font-mono">
                                      {invitation.email}
                                    </code>
                                  </div>
                                  {invitation.error && (
                                    <Alert className="mt-3 border-red-500/30 bg-red-500/10">
                                      <XCircle className="h-4 w-4" />
                                      <AlertDescription className="text-red-400">
                                        {invitation.error}
                                      </AlertDescription>
                                    </Alert>
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
