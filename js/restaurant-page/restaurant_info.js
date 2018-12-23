var newMap;
var reviews_all;
var favoriteFlag = false;

const viewMap = document.querySelector('.viewmap-button');
const mapContainer = document.querySelector('#map-container');
const close = document.querySelector('.close');

/**
 * Get a parameter by name from page URL.
 */
const getParameterByName = (name, url) => {
  if (!url) url = window.location.href;
  name = name.replace(/[[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
};

const id = getParameterByName('id');
/**
 * Review DbHElper
 */
fetch(`http://localhost:1337/reviews/?restaurant_id=${id}`)
  .then(response => response.json())
  .then(data => {
    dbPromise.then(db => {
      if (!db) return;
      const tx = db.transaction('review-data', 'readwrite');
      const store = tx.objectStore('review-data');
      reviews_all.forEach(review => {
        store.put(review);
      });
    });
    reviews_all = data;
  })
  .catch(error => {
    dbPromise.then(db => {
      if (!db) return;
      const tx = db.transaction('review-data');
      const store = tx.objectStore('review-data');
      store.getAll().then(reviews => {
        if (reviews.length === 0) {
          console.log(error);
          return;
        }
        const reviewss = reviews.filter(review => {
          if (review.restaurant_id == getParameterByName('id')) {
            return true;
          }
        });
        reviews_all = reviewss;
      });
    });
  });

/**
 * Initialize map as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', () => {
  initMap();
});

/**
 * Initialize leaflet map
 */
const initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) {
      // Got an error!
      console.error(error);
    } else {
      self.newMap = L.map('map', {
        center: [restaurant.latlng.lat, restaurant.latlng.lng],
        zoom: 16,
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
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap);
    }
  });
};

/* window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
} */

/**
 * Get current restaurant from page URL.
 */
const fetchRestaurantFromURL = callback => {
  if (self.restaurant) {
    // restaurant already fetched!
    callback(null, self.restaurant);
    return;
  }
  if (!id) {
    // no id found in URL
    error = 'No restaurant id in URL';
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant);
    });
  }
};

/**
 * Create restaurant HTML and add it to the webpage
 */
const fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const button = document.querySelector('.restaurant-favorite-button');

  const i = document.createElement('i');
  if (restaurant.is_favorite === 'true') {
    favoriteFlag = true;
    i.className = 'fas fa-heart restaurant-favorite-clicked';
  } else {
    favoriteFlag = false;
    i.className = 'fas fa-heart';
  }
  button.setAttribute('aria-label', `${restaurant.name} is favorite restaurant`);
  button.append(i);

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const picture = document.getElementById('restaurant-picture');
  picture.className = 'restaurant-img';

  const smallScreen = document.getElementById('small-screen');
  if (restaurant.id > 9) {
    smallScreen.srcset = `${DBHelper.imageUrlForRestaurant(restaurant).slice(0, 7)}-500.jpg`;
  } else {
    smallScreen.srcset = `${DBHelper.imageUrlForRestaurant(restaurant).slice(0, 6)}-500.jpg`;
  }

  const largeScreen = document.getElementById('large-screen');
  largeScreen.srcset = DBHelper.imageUrlForRestaurant(restaurant);

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img';
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.alt = DBHelper.altMessagesForImages(restaurant);

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();

  /**
   * Add restaurant id to from parameters
   */

  document.querySelector('#restaurant_id').value = restaurant.id;
};

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
const fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
};

/**
 * Create all reviews HTML and add them to the webpage.
 */
const fillReviewsHTML = (reviews = reviews_all) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h3');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.reverse().forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
};

/**
 * Create review HTML and add it to the webpage.
 */
const createReviewHTML = review => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  li.appendChild(name);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
};

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
const fillBreadcrumb = (restaurant = self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
};

/* Slide in Map for smaller screens */

viewMap.addEventListener('click', openMap);

function openMap() {
  const focusedBeforeMapSlideIn = document.activeElement;
  const focuseableElementsString =
    'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]';
  let focusableElements = mapContainer.querySelectorAll(focuseableElementsString);
  focusableElements = Array.prototype.slice.call(focusableElements);

  const firstTabStop = focusableElements[0];
  const lastTabStop = focusableElements[focusableElements.length - 1];

  mapContainer.classList.add('open');

  firstTabStop.focus();

  function trapTabKey(e) {
    // Check to see if tab key is pressed

    if (e.keyCode === 9) {
      //Check if  shift key is pressed down
      if (e.shiftkey) {
        if (document.activeElement === firstTabStop) {
          e.preventDefault();
          lastTabStop.focus();
        }
      }
      //if tab key is pressed alone
      else {
        if (document.activeElement === lastTabStop) {
          e.preventDefault();
          firstTabStop.focus();
        }
      }
    }
  }

  mapContainer.addEventListener('keydown', trapTabKey);

  close.addEventListener('click', () => {
    mapContainer.classList.remove('open');
    focusedBeforeMapSlideIn.focus();
  });
}

