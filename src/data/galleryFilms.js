/**
 * Every film in the Projects & Gallery videos grid — the single place to edit them.
 *
 * ---------------------------------------------------------------------------------------
 * TO RENAME A FILM: edit its `title`. That is the whole job.
 * ---------------------------------------------------------------------------------------
 * The title is what the card shows, what the "Watch …" link announces to a screen reader,
 * and the image's alt text. The first three carry real company names; the rest are still
 * placeholders ("KEAA Film 1", …) waiting for their real ones.
 *
 * TO GIVE A FILM A THUMBNAIL: put a Cloudinary public_id — or a full delivery URL — in
 * `poster`. Until then the card draws a branded placeholder (the play control on the brand
 * gradient) rather than a photograph of something else.
 *
 * ---------------------------------------------------------------------------------------
 * WHY EVERY `poster` IS EMPTY, AND WHAT IT WOULD TAKE TO FILL ONE
 * ---------------------------------------------------------------------------------------
 * Every `url` below is a SharePoint/OneDrive SHARE PAGE, not a video file. Nothing here can
 * be transformed and no frame can be lifted from it — a share page answers HTML, and an
 * anonymous request for the underlying file is bounced to a Microsoft login.
 *
 * The grid used to paper over that in two ways, both now gone:
 *   - It handed each film an unrelated photograph from the KEAA gallery, indexed by position
 *     (film 7 got gallery photo 7), so every card showed something that was not in the film.
 *   - Two films pointed at Cloudinary video ids (`hero1_a0hnen`, `Rass_wixfl0`) that no
 *     longer exist in the account. Both returned 404: two broken images shipped in production.
 *
 * A real frame has to come from somewhere a frame CAN be taken from, so either:
 *   - upload the film to Cloudinary and put its VIDEO public_id here — cldVideoPoster() then
 *     lifts a frame from any timestamp, so the best one can be chosen; or
 *   - take a still from the source file yourself, upload that IMAGE, and paste its public_id.
 *
 * There is no third option that reads a frame out of SharePoint: the only way to reach one is
 * to lift the page's own short-lived access token and replay it against Microsoft's internal
 * API, which is credential replay against a third party and expires within hours regardless.
 *
 * Each share link MUST stay shared as "Anyone with the link — view", or a visitor is bounced
 * to a Microsoft login instead of watching the film.
 */
