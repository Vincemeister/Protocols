import assert from "node:assert/strict";
import { test } from "node:test";
import {
  appStoreLookupUrl, extractProduct, fromAppStoreJson, fromShopifyJson, normaliseUrl, shopifyJsonUrl, stripSiteName,
} from "../src/lib/scrape/extract.ts";

test("JSON-LD product wins over tags", () => {
  const html = `<html><head><title>Everyday Sling 6L | Peak Design Official Site</title>
  <meta property="og:title" content="Everyday Sling | Peak Design">
  <meta property="og:image" content="//cdn.peak.com/og.jpg?v=1">
  <link rel="canonical" href="https://www.peakdesign.com/products/everyday-sling">
  <script type="application/ld+json">{"@context":"https://schema.org","@graph":[{"@type":"WebSite","name":"Peak Design"},
  {"@type":"Product","name":"Everyday Sling 6L","brand":{"@type":"Brand","name":"Peak Design"},
  "image":["https://cdn.peak.com/a.jpg","https://cdn.peak.com/b.jpg","https://cdn.peak.com/a.jpg"]}]}</script></head></html>`;
  const p = extractProduct(html, "https://www.peakdesign.com/products/everyday-sling?utm_source=x");
  assert.deepEqual(p, {
    name: "Everyday Sling 6L", brand: "Peak Design",
    images: ["https://cdn.peak.com/a.jpg", "https://cdn.peak.com/b.jpg", "https://cdn.peak.com/og.jpg?v=1"],
    url: "https://www.peakdesign.com/products/everyday-sling", domain: "peakdesign.com",
  });
});

test("Open Graph only, with entities and a site-name suffix", () => {
  const html = `<title>ignored</title><meta content="AeroPress Clear &amp; Go &#8211; AeroPress" property="og:title"/>
  <meta property="og:site_name" content="AeroPress"><meta name="twitter:image" content="/img/clear.png">`;
  const p = extractProduct(html, "https://aeropress.com/products/clear");
  assert.equal(p?.name, "AeroPress Clear & Go");
  assert.equal(p?.brand, "AeroPress");
  assert.deepEqual(p?.images, ["https://aeropress.com/img/clear.png"]);
});

test("Amazon markup", () => {
  const html = `<title>Amazon.com: Kindle Paperwhite : Electronics</title>
  <span id="productTitle" class="a-size-large">  Kindle Paperwhite (16 GB)  </span>
  <a id="bylineInfo" class="a-link-normal" href="/stores/x">Visit the Amazon Store</a>
  <img id="landingImage" data-old-hires="https://m.media-amazon.com/images/I/hires.jpg"
   data-a-dynamic-image="{&quot;https://m.media-amazon.com/images/I/small.jpg&quot;:[300,300],&quot;https://m.media-amazon.com/images/I/big.jpg&quot;:[900,900]}">`;
  const p = extractProduct(html, "https://www.amazon.com/dp/B0CFPJYX7P");
  assert.equal(p?.name, "Kindle Paperwhite (16 GB)");
  assert.equal(p?.brand, "Amazon");
  assert.deepEqual(p?.images, [
    "https://m.media-amazon.com/images/I/hires.jpg", "https://m.media-amazon.com/images/I/big.jpg", "https://m.media-amazon.com/images/I/small.jpg",
  ]);
  assert.equal(p?.domain, "amazon.com");
});

test("a marketplace is not the brand; walls and empty pages give null", () => {
  const etsy = extractProduct(`<meta property="og:title" content="Hand-thrown mug"><meta property="og:site_name" content="Etsy">`, "https://www.etsy.com/listing/1/mug");
  assert.equal(etsy?.brand, undefined);
  assert.equal(extractProduct("<title>Just a moment...</title>", "https://shop.example.com/p/1"), null);
  assert.equal(extractProduct("<html><body>hi</body></html>", "https://shop.example.com/p/1"), null);
  assert.equal(extractProduct(`<script type="application/ld+json">{broken</script><title>Access Denied</title>`, "https://x.example.com/"), null);
});

test("canonical links are trusted only on the same site", () => {
  const html = `<title>Thing</title><link href="https://evil.example.org/x" rel="canonical">`;
  assert.equal(extractProduct(html, "https://shop.example.com/p/1")?.url, "https://shop.example.com/p/1");
});

test("Shopify JSON", () => {
  assert.equal(shopifyJsonUrl("https://www.peakdesign.com/collections/bags/products/everyday-sling?variant=1"), "https://www.peakdesign.com/products/everyday-sling.js");
  assert.equal(shopifyJsonUrl("https://example.com/about"), null);
  const p = fromShopifyJson(JSON.stringify({ title: "Everyday Sling", vendor: "Peak Design", featured_image: "//cdn.shopify.com/s/a.jpg", images: ["//cdn.shopify.com/s/a.jpg", "//cdn.shopify.com/s/b.jpg"] }), "https://www.peakdesign.com/products/everyday-sling?variant=1");
  assert.deepEqual(p, { name: "Everyday Sling", brand: "Peak Design", images: ["https://cdn.shopify.com/s/a.jpg", "https://cdn.shopify.com/s/b.jpg"], url: "https://www.peakdesign.com/products/everyday-sling", domain: "peakdesign.com" });
  assert.equal(fromShopifyJson("<html>", "https://x.com/products/y"), null);
});

test("App Store", () => {
  assert.equal(appStoreLookupUrl("https://apps.apple.com/id/app/things-3/id904237743"), "https://itunes.apple.com/lookup?id=904237743&country=id");
  assert.equal(appStoreLookupUrl("https://example.com/id123"), null);
  const p = fromAppStoreJson(JSON.stringify({ results: [{ trackName: "Things 3", sellerName: "Cultured Code GmbH & Co. KG", artworkUrl512: "https://is1-ssl.mzstatic.com/a/512x512bb.jpg", trackViewUrl: "https://apps.apple.com/us/app/things-3/id904237743?uo=4" }] }), "https://apps.apple.com/us/app/things-3/id904237743");
  assert.equal(p?.name, "Things 3");
  assert.equal(p?.url, "https://apps.apple.com/us/app/things-3/id904237743");
});

test("normaliseUrl and stripSiteName", () => {
  assert.equal(normaliseUrl(" peakdesign.com/products/x "), "https://peakdesign.com/products/x");
  assert.equal(normaliseUrl("http://a.co/d/1"), "http://a.co/d/1");
  assert.equal(normaliseUrl("not a link"), null);
  assert.equal(normaliseUrl("javascript:alert(1)"), null);
  assert.equal(normaliseUrl("localhost"), null);
  assert.equal(stripSiteName("Peak Design | Everyday Sling", ["Peak Design"]), "Everyday Sling");
  assert.equal(stripSiteName("Sony WH-1000XM5 - Black", ["Sony", "sony"]), "Sony WH-1000XM5 - Black");
});
