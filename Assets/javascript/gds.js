// Get steam store app list on page load to save time in getting app ids
window.onload = function() {
  getSteamApps();
  next = false; // Prevent quick reloads from setting value to true
};

// trigger the search function when 'Enter' is pressed
document.getElementById("searchTerm").addEventListener("keyup", function(event) {
  // 'key' property detects the name of the key pressed
  if (event.key === 'Enter') {
    // Cancel the default action, if needed
    event.preventDefault();
    // Trigger the button element with a click
    document.getElementById("submit").click();
  }
});

document.getElementById("submit").addEventListener("click", getGameData);
document.getElementById("filter").addEventListener("click", getGameData);
document.getElementById("reset").addEventListener("click", filterReset);
document.getElementById("platform").addEventListener("change", getPlatform);
document.getElementById("genre").addEventListener("change", getGenre);
document.getElementById("players").addEventListener("change", getPlayers);
document.getElementById("orderBy").addEventListener("change", getOrder);
document.getElementById("btn-x").addEventListener("click", clearContent);

// Clear modal content on close so it's ready for new content when shown again
$('#modal').on('hide.bs.modal', clearContent);

const herokuURL =  "https://young-journey-77972.herokuapp.com/" // "http://localhost:4000/"
const rawgGameSearch = herokuURL + "RAWG/gameQuery/"
const rawgDescrURL = herokuURL + "RAWG/gameDescr/";
const steamAppIdsURL = herokuURL + "steam/list/";
const steamInfoURL = herokuURL + "steam/info/";
const steamReviewsURL = herokuURL + "steam/reviews/";
var steamAppList;
var gameAppId;
var gameInfo;
var gameReviews;
var platform ="";
var genre = "";
var players = "";
var order = "";
var game ="";
var pageNum;
var request;
var next = false;
var appID;
var steamGame = false;

// Reset filters
function filterReset() {
  let element1 = document.getElementById("platform");
  let element2 = document.getElementById("genre");
  let element3 = document.getElementById("players");
  let element4 = document.getElementById("orderBy");
  element1.value = "default";
  element2.value = "default";
  element3.value = "default";
  element4.value = "default";
  platform = genre = players = order = ""; // set multiple variables to an empty value to clear search
}

// Check filter values for defult
function defaultFilter() {
  let platformValue = document.getElementById("platform").value;
  if (platformValue === "default") {
    platform = "";
  }
  let genreValue = document.getElementById("genre").value;
  if (genreValue === "default") {
    genre = "";
  }
  let playersValue = document.getElementById("players").value
  if (playersValue === "default") {
    players = "";
  }
  let orderValue = document.getElementById("orderBy").value
  if (orderValue === "default") {
    order = "";
  }
}

// Perform initial fetch and return results as JSON
async function getGameData(event) {
  /*if (event.target.id === "submit") { // how to get id of clicked element to set correct page number for fetch request
  }*/
  defaultFilter();
  getGame();
  pageNum = 1;
  let html = "<div class='d-flex content my-4'>"
  html += "<div class='d-flex flex-wrap justify-content-center my-2' id='cards'></div>"
  html += "</div>"
  document.getElementById("content").innerHTML = html;
  placeholderCards();
  next = true;
  console.log(platform + genre + players + order + game)
  request = rawgGameSearch + pageNum + platform + genre + players + order + game;
  console.log(request);
    await fetch(request).then(
    response => response.json()).then((results) => {
      cardData(results);
      console.log(results)
    })
  .catch(err => {
    console.error(err);
    cardData(err);
  });
}

// Perform next page of search results fetch
async function getNextResults() {
  defaultFilter();
  placeholderCards();
  pageNum++;
  request = rawgGameSearch + pageNum + platform + genre + players + order + game;
    await fetch(request).then(
    response => response.json()).then((results) => {
      cardData(results);
    })
  .catch(err => {
    console.error(err);
  });
}

