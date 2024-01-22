import { Console } from "console";
import React, {useContext, useState} from "react";
import {IoMdLogIn} from "react-icons/io";
import {UseLoginUser} from "./UseLoginUser";
//import users from '../assets/users.json'
import {getUsers} from '../api/userApi'
import { toInteger } from "lodash";

const dump = obj => JSON.stringify(obj, null, 2);

export interface curUser {
  uuid: string;
  username: string;
  userpwd: string;
}

export const Login = () => {
  const {appUser, UserPwd, setAppUser } = UseLoginUser();
  const [user, setUser ]= useState(appUser);
  const [pwd, setUserPwd ]= useState(UserPwd);

  const adm = document.getElementById('admMenu')!;
  const usr = document.getElementById("usrMenu")!;
  const log = document.getElementById("logMenu")!;

  /*
  if (adm !== null) {
    adm.style.display = 'none';
  }
  if (usr !== null) {
    usr.style.display = 'none';
  }
  if (log !== null) {
    log.style.display = 'none';
  }
  */
  const handleUser = e => {
    if (e.target.value)
    {
      setUser(e.target.value);
	  console.log(e.target.value);
		console.log(e.key);
		//console.log(e.key);
		if (e.which == 8 || e.keycode == 46) {
			console.log("back space");
		}
    }
  }

  const handlePwd = e => {
    if (e.target.value)
    {
      setUserPwd(e.target.value);
    }
  }

  const handleSubmit = () => {
    try {

      var loginuser={uuid: null, username: user, userpwd: pwd, action: "login"}
      const p = Promise.resolve(getUsers(loginuser));
      let dbpwd;

      const dbuser = async () => {
        const a = await p;
        // console.log("retval a = " + a);
      };
      
      p.then(value => {
        dbpwd = value;
        //console.log("Password1: " + dbpwd);
        if(dbpwd === pwd) {
          setAppUser(user);
          setUserPwd(pwd);
        } else {
          alert("Invalid UserName or Password !");
          setUser('');
          setUserPwd('');
        }

        if(user === 'admin' || appUser === 'admin') {
          adm.style.display = 'block';
          usr.style.display = 'none';
        } else {
          adm.style.display = 'none';
          usr.style.display = 'block';
        }
        log.style.display = 'block';
  
      }).catch(err => {
        console.log(err);
      });

    }
    catch (err) {
      console.error(err);
    }
  }

  return <div>
    <div id='login'>
      <div className='flex'>
        <h4 className='py-2 px-3'>Name:</h4>
        <input
          type='text'
          value={user || ''}
          id = 'username'
          name = 'username'
          placeholder='Name'
          onChange={handleUser}
          className='py-2 px-3 flex-grow cursor-pointer bg-bl-text-light text-bl-text-grey border-2 border-bl-consumer-off-white'
        />
      </div>
      <div className='flex'>
        <h4 className='py-2 px-3'>Password:</h4>
        <input
          type='password'
          id = 'password'
          name = 'password'
          value={pwd || ''}
          placeholder='Password'
          onChange={handlePwd}
          className='py-2 px-3 flex-grow cursor-pointer bg-bl-text-light text-bl-text-grey border-2 border-bl-consumer-off-white'
        />
      </div>
      <button 
        disabled={user === null || pwd === null}
        onClick={handleSubmit}
        className={`${(user === null || pwd === null)? 'button-disabled'
          : 'button-enabled'} button`}
      ><IoMdLogIn/>Login
      </button>
    </div>

  </div>


}
