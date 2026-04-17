/* eslint-disable no-console */
/**
 * Pings search engines after major content updates. Run nightly via cron.
 */
import { absoluteUrl } from "../src/lib/utils";

async function main() {
  const sitemap = absoluteUrl("/sitemap.xml");
  const pings = [
    `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemap)}`,
    `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemap)}`,
  ];
  for (const url of pings) {
    const res = await fetch(url);
    console.log(res.status, url);
  }
}

main().catch(console.error);
