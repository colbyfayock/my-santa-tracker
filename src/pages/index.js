import React from 'react';
import Helmet from 'react-helmet';
import L from 'leaflet';

import Layout from 'components/Layout';
import Container from 'components/Container';
import Map from 'components/Map';

const LOCATION = {
  lat: 38.9072,
  lng: -77.0369
};
const CENTER = [LOCATION.lat, LOCATION.lng];
const DEFAULT_ZOOM = 2;

const IndexPage = () => {
  /**
   * mapEffect
   * @description Fires a callback once the page renders
   * @example Here this is and example of being used to zoom in and set a popup on load
   */

  async function mapEffect({ leafletElement } = {}) {
    if ( !leafletElement ) return;
    let santa, santaJson, route, routeJson;
    try {
      santa = await fetch('https://santa-api.appspot.com/info?client=web&language=en&fingerprint=&routeOffset=0&streamOffset=0');
      santaJson = await santa.json();
      route = await fetch(santaJson.route);
      routeJson = await route.json();
    } catch(e) {
      throw new Error(`Failed to find Santa!: ${e}`)
    }

    // Grab Santa's route destinations, determine which ones have presents, and figure out his last known
    // location where he delivered a present

    const { destinations } = routeJson;
    const destinationsWithPresents = destinations.filter(({presentsDelivered}) => presentsDelivered > 0);
    const lastKnownDestination = destinationsWithPresents[destinationsWithPresents.length - 1]

    // Create a Leaflet LatLng instance using that location

    const santaLocation = new L.LatLng( lastKnownDestination.location.lat, lastKnownDestination.location.lng );

    // Create a Leaflet Market instance using Santa's LatLng location

    const santaMarker = L.marker( santaLocation, {
      icon: L.divIcon({
        className: 'icon',
        html: `<div class="icon-santa">🎅</div>`,
        iconSize: 50
      })
    });

    // Add Santa to the map!

    santaMarker.addTo(leafletElement);
  }

  const mapSettings = {
    center: CENTER,
    defaultBaseMap: 'OpenStreetMap',
    zoom: DEFAULT_ZOOM,
    mapEffect
  };

  return (
    <Layout pageName="home">
      <Helmet>
        <title>Home Page</title>
      </Helmet>

      <Map {...mapSettings} />

      <Container type="content" className="text-center home-start">
        <h2>Still Getting Started?</h2>
        <p>Run the following in your terminal!</p>
        <pre>
          <code>gatsby new [directory] https://github.com/colbyfayock/gatsby-starter-leaflet</code>
        </pre>
        <p className="note">Note: Gatsby CLI required globally for the above command</p>
      </Container>
    </Layout>
  );
};

export default IndexPage;
