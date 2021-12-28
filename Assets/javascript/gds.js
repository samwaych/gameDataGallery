
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
document.getElementById("platform").addEventListener("change", getPlatform);
document.getElementById("genre").addEventListener("change", getGenre);
document.getElementById("players").addEventListener("change", getPlayers);
document.getElementById("orderBy").addEventListener("change", getOrder);

var key = '8881e08db1df45ea9a122d358156e2e1'
var platform ="";
var genre = "";
var players = "";
var order = "";
var game ="";
var page = '&page=1';
var request;

// perform fetch and return results as JSON
async function getGameData() {
  getGame();
  request = `https://rawg.io/api/games?key=${key}${platform}${genre}${players}` +
    `${order}${game}${page}&page_size=40`;
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

// Create containing div from fetched data and assign values for structureCard function
function cardData(data) {
  let html = "<div class='d-flex content my-4'>"
  html += "<div class='d-flex flex-wrap justify-content-center my-2' id='cards'></div>"
  html += "</div>"
  document.getElementById("content").innerHTML = html;

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
    (!addr.background_image ? img = "Assets/images/no_image.jpg" : img = addr.background_image);
    (!addr.released ?  rel = "N/A" : rel = addr.released);
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
  html += "<img class='card-img-top' src='" + img + "'alt='Game Image'>"
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
  return (searchTerm ? game = "&search_precise=true&search=" + searchTerm.split(' ').join('-').toLowerCase() : game = "");
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

async function showDscr(ele) {
  console.log(ele);
  let gameReq = 'https://rawg.io/api/games/' + ele + '?key=' + key + '&description'; 
  await fetch(gameReq).then(
    response => response.json()).then((results) => {
      console.log(results)
      document.getElementById("gameTitle").innerHTML = results.name;
      document.getElementById("m-header").style.backgroundImage=`url(${results.background_image})`;
      document.getElementById("m-header").style.backgroundSize="cover";
      document.getElementById("m-header").style.backgroundRepeat="no-repeat";
      let descr = results.description_raw;
      if (descr) {
        document.getElementById("modalBody").innerHTML = descr 
      } 
      else {
        document.getElementById("modalBody").innerHTML = "No description available"
      }
    })
  .catch(err => {
    console.error(err);
  })
}


/* let gameReq = 'https://rawg.io/api/games/' + id + '?key=' + key + '&description'; 
    fetch(gameReq).then(
      response => response.json()).then((results) => {
        let descr = results.description_raw;

        let htmlContent = structureCard(img, title);
        document.getElementById("cards").innerHTML += htmlContent;
      })
    .catch(err => {
      console.error(err);
    });*/