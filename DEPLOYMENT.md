# Deployment guide

This walks you through publishing the questionnaire and giving each customer their
own access-protected dashboard. Two services are involved, both with free tiers:

- **GitHub Pages** — hosts the static files (questionnaire + dashboard). Free.
- **Supabase** — stores the responses and serves dashboard aggregates. Free tier
  is enough for typical volumes; can be hosted in the **Zurich region**.

You only set this up **once**. Adding a new customer afterwards is two steps.

---

## 1. Create the Supabase project (data lives in Switzerland)

1. Sign up at supabase.com and click **New project**.
2. For **Region**, choose **Central Europe (Zurich) — eu-central-2**. This keeps
   the stored data physically in Switzerland. (See the data-privacy note at the
   bottom about what this does and does not guarantee legally.)
3. Wait for the project to finish provisioning.

## 2. Create the database tables and rules

1. In your Supabase project, open **SQL Editor → New query**.
2. Paste the entire contents of `supabase/schema.sql` and click **Run**.

This creates:
- a `responses` table (all customers' data, separated by a `survey_id` column),
- security rules so the public key can **only add responses, never read them**,
- a `surveys` table holding each customer's access code (stored hashed),
- a `survey_summary_secured()` function the dashboard uses to read **counts only**,
  and only when the correct access code is supplied.

## 3. Get your keys

In Supabase, open **Settings → API** and copy:
- **Project URL** (looks like `https://abcd1234.supabase.co`)
- **anon public** key (a long token)

The anon key is designed to be public and safe to put in the browser: with the
rules from `schema.sql` it can only insert responses and call the aggregate
function — it cannot read raw responses or the access codes.

## 4. Fill in `config.js`

Open `js/config.js` and set:

```js
const CONFIG = {
  SUPABASE_URL: "https://abcd1234.supabase.co",   // your Project URL
  SUPABASE_ANON_KEY: "eyJhbGciOi...",             // your anon public key
  SURVEY_ID: "demo-survey"                          // see step 6 (per customer)
};
```

## 5. Publish to GitHub Pages

1. Create a new GitHub repository and upload all the files (keep the folder
   structure: `index.html`, `dashboard.html`, `js/`, etc.).
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source: Deploy from a branch**, pick
   your `main` branch and the `/ (root)` folder, and **Save**.
4. After a minute your site is live at
   `https://YOUR-USERNAME.github.io/YOUR-REPO/`.

- Questionnaire: `https://YOUR-USERNAME.github.io/YOUR-REPO/`
- Dashboard: `https://YOUR-USERNAME.github.io/YOUR-REPO/dashboard.html`

---

## 6. Add a customer (repeat per customer)

Each customer gets their own **survey ID** and **access code**. Their data is kept
separate by the survey ID, and their dashboard is protected by the access code.

**Step A — register the customer and set their access code.** In the Supabase SQL
Editor, run (choose your own ID, name and a strong code):

```sql
select set_survey_code('museum-basel-2026', 'Museum Basel', 'choose-a-strong-code');
```

**Step B — give the customer their questionnaire link.** The questionnaire needs to
know which survey the responses belong to. The simplest approach is one deployment
per customer: set `SURVEY_ID` in `config.js` to their ID before publishing.

If you want a **single deployment serving several customers**, change the last line
of the config-reading code so the survey ID can come from the URL. In
`index.html` you can replace the `CONFIG.SURVEY_ID` used when saving with a value
read from `?c=`:

```js
// near the top of the <script> in index.html
var params = new URLSearchParams(location.search);
var SURVEY = params.get("c") || CONFIG.SURVEY_ID;
```

...and use `SURVEY` instead of `CONFIG.SURVEY_ID` in `buildRow`. Then the
per-customer link is:

```
https://YOUR-USERNAME.github.io/YOUR-REPO/?c=museum-basel-2026
```

**Step C — give the customer their dashboard.** Send them:

```
https://YOUR-USERNAME.github.io/YOUR-REPO/dashboard.html?survey=museum-basel-2026
```

They enter the access code you set in Step A. You can pre-fill the survey ID with
`?survey=` as shown, but the code is always required to see any numbers.

---

## Distributing the questionnaire to audiences

Customers (e.g. museums) can share their questionnaire link however they like — a
QR code on a wall label or flyer, a link on their website, a tablet at the exit.
A QR code pointing at the customer's `?c=...` link works well for on-site use.

---

## Data privacy — please read

- **What "Zurich region" gives you:** the response data is stored on servers
  physically located in Switzerland, which addresses data-*residency*
  requirements and keeps latency low for Swiss visitors.
- **What it does not give you:** Supabase is a US-incorporated company. Even with
  Swiss data residency, a US parent can in principle be subject to US legal
  process (e.g. the CLOUD Act). For most anonymous audience-segmentation surveys
  this is not an issue, but if a customer is a public body or has strict
  sovereignty requirements, consider a Swiss-hosted Postgres alternative — the
  front-end and `scoring.js` would work unchanged; only the storage layer changes.
- **What is collected:** segment, per-segment probabilities, the raw item answers,
  the science-literacy index, language, and self-reported age (year), gender and
  education. No name, email, IP or contact information is requested or stored by
  the questionnaire. The dashboard shows **aggregate counts only** and never
  exposes or downloads individual responses.
- **Consent text:** the questionnaire's intro screen states the data is used only
  for this survey's analysis and cannot identify the respondent. Adapt the wording
  in `js/content.js` (`start_intro`) to match each customer's context and any
  cantonal or institutional requirements before going live.
- If you collect responses from minors or in a school context, check the relevant
  consent requirements separately.

## Managing customers later

- **Change a code:** re-run `set_survey_code(...)` with the same survey ID and a
  new code.
- **List customers:** `select survey_id, display_name, created_at from surveys;`
- **Export a customer's data** (from the SQL editor, service role):
  `select * from responses where survey_id = 'museum-basel-2026';`
- **Delete a customer's data:**
  `delete from responses where survey_id = 'museum-basel-2026';`
