/**
 * The nine keyword landing pages.
 *
 * WHY THEY EXIST SEPARATELY FROM THE CATALOGUE
 * -------------------------------------------
 * A catalogue page answers "show me the parts". A landing page answers "what is this system,
 * which one do I need, and who makes it". Those are different searches by different people at
 * different stages, and one page cannot serve both without getting worse at each. The
 * catalogue subcategory pages carry the range copy; these carry the buying decision, and each
 * links into the other.
 *
 * They also occupy the URLs buyers actually type. /scaffolding and /formwork are what someone
 * guesses at, and both returned a hard 404 before these existed.
 *
 * WHERE THE FACTS COME FROM
 * -------------------------
 * The catalogue, src/data/company.js and src/data/subcategoryPillars.js. Every standard named
 * is one the product data cites. Every product linked is a real catalogue id. Sentences
 * carrying [VERIFY] are ones the owner must confirm or delete before publication.
 *
 * Deliberately absent: load tables, safe working loads, lead times, prices and Incoterms.
 * They vary per item and per order.
 *
 * SHAPE
 * -----
 *   path        the URL, also the key used by the route
 *   keyword     the primary phrase, used as the anchor text when a product page links here
 *   parent      the landing page above this one, for breadcrumbs, or null
 *   title       the exact <title>, already carrying the brand, so appendSiteName is false
 *   description the meta description, at most 160 characters
 *   h1          the single visible H1
 *   intro       the opening paragraph
 *   sections    [{ heading, body }] rendered as H2 + paragraph
 *   specs       [{ label, value }] rendered as the specification table
 *   standards   [{ code, covers }] rendered as a definition list
 *   applications string[] rendered as a list
 *   faqs        [{ q, a }] rendered as an accordion AND as FAQPage structured data
 *   ranges      [{ label, to }] links into the catalogue
 *   products    catalogue ids, rendered as product links
 */

