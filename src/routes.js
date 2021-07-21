import { Navigate, useRoutes } from 'react-router-dom';
// layouts
import DashboardLayout from './layouts/dashboard';
import LogoOnlyLayout from './layouts/LogoOnlyLayout';
//

import SignUp from './pages/SignUp'
import SignIn from './pages/SignIn'
import PrivateRoute from './components/PrivateRoute'
import LoginToSpotify from './pages/LoginToSpotify'
import LoginToDeezer from './pages/LoginToDeezer'
import Layout from './components/Layout';
import Home from './pages/Home';
import Create from './pages/Create';



// ----------------------------------------------------------------------

export default function Router() {
  return useRoutes([
    {
      path: '/dashboard',
      element: <Layout />,
      children: [
        { path: '/', element: <Navigate to="/dashboard/app" replace /> },
        { path: 'app', element: <Home /> },
        { path: 'create', element: <Create /> },

      ]
    },
    {
      path: '/',
      children: [
        { path: 'signin', element: <SignIn /> },
        { path: 'signup', element: <SignUp /> },
        { path: '404', element: <NotFound /> },
        { path: '/', element: <Navigate to="/dashboard" /> },
        { path: '*', element: <Navigate to="/404" /> }
      ]
    },

    { path: '*', element: <Navigate to="/404" replace /> }
  ]);
}