// Create containing cards from fetched data and assign values for structureCard function
function cardData(data) {
  if (!data.next) {
    next = false;
  }
  if (!data) {
    console.log(data)
    document.getElementById("cards").innerHTML = "<p class='sorryMsg'>Oops! It looks like the RAWG api is down. Please try again later.</p>"
    return;
  }
  if (data.count === 0) {
    document.getElementById("cards").innerHTML = "<p class='sorryMsg'>Sorry, nothing matches that criteria.</p>"
    return;
  }

  for (let i in data.results) {
    let addr = data.results[i];
    let img;
    let title = addr.name;
    let id = addr.id;
    let rel;
    let metac;
    let esrb;
    let platforms = [];
    let genres = [];
    let stores = [];
    (!addr.background_image ? img = "Assets/images/no_image.jpg" : img = addr.background_image); // Handle games missing certain data values
    (!addr.released ?  rel = "N/A" : rel = addr.released); // by assigning 'missing' notifications to variables
    (!addr.esrb_rating ?  esrb = "N/A" : esrb = addr.esrb_rating.name);
    (!addr.metacritic ?  metac = "N/A" : metac = addr.metacritic);

    for(let j in addr.platforms) {
      platforms.push(addr.platforms[j].platform.name)
    }

    for(let j in addr.genres) {
      genres.push(addr.genres[j].name)
    }

    for(let j in addr.stores) {
      stores.push(addr.stores[j].store.name)
    }

    let htmlContent = structureCard(id, img, title, rel, esrb, metac, 
      genres.join(', '), platforms.join(', '), stores.join(', ')); // .join adds a delimiter parameter to string array to separate elements
    document.getElementById("cards").innerHTML += htmlContent;
  }
}

// create html card content from fetched data
function structureCard(id, img, title, release, esrb, metac, genr, plfm, store) {
  removeElementsByClass("placeholder-card");
  html = "<div class='card m-2'>"
  html += "<a href='javascript:void(0);' onclick='showDscr(this.id)' data-bs-toggle='modal' data-bs-target='#modal' class='bttnCrd' id=" + id + ">"
  html += "<div class='card-img-top' style='background-image: url(" + img + "); background-size: cover; background-position: center;' alt='Game Image'></div>"
  html += "<div class='card-body'>"
  html += "<h5 class='card-title'>" + title + "</h5></a>"
  html += "<p class='card-text'><span class='text-muted'>Released: </span>" + release + "<br>"
  html += "<span class='text-muted'>ESRB: </span>" + esrb + "<br>"
  html += "<span class='text-white bg-cst'>Metacritic: " + metac + "</span><br>"
  html += "<span class='text-muted'>Genres: </span>" + genr + "<br>"
  html += "<span class='text-muted'>Platforms: </span>" + plfm + "<br><br>"
  html += "<span class='text-muted'>Stores: </span>" + store + "</p>"
  html += "</div></div>"

  return html;
}

// Create placeholder cards while data loads
function placeholderCards() {
  let placeholder_html = ""; 
  for (let i = 0; i < 40; i ++) {
    placeholder_html += "<div class='card placeholder-card m-2'><div class='loading'>Loading</div></div>";
  }
  document.getElementById("cards").innerHTML += placeholder_html;
}

// Remove elements by class name
function removeElementsByClass(className){
  var elements = document.getElementsByClassName(className);
  while(elements.length > 0){
      elements[0].parentNode.removeChild(elements[0]);
  }
}

// get search keyword to add to fetch request
function getGame() {
  let searchTerm = document.getElementById("searchTerm").value;
  return (searchTerm ? game = "&search_exact=true&search=" + searchTerm.split(' ').join('-').toLowerCase() : game = "");
}

// get platform selection to add to api request
function getPlatform() {
  let selection = document.getElementById("platform").value
  return (selection !== "Platforms" ? platform = "&platforms=" + selection : platform = "");
}

// get genre selection to add to api request
function getGenre() {
  let selection = document.getElementById("genre").value
  return (selection !== "Genres" ? genre = "&genres=" + selection : genre = "");
}

// get tag player selection to add to api request
function getPlayers() {
  let selection = document.getElementById("players").value
  return (selection !== "Players" ? players = "&tags=" + selection : players = "");
}

