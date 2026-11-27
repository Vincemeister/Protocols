import Link from "next/link";
import { Avatar, BrandChip, Button, CodeFrame, Mark } from "@/components/ui";
import { APP_NAME, SITE_HOST } from "@/lib/config";
import "./landing.css";

/**
 * A8 Landing: what Favolist is, in one screen, for creators (put it in your
 * bio) and for the people who follow them. What a visitor sees at the root
 * address; someone signed in sees their home feed there instead.
 *
 * `creatorHref` is a real creator's page for "See a creator's page".
 */
export function Landing({ creatorHref }: { creatorHref: string }) {
  return (
    <div className="landing">
      <div className="landing-inner">
        <header className="landing-head">
          <Link href="/" className="landing-brand">
            <span className="fv-mark-box"><Mark /></span>
            <span>{APP_NAME}</span>
          </Link>
          <nav aria-label="Site" className="landing-nav">
            <Button variant="link" href="/search" label="Explore creators" className="landing-wide" />
            <Button variant="tertiary" href="/sign-in" label="Sign in" />
            <Button variant="primary" href="/sign-in" label={`Create your ${APP_NAME}`} className="landing-wide" />
          </nav>
        </header>

        <section className="landing-hero">
          <div className="landing-hero-text">
            <h1 className="heading-1 landing-headline">The products you actually use, in your own words.</h1>
            <p className="body-lg landing-muted">
              {APP_NAME} is one page for everything you&apos;d recommend to a friend, with your review on every item and your codes where people are about to buy. Put it in your bio next to your other links.
            </p>
            <div className="landing-cta">
              <Button variant="primary" size="lg" href="/sign-in" label={`Create your ${APP_NAME}`} />
              <Button variant="tertiary" size="lg" href={creatorHref} label="See a creator's page" />
            </div>
            <p className="caption landing-muted">Free for creators. No passwords, no ads, no marketplace.</p>
          </div>
          {/* The mark's geometry as a mosaic: squares, one of them subdivided. The two muted tones stand in for product photos. */}
          <div className="landing-mosaic-wrap" aria-hidden="true">
            <div className="landing-mosaic">
              <div style={{ background: "var(--ink)" }} />
              <div style={{ background: "#c9bfb6" }} />
              <div style={{ background: "var(--accent-soft)" }} />
              <div style={{ background: "var(--accent-vivid)" }} />
              <div className="landing-mosaic-mark">
                <span style={{ background: "var(--ink)" }} />
                <span style={{ background: "var(--ink)" }} />
                <span style={{ background: "var(--accent-vivid)" }} />
                <span style={{ background: "var(--accent-vivid)" }} />
              </div>
              <div style={{ background: "#5a6b5e" }} />
            </div>
          </div>
        </section>

        <section className="landing-features">
          <div>
            <h2 className="heading-5">Profile</h2>
            <p className="body-sm landing-muted">Lists of what you own and use, with a review on every single product. Nothing without one.</p>
          </div>
          <div>
            <h2 className="heading-5">Codes</h2>
            <p className="body-sm landing-muted">Your referral codes sit under your words, where someone is about to buy. One tap to copy.</p>
          </div>
          <div>
            <h2 className="heading-5">Search</h2>
            <p className="body-sm landing-muted">Find what people you trust use for the thing you need, instead of a wall of five-star strangers.</p>
          </div>
          <div>
            <h2 className="heading-5">Home</h2>
            <p className="body-sm landing-muted">New products from the people you follow, with their reasons, as they add them.</p>
          </div>
        </section>

        <section className="landing-why">
          <div className="landing-why-text">
            <p className="fv-overline">Why a person</p>
            <h2 className="heading-1">Fake reviews are getting easier. A name on the review is the answer.</h2>
            <p className="body landing-muted">
              Every review on {APP_NAME} is written, or spoken, by a named creator with a face, a handle and a reputation to lose. We don&apos;t rank products, we don&apos;t sell ads, and we don&apos;t let anyone publish a product without saying why it&apos;s on their list.
            </p>
          </div>
          {/* An example card, as the artboard draws it: the review loudest, the code second, no picture. */}
          <div className="landing-why-card">
            <article className="fv-product">
              <div className="fv-product-head">
                <div className="fv-product-creator">
                  <Avatar name="Vince Rehms" size={40} />
                  <div>
                    <div className="fv-name">vince.rehms</div>
                    <div className="fv-list">Camera bag essentials</div>
                  </div>
                </div>
                <BrandChip name="Peak Design" />
              </div>
              <h3 className="fv-product-title">Everyday Sling 6L</h3>
              <p className="fv-product-review">
                I&apos;ve carried this through four countries and it still looks new. The strap is the reason I bought it: one pull and the bag swings to the front, and the magnetic latch has never once opened on its own in a crowd.
              </p>
              <CodeFrame label="10% off with" code="VINCE10" />
            </article>
          </div>
        </section>

        <section className="landing-band">
          <div>
            <h2 className="heading-3">{SITE_HOST ? `${SITE_HOST}/you, in your bio by tonight.` : `Your ${APP_NAME}, in your bio by tonight.`}</h2>
            <p className="body landing-muted">Sign in with your email, name your first list, add one product and say why. Speak the review if you&apos;d rather not type.</p>
          </div>
          <Button variant="primary" size="lg" href="/sign-in" label={`Create your ${APP_NAME}`} />
        </section>

        <footer className="landing-foot body-sm">
          <div>
            <span className="fv-mark-box"><Mark /></span>
            <span>{APP_NAME}</span>
          </div>
          {/* Terms, Privacy and Contact join these when their pages exist (A9, A10). */}
          <nav aria-label="Footer">
            <Link href="/search">Explore creators</Link>
            <Link href="/sign-in">Sign in</Link>
          </nav>
        </footer>
      </div>
    </div>
  );
}
