import React from 'react'
import { auth} from "@clerk/nextjs/server";
import SellerDashboard from '@/components/SellerDashboard';
import { redirect } from 'next/navigation';

async function SellerPage() {
  const { userId } = await auth();
  if(!userId) redirect('/');



  return (
    <div className="min-h-screen bg-gray-50">SELLERPAGE 
        < SellerDashboard/>
    </div>
  )
}

export default SellerPage