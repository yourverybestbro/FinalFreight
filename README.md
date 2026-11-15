# Final Freight site

React + Vite + Tailwind, deployed to GitHub Pages (`finalfreight.com`) by `.github/workflows/deploy.yml` on every push to `main`.

## Refreshing the content (about 10 minutes a week)

All schedule, rate and news content lives in `src/data/`. No component code needs to change.

| File | What it drives |
| --- | --- |
| `site.json` | `updated` date shown in the header. Bump it whenever you review the data. If it is more than 21 days old, the page shows an "may be out of date" notice. |
| `manifest.json` | Launch Watch table. Status: `LAUNCHED`, `SLIPPED`, `UNCONFIRMED`, `SCHEDULED`. |
| `rates.json` | Reference Rates sidebar. Only published or reported list prices, each with a source. |
| `notes.json` | Market Notes. Third-party reporting only, paraphrased, with a source. |

Rules: every figure needs a source; no placeholder numbers; remove rows once they are no longer useful.

## Quote form

`src/config.js` -> `FORM_ENDPOINT`. Create a free form at formspree.io and paste its URL. While it is empty the form opens the visitor's email app with the request filled in (nothing is lost silently). The old Netlify Forms setup does not work on GitHub Pages.

## Development

```
npm install
npm run dev
```

## Not yet enabled

`src/_drafts/IntelligenceSection.jsx` is a draft for a "Writing" section. Enable it once an article is published.
