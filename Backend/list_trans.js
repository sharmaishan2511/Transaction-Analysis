const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect('mongodb://127.0.0.1:27017/test', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const productSchema = new mongoose.Schema({
  id: Number,
  price: Number,
  description: String,
  category: String,
  image: String,
  sold: Boolean,
  dateofSale: Date
});

const Product = mongoose.model('Product', productSchema);

// Middleware to parse JSON requests
app.use(express.json());

// API endpoint to list transactions with search and pagination for a specific month
app.get('/api/transactions', async (req, res) => {
  try {
    const { search = '', page = 1, perPage = 10, month } = req.query;

    const regex = new RegExp(search, 'i'); // Case-insensitive search

    const query = {
      $or: [
        { title: regex },
        { description: regex },
        { price: regex },
      ],
    };

    if (month) {
      const startOfMonth = new Date(month);
      startOfMonth.setUTCDate(1);
      const endOfMonth = new Date(startOfMonth);
      endOfMonth.setUTCMonth(endOfMonth.getUTCMonth() + 1);

      query.dateofSale = {
        $gte: startOfMonth,
        $lt: endOfMonth,
      };
    }

    const totalCount = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalCount / perPage);

    const transactions = await Product.find(query)
      .skip((page - 1) * perPage)
      .limit(Number(perPage));

    res.json({
      total_count: totalCount,
      total_pages: totalPages,
      current_page: page,
      per_page: perPage,
      transactions,
    });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
