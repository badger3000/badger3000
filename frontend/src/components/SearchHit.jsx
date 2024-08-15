import React from "react";

const SearchHit = ({hit}) => {
  const getContentType = (hit) => {
    console.log("Hit object:", hit); // Log the entire hit object for inspection

    // Try to get the type from __indexName
    if (hit.__indexName) {
      const match = hit.__indexName.match(/PUBLIC_MY_INDEX_NAME_(\w+)/);
      if (match) {
        return match[1].toLowerCase();
      }
    }

    // If __indexName didn't work, try to determine type from object structure
    if (hit.project_image) return "projects";
    if (hit.post_content) return "posts";
    if (hit.pen_id) return "codepens";

    // If we still can't determine the type, check for any key that might indicate the type
    const typeIndicators = Object.keys(hit).find((key) =>
      ["type", "content_type", "category"].includes(key)
    );
    if (typeIndicators) {
      return hit[typeIndicators].toLowerCase();
    }

    // If all else fails, return unknown
    return "unknown";
  };

  const getUrlPrefix = (type) => {
    switch (type) {
      case "projects":
        return "/projects/";
      case "posts":
        return "/blog/";
      case "codepens":
        return "/codepen/";
      default:
        return `/${type}/`;
    }
  };

  const type = getContentType(hit);
  const urlPrefix = getUrlPrefix(type);

  console.log("Determined Type and URL Prefix:", {type, urlPrefix});

  return (
    <a
      href={`${urlPrefix}${hit.slug || ""}`}
      className="search-result-item flex items-start p-4 border-b hover:bg-gray-100 transition-colors duration-200"
    >
      {hit.project_image && hit.project_image.url && (
        <img
          src={hit.project_image.url}
          alt={hit.title || "Content thumbnail"}
          className="w-24 h-auto border object-cover mr-4 rounded"
        />
      )}
      <div className="flex-grow">
        <h3 className="text-lg font-bold text-blue-600">
          {hit.title || "Untitled"}
        </h3>
        <p className="text-sm text-gray-600 mb-2">
          {hit.project_description
            ? hit.project_description.slice(0, 100) + "..."
            : "No description available"}
        </p>
        {hit.tech && (
          <div className="flex flex-wrap gap-2 mb-2">
            {hit.tech.map((tech, index) => (
              <span
                key={index}
                className="text-xs bg-gray-200 rounded-full pr-1 uppercase py-1"
              >
                {tech}
              </span>
            ))}
          </div>
        )}
        <span className="text-xs text-gray-400 block">
          Type: {type.charAt(0).toUpperCase() + type.slice(1)}
        </span>
      </div>
    </a>
  );
};

export default SearchHit;
