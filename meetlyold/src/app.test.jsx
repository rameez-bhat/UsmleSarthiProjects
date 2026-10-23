import React from 'react';
import {test,expect,beforeEach,afterEach} from 'vitest';
import {render,screen,waitFor,cleanup,within,fireEvent} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {App} from './main';
beforeEach(()=>{localStorage.clear();history.replaceState({},'','/');});
afterEach(()=>cleanup());
test('create an event and pause it without removing the event definition',async()=>{
 const user=userEvent.setup();render(<App/>);await user.click(screen.getByRole('button',{name:'New event type'}));
 const dialog=screen.getByRole('dialog');await user.type(within(dialog).getByLabelText('Event name'),'Staff consultation');await user.click(within(dialog).getByRole('button',{name:/Save event type/}));
 await waitFor(()=>expect(screen.queryByRole('dialog')).toBeNull());expect(screen.getByRole('heading',{name:'Staff consultation'})).toBeTruthy();
 await user.click(screen.getByRole('button',{name:'Pause Staff consultation'}));await waitFor(()=>expect(screen.getByRole('button',{name:'Enable Staff consultation'})).toBeTruthy());
 const saved=JSON.parse(localStorage.getItem('meetly.demo'));expect(saved.events.find(e=>e.title==='Staff consultation').active).toBe(false);
});
test('public booking creates a private manage link and reserves a time',async()=>{
 const user=userEvent.setup();history.replaceState({},'','/book/shafi/intro');render(<App/>);
 await screen.findByRole('heading',{name:'Select a date & time'});
 await user.click(screen.getByRole('button',{name:'Next month'}));
 const next=new Date();next.setDate(1);next.setMonth(next.getMonth()+1);while([0,6].includes(next.getDay()))next.setDate(next.getDate()+1);
 await user.click(screen.getByRole('button',{name:String(next.getDate()),exact:true}));
 const slot=(await screen.findAllByRole('button',{name:/^\d{2}:\d{2}$/}))[0];await user.click(slot);
 await user.type(screen.getByLabelText('Your name'),'Test Guest');await user.type(screen.getByLabelText('Email address'),'guest@example.com');await user.click(screen.getByRole('button',{name:'Confirm meeting'}));
 await screen.findByRole('heading',{name:'A little time, well spent.'});expect(location.pathname.startsWith('/manage/')).toBe(true);expect(new URLSearchParams(location.search).get('token')).toBeTruthy();
 const saved=JSON.parse(localStorage.getItem('meetly.demo'));expect(saved.bookings).toHaveLength(1);expect(saved.bookings[0].attendeeEmail).toBe('guest@example.com');
 await user.click(screen.getByRole('button',{name:'Cancel meeting'}));const dialog=screen.getByRole('dialog');await user.click(within(dialog).getByRole('button',{name:'Cancel meeting'}));
 await screen.findByRole('heading',{name:'Plans change. That’s okay.'});expect(JSON.parse(localStorage.getItem('meetly.demo')).bookings[0].status).toBe('cancelled');
});
test('availability changes persist and overrides remain separate from weekly hours',async()=>{
 const user=userEvent.setup();render(<App/>);await user.click(screen.getByRole('button',{name:'Availability'}));
 await user.click(screen.getByLabelText('Monday'));const date=new Date();date.setDate(date.getDate()+2);const iso=date.toISOString().slice(0,10);fireEvent.change(screen.getByLabelText('Date'),{target:{value:iso}});
 await user.click(screen.getByRole('button',{name:'Add override'}));await user.click(screen.getByRole('button',{name:'Save availability'}));
 await waitFor(()=>{const p=JSON.parse(localStorage.getItem('meetly.demo')).profile;expect(p.schedule['1']).toEqual([]);expect(p.overrides[iso]).toEqual([]);});
});
