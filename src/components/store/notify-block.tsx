"use client";

// The dark "JOIN THE LIST" block that anchors the storefront footer — the
// drop-notify CTA. Email capture — no backend; it confirms locally. Client
// component for the controlled input + submit state.

import * as React from "react";
import { ArrowRight } from "lucide-react";

export function NotifyBlock() {
  const [email, setEmail] = React.useState("");
  const [done, setDone] = React.useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.trim()) return;
    setDone(true);
  }

  return (
    <section className="bg-panel text-paper-on-panel">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 sm:px-10 md:grid-cols-2 md:gap-16 md:py-28">
        <div>
          <p className="label text-paper-on-panel/60">Join the List</p>
          <h2 className="display mt-6 text-4xl text-paper-on-panel sm:text-5xl">
            The next drop,
            <br />
            before anyone else.
          </h2>
        </div>

        <div className="flex flex-col justify-end">
          <p className="serif text-lg text-paper-on-panel/70">
            New collections and limited drops, quietly. Leave a line and we will
            tell you first.
          </p>

          {done ? (
            <p
              className="serif mt-8 border-t border-paper-on-panel/20 pt-8 text-xl text-paper-on-panel"
              role="status"
              data-testid="notify-confirmation"
            >
              Thank you. We will be in touch.
            </p>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mt-8 flex items-center gap-4 border-b border-paper-on-panel/30 pb-3"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@somewhere.com"
                aria-label="Email address"
                className="w-full bg-transparent font-sans text-base text-paper-on-panel outline-none placeholder:text-paper-on-panel/40"
              />
              <button
                type="submit"
                aria-label="Join the list"
                className="shrink-0 text-paper-on-panel transition-transform hover:translate-x-1"
              >
                <ArrowRight className="size-5" strokeWidth={1.5} />
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
