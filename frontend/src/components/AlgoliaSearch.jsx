import React, {useState} from "react";
import algoliasearch from "algoliasearch/lite";
import {
  InstantSearch,
  Configure,
  connectSearchBox,
  connectHits,
  Index,
} from "react-instantsearch-dom";
import SearchHit from "./SearchHit";

const appId = import.meta.env.PUBLIC_MY_ALGOLIA_APP_ID;
const searchApiKey = import.meta.env.PUBLIC_MY_ALGOLIA_SEARCH_API_KEY;

const indices = [
  import.meta.env.PUBLIC_MY_INDEX_NAME_CODEPENS,
  import.meta.env.PUBLIC_MY_INDEX_NAME_ARTICLES,
  import.meta.env.PUBLIC_MY_INDEX_NAME_PROJECTS,
].filter(Boolean);

const searchClient = algoliasearch(appId || "", searchApiKey || "");

const CustomSearchBox = connectSearchBox(
  ({currentRefinement, refine, setQuery}) => (
    <div className="search-container flex w-full">
      <input
        className="px-6 py-4 bg-transparent text-dark focus:outline-none w-full lg:w-3/5 bg-white rounded-tl-lg rounded-bl-lg transition-all duration-300"
        type="search"
        value={currentRefinement}
        onChange={(event) => {
          refine(event.currentTarget.value);
          setQuery(event.currentTarget.value);
        }}
        placeholder="Search..."
      />
      <button
        className="bg-white font-bold rounded-tr-lg rounded-br-lg py-3 pr-6"
        aria-label="Search"
      >
        <i className="fa-solid fa-search text-secondary text-2xl"></i>
      </button>
    </div>
  )
);

const CustomHits = connectHits(({hits}) => (
  <div className="search-results mt-4 absolute bg-white shadow-lg rounded-br-lg rounded-bl-lg top-[35px] w-full lg:w-3/5 z-20">
    {hits.map((hit) => (
      <SearchHit key={hit.objectID} hit={hit} />
    ))}
  </div>
));

const AlgoliaSearch = () => {
  const [query, setQuery] = useState("");

  if (!appId || !searchApiKey) {
    console.error("Algolia app ID or search API key is not defined");
    return null;
  }

  if (indices.length === 0) {
    console.error("No Algolia indices defined");
    return null;
  }

  return (
    <InstantSearch searchClient={searchClient} indexName={indices[0]}>
      <Configure
        hitsPerPage={5}
        attributesToRetrieve={[
          "title",
          "slug",
          "type",
          "web_url",
          "order",
          "tech",
          "project_description",
          "project_image",
          "excerpt",
          "main_image",
          "description",
          "penUrl",
          "thumbnail",
        ]}
        attributesToHighlight={[
          "title",
          "project_description",
          "type",
          "tech",
          "excerpt",
          "description",
        ]}
      />
      <CustomSearchBox setQuery={setQuery} />
      {query.length >= 2 &&
        indices.map((indexName) => (
          <Index key={indexName} indexName={indexName}>
            <CustomHits />
          </Index>
        ))}
    </InstantSearch>
  );
};

export default AlgoliaSearch;
