import React, { useCallback, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { DocSearchButton, useDocSearchKeyboardEvents } from '@docsearch/react';
import Head from '@docusaurus/Head';
import { useHistory } from '@docusaurus/router';
import { useAlgoliaContextualFacetFilters } from '@docusaurus/theme-search-algolia/client';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { useDocScopeFilter } from '@site/src/context/DocScopeFilterContext';
import translations from '@theme/SearchTranslations';

let DocSearchModal = null;

function importDocSearchModalIfNeeded() {
  if (DocSearchModal) {
    return Promise.resolve();
  }
  return Promise.all([
    import('@docsearch/react/modal'),
    import('@docsearch/react/style'),
  ]).then(([{ DocSearchModal: Modal }]) => {
    DocSearchModal = Modal;
  });
}

// Algolia treats a nested array as OR and sibling entries as AND.
// Docusaurus passes docusaurus_tag values as one OR group; flattening it
// requires every tag at once and the query matches nothing.
function concatFacetFilters(...groups) {
  const filters = [];
  for (const group of groups) {
    if (!group) continue;
    const list = Array.isArray(group) ? group : [group];
    for (const filter of list) {
      if (Array.isArray(filter)) {
        if (filter.length === 1) filters.push(filter[0]);
        else if (filter.length > 1) filters.push(filter);
      } else if (filter) {
        filters.push(filter);
      }
    }
  }
  return filters;
}

function Hit({ hit, children }) {
  // Keep the indexed URL untouched (it already carries ?p=&v= and the anchor).
  return <a href={hit.url}>{children}</a>;
}

function useScopeFacetFilters() {
  const { product, version } = useDocScopeFilter();
  return useMemo(() => {
    const filters = [];
    if (product) {
      filters.push(`product:${product}`);
    }
    if (version) {
      filters.push(`rdk_version:${version}`);
    }
    return filters;
  }, [product, version]);
}

function useSearchParameters(props) {
  const contextualFilters = useAlgoliaContextualFacetFilters();
  const scopeFilters = useScopeFacetFilters();
  const configFilters = props.searchParameters?.facetFilters ?? [];
  return useMemo(
    () => ({
      ...props.searchParameters,
      // language is AND. docusaurus_tag stays an OR group. product / rdk_version
      // from the DocScope context are AND.
      facetFilters: concatFacetFilters(contextualFilters, configFilters, scopeFilters),
    }),
    [props.searchParameters, contextualFilters, configFilters, scopeFilters],
  );
}

function useTransformItems(props) {
  const [transformItems] = useState(() => {
    const custom = props.transformItems;
    return custom || ((items) => items);
  });
  return transformItems;
}

function useNavigator() {
  const history = useHistory();
  const [navigator] = useState(() => ({
    navigate({ itemUrl }) {
      // Absolute URL from another origin, or a same-origin local path.
      if (/^https?:\/\//i.test(itemUrl) && !itemUrl.startsWith(window.location.origin)) {
        window.location.href = itemUrl;
        return;
      }
      history.push(itemUrl);
    },
  }));
  return navigator;
}

function useResultsFooterComponent(closeModal) {
  const { product, version } = useDocScopeFilter();
  const { i18n } = useDocusaurusContext();
  const searchPath = useBaseUrl('search');
  return useMemo(
    () =>
      ({ state }) => {
        const params = new URLSearchParams();
        params.set('q', state.query);
        if (product) params.set('p', product);
        if (version) params.set('v', version);
        const label =
          i18n.currentLocale === 'en'
            ? `See all ${state.context.nbHits} results`
            : `查看全部 ${state.context.nbHits} 条结果`;
        return (
          <a href={`${searchPath}?${params.toString()}`} onClick={closeModal}>
            {label}
          </a>
        );
      },
    [product, version, searchPath, closeModal, i18n.currentLocale],
  );
}

function DocSearch({ externalUrlRegex, ...props }) {
  const navigator = useNavigator();
  const searchParameters = useSearchParameters(props);
  const transformItems = useTransformItems(props);
  const searchContainer = useRef(null);
  const searchButtonRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [initialQuery, setInitialQuery] = useState(undefined);

  const prepareSearchContainer = useCallback(() => {
    if (!searchContainer.current) {
      const divElement = document.createElement('div');
      searchContainer.current = divElement;
      document.body.insertBefore(divElement, document.body.firstChild);
    }
  }, []);

  const openModal = useCallback(() => {
    prepareSearchContainer();
    importDocSearchModalIfNeeded().then(() => setIsOpen(true));
  }, [prepareSearchContainer]);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setInitialQuery(undefined);
    searchButtonRef.current?.focus();
  }, []);

  const handleInput = useCallback(
    (event) => {
      if (event.key === 'f' && (event.metaKey || event.ctrlKey)) {
        return;
      }
      event.preventDefault();
      setInitialQuery(event.key);
      openModal();
    },
    [openModal],
  );

  const resultsFooterComponent = useResultsFooterComponent(closeModal);

  useDocSearchKeyboardEvents({
    isOpen,
    onOpen: openModal,
    onClose: closeModal,
    onInput: handleInput,
    searchButtonRef,
  });

  return (
    <>
      <Head>
        <link
          rel="preconnect"
          href={`https://${props.appId}-dsn.algolia.net`}
          crossOrigin="anonymous"
        />
      </Head>

      <DocSearchButton
        onTouchStart={importDocSearchModalIfNeeded}
        onFocus={importDocSearchModalIfNeeded}
        onMouseOver={importDocSearchModalIfNeeded}
        onClick={openModal}
        ref={searchButtonRef}
        translations={props.translations?.button ?? translations.button}
      />

      {isOpen &&
        DocSearchModal &&
        searchContainer.current &&
        createPortal(
          <DocSearchModal
            onClose={closeModal}
            initialScrollY={window.scrollY}
            initialQuery={initialQuery}
            navigator={navigator}
            transformItems={transformItems}
            hitComponent={Hit}
            {...(props.searchPagePath && { resultsFooterComponent })}
            {...props}
            placeholder={translations.placeholder}
            translations={props.translations?.modal ?? translations.modal}
            searchParameters={searchParameters}
          />,
          searchContainer.current,
        )}
    </>
  );
}

export default function SearchBar() {
  const { siteConfig } = useDocusaurusContext();
  return <DocSearch {...siteConfig.themeConfig.algolia} />;
}
