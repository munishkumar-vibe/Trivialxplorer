"use client";

import ApprovalPage from "@/components/admin/ApprovalPage";
import { ADMIN } from "@/lib/api/endpoints";

export default function AdminItinerariesPage() {
  return (
    <ApprovalPage
      title="Pending Itineraries"
      pendingUrl={ADMIN.ITINS_PENDING}
      approveUrl={ADMIN.ITIN_APPROVE}
      rejectUrl={ADMIN.ITIN_REJECT}
    />
  );
}
