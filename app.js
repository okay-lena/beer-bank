let beerList = "";
let selectedBeer = {};
let favoriteBeers = [];
const searchBar = document.getElementById("searchBar");
const beersDiv = document.getElementById("beers");
var beerItemToStartLoading;
var favoritesPage = false;

document.addEventListener("DOMContentLoaded", getAllBeersFromAPI);
document.getElementById("homeLink").addEventListener("click", showAllBeers);
document.getElementById("favoritesLink").addEventListener("click", showFavoriteBeers);
if (searchBar) {
        searchBar.addEventListener("keyup", instantBeerSearch);
}
document.getElementById("advancedSearch").addEventListener("submit", searchBeers);

function getAllBeersFromAPI() {
    const xhr = new XMLHttpRequest();

    xhr.open("GET", `https://api.punkapi.com/v2/beers`, true);

    xhr.onload = function () {
        if (this.status === 200) {
            beerList = JSON.parse(this.responseText);

            let beerHtml = "";
            let beerStarClass = "";

            beerHtml = getAllBeersHtml(beerList, beerStarClass, beerHtml);
            insertBeersToDOM(beerHtml);
            // we don't want to show beers yet
            hideAllBeerCards();
        }

        addEventListenersToShowBeerDetailsAndChangeFavoriteStatus();
    }

    xhr.send();
}

function getAllBeersHtml(beerList, beerStarClass, beerHtml) {
    beerList.forEach(function (beer) {
        // check if favorite in localStorage
        if (localStorage.getItem("favoriteBeers") === null) {
            favoriteBeers = [];
            beer.isFavorite = false;
            beerStarClass = "far fa-star";
        } else {
            favoriteBeers = JSON.parse(localStorage.getItem("favoriteBeers"));
            for (favBeer of favoriteBeers) {
                if (favBeer.id === beer.id) {
                    beer.isFavorite = true;
                    beerStarClass = "fas fa-star";
                    break;
                } else {
                    beer.isFavorite = false;
                    beerStarClass = "far fa-star";
                }
            }
        }
        beerHtml += buildBeerHtmlInResults(beer, beerStarClass);
    });
    return beerHtml;
}

function hideAllBeerCards() {
    // hide all individual beers
    const allBeers = document.querySelectorAll(".beerInResults");
    for (beerItem of allBeers) {
        beerItem.style.display = "none";
    }
}

function insertBeersToDOM(beersHtml) {
    document.querySelector(".beers").innerHTML = beersHtml;
}

function buildBeerHtmlInResults(beer, beerStarClass) {
    let beerHtml = `
    <div class="beerInResults">
        <span class="beerID">${beer.id}</span>
        <span class="star"><i class="${beerStarClass}"></i></span>
        <span class="beerImgSpan"><img src="${beer.image_url}" alt="${beer.name}" class=beerImg></span>
        <span class="beerName">${beer.name}</span>
        <span class="beerTagline">${beer.tagline}</span>
    </div>
    `;
    return beerHtml;
}

function addEventListenersToShowBeerDetailsAndChangeFavoriteStatus() {
    const beers = Array.from(document.querySelectorAll(".beerInResults"));
    for (beer of beers) {
        beer.addEventListener("click", showBeerDetails);
        for (span of beer.children) {
            if (span.className === "star") {
                span.addEventListener("click", changeBeerFavoriteStatus);
            }
        }
    }
}

function instantBeerSearch() {
    hideAllBeerCards();
    const allBeers = document.querySelectorAll(".beerInResults");

    // get string input from search
    let beerToFind = searchBar.value.toLowerCase();

    // make search of input string for each beer
    allBeers.forEach(function (beer) {
        for (span of beer.children) {
            if ( span.className === "beerName" && span.innerText.toLowerCase().includes(beerToFind) ) {
                // show beers matching string
                beer.removeAttribute("style");
            }
            // if beer doesn't exist - show notice // todo later
        }
    });
}

