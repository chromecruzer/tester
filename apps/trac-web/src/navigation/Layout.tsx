// import {TabsBar} from "./TabsBar";
// import * as React from 'react';
// import {Notification} from "../components/Notification";
// import {Login} from "./Login";
// //import {SignUp} from "./SignUp";
// import {UseLoginUser} from "./UseLoginUser";
// import {AppHeader} from "./AppHeader";

// export const Layout = ({children}) => {
//   const {appUser} = UseLoginUser();
//   console.log('Hello!'+appUser);
//   const main = <><Notification/>
//     <div className="grid grid-flow-col md:grid-col-8 gap-10">
//       <TabsBar/>
//       <div className="md:col-span-7">
//         {children}
//       </div>
//     </div>
//   </>;
//   return <div className="grid grid-flow-row">
//     <AppHeader/>
//     {appUser ? main : <Login/>}
    
//     {/**<SignUp/>*/}
//   </div>
// }
import { TabsBar } from "./TabsBar";
import * as React from "react";
import { Notification } from "../components/Notification";
import { Login } from "./Login";
import { UseLoginUser } from "./UseLoginUser";
import { AppHeader } from "./AppHeader";

export const Layout = ({ children }) => {
  const { appUser } = UseLoginUser();
  console.log("Hello!" + appUser);
  const main = (
    <>
      <Notification />
      <div className="grid grid-flow-col md:grid-col-8 gap-10">
        <TabsBar />
        <div className="md:col-span-7" style={{ backgroundColor: "white" }}>
          {children}
        </div>
      </div>
    </>
  );
  return (
    <div className="grid grid-flow-row" style={{ backgroundColor: "white" }}>
      <AppHeader />
         {main}        {/*appuser? <Login/>:main*/ }
      {/* <SignUp/> */}
    </div>
  );
};
