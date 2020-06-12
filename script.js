const button = document.getElementById("submit-button");
const leftArrow = document.getElementById("left-arrow");
const rightArrow = document.getElementById("right-arrow");
const table = document.getElementsByTagName("table");
let firstUser = document.getElementById("first-user");
let secondUser = document.getElementById("second-user");
let thirdUser = document.getElementById("third-user");
let fourthUser = document.getElementById("fourth-user");
let fifthUser = document.getElementById("fifth-user");
let sixthUser = document.getElementById("sixth-user");
let pagesCount = document.getElementById("pages-count");
let currentPage = 1;
let dataFromPages = [];
let totalUsers = 0;
let users = [
  firstUser,
  secondUser,
  thirdUser,
  fourthUser,
  fifthUser,
  sixthUser,
];

const getUsersEmail = () => {
  return document.getElementById("email-input").value;
};

const isValidEmail = (value) => {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(value).toLowerCase());
};

// HTTP request
const makeRequest = () => {
  fetch("https://getbusted.ew.r.appspot.com/submit", {
    method: "POST",
    body: { email: `${getUsersEmail()}` },
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
async function getLatestBusted(pageNumber) {
  const res = await fetch(
    `https://getbusted.ew.r.appspot.com/submissions?page=${pageNumber}`
  );
  const data = await res.json();
  updateTotal(data["total"]);
  if (data["submissions"].length < 6) {
    clearTheTable();
  }
  updateUsersData(data["submissions"]);
  saveTheData();
}

// Send fetch request and show users on next page
async function showNextPage() {
  if (currentPage === 4) {
    return;
  }
  currentPage += 1;
  getLatestBusted(currentPage);
  updatePagesCount(currentPage);
}

// Update total amount of busted users
function updateTotal(total) {
  totalUsers = total;
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

// Generate pages count for the pagination
function generatePages(number) {
  if (number === 0) {
    return ["0"];
  } else if (number > 0 && number <= 6) {
    return [`1-${number}`];
  }
  const pagesArr = ["1-6"];
  const rowsPerPage = 6;
  let latestNum = 0;
  for (let i = rowsPerPage; i < number - 6; i++) {
    if (i % 6 === 0 && number - i > 6) {
      let firstNum = i + 1;
      let lastNum = firstNum + 5;
      pagesArr.push(`${firstNum}-${lastNum}`);
      latestNum = lastNum;
    }
  }
  if (latestNum < number) {
    pagesArr.push(`${latestNum + 1}-${number}`);
  }
  return pagesArr;
}

// Retrieve data from the array in order to display previous page data
function showPreviousPage() {
  if (currentPage === 1) {
    return;
  }
  let previousPage;
  const firstPage = 6 * (currentPage - 2);
  const lastPage = firstPage + 6;
  previousPage = dataFromPages.slice(firstPage, lastPage);
  updateUsersData(previousPage);
  currentPage -= 1;
  updatePagesCount(currentPage);
}

// Clear all rows in the table
function clearTheTable() {
  for (let i = 0; i < users.length; i++) {
    users[i].children["id"].innerHTML = "";
    users[i].children["date"].innerHTML = "";
    users[i].children["email"].innerHTML = "";
    users[i].children["location"].innerHTML = "";
  }
}

// Update pagination
function updatePagesCount(currentPage) {
  const pages = generatePages(totalUsers);
  pagesCount.innerHTML = pages[currentPage - 1];
}

// Parse data from ISO format to string and cut it
function parseDate(date) {
  const result = new Date("2020-06-08T22:06:44.926195178Z");
  return result.toString().slice(0, 16);
}

// Event Listeners
window.addEventListener("load", getLatestBusted(1));
button.addEventListener("click", () => {
  if (isValidEmail(getUsersEmail())) {
    makeRequest();
  } else {
    alert("Please enter valid email");
  }
});
leftArrow.addEventListener("click", showPreviousPage);
rightArrow.addEventListener("click", showNextPage);
