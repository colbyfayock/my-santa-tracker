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
const DEFAULT_ZOOM = 1;

const IndexPage = () => {
  /**
   * mapEffect
   * @description Fires a callback once the page renders
   * @example Here this is and example of being used to zoom in and set a popup on load
   */

  async function mapEffect({ leafletElement } = {}) {
    if ( !leafletElement ) return;
    let route, routeJson;
    try {
      route = await fetch('https://firebasestorage.googleapis.com/v0/b/santa-tracker-firebase.appspot.com/o/route%2Fsanta_en.json?alt=media&2018b');
      routeJson = await route.json();
    } catch(e) {
      console.log(`Failed to find Santa!: ${e}`);
    }

    // Grab Santa's route destinations, determine which ones have presents, and figure out his last known
    // location where he delivered a present

    const { destinations = [] } = routeJson || {};
    const destinationsVisited = destinations.filter(({arrival}) => arrival < Date.now());
    const destinationsWithPresents = destinationsVisited.filter(({presentsDelivered}) => presentsDelivered > 0);

    if ( destinationsWithPresents.length === 0 ) {
      // Create a Leaflet Market instance using Santa's LatLng location
      const center = new L.LatLng( 0, 0 );
      const noSanta = L.marker( center, {
        icon: L.divIcon({
          className: 'icon',
          html: `<div class="icon-santa">🎅</div>`,
          iconSize: 50
        })
      });
      noSanta.addTo( leafletElement );
      noSanta.bindPopup( `Santa's still at the North Pole!` );
      noSanta.openPopup();
      return;
    }

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

    // Create a set of LatLng coordinates that make up Santa's route

    const santasRouteLatLngs = destinationsWithPresents.map(destination => {
      const { location } = destination;
      const { lat, lng } = location;
      return new L.LatLng( lat, lng );
    });

    // Utilize Leaflet's Polyline to add the route to the map

    const santasRoute = new L.Polyline( santasRouteLatLngs, {
      weight: 2,
      color: 'green',
      opacity: 1,
      fillColor: 'green',
      fillOpacity: 0.5
    });

    // Add Santa to the map!

    santasRoute.addTo(leafletElement);
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
