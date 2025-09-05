import Link from 'next/link';
import React from 'react'

interface Props {
  icon: React.ReactNode;
  title: string;
  isActive?: boolean;
  href: string;
}
const SideBarItem = ({icon, title, isActive, href} : Props) => {
  return (
    <Link href={href} className="my-2 block">
      <div
      className={`flex gap-2 w-full min-h-12 h-full items-center px-4 rounded-lg cursor-pointer transition hover:bg-[#2b2f31]
        ${isActive ? 'scale-[.98] bg-[#2b2f31] text-white' : 'text-[#b0b3b5] hover:text-white'}`}
      >

        {icon}
        <h5 className='text-sm font-semibold tracking-wide'
        >{title}</h5>

      </div>
    </Link>
  )
}

export default SideBarItem