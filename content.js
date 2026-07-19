/* =====================================================================
   content.js — Questionnaire content in DE / FR / IT
   ===================================================================== */

const CONFIG = {
  SUPABASE_URL: "https://ykyzmlgitpcjuwctijvq.supabase.co",
  SUPABASE_ANON_KEY: "qMYhBXJtGlDhVu63JyDN3A_Kg5E8FdY",
  SURVEY_ID: "ikmz-scientifica"
};

const UI = {
  de: {
    langName: "Deutsch",
    start_title: "Wissenschaft & Gesellschaft",
    start_sub: "Ein kurzer Fragebogen zu Ihrer Sicht auf Wissenschaft und Forschung.",
    start_intro: "Dieser Fragebogen dauert etwa 5–8 Minuten. Ihre Angaben werden vertraulich behandelt und ausschliesslich für die Auswertung dieser Erhebung verwendet. Es besteht keine Möglichkeit, Sie anhand Ihrer Antworten zu identifizieren.",
    start_button: "Fragebogen starten",
    lang_prompt: "Sprache wählen",
    next: "Weiter",
    back: "Zurück",
    submit: "Absenden",
    dont_know: "Weiss nicht",
    skip_note: "Sie können einzelne Fragen unbeantwortet lassen.",
    required_hint: "Bitte wählen Sie eine Antwort oder «Weiss nicht», oder überspringen Sie die Frage.",
    progress: "Frage {n} von {total}",
    section_intro: "Einstieg",
    thanks_title: "Vielen Dank!",
    thanks_sub: "Ihre Antworten wurden gespeichert.",
    thanks_result: "Auf Basis Ihrer Antworten gehören Sie zum folgenden Publikumssegment:",
    thanks_error: "Ihre Antworten konnten nicht gespeichert werden. Bitte prüfen Sie Ihre Internetverbindung und versuchen Sie es erneut.",
    retry: "Erneut versuchen",
    scale_low: "1",
    scale_high: "5"
  },
  fr: {
    langName: "Français",
    start_title: "Science & société",
    start_sub: "Un court questionnaire sur votre regard sur la science et la recherche.",
    start_intro: "Ce questionnaire dure environ 5 à 8 minutes. Vos données seront traitées de manière confidentielle et utilisées uniquement pour l’analyse de cette enquête. Il sera impossible de vous identifier à partir de vos réponses.",
    start_button: "Commencer le questionnaire",
    lang_prompt: "Choisir la langue",
    next: "Suivant",
    back: "Retour",
    submit: "Envoyer",
    dont_know: "Ne sait pas",
    skip_note: "Vous pouvez laisser certaines questions sans réponse.",
    required_hint: "Veuillez choisir une réponse ou « Ne sait pas », ou passer la question.",
    progress: "Question {n} sur {total}",
    section_intro: "Introduction",
    thanks_title: "Merci beaucoup !",
    thanks_sub: "Vos réponses ont été enregistrées.",
    thanks_result: "D’après vos réponses, vous appartenez au segment de public suivant :",
    thanks_error: "Vos réponses n’ont pas pu être enregistrées. Veuillez vérifier votre connexion Internet et réessayer.",
    retry: "Réessayer",
    scale_low: "1",
    scale_high: "5"
  },
  it: {
    langName: "Italiano",
    start_title: "Scienza & società",
    start_sub: "Un breve questionario sulla Sua visione della scienza e della ricerca.",
    start_intro: "Questo questionario dura circa 5–8 minuti. I Suoi dati saranno trattati in modo confidenziale e utilizzati esclusivamente per l’analisi di questa indagine. Non sarà possibile identificarLa in base alle Sue risposte.",
    start_button: "Inizia il questionario",
    lang_prompt: "Scegli la lingua",
    next: "Avanti",
    back: "Indietro",
    submit: "Invia",
    dont_know: "Non so",
    skip_note: "Può lasciare alcune domande senza risposta.",
    required_hint: "Scelga una risposta o « Non so », oppure salti la domanda.",
    progress: "Domanda {n} di {total}",
    section_intro: "Introduzione",
    thanks_title: "Grazie mille!",
    thanks_sub: "Le Sue risposte sono state salvate.",
    thanks_result: "In base alle Sue risposte, Lei appartiene al seguente segmento di pubblico:",
    thanks_error: "Non è stato possibile salvare le Sue risposte. Controlli la connessione a Internet e riprovi.",
    retry: "Riprova",
    scale_low: "1",
    scale_high: "5"
  }
};