// get order of results to add to api request
function getOrder() {
  let selection = document.getElementById("orderBy").value
  return (selection !== "Order By" ? order = "&ordering=" + selection : order = "");
}

// Fetches specific game's data and populates modal
async function showDscr(ele) {
  let gameReq = rawgDescrURL + ele; 
  await fetch(gameReq).then(
    response => response.json()).then((results) => {
      console.log(results);
      let descr = results.description;
      let rel;
      (results.released ?  rel = results.released : rel = "N/A");
      let esrb;
      (results.esrb_rating ? esrb = results.esrb_rating.name : esrb = "N/A");
      let meta;
      (results.metacritic ?  meta = results.metacritic : meta = "N/A");
      let devs = [];
      let pubs = [];
      let genre = [];
      let plfrm = [];
      let stores = [];
      let name = results.name;
      let bgImg = results.background_image;
      let tags = [];
      createModalHeader(name, bgImg);
      textSplit(descr);

      for (let i in results.developers) {
        devs.push(results.developers[i].name);
      }
      for (let i in results.publishers) {
        pubs.push(results.publishers[i].name);
      }
      for (let i in results.genres) {
        genre.push(results.genres[i].name);
      }
      for (let i in results.platforms) {
        plfrm.push(results.platforms[i].platform.name);
      }
      for (let i in results.stores) {
        stores.push(results.stores[i].store.name);
      }
      for (let i in results.tags) {
        tags.push(results.tags[i].name);
      }

      if (stores.includes("Steam")) {
        steamGame = true;
      }

      let html = setGameDetails(rel, esrb, meta, devs.join(', '), pubs.join(', '), genre.join(', '), 
        plfrm.join(', '), stores.join(', '), tags.join(', '));
      document.getElementById("gameDetail").innerHTML = html;
      getSteamAppId(results.name.replace(/ *\([^)]*\) */g, "").toLowerCase()); // get game name and remove anything between parentheses to match steam name
    })
  .catch(err => {
    console.error(err);
  })
}

// Creates modal game title header for description
function createModalHeader(title, img) {
  let mHeader = document.getElementById("m-header");
  document.getElementById("mTitle").innerHTML = `<h5 class="modal-title" id="gameTitle">${title}</h5>`;
  mHeader.style.backgroundImage=`url(${img})`; // sets properties for background image on modal
  mHeader.style.backgroundSize="cover";
  mHeader.style.backgroundRepeat="no-repeat";
  mHeader.style.backgroundPosition="center top";
}

// Get Steam Store app id from API by matching RAWG title to Steam's
function getSteamAppId(name) {
  console.log(name);
  gameAppId = "";
  let app = steamAppList.applist.apps.find(element => element.name.toLowerCase() === name); 
  console.log(app);
  if (app) { 
    gameAppId = app.appid;
  }
  else try { // Try a more refined search removing special characters and spaces for better matching
    let appList = [];
    for (let i in steamAppList.applist.apps) {
      if (stringReducer(steamAppList.applist.apps[i].name) === stringReducer(name)) {
        appList.push(steamAppList.applist.apps[i]);
      }
    }
    console.log(appList.length)
    if (appList.length !== 0) {
      console.log("first");
      gameAppId = appList[0].appid; // Return the first match in the results array
    }
    else if (gameAppId === "") {
      if (name.toLowerCase().includes("ii")){
        app = steamAppList.applist.apps.find(element => element.name.toLowerCase() === name.replace("ii", "2"));
        console.log(name.replace("ii ", "2")); 
      }
      if (name.toLowerCase().includes("iii")){
        console.log(name.replace("iii", "3"));
        app = steamAppList.applist.apps.find(element => element.name.toLowerCase() === name.replace("iii", "3")); 
      }
      gameAppId = app.appid;
    }
  }
  catch { err => {
    console.error(err);
    }
  }
  if (gameAppId && steamGame) {
    let html = "<div id='steamInfo'><a href='javascript:void(0);' onClick=getSteamInfo()>" + 
      "See Steam Store details <span class='fa fa-angle-down'></span></a></div>";
    document.getElementById("gameDetail").innerHTML += html;
  }
  console.log(gameAppId);
} 

