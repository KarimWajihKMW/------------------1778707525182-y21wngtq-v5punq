console.log('Akwadra Super Builder Initialized');

document.addEventListener('DOMContentLoaded', () => {
    const card = document.querySelector('.card');
    card.addEventListener('click', () => {
        console.log('تم النقر على البطاقة!');
        alert('أهلاً بك في عالم البناء بدون كود!');
    });
});