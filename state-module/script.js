// Fetch data from the backend and display it
fetch('http://localhost:3000/api/users')
  .then(response => response.json())
  .then(data => {
    const userList = document.getElementById('userList');
    data.data.forEach(user => {
      const li = document.createElement('li');
      li.textContent = `${user.id}: ${user.name}`;
      userList.appendChild(li);
    });
  })
  .catch(err => console.error(err));