export const landingPages = {
  '/scaffolding': {
    keyword: 'scaffolding',
    path: '/scaffolding',
    parent: null,
    title: 'Scaffolding Manufacturer & Exporter India | KEAA International',
    description:
      'Ringlock, Cuplock, HK and frame scaffolding manufactured in Ludhiana, India. Hot dip galvanized, exported to 42+ countries. Request a quote.',
    h1: 'Scaffolding Manufacturer and Exporter in India',
    intro:
      'KEAA International manufactures scaffolding systems in Ludhiana, India and exports them to more than 42 countries. The range covers the four system families a contractor actually chooses between: Ringlock, where a rosette accepts connections at eight angles and suits irregular geometry; Cuplock, where one hammer blow locks four ledgers and suits regular elevations; HK, a frame based system with a lower part count; and access frames in European and American patterns for straightforward facade work. Everything is made in our own plants, from laser cutting and robotic welding through to hot dip galvanizing, which is what lets a specification hold across a full container and repeat on the next order.',
    sections: [
      {
        heading: 'Which scaffolding system should you specify?',
        body:
          'The choice is usually decided by the shape of the structure rather than by preference. Ringlock is specified where the facade curves or the structure is irregular, because the rosette accepts ledgers and braces at eight positions without a loose fitting. Cuplock is faster on rectangular elevations, because the top cup locks up to four ledgers in a single action and there is nothing to drop. HK reduces the number of components in a lift by using pre-welded frames with single tube transoms. Euro and American access frames are the simplest and fastest option where the elevation is straight and the loading is modest. Many contractors own two systems and select per job; the one thing that does not work is mixing systems within a single scaffold, because the connections are not interchangeable.',
      },
      {
        heading: 'Manufacturing and quality',
        body:
          'Laser cutting, forming, robotic welding, hot dip galvanizing, powder coating and electroplating are all carried out in our own facilities rather than subcontracted, which is the reason coating thickness and node geometry stay consistent across a large order. Welding is performed by welders certified to EN 1090-2 and EN 3834-2, accredited by SLV Germany. Props and couplers carry Ü-mark conformity assessed by Sigma Karlsruhe. Quality, environmental and occupational health management are certified to ISO 9001:2015, ISO 14001:2015 and ISO 45001:2018 by TÜV Rheinland.',
      },
      {
        heading: 'Buying for a rental fleet',
        body:
          'A rental fleet buys interchangeability more than it buys steel. Components struck from one job and stored have to fit the next one, and stock bought three years apart has to assemble together. That is a factory property: rosette position, cup weld and frame squareness are set by tooling, not by the erector. Send a sample or the dimensions of your existing stock with your enquiry if you are extending an established fleet and we will match it rather than assume it.',
      },
    ],
    specs: [
      { label: 'Systems manufactured', value: 'Ringlock, Cuplock, HK, Euro frame, American frame' },
      { label: 'Steel specification', value: 'EN 10025 and EN 10219, grades S235 JR, S275 JR, S355 JR' },
      { label: 'Corrosion protection', value: 'Hot dip galvanized to DIN EN 1461, in our own plants' },
      { label: 'Other finishes', value: 'Powder coating, electroplating, paint' },
      { label: 'Welding', value: 'Welders certified to EN 1090-2 and EN 3834-2, SLV Germany' },
      { label: 'Manufacturing location', value: 'Ludhiana, Punjab, India' },
      { label: 'Export markets', value: '42+ countries' },
    ],
    standards: [
      { code: 'EN 10025 / EN 10219', covers: 'Structural steels and cold formed welded hollow sections, the material the systems are built from.' },
      { code: 'DIN EN 1461', covers: 'Hot dip galvanized coatings on fabricated iron and steel articles.' },
      { code: 'EN 74-1', covers: 'Couplers, spigot pins and baseplates for use in falsework and scaffolds.' },
      { code: 'EN 1065', covers: 'Adjustable telescopic steel props, their classes and testing.' },
      { code: 'EN 1090-2 / EN 3834-2', covers: 'Execution of steel structures and quality requirements for fusion welding.' },
    ],
    applications: [
      'Building facade access, new build and refurbishment',
      'Industrial maintenance and plant shutdowns',
      'Petrochemical, power and process plant',
      'Bridge and civil works falsework',
      'Load bearing shoring towers for transfer slabs',
      'Rental fleets restocking interchangeable components',
    ],
    faqs: [
      {
        q: 'What is the difference between Ringlock and Cuplock scaffolding?',
        a: 'Both are modular systems with fixed node points. Ringlock uses a rosette that accepts connections at eight positions around the standard, which suits curved and irregular structures. Cuplock uses a top and bottom cup that locks four ledgers at right angles in one hammer blow, which is faster on rectangular elevations. They are not interchangeable within a single scaffold.',
      },
      {
        q: 'Do you export scaffolding in container quantities?',
        a: 'Yes. We manufacture in Ludhiana, India and export to more than 42 countries, and quotations are prepared for container volumes as readily as for single lines. Send the system, the components and the quantities with your enquiry.',
      },
      {
        q: 'Is the scaffolding hot dip galvanized?',
        a: 'Yes, to DIN EN 1461, and galvanizing is carried out in our own plants rather than bought in. That is what keeps coating thickness consistent across a container load instead of varying between subcontracted batches.',
      },
      {
        q: 'Can you match components to scaffold stock we already own?',
        a: 'Usually. Send a sample or the dimensions of your existing components with your enquiry. System scaffold geometry is set by factory tooling, so matching it is a manufacturing question we can answer directly rather than a guess.',
      },
    ],
    ranges: [
      { label: 'Ringlock system scaffold', to: '/products/scaffolding-formworks/system-scaffolds-ringlock' },
      { label: 'Cuplock system scaffold', to: '/products/scaffolding-formworks/system-scaffold-cuplock' },
      { label: 'HK system scaffold', to: '/products/scaffolding-formworks/system-scaffolds-hk' },
      { label: 'Euro frame access scaffold', to: '/products/scaffolding-formworks/access-scaffold-euro-frame' },
      { label: 'American frame access scaffold', to: '/products/scaffolding-formworks/access-scaffold-american-frame' },
      { label: 'Guard rails and railing posts', to: '/products/scaffolding-formworks/security-systems-guard-rails-railing-posts' },
    ],
    products: [281, 270, 279, 275, 412, 271],
    children: ['/scaffolding/ringlock-scaffolding', '/scaffolding/cuplock-scaffolding', '/scaffolding/scaffold-couplers'],
  },

  '/scaffolding/ringlock-scaffolding': {
    keyword: 'Ringlock scaffolding',
    path: '/scaffolding/ringlock-scaffolding',
    parent: '/scaffolding',
    title: 'Ringlock Scaffolding System Manufacturer | KEAA',
    description:
      'Ringlock scaffolding standards, ledgers, braces and towers manufactured in India. EN 10025 steel, hot dip galvanized to EN 1461. Request a quote.',
    h1: 'Ringlock Scaffolding System Manufacturer',
    intro:
      'Ringlock solved the problem of angle. A rosette welded to the standard at fixed vertical centres accepts ledgers and braces at eight positions around it, so a scaffold can follow a curved facade or thread through plant steelwork without a single loose fitting. The connection is made by driving a wedge into the rosette, which is repeatable and, importantly for inspection, visibly either home or not. KEAA International manufactures twelve Ringlock components in Ludhiana, India, from steel to EN 10025 and EN 10219, hot dip galvanized to DIN EN 1461 in our own plants. Because the geometry is fixed by the rosette rather than by the erector, components bought years apart still interchange, which is the property rental fleets are actually paying for.',
    sections: [
      {
        heading: 'What a Ringlock scaffold is built from',
        body:
          'The vertical member is the standard, carrying rosettes at fixed centres and landing on a base collar or an adjustable base jack. Ledgers span horizontally between standards and lock into the rosette; diagonal braces triangulate the bay. Lattice girders span openings where a standard cannot be landed. The working platform is made up of steel planks with board brackets and toe boards, and staircase steps carry access between lifts. Wall ties tie the assembly back to the structure. Complete Ringlock towers are catalogued as an assembly for tower applications.',
      },
      {
        heading: 'Why the rosette matters',
        body:
          'Eight connection positions per rosette means the bracing can run where the structure allows rather than where a frame dictates. On a curved elevation, on a tank, or around plant pipework, that is the difference between a scaffold that fits and one that needs dozens of loose couplers to make up the difference. Every loose fitting is a component that can be wrong, and a scaffold assembled from system connections is faster to inspect for exactly that reason.',
      },
      {
        heading: 'Manufacturing',
        body:
          'Rosette position and wedge fit are the two properties that make a Ringlock scaffold safe and interchangeable, and both are set by factory tooling. Laser cutting, robotic welding and galvanizing are all under our own roof. Welding is carried out by welders certified to EN 1090-2 and EN 3834-2, accredited by SLV Germany, and management systems are certified to ISO 9001:2015, ISO 14001:2015 and ISO 45001:2018 by TÜV Rheinland.',
      },
    ],
    specs: [
      { label: 'Components manufactured', value: 'Standards, ledgers, diagonal braces, base collars, lattice girders, steel planks, board brackets, toe boards, staircase steps, wall ties, towers' },
      { label: 'Steel specification', value: 'EN 10025 and EN 10219' },
      { label: 'Corrosion protection', value: 'Hot dip galvanized to DIN EN 1461' },
      { label: 'Connection', value: 'Rosette with wedge, eight positions per node' },
      { label: 'Welding', value: 'Welders certified to EN 1090-2 and EN 3834-2, SLV Germany' },
      { label: 'Manufacturing location', value: 'Ludhiana, Punjab, India' },
    ],
    standards: [
      { code: 'EN 10025 / EN 10219', covers: 'The structural steel and hollow sections the components are made from.' },
      { code: 'DIN EN 1461', covers: 'Hot dip galvanized coatings, applied in our own plants.' },
      { code: 'EN 1090-2 / EN 3834-2', covers: 'Execution of steel structures and fusion welding quality, certified through SLV Germany.' },
    ],
    applications: [
      'Curved and irregular building facades',
      'Industrial plant maintenance and shutdowns',
      'Petrochemical and power generation sites',
      'Load bearing towers and support structures',
      'Rental fleets requiring long term interchangeability',
    ],
    faqs: [
      {
        q: 'How many connections does a Ringlock rosette take?',
        a: 'Eight positions around the standard, which is what lets bracing and ledgers run at angles a rectangular system cannot reach. That is the main reason Ringlock is specified on curved and irregular structures.',
      },
      {
        q: 'Is Ringlock compatible with Cuplock or HK components?',
        a: 'No. Each system has its own connection geometry and they are not interchangeable at the node. A single scaffold is built from one system, though many contractors own more than one.',
      },
      {
        q: 'What steel are Ringlock standards made from?',
        a: 'EN 10025 and EN 10219, the European structural steel and cold formed hollow section specifications, as recorded against the products in our catalogue.',
      },
    ],
    ranges: [{ label: 'Ringlock system scaffold range', to: '/products/scaffolding-formworks/system-scaffolds-ringlock' }],
    products: [281, 270, 271, 272, 273, 16],
  },

  '/scaffolding/cuplock-scaffolding': {
    keyword: 'Cuplock scaffolding',
    path: '/scaffolding/cuplock-scaffolding',
    parent: '/scaffolding',
    title: 'Cuplock Scaffolding System Manufacturer | KEAA',
    description:
      'Cuplock standards, ledgers, truss ledgers and braces manufactured in India. EN 10025 steel, hot dip galvanized to EN 1461. Request a quote.',
    h1: 'Cuplock Scaffolding System Manufacturer',
    intro:
      'Cuplock makes its connection with two cups rather than a rosette. A bottom cup is welded to the standard, and a top cup slides down over up to four ledger blades and locks them all with a single hammer blow. On a rectangular elevation that is the fastest modular connection in use, because one action secures four members and there is nothing loose to hold, drop or lose. KEAA International manufactures nine Cuplock components in Ludhiana, India, from steel to EN 10025 and EN 10219, hot dip galvanized to DIN EN 1461 in our own plants. The system is specified where erection speed matters and the geometry is regular, which describes most building facades and most birdcage support work.',
    sections: [
      {
        heading: 'What a Cuplock scaffold is built from',
        body:
          'Standards carry the bottom and top cups at fixed centres. Ledgers with ledger blades lock into the cups and span horizontally. Truss ledgers span openings where a standard cannot be landed, for instance over a doorway or a vehicle access. Diagonal braces triangulate the bay. Side brackets widen the working platform and Cuplock ladder brackets carry access between lifts.',
      },
      {
        heading: 'Why the cup weld is the component that matters',
        body:
          'In a Cuplock scaffold the load path runs through the cups, so the weld that fixes the bottom cup to the standard is the part carrying the connection. It is not a materials question, it is a welding quality question, and it is not visible once galvanized. Our welding is carried out by welders certified to EN 1090-2 and EN 3834-2, accredited by SLV Germany, and carried out in house rather than subcontracted.',
      },
      {
        heading: 'Where Cuplock beats Ringlock, and where it does not',
        body:
          'On a straight elevation Cuplock is faster to erect and strike, because one blow does the work of four connections and the part count per bay is lower. Where the structure curves or the bracing has to run at an angle the cups cannot reach, Ringlock is the better fit. Neither is universally correct, which is why plenty of contractors hold both and choose per job.',
      },
    ],
    specs: [
      { label: 'Components manufactured', value: 'Standards, top and bottom cups, ledgers, ledger blades, truss ledgers, diagonal braces, side brackets, ladder brackets' },
      { label: 'Steel specification', value: 'EN 10025 and EN 10219' },
      { label: 'Corrosion protection', value: 'Hot dip galvanized to DIN EN 1461' },
      { label: 'Connection', value: 'Top and bottom cup, up to four ledgers per node' },
      { label: 'Welding', value: 'Welders certified to EN 1090-2 and EN 3834-2, SLV Germany' },
      { label: 'Manufacturing location', value: 'Ludhiana, Punjab, India' },
    ],
    standards: [
      { code: 'EN 10025 / EN 10219', covers: 'The structural steel and hollow sections the components are made from.' },
      { code: 'DIN EN 1461', covers: 'Hot dip galvanized coatings, applied in our own plants.' },
      { code: 'EN 1090-2 / EN 3834-2', covers: 'Execution of steel structures and fusion welding quality, certified through SLV Germany.' },
    ],
    applications: [
      'Building facades and refurbishment on regular elevations',
      'Birdcage scaffolds and internal support work',
      'General construction access',
      'Support and falsework where speed over a repeated area decides',
    ],
    faqs: [
      {
        q: 'Why is Cuplock faster to erect than tube and fitting?',
        a: 'One hammer blow on the top cup locks up to four ledgers into the node at once, and there are no loose couplers to hold or drop. Across every bay and every lift, that difference compounds.',
      },
      {
        q: 'What is a truss ledger used for?',
        a: 'Spanning an opening where a standard cannot be landed, such as over a doorway or vehicle access. It carries the load across to the standards on either side.',
      },
      {
        q: 'Can Cuplock components be mixed with Ringlock?',
        a: 'No. The connections are different and not interchangeable. A scaffold is built from one system.',
      },
    ],
    ranges: [{ label: 'Cuplock system scaffold range', to: '/products/scaffolding-formworks/system-scaffold-cuplock' }],
    products: [275, 276, 277, 278, 279, 26],
  },

  '/scaffolding/scaffold-couplers': {
    keyword: 'scaffold couplers',
    path: '/scaffolding/scaffold-couplers',
    parent: '/scaffolding',
    title: 'Scaffold Tube Couplers EN 74 Manufacturer | KEAA',
    description:
      'Right angle, swivel, girder and half couplers to EN 74-1 and BS 1139, hot dip galvanized to EN 1461. Made in India, exported worldwide.',
    h1: 'Scaffold Tube Coupler Manufacturer, EN 74 and BS 1139',
    intro:
      'A coupler is the smallest component in a scaffold and the one that decides whether it stands. It has to grip a tube hard enough to develop the designed slip resistance, hold that grip through repeated assembly and striking, and keep doing it after years outdoors. EN 74-1 is the European specification that governs exactly this, and it is cited against seventeen of the eighteen European pattern fittings KEAA International manufactures. BS 1139 covers the British pattern, and products in that range cite it. We make both, because a working site and an export customer rarely standardise on one pattern, and manufacturing runs through our own plants in Ludhiana, India including hot dip galvanizing to DIN EN 1461.',
    sections: [
      {
        heading: 'The coupler types and what each is for',
        body:
          'A right angle coupler fixes two tubes at ninety degrees and is load bearing, which is why it is the one used to connect ledgers to standards. A swivel coupler allows any angle and is used for bracing, where the geometry is not square. A girder coupler fixes scaffold tube to structural steelwork, which is how a scaffold ties into a building frame. A half coupler is the adapter between a scaffold tube and something that is not a tube, and the range is correspondingly wide: assembled and unassembled, with brace lock, with welded rod, L rod, tube, V-strip, welded strip, and L strip in long and short.',
      },
      {
        heading: 'Why forging and thread quality decide performance',
        body:
          'Coupler performance is set by the quality of the forging or casting and by the thread that closes it, and neither is visible on inspection once the part is galvanized. That is why external assessment matters here more than on almost any other component. Props and couplers manufactured by KEAA carry Ü-mark conformity assessed by Sigma Karlsruhe, and welding is certified to EN 1090-2 and EN 3834-2 through SLV Germany. Management systems are certified to ISO 9001:2015, ISO 14001:2015 and ISO 45001:2018 by TÜV Rheinland.',
      },
      {
        heading: 'Matching couplers to your tube',
        body:
          'A coupler grips a specific tube diameter and wall, so its performance is a function of what it is clamping. We manufacture galvanized scaffold tube alongside the fittings, which means the fit can be specified rather than assumed. If you are buying couplers for tube you already hold, send the tube dimensions with your enquiry.',
      },
    ],
    specs: [
      { label: 'European pattern', value: 'German right angle, German swivel, girder, and half couplers in ten welded variants' },
      { label: 'British and American pattern', value: 'Right angle, swivel, girder, half and fence couplers' },
      { label: 'Fence couplers', value: 'Allen key bolt M12 and carriage bolt M12' },
      { label: 'Nuts', value: 'SW19 and SW22' },
      { label: 'Tube', value: 'Galvanized scaffold tube, including 33.7 x 2.5 mm' },
      { label: 'Corrosion protection', value: 'Hot dip galvanized to DIN EN 1461' },
      { label: 'Conformity', value: 'Ü-mark assessed by Sigma Karlsruhe' },
    ],
    standards: [
      { code: 'EN 74-1', covers: 'Couplers, spigot pins and baseplates for use in falsework and scaffolds. Cited against the European pattern fittings.' },
      { code: 'BS 1139', covers: 'Metal scaffolding and its fittings. Cited against the British pattern fittings.' },
      { code: 'DIN EN 1461', covers: 'Hot dip galvanized coatings, applied in our own plants.' },
    ],
    applications: [
      'Tube and fitting scaffolds',
      'Tying system scaffolds back to structure',
      'Connecting scaffold to structural steelwork',
      'Temporary fencing, using fence couplers',
      'Any non standard connection a system scaffold cannot make alone',
    ],
    faqs: [
      {
        q: 'What does EN 74 cover?',
        a: 'EN 74-1 is the European specification for couplers, spigot pins and baseplates used in falsework and scaffolds. It sets the performance a coupler must meet, including slip resistance and the loads it carries. It is cited against the products in our European pattern range.',
      },
      {
        q: 'What is the difference between EN 74 and BS 1139 couplers?',
        a: 'They are different standards with different dimensions and forms, European and British respectively. They are not generally interchangeable on the same scaffold, so specify the pattern your existing fleet uses. We manufacture both.',
      },
      {
        q: 'Why are there so many half coupler variants?',
        a: 'Because a half coupler adapts a scaffold tube to something that is not a tube: a brace, a rod, a strip, a lock. Each welded attachment suits a different connection, which is why the range covers welded rod, L rod, tube, V-strip and strip versions rather than one generic part.',
      },
      {
        q: 'Do you supply scaffold tube as well as couplers?',
        a: 'Yes. Galvanized tube is catalogued alongside the fittings, so the coupler fit is known rather than assumed. Send the tube dimensions with your enquiry if you are matching stock you already hold.',
      },
    ],
    ranges: [
      { label: 'European tube fittings', to: '/products/scaffolding-formworks/scaffold-tube-fitting-european' },
      { label: 'British and American tube fittings', to: '/products/scaffolding-formworks/scaffold-tube-fitting-british-american' },
    ],
    products: [180, 181, 403, 194, 182, 183],
  },

  '/formwork': {
    keyword: 'formwork',
    path: '/formwork',
    parent: null,
    title: 'Formwork Accessories & Steel Props Manufacturer | KEAA',
    description:
      'Adjustable steel props to EN 1065, fork heads, tripods, wall formwork clamps and tie components. Made in Ludhiana, India, exported worldwide.',
    h1: 'Formwork Accessories and Steel Props Manufacturer',
    intro:
      'Formwork is the mould that holds wet concrete until it can hold itself, and every component in it is carrying load at the moment it matters most. KEAA International manufactures the full accessory range in Ludhiana, India: adjustable steel props declared to EN 1065, the fork heads and tripods that work with them, shoring tower frames for loads a prop cannot take, and the clamps, wing nuts and tie components that hold a wall form together against concrete pressure. Manufacturing runs through our own plants, including forging, casting, welding and hot dip galvanizing to DIN EN 1461, and props carry Ü-mark conformity assessed by Sigma Karlsruhe.',
    sections: [
      {
        heading: 'Slab formwork: props, fork heads and tripods',
        body:
          'A slab is carried on props, and the prop is where the load reaches the floor below. EN 1065 defines the classes of adjustable telescopic steel prop and the testing each class must pass; our range includes props to Class BD and Class B, light duty props at 10 kN, props load tested for 20 kN, reinforced props and heavy duty special sizes. A fork head sits at the top of the prop and cradles the beam so it cannot roll under load, in slotted, hole, rod and U strip patterns. A tripod holds the prop upright while it is positioned, before the beams and decking tie it in, and is graded light, medium and heavy duty so a crew is not carrying more weight up a building than the job needs.',
      },
      {
        heading: 'Wall formwork: clamps, ties and anchors',
        body:
          'Wet concrete pushes outwards on a wall form with considerable force, and the tie system is what resists it. The range covers three wing anchor nuts in cast and forged versions at 70 mm and 100 mm, swivel wing nuts with combination plates, Tekko clips, hexagonal nuts and nuts with locking pin, panel wedge clamps, beam clamps and vices, anchor feet including the DW 15 pattern, single anchors and the steel cones that form the tie hole so the rod can be recovered after the pour. Push pull props brace the form into position and hold it plumb.',
      },
      {
        heading: 'Where shoring towers take over from props',
        body:
          'Above a certain load or height, a single telescopic member is the wrong answer and the load belongs in a designed braced structure. Shoring tower frames in two, three and five step heights, tied with cross braces and V braces, carry transfer slabs, bridge decks and heavy industrial floors. Base jacks land the tower level on ground that is not, and fork heads carry the beams above it, so the whole assembly comes from one range.',
      },
    ],
    specs: [
      { label: 'Props', value: 'EN 1065 Class BD, Class B, light duty 10 kN, load tested 20 kN, reinforced, heavy duty special sizes, push pull' },
      { label: 'Fork heads', value: 'Slotted, hole, rod, rod with holes in plate, U strip, beam head, light duty, fork head and U head jacks' },
      { label: 'Tripods', value: 'Fixed, universal, heavy, medium and light duty, including 25 mm and 27 mm' },
      { label: 'Wall formwork', value: 'H panels, beam clamps and vices, wedge clamps, anchor feet DW 15, single anchors, steel cones, consoles' },
      { label: 'Tie components', value: 'Three wing anchor nuts 70 mm and 100 mm, cast and forged, swivel wing nuts, Tekko clips' },
      { label: 'Corrosion protection', value: 'Hot dip galvanized to DIN EN 1461' },
      { label: 'Conformity', value: 'Props carry Ü-mark assessed by Sigma Karlsruhe' },
    ],
    standards: [
      { code: 'EN 1065', covers: 'Adjustable telescopic steel props, their classes and the testing each class must pass.' },
      { code: 'DIN EN 50961', covers: 'Cited against the formwork accessory range in the product data.' },
      { code: 'DIN EN 1461', covers: 'Hot dip galvanized coatings, applied in our own plants.' },
      { code: 'EN 1090-2 / EN 3834-2', covers: 'Execution of steel structures and fusion welding quality, certified through SLV Germany.' },
    ],
    applications: [
      'Slab and beam casting on concrete frames',
      'Wall and column formwork',
      'Back propping while concrete gains strength',
      'Bridge decks, transfer slabs and heavy industrial floors',
      'Rental fleets supplying formwork contractors',
    ],
    faqs: [
      {
        q: 'What does EN 1065 Class BD mean?',
        a: 'EN 1065 classifies adjustable telescopic steel props by load capacity and extension, and sets the testing each class must pass. Class BD and Class B are two of those classifications, recorded per product in our catalogue. Ask for the class alongside the length range when you request a quotation, because the two together determine the prop you need.',
      },
      {
        q: 'What is a push pull prop for?',
        a: 'Bracing wall formwork into position and holding it plumb during the pour. It works in both compression and tension, which is where the name comes from, and it does not carry vertical slab load.',
      },
      {
        q: 'When do I need a shoring tower instead of props?',
        a: 'When the load or the height exceeds what a single telescopic member should carry. A tower puts the load into a designed braced structure instead. Frames are made in two, three and five step heights and land on adjustable base jacks.',
      },
      {
        q: 'Should I specify cast or forged tie components?',
        a: 'Forging gives a denser grain structure and is generally specified for the more demanding duty; casting suits complex geometry. We manufacture both across the wing nut, anchor nut and Tekko clip ranges, so the choice can follow your specification rather than availability.',
      },
    ],
    ranges: [
      { label: 'Adjustable steel props', to: '/products/scaffolding-formworks/slab-formwork-system-props' },
      { label: 'Fork heads', to: '/products/scaffolding-formworks/slab-formwork-system-fork-heads' },
      { label: 'Tripods', to: '/products/scaffolding-formworks/system-slab-formwork-tripods' },
      { label: 'Formwork accessories', to: '/products/scaffolding-formworks/formwork-accessories' },
      { label: 'Wall formwork clamps and panels', to: '/products/scaffolding-formworks/wall-formwork-systems-clamps-panels' },
      { label: 'Shoring towers', to: '/products/scaffolding-formworks/load-bearing-system-shoring-tower' },
    ],
    products: [386, 35, 136, 135, 173, 171],
    children: ['/formwork/adjustable-steel-props'],
  },
  '/formwork/adjustable-steel-props': {
    keyword: 'adjustable steel props',
    path: '/formwork/adjustable-steel-props',
    parent: '/formwork',
    title: 'Adjustable Steel Props EN 1065 Manufacturer | KEAA',
    description:
      'Adjustable telescopic steel props to EN 1065 Class BD and Class B, plus light duty, reinforced and push pull props. Made in India, exported worldwide.',
    h1: 'Adjustable Steel Props Manufacturer, EN 1065',
    intro:
      'An adjustable steel prop carries wet concrete until the slab can carry itself. That makes it one of the few temporary works components where failure is immediate rather than gradual, and it is why the prop is the formwork item most tightly governed by standard. EN 1065 defines the classes of adjustable telescopic steel prop and the testing each class must pass, and it is cited against products in our range. KEAA International manufactures thirteen props and prop accessories in Ludhiana, India, hot dip galvanized to DIN EN 1461 in our own plants, and props manufactured here carry Ü-mark conformity assessed by Sigma Karlsruhe. The range is deliberately graded, from light duty props at 10 kN through to heavy duty special sizes, because specifying a prop heavier than the job needs is weight a crew carries up a building for nothing.',
    sections: [
      {
        heading: 'Choosing a prop: class, length and load',
        body:
          'Three things decide the prop. The class, under EN 1065, which sets its load and extension characteristics. The closed and extended lengths, which have to cover the slab height with the adjustment in a sensible part of its range rather than at the very end of the thread. And the load, which follows from the slab thickness and the prop spacing in the falsework design. Our range covers props declared to Class BD and standard props to Class B, light duty props rated 10 kN, props load tested for 20 kN, reinforced props, and heavy duty props in special sizes for longer spans. Send the class, the length range and the load with your enquiry and we will quote against all three rather than guess at one.',
      },
      {
        heading: 'Push pull props are a different tool',
        body:
          'A push pull prop is not a slab prop. It braces wall formwork into position and holds it plumb while concrete is poured, working in both compression and tension, which is where its name comes from. It carries no vertical slab load. It is catalogued in the same range because the same crews buy both, but the two are specified for entirely different jobs and are not substitutes.',
      },
      {
        heading: 'What the prop needs around it',
        body:
          'A prop alone does not make a slab formwork system. A fork head at the top cradles the beam so it cannot roll under load, in slotted, hole, rod or U strip patterns to suit the beam. A tripod holds the prop upright while it is being positioned, before the beams and decking tie it in, and is the single component that most reduces the risk during erection. Adjustable base jacks land the assembly on ground that is not level. All three are manufactured in the same plants, so the thread and tube fits are specified rather than discovered on site.',
      },
    ],
    specs: [
      { label: 'EN 1065 classes', value: 'Class BD and Class B, recorded per product' },
      { label: 'Light duty', value: 'Props rated 10 kN' },
      { label: 'Load tested', value: 'Props load tested for 20 kN' },
      { label: 'Other patterns', value: 'Reinforced props, heavy duty special sizes, push pull props' },
      { label: 'Corrosion protection', value: 'Hot dip galvanized to DIN EN 1461' },
      { label: 'Conformity', value: 'Ü-mark assessed by Sigma Karlsruhe' },
      { label: 'Manufacturing location', value: 'Ludhiana, Punjab, India' },
    ],
    standards: [
      { code: 'EN 1065', covers: 'Adjustable telescopic steel props: classes, performance and the testing each class must pass.' },
      { code: 'DIN EN 1461', covers: 'Hot dip galvanized coatings, applied in our own plants.' },
      { code: 'EN 1090-2 / EN 3834-2', covers: 'Execution of steel structures and fusion welding quality, certified through SLV Germany.' },
    ],
    applications: [
      'Slab and beam casting on concrete frames',
      'Back propping to lower floors while concrete gains strength',
      'Bracing and plumbing wall formwork, using push pull props',
      'Rental fleets supplying concrete frame contractors',
    ],
    faqs: [
      {
        q: 'What is the difference between EN 1065 Class B and Class BD?',
        a: 'They are different classifications under EN 1065, which groups adjustable telescopic steel props by their load capacity and extension characteristics and sets the testing each must pass. The class is recorded per product in our catalogue. Ask for it alongside the length range when you request a quotation.',
      },
      {
        q: 'Can you supply props in non standard lengths?',
        a: 'Yes. Heavy duty props in special sizes are catalogued for exactly that. Send the closed and extended lengths and the load you need and we will quote against them.',
      },
      {
        q: 'Do props come with fork heads and tripods?',
        a: 'They are catalogued separately, because the fork head pattern depends on the beam you are carrying and the tripod duty depends on the prop. All three are made in the same plants, so the fits are specified rather than assumed. Ask for them together and we will quote a matched set.',
      },
    ],
    ranges: [
      { label: 'Adjustable steel props', to: '/products/scaffolding-formworks/slab-formwork-system-props' },
      { label: 'Fork heads', to: '/products/scaffolding-formworks/slab-formwork-system-fork-heads' },
      { label: 'Tripods', to: '/products/scaffolding-formworks/system-slab-formwork-tripods' },
    ],
    products: [386, 35, 134, 135, 136, 392],
  },

  '/garden-hardware': {
    keyword: 'garden hardware',
    path: '/garden-hardware',
    parent: null,
    title: 'Garden Hardware & Post Support Manufacturer | KEAA',
    description:
      'Post supports, ground anchors, post caps and wood connectors manufactured in India from EN 10025-2 steel. Exported to 42+ countries. Request a quote.',
    h1: 'Garden Hardware and Post Support Manufacturer',
    intro:
      'Almost everything that fails in outdoor timber work fails at the connection, not in the timber. A post set directly into the ground rots from the buried end; an uncapped post rots from the cut top; a joint without a connector opens under load. KEAA International manufactures the steel hardware that addresses all three, from our own plants in Ludhiana, India: post supports in twelve patterns and adjustable versions in fourteen more, pole anchors and ground plates, post caps, and indoor wood connectors for timber frames. The post support, anchor and miscellaneous ranges are made from structural steel to DIN EN 10025-2 and the indoor connectors from zinc coated sheet to DIN EN 10346, both as recorded in the product data.',
    sections: [
      {
        heading: 'Post supports: fixed and adjustable',
        body:
          'A post support holds timber clear of the ground on a steel base that takes the moisture instead, which is the single change that takes a fence post from five years to twenty. Fixed patterns cover H, I, L, T, U and Y types, T blade supports for driving into soft ground, boltdown supports for fixing to existing concrete or paving, and base plate versions where load has to be spread. Adjustable patterns add a threaded section so post height can be corrected after the support is set, which is what you want on ground that is not level, with long nut versions where more adjustment is needed.',
      },
      {
        heading: 'Anchors and ground plates: matching the fixing to the ground',
        body:
          'The choice between anchor types is a choice about what you are fixing into. A spiral anchor screws into soft soil and holds on the thread, so a post can be set without concrete and taken out again later. A bolt type anchor fixes to something already solid. A wedge grip clamps the post rather than bolting through it. A ground plate spreads load across a surface instead of into it. All four are made for round and square posts, with rotatable versions where the post has to be oriented after setting.',
      },
      {
        heading: 'Finishing and connecting timber',
        body:
          'Post caps in ball and pyramid profiles shed water off the cut top of a post, which is end grain and draws water like a wick. A version with a stainless steel nail is made for visible work where a corroding fastening would stain the timber. For internal timber frames, the indoor wood connector range covers joist hangers in three types, angle connectors plain, ribbed and adjustable, perforated plates and strips, purlin anchors and universal connectors, in zinc coated sheet to EN 10346.',
      },
    ],
    specs: [
      { label: 'Post supports', value: '12 fixed patterns: H, I, L, T, U, Y, T blade, boltdown, base plate versions' },
      { label: 'Adjustable post supports', value: '14 patterns including long nut and base plate versions' },
      { label: 'Pole anchors and ground plates', value: '12 patterns: bolt type, wedge grip, spiral, rotatable, for round and square posts' },
      { label: 'Post caps', value: 'Ball, pyramid, and a version with stainless steel nail' },
      { label: 'Indoor wood connectors', value: '14 patterns: joist hangers, angle connectors, perforated plates and strips, purlin anchors' },
      { label: 'Steel specification', value: 'DIN EN 10025-2 structural steel; DIN EN 10346 zinc coated sheet for indoor connectors' },
      { label: 'Manufacturing location', value: 'Ludhiana, Punjab, India' },
    ],
    standards: [
      { code: 'DIN EN 10025-2', covers: 'Hot rolled structural steels, the material for the post support, anchor and ground plate ranges.' },
      { code: 'DIN EN 10346', covers: 'Continuously hot dip zinc coated steel sheet, the material for the indoor wood connectors.' },
      { code: 'EN 1090-2 / EN 3834-2', covers: 'Execution of steel structures and fusion welding quality, certified through SLV Germany.' },
    ],
    applications: [
      'Fencing and post and rail work',
      'Decking substructures and pergolas',
      'Carports and garden buildings',
      'Timber floor and roof frames, using the indoor connectors',
      'Builders merchants, timber distributors and DIY retail supply',
    ],
    faqs: [
      {
        q: 'Which post support should I use for soft ground?',
        a: 'A driven pattern, typically a T blade or a driven H, I or U type, hammered in without excavation. For an existing concrete or paved surface, a boltdown support is the right answer instead. Send the ground type and post size with your enquiry.',
      },
      {
        q: 'What is the difference between fixed and adjustable post supports?',
        a: 'A fixed support holds the post at one height. An adjustable support has a threaded section so height can be corrected after the support is set, which matters on uneven ground. Long nut versions give more adjustment again. Both ranges share tolerances, so they can be mixed across one project.',
      },
      {
        q: 'Are the indoor wood connectors suitable for outdoor use?',
        a: 'No. They are zinc coated sheet to EN 10346 and are made for dry internal environments. For outdoor timber, the post support, pole anchor and ground plate ranges are what to specify.',
      },
      {
        q: 'Why does a timber post need a cap?',
        a: 'Because the cut top of a post is end grain and draws water down into the timber. Capping is the cheapest single thing that extends post life, and it matters as much as what protects the buried end.',
      },
    ],
    ranges: [
      { label: 'Post supports', to: '/products/wood-connectors/post-supports' },
      { label: 'Adjustable post supports', to: '/products/wood-connectors/adjustable-post-supports' },
      { label: 'Pole anchors and ground plates', to: '/products/wood-connectors/pole-anchors-ground-plates' },
      { label: 'Post caps', to: '/products/wood-connectors/post-caps' },
      { label: 'Indoor wood connectors', to: '/products/wood-connectors/indoor-wood-connectors' },
    ],
    products: [332, 330, 346, 352, 359, 328],
    children: ['/garden-hardware/ground-anchors'],
  },

  '/garden-hardware/ground-anchors': {
    keyword: 'ground anchors',
    path: '/garden-hardware/ground-anchors',
    parent: '/garden-hardware',
    title: 'Ground & Spiral Post Anchors Manufacturer | KEAA',
    description:
      'Spiral, bolt type and wedge grip pole anchors and ground plates for round and square posts. EN 10025-2 steel, made in India, exported worldwide.',
    h1: 'Ground Anchor and Spiral Post Anchor Manufacturer',
    intro:
      'A ground anchor is how a post is held without a concrete foundation. That matters more than it sounds: concrete makes a post permanent, slow to install and awkward to remove, and for fencing, signage and light timber structures none of those are wanted. KEAA International manufactures twelve anchor and ground plate patterns from structural steel to DIN EN 10025-2, covering spiral anchors that screw into soft ground, bolt type anchors that fix to something solid, wedge grip patterns that clamp the post rather than bolting through it, and ground plates that spread load across a surface. Round and square post versions are made for each, with rotatable anchors where the post has to be oriented after it is set. Manufacturing is in our own plants in Ludhiana, India.',
    sections: [
      {
        heading: 'Spiral anchors: setting a post without concrete',
        body:
          'A spiral anchor is driven and turned into soft ground, where the thread develops its hold against the surrounding soil. It goes in with hand tools, it goes in quickly, and it can be backed out again if the post has to move, which a concrete foundation cannot. It is the pattern specified for fence lines and garden structures where excavation is impractical or where the installation may not be permanent. We make spiral anchors for both round and square posts.',
      },
      {
        heading: 'Bolt type, wedge grip and ground plates',
        body:
          'A bolt type anchor fixes into existing concrete or hard standing, and is the choice where the surface is already there. A wedge grip holds the post by wedging rather than by a fastening through it, which suits a post you may want to remove and which avoids putting a hole through the timber. Ground plates spread the load across a surface rather than concentrating it into the ground, and are made in bolt type and wedge grip forms for round and square posts. Anchors specifically for fixing into concrete complete the range.',
      },
      {
        heading: 'Matching the anchor to the post',
        body:
          'Every pattern is made for a specific post section, round or square, and the anchor and the post support above it have to share tolerances or the post does not sit true. Our anchors, ground plates and post supports are made in the same plants to the same tolerances, so a project can use whichever fixing the ground calls for without the post fit changing between bays.',
      },
    ],
    specs: [
      { label: 'Spiral anchors', value: 'For round posts and for square posts' },
      { label: 'Bolt type', value: 'Pole anchors and ground plates, round and square post' },
      { label: 'Wedge grip', value: 'Pole anchors and ground plates, round and square post' },
      { label: 'Concrete fixing', value: 'Pole anchors for concrete' },
      { label: 'Rotatable', value: 'Rotatable pole anchors for square posts' },
      { label: 'Steel specification', value: 'DIN EN 10025-2 hot rolled structural steel' },
      { label: 'Manufacturing location', value: 'Ludhiana, Punjab, India' },
    ],
    standards: [
      { code: 'DIN EN 10025-2', covers: 'Hot rolled structural steels, the material recorded against this range.' },
      { code: 'EN 1090-2 / EN 3834-2', covers: 'Execution of steel structures and fusion welding quality, certified through SLV Germany.' },
    ],
    applications: [
      'Fence lines set without concrete foundations',
      'Garden structures, pergolas and screens',
      'Signage and post mounted fittings',
      'Temporary or relocatable timber structures',
    ],
    faqs: [
      {
        q: 'When is a spiral anchor better than concreting a post in?',
        a: 'When you want speed, no excavation, and the option to remove or move the post later. The spiral holds on its thread in soft ground. Concrete is still the answer for heavily loaded or permanent posts.',
      },
      {
        q: 'What is the difference between wedge grip and bolt type?',
        a: 'Wedge grip clamps the post by wedging; bolt type fixes through it. Wedge grip avoids a hole through the timber and makes the post easier to remove. Both are made for round and square posts.',
      },
      {
        q: 'Do ground plates work on any surface?',
        a: 'They spread load across a surface rather than into the ground, so they need a surface capable of taking it: concrete, paving or similar. Send the surface and post section with your enquiry and we will quote the right pattern.',
      },
    ],
    ranges: [
      { label: 'Pole anchors and ground plates', to: '/products/wood-connectors/pole-anchors-ground-plates' },
      { label: 'Post supports', to: '/products/wood-connectors/post-supports' },
    ],
    products: [352, 350, 357, 356, 359, 358],
  },

  '/livestock/cattle-headlocks': {
    keyword: 'cattle headlocks',
    path: '/livestock/cattle-headlocks',
    parent: null,
    title: 'Cattle Headlocks Manufacturer & Exporter | KEAA',
    description:
      'Feed headlocks, heifer safety headlocks, handles and feed fence hardware, hot dip galvanized to DIN EN 1461. Made in India, exported worldwide.',
    h1: 'Cattle Headlock Manufacturer and Exporter',
    intro:
      'A headlock is the point where a feed fence stops being a barrier and becomes a handling system. It has to let an animal put its head through to feed freely, hold it there when the herdsman needs it held, and release it without a struggle, all while being leaned on by several hundred kilogrammes many times a day in an atmosphere of slurry and ammonia. KEAA International manufactures headlocks and the feed fence hardware around them in Ludhiana, India, hot dip galvanized to DIN EN 1461 in our own plants. The range includes giant feed headlocks, heifer safety headlocks, training headlocks and wave headlocks, with handle assemblies in both plate and tube type, alongside the diagonal barriers, clamps and brackets that fix the fence to the building.',
    sections: [
      {
        heading: 'Choosing a headlock for your stock',
        body:
          'Headlock selection follows the animal rather than the building. Giant feed headlocks are sized for mature cattle; heifer safety headlocks are proportioned for younger, smaller animals, where a lock sized for adults presents a genuine risk. Training headlocks are for stock being introduced to a locking fence. The handle assembly is a separate choice again, in plate type or tube type, and it determines how the fence is operated along its length. Send the fence length, the animal type and the number of spaces with your enquiry and we will quote the lock and handle together rather than leaving you to match them.',
      },
      {
        heading: 'The rest of the feed fence',
        body:
          'A headlock run is only part of the installation. Diagonal barriers and self locking barriers cover the sections that do not need locking. Brisket board clamps and plates set the standing position at the feed face. L post clamps, double head clamps and adjustable clamps fix the assembly to the building structure. Calf feed troughs and calf panels extend the same hardware into the rearing area. All of it is made in the same plants from the same range, so the fixings match rather than nearly matching.',
      },
      {
        heading: 'Why the finish decides the service life',
        body:
          'A cattle shed is one of the harshest environments manufactured steel is put into. Ammonia and slurry attack coatings continuously, and the corrosion that matters usually starts inside a hollow section where nobody can see it. Hot dip galvanizing to DIN EN 1461 coats the inside as well as the outside, which is the reason it is specified here rather than paint. We galvanize in our own plants, which keeps coating thickness consistent across a container load. A stainless steel finish is available on selected items where a washdown regime calls for it.',
      },
    ],
    specs: [
      { label: 'Headlock types', value: 'Giant feed, heifer safety, training, wave' },
      { label: 'Handles', value: 'Plate type and tube type handle assemblies' },
      { label: 'Barriers', value: 'Diagonal barriers and self locking barriers' },
      { label: 'Fixings', value: 'Brisket board clamps and plates, L post clamps, double head clamps, adjustable clamps' },
      { label: 'Corrosion protection', value: 'Hot dip galvanized to DIN EN 1461, in our own plants' },
      { label: 'Alternative finish', value: 'Stainless steel on selected items' },
      { label: 'Range size', value: '52 cattle housing products' },
    ],
    standards: [
      { code: 'DIN EN 1461', covers: 'Hot dip galvanized coatings on fabricated iron and steel articles.' },
      { code: 'EN 1090-2 / EN 3834-2', covers: 'Execution of steel structures and fusion welding quality, certified through SLV Germany.' },
    ],
    applications: [
      'Dairy parlour and cubicle housing feed fences',
      'Beef finishing shed feed faces',
      'Heifer and youngstock housing',
      'Calf rearing units, using the calf trough and panel hardware',
      'Livestock housing installers and agricultural building contractors',
    ],
    faqs: [
      {
        q: 'What is the difference between a giant feed headlock and a heifer safety headlock?',
        a: 'They are sized for different animals. Giant feed headlocks suit mature cattle; heifer safety headlocks are proportioned for younger, smaller stock, where a lock sized for adults is a genuine safety risk. Both are manufactured here.',
      },
      {
        q: 'Can headlocks be retrofitted to an existing feed fence?',
        a: 'Often, depending on the existing structure and fixing centres. Send photographs and the fence dimensions with your enquiry, along with the clamps currently in use, and we will tell you what fits rather than guess.',
      },
      {
        q: 'What protects the steel in a cattle shed?',
        a: 'Hot dip galvanizing to DIN EN 1461, applied in our own plants. It coats the inside of hollow sections as well as the outside, which is where corrosion in a shed atmosphere actually starts. Stainless steel is available on selected items.',
      },
      {
        q: 'Do you supply the handles and fixings as well as the locks?',
        a: 'Yes. Plate and tube type handle assemblies, brisket board clamps and plates, L post clamps, double head clamps and adjustable clamps are all catalogued in the same range, so a feed fence can be ordered complete.',
      },
    ],
    ranges: [
      { label: 'Cattle housing range', to: '/products/livestock-housing-solutions/cattle' },
      { label: 'Calf housing', to: '/products/livestock-housing-solutions/calves' },
    ],
    products: [44, 43, 45, 78, 77, 39],
  },
};

