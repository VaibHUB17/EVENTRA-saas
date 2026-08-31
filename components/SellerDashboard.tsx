"use client";

import React, { useEffect, useState } from "react";
import { getStripeAccountStatus, type AccountStatus } from "@/actions/getStripeAccountStatus";
import { createStripeConnectCustomer } from "@/actions/CreateStripeCustomer";
import { createStripeAccountLink } from "@/actions/CreateStripeAccountLink";
import { createStripeLoginLink } from "@/actions/CreateStripeLoginLink";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import Spinner from "./Spinner";
import {
  CalendarDays,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  CreditCard,
  Banknote,
  Ticket,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Sparkles,
  Edit,
  Clock,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function SellerDashboard() {
  const [accountCreatePending, setAccountCreatePending] = useState(false);
  const [accountLinkCreatePending, setAccountLinkCreatePending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accountStatus, setAccountStatus] = useState<AccountStatus | null>(null);
  const [isStripeLoading, setIsStripeLoading] = useState(false);

  const { user } = useUser();
  const userId = user?.id;
  const router = useRouter();

  const userRecord = useQuery(
    api.users.getUserById,
    userId ? { userId } : "skip"
  );

  const sellerEvents = useQuery(
    api.events.getSellerEvents,
    userId ? { userId } : "skip"
  );

  const stripeConnectId = userRecord?.stripeConnectId ?? null;
  const isReadyToAcceptPayments = Boolean(
    accountStatus?.isActive && accountStatus?.payoutsEnabled
  );

  useEffect(() => {
    if (!stripeConnectId) return;

    const loadAccountStatus = async () => {
      try {
        setIsStripeLoading(true);
        const status = await getStripeAccountStatus(stripeConnectId);
        setAccountStatus(status);
      } catch (err) {
        console.error("Error fetching account status:", err);
      } finally {
        setIsStripeLoading(false);
      }
    };

    loadAccountStatus();
  }, [stripeConnectId]);

  if (userRecord === undefined || sellerEvents === undefined) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="lg" message="Loading your seller dashboard..." />
      </div>
    );
  }

  // Calculate Metrics from seller events
  const totalRevenue = sellerEvents.reduce(
    (acc, event) => acc + (event.metrics?.revenue ?? 0),
    0
  );

  const totalTicketsSold = sellerEvents.reduce(
    (acc, event) => acc + (event.metrics?.soldTickets ?? 0),
    0
  );

  const totalCapacity = sellerEvents.reduce(
    (acc, event) => acc + (event.totalTickets ?? 0),
    0
  );

  const upcomingEvents = sellerEvents.filter(
    (e) => e.eventDate > Date.now() && !e.is_cancelled
  );

  const pastEvents = sellerEvents.filter(
    (e) => e.eventDate <= Date.now() && !e.is_cancelled
  );

  const handleManageStripeAccount = async () => {
    try {
      if (stripeConnectId && accountStatus?.isActive) {
        const loginUrl = await createStripeLoginLink(stripeConnectId);
        window.location.href = loginUrl;
      }
    } catch (err) {
      console.error("Error accessing Stripe Connect portal:", err);
      setError("Unable to access Stripe dashboard. Please try again.");
    }
  };

  const handleCreateSellerAccount = async () => {
    setAccountCreatePending(true);
    setError(null);
    try {
      await createStripeConnectCustomer();
    } catch (err) {
      console.error("Error creating Stripe Connect account:", err);
      setError("Failed to create seller account. Please try again.");
    } finally {
      setAccountCreatePending(false);
    }
  };

  const handleCompleteRequirements = async () => {
    if (!stripeConnectId) return;
    setAccountLinkCreatePending(true);
    setError(null);
    try {
      const { url } = await createStripeAccountLink(stripeConnectId);
      if (url) {
        router.push(url);
      }
    } catch (err) {
      console.error("Error creating Stripe account link:", err);
      setError("Failed to generate Stripe onboarding link.");
    } finally {
      setAccountLinkCreatePending(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero / Header Card */}
      <div className="relative rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 overflow-hidden shadow-xl border border-slate-800">
        {/* Ambient background glows */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-indigo-600/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-blue-500/20 text-blue-300 text-xs px-3 py-1 rounded-full font-semibold border border-blue-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-blue-400" />
                Seller Command Center
              </span>
              {isReadyToAcceptPayments ? (
                <span className="bg-emerald-500/20 text-emerald-300 text-xs px-3 py-1 rounded-full font-semibold border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Payouts Active
                </span>
              ) : stripeConnectId ? (
                <span className="bg-amber-500/20 text-amber-300 text-xs px-3 py-1 rounded-full font-semibold border border-amber-500/30 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  Setup Incomplete
                </span>
              ) : (
                <span className="bg-slate-700/60 text-slate-300 text-xs px-3 py-1 rounded-full font-semibold border border-slate-600">
                  Not Connected
                </span>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Welcome back, {user?.firstName || user?.fullName || "Organizer"}
            </h1>
            <p className="text-slate-300 text-sm max-w-xl leading-relaxed">
              Track your ticket sales, manage your live event inventory, and monitor real-time Stripe revenue.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/seller/new-event"
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Plus className="w-5 h-5" />
              <span>Create Event</span>
            </Link>

            <Link
              href="/seller/events"
              className="flex items-center gap-2 bg-slate-800/90 hover:bg-slate-800 text-slate-200 hover:text-white px-4 py-2.5 rounded-xl font-medium border border-slate-700 hover:border-slate-600 transition-all shadow-sm"
            >
              <CalendarDays className="w-4 h-4 text-blue-400" />
              <span>All Events ({sellerEvents.length})</span>
            </Link>

            {accountStatus?.isActive && (
              <button
                onClick={handleManageStripeAccount}
                className="flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white px-3.5 py-2.5 rounded-xl font-medium border border-slate-700 transition-all text-sm"
                title="Open Stripe Express Portal"
              >
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span>Stripe Portal</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Revenue */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Total Revenue
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Banknote className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold text-gray-900 tracking-tight">
              ₹{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Real-time settled earnings</span>
            </div>
          </div>
        </div>

        {/* Card 2: Tickets Sold */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Tickets Sold
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Ticket className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold text-gray-900 tracking-tight">
              {totalTicketsSold}
              <span className="text-sm text-gray-400 font-normal ml-1">
                / {totalCapacity} cap
              </span>
            </p>
            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${totalCapacity > 0 ? Math.min(100, Math.round((totalTicketsSold / totalCapacity) * 100)) : 0}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Card 3: Active & Upcoming Events */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Upcoming Events
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CalendarDays className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold text-gray-900 tracking-tight">
              {upcomingEvents.length}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {pastEvents.length} completed / past events
            </p>
          </div>
        </div>

        {/* Card 4: Stripe Connect Health */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Payout Status
            </span>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${isReadyToAcceptPayments ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isReadyToAcceptPayments ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
              <p className="text-xl font-bold text-gray-900">
                {isReadyToAcceptPayments ? "Active & Ready" : stripeConnectId ? "Pending Review" : "Action Needed"}
              </p>
            </div>
            <p className="text-xs text-gray-500 mt-1 truncate">
              {stripeConnectId ? `ID: ${stripeConnectId}` : "Connect Stripe account"}
            </p>
          </div>
        </div>
      </div>

      {/* Stripe Connect Action Section */}
      {!stripeConnectId && (
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-white rounded-2xl p-6 sm:p-8 border border-blue-100 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-blue-700 font-semibold text-sm">
                <CreditCard className="w-5 h-5" />
                <span>Start Accepting Ticket Sales</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Connect your Stripe seller account
              </h2>
              <p className="text-gray-600 text-sm max-w-2xl leading-relaxed">
                Receive direct payouts into your bank account, manage refunds safely, and enable zero-delay ticket sales with official Stripe Connect integration.
              </p>
            </div>
            <button
              onClick={handleCreateSellerAccount}
              disabled={accountCreatePending}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition-all shrink-0 flex items-center gap-2"
            >
              {accountCreatePending ? (
                <>
                  <Spinner size="sm" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <span>Create Seller Account</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Stripe Requirements Alert (if any) */}
      {stripeConnectId && accountStatus?.requiresInformation && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700 shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex-1 space-y-3">
              <h3 className="font-bold text-amber-900 text-lg">
                Action Required on your Stripe Account
              </h3>
              <p className="text-amber-800 text-sm">
                Stripe requires additional business or identity details before payouts and ticket charges can be processed continuously.
              </p>

              {accountStatus.requirements.currently_due.length > 0 && (
                <div className="bg-white/80 p-3 rounded-xl border border-amber-200/60 text-xs text-amber-900 font-mono">
                  <span className="font-semibold block mb-1">Due Information:</span>
                  <ul className="list-disc pl-4 space-y-0.5">
                    {accountStatus.requirements.currently_due.map((req) => (
                      <li key={req}>{req.replace(/_/g, " ")}</li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                onClick={handleCompleteRequirements}
                disabled={accountLinkCreatePending}
                className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white font-semibold px-4 py-2 text-sm rounded-lg shadow-sm transition-all"
              >
                {accountLinkCreatePending ? "Opening Stripe..." : "Complete Requirements on Stripe →"}
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-800 font-bold ml-4">
            ✕
          </button>
        </div>
      )}

      {/* Recent Events Showcase */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Your Live & Recent Events</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Live inventory and ticket sales conversion overview
            </p>
          </div>
          <Link
            href="/seller/events"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {sellerEvents.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center text-center py-12 px-4 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
              <CalendarDays className="w-8 h-8" />
            </div>
            <div className="space-y-1 max-w-sm">
              <h3 className="font-bold text-gray-900 text-lg">No events created yet</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                You haven&apos;t created any events yet. Publish your first event to start selling tickets and accepting orders!
              </p>
            </div>
            <Link
              href="/seller/new-event"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm shadow-md transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Your First Event</span>
            </Link>
          </div>
        ) : (
          /* Events Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {sellerEvents.slice(0, 6).map((event) => {
              const isPast = event.eventDate < Date.now();
              const sold = event.metrics?.soldTickets ?? 0;
              const revenue = event.metrics?.revenue ?? 0;
              const percentSold = event.totalTickets > 0 ? Math.round((sold / event.totalTickets) * 100) : 0;

              return (
                <div
                  key={event._id}
                  className="bg-white rounded-xl border border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span
                        className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                          event.is_cancelled
                            ? "bg-red-50 text-red-700"
                            : isPast
                            ? "bg-gray-100 text-gray-700"
                            : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {event.is_cancelled ? "Cancelled" : isPast ? "Past" : "Active"}
                      </span>
                      <span className="font-bold text-sm text-gray-900">
                        ₹{event.price.toFixed(2)}
                      </span>
                    </div>

                    <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {event.name}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                      {event.description}
                    </p>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-gray-100 text-xs text-gray-600">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Tickets Sold:</span>
                      <span className="font-semibold text-gray-900">
                        {sold} / {event.totalTickets} ({percentSold}%)
                      </span>
                    </div>

                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full"
                        style={{ width: `${Math.min(100, percentSold)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <div className="flex items-center gap-1 text-gray-500">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{new Date(event.eventDate).toLocaleDateString()}</span>
                      </div>
                      <span className="font-bold text-emerald-600">
                        ₹{revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-2">
                    <Link
                      href={`/seller/events/${event._id}/edit`}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border border-gray-200"
                    >
                      <Edit className="w-3.5 h-3.5 text-gray-500" />
                      <span>Edit</span>
                    </Link>
                    <Link
                      href={`/event/${event._id}`}
                      className="inline-flex items-center justify-center p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs transition-colors"
                      title="View public event page"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
