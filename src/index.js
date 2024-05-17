import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const API_KEY = '43938661-52f8b12a76731da0a686e36e5';

let searchQuery = '';
let page = 1;
let totalHits = 0;
let isFirstPage = true;

const form = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');

form.addEventListener('submit', async event => {
  event.preventDefault();
  searchQuery = event.currentTarget.elements.searchQuery.value.trim();

  if (!searchQuery.trim()) {
    Notiflix.Notify.failure('Please enter a search query.');
    return;
  }

  gallery.innerHTML = '';
  page = 1;
  totalHits = 0;
  isFirstPage = true;
  fetchImages();
});

function isScrollAtEnd() {
  return window.innerHeight + window.scrollY >= document.body.offsetHeight;
}

window.addEventListener('scroll', () => {
  if (isScrollAtEnd() && page * 40 <= totalHits) {
    fetchImages();
  }
});

async function fetchImages() {
  try {
    const response = await axios.get(
      `https://pixabay.com/api/?key=${API_KEY}&q=${searchQuery}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=40`
    );
    const images = response.data.hits;
    totalHits = response.data.totalHits;
    if (images.length === 0) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    } else {
      images.forEach(image => {
        const imageCard = createImageCard(image);
        gallery.insertAdjacentHTML('beforeend', imageCard);
      });

      const { height: cardHeight } = document
        .querySelector('.gallery')
        .firstElementChild.getBoundingClientRect();

      window.scrollBy({
        top: cardHeight * 2,
        behavior: 'smooth',
      });

      new SimpleLightbox('.photo-card a');
      if (images.length < 40) {
        Notiflix.Notify.info(
          "We're sorry, but you've reached the end of search results."
        );
      }
      if (isFirstPage) {
        Notiflix.Notify.success(`Hooray! We found ${totalHits} results.`);
      }
    }
    page += 1;
    isFirstPage = false;
  } catch (error) {
    console.error('Error:', error);
    Notiflix.Notify.failure('Something went wrong, please try again later.');
  }
}

function createImageCard(image) {
  return `
    <div class="photo-card">
    <a href="${image.largeImageURL}" class="lightbox">
      <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy" />
      </a>
      <div class="info">
        <p class="info-item">
          <b>Likes:</b> ${image.likes}
        </p>
        <p class="info-item">
          <b>Views:</b> ${image.views}
        </p>
        <p class="info-item">
              <b>Comments:</b> ${image.comments}
        </p>
        <p class="info-item">
          <b>Downloads:</b> ${image.downloads}
        </p>
      </div>
    </div>
  `;
}