// Reduce game titles to letters and numbers only for better matching results (removes special
//    characters and white spaces)
function stringReducer(string) {
  var newString = string.toLowerCase().replace(/[^A-Z0-9]/ig, "");
  return newString;
}

// Get Steam Store app list for later use or use previouisly stored copy for up to 7 days
function getSteamApps() {
  console.log("Getting Steam Store list...");
  let exists = false;
  let today = new Date();
  let listDate;
  try {
    listDate = parseDate((localStorage.getItem("listDate")));
  }
  catch {
    listDate = undefined;
  }
  if (typeof listDate !== 'undefined') {
    console.log("Stored listDate has value.");
    let diff = compareDate(listDate);
    if (diff <= 7) {
      exists = true;
      performIndexedDB(exists);
    }
    else {
      fetchSteamStore(today);
    }
  }
  else {
    fetchSteamStore(today);
  }
  
};

// Handles Steam Store App list fetch from API
async function fetchSteamStore(today) {
  await fetch(steamAppIdsURL).then(
    response => response.json()).then((results) => {
      steamAppList = results;
      console.log("Steam Store list API was fetched.")
      exists = false;
      performIndexedDB(exists);
      localStorage.setItem("listDate",JSON.stringify(today));
      console.log("Steam Store list acquired.");
      })
  .catch(err => {
    console.error(err);
  });
}

// Handle indexedDB/store operations
function performIndexedDB(exists) {
  let openRequest = window.indexedDB.open('steamStoreAppList', 1); // DB name and version
  openRequest.onupgradeneeded = function() {
    // triggers if the client had no database
    let db = openRequest.result;
    // ...perform initialization...
    if (!db.objectStoreNames.contains('steamStoreAppList')) { // if there's no "list" in store
      db.createObjectStore('steamStoreAppList', {keyPath: 'id'}); // create it
    }
  };
  
  openRequest.onerror = function() {
    console.error("Error", openRequest.error);
  };
  
  openRequest.onsuccess = function() {
    let db = openRequest.result;
    // continue working with database using db object
    let transaction = db.transaction('steamStoreAppList', 'readwrite');
    // get an object store to operate on it
    let list = transaction.objectStore('steamStoreAppList');

    if (!exists) {
      // PUT steam store list in DB
      let request = list.put({id: 1, value: steamAppList});

      request.onsuccess = function() { 
        console.log("App list added to the indexedDB", request.result);
      };

      request.onerror = function() {
        console.log("Error", request.error);
      };
    }
    else if (exists) {
      let applist = list.getAll();
      applist.onsuccess = () => {
        steamAppList = applist.result[0].value;
        console.log("Steam Store list acquired.");
      }
    };

    transaction.oncomplete = function() {
      console.log("IndexedDB transactions complete.");
    };
  };
};

// Parse a date in yyyy-mm-dd format
function parseDate(input) {
  var parts = input.match(/(\d+)/g);
  // new Date(year, month [, date [, hours[, minutes[, seconds[, ms]]]]])
  return new Date(parts[0], parts[1]-1, parts[2]); // months are 0-based
}

// Compare dates and return difference
function compareDate(listDate) {
  var date = new Date();
  console.log()
  var diffTime = date.getTime() - listDate.getTime();  // To calculate the time difference of two dates
  var numDays = diffTime / (1000 * 3600 * 24);  // To calculate the no. of days between two dates
  console.log(`${Math.round((numDays + Number.EPSILON) * 100)/100} days since Steam Store app list fetch.`);
  return numDays;
};

// Get selected game Steam Store info
function getSteamInfo() {
  if (gameAppId) {
    getSteamMedia();
  }
};

// Get Steam Store media and details
async function getSteamMedia() {
  await fetch(steamInfoURL + gameAppId).then(
    response => response.json()).then((results) => {
      console.log(results[gameAppId].success)
        if (results[gameAppId].success === false) {
          document.getElementById("steamInfo").innerHTML = "Steam Store details are unavailable for this game." + 
            " Please try searching for a different/newer version."
        }
        else {
          getSteamReview();
          gameInfo = results;
          console.log(gameInfo);
        }
      })
  .catch(err => {
    console.error(err);
  });
};

