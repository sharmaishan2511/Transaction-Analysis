import './App.css';
import Transact from './components/Transact';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Statistics from './components/Statistics';
import Barchart from './components/Barchart';

function App() {
  const [transactions, setTransactions] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('March');
  const [stats, setStats] = useState([]);
  const [barChartData, setBarChartData] = useState([]);
  const [searchText, setSearchText] = useState('');


  useEffect(() => {
    // Fetch transactions based on the selected month
    axios.get(`http://localhost:5000/list?month=${selectedMonth}`)
    .then((response) => {
      const filteredTransactions = response.data.filter(
        (transaction) =>
          transaction.title.toLowerCase().includes(searchText.toLowerCase()) ||
          transaction.description.toLowerCase().includes(searchText.toLowerCase()) ||
          String(transaction.price).toLowerCase().includes(searchText.toLowerCase())
      );
      setTransactions(filteredTransactions);
    })
    .catch((error) =>
      console.error('Error fetching transactions:', error)
    );

    axios.get(`http://localhost:5000/stats?month=${selectedMonth}`)
      .then(response => setStats(response.data))
      .catch(error => console.error('Error fetching statistics:', error));
    
      axios.get(`http://localhost:5000/bar?month=${selectedMonth}`)
      .then(response => setBarChartData(response.data))
      .catch(error => console.error('Error fetching bar chart data:', error));
  }, [selectedMonth,searchText]);

  return (
    <>
      <div className="d-flex flex-row align-items-center justify-content-center h1 my-5">
        <div className="circle"> <span className="mx-3">Transactions<br />Dashboard</span> </div>
      </div>

      <div className="d-flex flex-row justify-content-around">
        <div className="col-md-4">
          <div className="input-group rounded">
          <input
            type="search"
            className="form-control rounded"
            placeholder="Search"
            aria-label="Search"
            aria-describedby="search-addon"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          </div>
        </div>
        <div>
          <select className="form-select" aria-label="Default select example" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
            {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(month => (
              <option key={month} value={month}>{month}</option>
          ))}
          </select>
          
        </div>
      </div>

      <Transact data = {transactions}/>
      <Statistics month = {selectedMonth} data = {stats}/>
      <Barchart month = {selectedMonth} labels={barChartData.map(ele=>(ele.priceRange))} data1={barChartData.map(ele=>(ele.numberOfItems))} />
      
    </>
  );
}

export default App;
