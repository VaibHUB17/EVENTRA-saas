"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id, Doc } from "@/convex/_generated/dataModel";
import { useStorageUrl } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays, MapPin, Sparkles, ArrowRight, Ticket } from "lucide-react";

interface RecommendedEventsProps {
  currentEventId: Id<"events">;
}

function RecommendedEventCard({ event }: { event: Doc<"events"> }) {
  const imageUrl = useStorageUrl(event.imageStorageId);

  return (
    <Link
      href={`/event/${event._id}`}
      className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col h-full transform hover:-translate-y-1"
    >
      {/* Event Image Banner */}
      <div className="relative w-full h-44 bg-gray-100 overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={event.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-400">
            <Ticket className="w-12 h-12 opacity-50" />
          </div>
        )}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-gray-900 shadow-sm">
          ₹{event.price.toFixed(2)}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex flex-col flex-1 justify-between space-y-4">
        <div className="space-y-2">
          <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
            {event.name}
          </h3>
          <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
            {event.description}
          </p>
        </div>

        <div className="space-y-2 pt-2 border-t border-gray-100 text-xs text-gray-600">
          <div className="flex items-center gap-1.5">
            <CalendarDays className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="truncate">
              {new Date(event.eventDate).toLocaleDateString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between text-xs font-semibold text-blue-600 group-hover:text-blue-700">
          <span>View Details & Buy</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
}

export default function RecommendedEvents({ currentEventId }: RecommendedEventsProps) {
  const events = useQuery(api.events.get);

  if (!events) {
    return null;
  }

  const now = Date.now();

  // Filter out current event, cancelled events, and past events
  const recommended = events
    .filter((e) => e._id !== currentEventId && !e.is_cancelled && e.eventDate > now)
    .sort((a, b) => a.eventDate - b.eventDate)
    .slice(0, 3);

  if (recommended.length === 0) {
    return null;
  }

  return (
    <section className="mt-16 pt-12 border-t border-gray-200/80">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 text-blue-600 text-sm font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Discover More</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            Recommended Events You Might Like
          </h2>
        </div>
        <Link
          href="/"
          className="hidden sm:flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
        >
          <span>See all events</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommended.map((event) => (
          <RecommendedEventCard key={event._id} event={event} />
        ))}
      </div>
    </section>
  );
}
