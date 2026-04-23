const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const morgan = require('morgan');
const app = express();
const PORT = process.env.PORT || 5000;
const ML_API_URL = 'http://localhost:8000';

app.use(cors());
app.use(bodyParser.json());

// Proxy endpoints to ML API
app.post('/api/tree/train', async (req, res) => {
    try {
        const response = await axios.post(`${ML_API_URL}/train-tree`, req.body);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Error communicating with ML API" });
    }
});

app.post('/api/tree/access', async (req, res) => {
    try {
        const response = await axios.post(`${ML_API_URL}/optimize-tree`, req.body);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Error communicating with ML API" });
    }
});

app.post('/api/tsp/solve', async (req, res) => {
    console.log("Received TSP solve request:");
    try {
        console.log("ml api hit");
        const response = await axios.post(`${ML_API_URL}/tsp-predict`, req.body);
        console.log(response);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Error communicating with ML API" });
    }
});

app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
});
