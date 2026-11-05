# Oulu city centre size comparison

An interactive Leaflet map that lets you place an outline of Oulu city centre over other locations. The polygon stays at the centre of the screen and preserves its real-world size as you move and zoom the map.

**[Open the app](https://pasipasi123.github.io/oulun_keskusta/)**

The interface is in Finnish. It includes shortcuts to Oulu, Helsinki, Tampere, Turku, Jyväskylä, Lahti and Lappeenranta. On mobile, the city shortcuts collapse into a dropdown and the heading and selector use translucent backgrounds.

## Local development

Use Node.js 22 or newer. There are no package dependencies and no build step.

```sh
npm start
```

Open http://127.0.0.1:5173. To run without npm:

```sh
node server.js
```

The preview server binds to localhost and serves only the four public application files. Set the `PORT` environment variable to use another port.

## Tests

```sh
npm test
```

Or run `node --test` directly. Tests cover the GeoJSON conversion, reconstruction of the original boundary, distances and bearings after relocation, approximate area preservation and zoom scaling.

## Boundary and geometry

The outline is a subjective interpretation of Oulu city centre, focusing on perimeter blocks and street-level businesses. It deliberately excludes Meritulli, Vänmanninsaari, Etu-Lyötty and much of the informal Heinäpää area. It is not an official administrative boundary.

The original 16-vertex boundary is stored in `oulun_keskusta2.geojson`. Its coordinates are copied into `OULU_BOUNDARY` in `geometry.js`:

- GeoJSON uses `[longitude, latitude]`.
- The application uses `[latitude, longitude]`.
- The repeated closing coordinate is omitted from the application array.

When changing the boundary, update both files. A test checks that they match. The anchor point and geometry are calculated automatically.

Each vertex is stored as a distance and bearing from the boundary's area centroid. The app reconstructs the vertices around the current map centre using spherical geometry and draws them in a screen-fixed SVG overlay. This accounts for the latitude-dependent scale of the map projection. The spherical model is intended for visual comparison rather than surveying.

## Deployment

GitHub Pages is configured to use GitHub Actions. The workflow in `.github/workflows/deploy.yml` runs the tests and JavaScript syntax checks, then publishes every push to `main`. It can also be triggered manually from the Actions tab.

Only these files are included in the published site:

- `index.html` — page structure and Finnish interface text
- `app.js` — map interaction and city selection
- `geometry.js` — boundary coordinates and geometry calculations
- `styles.css` — desktop and mobile styles

The `_site/` directory is generated during deployment and is ignored by Git. Deployment uses GitHub's built-in authentication; no deployment secrets are required. The same four public files can also be served by any static web server, including from a subdirectory.

## External resources

The app loads Leaflet 1.9.4 from unpkg, map tiles from OpenStreetMap and fonts from Google Fonts. An internet connection is required; system fonts are used if the web fonts cannot load.

OpenStreetMap attribution is displayed on the map. Tile usage must follow the [OpenStreetMap tile usage policy](https://operations.osmfoundation.org/policies/tiles/). For higher traffic, use a suitable tile provider.
