
// Panel Toggle
function togglePanel(panelId) {
  if(panelId==='') {// Panelleri gizle
    document.querySelectorAll('.vis').forEach(panel => {
      panel.classList.replace('vis', 'invis');
    });
  }
  else{// Hedef paneli göster
    document.getElementById(panelId).classList.replace('invis', 'vis');
    document.getElementById('shade').classList.replace('invis', 'vis');
  }
}

function openCategory(categoryName) {
    document.getElementById('categories').classList.add('invis');
    document.getElementById('category-view').classList.remove('invis');
    document.getElementById('selected-category-title').innerText = categoryName;
}

function showMain() {
    document.getElementById('category-view').classList.add('invis');
    document.getElementById('categories').classList.remove('invis');
}

function showBookDetail(bookData) {
  document.getElementById('book-modal-img').src = bookData.img || 'https://placehold.co/150x200';
  document.getElementById('book-modal-title').innerText = bookData.title || 'Kitap Adı';
  document.getElementById('book-modal-author').innerText = bookData.author || 'Yazar';
  document.getElementById('book-modal-category').innerText = bookData.category || 'Kategori';
  document.getElementById('book-modal-level').innerText = bookData.level || 'Seviye';
  document.getElementById('book-modal-price').innerText = bookData.price || 'Fiyat';
  document.getElementById('book-modal-description').innerText = bookData.description || 'Kitap açıklaması burada görünecek.';
  document.getElementById('book-detail-modal').classList.replace('invis', 'vis');
  document.getElementById('shade').classList.replace('invis', 'vis');
}

function hideBookDetail() {
  document.getElementById('book-detail-modal').classList.replace('vis', 'invis');
  document.getElementById('shade').classList.replace('vis', 'invis');
}

document.addEventListener('DOMContentLoaded', () => {
  const closeBtn = document.getElementById('close-book-modal');
  if (closeBtn) closeBtn.onclick = hideBookDetail;

  document.querySelectorAll('.item-card').forEach(card => {
    card.onclick = function() {
      const img = card.querySelector('img') ? card.querySelector('img').src : 'https://placehold.co/150x200';
      const title = card.querySelector('#title') ? card.querySelector('#title').innerText : 'Kitap Adı';
      const author = card.querySelector('#author') ? card.querySelector('#author').innerText : 'Yazar';
      const category = card.querySelector('#category') ? card.querySelector('#category').innerText : 'Kategori';
      const level = card.querySelector('#level') ? card.querySelector('#level').innerText : 'Seviye';
      const price = card.querySelector('#price') ? card.querySelector('#price').innerText : 'Fiyat';
      const description = 'Kitap açıklaması burada görünecek.';
      showBookDetail({img, title, author, category, level, price, description});
    };
  });
});