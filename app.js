var beerList = "";
var selectedBeer = {};
var favoriteBeers = [];
const searchBar = document.getElementById("searchBar");

document.addEventListener("DOMContentLoaded", getAllBeers);
document.getElementById("homeLink").addEventListener("click", showAllBeers);
document.getElementById("favoritesLink").addEventListener("click", showFavoriteBeers);
searchBar.addEventListener("keyup", searchBeers);

function getAllBeers() {
    const xhr = new XMLHttpRequest();

    xhr.open("GET", `https://api.punkapi.com/v2/beers`, true);

    xhr.onload = function () {
        if (this.status === 200) {
            beerList = JSON.parse(this.responseText);

            let beerHtml = "";
            let beerStarClass = "";

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

            insertBeersToDOM(beerHtml);
        }

        addEventListenersToShowBeerDetailsAndChangeFavoriteStatus();
    }

    xhr.send();

    // we don't want to show beers yet
    document.querySelector(".beers").style.display = "none";
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

function searchBeers() {
    displayBeersDiv();
    // hide all individual beers
    const allBeers = document.querySelectorAll(".beerInResults");
    for (beer of allBeers) {
        beer.style.display = "none";
    }

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

function displayBeersDiv() {
    document.querySelector(".beers").removeAttribute("style");
}

function showAllBeers(e) {
    e.preventDefault();
    getAllBeers();
    displayBeersDiv();
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

function changeBeerFavoriteStatus(event) {
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
        } else {
            beerList[beerIDToChangeFavStatus-1].isFavorite = true;
            // add beer to localStorage
            favoriteBeers.push(beerToChangeFavStatus);
            localStorage.setItem("favoriteBeers", JSON.stringify(favoriteBeers));
            this.firstChild.className = "fas fa-star";
        }
    }
    event.stopPropagation();
}

function showFavoriteBeers(e) {
    e.preventDefault();

    displayBeersDiv();

    if (localStorage.getItem("favoriteBeers")) {
        let beerHtml = "";
        let beerStarClass = "fas fa-star";

        // get favoriteBeers
        favoriteBeers = JSON.parse(localStorage.getItem("favoriteBeers"));
        for (favBeer of favoriteBeers) {
            beerHtml += buildBeerHtmlInResults(favBeer, beerStarClass);
        }

        insertBeersToDOM(beerHtml);
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
