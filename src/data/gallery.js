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
export const galleryCategories = ['All', 'Manufacturing', 'Aerial', 'Exhibitions'];

export const galleryPhotos = [
  { id: '9bdbb5065c_q2bd6m', category: 'Manufacturing' },
  { id: 'DJI_0082_p2qmld', category: 'Aerial' },
  { id: 'DJI_0083_1_w7zuxk', category: 'Aerial' },
  { id: 'DJI_0085_ut3erz', category: 'Aerial' },
  { id: 'DJI_0117_jnjfzw', category: 'Manufacturing' },
  { id: 'DJI_0126_busis7', category: 'Manufacturing' },
  { id: 'DJI_0131_ljo3tq', category: 'Manufacturing' },
  { id: 'DJI_0146_bzclb7', category: 'Aerial' },
  { id: 'DJI_0151_pyqq3i', category: 'Manufacturing' },
  { id: 'DJI_0158_d1lz3h', category: 'Manufacturing' },
  { id: 'DJI_0159_jbk0dl', category: 'Manufacturing' },
  { id: 'DJI_0164_efaxki', category: 'Manufacturing' },
  { id: 'DSC_6055_h7jzgq', category: 'Exhibitions' },
  { id: 'DSC_6057_x8jy1k', category: 'Exhibitions' },
  { id: 'DSC_6058_fev55g', category: 'Exhibitions' },
  { id: 'DSC_6129_n49y89', category: 'Team' },
  { id: 'DSC_6153_y9498s', category: 'Team' },
  { id: 'DSC_6190_jj6nsi', category: 'Team' },
  { id: 'DSC_6220_hfmkmr', category: 'Exhibitions' },
  { id: 'DSC_6380_afmt2n', category: 'Team' },
  { id: 'DSC_6403_urjq3q', category: 'Team' },
  { id: 'DSC_6475_k8tzs5', category: 'Team' },
  { id: 'hot_dip_u4t1vc', category: 'Manufacturing' },
  { id: 'image_9a3a7917-5b5e-474f-b8f7-cd170a7ca8f620230407_115549_rrzguh', category: 'Manufacturing' },
  { id: 'image_large_2_gi4d42', category: 'Manufacturing' },
  { id: 'image_large_3_hxtwtf', category: 'Manufacturing' },
  { id: 'image_large_4_hejpvm', category: 'Manufacturing' },
  { id: 'image_large_x3tifr', category: 'Manufacturing' },
  { id: 'IMG_0363_eik0rk', category: 'Team' },
  { id: 'IMG_0378_x5iqib', category: 'Manufacturing' },
  { id: 'IMG_0430_bnfi0v', category: 'Team' },
  { id: 'IMG_0444_pzkfun', category: 'Team' },
  { id: 'IMG_0447_ais0xt', category: 'Manufacturing' },
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
  { id: 'IMG_9646_fegbtz', category: 'Manufacturing' },
  { id: 'iStock-1161618868_x1meiw', category: 'Manufacturing' },
  { id: 'Locking_2_jrzuql', category: 'Manufacturing' },
  { id: 'Screenshot_2023-04-17_103327_cq7mkj', category: 'Manufacturing' },
];

/** Category-based alt text, looked up by public_id — more accurate than the filename. */
const ALT = {
  Manufacturing: 'KEAA International manufacturing and products',
  Aerial: 'Aerial view of KEAA International’s manufacturing facility',
  Exhibitions: 'KEAA International at an industry exhibition',
  Team: 'The KEAA International team',
};
export const galleryAlt = (id) => {
  const cat = galleryPhotos.find((p) => p.id === id)?.category;
  return ALT[cat] || 'KEAA International — factory, product and project photography';
};
