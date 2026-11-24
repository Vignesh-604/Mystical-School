"use client";

import { useActionState } from "react";
import { completeTestPaymentAction, type CheckoutState } from "@/app/actions/checkout";
import { PendingButton } from "./pending-button";
import { Notice } from "./ui";

export function CheckoutForm({ orderId, amountLabel }: { orderId: string; amountLabel: string }) {
  const [state, action] = useActionState<CheckoutState, FormData>(completeTestPaymentAction, undefined);
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="orderId" value={orderId} />
      {state?.error ? <Notice tone="rose">{state.error}</Notice> : null}
      <PendingButton size="lg" className="w-full" pendingLabel="Processing test payment…">
        Complete test payment · {amountLabel}
      </PendingButton>
    </form>
  );
}
