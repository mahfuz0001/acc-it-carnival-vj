import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { sendTeamInvitationEmail } from "@/lib/emails/send-email";
import { sendTeamInvitationPushNotification } from "@/lib/push-notifications";

export async function POST(request: NextRequest) {
  try {
    const { teamId, email } = await request.json();
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is team leader
    const { data: team } = await supabase
      .from("teams")
      .select("*")
      .eq("id", teamId)
      .single();

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    if (team.leader_id !== user.id) {
      return NextResponse.json(
        { error: "Only team leaders can send invitations" },
        { status: 403 }
      );
    }

    // Check if user is already in the team
    const { data: existingMember } = await supabase
      .from("team_members")
      .select("*")
      .eq("team_id", teamId)
      .eq("user_email", email)
      .maybeSingle();

    if (existingMember) {
      return NextResponse.json(
        { error: "User is already a member of this team" },
        { status: 400 }
      );
    }

    // Check if invitation already exists
    const { data: existingInvitation } = await supabase
      .from("team_invitations")
      .select("*")
      .eq("team_id", teamId)
      .eq("invitee_email", email)
      .eq("status", "pending")
      .maybeSingle();

    if (existingInvitation) {
      return NextResponse.json(
        { error: "An invitation has already been sent to this email" },
        { status: 400 }
      );
    }

    // Create invitation
    const { data: invitation, error } = await supabase
      .from("team_invitations")
      .insert({
        team_id: teamId,
        inviter_id: user.id,
        invitee_email: email,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating invitation:", error);
      return NextResponse.json(
        { error: "Failed to create invitation" },
        { status: 500 }
      );
    }

    // Get event details for the email
    const { data: eventData } = await supabase
      .from("teams")
      .select("*, events(name, description)")
      .eq("id", teamId)
      .single();

    // Send invitation email
    try {
      await sendTeamInvitationEmail({
        to: email,
        invitationId: invitation.id,
        teamName: team.name,
        eventName: eventData.events.name,
        inviterName:
          user.user_metadata?.full_name || user.email || "Team Leader",
      });
    } catch (error) {
      console.error("Error sending invitation email:", error);
      // Continue even if email fails
    }

    // Create notification for the invitee
    try {
      // Get user ID if they exist in the system
      const { data: inviteeUser } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (inviteeUser) {
        await supabase.from("notifications").insert({
          user_id: inviteeUser.id,
          type: "team_invitation",
          title: `Team Invitation: ${team.name}`,
          message: `You've been invited to join team "${team.name}" for event "${eventData.events.name}"`,
          data: {
            invitationId: invitation.id,
            teamId: teamId,
            teamName: team.name,
            eventName: eventData.events.name,
          },
          read: false,
        });

        // Send push notification if user has subscribed
        const { data: pushSubscription } = await supabase
          .from("push_subscriptions")
          .select("subscription")
          .eq("user_id", inviteeUser.id)
          .maybeSingle();

        if (pushSubscription) {
          try {
            await sendTeamInvitationPushNotification(
              pushSubscription.subscription,
              team.name,
              eventData.events.name,
              invitation.id
            );
          } catch (error) {
            console.error("Error sending push notification:", error);
            // Continue even if push notification fails
          }
        }
      }
    } catch (error) {
      console.error("Error creating notification:", error);
      // Continue even if notification creation fails
    }

    return NextResponse.json({ success: true, invitationId: invitation.id });
  } catch (error) {
    console.error("Error in invite API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
