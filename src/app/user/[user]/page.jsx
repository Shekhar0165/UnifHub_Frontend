'use client'
import React from 'react'
import { useParams } from 'next/navigation'
import user from '../User'

export default function page() {
  const UserId = useParams(); 
  console.log(UserId)
  return (
    <div>page</div>
  )
}
