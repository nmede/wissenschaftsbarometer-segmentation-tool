# Science audience segmentation — questionnaire & live dashboard

A multilingual (DE / FR / IT / EN) online questionnaire that places each respondent
into one of the four **Wissenschaftsbarometer Schweiz** audience segments, plus a
per-customer live dashboard showing segment counts in real time.

Built to be hosted for free on **GitHub Pages** (static front-end) with
**Supabase** (Zurich region) as the data backend.

## The four segments

The typology is ordinal, from most to least engaged with science:

1. **Sciencephiles** (DE: Sciencephile, FR: Scientophiles, IT: Sciencephile) — strongly interested, informed, high trust
2. **Critically Interested** (Kritisch Interessierte / Intéressés critiques / Interessati critici) — pro science but with lower trust, favouring clear limits
3. **Passive Supporters** (Passive Unterstützer / Soutiens passifs / Sostenitori passivi) — favourable but from a distance, little interest
4. **Skeptics** (Skeptische / Sceptiques / Scettici) — little interest, distanced, rather distrustful

## How classification works

Each completed questionnaire is scored **in the respondent's browser** by
`js/scoring.js`, an exact port of the official SPSS TwoStep cluster-classification
syntax (`Syntax_BerechnungSegmente_CATI_2022.sps`). The score uses 20 variables:
science interest, two information-behaviour items, eight "goals of science" items,
seven "promise/reservations" items, trust in science, and a scientific-literacy
index built from five knowledge items.

Only the resulting segment (plus coarse aggregates) is sent to the database — the
scoring never needs a server, and works even before the backend is configured.

### Validated against the original data

`validation/validate_scoring.py` re-scores all 1,052 respondents from the 2022
CATI dataset and checks the result against the SPSS assignments:

```
Agreement with SPSS: 1052/1052 = 100.00%
PASS — exact replication of the SPSS typology.
```

The JavaScript port reproduces the same 1,052/1,052 assignments.

## What's in here

```
index.html              The questionnaire (what respondents fill in)
dashboard.html          The live monitoring dashboard (one per customer)
js/
  scoring.js            Segment classification (validated SPSS port)
  content.js            All questionnaire wording in DE / FR / IT
  config.js             ← edit this: Supabase URL, key, survey ID
img/logo.png            Wissenschaftsbarometer logo
fonts/                  Drop your licensed Akkurat Pro .woff2 files here
supabase/
  schema.sql            Database tables, security rules, dashboard function
validation/
  validate_scoring.py   Reproducible proof the scoring matches SPSS
DEPLOYMENT.md           Step-by-step hosting & per-customer setup
```

## Quick preview (no setup)

- Open `index.html` in a browser — the questionnaire runs and shows the
  respondent's segment at the end. Without a configured backend it simply
  skips the save step (preview mode).
- Open `dashboard.html?demo=1` — the dashboard renders with sample data.

## Deploying for real

See **[DEPLOYMENT.md](DEPLOYMENT.md)** for the full walkthrough: creating the
Supabase project in the Zurich region, running `schema.sql`, filling in
`config.js`, publishing to GitHub Pages, and adding a customer with their own
access-protected dashboard.

## A note on the questionnaire

This online version asks the 20 segmentation items **plus** extra interest
topics, two additional trust items, a science-connection block, religiosity,
political orientation, demographics (birth year, gender, education, canton) and
a voluntary follow-up contact question — on 9 thematic pages with the classic
grid layout and randomized item order within batteries. Only the 20 validated
items feed the classification; everything else is stored for monitoring.
The DE/FR/IT wording of official items follows the 2022 instrument; the EN
version and a few added items (interest topics, contact block) are project
translations, not validated instrument wording. It deliberately omits the many other questions from the full 20-minute
CATI interview. The classification model is applied unchanged, but because the
surrounding question context differs from the original telephone survey, treat the
segment shares as a close indication rather than an exact reproduction of official
Wissenschaftsbarometer figures. See DEPLOYMENT.md for more on this.

## Attribution

Instrument and typology: **Wissenschaftsbarometer Schweiz**, Universität Zürich.
Use of the instrument and typology requires permission from the Wissenschaftsbarometer team.
