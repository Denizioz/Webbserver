const express = require("express");
const sql = require("mssql");
const app = express();

const connectionSettings = {
  server: "localhost",
  database: "BokhandelLabb",
  user: "Labb3",
  password: "Labb3",
  options: {
    trustServerCertificate: true,
  },
};

app.set("view engine", "pug");

app.get("/", async (request, response) => {
  try {
    const connection = await sql.connect(connectionSettings);
    const result = await connection
      .request()
      .query(
        "SELECT Böcker.ISBN13, Böcker.Titel, Böcker.Pris, Författare.Förnamn, Författare.Efternamn, Genrer.Namn FROM Böcker INNER JOIN Författare ON Böcker.FörfattareID = Författare.ID INNER JOIN Genrer ON Böcker.GenreID = Genrer.ID"
      );
    console.log(result);
    response.render("index", {
      data: result.recordset,
      URL: "/book/" + result.recordset.ISBN13,
    });
  } catch (ex) {
    console.log(ex.message);
  }
});

app.get("/book/:ISBNURL", async (request, response) => {
  let ISBNURL = request.params.ISBNURL;
  const Butiksinfo = [];

  try {
    const connection = await sql.connect(connectionSettings);
    const result = await connection
      .request()
      .query(
        `SELECT Böcker.ISBN13, Butik.ButiksNamn, Butik.ButiksID, Lagersaldo.Antal, Lagersaldo.ButikID, Böcker.Titel, Böcker.Språk, Böcker.Pris, Författare.Förnamn, Författare.Efternamn, Genrer.Namn from Böcker INNER JOIN Författare ON Böcker.FörfattareID = Författare.ID INNER JOIN Genrer ON Böcker.GenreID = Genrer.ID INNER JOIN Lagersaldo ON Böcker.ISBN13 = Lagersaldo.ISBN13 INNER JOIN Butik ON Lagersaldo.ButikID = Butik.ButiksID WHERE Böcker.ISBN13 = ${ISBNURL};`
      );
    for (let i = 0; i < result.recordset.length; i++) {
      const element = result.recordset[i];
      Butiksinfo.push({
        Namn: element.ButiksNamn,
        Antal: element.Antal,
      });
    }
    response.render("bookinfo", {
      singleData: result.recordset[0],
      ButiksData: Butiksinfo,
    });
  } catch (ex) {
    console.log(ex.message);
  }
});

app.listen(3000, () => {
  console.log("Listening on port 3000.");
});
