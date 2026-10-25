# Jax Vendor Events (private draft)

Static directory of vendor markets in Northeast Florida. Data in `data/events.json` (mirrored to `data/events.js` for the page). Draft only: noindex, robots Disallow, password gate. Not public yet.


Fonts: Fraunces and Inter (SIL Open Font License), self-hosted in fonts/.

## Vendor + organizer profiles (moderated)

- `join.html` is the "Create your profile" form (vendor or organizer). It posts a normal multipart form to FormSubmit, which emails it to `porchlight+jax@mail.tab.bot` with the subject **JVE profile: vendor** or **JVE profile: organizer**. The logo file arrives as an email attachment (FormSubmit only carries files on the normal POST, not its AJAX endpoint). Preferences are also saved on the visitor's device (`jve_prefs`) and drive **My matches** on the events page.
- Nothing is public until it is added to `data/profiles.json`. To approve a submission, copy the email's `profile_json` value into a file and run:

  ```
  python3 tools/add_profile.py --json-file submission.json --logo path/to/attached-logo.png
  # optional: --featured-until 2026-11-08   ($10/week featured vendor spotlight)
  # take one down: python3 tools/add_profile.py --remove <id>
  ```

  It validates the entry (links, no phone numbers or street addresses in public text, private email stays private unless they ticked "show"), copies the logo to `profiles/logos/`, rewrites `data/profiles.json` + `data/profiles.js`, and removes the two sample profiles the first time. Then commit those files and push.
- `profiles.html` is the directory (vendors / organizers, search, category, featured slot) and `profile.html?id=…` a single profile.
