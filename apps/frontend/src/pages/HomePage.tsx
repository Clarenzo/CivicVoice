import { Link } from "react-router-dom"
import { MessageSquare, Search, FileCheck, Shield, Globe } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">CivicVoice</span>
            </div>
            <nav className="flex items-center gap-4">
              <Link to="/track" className="text-gray-600 hover:text-gray-900 font-medium">
                Track Complaint
              </Link>
              <Link to="/submit" className="btn-primary">
                Submit Complaint
              </Link>
              <Link to="/login" className="btn-secondary">
                Sign In
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Your Voice. Your Government.<br />
            Every Complaint Heard.
          </h1>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Submit complaints, track their progress, and help improve public services.
            Your feedback matters to us.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/submit" className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors">
              Submit a Complaint
            </Link>
            <Link to="/track" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors">
              Track Existing
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Submit Your Complaint</h3>
              <p className="text-gray-600">
                Fill out our simple form with details about your concern. You can submit anonymously or create an account.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Get a Tracking Number</h3>
              <p className="text-gray-600">
                Receive a unique tracking number (e.g., CV-2026-000001) to monitor your complaint"s progress.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Track & Get Updates</h3>
              <p className="text-gray-600">
                Check the status anytime using your tracking number. Get notified when your complaint is resolved.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Why Use CivicVoice?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card">
              <Search className="w-10 h-10 text-primary-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Real-time Tracking</h3>
              <p className="text-gray-600 text-sm">
                Monitor your complaint status 24/7 with our easy-to-use tracking system.
              </p>
            </div>
            <div className="card">
              <FileCheck className="w-10 h-10 text-primary-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Document Upload</h3>
              <p className="text-gray-600 text-sm">
                Attach photos and documents as evidence to support your complaint.
              </p>
            </div>
            <div className="card">
              <Shield className="w-10 h-10 text-primary-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Secure & Private</h3>
              <p className="text-gray-600 text-sm">
                Your data is encrypted and protected. Submit anonymously if preferred.
              </p>
            </div>
            <div className="card">
              <Globe className="w-10 h-10 text-primary-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Available in Swahili</h3>
              <p className="text-gray-600 text-sm">
                Access the portal in English or Swahili for your convenience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-8 h-8 text-primary-400" />
                <span className="text-xl font-bold text-white">CivicVoice</span>
              </div>
              <p className="text-sm">
                Empowering citizens to make their voices heard and improve public services.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/submit" className="hover:text-white">Submit Complaint</Link></li>
                <li><Link to="/track" className="hover:text-white">Track Complaint</Link></li>
                <li><Link to="/login" className="hover:text-white">Sign In</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Contact</h4>
              <p className="text-sm">
                Government Complaints Office<br />
                Nairobi, Kenya<br />
                complaints@government.go.ke
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>© {new Date().getFullYear()} CivicVoice. Built for the people of Kenya.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
