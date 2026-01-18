import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import axios from "../../../apis/axios";
import { useNavigate, useLocation } from "react-router-dom";

import {
  FormControl,
  FormLabel,
  Input,
  Checkbox,
  Stack,
  Button,
  FormErrorMessage,
  Text,
  InputRightElement,
  InputGroup,
  useToast,
} from "@chakra-ui/react";
import { useAuth } from "../../../hooks/useAuth";

interface LoginCredentials {
  email: string;
  password: string;
}

const LoginForm: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const stateLocation = useLocation().state;
  const toast = useToast({ position: "top" });
  const { login } = useAuth();
  const [data, setData] = useState<LoginCredentials>({
    email: "",
    password: "",
  });
  const [errEmail, setErrEmail] = useState(false);
  const [errPassword, setErrPassword] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  /**
   * Handles the change event for the email input field.
   *
   * @param event - The change event object.
   */
  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setData({ ...data, email: event.target.value });
  };

  /**
   * Handles the change event for the password input field.
   *
   * @param event - The change event object.
   */
  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setData({ ...data, password: event.target.value });
  };

  /**
   * Handles the form submission event.
   *
   * @param event - The form submission event object.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (!data.email) {
      setErrPassword(true);
    } else {
      setErrPassword(false);
    }
    if (!data.password) {
      setErrEmail(true);
    } else {
      setErrEmail(false);
    }

    try {
      // Make a POST request to your login endpoint
      const response = await axios.post("/auth/login", JSON.stringify(data), {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      const userRes = response?.data?.user;
      // console.log("userRes", userRes);
      login({
        id: userRes.id,
        name: userRes?.name,
        email: userRes?.email,
        birthdate: userRes?.birthdate,
        phone: userRes?.phone,
        image: userRes?.image,
      });
      setData({ email: "", password: "" });
      setErrMsg("");
      setIsSubmitting(false);
      navigate(stateLocation?.from ? stateLocation.from : "/");
      toast({
        title: t("auth.loginSuccessful"),
        description: t("auth.loginSuccessfulDesc"),
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (error: any) {
      if (!error?.response) {
        setErrMsg(t("auth.somethingWentWrong"));
        toast({
          title: t("auth.error"),
          description: t("auth.somethingWentWrong"),
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } else if (error.response?.status === 400) {
        setErrMsg(error.response.data?.message[0]);
        toast({
          title: t("auth.error"),
          description: error.response.data?.message[0],
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } else if (error.response?.status === 401) {
        setErrMsg(error.response.data?.message);
        toast({
          title: t("auth.error"),
          description: error.response.data?.message[0],
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6 w-4/5">
      <FormControl isInvalid={errMsg != ""}>
        {errMsg && (
          <FormErrorMessage justifyContent={"center"}>
            {errMsg}
          </FormErrorMessage>
        )}
      </FormControl>

      <FormControl id="email" isInvalid={errEmail}>
        <FormLabel>{t("auth.emailAddress")}</FormLabel>
        <Input
          isInvalid={errEmail || errMsg != ""}
          errorBorderColor="crimson"
          type="email"
          value={data.email}
          onChange={handleEmailChange}
        />
        <FormErrorMessage>{t("auth.errorEmailEmpty")}</FormErrorMessage>
      </FormControl>
      <FormControl id="password" isInvalid={errPassword}>
        <FormLabel>{t("auth.password")}</FormLabel>
        <InputGroup>
          <Input
            isInvalid={errPassword || errMsg != ""}
            errorBorderColor="crimson"
            type={showPassword ? "text" : "password"}
            value={data.password}
            onChange={handlePasswordChange}
          />

          <InputRightElement h={"full"}>
            <Button
              variant={"ghost"}
              onClick={() => setShowPassword((showPassword) => !showPassword)}
            >
              {showPassword ? <ViewIcon /> : <ViewOffIcon />}
            </Button>
          </InputRightElement>
        </InputGroup>
        <FormErrorMessage>password should not be empty</FormErrorMessage>
      </FormControl>

      <Stack spacing={2}>
        <Stack
          direction={{ base: "column", sm: "row" }}
          align={"start"}
          justify={"space-between"}
        >
          <Checkbox colorScheme="teal">{t("auth.rememberMe")}</Checkbox>
          <Link to="/login">
            <Text color={"teal.400"}>{t("auth.forgotPassword")}</Text>
          </Link>
        </Stack>
        <Button
          colorScheme="teal"
          color={"white"}
          _hover={{
            bg: "blue.500",
          }}
          isLoading={isSubmitting}
          type="submit"
        >
          {t("auth.signIn")}
        </Button>
      </Stack>

      <p className="text-sm text-center font-light text-gray-500 dark:text-gray-400">
        {t("auth.dontHaveAccount")}{" "}
        <Link
          to="/signup"
          className="font-medium text-teal-600 hover:underline dark:text-teal-500"
        >
          {t("auth.signUp")}
        </Link>
      </p>
    </form>
  );
};

export default LoginForm;
