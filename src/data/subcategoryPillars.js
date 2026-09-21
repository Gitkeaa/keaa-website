/**
 * Long-form copy for the 28 subcategory pages, in the same shape as categoryPillars.js.
 *
 * WHY IT EXISTS
 * -------------
 * A subcategory page was a filtered product grid with a one-line blurb, around 840 words of
 * mostly navigation and product names. The category page above it carries 1,900. So the page
 * that matches the phrase a buyer actually types, "adjustable post supports", "cattle
 * headlocks", "EN 74 couplers", had less to say about that phrase than the page above it, and
 * 28 of them competed with each other on almost identical text. That is the single biggest
 * ranking gap left in the catalogue.
 *
 * WHERE THE FACTS COME FROM
 * -------------------------
 * Only the catalogue and src/data/company.js. Every product named in a "What it includes"
 * section is a real item in that subcategory. Every standard named is one the product data
 * actually cites: EN 1461 for hot dip galvanizing, EN 10025-2 for the structural steel in the
 * post support ranges, EN 10346 for the zinc coated sheet in the indoor connectors, EN 74-1
 * for the European couplers, EN 1065 for props, BS 1139 for the British pattern fittings.
 *
 * Sentences carrying [VERIFY] are ones the owner must confirm or delete. They are there
 * because the copy reads badly without them and the data does not settle them either way,
 * which is exactly the kind of claim that should not be published on somebody's behalf.
 *
 * Deliberately absent everywhere: load ratings, safe working loads, stocking levels, lead
 * times and prices. They vary per item and per order, and a wrong number in a range page is
 * worse than no number.
 *
 * Keyed by SUBCATEGORY SLUG, matching the routes in src/data/categories.js. The `faqs` feed
 * both the visible accordion and FAQPage structured data from one source.
 */

