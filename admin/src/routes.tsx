// Admin Imports
import React from "react";
import MainDashboard from "views/admin/default";
import DataTables from "views/admin/user";
import ManageBikes from "views/admin/bike";
import ManageParks from "views/admin/park";
import ManageRentals from "views/admin/rental";
import ManageBookings from "views/admin/bookings";
import InboxPage from "views/admin/inbox";
import ReferralsPage from "views/admin/referrals";

// Auth Imports
import SignIn from "views/auth/SignIn";

// Icon Imports
import {
  MdHome,
  MdMail,
  MdPeople,
  MdElectricBike,
  MdLocalParking,
  MdFace,
  MdAccountCircle,
} from "react-icons/md";
import { FaFileInvoiceDollar, FaShareAlt } from "react-icons/fa";

const routes = [
  {
    name: "Dashboard",
    layout: "/admin",
    path: "default",
    icon: <MdHome className="h-6 w-6" />,
    component: <MainDashboard />,
  },
  {
    name: "Inbox",
    layout: "/admin",
    path: "inbox",
    icon: <MdMail className="h-6 w-6" />,
    component: <React.Suspense fallback={<div/>}><InboxPage /></React.Suspense>,
  },
  {
    name: "Rentals",
    layout: "/admin",
    path: "rentals",
    icon: <FaFileInvoiceDollar className="h-6 w-6" />,
    component: <ManageRentals />,
  },
  {
    name: "Bookings",
    layout: "/admin",
    path: "bookings",
    icon: <FaFileInvoiceDollar className="h-6 w-6" />,
    component: <React.Suspense fallback={<div/>}><ManageBookings /></React.Suspense>,
  },
  {
    name: "Dealers",
    layout: "/admin",
    icon: <MdPeople className="h-6 w-6" />,
    path: "dealers",
    component: <DataTables initialTab="dealers" />,
  },
  {
    name: "All Vehicles",
    layout: "/admin",
    icon: <MdElectricBike className="h-6 w-6" />,
    path: "vehicles",
    component: <ManageBikes />,
  },
  {
    name: "Customers",
    layout: "/admin",
    icon: <MdFace className="h-6 w-6" />,
    path: "customers",
    component: <DataTables initialTab="customers" />,
  },
  {
    name: "Accounts",
    layout: "/admin",
    icon: <MdAccountCircle className="h-6 w-6" />,
    path: "accounts",
    component: <DataTables initialTab="accounts" />,
  },
  {
    name: "Referrals",
    layout: "/admin",
    path: "referrals",
    icon: <FaShareAlt className="h-6 w-6" />,
    component: <React.Suspense fallback={<div/>}><ReferralsPage /></React.Suspense>,
  },
  {
    name: "Log Out",
    layout: "/auth",
    path: "sign-in",
    icon: <MdLocalParking className="h-6 w-6" />,
    component: <SignIn />,
  },
];
export default routes;
