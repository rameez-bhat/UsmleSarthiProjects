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
  cilPuzzle,
  cibSuperuser,
  cilSpeedometer,
  cilFilter,
  cibAddthis,
  cilRouter,
  cilInputPower,
  cibCassandra,
  cilStar,
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const getNavigation = (user) => {
  let navigation = [];

  // SuperAdmin role navigation
  if (user?.role === "SuperAdmin") {
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
        name: 'Pages',
      },
      {
        component: CNavGroup,
        name: 'Leads2',
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
            icon: <CIcon icon={cibAddthis} customClassName="nav-icon" />,
            name: 'Add Lead1',
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
            to: '/admin/leads/leadstobefollowed',
          },
          {
            component: CNavItem,
            icon: <CIcon icon={cilInputPower} customClassName="nav-icon" />,
            name: 'Import Leads',
            to: '/admin/leads/import',
          }
        ],
      },
      {
        component: CNavGroup,
        name: 'Reports',
        to: '/base',
        icon: <CIcon icon={cilRouter} customClassName="nav-icon" />,
       items: [
          {
            component: CNavItem,
            icon: <CIcon icon={cilFilter} customClassName="nav-icon" />,
            name: 'Lead Filters',
            to: '/admin/leads/leadfilters',
          }
        ],
      },
      {
        component: CNavGroup,
        name: 'Users',
        to: '/base',
        icon: <CIcon icon={cibSuperuser} customClassName="nav-icon" />,
        items: [
          {
            component: CNavItem,
            icon: <CIcon icon={cibAddthis} customClassName="nav-icon" />,
            name: 'Add User',
            to: '/admin/adduser',
          },
          {
            component: CNavItem,
            name: 'View Users',
            to: '/admin/listusers',
          },
        ],
      },
    ];
  }

  // Admin role navigation
  if (user?.role === "Customer Support") {
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
            to: '/admin/leads/leadstobefollowed',
          },
          {
            component: CNavItem,
            icon: <CIcon icon={cilInputPower} customClassName="nav-icon" />,
            name: 'Import Leads',
            to: '/admin/leads/import',
          }
        ],
      },
      {
        component: CNavGroup,
        name: 'Reports',
        to: '/base',
        icon: <CIcon icon={cilRouter} customClassName="nav-icon" />,
       items: [
          {
            component: CNavItem,
            icon: <CIcon icon={cilFilter} customClassName="nav-icon" />,
            name: 'Lead Filters',
            to: '/admin/leads/leadfilters',
          }
        ],
      },
    ];
  }

  return navigation;
};

export default getNavigation;
