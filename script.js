// script.js
// Smooth scroll for nav links

document.addEventListener('DOMContentLoaded', function () {
  const links = document.querySelectorAll('header.hero nav a');

  links.forEach(link => {
    const href = link.getAttribute('href');
    if (href.startsWith('#')) {
      const targetElement = document.querySelector(href);
      if (targetElement) {
        link.addEventListener('click', function (e) {
          e.preventDefault();
          targetElement.scrollIntoView({ behavior: 'smooth' });
        });
      }
    }
    // Nếu không bắt đầu bằng # thì là link ra file khác, không ngăn hành vi mặc định
  });

  const contactBtn = document.getElementById('nav-contact');
  const contactSection = document.getElementById('contact');

  if (contactBtn && contactSection) {
    contactBtn.addEventListener('click', function (e) {
      e.preventDefault(); // chặn hành vi mặc định
      contactSection.classList.remove('highlight');
      void contactSection.offsetWidth; // trigger reflow
      contactSection.classList.add('highlight');
    });
  }
});


// script.js

const imagePaths = [];

// Thay đổi repoName và username thành của bạn
const username = 'ThanhMOOC'; // Tên người dùng GitHub của bạn
const repoName = 'portfolio'; // Tên repo của bạn

// GitHub API URL để lấy danh sách tệp trong thư mục 'img/library'
const apiUrl = `https://api.github.com/repos/${username}/${repoName}/contents/img/library`;

// Fetch danh sách các tệp trong thư mục 'img/library'
fetch(apiUrl)
  .then(response => response.json())
  .then(data => {
    // Lọc ra các tệp hình ảnh (jpg, jpeg, png, gif)
    const imageFiles = data.filter(file => /\.(jpg|jpeg|png|gif)$/.test(file.name));
    
    // Tạo mảng đường dẫn hình ảnh từ URL của GitHub
    imageFiles.forEach(file => {
      imagePaths.push(file.download_url); // Dùng URL tải về của GitHub
    });

    startSlideshow(); // Khởi động trình chiếu
  })
  .catch(error => console.error('Lỗi khi lấy danh sách hình ảnh:', error));

// Hàm bắt đầu trình chiếu hình ảnh
function startSlideshow() {
  const heroImage = document.querySelector('.hero img');
  let currentIndex = 0;

  // Cập nhật hình ảnh mỗi 3 giây
  setInterval(() => {
    if (imagePaths.length > 0) {
      heroImage.src = imagePaths[currentIndex];
      currentIndex = (currentIndex + 1) % imagePaths.length; // Quay lại đầu danh sách nếu đã hết
    }
  }, 3000); // Thay đổi mỗi 3 giây
}
