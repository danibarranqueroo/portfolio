/**
 * Theme bootstrap, inlined into <head> and executed before first paint.
 *
 * It has to be inline and blocking: anything deferred or bundled runs after
 * the first paint, so a visitor with a stored theme would see the system
 * theme flash first.
 *
 * `is:inline` opts a script out of Astro's processing, which also opts it out
 * of Astro's automatic CSP hashing — so the hash is computed from THIS exact
 * string in astro.config.mjs and passed to security.csp.scriptDirective.hashes.
 * Both sides import this constant, so they cannot drift apart. Edit the script
 * and the hash follows automatically.
 *
 * Kept as a single line deliberately: no whitespace for a build step to
 * normalise, so the hash stays stable.
 */
export const THEME_INIT =
  'try{var t=localStorage.getItem("theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}';
