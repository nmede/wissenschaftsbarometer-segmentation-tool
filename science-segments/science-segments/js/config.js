/* =====================================================================
   config.js — deployment settings
   Edit these three values before publishing. See DEPLOYMENT.md.
   ---------------------------------------------------------------------
   SUPABASE_URL / SUPABASE_ANON_KEY:
     From your Supabase project → Settings → API. The anon key is safe to
     expose in the browser: with the Row Level Security policies from
     supabase/schema.sql, it can only INSERT responses (never read them).
   SURVEY_ID:
     A label identifying THIS customer/survey (e.g. "museum-basel-2026").
     All responses are tagged with it so each customer's data stays separate.
   ===================================================================== */


const CONFIG = {
  SUPABASE_URL: "https://ykyzmlgitpcjuwctijvq.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_qMYhBXJtGlDhVu63JyDN3A_Kg5E8FdY",
  SURVEY_ID: "ikmz-scientifica"
};

if (typeof module !== "undefined") module.exports = { CONFIG };