function searchBeers(e) {
    e.preventDefault();
    hideAllBeerCards();
    const allBeers = document.querySelectorAll(".beerInResults");

    let matchingBeerId = 0;

    // get all inputs from search and set default if empty
    let minIbu = document.getElementById("minIbu").value;
    if (minIbu === "") {
        minIbu = 0;
    }
    let maxIbu = document.getElementById("maxIbu").value;
    if (maxIbu === "") {
        maxIbu = 100;
    }
    let minAbv = document.getElementById("minAbv").value;
    if (minAbv === "") {
        minAbv = 0;
    }
    let maxAbv = document.getElementById("maxAbv").value;
    if (maxAbv === "") {
        maxAbv = 100;
    }
    let minEbc = document.getElementById("minEbc").value;
    if (minEbc === "") {
        minEbc = 0;
    }
    let maxEbc = document.getElementById("maxEbc").value;
    if (maxEbc === "") {
        maxEbc = 100;
    }
    let brewedFrom = document.getElementById("brewedFrom").value;
    if (brewedFrom === "") {
        brewedFrom = Date.parse("01/01/1970");
    } else {
        brewedFrom = Date.parse(brewedFrom);
    }
    let brewedTo = document.getElementById("brewedTo").value;
    if (brewedTo === "") {
        brewedTo = Date.parse("01/01/2100");
    } else {
        brewedTo = Date.parse(brewedTo);
    }

    // find matching beers
    for (beer of beerList) {
        beer.first_brewed = Date.parse("01/" + beer.first_brewed);
        if (
            (beer.ibu >= minIbu && beer.ibu <= maxIbu) &&
            (beer.abv >= minAbv && beer.abv <= maxAbv) &&
            (beer.ebc >= minEbc && beer.ebc <= maxEbc) &&
            (beer.first_brewed >= brewedFrom && beer.first_brewed <= brewedTo)
            ) {
            matchingBeerId = beer.id;

            allBeers.forEach(function (beerItem){
                for (span of beerItem.children) {
                    if ( span.className === "beerID" && span.innerText == matchingBeerId ) {
                        // show matching beer
                        beerItem.removeAttribute("style");
                    }
                    // if beer doesn't exist - show notice // todo later
                }
            });
        }
    }
}

function showAllBeers(e) {
    e.preventDefault();

    // to prevent displaying favoritesPage instead of Home
    favoritesPage = false;

    let beerHtml = getAllBeersHtml(beerList, "", "");
    insertBeersToDOM(beerHtml);
    addEventListenersToShowBeerDetailsAndChangeFavoriteStatus();
    hideAllBeerCards();

    beerItemToStartLoading = 0;
    let beerItemToContinueLoading = loadMoreBeers(beerItemToStartLoading);
    beersDiv.addEventListener('scroll', function() {
        if (beersDiv.scrollTop + beersDiv.clientHeight >= beersDiv.scrollHeight) {
            beerItemToContinueLoading = loadMoreBeers(beerItemToContinueLoading);
        }
    });
}

function loadMoreBeers(beerItemToStartLoading) {
    const allBeers = document.querySelectorAll(".beerInResults");
    for (beerItem = beerItemToStartLoading; beerItem < beerItemToStartLoading+9; beerItem++) {
        if (allBeers[beerItem]) {
            allBeers[beerItem].removeAttribute("style");
        }
    }
    beerItemToStartLoading = beerItemToStartLoading + 9;
    return beerItemToStartLoading;
}

function showBeerDetails() {
    let selectedBeerID = "";
    // define which beer was clicked
    for (child of this.children) {
        if (child.className === "beerID") {
            selectedBeerID = child.innerText;
        }
    }

    // get selected beer object from all beers
    for (beer of beerList) {
        if (beer.id == selectedBeerID) {
            selectedBeer = beer;
            break;
        }
    }

    buildBeerHtmlDetails(beer);
    showRandomBeers(3);
    openBeerModal();
}

function openBeerModal() {
    // initialize and open modal
    $('#beerModal').modal({backdrop: true, keyboard: true, show: true});
}

