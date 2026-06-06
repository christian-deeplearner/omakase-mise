// POST /api/store/checkout
// Validates the checkout payload with zod, then creates a real order via the
// data-layer's createOrder (price + totals are resolved server-side; the
// client cannot dictate price). Returns the new order on success.

import { NextResponse } from "next/server";
import { z } from "zod";
import { createOrder } from "@/lib/data-layer";

const CheckoutSchema = z.object({
  customerName: z.string().trim().min(1, "Name is required"),
  customerEmail: z.string().trim().email("A valid email is required"),
  // Shipping is collected for realism; the fake data-layer doesn't persist it,
  // but we validate its shape so the form contract is honest.
  shipping: z
    .object({
      address: z.string().trim().min(1),
      city: z.string().trim().min(1),
      postalCode: z.string().trim().min(1),
      country: z.string().trim().min(1),
    })
    .optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1, "Cart is empty"),
});

export async function POST(request: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const parsed = CheckoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 422 },
    );
  }

  const { customerName, customerEmail, items } = parsed.data;

  try {
    const order = createOrder({
      customerName,
      customerEmail,
      items: items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
      })),
      channel: "web",
    });
    return NextResponse.json({ order }, { status: 201 });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Could not create order";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
