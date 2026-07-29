import { useState } from 'react';
import { useLocale } from '../i18n/LocaleContext';
import { isLiveLocale } from '../i18n/languages';

const DISMISS_KEY = 'keaa.langNoticeDismissed';

/**
 * The strip a visitor sees after choosing a language whose translation is not live yet:
 * it names the language, says the full site in it is on the way, and that pages are in
 * English meanwhile. It renders in normal document flow right under the header — never a
 * portal, never fixed — so it can neither cover content nor trip the prerender overlay
 * problem (and during prerender the language is English, so it does not render at all).
 *
 * Dismissal is remembered PER SESSION and per language: a visitor who dismissed the German
 * notice has understood the situation for this visit, but a later visit (or switching to
 * Polish) states it again.
 */
export default function LanguageNotice() {
  const { language, meta, t } = useLocale();
  const [dismissed, setDismissed] = useState(() => {
    try {
      return window.sessionStorage.getItem(DISMISS_KEY) === language;
    } catch {
      return false;
    }
  });

  const active = language !== 'en' && !isLiveLocale(language);
  if (!active || dismissed) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      window.sessionStorage.setItem(DISMISS_KEY, language);
    } catch {
      // Storage blocked: the dismissal still holds for this page via state.
    }
  };

  const fill = (key) => t(key).split('{language}').join(meta.native);

  return (
    <div className="border-b border-primary/30 bg-primary/10">
      <div className="container-page flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-2.5">
        <p className="text-sm text-navy-900">
          <span className="font-semibold">{fill('lang.noticeTitle')}.</span>{' '}
          <span className="text-ink">{fill('lang.noticeBody')}</span>
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="text-sm font-semibold text-navy-900 underline decoration-primary decoration-2 underline-offset-4 transition-colors hover:text-primary-darker"
        >
          {t('lang.noticeDismiss')}
        </button>
      </div>
    </div>
  );
}
