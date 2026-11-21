# Eknoor Wadhwa portfolio

Personal portfolio for eknoorwadhwa.com. Plain HTML, CSS and JavaScript. No build step and no frameworks.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | The portfolio page |
| `privacy.html` | Privacy Policy |
| `terms.html` | Terms & Conditions |
| `thank-you.html` | Shown after the contact form is sent (not indexed) |
| `style.css` | The only stylesheet |
| `script.js`, `theme-init.js` | Theme switch, mobile menu, current-section highlight |
| `favicon.svg`, `favicon.ico`, `apple-touch-icon.png` | Favicons |
| `CNAME` | Custom domain: eknoorwadhwa.com |
| `robots.txt`, `sitemap.xml` | Search engine files for the custom domain |
| `portrait.png`, `Eknoor-Wadhwa-Resume.pdf`, `haven-guelph-third-place-certificate.jpeg` | Content assets |

## Publish

1. Upload every file in this folder to the root of the GitHub Pages repository, replacing the old versions. Delete the old `styles.css` (with an s), which nothing uses.
2. In the repository, open Settings, then Pages. Confirm the custom domain is `eknoorwadhwa.com` and turn on Enforce HTTPS.
3. At your domain registrar, point the domain at GitHub Pages: four `A` records for the apex domain (`185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`) and a `CNAME` record for `www` pointing to `wahwaeknoor-2008.github.io`. Check GitHub's current Pages documentation, as these values can change.
4. Hard refresh after deploying (Mac: Command + Shift + R).

## Contact form

The form sends through FormSubmit to e4wadhwa@uwaterloo.ca. The first submission triggers a one-time confirmation email from FormSubmit. Click the link in it, or messages will not be delivered. The page's Content-Security-Policy already allows `https://formsubmit.co` as a form target.

## Design rules this site follows

- No purple gradients, no pill-shaped buttons, no emoji icons, no em dashes.
- No scroll animations, cursor effects or animated counters.
- No invented reviews, metrics, skill percentages or customer counts. Every figure comes from the résumé.
- No AI-generated photos. The portrait is a real photo.
- Specific copy only. Nothing on the site credits an AI tool or website builder.
- Custom domain, favicon, Privacy Policy and Terms & Conditions are included.

## Before you publish

- Check that every number on the page is true: 5+ websites, 15+ NFC cards, 500+ volunteer hours, 95%+ admission average.
- Read `privacy.html` and `terms.html`. They describe what this site actually does today. Update them if you add analytics, new third-party services or a different contact method. The terms name Ontario law, so confirm that is what you want.
- The featured AI study assistant has no live or GitHub link. Add one when you have it.
