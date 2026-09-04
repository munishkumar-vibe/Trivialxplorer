"use client";

import ApprovalPage from "@/components/admin/ApprovalPage";
import { ADMIN } from "@/lib/api/endpoints";

export default function AdminBlogsPage() {
  return (
    <ApprovalPage
      title="Pending Blogs"
      pendingUrl={ADMIN.BLOGS_PENDING}
      approveUrl={ADMIN.BLOG_APPROVE}
      rejectUrl={ADMIN.BLOG_REJECT}
      contentType="blog"
    />
  );
}
