document.addEventListener('DOMContentLoaded', function () {
  // Smooth scroll cho các liên kết trong menu
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

  // Tạo mảng imagePaths cho slideshow của portfolio.html
  const imagePaths = [];

  // Thay đổi username và repoName thành của bạn
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

      shuffleArray(imagePaths); // Xáo trộn mảng hình ảnh
      startSlideshow(); // Khởi động trình chiếu nếu có ảnh
    })
    .catch(error => console.error('Lỗi khi lấy danh sách hình ảnh:', error));

  // Hàm xáo trộn mảng (shuffle) sử dụng thuật toán Fisher-Yates
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]; // Hoán đổi các phần tử
    }
  }

  // Hàm bắt đầu trình chiếu hình ảnh
  function startSlideshow() {
    const heroContainer = document.querySelector('.portfolio-hero .slideshow');
    let currentIndex = 0;

    // Nếu không có container slideshow, thì không làm gì
    if (!heroContainer) {
      return;
    }

    // Tạo hình ảnh đầu tiên cho slideshow
    const img = document.createElement('img');
    img.src = imagePaths[currentIndex];
    img.alt = "Portfolio Image";
    heroContainer.appendChild(img);

    // Cập nhật hình ảnh mỗi 3 giây
    setInterval(() => {
      if (imagePaths.length > 0) {
        img.src = imagePaths[currentIndex];
        currentIndex = (currentIndex + 1) % imagePaths.length;
      }
    }, 3000);
  }
});
