/**
 * The article library behind /blog.
 *
 * WHY A BLOG AT ALL
 * -----------------
 * Product and category pages answer "who sells this". They cannot answer "which of these
 * should I buy", and that is the question a specifier types before they ever look for a
 * supplier. Searches like "ringlock vs cuplock" or "EN 1065 prop classes" have real volume
 * and no commercial page can rank for them, because the honest answer is a comparison rather
 * than a product listing. These articles exist to meet that intent and to hand the reader
 * onward into the catalogue.
 *
 * ACCURACY RULES APPLIED HERE
 * ---------------------------
 * 1. European standards are described by WHAT THEY GOVERN, never by quoting load values.
 *    Safe working loads depend on the size, the class and the extension of a specific item,
 *    so a single published number would be wrong for most of the range. Where a class is
 *    named it is one KEAA's own certification record already carries (see company.js).
 * 2. Nothing is claimed about KEAA that company.js does not already state.
 * 3. Comparisons are qualitative and structural, about how a system is built and what that
 *    means on site, which is what the reader is actually choosing between.
 *
 * Each post links to at least two catalogue destinations, per the SEO brief.
 *
 * `updated` is the date the text was last edited. It feeds dateModified in the Article
 * markup. There is no `published` field separate from it because nothing here has been
 * revised since it was written; add one when that stops being true.
 */

/** Categories and subcategories referenced by the articles, resolved to their real URLs. */
const LINKS = {
  scaffolding: { to: '/products/scaffolding-formworks', label: 'Scaffolding and formwork' },
  ringlock: { to: '/products/scaffolding-formworks/system-scaffolds-ringlock', label: 'Ringlock system scaffold' },
  cuplock: { to: '/products/scaffolding-formworks/system-scaffold-cuplock', label: 'Cuplock system scaffold' },
  americanFrame: { to: '/products/scaffolding-formworks/access-scaffold-american-frame', label: 'American frame scaffold' },
  euroFrame: { to: '/products/scaffolding-formworks/access-scaffold-euro-frame', label: 'Euro frame scaffold' },
  props: { to: '/products/scaffolding-formworks/slab-formwork-system-props', label: 'Slab formwork props' },
  forkHeads: { to: '/products/scaffolding-formworks/slab-formwork-system-fork-heads', label: 'Fork heads' },
  tripods: { to: '/products/scaffolding-formworks/system-slab-formwork-tripods', label: 'Tripods' },
  couplersEu: { to: '/products/scaffolding-formworks/scaffold-tube-fitting-european', label: 'European tube fittings' },
  couplersUk: { to: '/products/scaffolding-formworks/scaffold-tube-fitting-british-american', label: 'British and American tube fittings' },
  shoring: { to: '/products/scaffolding-formworks/load-bearing-system-shoring-tower', label: 'Shoring towers' },
  livestock: { to: '/products/livestock-housing-solutions', label: 'Livestock housing' },
  cattle: { to: '/products/livestock-housing-solutions/cattle', label: 'Cattle housing' },
  calves: { to: '/products/livestock-housing-solutions/calves', label: 'Calf housing' },
  wood: { to: '/products/wood-connectors', label: 'Wood connectors and garden hardware' },
  postSupports: { to: '/products/wood-connectors/post-supports', label: 'Post supports' },
  adjustablePosts: { to: '/products/wood-connectors/adjustable-post-supports', label: 'Adjustable post supports' },
  anchors: { to: '/products/wood-connectors/pole-anchors-ground-plates', label: 'Pole anchors and ground plates' },
};

