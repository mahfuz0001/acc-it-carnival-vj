"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { sendTeamInvitationEmail } from "../emails/send-email";

export async function inviteTeamMember(formData: FormData) {
  const supabase = await createClient();

  const teamId = formData.get("teamId") as string;
  const email = formData.get("email") as string;

  if (!teamId || !email) {
    return { error: "Missing required fields" };
  }

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  // Check if user is team leader
  const { data: team } = await supabase
    .from("teams")
    .select("*")
    .eq("id", teamId)
    .single();

  if (!team) {
    return { error: "Team not found" };
  }

  if (team.leader_id !== user.id) {
    return { error: "Only team leaders can send invitations" };
  }

  // Check if user is already in the team
  const { data: existingMember } = await supabase
    .from("team_members")
    .select("*")
    .eq("team_id", teamId)
    .eq("user_email", email)
    .maybeSingle();

  if (existingMember) {
    return { error: "User is already a member of this team" };
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
    return { error: "An invitation has already been sent to this email" };
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
    return { error: "Failed to create invitation" };
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
      inviterName: user.user_metadata?.full_name || user.email || "Team Leader",
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
        data: { invitationId: invitation.id, teamId: teamId },
        read: false,
      });
    }
  } catch (error) {
    console.error("Error creating notification:", error);
    // Continue even if notification creation fails
  }

  revalidatePath("/teams");
  return { success: true };
}

export async function respondToInvitation(formData: FormData) {
  const supabase = await createClient();

  const invitationId = formData.get("invitationId") as string;
  const response = formData.get("response") as "accepted" | "declined";

  if (!invitationId || !response) {
    return { error: "Missing required fields" };
  }

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  // Get invitation
  const { data: invitation } = await supabase
    .from("team_invitations")
    .select("*, teams(*, events(*))")
    .eq("id", invitationId)
    .single();

  if (!invitation) {
    return { error: "Invitation not found" };
  }

  // Verify the invitation is for this user
  if (invitation.invitee_email !== user.email) {
    return { error: "This invitation is not for you" };
  }

  // Check if invitation is still pending
  if (invitation.status !== "pending") {
    return { error: "This invitation has already been processed" };
  }

  // Update invitation status
  const { error: updateError } = await supabase
    .from("team_invitations")
    .update({
      status: response,
      responded_at: new Date().toISOString(),
      invitee_id: user.id,
    })
    .eq("id", invitationId);

  if (updateError) {
    console.error("Error updating invitation:", updateError);
    return { error: "Failed to update invitation" };
  }

  // If accepted, add user to team
  if (response === "accepted") {
    try {
      const { error: memberError } = await supabase
        .from("team_members")
        .insert({
          team_id: invitation.team_id,
          user_id: user.id,
          user_email: user.email,
          role: "member",
          joined_at: new Date().toISOString(),
        });

      if (memberError) {
        if (memberError.code === "23505") {
          // Unique constraint violation
          return { error: "You are already a member of a team for this event" };
        }
        console.error("Error adding member to team:", memberError);
        return { error: "Failed to add you to the team" };
      }

      // Create notification for the team leader
      await supabase.from("notifications").insert({
        user_id: invitation.inviter_id,
        type: "invitation_accepted",
        title: "Invitation Accepted",
        message: `${user.email} has accepted your invitation to join team "${invitation.teams.name}"`,
        data: { teamId: invitation.team_id },
        read: false,
      });
    } catch (error) {
      console.error("Error in team join process:", error);
      return { error: "An error occurred while joining the team" };
    }
  } else {
    // Create notification for the team leader about declined invitation
    await supabase.from("notifications").insert({
      user_id: invitation.inviter_id,
      type: "invitation_declined",
      title: "Invitation Declined",
      message: `${user.email} has declined your invitation to join team "${invitation.teams.name}"`,
      data: { teamId: invitation.team_id },
      read: false,
    });
  }

  revalidatePath("/teams");
  revalidatePath("/profile");

  return { success: true };
}

export async function withdrawInvitation(formData: FormData) {
  const supabase = await createClient();

  const invitationId = formData.get("invitationId") as string;

  if (!invitationId) {
    return { error: "Missing invitation ID" };
  }

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  // Get invitation
  const { data: invitation } = await supabase
    .from("team_invitations")
    .select("*, teams(*)")
    .eq("id", invitationId)
    .single();

  if (!invitation) {
    return { error: "Invitation not found" };
  }

  // Verify the user is the team leader
  const { data: team } = await supabase
    .from("teams")
    .select("leader_id")
    .eq("id", invitation.team_id)
    .single();

  if (!team || team.leader_id !== user.id) {
    return { error: "Only team leaders can withdraw invitations" };
  }

  // Check if invitation is still pending
  if (invitation.status !== "pending") {
    return { error: "This invitation has already been processed" };
  }

  // Update invitation status
  const { error: updateError } = await supabase
    .from("team_invitations")
    .update({
      status: "withdrawn",
      updated_at: new Date().toISOString(),
    })
    .eq("id", invitationId);

  if (updateError) {
    console.error("Error withdrawing invitation:", updateError);
    return { error: "Failed to withdraw invitation" };
  }

  // Create notification for the invitee if they have an account
  if (invitation.invitee_id) {
    await supabase.from("notifications").insert({
      user_id: invitation.invitee_id,
      type: "invitation_withdrawn",
      title: "Invitation Withdrawn",
      message: `Your invitation to join team "${invitation.teams.name}" has been withdrawn`,
      data: { teamId: invitation.team_id },
      read: false,
    });
  }

  revalidatePath("/teams");
  return { success: true };
}
