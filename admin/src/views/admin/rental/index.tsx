// import AdminTable from "../user/components/AdminTable";
// import { useEffect, useState } from "react";
// import useAuth from "../../../utils/auth/AuthHook";
// // import bookingRequestService, { BookingRequest } from "../../../services/bookingRequestService";

// const columnHeaders = [
//   {
//     id: "id",
//     title: "ID",
//   },
//   {
//     id: "status",
//     title: "Status",
//   },
//   {
//     id: "price",
//     title: "Price",
//   },
//   {
//     id: "bike_id",
//     title: "Bike ID",
//   },
//   {
//     id: "user_id",
//     title: "User ID",
//   },
// ];

// const Tables = () => {
//   const [tableData, setTableData] = useState([]);
//   const { user } = useAuth();

//   useEffect(() => {
//     const fetchData = async () => {
//       let url = `${process.env.REACT_APP_API_URL}rentals`;
//       if (user && user.role === "dealer") {
//         // limit rentals to bikes belonging to this dealer
//         url += `?dealer_id=${user.id}`;
//       }
//       const response = await fetch(url, { credentials: "include" });
//       console.log("-response------------")
//       console.log(response)
//       console.log("-------------")
//       const data = await response.json();
//       console.log("-response------------")
//       console.log(data)
//       console.log("-------------")
//       if (Array.isArray(data)) setTableData(data);
//       else if (data && Array.isArray((data as any).data)) setTableData((data as any).data);
//       else setTableData([]);
//     };

//     fetchData();
//   }, []);

//   return (
//     <div className="mt-5">
//       <AdminTable
//         tableContent={tableData}
//         tableHeader={columnHeaders}
//         moduleName={"rental"}
//       />
//     </div>
//   );
// };

// export default Tables;

import React, { useEffect, useState } from "react";
import AdminTable from "../user/components/AdminTable"; // reuse generic table
import { Center, Spinner, Text, Box, Heading, Tabs, TabList, TabPanels, Tab, TabPanel, Button, Table, Thead, Tbody, Tr, Th, Td, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, FormControl, FormLabel, useToast, AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter } from "@chakra-ui/react";
import bookingRequestService, { BookingRequest } from "../../../services/bookingRequestService";
import useAuth from "../../../utils/auth/AuthHook";

// Rentals columns
const rentalColumns = [
  { id: "id", title: "Booking ID" },
  { id: "name", title: "Customer" },
  { id: "vehicle", title: "Vehicle" },
  { id: "rental_period", title: "Rental Period" },
  { id: "pickup_location", title: "Location" },
  { id: "price", title: "Price" },
  { id: "status", title: "Status" },
];

// Bookings columns
const bookingColumns = [
  { id: "id", title: "ID" },
  { id: "name", title: "Name" },
  { id: "email", title: "Email" },
  { id: "contact_method", title: "Contact Method" },
  { id: "contact_details", title: "Contact Detail" },
  { id: "pickup_location", title: "Pickup Location" },
  { id: "created_at", title: "Time Created" },
];

// Rentals page - simplified to only show rentals table
const RentalsPage = () => {
  return (
    <Box>
      <RentalsTable />
    </Box>
  );
};

const RentalsTable = () => {
  const [tableData, setTableData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch rentals (includes User and Bike with Park)
        const [rRes, uRes] = await Promise.all([
          fetch(`${process.env.REACT_APP_API_URL}rentals`, { credentials: "include" }),
          fetch(`${process.env.REACT_APP_API_URL}users`, { credentials: "include" }),
        ]);
        const rData = await rRes.json();
        const uData = await uRes.json();
        const rentalsList = Array.isArray(rData) ? rData : (rData && Array.isArray((rData as any).data) ? (rData as any).data : []);

        const mapped = rentalsList.map((r: any) => ({
          id: r.id,
          name: r.User?.name || r.user_id,
          vehicle: r.Bike?.model || r.bike_id,
          rental_period: `${new Date(r.start_time).toLocaleString()}${r.end_time ? ` - ${new Date(r.end_time).toLocaleString()}` : ''}`,
          pickup_location: r.Bike?.Park?.location || r.pickup_location || "-",
          price: r.price !== undefined && r.price !== null ? r.price : '-',
          status: r.status,
        }));

        setTableData(mapped);
      } catch (error) {
        console.error("Error loading rentals:", error);
        setTableData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Center p={10}>
        <Spinner size="xl" color="teal.500" />
      </Center>
    );
  }

  return (
    <Box className="mt-5" px={4}>
      <Heading size="md" mb={4} color="teal.600">
        Rentals
      </Heading>

      {tableData.length === 0 ? (
        <Text color="gray.500">No rentals found.</Text>
      ) : (
        <AdminTable tableContent={tableData} tableHeader={rentalColumns} moduleName={"rental"} />
      )}
    </Box>
  );
};

