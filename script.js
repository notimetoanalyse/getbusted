const button = document.getElementById("submit-button");
const leftArrow = document.getElementById("left-arrow");
const rightArrow = document.getElementById("right-arrow");
const table = document.getElementsByTagName("table")[0];
let firstUser = document.getElementById("first-user");
let secondUser = document.getElementById("second-user");
let thirdUser = document.getElementById("third-user");
let fourthUser = document.getElementById("fourth-user");
let fifthUser = document.getElementById("fifth-user");
let sixthUser = document.getElementById("sixth-user");
let usersEmail;
let pagesCount = document.getElementById("pages-count");
let currentPage = 1;
let dataFromPages = [];

let users = [
  firstUser,
  secondUser,
  thirdUser,
  fourthUser,
  fifthUser,
  sixthUser,
];

const getUsersEmail = () => {
  usersEmail = document.getElementById("email-input").value;
  return usersEmail;
};

const isValidEmail = (value) => {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(value).toLowerCase());
};

// HTTP request
const makeRequest = () => {
  fetch("https://getbusted.ew.r.appspot.com/submit", {
    method: "POST",
    body: { email: `${usersEmail}` },
  })
    .then(function (data) {
      alert("Your email is submitted!");
    })
    .catch(function (error) {
      console.log("Request failure: ", error);
      alert("Sorry, your email is not submitted due to some error :(");
    });
};

// Get list of recent busted users
async function getLatestBusted() {
  const res = await fetch(
    "https://getbusted.ew.r.appspot.com/submissions?page=1"
  );
  const data = await res.json();

  updateTotal(data["total"]);
  updateUsersData(data["submissions"]);
}

async function showNextPage() {
  saveTheData();
  if (currentPage === 4) {
    return;
  }
  currentPage += 1;
  updatePagesCount();
  const res = await fetch(
    `https://getbusted.ew.r.appspot.com/submissions?page=${currentPage}`
  );
  const data = await res.json();
  if (data["submissions"].length < 6) {
    clearTheTable();
  }
  updateUsersData(data["submissions"]);
}

// Update total amount of busted users
function updateTotal(total) {
  const totalNumber = document.getElementsByClassName("total-number");
  for (let i = 0; i < totalNumber.length; i++) {
    totalNumber[i].innerHTML = `${total}`;
  }
}

// Update table
function updateUsersData(data) {
  for (let i = 0; i < data.length; i++) {
    users[i].children["id"].innerHTML = data[i]["id"];
    users[i].children["date"].innerHTML =
      data[i]["date"].length > 16
        ? parseDate(data[i]["date"])
        : data[i]["date"];
    users[i].children["email"].innerHTML = data[i]["customer"]["email"];
    users[i].children["location"].innerHTML = data[i]["customer"]["location"];
  }
}

// Save the data from current page to the array
function saveTheData() {
  users.map((user) => {
    const seenUser = {
      id: user.children["id"].innerHTML,
      date: user.children["date"].innerHTML,
      customer: {
        email: user.children["email"].innerHTML,
        location: user.children["location"].innerHTML,
      },
    };
    dataFromPages.push(seenUser);
  });
}

// Retrieve previous page data from the array
function showPreviousPage() {
  let previousPage;
  switch (currentPage) {
    case 1:
      return;
    case 2:
      previousPage = dataFromPages.slice(0, 6);
      updateUsersData(previousPage);
      currentPage -= 1;
      updatePagesCount();
      break;
    case 3:
      previousPage = dataFromPages.slice(6, 12);
      updateUsersData(previousPage);
      currentPage -= 1;
      updatePagesCount();
      break;
    case 4:
      previousPage = dataFromPages.slice(12, 18);
      updateUsersData(previousPage);
      currentPage -= 1;
      updatePagesCount();
  }
}

function clearTheTable() {
  for (let i = 0; i < users.length; i++) {
    users[i].children["id"].innerHTML = "";
    users[i].children["date"].innerHTML = "";
    users[i].children["email"].innerHTML = "";
    users[i].children["location"].innerHTML = "";
  }
}

function updatePagesCount() {
  switch (currentPage) {
    case 1:
      pagesCount.innerHTML = "1-6";
      break;
    case 2:
      pagesCount.innerHTML = "7-12";
      break;
    case 3:
      pagesCount.innerHTML = "13-18";
      break;
    case 4:
      pagesCount.innerHTML = "19";
      break;
  }
}

function parseDate(date) {
  const parsedDate = date.split(/[: T-]/).map(parseFloat);
  const result = new Date(
    parsedDate[0],
    parsedDate[1] - 1,
    parsedDate[2],
    parsedDate[3] || 0,
    parsedDate[4] || 0,
    parsedDate[5] || 0,
    0
  ).toString();
  return result.slice(0, 15);
}

// Event Listeners
window.addEventListener("load", getLatestBusted);
button.addEventListener("click", () => {
  if (isValidEmail(getUsersEmail())) {
    makeRequest();
  } else {
    alert("Please enter valid email");
  }
});
leftArrow.addEventListener("click", showPreviousPage);
rightArrow.addEventListener("click", showNextPage);
