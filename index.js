const cool = require('cool-ascii-faces');
const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;

const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))

  .get('/cool', (req, res) => res.send(cool()))
  .get('/db', async (req, res) => {
      try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM test_table');
        const results = { 'results': (result) ? result.rows : null};
        res.render('pages/db', results );
        client.release();
      } catch (err) {
        console.error(err);
        res.send("Error " + err);
      }
    })
  .get('/classify', (req, res) => res.render('pages/classification', classify(isbn)))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

function classify(isbn) {
  // Get ISBN provided by user
  // let searchbox = document.getElementById("isbn");
  // let isbn = searchbox.value;

  const request = new XMLHttpRequest();
  let baseURL = "http://classify.oclc.org/classify2/Classify?";

  let url = baseURL + "isbn=" + isbn + "&summary=true";

  request.open("GET", url);
  request.send();

  request.onload = (e) => {
    console.log(request.response);
    resp = request.response;
  }

  return resp;
}