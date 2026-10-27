/* eslint-disable jsx-a11y/no-autofocus */
import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import algoliaSearchHelper from 'algoliasearch-helper';
import { liteClient } from 'algoliasearch/lite';
import ExecutionEnvironment from '@docusaurus/ExecutionEnvironment';
import Head from '@docusaurus/Head';
import { useSearchQueryString } from '@docusaurus/theme-common';
import { useAllDocsData } from '@docusaurus/plugin-content-docs/client';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import { useDocScopeFilter } from '@site/src/context/DocScopeFilterContext';
import styles from './styles.module.css';

const HITS_PER_PAGE = 15;
const SEARCH_DEBOUNCE_MS = 300;

const initialState = {
  items: [],
  query: null,
  totalResults: null,
  totalPages: null,
  page: null,
  hasMore: false,
  loading: false,
};

function reducer(state, action) {
  switch (action.type) {
    case 'reset':
      return initialState;
    case 'loading':
      return { ...state, loading: true };
    case 'more': {
      const hasMore = state.page != null && state.totalPages != null && state.page + 1 < state.totalPages;
      return {
        ...state,
        page: hasMore ? state.page + 1 : state.page,
        hasMore,
      };
    }
    case 'update': {
      return {
        ...action.value,
        items:
          action.value.page === 0
            ? action.value.items
            : [...state.items, ...action.value.items],
      };
    }
    default:
      return state;
  }
}

function flattenFilters(filters) {
  return (filters || []).flatMap((filter) => (Array.isArray(filter) ? filter : [filter]));
}

function splitFacetFilter(filter) {
  const index = String(filter).indexOf(':');
  if (index <= 0) {
    return null;
  }
  return {
    facet: String(filter).slice(0, index),
    value: String(filter).slice(index + 1),
  };
}

function sanitizeHighlight(value) {
  return String(value || '').replace(
    /algolia-docsearch-suggestion--highlight/g,
    'search-result-match',
  );
}

function hitToItem(hit) {
  const hierarchy = hit._highlightResult?.hierarchy || {};
  const snippet = hit._snippetResult?.content;
  const titles = Object.keys(hierarchy)
    .sort()
    .map((key) => ({ key, value: sanitizeHighlight(hierarchy[key]?.value) }))
    .filter((entry) => entry.value);

  const title = titles.length > 0 ? titles[titles.length - 1].value : hit.content || '';
  const breadcrumbs = titles.slice(0, -1).map((entry) => entry.value);

  return {
    objectID: hit.objectID,
    url: hit.url,
    title,
    breadcrumbs,
    summary: snippet ? `${sanitizeHighlight(snippet.value)}...` : '',
  };
}

function getPageTitle(locale, query) {
  const isEnglish = locale === 'en';
  if (query) {
    return isEnglish ? `Search results for "${query}"` : `"${query}" 的搜索结果`;
  }
  return isEnglish ? 'Search the documentation' : '搜索文档';
}

