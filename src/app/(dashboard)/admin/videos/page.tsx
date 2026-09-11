"use client";

import ApprovalPage from "@/components/admin/ApprovalPage";
import { ADMIN } from "@/lib/api/endpoints";

export default function AdminVideosPage() {
  return (
    <ApprovalPage
      title="Pending Videos"
      pendingUrl={ADMIN.VIDEOS_PENDING}
      approveUrl={ADMIN.VIDEO_APPROVE}
      rejectUrl={ADMIN.VIDEO_REJECT}
      contentType="video"
    />
  );
}
