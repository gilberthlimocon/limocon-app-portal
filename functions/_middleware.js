const REVIEW_BOOSTER_PAGES_HOST = "lt-google-review-booster.pages.dev";
const REVIEW_BOOSTER_PREFIX = "/lt-google-review-booster";

export async function onRequest(context) {
  const requestUrl = new URL(context.request.url);

  if (!requestUrl.pathname.startsWith(REVIEW_BOOSTER_PREFIX)) {
    return context.next();
  }

  const upstreamUrl = new URL(context.request.url);
  upstreamUrl.hostname = REVIEW_BOOSTER_PAGES_HOST;

  const upstreamRequest = new Request(upstreamUrl.toString(), context.request);
  upstreamRequest.headers.set("x-lt-review-booster-proxy", "app-domain");

  return fetch(upstreamRequest);
}
