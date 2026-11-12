#!/usr/bin/env python3
"""Validator timeline.json untuk skill diorama-basabasi.

Fail-closed: exit 1 bila ada satu pun cek FAIL.
Pakai: python3 validate_timeline.py docs/timeline.json
"""
import json
import sys

TOL = 0.3          # toleransi batas scene vs awal kalimat (detik)
DUR_MIN, DUR_MAX = 30.0, 60.0
TAIL_MAX = 5.0     # total non-narasi maksimum di luar jeda payoff

fails = []


def check(ok, label, detail=""):
    print(("PASS " if ok else "FAIL ") + label + (f" — {detail}" if detail else ""))
    if not ok:
        fails.append(label)


def main(path):
    with open(path, encoding="utf-8") as f:
        t = json.load(f)

    check(t.get("fps") == 30, "fps == 30", f"fps={t.get('fps')}")
    total = float(t["total_duration_s"])
    audio = float(t["audio_duration_s"])
    check(DUR_MIN <= total <= DUR_MAX, "total durasi 30–60 detik", f"{total:.2f}s")
    check(abs(audio - total) <= TAIL_MAX + 1.0, "durasi audio masuk akal vs total",
          f"audio={audio:.2f}s total={total:.2f}s")

    sents = sorted(t["sentences"], key=lambda s: s["id"])
    check(abs(sents[0]["start_s"]) <= 0.1, "kalimat pertama mulai di ~0",
          f"{sents[0]['start_s']:.2f}s")
    overlap = any(sents[i]["start_s"] < sents[i - 1]["end_s"] - 0.05
                  for i in range(1, len(sents)))
    check(not overlap, "kalimat tidak tumpang tindih")

    tail = total - sents[-1]["end_s"]
    check(tail <= TAIL_MAX, "ekor setelah kalimat terakhir <= 5 detik",
          f"{tail:.2f}s")

    scenes = sorted(t["scenes"], key=lambda s: s["id"])
    by_id = {s["id"]: s for s in sents}
    for sc in scenes:
        first = by_id[sc["sentence_ids"][0]]
        check(abs(sc["start_s"] - first["start_s"]) <= TOL,
              f"scene {sc['id']} mulai = awal kalimat {first['id']}",
              f"scene={sc['start_s']:.2f} kalimat={first['start_s']:.2f}")
        ids_ok = all(by_id[i]["scene"] == sc["id"] for i in sc["sentence_ids"])
        check(ids_ok, f"scene {sc['id']}: kalimat konsisten menunjuk scene ini")
    contiguous = all(abs(scenes[i]["start_s"] - scenes[i - 1]["end_s"]) <= TOL
                     for i in range(1, len(scenes)))
    check(contiguous, "scene bersebelahan tanpa celah > 0,3 detik")

    print("\nHASIL:", "PASS SEMUA" if not fails else f"GAGAL ({len(fails)} cek)")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "docs/timeline.json")
