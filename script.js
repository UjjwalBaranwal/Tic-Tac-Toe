document.querySelector(".spinner").style.display = "none";
document.querySelector("#userCont").style.display = "none";
document.querySelector("#oppNameCont").style.display = "none";
document.querySelector("#valueCont").style.display = "none";
document.querySelector("#whosTurn").style.display = "none";
document.querySelector("#bigCont").style.display = "none";

const socket = io();

let uName;
document.querySelector("#find").addEventListener("click", () => {
  console.log("i  am clicked");
  uName = document.querySelector(".name").value;
  alert(`${uName}`);
  document.querySelector(".user").textContent = uName;
  if (!uName) {
    alert("enter a name");
  }
});
