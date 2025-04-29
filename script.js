document.addEventListener('DOMContentLoaded', function () {
  const links = document.querySelectorAll('header.hero nav a[href^="#"]');
  links.forEach(link => {
    const href = link.getAttribute('href');
    
      const targetElement = document.querySelector(href);
      if (targetElement) {
        link.addEventListener('click', e => {
          e.preventDefault();
          targetElement.scrollIntoView({ behavior: 'smooth' });
        });
      }
    })
    // Nếu không bắt đầu bằng # thì là link ra file khác, không ngăn hành vi mặc định
  });

  const contactBtn = document.getElementById('nav-contact');
  const contactSection = document.getElementById('contact');

  if (contactBtn && contactSection) {
    contactBtn.addEventListener('click', e => {
      e.preventDefault(); // chặn hành vi mặc định
      contactSection.classList.remove('highlight');
      void contactSection.offsetWidth; // trigger reflow
      contactSection.classList.add('highlight');
    });
  }

  const imagePaths = []; 
  const username = 'ThanhMOOC'; 
  const repoName = 'portfolio'; 
  const apiUrl = `https://api.github.com/repos/${username}/${repoName}/contents/img/library`;


  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      const imageFiles = data.filter(file => /\.(jpg|jpeg|png|gif)$/.test(file.name));

      if(imageFiles.length ==0){
        console.log('no image found');
        return;
      }
      

      imageFiles.forEach(file => {
        imagePaths.push(file.download_url); // Dùng URL tải về của GitHub
      });

      shuffleArray(imagePaths); // Xáo trộn mảng hình ảnh
      startSlideshow(); // Khởi động trình chiếu nếu có ảnh
    })
    .catch(error => console.error('Lỗi khi lấy danh sách hình ảnh:', error));


  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]; 
    }
  }

  function startSlideshow() {
    const heroContainer = document.querySelector('.portfolio-hero .slideshow');
    let currentIndex = 0;
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
  };

const fetchPhotos = async() => {
  try {
      const response = await fetch('http://localhost:3000/api/photos');
      const photos = await response.json();
      const gallery = document.getElementById('gallery');

      if(!gallery){
        return;
      }
      photos.forEach(photo => {
        const img = document.createElement('img');
        img.src = photo.secure_url;
        img.style = 'max-width:200px;margin:10px;';
        gallery.appendChild(img);
      });
  } catch (error) {
      console.error('Lỗi:', error);
  }
}
fetchPhotos();
