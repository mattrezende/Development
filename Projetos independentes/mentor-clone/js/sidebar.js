const links = document.querySelectorAll('.sidebar-menu a');
const currentPage = window.location.pathname.split('/').pop();

links.forEach(link => {
  const href = link.getAttribute('href');

  if (href === currentPage || (currentPage === '' && href === 'index.html')) {
    link.classList.add('active');
  } else {
    link.classList.remove('active');
  }
});
