import StartNowButton from '@/components/limeLightButton'
import PaymentButton from '@/components/paymentButton'
import React from 'react'

const page = () => {
  return (
    <div>
      <PaymentButton amount={10}/>
      <StartNowButton/>
    </div>
  )
}

export default page
