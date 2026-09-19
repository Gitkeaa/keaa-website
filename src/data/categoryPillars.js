/**
 * Long-form copy for the three category pages, plus the questions buyers actually ask.
 *
 * WHY IT EXISTS
 * -------------
 * A category page used to be a one-line blurb above a product grid. That gives Google almost
 * nothing to rank: the page has no more text about ringlock scaffolding than the homepage
 * does, so it competes for those searches on a paragraph. The SEO programme asks for these
 * pages to become pillar pages of 300 words or more covering what the system is, its
 * components, the standards it is built to, where it is used and why to buy it here.
 *
 * WHERE THE FACTS COME FROM
 * -------------------------
 * Only two places, never invention:
 *   - the catalogue itself, for what is actually made (the subcategory names on each page
 *     are the component list, and they are read live rather than repeated here);
 *   - src/data/company.js, for the plant, the finishes and the certifications.
 * The European standards named below are public specifications, cited for what they cover.
 * Where a claim would be about KEAA rather than about the standard, it is only made if
 * company.js already carries it.
 *
 * Deliberately absent: load tables, safe working loads and capacity figures. They are
 * product-specific, they vary by size, and publishing a number that is wrong for one item in
 * the range is worse than publishing none. They belong on product pages, from product data.
 *
 * The `faqs` feed both the visible accordion and FAQPage structured data, from one source,
 * so the two cannot drift apart.
 */