function SearchPageContent() {
  const { i18n, siteConfig } = useDocusaurusContext();
  const algolia = siteConfig.themeConfig.algolia || {};
  const { product, version } = useDocScopeFilter();
  const [searchQuery, setSearchQuery] = useSearchQueryString();
  const [inputValue, setInputValue] = useState(searchQuery);
  const [state, dispatch] = useReducer(reducer, initialState);
  const [loaderNode, setLoaderNode] = useState(null);
  const observerRef = useRef(null);
  const locale = i18n.currentLocale;
  const isEnglish = locale === 'en';

  // Build the contextual filters by hand instead of using
  // useAlgoliaContextualFacetFilters(): the search page is rendered outside the
  // docs version provider, so that hook throws during SSG.
  const allDocsData = useAllDocsData();
  const contextualFilters = useMemo(() => {
    const tags = ['default'];
    for (const [pluginId, data] of Object.entries(allDocsData || {})) {
      const versionName = data?.versions?.[0]?.name;
      if (versionName) {
        tags.push(`docs-${pluginId}-${versionName}`);
      }
    }
    return [`language:${locale}`, tags];
  }, [locale, allDocsData]);
  const contextualKey = flattenFilters(contextualFilters).join('|');

  const helper = useMemo(() => {
    const client = liteClient(algolia.appId, algolia.apiKey);
    const instance = algoliaSearchHelper(client, algolia.indexName, {
      hitsPerPage: HITS_PER_PAGE,
      advancedSyntax: true,
      disjunctiveFacets: algolia.contextualSearch ? ['language', 'docusaurus_tag'] : [],
    });

    if (algolia.contextualSearch) {
      for (const filter of flattenFilters(contextualFilters)) {
        const parsed = splitFacetFilter(filter);
        if (parsed) {
          instance.addDisjunctiveFacetRefinement(parsed.facet, parsed.value);
        }
      }
    }
    // Scope filters are plain (AND) facet filters. They are filterOnly in the
    // Algolia settings, so they must not be declared as facets for counts.
    const scopeFilters = [];
    if (product) {
      scopeFilters.push(`product:${product}`);
    }
    if (version) {
      scopeFilters.push(`rdk_version:${version}`);
    }
    if (scopeFilters.length > 0) {
      instance.setQueryParameter('facetFilters', scopeFilters);
    }
    return instance;
    // contextualFilters is represented by contextualKey to keep the helper stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [algolia.appId, algolia.apiKey, algolia.indexName, algolia.contextualSearch, contextualKey, product, version]);

  // Sync URL query -> input (browser back/forward).
  useEffect(() => {
    setInputValue((current) => (current === searchQuery ? current : searchQuery));
  }, [searchQuery]);

  // Debounced input -> URL query.
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue !== searchQuery) {
        setSearchQuery(inputValue);
      }
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [inputValue, searchQuery, setSearchQuery]);

  // Receive results. This effect is declared before the search effect so the
  // listener is attached before the first request is fired.
  useEffect(() => {
    const onResult = ({ results: { query, hits, page, nbHits, nbPages } }) => {
      if (!Array.isArray(hits)) {
        dispatch({ type: 'reset' });
        return;
      }
      const items = hits.map(hitToItem);
      dispatch({
        type: 'update',
        value: {
          items,
          query,
          totalResults: nbHits,
          totalPages: nbPages,
          page,
          hasMore: nbPages > page + 1,
          loading: false,
        },
      });
    };
    const onError = () => dispatch({ type: 'reset' });
    helper.on('result', onResult);
    helper.on('error', onError);
    return () => {
      helper.removeListener('result', onResult);
      helper.removeListener('error', onError);
    };
  }, [helper]);

  // Execute the search.
  useEffect(() => {
    dispatch({ type: 'reset' });
    if (!searchQuery.trim()) {
      return undefined;
    }
    helper.setQuery(searchQuery);
    helper.setQueryParameter('page', 0);
    dispatch({ type: 'loading' });
    helper.search();
    return undefined;
  }, [helper, searchQuery]);

  // Infinite scroll.
  useEffect(() => {
    if (!ExecutionEnvironment.canUseIntersectionObserver || !loaderNode) {
      return undefined;
    }
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && state.hasMore && !state.loading) {
          dispatch({ type: 'loading' });
          helper.setPage(state.page + 1).search();
        }
      },
      { rootMargin: '200px' },
    );
    observerRef.current.observe(loaderNode);
    return () => observerRef.current?.disconnect();
  }, [loaderNode, helper, state.hasMore, state.loading, state.page]);

  const onInputChange = useCallback((event) => setInputValue(event.target.value), []);

  const pageTitle = getPageTitle(locale, searchQuery);
  const trimmedQuery = searchQuery.trim();

  return (
    <Layout title={pageTitle} description={pageTitle}>
      <Head>
        <meta name="robots" content="noindex, follow" />
      </Head>
      <main className="container margin-vert--lg">
        <h1 className={styles.title}>{pageTitle}</h1>
        <input
          type="search"
          autoFocus
          value={inputValue}
          onChange={onInputChange}
          placeholder={isEnglish ? 'Search' : '搜索'}
          className={styles.input}
          aria-label={isEnglish ? 'Search' : '搜索'}
        />

        <div className={styles.scopeLine}>
          {product && version
            ? (isEnglish
                ? `Searching within ${product} / ${version}`
                : `当前搜索范围：${product} / ${version}`)
            : null}
        </div>

        {!trimmedQuery ? (
          <p className={styles.empty}>{isEnglish ? 'Enter a keyword to search.' : '请输入关键词开始搜索。'}</p>
        ) : null}

        {trimmedQuery && !state.loading && state.totalResults === 0 ? (
          <p className={styles.empty}>
            {isEnglish ? 'No results found.' : '没有找到匹配的内容。'}
          </p>
        ) : null}

        {trimmedQuery && state.totalResults != null && state.totalResults > 0 ? (
          <p className={styles.summary}>
            {isEnglish
              ? `${state.totalResults} documents found`
              : `共找到 ${state.totalResults} 条结果`}
          </p>
        ) : null}

        <ul className={styles.list}>
          {state.items.map((item) => (
            <li key={item.objectID} className={styles.item}>
              <a href={item.url} className={styles.link}>
                {item.breadcrumbs.length > 0 ? (
                  <div className={styles.breadcrumbs}>
                    {item.breadcrumbs.map((crumb, index) => (
                      <React.Fragment key={index}>
                        {index > 0 ? <span className={styles.separator}>›</span> : null}
                        <span dangerouslySetInnerHTML={{ __html: crumb }} />
                      </React.Fragment>
                    ))}
                  </div>
                ) : null}
                <div className={styles.hitTitle} dangerouslySetInnerHTML={{ __html: item.title }} />
                {item.summary ? (
                  <p className={styles.snippet} dangerouslySetInnerHTML={{ __html: item.summary }} />
                ) : null}
              </a>
            </li>
          ))}
        </ul>

        {trimmedQuery && state.loading ? (
          <p className={styles.loading}>{isEnglish ? 'Searching...' : '搜索中...'}</p>
        ) : null}

        {trimmedQuery && state.hasMore ? <div ref={setLoaderNode} className={styles.loader} /> : null}
      </main>
    </Layout>
  );
}

export default function SearchPage() {
  return <SearchPageContent />;
}
