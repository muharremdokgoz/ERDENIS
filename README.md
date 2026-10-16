# ERDENIS

Website of the ERDENIS Senior Design Project (Computer Engineering, TED University, 2026–2027).

ERDENIS develops a reinforcement learning based decision-making framework that lets UAVs attack when they hold an advantage and evade when they face a threat, within the vehicle's physical capabilities. Agents are trained and tested in simulation and compared with conventional methods.

Live site: https://erdenis.com.tr/

## Run locally

Plain HTML, CSS and vanilla JS, no build step. The page loads JSON files, so serve it over HTTP:

```bash
python -m http.server 8000
```

Then open http://localhost:8000.

## Edit content

All copy lives in `data/`. You never need to touch the layout.

- `data/content.json`: hero text, project paragraph, goals, supervisor, jury, team members, footer, and every UI label.
- `data/reports.json`: the report list.

**Jury member 2:** in `data/content.json`, change `"To be announced"` under `"jury"` to the name.

**Team photo (optional):** put `assets/team/<slug>.jpg` (square, about 400 px) where `<slug>` is the member's `slug` in `content.json`. Without a photo, initials are shown.

## Add a report

1. Put the PDF in `docs/`, for example `docs/proposal.pdf`.
2. Set the entry in `data/reports.json`:

```json
{ "title": "Project Proposal", "type": "Proposal", "date": "2026-11-15", "file": "docs/proposal.pdf" }
```

An empty `"file"` shows the item as "Coming soon". To add a new entry, copy one line in the array.

## Change the background / hero photo

Replace `assets/hero.jpg`, `assets/hero.webp`, `assets/hero-1200.jpg` and `assets/hero-1200.webp` (same names, 2400 px and 1200 px wide). Update `assets/CREDITS.md` and the photo credit in `data/content.json` (`ui.photoCredit`). `assets/og.jpg` (1200×630) is the social preview image.

## Deploy

GitHub Pages serves the repository root. `.nojekyll` disables Jekyll, `CNAME` sets the custom domain. All paths are relative, so the site also works at the github.io URL.
