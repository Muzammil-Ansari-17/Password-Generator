# Password Generator

A modern, responsive password generator built with vanilla HTML, CSS, and JavaScript. The project has been upgraded into a small static site with SEO, accessibility, trust pages, theme switching, copy feedback, and ad-ready layout sections.

## Features

- Secure random password generation using `crypto.getRandomValues`
- Dark/light mode toggle with saved preference
- Copy-to-clipboard action with toast feedback
- Responsive layout for mobile, tablet, and desktop
- Reserved ad placement areas for header, content, sidebar, and footer
- Dedicated pages for About, FAQ, Contact, Privacy, and Terms
- Accessible controls, semantic headings, and keyboard-friendly navigation

## Files

- `index.html` - main generator experience
- `about.html`, `faq.html`, `contact.html`, `privacy.html`, `terms.html` - supporting pages
- `style.css` - shared design system and responsive layout
- `script.js` - generator logic, theme handling, and UI feedback
- `favicon.svg`, `site.webmanifest`, `robots.txt`, `sitemap.xml` - site assets and SEO support

## Local use

Open `index.html` in a browser, or deploy the repository to GitHub Pages.

## Notes for deployment

- Replace the placeholder URLs in `robots.txt` and `sitemap.xml` with your actual GitHub Pages or custom domain.
- Replace placeholder contact and GitHub links if you want to point them to a real project profile.
- Add a real AdSense snippet only after your account and site are ready.

## Implementation notes

- The generator runs entirely on the client side.
- Passwords are not stored or sent to a server.
- The UI is designed to be lightweight and easy to maintain without framework overhead.
