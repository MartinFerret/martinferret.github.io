# Moving to martinferret.dev

Both sites are ready for the domain: the personal site builds with `https://martinferret.dev` (the `site` option in `astro.config.mjs`, overridable with `SITE_URL`), and its build output contains a `CNAME` file with `martinferret.dev`. The Lab builds with `https://martinferret.dev/typescript-performance-lab/` (`LAB_URL` in `tools/notebook/pages.mjs`). GitHub Pages serves a project site such as the Lab under the user site's custom domain automatically, so the Lab repository needs no domain of its own.

Source for the records below: GitHub's documentation, read on 2026-11-11:
- https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site
- https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages

Check them again on that page before you start: GitHub can change them.

## 1. Verify the domain on GitHub (recommended first, prevents takeovers)

1. On GitHub, click your profile picture, then **Settings**, then **Pages** (under "Code, planning, and automation").
2. Click **Add a domain**, type `martinferret.dev`, then click **Add domain**.
3. At your registrar, create the TXT record GitHub shows (name `_github-pages-challenge-MartinFerret.martinferret.dev`, value given by GitHub).
4. Check it: `dig _github-pages-challenge-MartinFerret.martinferret.dev +nostats +nocomments +nocmd TXT`
5. Click **Verify**. Keep the TXT record in place afterwards.

Do not create a wildcard record (`*.martinferret.dev`): GitHub warns that it is an immediate takeover risk, even with a verified domain.

## 2. Set the custom domain on the personal site repository

1. Go to the repository `MartinFerret/martinferret.github.io`, then **Settings**, then **Pages**.
2. Under **Custom domain**, type `martinferret.dev`, then click **Save**.

The site is published from the `gh-pages` branch, built locally. The build already puts `CNAME` at the root of the output, so the next publish keeps the domain. If GitHub adds its own commit with a `CNAME` file to `gh-pages`, it holds the same value.

## 3. DNS records at your registrar

Remove any default record the registrar created for the apex (`@`) first. Then create:

| Type | Name | Value |
|---|---|---|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| AAAA | `@` | `2606:50c0:8000::153` |
| AAAA | `@` | `2606:50c0:8001::153` |
| AAAA | `@` | `2606:50c0:8002::153` |
| AAAA | `@` | `2606:50c0:8003::153` |
| CNAME | `www` | `martinferret.github.io` |

- The `www` record points to `martinferret.github.io`, without a repository name and never to a `*.pages.github.io` address. GitHub then redirects `www.martinferret.dev` to `martinferret.dev`.
- If your registrar supports ALIAS or ANAME records, the documentation allows one ALIAS/ANAME record for `@` pointing to `martinferret.github.io` instead of the A and AAAA records.

Check after propagation (up to 24 hours):

```bash
dig martinferret.dev +noall +answer -t A
dig martinferret.dev +noall +answer -t AAAA
dig www.martinferret.dev +noall +answer -t CNAME
```

The A and AAAA answers must match the table above.

## 4. Enforce HTTPS

Back in **Settings**, then **Pages** of `MartinFerret/martinferret.github.io`, tick **Enforce HTTPS**. GitHub notes that the option can take up to 24 hours to become available after the domain is set.

Then check:
- https://martinferret.dev/ (the personal site)
- https://martinferret.dev/typescript-performance-lab/ (the Lab, served automatically under the same domain)
- https://martinferret.dev/robots.txt and https://martinferret.dev/sitemap-index.xml
- https://martinferret.github.io/ : check whether it now redirects to https://martinferret.dev/ (not stated in the pages read above; if it does not, old links to github.io need a manual redirect page)

## 5. If you buy martinferret.com: redirect it to martinferret.dev

A GitHub Pages repository serves one custom domain, so do the redirect at the registrar, not on GitHub:
1. In the registrar's settings for `martinferret.com`, use its URL forwarding (also called "redirect" or "web forwarding").
2. Forward `martinferret.com` and `www.martinferret.com` to `https://martinferret.dev`, as a **permanent (301)** redirect, keeping the path if the registrar offers it (so `martinferret.com/hire/` lands on `martinferret.dev/hire/`).
3. Do not add `martinferret.com` to any GitHub Pages repository.

The exact screens depend on the registrar; if it does not offer HTTPS forwarding, links to `https://martinferret.com` will show a certificate warning, so check that option before buying.

## 6. After the move

- Google Search Console: add `martinferret.dev` as a property. To verify with the HTML tag method, build with `GOOGLE_SITE_VERIFICATION=<your token> npm run build`: the tag is added to every page. Then submit `https://martinferret.dev/sitemap-index.xml`.
- Old `martinferret.github.io` links: see the check in step 4.