export const subcategoryPillars = {
  /* ==================================================== Livestock Housing Solutions ==== */

  cattle: {
    intro:
      'Cattle housing hardware is the steelwork a dairy or beef shed is actually built from: the headlocks that hold animals safely at the feed fence, the cubicle dividers that shape a lying bed, and the brackets, clamps and barriers that fix both to the building. It lives in one of the harshest environments manufactured steel ever sees. Slurry and ammonia attack the coating continuously, animals lean on everything with their full weight, and a component that develops a sharp edge or a weak weld injures stock rather than simply failing. KEAA International manufactures 52 cattle housing items in Ludhiana, India, and the range is designed to be specified together: the same clamps and brackets fit across the dividers, barriers and headlocks, so a shed can be laid out without collecting incompatible parts from several suppliers. Fabrication, welding and hot dip galvanizing all happen in our own plants, which is what keeps the coating consistent across a container load rather than varying between batches.',
    sections: [
      {
        heading: 'What the range includes',
        body:
          'Feed fence hardware covers giant feed headlocks, heifer safety headlocks, self locking and diagonal barriers, and the handle assemblies in both plate and tube type. Cubicle work covers comfort and multipurpose cubicle dividers with their single and double mounting brackets. The fixing set runs to brisket board clamps and plates, L post clamps, double head clamps and adjustable clamps. Calf feed troughs and calf panels sit alongside, so a rearing area can be built from the same range as the main shed.',
      },
      {
        heading: 'Standards and finish',
        body:
          'The range is hot dip galvanized to DIN EN 1461, which is the specification the product records cite, and galvanizing is carried out in our own plants rather than bought in. A stainless steel finish is available on selected items where a washdown regime or a particular buyer specification calls for it. Welding across KEAA is carried out by welders certified to EN 1090-2 and EN 3834-2, accredited by SLV Germany.',
      },
      {
        heading: 'Where it is used',
        body:
          'Dairy parlours and cubicle housing, beef finishing sheds, calf rearing units, and the handling areas attached to them. Buyers are typically livestock housing installers, agricultural building contractors, farm equipment distributors and dealers restocking a consistent range in container volumes.',
      },
      {
        heading: 'Why buy it from the manufacturer',
        body:
          'Laser cutting, forming, welding, galvanizing and powder coating are all under our own roof, so a specification holds across a full order and can be repeated on the next one. Quality, environmental and occupational health management are certified to ISO 9001:2015, ISO 14001:2015 and ISO 45001:2018 by TÜV Rheinland. Buying the fixings and the fittings from the same maker also removes the tolerance mismatch that appears when brackets and dividers come from different factories.',
      },
    ],
    faqs: [
      {
        q: 'Are the headlocks suitable for both dairy and beef cattle?',
        a: 'The range includes giant feed headlocks and heifer safety headlocks, which are sized for different animals, so the right choice depends on the stock and the feed fence layout. Send the fence length and the animal type with your enquiry and we will quote the matching handle type and fixings.',
      },
      {
        q: 'What protects the steel against slurry and ammonia?',
        a: 'Hot dip galvanizing to DIN EN 1461, applied in our own plants. Galvanizing coats the inside of hollow sections as well as the outside, which is what matters in a shed atmosphere, because corrosion in this environment usually starts where you cannot see it.',
      },
      {
        q: 'Can cubicle dividers and brackets be ordered separately?',
        a: 'Yes. Dividers, single and double mounting brackets, brisket board clamps and plates are all individually catalogued, so a refurbishment can replace one element without changing the rest of the installation.',
      },
    ],
  },

  calves: {
    intro:
      'Calf housing has a different problem from the main cattle shed. The animals are small, they are in the most vulnerable weeks of their lives, and the hardware around them has to be cleanable between batches without corroding. KEAA International manufactures calf houses, calf pens and pail rings in Ludhiana, India, hot dip galvanized so the same unit survives repeated washing down and redeployment. The range is deliberately small and built to work with the wider cattle housing range rather than as a separate system: the same clamps and fixings carry across, so a rearing area and the shed it sits inside can be specified together and share spare parts. Every item is manufactured in our own plants, with fabrication, welding and galvanizing in house.',
    sections: [
      {
        heading: 'What the range includes',
        body:
          'Calf houses, calf pens and pail rings. Calf feed troughs and calf panels are catalogued under the cattle range and are normally specified alongside these, because a rearing area usually needs both.',
      },
      {
        heading: 'Standards and finish',
        body:
          'Hot dip galvanized, the finish recorded against each item in the catalogue. Galvanizing is applied in our own plants, which keeps coating thickness consistent across an order rather than varying between subcontracted batches.',
      },
      {
        heading: 'Where it is used',
        body:
          'Calf rearing units on dairy and beef farms, and the rearing areas inside larger cattle buildings. Buyers are livestock housing installers, agricultural building contractors and farm equipment distributors.',
      },
      {
        heading: 'Why buy it from the manufacturer',
        body:
          'The calf range shares its fixings with the 52 item cattle housing range, so a single order can cover the rearing area and the shed around it without mixing suppliers. Manufacturing is certified to ISO 9001:2015 by TÜV Rheinland, and welding is carried out by welders certified to EN 1090-2 and EN 3834-2, accredited by SLV Germany.',
      },
    ],
    faqs: [
      {
        q: 'Can calf pens be cleaned and reused between batches?',
        a: 'That is what the hot dip galvanized finish is for. Galvanizing coats hollow sections inside as well as out, so repeated washing down does not open a corrosion path the way a painted finish eventually does.',
      },
      {
        q: 'Do calf pens work with the wider cattle housing range?',
        a: 'Yes. The fixings are common across the ranges, so calf feed troughs and calf panels from the cattle range fit alongside without adapting anything.',
      },
      {
        q: 'What sizes are available?',
        a: 'Sizes are quoted per order rather than fixed in the catalogue. Send the pen layout and the number of animals with your enquiry and we will quote against it.',
      },
    ],
  },

  sheep: {
    intro:
      'Sheep handling equipment has to do two jobs that pull against each other: hold animals securely while they are worked, and let them move freely the rest of the time. KEAA International manufactures 15 items covering both, from interlocking and pin drop panels and sheep races through drafting and non return gates to the feeders, troughs and baskets that go into a pen. The hardware is hot dip galvanized, because sheep equipment spends much of its life outdoors and is frequently moved between sites, which is exactly the duty cycle that finds a weak coating. The panels are designed to interlock so a race or a pen can be reconfigured on site rather than built to one fixed layout, which matters when the same equipment has to serve lambing, shearing and drafting through the year.',
    sections: [
      {
        heading: 'What the range includes',
        body:
          'Handling covers sheep races, drafting gates, non return gates, sheep headlocks, and panels in both interlocking and pin drop patterns with joiners. Feeding covers ground troughs, round feeders, hang on feeders, hang on troughs, hang on baskets, double side hay baskets and bucket holders.',
      },
      {
        heading: 'Standards and finish',
        body:
          'Hot dip galvanized, as recorded against the items in the catalogue, and applied in our own plants. Welding across KEAA is carried out by welders certified to EN 1090-2 and EN 3834-2, accredited by SLV Germany.',
      },
      {
        heading: 'Where it is used',
        body:
          'Sheep farms and mixed livestock units, contract shearing and drafting operations, and dealers supplying them. The panels and races are specified both for permanent pens and for mobile handling systems that are moved between fields.',
      },
      {
        heading: 'Why buy it from the manufacturer',
        body:
          'Panels, gates, joiners and feeders come from one maker, so they interlock as intended and a replacement panel ordered two years later still fits the run it joins. Manufacturing is certified to ISO 9001:2015, ISO 14001:2015 and ISO 45001:2018 by TÜV Rheinland.',
      },
    ],
    faqs: [
      {
        q: 'Can the panels be reconfigured into different layouts?',
        a: 'Yes. The interlocking and pin drop panels connect with joiners rather than being fixed to one geometry, so a race, a holding pen or a drafting run can be built from the same set of panels and changed later.',
      },
      {
        q: 'Is the equipment suitable for outdoor use?',
        a: 'It is hot dip galvanized, which is the finish specified for equipment that lives outdoors and gets moved between sites. Galvanizing protects cut edges and hollow section interiors, which is where outdoor corrosion normally starts.',
      },
      {
        q: 'Do you supply complete handling systems or individual items?',
        a: 'Both. Every panel, gate, joiner and feeder is individually catalogued, so you can order a complete race or replace a single component.',
      },
    ],
  },

  pigs: {
    intro:
      'Pig housing hardware covers the pens and crates animals live in and the equipment used to work with them. KEAA International manufactures 13 items in this range from Ludhiana, India, including farrowing crates, gestation pens, feed bowls and the clamps that assemble them, alongside the consumables a unit uses day to day such as veterinary and hygiene gloves, jackets and manure scrapers. The steelwork is hot dip galvanized to the DIN ISO 1461 specification the product records cite, which matters more in a pig unit than almost anywhere else: the combination of ammonia, moisture and continuous physical contact with animals attacks coatings quickly, and a crate with corroded welds is a welfare problem before it is a maintenance one.',
    sections: [
      {
        heading: 'What the range includes',
        body:
          'Housing covers farrowing crates, gestation pens and feed bowls. Assembly hardware covers adjustable clamps, hinge clamps and foot clamps, plus stainless steel casting hooks. Working equipment covers manure scrapers, aprons, calf and lamb jackets, and veterinary and hygiene gloves.',
      },
      {
        heading: 'Standards and finish',
        body:
          'The steelwork is hot dip galvanized to DIN ISO 1461 as recorded in the product data, applied in our own galvanizing plants. Casting hooks are stainless steel. Welding is carried out by welders certified to EN 1090-2 and EN 3834-2, accredited by SLV Germany.',
      },
      {
        heading: 'Where it is used',
        body:
          'Farrowing and gestation houses on commercial pig units, and the handling and hygiene routines around them. Buyers are livestock housing installers, agricultural building contractors and farm supply distributors.',
      },
      {
        heading: 'Why buy it from the manufacturer',
        body:
          'Crates, pens and the clamps that hold them together are made in the same plant, so the fit is designed rather than discovered on site. Quality, environmental and occupational health management are certified to ISO 9001:2015, ISO 14001:2015 and ISO 45001:2018 by TÜV Rheinland.',
      },
    ],
    faqs: [
      {
        q: 'What finish is used on farrowing crates and gestation pens?',
        a: 'Hot dip galvanizing to DIN ISO 1461, as recorded against the products. It is applied in our own plants, and it coats the inside of hollow sections as well as the outside, which is where corrosion starts in a pig house atmosphere.',
      },
      {
        q: 'Can crates be supplied in specific dimensions?',
        a: 'Sizes are quoted per order. Send the house layout and the crate or pen dimensions you need with your enquiry and we will quote against them.',
      },
      {
        q: 'Do you supply the consumables as well as the steelwork?',
        a: 'Yes. Veterinary and hygiene gloves, aprons, jackets and manure scrapers are catalogued in the same range, so a unit can restock them on the same order as the hardware.',
      },
    ],
  },

  horse: {
    intro:
      'Stable equipment is specified around one difference from cattle housing: horses are worked with individually and are far more likely to injure themselves on a fitting than to simply wear it out. Feeders, racks and panels have to present no edge a horse can catch, and they have to hold their shape under a weight that arrives suddenly rather than steadily. KEAA International manufactures six items for stables from Ludhiana, India, covering feeding troughs, hay feeders, hay racks, round hay feeders, fence panels and a guard for water bowls. The range is made in our own plants with fabrication and welding in house, by welders certified to EN 1090-2 and EN 3834-2, accredited by SLV Germany. [VERIFY] The stable range is finished to the same hot dip galvanized specification as the rest of the livestock housing ranges, which the product records do not currently state for these six items.',
    sections: [
      {
        heading: 'What the range includes',
        body:
          'Feeding troughs, hay feeders, hay racks and round hay feeders for forage; fence panels for dividing and enclosing; and a guard for water bowls. Fittings from the wider livestock housing range are commonly specified alongside these where a stable block adjoins other housing.',
      },
      {
        heading: 'Standards and finish',
        body:
          'Welding is carried out by welders certified to EN 1090-2 and EN 3834-2, accredited by SLV Germany, and manufacturing quality management is certified to ISO 9001:2015 by TÜV Rheinland. [VERIFY] Finish for the stable range specifically: the catalogue records a finish for the cattle, calf, sheep and pig ranges but not yet for these six items.',
      },
      {
        heading: 'Where it is used',
        body:
          'Stable blocks, livery yards and equestrian centres, and the fenced turnout areas attached to them. Buyers are equestrian building contractors, stable fit out installers and distributors supplying them.',
      },
      {
        heading: 'Why buy it from the manufacturer',
        body:
          'The same plant makes the stable range and the cattle, sheep and pig ranges, so a mixed yard can be equipped from one order and one specification. Environmental and occupational health management are certified to ISO 14001:2015 and ISO 45001:2018 by TÜV Rheinland alongside the quality system.',
      },
    ],
    faqs: [
      {
        q: 'Are hay racks and feeders wall mounted or free standing?',
        a: 'The range covers both patterns: hay racks and hay feeders for mounting, and round hay feeders that stand free. Send the stable layout with your enquiry and we will quote the pattern that suits it.',
      },
      {
        q: 'What is the guard for water bowls for?',
        a: 'It protects the bowl and its plumbing from being knocked or leaned on, which is the most common cause of a water supply failing in a stable.',
      },
      {
        q: 'Can stable equipment be ordered with other livestock ranges?',
        a: 'Yes. It is manufactured in the same plants as the cattle, calf, sheep and pig ranges and ships on the same order, which is how most mixed yards buy it.',
      },
    ],
  },

  'field-gates': {
    intro:
      'A field gate is judged on two things over its life: whether it still swings true after a decade of being leaned on and driven past, and whether the hanging hardware has rusted into the post. KEAA International manufactures 23 items covering both halves, from 5, 6, 7 and 9 bar gates in plain, half mesh and full mesh patterns through to the gate posts, hangers, eye bolts and washers that hang them. Everything is hot dip galvanized. The range covers both imperial and national gate patterns, which matters for replacement work: a gate ordered to match an existing opening has to fit the hanging arrangement already in the post, not just the gap. Manufacturing is in our own plants in Ludhiana, India, with fabrication, welding and galvanizing in house.',
    sections: [
      {
        heading: 'What the range includes',
        body:
          'Gates in 5 bar, 6 bar, 7 bar national and 9 bar patterns, plus 5 bar half mesh and full mesh versions where stock control needs a closer barrier, and imperial gates for matching existing openings. Hanging hardware covers gate posts, flat gate hangers, extra spaced gate hangers, post gate hangers and guarder gate hangers, with and without washers, and eye bolts.',
      },
      {
        heading: 'Standards and finish',
        body:
          'Hot dip galvanized, as recorded against the products. Galvanizing is applied in our own plants, so coating thickness is consistent across a container load. Welding is carried out by welders certified to EN 1090-2 and EN 3834-2, accredited by SLV Germany.',
      },
      {
        heading: 'Where it is used',
        body:
          'Field and yard entrances on farms and estates, stock control between grazing blocks, and access points on rural and agricultural sites. Buyers are agricultural merchants, fencing contractors, estate managers and distributors.',
      },
      {
        heading: 'Why buy it from the manufacturer',
        body:
          'Gates and hanging hardware come from one maker, so the hanger pattern matches the gate rather than nearly matching it. Quality, environmental and occupational health management are certified to ISO 9001:2015, ISO 14001:2015 and ISO 45001:2018 by TÜV Rheinland.',
      },
    ],
    faqs: [
      {
        q: 'What is the difference between the mesh and plain bar gates?',
        a: 'Mesh gates close the gaps between bars, either over half the height or the full height. They are specified where smaller stock would otherwise pass through a plain bar gate, particularly sheep and lambs.',
      },
      {
        q: 'Do you supply gate posts and hangers as well as gates?',
        a: 'Yes. Gate posts, flat, extra spaced, post and guarder hangers with and without washers, and eye bolts are all catalogued, so a complete hanging set can be ordered with the gate.',
      },
      {
        q: 'Can you match an existing gate opening?',
        a: 'The range covers imperial and national patterns for exactly this. Send the opening width and the existing hanging arrangement with your enquiry and we will quote the matching gate and hardware.',
      },
    ],
  },

  /* =========================================== Wood Connectors and DIY Hardware ==== */

  'post-supports': {
    intro:
      'A post support is the reason a timber post lasts twenty years instead of five. Set timber directly into the ground and it sits in the wet, and rot starts at the buried end where nobody sees it until the post moves. A post support holds the timber clear of the ground on a steel base that takes the moisture instead. KEAA International manufactures 12 patterns from structural steel to EN 10025-2, covering the shapes needed for the common situations: H, I, L, T, U and Y types, T blade supports for driving into soft ground, and boltdown supports for fixing to an existing concrete or paved surface. Base plate versions are available where the load has to be spread. Manufacturing is in our own plants in Ludhiana, India.',
    sections: [
      {
        heading: 'What the range includes',
        body:
          'Driven and set patterns in H, I, L, T, U and Y types, T blade post supports, U type supports with base plate, and boltdown post supports for fixing to existing hard standing. Adjustable versions, where the post height can be trimmed after the support is set, are catalogued separately under adjustable post supports.',
      },
      {
        heading: 'Standards and finish',
        body:
          'Manufactured from structural steel to DIN EN 10025-2, the specification recorded against the products, which is the European standard for hot rolled structural steels. Welding is carried out by welders certified to EN 1090-2 and EN 3834-2, accredited by SLV Germany. [VERIFY] Finish for this range: the catalogue records the steel specification but not a coating specification for these items.',
      },
      {
        heading: 'Where it is used',
        body:
          'Fencing, decking substructures, pergolas, carports, garden buildings and post and rail work. Buyers are builders merchants, timber and fencing distributors, landscaping contractors and DIY retail chains.',
      },
      {
        heading: 'Why buy it from the manufacturer',
        body:
          'Twelve patterns from one maker means the whole range shares tolerances, so a project mixing driven and boltdown supports gets a consistent post fit. Laser cutting, forming and welding are all in house, and quality management is certified to ISO 9001:2015 by TÜV Rheinland.',
      },
    ],
    faqs: [
      {
        q: 'Which post support should I use for a fence in soft ground?',
        a: 'A driven pattern, typically the T blade or a driven H, I or U type, which is hammered into the ground without excavation. Boltdown supports are for existing concrete or paving instead. Send the ground type and post size with your enquiry and we will quote the pattern.',
      },
      {
        q: 'What size timber do the supports take?',
        a: 'Sizes are quoted per order against the post section you are using. Send the post dimensions and quantity and we will quote the matching supports.',
      },
      {
        q: 'What is the difference between these and adjustable post supports?',
        a: 'These hold the post at a fixed height. Adjustable supports have a threaded section so the post height can be corrected after the support is set, which matters on uneven ground. Both ranges are catalogued.',
      },
    ],
  },

  'adjustable-post-supports': {
    intro:
      'Ground is never as level as a drawing assumes. An adjustable post support solves that after the fact: a threaded section lets the post height be corrected once the support is already set, so a run of posts can be brought to a level line without digging anything out and starting again. KEAA International manufactures 14 patterns from structural steel to EN 10025-2, covering I, L, T and Y types, threaded supports, long nut versions where more adjustment is needed, and base plate versions where the load has to be spread over a larger area. The range is made in our own plants in Ludhiana, India, and shares its tolerances with the fixed post support range, so the two can be mixed across a single project.',
    sections: [
      {
        heading: 'What the range includes',
        body:
          'Adjustable I, L, T and Y type post supports, adjustable threaded post supports, long nut versions of the T and Y types for greater adjustment, a T type with base plate, and a Y type with both long nut and base plate. A plain adjustable post support completes the range.',
      },
      {
        heading: 'Standards and finish',
        body:
          'Manufactured from structural steel to DIN EN 10025-2, as recorded against the products. Welding is carried out by welders certified to EN 1090-2 and EN 3834-2, accredited by SLV Germany. [VERIFY] Finish for this range: the catalogue records the steel specification but not a coating specification for these items.',
      },
      {
        heading: 'Where it is used',
        body:
          'Decking and pergola substructures on sloping or uneven ground, fence runs that have to hold a level top line, carports and garden buildings. Buyers are builders merchants, landscaping contractors, timber distributors and DIY retail.',
      },
      {
        heading: 'Why buy it from the manufacturer',
        body:
          'The adjustable and fixed ranges are made in the same plant to the same tolerances, so a project can use adjustable supports where the ground demands it and fixed supports elsewhere without the post fit changing. Quality management is certified to ISO 9001:2015 by TÜV Rheinland.',
      },
    ],
    faqs: [
      {
        q: 'How much adjustment do the long nut versions give?',
        a: 'More than the standard threaded versions, which is what they exist for. The exact range depends on the pattern and size, so send the height correction you need with your enquiry and we will quote the version that covers it.',
      },
      {
        q: 'When should I specify a base plate version?',
        a: 'When the support is fixed to an existing surface or when the load needs spreading over a wider area rather than concentrated at a point. The T type with base plate and the Y type with long nut and base plate cover both cases.',
      },
      {
        q: 'Can adjustable supports be used with the fixed post support range?',
        a: 'Yes. Both ranges are made in the same plant to the same tolerances, so post fit is consistent across a project that mixes them.',
      },
    ],
  },

  'pole-anchors-ground-plates': {
    intro:
      'Pole anchors and ground plates are the fixing layer underneath fencing, signage and light timber structures. The choice between them is a choice about the ground: a spiral anchor screws into soft soil and holds by the thread, a bolt type anchor fixes to something solid already there, and a ground plate spreads the load across a surface rather than into it. KEAA International manufactures 12 patterns from structural steel to EN 10025-2, covering round and square post fittings in each type, wedge grip versions, rotatable anchors where the post has to be oriented after setting, and anchors made for fixing into concrete. All are made in our own plants in Ludhiana, India.',
    sections: [
      {
        heading: 'What the range includes',
        body:
          'Pole anchors for round posts, square posts and concrete, in bolt type and wedge grip patterns, plus rotatable anchors for square posts. Spiral pole anchors for both round and square posts, which screw into soft ground. Ground plates for round and square posts, in bolt type and wedge grip patterns.',
      },
      {
        heading: 'Standards and finish',
        body:
          'Manufactured from structural steel to DIN EN 10025-2, as recorded against the products. Welding is carried out by welders certified to EN 1090-2 and EN 3834-2, accredited by SLV Germany. [VERIFY] Finish for this range: the catalogue records the steel specification but not a coating specification for these items.',
      },
      {
        heading: 'Where it is used',
        body:
          'Fence lines, garden structures, signage posts, and light timber work where excavation is impractical or undesirable. Spiral anchors in particular are specified where a post has to be set without concrete. Buyers are fencing contractors, landscapers, builders merchants and DIY retail.',
      },
      {
        heading: 'Why buy it from the manufacturer',
        body:
          'Anchors, plates and the post supports that sit on them come from one range, so the post fit is consistent whichever fixing method the ground calls for. Manufacturing quality is certified to ISO 9001:2015 by TÜV Rheinland.',
      },
    ],
    faqs: [
      {
        q: 'When is a spiral anchor the right choice?',
        a: 'In soft ground where you want to avoid excavation and concrete. The spiral screws in and holds on the thread, so a post can be set and, if needed, removed again without breaking out a foundation.',
      },
      {
        q: 'What is the difference between wedge grip and bolt type?',
        a: 'Wedge grip clamps the post by wedging, bolt type fixes through it. The choice usually follows whether you want the post removable and what the post section is. Both are made for round and square posts.',
      },
      {
        q: 'Can anchors be used with your post supports?',
        a: 'Yes. Both ranges are made in the same plant to the same tolerances, so anchors, ground plates and post supports fit the same post sections.',
      },
    ],
  },

  'indoor-wood-connectors': {
    intro:
      'Indoor wood connectors are the steel plates and hangers that make a timber frame behave as one structure instead of a stack of separate members. They carry shear and pull out loads at joints where timber alone cannot, which is why joist hangers and angle connectors turn up in almost every timber floor and roof. KEAA International manufactures 14 patterns from zinc coated steel sheet to EN 10346, covering joist hangers in three types, angle connectors with and without rib, adjustable angle connectors, perforated plates and strips, purlin anchors and universal connectors. The zinc coating is what makes them suitable for the dry indoor environment they are designed for. Manufacturing is in our own plants in Ludhiana, India.',
    sections: [
      {
        heading: 'What the range includes',
        body:
          'Joist hangers in types A, B and C for different joist sections and fixing arrangements. Angle connectors plain, with rib, without rib and adjustable, for corner and bracket connections. Perforated plates in types A and B and perforated strips for splicing and reinforcing. Purlin anchors and universal connectors complete the range.',
      },
      {
        heading: 'Standards and finish',
        body:
          'Manufactured from continuously hot dip zinc coated steel sheet to DIN EN 10346, the specification recorded against the products, which is the European standard governing that material. The zinc coating suits the dry internal environment these connectors are designed for. Quality management is certified to ISO 9001:2015 by TÜV Rheinland.',
      },
      {
        heading: 'Where it is used',
        body:
          'Timber floor and roof structures, internal stud and joist work, timber frame construction and joinery. Buyers are builders merchants, timber frame manufacturers, roofing and carpentry contractors and distributors.',
      },
      {
        heading: 'Why buy it from the manufacturer',
        body:
          'Hangers, plates and connectors from one maker share hole patterns and material specification, so a frame detailed around one part of the range does not need re-detailing for another. Manufacturing is in house from sheet to finished connector.',
      },
    ],
    faqs: [
      {
        q: 'What is the difference between joist hanger types A, B and C?',
        a: 'They differ in the joist section they take and in how they are fixed to the supporting member. Send the joist size and the support detail with your enquiry and we will quote the type that matches.',
      },
      {
        q: 'Are these connectors suitable for outdoor use?',
        a: 'They are made from zinc coated sheet to EN 10346 and are designed for dry internal environments. For outdoor timber work, the post supports, pole anchors and ground plates ranges are the ones specified instead.',
      },
      {
        q: 'What is the rib on an angle connector for?',
        a: 'It stiffens the angle so the connector resists opening under load. Ribbed, unribbed and adjustable versions are all catalogued, so the choice follows the load and the geometry of the joint.',
      },
    ],
  },

  'post-caps': {
    intro:
      'A post cap is the cheapest part of a fence and the one that decides how long the post lasts. End grain on the top of a timber post absorbs water like a wick, so an uncapped post rots from the top down regardless of what is protecting the bottom. KEAA International manufactures three patterns: ball and pyramid caps, which shed water and finish a fence visually, and a cap with a stainless steel nail for fixing where corrosion at the fastening would otherwise stain the timber. All are made in our own plants in Ludhiana, India, to the same tolerances as the wider post support and fencing hardware ranges, so caps ordered with a fencing package fit the posts in it.',
    sections: [
      {
        heading: 'What the range includes',
        body:
          'Post caps in ball and pyramid profiles, and post caps supplied with a stainless steel nail for fixing. The range is deliberately small and is normally ordered alongside the post supports and pole anchors ranges as part of a complete fencing package.',
      },
      {
        heading: 'Standards and finish',
        body:
          'The nail supplied with the fixed pattern is stainless steel, chosen so the fastening does not corrode and stain the timber below it. [VERIFY] Material and finish for the caps themselves: the catalogue does not currently record a steel specification or coating for these three items.',
      },
      {
        heading: 'Where it is used',
        body:
          'Fence posts, gate posts, decking balustrade posts and pergola uprights. Buyers are fencing contractors, builders merchants, landscapers and DIY retail.',
      },
      {
        heading: 'Why buy it from the manufacturer',
        body:
          'Caps, post supports, anchors and ground plates are made in the same plant, so a fencing package can be quoted and shipped complete rather than assembled from several suppliers with different post tolerances.',
      },
    ],
    faqs: [
      {
        q: 'Why does a timber post need a cap at all?',
        a: 'Because the cut top of a post is end grain, which draws water down into the timber. Capping it is the single cheapest thing that extends post life, and it matters as much as what is protecting the buried end.',
      },
      {
        q: 'What is the stainless steel nail version for?',
        a: 'For situations where an ordinary fastening would corrode and run a stain down the face of the post. The stainless nail avoids that, which matters on visible fencing and balustrades.',
      },
      {
        q: 'What post sizes do the caps fit?',
        a: 'Sizes are quoted per order. Send the post section and quantity with your enquiry and we will quote the matching caps.',
      },
    ],
  },

  'miscellaneous-products': {
    intro:
      'This range collects the garden and utility steelwork that does not belong to the fencing or connector families but is made in the same plants from the same structural steel to EN 10025-2. It covers six items: bicycle stands, door frames, log holders in two sizes, an earth sieve and a composter basket for riddling leaves. They are grouped together because buyers usually add them to an order rather than seek them out on their own, and because they share the manufacturing route with the rest of the wood connectors and DIY hardware range. Everything here is made in our own plants in Ludhiana, India, with laser cutting, forming and welding in house.',
    sections: [
      {
        heading: 'What the range includes',
        body:
          'Bicycle stands, door frames, log holders in big and small sizes, an earth sieve, and a composter basket for riddling leaves.',
      },
      {
        heading: 'Standards and finish',
        body:
          'Manufactured from structural steel to DIN EN 10025-2, as recorded against the products. Welding is carried out by welders certified to EN 1090-2 and EN 3834-2, accredited by SLV Germany. [VERIFY] Finish for this range: the catalogue records the steel specification but not a coating specification for these items.',
      },
      {
        heading: 'Where it is used',
        body:
          'Gardens, allotments, public and commercial outdoor spaces, and domestic utility areas. Buyers are garden centres, builders merchants, DIY retail chains and distributors adding lines to an existing order.',
      },
      {
        heading: 'Why buy it from the manufacturer',
        body:
          'These items ship on the same order as the fencing and connector ranges, from the same plant, which is usually the reason a distributor takes them. Quality management is certified to ISO 9001:2015 by TÜV Rheinland.',
      },
    ],
    faqs: [
      {
        q: 'Can these be ordered with the fencing and connector ranges?',
        a: 'Yes, and that is how they are usually bought. They are manufactured in the same plants and ship on the same order.',
      },
      {
        q: 'What sizes are the log holders?',
        a: 'Two sizes are catalogued, big and small. Exact dimensions are quoted per order, so send the quantity and size you need with your enquiry.',
      },
      {
        q: 'Are these suitable for outdoor use all year?',
        a: 'They are made from structural steel to EN 10025-2 and are intended for outdoor use. The coating specification is not currently recorded in the catalogue for this range, so confirm the finish with us when you enquire.',
      },
    ],
  },
  /* ============================================== Scaffolding and Formworks ==== */

  'system-scaffolds-ringlock': {
    intro:
      'Ringlock is the modular system that solved the problem of angle. A rosette welded to the standard at fixed vertical centres accepts ledgers and braces at eight positions around it, so a scaffold can follow a curved facade or a plant structure without a single loose fitting. That is why it has largely displaced tube and coupler on complex geometry: the connection is made by a wedge driven into a rosette, it is repeatable, and an inspector can see at a glance whether it is home. KEAA International manufactures 12 Ringlock components in Ludhiana, India, hot dip galvanized to DIN EN 1461 in our own plants, from steel to EN 10025 and EN 10219. Because the geometry is fixed by the rosette rather than by the erector, components ordered years apart still interchange, which is the property rental fleets actually buy.',
    sections: [
      {
        heading: 'What the range includes',
        body:
          'Ringlock standards and base collars, Ringlock ledgers and diagonal braces, plain diagonal braces and lattice girders for spanning. Working platform components cover steel planks, board brackets, toe boards and staircase steps. Wall ties tie the assembly back to the structure, and complete Ringlock towers are catalogued as an assembly.',
      },
      {
        heading: 'Standards and finish',
        body:
          'Steel to EN 10025 and EN 10219, the structural and hollow section specifications recorded against the products. Hot dip galvanized to DIN EN 1461, applied in our own galvanizing plants rather than bought in, which is what keeps coating thickness consistent across a container load. Welding is carried out by welders certified to EN 1090-2 and EN 3834-2, accredited by SLV Germany.',
      },
      {
        heading: 'Where it is used',
        body:
          'Facade access on irregular and curved elevations, industrial maintenance and shutdown work, power and petrochemical plant, and load bearing towers where the bracing has to run where the structure allows rather than where a frame dictates. Buyers are scaffolding contractors, rental fleets and distributors supplying them.',
      },
      {
        heading: 'Why buy it from the manufacturer',
        body:
          'Rosette position and wedge fit are what make a system scaffold safe and interchangeable, and both are decided in the factory. Laser cutting, robotic welding and galvanizing are all under our own roof, welding is certified to EN 1090-2 and EN 3834-2 through SLV Germany, and management systems are certified to ISO 9001:2015, ISO 14001:2015 and ISO 45001:2018 by TÜV Rheinland.',
      },
    ],
    faqs: [
      {
        q: 'How does Ringlock differ from Cuplock?',
        a: 'Both are modular systems with fixed node points. Ringlock uses a rosette that accepts connections at eight positions, which suits curved and irregular geometry. Cuplock uses a top and bottom cup that takes four ledgers at right angles, which is faster on rectangular elevations. Many contractors run both.',
      },
      {
        q: 'Will components bought now fit stock bought years ago?',
        a: 'That is the point of a system scaffold, and it depends on the maker holding the geometry. Ours is set by tooling in our own plant rather than varying by batch. Send a sample or the dimensions of your existing stock if you are matching an established fleet.',
      },
      {
        q: 'What corrosion protection is used?',
        a: 'Hot dip galvanizing to DIN EN 1461, applied in our own plants. It coats the inside of hollow sections as well as the outside, which is where a scaffold standard actually corrodes.',
      },
    ],
  },

  'system-scaffold-cuplock': {
    intro:
      'Cuplock makes its connection with two cups rather than a rosette: a bottom cup welded to the standard and a top cup that slides down and locks four ledger blades at once with a hammer blow. On a rectangular elevation that is the fastest modular connection there is, because one action secures four members and there is nothing loose to drop. KEAA International manufactures nine Cuplock components in Ludhiana, India, from steel to EN 10025 and EN 10219, hot dip galvanized to DIN EN 1461 in our own plants. The system is specified where speed of erection matters and the geometry is regular, which covers most building facades, and it remains one of the most widely used scaffold systems for exactly that reason.',
    sections: [
      {
        heading: 'What the range includes',
        body:
          'Cuplock standards with their top and bottom cups, ledgers and ledger blades, truss ledgers for spanning openings, and diagonal braces. Side brackets and Cuplock ladder brackets extend the working platform and carry access.',
      },
      {
        heading: 'Standards and finish',
        body:
          'Steel to EN 10025 and EN 10219 as recorded against the products. Hot dip galvanized to DIN EN 1461 in our own galvanizing plants. Welding is carried out by welders certified to EN 1090-2 and EN 3834-2, accredited by SLV Germany, which matters more on Cuplock than on most systems because the cup welds carry the connection.',
      },
      {
        heading: 'Where it is used',
        body:
          'Building facades, refurbishment, and general access work on regular elevations. It is also widely used for birdcage scaffolds and support work where speed of erection over a large repeated area is the deciding factor. Buyers are scaffolding contractors, rental fleets and distributors.',
      },
      {
        heading: 'Why buy it from the manufacturer',
        body:
          'The cup weld is the component that makes or breaks a Cuplock scaffold, and it is a welding quality question rather than a materials one. Our welding is certified to EN 1090-2 and EN 3834-2 by SLV Germany and carried out in house, alongside our own galvanizing. Management systems are certified to ISO 9001:2015, ISO 14001:2015 and ISO 45001:2018 by TÜV Rheinland.',
      },
    ],
    faqs: [
      {
        q: 'Why is Cuplock faster to erect than tube and fitting?',
        a: 'One hammer blow on the top cup locks up to four ledgers into the node at once, and there are no loose couplers to hold, drop or lose. On a regular elevation that difference compounds across every lift.',
      },
      {
        q: 'Can Cuplock and Ringlock components be mixed?',
        a: 'No. They are different connection systems and are not interchangeable at the node. Contractors often own both and select per job, but a single scaffold is built from one system.',
      },
      {
        q: 'What is a truss ledger for?',
        a: 'Spanning an opening where a standard cannot be landed, for example over a doorway or a vehicle access. It carries the load across to the standards either side.',
      },
    ],
  },

  'system-scaffolds-hk': {
    intro:
      'HK is a frame based system scaffold built around pre-assembled frames and single tube transoms rather than individual standards and ledgers. Fewer parts go into a lift, the geometry is decided at the factory, and erection is correspondingly quick where the elevation suits it. KEAA International manufactures eight HK components in Ludhiana, India, from steel to EN 10025 and EN 10219, hot dip galvanized to DIN EN 1461 in our own plants. The range covers the frames themselves, Enhak standards, ledgers, guard rail frames and transoms in high, high reinforced and low patterns, together with complete Haki towers. It is specified where a contractor wants system scaffold discipline with a lower part count than a full modular system.',
    sections: [
      {
        heading: 'What the range includes',
        body:
          'Scaffold frames and Enhak standards, ledgers, guard rail frames, and single tube transoms in low, high and high reinforced patterns. Complete Haki towers are catalogued as an assembly for tower applications.',
      },
      {
        heading: 'Standards and finish',
        body:
          'Steel to EN 10025 and EN 10219 as recorded against the products, hot dip galvanized to DIN EN 1461 in our own plants. Welding is carried out by welders certified to EN 1090-2 and EN 3834-2, accredited by SLV Germany.',
      },
      {
        heading: 'Where it is used',
        body:
          'Facade access and general construction where a frame based system suits the elevation, and tower work where a pre-engineered assembly is faster than building from loose components. Buyers are scaffolding contractors and rental fleets.',
      },
      {
        heading: 'Why buy it from the manufacturer',
        body:
          'A frame system depends on every frame being identical, because a frame that is out of square propagates the error up the lift. That is a tooling and welding question settled in the factory. Our welding is certified to EN 1090-2 and EN 3834-2 through SLV Germany, and management systems are certified to ISO 9001:2015, ISO 14001:2015 and ISO 45001:2018 by TÜV Rheinland.',
      },
    ],
    faqs: [
      {
        q: 'What is the difference between high and low single tube transoms?',
        a: 'They differ in the depth of the transom and therefore in what they can carry and how the platform sits. A reinforced high transom is specified where the loading is greater. Send the platform loading and width with your enquiry.',
      },
      {
        q: 'Is HK compatible with Ringlock or Cuplock?',
        a: 'No. Each system has its own connection and they are not interchangeable. A scaffold is built from one system.',
      },
      {
        q: 'Do you supply complete towers?',
        a: 'Yes. Haki towers are catalogued as an assembly, and the individual frames, ledgers, transoms and guard rail frames are catalogued separately for building and repairing them.',
      },
    ],
  },

  'access-scaffold-euro-frame': {
    intro:
      'Euro frame scaffolding is the pre-welded frame system used across European facade work, where two uprights and a welded transom stack vertically and brace into each other. It is the fastest way to put a straight, regular elevation under access, and because a frame is one component rather than four, there is less to count in and out of a lorry. KEAA International manufactures nine Euro frame components in Ludhiana, India, hot dip galvanized to DIN EN 1461, covering the frames themselves, Euro Plettac 2M frames, assembly frames, brackets and the guard rail set. The range is specified by contractors and rental fleets working to European frame dimensions rather than the American pattern.',
    sections: [
      {
        heading: 'What the range includes',
        body:
          'Access scaffold Euro frames, Euro Plettac 2M frames and Euro assembly frames. Edge protection covers double guard rails, double front guard rails, guard rail supports and Euro end guard rail supports. Brackets extend the platform where the facade steps.',
      },
      {
        heading: 'Standards and finish',
        body:
          'Hot dip galvanized to DIN EN 1461, the finish recorded against the products, applied in our own galvanizing plants. Welding is carried out by welders certified to EN 1090-2 and EN 3834-2, accredited by SLV Germany.',
      },
      {
        heading: 'Where it is used',
        body:
          'Facade access and refurbishment on regular elevations, painting and rendering work, and general construction access. Buyers are scaffolding contractors, rental fleets and distributors working to European frame dimensions.',
      },
      {
        heading: 'Why buy it from the manufacturer',
        body:
          'Frame squareness and consistent stacking are set by tooling, so they are a factory property rather than something an erector can correct. Fabrication, welding and galvanizing are all in house, welding is certified through SLV Germany, and management systems are certified to ISO 9001:2015, ISO 14001:2015 and ISO 45001:2018 by TÜV Rheinland.',
      },
    ],
    faqs: [
      {
        q: 'What is the difference between Euro frame and American frame scaffolding?',
        a: 'They are different dimensional patterns with different locking hardware, so they are not interchangeable. Euro frames follow European facade dimensions; the American frame range uses the locks and pins common in North American practice. Choose the one that matches your existing fleet.',
      },
      {
        q: 'Are guard rails supplied with the frames?',
        a: 'They are catalogued separately, which is deliberate: edge protection requirements vary by job and by the country the scaffold is erected in. Double guard rails, front guard rails and their supports are all available.',
      },
      {
        q: 'What is a Plettac 2M frame?',
        a: 'A two metre frame in the Plettac pattern, one of the common European frame dimensions. It is catalogued alongside the standard Euro frames so a fleet working to that pattern can order directly.',
      },
    ],
  },

  'access-scaffold-american-frame': {
    intro:
      'American frame scaffolding is a frame system built around ladder and mason frames and a family of locking devices that hold the braces: C-locks, Canada locks, drop locks, fast locks, flip locks and snap on locks, each suited to a different brace and working habit. KEAA International manufactures 17 components in this pattern in Ludhiana, India, including the frames, the full range of locks, and the pin set of gravity, rivet, roll and pig tall pins that assemble them. It is the pattern used across North American practice and in markets that follow it, and the reason the range is dominated by locks and pins is that these are the parts a working fleet consumes and replaces.',
    sections: [
      {
        heading: 'What the range includes',
        body:
          'Ladder frames and mason or step frames. Locking devices in C-lock, Canada lock, drop lock, fast lock, flip lock and snap on lock patterns. Pins covering gravity pins, rivet pins, roll pins and pig tall pins. Bridge poles for spanning between frames.',
      },
      {
        heading: 'Standards and finish',
        body:
          'Fabrication and welding are in house, with welding carried out by welders certified to EN 1090-2 and EN 3834-2, accredited by SLV Germany. Management systems are certified to ISO 9001:2015, ISO 14001:2015 and ISO 45001:2018 by TÜV Rheinland. [VERIFY] Finish and steel specification for this range: the catalogue does not currently record either against these 17 items.',
      },
      {
        heading: 'Where it is used',
        body:
          'Facade access, masonry work and general construction in markets following American frame practice. Buyers are scaffolding contractors, rental fleets and distributors supplying that pattern.',
      },
      {
        heading: 'Why buy it from the manufacturer',
        body:
          'Locks and pins are the consumable half of a frame fleet, and their fit decides whether a brace holds. Buying them from the maker of the frames removes the tolerance drift that appears when locks are sourced separately. Manufacturing is in house from cutting through welding.',
      },
    ],
    faqs: [
      {
        q: 'Which lock type should I order?',
        a: 'It depends on the brace and the frames already in your fleet. C-lock, Canada, drop, fast, flip and snap on patterns are all made. Send a photograph or sample of your existing lock with your enquiry and we will match it.',
      },
      {
        q: 'Can American frames be used with Euro frames?',
        a: 'No. The dimensional patterns and locking hardware differ, so they are not interchangeable. A scaffold is built from one pattern.',
      },
      {
        q: 'Do you supply replacement pins separately?',
        a: 'Yes. Gravity, rivet, roll and pig tall pins are individually catalogued, because they are the parts a working fleet loses and replaces most often.',
      },
    ],
  },

  'scaffold-tube-fitting-european': {
    intro:
      'A coupler is the smallest component in a scaffold and the one that decides whether it stands. It has to grip a tube hard enough to develop the designed slip resistance, hold that grip through repeated assembly, and do it after years outdoors. EN 74-1 is the European specification that governs exactly this, and it is cited against 17 of the 18 European pattern fittings KEAA International manufactures. The range covers right angle and swivel couplers in the German pattern, girder couplers for fixing to steelwork, and an unusually wide set of half couplers: assembled and unassembled, with brace lock, with welded rod, L rod, tube, V-strip, welded strip and L strip in long and short. Manufacturing, including hot dip galvanizing to DIN EN 1461, is in our own plants in Ludhiana, India.',
    sections: [
      {
        heading: 'What the range includes',
        body:
          'German right angle couplers and German swivel couplers. Girder couplers for connecting scaffold to structural steelwork. Half couplers in assembled and unassembled form, and with brace lock, welded rod, welded L rod, welded tube, welded V-strip, welded strip, and L strip in long and short versions. Couplers with welded strip complete the range.',
      },
      {
        heading: 'Standards and finish',
        body:
          'EN 74-1, the European specification for couplers, spigot pins and baseplates for use in falsework and scaffolds, is recorded against the products in this range. Corrosion protection is hot dip galvanizing to DIN EN 1461, applied in our own plants. Props and couplers manufactured by KEAA carry Ü-mark conformity assessed by Sigma Karlsruhe, and welding is certified to EN 1090-2 and EN 3834-2 by SLV Germany.',
      },
      {
        heading: 'Where it is used',
        body:
          'Tube and fitting scaffolds, tying system scaffolds back to structure, connecting scaffold to steelwork, and every non standard connection a system scaffold cannot make on its own. Buyers are scaffolding contractors, rental fleets and distributors across Europe and export markets following European practice.',
      },
      {
        heading: 'Why buy it from the manufacturer',
        body:
          'Coupler performance is set by forging or casting quality and by the thread, neither of which is visible on inspection. Ü-mark conformity assessment by Sigma Karlsruhe and welding certification through SLV Germany are the external checks on that, and both apply to production in our own plants. Management systems are certified to ISO 9001:2015, ISO 14001:2015 and ISO 45001:2018 by TÜV Rheinland.',
      },
    ],
    faqs: [
      {
        q: 'What does EN 74 cover?',
        a: 'EN 74-1 is the European specification for couplers, spigot pins and baseplates used in falsework and scaffolds. It sets the performance requirements a coupler has to meet, including slip and the loads it must carry. It is cited against the products in this range.',
      },
      {
        q: 'Why are there so many half coupler variants?',
        a: 'Because a half coupler is the adapter between a scaffold tube and something else: a brace, a rod, a tube, a strip, a lock. Each welded attachment suits a different connection, which is why the range covers welded rod, L rod, tube, V-strip and strip versions rather than one generic part.',
      },
      {
        q: 'What is the difference between a right angle and a swivel coupler?',
        a: 'A right angle coupler fixes two tubes at 90 degrees and is load bearing. A swivel coupler allows any angle and is used for bracing. Both are made in the German pattern in this range.',
      },
    ],
  },

  'scaffold-tube-fitting-british-american': {
    intro:
      'British pattern scaffold fittings are built to a different tradition from the European ones: BS 1139 is the British standard for metal scaffolding and its fittings, and it is cited against products in this range. KEAA International manufactures 11 items covering the British and American patterns, including right angle, swivel, girder and half couplers, fence couplers in Allen key and carriage bolt M12 forms, the SW19 and SW22 nuts that go with them, and galvanized scaffold tubes. Hot dip galvanizing to DIN EN 1461 is applied in our own plants in Ludhiana, India. The range exists alongside the European fittings because a working site rarely standardises on one pattern, particularly in export markets with mixed stock.',
    sections: [
      {
        heading: 'What the range includes',
        body:
          'Right angle couplers, swivel couplers, girder couplers and half couplers in British and American patterns. Fence couplers in Allen key bolt M12 and carriage bolt M12 versions. Nuts in SW19 and SW22. Galvanized scaffold tubes to complete an assembly.',
      },
      {
        heading: 'Standards and finish',
        body:
          'BS 1139, the British standard for metal scaffolding, is recorded against products in this range. Corrosion protection is hot dip galvanizing to DIN EN 1461, applied in our own galvanizing plants. Welding is carried out by welders certified to EN 1090-2 and EN 3834-2, accredited by SLV Germany.',
      },
      {
        heading: 'Where it is used',
        body:
          'Tube and fitting scaffolds in markets following British practice, temporary fencing where fence couplers join panels to tubes, and mixed fleets that hold both British and European stock. Buyers are scaffolding contractors, fencing hire companies, rental fleets and distributors.',
      },
      {
        heading: 'Why buy it from the manufacturer',
        body:
          'Couplers and the tube they grip come from the same maker, so the fit is designed rather than assumed, which matters because coupler performance is a function of the tube diameter and wall it is clamping. Management systems are certified to ISO 9001:2015, ISO 14001:2015 and ISO 45001:2018 by TÜV Rheinland.',
      },
    ],
    faqs: [
      {
        q: 'What is the difference between British and European couplers?',
        a: 'They are built to different standards, BS 1139 and EN 74 respectively, with different dimensions and forms. They are not generally interchangeable on the same scaffold, so specify the pattern your fleet already uses.',
      },
      {
        q: 'What are fence couplers used for?',
        a: 'Joining temporary fence panels to scaffold tubes. They are supplied in Allen key bolt M12 and carriage bolt M12 versions, the choice usually turning on how secure against tampering the connection needs to be.',
      },
      {
        q: 'Do you supply scaffold tube as well as fittings?',
        a: 'Yes. Galvanized tubes are catalogued in this range, so tube and fittings can be ordered together and the coupler fit is known rather than assumed.',
      },
    ],
  },

  'accessories-jacks-nuts': {
    intro:
      'A base jack is where the whole scaffold load reaches the ground, and it is the component that lets an erector take a structure built to fixed geometry and land it on ground that is not level. KEAA International manufactures 11 items in this range in Ludhiana, India, from steel specified as S235 JR, S275 JR and S355 JR to EN 10025 and EN 10219, hot dip galvanized to DIN EN 1461 in our own plants. The range covers adjustable base jacks plain and with locking strip or locking wing nut, swivel base jacks in light and heavy duty for sloping ground, base jacks with welded tube, the jack nuts themselves in cast and forged versions, and wall ties. Finishes available include paint and electroplating as well as hot dip galvanizing.',
    sections: [
      {
        heading: 'What the range includes',
        body:
          'Adjustable base jacks, adjustable base jacks with locking strip, and adjustable base jacks with locking wing nut. Swivel base jacks in light duty and heavy duty for sloping ground. Base jacks with welded tube. Jack nuts in cast and forged versions. Wall ties for tying the assembly back to structure.',
      },
      {
        heading: 'Standards and finish',
        body:
          'Steel specified as S235 JR, S275 JR and S355 JR to EN 10025 and EN 10219, recorded against the products. Finishes are hot dip galvanizing to DIN EN 1461, and paint or electroplating where specified. Galvanizing is applied in our own plants, and welding is carried out by welders certified to EN 1090-2 and EN 3834-2, accredited by SLV Germany.',
      },
      {
        heading: 'Where it is used',
        body:
          'The base of every system scaffold and shoring tower, and the head of props and towers where an adjustable connection is needed. Swivel jacks are specified wherever the ground slopes. Buyers are scaffolding contractors, formwork specialists, rental fleets and distributors.',
      },
      {
        heading: 'Why buy it from the manufacturer',
        body:
          'The jack nut and the thread it runs on decide whether a jack adjusts smoothly under load or seizes, and cast and forged nuts behave differently. Making both in house, alongside the jacks themselves, is what lets us match them. Management systems are certified to ISO 9001:2015, ISO 14001:2015 and ISO 45001:2018 by TÜV Rheinland.',
      },
    ],
    faqs: [
      {
        q: 'When do I need a swivel base jack?',
        a: 'When the ground slopes. A swivel jack lets the base plate sit flat on the slope while the threaded section stays vertical, which keeps the load axial. Light and heavy duty versions are both made.',
      },
      {
        q: 'What is the difference between cast and forged jack nuts?',
        a: 'Forging produces a denser grain structure and is generally specified for the more demanding duty. Both are manufactured here, so the choice can follow your specification rather than what happens to be available.',
      },
      {
        q: 'Which steel grades are available?',
        a: 'The product data records S235 JR, S275 JR and S355 JR to EN 10025 and EN 10219. Specify the grade with your enquiry and we will quote against it.',
      },
    ],
  },

  'slab-formwork-system-props': {
    intro:
      'An adjustable steel prop carries wet concrete until the slab can carry itself, which makes it one of the few temporary works components where failure is immediate and catastrophic rather than gradual. EN 1065 is the European standard that governs them: it defines the classes of telescopic steel prop and the testing each class must pass. KEAA International manufactures 13 props and prop accessories in Ludhiana, India, including props declared to EN 1065 Class BD, standard props to Class B, light duty props at 10 kN, props load tested for 20 kN, reinforced props, heavy duty special sizes and push pull props for bracing wall formwork into position. Hot dip galvanizing to DIN EN 1461 is applied in our own plants, and props manufactured by KEAA carry Ü-mark conformity assessed by Sigma Karlsruhe.',
    sections: [
      {
        heading: 'What the range includes',
        body:
          'Props to EN 1065 Class BD and standard props to Class B. Light duty props rated at 10 kN and props load tested for 20 kN. Reinforced props and heavy duty props in special sizes for longer spans or higher loads. Push pull props, which brace wall formwork into position and plumb rather than carrying vertical load. Prop accessories complete the range.',
      },
      {
        heading: 'Standards and finish',
        body:
          'EN 1065, the European standard for adjustable telescopic steel props, is cited against products in this range, with classes recorded per item. Corrosion protection is hot dip galvanizing to DIN EN 1461, applied in our own plants. Props carry Ü-mark conformity assessed by Sigma Karlsruhe, and welding is certified to EN 1090-2 and EN 3834-2 by SLV Germany.',
      },
      {
        heading: 'Where it is used',
        body:
          'Slab and beam casting on concrete frames, back propping to lower floors while concrete gains strength, and, in the case of push pull props, bracing and plumbing wall formwork. Buyers are formwork specialists, concrete frame contractors, rental fleets and distributors.',
      },
      {
        heading: 'Why buy it from the manufacturer',
        body:
          'A prop is sold on a class and a load, and those are properties of the tube, the thread and the pin that only testing confirms. Ü-mark conformity assessment through Sigma Karlsruhe is the external check on that, and it applies to props made in our own plants. Management systems are certified to ISO 9001:2015, ISO 14001:2015 and ISO 45001:2018 by TÜV Rheinland.',
      },
    ],
    faqs: [
      {
        q: 'What does EN 1065 Class BD mean?',
        a: 'EN 1065 classifies adjustable telescopic steel props by their load capacity and extension characteristics, and sets the testing each class must pass. Class BD and Class B are two of those classifications, recorded per product in our catalogue. Ask for the class alongside the length range when you request a quotation, because the two together determine the prop you need.',
      },
      {
        q: 'What is a push pull prop for?',
        a: 'Bracing wall formwork into position and holding it plumb while concrete is poured. It works in both compression and tension, which is where the name comes from, and it does not carry vertical slab load.',
      },
      {
        q: 'Can you supply props in non standard lengths?',
        a: 'Heavy duty props in special sizes are catalogued for exactly that. Send the extended and closed lengths and the load you need with your enquiry and we will quote against them.',
      },
    ],
  },

  'slab-formwork-system-fork-heads': {
    intro:
      'A fork head is the connection between the top of a prop and the timber or steel beam carrying the slab formwork. It has to cradle the beam so it cannot roll or walk under load, and it has to do it while the prop below is being adjusted. KEAA International manufactures 11 fork head variants in Ludhiana, India, covering slotted, hole, rod and U strip patterns, beam heads, light duty versions, and fork head and U head jacks that combine the head with an adjustable thread. High tensile material and high tensile tube are catalogued in the same range for applications where the standard specification is not sufficient. Manufacturing including welding is in house, by welders certified to EN 1090-2 and EN 3834-2 accredited by SLV Germany.',
    sections: [
      {
        heading: 'What the range includes',
        body:
          'Fork heads in slotted, hole, rod, rod with holes in plate and U strip patterns, plus a light duty version. Beam heads for beam support. Fork head jacks and U head jacks, which combine the head with an adjustable threaded section. High tensile material and high tensile tube for higher duty applications.',
      },
      {
        heading: 'Standards and finish',
        body:
          'Welding is carried out by welders certified to EN 1090-2 and EN 3834-2, accredited by SLV Germany, and fabrication is in house. Management systems are certified to ISO 9001:2015, ISO 14001:2015 and ISO 45001:2018 by TÜV Rheinland. [VERIFY] Finish and steel specification for this range: the catalogue does not currently record either against these 11 items.',
      },
      {
        heading: 'Where it is used',
        body:
          'Slab formwork on concrete frames, at the top of every prop carrying a beam. The choice of pattern follows the beam section and whether the head has to be fixed to it. Buyers are formwork specialists, concrete frame contractors and rental fleets.',
      },
      {
        heading: 'Why buy it from the manufacturer',
        body:
          'The fork head and the prop it sits on have to match at the thread and at the tube, so buying both from one maker removes a fit problem that is only discovered on site. Our props, jacks and fork heads are made in the same plants.',
      },
    ],
    faqs: [
      {
        q: 'Which fork head pattern do I need?',
        a: 'It follows the beam you are carrying and how the head is fixed to it. Slotted, hole, rod and U strip patterns each suit a different beam and fixing. Send the beam section with your enquiry and we will quote the matching head.',
      },
      {
        q: 'What is the difference between a fork head and a fork head jack?',
        a: 'A fork head is the cradle alone, fitted to the top of a prop. A fork head jack combines the cradle with its own adjustable threaded section, so the height adjustment is at the head rather than in the prop.',
      },
      {
        q: 'When is high tensile material specified?',
        a: 'Where the standard specification does not carry the load or the span required. Both high tensile material and high tensile tube are catalogued in this range for those applications.',
      },
    ],
  },

  'system-slab-formwork-tripods': {
    intro:
      'A tripod holds a prop upright and stable while it is being positioned and before the formwork above it is complete. Without one, a free standing prop has to be held by hand, which is slow and is the point at which most slab formwork accidents happen. KEAA International manufactures seven tripod patterns in Ludhiana, India, hot dip galvanized to DIN EN 1461, covering fixed type, universal model, and light, medium and heavy duty versions, including a square tube medium duty pattern and light duty tripods for 25 mm and 27 mm props. The range is deliberately graded by duty, because a tripod that is heavier than the job needs is simply extra weight to carry up a building.',
    sections: [
      {
        heading: 'What the range includes',
        body:
          'Fixed type tripods and a universal model. Heavy duty and medium duty tripods, including a square tube medium duty pattern. Light duty tripods sized for 25 mm and 27 mm props.',
      },
      {
        heading: 'Standards and finish',
        body:
          'Hot dip galvanized to DIN EN 1461, recorded against products in this range and applied in our own galvanizing plants. Welding is carried out by welders certified to EN 1090-2 and EN 3834-2, accredited by SLV Germany.',
      },
      {
        heading: 'Where it is used',
        body:
          'Slab formwork erection on concrete frames, wherever props are stood before the beams and decking tie them together. Buyers are formwork specialists, concrete frame contractors, rental fleets and distributors.',
      },
      {
        heading: 'Why buy it from the manufacturer',
        body:
          'A tripod grips a specific prop diameter, so matching it to the props it will be used with is the whole point. We make both, which means the fit is specified rather than discovered. Management systems are certified to ISO 9001:2015, ISO 14001:2015 and ISO 45001:2018 by TÜV Rheinland.',
      },
    ],
    faqs: [
      {
        q: 'Which tripod suits my props?',
        a: 'It depends on the prop diameter and the duty. Light duty tripods are catalogued for 25 mm and 27 mm props, with medium and heavy duty versions above them. Send the prop size and we will quote the matching tripod.',
      },
      {
        q: 'What is the universal model for?',
        a: 'It takes a wider range of prop sizes than the dedicated patterns, which suits a fleet holding mixed prop stock rather than one standard size.',
      },
      {
        q: 'Are tripods load bearing?',
        a: 'No. A tripod stabilises a prop while it is positioned and before the formwork ties it in. The prop carries the load.',
      },
    ],
  },

  'formwork-accessories': {
    intro:
      'Formwork accessories are the small forged and cast components that hold a wall form together against the pressure of wet concrete, which is considerable and acts outwards on every square metre of the form face. KEAA International manufactures 20 items in this range in Ludhiana, India, covering three wing anchor nuts in cast and forged versions and in 70 mm and 100 mm sizes, swivel wing nuts with combination plates, anchor nuts, hexagonal nuts and nuts with locking pin, Tekko clips, formwork panel wedge clamps in two patterns, and connecting pins with R-clips. The DIN EN 50961 specification is recorded against products in this range. The split between cast and forged versions runs through the whole range, because the two behave differently under load and buyers specify one or the other.',
    sections: [
      {
        heading: 'What the range includes',
        body:
          'Three wing anchor nuts, cast and forged, in 70 mm and 100 mm. Three wing nuts forged. Anchor nuts 100 mm forged. Swivel wing nuts with combination plate, cast and forged, including a 100 mm cast version. Hexagonal nuts and nuts with locking pin. Tekko clips forged. Formwork panel wedge clamps in two patterns. Connecting pins 16 mm with R-clip.',
      },
      {
        heading: 'Standards and finish',
        body:
          'DIN EN 50961 is recorded against products in this range. Manufacturing including forging, casting and welding is in house, with welding carried out by welders certified to EN 1090-2 and EN 3834-2, accredited by SLV Germany. Management systems are certified to ISO 9001:2015, ISO 14001:2015 and ISO 45001:2018 by TÜV Rheinland.',
      },
      {
        heading: 'Where it is used',
        body:
          'Wall and column formwork on concrete frames, tying form faces together against concrete pressure, and connecting panels and walings. Buyers are formwork specialists, concrete frame contractors, rental fleets and distributors.',
      },
      {
        heading: 'Why buy it from the manufacturer',
        body:
          'These are the components that fail first if the forging or casting is poor, and the failure mode is a form blowing out under pressure. Making them in house, with certified welding and an audited quality system, is the only way to hold that consistently across a container load.',
      },
    ],
    faqs: [
      {
        q: 'Should I specify cast or forged?',
        a: 'Forging produces a denser grain structure and is generally specified for the more demanding duty; casting suits items where the geometry is complex. Both are made here across the wing nut, anchor nut and Tekko clip ranges, so the choice can follow your specification.',
      },
      {
        q: 'What is a three wing anchor nut used for?',
        a: 'It tightens onto the tie rod that holds two form faces together against concrete pressure. The three wings let it be turned by hand or with a bar on site. It is catalogued in 70 mm and 100 mm.',
      },
      {
        q: 'What sizes of connecting pin are available?',
        a: '16 mm with R-clip is catalogued. Send the application with your enquiry if you need a different size and we will quote against it.',
      },
    ],
  },

  'wall-formwork-systems-clamps-panels': {
    intro:
      'Wall formwork has to hold a flat face against several tonnes per square metre of concrete pressure and then come apart cleanly. The clamps and panels that do it are the parts that take that pressure directly. KEAA International manufactures 12 items in this range in Ludhiana, India, hot dip galvanized to DIN EN 1461, covering H panels, beam clamps and beam vices, builder clamps, wedge clamps, anchor clamps and anchor feet including the DW 15 pattern, single anchors, steel cones, consoles and extension assemblies. The range is specified alongside the formwork accessories range, since a wall form needs both the clamping hardware and the tie components that go through it.',
    sections: [
      {
        heading: 'What the range includes',
        body:
          'H panels for the form face. Beam clamps slotted and beam vices. Builder clamps and cast wedge clamps. Anchor clamp bends, anchor feet including the DW 15 pattern, and single anchors. Steel cones for forming the tie hole through the pour. Consoles for working platforms and extension assemblies for increasing form height.',
      },
      {
        heading: 'Standards and finish',
        body:
          'Hot dip galvanized to DIN EN 1461, recorded against products in this range and applied in our own galvanizing plants. Welding is carried out by welders certified to EN 1090-2 and EN 3834-2, accredited by SLV Germany. Management systems are certified to ISO 9001:2015, ISO 14001:2015 and ISO 45001:2018 by TÜV Rheinland.',
      },
      {
        heading: 'Where it is used',
        body:
          'Wall and column casting on concrete frames, retaining wall construction, and core walls. Consoles provide the working platform on the pour face. Buyers are formwork specialists, concrete frame contractors and rental fleets.',
      },
      {
        heading: 'Why buy it from the manufacturer',
        body:
          'Clamps, anchors and the wing nuts and tie components in the formwork accessories range have to work as one assembly. Making the whole set in the same plants is what keeps thread pitches and bearing faces compatible across the system.',
      },
    ],
    faqs: [
      {
        q: 'What is a steel cone for?',
        a: 'It forms the void around the tie rod through the wall, so the rod can be recovered after the pour and the hole made good. It is what makes a tie reusable rather than cast into the concrete.',
      },
      {
        q: 'What is the DW 15 anchor foot?',
        a: 'DW 15 is a common tie rod thread designation, and the anchor foot in that pattern is made for it. Specify the tie system you are using with your enquiry so the anchor components match.',
      },
      {
        q: 'Do consoles come with guard rails?',
        a: 'Guard rails and railing posts are catalogued in the security systems range, which is where the edge protection for a formwork platform is specified from. Consoles carry the platform itself.',
      },
    ],
  },

  'load-bearing-system-shoring-tower': {
    intro:
      'A shoring tower carries vertical load where a prop alone cannot: heavy slabs, transfer structures, bridge decks and anywhere the height or the load exceeds what a single telescopic member should take. It is built from frames braced together into a tower, so the load path is through a designed structure rather than through individual props standing free. KEAA International manufactures seven shoring tower components in Ludhiana, India, hot dip galvanized to DIN EN 1461, covering frames in two, three and five step heights, cross braces and V braces, and guard rail frames with their connectors so the tower can be worked on safely.',
    sections: [
      {
        heading: 'What the range includes',
        body:
          'Shoring frames in two step, three step and five step heights, so a tower can be built to the lift required. Cross braces and V braces to tie the frames into a braced structure. Guard rail frames and guard rail connectors for edge protection on the tower.',
      },
      {
        heading: 'Standards and finish',
        body:
          'Hot dip galvanized to DIN EN 1461, recorded against the products and applied in our own plants. Welding is carried out by welders certified to EN 1090-2 and EN 3834-2, accredited by SLV Germany. Management systems are certified to ISO 9001:2015, ISO 14001:2015 and ISO 45001:2018 by TÜV Rheinland.',
      },
      {
        heading: 'Where it is used',
        body:
          'Bridge and civil works, transfer slabs, heavy industrial floors, and any falsework where load or height rules out props. Base jacks from the accessories range land the tower on uneven ground and fork heads carry the beams above it. Buyers are formwork and falsework specialists, civil contractors and rental fleets.',
      },
      {
        heading: 'Why buy it from the manufacturer',
        body:
          'A shoring tower is only as square as its frames, and frame accuracy is a tooling and welding property set in the factory. Frames, braces, jacks and fork heads all come from our own plants, so the assembly is dimensionally consistent from the ground up.',
      },
    ],
    faqs: [
      {
        q: 'How do I choose between two, three and five step frames?',
        a: 'It follows the height you need and how you want to break it down. Taller frames mean fewer joints and faster erection; shorter frames give finer height control and are easier to handle. Most towers mix them.',
      },
      {
        q: 'What is the difference between a cross brace and a V brace?',
        a: 'They brace the tower in different configurations and suit different frame spacings. Both are catalogued, and the choice follows the tower layout.',
      },
      {
        q: 'Do I still need base jacks with a shoring tower?',
        a: 'Yes, in almost all cases. The tower geometry is fixed, and base jacks are what land it level on ground that is not. Adjustable and swivel base jacks are catalogued in the accessories range.',
      },
    ],
  },

  'security-systems-guard-rails-railing-posts': {
    intro:
      'Edge protection is the part of a scaffold that does nothing until it is needed and then has to work first time. KEAA International manufactures 13 guard rail and railing post components in Ludhiana, India, hot dip galvanized to DIN EN 1461, covering guard rails for both tube and plank systems, railing posts in inserted and combination patterns, and the adjustable railing clamps that fix them, in tube, plank and heavy duty plank versions. The range covers tube and plank because sites use both, and a guard rail that does not match the platform system is a guard rail that gets left off. Galvanized tubes at 33.7 x 2.5 mm and crow bars for assembly are catalogued alongside.',
    sections: [
      {
        heading: 'What the range includes',
        body:
          'Guard rails for planks, for planks with three hooks, for tubes in three block and double block patterns, and a special type. Guard rail blocks for tubes. Railing posts in inserted plank pattern and combination tube and plank pattern. Adjustable railing clamps for tubes, for planks, and a heavy duty plank version. Galvanized tubes at 33.7 x 2.5 mm and crow bars.',
      },
      {
        heading: 'Standards and finish',
        body:
          'Hot dip galvanized to DIN EN 1461, recorded against products in this range and applied in our own galvanizing plants. Welding is carried out by welders certified to EN 1090-2 and EN 3834-2, accredited by SLV Germany. Management systems are certified to ISO 9001:2015, ISO 14001:2015 and ISO 45001:2018 by TÜV Rheinland.',
      },
      {
        heading: 'Where it is used',
        body:
          'Edge protection on scaffold platforms, formwork consoles and shoring towers, and anywhere a working platform has an open edge. Buyers are scaffolding contractors, formwork specialists, rental fleets and distributors.',
      },
      {
        heading: 'Why buy it from the manufacturer',
        body:
          'Edge protection has to fit the platform system it protects, and a clamp that almost fits is worse than none because it gives the appearance of protection. Making the rails, posts and clamps alongside the scaffold systems themselves is what keeps them compatible.',
      },
    ],
    faqs: [
      {
        q: 'Do the guard rails fit both tube and plank platforms?',
        a: 'The range covers both. Guard rails for planks, including a three hook version, and guard rails for tubes in three block and double block patterns are all catalogued, with matching clamps for each.',
      },
      {
        q: 'What is a combination railing post?',
        a: 'One that accepts both tubes and planks, which suits a site running mixed platform types rather than standardising on one.',
      },
      {
        q: 'What tube size do the fittings suit?',
        a: 'Galvanized tubes at 33.7 x 2.5 mm are catalogued in this range. Confirm the tube you are using with your enquiry so the clamps match.',
      },
    ],
  },

  'trestles-barriers': {
    intro:
      'Trestles and barriers are the light access and crowd control end of the range: a trestle gives a low working platform where a full scaffold would be disproportionate, and barriers separate people from a hazard or a route. KEAA International manufactures four items in Ludhiana, India, covering trestles in standard and light duty models, crowd control barriers and road barriers. They are catalogued within the scaffolding range because they are made on the same lines, from the same steel, in the same plants, and are usually bought by the same contractors and hire fleets who are already ordering scaffold components.',
    sections: [
      {
        heading: 'What the range includes',
        body:
          'Trestles in a standard model and a light duty model, for low level working platforms. Crowd control barriers for pedestrian management at events and works. Road barriers for traffic and site perimeter control.',
      },
      {
        heading: 'Standards and finish',
        body:
          'Fabrication and welding are in house, with welding carried out by welders certified to EN 1090-2 and EN 3834-2, accredited by SLV Germany. Management systems are certified to ISO 9001:2015, ISO 14001:2015 and ISO 45001:2018 by TÜV Rheinland. [VERIFY] Finish and steel specification for this range: the catalogue does not currently record either against these four items.',
      },
      {
        heading: 'Where it is used',
        body:
          'Interior fit out and maintenance where a trestle platform is enough, and site perimeters, events and road works for the barriers. Buyers are contractors, tool and plant hire fleets, event suppliers and local authority suppliers.',
      },
      {
        heading: 'Why buy it from the manufacturer',
        body:
          'Barriers and trestles are bought in volume and stored outdoors between uses, so consistency and finish matter more than they look as though they should. They are made on the same lines as our scaffold components, with the same welding certification.',
      },
    ],
    faqs: [
      {
        q: 'What is the difference between the standard and light duty trestle?',
        a: 'Duty rating and weight. The light duty model is easier to carry and suits lighter work; the standard model takes more. Send the working load and platform width you need with your enquiry.',
      },
      {
        q: 'Are crowd control barriers interlocking?',
        a: 'Send the layout you need with your enquiry and we will confirm the connection arrangement on the current pattern, since barrier designs vary between markets.',
      },
      {
        q: 'Can barriers be branded or powder coated?',
        a: 'We operate our own powder coating plant with automatic robotic spray, so finishes can be discussed with an order. Confirm requirements when you enquire.',
      },
    ],
  },

};

/** The pillar block for a subcategory slug, or undefined when none is written yet. */
export const getSubcategoryPillar = (slug) => subcategoryPillars[slug];
