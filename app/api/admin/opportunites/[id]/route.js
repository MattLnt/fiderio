import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    const { id } = await params;
    const opportunite = await prisma.opportunite.findUnique({
      where: { id },
      include: { vendeur: { include: { user: { select: { email: true } } } } },
    });
    if (!opportunite) {
      return NextResponse.json({ error: "Introuvable" }, { status: 404 });
    }
    return NextResponse.json(opportunite);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    const { id } = await params;
    const b = await req.json();

    const num = (v) => (v === "" || v === null || v === undefined ? null : Number(v));
    const int = (v) => (v === "" || v === null || v === undefined ? null : parseInt(v));
    const bool = (v) => (v === null || v === undefined ? null : !!v);

    const isVente = Array.isArray(b.typeDeal) && b.typeDeal.includes("VENTE");

    const updated = await prisma.opportunite.update({
      where: { id },
      data: {
        province: b.province,
        chiffreAffaires: num(b.chiffreAffaires) ?? 0,
        nombreClients: int(b.nombreClients) ?? 0,
        nombreCollaborateurs: int(b.nombreCollaborateurs) ?? 0,
        activites: Array.isArray(b.activites) ? b.activites : [],
        typeDeal: Array.isArray(b.typeDeal) ? b.typeDeal : [],
        presenceDirigeant: b.presenceDirigeant,
        description: b.description || null,
        logiciels: b.logiciels || null,

        montantRevente: isVente && b.montantRevente ? b.montantRevente : null,
        typeVente: isVente && b.typeVente ? b.typeVente : null,

        utiliseBrio: bool(b.utiliseBrio),
        exclusiviteCompagnie: bool(b.exclusiviteCompagnie),
        nomCompagnie: b.nomCompagnie || null,
        venteImmeuble: bool(b.venteImmeuble),
        dossierDigitalise: bool(b.dossierDigitalise),

        caIard: num(b.caIard),
        caVie: num(b.caVie),
        caCreditImmo: num(b.caCreditImmo),
        caCreditTempo: num(b.caCreditTempo),
        caPlacement: num(b.caPlacement),
        caBanque: num(b.caBanque),

        valeurImmeuble: int(b.valeurImmeuble),
        adressesComplementaires: Array.isArray(b.adressesComplementaires) ? b.adressesComplementaires : [],

        status: b.status,
      },
    });
    return NextResponse.json(updated);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}