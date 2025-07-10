import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  inviteTeamMember,
  withdrawInvitation,
} from "@/lib/actions/team-invitations";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock, Mail, UserPlus, X } from "lucide-react";

export default async function ManageTeamPage(
  props: {
    params: Promise<{ id: string }>;
  }
) {
  const params = await props.params;
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    redirect("/login?returnUrl=/teams/manage/" + params.id);
  }

  // Get team details
  const { data: team } = await supabase
    .from("teams")
    .select(
      `
      *,
      events:event_id (
        id,
        name,
        description,
        start_date,
        end_date,
        max_team_size
      )
    `
    )
    .eq("id", params.id)
    .single();

  if (!team) {
    notFound();
  }

  // Check if user is team leader
  if (team.leader_id !== session.user.id) {
    redirect("/teams");
  }

  // Get team members
  const { data: members } = await supabase
    .from("team_members")
    .select(
      `
      *,
      profiles:user_id (
        id,
        email,
        full_name,
        avatar_url
      )
    `
    )
    .eq("team_id", params.id)
    .order("joined_at", { ascending: true });

  // Get pending invitations
  const { data: invitations } = await supabase
    .from("team_invitations")
    .select("*")
    .eq("team_id", params.id)
    .eq("status", "pending")
    .order("invited_at", { ascending: false });

  // Format dates
  const eventStartDate = new Date(team.events.start_date).toLocaleDateString();
  const eventEndDate = new Date(team.events.end_date).toLocaleDateString();

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">{team.name}</h1>
          <p className="text-muted-foreground">
            {team.events.name} • {eventStartDate} - {eventEndDate}
          </p>
        </div>
        <Button asChild variant="outline">
          <a href="/teams">Back to Teams</a>
        </Button>
      </div>

      <Tabs defaultValue="members">
        <TabsList className="mb-6">
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="invitations">Invitations</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>
                Manage your team members for {team.events.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {members?.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={member.profiles?.avatar_url || ""} />
                        <AvatarFallback>
                          {member.profiles?.full_name?.charAt(0) ||
                            member.profiles?.email?.charAt(0) ||
                            "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {member.profiles?.full_name || member.user_email}
                        </p>
                        {member.profiles?.email && (
                          <p className="text-sm text-muted-foreground">
                            {member.profiles.email}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {member.user_id === team.leader_id && (
                        <Badge>Team Leader</Badge>
                      )}
                      {member.user_id !== team.leader_id && (
                        <Badge variant="outline">Member</Badge>
                      )}
                    </div>
                  </div>
                ))}

                {members?.length === 0 && (
                  <div className="text-center py-10 text-muted-foreground">
                    <UserPlus className="mx-auto h-10 w-10 mb-2" />
                    <p>No members yet</p>
                    <p className="text-sm">Invite members to join your team</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invitations">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Invite Members</CardTitle>
                <CardDescription>
                  Send invitations to join your team
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  action={async (formData: FormData) => {
                    await inviteTeamMember(formData);
                  }}
                  className="space-y-4"
                >
                  <input type="hidden" name="teamId" value={team.id} />

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter email address"
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    <Mail className="mr-2 h-4 w-4" />
                    Send Invitation
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pending Invitations</CardTitle>
                <CardDescription>
                  Manage your pending team invitations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {invitations?.map((invitation) => (
                    <div
                      key={invitation.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          {invitation.invitee_email}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center">
                          <Clock className="mr-1 h-3 w-3" />
                          Invited{" "}
                          {new Date(invitation.invited_at).toLocaleDateString()}
                        </p>
                      </div>
                      <form
                        action={async (formData: FormData) => {
                          await withdrawInvitation(formData);
                        }}
                      >
                        <input
                          type="hidden"
                          name="invitationId"
                          value={invitation.id}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          type="submit"
                          title="Withdraw invitation"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </form>
                    </div>
                  ))}

                  {invitations?.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground">
                      <Mail className="mx-auto h-10 w-10 mb-2" />
                      <p>No pending invitations</p>
                      <p className="text-sm">
                        Invite members to join your team
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Team Settings</CardTitle>
              <CardDescription>Manage your team settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Team Name</h3>
                  <p>{team.name}</p>
                </div>

                <div>
                  <h3 className="font-medium">Team Description</h3>
                  <p>{team.description || "No description"}</p>
                </div>

                <div>
                  <h3 className="font-medium">Maximum Team Size</h3>
                  <p>
                    {team.max_members ||
                      team.events.max_team_size ||
                      "Unlimited"}
                  </p>
                </div>

                <div>
                  <h3 className="font-medium">Event</h3>
                  <p>{team.events.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {eventStartDate} - {eventEndDate}
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild>
                <a href={`/teams/edit/${team.id}`}>Edit Team</a>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
