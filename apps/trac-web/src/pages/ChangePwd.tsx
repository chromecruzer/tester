//import _ from 'lodash';
//import PagesMap from "../navigation/PagesMap";
import { Fragment, useState } from "react";
import {IoMdLogIn} from "react-icons/io";
import {updatePwd} from "../api/userApi";

const ChangePwd = () => {

  const [formData, setFormData] = useState({
    password: "",
    password2: "",
  });


  const username = localStorage.getItem('tracUser');
  const { password, password2 } = formData;

  const onChange = (e: { target: { name: any; value: any; }; }) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e: any) => {
    e.preventDefault();
    if (password !== password2) {
      alert("Passwords do not match");
    } else {
      try {
        var newuser={username: username, userpwd: password};
        console.log(formData);
        //updatePwd(newuser);
        const p = Promise.resolve(updatePwd(newuser));
        let stat;

        const tmp = async () => {
          const a = await p;
          console.log("retval a = " + a);
        };
        
        p.then(value => {
          stat = value;
          console.log("Return Value: " + stat);
          if(stat === "OK") {
            alert("Password Updated !");
			window.location.reload();
          } else {
            alert("Password Update Failed !");
          }
        }).catch(err => {
          console.log(err);
        });







      } catch (e) {
        console.log((e as Error).message);
      }
    }
  };

  return (
    <Fragment>
      <h1 className='text-bl-text-grey'>Change Password:</h1>

      <form className='form' onSubmit={(e) => onSubmit(e)}>
      <div className='form-group'>
          <input
            type='text'
            placeholder='Name'
            name='name'
            value={username || ''}
            required
            className='py-2 px-3 flex-grow cursor-pointer bg-bl-text-light text-bl-text-grey border-2 border-bl-consumer-off-white'
            disabled={true}
            />
        </div>
        <div className='form-group'>
          <input
            onChange={onChange}
            type='password'
            placeholder='Password'
            name='password'
            //minLength='6'
            value={password || ''}
            required
            className='py-2 px-3 flex-grow cursor-pointer bg-bl-text-light text-bl-text-grey border-2 border-bl-consumer-off-white'
            />
        </div>
        <div className='form-group'>
          <input
            onChange={onChange}
            type='password'
            placeholder='Confirm Password'
            name='password2'
            //minLength='6'
            value={password2 || ''}
            required
            className='py-2 px-3 flex-grow cursor-pointer bg-bl-text-light text-bl-text-grey border-2 border-bl-consumer-off-white'
            />
        </div>
        <button type = 'submit'
        disabled={password === '' || password2 === ''}
        className={`${(password === null || password2 === null)? 'button-disabled'
          : 'button-enabled'} button`}
      ><IoMdLogIn/>Update
      </button>
      </form>
    </Fragment>
  );
};

export default ChangePwd;

