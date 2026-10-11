import { attachDatabasePool } from "@neon/functions";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;
const allowedOrigins = new Set(
  (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
);
const allowAllOrigins = allowedOrigins.has("*");

if (!databaseUrl) throw new Error("Neon did not inject DATABASE_URL for this function.");
if (!allowedOrigins.size) throw new Error("Configure ALLOWED_ORIGINS before deploying the inquiry function.");

const pool = new Pool({ connectionString: databaseUrl, max: 5 });
attachDatabasePool(pool);

const allowedServices = new Set([
  "Graphic Design",
  "2D Animation",
  "2D Character Design",
  "Video Content Creation",
  "Something else"
]);
const allowedBudgets = new Set([
  "",
  "Under $500",
  "$500 – $1,500",
  "$1,500 – $5,000",
  "$5,000+",
  "Let’s discuss"
]);
const maximumBodyBytes = 8_192;

function jsonResponse(body, status, origin) {
  const headers = new Headers({
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Vary": "Origin"
  });

  if (origin && (allowAllOrigins || allowedOrigins.has(origin))) {
    headers.set("Access-Control-Allow-Origin", allowAllOrigins ? "*" : origin);
    headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Content-Type");
  }

  return new Response(JSON.stringify(body), { status, headers });
}

export default {
  async fetch(request) {
    const origin = request.headers.get("origin");
    if (!origin || (!allowAllOrigins && !allowedOrigins.has(origin))) {
      return jsonResponse({ ok: false, error: "Origin not allowed." }, 403, null);
    }

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": allowAllOrigins ? "*" : origin,
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Max-Age": "600",
          "Vary": "Origin"
        }
      });
    }

    if (request.method !== "POST") {
      return jsonResponse({ ok: false, error: "Method not allowed." }, 405, origin);
    }

    if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) {
      return jsonResponse({ ok: false, error: "Content-Type must be application/json." }, 415, origin);
    }

    const contentLength = Number(request.headers.get("content-length"));
    if (Number.isFinite(contentLength) && contentLength > maximumBodyBytes) {
      return jsonResponse({ ok: false, error: "Request is too large." }, 413, origin);
    }

    let payload;
    try {
      payload = await request.json();
    } catch {
      return jsonResponse({ ok: false, error: "Invalid JSON request." }, 400, origin);
    }

    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      return jsonResponse({ ok: false, error: "Invalid inquiry." }, 400, origin);
    }

    if (typeof payload.website === "string" && payload.website.trim()) {
      return jsonResponse({ ok: true, spam: true }, 200, origin);
    }

    const name = typeof payload.name === "string" ? payload.name.trim() : "";
    const email = typeof payload.email === "string" ? payload.email.trim() : "";
    const service = typeof payload.service === "string" ? payload.service.trim() : "";
    const budget = typeof payload.budget === "string" ? payload.budget.trim() : "";
    const message = typeof payload.message === "string" ? payload.message.trim() : "";

    if (
      !name || name.length > 120
      || !email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      || !allowedServices.has(service)
      || !allowedBudgets.has(budget)
      || !message || message.length > 4000
    ) {
      return jsonResponse({ ok: false, error: "Please check the inquiry fields and try again." }, 400, origin);
    }

    try {
      await pool.query(
        `INSERT INTO public.client_inquiries (name, email, service, budget, message)
         VALUES ($1, $2, $3, $4, $5)`,
        [name, email, service, budget || null, message]
      );
      return jsonResponse({ ok: true, saved: true }, 201, origin);
    } catch (error) {
      console.error("Unable to save client inquiry to Neon:", error);
      return jsonResponse({ ok: false, error: "Unable to save inquiry." }, 500, origin);
    }
  }
};
