import React from "react";
import { Routes as ReactRouterRoutes, Route } from "react-router-dom";
import LoginPage from "../pages/auth/login.page";
import SignupPage from "../pages/auth/signup.page";
import HomePage from "../pages/home.page";
import NotFoundPage from "../pages/error/notFound.page";
import SettingProfile from "../pages/settingProfile/settingProfile.page";
import UpdateInfoPers from "../pages/settingProfile/partials/updateInfoForm.component";
import UpdatePassword from "../pages/settingProfile/partials/updatePasswordForm.component";
import DeleteUserForm from "../pages/settingProfile/partials/deleteUserForm.component";
import PaymentPage from "../pages/PaymentPage"
import Profile from "../pages/profile/Profile.page";
import BookingPage from "../pages/booking/booking.page";
import PaymentSuccessPage from '../pages/booking/PaymentSuccess.page';
import SearchPage from "../pages/search/search.tsx";
import RequestBookingPage from "../pages/booking/booking.page.tsx";
import ReturnPage from "../pages/return/return.page.tsx";
import TrackOrderPage from "../pages/order/trackOrder.page.tsx";
import BikeDetailsPage from "../pages/bikeDetails/bikeDetails.page.tsx";
import TermsPage from "../pages/terms/terms.page.tsx";
import ChatPage from "../pages/chat/chat.page.tsx";



const Routes: React.FC = () => {
  return (
    <ReactRouterRoutes>
      <Route path="/" element={<HomePage />} />
      <Route path="setting-profile" element={<SettingProfile />}>
        <Route path="information" element={<UpdateInfoPers />} />
        <Route path="updatePassword" element={<UpdatePassword />} />
        <Route path="deleteUser" element={<DeleteUserForm />} />
      </Route>
      <Route path="profile" element={<Profile />} />
      <Route path="/Booking/:id" element={<BookingPage />} />
      <Route path="/payment-success/:id" element={<PaymentSuccessPage />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route path="login" element={<LoginPage />} />
      <Route path="signup" element={<SignupPage />} />
      <Route path="/paypal" element={<PaymentPage />} />
      <Route path="*" element={<NotFoundPage />} />
      <Route path="/" element={<HomePage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/motorcycles/:id" element={<BikeDetailsPage />} />
      <Route path="/request-booking" element={<RequestBookingPage />} />
      <Route path="/return" element={<ReturnPage />} />
      <Route path="/tracking" element={<TrackOrderPage />} />
      <Route path="/terms" element={<TermsPage />} />
    </ReactRouterRoutes>
  );
};

export { Routes };