// Get Steam Store reviews
async function getSteamReview() {
  await fetch(steamReviewsURL + gameAppId).then(
    response => response.json()).then((reviews) => {
      gameReviews = reviews;
      console.log(gameReviews);
      })
  .catch(err => {
    console.error(err);
  });
  constructSteamInfo();
};

// Configure steam app fetch results into html and replace 'steamInfo' div content
function constructSteamInfo() {
  let steamId = gameAppId;
  let steamUrl = "https://store.steampowered.com/app/" + steamId;
  let scrnshtsURL = gameInfo[steamId].data.screenshots;
  let html = `<div class='steamInfoSection' style='background-image: url("${gameInfo[steamId].data.background}");` + 
   "background-size: cover; background-position: center;' alt='Game Image'>"
  html += `<h2 class='steam-header'>Steam Store Info <a href='${steamUrl}' target='_blank'>` +
    "<span><i class='fa fa-external-link'></i></span></a></h2>"
  html += "<div class='slideshow-container'>"
  html += "<div class='img-container'>"
  for (let i in gameInfo[steamId].data.screenshots) {
    html += "<div class='mySlides fadeSlide'>"
    html += "<a href='"+ scrnshtsURL[i].path_full +"' target='_blank'><img id='lImg' src="+ 
      gameInfo[steamId].data.screenshots[i].path_full +" style='width: 100%'></div></a>"
  }
  html += "<a class='prev' onclick='plusSlides(-1)'>&#10094;</a>"
  html += "<a class='next' onclick='plusSlides(1)'>&#10095;</a>"
  html += "</div>"
  html += "<div class='slideRow'>"
  for (let i in gameInfo[steamId].data.screenshots) {
    html += "<div class='thumbn'>"
    html += `<img class="demo cursor" id="sImg" src="${gameInfo[steamId].data.screenshots[i].path_thumbnail}"` + 
      `style="width:100%" onclick="currentSlide(${i}+1)" alt="Thumbnail"></div>`
  }
  html += "</div></div><br><div class='steam-details'><div class='row'><div class='col-sm'>"
  let finalPrice;
  let discount;
  if (gameInfo[steamId].data.price_overview) {
    finalPrice = gameInfo[steamId].data.price_overview.final_formatted;
    discount = gameInfo[steamId].data.price_overview.discount_percent;
  }
  else {
    finalPrice = "Not available for base game"
    discount = "0"
  }
  html += `<span class='steam-subheader'>CURRENT PRICE: </span>${finalPrice}<br>`;
  html += `<span class='steam-subheader'>CURRENT DISCOUNT: </span>${discount}%<br>`;
  html += `<span class='steam-subheader'>STEAM RELEASE DATE: </span>${gameInfo[steamId].data.release_date.date}</div>`;
  html += `<div class='col-sm'><span class='steam-subheader'>REVIEW RATING: </span> 
    ${gameReviews.query_summary.review_score_desc}<br>`
  let total_reviews = gameReviews.query_summary.total_reviews;
  let positive_reviews = gameReviews.query_summary.total_positive
  let positive_percent = Math.round(((positive_reviews / total_reviews) + Number.EPSILON) * 100);
  console.log(positive_percent)
  if (!positive_percent) {
    positive_percent = 0;
  }
  html += `${positive_percent}<span class='steam-subheader'>% positive out of </span> ${numberWithCommas(gameReviews.query_summary.total_reviews)}`
  html += "<span class='steam-subheader'> reviews</span><p></p><br>";
  html += `</div><div><span class='steam-subheader'>SHORT DESCRIPTION: </span>${gameInfo[steamId].data.short_description}</div></div><p></p><br>`
  html += "<span class='steam-subheader'>MOST HELPFUL PLAYER REVIEWS: </span>";
  html += formatReviews();
  html += formatSpecs();

  document.getElementById("steamInfo").innerHTML = html;
  initializeSlideShow();
}

