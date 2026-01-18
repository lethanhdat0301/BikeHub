import AdminTable from "./components/AdminTable";
import { useEffect, useState } from "react";
import { useLocation } from 'react-router-dom';

const accountsHeaders = [
  { id: "name", title: "User" },
  { id: "role", title: "Role" },
  { id: "updated_at", title: "Last Login" },
  { id: "total_rentals", title: "Total Rentals" },
  { id: "total_spent", title: "Total Spent" },
  { id: "average_rating", title: "Avg Rating" },
  { id: "last_rental_date", title: "Last Rental Date" },
  { id: "status", title: "Status" },
];

const dealersHeaders = [
  { id: "name", title: "Dealer" },
  { id: "email", title: "Contact" },
  { id: "vehicles", title: "Vehicles" },
  { id: "total_rentals", title: "Rentals" },
  { id: "total_revenue", title: "Total Revenue" },
  { id: "platform_fee_est", title: "Platform Fee (Est.)" },
  { id: "current_debt", title: "Current Debt" },
  { id: "last_payment", title: "Last Payment" },
];

const customersHeaders = [
  { id: "name", title: "User" },
  { id: "updated_at", title: "Last Login" },
  { id: "total_rentals", title: "Total Rentals" },
  { id: "total_spent", title: "Total Spent" },
  { id: "average_rating", title: "Avg Rating" },
  { id: "last_rental_date", title: "Last Rental Date" },
];

