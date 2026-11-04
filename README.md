# Kokeile mihin Oulun keskusta mahtuu

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
- Kartta täyttää koko näytön. Kaupunkipainikkeet siirtävät Ouluun, Helsinkiin, Tampereelle, Turkuun, Jyväskylään, Lahteen ja Lappeenrantaan.
- Oulun keskustan määritelmä -painike avaa rajauksen perustelut.
- Polygonin ankkurina on alueen pinta-alan keskipiste. SVG piirretään kartan päälle ja päivitetään jokaisella siirto-, zoomaus- ja kokomuutostapahtumalla.
- Kärkien etäisyydet ja ilmansuunnat keskipisteestä säilytetään pallogeometrian avulla. Pelkkä leveys- ja pituusasteiden siirtäminen vääristäisi kokoa eri leveysasteilla.
- Maantieteellinen koko säilyy ja ruudulla näkyvä koko muuttuu zoomauksen sekä paikallisen karttamittakaavan mukana. Pallomalli on havainnolliseen vertailuun tarkoitettu likiarvo.

## Rajauksen muuttaminen

Käytössä on käyttäjän piirtämä 16 kärkipisteen rajaus tiedostosta `oulun_keskusta2.geojson`. Sen koordinaatit on kopioitu `geometry.js`-tiedoston `OULU_BOUNDARY`-listaan järjestyksessä `[leveysaste, pituusaste]`. GeoJSONin järjestys on `[pituusaste, leveysaste]`; viimeinen, ensimmäisen pisteen toistava sulkupiste jätetään listasta pois.

Rajaus on havainnollistus, ei virallinen keskustan tai kaupunginosan raja. Keskipiste ja pinta-ala lasketaan automaattisesti. Jos muokkaat GeoJSON-tiedostoa, päivitä myös `OULU_BOUNDARY`-lista. Testi varmistaa, että sovellus ja lähdetiedosto vastaavat toisiaan. GeoJSONia ei tarvitse siirtää webhotelliin, sillä selain käyttää `geometry.js`-tiedostoa.

## Kartta ja julkaiseminen

Leaflet 1.9.4 ladataan unpkg-palvelusta, karttatiilet OpenStreetMapista ja fontit Google Fontsista. Sovelluksen käyttö edellyttää verkkoyhteyttä. Fontin latausvirhe käyttää järjestelmäfonttia.

Sovellus toimii staattisella verkkopalvelimella. Julkaise `index.html`, `app.js`, `geometry.js` ja `styles.css` samassa hakemistossa. GitHub Pages -julkaisu onnistuu myös repon juuresta. Karttatiilien käytössä on noudatettava [OpenStreetMapin käyttöehtoja](https://operations.osmfoundation.org/policies/tiles/); suurelle liikenteelle kannattaa valita erillinen tiilipalvelu.

### GitHub Actions → GitHub Pages

Julkaisuosoite: https://pasipasi123.github.io/oulun_keskusta/

Repon Pages-julkaisulähde on GitHub Actions. Workflow `.github/workflows/deploy.yml` ajaa testit ja julkaisee sovelluksen jokaisella `main`-haaran pushilla. Sen voi käynnistää myös Actions-välilehden **Run workflow** -painikkeella.

Julkaisuun pakataan vain `index.html`, `app.js`, `geometry.js` ja `styles.css`. Erillisiä salasanoja tai FTPS-secretejä ei tarvita. Aiempi FTPS-workflow on korvattu Pages-julkaisulla. Haluttaessa tiedostot voi yhä siirtää käsin webhotelliin.
