import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import { UserProvider } from './profilepage/UserContext';
import UpcomingContests from "./profilepage/UpcomingContests";
import Dashboard from './profilepage/Dashboard';
import Discussion from './profilepage/Discussion';
import ContestCreationForm from './customcontestpage/ContestCreationForm';
import ContestProblemsTable from './customcontestpage/ContestProblemsTable';
import TimerCountdown from './customcontestpage/TimerCountdown';
import Ratings from './customcontestpage/Ratings';
import Editor from './customcontestpage/Editor';
import RecentContest from "./customcontestpage/RecentContest";
import RecentSubmissions from "./profilepage/RecentSubmissions";
import LoginSignup from "./login/loginsignup";
import ForgotPassword from "./login/ForgotPassword";
import MyFriends from "./friends/MyFriends";
import ProtectedRoute from "./components/ProtectedRoute";
import ContestPage from './profilepage/Maindashboard';
import PageTransition from './components/PageTransition';
import ContestInfo from './components/ContestInfo';
import Profile from './profilepage/Profile';
import AllPastContests from './profilepage/AllPastContests';
import ContestRankingsPage from './customcontestpage/ContestRankingsPage';
import UserProfile from './components/UserProfile';
import Navbar from './profilepage/Navbar';  
import About from './profilepage/About';
import EmailVerification from './login/EmailVerification';

// Wrap components with PageTransition HOC
// const TransitionedMainDashboard = PageTransition(MainDashboard);
const TransitionedContestCreationForm = PageTransition(ContestCreationForm);
const TransitionedContestProblemsTable = PageTransition(ContestProblemsTable);
const TransitionedRecentContests = PageTransition(RecentContest);
const TransitionedRecentSubmissions = PageTransition(RecentSubmissions);
const TransitionedUpcomingContests = PageTransition(UpcomingContests);

function App() {
  return (
    <UserProvider>
      <Router>
        {/* <Navbar /> */}
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginSignup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/email-verification" element={<EmailVerification />} />
      

          {/* Protected routes */}
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/create-contest" element={<ProtectedRoute><TransitionedContestCreationForm /></ProtectedRoute>} />
          <Route path="/contest-problems" element={<ProtectedRoute><ContestProblemsTable /></ProtectedRoute>} />
          <Route path="/timer-countdown" element={<ProtectedRoute><TimerCountdown /></ProtectedRoute>} />
          <Route path="/recent-contests" element={<ProtectedRoute><TransitionedRecentContests /></ProtectedRoute>} />
          <Route path="/recent-submissions" element={<ProtectedRoute><TransitionedRecentSubmissions /></ProtectedRoute>} />
          <Route path="/upcoming-contests" element={<ProtectedRoute><TransitionedUpcomingContests /></ProtectedRoute>} />
          <Route path="/contest-info/:contestCode" element={<ProtectedRoute><ContestInfo /></ProtectedRoute>} />
          <Route path="/my-friends" element={<ProtectedRoute><MyFriends /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/discussion" element={<ProtectedRoute><Discussion /></ProtectedRoute>} />
          <Route path="/ratings" element={<ProtectedRoute><Ratings /></ProtectedRoute>} />
          <Route path="/editor" element={<ProtectedRoute><Editor /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/all-past-contests" element={<ProtectedRoute><AllPastContests /></ProtectedRoute>} />
          <Route path="/contest-rankings" element={<ProtectedRoute><ContestRankingsPage /></ProtectedRoute>} />
          <Route path="/user/:userHandle" element={<UserProfile />} />
          <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
         <Route path="/contests" element={<ProtectedRoute><ContestPage /></ProtectedRoute>} />
          {/* Redirect any unknown routes to the main dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
