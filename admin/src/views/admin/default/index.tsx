import { useEffect, useState } from "react";
import useAuth from "utils/auth/AuthHook";

import MiniCalendar from "components/calendar/MiniCalendar";
import { MdElectricBike, MdLocalParking, MdFace } from "react-icons/md";
import { FaFileInvoiceDollar } from "react-icons/fa";

import Widget from "components/widget/Widget";

import { User, Park, Bike, Rental } from "@prisma/client";
import TopCustomers from "./components/TopCustomers";
import HistoryTable from "./components/HistoryTable";
import RevenueChart from "./components/RevenueChart";
import BikeTierPie from "./components/BikeTierPie";

type Stats = {
  users: User[];
  parks: Park[];
  bikes: Bike[];
  rentals: Rental[];
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
        // console.log("-response------------")
        // console.log(responses)
        // console.log("-------------")
        const data = await Promise.all(
          responses.map((response) => response.json())
        );
        // console.log("-response------------")
        // console.log(data)
        // console.log("-------------")
        // If the user is a dealer, filter results to dealer-only (defensive client-side filter)
        let users = data[0];
        let parks = data[1];
        let bikes = data[2];
        let rentals = data[3];

        if (user && user.role === 'dealer') {
          parks = Array.isArray(parks) ? parks.filter((p: any) => p.dealer_id === user.id) : parks;
          bikes = Array.isArray(bikes)
            ? bikes.filter((b: any) => {
                if (b.Park && typeof b.Park === 'object') return b.Park.dealer_id === user.id;
                return parks.some((p: any) => p.id === b.park_id);
              })
            : bikes;
          // rentals/list already returns dealer-scoped rentals when a dealer token is present
        }

        setStats({
          users,
          parks,
          bikes,
          rentals,
        });
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchData();
  }, [user]);

  const topCardCount = user && user.role === 'admin' ? 4 : 3;

  return (
    <div>
      {/* Card widget */}

      <div className={`mt-3 grid grid-cols-1 gap-5 md:grid-cols-2 ${topCardCount === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4'}`}>

        <Widget
          icon={<MdElectricBike className="h-7 w-7" />}
          title={"Bikes"}
          subtitle={(stats?.bikes?.length ?? 0).toString()}
        />
        <Widget
          icon={<MdLocalParking className="h-6 w-6" />}
          title={"Parks"}
          subtitle={(stats?.parks?.length ?? 0).toString()}
        />
        {user && user.role === 'admin' && (
          <Widget
            icon={<MdFace className="h-7 w-7" />}
            title={"Users"}
            subtitle={(stats?.users?.length ?? 0).toString()}
          />
        )}
        <Widget
          icon={<FaFileInvoiceDollar className="h-6 w-6" />}
          title={"Rentals"}
          subtitle={(stats?.rentals?.length ?? 0).toString()}
        />
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
