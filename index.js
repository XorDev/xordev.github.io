
console.log('called initalize at ' + window.location.href);

function initialize() {
    let tab = document.getElementById('tutorials-tab');
    tab.addEventListener('click', () => {
        document.getElementsByClassName('current')[0]
            .classList.remove('current');
        tab.classList.add('current');
    });
}
