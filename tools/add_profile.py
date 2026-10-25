#!/usr/bin/env python3
"""Turn an emailed "JVE profile: vendor/organizer" submission into an approved entry in data/profiles.json.

Usage (from the repo root):
  python3 tools/add_profile.py --json-file submission.json [--logo /path/to/emailed-logo.png] [--featured-until 2026-11-08] [--dry-run]
  python3 tools/add_profile.py --json '<the profile_json value from the email>' ...
  python3 tools/add_profile.py --remove <profile-id>            # take a profile down (kept out of the public file)

The email's "profile_json" row holds everything the form collected. This script:
  * validates it (type, name, email, https links, no street addresses or phone numbers in public text),
  * keeps the private email out of the public file unless the person ticked "show this email",
  * copies the logo (the email attachment, or downloads logo_url) into profiles/logos/<id>.<ext>,
  * writes data/profiles.json and data/profiles.js (the copy the pages load), sorted by name,
  * drops the "sample" example profiles the first time a real profile is added.
Nothing is published until you commit and push the two data files and the logo.
"""
import argparse, datetime, json, os, re, shutil, sys, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
COUNTIES = ["Duval", "St. Johns", "Clay", "Nassau", "Baker", "Flagler", "Putnam"]
TYPES = ["farmers", "craft", "festival", "holiday", "city", "popup"]
CATEGORIES = ["Jewelry & accessories", "Art & prints", "Clothing & apparel", "Candles & home", "Bath & body", "Crafts & gifts",
              "Food & baked goods", "Food truck / prepared food", "Produce & farm", "Plants & flowers", "Kids & toys", "Pets",
              "Vintage & thrift", "Health & wellness", "Services", "Other"]
APPLY = ["link", "email", "facebook", "instagram", "other"]
SOC = {"instagram": "https://www.instagram.com/", "tiktok": "https://www.tiktok.com/@", "facebook": "https://www.facebook.com/"}
EMAIL = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]{2,}$")
PHONE = re.compile(r"(?:\+?1[\s.-]?)?\(?\b\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}\b")
STREET = re.compile(r"\b\d{2,6}\s+(?:[NSEW]\.?\s+)?[A-Za-z0-9.' ]{2,30}\s(?:St|Street|Ave|Avenue|Rd|Road|Blvd|Boulevard|Dr|Drive|Ln|Lane|Ct|Court|Way|Pkwy|Parkway|Hwy|Highway|Cir|Circle|Pl|Place|Ter|Terrace|Trl|Trail)\b\.?", re.I)


class Bad(ValueError):
    pass


def slug(s):
    s = re.sub(r"&", " and ", str(s or "").lower())
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")[:60]
    return s or "profile"


def clean(s, n):
    s = re.sub(r"[\x00-\x08\x0b-\x1f\x7f<>]", "", str(s or "")).strip()
    s = re.sub(r"[ \t]+", " ", s)
    return s[:n]


def link(kind, v):
    v = str(v or "").strip()
    if not v:
        return None
    if re.match(r"^https?://", v, re.I):
        v = re.sub(r"^http://", "https://", v, flags=re.I)
        if not re.match(r"^https://[^\s\"'<>]+\.[^\s\"'<>]+", v):
            raise Bad(f"{kind}: not a usable link: {v!r}")
        return v
    if kind in SOC and re.match(r"^@?[A-Za-z0-9._-]+$", v) and not re.search(r"\.(com|net|org|co|us|shop|store|art|io)$", v, re.I):
        return SOC[kind] + v.lstrip("@")
    if re.match(r"^(www\.)?[a-z0-9-]+(\.[a-z0-9-]+)+(/\S*)?$", v, re.I):
        return "https://" + v
    raise Bad(f"{kind}: not a usable link or handle: {v!r}")


def private_info(text):
    """Phone numbers / street addresses found in text that would be shown publicly."""
    hits = PHONE.findall(text or "") + STREET.findall(text or "")
    return [h if isinstance(h, str) else " ".join(h) for h in hits]


