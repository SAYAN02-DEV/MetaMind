import { Heart, Github, Twitter, Mail } from 'lucide-react';

export default function Footer(){
    return(
        <footer className="bg-gray-900/95 backdrop-blur-md border-t border-gray-700 mt-16">
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                                <Heart className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-white">MetaMind</h3>
                        </div>
                        <p className="text-gray-300 mb-4 max-w-md">
                            Empowering digital well-being through intelligent insights and personalized recommendations. 
                            Take control of your screen time and improve your focus.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                <Github className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                <Mail className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                    
                    <div>
                        <h4 className="text-white font-semibold mb-4">Features</h4>
                        <ul className="space-y-2">
                            <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Screen Time Tracking</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Focus Analytics</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white transition-colors">AI Insights</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Well-being Tips</a></li>
                        </ul>
                    </div>
                    
                    <div>
                        <h4 className="text-white font-semibold mb-4">Support</h4>
                        <ul className="space-y-2">
                            <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact Us</a></li>
                        </ul>
                    </div>
                </div>
                
                <div className="border-t border-gray-700 mt-8 pt-8 text-center">
                    <p className="text-gray-400">
                        © 2024 MetaMind. Made with <Heart className="w-4 h-4 inline text-red-400" /> for digital well-being.
                    </p>
                </div>
            </div>
        </footer>
    )
}