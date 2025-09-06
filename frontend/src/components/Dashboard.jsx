import { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Clock, 
  TrendingUp, 
  Target, 
  Brain, 
  Calendar,
  Activity,
  Zap,
  Eye,
  Heart,
  Moon,
  Sun
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState('overview');

  // Hardcoded data based on backend structure
  const userData = {
    name: "Alex Johnson",
    age: 25,
    occupation: "Software Developer",
    gender: "Male",
    totalScreenTime: 6.5, // hours
    focusScore: 78,
    wellBeingScore: 85
  };

  const todayUsage = [
    { app: "Chrome", duration: 7200, category: "Productivity" },
    { app: "YouTube", duration: 3600, category: "Entertainment" },
    { app: "WhatsApp", duration: 1800, category: "Social" },
    { app: "Spotify", duration: 2400, category: "Music" },
    { app: "VS Code", duration: 10800, category: "Work" },
    { app: "Instagram", duration: 1200, category: "Social" }
  ];

  const weeklyData = [
    { day: "Mon", screenTime: 7.2, focus: 82, apps: 12 },
    { day: "Tue", screenTime: 6.8, focus: 75, apps: 15 },
    { day: "Wed", screenTime: 8.1, focus: 68, apps: 18 },
    { day: "Thu", screenTime: 5.9, focus: 88, apps: 10 },
    { day: "Fri", screenTime: 7.5, focus: 72, apps: 14 },
    { day: "Sat", screenTime: 4.2, focus: 95, apps: 8 },
    { day: "Sun", screenTime: 3.8, focus: 92, apps: 6 }
  ];

  const categoryData = [
    { name: "Work", value: 45, color: "#3B82F6" },
    { name: "Entertainment", value: 25, color: "#EF4444" },
    { name: "Social", value: 15, color: "#10B981" },
    { name: "Productivity", value: 10, color: "#F59E0B" },
    { name: "Music", color: "#8B5CF6", value: 5 }
  ];

  const challenges = [
    "Use YouTube for only 15 minutes today",
    "Take a 10-minute break every hour",
    "Close all social apps after 9 PM"
  ];

  const insights = [
    {
      icon: <TrendingUp className="w-5 h-5" />,
      title: "Screen Time Trend",
      value: "-12%",
      description: "Down from last week",
      color: "text-green-500"
    },
    {
      icon: <Target className="w-5 h-5" />,
      title: "Focus Score",
      value: "78%",
      description: "Above average",
      color: "text-blue-500"
    },
    {
      icon: <Heart className="w-5 h-5" />,
      title: "Well-being",
      value: "85%",
      description: "Excellent",
      color: "text-pink-500"
    },
    {
      icon: <Moon className="w-5 h-5" />,
      title: "Sleep Quality",
      value: "7.2h",
      description: "Good rest",
      color: "text-purple-500"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div>
      {/* Header */}
      <div className="bg-gray-900/95 backdrop-blur-md border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">
                {getGreeting()}, {userData.name}!
              </h1>
              <p className="text-gray-300">
                {currentTime.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-mono text-white">
                {currentTime.toLocaleTimeString()}
              </div>
              <div className="text-gray-300 text-sm">
                {userData.occupation}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {insights.map((insight, index) => (
            <div key={index} className="bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 border border-gray-700 hover:bg-gray-700/80 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gray-700/50 ${insight.color}`}>
                  {insight.icon}
                </div>
                <div className={`text-2xl font-bold ${insight.color}`}>
                  {insight.value}
                </div>
              </div>
              <h3 className="text-white font-semibold mb-1">{insight.title}</h3>
              <p className="text-gray-300 text-sm">{insight.description}</p>
            </div>
          ))}
        </div>

        {/* Main Content Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-800/80 backdrop-blur-md rounded-xl p-1 border border-gray-700">
            {['overview', 'analytics', 'insights'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 capitalize ${
                  activeTab === tab
                    ? 'bg-gray-700 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Today's Usage */}
            <div className="bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <Smartphone className="w-5 h-5 mr-2" />
                  Today's Usage
                </h2>
                <div className="text-2xl font-bold text-white">
                  {formatTime(todayUsage.reduce((acc, app) => acc + app.duration, 0))}
                </div>
              </div>
              <div className="space-y-3">
                {todayUsage.map((app, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-xl">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                        {app.app.charAt(0)}
                      </div>
                      <div className="ml-3">
                        <div className="text-white font-medium">{app.app}</div>
                        <div className="text-gray-400 text-sm">{app.category}</div>
                      </div>
                    </div>
                    <div className="text-white font-semibold">
                      {formatTime(app.duration)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly Trend */}
            <div className="bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Weekly Trend
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={weeklyData}>
                  <defs>
                    <linearGradient id="colorScreenTime" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: 'white'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: 'white'}} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0,0,0,0.8)', 
                      border: 'none', 
                      borderRadius: '12px',
                      color: 'white'
                    }} 
                  />
                  <Area
                    type="monotone"
                    dataKey="screenTime"
                    stroke="#3B82F6"
                    fillOpacity={1}
                    fill="url(#colorScreenTime)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* App Categories */}
            <div className="bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <Pie className="w-5 h-5 mr-2" />
                App Categories
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0,0,0,0.8)', 
                      border: 'none', 
                      borderRadius: '12px',
                      color: 'white'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {categoryData.map((category, index) => (
                  <div key={index} className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: category.color }}
                    ></div>
                    <span className="text-white text-sm">{category.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Focus vs Screen Time */}
            <div className="bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Focus vs Screen Time
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: 'white'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: 'white'}} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0,0,0,0.8)', 
                      border: 'none', 
                      borderRadius: '12px',
                      color: 'white'
                    }} 
                  />
                  <Bar dataKey="focus" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* AI Challenges */}
            <div className="bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <Brain className="w-5 h-5 mr-2" />
                Personalized Challenges
              </h2>
              <div className="space-y-4">
                {challenges.map((challenge, index) => (
                  <div key={index} className="p-4 bg-gray-700/50 rounded-xl border border-gray-600">
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                        {index + 1}
                      </div>
                      <p className="text-white">{challenge}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Well-being Tips */}
            <div className="bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <Heart className="w-5 h-5 mr-2" />
                Well-being Tips
              </h2>
              <div className="space-y-4">
                <div className="p-4 bg-gray-700/50 rounded-xl">
                  <div className="flex items-center mb-2">
                    <Eye className="w-5 h-5 text-blue-400 mr-2" />
                    <h3 className="text-white font-semibold">Eye Health</h3>
                  </div>
                  <p className="text-gray-300 text-sm">Take a 20-second break every 20 minutes to look at something 20 feet away.</p>
                </div>
                <div className="p-4 bg-gray-700/50 rounded-xl">
                  <div className="flex items-center mb-2">
                    <Zap className="w-5 h-5 text-yellow-400 mr-2" />
                    <h3 className="text-white font-semibold">Energy Boost</h3>
                  </div>
                  <p className="text-gray-300 text-sm">Stand up and stretch every hour to maintain energy levels.</p>
                </div>
                <div className="p-4 bg-gray-700/50 rounded-xl">
                  <div className="flex items-center mb-2">
                    <Moon className="w-5 h-5 text-purple-400 mr-2" />
                    <h3 className="text-white font-semibold">Better Sleep</h3>
                  </div>
                  <p className="text-gray-300 text-sm">Avoid screens 1 hour before bedtime for better sleep quality.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}