// Scale anchor labels reused across item batteries
const SCALES = {
  interest: {
    de: ["Überhaupt nicht", "Sehr stark"],
    fr: ["Pas du tout", "Énormément"],
    it: ["Per niente", "Moltissimo"]
  },
  agree: {
    de: ["Stimme überhaupt nicht zu", "Stimme voll und ganz zu"],
    fr: ["N’approuve pas du tout", "Approuve totalement"],
    it: ["Non sono assolutamente d'accordo", "Sono assolutamente d'accordo"]
  },
  trust: {
    de: ["Sehr gering", "Sehr hoch"],
    fr: ["Très faible", "Très élevé"],
    it: ["Molto basso", "Molto alto"]
  }
};

// Knowledge (scientific literacy) 4-point scale
const KNOW_SCALE = {
  de: ["Ich bin sicher, dass das falsch ist", "Ich denke eher, dass das falsch ist", "Ich denke eher, dass das richtig ist", "Ich bin sicher, dass das richtig ist"],
  fr: ["Certainement faux", "Plutôt faux", "Plutôt juste", "Certainement juste"],
  it: ["Sicuramente errata", "Probabilmente errata", "Probabilmente esatta", "Sicuramente esatta"]
};

/* Each question: { id, type, scale?, intro{}, text{} }
   type: "scale5" (1..5 + don't know), "know4" (1..4 + don't know),
         "age", "gender", "education"
   The `intro` (battery lead-in) is shown once at the top of a group. */

