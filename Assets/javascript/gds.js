

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
document.getElementById("platform").addEventListener("change", getPlatform);
document.getElementById("genre").addEventListener("change", getGenre);
document.getElementById("players").addEventListener("change", getPlayers);
document.getElementById("orderBy").addEventListener("change", getOrder);
document.getElementById("btn-x").addEventListener("click", clearContent);

const key = '8881e08db1df45ea9a122d358156e2e1'
const steamKey = 'secret'
const steamAppIdsURL = "https://api.steampowered.com/ISteamApps/GetAppList/v2/";
const fetchParams = {
  method: "GET",
  headers: {
    "X-Auth-Token": steamKey
  }
};
var platform ="";
var genre = "";
var players = "";
var order = "";
var game ="";
var pageNum;
var request;
var next = false;
var appID;

// Perform initial fetch and return results as JSON
async function getGameData(event) {
  if (event.target.id === "submit") { //get id of clicked element to set correct page number for fetch request
    getGame();
  }
  pageNum = 1;
  let html = "<div class='d-flex content my-4'>"
  html += "<div class='d-flex flex-wrap justify-content-center my-2' id='cards'></div>"
  html += "</div>"
  document.getElementById("content").innerHTML = html;
  next = true;
  request = `https://rawg.io/api/games?key=${key}${platform}${genre}${players}` +
    `${order}${game}&page=${pageNum}&page_size=40`;
    await fetch(request).then(
    response => response.json()).then((results) => {
      console.log(request);
      cardData(results);
    })
  .catch(err => {
    console.error(err);
    cardData(err);
  });
}

// Perform next page of search results fetch
async function getNextResults() {
  pageNum++;
  request = `https://rawg.io/api/games?key=${key}${platform}${genre}${players}` +
    `${order}${game}&page=${pageNum}&page_size=40`;
    await fetch(request).then(
    response => response.json()).then((results) => {
      console.log(request);
      console.log(results);
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
  html = "<div class='card m-2' style='width: 255px;'>"
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
  console.log(ele);
  let gameReq = 'https://rawg.io/api/games/' + ele + '?key=' + key + '&description'; 
  await fetch(gameReq).then(
    response => response.json()).then((results) => {
      let mHeader = document.getElementById("m-header");
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
      document.getElementById("mTitle").innerHTML = `<h5 class="modal-title" id="gameTitle">${results.name}</h5>;`
      mHeader.style.backgroundImage=`url(${results.background_image})`; // sets properties for background image on modal
      mHeader.style.backgroundSize="cover";
      mHeader.style.backgroundRepeat="no-repeat";
      mHeader.style.backgroundPosition="center top";
      
      textSplit(descr);

      for(let i in results.developers) {
        devs.push(results.developers[i].name)
      }
      for(let i in results.publishers) {
        pubs.push(results.publishers[i].name)
      }
      for(let i in results.genres) {
        genre.push(results.genres[i].name)
      }
      for(let i in results.platforms) {
        plfrm.push(results.platforms[i].platform.name)
      }
      for(let i in results.stores) {
        stores.push(results.stores[i].store.name)
      }

      let html = setGameDetails(rel, esrb, meta, devs.join(', '), pubs.join(', '), genre.join(', '), 
        plfrm.join(', '), stores.join(', '))
      document.getElementById("gameDetail").innerHTML = html;
      getSteamAppId(results.name);
    })
  .catch(err => {
    console.error(err);
  })
}

// Get Steam Store id from API
function getSteamAppId(name) {
  fetch(steamAppIdsURL, fetchParams).then(
    response => response.json()).then((results) => {
      console.log(results);
      for (let i in results) {
        if (results[i].name === name) {
          appID = results[i].appid;
        }
      }
      console.log(appID);
    })
  .catch(err => {
    console.error(err);
  });
}


// Limit description to maximum number of words and assign the rest to hidden div for expansion
function textSplit(descr) {
  if (descr) {
    let newDescr = descr.split(" ");
    let first = [];
    let second = [];

    for(let i = 0; i < 50; i++) {
      first.push(newDescr[i]); 
    }

    let mBody = document.getElementById("modalBody");
    mBody.innerHTML = first.join(" ") + "<span id='dots'>...</span><a class='more' id='more'></a>"

    for(let i = 50; i < newDescr.length; i++) {
      second.push(newDescr[i]);
    }
    document.getElementById("more").innerHTML = " " + second.join(" "); // add the second string array to the hidden 'more' section
    mBody.innerHTML += "<button onclick='readMore()' id='readMore'>Read more ↓</button>"
  } 
  else {
    mBody.innerHTML = "No description available"
  }
}

// Assigns data to remainding divs in modal footer for selected game
function setGameDetails(rel, esrb, meta, devs, pubs, genre, plfrm, stores) {
  let html = "<div class='row'><div class='col-sm'><span class='text-hl'>Genres: </span>" + genre + "<br>"
  html += "<span class='text-hl'>Metacritic: </span><span class='rounded border border-1 metc'>" + meta + "</span><br>"
  html += "<span class='text-hl'>ESRB: </span>" + esrb + "<br></div>"
  html += "<div class='col-sm'><span class='text-hl'>Released: </span>" + rel + "<br>"
  html += "<span class='text-hl'>Developer(s): </span>" + devs + "<br>"
  html += "<span class='text-hl'>Publisher(s): </span>" + pubs + "<br><br>"
  html += "</div></div>"
  html += "<span class='text-hl'>Platforms: </span>" + plfrm + "<br>"
  html += "<span class='text-hl'>Stores: </span>" + stores + "</p>"
  
  if (stores.includes("Steam", 0)) { // Check if Steam is listed as a store and provide a link for Steam Store api call function
    html += "<a href='javascript:void(0);' id='steam'>See Steam Store details <span class='fa fa-angle-down'></span></a>"
  }
  return html;
}

// Clears modal content after it is closed
function clearContent() {
  let mHeader = document.getElementById("m-header");
  mHeader.innerHtml = "";
  mHeader.style.backgroundImage= "none";
  document.getElementById("mTitle").innerHTML = "";
  document.getElementById("modalBody").innerHTML = "";
  document.getElementById("gameDetail").innerHTML = ""
}

// Back-to-top button section ///////////////////////////////////////////////////////////////
let upButton = document.getElementById("btn-back-to-top");

// When the user scrolls down 20px from the top of the document, show the button
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
// When the user clicks on the button, scroll to the top of the document
upButton.addEventListener("click", backToTop);

function backToTop() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}
///////////////////////////////////////////////////////////////////////////////////////////

// Read more section
function readMore() {
  var dots = document.getElementById("dots");
  var moreText = document.getElementsByClassName("more");
  var btnText = document.getElementById("readMore");

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
      console.log(next)
      getNextResults();
    }
  }
});

