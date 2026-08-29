import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { supabase } from "@/lib/supabase";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-07-29.dahlia" });

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig  = req.headers.get("stripe-signature") ?? "";
  const secret = process.env.STRIPE_WEBHOOK_SECRET ?? "";

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err: any) {
    console.error("Webhook signature failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId  = session.metadata?.userId;
    if (userId) {
      const { error } = await supabase
        .from("users")
        .update({ is_paid: true })
        .eq("id", userId);
      if (error) console.error("Failed to mark user as paid:", error.message);
    }
  }

  return NextResponse.json({ received: true });
}
