import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import Loader from "../../Components/LoadingSkeleton";

export default function ProductDetail(){
  const { id } = useParams()
  const [data,setData] = useState(null)
  const [loading,setLoading] = useState(true)

  useEffect(()=>{
    client.get(`/products/${id}`).then(r=> setData(r.data.data)).catch(()=>{}).finally(()=>setLoading(false))
  },[id])

  if(loading) return <Loader />
  if(!data) return <div>Product not found</div>

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="col-span-2">
          <div className="h-64 bg-gray-100 dark:bg-slate-700 rounded flex items-center justify-center">{data.images?.[0]?.url ? <img src={data.images[0].url} alt="" className="h-full w-full object-cover"/> : 'No image'}</div>
        </div>
        <div className="p-4 bg-white dark:bg-slate-800 rounded">
          <h1 className="text-xl font-bold">{data.name}</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300">{data.description}</p>
          <div className="mt-4">Unit: {data.baseUnit}</div>
          <div className="mt-4">Attributes: {Object.entries(data.attributes||{}).map(([k,v])=> <div key={k} className="text-sm">{k}: {v}</div>)}</div>
        </div>
      </div>

      <section className="p-4 bg-white dark:bg-slate-800 rounded">Listings for this product (coming soon)</section>
    </div>
  )
}
