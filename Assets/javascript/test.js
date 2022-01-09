/****************** Handle slideshow ********************/
var slideIndex = 1;
var pause = false;
var slides = document.getElementsByClassName("mySlides");
var dots = document.getElementsByClassName("demo");
initializeSlideShow();


// Initialize slideShow and delay autoSlide
function initializeSlideShow() {
  showSlides(slideIndex);
  setTimeout(autoSlides, 5000); // Delay auto scrolling for 5 seconds
}

// Next/previous controls
function plusSlides(n) {
  showSlides(slideIndex += n);
  pausePlay();
}

// Thumbnail image controls
function currentSlide(n) {
  showSlides(slideIndex = n);
  pausePlay();
}

// Pause autoSlide when user interacts with slide controls
function pausePlay() {
  pause = true;
  setTimeout(() => {
    pause = false;
    }, 20000);
}

function showSlides(n) {
  var i;
  if (n > slides.length) {slideIndex = 1}
  if (n < 1) {slideIndex = slides.length}
  for (i = 0; i < slides.length; i++) {
      slides[i].style.display = "none";
  }
  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" active", "");
  }
  slides[slideIndex-1].style.display = "block";
  dots[slideIndex-1].className += " active";
  scrollTo();
}

function autoSlides() {
  if (pause === false) {
    var i;
    for (i = 0; i < slides.length; i++) {
      slides[i].style.display = "none";
    }
    for (i = 0; i < dots.length; i++) {
      dots[i].className = dots[i].className.replace(" active", "");
    }
    slideIndex++;
    if (slideIndex > slides.length) {slideIndex = 1}
    slides[slideIndex-1].style.display = "block";
    dots[slideIndex-1].className += " active";
    scrollTo();
  }
  setTimeout(autoSlides, 5000); // Change image every 5 seconds
}

// Scroll thumbnail into view
function scrollTo() {
  let navPos = $(".slideRow").scrollLeft();
  let position = $(".active").offset().left;
  $(".slideRow").animate({scrollLeft: navPos + position - 40}, 800);
}