const REVIEW_BOOSTER_PAGES_ORIGIN =
  "https://lt-google-review-booster.pages.dev";
const REVIEW_BOOSTER_PREFIX = "/lt-google-review-booster";
const REVIEW_BOOSTER_PLURAL_PREFIX = "/lt-google-reviews-booster";

function redirectPluralReviewBoosterPath(requestUrl) {
  if (!requestUrl.pathname.startsWith(REVIEW_BOOSTER_PLURAL_PREFIX)) {
    return null;
  }

  const destination = new URL(requestUrl);
  destination.pathname =
    REVIEW_BOOSTER_PREFIX +
    requestUrl.pathname.slice(REVIEW_BOOSTER_PLURAL_PREFIX.length);

  if (destination.pathname === REVIEW_BOOSTER_PREFIX) {
    destination.pathname = `${REVIEW_BOOSTER_PREFIX}/`;
  }

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
    const pluralRedirect = redirectPluralReviewBoosterPath(requestUrl);

    if (pluralRedirect) {
      return pluralRedirect;
    }

    if (requestUrl.pathname.startsWith(REVIEW_BOOSTER_PREFIX)) {
      return proxyReviewBoosterRequest(request, requestUrl);
    }

    return env.ASSETS.fetch(request);
  },
};