const Tables: React.FC<{ initialTab?: 'accounts' | 'dealers' | 'customers' }> = ({ initialTab = 'accounts' }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [bikes, setBikes] = useState<any[]>([]);
  const [rentals, setRentals] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"accounts" | "dealers" | "customers">(initialTab as any);

  // update active tab when route passes a different initialTab
  useEffect(() => {
    setActiveTab(initialTab as any);
  }, [initialTab]);

  const location = useLocation();

  // listen for query param ?tab=dealers|accounts|customers to switch and refresh
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    const t = q.get('tab') as 'accounts' | 'dealers' | 'customers' | null;
    if (t && t !== activeTab) {
      setActiveTab(t);
    }
  }, [location.search]);

  useEffect(() => {
    const fetchData = async () => {
      const [uRes, bRes, rRes] = await Promise.all([
        fetch(`${process.env.REACT_APP_API_URL}users`, { credentials: "include" }),
        fetch(`${process.env.REACT_APP_API_URL}bikes`, { credentials: "include" }),
        fetch(`${process.env.REACT_APP_API_URL}rentals`, { credentials: "include" }),
      ]);
      const uData = await uRes.json();
      const bData = await bRes.json();
      const rData = await rRes.json();
      const usersList = Array.isArray(uData) ? uData : (uData && Array.isArray(uData.data) ? uData.data : []);
      const bikesList = Array.isArray(bData) ? bData : (bData && Array.isArray(bData.data) ? bData.data : []);
      const rentalsList = Array.isArray(rData) ? rData : (rData && Array.isArray((rData as any).data) ? (rData as any).data : []);
      setUsers(usersList);
      setBikes(bikesList);
      // store rentals locally for filtering customers
      setRentals(rentalsList);
    };

    fetchData();
  }, [activeTab]); // refetch when active tab changes to keep content fresh when user navigates via left nav or route changes


  // Dealers table data should include derived fields like vehicles count
  const dealersData = users
    .filter((u) => u.role === "dealer")
    .map((d) => {
      // bikes owned by dealer either directly via bike.dealer_id or via Park.dealer_id
      const dealerBikeIds = bikes
        .filter((b) => (b.dealer_id && b.dealer_id === d.id) || (b.Park && b.Park.dealer_id === d.id))
        .map((b) => b.id);

      // rentals for those bikes
      const dealerRentals = (rentals || []).filter((r: any) => dealerBikeIds.includes(r.bike_id));
      const totalRevenue = dealerRentals.reduce((sum: number, r: any) => sum + (Number(r.price) || 0), 0);
      const platformFeeEst = Number((totalRevenue * 0.1).toFixed(2)); // 10%
      const currentDebt = Number((totalRevenue - platformFeeEst).toFixed(2));

      // last payment: latest rental created_at or end_time for dealer's bikes
      const lastPayment = dealerRentals.length
        ? dealerRentals.reduce((latest: string | null, r: any) => {
          const candidate = r.end_time ?? r.created_at;
          if (!candidate) return latest;
          if (!latest) return candidate;
          return new Date(candidate) > new Date(latest) ? candidate : latest;
        }, null)
        : null;

      return {
        ...d,
        vehicles: bikes.filter((b) => (b.Park && b.Park.dealer_id === d.id) || b.dealer_id === d.id).length,
        total_rentals: dealerRentals.length,
        total_revenue: totalRevenue,
        platform_fee_est: platformFeeEst,
        current_debt: currentDebt,
        last_payment: lastPayment,
      };
    });

  // Customers with rentals only
  const rentalUserIds = new Set((rentals || []).map((r: any) => r.user_id));
  const customersWithRentals = users.filter((u) => rentalUserIds.has(u.id));

  // Compute aggregates per customer
  const customersData = customersWithRentals.map((u) => {
    const userRentals = (rentals || []).filter((r: any) => r.user_id === u.id);
    const totalRentals = userRentals.length;
    const totalSpent = userRentals.reduce((sum: number, r: any) => sum + (Number(r.price) || 0), 0);
    // Average rating computed from bikes rented (use bike.rating if available)
    const ratings = userRentals
      .map((r: any) => {
        const bike = bikes.find((b) => b.id === r.bike_id);
        return bike && bike.rating ? Number(bike.rating) : null;
      })
      .filter((x) => x !== null) as number[];
    const avgRating = ratings.length ? ratings.reduce((s, n) => s + n, 0) / ratings.length : 0;
    const lastRentalDate = userRentals.length
      ? userRentals.reduce((max: string, r: any) => (new Date(r.created_at) > new Date(max) ? r.created_at : max), userRentals[0].created_at)
      : null;

    return {
      ...u,
      total_rentals: totalRentals,
      total_spent: totalSpent,
      average_rating: avgRating,
      last_rental_date: lastRentalDate,
    };
  });

  // Accounts table: show all users with rental aggregates (Total Rentals, Total Spent, Avg Rating default 5, Last Rental Date)
  const accountsData = users.map((u) => {
    const userRentals = (rentals || []).filter((r: any) => r.user_id === u.id);
    const totalRentals = userRentals.length;
    const totalSpent = userRentals.reduce((sum: number, r: any) => sum + (Number(r.price) || 0), 0);
    const ratings = userRentals
      .map((r: any) => {
        const bike = bikes.find((b) => b.id === r.bike_id);
        return bike && bike.rating ? Number(bike.rating) : null;
      })
      .filter((x) => x !== null) as number[];
    // default avg rating to 5 when no rating data available
    const avgRating = ratings.length ? ratings.reduce((s, n) => s + n, 0) / ratings.length : 5;
    const lastRentalDate = userRentals.length
      ? userRentals.reduce((max: string, r: any) => (new Date(r.created_at) > new Date(max) ? r.created_at : max), userRentals[0].created_at)
      : null;

    return {
      ...u,
      total_rentals: totalRentals,
      total_spent: totalSpent,
      average_rating: avgRating,
      last_rental_date: lastRentalDate,
    };
  });

  // Render different tables based on activeTab
  return (
    <div className="mt-5">
      <div className="mb-4">
        <div>
          <h3 className="text-lg font-bold text-navy-700 dark:text-white">Users Table</h3>
          <p className="text-sm text-gray-500">Manage accounts, dealers and customers.</p>
        </div>
      </div>

      {activeTab === 'dealers' && (
        <AdminTable tableContent={dealersData} tableHeader={dealersHeaders} moduleName={'user'} />
      )}

      {activeTab === 'accounts' && (
        <AdminTable tableContent={accountsData} tableHeader={accountsHeaders} moduleName={'user'} />
      )}

      {activeTab === 'customers' && (
        <AdminTable tableContent={customersData} tableHeader={customersHeaders} moduleName={'user'} />
      )}
    </div>
  );
};

export default Tables;
