import React from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';

const InboxPage: React.FC = () => {
  return (
    <Box className="mt-5 p-4">
      <Heading size="md" mb={4} color="teal.600">Inbox</Heading>
      <Text color="gray.500">Inbox is currently empty.</Text>
    </Box>
  );
};

export default InboxPage;
