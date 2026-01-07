import React, { useEffect, useState } from "react";
import { Box, Heading, Center, Spinner, Button, useToast, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, FormControl, FormLabel } from "@chakra-ui/react";
import bookingRequestService, { BookingRequest } from "../../../services/bookingRequestService";
import useAuth from "../../../utils/auth/AuthHook";
import AdminTable from "../user/components/AdminTable";

const bookingColumns = [
  { id: "id", title: "ID" },
  { id: "name", title: "Name" },
  { id: "email", title: "Email" },
  { id: "contact_method", title: "Contact Method" },
  { id: "contact_details", title: "Contact Detail" },
  { id: "pickup_location", title: "Pickup Location" },
  { id: "created_at", title: "Time Created" },
];

const BookingsPage: React.FC = () => {
  const { user, isLoading } = useAuth();
  const toast = useToast();

  useEffect(() => {
    // redirect or prevent if not admin - we simply set nothing if not admin
  }, [user]);

  if (isLoading) return (<Center p={10}><Spinner /></Center>); 

  if (!user || user.role !== 'admin') {
    return (
      <Center p={10}>
        <Heading size="sm">Unauthorized</Heading>
      </Center>
    );
  }

  return (
    <Box px={4} mt={4}>
      <Heading size="md" mb={4} color="teal.600">Bookings</Heading>
      <BookingsTable />
    </Box>
  );
};

const BookingsTable = () => {
  const [data, setData] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
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
    <Box>
      <AdminTable
        tableContent={data}
        tableHeader={bookingColumns}
        moduleName={'booking'}
        resourcePath={'booking-requests'}
        allowCreate={false}
        onEdit={(row: any) => openEdit(row)}
        onDelete={async (row: any) => {
          try {
            await bookingRequestService.deleteBookingRequest(row.id);
            fetchBookings();
          } catch (err) {
            console.error(err);
            toast({ title: 'Failed to delete', status: 'error' });
          }
        }}
      />

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


    </Box>
  );
};

export default BookingsPage;
