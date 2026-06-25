import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import AdminOpportuniteEditForm from "./AdminOpportuniteEditForm";

export default async function AdminOpportuniteEdit({ params }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  const { id } = await params;
  const opportunite = await prisma.opportunite.findUnique({
    where: { id },
    include: { vendeur: { include: { user: { select: { email: true } } } } },
  });

  if (!opportunite) notFound();

  const data = {
    ...opportunite,
    createdAt: opportunite.createdAt?.toISOString() || null,
  };

  return (
    <div style={{ maxWidth: 880 }}>
      <div style={{ marginBottom: 20 }}>
        <Link href="/dashboard/admin/opportunites"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#6B7280", textDecoration: "none", marginBottom: 14, fontWeight: 500 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Retour aux opportunités
        </Link>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#141414", margin: "0 0 4px", letterSpacing: "-0.02em" }}>
          Éditer l'opportunité
        </h1>
        <p style={{ fontSize: 13, color: "#6B7280", margin: 0 }}>
          {opportunite.province} · Déposée par {opportunite.vendeur?.user?.email || "—"}
        </p>
      </div>

      <AdminOpportuniteEditForm initialData={data} />
    </div>
  );
}