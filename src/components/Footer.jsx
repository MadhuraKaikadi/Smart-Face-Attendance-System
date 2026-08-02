import { Github, Linkedin, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Top Section */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-4">

          {/* Social */}
          <div className="flex items-center space-x-4">
            <img src="/logo.png" alt="Logo" className="w-20" />
            <a href="#" className="text-gray-500 hover:text-blue-600 transition">
              <Github className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-500 hover:text-blue-600 transition">
              <Linkedin className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-500 hover:text-blue-600 transition">
              <Mail className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 my-4"></div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-center items-center text-sm text-gray-500 gap-2">
          <p>
            © {new Date().getFullYear()} SurGent.Ai | Suresh Kumar. All rights reserved.
          </p>

        </div>
      </div>
    </footer>
  );
}