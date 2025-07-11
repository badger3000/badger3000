export default function SkillsTech() {
  return (
    <>
      <h2 className="font-inter-tight text-lg font-semibold text-gray-800 dark:text-gray-100 mb-6 text-center">
        Skills & Technologies
      </h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-hover bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-bold text-gray-900 mb-4 text-lg">Frontend</h3>
          <div className="flex flex-wrap gap-2">
            <span className="skill-badge bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-sm font-medium transition-all duration-200">
              React
            </span>
            <span className="skill-badge bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium transition-all duration-200">
              Vue.js
            </span>
            <span className="skill-badge bg-red-50 text-red-700 px-3 py-1 rounded-full text-sm font-medium transition-all duration-200">
              Angular
            </span>
            <span className="skill-badge bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium transition-all duration-200">
              JavaScript
            </span>
            <span className="skill-badge bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium transition-all duration-200">
              TypeScript
            </span>
            <span className="skill-badge bg-pink-50 text-pink-700 px-3 py-1 rounded-full text-sm font-medium transition-all duration-200">
              SASS
            </span>
          </div>
        </div>

        <div className="card-hover bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-bold text-gray-900 mb-4 text-lg">Backend</h3>
          <div className="flex flex-wrap gap-2">
            <span className="skill-badge bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium transition-all duration-200">
              Node.js
            </span>
            <span className="skill-badge bg-red-50 text-red-700 px-3 py-1 rounded-full text-sm font-medium transition-all duration-200">
              Scala
            </span>
            <span className="skill-badge bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm font-medium transition-all duration-200">
              MongoDB
            </span>
            <span className="skill-badge bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium transition-all duration-200">
              CMS Development
            </span>
          </div>
        </div>

        <div className="card-hover bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-bold text-gray-900 mb-4 text-lg">
            Tools & Platforms
          </h3>
          <div className="flex flex-wrap gap-2">
            <span className="skill-badge bg-gray-50 text-gray-700 px-3 py-1 rounded-full text-sm font-medium transition-all duration-200">
              Git
            </span>
            <span className="skill-badge bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium transition-all duration-200">
              JIRA
            </span>
            <span className="skill-badge bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm font-medium transition-all duration-200">
              WordPress
            </span>
            <span className="skill-badge bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-sm font-medium transition-all duration-200">
              Magento
            </span>
          </div>
        </div>

        <div className="card-hover bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h3 className="font-bold text-gray-900 mb-4 text-lg">Design & UX</h3>
          <div className="flex flex-wrap gap-2">
            <span className="skill-badge bg-pink-50 text-pink-700 px-3 py-1 rounded-full text-sm font-medium transition-all duration-200">
              UI/UX Design
            </span>
            <span className="skill-badge bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm font-medium transition-all duration-200">
              Prototyping
            </span>
            <span className="skill-badge bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium transition-all duration-200">
              Responsive Design
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