def build_entry(sub, today, existing_ids=(), allow_private=False):
    if not isinstance(sub, dict):
        raise Bad("submission must be a JSON object")
    t = sub.get("type")
    if t not in ("vendor", "organizer"):
        raise Bad("type must be vendor or organizer")
    name = clean(sub.get("name"), 80)
    if not name:
        raise Bad("name is required")
    email = clean(sub.get("email"), 120)
    if email and not EMAIL.match(email):
        raise Bad(f"email looks wrong: {email!r}")
    county = sub.get("county") if sub.get("county") in COUNTIES + ["Other"] else None
    pid = slug(name)
    base, i = pid, 2
    while pid in existing_ids:
        pid, i = f"{base}-{i}", i + 1
    L = sub.get("links") or {}
    links = {k: link(k, L.get(k)) for k in ("website", "shop", "instagram", "facebook", "tiktok")}
    e = {
        "id": pid, "type": t, "status": "approved", "sample": False,
        "name": name, "tagline": clean(sub.get("tagline"), 90), "bio": clean(sub.get("bio"), 500),
        "logo": None, "city": clean(sub.get("city"), 40), "county": county,
        "links": links,
        "contact_email": email if (sub.get("show_email") is True and email) else None,
        "featured_until": None, "approved_on": today,
        "spotlight_interest": bool(sub.get("spotlight_interest")),
    }
    if t == "vendor":
        e["categories"] = [c for c in (sub.get("categories") or []) if c in CATEGORIES]
        e["products"] = clean(sub.get("products"), 160)
        e["service_counties"] = [c for c in (sub.get("service_counties") or []) if c in COUNTIES]
        p = sub.get("prefs") or {}
        e["looking_for"] = {
            "types": [x for x in (p.get("types") or []) if x in TYPES],
            "days": sorted({int(d) for d in (p.get("days") or []) if str(d).isdigit() and 0 <= int(d) <= 6}),
            "setting": p.get("setting") if p.get("setting") in ("indoor", "outdoor") else "any",
        }
        e["email_alerts"] = bool(p.get("alerts"))  # wants the weekly email: add them to the newsletter list
    else:
        e["event_ids"] = [str(x) for x in (sub.get("event_ids") or []) if re.match(r"^[\w.-]+$", str(x))]
        e["events_run"] = clean(sub.get("events_run"), 600)
        e["wants_categories"] = [c for c in (sub.get("wants_categories") or []) if c in CATEGORIES]
        e["apply_method"] = sub.get("apply_method") if sub.get("apply_method") in APPLY else "other"
        e["apply_url"] = link("apply_url", sub.get("apply_url"))
        e["apply_note"] = clean(sub.get("apply_note"), 200)
    public_text = " ".join(str(e.get(k) or "") for k in ("tagline", "bio", "city", "products", "events_run", "apply_note"))
    hits = private_info(public_text)
    if hits and not allow_private:
        raise Bad("possible phone number or street address in public text: " + "; ".join(hits) +
                  " — edit the submission, or pass --allow-private if the person typed it as their public contact")
    return e


def store_logo(entry, logo_path=None, logo_url=None):
    dest_dir = os.path.join(ROOT, "profiles", "logos")
    os.makedirs(dest_dir, exist_ok=True)
    src, ext = None, None
    if logo_path:
        ext = os.path.splitext(logo_path)[1].lower().lstrip(".")
        src = logo_path
    elif logo_url:
        if not str(logo_url).startswith("https://"):
            raise Bad("logo_url must be https")
        ext = os.path.splitext(logo_url.split("?")[0])[1].lower().lstrip(".") or "png"
        tmp = os.path.join(dest_dir, ".download")
        req = urllib.request.Request(logo_url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=20) as r, open(tmp, "wb") as f:
            f.write(r.read(2 * 1024 * 1024 + 1))
        src = tmp
    if not src:
        return None
    ext = {"jpeg": "jpg"}.get(ext, ext)
    if ext not in ("png", "jpg", "webp", "svg"):
        raise Bad(f"logo must be png/jpg/webp/svg, got .{ext}")
    if os.path.getsize(src) > 2 * 1024 * 1024:
        raise Bad("logo is over 2 MB")
    if ext == "svg":
        txt = open(src, encoding="utf-8", errors="replace").read()
        if re.search(r"<script|on\w+\s*=|javascript:", txt, re.I):
            raise Bad("svg logo contains script; ask for a PNG instead")
    rel = f"profiles/logos/{entry['id']}.{ext}"
    dst = os.path.join(ROOT, rel)
    try:  # square-ish, max 400px, when Pillow is around
        if ext != "svg":
            from PIL import Image
            im = Image.open(src)
            im.thumbnail((400, 400))
            if ext == "jpg" and im.mode not in ("RGB", "L"):
                im = im.convert("RGB")
            im.save(dst)
        else:
            shutil.copyfile(src, dst)
    except ImportError:
        shutil.copyfile(src, dst)
    if src.endswith(".download"):
        os.remove(src)
    return rel


