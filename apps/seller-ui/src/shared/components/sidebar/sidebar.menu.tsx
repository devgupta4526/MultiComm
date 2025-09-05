import React from 'react'

interface Props {
  title: String;
  children: React.ReactNode;
}

const SidebarMenu = ({ title, children }: Props) => {
  return (
    <div className="block">
      <h3 className="text-xs tracking-[o.o4rem] pl-1">{title}</h3>
      {children}
    </div>

  )
}

export default SidebarMenu
