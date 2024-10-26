// src/components/Dashboard.js
import React from 'react';
import Statistics from './Statistics';
import SubmissionHeatMap from './SubmissionHeatMap';
import RecentActivity from './RecentActivity';
import Navbar from './Navbar';
import Footer from './Footer';
import Profile from "./Profile";
import "./Dashboard.module.css";
import { UserProvider } from './UserContext'; 

const Dashboard = () => {
  return (
  
    <UserProvider>
    <Navbar />
        <div className="Dashboard">
          <div className="left-panel">
            <Profile />
          </div>
          <div className="right-panel">
            <Statistics />
            {/* <SubmissionHeatMap /> */}
            <RecentActivity />
          </div>
        </div>
        {/* <Footer /> */}
        </UserProvider>
  );
};

export default Dashboard;
