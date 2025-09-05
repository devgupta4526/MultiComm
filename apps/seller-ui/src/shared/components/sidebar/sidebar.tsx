"use client"
import useSeller from 'apps/seller-ui/src/hooks/useSeller';
import useSidebar from 'apps/seller-ui/src/hooks/useSidebar'
import { usePathname } from 'next/navigation';
import React, { useEffect } from 'react'
import Box from '../box';
import { SideBar } from './sidebar.styles';
import Logo from 'apps/seller-ui/src/assets/svgs/logo';
import Link from 'next/link';
import SideBarItem from './sidebar.item';
import { Bell, BellDot, Calendar, Home, Inbox, ListOrdered, LogOut, PackageSearch, SquarePlus, TicketPercent, User, Wallet } from 'lucide-react';
import SidebarMenu from './sidebar.menu';

const SidebarBarWrapper = () => {
  const { activeSidebar, setActiveSidebar } = useSidebar();
  const pathName = usePathname();
  const { seller } = useSeller();

  useEffect(() => {
    setActiveSidebar(pathName);
  }, [pathName, setActiveSidebar]);

  const getIconColor = (route: string) => activeSidebar === route ? "#0085ff" : "#969696";

  console.log(seller);
  return (
    <Box
      css={{
        height: "100vh",
        zIndex: 202,
        position: "sticky",
        top: 0,
        overflowY: "scroll",
        scrollbarWidth: "none",
      }}
      className='sidebar-wrapper'
    >

      <SideBar.Header>
        <Box>
          <Link href={"/"} className='flex justify-center text-center gap-2'>
            <Logo />
            <Box>
              <h3 className='text-xl font-medium text-[#ecedee]'>
                {seller?.shop?.name}
              </h3>
              <h5 className='font-medium text-xs text-[#ecedeecf] whitespace-nowrap overflow-hidden text-ellipsis max-w-[170px]'>
                {seller?.shop?.address}
              </h5>
            </Box>
          </Link>
        </Box>
      </SideBar.Header>
      <div className='block my-3 h-full'>
        <SideBar.Body className='body sidebar'>
          <SideBarItem
            href='/dashboard'
            title='Dashboard'
            icon={<Home />}
            isActive={activeSidebar === '/dashboard'}
          />
          <div className='mt-2 block'>
            <SidebarMenu title="Main Menu">
              <SideBarItem
                isActive={activeSidebar === '/dashboard/orders'}
                title='Orders'
                href='/dashboard/orders'
                icon={<ListOrdered size={26} color={getIconColor('/dashboard/orders')} />}
              />
              <SideBarItem
                isActive={activeSidebar === '/dashboard/payments'}
                title='Payments'
                href='/dashboard/payments'
                icon={<Wallet size={26} color={getIconColor('/dashboard/payments')} />}
              />
            </SidebarMenu>
            <SidebarMenu title="Products">
              <SideBarItem
                isActive={activeSidebar === '/dashboard/create-product'}
                title='Create Product'
                href='/dashboard/create-product'
                icon={<SquarePlus size={26} color={getIconColor('/dashboard/create-product')} />}
              />
              <SideBarItem
                isActive={activeSidebar === '/dashboard/all-products'}
                title='All Products'
                href='/dashboard/all-products'
                icon={<PackageSearch size={26} color={getIconColor('/dashboard/all-products')} />}
              />
            </SidebarMenu>
            <SidebarMenu title="Events">
              <SideBarItem
                isActive={activeSidebar === '/dashboard/create-event'}
                title='Create Event'
                href='/dashboard/create-event'
                icon={<Calendar size={26} color={getIconColor('/dashboard/create-event')} />}
              />
              <SideBarItem
                isActive={activeSidebar === '/dashboard/events'}
                title='All Events'
                href='/dashboard/events'
                icon={<BellDot size={26} color={getIconColor('/dashboard/events')} />}
              />
              
            </SidebarMenu>
            <SidebarMenu title="Controllers">
              <SideBarItem
              isActive={activeSidebar === '/dashboard/inbox'}
              title='Inbox'
              href='/dashboard/inbox'
              icon={<Inbox size={26} color={getIconColor('/dashboard/inbox')} />}
            />
              <SideBarItem
              isActive={activeSidebar === '/dashboard/settings'}
              title='Settings'
              href='/dashboard/settings'
              icon={<User size={26} color={getIconColor('/dashboard/settings')} />}
            />
            {/* Notifications */}
            <SideBarItem
              isActive={activeSidebar === '/dashboard/notifications'}
              title='Notifications'
              href='/dashboard/notifications'
              icon={<Bell size={26} color={getIconColor('/dashboard/notifications')} />} 
            />
            </SidebarMenu>
            <SidebarMenu title="Extras">
              <SideBarItem
                isActive={activeSidebar === '/dashboard/discount-codes'}
                title='Discount Codes'
                href='/dashboard/discount-codes'
                icon={<TicketPercent size={26} color={getIconColor('/dashboard/discount-codes')} />}
              />
              <SideBarItem
                isActive={activeSidebar === '/dashboard/logout'}
                title='Logout'
                href='/dashboard/logout'
                icon={<LogOut size={26} color={getIconColor('/dashboard/logout')} />}
              />
            </SidebarMenu>
          </div>
        </SideBar.Body>
      </div>

    </Box>
  )
}

export default SidebarBarWrapper
