# Einbindung in die WordPress-Website (wissenschaftsbarometer.ch)

Die Plattform besteht aus statischen Dateien + Supabase-Backend. Das Backend
bleibt in jedem Fall unverändert; es geht nur darum, wo die Dateien liegen
bzw. wie sie auf der Website erscheinen. Mit reinem wp-admin-Zugang gibt es
zwei Wege.

## Weg 1 — Sofort machbar: Einbetten per iframe (Hosting bleibt GitHub Pages)

Fragebogen und öffentliches Dashboard werden in normale WordPress-Seiten
eingebettet; die Dateien bleiben, wo sie sind. Besucher sehen
wissenschaftsbarometer.ch mit Ihrer Navigation, der Inhalt kommt aus dem
iframe. Beide Seiten melden ihre Höhe automatisch an die umgebende Seite
(seit diesem Update), daher keine doppelten Scrollbalken.

Neue Seite anlegen → Block «Individuelles HTML» einfügen → einfügen:

### Fragebogen
```html
<iframe id="wb-embed" title="Umfrage"
  src="https://nmede.github.io/wissenschaftsbarometer-segmentation-tool/?c=IHRE-SURVEY-ID"
  style="width:100%;border:0;min-height:900px"></iframe>
<script>
window.addEventListener("message", function(e){
  if(e.origin !== "https://nmede.github.io") return;
  if(e.data && e.data.type === "wb-height"){
    document.getElementById("wb-embed").style.height = (e.data.height + 24) + "px";
  }
});
</script>
```

### Öffentliches Dashboard (für eine Veranstaltungs-Seite)
```html
<iframe id="wb-embed" title="Live-Ergebnisse"
  src="https://nmede.github.io/wissenschaftsbarometer-segmentation-tool/public.html?survey=IHRE-SURVEY-ID&token=IHR-TOKEN"
  style="width:100%;border:0;min-height:900px"></iframe>
<script>
window.addEventListener("message", function(e){
  if(e.origin !== "https://nmede.github.io") return;
  if(e.data && e.data.type === "wb-height"){
    document.getElementById("wb-embed").style.height = (e.data.height + 24) + "px";
  }
});
</script>
```

Hinweise:
- Falls WordPress das `<script>` beim Speichern entfernt (fehlendes
  `unfiltered_html`-Recht), nur den iframe verwenden und
  `min-height:1800px` setzen — dann scrollt der iframe intern.
- Kundendashboard und Admin.Hub NICHT einbetten, sondern direkt verlinken
  (Login-Seiten); den Hub am besten gar nicht öffentlich verlinken.

## Weg 2 — Dateien auf den eigenen Server (per Datei-Manager-Plugin)

Wenn Ihr wp-admin-Konto Administrator-Rechte hat und Plugins installieren
darf, lässt sich der fehlende FTP-Zugang ersetzen:

1. Plugins → Installieren → z.B. «File Manager» installieren und aktivieren.
2. Im Datei-Manager ins Web-Root wechseln (dort, wo wp-content liegt),
   Ordner `segmente` anlegen.
3. `science-segments.zip` hochladen und dort entpacken (Inhalt des Ordners
   direkt nach `/segmente/`, nicht verschachtelt).
4. Testen: wissenschaftsbarometer.ch/segmente/dashboard.html?demo=1
5. Aus Sicherheitsgründen das Datei-Manager-Plugin danach wieder
   deaktivieren/löschen (es gewährt vollen Dateizugriff).

Danach laufen alle vier Seiten unter Ihrer Domain; die iframe-Snippets aus
Weg 1 funktionieren identisch mit den neuen URLs (im Origin-Check dann
`https://www.wissenschaftsbarometer.ch` eintragen).

## Weg 3 — Eine E-Mail an die Website-Betreuung

Wer die Website technisch betreut (Hochschul-IT oder Agentur), hat FTP- und
DNS-Zugriff. Die Bitte ist klein und Standard — eine der beiden:
- «Bitte den Inhalt des beigefügten Zips als Ordner /segmente/ ins Web-Root
  legen.» (5 Minuten), oder
- «Bitte einen CNAME-Eintrag segmente.wissenschaftsbarometer.ch →
  nmede.github.io anlegen.» (dann übernimmt GitHub Pages das Hosting unter
  Ihrer Subdomain; in den Repo-Einstellungen anschliessend die Custom
  Domain eintragen).

## Was nicht empfohlen ist

Den Code direkt in WordPress-Seiten oder Page-Builder-Blöcke kopieren:
Theme-CSS, Skript-Optimierer und Caching-Plugins kommen sich mit den
vollständigen HTML-Dokumenten in die Quere.
