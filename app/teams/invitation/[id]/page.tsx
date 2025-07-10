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
import { respondToInvitation } from "@/lib/actions/team-invitations";

export default async function InvitationPage(
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
    // Redirect to login with return URL
    redirect(`/login?returnUrl=/teams/invitation/${params.id}`);
  }

  // Get invitation details
  const { data: invitation } = await supabase
    .from("team_invitations")
    .select(
      `
      *,
      teams:team_id (
        id,
        name,
        description,
        max_members,
        events:event_id (
          id,
          name,
          description,
          start_date,
          end_date
        )
      ),
      inviter:inviter_id (
        id,
        email,
        user_metadata
      )
    `
    )
    .eq("id", params.id)
    .single();

  if (!invitation) {
    notFound();
  }

  // Check if invitation is for current user
  if (invitation.invitee_email !== session.user.email) {
    return (
      <div className="container max-w-lg mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Invalid Invitation</CardTitle>
            <CardDescription>
              This invitation is not for your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              This invitation was sent to {invitation.invitee_email}, but you're
              logged in as {session.user.email}.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <a href="/teams">Go to Teams</a>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Check if invitation has expired
  const isExpired = new Date(invitation.expires_at) < new Date();
  if (isExpired) {
    return (
      <div className="container max-w-lg mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Invitation Expired</CardTitle>
            <CardDescription>This invitation has expired.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              The invitation to join team "{invitation.teams.name}" has expired.
              Please ask the team leader to send a new invitation.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <a href="/teams">Go to Teams</a>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Check if invitation has already been processed
  if (invitation.status !== "pending") {
    return (
      <div className="container max-w-lg mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Invitation {invitation.status}</CardTitle>
            <CardDescription>
              This invitation has already been {invitation.status}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              You have already {invitation.status} the invitation to join team "
              {invitation.teams.name}".
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <a href="/teams">Go to Teams</a>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Check if user is already in a team for this event
  const { data: existingTeam } = await supabase
    .from("team_members")
    .select("teams:team_id (id, name, event_id)")
    .eq("user_id", session.user.id)
    .eq("teams.event_id", invitation.teams.events.id)
    .maybeSingle();

  if (existingTeam) {
    return (
      <div className="container max-w-lg mx-auto py-10">
        <Card>
          <CardHeader>
            <CardTitle>Already in a team</CardTitle>
            <CardDescription>
              You are already in a team for this event.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              You are already a member of team "{existingTeam.teams[0]?.name}"
              for this event. You can only be in one team per event.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <a href="/teams">Go to Teams</a>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Get team members count
  const { data: teamMembers, count: teamMembersCount } = await supabase
    .from("team_members")
    .select("id", { count: "exact" })
    .eq("team_id", invitation.team_id);

  const isTeamFull =
    teamMembersCount &&
    invitation.teams.max_members &&
    teamMembersCount >= invitation.teams.max_members;

  // Format dates
  const eventStartDate = new Date(
    invitation.teams.events.start_date
  ).toLocaleDateString();
  const eventEndDate = new Date(
    invitation.teams.events.end_date
  ).toLocaleDateString();
  const invitedAt = new Date(invitation.invited_at).toLocaleDateString();

  return (
    <div className="container max-w-lg mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Team Invitation</CardTitle>
          <CardDescription>
            You've been invited to join a team for{" "}
            {invitation.teams.events.name}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium">Team</h3>
            <p>{invitation.teams.name}</p>
          </div>

          <div>
            <h3 className="font-medium">Event</h3>
            <p>{invitation.teams.events.name}</p>
            <p className="text-sm text-muted-foreground">
              {eventStartDate} - {eventEndDate}
            </p>
          </div>

          <div>
            <h3 className="font-medium">Invited by</h3>
            <p>
              {invitation.inviter.user_metadata?.full_name ||
                invitation.inviter.email}
            </p>
          </div>

          <div>
            <h3 className="font-medium">Invited on</h3>
            <p>{invitedAt}</p>
          </div>

          {isTeamFull && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-yellow-800">
              <p className="font-medium">Team is full</p>
              <p className="text-sm">
                This team has reached its maximum capacity of{" "}
                {invitation.teams.max_members} members. You can still accept the
                invitation, but you'll be placed on a waiting list.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <form action={`/api/teams/invitation/respond`} method="POST">
            <input type="hidden" name="invitationId" value={invitation.id} />
            <input type="hidden" name="response" value="declined" />
            <Button variant="outline" type="submit">
              Decline
            </Button>
          </form>

          <form action={`/api/teams/invitation/respond`} method="POST">
            <input type="hidden" name="invitationId" value={invitation.id} />
            <input type="hidden" name="response" value="accepted" />
            <Button type="submit">Accept Invitation</Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
