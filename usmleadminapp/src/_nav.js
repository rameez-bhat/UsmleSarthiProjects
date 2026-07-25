import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilBell,
  cilCalculator,
  cilChartPie,
  cilCursor,
  cilDescription,
  cilDrop,
  cilNotes,
  cilPencil,
  cilUser,
  cilPuzzle,
  cibSuperuser,
  cilSpeedometer,
  cilMedicalCross,
  cibAddthis,
  cibCassandra,
  cilCropRotate,
  cilEducation,
  cilEco,
  cilList,
  cilBabyCarriage,
  cilFilter,
  cilHospital,
  cilBellExclamation,
  cilEnvelopeClosed,
  cilInfo,
  cilGroup,
  cilCommand,
  cilCash,
  cilFeaturedPlaylist,
  cilDialpad,
  cilVolumeHigh,
  cilBattery0,
  cilContact,
  cilWallet,
  cibInstagram,
  cibWhatsapp,
  cilStar,
  cilUserPlus,
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const getNavigation = (user) => {
  let navigation = [];
  // SuperAdmin role navigation
  if (user?.role === "Admin" || user?.role === "SuperAdmin" || user?.role === "chiefmentor") {
    navigation = [
      {
        component: CNavItem,
        name: 'Dashboard',
        to: '/admin/dashboard',
        icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
        badge: {
          color: 'info',
          text: 'NEW',
        },
      },
      {
        component: CNavTitle,
        name: 'Menu',
      },
      {
        component: CNavGroup,
        name: 'Chat Room',
        to: '/base',
        icon: <CIcon icon={cilBellExclamation} customClassName="nav-icon" />,
       items: [
          {
            component: CNavItem,
            icon: <CIcon icon={cilCropRotate} customClassName="nav-icon" />,
            name: 'Answered Rotation Queries',
            to: '/admin/answeredrotationqueries',
          },
          {
            component: CNavItem,
            icon: <CIcon icon={cilCropRotate} customClassName="nav-icon" />,
            name: 'Rotation Queries',
            to: '/admin/rotationqueries',
          },
           {
            component: CNavItem,
             icon: <CIcon icon={cilContact} customClassName="nav-icon" />,
            name: 'Answered Match Queries',
            to: '/admin/answeredmatchqueries',
          },
          {
            component: CNavItem,
             icon: <CIcon icon={cilContact} customClassName="nav-icon" />,
            name: 'Match Queries',
            to: '/admin/matchqueries',
          },
          {
            component: CNavItem,
             icon: <CIcon icon={cilCommand} customClassName="nav-icon" />,
            name: 'Anwsered Research Queries',
            to: '/admin/answeredresearchqueries',
          },
          {
            component: CNavItem,
             icon: <CIcon icon={cilCommand} customClassName="nav-icon" />,
            name: 'Research Queries',
            to: '/admin/researchqueries',
          }
        ],
      },
      {
        component: CNavItem,
        name: 'Whatsapp Un-Registered',
        to: '/admin/instagrammessage',
        icon: <CIcon icon={cibWhatsapp} customClassName="nav-icon" />
      },
      {
        component: CNavGroup,
        name: 'Rotations',
        to: '/base',
        icon: <CIcon icon={cilList} customClassName="nav-icon" />,
       items: [
          {
            component: CNavItem,
            icon: <CIcon icon={cilBabyCarriage} customClassName="nav-icon" />,
            name: 'List Rotations',
            to: '/admin/listofrotations',
          },
          {
            component: CNavItem,
            icon: <CIcon icon={cilBabyCarriage} customClassName="nav-icon" />,
            name: 'Rotations Review',
            to: '/admin/rotationreview',
          }
        ],
      },
      {
        component: CNavGroup,
        name: 'Match',
        to: '/base',
        icon: <CIcon icon={cilList} customClassName="nav-icon" />,
       items: [
          {
            component: CNavItem,
            icon: <CIcon icon={cilBabyCarriage} customClassName="nav-icon" />,
            name: 'List Match',
            to: '/admin/listofmatch',
          },
          {
            component: CNavItem,
            icon: <CIcon icon={cilBabyCarriage} customClassName="nav-icon" />,
            name: 'Add Match',
            to: '/admin/editmatch',
          }
        ],
      },
      {
        component: CNavGroup,
        name: 'Journalist',
        to: '/base',
        icon: <CIcon icon={cilList} customClassName="nav-icon" />,
       items: [
          {
            component: CNavItem,
            icon: <CIcon icon={cilBabyCarriage} customClassName="nav-icon" />,
            name: 'List Journalists',
            to: '/admin/journalist',
          }
        ],
      },
      {
        component: CNavGroup,
        name: 'Housing',
        to: '/base',
        icon: <CIcon icon={cilList} customClassName="nav-icon" />,
       items: [
          {
            component: CNavItem,
            icon: <CIcon icon={cilBabyCarriage} customClassName="nav-icon" />,
            name: 'List Housing',
            to: '/admin/listofhousing',
          },
          {
            component: CNavItem,
            icon: <CIcon icon={cilBabyCarriage} customClassName="nav-icon" />,
            name: 'Add Housing',
            to: '/admin/edithousing',
          }
        ],
      },
      {
        component: CNavGroup,
        name: 'Resources',
        to: '/base',
        icon: <CIcon icon={cilList} customClassName="nav-icon" />,
       items: [
          {
            component: CNavItem,
            icon: <CIcon icon={cilBabyCarriage} customClassName="nav-icon" />,
            name: 'Add Resources',
            to: '/admin/studentresources',
          }
        ],
      },
      {
  component: CNavGroup,
  name: 'Referrals',
  to: '/base',
  icon: <CIcon icon={cilStar} customClassName="nav-icon" />,
  items: [
    {
      component: CNavItem,
      icon: <CIcon icon={cilStar} customClassName="nav-icon" />,
      name: 'Referral List',
      to: '/admin/referrallist',
    },
    {
      component: CNavItem,
      icon: <CIcon icon={cilStar} customClassName="nav-icon" />,
      name: 'Add Referral',
      to: '/admin/addreferral',
    }/*,
    {
      component: CNavItem,
      icon: <CIcon icon={cibCassandra} customClassName="nav-icon" />,
      name: 'Referral Details',
      to: '/admin/adminreferrals',
    }*/
  ],
},
      {
        component: CNavGroup,
        name: 'Sarthi List',
        to: '/base',
        icon: <CIcon icon={cilList} customClassName="nav-icon" />,
       items: [
          {
            component: CNavItem,
            icon: <CIcon icon={cilBabyCarriage} customClassName="nav-icon" />,
            name: 'Import Program List',
            to: '/admin/importprogramlist',
          },
          {
            component: CNavItem,
            icon: <CIcon icon={cilBabyCarriage} customClassName="nav-icon" />,
            name: 'Import Program Map Name',
            to: '/admin/importprogramlistname',
          },
          {
            component: CNavItem,
            icon: <CIcon icon={cilBabyCarriage} customClassName="nav-icon" />,
            name: 'Add Single Program',
            to: '/admin/addsinglelist',
          }
          ,
          {
            component: CNavItem,
            icon: <CIcon icon={cilBabyCarriage} customClassName="nav-icon" />,
            name: 'Import Res Explorer',
            to: '/admin/importresidencyexplorer',
          }
        ],
      },
      ,
      {
        component: CNavGroup,
        name: 'Program',
        to: '/base',
        icon: <CIcon icon={cilList} customClassName="nav-icon" />,
       items: [
          {
            component: CNavItem,
            icon: <CIcon icon={cilBabyCarriage} customClassName="nav-icon" />,
            name: 'Assign Program',
            to: '/admin/assignprogram',
          },
          {
            component: CNavItem,
            icon: <CIcon icon={cilBattery0} customClassName="nav-icon" />,
            name: 'In Complete',
            to: '/admin/pendingprograms',
          },
        ],
      }
      ,
      {
        component: CNavGroup,
        name: 'Students',
        to: '/base',
        icon: <CIcon icon={cilGroup} customClassName="nav-icon" />,
       items: [
          {
            component: CNavItem,
            icon: <CIcon icon={cilUser} customClassName="nav-icon" />,
            name: 'All Students',
            to: '/admin/leads',
          },
          {
            component: CNavItem,
             icon: <CIcon icon={cilUserPlus} customClassName="nav-icon" />,
            name: 'Add Student',
            to: '/admin/addstudent',
          },
          {
            component: CNavItem,
             icon: <CIcon icon={cilUserPlus} customClassName="nav-icon" />,
            name: 'Update User Password',
            to: '/admin/updateuserpassword',
          }
        ],
      },
      /*{
        component: CNavGroup,
        name: 'Mentor',
        to: '/base',
        icon: <CIcon icon={cilList} customClassName="nav-icon" />,
       items: [
          {
            component: CNavItem,
            icon: <CIcon icon={cilBabyCarriage} customClassName="nav-icon" />,
            name: 'Mentor/Panelist',
            to: '/admin/listofpanelist',
          },
          {
            component: CNavItem,
            icon: <CIcon icon={cilBabyCarriage} customClassName="nav-icon" />,
            name: 'Add Mentor/Panelist',
            to: '/admin/editpanelist',
          }
        ],
      },*/

      {
        component: CNavGroup,
        name: 'Physicians',
        to: '/base',
        icon: <CIcon icon={cilHospital} customClassName="nav-icon" />,
        items: [
          {
            component: CNavItem,
            icon: <CIcon icon={cilMedicalCross} customClassName="nav-icon" />,
            name: 'Rotation Physician',
            to: '/admin/doctorlist',
          },
          {
            component: CNavItem,
            icon: <CIcon icon={cilMedicalCross} customClassName="nav-icon" />,
            name: 'Add Physician',
            to: '/admin/adddoctor',
          },
        ],
      },
      {
        component: CNavGroup,
        name: 'Issue tracker',
        to: '/base',
        icon: <CIcon icon={cilHospital} customClassName="nav-icon" />,
        items: [
          {
            component: CNavItem,
            icon: <CIcon icon={cilMedicalCross} customClassName="nav-icon" />,
            name: 'Track Issues',
            to: '/admin/issuetracker',
          },
          {
            component: CNavItem,
            icon: <CIcon icon={cilMedicalCross} customClassName="nav-icon" />,
            name: 'Resolved Issues',
            to: '/admin/issueresolved',
          }
        ],
      },
      {
        component: CNavGroup,
        name: 'Payments',
        to: '/base',
        icon: <CIcon icon={cilWallet} customClassName="nav-icon" />,
        items: [
          {
            component: CNavItem,
            icon: <CIcon icon={cilCash} customClassName="nav-icon" />,
            name: 'Payment List',
            to: '/admin/trackallpayments',
          },
          {
            component: CNavItem,
            icon: <CIcon icon={cilCash} customClassName="nav-icon" />,
            name: 'Guest Stripe Payments',
            to: '/admin/gueststripepayments',
          },
        ],
      },
      {
        component: CNavGroup,
        name: 'Filters',
        to: '/base',
        icon: <CIcon icon={cilFilter} customClassName="nav-icon" />,
        items: [
          {
            component: CNavItem,
            icon: <CIcon icon={cilCash} customClassName="nav-icon" />,
            name: 'Students With Services',
            to: '/admin/listofallservicestudents',
          },
          {
            component: CNavItem,
            icon: <CIcon icon={cilCash} customClassName="nav-icon" />,
            name: 'Rotation Students',
            to: '/admin/listofallrotationstudents',
          },
         {
            component: CNavItem,
            icon: <CIcon icon={cilCash} customClassName="nav-icon" />,
            name: 'Rotation Students Reports',
            to: '/admin/listofallrotationstudentsreport',
          },
          {
            component: CNavItem,
            icon: <CIcon icon={cilCash} customClassName="nav-icon" />,
            name: 'Match Students',
            to: '/admin/listofallmatchstudents',
          },
          {
            component: CNavItem,
            icon: <CIcon icon={cilCash} customClassName="nav-icon" />,
            name: 'Match Mentor Report',
            to: '/admin/listofallmatchmentor',
          },
          {
            component: CNavItem,
            icon: <CIcon icon={cilCash} customClassName="nav-icon" />,
            name: 'Research Students',
            to: '/admin/listofallresearchstudents',
          },
          {
            component: CNavItem,
            icon: <CIcon icon={cilCash} customClassName="nav-icon" />,
            name: 'Cross Sell',
            to: '/admin/crosssellfilter',
          },
          {
            component: CNavItem,
            icon: <CIcon icon={cilCash} customClassName="nav-icon" />,
            name: 'Enquiry List',
            to: '/admin/enquirylist',
          }
        ],
      },
      {
        component: CNavGroup,
        name: 'Unknown',
        to: '/base',
        icon: <CIcon icon={cilPuzzle} customClassName="nav-icon" />,
        items: [
          {
            component: CNavItem,
            icon: <CIcon icon={cilDialpad} customClassName="nav-icon" />,
            name: 'Add Unknown Payment',
            to: '/admin/addunknownpayments',
          },
          {
            component: CNavItem,
            icon: <CIcon icon={cilFeaturedPlaylist} customClassName="nav-icon" />,
            name: 'List Unknown Payment',
            to: '/admin/listunknownpayments',
          },
        ],
      },
    ];
  }

  // Admin role navigation
  else if (user?.role === "Customer Support") {
    navigation = [
      {
        component: CNavItem,
        name: 'Dashboard',
        to: '/admin/leads/viewleads',
        icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
        badge: {
          color: 'info',
          text: 'NEW',
        },
      },
      {
        component: CNavTitle,
        name: 'Pages',
      },
      {
        component: CNavGroup,
        name: 'Leads',
        to: '/base',
        icon: <CIcon icon={cibCassandra} customClassName="nav-icon" />,
       items: [
         /* {
            component: CNavItem,
            name: 'Change Password',
            to: '/admin/changepassword',
          },*/
          {
            component: CNavItem,
            icon: <CIcon icon={cibCassandra} customClassName="nav-icon" />,
            name: 'Add Lead',
            to: '/admin/leads/addlead',
          },
          {
            component: CNavItem,
            name: 'View Lead',
            to: '/admin/leads/viewleads',
          },
          {
            component: CNavItem,
            icon: <CIcon icon={cibCassandra} customClassName="nav-icon" />,
            name: 'Lead To Be Followed',
            to: '/admin/leads/addlead',
          },
        ],
      },
    ];
  }
  else  if (user?.role === "Default" || user?.role === "Student" || user?.role === "Silver")
  {
  	navigation = [
      {
        component: CNavItem,
        name: 'Dashboard',
        to: '/admin/leads/viewleads',
        icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
        badge: {
          color: 'info',
          text: 'NEW',
        },
      },
      {
        component: CNavGroup,
        name: 'Profile',
        to: '/base',
        icon: <CIcon icon={cibCassandra} customClassName="nav-icon" />,
       items: [
         /* {
            component: CNavItem,
            name: 'Change Password',
            to: '/admin/changepassword',
          },*/
          {
            component: CNavItem,
            icon: <CIcon icon={cibCassandra} customClassName="nav-icon" />,
            name: 'Update Profile',
            to: '/user/updateuserprofile',
          },
          {
            component: CNavItem,
            icon: <CIcon icon={cilVolumeHigh} customClassName="nav-icon" />,
            name: 'Followups',
            to: '/user/followups',
          },
          {
            component: CNavItem,
            icon: <CIcon icon={cilInfo} customClassName="nav-icon" />,
            name: 'Enquires',
            to: '/user/enqueries',
          }

        ],
      },
      {
        component: CNavGroup,
        name: 'Referral',
        to: '/base',
        icon: <CIcon icon={cibCassandra} customClassName="nav-icon" />,
       items: [
         /* {
            component: CNavItem,
            name: 'Change Password',
            to: '/admin/changepassword',
          },*/
          {
            component: CNavItem,
            icon: <CIcon icon={cibCassandra} customClassName="nav-icon" />,
            name: 'Referral Details',
            to: '/user/referrals',
          }
        ],
      },
      {
        component: CNavGroup,
        name: 'Chat Room',
        to: '/base',
        icon: <CIcon icon={cibCassandra} customClassName="nav-icon" />,
       items: [
          {
            component: CNavItem,
            icon: <CIcon icon={cibCassandra} customClassName="nav-icon" />,
            name: 'Ask Questions',
            to: '/user/askquestions',
          }

        ],
      },
    ];
    if(user?.profile?.servicesChoosen?.match || user?.profile?.servicesChoosen?.rotation || user?.profile?.servicesChoosen?.research)
    {
      let moremenu={
    component: CNavGroup,
    name: 'Services',
    to: '/base',
    icon: <CIcon icon={cilMedicalCross} customClassName="nav-icon" />,
    items: [
    ],
  }
      if(user?.profile?.servicesChoosen?.match )
      {
        moremenu.items.push({
            component: CNavItem,
            icon: <CIcon icon={cilEco} customClassName="nav-icon" />,
            name: 'Match',
            to: '/user/matchservice',
          })
      }
      if(user?.profile?.servicesChoosen?.rotation)
      {
        moremenu.items.push({
            component: CNavItem,
            icon: <CIcon icon={cilCropRotate} customClassName="nav-icon" />,
            name: 'Rotation',
            to: '/user/rotationservice',
          })
      }
      if( user?.profile?.servicesChoosen?.research)
      {
         moremenu.items.push({
            component: CNavItem,
            icon: <CIcon icon={cilEducation} customClassName="nav-icon" />,
            name: 'Research',
            to: '/user/researchservice',
          })
      }

      navigation.push(moremenu);
    }
    if (user?.profile?.servicesChoosen?.enableresourceforstudent !== false) 
    {
      let moremenu1={
    component: CNavGroup,
    name: 'Resources',
    to: '/base',
    icon: <CIcon icon={cilMedicalCross} customClassName="nav-icon" />,
    items: [
    {
      component: CNavItem,
      icon: <CIcon icon={cilEco} customClassName="nav-icon" />,
      name: 'My Resources',
      to: '/user/studentresourcelist',
    },
    {
      component: CNavItem,
      icon: <CIcon icon={cilEco} customClassName="nav-icon" />,
      name: 'My Mocks',
      to: '/user/mockservices',
    },
    {
      component: CNavItem,
      icon: <CIcon icon={cilEco} customClassName="nav-icon" />,
      name: 'My Plan For Match',
      to: '/user/matchplans',
    },
    {
      component: CNavItem,
      icon: <CIcon icon={cilEco} customClassName="nav-icon" />,
      name: 'PS/CV Reviews',
      to: '/user/studentpscvreview',
    }
    ],
  }


      navigation.push(moremenu1);
    }
  }

  return navigation;
};

export default getNavigation;
