export default function Newsletter() {
  return (
    <section>
      <h2 className="font-inter-tight text-lg font-semibold text-gray-800 dark:text-gray-100 mb-6">
        Let's Connect
      </h2>
      <div className="p-5 rounded-xl bg-gradient-to-tr from-gray-100 to-gray-50 dark:bg-gradient-to-tr dark:from-gray-800 dark:to-gray-800/[0.65]">
        <form>
          <div className="flex bg-white dark:bg-gray-900 p-2 rounded-lg focus-within:ring-2 ring-gray-300 dark:ring-gray-600">
            <input
              className="flex-1 text-sm bg-transparent text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600 border-none focus:ring-0 focus:outline-none"
              type="email"
              name="email"
              aria-label="Enter your email to subscribe my newsletter"
              placeholder="Enter your email..."
              autoComplete="off"
            />
            <button className="btn-sm text-gray-200 dark:text-gray-800 bg-gradient-to-r from-gray-800 to-gray-700 dark:from-gray-300 dark:to-gray-100 dark:hover:bg-gray-100 shadow relative before:absolute before:inset-0 before:rounded-[inherit] before:bg-[linear-gradient(45deg,transparent_25%,theme(colors.white/.2)_50%,transparent_75%,transparent_100%)] dark:before:bg-[linear-gradient(45deg,transparent_25%,theme(colors.white)_50%,transparent_75%,transparent_100%)] before:bg-[length:250%_250%,100%_100%] before:bg-[position:200%_0,0_0] before:bg-no-repeat before:[transition:background-position_0s_ease] hover:before:bg-[position:-100%_0,0_0] hover:before:duration-[1500ms]">
              Join Newsletter
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
