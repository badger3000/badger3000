import React, { useState } from 'react';
import algoliasearch from 'algoliasearch/lite';
import { InstantSearch, Configure, connectSearchBox, connectHits, Index } from 'react-instantsearch-dom';

const appId = import.meta.env.PUBLIC_MY_ALGOLIA_APP_ID;
const searchApiKey = import.meta.env.PUBLIC_MY_ALGOLIA_SEARCH_API_KEY;

const indices = [
  import.meta.env.PUBLIC_MY_INDEX_NAME_CODEPENS,
  import.meta.env.PUBLIC_MY_INDEX_NAME_POSTS,
  import.meta.env.PUBLIC_MY_INDEX_NAME_PROJECTS,
  import.meta.env.PUBLIC_MY_INDEX_NAME_MOVIE
].filter(Boolean);

const searchClient = algoliasearch(appId || '', searchApiKey || '');

const CustomSearchBox = connectSearchBox(({ currentRefinement, refine, setQuery }) => (
  <div className="search-container flex w-full">
    <input
      className="px-6 py-4 bg-transparent text-dark focus:outline-none w-full lg:w-3/5 bg-white rounded-tl-lg rounded-bl-lg transition-all duration-300"
      type="search"
      value={currentRefinement}
      onChange={event => {
        refine(event.currentTarget.value);
        setQuery(event.currentTarget.value);
      }}
      placeholder="Search..."
    />
    <button className="bg-white font-bold rounded-tr-lg rounded-br-lg py-3 pr-6">
      <i className="fa-solid fa-search text-secondary text-2xl"></i>
    </button>
  </div>
));

const Hit = ({ hit }) => {
  const getContentType = (indexName) => {
    if (typeof indexName !== 'string') return 'unknown';
    const match = indexName.match(/PUBLIC_MY_INDEX_NAME_(\w+)/);
    return match ? match[1].toLowerCase() : 'unknown';
  };

  return (
    <div className="search-result-item p-4 border-b">
      <h3 className="text-lg font-bold">{hit.title || 'Untitled'}</h3>
      <p className="text-sm text-gray-600">{hit.description || 'No description available'}</p>
      <span className="text-xs text-gray-400">Type: {getContentType(hit.__indexName)}</span>
      <a href={`/${hit.type || 'page'}/${hit.slug || ''}`} className="text-blue-500 hover:underline block mt-2">Read more</a>
    </div>
  );
};

const CustomHits = connectHits(({ hits }) => (
  <div className="search-results mt-4 absolute bg-white shadow-lg rounded-lg w-full lg:w-3/5 z-10">
    {hits.map(hit => <Hit key={hit.objectID} hit={hit} />)}
  </div>
));

const AlgoliaSearch = () => {
  const [query, setQuery] = useState('');

  if (!appId || !searchApiKey) {
    console.error('Algolia app ID or search API key is not defined');
    return null;
  }

  if (indices.length === 0) {
    console.error('No Algolia indices defined');
    return null;
  }

  return (
    <InstantSearch 
      searchClient={searchClient} 
      indexName={indices[0]}
    >
      <Configure hitsPerPage={5} />
      <CustomSearchBox setQuery={setQuery} />
      {query.length >= 2 && indices.map(indexName => (
        <Index key={indexName} indexName={indexName}>
          <CustomHits />
        </Index>
      ))}
    </InstantSearch>
  );
};

export default AlgoliaSearch;