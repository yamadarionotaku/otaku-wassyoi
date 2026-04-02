const DEFAULT_SITE_URL = "https://otaku-wassyoi.vercel.app";

export function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? DEFAULT_SITE_URL).replace(
    /\/+$/,
    "",
  );
}

export function getAbsoluteUrl(path = "/") {
  return new URL(path, `${getSiteUrl()}/`).toString();
}
