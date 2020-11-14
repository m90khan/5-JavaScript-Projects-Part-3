const mouse = document.querySelector(".cursor");

window.addEventListener("mousemove", cursor);
function cursor(e) {
  mouse.style.top = e.pageY + "px";
  mouse.style.left = e.pageX + "px";
}
