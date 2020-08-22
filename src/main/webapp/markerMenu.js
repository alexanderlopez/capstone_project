
var openBtn;

var closeBtn;

var menu;

var menuOpen;

function initMarkerMenu() {
  menuOpen = true;
  openBtn = document.getElementById("markerMenuOpen");
  closeBtn = document.getElementById("markerMenuClose");
  menu = document.getElementById("markerMenu");
}

function toggleMarkerMenu() {
  if (menuOpen) {
    openBtn.style.display='none';
    closeBtn.style.display='block';
    menu.classList.add("open");
  } else {
    openBtn.style.display='block';
    closeBtn.style.display='none';
    menu.classList.remove("open");
  }

  menuOpen = !menuOpen;
}
