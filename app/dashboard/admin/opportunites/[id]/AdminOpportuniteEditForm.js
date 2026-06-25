"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const PROVINCES = ["Anvers", "Bruxelles", "Flandre orientale", "Flandre occidentale", "Brabant flamand", "Brabant wallon", "Hainaut", "Liège", "Luxembourg", "Namur", "Limbourg"];
const ACTIVITES = ["Comptabilité", "Fiscalité", "Création d'entreprise", "Gestion salariale", "Transmission d'entreprise", "Juridique", "Autre"];
const MONTANT_REVENTE_OPTIONS = [
  "0 – 100 k€", "100 – 250 k€", "250 – 500 k€", "500 k€ – 1 M€",
  "1 – 2 M€", "2 – 3 M€", "3 – 4 M€", "4 – 5 M€", "+ 5 M€",
];
const TYPE_DEALS = [
  { value: "VENTE", label: "Vente" },
  { value: "FUSION", label: "Fusion" },
  { value: "OUVERTURE_CAPITAL", label: "Ouverture du capital" },
  { value: "COLLABORATION", label: "Collaboration" },
  { value: "LIQUIDATION", label: "Liquidation" },
];
const PRESENCE = [
  { value: "OUI", label: "Oui" },
  { value: "OUI_PROVISOIRE", label: "Oui (provisoire)" },
  { value: "NON", label: "Non" },
];
const STATUTS = [
  { value: "ACTIVE", label: "En ligne" },
  { value: "PENDING", label: "À valider" },
  { value: "HIDDEN", label: "Masquée" },
  { value: "CLOSED", label: "Clôturée" },
];

