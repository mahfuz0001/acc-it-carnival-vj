import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const { invitationId } = await request.json();
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
      .select("*, teams(*)")
      .eq("id", invitationId)
      .single();

    if (!invitation) {
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 }
      );
    }

    // Verify the user is the team leader
    const { data: team } = await supabase
      .from("teams")
      .select("leader_id")
      .eq("id", invitation.team_id)
      .single();

    if (!team || team.leader_id !== user.id) {
      return NextResponse.json(
        { error: "Only team leaders can withdraw invitations" },
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
        status: "withdrawn",
        updated_at: new Date().toISOString(),
      })
      .eq("id", invitationId);

    if (updateError) {
      console.error("Error withdrawing invitation:", updateError);
      return NextResponse.json(
        { error: "Failed to withdraw invitation" },
        { status: 500 }
      );
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in withdraw invitation API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
