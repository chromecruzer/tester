import {useContext, useEffect} from "react";
import {TracContext} from "../TracContext";

export interface LoginUser {
  appUser: (string | null);
  UserPwd: (string | null);
  setAppUser: (user) => void;
  setUserPwd: (pwd) => void;
  clearAppUser: () => void;
}

export const UseLoginUser = () => {
  const {tracState, setTracContext} = useContext(TracContext);
  const contextUser = tracState?.appUser;
  const localUser = localStorage.getItem('tracUser');
  const UserPwd = localStorage.getItem('tracUserPwd');

  useEffect(() => {
    setTracContext('appUser', localUser);
  }, [localUser])
  
  const setAppUser = (user) => {
    localStorage.setItem('tracUser', user);
    setTracContext('appUser', user);
  }
  
  const setUserPwd = (pwd) => {
    localStorage.setItem('tracUserPwd', pwd);
  }
  
  const clearAppUser = () => {
    localStorage.removeItem('tracUser');
    localStorage.removeItem('tracUserPwd');
    setTracContext('appUser', null);
  }
  
  return {
    appUser: contextUser,
    UserPwd,
    setAppUser,
    setUserPwd,
    clearAppUser,
  } as LoginUser
}
