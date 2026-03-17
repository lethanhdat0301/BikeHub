import { useState } from "react";
import { useTranslation } from 'react-i18next';
import {
  FormControl,
  FormLabel,
  Input,
  Stack,
  Button,
  FormErrorMessage,
  Flex,
  InputGroup,
  useToast,
  InputLeftElement,
} from "@chakra-ui/react";
import { PhoneIcon } from "@chakra-ui/icons";
import { useAuth } from "../../../hooks/useAuth";
import axios from "../../../apis/axios";

interface RegisterCredentials {
  name: string | undefined;
  email: string;
  birthdate: any;
  phone?: string;
}

const UpdateInfoPers = () => {
  const { t } = useTranslation();
  const { user, login } = useAuth();
  const [data, setData] = useState<RegisterCredentials>({
    name: user ? user.name : "",
    email: user ? user.email : "",
    birthdate: user ? new Date(user.birthdate).toISOString().split("T")[0] : "",
    phone: user ? user.phone : "",
  });
  const [errEmail, setErrEmail] = useState(false);
  const [errName, setErrName] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const toast = useToast({ position: "top" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Handles validation input field.
   *
   */
  const validation = () => {
    if (data.email === "") {
      setErrEmail(true);
      // console.log("email empty");
    } else {
      setErrEmail(false);
    }
    if (data.name === "") {
      setErrName(true);
      // console.log("name empty");
    } else {
      setErrName(false);
    }
  };

  /**
   * Handles the form submission event.
   *
   * @param event - The form submission event object.
   */
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    //console.log(event, "submit");
    validation();
    setErrMsg("");
    setIsSubmitting(true);
    try {
      data.birthdate = new Date(data.birthdate)
      const response = await axios.put(`users/user/${user?.id}`, JSON.stringify(data), {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      // console.log(response);
      // console.log(JSON.stringify(response?.data));
      setErrMsg("");
      toast({
        title: t('profile.informationUpdated'),
        description: t('profile.informationUpdatedDesc'),
        status: "success",
        duration: 2500,
        isClosable: true,
      });
      const newBirthdate = new Date(response?.data?.birthdate).toISOString().split("T")[0];
      login({
        id: response?.data.id,
        name: response?.data?.name,
        email: response?.data?.email,
        birthdate: newBirthdate,
        phone: response?.data?.phone,
        image: response?.data?.image,
      });
      setData({ ...data, birthdate: newBirthdate });
    } catch (error: any) {
      // console.log(error);
      let errorMessage = error?.response?.data?.message;
      if (typeof errorMessage === 'string')
        errorMessage = error?.response?.data?.message;
      else
        errorMessage = error?.response?.data?.message.join(", ");

      toast({
        title: t('profile.error'),
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      if (!error?.response) {
        setErrMsg("Something went wrong. Please try again later.");
      } else if (error.response?.status === 400) {
        setErrMsg(errorMessage);
      } else if (error.response?.status === 401) {
        setErrMsg(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6 w-4/5 py-5">
      <FormControl isInvalid={errMsg != ""}>
        {errMsg && (
          <FormErrorMessage justifyContent={"center"}>
            {errMsg}
          </FormErrorMessage>
        )}
      </FormControl>
      <Flex gap={4} className="max-sm:flex-col">
        <FormControl id="name" isInvalid={errName}>
          <FormLabel>{t('profile.fullName')}</FormLabel>
          <Input
            type="text"
            value={data.name}
            onChange={(e) => {
              setData({ ...data, name: e.target.value });
            }}
            placeholder={t('profile.fullName') as string}
          />
          <FormErrorMessage>{t('profile.errorName')}</FormErrorMessage>
        </FormControl>
        <FormControl id="email" isInvalid={errEmail}>
          <FormLabel>{t('profile.email')}</FormLabel>
          <Input
            type="email"
            value={data.email}
            onChange={(e) => {
              setData({ ...data, email: e.target.value });
            }}
            placeholder={t('profile.email') as string}
          />
          <FormErrorMessage>{t('profile.errorEmail')}</FormErrorMessage>
        </FormControl>
      </Flex>
      <Flex gap={4} className="max-sm:flex-col">
        <FormControl id="birthdate">
          <FormLabel>{t('profile.dateOfBirth')}</FormLabel>
          <Input
            type="date"
            value={data.birthdate}
            onChange={(e) => {
              setData({ ...data, birthdate: e.target.value });
            }}
            placeholder={t('profile.dateOfBirth') as string}
          />
          <FormErrorMessage></FormErrorMessage>
        </FormControl>
        <FormControl id="phone">
          <FormLabel>{t('profile.phoneNumber')}</FormLabel>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <PhoneIcon color="gray.300" />
            </InputLeftElement>
            <Input
              type="tel"
              value={data.phone}
              onChange={(e) => {
                setData({ ...data, phone: e.target.value });
              }}
              placeholder={t('profile.phoneNumber') as string}
            />
          </InputGroup>
          <FormErrorMessage>{t('profile.errorPhone')}</FormErrorMessage>
        </FormControl>
      </Flex>
      <Stack spacing={2} align={"center"}>
        <Button
          width={{ base: "100%", md: "200px" }}
          color={"white"}
          colorScheme="teal"
          isLoading={isSubmitting}
          type="submit"
        >
          {t('profile.saveChange')}
        </Button> 
      </Stack>
    </form>
  );
};

export default UpdateInfoPers;