def load():
    with open(os.path.join(ROOT, "data", "profiles.json"), encoding="utf-8") as f:
        return json.load(f)


def save(doc, today):
    doc["updated"] = today
    doc["profiles"].sort(key=lambda p: (bool(p.get("sample")), p["name"].lower()))
    with open(os.path.join(ROOT, "data", "profiles.json"), "w", encoding="utf-8") as f:
        f.write(json.dumps(doc, indent=1, ensure_ascii=False) + "\n")
    with open(os.path.join(ROOT, "data", "profiles.js"), "w", encoding="utf-8") as f:
        f.write("window.JVE_PROFILES=" + json.dumps(doc, ensure_ascii=False, separators=(",", ":")) + ";\n")


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--json", help="the profile_json value from the email")
    ap.add_argument("--json-file", help="a file holding the profile_json value")
    ap.add_argument("--logo", help="the logo file attached to the email")
    ap.add_argument("--featured-until", help="YYYY-MM-DD: show as Featured vendor through this date ($10/week spotlight)")
    ap.add_argument("--allow-private", action="store_true", help="the person typed a phone/address as public contact")
    ap.add_argument("--keep-samples", action="store_true")
    ap.add_argument("--remove", help="profile id to take down")
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--today", default=datetime.date.today().isoformat())
    a = ap.parse_args(argv)
    doc = load()
    if a.remove:
        before = len(doc["profiles"])
        doc["profiles"] = [p for p in doc["profiles"] if p["id"] != a.remove]
        if len(doc["profiles"]) == before:
            print(f"no profile with id {a.remove}", file=sys.stderr)
            return 1
        if not a.dry_run:
            save(doc, a.today)
        print(f"removed {a.remove}")
        return 0
    raw = a.json if a.json else (open(a.json_file, encoding="utf-8").read() if a.json_file else None)
    if not raw:
        ap.error("give --json or --json-file")
    try:
        sub = json.loads(raw)
        ids = {p["id"] for p in doc["profiles"] if not p.get("sample")}
        e = build_entry(sub, a.today, ids, a.allow_private)
        if a.featured_until:
            if not re.match(r"^\d{4}-\d{2}-\d{2}$", a.featured_until):
                raise Bad("--featured-until must be YYYY-MM-DD")
            e["featured_until"] = a.featured_until
        if not a.dry_run:
            e["logo"] = store_logo(e, a.logo, None if a.logo else sub.get("logo_url"))
    except (Bad, json.JSONDecodeError, OSError) as err:
        print(f"NOT ADDED: {err}", file=sys.stderr)
        return 2
    dropped = []
    if not a.keep_samples:
        dropped = [p["id"] for p in doc["profiles"] if p.get("sample")]
        doc["profiles"] = [p for p in doc["profiles"] if not p.get("sample")]
    doc["profiles"].append(e)
    if a.dry_run:
        print(json.dumps(e, indent=1, ensure_ascii=False))
        return 0
    save(doc, a.today)
    print(f"added {e['type']} {e['id']}" + (f" (logo {e['logo']})" if e["logo"] else " (no logo)") +
          (f"; removed samples: {', '.join(dropped)}" if dropped else ""))
    if e.get("email_alerts"):
        print("note: they asked for email alerts — add them to the weekly email list")
    if e.get("spotlight_interest"):
        print("note: interested in the $10 featured spotlight")
    print("next: commit data/profiles.json, data/profiles.js" + (f" and {e['logo']}" if e["logo"] else "") + ", then push")
    return 0


if __name__ == "__main__":
    sys.exit(main())
