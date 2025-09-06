import { Brain, Settings, User, LogOut } from 'lucide-react';

export default function NavigationBar() {
    return (
        <div className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                            <Brain className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">MetaMind</h1>
                            <p className="text-white/60 text-xs">Digital Well-being</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                        <button className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200">
                            <Settings className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200">
                            <User className="w-5 h-5" />
                        </button>
                        <button className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200 flex items-center space-x-2">
                            <LogOut className="w-4 h-4" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}