// #region Initial Data & State
// Initialize dynamic books from localStorage
let USER_BOOKS = JSON.parse(localStorage.getItem('user_books')) || [];
let ALL_BOOKS = [...BOOKS, ...USER_BOOKS];

// Auth State
let CURRENT_USER = JSON.parse(localStorage.getItem('current_user')) || null;
// #endregion

// #region Condition Class Map
// Maps Turkish condition labels → CSS class for badge colour
const CONDITION_CLASS = {
  'Yeni Gibi': 'new',
  'Çok İyi': 'good',
  'İyi': 'good',
  'Eski': 'fair'
};
// #endregion

// #region Card Factory

// #region Card Factory
function createCard(book) {
  const cssClass = CONDITION_CLASS[book.condition] || 'fair';
  const card = document.createElement('div');
  card.className = 'product-card';
  card.innerHTML = `
    <div class="product-img">
      ${book.imageUrl ?
      `<img src="${book.imageUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:var(--radius-md);">` :
      `<div class="img-fallback" style="background:${book.gradient}">
          <i class="${book.icon} fallback-icon"></i>
        </div>`
    }
      <button class="favorite-btn"><i class="ri-heart-line"></i></button>
      ${book.course ? `<div class="course-tag">${book.course}</div>` : ''}
    </div>
    <div class="product-details">
      <h3>${book.title}</h3>
      <p class="author">${book.author}</p>
      <div class="seller-info">
        <div class="avatar-placeholder"><i class="ri-user-3-line"></i></div>
        <span>${book.sellerName}</span>
        <span class="time-ago">${book.timeAgo}</span>
      </div>
      <div class="product-footer">
        <div class="price-wrap">
          <span class="current-price">${book.price}</span>
        </div>
        <span class="condition-tag ${cssClass}">${book.condition}</span>
      </div>
    </div>`;

  card.addEventListener('click', e => {
    if (e.target.closest('.favorite-btn')) return;
    openPanel(book);
  });

  card.querySelector('.favorite-btn').addEventListener('click', e => {
    e.stopPropagation();
    const btn = e.currentTarget;
    btn.classList.toggle('active');
    btn.querySelector('i').className = btn.classList.contains('active')
      ? 'ri-heart-fill' : 'ri-heart-line';
  });

  return card;
}

function renderCards(list) {
  const grid = document.querySelector('.listing-grid');
  grid.innerHTML = '';
  if (!list.length) {
    grid.innerHTML = `<p style="color:var(--text-muted);grid-column:1/-1;
      text-align:center;padding:60px 0;font-size:1.1rem;">İlan bulunamadı.</p>`;
    return;
  }
  // Sort by ID descending to show newest first if they are new
  const sorted = [...list].sort((a, b) => b.id - a.id);
  sorted.forEach(book => grid.appendChild(createCard(book)));
}
// #endregion

// #endregion

// #region Detail Panel
function openPanel(book) {
  const cssClass = CONDITION_CLASS[book.condition] || 'fair';

  const panelImg = document.getElementById('panel-img');
  const panelIcon = document.getElementById('panel-icon');

  if (book.imageUrl) {
    panelImg.style.background = `url(${book.imageUrl}) center/cover no-repeat`;
    panelIcon.style.display = 'none';
  } else {
    panelImg.style.background = book.gradient;
    panelIcon.className = `${book.icon} fallback-icon`;
    panelIcon.style.display = 'block';
  }
  document.getElementById('panel-title').textContent = book.title;
  document.getElementById('panel-author').textContent = book.author;
  document.getElementById('panel-seller-name').textContent = book.sellerName;
  document.getElementById('panel-time').textContent = book.timeAgo;
  document.getElementById('panel-price').textContent = book.price;
  document.getElementById('panel-desc').textContent = book.description;

  // conditionLabel is now the long description of condition state
  document.getElementById('panel-condition-note').textContent = book.conditionLabel;

  const courseEl = document.getElementById('panel-course');
  courseEl.textContent = book.course || '';
  courseEl.style.display = book.course ? 'inline-block' : 'none';

  const condEl = document.getElementById('panel-condition');
  condEl.textContent = book.condition;
  condEl.className = `condition-tag ${cssClass}`;

  document.getElementById('detail-panel').classList.add('open');
  document.getElementById('panel-overlay').classList.add('visible');
  document.body.style.overflow = 'hidden';
}

function closePanel() {
  document.getElementById('detail-panel').classList.remove('open');
  document.getElementById('panel-overlay').classList.remove('visible');
  document.body.style.overflow = '';
}
// #endregion

// #endregion

// #region Modal Management
function openModal(modalId, overlayId) {
  document.getElementById(modalId).classList.add('open');
  document.getElementById(overlayId).classList.add('visible');
  document.body.style.overflow = 'hidden';
}

function closeModal(modalId, overlayId) {
  document.getElementById(modalId).classList.remove('open');
  document.getElementById(overlayId).classList.remove('visible');
  if (!document.querySelector('.modal.open') && !document.getElementById('detail-panel').classList.contains('open')) {
    document.body.style.overflow = '';
  }
}
// #endregion