const BookingsTable = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [data, setData] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const cancelRef = React.useRef<any>();
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [edit, setEdit] = useState<BookingRequest | null>(null);
  const [form, setForm] = useState<any>({ name: '', email: '', contact_method: '', contact_details: '', pickup_location: '' });

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await bookingRequestService.getAllBookingRequests();
      setData(res);
    } catch (err) {
      console.error('Error fetching bookings', err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const onDeleteClick = (id: number) => {
    setDeleteId(id);
    onDeleteOpen();
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await bookingRequestService.deleteBookingRequest(deleteId);
      fetchBookings();
      toast({ title: 'Booking deleted', status: 'success' });
    } catch (err) {
      console.error(err);
      toast({ title: 'Failed to delete', status: 'error' });
    } finally {
      onDeleteClose();
      setDeleteId(null);
    }
  };

  const openCreate = () => {
    setEdit(null);
    setForm({ name: '', email: '', contact_method: '', contact_details: '', pickup_location: '' });
    onOpen();
  };

  const openEdit = (b: BookingRequest) => {
    setEdit(b);
    setForm({ name: b.name, email: b.email, contact_method: b.contact_method, contact_details: b.contact_details, pickup_location: b.pickup_location, status: b.status, admin_notes: b.admin_notes });
    onOpen();
  };

  const submit = async () => {
    try {
      if (edit) {
        await bookingRequestService.updateBookingRequest(edit.id!, { status: form.status, admin_notes: form.admin_notes });
      } else {
        await bookingRequestService.createBookingRequest(form);
      }
      onClose();
      fetchBookings();
      toast({ title: 'Booking saved', status: 'success' });
    } catch (err) {
      console.error(err);
      toast({ title: 'Failed to save', status: 'error' });
    }
  };

  if (loading) return <Center p={10}><Spinner /></Center>;

  return (
    <Box mt={4} px={4}>
      <Heading size="md" mb={4} color="teal.600">Bookings</Heading>
      {user?.role === 'admin' && <Button colorScheme="teal" mb={4} onClick={openCreate}>Create Booking</Button>}
      <Table variant="simple">
        <Thead>
          <Tr>{bookingColumns.map(c => <Th key={c.id}>{c.title}</Th>)}<Th>Actions</Th></Tr>
        </Thead>
        <Tbody>
          {data.map(b => (
            <Tr key={b.id}>
              <Td>{b.id}</Td>
              <Td>{b.name}</Td>
              <Td>{b.email}</Td>
              <Td>{b.contact_method}</Td>
              <Td>{b.contact_details}</Td>
              <Td>{b.pickup_location}</Td>
              <Td>{new Date(b.created_at).toLocaleString()}</Td>
              <Td>
                {user?.role === 'admin' && <Button size="sm" mr={2} onClick={() => openEdit(b)}>Edit</Button>}
                {user?.role === 'admin' && <Button size="sm" colorScheme="red" onClick={() => onDeleteClick(b.id!)}>Delete</Button>}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{edit ? 'Edit Booking' : 'Create Booking'}</ModalHeader>
          <ModalBody>
            <FormControl mb={2}><FormLabel>Name</FormLabel><Input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} /></FormControl>
            <FormControl mb={2}><FormLabel>Email</FormLabel><Input value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} /></FormControl>
            <FormControl mb={2}><FormLabel>Contact Method</FormLabel><Input value={form.contact_method} onChange={(e) => setForm({...form, contact_method: e.target.value})} /></FormControl>
            <FormControl mb={2}><FormLabel>Contact Details</FormLabel><Input value={form.contact_details} onChange={(e) => setForm({...form, contact_details: e.target.value})} /></FormControl>
            <FormControl mb={2}><FormLabel>Pickup Location</FormLabel><Input value={form.pickup_location} onChange={(e) => setForm({...form, pickup_location: e.target.value})} /></FormControl>
            {edit && (
              <>
                <FormControl mb={2}><FormLabel>Status</FormLabel><Input value={form.status} onChange={(e) => setForm({...form, status: e.target.value})} /></FormControl>
                <FormControl mb={2}><FormLabel>Admin Notes</FormLabel><Input value={form.admin_notes} onChange={(e) => setForm({...form, admin_notes: e.target.value})} /></FormControl>
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={onClose}>Cancel</Button>
            <Button colorScheme="teal" onClick={submit}>{edit ? 'Save' : 'Create'}</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">Delete Booking</AlertDialogHeader>
            <AlertDialogBody>Are you sure you want to delete this booking?</AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>Cancel</Button>
              <Button colorScheme="red" onClick={confirmDelete} ml={3}>Delete</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default RentalsPage;