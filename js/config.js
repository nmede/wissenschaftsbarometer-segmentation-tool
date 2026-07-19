/* =====================================================================
   config.js — deployment settings
   ---------------------------------------------------------------------
   SUPABASE_URL / SUPABASE_ANON_KEY:
     From your Supabase project (Connect dialog or Settings → API Keys).
     This key is safe to expose in the browser: with the Row Level
     Security policies from supabase/schema.sql, it can only INSERT
     responses (never read them).
   SURVEY_ID:
     Default survey/customer label. Can be overridden per link with ?c=.
   ===================================================================== */

const CONFIG = {
  SUPABASE_URL: "https://ykyzmlgitpcjuwctijvq.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_qMYhBXJtGlDhVu63JyDN3A_Kg5E8FdY",
  SURVEY_ID: "ikmz-scientifica"
};

if (typeof module !== "undefined") module.exports = { CONFIG };
