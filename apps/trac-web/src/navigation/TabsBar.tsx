import React from "react";
import {
  MdSearch,
  MdOutlineVisibility,
  MdOutlineHistory,
  MdOutlineInventory2,
  MdOutlineProductionQuantityLimits,
  MdOutlinePointOfSale,
  MdOutlineSettings,
  MdOutlineMail,
  MdFavorite
} from "react-icons/md";
import {Tab} from "./Tab";
import {TabContainer} from "./TabContainer";
import {BiCalendar} from "react-icons/bi";
import {HiOutlineDuplicate, HiUpload} from "react-icons/hi";
import {RiCustomerService2Line, RiMailSendLine} from "react-icons/ri";
import {GrDatabase} from "react-icons/gr";
import {TbMovie} from "react-icons/tb";


export const TabsBar = () => {
  return <nav className='tab-container rounded py-2 px-3 border-bl-text-grey shadow'>
    <Tab
      icon={<MdSearch/>}
      name={'Search'}
      navigation={'Clear Search'}
    />
    <TabContainer
      name='Audit'
      icon={<MdOutlineVisibility/>}
      navigation={'Audit'}>
      <Tab
        icon={<MdOutlineHistory/>}
        name={'Audited Accounts'}
      />
      <Tab
        icon={<MdOutlineHistory/>}
        name={'Open Audits'}
      />
      <Tab
        icon={<MdOutlineVisibility/>}
        name={'Audit Work'}
      />
      <Tab
        icon={<HiUpload/>}
        name={'Audit Upload'}
      />
    </TabContainer>
    <TabContainer
      name='Consignments'
      icon={<MdOutlineInventory2/>}
      navigation={'Consignment'}>
      <Tab
        icon={<MdOutlineInventory2/>}
        name={'Accounts'}
      />
      <Tab
        icon={<BiCalendar/>}
        name={'Expiration'}
      />
    </TabContainer>
    <TabContainer
      name='Data'
      icon={<GrDatabase/>}
      navigation={'Data'}>
      <Tab
        icon={<HiUpload/>}
        name={'Data Upload'}
      />
      <Tab
        icon={<HiOutlineDuplicate/>}
        name={'Duplicates'}
      />
      <Tab
        icon={<RiCustomerService2Line/>}
        name={'Customers'}
      />
      <Tab
        icon={<MdOutlinePointOfSale/>}
        name={'Sales Reps'}
      />
    </TabContainer>
    <TabContainer
      name='Settings'
      icon={<MdOutlineSettings/>}
      navigation={'Settings'}>
      <Tab
        name={'Email Settings'}
        icon={<MdOutlineMail/>}
      />
      <Tab
        icon={<MdOutlineProductionQuantityLimits/>}
        name={'Products'}
      />
      <Tab
        icon={<MdFavorite/>}
        name={'Products2'}
      />
      <Tab
        icon={<MdOutlineProductionQuantityLimits/>}
        name={'SignUp'}
      />
	  <Tab
        icon={<MdOutlineProductionQuantityLimits/>}
        name={'ForgetPwd'}
      />
      
    </TabContainer>
  </nav>
}
