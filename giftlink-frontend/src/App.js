import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SearchPage from './components/SearchPage/SearchPage'
import DetailsPage from './components/DetailsPage/DetailsPage'
import MainPage from './components/MainPage/MainPage';
import RegisterPage from './components/RegisterPage/RegisterPage';
import LoginPage from './components/LoginPage/LoginPage';
import Profile from './components/Profile/Profile';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Navbar from './components/Navbar/Navbar';

function App() {

  return (
    <>
        <Navbar/>
        <Routes>
            {/* the final code will not pass the products to every page, but each page will call the server API */}
            <Route path="/" element={<MainPage />} />
            <Route path="/app" element={<MainPage />} />
            <Route path="/app/search" element={<SearchPage />} />
            <Route path="/app/login" element={<LoginPage />} />
            <Route path="/app/register" element={<RegisterPage />} />
            <Route path="/app/product/:productId" element={<DetailsPage />} />
            <Route path="/app/profile" element={<Profile />} />
        </Routes>
    </>
  );
}

export default App;