export const categoryPillars = {
  'scaffolding-formworks': {
    intro:
      'Scaffolding and formwork are the temporary works that make permanent construction possible: the access platform a crew stands on, and the mould that holds wet concrete until it can hold itself. Both carry load, both are assembled and dismantled many times over their life, and both fail expensively when the steel is thin or the fit is loose. KEAA International manufactures the full range in house, from system scaffold standards and ledgers through slab props, fork heads and tripods to the couplers and clamps that tie an assembly together.',
    sections: [
      {
        heading: 'What the range covers',
        body:
          'The scaffolding side spans modular system scaffolds, where standards and ledgers lock into fixed node points for repeatable geometry, and frame scaffolds, where pre-welded frames stack for straightforward facade access. The formwork side covers slab systems built around adjustable steel props, fork heads and tripods, together with wall formwork clamps and panels. Tube and fitting sits across both, in European, British and American patterns, because a site rarely standardises on one. Every subcategory listed on this page is made and stocked, not brokered.',
      },
      {
        heading: 'Standards and finish',
        body:
          'Adjustable props are made to EN 1065, which sets the classes and the test regime for telescopic steel props. Couplers follow EN 74, the specification for the fittings that join tubes. System scaffolds are designed around EN 12810 and EN 12811, which govern facade scaffolds and the performance requirements for temporary works. Corrosion protection is hot dip galvanizing to DIN EN 1461, applied in our own plants rather than bought in, which is what keeps coating thickness consistent across a container load.',
      },
      {
        heading: 'Where it is used',
        body:
          'Building facades and refurbishment, industrial maintenance and shutdowns, slab and wall casting on concrete frames, shoring for load bearing towers, and the access and edge protection that goes with all of them. Buyers are typically scaffolding contractors, formwork specialists, rental fleets that need parts to interchange across years of stock, and distributors supplying those trades.',
      },
      {
        heading: 'Why buy it from the manufacturer',
        body:
          'Laser cutting, robotic welding, galvanizing, powder coating and electroplating are all under our own roof, and welding is carried out by welders certified to EN 1090-2 and EN 3834-2, accredited by SLV Germany. Props and couplers carry Ü-mark conformity assessed by Sigma Karlsruhe. Quality, environmental and occupational health management are certified to ISO 9001:2015, ISO 14001:2015 and ISO 45001:2018 by TÜV Rheinland. That combination is what lets us hold a specification across a full order and repeat it on the next one.',
      },
    ],
    faqs: [
      {
        q: 'Which standard applies to adjustable steel props?',
        a: 'EN 1065. It defines the classes of telescopic steel prop and the testing they must pass. Ask for the class alongside the length range when you request a quotation, because the two together determine the prop you need.',
      },
      {
        q: 'What is the difference between European and British couplers?',
        a: 'They are made to different dimensional patterns and suit different tube sizes and site practices. EN 74 is the European specification for couplers. We manufacture European, British and American patterns, so an order can match whatever a site already runs.',
      },
      {
        q: 'How is the steel protected against corrosion?',
        a: 'Hot dip galvanizing to DIN EN 1461, in our own galvanizing plants. Powder coating and electroplating are also available in house where the application calls for them.',
      },
      {
        q: 'Can you supply parts that fit our existing system stock?',
        a: 'That is the usual case for rental fleets. Send the system type, the dimensions and photographs or drawings of the connection, and we will quote against them.',
      },
    ],
  },

  'livestock-housing-solutions': {
    intro:
      'Livestock housing equipment lives in the worst conditions steel ever sees: constant moisture, slurry, ammonia and the steady pressure of animals leaning, pushing and rubbing against it every day. It also has to be safe for the animal, because a sharp edge or a pinch point becomes an injury and a veterinary bill. KEAA International manufactures cattle, sheep, pig and horse housing systems, field gates and feeding equipment from heavy gauge galvanized steel, with welds dressed smooth.',
    sections: [
      {
        heading: 'What the range covers',
        body:
          'Cattle housing including cubicles, headlocks and feed barriers; calf housing and pens; sheep handling and penning; pig equipment; horse stabling components; and field gates in the sizes a working farm actually uses. The subcategories listed on this page are the live range, and each one opens onto the individual items with their dimensions.',
      },
      {
        heading: 'Materials and finish',
        body:
          'Heavy gauge steel, hot dip galvanized to DIN EN 1461 after fabrication so that cut ends and weld seams are coated rather than left exposed. Galvanizing after welding matters more here than in almost any other application: a bare weld in a slurry environment is where corrosion starts, and coating the finished assembly rather than the raw tube is what avoids it. Welds are dressed so there is no sharp edge at animal height.',
      },
      {
        heading: 'Where it is used',
        body:
          'Dairy and beef units, calf rearing sheds, sheep handling systems, pig units, stables and mixed farms, plus the agricultural dealers and builders who fit them out. Equipment is modular so a shed can be laid out to its own dimensions and extended later without replacing what is already installed.',
      },
      {
        heading: 'Why buy it from the manufacturer',
        body:
          'The same plant, certifications and galvanizing capacity that serve the scaffolding range serve this one: ISO 9001:2015, ISO 14001:2015 and ISO 45001:2018 certified by TÜV Rheinland, in house hot dip galvanizing, and manufacturing that has been exporting since 2003. For a dealer that means one supplier, one quality system and one container.',
      },
    ],
    faqs: [
      {
        q: 'Is the equipment galvanized before or after welding?',
        a: 'After fabrication. Hot dip galvanizing the finished assembly coats the weld seams and cut ends, which is exactly where corrosion starts in a slurry and ammonia environment.',
      },
      {
        q: 'Can housing be made to our shed dimensions?',
        a: 'The systems are modular and sized to suit the building. Send the shed dimensions and the intended layout with your enquiry and we will quote the configuration rather than a fixed kit.',
      },
      {
        q: 'Do you supply dealers and distributors?',
        a: 'Yes. Most of this range ships to agricultural dealers and distributors, in mixed containers with the other product lines where that suits the order.',
      },
    ],
  },

  'wood-connectors': {
    intro:
      'A timber structure is only as strong as the steel that joins it and the anchor that keeps it out of the ground. Post supports, ground anchors, angle brackets and joist hangers do unglamorous work: they transfer load between members, and they keep end grain away from soil and standing water, which is what rots a post from the bottom up. KEAA International manufactures the full range of structural timber connectors, post supports and ground anchors for decking, pergolas, fencing, carports and joinery.',
    sections: [
      {
        heading: 'What the range covers',
        body:
          'Post supports in both bolt down and drive in patterns, adjustable post supports where the height needs setting on site, pole anchors and ground plates, indoor timber connectors such as angle brackets and hangers, post caps, and the associated fixings. The subcategories on this page are the live range and each opens onto the individual sizes.',
      },
      {
        heading: 'Materials and finish',
        body:
          'Structural grade steel, precision formed so the timber seats square rather than being forced into a distorted bracket. Hot dip galvanizing to DIN EN 1461 for anything used outdoors or in ground contact, applied in our own plants. Indoor connectors are available with the finish the application needs.',
      },
      {
        heading: 'Where it is used',
        body:
          'Decking and garden structures, pergolas and carports, fencing and gate posts, agricultural and equestrian timber work, and the timber frame and joinery trade. The buyers are typically DIY and garden retailers, builders merchants, fencing contractors and timber frame manufacturers, who need a consistent range in volume with predictable dimensions.',
      },
      {
        heading: 'Why buy it from the manufacturer',
        body:
          'Retail ranges live and die on consistency: a bracket that varies by a few millimetres between batches causes returns. Forming, welding and galvanizing all happen in our own plant under an ISO 9001:2015 quality system certified by TÜV Rheinland, which is what makes a repeat order match the first one. Exporting since 2003 to buyers in more than forty countries.',
      },
    ],
    faqs: [
      {
        q: 'What is the difference between a bolt down and a drive in post support?',
        a: 'A bolt down support fixes to an existing concrete or masonry base. A drive in support is driven directly into firm ground, which avoids digging and concreting. Which one suits depends on the ground and on whether a slab already exists.',
      },
      {
        q: 'Why does a post support keep the timber off the ground?',
        a: 'Because end grain in contact with soil and standing water absorbs moisture and rots from the bottom. Holding the post clear of the ground is the single biggest factor in how long it lasts.',
      },
      {
        q: 'Can you supply to a retail specification with our own packaging?',
        a: 'Tell us the range, the volumes and the packaging or labelling requirement with your enquiry and we will quote against it.',
      },
    ],
  },
};

/** The pillar block for a category slug, or undefined when none is written yet. */
export const getCategoryPillar = (slug) => categoryPillars[slug];
