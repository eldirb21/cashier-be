// src/utils/identifier.js
//
// Mendeteksi apakah identifier adalah email atau nomor telepon,
// lalu mengembalikan value yang sudah dinormalisasi.

/**
 * @param {string} identifier
 * @returns {{ type: 'email'|'phone', value: string } | null}
 */
const parseIdentifier = (identifier) => {
    if (!identifier || typeof identifier !== "string") return null;

    const trimmed = identifier.trim();

    // ── Email check ──────────────────────────────────────────────
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(trimmed)) {
        return { type: "email", value: trimmed.toLowerCase() };
    }

    // ── Phone check ──────────────────────────────────────────────
    // Bersihkan karakter non-digit kecuali + di awal
    const rawPhone = trimmed.replace(/[\s\-\.\(\)]/g, "");
    // Format yang diterima: 08xxx, 628xxx, +628xxx, 8xxx (Indonesia)
    const phoneRegex = /^(\+?62|0)?[8][0-9]{8,12}$/;

    if (phoneRegex.test(rawPhone)) {
        let normalized = rawPhone;
        if (normalized.startsWith("08")) {
            normalized = "+62" + normalized.slice(1);
        } else if (normalized.startsWith("628")) {
            normalized = "+" + normalized;
        } else if (normalized.startsWith("8")) {
            normalized = "+62" + normalized;
        }
        // Sudah dalam format +62xxx, biarkan apa adanya
        return { type: "phone", value: normalized };
    }

    return null;
};

/**
 * Buat Prisma WHERE clause dari identifier
 * @param {string} identifier
 * @returns {object|null}
 */
const buildWhereFromIdentifier = (identifier) => {
    const parsed = parseIdentifier(identifier);
    if (!parsed) return null;
    return parsed.type === "email"
        ? { email: parsed.value }
        : { phone: parsed.value };
};

module.exports = { parseIdentifier, buildWhereFromIdentifier };