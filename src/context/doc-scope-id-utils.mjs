/**
 * Doc scope ID normalization shared by config generation and runtime filtering.
 * The implementation lives in doc-scope-filter-core.mjs so the indexer and the
 * browser resolve doc ids identically.
 */
export {
  normalizeDocIdFromPath,
  normalizeFrontMatterDocId,
  collectDocScopeKeys,
  collectDocScopeLookupCandidates,
  lookupDocScopeConfig,
} from './doc-scope-filter-core.mjs';
