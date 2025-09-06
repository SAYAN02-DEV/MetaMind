import { BrowserRouter, Routes, Route, Outlet, Navigate } from "react-router-dom";
import NavigationBar from './components/NavigationBar';
import Footer from './components/Footer';
import './App.css'
import Dashboard from './components/Dashboard';
import LoginCard from "./components/LoginCard";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

function App() {
    return (
        <AuthProvider>
            <MainApp />
        </AuthProvider>
    );
}

function MainApp() {
  const { isLoggedIn, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Layout/>}>
            <Route index element={
              isLoggedIn ? <Navigate to="/dashboard" replace /> : <LoginCard/>
            }/>
            <Route path='/dashboard' element={
              isLoggedIn ? <Dashboard/> : <Navigate to="/" replace />
            }/>
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

function Layout(){
  return(
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <NavigationBar/>
      <Outlet/>
      <Footer/>
    </div>
  )
}

export default App
