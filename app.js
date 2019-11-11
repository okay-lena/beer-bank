var beerList = "";
var selectedBeer = {};

document.getElementById("homeLink").addEventListener("click", getAllBeers);

function getAllBeers() {
    const xhr = new XMLHttpRequest();

    xhr.open("GET", `https://api.punkapi.com/v2/beers`, true);

    xhr.onload = function () {
        if (this.status === 200) {
            beerList = JSON.parse(this.responseText);

            let beerHtmlOutput = "";

            beerList.forEach(function (beer) {
                beer.starClass = "far fa-star";
                // check if favorite from LS
                beerHtmlOutput += `
                    <div class="beerInResults">
                        <span class="star"><i class="${beer.starClass}"></i></span>
                        <span class="beerImgSpan"><img src="${beer.image_url}" alt="${beer.name}" class=beerImg></span>
                        <span class="beerName">${beer.name}</span>
                        <span class="beerTagline">${beer.tagline}</span>
                    </div>
                `;
            });

            // insert beers to ui
            document.querySelector(".beers").innerHTML = beerHtmlOutput;

        }

        const beers = Array.from(document.querySelectorAll(".beerInResults"));
        for (beer of beers) {
            beer.addEventListener("click", showBeerDetails);
            for (span of beer.children) {
                if (span.className === "star") {
                    span.addEventListener("click", addBeerToFavorites);
                }
            }
        }

    }

    xhr.send();
}


function showBeerDetails() {
    let selectedBeerName = "";
    // define which beer was clicked
    for (child of this.children) {
        if (child.className === "beerName") {
            selectedBeerName = child.innerText;
        }
    }

    // get selected beer object from all beers
    for (beer of beerList) {
        if (beer.name === selectedBeerName) {
            selectedBeer = beer;
            break;
        }
    }

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

    // initialize and open modal
    $('#beerModal').modal({backdrop: true, keyboard: true, show: true});

}

function addBeerToFavorites() {
    console.log(this.parentElement.children);
    let favBeerName = "";
    // define which beer was clicked
    for (child of this.parentElement.children) {
        if (child.className === "beerName") {
            favBeerName = child.innerText;
        }
    }

    // set selected beer object as favorite with new class name property
    for (beer of beerList) {
        if (beer.name === favBeerName) {
            beer.starClass = "fas fa-star";
            break;
        }
    }

}