const QUESTIONS = [
  // ---- Interest in science (F0505 / originally F0404) ----
  {
    id: "F0505", type: "scale5", scale: "interest",
    intro: {
      de: "Bitte sagen Sie uns auf einer Skala von 1 bis 5, wie stark Sie sich für das folgende Thema interessieren.",
      fr: "Veuillez nous dire sur une échelle de 1 à 5 à quel point le sujet suivant vous intéresse.",
      it: "Ci indichi su una scala da 1 a 5 quanto è interessato/a al seguente tema."
    },
    text: {
      de: "Wissenschaft und Forschung",
      fr: "Science et recherche",
      it: "Scienza e ricerca"
    }
  },

  // ---- Information seeking / behavioural control (F1504=F1202, F1505=F1204) ----
  {
    id: "F1504", type: "scale5", scale: "agree",
    intro: {
      de: "Wie stark stimmen Sie den folgenden Aussagen zu?",
      fr: "Dans quelle mesure êtes-vous d’accord avec les affirmations suivantes ?",
      it: "Quanto è d’accordo con le seguenti affermazioni?"
    },
    text: {
      de: "Ich suche gezielt Informationen über Wissenschaft und Forschung.",
      fr: "Je cherche des informations sur la science et la recherche de façon ciblée.",
      it: "Cerco informazioni in modo mirato su scienza e ricerca."
    }
  },
  {
    id: "F1505", type: "scale5", scale: "agree",
    text: {
      de: "Es ist wichtig, dass man über Wissenschaft und Forschung informiert ist.",
      fr: "Il importe que l’on soit informé sur la science et la recherche.",
      it: "È importante essere informati su scienza e ricerca."
    }
  },

  // ---- Goals of science (F1801..F1810 subset; orig. F17xx) ----
  {
    id: "F1801", type: "scale5", scale: "agree",
    intro: {
      de: "Jetzt geht es um Ihre Meinung zu Wissenschaft und Forschung. Bitte sagen Sie uns, wie stark Sie den folgenden Aussagen zustimmen.",
      fr: "Nous nous intéressons à présent à votre opinion sur la science et la recherche. Veuillez nous dire à quel point vous approuvez les affirmations suivantes.",
      it: "Ora parliamo della Sua opinione su scienza e ricerca. Ci dica quanto è d’accordo con le seguenti affermazioni."
    },
    text: {
      de: "Wissenschaftliche Forschung ist notwendig, auch wenn sich daraus kein unmittelbarer Nutzen ergibt.",
      fr: "La recherche scientifique est nécessaire, même s’il n’en résulte aucun avantage immédiat.",
      it: "La ricerca scientifica è necessaria anche se non produce un'utilità immediata."
    }
  },
  {
    id: "F1802", type: "scale5", scale: "agree",
    text: {
      de: "Wissenschaftliche Forschung sollte staatlich unterstützt werden.",
      fr: "La recherche scientifique devrait être soutenue par l’État.",
      it: "La ricerca scientifica dovrebbe essere sostenuta dallo Stato."
    }
  },
  {
    id: "F1803", type: "scale5", scale: "agree",
    text: {
      de: "Wissenschaftler sollten die Öffentlichkeit über ihre Arbeit informieren.",
      fr: "Les scientifiques devraient informer le public de leurs activités.",
      it: "Gli scienziati dovrebbero informare la gente sul loro lavoro."
    }
  },
  {
    id: "F1804", type: "scale5", scale: "agree",
    text: {
      de: "Wissenschaftler sollten mehr darauf hören, was einfache Leute denken.",
      fr: "Les scientifiques devraient plus écouter ce que les gens ordinaires pensent.",
      it: "Gli scienziati dovrebbero prestare più attenzione a quello che pensa la gente comune."
    }
  },
  {
    id: "F1806", type: "scale5", scale: "agree",
    text: {
      de: "Politische Entscheidungen sollten auf wissenschaftlichen Erkenntnissen beruhen.",
      fr: "Les décisions politiques devraient s’appuyer sur des bases scientifiques.",
      it: "Le decisioni politiche dovrebbero basarsi sulle conoscenze scientifiche."
    }
  },
  {
    id: "F1808", type: "scale5", scale: "agree",
    text: {
      de: "Leute wie ich sollten mitentscheiden, zu welchen Themen Wissenschaftler forschen.",
      fr: "Les personnes comme moi devraient prendre part à la décision sur les thèmes que les scientifiques doivent étudier.",
      it: "La gente come me dovrebbe partecipare alle decisioni sui temi oggetto di ricerca scientifica."
    }
  },
  {
    id: "F1809", type: "scale5", scale: "agree",
    text: {
      de: "Ich würde gern einmal in wissenschaftlichen Projekten mitforschen.",
      fr: "Je participerais volontiers un jour à des recherches sur des projets scientifiques.",
      it: "Mi piacerebbe partecipare una volta a qualche progetto scientifico."
    }
  },
  {
    id: "F1810", type: "scale5", scale: "agree",
    text: {
      de: "Wissenschaft und Forschung spielen in meinem Leben eine wichtige Rolle.",
      fr: "La science et la recherche jouent un rôle important dans ma vie.",
      it: "La scienza e la ricerca svolgono un ruolo importante nella mia vita."
    }
  },

  // ---- Reservations vs. beliefs in the promise of science (F1901..F1907; orig. F18xx) ----
  {
    id: "F1901", type: "scale5", scale: "agree",
    intro: {
      de: "Was glauben Sie: Welche Auswirkungen haben Wissenschaft und Forschung auf unser Leben?",
      fr: "Qu’en pensez-vous : quelles sont les répercussions de la science et de la recherche sur notre vie ?",
      it: "Secondo Lei, quali ripercussioni hanno scienza e ricerca sulla nostra vita?"
    },
    text: {
      de: "Wissenschaft und Forschung können jedes Problem lösen.",
      fr: "La science et la recherche peuvent résoudre chaque problème.",
      it: "La scienza e la ricerca possono risolvere ogni problema."
    }
  },
  {
    id: "F1902", type: "scale5", scale: "agree",
    text: {
      de: "Wissenschaft und Forschung verbessern unser Leben.",
      fr: "La science et la recherche améliorent notre vie.",
      it: "La scienza e la ricerca migliorano la nostra vita."
    }
  },
  {
    id: "F1903", type: "scale5", scale: "agree",
    text: {
      de: "Durch Wissenschaft und Forschung ändert sich unser Leben zu schnell.",
      fr: "La science et la recherche modifient notre mode de vie trop rapidement.",
      it: "Con la scienza e la ricerca la nostra vita cambia troppo velocemente."
    }
  },
  {
    id: "F1904", type: "scale5", scale: "agree",
    text: {
      de: "Der Nutzen von Wissenschaft und Forschung ist grösser als die möglicherweise auftretenden Schäden.",
      fr: "L’avantage de la science et de la recherche est plus important que les éventuels dégâts qui pourraient survenir.",
      it: "L'utilità della scienza e della ricerca è maggiore delle possibili conseguenze negative."
    }
  },
  {
    id: "F1905", type: "scale5", scale: "agree",
    text: {
      de: "Die Wissenschaft sollte ohne Einschränkung alles erforschen dürfen.",
      fr: "La science devrait pouvoir tout explorer sans limitation.",
      it: "La scienza dovrebbe poter fare ricerca su tutto senza limitazioni."
    }
  },
  {
    id: "F1906", type: "scale5", scale: "agree",
    text: {
      de: "Die Wissenschaft wird uns eines Tages ein vollständiges Bild davon vermitteln, wie Natur und Universum funktionieren.",
      fr: "La science nous transmettra un jour une image complète du fonctionnement de la nature et de l’univers.",
      it: "Un giorno la scienza ci fornirà un quadro completo del funzionamento della natura e dell'universo."
    }
  },
  {
    id: "F1907", type: "scale5", scale: "agree",
    text: {
      de: "Wir verlassen uns zu sehr auf die Wissenschaft.",
      fr: "Nous comptons trop sur la science.",
      it: "Ci affidiamo troppo alla scienza."
    }
  },

  // ---- Trust in science (F2003; orig. F19.02) ----
  {
    id: "F2003", type: "scale5", scale: "trust",
    intro: {
      de: "Auf einer Skala von 1 bis 5, wobei 1 «sehr gering» und 5 «sehr hoch» bedeutet: Wie hoch ist Ihr Vertrauen …",
      fr: "Sur une échelle de 1 à 5, où 1 signifie « très faible » et 5 « très élevé » : quel est le degré de votre confiance …",
      it: "Su una scala da 1 a 5, in cui 1 indica « molto basso » e 5 « molto alto »: quanto è alta la Sua fiducia …"
    },
    text: {
      de: "… in die Wissenschaft allgemein?",
      fr: "… dans la science en général ?",
      it: "… nella scienza in generale?"
    }
  },

  // ---- Scientific literacy knowledge items (F2201..F2204, F2211) ----
  {
    id: "F2201", type: "know4",
    intro: {
      de: "Die folgenden Aussagen kennen Sie vielleicht aus der Schule oder den Medien. Einige sind richtig, einige falsch. Bitte sagen Sie uns, ob die Aussage Ihrer Ansicht nach richtig oder falsch ist – und wie sicher Sie sind. Wenn Sie es nicht wissen, wählen Sie «Weiss nicht».",
      fr: "Vous connaissez peut-être les affirmations suivantes de l’école ou des médias. Certaines sont justes, d’autres fausses. Veuillez nous dire si, à votre avis, l’affirmation est juste ou fausse – et à quel point vous en êtes sûr(e). Si vous ne savez pas, choisissez « Ne sait pas ».",
      it: "Le seguenti affermazioni Le sono forse note dalla scuola o dai media. Alcune sono esatte, altre errate. Ci dica se secondo Lei l’affermazione è esatta o errata – e quanto ne è sicuro/a. Se non lo sa, scelga « Non so »."
    },
    text: {
      de: "Die Kontinente, auf denen wir leben, bewegen sich schon seit Millionen von Jahren.",
      fr: "Les continents sur lesquels nous vivons se déplacent depuis des millions d’années.",
      it: "I continenti su cui viviamo si muovono già da milioni di anni."
    }
  },
  {
    id: "F2202", type: "know4",
    text: {
      de: "Elektronen sind kleiner als Atome.",
      fr: "Les électrons sont plus petits que les atomes.",
      it: "Gli elettroni sono più piccoli degli atomi."
    }
  },
  {
    id: "F2203", type: "know4",
    text: {
      de: "Antibiotika töten sowohl Viren als auch Bakterien.",
      fr: "Les antibiotiques tuent aussi bien les virus que les bactéries.",
      it: "Gli antibiotici uccidono sia i virus sia i batteri."
    }
  },
  {
    id: "F2204", type: "know4",
    text: {
      de: "Die Gene von der Mutter entscheiden, ob ein Kind ein Bube oder ein Mädchen wird.",
      fr: "Les gènes de la mère décident si un enfant sera un garçon ou une fille.",
      it: "I geni della madre determinano se nascerà un maschio o una femmina."
    }
  },
  {
    id: "F2211", type: "know4",
    text: {
      de: "Wissenschaftliche Theorien ändern sich nie.",
      fr: "Les théories scientifiques ne changent jamais.",
      it: "Le teorie scientifiche non cambiano mai."
    }
  },

  // ---- Demographics ----
  {
    id: "age", type: "age",
    text: {
      de: "In welchem Jahr sind Sie geboren?",
      fr: "Quelle est votre année de naissance ?",
      it: "In quale anno è nato/a?"
    }
  },
  {
    id: "gender", type: "gender",
    text: {
      de: "Geschlecht",
      fr: "Sexe",
      it: "Sesso"
    },
    options: {
      de: ["Männlich", "Weiblich", "Divers"],
      fr: ["Masculin", "Féminin", "Divers"],
      it: ["Maschile", "Femminile", "Altro"]
    }
  },
  {
    id: "education", type: "education",
    text: {
      de: "Welche Ausbildung haben Sie zuletzt abgeschlossen?",
      fr: "Quelle est la dernière formation que vous avez achevée ?",
      it: "Qual è l'ultima formazione da Lei conseguita?"
    },
    options: {
      de: [
        "Keine Ausbildung abgeschlossen",
        "Obligatorische Schule",
        "Diplommittelschule oder berufsvorbereitende Schule",
        "Berufslehre, Vollzeit-Berufsschule",
        "Maturitätsschule",
        "Lehrerseminar",
        "Höhere Fach- und Berufsausbildung",
        "Höhere Fachschule",
        "Fachhochschule",
        "Universität, Hochschule"
      ],
      fr: [
        "Aucune scolarité achevée",
        "Scolarité obligatoire",
        "École de degré diplôme ou école de préparation professionnelle",
        "Apprentissage professionnel, école professionnelle à plein temps",
        "Maturité",
        "École normale",
        "Formation professionnelle supérieure",
        "École supérieure",
        "Haute école spécialisée",
        "Université, haute école"
      ],
      it: [
        "Nessuna formazione conclusa",
        "Scuola dell'obbligo",
        "Diploma di scuola media o scuola professionale",
        "Tirocinio professionale, scuola professionale a tempo pieno",
        "Scuola di maturità",
        "Istituto magistrale",
        "Formazione specialistica o professionale superiore",
        "Scuola professionale superiore",
        "Scuola universitaria professionale",
        "Università, scuola universitaria"
      ]
    }
  }
];

