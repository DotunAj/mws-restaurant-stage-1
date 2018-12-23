const altMessagesForImagesArray=["People gathered round a table at Mission Chinese food","A whole pizza","Tables at Kang ho dong baekjeong","Outside of kats dalicatessen","People inside of Robertas pizza","People sitting round tables in Hometown BBQ","Outside of Superiority burger","Outside of the Dutch","People inside of Mu Ramen","Inside of Casa Enrique"],dbPromise=idb.open("restaurant",1,e=>{e.createObjectStore("restaurant-data",{keyPath:"id"}),e.createObjectStore("review-data",{keyPath:"id"}),e.createObjectStore("offlineReview-data",{keyPath:"id"}),e.createObjectStore("favorite-data")});class DBHelper{static get DATABASE_URL(){return"http://localhost:1337/restaurants"}static fetchRestaurants(e){fetch(DBHelper.DATABASE_URL).then(e=>e.json()).then(t=>{const a=t;e(null,a),dbPromise.then(e=>{if(!e)return;const t=e.transaction("restaurant-data","readwrite").objectStore("restaurant-data");a.forEach(e=>{t.put(e)})})}).catch(t=>{dbPromise.then(a=>{if(!a)return;a.transaction("restaurant-data").objectStore("restaurant-data").getAll().then(a=>{0!==a.length?e(null,a):e(t,null)})})})}static fetchRestaurantById(e,t){DBHelper.fetchRestaurants((a,r)=>{if(a)t(a,null);else{const a=r.find(t=>t.id==e);a?t(null,a):t("Restaurant does not exist",null)}})}static fetchRestaurantByCuisine(e,t){DBHelper.fetchRestaurants((a,r)=>{if(a)t(a,null);else{const a=r.filter(t=>t.cuisine_type==e);t(null,a)}})}static fetchRestaurantByNeighborhood(e,t){DBHelper.fetchRestaurants((a,r)=>{if(a)t(a,null);else{const a=r.filter(t=>t.neighborhood==e);t(null,a)}})}static fetchRestaurantByCuisineAndNeighborhood(e,t,a){DBHelper.fetchRestaurants((r,n)=>{if(r)a(r,null);else{let r=n;"all"!=e&&(r=r.filter(t=>t.cuisine_type==e)),"all"!=t&&(r=r.filter(e=>e.neighborhood==t)),a(null,r)}})}static fetchNeighborhoods(e){DBHelper.fetchRestaurants((t,a)=>{if(t)e(t,null);else{const t=a.map((e,t)=>a[t].neighborhood),r=t.filter((e,a)=>t.indexOf(e)==a);e(null,r)}})}static fetchCuisines(e){DBHelper.fetchRestaurants((t,a)=>{if(t)e(t,null);else{const t=a.map((e,t)=>a[t].cuisine_type),r=t.filter((e,a)=>t.indexOf(e)==a);e(null,r)}})}static urlForRestaurant(e){return`./restaurant.html?id=${e.id}`}static imageUrlForRestaurant(e){return e.photograph?`/img/${e.photograph}.jpg`:`/img/${e.id}.jpg`}static altMessagesForImages(e){return altMessagesForImagesArray[e.id-1]}static mapMarkerForRestaurant(e,t){const a=new L.marker([e.latlng.lat,e.latlng.lng],{title:e.name,alt:e.name,url:DBHelper.urlForRestaurant(e)});return a.addTo(newMap),a}}var newMap,reviews_all,favoriteFlag=!1;const viewMap=document.querySelector(".viewmap-button"),mapContainer=document.querySelector("#map-container"),close=document.querySelector(".close"),getParameterByName=(e,t)=>{t||(t=window.location.href),e=e.replace(/[[\]]/g,"\\$&");const a=new RegExp(`[?&]${e}(=([^&#]*)|&|#|$)`).exec(t);return a?a[2]?decodeURIComponent(a[2].replace(/\+/g," ")):"":null},id=getParameterByName("id");fetch(`http://localhost:1337/reviews/?restaurant_id=${id}`).then(e=>e.json()).then(e=>{dbPromise.then(e=>{if(!e)return;const t=e.transaction("review-data","readwrite").objectStore("review-data");reviews_all.forEach(e=>{t.put(e)})}),reviews_all=e}).catch(e=>{dbPromise.then(t=>{if(!t)return;t.transaction("review-data").objectStore("review-data").getAll().then(t=>{if(0===t.length)return void console.log(e);const a=t.filter(e=>{if(e.restaurant_id==getParameterByName("id"))return!0});reviews_all=a})})}),document.addEventListener("DOMContentLoaded",()=>{initMap()});const initMap=()=>{fetchRestaurantFromURL((e,t)=>{e?console.error(e):(self.newMap=L.map("map",{center:[t.latlng.lat,t.latlng.lng],zoom:16,scrollWheelZoom:!1}),L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}",{mapboxToken:"pk.eyJ1IjoiZG90dW5haiIsImEiOiJjampwbmlkeGUwN3A3M3JwNDExOHRnbmZlIn0.JwTQ7Fjm5FV3J9N06r-GkQ",maxZoom:18,attribution:'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',id:"mapbox.streets"}).addTo(newMap),fillBreadcrumb(),DBHelper.mapMarkerForRestaurant(self.restaurant,self.newMap))})},fetchRestaurantFromURL=e=>{self.restaurant?e(null,self.restaurant):id?DBHelper.fetchRestaurantById(id,(t,a)=>{self.restaurant=a,a?(fillRestaurantHTML(),e(null,a)):console.error(t)}):(error="No restaurant id in URL",e(error,null))},fillRestaurantHTML=(e=self.restaurant)=>{document.getElementById("restaurant-name").innerHTML=e.name;const t=document.querySelector(".restaurant-favorite-button"),a=document.createElement("i");"true"===e.is_favorite?(favoriteFlag=!0,a.className="fas fa-heart restaurant-favorite-clicked"):(favoriteFlag=!1,a.className="fas fa-heart"),t.setAttribute("aria-label",`${e.name} is favorite restaurant`),t.append(a),document.getElementById("restaurant-address").innerHTML=e.address,document.getElementById("restaurant-picture").className="restaurant-img";const r=document.getElementById("small-screen");e.id>9?r.srcset=`${DBHelper.imageUrlForRestaurant(e).slice(0,7)}-500.jpg`:r.srcset=`${DBHelper.imageUrlForRestaurant(e).slice(0,6)}-500.jpg`,document.getElementById("large-screen").srcset=DBHelper.imageUrlForRestaurant(e);const n=document.getElementById("restaurant-img");n.className="restaurant-img",n.src=DBHelper.imageUrlForRestaurant(e),n.alt=DBHelper.altMessagesForImages(e),document.getElementById("restaurant-cuisine").innerHTML=e.cuisine_type,e.operating_hours&&fillRestaurantHoursHTML(),fillReviewsHTML(),document.querySelector("#restaurant_id").value=e.id},fillRestaurantHoursHTML=(e=self.restaurant.operating_hours)=>{const t=document.getElementById("restaurant-hours");for(let a in e){const r=document.createElement("tr"),n=document.createElement("td");n.innerHTML=a,r.appendChild(n);const o=document.createElement("td");o.innerHTML=e[a],r.appendChild(o),t.appendChild(r)}},fillReviewsHTML=(e=reviews_all)=>{const t=document.getElementById("reviews-container"),a=document.createElement("h3");if(a.innerHTML="Reviews",t.appendChild(a),!e){const e=document.createElement("p");return e.innerHTML="No reviews yet!",void t.appendChild(e)}const r=document.getElementById("reviews-list");e.reverse().forEach(e=>{r.appendChild(createReviewHTML(e))}),t.appendChild(r)},createReviewHTML=e=>{const t=document.createElement("li"),a=document.createElement("p");a.innerHTML=e.name,t.appendChild(a);const r=document.createElement("p");r.innerHTML=`Rating: ${e.rating}`,t.appendChild(r);const n=document.createElement("p");return n.innerHTML=e.comments,t.appendChild(n),t},fillBreadcrumb=(e=self.restaurant)=>{const t=document.getElementById("breadcrumb"),a=document.createElement("li");a.innerHTML=e.name,t.appendChild(a)};function openMap(){const e=document.activeElement;let t=mapContainer.querySelectorAll('a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]');const a=(t=Array.prototype.slice.call(t))[0],r=t[t.length-1];mapContainer.classList.add("open"),a.focus(),mapContainer.addEventListener("keydown",function(e){9===e.keyCode&&(e.shiftkey?document.activeElement===a&&(e.preventDefault(),r.focus()):document.activeElement===r&&(e.preventDefault(),a.focus()))}),close.addEventListener("click",()=>{mapContainer.classList.remove("open"),e.focus()})}function processForm(e){e.preventDefault&&e.preventDefault();const t=new URLSearchParams;for(const a of new FormData(e.target))t.append(a[0],a[1]);if(navigator.onLine)fetch("http://localhost:1337/reviews/",{method:"post",headers:{"Content-type":"application/x-www-form-urlencoded; charset=UTF-8"},body:t}).then(()=>(window.location.reload(),!1));else{const e={data:t,id:Math.random().toString(36).substr(2)};console.log(e),dbPromise.then(t=>{if(!t)return;return t.transaction("offlineReview-data","readwrite").objectStore("offlineReview-data").put(e),window.location.reload(),!1})}}function handlefavorite(){const e=getParameterByName("id");navigator.onLine?fetch(`http://localhost:1337/restaurants/${e}/?is_favorite=${!favoriteFlag}`,{method:"put",data:`is_favorite=${!favoriteFlag}`}).then(()=>{favoriteFlag=!favoriteFlag,document.querySelector(".fa-heart").classList.toggle("restaurant-favorite-clicked")}):dbPromise.then(t=>{if(!t)return;t.transaction("favorite-data","readwrite").objectStore("favorite-data").put(`${!favoriteFlag}`,`${e}`),favoriteFlag=!favoriteFlag,document.querySelector(".fa-heart").classList.toggle("restaurant-favorite-clicked")})}viewMap.addEventListener("click",openMap),window.onload=function(){const e=document.querySelector("#reviews-form");e.attachEvent?e.attachEvent("submit",processForm):e.addEventListener("submit",processForm),window.addEventListener("online",()=>{dbPromise.then(e=>{if(!e)return;return e.transaction("favorite-data","readwrite").objectStore("favorite-data").openCursor()}).then(function e(t){fetch(`http://localhost:1337/restaurants/${t.key}/?is_favorite=${t.value}`,{method:"put",data:`is_favorite=${t.value}`}),t.delete(),t.continue(e)}),dbPromise.then(e=>{if(!e)return;return e.transaction("offlineReview-data").objectStore("offlineReview-data").openCursor()}).then(function e(t){fetch("http://localhost:1337/reviews/",{method:"post",headers:{"Content-type":"application/x-www-form-urlencoded; charset=UTF-8"},body:t.data}),t.delete(),t.continue(e)})}),document.querySelector(".restaurant-favorite-button").addEventListener("click",handlefavorite)};