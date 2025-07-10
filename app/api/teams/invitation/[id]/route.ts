import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const { response } = await request.json();
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get invitation
    const { data: invitation } = await supabase
      .from("team_invitations")
      .select("*, teams(*, events(*))")
      .eq("id", params.id)
      .single();

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 }
      );
    }

    // Verify the invitation is for this user
    if (invitation.invitee_email !== user.email) {
      return NextResponse.json(
        { error: "This invitation is not for you" },
        { status: 403 }
      );
    }

    // Check if invitation is still pending
    if (invitation.status !== "pending") {
      return NextResponse.json(
        { error: "This invitation has already been processed" },
        { status: 400 }
      );
    }

    // Update invitation status
    const { error: updateError } = await supabase
      .from("team_invitations")
      .update({
        status: response,
        responded_at: new Date().toISOString(),
        invitee_id: user.id,
      })
      .eq("id", params.id);

    if (updateError) {
      console.error("Error updating invitation:", updateError);
      return NextResponse.json(
        { error: "Failed to update invitation" },
        { status: 500 }
      );
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
            return NextResponse.json(
              { error: "You are already a member of a team for this event" },
              { status: 400 }
            );
          }
          console.error("Error adding member to team:", memberError);
          return NextResponse.json(
            { error: "Failed to add you to the team" },
            { status: 500 }
          );
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
        return NextResponse.json(
          { error: "An error occurred while joining the team" },
          { status: 500 }
        );
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in invitation response API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
