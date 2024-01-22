import axios from "axios";
import {httpRoot} from "../httpConfig";
import {NullableString, getDataFields, uploadHeaders} from "@trac/datatypes";
import {UseLoginUser} from "../navigation/UseLoginUser";
import React, {useContext, useState} from "react";

export interface UserLocal {
  username: string | null;
  userpwd: string;
}

const userApi = axios.create({
  baseURL: `${httpRoot}/`,
})


export const getUsers = async ({
    uuid = null as NullableString,
    username = null as NullableString,
    userpwd = null as  NullableString,
    action  = null as  NullableString
  }) => {

    //console.log(`uuid '${uuid}' user '${username}' password '${userpwd}`)
    let uri = '/users';
    if (uuid) {
        uri += `/uuid/${uuid}`;
    }

    if (username) {
      uri += `/username/${username}`
    }

    //console.log(`getting users from uuid ${uuid}, username ${username} creates ${uri}`)
    const axiosResponse = await userApi.get(uri);
    //console.log(axiosResponse.data[0].userpwd);
    const dbpwd = axiosResponse.data[0].userpwd;
    //console.log(dbpwd);
  
    if(action === 'login') {
        return dbpwd;
    }
    else {
      return axiosResponse.data;
    }

}

export const createUser = async (user: UserLocal) =>{
  let uri = '/users/createUser';
  const axiosResponse = await userApi.post(uri, user);
  const retval = axiosResponse.data;
  //console.log("Response Data = " + retval)
  return retval;
}

export const updatePwd = async (user: UserLocal) =>{
  let uri = '/users/updatePwd';
  const axiosResponse = await userApi.post(uri, user);
  const retval = axiosResponse.data;
  //console.log("Response Data = " + retval)
  return retval;
}

