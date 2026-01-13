import { useEffect, useState } from "react";
import useAuth from "utils/auth/AuthHook";

import MiniCalendar from "components/calendar/MiniCalendar";
import { MdElectricBike, MdLocalParking, MdFace, MdAttachMoney } from "react-icons/md";
import { FaFileInvoiceDollar } from "react-icons/fa";

import Widget from "components/widget/Widget";

import TopCustomers from "./components/TopCustomers";
import HistoryTable from "./components/HistoryTable";
import RevenueChart from "./components/RevenueChart";
import BikeTierPie from "./components/BikeTierPie";

type Stats = {
  users: User[];
  parks: Park[];
  bikes: Bike[];
  rentals: Rental[];
  totalRevenue?: number;
  activeRentals?: number;
};

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const urls = ["users", "parks", "bikes", "rentals/list"];

        const allRequests = urls.map((url) =>
          fetch(process.env.REACT_APP_API_URL + url, { credentials: "include" })
        );

        const responses = await Promise.all(allRequests);
        const data = await Promise.all(
          responses.map((response) => response.json())
        );

        let users = data[0];
        let parks = data[1];
        let bikes = data[2];
        let rentals = data[3];

        // Calculate total revenue from rentals
        const totalRevenue = Array.isArray(rentals) ?
          rentals.reduce((sum, rental) => sum + (rental.price || 0), 0) : 0;

        // Count active rentals (status: active, ongoing, or confirmed)
        const activeRentals = Array.isArray(rentals) ?
          rentals.filter(rental =>
            rental.status && ['active', 'ongoing', 'confirmed'].includes(rental.status.toLowerCase())
          ).length : 0;

        console.log('Dashboard stats:', {
          users: Array.isArray(users) ? users.length : 0,
          parks: Array.isArray(parks) ? parks.length : 0,
          bikes: Array.isArray(bikes) ? bikes.length : 0,
          rentals: Array.isArray(rentals) ? rentals.length : 0,
          totalRevenue,
          activeRentals,
          userRole: user?.role
        });

        setStats({
          users,
          parks,
          bikes,
          rentals,
          totalRevenue,
          activeRentals,
        });
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchData();
  }, [user]);

  const topCardCount = user && user.role === 'admin' ? 5 : 4;

  return (
    <div>
      {/* Card widget */}

      <div className={`mt-3 grid grid-cols-1 gap-5 md:grid-cols-2 ${topCardCount === 5 ? 'lg:grid-cols-5' : 'lg:grid-cols-4'}`}>

        <Widget
          icon={<MdElectricBike className="h-7 w-7" />}
          title={"Motorbikes"}
          subtitle={(stats?.bikes?.length ?? 0).toString()}
        />
        <Widget
          icon={<FaFileInvoiceDollar className="h-6 w-6" />}
          title={"Total Rentals"}
          subtitle={(stats?.rentals?.length ?? 0).toString()}
        />
        <Widget
          icon={<MdAttachMoney className="h-7 w-7" />}
          title={"Active Rentals"}
          subtitle={(stats?.activeRentals ?? 0).toString()}
        />
        <Widget
          icon={<MdAttachMoney className="h-7 w-7" />}
          title={"Total Revenue"}
          subtitle={`${(stats?.totalRevenue ?? 0).toLocaleString('vi-VN')} VNĐ`}
        />
        {user && user.role === 'admin' && (
          <Widget
            icon={<MdFace className="h-7 w-7" />}
            title={"Users"}
            subtitle={(stats?.users?.length ?? 0).toString()}
          />
        )}
      </div>

      {/* Charts */}

      <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
        <TopCustomers />
        <HistoryTable />
      </div>

      {/* Tables & Charts */}

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
        {/* Check Table */}
        <div className="grid">
          <RevenueChart />
        </div>

        {/* Traffic chart & Pie Chart */}

        <div className="grid grid-cols-1 gap-5 rounded-[20px] md:grid-cols-2">
          <BikeTierPie />
          <div className="grid grid-cols-1 rounded-[20px]">
            <MiniCalendar />
          </div>
        </div>

        {/* Complex Table , Task & Calendar */}

        {/* Task chart & Calendar */}
      </div>
    </div>
  );
};

export default Dashboard;