// Segment descriptions shown to the respondent at the end (kept brief and neutral)
const SEGMENT_DESC = {
  1: {
    de: "Sciencephiles — stark an Wissenschaft interessiert, informiert und mit hohem Vertrauen.",
    fr: "Sciencephiles — fortement intéressé·e·s par la science, informé·e·s et très confiant·e·s.",
    it: "Sciencephiles — fortemente interessati alla scienza, informati e con grande fiducia."
  },
  2: {
    de: "Critically Interested — interessiert, aber mit kritischer Distanz gegenüber Wissenschaft.",
    fr: "Critically Interested — intéressé·e·s, mais avec un recul critique envers la science.",
    it: "Critically Interested — interessati, ma con distanza critica verso la scienza."
  },
  3: {
    de: "Passive Supporters — grundsätzlich wohlgesonnen, aber wenig aktiv involviert.",
    fr: "Passive Supporters — plutôt favorables, mais peu impliqué·e·s activement.",
    it: "Passive Supporters — sostanzialmente favorevoli, ma poco coinvolti attivamente."
  },
  4: {
    de: "Disengaged — wenig Interesse an und geringe Nähe zu Wissenschaft.",
    fr: "Disengaged — peu d’intérêt et de proximité avec la science.",
    it: "Disengaged — scarso interesse e vicinanza alla scienza."
  }
};

if (typeof module !== "undefined") module.exports = { UI, SCALES, KNOW_SCALE, QUESTIONS, SEGMENT_DESC };