// Format steam reviews for HTML
function formatReviews() {
  let review_html = "";
  if (gameReviews.reviews.length !== 0) {
    let length;
    if (gameReviews.reviews.length >= 5) {
      length = 5
    }
    else {length = gameReviews.reviews.length};
    for (let i=0; i < length; i++) {  
      let time = gameReviews.reviews[i].author.playtime_forever/60;
      let review_time = numberWithCommas(Math.round(time * 10)/10)
      review_html += `<div class="steam-review"><span class='steam-time'>Total Playtime: </span><span class='hours'>${review_time} hrs</span>`
      if (gameReviews.reviews[i].voted_up === true) {
        review_html += "<div class='recommend'>RECOMMENDED</div><br>";
      }
      else {
        review_html += "<div class='not-recommend right'>NOT RECOMMENDED</div><br>";
      }
      review_html += `${gameReviews.reviews[i].review.replace(/ *\[[^\]]*]/g, "")}</div><p></p>`; // remove everything between "[]"
    }
    
  }
  else {review_html = "Reviews not available for this game."}
  return review_html;
}

// Format PC spec
function formatSpecs() {
  let min = gameInfo[gameAppId].data.pc_requirements.minimum;
  let rec = gameInfo[gameAppId].data.pc_requirements.recommended;
  let specs_html = "<div class='specs-title steam-subheader'>SYSTEM REQUIREMENTS</div><div class='row specs'>";
  if (min) {
    specs_html += `<div class='spec-container'>${min}</div>`;
  };
  if (rec) {
    specs_html += `<div class='spec-container right'>${rec}</div>`;
  }
  specs_html += "</div>";
  return specs_html;
}

// Format numbers to show comma separators
function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// Split into two functions so 'Read more' function can be reused. Use objects to wrap the arrays in return.
// Limit description to maximum number of words and assign the rest to hidden div for expansion
function textSplit(descr) {
  if (descr) {
    let newDescr = descr.split(" ");
    let first = [];
    let second = [];

    for(let i = 0; i < 50; i++) {
      first.push(newDescr[i]); 
    };

    let mBody = document.getElementById("modalBody");
    mBody.innerHTML = first.join(" ") + "<span id='dots'>...</span><a class='more' id='more'></a>"

    for(let i = 50; i < newDescr.length; i++) {
      second.push(newDescr[i]);
    }
    document.getElementById("more").innerHTML = " " + second.join(" "); // add the second string array to the hidden 'more' section
    mBody.innerHTML += "<button onclick='readMore(`dots`, `more`, `readMore`)'; id='readMore'>Read more ↓</button>"
  } 
  else {
    mBody.innerHTML = "No description available"
  }
};

// Assigns data to remainding divs in modal footer for selected game
function setGameDetails(rel, esrb, meta, devs, pubs, genre, plfrm, stores, tags) {
  let html = "<div class='row'><div class='col-sm'><span class='text-hl'>Genres: </span>" + genre + "<br>"
  html += "<span class='text-hl'>Metacritic: </span><span class='rounded border border-1 metc'>" + meta + "</span><br>"
  html += "<span class='text-hl'>ESRB: </span>" + esrb + "</div>"
  html += "<div class='col-sm'><span class='text-hl'>Released: </span>" + rel + "<br>"
  html += "<span class='text-hl'>Developer(s): </span>" + devs + "<br>"
  html += "<span class='text-hl'>Publisher(s): </span>" + pubs + "<br><br>"
  html += "</div></div>"
  html += "<span class='text-hl'>Platforms: </span>" + plfrm + "<br>"
  html += "<span class='text-hl'>Stores: </span>" + stores + "<p></p>"
  html += "<span class='text-hl'>Tags: </span>" + tags + "<p></p>"
  
  return html;
};

