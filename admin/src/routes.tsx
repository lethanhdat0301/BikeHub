// Admin Imports
import React from "react";
import MainDashboard from "views/admin/default";
import ManageBikes from "views/admin/bike";
import ManageParks from "views/admin/park";
import ManageRentals from "views/admin/rental";
import Dealers from "views/admin/dealer";
import Customers from "views/admin/customer";
import Bookings from "views/admin/booking";
import Referrers from "views/admin/referrer";
import InboxPage from "views/admin/inbox";
import ReferralsPage from "views/admin/referrals";
import Tables from "views/admin/user";

// Auth Imports
import SignIn from "views/auth/SignIn";

// Icon Imports
import {
  MdHome,
  MdMail,
  MdPeople,
  MdElectricBike,
  MdLocalParking,
  MdStore,
  MdCardGiftcard,
  MdEventNote,
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
    roles: ["admin", "dealer"],
  },
  {
    name: "Dealers",
    layout: "/admin",
    icon: <MdStore className="h-6 w-6" />,
    path: "dealers",
    component: <Dealers />,
    roles: ["admin"],
  },
  {
    name: "Customers",
    layout: "/admin",
    icon: <MdPeople className="h-6 w-6" />,
    path: "customers",
    component: <Customers />,
    roles: ["admin"],
  },
  {
    name: "Bookings",
    layout: "/admin",
    icon: <MdEventNote className="h-6 w-6" />,
    path: "bookings",
    component: <Bookings />,
    roles: ["admin", "dealer"],
  },
  {
    name: "Referrals",
    layout: "/admin",
    icon: <MdCardGiftcard className="h-6 w-6" />,
    path: "referrals",
    component: <Referrers />,
    roles: ["admin", "dealer"],
  },
  {
    name: "Inbox",
    layout: "/admin",
    path: "inbox",
    icon: <MdMail className="h-6 w-6" />,
    component: <React.Suspense fallback={<div />}><InboxPage /></React.Suspense>,
    roles: ["admin"],
  },
  {
    name: "Rental",
    layout: "/admin",
    path: "rentals",
    icon: <FaFileInvoiceDollar className="h-6 w-6" />,
    component: <ManageRentals />,
    roles: ["admin", "dealer"],
  },
  {
    name: "Motorbikes",
    layout: "/admin",
    icon: <MdElectricBike className="h-6 w-6" />,
    path: "motorbikes",
    component: <ManageBikes />,
    roles: ["admin", "dealer"],
  },
  {
    name: "Parks",
    layout: "/admin",
    icon: <MdLocalParking className="h-6 w-6" />,
    path: "parks",
    component: <ManageParks />,
    roles: ["admin"],
  },
  {
    name: "Accounts",
    layout: "/admin",
    icon: <MdAccountCircle className="h-6 w-6" />,
    path: "accounts",
    component: <Tables initialTab="accounts" />,
    roles: ["admin"],
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
