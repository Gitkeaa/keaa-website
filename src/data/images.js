// Premium photography curated from Unsplash (unsplash.com/license — free for
// commercial use, no attribution required). Organised by theme so any page
// can pull a relevant, high-quality image. All URLs use Unsplash's dynamic
// resizing params; swap any entry for an official KEAA photo later by simply
// replacing the URL string — no layout changes required.

const u = (id, w = 1920, q = 80) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=${q}`;

export const img = {
  // Hero / scaffolding & construction
  heroScaffoldTower: u('photo-1636362556682-11231883c01c'),
  scaffoldWorm: u('photo-1556886283-a3944a060a52'),
  scaffoldFrame: u('photo-1527335988388-b40ee248d80c'),
  scaffoldHighRise: u('photo-1613377511623-27a162a76327'),
  scaffoldMenWorking: u('photo-1542350880924-09225f70e026'),
  scaffoldWorker1: u('photo-1603239564387-c5b5ea6f635e'),
  scaffoldWorker2: u('photo-1649320316177-775fe2d67ca3'),
  scaffoldWorker3: u('photo-1636362006544-22445420703f'),
  scaffoldLadder: u('photo-1626471671222-9d89fe4c2668'),
  scaffoldBuildingSite: u('photo-1508450859948-4e04fabaa4ea'),
  scaffoldCrane: u('photo-1591955506264-3f5a6834570a'),
  scaffoldRacks: u('photo-1519143009590-e3800b9df468'),
  scaffoldOnBuilding: u('photo-1555945071-f36c590968bb'),

  // Steel / welding / manufacturing
  metalBuilding: u('photo-1496247749665-49cf5b1022e9'),
  steelFrame: u('photo-1455165814004-1126a7199f9b'),
  factoryInterior: u('photo-1624027492684-327af1fb7559'),
  metalPour: u('photo-1697281679213-fcab27e10ad4'),
  welderFactory: u('photo-1714504904786-b6732390b206'),
  metalSparks: u('photo-1735494033576-9c882e80504c'),
  grinderMetal: u('photo-1738162837369-a2beec3a1d47'),
  weldersFactory: u('photo-1730584474196-b0e8a29303e8'),
  factoryMachines: u('photo-1720036237334-9263cd28c3d4'),
  manOnMachine: u('photo-1697351450667-28cf64813abe'),
  powerTool: u('photo-1600684249816-38cdfcf95c17'),
  personTool: u('photo-1504917595217-d4dc5ebe6122'),

  // Shipping / logistics / export
  containersStacked: u('photo-1678182451047-196f22a4143e'),
  cargoContainers: u('photo-1606964212858-c215029db704'),
  cargoShip: u('photo-1655164709639-95035bff7ea8'),
  containerYard: u('photo-1493946740644-2d8a1f1a6aff'),
  intermodalContainers: u('photo-1601897690942-bcacbad33e55'),

  // Livestock / cattle / barn
  cowsInBarn: u('photo-1666878125618-ed3dddd1ab36'),
  cattleHerdBarn: u('photo-1636998980792-63f27ddea4e3'),
  cattleGrazing: u('photo-1730067391488-9d39399e2b29'),
  cattleCloseup: u('photo-1547158732-1de2d876e497'),

  // Timber / wood frame / garden hardware
  woodenFrameSky: u('photo-1741916540147-9be1d2b20d32'),
  woodenFrameBrown: u('photo-1563874093519-ca5eda5cd776'),
  woodenStructure: u('photo-1634255970497-78ffb2b08ae8'),
  woodenFenceSky: u('photo-1621673610286-a6b5e788ab82'),
  woodenStructureSky: u('photo-1676802540678-2dceb1820113'),
};

// Convenience: portrait/square crops for cards where a taller frame suits the
// layout better than the default landscape crop.
const us = (id, w = 1200, h = 1200, q = 80) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&h=${h}&q=${q}`;

export const imgSquare = {
  scaffoldWorker1: us('photo-1603239564387-c5b5ea6f635e'),
  metalPour: us('photo-1697281679213-fcab27e10ad4'),
  cattleHerdBarn: us('photo-1636998980792-63f27ddea4e3'),
  woodenFrameBrown: us('photo-1563874093519-ca5eda5cd776'),
  containersStacked: us('photo-1678182451047-196f22a4143e'),
  welderFactory: us('photo-1714504904786-b6732390b206'),
};