// Clears modal content after it is closed
function clearContent() {
  steamGame = false;
  let mHeader = document.getElementById("m-header");
  mHeader.innerHtml = "";
  mHeader.style.backgroundImage= "none";
  document.getElementById("mTitle").innerHTML = "";
  document.getElementById("modalBody").innerHTML = "";
  document.getElementById("gameDetail").innerHTML = "";
  if (document.getElementById("steamInfo")) {
    document.getElementById("steamInfo").innerHTML = "";
  }
};

// Back-to-top button section ///////////////////////////////////////////////////////////////
let upButton = document.getElementById("btn-back-to-top");

// When user scrolls down 20px from the top of the document, show the button
window.onscroll = function () {
  scrollFunction();
};

function scrollFunction() {
  if (
    document.body.scrollTop > 20 ||
    document.documentElement.scrollTop > 20
  ) {
    upButton.style.display = "block";
  } else {
    upButton.style.display = "none";
  }
}
// When user clicks on the button, scroll to the top of the document
upButton.addEventListener("click", backToTop);

function backToTop() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}
///////////////////////////////////////////////////////////////////////////////////////////

// Read more section
function readMore(dotsId, textClass, btnId) {
  var dots = document.getElementById(dotsId);
  var moreText = document.getElementsByClassName(textClass);
  var btnText = document.getElementById(btnId);

  if (dots.style.display === "none") {
    dots.style.display = "inline";
    btnText.innerHTML = "Read more ↓";
    try {
      for (let i in moreText) {
        moreText[i].style.display = "none";
        }
    }
    catch {
      return;
    }
  } else {
    dots.style.display = "none";
    btnText.innerHTML = "Read less ↑";
    try {
      for (let i in moreText) {
        moreText[i].style.display = "inline";
      }
    }
    catch {
      return;
    }
  }
}

// Load more cards when page end reached
$(window).scroll(function() {
  if($(window).scrollTop() == $(document).height() - $(window).height()) {
    if (next) {
      console.log("Loading next results...");
      getNextResults();
    }
  }
});

/////////////////////////// Handle slideshow ///////////////////////////////
var slideIndex = 1;
var pause = true;

// Initialize slideShow and delay autoSlide
function initializeSlideShow() {
  showSlides(slideIndex);
  pause = false;
  setTimeout(autoSlides, 8000); // Delay auto scrolling for 5 seconds
}

// Next/previous controls
function plusSlides(n) {
  showSlides(slideIndex += n);
  pausePlay();
}

// Thumbnail image controls
function currentSlide(n) {
  showSlides(slideIndex = n);
  pausePlay();
}

// Pause autoSlide when user interacts with slide controls
function pausePlay() {
  pause = true;
  console.log(pause);
  setTimeout(() => {
    pause = false;
    }, 20000);
}

function showSlides(n) {
  var slides = document.getElementsByClassName("mySlides");
  var dots = document.getElementsByClassName("demo");
  var i;
  if (n > slides.length) {slideIndex = 1}
  if (n < 1) {slideIndex = slides.length}
  for (i = 0; i < slides.length; i++) {
      slides[i].style.display = "none";
  }
  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" active", "");
  }
  slides[slideIndex-1].style.display = "inline-block";
  dots[slideIndex-1].className += " active";
  scrollTo();
}

function autoSlides() {
  var slides = document.getElementsByClassName("mySlides");
  var dots = document.getElementsByClassName("demo");
  try {
    if (pause === false) {
      var i;
      for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
      }
      for (i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "");
      }
      slideIndex++;
      if (slideIndex > slides.length) {slideIndex = 1}
      slides[slideIndex-1].style.display = "inline-block";
      dots[slideIndex-1].className += " active";
      scrollTo();
    }
  }
  catch {
    return;
  }
  setTimeout(autoSlides, 6000); // Change image every 5 seconds
}

// Scroll thumbnail into view
function scrollTo() {
  let navPos = $(".slideRow").scrollLeft();
  let position = $(".active").offset().left;
  let windowW = $( window ).width();
  let docW = $('#gameDetail').width();
  let diff = windowW - docW;
  $(".slideRow").animate({scrollLeft: navPos + position - diff/2 - 20}, 800);
}
///////////////////////// End of SlideShow code //////////////////////////
