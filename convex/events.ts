import { ConvexError, v } from "convex/values";
import { query } from "./_generated/server";
import { DURATIONS, TICKET_STATUS, WAITING_LIST_STATUS } from "./constant";
import { mutation } from "./_generated/server";
import { api, internal } from "./_generated/api";

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("events")
      .filter((q) => q.eq(q.field("is_cancelled"), undefined))
      .collect();
  },
});

export const getById = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    return await ctx.db.get(eventId);
  },
});

// Helper function to check ticket availability for an event
export const getEventAvailability = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, { eventId }) => {
    const event = await ctx.db.get(eventId);
    if (!event) throw new Error("Event not found");

    // Count total purchased tickets
    const purchasedCount = await ctx.db
      .query("tickets")
      .withIndex("by_event", (q) => q.eq("eventId", eventId))
      .collect()
      .then(
        (tickets) =>
          tickets.filter(
            (t) =>
              t.status === TICKET_STATUS.VALID ||
              t.status === TICKET_STATUS.USED
          ).length
      );
    // count current valid tickets
    //(100 --> 95 sold, 5 tickets are offered to waiting list, no tickets are available)
    const now = Date.now();

    const activeOffers = await ctx.db
      .query("waitingList")
      .withIndex("by_event_status", (q) =>
        q.eq("eventId", eventId).eq("status", WAITING_LIST_STATUS.OFFERED)
      )
      .collect()
      .then(
        (entries) => entries.filter((e) => (e.offerExpiresAt ?? 0) > now).length
      );

    const totalReserved = purchasedCount + activeOffers;

    return {
      isSoldOut: totalReserved >= event.totalTickets,
      totalTickets: event.totalTickets,
      purchasedCount,
      activeOffers,
      remainingTickets: Math.max(0, event.totalTickets - totalReserved),
    };
  },
});

export const checkAvailability = query({
    args: { eventId: v.id("events") },
    handler: async (ctx, { eventId }) => {
        const event = await ctx.db.get(eventId);
        if (!event) throw new Error("Event not found");

        // Count total purchased tickets
        const purchasedCount = await ctx.db.query("tickets").withIndex(
            "by_event", (q) => q.eq("eventId", eventId)
        ).collect().then(
            (tickets) =>
                tickets.filter(
                    (t) =>
                        t.status === TICKET_STATUS.VALID ||
                        t.status === TICKET_STATUS.USED
                ).length
        )

        // count current valid tickets
        const now = Date.now();
        const activeOffers = await ctx.db.query("waitingList").withIndex(
            "by_event_status", (q) =>
                q.eq("eventId", eventId).eq("status", WAITING_LIST_STATUS.OFFERED)
        ).collect().then(
            (entries) => entries.filter((e) => (e.offerExpiresAt ?? 0) > now).length
        );

        const availableSpots = event.totalTickets - (purchasedCount + activeOffers);

        return{
            available: availableSpots > 0,
            availableSpots,
            totalTickets: event.totalTickets,
            purchasedCount,
            activeOffers,
        }
    }
})
export const joinWaitingList = mutation({
  args: { eventId: v.id("events"), userId: v.string() },
  handler: async (ctx, { eventId, userId }) => {
    //rate limiter to prevent abuse
    // const status = await rateLimiter.limit(ctx, "queueJoin", { key: userId });
    // if (!status.ok) {
    //   throw new ConvexError(
    //     `You are joining the queue too many times. Please wait ${Math.ceil((status.retryAfter / 60) * 1000)}  minutes before trying again.`
    //   );
    // }

    // Check if the user already has a ticket for this event
    const existingTicket = await ctx.db
      .query("waitingList")
      .withIndex("by_user_event", (q) =>
        q.eq("userId", userId).eq("eventId", eventId)
      )
      .filter((q) => q.neq(q.field("status"), WAITING_LIST_STATUS.EXPIRED))
      .first();

    //dont allow duplicate entries
    if (existingTicket) {
      throw new ConvexError(
        "You are already in the waiting list for this event."
      );
    }

    // verify if the event exists
    const event = await ctx.db.get(eventId);
    if (!event) {
      throw new ConvexError("Event not found.");
    }

    // check if there are available tickets or the event is sold out
    const { available } = await ctx.runQuery(api.events.checkAvailability, {
      eventId,
    });

    const now = Date.now();

    if (available) {
      const waitingListId = await ctx.db.insert("waitingList", {
        eventId,
        userId,
        status: WAITING_LIST_STATUS.OFFERED, //Mark as offered
        offerExpiresAt: now + DURATIONS.TICKET_OFFER, //set expires time
      });

      //schedule a task to expire this offer affter the offer duration
      await ctx.scheduler.runAfter(
        DURATIONS.TICKET_OFFER,
        internal.waitingList.expireOffer,
        { waitingListId, eventId }
      );
    } else {
      // If no tickets are available, add the user to the waiting list
      await ctx.db.insert("waitingList", {
        eventId,
        userId,
        status: WAITING_LIST_STATUS.WAITING, //Mark as waiting
      });
    }

    return {
        success: true,
        status: available
            ? WAITING_LIST_STATUS.OFFERED
            : WAITING_LIST_STATUS.WAITING,
        message: available
            ?`Ticket Offered! - you have ${DURATIONS.TICKET_OFFER / (60 *1000)} minutes to claim your ticket.`
            : "You have been added to the waiting list. - you will be notified if a ticket becomes available.",

    }
  },
});
