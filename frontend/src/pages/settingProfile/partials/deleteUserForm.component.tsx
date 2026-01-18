import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Button,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import React, { useState } from "react";
import axios from "../../../apis/axios";
import { useAuth } from "../../../hooks/useAuth";
import { useTranslation } from "react-i18next";

interface DeleteUserFormProps {
  className?: string;
}

const DeleteUserForm: React.FC<DeleteUserFormProps> = ({
  className = "",
}) => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [errPassword, setErrPassword] = useState(false);
  const toast = useToast({ position: "top" });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  const [errMsg, setErrMsg] = useState("");

  const handleClick = async () => {
    setErrPassword(false);

    try {
      const response = await axios.delete(`/users/delete/${user?.id}`, { data: { password }, withCredentials: true, });
      // Handle success response
      // console.log(response);
      toast({
        title: t('deleteAccount.successTitle'),
        description: t('deleteAccount.successMessage'),
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      logout();
    } catch (error: any) {
      // console.log(error);
      let errorMessage = error?.response?.data?.message;
      if (typeof errorMessage === "string") {
        errorMessage = error?.response?.data?.message;
        setErrMsg(errorMessage);
      } else {
        errorMessage = error?.response?.data?.message.join(", ");
        setErrMsg(errorMessage);
      }
      toast({
        title: t('deleteAccount.errorTitle'),
        description: errorMessage || t('deleteAccount.errorMessage'),
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <section className={`p-5 space-y-6 ${className}`}>
      <header>
        <h2 className="text-lg font-medium text-gray-900">{t('deleteAccount.title')}</h2>

        <p className="mt-1 text-sm text-gray-600">
          {t('deleteAccount.description')}
        </p>
      </header>

      <Button colorScheme="red" onClick={onOpen}>
        {t('deleteAccount.buttonLabel')}
      </Button>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <form>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                {t('deleteAccount.confirmTitle')}
              </AlertDialogHeader>

              <AlertDialogBody>
                {t('deleteAccount.confirmMessage')}
              </AlertDialogBody>
              <AlertDialogBody>
                <FormControl id="password" isInvalid={errPassword}>
                  <FormLabel>{t('deleteAccount.passwordLabel')}</FormLabel>
                  <InputGroup>
                    <Input
                      isInvalid={errMsg != ""}
                      errorBorderColor="crimson"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />

                    <InputRightElement h={"full"}>
                      <Button
                        variant={"ghost"}
                        onClick={() =>
                          setShowPassword((showPassword) => !showPassword)
                        }
                      >
                        {showPassword ? <ViewIcon /> : <ViewOffIcon />}
                      </Button>
                    </InputRightElement>
                  </InputGroup>
                  <FormErrorMessage>
                    {t('deleteAccount.passwordError')}
                  </FormErrorMessage>
                </FormControl>
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={onClose}>
                  {t('deleteAccount.cancelButton')}
                </Button>
                <Button colorScheme="red" onClick={handleClick} ml={3}>
                  {t('deleteAccount.deleteButton')}
                </Button>
              </AlertDialogFooter>
            </form>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </section>
  );
};

export default DeleteUserForm;
