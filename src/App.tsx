import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Overview from './pages/Overview';
import CasePortfolio from './pages/CasePortfolio';
import CaseDetail from './pages/CaseDetail';
import Intake from './pages/Intake';
import Analytics from './pages/Analytics';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Overview />} />
          <Route path="cases" element={<CasePortfolio />} />
          <Route path="cases/:id" element={<CaseDetail />} />
          <Route path="intake" element={<Intake />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
