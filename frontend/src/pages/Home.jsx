function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          
          {/* Top Banner */}
          <div className="bg-blue-700 px-8 py-6 text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wide">
              Smart Campus Maintenance
            </h1>
            <p className="text-blue-100 mt-1 text-sm md:text-base">
              Complaint Management System
            </p>
          </div>

          {/* Body */}
          <div className="px-8 py-10 text-center">
            <p className="text-gray-600 text-lg mb-2">
              Adama Science and Technology University
            </p>
            <p className="text-gray-500 text-sm mb-8">
              Department of Computer Science and Engineering • Capstone Project
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/login"
                className="px-8 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition shadow-md hover:shadow-lg"
              >
                Login
              </a>
              <a
                href="/submit-complaint"
                className="px-8 py-3 border-2 border-blue-600 text-blue-600 font-medium rounded-xl hover:bg-blue-50 transition"
              >
                Submit Complaint
              </a>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-4 text-center border-t">
            <p className="text-xs text-gray-400">
              5th Year • Section 1 • 2026
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;