export const posts = [
  {
    slug: 'ringlock-vs-cuplock-vs-frame-scaffolding',
    title: 'Ringlock, Cuplock or frame scaffolding: which system for which project',
    description:
      'How the three common access systems differ in how they connect, where each one earns its keep, and what to weigh up before standardising a fleet on one of them.',
    updated: '2026-09-19',
    readMinutes: 7,
    topic: 'Scaffolding',
    links: [LINKS.ringlock, LINKS.cuplock, LINKS.americanFrame, LINKS.scaffolding],
    intro:
      'Most access scaffolding sold today falls into three families: ringlock, cuplock and pre-welded frames. They are not interchangeable, and the right answer depends far more on the shape of the work than on the price per tonne. The difference that matters is how a ledger attaches to a standard, because that single detail decides how fast a crew builds, how freely the geometry can change, and how much of a fleet stays useful when the next job looks nothing like the last one.',
    sections: [
      {
        heading: 'How each system connects',
        body:
          'Ringlock uses a perforated rosette welded to the standard at fixed vertical centres. A ledger head drops into the rosette and a wedge locks it. Because the rosette has multiple openings around its circumference, ledgers and braces can leave the node at several angles from the same point.\n\nCuplock uses a pair of cups at each node: a fixed lower cup and a sliding top cup. Ledger ends sit in the lower cup and the top cup drops and turns to capture them all at once. One hammer blow locks several members together.\n\nFrame systems abandon the node entirely. Standards and a transom are pre-welded into a single frame, and frames stack vertically with braces between them. The geometry is decided in the factory rather than on site.',
      },
      {
        heading: 'Where each one earns its keep',
        body:
          'Frames are fastest where the work is a straight, repetitive facade at a constant height. There is little to think about and little to lose, and a two-person crew can move a lot of deck in a day. The moment the building has a curve, a setback or an obstruction, the fixed geometry starts costing tubes and fittings to work around.\n\nCuplock is the pragmatic middle. It is quick to build, the locked node is unambiguous to inspect, and it handles birdcage and shoring layouts well. Its node accepts a fixed number of members at set angles, which covers most of what a site needs.\n\nRinglock is the one to choose when the geometry is the problem: plant structures, vessels, irregular elevations, anything with diagonal bracing running where it needs to rather than where the system allows. That freedom is what you pay for, and it is wasted on a straight facade.',
      },
      {
        heading: 'What to weigh before standardising a fleet',
        body:
          'Component count. Ringlock has fewer distinct part numbers than a frame range covering equivalent heights and widths, which is why rental fleets tend towards it. Fewer part numbers means less mis-picking and a simpler yard.\n\nTraining. Frames need the least; ringlock needs the most, because the freedom it offers is also freedom to build something the designer did not intend.\n\nInspection. A cuplock top cup is either down and turned or it is not, which is easy to check from the ground. A ringlock wedge should be driven home, and a half-driven wedge is harder to spot.\n\nCompatibility with what you already own. Systems from different manufacturers are not reliably interchangeable even within the same family. If you are adding to an existing fleet, match the node dimensions, not just the name.',
      },
      {
        heading: 'What they have in common',
        body:
          'All three are governed by the same performance framework. EN 12810 covers facade scaffolds made from prefabricated components and EN 12811 sets the performance requirements and general design for temporary works equipment. Whichever system you choose, the assembly has to satisfy those, and corrosion protection matters as much as the steel: hot dip galvanizing to DIN EN 1461 is the normal specification for equipment that lives outdoors and gets handled hard.',
      },
      {
        heading: 'A short way to decide',
        body:
          'Straight facades, repeated heights, low training overhead: frames. Mixed general construction with some shoring and birdcage work: cuplock. Irregular geometry, industrial structures, a fleet that has to suit whatever comes next: ringlock. Most contractors of any size end up owning two of the three, and the useful question is which one is the backbone and which one fills the gaps.',
      },
    ],
    faqs: [
      {
        q: 'Can ringlock and cuplock components be mixed?',
        a: 'No. The node geometry is completely different, so ledgers from one will not engage the other. Even within one family, components from different manufacturers should not be assumed interchangeable without checking the node dimensions.',
      },
      {
        q: 'Which system is fastest to erect?',
        a: 'On a straight, repetitive facade, frames. On anything with varying geometry, cuplock and ringlock are faster overall because the frame system loses its advantage as soon as tubes and fittings are needed to work around the shape.',
      },
    ],
  },

  {
    slug: 'choosing-adjustable-steel-props-en-1065',
    title: 'How to choose adjustable steel props for slab formwork, with EN 1065 explained',
    description:
      'What EN 1065 actually specifies, why a prop is weaker the further it is extended, and the things that decide whether a slab prop performs as it should on site.',
    updated: '2026-09-19',
    readMinutes: 6,
    topic: 'Formwork',
    links: [LINKS.props, LINKS.forkHeads, LINKS.tripods, LINKS.shoring],
    intro:
      'An adjustable steel prop is the simplest thing on a formwork job and the one most often got wrong. It is a telescopic tube with a threaded collar, and its job is to hold a slab soffit at the right level until the concrete can carry itself. What makes the choice less simple than it looks is that a prop does not have one capacity: it has a capacity at a given extension, and the relationship between the two is not gentle.',
    sections: [
      {
        heading: 'What EN 1065 specifies',
        body:
          'EN 1065 is the European standard for adjustable telescopic steel props. It defines the classes a prop can be made to, the dimensions and materials, and, importantly, the testing that proves a prop actually meets the class claimed for it. A prop described as being made to EN 1065 without a class named is not telling you much: the class is the part that carries the meaning.\n\nKEAA manufactures props certified to EN 1065 Class BD, with Ü-mark conformity assessed by Sigma Karlsruhe in Germany. That third-party assessment is the difference between a claim and a verified one, and it is what a European buyer will be asked for.',
      },
      {
        heading: 'Why extension changes everything',
        body:
          'A prop carries load as a slender column, and a slender column fails by buckling long before the steel itself is anywhere near its limit. Extend the prop and you lengthen the column, which lowers the load at which it buckles. The same prop that is comfortable at its shortest setting can be well outside its capacity near full extension.\n\nThis is why choosing a prop by its maximum height is the classic mistake. If most of your work is at 2.5 metres, a prop whose range is centred near that height will hold far more than a longer prop wound out to reach the same point. Pick the range around the height you actually work at, not the tallest you might ever need.',
      },
      {
        heading: 'What else decides performance',
        body:
          'The thread and collar. This is the part that takes abuse: concrete splash, grit and impact. A clogged or damaged thread means the prop cannot be adjusted under load and the pin ends up doing work it was not meant to do.\n\nThe head and base plates. They have to sit flat. A plate bent by being dropped introduces eccentricity, and an eccentrically loaded slender column is weaker than a straight one.\n\nWhat sits on top. A fork head holds a primary beam in the right place and stops it rolling. A tripod holds the prop upright while it is being set, which is a safety matter during erection rather than a load-carrying one. Both are part of the system, not accessories.\n\nThe finish. Hot dip galvanizing to DIN EN 1461 keeps the thread working through repeated site cycles. Paint on a formwork prop is a short-term answer.',
      },
      {
        heading: 'A practical selection sequence',
        body:
          'Start with the slab height and pick the prop range that puts that height in the middle rather than at the end. Confirm the class, and ask for the evidence behind it. Decide the head arrangement, fork head or plate, based on the beam it carries. Add tripods for the erection sequence. Then check the finish against how many pours the props have to survive.\n\nFor tall or heavily loaded pours, a prop may be the wrong tool altogether and a load bearing shoring tower the right one. The transition point is a design decision, not a catalogue one.',
      },
    ],
    faqs: [
      {
        q: 'What does EN 1065 Class BD mean?',
        a: 'It identifies the class the prop has been made and tested to under the European standard for adjustable telescopic steel props. The class, rather than the standard number alone, is what tells you the performance category. Ask for the class and the conformity evidence together.',
      },
      {
        q: 'Can I use one prop length for the whole job?',
        a: 'You can, but it usually costs capacity. A prop is weakest near full extension, so a single long prop used everywhere will be working hard at the higher settings. Matching the range to the working height is the cheaper answer.',
      },
      {
        q: 'Are props and shoring towers interchangeable?',
        a: 'No. Props suit typical slab heights and loads. Once the height or the load rises beyond what a prop can carry safely, a load bearing shoring tower is the correct system, and that boundary should be set by the temporary works designer.',
      },
    ],
  },

  {
    slug: 'british-vs-european-scaffold-couplers',
    title: 'British and European scaffold tube couplers: the standards and the differences',
    description:
      'Why couplers are not universal, what EN 74 covers, and how to specify fittings that match the tube and the practice already on your site.',
    updated: '2026-09-19',
    readMinutes: 5,
    topic: 'Scaffolding',
    links: [LINKS.couplersEu, LINKS.couplersUk, LINKS.scaffolding],
    intro:
      'A coupler is a small forged or pressed fitting that joins two scaffold tubes, and it is the most quietly incompatible item in the whole trade. Buyers regularly order fittings that look right in a photograph and then find they do not suit the tube on site. The confusion is worth a few minutes, because it is almost always about two things: the tube the fitting is designed around, and the regional pattern it follows.',
    sections: [
      {
        heading: 'What EN 74 covers',
        body:
          'EN 74 is the European standard for couplers, spigot pins and baseplates used in working scaffolds and falsework made from steel tubes. It sets out the classes, the materials and the testing. When a coupler is described as EN 74 with a class, that class is what tells you the performance category, in the same way that the class rather than the standard number carries the meaning for props.\n\nKEAA manufactures couplers to EN 74-1 classes B and BB, with Ü-mark conformity assessed by Sigma Karlsruhe. As with props, the third-party assessment is the part a European buyer will ask to see.',
      },
      {
        heading: 'Where the patterns diverge',
        body:
          'The practical difference between British and European fittings is the tube they are built around and the fixing detail. British practice and European practice grew up around different tube dimensions, so a fitting sized for one does not grip the other correctly. A coupler that is slightly oversized will not develop its designed slip resistance, and one that is undersized simply will not close.\n\nWithin each pattern there are further variations: the fixing may be a bolt and nut or a T-bolt with a captive wing nut, and the jaw may be pressed or forged. These affect handling and durability rather than compatibility, but they matter to a crew doing it all day.',
      },
      {
        heading: 'The types you will actually order',
        body:
          'Right angle couplers join tubes at ninety degrees and are the load-bearing workhorse. Swivel couplers join tubes at any angle and are used for bracing. Sleeve and joint pin connectors extend a tube in line, and they behave differently from each other: a sleeve couples outside the tube, a joint pin inside. Putty and check couplers, baseplates and beam clamps fill in around them.\n\nThe common error is substituting a swivel where a right angle belongs. A swivel is designed for the bracing role and should not be treated as a general-purpose alternative.',
      },
      {
        heading: 'How to specify without guessing',
        body:
          'State the tube outside diameter and wall thickness, not just "scaffold tube". State the pattern, British, American or European. State the standard and class you need evidence for. If you are adding to existing stock, send a photograph of the fitting you already use alongside the dimensions, because a photograph resolves pattern questions faster than a description does.\n\nFinish matters here too. Couplers are dropped, kicked and left in the weather, and hot dip galvanizing to DIN EN 1461 is what keeps the thread turning after a few seasons.',
      },
    ],
    faqs: [
      {
        q: 'Are British and European couplers interchangeable?',
        a: 'Not reliably. They are built around different tube dimensions, so a fitting for one pattern will not grip the other correctly. Specify the pattern and the tube dimensions together.',
      },
      {
        q: 'What is the difference between a sleeve coupler and a joint pin?',
        a: 'A sleeve coupler joins two tubes end to end from the outside; a joint pin does it from the inside. They behave differently under load, and which is appropriate is a design decision rather than a preference.',
      },
    ],
  },

  {
    slug: 'cattle-headlocks-and-cubicles-specification',
    title: 'Cattle headlocks and cubicles: what to specify for a dairy housing fit-out',
    description:
      'How feed barriers and cubicles affect animal welfare and labour, and the specification details that decide whether steelwork survives a slurry environment.',
    updated: '2026-09-19',
    readMinutes: 6,
    topic: 'Livestock housing',
    links: [LINKS.cattle, LINKS.calves, LINKS.livestock],
    intro:
      'Dairy housing steelwork earns its money twice: once in how the animals use it, and again in how long it lasts. Both are decided at specification, and the two are not independent. Equipment that corrodes early develops rough edges and loose joints, and rough edges in a cattle shed are an injury waiting to happen.',
    sections: [
      {
        heading: 'What a headlock is for',
        body:
          'A headlock feed barrier lets an animal put its head through to feed and, when the mechanism is set, holds it there. That turns routine work, veterinary inspection, insemination, foot checks, from a chase into a scheduled task one person can do safely. It also stops animals moving along the barrier and bullying each other off the feed face, which evens out intake across the group.\n\nThe specification questions are spacing, mechanism and release. Spacing has to suit the size of the animals, because a gap right for a mature cow is wrong for a heifer. The mechanism should be operable by one person from the feed passage and should allow an individual animal to be released without releasing the whole row. Every headlock also needs a way to free a down animal quickly.',
      },
      {
        heading: 'What a cubicle is for',
        body:
          'A cubicle exists to make lying down comfortable and getting up possible. A cow rising lunges her head forward, and a cubicle that blocks that lunge produces animals that stand instead of lying. Lying time is directly tied to yield and to hoof health, so cubicle dimensions are a production matter rather than a comfort one.\n\nThe things to get right are length and width for the size of animal, the height and position of the neck rail, which controls where she stands and therefore where she dungs, and the brisket locator, which sets how far forward she lies. Beds that are too generous get dirty; beds that are too tight get refused.',
      },
      {
        heading: 'Why galvanizing after fabrication matters here',
        body:
          'A cattle shed is one of the most corrosive environments steel is asked to live in: constant moisture, slurry and ammonia. The place corrosion starts is a weld seam or a cut end where the coating is thin or absent.\n\nThat is why the sequence matters more than the coating. Fabricate first, then hot dip galvanize the finished assembly to DIN EN 1461, so the weld seams and cut ends are inside the coating rather than outside it. Galvanized tube that is welded afterwards has bare steel at every joint, which is exactly where the load and the slurry both concentrate. Welds should also be dressed smooth, because a weld spatter ridge at rubbing height becomes a skin lesion.',
      },
      {
        heading: 'Planning the fit-out',
        body:
          'Work from the building, not from a catalogue. Measure the span, the passage widths and the fall of the floor, then decide the row layout, then select equipment to suit it. Modular systems are worth insisting on for one reason: herds change size, and a layout that can be extended without replacing what is installed is cheaper over ten years than one that cannot.\n\nCalf housing follows the same logic at a different scale, with pen divisions and gates sized for young stock and easy cleaning between batches.',
      },
    ],
    faqs: [
      {
        q: 'Should equipment be galvanized before or after welding?',
        a: 'After fabrication. Hot dip galvanizing the finished assembly coats the weld seams and cut ends, which is where corrosion starts in a slurry and ammonia environment. Welding galvanized tube afterwards leaves bare steel at every joint.',
      },
      {
        q: 'How do cubicle dimensions affect the herd?',
        a: 'They decide whether a cow lies down and whether she can rise. A cubicle that blocks the forward lunge of a rising animal reduces lying time, and lying time is tied to yield and hoof health.',
      },
      {
        q: 'Can housing be laid out for an existing shed?',
        a: 'Yes, and it should be. The systems are modular and sized to the building. Send the shed dimensions and the intended layout with an enquiry so the quotation matches the building rather than a standard kit.',
      },
    ],
  },

  {
    slug: 'post-supports-and-ground-anchors-guide',
    title: 'Post supports and ground anchors for fencing, decking and garden structures',
    description:
      'Why timber posts rot at ground level, how bolt down and drive in supports differ, and how to choose between them for fencing, decking and pergolas.',
    updated: '2026-09-19',
    readMinutes: 5,
    topic: 'Wood connectors',
    links: [LINKS.postSupports, LINKS.adjustablePosts, LINKS.anchors, LINKS.wood],
    intro:
      'Timber posts almost never fail in the middle. They fail in a band a few centimetres either side of ground level, where the wood is alternately wet and dry and where oxygen, moisture and fungi all meet. A post support exists to move that band out of the equation by holding the timber clear of the soil on a steel foot. It is a small component that decides how long the whole structure lasts.',
    sections: [
      {
        heading: 'Why ground contact is the problem',
        body:
          'Buried end grain behaves like a wick. It draws water up into the post, and the zone just above the soil stays damp long enough for decay to establish while still getting enough air to keep it going. Deeper down, waterlogged soil is often too oxygen-poor for rot to progress quickly, which is why a failed post so often snaps at the surface while the buried end still looks sound.\n\nPreservative treatment slows this down but does not remove it, particularly where a post has been cut to length on site and the cut face is no longer treated. Lifting the timber out of contact is the more durable answer.',
      },
      {
        heading: 'Bolt down against drive in',
        body:
          'A bolt down support fixes to an existing concrete pad, slab or masonry with anchors. Use it where a base already exists or where the position has to be exact, such as a deck frame or a carport tied to a building. It is the more precise option and the easier one to replace later.\n\nA drive in support has a long spike driven straight into firm ground. It avoids digging and concreting entirely, which makes it the fast choice for fencing runs in reasonable soil. It needs ground that will actually hold: soft, made-up or waterlogged ground will not develop the resistance the spike relies on, and stony ground can deflect it out of plumb.\n\nAdjustable supports add a screw adjustment so the post height can be set after the base is fixed. On an uneven site or a deck being levelled across a slope, that adjustment saves a great deal of packing and re-cutting.',
      },
      {
        heading: 'Matching the support to the job',
        body:
          'Fencing: drive in supports where the ground allows, bolt down where it does not or where a wall is in the way. Consistency along a run matters more than the individual choice.\n\nDecking and pergolas: bolt down onto pads, with adjustable supports where levels need trimming. These structures carry people and wind load, so the connection back to the base is doing real work.\n\nGates and heavily loaded posts: these see repeated dynamic load rather than steady load, so the fixing into the base matters as much as the support itself.\n\nSize the support to the post section, not by eye. A post that rattles in an oversized socket transfers load through the fixings instead of through bearing.',
      },
      {
        heading: 'Finish and fixings',
        body:
          'Anything in ground contact or exposed to weather should be hot dip galvanized to DIN EN 1461. The coating has to survive being driven into soil or bolted down and then left outdoors for years, and a thin decorative finish will not.\n\nUse fixings of a matching specification. Mixing metals in a wet outdoor joint sets up galvanic corrosion, and the fixings are usually the smallest part of the cost and the first thing to fail.',
      },
    ],
    faqs: [
      {
        q: 'Do I still need to concrete a post if I use a drive in support?',
        a: 'No. That is the point of the drive in pattern: the spike develops its resistance from the surrounding ground. It does need ground firm enough to hold, so soft, made up or waterlogged ground calls for a bolt down support on a pad instead.',
      },
      {
        q: 'Why does a post support make a fence last longer?',
        a: 'Because it keeps the timber out of contact with soil and standing water. Posts decay in the band around ground level where wood is alternately wet and dry; removing that contact removes the condition decay needs.',
      },
      {
        q: 'When is an adjustable post support worth it?',
        a: 'On uneven ground, or wherever levels have to be trimmed after the bases are fixed, such as a deck built across a slope. It replaces packing and re-cutting with a screw adjustment.',
      },
    ],
  },
];

/** Newest first, which is the order the index renders. */
export const getPosts = () => [...posts].sort((a, b) => b.updated.localeCompare(a.updated));

/** One post by slug, or undefined. */
export const getPost = (slug) => posts.find((p) => p.slug === slug);
