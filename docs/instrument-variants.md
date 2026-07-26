# Instrument variants — implementation notes (feature on hold)

Status: the settings tab shows both variants disabled. Activate once the
materials below are complete.

## 10-item short form (Füchslin, Schäfer & Metag 2018, Env. Comm. 12(8))

The ten items (= top-10 predictors, Table 1), mapped to our item IDs — all
already present in the questionnaire with official DE/FR/IT wording:

F1810, F1504, F1505, F0505 (interest in science and research in general),
F1802, F1902, F1809, F2003 (trust in science in general), F1905, F1901.

Not part of the short form: the knowledge quiz (idx_SL) and the remaining
attitude items. A 10-item survey therefore drops the knowledge page.

STILL NEEDED (requested from first author):
- The classification syntax / linear equations from the supplementary
  material (the paper references them but does not print them).
- Ideally a validation dataset with known assignments so the JS port can
  be verified exactly, as was done for the 20-item instrument.

## 1-item measure (Schäfer, Füchslin, Mede & Dvorzhitskaia 2026, Science Communication)

English wording (from the paper), stored here for implementation:

Question: "Which of the following descriptions represents you best?"

1 → Sciencephiles: "I have a strong interest in science. My trust in science
    is very high, and I think there is a scientific answer to most questions.
    I would say I know a lot about science."
2 → Critically Interested: "I have a strong interest in science. While I
    trust science in general, I see problems in some fields or applications.
    I don't think science can answer all questions. I would say I know a lot
    about science."
3 → Passive Supporters: "I don't have a strong interest in science. But I
    have high trust in it and think that science is important for society.
    I would say I know a fair amount about science."
4 → Disengaged/Skeptics: "I am not too interested in science. While I trust
    science in some respects, I don't think it should be trusted too much.
    I don't think it is important to know too much about science. I feel that
    society sometimes relies too much on science."
5 → UNCLASSIFIED: "I don't think any of these descriptions describes me well."

Scoring: choice = segment; option 5 = no segment.

Design implications when implementing:
- Option 5 means responses can be UNCLASSIFIED — needs a null segment in
  storage, dashboards (own category), and a neutral result page text.
- No model probabilities exist: hide the assignment-certainty KPI.
- Customer UI must show the validation caveat: high precision (0.94) but
  moderate recall (0.56) for Sciencephiles in the CERN study, poor accuracy
  for other segments — recommended only as a brief Sciencephiles screener.

STILL NEEDED (requested from co-author):
- The fielded DE/FR/IT translations from the CERN Science Gateway survey
  (prefer exact fielded wording over new translations).
