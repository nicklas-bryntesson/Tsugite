// Every <Name>.bench.astro in the package, keyed by the docs slug of its component
// (CtaButton → cta-button), so a suite and the docs map name a bench the same way.
const files = import.meta.glob<{ default: unknown }>("../../components/**/*.bench.astro", { eager: true });

const slugOf = (path: string) =>
  path
    .split("/")
    .pop()!
    .replace(/\.bench\.astro$/, "")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase();

export const benches = Object.entries(files)
  .map(([path, mod]) => ({ slug: slugOf(path), title: path.split("/").pop()!.replace(/\.bench\.astro$/, ""), Bench: mod.default }))
  .sort((a, b) => a.slug.localeCompare(b.slug));
