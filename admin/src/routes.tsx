import React from "react";

// Admin Imports
import MainDashboard from "views/admin/default";
import ManageBikes from "views/admin/bike";
import ManageParks from "views/admin/park";
import ManageRentals from "views/admin/rental";
import Dealers from "views/admin/dealer";
import Customers from "views/admin/customer";
import Bookings from "views/admin/booking";
import Referrers from "views/admin/referrer";

// Auth Imports
import SignIn from "views/auth/SignIn";

// Icon Imports
import {
  MdHome,
  MdLock,
  MdElectricBike,
  MdLocalParking,
  MdPeople,
  MdStore,
  MdCardGiftcard,
  MdEventNote,
} from "react-icons/md";
import { FaFileInvoiceDollar } from "react-icons/fa";

const routes = [
  {
    name: "Main Dashboard",
    layout: "/admin",
    path: "default",
    icon: <MdHome className="h-6 w-6" />,
    component: <MainDashboard />,
  },
  {
    name: "Dealers",
    layout: "/admin",
    icon: <MdStore className="h-6 w-6" />,
    path: "dealers",
    component: <Dealers />,
  },
  {
    name: "Customers",
    layout: "/admin",
    icon: <MdPeople className="h-6 w-6" />,
    path: "customers",
    component: <Customers />,
  },
  {
    name: "Bookings",
    layout: "/admin",
    icon: <MdEventNote className="h-6 w-6" />,
    path: "bookings",
    component: <Bookings />,
  },
  {
    name: "Referrals",
    layout: "/admin",
    icon: <MdCardGiftcard className="h-6 w-6" />,
    path: "referrals",
    component: <Referrers />,
  },
  {
    name: "Parks",
    layout: "/admin",
    icon: <MdLocalParking className="h-6 w-6" />,
    path: "parks",
    component: <ManageParks />,
  },
  {
    name: "Bikes",
    layout: "/admin",
    icon: <MdElectricBike className="h-6 w-6" />,
    path: "bikes",
    component: <ManageBikes />,
  },
  {
    name: "Rentals",
    layout: "/admin",
    icon: <FaFileInvoiceDollar className="h-6 w-6" />,
    path: "rentals",
    component: <ManageRentals />,
  },
  {
    name: "Log Out",
    layout: "/auth",
    path: "sign-in",
    icon: <MdLock className="h-6 w-6" />,
    component: <SignIn />,
  },
];
export default routes;
