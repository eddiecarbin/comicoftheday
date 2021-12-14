const express = require('express');
const { parse } = require("node-html-parser");
const rp = require("request-promise-native");
const r = require("request");
const cors = require('cors');
const app = express();

app.use(
    cors()
);
app.use(express.json());

const getImage = async function request(options) {
    const dateString = (function createForamttedDate() {
        const date = new Date(...options.date);
        return date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate();
    })();

    const imgURL = await rp("https://www.gocomics.com/" + options.comicName + "/" + dateString)
        .then( async (response) => {
            const parsedPage = await parse(response);
            const imageURL = parsedPage.querySelector(".item-comic-image img").rawAttrs.split(/ src=/)[1].replace(/"/g, "");
            return options.URLOnly ? imageURL : r(imageURL);

        }).catch(err => {
            console.log("Request failed\n", err);
            return "failed to load comic";
        })

    return imgURL;
}

app.post('/post', async (req, res) => {
    const image = await getImage({ comicName: 'peanuts', date: req.body.date, URLOnly: true });
    res.send(JSON.stringify({ image: image }));
});


app.get('/', async (req, res) => {
    // console.log(req.body);
    // const image = await getImage({comicName:'peanuts', date:[2010, 4, 4]});
    // console.log(image);
    res.set('Access-Control-Allow-Origin', '*');
    res.send("Hello from App Engine!");
});

app.get('/cors', (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.send('This has CORS enabled 🎈')
})

// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`);
});