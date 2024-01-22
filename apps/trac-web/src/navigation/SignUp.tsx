import React, {useContext, useState} from "react";
import {IoMdLogIn} from "react-icons/io";
import {UseLoginUser} from "./UseLoginUser";

const dump = obj => JSON.stringify(obj, null, 2);



export const SignUp = () => {
  const [formData, setFormData] = useState({
    name: "",
    password: "",
    password2: "",
  });

  const {appUser, setAppUser} = UseLoginUser();
  const [user, setUser ]= useState(appUser);
  const handleUser = e => {
    setUser(e.target.value);
  }

  const handleSubmit = () => {
    setAppUser(user);
  }

  return <div>
    <div className='flex'>
    <h1 className='font-bold text-4xl self-center'>Registration</h1>
    </div>
    <div className='flex'>
      <h4 className='py-2 px-3'>Name:</h4>
      <input
        type='text'
        value={user || ''}
        placeholder='Name'
        onChange={handleUser}
        className='py-2 px-3 flex-grow cursor-pointer bg-bl-text-light text-bl-text-grey border-2 border-bl-consumer-off-white'
      />
    </div>
    <div className='flex'>
      <h4 className='py-2 px-3'>Email Address:</h4>
      <input
        type='email'
        placeholder='Email Address'
        // value={trac.scanner || ''}
        // onChange={setScanner}
        className='py-2 px-3 flex-grow cursor-pointer bg-bl-text-light text-bl-text-grey border-2 border-bl-consumer-off-white'
      />
    </div>
    <div className='flex'>
      <h4 className='py-2 px-3'>Password:</h4>
      <input
        type='text'
        placeholder='Password'
        //disabled={true}
        // value={trac.scanner || ''}
        // onChange={setScanner}
        className='py-2 px-3 flex-grow cursor-pointer bg-bl-text-light text-bl-text-grey border-2 border-bl-consumer-off-white'
      />
    </div>
    <div className='flex'>
      <h4 className='py-2 px-3'>Confirm Password:</h4>
      <input
        type='text'
        placeholder='Confirm Password'
        //disabled={true}
        // value={trac.scanner || ''}
        // onChange={setScanner}
        className='py-2 px-3 flex-grow cursor-pointer bg-bl-text-light text-bl-text-grey border-2 border-bl-consumer-off-white'
      />
    </div>
    <button
      disabled={user === null}
      onClick={handleSubmit}
      className={`${user === null ? 'button-disabled'
        : 'button-enabled'} button`}
    ><IoMdLogIn/>Submit
    </button>
  </div>
}
