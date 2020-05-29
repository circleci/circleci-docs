/**
 * JS related to our product switcher in the sidebar
 */

// helpers -------------------

function getElById(id) {
  return document.getElementById(id)
}

var products = {
  "en": {name: "Cloud", url: "docs/2.0/"},
  "ja": {name: "Server", url: "docs/server/2.x/"}
}

// List of elements that have dynamic content based on our selected product
var els = {
  sidebarProdSelect: getElById("sidebarProdSelect"),
};

function reloadWithNewProduct(prodCode) {
  window.location.href = "https://circleci.com/" + products[prodCode].url
}

// Sets the sidebar product picker to the currently selected product
function handleSetProductOnLoad() {
  var currentProd = window.currentProd; // current prod is set in _includes/sidebar.html

  // Set value for 'sidebar'
  for(var i, j = 0; i = els.sidebaProdSelect.options[j]; j++) {
    if(i.value == currentProd) {
      els.sidebarProdSelect.selectedIndex = j;
      break;
    }
  }
}

/**
 * Function to run when the sidebar product <select> is changed.
 * It checks the newly selected product code and reloads the page in that product.
 */
function handleChangeProductSidebar() {
  els.sidebarProdSelect.addEventListener("change", function(e) {
    switch(e.target.value) {
      case "server":
        reloadWithNewLocale("server")
        break;
      case "en":
        reloadWithNewLocale("en")
        break;
      default:
        return;
    }
  })
}


export function init() {
  handleChangeProductSidebar();
  handleSetProductOnLoad();
}
