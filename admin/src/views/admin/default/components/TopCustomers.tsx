import { useEffect, useState } from "react";
import apiClient from "services/api";
import Card from "components/card";
import { BarChartOptionsTopCustomers } from "variables/charts-config";
import { MdBarChart } from "react-icons/md";
import Chart from "react-apexcharts";

interface User {
  id: string;
  name: string;
}

interface Rental {
  user_id: string;
  bike_id: string;
}

const TopCustomers = () => {
  const [customerNames, setCustomerNames] = useState<string[]>([]);
  const [chartData, setChartData] = useState<
    { name: string; data: number[] }[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const rentalsResponse = await apiClient.get("rentals/list");
        console.log("-response rentalsResponse------------")
        console.log(rentalsResponse.data)
        console.log("-------------")
        
        // Handle both array and object responses
        let rentals: Rental[] = [];
        if (Array.isArray(rentalsResponse.data)) {
          rentals = rentalsResponse.data;
        } else if (rentalsResponse.data && Array.isArray(rentalsResponse.data.data)) {
          rentals = rentalsResponse.data.data;
        }

        // Count rentals by user
        const rentalCounts: { [userId: string]: number } = {};
        const userMap: { [userId: string]: string } = {};

        rentals.forEach((rental) => {
          rentalCounts[rental.user_id] = (rentalCounts[rental.user_id] || 0) + 1;
          // Use user name if included in rental.User
          if ((rental as any).User && (rental as any).User.name) {
            userMap[rental.user_id] = (rental as any).User.name;
          }
        });

        // Convert to array of { id, name, count }
        const usersFromRentals = Object.keys(rentalCounts).map((id) => ({
          id,
          name: userMap[id] || id,
          count: rentalCounts[id],
        }));

        // Sort by count and take top 5
        const sortedUsers = usersFromRentals.sort((a, b) => b.count - a.count).slice(0, 5);

        const chartDataTransform = {
          name: "Rents Count",
          data: sortedUsers.map((u) => u.count),
        };
        const customerNames = sortedUsers.map((u) => u.name);
        setChartData([chartDataTransform]);
        setCustomerNames(customerNames);
      } catch (error) {
        console.error(error);
        // Set empty data to prevent chart errors
        setChartData([{ name: "Rents Count", data: [] }]);
        setCustomerNames([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Card extra="flex flex-col bg-white w-full rounded-3xl py-6 px-2 text-center">
      <div className="mb-auto flex items-center justify-between px-6">
        <h2 className="text-lg font-bold text-navy-700 dark:text-white">
          Top Customersx
        </h2>
        <button className="!linear z-[1] flex items-center justify-center rounded-lg bg-lightPrimary p-2 text-teal-600 !transition !duration-200 hover:bg-gray-100 active:bg-gray-200 dark:bg-navy-700 dark:text-white dark:hover:bg-white/20 dark:active:bg-white/10">
          <MdBarChart className="h-6 w-6" />
        </button>
      </div>

      <div className="flex h-full w-full flex-row justify-between sm:flex-wrap lg:flex-nowrap 2xl:overflow-hidden">
        <div className="h-full w-full">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : chartData.length === 0 || chartData[0]?.data.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-gray-500">No customer data available</p>
            </div>
          ) : (
            <Chart
              options={BarChartOptionsTopCustomers(customerNames)}
              series={chartData}
              type="bar"
              width="100%"
              height="100%"
            />
          )}
        </div>
      </div>
    </Card>
  );
};

export default TopCustomers;
