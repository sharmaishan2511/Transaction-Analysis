import React from 'react'

export default function Statistics(props) {
  return (
    <div className='mx-5 my-5'>
        <h3>Statistics - {props.month}</h3>
        <div className='d-flex flex-row my-3 px-4 py-4 fw-bold' style={{backgroundColor:"rgb(231, 218, 54)",width:"38%",borderRadius: "30px"}}>
            <div>
              <p>Total Sale : </p>
              <p>Total Sold Items : </p>
              <p>Total Not Sold Items : </p>
            </div>
            <div className='mx-5'>
              <p>{(props.data).totalSaleAmount} </p>
              <p>{(props.data).totalSoldItems}</p>
              <p>{props.data.totalNotSoldItems}</p>
            </div>
        </div>
        
    </div>
  )
}
