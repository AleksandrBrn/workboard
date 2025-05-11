import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<HomePage />} />
        {/** here are other routes */}
      </Routes>
    </div>
  );
}

export default App;
