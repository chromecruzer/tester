import * as React from 'react';
import {useEffect, useMemo, useState} from "react";
import {useQuery} from "@tanstack/react-query";
import _ from "lodash";


import { UserRecord } from "@trac/datatypes";
import {createUser, updatePwd, getUsers} from "../api/userApi";


const queryUsers =  {
    queryKey: ['users'],
    queryFn: () => getUsers({}),
    select: data => {
      return _.reduce(data as UserRecord[], (accum, c) => {
        accum[c.username] = c;
        return accum;
      }, {});
    },
};



const users = () => {
    const {data: users} = useQuery(queryUsers);
    if(users) {
        return _.values(users);   
    }
    return [];
}