// #endregion

// #region Auth Logic

// #region Auth Logic
function updateNavbar() {
  const navActions = document.getElementById('nav-actions');
  const menuToggle = `
    <button class="menu-toggle" id="menu-toggle">
      <i class="ri-menu-line"></i>
    </button>`;

  if (CURRENT_USER) {
    navActions.innerHTML = `
      <div class="nav-user">
        <div class="avatar-sm"><i class="ri-user-line"></i></div>
        <span>${CURRENT_USER.fullname.split(' ')[0]}</span>
        <i class="ri-logout-box-r-line logout-btn" id="logout-btn" title="Çıkış Yap"></i>
      </div>
      <button class="btn btn-primary" id="post-btn"><i class="ri-add-line"></i> <span>İlan Ver</span></button>
      ${menuToggle}
    `;
    document.getElementById('logout-btn').addEventListener('click', logout);
  } else {
    navActions.innerHTML = `
      <button class="btn btn-ghost" id="login-btn">Giriş Yap</button>
      <button class="btn btn-primary" id="post-btn"><i class="ri-add-line"></i> <span>İlan Ver</span></button>
      ${menuToggle}
    `;
    document.getElementById('login-btn').addEventListener('click', () => openModal('auth-modal', 'auth-overlay'));
  }

  // Re-attach menu toggle event since we replaced the element
  attachMenuToggle();

  document.getElementById('post-btn').addEventListener('click', () => {
    if (!CURRENT_USER) {
      openModal('auth-modal', 'auth-overlay');
    } else {
      openModal('post-modal', 'post-overlay');
    }
  });
}

function signup(fullname, email, password) {
  const users = JSON.parse(localStorage.getItem('users')) || [];
  if (users.find(u => u.email === email)) {
    alert('Bu e-posta adresi zaten kullanımda.');
    return;
  }
  const newUser = { fullname, email, password };
  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));
  login(email, password);
}

function login(email, password) {
  const users = JSON.parse(localStorage.getItem('users')) || [];
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    CURRENT_USER = user;
    localStorage.setItem('current_user', JSON.stringify(user));
    updateNavbar();
    closeModal('auth-modal', 'auth-overlay');
  } else {
    alert('Geçersiz e-posta veya şifre.');
  }
}

function logout() {
  CURRENT_USER = null;
  localStorage.removeItem('current_user');
  updateNavbar();
}

function attachMenuToggle() {
  const menuToggle = document.getElementById('menu-toggle');
  const navLinksContainer = document.querySelector('.nav-links');

  if (menuToggle && navLinksContainer) {
    menuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      navLinksContainer.classList.toggle('active');
      const icon = menuToggle.querySelector('i');
      icon.className = navLinksContainer.classList.contains('active') ? 'ri-close-line' : 'ri-menu-line';
    });
  }
}
// #endregion

// #endregion

// #region Boot

