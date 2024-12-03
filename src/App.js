import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import OnBoarding from './pages/OnBoarding';
import Dashboard from './pages/Dashboard';
// Import your components/pages
import SignInForm from './pages/SignInForm';
import Evaluation from './pages/Evaluation';
import Quiz from './pages/Quiz';
import ViewQuiz from './pages/ViewQuiz';
import QuizResults from './pages/QuizResults';
import Support from './pages/Support';
import Subscription from './pages/Subscription';
import Profile from './pages/Profile';
import PricingSection from './pages/PricingSection';



function App()
{
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<SignInForm />} />
          <Route path="/onboarding" element={<OnBoarding />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/evaluation" element={<Evaluation />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/quizresults" element={<QuizResults />} />
          <Route path="/viewquiz" element={<ViewQuiz />} />
          <Route path="/support" element={<Support />} />
          <Route path="/subscription" element={<Subscription />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/pricing" element={<PricingSection />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
