import React from 'react';

import { Icon } from '@chakra-ui/react';
import {
  MdPerson,
  MdHome,
  MdLock,
  MdOutlineShoppingCart,
  MdFolder,
} from 'react-icons/md';

// Admin Imports
import MainDashboard from 'views/admin/default';
import NFTMarketplace from 'views/admin/marketplace';
import Profile from 'views/admin/profile';
import Projects from 'views/admin/projects';

// Auth Imports
import SignInCentered from 'views/auth/signIn';
import SignUpCentered from 'views/auth/signUp';
import ForgotPasswordCentered from 'views/auth/forgotPassword';
import ResetPasswordCentered from 'views/auth/resetPassword';

const routes = [
  {
    name: 'Main Dashboard',
    layout: '/admin',
    path: '/default',
    icon: <Icon as={MdHome} width="20px" height="20px" color="inherit" />,
    component: <MainDashboard />,
  },
  {
    name: 'NFT Marketplace',
    layout: '/admin',
    path: '/nft-marketplace',
    icon: (
      <Icon
        as={MdOutlineShoppingCart}
        width="20px"
        height="20px"
        color="inherit"
      />
    ),
    component: <NFTMarketplace />,
    secondary: true,
  },
  {
    name: 'Projects',
    layout: '/admin',
    icon: <Icon as={MdFolder} width="20px" height="20px" color="inherit" />,
    path: '/projects',
    component: <Projects />,
  },
  {
    name: 'Profile',
    layout: '/admin',
    path: '/profile',
    icon: <Icon as={MdPerson} width="20px" height="20px" color="inherit" />,
    component: <Profile />,
  },
];

// Keep auth routes separate for routing purposes but exclude from sidebar
export const authRoutes = [
  {
    name: 'Sign In',
    layout: '/auth',
    path: '/sign-in',
    icon: <Icon as={MdLock} width="20px" height="20px" color="inherit" />,
    component: <SignInCentered />,
  },
  {
    name: 'Sign Up',
    layout: '/auth',
    path: '/sign-up',
    icon: <Icon as={MdLock} width="20px" height="20px" color="inherit" />,
    component: <SignUpCentered />,
  },
  {
    name: 'Forgot Password',
    layout: '/auth',
    path: '/forgot-password',
    icon: <Icon as={MdLock} width="20px" height="20px" color="inherit" />,
    component: <ForgotPasswordCentered />,
  },
  {
    name: 'Reset Password',
    layout: '/auth',
    path: '/reset-password',
    icon: <Icon as={MdLock} width="20px" height="20px" color="inherit" />,
    component: <ResetPasswordCentered />,
  },
];

export default routes;
