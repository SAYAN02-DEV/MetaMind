import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import NavigationBar from './components/NavigationBar';
import Footer from './components/Footer';
import './App.css'
import Dashboard from './components/Dashboard';

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Layout/>}>
            <Route index element={<Dashboard/>}/>
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
