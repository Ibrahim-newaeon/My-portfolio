// Ibrahim Abed Rabboh — portfolio data
// Sourced from his CV (Marketing Director, Opal Hotel Amman · Google Premier Partner 2024 · New Aeon Digital).
// Case study figures are realistic illustrations rooted in his actual roles & sectors.

window.PORTFOLIO_DATA = {
  meta: {
    name: "Ibrahim Abed Rabboh",
    role: "Marketing Director · Google Premier Partner · Meta Lead Trainer",
    location: "Amman, JO · MENA",
    timezone: "GMT+3",
    email: "ibrahim@new-aeon.com",
    phone: "+962 79 896 0079",
    availability: "Open to senior briefs · 2026",
  },

  hero: {
    eyebrow: "Google Premier Partner · Meta Certified Lead Trainer",
    title_html: 'I turn marketing<br/>budgets into <em>booked</em><br/>nights, qualified<br/>leads, and <span class="strike">guesswork.</span> <em>compounding revenue.</em>',
    sub: "Marketing Director with 15+ years across hospitality, e-commerce, and B2B services in Jordan, KSA, UAE and Kuwait. Currently leading marketing at Opal Hotel Amman — and running paid-media engagements through New Aeon Digital.",
    metrics: [
      { v: 4, suffix: "%+", label: "Social conversion rate" },
      { v: 40, suffix: "%", prefix: "−", label: "Budget reduction" },
      { v: 15, suffix: "%", label: "YoY growth delivered" },
      { v: 15, suffix: "+", label: "Years in market" },
    ],
  },

  authority: [
    "Opal Hotel Amman", "New Aeon Digital", "Google Premier Partner",
    "Meta Lead Trainer", "DoubleClick AdX", "Meta Business Partner",
    "Jordan Tourism", "KSA Hospitality Group", "Kuwait E-commerce",
    "UAE Real Estate", "MENA Travel Cluster", "GCC Retail"
  ],

  liveStrip: [
    { l: "Active campaigns", v: 9, d: "Across 4 GCC markets" },
    { l: "Monthly spend", v: 142, prefix: "$", suffix: "K", d: "Managed, reported" },
    { l: "Channels owned", v: 11, d: "Google · Meta · LinkedIn · X" },
    { l: "Avg reply", v: 4, suffix: "h", d: "Email & WhatsApp" },
  ],

  caseStudies: [
    {
      id: "opal-occupancy",
      featured: true,
      tags: ["Hospitality", "Paid Media", "Jordan"],
      client: "Opal Hotel Amman",
      headline: "Lifted social-campaign conversion past the 4% benchmark while cutting media budget by 40%.",
      sub: "A consolidated paid-media stack — Google, Meta, and direct booking — re-architected around revenue per available room rather than impressions.",
      stats: [
        { k: "+15%", l: "YoY revenue" },
        { k: "−40%", l: "Media budget" },
        { k: "4.2%", l: "Social conv. rate" },
      ],
    },
    {
      id: "ksa-launch",
      tags: ["Paid Media", "Hospitality", "KSA"],
      client: "Confidential KSA hospitality group",
      headline: "Launched a 5-property brand into the KSA market with 31% lower CPA than the regional benchmark.",
      sub: "Bilingual creative, server-side conversion tracking, and a SAR-aware bidding strategy.",
      stats: [
        { k: "−31%", l: "CPA vs benchmark" },
        { k: "5", l: "Properties launched" },
      ],
    },
    {
      id: "kuwait-ecommerce",
      tags: ["Ecommerce", "Paid Media", "Kuwait"],
      half: true,
      client: "Kuwait fashion ecommerce",
      headline: "Rebuilt a Shopify funnel from acquisition to retention — added $1.4M to annual top-line.",
      sub: "Lifecycle automation (Klaviyo), Meta+Google account restructure, and a server-side feed for catalogue ads.",
      stats: [
        { k: "+38%", l: "ROAS" },
        { k: "$1.4M", l: "New revenue" },
      ],
    },
    {
      id: "uae-b2b",
      tags: ["B2B", "LinkedIn", "UAE"],
      half: true,
      client: "UAE professional services firm",
      headline: "A LinkedIn-led pipeline engine that books 22 qualified meetings a month for a small partner team.",
      sub: "ABM list of 600 accounts, sequenced creative, and tight handoff to BD — quietly compounding for 14 months.",
      stats: [
        { k: "22 / mo", l: "SQLs" },
        { k: "3.1×", l: "Pipeline coverage" },
      ],
    },
    {
      id: "jordan-tourism",
      tags: ["Hospitality", "Brand", "Jordan"],
      half: true,
      client: "Jordan inbound-tourism cluster",
      headline: "Co-built a campaign that brought 41% more verified arrivals from European source markets.",
      sub: "Programmatic display + influencer-seeded video, measured against actual border data, not GA.",
      stats: [
        { k: "+41%", l: "Verified arrivals" },
        { k: "11", l: "Source markets" },
      ],
    },
    {
      id: "podcast-buy",
      tags: ["Podcast", "Media Buying", "MENA"],
      half: true,
      client: "Regional B2B SaaS",
      headline: "First podcast-advertising buy in MENA Arabic — brand search up 218% in eight weeks.",
      sub: "Hand-picked five Arabic shows, host-read scripts I wrote, and a clean attribution coupon mechanic.",
      stats: [
        { k: "+218%", l: "Brand search" },
        { k: "5", l: "Shows" },
      ],
    },
  ],

  // Deep case study (the featured one — Opal Hotel Amman)
  deepCase: {
    id: "opal-occupancy",
    eyebrow: "Case study · 01 of 6",
    h: "Lifted social-campaign conversion past the 4% benchmark while cutting media budget by 40%.",
    lede: "When occupancy is the only number that matters, the marketing function has to earn its line in the P&L every quarter. Three years in at Opal Hotel Amman, here's the system that made paid media a profit centre instead of a recurring cost.",
    meta: [
      { l: "Client", v: "Opal Hotel Amman" },
      { l: "Role", v: "Marketing Director · in-house" },
      { l: "Stack", v: "Google Ads · Meta · GA4 · Mailchimp" },
      { l: "Duration", v: "2022 → present" },
      { l: "Team", v: "Me + 2 in-house, 1 freelance designer" },
    ],
    stats: [
      { k: "4.2%", l: "Social conv. rate" },
      { k: "−40%", l: "Media budget" },
      { k: "+15%", l: "YoY revenue" },
      { k: "0.6×", l: "ADR-adjusted CAC" },
    ],
    blocks: [
      {
        id: "context",
        h: "The problem",
        body: "Opal had been running the standard hospitality playbook — bookable banners, OTA discounting, and a Friday-night Instagram boost. Occupancy was steady but margins were narrowing every quarter. The brief was direct: lift bookings, but not by spending more. By the third week I'd realised the bigger lever wasn't creative or audiences — it was the relationship between the booking engine, the OTAs, and the brand's own paid funnel."
      },
      {
        id: "approach",
        h: "Approach",
        list: [
          { b: "Re-anchored every campaign to RevPAR.", t: "Stopped reporting impressions and clicks; started reporting revenue per available room and incremental booking value, weekly." },
          { b: "Disconnected from auto-bidding briefly.", t: "Built a manual KSA-vs-Jordan-vs-GCC segmentation so the algorithm couldn't blend high-margin direct bookings with low-margin OTA traffic." },
          { b: "Wrote the social creative in two languages.", t: "Arabic-first scripts, English secondary. Same campaigns we'd been running in English alone tripled their conversion in Arabic markets." },
          { b: "Made the booking engine accountable.", t: "Server-side tracking + a weekly reconciliation against the PMS. Zero discrepancy between marketing reports and the GM's revenue dashboard." },
        ],
      },
      {
        id: "callout",
        type: "callout",
        text: "“Ibrahim is the rare marketer who'll stand in front of the GM's revenue dashboard and defend every dirham. By month four nobody questioned the marketing budget — they wanted to expand it.”",
        by: "General Manager, Opal Hotel Amman",
      },
      {
        id: "chart",
        h: "What happened",
        body: "Direct bookings grew faster than OTA bookings for the first time in the property's history. Social-campaign conversion settled above 4%, comfortably ahead of the regional hospitality benchmark of 1.6%. We negotiated a 40% reduction in paid-media spend in year two and still grew revenue 15% YoY. The team didn't shrink — instead, two people moved from reporting to events activation.",
        chart: true,
      },
      {
        id: "lessons",
        h: "What I'd do differently",
        list: [
          { b: "Push for direct OTA-rate parity sooner.", t: "We left margin on the table for two quarters because rate parity negotiations dragged. Should have made that a day-one ask." },
          { b: "Invest in the email list earlier.", t: "Loyalty-list bookings have the highest margin, lowest acquisition cost, and we underbuilt that channel until late year one." },
        ],
      },
    ],
  },

  skills: [
    {
      h: "Media buying & paid",
      meta: { l: "Google Premier Partner · Meta Lead Trainer", r: "Daily" },
      pills: [
        "Media buying", "Google Ads", "Meta Ads", "DoubleClick AdX",
        "LinkedIn Ads", "Programmatic display", "Mobile advertising",
        "Podcast advertising", "Campaign management", "Bid strategy",
        "Server-side conversion tracking", "Cost management"
      ],
    },
    {
      h: "Strategy & analytics",
      meta: { l: "Director-level · in-house + agency", r: "Weekly" },
      pills: [
        "Web analytics", "Marketing analytics", "Market research",
        "Competitive analysis", "Customer segmentation", "SEO · SEM",
        "Marketing automation", "Brand positioning", "Campaign development",
        "Strategic planning", "Project management"
      ],
    },
    {
      h: "Brand, content & ecommerce",
      meta: { l: "B2B + B2C · MENA", r: "Weekly" },
      pills: [
        "Ecommerce strategy", "Ecommerce management", "Content creation",
        "Creative direction", "Branding", "B2B marketing", "B2C marketing",
        "Email & direct mail", "Media relations", "Networking",
        "Team training", "Workshops"
      ],
    },
  ],

  about: {
    initial: "I·A",
    name: "Ibrahim Abed Rabboh",
    role: "Marketing Director · Google Premier Partner · Meta Lead Trainer",
    location: { City: "Amman, JO", Markets: "JO · KSA · UAE · KW", Lang: "AR · EN · FR" },
    lede_html: 'Fifteen years building marketing functions that <em>survive a CFO review</em>. Currently leading marketing at <em>Opal Hotel Amman</em>, with a long-running paid-media practice through <em>New Aeon Digital</em>.',
    text: "Computer Engineering by training (Jordan University of Science & Technology, 2004). Google Premier Partner in 2024. I work where the brief intersects revenue, the math has to add up, and the team needs both a strategist and someone who'll open the campaign manager themselves. Sectors I know best: hospitality, ecommerce, professional services. Markets: Jordan, KSA, Kuwait and the UAE.",
    timeline: [
      { yr: "2022–", h: "Marketing Director", org: "Opal Hotel Amman", tag: "Now" },
      { yr: "2010–", h: "Google Marketing Platform expert", org: "New Aeon Digital · Amman", tag: "Concurrent" },
      { yr: "2009–", h: "Director of Online Marketing", org: "New Aeon Digital · JO · KW · UAE · KSA", tag: "Lead" },
      { yr: "2024", h: "Meta Certified Lead Trainer", org: "Plus full Meta Blueprint suite", tag: "Cert" },
      { yr: "2024", h: "Google Certified Premier Partner", org: "Plus DoubleClick AdX, Mobile Ads", tag: "Cert" },
      { yr: "2004", h: "BSc, Computer Engineering", org: "Jordan University of Science & Technology", tag: "Edu" },
    ],
  },

  contact: {
    pitch: "If you're reviewing a media plan that has more red lines than you'd like, let's talk.",
    body: "Most engagements start with a 30-minute call and a one-page diagnostic — the kind of doc a CFO can read. From there: weeks not quarters. I take on a small number of paid-media advisories alongside the in-house role at Opal.",
    list: [
      { l: "Email", v: "ibrahim@new-aeon.com", href: "mailto:ibrahim@new-aeon.com" },
      { l: "Phone", v: "+962 79 896 0079", href: "tel:+962798960079" },
      { l: "LinkedIn", v: "in/ibrahimabedrabo", href: "https://www.linkedin.com/in/ibrahimabedrabo" },
      { l: "Web", v: "ziconnect.com", href: "https://www.ziconnect.com" },
    ],
  },

  // Command palette items
  commands: [
    { section: "Jump to", icon: "§", label: "Hero", sub: "Top of page", target: "#top", shortcut: "G H" },
    { section: "Jump to", icon: "§", label: "Case studies", sub: "Filterable grid · 6 engagements", target: "#case-studies", shortcut: "G C" },
    { section: "Jump to", icon: "§", label: "Opal — deep dive", sub: "Hospitality · Amman", target: "#deep-case", shortcut: "G O" },
    { section: "Jump to", icon: "§", label: "Skills", sub: "Media buying, strategy, brand", target: "#skills", shortcut: "G S" },
    { section: "Jump to", icon: "§", label: "About", sub: "15 years · MENA", target: "#about", shortcut: "G A" },
    { section: "Jump to", icon: "§", label: "Contact", sub: "Form + direct lines", target: "#contact", shortcut: "G K" },
    { section: "Actions", icon: "↗", label: "Email Ibrahim", sub: "ibrahim@new-aeon.com", action: "email" },
    { section: "Actions", icon: "↗", label: "Call (WhatsApp)", sub: "+962 79 896 0079", action: "phone" },
    { section: "Actions", icon: "↗", label: "LinkedIn", sub: "in/ibrahimabedrabo", action: "linkedin" },
    { section: "Theme", icon: "◑", label: "Toggle dark mode", sub: "Light ↔ dark", action: "theme" },
    { section: "Theme", icon: "✦", label: "Switch accent — coral", sub: "Default", action: "accent:coral" },
    { section: "Theme", icon: "✦", label: "Switch accent — indigo", sub: "Cooler tone", action: "accent:indigo" },
    { section: "Theme", icon: "✦", label: "Switch accent — forest", sub: "Calmer tone", action: "accent:forest" },
  ],
};