export const galleryFilms = [
  {
    // keaa-aerial.mp4
    title: 'UNIT 1',
    poster: '/images/video-thumbs/IQCQ7svJva9fSY0z.jpg',
    url: 'https://itkeaainternational-my.sharepoint.com/:v:/g/personal/web_support_keaa-international_net/IQCQ7svJva9fSY0zDyJRkUK6AdswuPrVXTGZfV_wV2Idkzg?e=GYIsMu&nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJTdHJlYW1XZWJBcHAiLCJyZWZlcnJhbFZpZXciOiJTaGFyZURpYWxvZy1MaW5rIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXcifX0%3D',
  },
  {
    // Rass.mp4
    title: 'UNIT 2',
    poster: '/images/video-thumbs/IQCZZvmPtHSfSaEX.jpg',
    url: 'https://itkeaainternational-my.sharepoint.com/:v:/g/personal/web_support_keaa-international_net/IQCZZvmPtHSfSaEXtfyRk8DdAfOtL-WxCApdaOWCI_eUQxQ?e=zA7o3g&nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJTdHJlYW1XZWJBcHAiLCJyZWZlcnJhbFZpZXciOiJTaGFyZURpYWxvZy1MaW5rIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXcifX0%3D',
  },
  {
    // Naymo.mp4
    title: 'UNIT 3',
    poster: '/images/video-thumbs/IQCbf_O95O_0S64C.jpg',
    url: 'https://itkeaainternational-my.sharepoint.com/:v:/g/personal/web_support_keaa-international_net/IQCbf_O95O_0S64CVQFKmFfkATD2IZ_SNyYZTfN9gtONkpg?e=Ww1JNS&nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJTdHJlYW1XZWJBcHAiLCJyZWZlcnJhbFZpZXciOiJTaGFyZURpYWxvZy1MaW5rIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXcifX0%3D',
  },
  {
    // peak - Trim4.mp4
    title: 'KEAA Film 1',
    poster: '/images/video-thumbs/IQDUvijhFQmYRYTq.jpg',
    url: 'https://itkeaainternational-my.sharepoint.com/:v:/g/personal/web_support_keaa-international_net/IQDUvijhFQmYRYTqtpfMwmYgAR7gMFrR56_jEP0gK9OQO8s?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=3CCJeR',
  },
  {
    // DJI_0940.MOV
    title: 'KEAA Film 2',
    poster: '/images/video-thumbs/IQDpMA2oFHeISp4N.jpg',
    url: 'https://itkeaainternational-my.sharepoint.com/:v:/g/personal/web_support_keaa-international_net/IQDpMA2oFHeISp4NnJ8aiSD2AXnOajm00P_SySXHcJqfS4A?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=Gz6NF3',
  },
  {
    // DJI_0950.MOV
    title: 'KEAA Film 3',
    poster: '/images/video-thumbs/IQDCeJ16F_C2R7dX.jpg',
    url: 'https://itkeaainternational-my.sharepoint.com/:v:/g/personal/web_support_keaa-international_net/IQDCeJ16F_C2R7dXl06LHx3MAbD8NroX7s7CEc92AsOY3ok?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=Gugnk1',
  },
  {
    // DJI_0952.MOV
    title: 'KEAA Film 4',
    poster: '/images/video-thumbs/IQBlRYpPKOp0T54x.jpg',
    url: 'https://itkeaainternational-my.sharepoint.com/:v:/g/personal/web_support_keaa-international_net/IQBlRYpPKOp0T54xc4dGDaLiAVP57dpQ07O4nVviXMpx6xE?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=WSvNak',
  },
  {
    // peak - Trim2.mp4
    title: 'KEAA Film 5',
    poster: '/images/video-thumbs/IQDZoPWoSL7GTZxB.jpg',
    url: 'https://itkeaainternational-my.sharepoint.com/:v:/g/personal/web_support_keaa-international_net/IQDZoPWoSL7GTZxBOxkZJiZCAX52w4xtTnkU6BmPIOfIohE?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=2XIvnE',
  },
  {
    // Comp 2.mp4
    title: 'KEAA Film 6',
    poster: '/images/video-thumbs/IQBzkf-QttJqTbGM.jpg',
    url: 'https://itkeaainternational-my.sharepoint.com/:v:/g/personal/web_support_keaa-international_net/IQBzkf-QttJqTbGM8IB41fejAc-og3V9j2UkdLW6TnkxmLg?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=xftVb5',
  },
  {
    // DJI_0933.MOV
    title: 'KEAA Film 7',
    poster: '/images/video-thumbs/IQDunyaYbM7OR7Mc.jpg',
    url: 'https://itkeaainternational-my.sharepoint.com/:v:/g/personal/web_support_keaa-international_net/IQDunyaYbM7OR7Mclz_ljf96AaKUkjentCMLr3ebyaSZe8s?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=9Shz7a',
  },
  {
    // DJI_0938.MOV
    title: 'KEAA Film 8',
    poster: '/images/video-thumbs/IQD228OPJLhvTaa8.jpg',
    url: 'https://itkeaainternational-my.sharepoint.com/:v:/g/personal/web_support_keaa-international_net/IQD228OPJLhvTaa8LtWSbfTRARInLqQHntEKTJkFyabSvLo?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=DRuFcD',
  },
  {
    // hero page 3.mp4
    title: 'KEAA Film 9',
    poster: '/images/video-thumbs/IQDtCuzIrwHnRaJ0.jpg',
    url: 'https://itkeaainternational-my.sharepoint.com/:v:/g/personal/web_support_keaa-international_net/IQDtCuzIrwHnRaJ0jiiQyQbWAazWxoFK6Fke4GAykR9VW6E?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=n045fk',
  },
  {
    // hero page 4.mp4
    title: 'KEAA Film 10',
    poster: '/images/video-thumbs/IQBmD7XSDSGqT6A7.jpg',
    url: 'https://itkeaainternational-my.sharepoint.com/:v:/g/personal/web_support_keaa-international_net/IQBmD7XSDSGqT6A7m-KljZUHAYbuSccfWEkztiASuZMN3N0?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=BUugnq',
  },
  {
    // hero1.mp4
    title: 'KEAA Film 11',
    poster: '/images/video-thumbs/IQBeolJjUBBdSIap.jpg',
    url: 'https://itkeaainternational-my.sharepoint.com/:v:/g/personal/web_support_keaa-international_net/IQBeolJjUBBdSIapYa4p3lnxATR9I9zpTKC0PoUNUZReong?nav=eyJyZWZlcnJhbEluZm8iOnsicmVmZXJyYWxBcHAiOiJPbmVEcml2ZUZvckJ1c2luZXNzIiwicmVmZXJyYWxBcHBQbGF0Zm9ybSI6IldlYiIsInJlZmVycmFsTW9kZSI6InZpZXciLCJyZWZlcnJhbFZpZXciOiJNeUZpbGVzTGlua0NvcHkifX0&e=dCbQEh',
  },
];
