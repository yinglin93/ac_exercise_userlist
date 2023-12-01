const BASE_URL = "https://user-list.alphacamp.io"
const INDEX_URL = BASE_URL + "/api/v1/users/"
const users = []
const dataPanel = document.querySelector('#data-panel')
const modalContent = document.querySelector('#modal-content')

const genderSelector = document.querySelector('#genderSelector')
const regionSelector = document.querySelector('#regionSelector')

let filteredList = []
const filterForm = document.querySelector('#filter-form')
const clearBtn = document.querySelector('#clear-btn')

const favoriteList = JSON.parse(localStorage.getItem('favoriteUsers')) || []

const USERS_PER_PAGE = 12
const paginator = document.querySelector('#paginator')

// 將user資料放進去
function renderUserList(data) {
  const favoriteListId = favoriteList.map((user) => user.id)
  let userHTML = ''

  data.forEach((item) => {
    userHTML += `
    <div clas s= "col mb-3">
        <div class="card h-100">
          <div class="favorite-icon">
            <i class="fa-regular fa-heart add-to-favorite ${favoriteListId.includes(item.id) ? 'checked' : ''}" data-id="${item.id}"></i>
          </div>
          <img src="${item.avatar}" class="card-img-top show-user-info" alt="User Avatar" data-bs-toggle="modal" data-bs-target="#userModal" data-id="${item.id}">
          <div class="card-body">
            <p class="card-title">${item.name}${item.surname}</p>
          </div>
        </div>
      </div>
      `
  })
  dataPanel.innerHTML = userHTML
}

// 性別下拉式選單
function addGenderOptionList() {
  let userHTML = ''
  const genderList = users.map(user => user.gender)
  const genderListSet = new Set(genderList)

  userHTML += `<option class = "default" value = "default">Please choose one</option>`
  genderListSet.forEach((value) => {
    userHTML += `
    <option class = "value" value="${value}">${value}</option>
    `
  })
  genderSelector.innerHTML = userHTML
}

// 地區下拉式選單,並以字母排列
function addRegionOptionList() {
  let userHTML = ''
  const regionList = users.map(user => user.region).sort()
  const regionListSet = new Set(regionList)

  userHTML += `<option class = "default" value = "default">Please choose one</option>`
  regionListSet.forEach((value) => {
    userHTML += `
    <option class = "value" value="${value}">${value}</option>
    `
  })
  regionSelector.innerHTML = userHTML
}

// UserModal
function showUserMadal(id) {
  const userTitle = document.querySelector("#user-modal-title")
  const userBirthday = document.querySelector("#user-modal-birthday")
  const userAge = document.querySelector("#user-modal-age")
  const userEmail = document.querySelector("#user-modal-email")
  const userGender = document.querySelector("#user-modal-gender")
  const userRegion = document.querySelector("#user-modal-region")
  const userImage = document.querySelector("#user-modal-image")

  const data = users.find((user) => user.id === id)
  userTitle.innerText = data.name + data.surname
  userBirthday.innerText = "Birthday : " + data.birthday
  userAge.innerText = "Age : " + data.age
  userEmail.innerText = "Email : " + data.email
  userGender.innerText = "Gender : " + data.gender
  userRegion.innerText = "Region : " + data.region
  userImage.innerHTML = `<img src="${data.avatar}" alt="User Avatar" class="img-fluid">`
}

// FilterForm 監聽事件 -- 篩選資料
filterForm.addEventListener('submit', function onFilterFormSubmitter(event) {
  event.preventDefault()
  const genderOption = genderSelector.value
  const regionOption = regionSelector.value

  filteredList = users.filter((user) => {
    if (genderOption === 'default') {
      return true
    } else {
      return user.gender === genderOption
    }
  }).filter((user) => {
    if (regionOption === 'default') {
      return true
    } else {
      return user.region === regionOption
    }
  })

  if (!filteredList.length) {
    return alert('無符合條件之人選')
  }

  return renderPagination(filteredList.length), renderUserList(getUsersByPage(1))
})


// FilterForm 監聽事件 -- 清除篩選資料
clearBtn.addEventListener('click', function onClearClick() {
  filteredList = users
  genderSelector.value = 'default'
  regionSelector.value = 'default'

  return renderPagination(filteredList.length), renderUserList(getUsersByPage(1))
})

// 加入我的最愛
function addToFavorite(id) {
  const user = users.find((user) => user.id === id)
  const userIndex = favoriteList.findIndex((user) => user.id === id)

  if (favoriteList.some((user) => user.id === id)) {
    favoriteList.splice(userIndex, 1)
    return localStorage.setItem('favoriteUsers', JSON.stringify(favoriteList))
  }

  favoriteList.push(user)
  localStorage.setItem('favoriteUsers', JSON.stringify(favoriteList))
}

// UserCard監聽事件
dataPanel.addEventListener('click', function onPanelClick(event) {
  const target = event.target

  if (target.matches('.show-user-info')) {
    showUserMadal(Number(event.target.dataset.id))
  } else if (target.matches('.add-to-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
    target.classList.toggle('checked')
  } else return
})

// 製作分頁器
function getUsersByPage(page) {
  const data = filteredList.length ? filteredList : users
  const startIndex = (page - 1) * USERS_PER_PAGE
  return data.slice(startIndex, startIndex + USERS_PER_PAGE)
}

// 生成分頁器的頁碼
function renderPagination(amount) {
  const numberOfPage = Math.ceil(amount / USERS_PER_PAGE)
  let rawHTML = ''

  for (let page = 1; page <= numberOfPage; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page = "${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}

// 生成分頁器的事件監聽器
paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return

  const page = Number(event.target.dataset.page)
  renderUserList(getUsersByPage(page))
})


// 抓取API資料
axios
  .get(INDEX_URL)
  .then((response) => {
    users.push(...response.data.results)
    renderPagination(users.length)
    renderUserList(getUsersByPage(1))
    addGenderOptionList(users)
    addRegionOptionList(users)
  })
  .catch((err) => console.log(err))