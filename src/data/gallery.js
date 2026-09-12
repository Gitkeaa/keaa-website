/**
 * KEAA's own photography for the Projects & Gallery page.
 *
 * Delivered from Cloudinary (asset folder "1.Keaa Assets/Keaa Gallery") via
 * cldImage()/cldSrcSet(), so nothing here is stored in the repo — the list is just the
 * public_ids. The account runs in dynamic-folder mode, where the public_id is NOT the
 * folder path, so these are the real ids returned by the Admin API. To refresh the list
 * after adding photos, re-run: node scripts/list-gallery.mjs "1.Keaa Assets/Keaa Gallery"
 *
 * These live in the SAME Cloudinary account as the hero videos ("1.Keaa Assets/1.Keaa Hero
 * page Videos") and the product shots ("1.Keaa Assets/Keaa products"), but in a separate
 * folder and referenced only from here — nothing about those is touched.
 *
 * ---------------------------------------------------------------------------------------
 * CATEGORIES — edit these freely.
 * ---------------------------------------------------------------------------------------
 * Each photo carries a `category`, which drives the filter on the gallery. The initial
 * labels were assigned by looking at every image; change any `category` string below to
 * re-file a photo, and add or rename buckets in `galleryCategories`. A new photo (from the
 * script above) just needs a `{ id, category }` line — if its category is not in
 * `galleryCategories` it still shows under "All", it just gets no filter button.
 */
// DSC_6129_n49y89 and DSC_6380_afmt2n were removed for the SAME reason as 'Exhibitions'
// below, and they were the last two survivors of that shoot: both are trade-show booth
// meetings, and both have printed handouts on the table carrying the blue-and-yellow
// "T" Tobler mark (one also shows a "MATO" document). Filed under 'Team' rather than
// 'Exhibitions', which is how they escaped the earlier purge.
//
// 'Exhibitions' was removed: every photo in it was shot at a competitor's ("Tobler India")
// trade-show booth, so the whole category showed another brand's name and products. If real
// KEAA-booth exhibition photos arrive, re-add the category here and tag them 'Exhibitions'.
//
// A further 17 ids were dropped across two rounds after the client deleted those assets from
// Cloudinary — their delivery URLs 404, so they rendered as broken tiles.
//
// FIVE of those were ALSO hero slides (heroSlides.js), between them covering 13 slides across
// 9 of the 10 carousels, so deleting a gallery photo is not a gallery-only change. Before
// removing an id here, grep it across src/ — if heroSlides.js uses it, that slide needs a live
// replacement or the page opens on a broken hero.
export const galleryCategories = ['All', 'Manufacturing', 'Aerial'];

export const galleryPhotos = [
  { id: 'DJI_0082_p2qmld', category: 'Aerial' },
  { id: 'DJI_0083_1_w7zuxk', category: 'Aerial' },
  { id: 'DJI_0117_jnjfzw', category: 'Manufacturing' },
  { id: 'DJI_0126_busis7', category: 'Manufacturing' },
  { id: 'DJI_0131_ljo3tq', category: 'Manufacturing' },
  { id: 'DJI_0146_bzclb7', category: 'Aerial' },
  { id: 'DJI_0164_efaxki', category: 'Manufacturing' },
  // The four 'Exhibitions' photos that sat here (DSC_6055/6057/6058/6220) were removed — each
  // showed the "Tobler India" competitor booth, not KEAA's. See galleryCategories above.
  { id: 'hot_dip_u4t1vc', category: 'Manufacturing' },
  { id: 'IMG_0363_eik0rk', category: 'Team' },
  { id: 'IMG_0378_x5iqib', category: 'Manufacturing' },
  { id: 'IMG_0430_bnfi0v', category: 'Team' },
  { id: 'IMG_0444_pzkfun', category: 'Team' },
  { id: 'IMG_0453_xiscrp', category: 'Team' },
  { id: 'IMG_1108_lkay4c', category: 'Team' },
  { id: 'IMG_1113_wb6dmo', category: 'Team' },
  { id: 'IMG_1977_qclqp3', category: 'Manufacturing' },
  { id: 'IMG_2473_p9prtl', category: 'Team' },
  { id: 'IMG_2508_kmskzh', category: 'Team' },
  { id: 'IMG_2512_wggw9o', category: 'Team' },
  { id: 'IMG_2516_ss6pmj', category: 'Team' },
  { id: 'IMG_9389_pndzst', category: 'Manufacturing' },
  { id: 'IMG_9405_tqyhyi', category: 'Manufacturing' },
  { id: 'IMG_9406_hz6kms', category: 'Manufacturing' },
  { id: 'IMG_9440_ueh71y', category: 'Manufacturing' },
  { id: 'IMG_9471_rxoaxo', category: 'Manufacturing' },
  { id: 'IMG_9473_iqy5gk', category: 'Manufacturing' },
  { id: 'IMG_9483_xgkajt', category: 'Manufacturing' },
  { id: 'IMG_9518_tzihvj', category: 'Manufacturing' },
  { id: 'IMG_9524_qcbtn4', category: 'Manufacturing' },
  { id: 'IMG_9612_xlbdb5', category: 'Manufacturing' },
  { id: 'IMG_9619_dy341a', category: 'Manufacturing' },
  { id: 'IMG_9641_pi3mja', category: 'Manufacturing' },
  { id: 'Locking_2_jrzuql', category: 'Manufacturing' },
  { id: 'Screenshot_2023-04-17_103327_cq7mkj', category: 'Manufacturing' },
];

/** Category-based alt text, looked up by public_id — more accurate than the filename. */
const ALT = {
  Manufacturing: 'KEAA International manufacturing and products',
  Aerial: 'Aerial view of KEAA International’s manufacturing facility',
  Team: 'The KEAA International team',
};
export const galleryAlt = (id) => {
  const cat = galleryPhotos.find((p) => p.id === id)?.category;
  return ALT[cat] || 'KEAA International — factory, product and project photography';
};
