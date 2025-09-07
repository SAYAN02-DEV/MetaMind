import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usageAPI } from '../utils/api';
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
  AlertTriangle,
  Sun,
  RefreshCw
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
import ChatbotOverlay from './ChatbotOverlay';

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState('overview');
  const [todayUsage, setTodayUsage] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [productivityData, setProductivityData] = useState({});
  const [focusAnalysisData, setFocusAnalysisData] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weeklyLoading, setWeeklyLoading] = useState(true);
  const [productivityLoading, setProductivityLoading] = useState(true);
  const [focusAnalysisLoading, setFocusAnalysisLoading] = useState(true);
  const [challengesLoading, setChallengesLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [geminiCallsToday, setGeminiCallsToday] = useState(0);
  const [lastGeminiCallTime, setLastGeminiCallTime] = useState(null);
  const [mlPrediction, setMlPrediction] = useState(null);
  const [mlLoading, setMlLoading] = useState(false);
  const [mlError, setMlError] = useState(null);
  const [anomalies, setAnomalies] = useState([]);
  const [anomalyLoading, setAnomalyLoading] = useState(false);
  const [anomalyError, setAnomalyError] = useState(null);
  const [yesterdayUsage, setYesterdayUsage] = useState([]);
  const [screenTimeTrend, setScreenTimeTrend] = useState(null);

  const { user } = useAuth();

  // User data from auth context
  const userData = {
    name: user?.name || "User",
    age: 25,
    occupation: user?.occupation || "Software Developer",
    gender: "Male",
    totalScreenTime: 6.5, // hours
    focusScore: 78,
    wellBeingScore: 85
  };

  // Fallback data for when no real data is available
  const fallbackUsage = [
    { app: "Chrome", duration: 7200, category: "Productivity" },
    { app: "YouTube", duration: 3600, category: "Entertainment" },
    { app: "WhatsApp", duration: 1800, category: "Social" },
    { app: "Spotify", duration: 2400, category: "Music" },
    { app: "VS Code", duration: 10800, category: "Work" },
    { app: "Instagram", duration: 1200, category: "Social" }
  ];

  // Fallback weekly data
  const fallbackWeeklyData = [
    { day: "Mon", screenTime: 7.2, focus: 82, apps: 12 },
    { day: "Tue", screenTime: 6.8, focus: 75, apps: 15 },
    { day: "Wed", screenTime: 8.1, focus: 68, apps: 18 },
    { day: "Thu", screenTime: 5.9, focus: 88, apps: 10 },
    { day: "Fri", screenTime: 7.5, focus: 72, apps: 14 },
    { day: "Sat", screenTime: 4.2, focus: 95, apps: 8 },
    { day: "Sun", screenTime: 3.8, focus: 92, apps: 6 }
  ];

  // Fallback focus analysis data
  const fallbackFocusAnalysisData = [
    { day: "Mon", screenTime: 7.2, focus: 82, apps: 12 },
    { day: "Tue", screenTime: 6.8, focus: 75, apps: 15 },
    { day: "Wed", screenTime: 8.1, focus: 68, apps: 18 },
    { day: "Thu", screenTime: 5.9, focus: 88, apps: 10 },
    { day: "Fri", screenTime: 7.5, focus: 72, apps: 14 },
    { day: "Sat", screenTime: 4.2, focus: 95, apps: 8 },
    { day: "Sun", screenTime: 3.8, focus: 92, apps: 6 }
  ];

  // Fallback challenges data
  const fallbackChallenges = [
    "Use YouTube for only 15 minutes today",
    "Take a 10-minute break every hour",
    "Close all social apps after 9 PM"
  ];

  // Calculate productivity data from today's usage and productivity analysis
  const calculateProductivityData = () => {
    if (todayUsage.length === 0 || Object.keys(productivityData).length === 0) {
      return [
        { name: "Productive", value: 0, color: "#10B981" },
        { name: "Non-Productive", value: 0, color: "#EF4444" }
      ];
    }

    let productiveTime = 0;
    let nonProductiveTime = 0;

    todayUsage.forEach(app => {
      const productivity = productivityData[app.app];
      if (productivity === "productive") {
        productiveTime += app.duration;
      } else if (productivity === "non-productive") {
        nonProductiveTime += app.duration;
      } else {
        // Default to non-productive for unknown apps
        nonProductiveTime += app.duration;
      }
    });

    const totalTime = productiveTime + nonProductiveTime;
    
    return [
      { 
        name: "Productive", 
        value: totalTime > 0 ? Math.round((productiveTime / totalTime) * 100) : 0,
        color: "#10B981" 
      },
      { 
        name: "Non-Productive", 
        value: totalTime > 0 ? Math.round((nonProductiveTime / totalTime) * 100) : 0,
        color: "#EF4444" 
      }
    ];
  };

  const productivityCategoryData = calculateProductivityData();

  // Calculate dynamic insights from real data
  const calculateInsights = () => {
    const insights = [];

    // Screen Time Trend (from real data)
    if (screenTimeTrend) {
      insights.push({
        icon: <TrendingUp className="w-5 h-5" />,
        title: "Screen Time Trend",
        value: screenTimeTrend.trend === 'decrease' ? `-${screenTimeTrend.percentage}%` : 
               screenTimeTrend.trend === 'increase' ? `+${screenTimeTrend.percentage}%` : 
               `${screenTimeTrend.percentage}%`,
        description: screenTimeTrend.message || "Compared to yesterday",
        color: screenTimeTrend.color || "text-gray-400"
      });
    } else {
      insights.push({
        icon: <TrendingUp className="w-5 h-5" />,
        title: "Screen Time Trend",
        value: "--",
        description: "Calculating...",
        color: "text-gray-400"
      });
    }

    // Focus Score (from productivity analysis)
    const todayTotalTime = todayUsage.reduce((acc, app) => acc + app.duration, 0);
    let focusScore = 0;
    let focusDescription = "No data";
    let focusColor = "text-gray-400";

    if (todayTotalTime > 0 && Object.keys(productivityData).length > 0) {
      const productiveTime = todayUsage
        .filter(app => productivityData[app.app] === "productive")
        .reduce((acc, app) => acc + app.duration, 0);
      
      focusScore = Math.round((productiveTime / todayTotalTime) * 100);
      
      if (focusScore >= 80) {
        focusDescription = "Excellent focus";
        focusColor = "text-green-500";
      } else if (focusScore >= 60) {
        focusDescription = "Good focus";
        focusColor = "text-blue-500";
      } else if (focusScore >= 40) {
        focusDescription = "Average focus";
        focusColor = "text-yellow-500";
      } else {
        focusDescription = "Needs improvement";
        focusColor = "text-red-500";
      }
    } else if (focusAnalysisData.length > 0) {
      // Fallback to focus analysis data
      const todayFocus = focusAnalysisData[focusAnalysisData.length - 1]?.focus || 0;
      focusScore = todayFocus;
      focusDescription = todayFocus >= 75 ? "Above average" : todayFocus >= 50 ? "Average" : "Below average";
      focusColor = todayFocus >= 75 ? "text-green-500" : todayFocus >= 50 ? "text-blue-500" : "text-yellow-500";
    }

    insights.push({
      icon: <Target className="w-5 h-5" />,
      title: "Focus Score",
      value: focusScore > 0 ? `${focusScore}%` : "--",
      description: focusDescription,
      color: focusColor
    });

    // Well-being Score (calculated from app balance and usage patterns)
    let wellBeingScore = 0;
    let wellBeingDescription = "No data";
    let wellBeingColor = "text-gray-400";

    if (todayTotalTime > 0) {
      // Calculate well-being based on:
      // 1. Balanced usage (not too much screen time)
      // 2. Productive vs non-productive ratio
      // 3. Variety of apps (not obsessing over one app)
      
      const screenTimeHours = todayTotalTime / 3600;
      const appVariety = todayUsage.length;
      const maxAppTime = Math.max(...todayUsage.map(app => app.duration));
      const dominanceRatio = maxAppTime / todayTotalTime;
      
      // Screen time component (0-40 points)
      let screenTimePoints = 0;
      if (screenTimeHours <= 4) screenTimePoints = 40;
      else if (screenTimeHours <= 6) screenTimePoints = 30;
      else if (screenTimeHours <= 8) screenTimePoints = 20;
      else screenTimePoints = 10;
      
      // Focus component (0-40 points)
      const focusPoints = (focusScore / 100) * 40;
      
      // Balance component (0-20 points) - lower dominance is better
      const balancePoints = Math.max(0, 20 - (dominanceRatio * 30));
      
      wellBeingScore = Math.round(screenTimePoints + focusPoints + balancePoints);
      
      if (wellBeingScore >= 80) {
        wellBeingDescription = "Excellent";
        wellBeingColor = "text-green-500";
      } else if (wellBeingScore >= 60) {
        wellBeingDescription = "Good";
        wellBeingColor = "text-blue-500";
      } else if (wellBeingScore >= 40) {
        wellBeingDescription = "Fair";
        wellBeingColor = "text-yellow-500";
      } else {
        wellBeingDescription = "Needs attention";
        wellBeingColor = "text-red-500";
      }
    }

    insights.push({
      icon: <Heart className="w-5 h-5" />,
      title: "Well-being",
      value: wellBeingScore > 0 ? `${wellBeingScore}%` : "--",
      description: wellBeingDescription,
      color: wellBeingColor
    });

    // Daily Screen Time (replace sleep quality with actual tracked metric)
    const totalScreenTimeHours = todayTotalTime / 3600;
    insights.push({
      icon: <Clock className="w-5 h-5" />,
      title: "Screen Time Today",
      value: totalScreenTimeHours > 0 ? `${totalScreenTimeHours.toFixed(1)}h` : "0h",
      description: totalScreenTimeHours > 8 ? "High usage" : totalScreenTimeHours > 4 ? "Moderate usage" : "Light usage",
      color: totalScreenTimeHours > 8 ? "text-red-500" : totalScreenTimeHours > 4 ? "text-yellow-500" : "text-green-500"
    });

    return insights;
  };

  const insights = calculateInsights();

  // Function to categorize apps
  const categorizeApp = (appName) => {
    const appCategories = {
      'Chrome': 'Productivity',
      'Firefox': 'Productivity',
      'Safari': 'Productivity',
      'Edge': 'Productivity',
      'YouTube': 'Entertainment',
      'Netflix': 'Entertainment',
      'Spotify': 'Music',
      'Apple Music': 'Music',
      'WhatsApp': 'Social',
      'Instagram': 'Social',
      'Facebook': 'Social',
      'Twitter': 'Social',
      'VS Code': 'Work',
      'IntelliJ': 'Work',
      'Xcode': 'Work',
      'Android Studio': 'Work',
      'Slack': 'Work',
      'Discord': 'Social',
      'Telegram': 'Social'
    };
    return appCategories[appName] || 'Other';
  };

  // Function to calculate screen time trend
  const calculateScreenTimeTrend = useCallback((todayTotal, yesterdayTotal) => {
    if (yesterdayTotal === 0) {
      return { percentage: 0, trend: 'neutral', color: 'text-gray-400' };
    }
    
    const percentageChange = ((todayTotal - yesterdayTotal) / yesterdayTotal) * 100;
    const roundedPercentage = Math.round(Math.abs(percentageChange));
    
    if (percentageChange > 5) {
      return {
        percentage: roundedPercentage,
        trend: 'increase',
        color: 'text-red-400',
        icon: '↗️',
        message: `${roundedPercentage}% more than yesterday`
      };
    } else if (percentageChange < -5) {
      return {
        percentage: roundedPercentage,
        trend: 'decrease',
        color: 'text-green-400',
        icon: '↘️',
        message: `${roundedPercentage}% less than yesterday`
      };
    } else {
      return {
        percentage: roundedPercentage,
        trend: 'stable',
        color: 'text-blue-400',
        icon: '➡️',
        message: 'Similar to yesterday'
      };
    }
  }, []);

  // Function to fetch today's usage data
  const fetchTodayUsage = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      console.log('Fetching usage data from API...');
      const response = await usageAPI.getCurrentUsage();
      console.log('API Response:', response.data);

      if (response.data.message === 'Success' && response.data.usage) {
        // Transform the data to include categories
        const usageWithCategories = response.data.usage.map(item => ({
          app: item.app,
          duration: item.duration,
          category: categorizeApp(item.app)
        }));
        setTodayUsage(usageWithCategories);
        
        // Calculate today's total screen time
        const todayTotal = usageWithCategories.reduce((acc, app) => acc + app.duration, 0);
        
        // Fetch yesterday's data for comparison
        fetchYesterdayUsage(todayTotal);
      } else {
        // If no data found, use fallback data
        setTodayUsage(fallbackUsage);
      }
    } catch (err) {
      console.error('Error fetching usage data:', err);
      
      // Handle authentication errors
      if (err.response?.status === 401 || err.message.includes('authentication')) {
        setError('Authentication failed. Please login again.');
        // Clear invalid token and redirect to login
        localStorage.removeItem('token');
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } else {
        setError(err.response?.data?.message || 'Failed to fetch usage data');
        // Use fallback data on other errors
        setTodayUsage(fallbackUsage);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, calculateScreenTimeTrend]);

  // Function to fetch yesterday's usage for trend comparison
  const fetchYesterdayUsage = useCallback(async (todayTotal) => {
    try {
      const response = await usageAPI.getWeeklyDurations();
      
      if (response.data.message === 'Success' && response.data.durations) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        // Find yesterday's data
        const yesterdayData = response.data.durations.find(day => 
          day.date.split('T')[0] === yesterdayStr
        );
        
        if (yesterdayData) {
          const yesterdayTotal = yesterdayData.apps.reduce((acc, app) => acc + app.duration, 0);
          setYesterdayUsage(yesterdayData.apps);
          
          // Calculate trend
          const trend = calculateScreenTimeTrend(todayTotal, yesterdayTotal);
          setScreenTimeTrend(trend);
        } else {
          // No yesterday data available
          setScreenTimeTrend({
            percentage: 0,
            trend: 'no-data',
            color: 'text-gray-400',
            icon: '📊',
            message: 'No previous day data'
          });
        }
      }
    } catch (err) {
      console.error('Error fetching yesterday usage:', err);
      setScreenTimeTrend({
        percentage: 0,
        trend: 'error',
        color: 'text-gray-400',
        icon: '⚠️',
        message: 'Unable to compare'
      });
    }
  }, [calculateScreenTimeTrend]);

  // Function to fetch weekly usage data
  const fetchWeeklyData = useCallback(async () => {
    try {
      setWeeklyLoading(true);
      console.log('Fetching weekly usage data from API...');
      
      const response = await usageAPI.getWeeklyDurations();
      console.log('Weekly API Response:', response.data);

      if (response.data.message === 'Success' && response.data.durations) {
        // Transform the data to match chart format
        const transformedData = response.data.durations.map((dayData, index) => {
          const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const date = new Date(dayData.date);
          const dayName = dayNames[date.getDay()];
          
          // Calculate total screen time for the day
          const totalDuration = Object.values(dayData.durations).reduce((sum, duration) => sum + duration, 0);
          const screenTimeHours = totalDuration / 3600; // Convert seconds to hours
          
          // Calculate focus score (mock calculation based on work apps)
          const workApps = ['VS Code', 'IntelliJ', 'Xcode', 'Android Studio', 'Slack'];
          const workDuration = Object.entries(dayData.durations)
            .filter(([app]) => workApps.includes(app))
            .reduce((sum, [, duration]) => sum + duration, 0);
          const focusScore = totalDuration > 0 ? Math.round((workDuration / totalDuration) * 100) : 0;
          
          // Count unique apps
          const appCount = Object.keys(dayData.durations).length;
          
          return {
            day: dayName,
            screenTime: Math.round(screenTimeHours * 10) / 10, // Round to 1 decimal
            focus: focusScore,
            apps: appCount,
            date: dayData.date,
            durations: dayData.durations
          };
        });
        
        console.log('Transformed weekly data:', transformedData);
        setWeeklyData(transformedData);
      } else {
        console.log('Using fallback weekly data');
        setWeeklyData(fallbackWeeklyData);
      }
    } catch (err) {
      console.error('Error fetching weekly data:', err);
      console.error('Weekly error details:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.message
      });
      
      if (err.response?.status === 401 || err.message.includes('authentication')) {
        console.error('Authentication failed for weekly data');
      } else if (err.response?.status === 404) {
        console.log('No weekly data found, using fallback');
        setWeeklyData(fallbackWeeklyData);
      } else {
        console.log('Using fallback weekly data due to error');
        setWeeklyData(fallbackWeeklyData);
      }
    } finally {
      setWeeklyLoading(false);
    }
  }, [user]);

  // Function to fetch productivity data
  const fetchProductivityData = useCallback(async () => {
    try {
      setProductivityLoading(true);
      console.log('Fetching productivity data from Gemini API...');
      
      if (!canMakeGeminiCall()) {
        console.log('Cannot make Gemini call - using fallback data');
        setProductivityData({});
        setProductivityLoading(false);
        return;
      }
      
      const response = await usageAPI.getProductivityAnalysis();
      console.log('Productivity API Response:', response.data);

      if (response.data.message === 'Success' && response.data.productivity) {
        console.log('Productivity data received:', response.data.productivity);
        setProductivityData(response.data.productivity);
      } else {
        console.log('No productivity data received');
        setProductivityData({});
      }
    } catch (err) {
      console.error('Error fetching productivity data:', err);
      console.error('Productivity error details:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.message
      });
      
      if (err.response?.status === 401 || err.message.includes('authentication')) {
        console.error('Authentication failed for productivity data');
      } else if (err.response?.status === 404) {
        console.log('No productivity data found');
        setProductivityData({});
      } else {
        console.log('Using empty productivity data due to error');
        setProductivityData({});
      }
    } finally {
      setProductivityLoading(false);
    }
  }, [user]);

  // Function to fetch focus analysis data
  const fetchFocusAnalysisData = useCallback(async () => {
    try {
      setFocusAnalysisLoading(true);
      console.log('Fetching focus analysis data from Gemini API...');
      
      if (!canMakeGeminiCall()) {
        console.log('Cannot make Gemini call - using fallback data');
        setFocusAnalysisData(fallbackFocusAnalysisData);
        setFocusAnalysisLoading(false);
        return;
      }
      
      const response = await usageAPI.getWeeklyFocusAnalysis();
      console.log('Focus Analysis API Response:', response.data);

      if (response.data.message === 'Success' && response.data.focusAnalysis && response.data.focusAnalysis.length > 0) {
        console.log('Focus analysis data received:', response.data.focusAnalysis);
        
        // Transform the data to match chart format with day names
        const transformedData = response.data.focusAnalysis.map((dayData, index) => {
          const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const date = new Date(dayData.date);
          const dayName = dayNames[date.getDay()];
          
          return {
            day: dayName,
            screenTime: dayData.screenTime,
            focus: dayData.focus,
            apps: dayData.apps,
            date: dayData.date
          };
        });
        
        console.log('Transformed focus analysis data:', transformedData);
        setFocusAnalysisData(transformedData);
      } else {
        console.log('No valid focus analysis data received, using fallback');
        console.log('Response data:', response.data);
        setFocusAnalysisData(fallbackFocusAnalysisData);
      }
    } catch (err) {
      console.error('Error fetching focus analysis data:', err);
      console.error('Focus analysis error details:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.message
      });
      
      if (err.response?.status === 401 || err.message.includes('authentication')) {
        console.error('Authentication failed for focus analysis data');
        setFocusAnalysisData(fallbackFocusAnalysisData);
      } else if (err.response?.status === 404) {
        console.log('No focus analysis data found, using fallback');
        setFocusAnalysisData(fallbackFocusAnalysisData);
      } else {
        console.log('Using fallback focus analysis data due to error');
        setFocusAnalysisData(fallbackFocusAnalysisData);
      }
    } finally {
      setFocusAnalysisLoading(false);
    }
  }, [user]);

  // Function to fetch ML behavior prediction
  const fetchMLPrediction = useCallback(async () => {
    try {
      setMlLoading(true);
      setMlError(null);
      console.log('Fetching ML behavior prediction...');
      
      const response = await usageAPI.predictMyBehavior();
      console.log('ML Prediction Response:', response.data);

      if (response.data.message === 'Behavior prediction successful' && response.data.prediction) {
        setMlPrediction(response.data);
      } else {
        setMlError('No prediction data available');
      }
    } catch (err) {
      console.error('Error fetching ML prediction:', err);
      setMlError(err.response?.data?.message || 'Failed to fetch ML prediction');
    } finally {
      setMlLoading(false);
    }
  }, []);

  const fetchAnomalyDetection = useCallback(async () => {
    try {
      setAnomalyLoading(true);
      setAnomalyError(null);
      console.log('Fetching anomaly detection...');
      
      const response = await usageAPI.getAnomalyDetection();
      console.log('Anomaly Detection Response:', response.data);

      if (response.data.message === 'Anomaly detection successful') {
        setAnomalies(response.data.anomalies || []);
      } else {
        setAnomalyError('No anomaly data available');
      }
    } catch (err) {
      console.error('Error fetching anomaly detection:', err);
      setAnomalyError(err.response?.data?.message || 'Failed to fetch anomaly detection');
    } finally {
      setAnomalyLoading(false);
    }
  }, []);

  // Function to fetch challenges data
  const fetchChallenges = useCallback(async () => {
    try {
      setChallengesLoading(true);
      console.log('Fetching challenges from Gemini API...');
      
      if (!canMakeGeminiCall()) {
        console.log('Cannot make Gemini call - using fallback data');
        setChallenges(fallbackChallenges);
        setChallengesLoading(false);
        return;
      }
      
      const response = await usageAPI.getGeminiInsights();
      console.log('Challenges API Response:', response.data);

      if (response.data.message === 'Success' && response.data.challenges && response.data.challenges.length > 0) {
        console.log('Challenges received:', response.data.challenges);
        setChallenges(response.data.challenges);
      } else {
        console.log('No challenges received, using fallback');
        console.log('Response data:', response.data);
        setChallenges(fallbackChallenges);
      }
    } catch (err) {
      console.error('Error fetching challenges:', err);
      console.error('Challenges error details:', {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        message: err.message
      });
      
      if (err.response?.status === 401 || err.message.includes('authentication')) {
        console.error('Authentication failed for challenges');
        setChallenges(fallbackChallenges);
      } else if (err.response?.status === 404) {
        console.log('No challenges found, using fallback');
        setChallenges(fallbackChallenges);
      } else {
        console.log('Using fallback challenges due to error');
        setChallenges(fallbackChallenges);
      }
    } finally {
      setChallengesLoading(false);
    }
  }, [user]);

  // Function to check if we can make Gemini API calls
  const canMakeGeminiCall = () => {
    const today = new Date().toDateString();
    const storedDate = localStorage.getItem('geminiCallDate');
    const storedCount = parseInt(localStorage.getItem('geminiCallCount') || '0');
    
    // Reset count if it's a new day
    if (storedDate !== today) {
      localStorage.setItem('geminiCallDate', today);
      localStorage.setItem('geminiCallCount', '0');
      setGeminiCallsToday(0);
      return true;
    }
    
    // Check if we're under the limit (leave some buffer, use 40 instead of 50)
    if (storedCount >= 40) {
      return false;
    }
    
    // Check if enough time has passed since last call (minimum 2 minutes)
    if (lastGeminiCallTime && Date.now() - lastGeminiCallTime < 120000) {
      return false;
    }
    
    return true;
  };
  
  // Function to increment Gemini call count
  const incrementGeminiCallCount = () => {
    const newCount = geminiCallsToday + 1;
    setGeminiCallsToday(newCount);
    localStorage.setItem('geminiCallCount', newCount.toString());
    setLastGeminiCallTime(Date.now());
  };

  // Function to refresh data with smart Gemini call management
  const handleRefresh = () => {
    // Always fetch non-Gemini data
    fetchTodayUsage(true);
    fetchWeeklyData();
    
    // Refresh ML prediction
    fetchMLPrediction();
    
    // Only fetch Gemini data if we can make calls
    if (canMakeGeminiCall()) {
      // Stagger the Gemini calls to avoid hitting rate limits
      setTimeout(() => fetchProductivityData(), 1000);
      setTimeout(() => fetchFocusAnalysisData(), 3000);
      setTimeout(() => fetchChallenges(), 5000);
    } else {
      console.log('Skipping Gemini API calls due to quota limits');
    }
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Initialize Gemini call count from localStorage
  useEffect(() => {
    const today = new Date().toDateString();
    const storedDate = localStorage.getItem('geminiCallDate');
    const storedCount = parseInt(localStorage.getItem('geminiCallCount') || '0');
    
    if (storedDate === today) {
      setGeminiCallsToday(storedCount);
    } else {
      localStorage.setItem('geminiCallDate', today);
      localStorage.setItem('geminiCallCount', '0');
      setGeminiCallsToday(0);
    }
  }, []);

  // Batch fetch function to reduce simultaneous requests
  const batchFetchData = useCallback(async () => {
    console.log('Dashboard mounted, starting batched data fetch...');
    
    try {
      // Phase 1: Essential data (parallel but limited)
      console.log('Phase 1: Fetching essential usage data...');
      await Promise.all([
        fetchTodayUsage(),
        fetchWeeklyData()
      ]);
      
      // Small delay before next phase
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Phase 2: ML prediction and anomaly detection (independent of Gemini quota)
      console.log('Phase 2: Fetching ML prediction and anomaly detection...');
      fetchMLPrediction();
      fetchAnomalyDetection();
      
      // Phase 3: Gemini-based insights (staggered if quota allows)
      if (canMakeGeminiCall()) {
        console.log('Phase 3: Fetching Gemini-based insights with delays...');
        
        // Stagger Gemini calls with longer delays to prevent rate limiting
        setTimeout(() => {
          if (canMakeGeminiCall()) {
            fetchProductivityData();
            incrementGeminiCallCount();
          }
        }, 3000);
        
        setTimeout(() => {
          if (canMakeGeminiCall()) {
            fetchFocusAnalysisData();
            incrementGeminiCallCount();
          }
        }, 6000);
        
        setTimeout(() => {
          if (canMakeGeminiCall()) {
            fetchChallenges();
            incrementGeminiCallCount();
          }
        }, 9000);
      } else {
        console.log('Skipping Gemini API calls - quota limit reached or too soon since last call');
        // Use fallback data immediately
        setProductivityData({});
        setFocusAnalysisData(fallbackFocusAnalysisData);
        setChallenges(fallbackChallenges);
        setProductivityLoading(false);
        setFocusAnalysisLoading(false);
        setChallengesLoading(false);
      }
    } catch (error) {
      console.error('Error in batch fetch:', error);
    }
  }, [fetchTodayUsage, fetchWeeklyData, fetchMLPrediction, fetchAnomalyDetection, fetchProductivityData, fetchFocusAnalysisData, fetchChallenges, canMakeGeminiCall, incrementGeminiCallCount]);

  useEffect(() => {
    // Debounce the batch fetch to prevent multiple rapid calls
    const timeoutId = setTimeout(() => {
      batchFetchData();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, []); // Only run once on mount

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
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all duration-200 disabled:opacity-50"
                    title="Refresh data"
                  >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    onClick={() => {
                      console.log('Manual API test - calling fetchTodayUsage...');
                      fetchTodayUsage(true);
                    }}
                    className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition-all duration-200"
                    title="Test API call"
                  >
                    Test API
                  </button>
                  <div className="flex flex-col items-end">
                    <div className="text-2xl font-bold text-white">
                      {formatTime(todayUsage.reduce((acc, app) => acc + app.duration, 0))}
                    </div>
                    {screenTimeTrend && (
                      <div className={`flex items-center text-sm ${screenTimeTrend.color} mt-1`}>
                        <span className="mr-1">{screenTimeTrend.icon}</span>
                        <span>{screenTimeTrend.message}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Loading State */}
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                  <span className="ml-3 text-gray-300">Loading usage data...</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayUsage.length > 0 ? (
                    todayUsage.map((app, index) => (
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
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Smartphone className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                      <p className="text-gray-400">No usage data available for today</p>
                      <p className="text-gray-500 text-sm mt-1">Start using your device to see usage statistics</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Weekly Trend */}
            <div className="bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <Calendar className="w-5 h-5 mr-2" />
                Weekly Trend
                {weeklyLoading && (
                  <div className="ml-2 w-4 h-4 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                )}
              </h2>
              
              {weeklyLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                  <span className="ml-3 text-gray-300">Loading weekly data...</span>
                </div>
              ) : (
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
              )}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Productivity Analysis */}
            
            <div className="bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <Pie className="w-5 h-5 mr-2" />
                Productivity Analysis
                {productivityLoading && (
                  <div className="ml-2 w-4 h-4 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                )}
              </h2>
              
              {productivityLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                  <span className="ml-3 text-gray-300">Analyzing productivity...</span>
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={productivityCategoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {productivityCategoryData.map((entry, index) => (
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
                    {productivityCategoryData.map((category, index) => (
                      <div key={index} className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2" 
                          style={{ backgroundColor: category.color }}
                        ></div>
                        <span className="text-white text-sm">{category.name}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Focus vs Screen Time */}
            <div className="bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Focus vs Screen Time
                {focusAnalysisLoading && (
                  <div className="ml-2 w-4 h-4 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                )}
              </h2>
              
              {focusAnalysisLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                  <span className="ml-3 text-gray-300">Analyzing focus patterns...</span>
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={focusAnalysisData}>
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
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* ML Behavior Prediction */}
            <div className="bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <Brain className="w-5 h-5 mr-2" />
                AI Behavior Analysis
                {mlLoading && (
                  <div className="ml-2 w-4 h-4 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                )}
              </h2>
              
              {mlLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                  <span className="ml-3 text-gray-300">Analyzing your behavior pattern...</span>
                </div>
              ) : mlError ? (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-red-400 text-sm">{mlError}</p>
                </div>
              ) : mlPrediction ? (
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/20">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-white font-semibold">Predicted Behavior Class</h3>
                      <div className="text-2xl font-bold text-blue-400">
                        {mlPrediction.prediction?.predicted_class}
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">Confidence Level</span>
                      <span className="text-green-400 font-medium">
                        {(mlPrediction.prediction?.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  
                  {mlPrediction.dataUsed && (
                    <div className="p-3 bg-gray-700/50 rounded-lg">
                      <h4 className="text-white text-sm font-medium mb-2">Analysis Based On:</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="text-gray-300">
                          Days Analyzed: <span className="text-white">{mlPrediction.dataUsed.daysAnalyzed}</span>
                        </div>
                        <div className="text-gray-300">
                          Avg Screen Time: <span className="text-white">{mlPrediction.dataUsed.avgScreenTimeHours}h</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <button
                    onClick={fetchMLPrediction}
                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 text-sm"
                  >
                    Refresh Analysis
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Brain className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-400">No behavior analysis available</p>
                  <button
                    onClick={fetchMLPrediction}
                    className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 text-sm"
                  >
                    Analyze My Behavior
                  </button>
                </div>
              )}
            </div>

            {/* AI Challenges */}
            <div className="bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Personalized Challenges
                {challengesLoading && (
                  <div className="ml-2 w-4 h-4 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                )}
              </h2>
              
              {challengesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                  <span className="ml-3 text-gray-300">Generating personalized challenges...</span>
                </div>
              ) : (
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
              )}
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

            {/* Anomaly Detection */}
            <div className="bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Usage Anomaly Detection
                {anomalyLoading && (
                  <div className="ml-2 w-4 h-4 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
                )}
              </h2>
              
              {anomalyLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
                  <span className="ml-3 text-gray-300">Analyzing usage patterns...</span>
                </div>
              ) : anomalyError ? (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-red-400 text-sm">{anomalyError}</p>
                </div>
              ) : anomalies && anomalies.length > 0 ? (
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-xl border border-orange-500/20">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-white font-semibold">Unusual Usage Detected</h3>
                      <div className="text-2xl font-bold text-orange-400">
                        {anomalies.length}
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm mb-4">
                      Found {anomalies.length} anomalous usage pattern{anomalies.length > 1 ? 's' : ''} in the last 7 days
                    </p>
                  </div>
                  
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {anomalies.map((anomaly, index) => (
                      <div key={index} className="p-3 bg-gray-700/50 rounded-lg border-l-4 border-orange-500">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-white font-medium text-sm">
                              {new Date(anomaly.date).toLocaleDateString('en-US', { 
                                weekday: 'short', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </div>
                            <div className="text-gray-300 text-xs">
                              {anomaly.duration_hours}h screen time
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-xs px-2 py-1 rounded ${
                              anomaly.severity === 'high' 
                                ? 'bg-red-500/20 text-red-400' 
                                : 'bg-orange-500/20 text-orange-400'
                            }`}>
                              {anomaly.severity}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <button
                    onClick={fetchAnomalyDetection}
                    className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors duration-200 text-sm"
                  >
                    Refresh Analysis
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertTriangle className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                  <p className="text-gray-400 mb-2">No anomalies detected</p>
                  <p className="text-gray-500 text-sm">Your usage patterns look normal for the last 7 days</p>
                  <button
                    onClick={fetchAnomalyDetection}
                    className="mt-3 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors duration-200 text-sm"
                  >
                    Check Again
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {/* Floating Chatbot Overlay */}
      <ChatbotOverlay />
    </div>
  );
}