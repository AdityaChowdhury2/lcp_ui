import React, { FC } from 'react'
import { Button } from "../../../Components/ui/button"
import { Link } from 'react-router-dom'

const Helpdesk: FC = () => {
  return (
    <>
    <div className="fixed -right-16 top-80 z-50 transform rotate-90">
      <Button className="bg-[#5cb85c] hover:bg-[#449d44] text-white px-10 py-6 border border-[#4cae4c] hover:border[#398439] rounded-none uppercase text-[16px] font-normal tracking-wide">
        <Link to="/feedback"> Help Desk</Link>
      </Button>
    </div>
    </>
  )
}

export default Helpdesk