/**
 * Handler for review form
 */
function generateId() {
  return Math.random().toString(36).substr(2);
}
function processForm(e) {
  let presentId = generateId();
  if (e.preventDefault) e.preventDefault();
  const data = new URLSearchParams();
  const data2 = new FormData(e.target);
  for (const pair of data2) {
    data.append(pair[0], pair[1]);
  }
  var formObject = {};
  data2.forEach(function(value, key) {
    formObject[key] = value;
  });

  if (navigator.onLine) {
    fetch('http://localhost:1337/reviews/', {
      method: 'post',
      headers: {
        'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
      },
      body: data,
    }).then(() => {
      window.location.reload();
      return false;
    });
  } else {
    const dbData = formObject;
    dbPromise
      .then(db => {
        if (!db) return;
        const tx = db.transaction('offlineReview-data', 'readwrite');
        const store = tx.objectStore('offlineReview-data');
        store.put(formObject, presentId);
      })
      .then(() => {
        dbPromise.then(db2 => {
          dbData['id'] = presentId;
          console.log(dbData);
          const tx1 = db2.transaction('review-data', 'readwrite');
          const store1 = tx1.objectStore('review-data');
          store1.put(dbData);
          window.location.reload();
          return false;
        });
      });
  }

}

/**
 * Handle the Button that makes a restaurant favorite
 */

function handlefavorite() {
  const id = getParameterByName('id');
  if (navigator.onLine) {
    fetch(`http://localhost:1337/restaurants/${id}/?is_favorite=${!favoriteFlag}`, {
      method: 'put',
      data: `is_favorite=${!favoriteFlag}`,
    }).then(() => {
      favoriteFlag = !favoriteFlag;
      const i = document.querySelector('.fa-heart');
      i.classList.toggle('restaurant-favorite-clicked');
    });
  } else {
    dbPromise.then(db => {
      if (!db) return;
      const tx = db.transaction('favorite-data', 'readwrite');
      const store = tx.objectStore('favorite-data');
      store.put(`${!favoriteFlag}`, `${id}`);
      favoriteFlag = !favoriteFlag;
      const i = document.querySelector('.fa-heart');
      i.classList.toggle('restaurant-favorite-clicked');
    });
  }
}

window.onload = function() {
  const form = document.querySelector('#reviews-form');
  if (form.attachEvent) {
    form.attachEvent('submit', processForm);
  } else {
    form.addEventListener('submit', processForm);
  }
  window.addEventListener('online', () => {
    let presentId;
    dbPromise
      .then(db => {
        if (!db) return;
        const tx = db.transaction('favorite-data', 'readwrite');
        const store = tx.objectStore('favorite-data');
        store.getAll().then(favorites => {
          if (favorites.length === 0) {
            return;
          }
        });
        return store.openCursor();
      })
      .then(function putFavorite(cursor) {
        if (!cursor) return;
        fetch(`http://localhost:1337/restaurants/${cursor.key}/?is_favorite=${cursor.value}`, {
          method: 'put',
          data: `is_favorite=${cursor.value}`,
        });
        cursor.delete();
        return cursor.continue().then(putFavorite);
      });
    dbPromise
      .then(db => {
        if (!db) return;
        const tx = db.transaction('offlineReview-data', 'readwrite');
        const store = tx.objectStore('offlineReview-data');
        return store.openCursor();
      })
      .then(function putReview(cursor) {
        if (!cursor) return;
        presentId = cursor.key;
        const data = new URLSearchParams();
        for (const key of Object.keys(cursor.value)) {
          data.append(key, cursor.value[key]);
        }
        fetch('http://localhost:1337/reviews/', {
          method: 'post',
          headers: {
            'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
          },
          body: data,
        }).then(() => {
          dbPromise
            .then(db => {
              const tx = db.transaction('review-data', 'readwrite');
              const store = tx.objectStore('review-data');
              return store.openCursor();
            })
            .then(function deleteReview(cursor) {
              if (!cursor) return;
              if (cursor.key === presentId) {
                cursor.delete();
              }
              cursor.continue().then(deleteReview);
            });
        });
        cursor.delete();
        return cursor.continue().then(putReview);
      });
  });
  const favoriteButton = document.querySelector('.restaurant-favorite-button');
  favoriteButton.addEventListener('click', handlefavorite);
};
