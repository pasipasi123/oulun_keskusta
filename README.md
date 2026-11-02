# Oulu muualla

Leaflet- ja JavaScript-sovellus, jossa Oulun keskustan likimääräinen rajaus pysyy kartan keskellä. Siirrä karttaa vertaillaksesi keskustan kokoa muualla.

## Käynnistys

Tarvitset Node.js:n (vähintään 18). Ei npm-riippuvuuksia tai käännösvaihetta.

```sh
npm start
```

Avaa http://127.0.0.1:5173. Testit: `npm test`.

Vaihtoehtoisesti ilman npm:ää: `node server.js` ja `node --test`.

## Toiminta

- Vedä karttaa tai käytä nuolinäppäimiä kartan ollessa kohdistettuna.
- Zoomaa hiiren rullalla, kosketuseleellä tai plus- ja miinuspainikkeilla.
- Kaupunkipainikkeet siirtävät Ouluun, Helsinkiin, Tampereelle ja Turkuun.
- Polygonin ankkurina on alueen pinta-alan keskipiste. SVG piirretään kartan päälle ja päivitetään jokaisella siirto-, zoomaus- ja kokomuutostapahtumalla.
- Kärkien etäisyydet ja ilmansuunnat keskipisteestä säilytetään pallogeometrian avulla. Pelkkä leveys- ja pituusasteiden siirtäminen vääristäisi kokoa eri leveysasteilla.
- Maantieteellinen koko säilyy ja ruudulla näkyvä koko muuttuu zoomauksen sekä paikallisen karttamittakaavan mukana. Pallomalli on havainnolliseen vertailuun tarkoitettu likiarvo.

## Rajauksen muuttaminen

Muokkaa `geometry.js`-tiedoston `OULU_BOUNDARY`-koordinaatteja järjestyksessä `[leveysaste, pituusaste]`. Rajaus on käsin tehty havainnollistus, ei virallinen keskustan tai kaupunginosan raja. Keskipiste ja pinta-ala lasketaan automaattisesti.

## Kartta ja julkaiseminen

Leaflet 1.9.4 ladataan unpkg-palvelusta, karttatiilet OpenStreetMapista ja fontit Google Fontsista. Sovelluksen käyttö edellyttää verkkoyhteyttä. Fontin latausvirhe käyttää järjestelmäfonttia.

Sovellus toimii staattisella verkkopalvelimella. Julkaise `index.html`, `app.js`, `geometry.js` ja `styles.css` samassa hakemistossa. GitHub Pages -julkaisu onnistuu myös repon juuresta. Karttatiilien käytössä on noudatettava [OpenStreetMapin käyttöehtoja](https://operations.osmfoundation.org/policies/tiles/); suurelle liikenteelle kannattaa valita erillinen tiilipalvelu.

### GitHub Actions → webhotelli FTPS:llä

Lisää repon **Settings → Secrets and variables → Actions → New repository secret**:

| Secret | Esimerkki / merkitys |
| --- | --- |
| `FTPS_HOST` | `ftp.example.fi`, pelkkä palvelinnimi |
| `FTPS_USER` | FTP-käyttäjätunnus |
| `FTPS_PASSWORD` | FTP-salasana |
| `FTPS_REMOTE_DIR` | Olemassa oleva kohdehakemisto, esim. `/public_html/oulu/` |
| `FTPS_PORT` | Valinnainen; oletus `21` |

Workflow testaa geometrian ja JavaScriptin syntaksin ja siirtää neljä julkista tiedostoa, kun `main`-haaraan pushataan. Sen voi käynnistää myös Actions-välilehden **Run workflow** -painikkeella. Lisää secretit ennen ensimmäistä julkaisua; ilman niitä julkaisu pysähtyy selkeään virheilmoitukseen. Tunnuksia ei tule selaimen koodiin.

Kohdehakemisto pitää luoda webhotellissa etukäteen. Siellä samannimiset neljä tiedostoa korvataan; muita tiedostoja ei poisteta. Käytä sovellukselle omaa hakemistoa. Toteutus käyttää eksplisiittistä FTPS:ää (AUTH TLS, yleensä portti 21), passiivista tiedonsiirtoa ja varmenteen tarkistusta. Jos webhotelli tarjoaa vain implisiittisen FTPS:n (yleensä portti 990) tai SFTP:n, siirtotapa pitää muuttaa; pelkkä portin vaihto ei riitä. Webhotellissa ei tarvita Pythonia tai Node.js:ää, sillä julkaisu ajetaan GitHubin palvelimella.
