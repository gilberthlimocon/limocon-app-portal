const REVIEW_BOOSTER_PAGES_ORIGIN =
  "https://lt-google-review-booster.pages.dev";
const REVIEW_BOOSTER_PREFIX = "/lt-google-review-booster";
const REVIEW_BOOSTER_PLURAL_PREFIX = "/lt-google-reviews-booster";
const REVIEW_BOOSTER_SLASH_PATHS = new Set([
  `${REVIEW_BOOSTER_PREFIX}`,
  `${REVIEW_BOOSTER_PREFIX}/privacy`,
  `${REVIEW_BOOSTER_PREFIX}/terms`,
  `${REVIEW_BOOSTER_PREFIX}/account-deletion`,
  `${REVIEW_BOOSTER_PREFIX}/auth-callback`,
]);

function canonicalReviewBoosterRedirect(requestUrl) {
  let pathname = requestUrl.pathname;

  if (pathname.startsWith(REVIEW_BOOSTER_PLURAL_PREFIX)) {
    pathname =
      REVIEW_BOOSTER_PREFIX +
      pathname.slice(REVIEW_BOOSTER_PLURAL_PREFIX.length);
  }

  if (
    pathname === `${REVIEW_BOOSTER_PREFIX}/deletion` ||
    pathname === `${REVIEW_BOOSTER_PREFIX}/delete`
  ) {
    pathname = `${REVIEW_BOOSTER_PREFIX}/account-deletion/`;
  } else if (REVIEW_BOOSTER_SLASH_PATHS.has(pathname)) {
    pathname = `${pathname}/`;
  }

  if (pathname === requestUrl.pathname) {
    return null;
  }

  const destination = new URL(requestUrl);
  destination.pathname = pathname;
  return Response.redirect(destination.toString(), 301);
}

async function proxyReviewBoosterRequest(request, requestUrl) {
  const upstreamUrl = new URL(
    requestUrl.pathname + requestUrl.search,
    REVIEW_BOOSTER_PAGES_ORIGIN,
  );

  const upstreamHeaders = new Headers();
  const passThroughHeaders = [
    "accept",
    "accept-encoding",
    "accept-language",
    "user-agent",
  ];

  for (const headerName of passThroughHeaders) {
    const headerValue = request.headers.get(headerName);
    if (headerValue) {
      upstreamHeaders.set(headerName, headerValue);
    }
  }

  upstreamHeaders.set("x-lt-review-booster-proxy", "app-domain");

  const upstreamRequest = new Request(upstreamUrl.toString(), {
    method: request.method,
    headers: upstreamHeaders,
    body: request.method === "GET" || request.method === "HEAD"
      ? undefined
      : request.body,
    redirect: "manual",
  });

  const upstreamResponse = await fetch(upstreamRequest);
  const responseHeaders = new Headers(upstreamResponse.headers);
  responseHeaders.set("Cache-Control", "no-store, max-age=0");
  responseHeaders.set("X-LT-Proxy-Origin", "lt-google-review-booster");

  return new Response(upstreamResponse.body, {
    status: upstreamResponse.status,
    statusText: upstreamResponse.statusText,
    headers: responseHeaders,
  });
}

export default {
  async fetch(request, env) {
    const requestUrl = new URL(request.url);
    const reviewBoosterRedirect = canonicalReviewBoosterRedirect(requestUrl);

    if (reviewBoosterRedirect) {
      return reviewBoosterRedirect;
    }

    if (requestUrl.pathname.startsWith(REVIEW_BOOSTER_PREFIX)) {
      return proxyReviewBoosterRequest(request, requestUrl);
    }

    return env.ASSETS.fetch(request);
  },
};
