import React from 'react'

const Login = React.lazy(() => import('./views/pages/login/Login'))
const ForgotPassword = React.lazy(() => import('./views/pages/login/ForgotPassword'))
const ResetPassword = React.lazy(() => import('./views/pages/login/ResetPassword'))


const Settings = React.lazy(() => import('./views/superadmin/Settings'))
const ListDdos = React.lazy(() => import('./views/superadmin/ListDdos'))
const AddUser = React.lazy(() => import('./views/superadmin/AddUser'))
const ListUsers = React.lazy(() => import('./views/superadmin/ListUsers'))
const ImportExcel = React.lazy(() => import('./views/superadmin/ImportExcel'))
const LeadFilters = React.lazy(() => import('./views/superadmin/LeadFilters'))


const AddData = React.lazy(() => import('./views/admin/AddData'))
const ChangePassword = React.lazy(() => import('./views/admin/ChangePassword'))
const AddLead = React.lazy(() => import('./views/admin/AddLead'))
const ViewLeads = React.lazy(() => import('./views/admin/ViewLeads'))
const UpdateLead = React.lazy(() => import('./views/admin/UpdateLead'))
const LeadsToBeFollowed = React.lazy(() => import('./views/admin/LeadsToBeFollowed'))
const Import = React.lazy(() => import('./views/admin/Import'))



const routes = {"public":[
  { path: '/login', name: 'Login', element: Login },
  { path: '/forgot-password', name: 'ForgotPassword', element: ForgotPassword },
  { path: '/reset-password', name: 'ResetPassword', element: ResetPassword },
],
"SuperAdmin":[

  { path: '/admin/importexcel', name: 'ImportExcel',exact: true, element: ImportExcel },
  { path: '/admin/leads/addlead', name: 'AddLead',exact: true, element: AddLead },
  { path: '/admin/leads/viewleads', name: 'ViewLeads',exact: true, element: ViewLeads },
  { path: '/admin/adduser', name: 'AddUser',exact: true, element: AddUser},
  { path: '/admin/listusers', name: 'ListUsers',exact: true, element: ListUsers},
  { path: '/admin/leads/updatelead/:leadid/:serviceid?', name: 'UpdateLead',exact: true, element: UpdateLead },
  { path: '/admin/leads/leadstobefollowed', name: 'LeadsToBeFollowed',exact: true, element: LeadsToBeFollowed },
  { path: '/admin/leads/import', name: 'Import',exact: true, element: Import },
  { path: '/admin/leads/leadfilters', name: 'LeadFilters',exact: true, element: LeadFilters },
],
"Customer Support":[
{ path: '/admin/changepassword', name: 'ChangePassword',exact: true, element: ChangePassword },
{ path: '/admin/adddata/:ddoid?', name: 'AddData',exact: true, element: AddData },
{ path: '/admin/adddata', name: 'AddData',exact: true, element: AddData },
{ path: '/admin/leads/addlead', name: 'AddLead',exact: true, element: AddLead },
{ path: '/admin/leads/viewleads', name: 'ViewLeads',exact: true, element: ViewLeads },
{ path: '/admin/leads/updatelead/:leadid/:serviceid?', name: 'UpdateLead',exact: true, element: UpdateLead },
{ path: '/admin/leads/viewleads', name: 'ViewLeads',exact: true, element: ViewLeads },
{ path: '/admin/leads/leadstobefollowed', name: 'LeadsToBeFollowed',exact: true, element: LeadsToBeFollowed },
{ path: '/admin/leads/import', name: 'Import',exact: true, element: Import },
{ path: '/admin/leads/leadfilters', name: 'LeadFilters',exact: true, element: LeadFilters },
]
}

export default routes
