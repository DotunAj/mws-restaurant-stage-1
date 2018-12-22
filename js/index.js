const altMessagesForImagesArray=["People gathered round a table at Mission Chinese food","A whole pizza","Tables at Kang ho dong baekjeong","Outside of kats dalicatessen","People inside of Robertas pizza","People sitting round tables in Hometown BBQ","Outside of Superiority burger","Outside of the Dutch","People inside of Mu Ramen","Inside of Casa Enrique"],dbPromise=idb.open("restaurant",1,e=>{e.createObjectStore("restaurant-data",{keyPath:"id"}),e.createObjectStore("review-data",{keyPath:"id"}),e.createObjectStore("favorite-data")});class DBHelper{static get DATABASE_URL(){return"http://localhost:1337/restaurants"}static fetchRestaurants(e){fetch(DBHelper.DATABASE_URL).then(e=>e.json()).then(t=>{const a=t;e(null,a),dbPromise.then(e=>{if(!e)return;const t=e.transaction("restaurant-data","readwrite").objectStore("restaurant-data");a.forEach(e=>{t.put(e)})})}).catch(t=>{dbPromise.then(a=>{if(!a)return;a.transaction("restaurant-data").objectStore("restaurant-data").getAll().then(a=>{0!==a.length?e(null,a):e(t,null)})})})}static fetchRestaurantById(e,t){DBHelper.fetchRestaurants((a,n)=>{if(a)t(a,null);else{const a=n.find(t=>t.id==e);a?t(null,a):t("Restaurant does not exist",null)}})}static fetchRestaurantByCuisine(e,t){DBHelper.fetchRestaurants((a,n)=>{if(a)t(a,null);else{const a=n.filter(t=>t.cuisine_type==e);t(null,a)}})}static fetchRestaurantByNeighborhood(e,t){DBHelper.fetchRestaurants((a,n)=>{if(a)t(a,null);else{const a=n.filter(t=>t.neighborhood==e);t(null,a)}})}static fetchRestaurantByCuisineAndNeighborhood(e,t,a){DBHelper.fetchRestaurants((n,r)=>{if(n)a(n,null);else{let n=r;"all"!=e&&(n=n.filter(t=>t.cuisine_type==e)),"all"!=t&&(n=n.filter(e=>e.neighborhood==t)),a(null,n)}})}static fetchNeighborhoods(e){DBHelper.fetchRestaurants((t,a)=>{if(t)e(t,null);else{const t=a.map((e,t)=>a[t].neighborhood),n=t.filter((e,a)=>t.indexOf(e)==a);e(null,n)}})}static fetchCuisines(e){DBHelper.fetchRestaurants((t,a)=>{if(t)e(t,null);else{const t=a.map((e,t)=>a[t].cuisine_type),n=t.filter((e,a)=>t.indexOf(e)==a);e(null,n)}})}static urlForRestaurant(e){return`./restaurant.html?id=${e.id}`}static imageUrlForRestaurant(e){return e.photograph?`/img/${e.photograph}.jpg`:`/img/${e.id}.jpg`}static altMessagesForImages(e){return altMessagesForImagesArray[e.id-1]}static mapMarkerForRestaurant(e,t){const a=new L.marker([e.latlng.lat,e.latlng.lng],{title:e.name,alt:e.name,url:DBHelper.urlForRestaurant(e)});return a.addTo(newMap),a}}var newMap;const map=document.querySelector("#map");let allFavoriteButtons;navigator.serviceWorker&&window.addEventListener("load",()=>{navigator.serviceWorker.register("./sw.js").then(e=>{navigator.serviceWorker.controller&&(e.waiting?updateSw(e.waiting):e.installing?trackSwInstalling(e.installing):e.addEventListener("updatefound",()=>{trackSwInstalling(e.installing)}))}).catch(e=>{console.log(e)})});let refreshing=!1;function trackSwInstalling(e){e.addEventListener("statechange",()=>{"installed"===e.state&&updateSw(e)})}function updateSw(e){e.postMessage({action:"skipWaiting"})}navigator.serviceWorker.addEventListener("controllerchange",()=>{refreshing||(window.location.reload(),refreshing=!0)}),document.addEventListener("DOMContentLoaded",()=>{initMap(),fetchNeighborhoods(),fetchCuisines()});const fetchNeighborhoods=()=>{DBHelper.fetchNeighborhoods((e,t)=>{e?console.error(e):(self.neighborhoods=t,fillNeighborhoodsHTML())})},fillNeighborhoodsHTML=(e=self.neighborhoods)=>{const t=document.getElementById("neighborhoods-select");e.forEach(e=>{const a=document.createElement("option");a.innerHTML=e,a.value=e,t.append(a)})},fetchCuisines=()=>{DBHelper.fetchCuisines((e,t)=>{e?console.error(e):(self.cuisines=t,fillCuisinesHTML())})},fillCuisinesHTML=(e=self.cuisines)=>{const t=document.getElementById("cuisines-select");e.forEach(e=>{const a=document.createElement("option");a.innerHTML=e,a.value=e,t.append(a)})},initMap=()=>{self.newMap=L.map("map",{center:[40.722216,-73.987501],zoom:12,scrollWheelZoom:!1}),L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}",{mapboxToken:"pk.eyJ1IjoiZG90dW5haiIsImEiOiJjampwbmlkeGUwN3A3M3JwNDExOHRnbmZlIn0.JwTQ7Fjm5FV3J9N06r-GkQ",maxZoom:18,attribution:'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',id:"mapbox.streets"}).addTo(newMap),updateRestaurants()},updateRestaurants=()=>{const e=document.getElementById("cuisines-select"),t=document.getElementById("neighborhoods-select"),a=e.selectedIndex,n=t.selectedIndex,r=e[a].value,s=t[n].value;DBHelper.fetchRestaurantByCuisineAndNeighborhood(r,s,(e,t)=>{e?console.error(e):(resetRestaurants(t),fillRestaurantsHTML())})},resetRestaurants=e=>{self.restaurants=[],document.getElementById("restaurants-list").innerHTML="",self.markers&&self.markers.forEach(e=>e.remove()),self.markers=[],self.restaurants=e},fillRestaurantsHTML=(e=self.restaurants)=>{const t=document.getElementById("restaurants-list");e.forEach(e=>{t.append(createRestaurantHTML(e))}),allFavoriteButtons=document.querySelectorAll(".restaurant-favorite-button"),addMarkersToMap()},createRestaurantHTML=e=>{const t=document.createElement("li"),a=document.createElement("img");a.className="restaurant-img",e.id>9?a.src=`${DBHelper.imageUrlForRestaurant(e).slice(0,7)}-500.jpg`:a.src=`${DBHelper.imageUrlForRestaurant(e).slice(0,6)}-500.jpg`,a.alt=DBHelper.altMessagesForImages(e),t.append(a);const n=document.createElement("div");n.className="restaurant-details",t.append(n);const r=document.createElement("div");r.className="restaurant-name-favorite",n.append(r);const s=document.createElement("h2");s.innerHTML=e.name,r.append(s);const o=document.createElement("i");o.className="fas fa-heart","true"===e.is_favorite?o.classList.add("restaurant-favorite-clicked"):o.classList.remove("restaurant-favorite-clicked"),r.setAttribute("aria-label",`${e.name} is favorite restaurant`),r.append(o);const i=document.createElement("p");i.innerHTML=e.neighborhood,n.append(i);const l=document.createElement("p");l.innerHTML=e.address,n.append(l);const c=document.createElement("a");return c.innerHTML="View Details",c.href=DBHelper.urlForRestaurant(e),c.setAttribute("aria-label",`View Details for ${e.name}`),n.append(c),t},addMarkersToMap=(e=self.restaurants)=>{e.forEach(e=>{const t=DBHelper.mapMarkerForRestaurant(e,self.newMap);t.on("click",function(){window.location.href=t.options.url}),self.markers.push(t)})};window.addEventListener("load",()=>{const e=document.querySelectorAll(".leaflet-marker-icon, .leaflet-control a");map.tabIndex=-1,e.forEach(e=>{e.tabIndex=-1})});