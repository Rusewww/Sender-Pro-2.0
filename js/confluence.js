const page = document.querySelector("#page");

const btn = document.createElement("button");
btn.setAttribute("class", "confluence-btn");

page.appendChild(btn);

btn.onclick = () => {
  btn.classList.toggle("btn-active");
  document.querySelectorAll(".expand-control").forEach((item) => item.click());
};
