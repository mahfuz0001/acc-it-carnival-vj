import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import EventPageClient from "./EventPageClient";

async function getEvent(id: string) {
  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", Number.parseInt(id))
    .eq("is_active", true)
    .single();

  if (error || !event) {
    return null;
  }

  return event;
}

export default async function EventPage(
  props: {
    params: Promise<{ id: string }>;
  }
) {
  const params = await props.params;
  const event = await getEvent(params.id);

  if (!event) {
    notFound();
  }

  return <EventPageClient eventData={event} />;
}

export async function generateStaticParams() {
  const { data: events } = await supabase.from("events").select("id");
  return (events ?? []).map((event) => ({
    id: event.id.toString(),
  }));
}
