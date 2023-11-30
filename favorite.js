const BASE_URL = "https://user-list.alphacamp.io"
const INDEX_URL = BASE_URL + "/api/v1/users/"
const users = JSON.parse(localStorage.getItem('favoriteUsers'))
const dataPanel = document.querySelector('#data-panel')


// 將user資料放進去
function renderUserList(data) {
  let userHTML = ''

  data.forEach((item) => {
    userHTML += `
    <div class="col mb-3">
        <div class="card h-100">
          <div class="favorite-icon">
            <i class="fa-regular fa-heart add-to-favorite" data-id="${item.id}"></i>
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

// UserModal
function showUserMadal(id) {
  const userTitle = document.querySelector('#user-modal-title')
  const userBirthday = document.querySelector('#user-modal-birthday')
  const userAge = document.querySelector('#user-modal-age')
  const userEmail = document.querySelector('#user-modal-email')
  const userGender = document.querySelector('#user-modal-gender')
  const userRegion = document.querySelector('#user-modal-region')
  const userImage = document.querySelector('#user-modal-image')

  axios
    .get(INDEX_URL + id)
    .then((response) => {
      const data = response.data
      userTitle.innerText = data.name + data.surname
      userBirthday.innerText = 'Birthday: ' + data.birthday
      userAge.innerText = 'Age: ' + data.age
      userEmail.innerText = 'Email: ' + data.email
      userGender.innerText = 'Gender: ' + data.gender
      userRegion.innerText = 'Region: ' + data.region
      userImage.innerHTML = `<img src="${data.avatar}" alt="User Avatar" class="img-fluid">`
    })
    .catch((err) => console.log(err))

}

// 加入我的最愛
function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteUsers')) || []
  const user = users.find((user) => user.id === id)

  if (list.some((user) => user.id === id)) {
    return alert('已加入我的最愛')
  }

  list.push(user)
  localStorage.setItem('favoriteUsers', JSON.stringify(list))
}

// UserCard監聽事件
dataPanel.addEventListener('click', function onPanelClick(event) {
  if (event.target.matches('.show-user-info')) {
    showUserMadal(Number(event.target.dataset.id))
  }
})

console.log(users)
renderUserList(users)
