import { EventCard } from "./EventCard";

export function UpcomingEvents() {
  return (
    <section>
      <div className="flex justify-between items-end border-b border-horizon-mist pb-3 mb-6">
        <h2 className="font-headline text-2xl text-primary-dark font-normal">Upcoming Events</h2>
        <span className="font-body text-[10px] uppercase tracking-[0.15em] text-damascus-gold font-bold">
          Summertime Schedule
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <EventCard
          image="https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=800"
          alt="Theology"
          day="15"
          month="Jul"
          eyebrow="Seminar • 6:00 PM"
          title="Theology in the Digital Age"
          description="Analyze ancient scripture and scholastic traditions under the perspective of rapid automation and interconnected cyberspace."
        />
        <EventCard
          image="https://images.unsplash.com/photo-1431540015161-0bf868a2d407?auto=format&fit=crop&q=80&w=800"
          alt="Leadership"
          day="02"
          month="Aug"
          eyebrow="Workshop • 10:00 AM"
          title="Community Leadership Workshop"
          description="A structured course focused on organizing charity networks, leadership, public communication strategies, and volunteering."
        />
      </div>
    </section>
  );
}
