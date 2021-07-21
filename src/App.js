import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home'
import Create from './pages/Create'
import ThemeConfig from './theme';
import SignUp from './pages/SignUp'
import SignIn from './pages/SignIn'
import PrivateRoute from './components/PrivateRoute'
import LoginToSpotify from './pages/LoginToSpotify'
import LoginToDeezer from './pages/LoginToDeezer'
import Notifications from './pages/Notifications';

function App() {
  return (
    <ThemeConfig>
      <BrowserRouter>
        <Routes>
          <Route path="/login-to-spotify" element={<LoginToSpotify />} />
          <Route path="/login-to-deezer" element={<LoginToDeezer />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
          <PrivateRoute path="/" element={<Home />} />
          <PrivateRoute path="/create" element={<Create />} />
          <PrivateRoute path="/notifications" element={<Notifications />} />
        </Routes>
      </BrowserRouter>
    </ThemeConfig>

  );
}

export default App;
