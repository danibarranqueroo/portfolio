# Security policy

This repository holds a personal portfolio site: a static build served from
Cloudflare Workers. It stores no user data, has no accounts, no database and no
form that submits anywhere. That limits what can go wrong here, but not to
nothing, so here is how to tell me if you find something.

## Reporting a vulnerability

**Please do not open a public issue for a security problem.**

Use GitHub's private vulnerability reporting, which is enabled on this
repository: go to the [Security tab](https://github.com/danibarranqueroo/portfolio/security)
and choose **Report a vulnerability**. That opens a private thread visible only
to me, and it lets us agree on a fix before anything is public.

If you would rather not use GitHub, email
[josedanielbarranqueroortigosa@gmail.com](mailto:josedanielbarranqueroortigosa@gmail.com).
It is the same address published on the site, so you are not trusting a channel
you cannot verify.

I read both in Spanish and English. Write in whichever you prefer.

## What I will do

I will acknowledge a report within **five days**, and tell you either what the
fix is or why I think it is not an issue. If it is a real problem I will fix it
and say so publicly once it is deployed, crediting you unless you ask me not to.

There is no bounty. This is a personal site and I have no budget for one, which
I would rather state plainly than leave you guessing.

## Scope

In scope is anything in this repository and anything served from
`danibarranquero.com`, including the security headers, the Content Security
Policy, the DNS configuration and the deployment workflows.

Out of scope, because they are not mine to fix:

- Vulnerabilities in Astro, Cloudflare or any dependency. Report those upstream;
  Dependabot already watches this repository for known advisories.
- Anything requiring physical access to my machine, or access to my accounts.
- Findings from an automated scanner with no demonstrated impact. The site
  already publishes its own scan results at
  [danibarranquero.com/security](https://danibarranquero.com/security/),
  including the checks that fail and why, so a report that repeats one of those
  is not telling me anything new.

## Please do not

Run denial of service tests, brute force anything, or use automated scanning at
a rate that affects availability for anyone else. The site is static and
unmetered, so there is nothing to gain from it and it only makes noise.

## Supported versions

Only the currently deployed version of the site is supported. There are no
releases and no branches to back-port to; `main` is what is live.