document.addEventListener('DOMContentLoaded', () => {

  // Initial render
  renderCards(ALL_BOOKS);
  updateNavbar();

  // #region Navigation
  const navbar = document.querySelector('.navbar');
  const navLinks = document.querySelectorAll('.nav-links a');
  const navLinksContainer = document.querySelector('.nav-links');

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
        ticking = false;
      });
      ticking = true;
    }
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    const menuToggle = document.getElementById('menu-toggle');
    if (navLinksContainer.classList.contains('active') && !navLinksContainer.contains(e.target) && (menuToggle && !menuToggle.contains(e.target))) {
      navLinksContainer.classList.remove('active');
      if (menuToggle) menuToggle.querySelector('i').className = 'ri-menu-line';
    }
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      // Close mobile menu on link click
      if (navLinksContainer && navLinksContainer.classList.contains('active')) {
        navLinksContainer.classList.remove('active');
        const menuToggle = document.getElementById('menu-toggle');
        if (menuToggle) menuToggle.querySelector('i').className = 'ri-menu-line';
      }
    });
  });
  // #endregion

  // #region Panel Events
  document.getElementById('panel-close').addEventListener('click', closePanel);
  document.getElementById('panel-overlay').addEventListener('click', closePanel);
  // #endregion

  // #region Modal Close Events
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal');
      const overlayId = modal.id === 'auth-modal' ? 'auth-overlay' : 'post-overlay';
      closeModal(modal.id, overlayId);
    });
  });

  document.getElementById('auth-overlay').addEventListener('click', () => closeModal('auth-modal', 'auth-overlay'));
  document.getElementById('post-overlay').addEventListener('click', () => closeModal('post-modal', 'post-overlay'));

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closePanel();
      closeModal('auth-modal', 'auth-overlay');
      closeModal('post-modal', 'post-overlay');
    }
  });

  const footerLink = document.getElementById('footer-post-link');
  if (footerLink) {
    footerLink.addEventListener('click', e => {
      if (!CURRENT_USER) {
        e.preventDefault();
        openModal('auth-modal', 'auth-overlay');
      } else {
        openModal('post-modal', 'post-overlay');
      }
    });
  }
  // #endregion

  // #region Auth Tab Switching
  const authTabs = document.querySelectorAll('.auth-tab');
  const authForms = document.querySelectorAll('.auth-form');

  authTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      authTabs.forEach(t => t.classList.remove('active'));
      authForms.forEach(f => f.classList.remove('active'));

      tab.classList.add('active');
      document.getElementById(`${tab.dataset.tab}-form`).classList.add('active');
    });
  });
  // #endregion

  // #region Auth Form Submissions
  document.getElementById('signup-form').addEventListener('submit', e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    signup(fd.get('fullname'), fd.get('email'), fd.get('password'));
  });

  document.getElementById('login-form').addEventListener('submit', e => {
    e.preventDefault();
    const fd = new FormData(e.target);
    login(fd.get('email'), fd.get('password'));
  });
  // #endregion

  // #region Image Upload Handling
  let currentBookImage = null;
  const bookImageInput = document.getElementById('book-image');
  const imagePreview = document.getElementById('image-preview');

  if (bookImageInput && imagePreview) {
    bookImageInput.addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) {
        currentBookImage = null;
        imagePreview.innerHTML = '<i class="ri-image-add-line" style="font-size: 2rem; margin-bottom: 8px;"></i><p>Fotoğraf seçmek için tıklayın</p>';
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          // Resize to max 600px to save storage space
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_SIZE = 600;

          if (width > height) {
            if (width > MAX_SIZE) {
              height *= MAX_SIZE / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width *= MAX_SIZE / height;
              height = MAX_SIZE;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          currentBookImage = canvas.toDataURL('image/jpeg', 0.8);
          imagePreview.innerHTML = `<img src="${currentBookImage}" alt="Önizleme">`;
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  }
  // #endregion

  // #region Post Book Submission
  document.getElementById('post-book-form').addEventListener('submit', e => {
    e.preventDefault();
    if (!CURRENT_USER) return;

    const fd = new FormData(e.target);
    const newBook = {
      id: Date.now(),
      title: fd.get('title'),
      author: fd.get('author'),
      category: fd.get('category'),
      course: fd.get('course'),
      price: fd.get('price') + " TL",
      condition: fd.get('condition'),
      conditionLabel: fd.get('conditionLabel'),
      description: fd.get('description'),
      imageUrl: currentBookImage,
      icon: "ri-book-3-line", // Default icon
      gradient: "linear-gradient(to top right, #4f46e5, #818cf8)", // Default gradient
      sellerName: CURRENT_USER.fullname,
      timeAgo: "Az önce"
    };

    USER_BOOKS.push(newBook);
    localStorage.setItem('user_books', JSON.stringify(USER_BOOKS));
    ALL_BOOKS = [...BOOKS, ...USER_BOOKS];

    renderCards(ALL_BOOKS);
    closeModal('post-modal', 'post-overlay');
    e.target.reset();
    currentBookImage = null;
    if (imagePreview) {
      imagePreview.innerHTML = '<i class="ri-image-add-line" style="font-size: 2rem; margin-bottom: 8px;"></i><p>Fotoğraf seçmek için tıklayın</p>';
    }

    // Scroll to listings
    document.getElementById('listings').scrollIntoView({ behavior: 'smooth' });
  });
  // #endregion

  // #region Category Tabs
  const categoryCards = document.querySelectorAll('.category-card');

  categoryCards.forEach(card => {
    card.addEventListener('click', () => {
      categoryCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      const filter = card.dataset.filter;
      renderCards(filter === 'all' ? ALL_BOOKS : ALL_BOOKS.filter(b => b.category === filter));
    });
  });
  // #endregion

  // #region Category Scroll Arrows
  const scrollBtns = document.querySelectorAll('.scroll-controls button');
  const categoryGrid = document.querySelector('.category-grid');
  if (scrollBtns.length >= 2 && categoryGrid) {
    scrollBtns[0].addEventListener('click', () => categoryGrid.scrollBy({ left: -260, behavior: 'smooth' }));
    scrollBtns[1].addEventListener('click', () => categoryGrid.scrollBy({ left: 260, behavior: 'smooth' }));
  }
  // #endregion

  // #region Search
  const searchInput = document.querySelector('.search-bar input');
  const searchBtn = document.querySelector('.search-bar .btn');

  function doSearch() {
    const q = searchInput.value.trim().toLowerCase();
    categoryCards.forEach(c => c.classList.remove('active'));
    document.querySelector('.category-card[data-filter="all"]').classList.add('active');

    if (!q) { renderCards(ALL_BOOKS); return; }

    renderCards(ALL_BOOKS.filter(b =>
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      (b.course && b.course.toLowerCase().includes(q)) ||
      b.category.toLowerCase().includes(q)
    ));
  }

  searchBtn.addEventListener('click', doSearch);
  searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });

  document.querySelectorAll('.popular-searches a').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      searchInput.value = a.textContent.trim();
      doSearch();
    });
  });
  // #endregion

});

// #endregion
