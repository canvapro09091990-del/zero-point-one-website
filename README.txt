# ZERO POINT ONE — website starter

A responsive, single-page static website. No paid framework or hosting is required.

## 1) Set your WhatsApp number
Open `config.js` and replace `91XXXXXXXXXX` with your business WhatsApp number:
- Include country code (India: 91 + 10-digit number)
- Use digits only; do not include `+`, spaces or hyphens.
The enquiry form opens WhatsApp with a message ready to review and send. It does not store submissions on a server.

## 2) Preview
Open `index.html` in a browser. For best testing, upload/deploy the folder to a static host.

## 3) Free hosting option: GitHub Pages
1. Create/sign in to https://github.com/
2. Create a **public** repository named `zero-point-one-website`.
3. Upload all files from this folder to the repository root: `index.html`, `styles.css`, `script.js`, `config.js`, `logo.svg`, and `CNAME`.
4. Open repository **Settings → Pages**.
5. Under Build and deployment, select **Deploy from a branch**, choose `main` and `/ (root)`, then Save.
6. Under Custom domain, enter `zeropointone.in` and save.
7. At the company where you purchased the domain, open DNS management and add the records required by the current GitHub Pages instructions:
   - Apex/root `@`: A records `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - `www`: CNAME pointing to `YOUR-GITHUB-USERNAME.github.io` (replace with your actual GitHub username).
   - Remove conflicting records for `@` or `www` only after checking they are not used by email or another service.
8. Return to Settings → Pages and wait for DNS/HTTPS status to become available. Enable **Enforce HTTPS** when shown.
9. DNS changes can take up to 24 hours to propagate.

Official instructions:
https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site

## Important domain safety note
Do not change nameservers or delete existing DNS records blindly. First identify the domain registrar and check whether the domain currently powers email or another website. MX records are usually needed for email and should not be deleted.

## Before launch
- Replace the WhatsApp placeholder in `config.js`.
- Check every claim about services and delivery models is accurate.
- Test all links on mobile and desktop.
- Add a privacy policy if you later collect/store personal information on a server.
- This is a static starter site: it does not include a server-side form, user accounts, a live client dashboard, or a developer registration database.
