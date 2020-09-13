let slideIndex = 1;
showSlides(slideIndex);
function plusSlides(n) {
    showSlides((slideIndex += n));
    console.log("plusSlides -> n", n)
    console.log("plusSlides -> slideIndex", slideIndex)
    console.log("plusSlides -> slideIndex += n", slideIndex += n)
}
function showSlides(n) {
    let i;
    let slides = document.getElementsByClassName("mySlides");
    console.log(n, '2nd - n');
    if (n > slides.length) {
        slideIndex = 1;
    }
    if (n < 1) {
        slideIndex = slides.length;
    }
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    slides[slideIndex - 1].style.display = "block";
}
