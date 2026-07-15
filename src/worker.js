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
  const upstreamRequest = new Request(upstreamUrl.toString(), request);
  upstreamRequest.headers.set("x-lt-review-booster-proxy", "app-domain");

  return fetch(upstreamRequest);
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
