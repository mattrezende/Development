document.querySelectorAll('.row-wrapper').forEach(wrapper => {

    const container = wrapper.querySelector('.row-container');
    const next = wrapper.querySelector('.next');
    const prev = wrapper.querySelector('.prev');

    const scrollAmount = 350;

    next.addEventListener('click', () => {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });

    prev.addEventListener('click', () => {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });


    /* SCROLL COM RODA DO MOUSE */
    container.addEventListener('wheel', e => {
        e.preventDefault();
        container.scrollLeft += e.deltaY;
    });


    /* DRAG COM MOUSE */

    let isDown = false;
    let startX;
    let scrollLeft;

    container.addEventListener('mousedown', e => {
        isDown = true;
        startX = e.pageX - container.offsetLeft;
        scrollLeft = container.scrollLeft;
    });

    container.addEventListener('mouseleave', () => {
        isDown = false;
    });

    container.addEventListener('mouseup', () => {
        isDown = false;
    });

    container.addEventListener('mousemove', e => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - container.offsetLeft;
        const walk = (x - startX) * 1.5;
        container.scrollLeft = scrollLeft - walk;
    });

});