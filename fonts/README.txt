AkkuratPro-Regular.woff2 — bundled (licensed by the Wissenschaftsbarometer team).

No Bold file is included: browsers synthesize bold from the Regular, which
looks close to the real thing. If you obtain the genuine Bold cut later,
save it here as AkkuratPro-Bold.woff2 and add to the <style> of index.html
and dashboard.html:

  @font-face{
    font-family:"Akkurat Pro";
    src:url("fonts/AkkuratPro-Bold.woff2") format("woff2");
    font-weight:700; font-style:normal; font-display:swap;
  }

(Bebas Neue, the display font, is loaded from Google Fonts and needs no file.)
