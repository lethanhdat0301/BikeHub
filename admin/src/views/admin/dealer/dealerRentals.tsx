import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import RentalTable from "../rental/components/RentalTable";
import { Box, Heading, Text, Spinner, Center } from "@chakra-ui/react";

const DealerRentals: React.FC = () => {
    const { dealerId } = useParams<{ dealerId: string }>();
    const [rentals, setRentals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dealer, setDealer] = useState<any>(null);

    const fetchDealerRentals = async () => {
        try {
            setLoading(true);

            // Fetch dealer info
            const dealerResponse = await fetch(
                `${process.env.REACT_APP_API_URL}dealers/${dealerId}`,
                { credentials: "include" }
            );
            const dealerData = await dealerResponse.json();
            setDealer(dealerData);

            // Fetch all rentals and filter by dealer's bikes
            const rentalsResponse = await fetch(
                `${process.env.REACT_APP_API_URL}rentals`,
                { credentials: "include" }
            );
            const allRentals = await rentalsResponse.json();

            // Filter rentals for this dealer's bikes
            const dealerRentals = allRentals.filter((rental: any) =>
                rental.Bike && (
                    rental.Bike.dealer_id === parseInt(dealerId!) ||
                    (rental.Bike.Park && rental.Bike.Park.dealer_id === parseInt(dealerId!))
                )
            );

            setRentals(dealerRentals);
        } catch (error) {
            console.error("Error fetching dealer rentals:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (dealerId) {
            fetchDealerRentals();
        }
    }, [dealerId]);

    if (loading) {
        return (
            <Center h="200px">
                <Spinner size="xl" color="teal.500" />
            </Center>
        );
    }

    return (
        <Box p={6}>
            <div className="mb-6">
                <Heading size="lg" color="gray.800" mb={2}>
                    {dealer?.name || "Dealer"} - Rentals
                </Heading>
                <Text color="gray.600">
                    All rental transactions for {dealer?.name || "this dealer"}'s vehicles
                </Text>
            </div>

            <RentalTable
                tableContent={rentals}
                loading={loading}
                onRefresh={fetchDealerRentals}
            />
        </Box>
    );
};

export default DealerRentals;