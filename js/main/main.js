var newMap;
const map = document.querySelector('#map');
let allFavoriteButtons;

/**
 * Register Service Worker
 * Check the service worker object for Update
 */

if (navigator.serviceWorker) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./sw.js')
      .then(reg => {
        if (!navigator.serviceWorker.controller) return;

        if (reg.waiting) {
          updateSw(reg.waiting);
          return;
        }

        if (reg.installing) {
          trackSwInstalling(reg.installing);
          return;
        }

        reg.addEventListener('updatefound', () => {
          trackSwInstalling(reg.installing);
        });
      })
      .catch(err => {
        console.log(err);
      });
  });
}

/**
 * Reload page if the service worker controlling the page changes
 */
let refreshing = false;
navigator.serviceWorker.addEventListener('controllerchange', () => {
  if (refreshing) return;
  window.location.reload();
  refreshing = true;
});

/**
 * Track the installing state of the service worker
 */
function trackSwInstalling(worker) {
  worker.addEventListener('statechange', () => {
    if (worker.state === 'installed') {
      updateSw(worker);
    }
  });
}

/**
 * Update the post message in the worke that trigers a reload
 */
function updateSw(worker) {
  worker.postMessage({ action: 'skipWaiting' });
}

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', () => {
  initMap(); // added
  fetchNeighborhoods();
  fetchCuisines();
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
const fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) {
      // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
};

/**
 * Set neighborhoods HTML.
 */
const fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
};

/**
 * Fetch all cuisines and set their HTML.
 */
const fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) {
      // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
};

/**
 * Set cuisines HTML.
 */
const fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
};

/**
 * Initialize leaflet map, called from HTML.
 */
const initMap = () => {
  self.newMap = L.map('map', {
    center: [40.722216, -73.987501],
    zoom: 12,
    scrollWheelZoom: false,
  });
  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
    mapboxToken: 'pk.eyJ1IjoiZG90dW5haiIsImEiOiJjampwbmlkeGUwN3A3M3JwNDExOHRnbmZlIn0.JwTQ7Fjm5FV3J9N06r-GkQ',
    maxZoom: 18,
    attribution:
      'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
      '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
      'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox.streets',
  }).addTo(newMap);

  updateRestaurants();
};
/* window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
  updateRestaurants();
} */

/**
 * Update page and map for current restaurants.
 */
const updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) {
      // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  });
};

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
const resetRestaurants = restaurants => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  if (self.markers) {
    self.markers.forEach(marker => marker.remove());
  }
  self.markers = [];
  self.restaurants = restaurants;
};

/**
 * Create all restaurants HTML and add them to the webpage.
 */
const fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  allFavoriteButtons = document.querySelectorAll('.restaurant-favorite-button');
  addMarkersToMap();
};

/**
 * Create restaurant HTML.
 */
const createRestaurantHTML = restaurant => {
  const li = document.createElement('li');

  const image = document.createElement('img');
  image.className = 'restaurant-img';
  if (restaurant.id > 9) {
    image.src = `${DBHelper.imageUrlForRestaurant(restaurant).slice(0, 7)}-500.jpg`;
  } else {
    image.src = `${DBHelper.imageUrlForRestaurant(restaurant).slice(0, 6)}-500.jpg`;
  }
  image.alt = DBHelper.altMessagesForImages(restaurant);
  li.append(image);

  const div = document.createElement('div');
  div.className = 'restaurant-details';
  li.append(div);

  const div2 = document.createElement('div');
  div2.className = 'restaurant-name-favorite';
  div.append(div2);

  const name = document.createElement('h2');
  name.innerHTML = restaurant.name;
  div2.append(name);

  const i = document.createElement('i');
  i.className = 'fas fa-heart';
  if (restaurant.is_favorite === 'true') {
    i.classList.add('restaurant-favorite-clicked');
  } else {
    i.classList.remove('restaurant-favorite-clicked');
  }
  div2.setAttribute('aria-label', `${restaurant.name} is favorite restaurant`);
  div2.append(i);

  const neighborhood = document.createElement('p');
  neighborhood.innerHTML = restaurant.neighborhood;
  div.append(neighborhood);

  const address = document.createElement('p');
  address.innerHTML = restaurant.address;
  div.append(address);

  const more = document.createElement('a');
  more.innerHTML = 'View Details';
  more.href = DBHelper.urlForRestaurant(restaurant);
  more.setAttribute('aria-label', `View Details for ${restaurant.name}`);
  div.append(more);

  return li;
};

/**
 * Add markers for current restaurants to the map.
 */
const addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.newMap);
    marker.on('click', onClick);
    function onClick() {
      window.location.href = marker.options.url;
    }
    self.markers.push(marker);
  });
};
/* addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    self.markers.push(marker);
  });
} */

/**
 * Jump Focus for map focusables and go straight to main content
 */
window.addEventListener('load', () => {
  const mapFocusables = document.querySelectorAll('.leaflet-marker-icon, .leaflet-control a');
  map.tabIndex = -1;
  mapFocusables.forEach(mapFocusable => {
    mapFocusable.tabIndex = -1;
  });
});