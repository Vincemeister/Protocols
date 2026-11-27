import assert from "node:assert/strict";
import { test } from "node:test";
import {
  amazonAsin, appStoreLookupUrl, extractProduct, fromAppStoreJson, fromAxesso, fromOpenLibrary, fromShopifyJson, isIsbn10, isWall,
  nameFromAmazonSlug, normaliseUrl, shopifyJsonUrl, stripSiteName,
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

test("a robot check is never a product", () => {
  const wall = `<title>Amazon.com</title><form action="/errors/validateCaptcha">Type the characters you see in this image</form>`;
  assert.ok(isWall(wall));
  assert.equal(extractProduct(wall, "https://www.amazon.com/dp/B0CFPJYX7P"), null);
  // Without any tell-tale text, the marketplace's own name as the only title is still not a product…
  assert.equal(extractProduct("<title>Amazon.com</title>", "https://www.amazon.com/dp/B0CFPJYX7P"), null);
  assert.equal(extractProduct("<title>Etsy</title>", "https://www.etsy.com/listing/1"), null);
  // …but a product or app that shares its site's name is fine.
  assert.equal(extractProduct("<title>Notion</title>", "https://www.notion.com/")?.name, "Notion");
  assert.ok(!isWall("<title>Captain's log</title><p>A book about robots.</p>"));
});

test("the brand's logo: from the page's data, else its large icon; never for a marketplace", () => {
  const ld = `<script type="application/ld+json">{"@graph":[{"@type":"Organization","name":"Peak Design","logo":{"@type":"ImageObject","url":"https://cdn.peak.com/logo.png"}},{"@type":"Product","name":"Sling"}]}</script>`;
  assert.equal(extractProduct(`${ld}<link rel="apple-touch-icon" href="/touch.png">`, "https://peakdesign.com/p/sling")?.logo, "https://cdn.peak.com/logo.png");
  const icons = `<title>Sling</title><link rel="icon" href="/favicon.ico"><link rel="icon" type="image/png" sizes="32x32" href="/i32.png"><link rel="icon" sizes="192x192" href="/i192.png"><link rel="apple-touch-icon" href="/touch.png"><link rel="mask-icon" href="/mask.svg">`;
  assert.equal(extractProduct(icons, "https://peakdesign.com/p/sling")?.logo, "https://peakdesign.com/i192.png");
  assert.equal(extractProduct(`<title>Sling</title><link rel="icon" href="/favicon.ico"><link rel="icon" href="/logo.svg" sizes="512x512">`, "https://peakdesign.com/p/sling")?.logo, undefined);
  assert.equal(extractProduct(`<meta property="og:title" content="Mug"><link rel="apple-touch-icon" href="/etsy.png">`, "https://www.etsy.com/listing/1/mug")?.logo, undefined);
});

test("a book's brand is its author", () => {
  const html = `<script type="application/ld+json">{"@type":"Book","name":"Project Hail Mary","author":{"@type":"Person","name":"Andy Weir"},"publisher":{"name":"Ballantine"}}</script>`;
  const p = extractProduct(html, "https://bookshop.example.com/p/hail-mary");
  assert.equal(p?.brand, "Andy Weir");
  assert.equal(p?.kind, "book");
});

test("Amazon addresses", () => {
  assert.equal(amazonAsin("https://www.amazon.com/Some-Name/dp/B0CFPJYX7P/ref=sr_1_1?x=1"), "B0CFPJYX7P");
  assert.equal(amazonAsin("https://www.amazon.de/gp/product/b0cfpjyx7p"), "B0CFPJYX7P");
  assert.equal(amazonAsin("https://www.amazon.co.uk/gp/aw/d/0593135202?psc=1"), "0593135202");
  assert.equal(amazonAsin("https://www.amazon.com/s?k=kindle"), null);
  assert.ok(isIsbn10("0593135202") && isIsbn10("080442957X"));
  assert.ok(!isIsbn10("B0CFPJYX7P") && !isIsbn10("0593135203"));
  assert.equal(nameFromAmazonSlug("https://www.amazon.com/Project-Hail-Mary-Andy-Weir/dp/0593135202"), "Project Hail Mary Andy Weir");
  assert.equal(nameFromAmazonSlug("https://www.amazon.com/dp/0593135202"), null);
  assert.equal(nameFromAmazonSlug("https://www.amazon.com/gp/product/0593135202"), null);
});

test("book catalogue and data-service answers", () => {
  const ol = fromOpenLibrary(JSON.stringify({ "ISBN:0593135202": { title: "Project Hail Mary", authors: [{ name: "Andy Weir" }], cover: { large: "https://covers.openlibrary.org/b/id/1-L.jpg" } } }));
  assert.deepEqual(ol, { title: "Project Hail Mary", author: "Andy Weir", images: ["https://covers.openlibrary.org/b/id/1-L.jpg"] });
  assert.equal(fromOpenLibrary("{}"), null);
  const ax = fromAxesso(JSON.stringify({ productTitle: "Kindle Paperwhite (16 GB)", manufacturer: "Amazon", imageUrlList: ["https://m.media-amazon.com/images/I/a.jpg"], asin: "B0CFPJYX7P" }), "https://www.amazon.com/x/dp/B0CFPJYX7P?ref=1");
  assert.deepEqual(ax, { name: "Kindle Paperwhite (16 GB)", brand: "Amazon", images: ["https://m.media-amazon.com/images/I/a.jpg"], url: "https://www.amazon.com/dp/B0CFPJYX7P", domain: "amazon.com" });
  assert.equal(fromAxesso(JSON.stringify({ message: "not found" }), "https://www.amazon.com/dp/B0CFPJYX7P"), null);
});