/**
 * Which landing page a catalogue subcategory belongs to.
 *
 * Product pages use this to render one line under the specifications table, "Part of our
 * Ringlock scaffolding range", with the landing page's own keyword as the anchor text. That is
 * the link that was missing: landing pages pointed into the catalogue but nothing pointed back,
 * so the pages carrying the phrases the site is trying to rank for had no internal links from
 * the 355 pages most closely related to them.
 *
 * A subcategory maps to the MOST SPECIFIC page that covers it. Ringlock products point at the
 * Ringlock page rather than the general scaffolding one, because the specific page is the one
 * competing for the search. Where only a general page exists, they point at that.
 *
 * The five livestock ranges other than cattle are deliberately absent: the only livestock
 * landing page is about cattle headlocks, and sending a sheep feeder to it would be a link that
 * misleads a reader to flatter a metric. They render no line at all until a page exists.
 */
export const SUBCATEGORY_LANDING_PAGE = {
  /* scaffolding */
  'system-scaffolds-ringlock': '/scaffolding/ringlock-scaffolding',
  'system-scaffold-cuplock': '/scaffolding/cuplock-scaffolding',
  'scaffold-tube-fitting-european': '/scaffolding/scaffold-couplers',
  'scaffold-tube-fitting-british-american': '/scaffolding/scaffold-couplers',
  'system-scaffolds-hk': '/scaffolding',
  'access-scaffold-american-frame': '/scaffolding',
  'access-scaffold-euro-frame': '/scaffolding',
  'load-bearing-system-shoring-tower': '/scaffolding',
  'security-systems-guard-rails-railing-posts': '/scaffolding',
  'accessories-jacks-nuts': '/scaffolding',
  'trestles-barriers': '/scaffolding',

  /* formwork */
  'slab-formwork-system-props': '/formwork/adjustable-steel-props',
  'slab-formwork-system-fork-heads': '/formwork',
  'system-slab-formwork-tripods': '/formwork',
  'formwork-accessories': '/formwork',
  'wall-formwork-systems-clamps-panels': '/formwork',

  /* garden hardware and wood connectors */
  'pole-anchors-ground-plates': '/garden-hardware/ground-anchors',
  'post-supports': '/garden-hardware',
  'adjustable-post-supports': '/garden-hardware',
  'post-caps': '/garden-hardware',
  'indoor-wood-connectors': '/garden-hardware',
  'miscellaneous-products': '/garden-hardware',

  /* livestock */
  cattle: '/livestock/cattle-headlocks',
};

/**
 * The landing page a subcategory should link to, as { to, keyword }, or null when none covers
 * it. Returns the keyword rather than the whole page so the caller cannot accidentally render
 * a title where anchor text belongs.
 */
export function landingPageForSubcategory(subSlug) {
  const path = SUBCATEGORY_LANDING_PAGE[subSlug];
  const page = path && landingPages[path];
  return page ? { to: path, keyword: page.keyword } : null;
}

/** The landing page for a path, or undefined. */
export const getLandingPage = (path) => landingPages[path];

/** Every landing page path, for routing, the sitemap and the prerenderer. */
export const landingPagePaths = Object.keys(landingPages);
