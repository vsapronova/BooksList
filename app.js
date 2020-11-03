const express = require('express');
const fetch = require("node-fetch");
const cors = require('cors');

var xml2js = require('xml2js');

const app = express();
app.use(cors())

process.env.GOODREADS_KEY = 'RDfV4oPehM6jNhxfNQzzQ';

app.use(express.static('public'))

app.get('/search', async (req, res) => {
    if (req.query.search == undefined) {
        res.status(400)
        res.json({message: "Has to provide search query parameter"})
        return
    }
    if (req.query.page == undefined) {
        res.status(400)
        res.json({message: "Has to provide page parameter"})
        return
    }

    try {
        let response = await fetch(`https://www.goodreads.com/search/index.xml?key=${process.env.GOODREADS_KEY}&q=${req.query.search}&page=${req.query.page}`)
        if (response.status !== 200) {
            throw "Request to Goodreads has failed"
        }
        let xml = await response.text()
        let json = await xml2js.parseStringPromise(xml);
        var responseJson = convertResponse(json)
        res.json(responseJson)            
    } catch (err) {
        res.status(500)
        res.json({ message: err })
    }
});

function convertBook(workItem) {
    let bestBook = workItem.best_book[0]
    return {
        id: bestBook.id[0]._,
        imageUrl: bestBook.image_url[0],
        author: bestBook.author[0].name[0],
        title: bestBook.title[0]
    }
}

function convertResponse(json) {
    let searchResults = json.GoodreadsResponse.search[0]
    let workItems = searchResults.results[0].work
    let totalBooks = parseInt(searchResults["total-results"][0])
    let pageSize = 20
    let startBook = parseInt(searchResults["results-start"][0])
    let endBook = parseInt(searchResults["results-end"][0])
    let pageNum = Math.ceil(endBook / pageSize)
    let metadata = { totalBooks, pageSize, pageNum, startBook, endBook }

    var books = []
    if (totalBooks > 0) {
        books = workItems.map(convertBook)
    }
    return { books, metadata }
}

app.listen(3001);