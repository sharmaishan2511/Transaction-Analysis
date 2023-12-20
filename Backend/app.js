const express = require("express");
const mongoose = require("mongoose");
const fs = require("fs");
const cors = require('cors');


const app = express();
const PORT = 5000;
app.use(cors());

mongoose.connect('mongodb://127.0.0.1:27017/test');

const productSchema = new mongoose.Schema({
  id: Number,
  title:String,
  price: Number,
  description: String,
  category: String,
  image: String,
  sold: String,
  dateOfSale : Date
});

const Product = mongoose.model('Product', productSchema);

app.get("/", (req, res) => {
  res.end("Hello World");
});

app.get("/dbinit", async (req, res) => {
  try {
    // Use await to wait for the count result
    const count = await Product.countDocuments({});
    console.log(count);

    if (count > 0) {
      console.log('Database already populated. Skipping initialization.');
      res.end('Database already populated. Skipping initialization.');
    } else {
      // Use await to wait for the insertMany operation
      const data = fs.readFileSync(`./transaction.json`, { encoding: 'utf8', flag: 'r' });
      const obj = JSON.parse(data);
      //console.log(obj);
      obj.forEach(product => {
        console.log(product.dateOfSale);
      });

      await Product.insertMany(obj);
      res.status(200).json(obj);
    }
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get("/list", async (req, res) => {
    try {
      const { month } = req.query;
      // let smonth = req.query ? parseInt(req.query.month) : null;
      // let month = "March";
        
      if (!month || typeof month !== 'string') {
        const tran = await Product.find({});
        return res.status(200).json(tran);
      }
  
      // Convert the month to a numerical representation (1-12)
      const numericMonth = new Date(`${month} 1, 2000`).getMonth() + 1;
  
      const transactions = await Product.find({
        $expr: {
          $eq: [{ $month: '$dateOfSale' }, numericMonth],
        },
      });
      console.log(transactions);
      res.status(200).json(transactions);
    } catch (error) {
      console.error('Error:', error.message);
      res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/stats', async (req, res) => {
    try {
      const { month } = req.query;
        // const month ="March";
      const selectedMonth = new Date(`${month} 1, 2000`).getMonth() + 1;
      let salesFilter = {};
      let notSoldFilter = {};
  
      if (selectedMonth !== null) {
        salesFilter = { $and:[
            {sold: 'true'},
            {$expr: {
              $eq: [{ $month: '$dateOfSale' }, selectedMonth],
            }}
          ]
        };
  
        notSoldFilter = { $and:[
          {sold: 'false'},
          {$expr: {
            $eq: [{ $month: '$dateOfSale' }, selectedMonth],
          }}
        ]
      };
      }
  
      const salesInMonth = await Product.find(salesFilter);
      const notSoldInMonth = await Product.find(notSoldFilter);
  
      const totalSaleAmount = salesInMonth.reduce((total, product) => total + product.price, 0);
  
      res.json({
        totalSaleAmount,
        totalSoldItems: salesInMonth.length,
        totalNotSoldItems: notSoldInMonth.length,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});

// ... (previous code)

// Route to get bar chart data
app.get('/bar', async (req, res) => {
    try {
      const { month } = req.query;
        const selectedMonth = new Date(`${month} 1, 2000`).getMonth() + 1;
      let filter = {};
  
      if (selectedMonth !== null) {
        filter = {
            $expr: {
                $eq: [{ $month: '$dateOfSale' }, selectedMonth],
            }
        };
      }
  
      const products = await Product.find(filter);
  
      const priceRanges = [
        { min: 0, max: 100 },
        { min: 101, max: 200 },
        { min: 201, max: 300 },
        { min: 301, max: 400 },
        { min: 401, max: 500 },
        { min: 501, max: 600 },
        { min: 601, max: 700 },
        { min: 701, max: 800 },
        { min: 801, max: 900 },
        { min: 901, max: Number.MAX_SAFE_INTEGER },
      ];
  
      const barChartData = priceRanges.map((range) => {
        const itemsInPriceRange = products.filter(
          (product) => product.price >= range.min && product.price <= range.max
        );
        return {
          priceRange: `${range.min}-${range.max}`,
          numberOfItems: itemsInPriceRange.length,
        };
      });
  
      res.json(barChartData);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/pie', async (req, res) => {
    try {
      const month = req.query.month ? parseInt(req.query.month) : "March";
      //const month = "March";
       const selectedMonth = new Date(`${month} 1, 2000`).getMonth() + 1;
  
      let filter = {};
  
      if (selectedMonth !== null) {
        filter = {
            $expr: {
                $eq: [{ $month: '$dateOfSale' }, selectedMonth],
            }
        };
      }
  
      const products = await Product.find(filter);
  
      const categoryCounts = {};
  
      products.forEach((product) => {
        const category = product.category;
  
        if (categoryCounts[category]) {
          categoryCounts[category]++;
        } else {
          categoryCounts[category] = 1;
        }
      });
  
      const pieChartData = Object.keys(categoryCounts).map((category) => ({
        category,
        numberOfItems: categoryCounts[category],
      }));
  
      res.json(pieChartData);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/combine', async (req, res) => {
    try {

       const month = req.query.month ? parseInt(req.query.month) : "March";
      //const month = "March";
      const selectedMonth = new Date(`${month} 1, 2000`).getMonth() + 1;
      
      // Fetch data from /statistics endpoint
      const statisticsResponse = await fetch(`http://localhost:5000/stats?month=${selectedMonth}`);
      const statisticsData = await statisticsResponse.json();
  
      // Fetch data from /bar-chart endpoint
      const barChartResponse = await fetch(`http://localhost:5000/bar?month=${selectedMonth}`);
      const barChartData = await barChartResponse.json();
  
      // Fetch data from /pie-chart endpoint
      const pieChartResponse = await fetch(`http://localhost:5000/pie?month=${selectedMonth}`);
      const pieChartData = await pieChartResponse.json();
  
      // Combine responses
      const combinedData = {
        statistics: statisticsData,
        barChart: barChartData,
        pieChart: pieChartData,
      };
  
      res.json(combinedData);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.use((req, res) => {
  res.status(404).send("404 error");
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});



