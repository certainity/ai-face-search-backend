import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import Upload from './pages/Upload'
import Search from './pages/Search'
import Gallery from './pages/Gallery'
import Person from './pages/Person'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex space-x-8">
                <Link
                  to="/"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 border-b-2 border-transparent hover:border-blue-500"
                >
                  Upload
                </Link>
                <Link
                  to="/search"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 border-b-2 border-transparent hover:border-blue-500"
                >
                  Search
                </Link>
                <Link
                  to="/gallery"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 border-b-2 border-transparent hover:border-blue-500"
                >
                  Gallery
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Upload />} />
            <Route path="/search" element={<Search />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/person/:faceId" element={<Person />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