function CustomSelect({ value, onChange, options, placeholder }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <button type="button" onClick={() => setOpen(!open)}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 14px", borderRadius: 10, border: `1.5px solid ${open ? "#FF5A1F" : "#E5E7EB"}`, background: "#FAFAFA", fontSize: 14, color: value ? "#141414" : "#9CA3AF", cursor: "pointer", outline: "none" }}>
        <span>{value || placeholder}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {open && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 10 }} onClick={() => setOpen(false)} />
          <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 20, background: "#fff", borderRadius: 12, border: "1px solid #F3F4F6", boxShadow: "0 8px 24px rgba(0,0,0,0.08)", overflow: "hidden", maxHeight: 240, overflowY: "auto" }}>
            {options.map(o => (
              <button key={o} type="button" onClick={() => { onChange(o); setOpen(false); }}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "10px 14px", textAlign: "left", fontSize: 13, color: value === o ? "#141414" : "#6B7280", fontWeight: value === o ? 600 : 400, background: value === o ? "#F9FAFB" : "transparent", border: "none", cursor: "pointer", borderBottom: "1px solid #F9FAFB" }}>
                <span>{o}</span>
                {value === o && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FF5A1F" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function AdminOpportuniteEditForm({ initialData }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [newAddress, setNewAddress] = useState("");

  const [form, setForm] = useState({
    province: initialData.province || "",
    chiffreAffaires: initialData.chiffreAffaires ?? "",
    nombreClients: initialData.nombreClients ?? "",
    nombreCollaborateurs: initialData.nombreCollaborateurs ?? "",
    activites: initialData.activites || [],
    typeDeal: initialData.typeDeal || [],
    presenceDirigeant: initialData.presenceDirigeant || "NON",
    description: initialData.description || "",
    logiciels: initialData.logiciels || "",
    montantRevente: initialData.montantRevente || "",
    typeVente: initialData.typeVente || "",
    utiliseBrio: initialData.utiliseBrio ?? false,
    exclusiviteCompagnie: initialData.exclusiviteCompagnie ?? false,
    nomCompagnie: initialData.nomCompagnie || "",
    venteImmeuble: initialData.venteImmeuble ?? false,
    dossierDigitalise: initialData.dossierDigitalise ?? false,
    caIard: initialData.caIard ?? "",
    caVie: initialData.caVie ?? "",
    caCreditImmo: initialData.caCreditImmo ?? "",
    caCreditTempo: initialData.caCreditTempo ?? "",
    caPlacement: initialData.caPlacement ?? "",
    caBanque: initialData.caBanque ?? "",
    valeurImmeuble: initialData.valeurImmeuble ?? "",
    adressesComplementaires: initialData.adressesComplementaires || [],
    status: initialData.status || "ACTIVE",
  });

  const isVente = form.typeDeal.includes("VENTE");

  function toggleArray(key, value) {
    setForm(prev => {
      const has = prev[key].includes(value);
      const arr = has ? prev[key].filter(v => v !== value) : [...prev[key], value];
      const extra = (key === "typeDeal" && value === "VENTE" && has) ? { montantRevente: "", typeVente: "" } : {};
      return { ...prev, [key]: arr, ...extra };
    });
  }

  function addAddress() {
    const v = newAddress.trim();
    if (v && !form.adressesComplementaires.includes(v)) {
      setForm(prev => ({ ...prev, adressesComplementaires: [...prev.adressesComplementaires, v] }));
      setNewAddress("");
    }
  }
  function removeAddress(i) {
    setForm(prev => ({ ...prev, adressesComplementaires: prev.adressesComplementaires.filter((_, j) => j !== i) }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true); setError(""); setSuccess(false);
    const res = await fetch(`/api/admin/opportunites/${initialData.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (!res.ok) { setError("Une erreur est survenue lors de l'enregistrement."); return; }
    setSuccess(true);
    router.refresh();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const inputStyle = {
    width: "100%", padding: "11px 14px", borderRadius: 10,
    border: "1.5px solid #E5E7EB", fontSize: 14, boxSizing: "border-box",
    outline: "none", background: "#FAFAFA", color: "#141414", transition: "border-color 0.2s",
  };
  const labelStyle = {
    display: "block", fontSize: 11, fontWeight: 700, color: "#6B7280",
    textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8,
  };
  const sectionStyle = {
    background: "#fff", borderRadius: 16, border: "1px solid #F3F4F6", padding: "24px", marginBottom: 14,
  };
  const sectionTitle = (title, sub) => (
    <div style={{ marginBottom: 18 }}>
      <h2 style={{ fontSize: 14, fontWeight: 700, color: "#141414", margin: 0 }}>{title}</h2>
      {sub && <p style={{ fontSize: 12, color: "#9CA3AF", margin: "2px 0 0" }}>{sub}</p>}
    </div>
  );
  const onFocus = e => (e.target.style.borderColor = "#FF5A1F");
  const onBlur = e => (e.target.style.borderColor = "#E5E7EB");

  const chip = (selected) => ({
    padding: "9px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer",
    border: `1.5px solid ${selected ? "#FF5A1F" : "#E5E7EB"}`,
    background: selected ? "rgba(255,90,31,0.1)" : "#FAFAFA",
    color: selected ? "#C2410C" : "#6B7280", transition: "all 0.15s",
    display: "flex", alignItems: "center", gap: 6,
  });

  const checkbox = (checked, onClick, label) => (
    <button type="button" onClick={onClick}
      style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", borderRadius: 10, border: `1.5px solid ${checked ? "#FF5A1F" : "#E5E7EB"}`, background: checked ? "rgba(255,90,31,0.08)" : "#FAFAFA", cursor: "pointer", width: "100%", textAlign: "left" }}>
      <div style={{ width: 18, height: 18, borderRadius: 5, flexShrink: 0, background: checked ? "#FF5A1F" : "#fff", border: `1.5px solid ${checked ? "#FF5A1F" : "#D1D5DB"}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {checked && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
      </div>
      <span style={{ fontSize: 13, fontWeight: 600, color: checked ? "#141414" : "#6B7280" }}>{label}</span>
    </button>
  );

  return (
    <form onSubmit={handleSubmit}>
      <style>{`
        @media (max-width: 1024px) {
          .opp-grid2 { grid-template-columns: 1fr !important; }
          .opp-grid3 { grid-template-columns: 1fr 1fr !important; }
          .opp-vente-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {success && (
        <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 10, padding: "12px 16px", color: "#15803D", fontSize: 13, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          Opportunité mise à jour avec succès !
        </div>
      )}
      {error && (
        <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "12px 16px", color: "#DC2626", fontSize: 13, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* Informations générales */}
      <div style={sectionStyle}>
        {sectionTitle("Informations générales", "Localisation, statut et chiffres principaux")}
        <div className="opp-grid2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
          <div>
            <label style={labelStyle}>Province</label>
            <CustomSelect value={form.province} onChange={val => setForm({ ...form, province: val })} options={PROVINCES} placeholder="Sélectionner" />
          </div>
          <div>
            <label style={labelStyle}>Statut</label>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={inputStyle} onFocus={onFocus} onBlur={onBlur}>
              {STATUTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>
        <div className="opp-grid3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
          <div>
            <label style={labelStyle}>Chiffre d'affaires (€)</label>
            <input type="number" min="0" value={form.chiffreAffaires} onChange={e => setForm({ ...form, chiffreAffaires: e.target.value })} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
          </div>
          <div>
            <label style={labelStyle}>Nombre de clients</label>
            <input type="number" min="0" value={form.nombreClients} onChange={e => setForm({ ...form, nombreClients: e.target.value })} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
          </div>
          <div>
            <label style={labelStyle}>Collaborateurs</label>
            <input type="number" min="0" value={form.nombreCollaborateurs} onChange={e => setForm({ ...form, nombreCollaborateurs: e.target.value })} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
          </div>
        </div>
      </div>

      {/* Type de transaction + présence dirigeant */}
      <div style={sectionStyle}>
        {sectionTitle("Type de transaction", "Plusieurs choix possibles")}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
          {TYPE_DEALS.map(t => {
            const sel = form.typeDeal.includes(t.value);
            return (
              <button key={t.value} type="button" onClick={() => toggleArray("typeDeal", t.value)} style={chip(sel)}>
                {sel && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FF5A1F" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Détails de la vente (si VENTE) */}
        {isVente && (
          <div style={{ background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: 12, padding: "16px", marginBottom: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EA580C" strokeWidth="2" style={{ flexShrink: 0 }}><path d="M3 3v18h18"/><path d="M18 9l-6 6-3-3-3 3"/></svg>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#C2410C", textTransform: "uppercase", letterSpacing: "0.04em" }}>Détails de la vente</span>
            </div>
            <div className="opp-vente-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={labelStyle}>Montant de revente souhaité</label>
                <CustomSelect value={form.montantRevente} onChange={val => setForm({ ...form, montantRevente: val })} options={MONTANT_REVENTE_OPTIONS} placeholder="Sélectionner une tranche" />
              </div>
              <div>
                <label style={labelStyle}>Type de vente</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    { value: "ACTION", label: "Vente d'actions" },
                    { value: "FONDS_DE_COMMERCE", label: "Vente de fonds de commerce" },
                  ].map(opt => {
                    const sel = form.typeVente === opt.value;
                    return (
                      <button key={opt.value} type="button" onClick={() => setForm({ ...form, typeVente: opt.value })}
                        style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, cursor: "pointer", textAlign: "left", border: `1.5px solid ${sel ? "#FF5A1F" : "#E5E7EB"}`, background: sel ? "rgba(255,90,31,0.08)" : "#fff", transition: "all 0.15s" }}>
                        <div style={{ width: 16, height: 16, borderRadius: "50%", border: `2px solid ${sel ? "#FF5A1F" : "#D1D5DB"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {sel && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#FF5A1F" }} />}
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: sel ? "#C2410C" : "#374151" }}>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        <label style={labelStyle}>Présence du dirigeant après cession</label>
        <select value={form.presenceDirigeant} onChange={e => setForm({ ...form, presenceDirigeant: e.target.value })} style={{ ...inputStyle, maxWidth: 280 }} onFocus={onFocus} onBlur={onBlur}>
          {PRESENCE.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
      </div>

      {/* Activités */}
      <div style={sectionStyle}>
        {sectionTitle("Activités", "Domaines couverts par le cabinet")}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {ACTIVITES.map(act => {
            const sel = form.activites.includes(act);
            return (
              <button key={act} type="button" onClick={() => toggleArray("activites", act)} style={chip(sel)}>
                {sel && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FF5A1F" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                {act}
              </button>
            );
          })}
        </div>
      </div>

      {/* Caractéristiques */}
      <div style={sectionStyle}>
        {sectionTitle("Caractéristiques du dossier", "Informations complémentaires")}
        <div className="opp-grid2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
          {checkbox(form.venteImmeuble, () => setForm({ ...form, venteImmeuble: !form.venteImmeuble }), "Vente d'immeuble incluse")}
          {checkbox(form.dossierDigitalise, () => setForm({ ...form, dossierDigitalise: !form.dossierDigitalise }), "Dossiers digitalisés")}
        </div>
        <div className="opp-grid2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div>
            <label style={labelStyle}>Valeur de l'immeuble (€, si vente)</label>
            <input type="number" min="0" value={form.valeurImmeuble} onChange={e => setForm({ ...form, valeurImmeuble: e.target.value })} style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
          </div>
          <div>
            <label style={labelStyle}>Logiciels utilisés</label>
            <input type="text" value={form.logiciels} onChange={e => setForm({ ...form, logiciels: e.target.value })} placeholder="Winbooks, Horus, Yuki..." style={inputStyle} onFocus={onFocus} onBlur={onBlur} />
          </div>
        </div>
      </div>

      {/* Description */}
      <div style={sectionStyle}>
        {sectionTitle("Description")}
        <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
          placeholder="Description du dossier..." rows={5}
          style={{ ...inputStyle, resize: "vertical", minHeight: 100 }} onFocus={onFocus} onBlur={onBlur} />
      </div>

      {/* Adresses complémentaires */}
      <div style={sectionStyle}>
        {sectionTitle("Bureaux supplémentaires", "Adresses des bureaux additionnels")}
        {form.adressesComplementaires.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
            {form.adressesComplementaires.map((addr, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "#F9FAFB", borderRadius: 10, border: "1px solid #F3F4F6" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF5A1F" strokeWidth="2" style={{ flexShrink: 0 }}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <span style={{ flex: 1, fontSize: 14, color: "#374151" }}>{addr}</span>
                <button type="button" onClick={() => removeAddress(i)}
                  style={{ background: "none", border: "none", color: "#9CA3AF", cursor: "pointer", fontSize: 18, lineHeight: 1, padding: "0 4px" }}>×</button>
              </div>
            ))}
          </div>
        )}
        <div style={{ display: "flex", gap: 8 }}>
          <input type="text" value={newAddress} onChange={e => setNewAddress(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addAddress(); } }}
            placeholder="Rue Exemple 12, 4000 Liège" style={{ ...inputStyle, flex: 1 }} onFocus={onFocus} onBlur={onBlur} />
          <button type="button" onClick={addAddress}
            style={{ background: "#141414", color: "#fff", fontSize: 13, fontWeight: 600, padding: "11px 18px", borderRadius: 10, border: "none", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0 }}>
            + Ajouter
          </button>
        </div>
      </div>

      <button type="submit" disabled={loading}
        style={{ width: "100%", maxWidth: 400, padding: "14px", borderRadius: 10, background: loading ? "#E5E7EB" : "#141414", color: loading ? "#9CA3AF" : "#fff", fontWeight: 700, fontSize: 14, border: "none", cursor: loading ? "not-allowed" : "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: !loading ? "0 4px 20px rgba(20,20,20,0.2)" : "none", marginBottom: 32 }}>
        {loading ? "Enregistrement..." : <>Enregistrer les modifications <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg></>}
      </button>
    </form>
  );
}