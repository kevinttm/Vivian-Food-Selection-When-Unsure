# Yishun Food Dex 🔴⚪

A Pokémon-themed food stall directory combining **Northpoint City** and **Wisteria Mall**
in Yishun, Singapore — 116 stalls, searchable and filterable by price, cuisine, and mall,
each showing distance from postal code 760325, with a Poké Ball wheel to randomly pick
where to eat.

Plain HTML/CSS/JS, no build step, no dependencies.

## Project structure

```
.
├── index.html      # page structure
├── styles.css      # all styling (Pokédex theme)
├── app.js          # filtering, sorting, and the spin wheel logic
├── data.js         # the 116-stall dataset (edit this to add/update stalls)
├── package.json
├── vercel.json     # tells Vercel this is a static site, no build step
└── .gitignore
```

## Preview locally

Any static file server works, e.g.:

```bash
npx serve .
# or
python3 -m http.server 3000
```

Then open the printed local URL. (You can also just double-click `index.html` —
the data is loaded from a `<script>` tag, not `fetch()`, so it works straight
from disk too.)

## Deploy: GitHub → Vercel

1. **Create a GitHub repo** (empty, no README/license so it doesn't conflict):
   - On github.com click **New repository**, name it e.g. `yishun-food-dex`, leave it empty, click **Create repository**.

2. **Push this folder to it.** From inside this folder:
   ```bash
   git init
   git add .
   git commit -m "Yishun Food Dex"
   git branch -M main
   git remote add origin https://github.com/<your-username>/yishun-food-dex.git
   git push -u origin main
   ```

3. **Import into Vercel:**
   - Go to [vercel.com/new](https://vercel.com/new) and sign in with GitHub.
   - Select the `yishun-food-dex` repo and click **Import**.
   - Framework Preset: **Other**. Build Command: leave empty. Output Directory: leave as `.` (matches `vercel.json`).
   - Click **Deploy**. It finishes in seconds since there's nothing to build.

Every future `git push` to `main` auto-redeploys.

## Updating the data

Open `data.js` — it's one JS array (`STALL_DATA`), one object per stall:

```js
{
  "id": 3,
  "name": "Saizeriya",
  "mall": "Wisteria Mall",              // "Wisteria Mall" or "Northpoint City"
  "unit": "#01-19/20/53/54",
  "cuisine": "Italian",
  "price": "$",                          // "$", "$$", or "$$$"
  "distanceKm": 1.24,                    // straight-line distance from postal code 760325
  "tel": "tel:+6565923537",              // or null if no verified number
  "phoneDisplay": "+65 6592 3537",
  "maps": "https://www.google.com/maps/place/?q=place_id:..."
}
```

Cuisine strings drive the color-coded "type" badge on each card (see `TYPE_COLORS`
in `app.js`) — add a new cuisine there if you introduce one that isn't mapped yet.

## Data notes

- Stall names, units, and cuisines were pulled from the two malls' own directories
  plus Google Maps listings.
- 46 of 116 stalls have a phone number verified live from Google; the rest show
  a Map button only (no number was publicly listed).
- Distance is straight-line ("as the crow flies") from postal code 760325 to
  each mall's entrance, not walking distance to the exact unit — everything in
  the same mall shows the same figure.
- Hours, units, and tenants change; treat this as a snapshot, not a live feed.
