require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/', express.static(path.join(__dirname, '../../dist')));

/**
 * Send GET request to NASA APOD endpoint to get Astronomy Picture of the given Day
 */
app.get('/apod/:date', async (req, res) => {
    try {
        let image = await fetch(`https://api.nasa.gov/planetary/apod?date=${req.params.date}&api_key=${process.env.API_KEY}`)
            .then(res => {
                if (res.ok) {
                    return res.json();
                } else {
                    throw {
                        message: 'Sorry, no data available today'
                    };
                }
            });
        res.send({ image });
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
})

/**
 * Send GET request to NASA Mars Rover Photos endpoint to get given rover manifest
 */
app.get('/manifests/:roverName', async (req, res) => {
    try {
        let manifest = await fetch(`https://api.nasa.gov/mars-photos/api/v1/manifests/${req.params.roverName}?api_key=${process.env.API_KEY}`)
            .then(res => res.json());
        res.send({ manifest });
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
})

/**
 * Send GET request to NASA Mars Rover Photos endpoint to get photos from given camera/sol/earthDate query conditions
 */
app.get('/query', async (req, res) => {
    try {
        const queryData = req.query;
        const roverName = queryData.roverName;
        let queryString = [];
        if (queryData.hasOwnProperty('earthDate')) {
            queryString = queryString.concat(`earth_date=${queryData.earthDate}`);
        }
        if (queryData.hasOwnProperty('sol')) {
            queryString = queryString.concat(`sol=${queryData.sol}`);
        }
        if (queryData.hasOwnProperty('camera')) {
            queryString = queryString.concat(`camera=${queryData.camera}`);
        }
        queryString = queryString.concat(`api_key=${process.env.API_KEY}`);
        let response = await fetch(
            `https://api.nasa.gov/mars-photos/api/v1/rovers/${roverName}/photos?${queryString.join('&')}`)
            .then(res => res.json());
        res.send({ response });
    } catch (err) {
        console.error(err);
        res.status(500).send(err);
    }
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`));