function buildBeerHtmlDetails(beer) {
    // get modal UI and populate modal window with selected beer details
    // image
    document.getElementById("beerImage").innerHTML = `
        <img src="${beer.image_url}" class="details-beer-image">
    `;

    // details
    document.getElementById("beerDetails").innerHTML = `
        <span class="details-beer-name">${beer.name}</span>
        <span class="details-tagline">${beer.tagline}</span>
        <span class="line"></span>
        <span class="ibu"><b>IBU:</b> ${beer.ibu}</span>
        <span class="abv"><b>ABV:</b> ${beer.abv}</span>
        <span class="ebc"><b>EBC:</b> ${beer.ebc}</span>
        <span class="description">${beer.description}</span>
        <span class="best-served"><b>Best served with:</b></span>
        <ul class="food-pairing"></ul>
    `;

    // dynamically populate food pairing
    const foodPairing = beer.food_pairing; // all pairing food
    const foodPairingSection = document.querySelector(".food-pairing");

    for (food of foodPairing) {
        const liFood = document.createElement("li");
        liFood.appendChild(document.createTextNode(food));
        foodPairingSection.appendChild(liFood);
    }
}

function changeBeerFavoriteStatus(e) {
    let beerToChangeFavStatus = {};
    let beerIDToChangeFavStatus = "";

    // define which beer was clicked
    for (child of this.parentElement.children) {
        if (child.className === "beerID") {
            // now we know the beer
            beerIDToChangeFavStatus = child.textContent;
            beerToChangeFavStatus = beerList[beerIDToChangeFavStatus-1];
        }
    }

    // check if localStorage exists
    if (localStorage.getItem("favoriteBeers") === null) {
        favoriteBeers = [];
        // change isFavorite in beerList
        beerList[beerIDToChangeFavStatus-1].isFavorite = true;
        // add current beer to favoriteBeers
        favoriteBeers.push(beerToChangeFavStatus);
        localStorage.setItem("favoriteBeers", JSON.stringify(favoriteBeers));
        // change star icon in UI search results
        this.firstChild.className = "fas fa-star";
    } else {
        favoriteBeers = JSON.parse(localStorage.getItem("favoriteBeers"));
        if (beerList[beerIDToChangeFavStatus-1].isFavorite) {
            // update isFavorite in beerList
            beerList[beerIDToChangeFavStatus-1].isFavorite = false;
            // change star icon in UI search results
            this.firstChild.className = "far fa-star";
            // remove beer from favoriteBeers
            favoriteBeers.forEach(function (favBeer, index) {
                if (favBeer.id == beerIDToChangeFavStatus) {
                    favoriteBeers.splice(index, 1);
                }
            });
            localStorage.setItem("favoriteBeers", JSON.stringify(favoriteBeers));
            // reload favoriteBeers page
            if (favoritesPage) {
                showFavoriteBeers(e);
            }
        } else {
            beerList[beerIDToChangeFavStatus-1].isFavorite = true;
            // add beer to localStorage
            favoriteBeers.push(beerToChangeFavStatus);
            localStorage.setItem("favoriteBeers", JSON.stringify(favoriteBeers));
            this.firstChild.className = "fas fa-star";
        }
    }
    e.stopPropagation();
}

function showFavoriteBeers(e) {
    e.preventDefault();

    if (localStorage.getItem("favoriteBeers")) {
        let beerHtml = "";
        let beerStarClass = "fas fa-star";

        // get favoriteBeers
        favoriteBeers = JSON.parse(localStorage.getItem("favoriteBeers"));
        for (favBeer of favoriteBeers) {
            beerHtml += buildBeerHtmlInResults(favBeer, beerStarClass);
        }

        insertBeersToDOM(beerHtml);
        favoritesPage = true;
        addEventListenersToShowBeerDetailsAndChangeFavoriteStatus();
    }
}

function showRandomBeers(numberOfBeers) {
    let beer = {};
    let beerHtml = "";

    for (i = 0; i < numberOfBeers; i++) {
        // generate random beer object
        beer = beerList[Math.floor(Math.random() * beerList.length)];
        beerHtml += buildBeerHtmlInResults(beer, "");
    }

    // insert random beers to DOM
    document.querySelector("#randomBeers").innerHTML = beerHtml;

    addEventListenersToShowBeerDetailsAndChangeFavoriteStatus();
}

function showRandomBeerDetails() {
    // define which beer was clicked
    let selectedBeerID = this.children[0].innerText;

    // get selected beer object from all beers
    selectedBeer = beerList[selectedBeerID-1];

    buildBeerHtmlDetails(selectedBeer);
    showRandomBeers(3);
    openBeerModal();
}
