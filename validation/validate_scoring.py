#!/usr/bin/env python3
"""
Validate the JavaScript scoring port against the original SPSS assignments.

This regenerates the segment for all 1052 respondents in the 2022 CATI data
using the SAME logic implemented in js/scoring.js, and checks it against the
Clusterzuordnung_ordinal produced by the official SPSS syntax.

Expected result: 1052/1052 (100%) exact agreement.

Usage:
    pip install pyreadstat numpy --break-system-packages
    python validate_scoring.py /path/to/Wissenschaftsbarometer_Ergebnisse_2022_forSegments.sav \\
                               /path/to/Syntax_BerechnungSegmente_CATI_2022.sps
"""
import sys, re, json, math, warnings
import numpy as np
import pyreadstat


def parse_model(sps_path):
    with open(sps_path, encoding="utf-8-sig") as f:
        txt = f.read().replace("\r\n", "\n")
    imput = dict(re.findall(r"DO IF MISSING\((\w+)\)\.\n\s*COMPUTE #\w+_lg=([\d.]+)\.", txt))
    imput = {k: float(v) for k, v in imput.items()}
    eqs = {}
    for m in re.finditer(r"COMPUTE Cluster_lg_(\d)=\(([-\d.e]+)\)\n(.*?)\.\n", txt, re.S):
        k = int(m.group(1))
        terms = []
        for tm in re.finditer(r"\+\(([-\d.e]+)\)\*(#[\w]+)(?:\*(#[\w]+))?", m.group(3)):
            coef = float(tm.group(1))
            v1 = tm.group(2).lstrip("#")
            v2 = tm.group(3).lstrip("#") if tm.group(3) else None
            terms.append((coef, v1, v2))
        eqs[k] = {"intercept": float(m.group(2)), "terms": terms}
    return imput, eqs


CLUSTER_VARS = ["F0505", "F1504_rec", "F1505", "F1801", "F1802", "F1803", "F1804",
                "F1806", "F1808", "F1809", "F1810", "F1901", "F1902", "F1903",
                "F1904", "F1905", "F1906", "F1907", "F2003", "idx_SL"]


def rec_true(x):
    if np.isnan(x): return np.nan
    return {1: 0.0, 2: 0.0, 3: 1.0, 4: 2.0, 98: 0.0}.get(x, x)


def rec_false(x):
    if np.isnan(x): return np.nan
    return {3: 0.0, 4: 0.0, 98: 0.0, 2: 1.0, 1: 2.0}.get(x, x)


def classify(vals, imput, eqs):
    env = {}
    for v in CLUSTER_VARS:
        x = vals[v]
        if x is None or (isinstance(x, float) and math.isnan(x)):
            env[v + "_lg"] = imput[v]; env[v + "_lg_m"] = 1.0
        else:
            env[v + "_lg"] = float(x); env[v + "_lg_m"] = 0.0
    logits = []
    for k in (1, 2, 3, 4):
        s = eqs[k]["intercept"]
        for coef, a, b in eqs[k]["terms"]:
            s += coef * env[a] if b is None else coef * env[a] * env[b]
        logits.append(s)
    mx = max(logits)
    exps = [math.exp(l - mx) for l in logits]
    tot = sum(exps)
    probs = [e / tot for e in exps]
    cluster = max(range(4), key=lambda i: (probs[i], i)) + 1
    return {1: 3, 2: 1, 3: 2, 4: 4}[cluster]


def main(sav_path, sps_path):
    imput, eqs = parse_model(sps_path)
    df, _ = pyreadstat.read_sav(sav_path, user_missing=True)
    stored = pyreadstat.read_sav(sav_path)[0]["Clusterzuordnung_ordinal"]

    def clean(x):
        if np.isnan(x) or x >= 98: return np.nan
        return float(x)

    f0505 = df["F0505"].apply(clean)
    f1504_rec = df["F1504"].apply(clean)
    f1504_rec[f0505 == 1] = 1.0

    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        idx_SL = np.nanmean(np.column_stack([
            df["F2201"].apply(rec_true), df["F2202"].apply(rec_true),
            df["F2203"].apply(rec_false), df["F2204"].apply(rec_false),
            df["F2211"].apply(rec_false)]), axis=1)

    data = {v: df[v].apply(clean) for v in CLUSTER_VARS if v not in ("F0505", "F1504_rec", "idx_SL")}
    data["F0505"] = f0505; data["F1504_rec"] = f1504_rec

    pred = []
    for i in range(len(df)):
        vals = {v: (data[v].iloc[i] if v != "idx_SL" else idx_SL[i]) for v in CLUSTER_VARS}
        pred.append(classify(vals, imput, eqs))
    pred = np.array(pred, dtype=float)

    agree = int((pred == stored).sum())
    print(f"Agreement with SPSS: {agree}/{len(df)} = {agree / len(df) * 100:.2f}%")
    if agree != len(df):
        print("Mismatched rows:", np.where(pred != stored)[0].tolist()[:20])
        sys.exit(1)
    print("PASS — exact replication of the SPSS typology.")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print(__doc__); sys.exit(2)
    main(sys.argv[1], sys.argv[2])
