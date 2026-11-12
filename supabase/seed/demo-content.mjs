// Demo profiles for the public pages: sample content so the app is never
// empty before real creators arrive. NOT real reviews. Vince's profile uses
// the copy from the designed screens; Mira and Ketut are made-up people, and
// every brand except the three on the artboards (Peak Design, Sony, Notion)
// is made up too. Delete these profiles before a public launch.
//
// Edit here, then `npm run seed:build` to regenerate demo.json (what the app
// shows when Supabase is not connected) and demo.sql (what is loaded into
// Supabase).

const DEMO_NOTE = "This is a demo profile with sample content, shown while Favolist is being built.";

export const profiles = [
  {
    username: "vince.rehms",
    display_name: "Vince Rehms",
    bio: "Travel photographer in Bali. Everything here I own, use and would buy again.",
    about: `I shoot travel and food around Indonesia and I get asked the same question every week: what's in the bag? This is the answer, kept up to date. If I stopped using something, it comes off the list.\n\n${DEMO_NOTE}`,
    links: [
      { kind: "youtube", url: "https://youtube.com/@vince" },
      { kind: "instagram", url: "https://instagram.com/vince.rehms" },
      { kind: "website", url: "https://vincerehms.com" },
    ],
    lists: [
      {
        name: "Camera bag essentials", cover: "plum", numbered: true, updated: "2026-11-04",
        intro: "What's in the bag on a shoot day. Nothing sponsored; I bought all of it, and I've replaced the things that broke.",
        products: [
          {
            name: "Everyday Sling 6L", brand: "Peak Design", url: "https://www.peakdesign.com", added: "2026-08-10",
            review: "I've carried this through four countries and it still looks new. The strap is the reason I bought it: one pull and the bag swings to the front, and the magnetic latch has never once opened on its own in a crowd. It takes a mirrorless body with a 35mm, a spare battery and a phone, and nothing more, which is the point.",
            code: { code: "VINCE10", benefit: "10% off" },
          },
          {
            name: "A7C II", brand: "Sony", url: "https://www.sony.com", added: "2026-08-12",
            review: "Small enough that I actually bring it. I shoot it with one 35mm lens most days, and the battery gets me through a full day of walking around. The flip screen is the part I didn't know I needed.",
          },
          {
            name: "Battery and card pouch", brand: "Halden", added: "2026-09-02",
            review: "Two batteries and a card wallet in one zip. Dull, but it ended the ritual of emptying the whole bag on a café table to find a card.",
          },
        ],
      },
      {
        name: "Desk setup", cover: "sage", updated: "2026-10-21",
        intro: "Where the editing happens. I keep it to things that earn the space.",
        products: [
          {
            name: "Notion Plus", brand: "Notion", url: "https://www.notion.com", added: "2026-08-20",
            review: "Every shoot gets a page: the brief, the shot list, the invoice. I tried three other tools and came back each time, mostly because clients can open a page without making an account.",
          },
          {
            name: "Monitor light bar", brand: "Lumo", added: "2026-09-15",
            review: "It lights the desk and not the screen, so I can edit at night without a lamp reflecting in the photo I'm grading. I forget it's there, which is the best thing I can say about a lamp.",
          },
        ],
      },
      {
        name: "Bali travel kit", cover: "slate", updated: "2026-10-02",
        intro: "For scooter days and boat days. Everything here has been rained on.",
        products: [
          {
            name: "Dry bag 10L", brand: "Tidewater", added: "2026-09-20",
            review: "The camera goes in here the moment a boat is involved. Roll it three times and it floats; I tested that by accident off Nusa Penida.",
            code: { code: "VINCEDRY", benefit: "Free strap" },
          },
          {
            name: "Mineral sunscreen SPF 50", brand: "Solara", added: "2026-09-22",
            review: "Doesn't run into my eyes when I sweat, which rules out most of the others I tried. One tube lasts me about a month of shooting outside.",
          },
        ],
      },
      {
        name: "Coffee at home", cover: "umber", updated: "2026-09-12",
        intro: "One good cup before the light gets harsh.",
        products: [
          {
            name: "Hand grinder", brand: "Kopi & Co", added: "2026-09-10",
            review: "Forty seconds of grinding and the kitchen smells right. I bought it for travel and it never left the house.",
          },
        ],
      },
    ],
  },
  {
    username: "mira.makes",
    display_name: "Mira Kusuma",
    bio: "Trail runner and ceramicist in Ubud. I only list what survived a rainy season.",
    about: `Mornings on the ridge, afternoons at the wheel. People ask about the vest more than the pots.\n\n${DEMO_NOTE}`,
    links: [{ kind: "instagram", url: "https://instagram.com/mira.makes" }],
    lists: [
      {
        name: "Trail runs", cover: "sage", numbered: true, updated: "2026-11-01",
        intro: "What I carry for anything over an hour in the hills.",
        products: [
          {
            name: "Trail vest 5L", brand: "Ridgeline", added: "2026-08-18",
            review: "It doesn't bounce, even full. I've washed it more times than I can count and the mesh hasn't stretched.",
          },
          {
            name: "Soft flask 500ml", brand: "Ridgeline", added: "2026-08-18",
            review: "Shrinks as you drink, so nothing sloshes. Buy two; you will lose a cap.",
            code: { code: "MIRA15", benefit: "15% off" },
          },
          {
            name: "Headlamp 400", brand: "Nightjar", added: "2026-10-05",
            review: "For the 5am starts. Bright enough to see roots, light enough that I forget I'm wearing it by the second kilometre.",
          },
        ],
      },
      {
        name: "Studio shelf", cover: "rose", updated: "2026-10-11",
        intro: "The few tools I'd buy again tomorrow.",
        products: [
          {
            name: "Trimming tool set", brand: "Clayworks", added: "2026-09-08",
            review: "Three loops, and I use one of them for nearly everything. They hold an edge far longer than the set I learned on.",
          },
          {
            name: "Split-leg apron", brand: "Clayworks", added: "2026-09-08",
            review: "Covers both knees at the wheel. It took me two years of ruined trousers to buy one.",
          },
        ],
      },
    ],
  },
  {
    username: "ketut.rides",
    display_name: "Ketut Arya",
    bio: "I ride a scooter across Bali every day and fix it myself.",
    about: `Twenty years on two wheels between Denpasar and Singaraja. This is what's under the seat.\n\n${DEMO_NOTE}`,
    links: [{ kind: "youtube", url: "https://youtube.com/@ketut.rides" }],
    lists: [
      {
        name: "Scooter kit", cover: "slate", numbered: true, updated: "2026-10-28",
        intro: "Everything under the seat, in the order I'd replace it.",
        products: [
          {
            name: "Rain poncho", brand: "Monsun", added: "2026-08-25",
            review: "Long enough to cover my knees while riding, and the hood fits under a helmet. It lives under the seat from November to March.",
          },
          {
            name: "Phone mount", brand: "Gripline", added: "2026-08-25",
            review: "Hasn't dropped the phone once, including on the road to Kintamani, which drops everything.",
            code: { code: "KETUT", benefit: "Free shipping" },
          },
          {
            name: "Tyre repair kit", brand: "Gripline", added: "2026-09-30",
            review: "Used it four times this year. Ten minutes by the roadside and I'm moving again, without pushing the bike to a workshop.",
          },
        ],
      },
      {
        name: "Roadside coffee", cover: "umber", updated: "2026-09-18",
        intro: "For the long way round.",
        products: [
          {
            name: "Insulated bottle 600ml", brand: "Kaldu", added: "2026-09-16",
            review: "Coffee from home is still hot at the top of the pass. It fits the hook under the handlebars, which is the only reason I chose this size.",
          },
        ],
      },
    ],
  },
];

// Who follows whom, and a few likes, so the counts are not all zero.
export const follows = [
  ["mira.makes", "vince.rehms"],
  ["ketut.rides", "vince.rehms"],
  ["vince.rehms", "mira.makes"],
  ["ketut.rides", "mira.makes"],
  ["vince.rehms", "ketut.rides"],
];
export const likes = [
  ["mira.makes", "everyday-sling-6l"],
  ["ketut.rides", "everyday-sling-6l"],
  ["ketut.rides", "dry-bag-10l"],
  ["vince.rehms", "trail-vest-5l"],
  ["vince.rehms", "rain-poncho"],
  ["mira.makes", "rain-poncho"],
];

// Placeholder cover tones, taken from the designed screens.
export const covers = { plum: "#6b5a5f", sage: "#5a6b5e", slate: "#4f5a6b", umber: "#6b645a", rose: "#6b5a5a" };
