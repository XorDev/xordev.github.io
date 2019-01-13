
if (document.cookie.match('theme-white=true')) loadTheme('white');

window.addEventListener('focus', () => {
    const loadedTheme = document.querySelector('link.theme');
    let checked = !!document.cookie.match('theme-white=true');

    if (checked && !loadedTheme) loadTheme('white');
    else if (!checked && loadedTheme) loadedTheme.parentElement.removeChild(loadedTheme);
});

let pageSearchLibrary = null;
let pageCompareProp = null;

async function searchbarUpdate(searchbar, evt) {
    if (!pageSearchLibrary) return;
    setTimeout(() => {

        if (evt.key.toLowerCase() === 'enter') {
            window.location.href = searchbar.value ?
                `./?search=${searchbar.value.toLowerCase()}` :
                `./`;
        }

        const valu = searchbar.value.toLowerCase();
        if (valu.length < 1) return;

        let results = [];

        for (const type in pageSearchLibrary) {
            for (const elm of pageSearchLibrary[type]) {
                if (!!~elm[pageCompareProp].toLowerCase().indexOf(valu)) results.push(elm);
                if (results.length > 9) break;
            }
            if (results.length > 9) break;
        }

        console.log(results);

        if (!results.length) return;

        results = results.sort((a, b) => ('' + a[pageCompareProp].attr).localeCompare(b[pageCompareProp].attr));

        let outputbox = searchbar.parentElement.parentElement.getElementsByClassName('results')[0];
        let resElement;
        let path = document.location.pathname;
        if (path.startsWith('/xorshaders')) path = path.slice(11);

        // glossary search
        if (path.endsWith('/glossary/')) resElement = res => `<a href="./?load=${res[pageCompareProp]}"><div class="result">${res[pageCompareProp]}</div></a>`;
        // home search
        else if (path.endsWith('/')) resElement = res => `<a href="./tutorials/${res.pagename}/"><div class="result">${res[pageCompareProp]}</div></a>`;


        let outstr = '';
        for (let result of results) {
            outstr += resElement(result);
        }
        outputbox.innerHTML = outstr;
    }, 20);
}

function initialize() {
    if (document.cookie.match('show-background=true')) {
        let bgimg = document.getElementsByClassName('background-image');
        bgimg[0].classList.remove('hidden');
    }

    const searchbars = document.querySelectorAll('.searchbar .bar input');
    for (let searchbar of searchbars) {
        searchbar.addEventListener('keydown', evt => searchbarUpdate(searchbar, evt));
        const returnbtn = document.querySelector('.searchbar .bar .return');
        if (returnbtn !== null) {
            returnbtn.addEventListener('click', () => document.location.href = './');
            if (!~document.location.href.indexOf('?')) returnbtn.classList.add('faded');
        }
    }

    const options = document.getElementById('options');

    options.addEventListener('click', () => {
        const existingMenu = document.getElementById('options-menu');

        if (!existingMenu) {
            const rect = options.getBoundingClientRect();
            const loadedTheme = document.querySelector('link.theme');
            let menuHTML = `
                <div class="title">Options</div>
                <div class="option" onclick="changeTheme(this, 'white')">
                    White theme
                    <label class="switch">
                        <input type="checkbox"${loadedTheme ? 'checked' : ''}>
                        <span class="slider"></span>
                    </label>
                </div>`;

            let bgimg = document.getElementsByClassName('background-image');
            if (bgimg && bgimg.length) {
                let toggled = bgimg[0].classList.contains('hidden');
                menuHTML += `
                    <div class="option" onclick="toggelBG(this)">
                        Background
                        <label class="switch">
                            <input type="checkbox"${toggled ? '' : 'checked'}>
                            <span class="slider"></span>
                        </label>
                    </div>`;
            }

            menuHTML += '<div class="option message"></div>';

            const menu = document.createElement('div');
                menu.classList.add('floating-menu');
                menu.setAttribute('id', 'options-menu');
                menu.innerHTML = menuHTML;
                menu.style=`top:calc(${rect.bottom}px - 2.3rem);right:calc(${window.innerWidth - rect.right}px - 2rem)`;


            options.append(menu);

            const escapeMenu = elm => {
                if (!menu) return document.removeEventListener('click', escapeMenu);
                if (!menu.contains(elm.target)) {
                    options.removeChild(menu);
                    document.removeEventListener('click', escapeMenu);
                }
            }

            const escapeMenuResize = elm => {
                if (!menu) return window.removeEventListener('resize', escapeMenuResize);
                options.removeChild(menu);
                window.removeEventListener('resize', escapeMenuResize);
            }

            setTimeout(() => {
                document.addEventListener('click', escapeMenu);
                window.addEventListener('resize', escapeMenuResize);
            }, 60)
        }
    });
}

function toggelBG(elm) {
    const toggle = elm.querySelector('input');
    let bgimg = document.getElementsByClassName('background-image');
    toggle.checked ? bgimg[0].classList.remove('hidden') : bgimg[0].classList.add('hidden');

    setCookie('show-background', toggle.checked);
}

function changeTheme(elm, theme) {
    const toggle = elm.querySelector('input');
    const checked = toggle.checked;
    const loadedTheme = document.querySelector('link.theme');

    setCookie('theme-white', checked);

    if (checked && !loadedTheme) {
        loadTheme('white');

    } else if (!checked && loadedTheme) {
        loadedTheme.parentElement.removeChild(loadedTheme);
    }
}

function loadTheme(theme) {
    const link = document.createElement('link');
        link.setAttribute('href', root + `shared/css/${theme}.css`);
        link.setAttribute('rel', `stylesheet`);
        link.setAttribute('class', `theme`);
    document.head.append(link);
}

function setCookie(name, checked) {
    let date = new Date();
        date.setFullYear(date.getFullYear() + 1);

    if (!document.cookie.match('accepted-cookies')) {
        const output = document.querySelector('#options-menu .message');
            output.innerText = 'This feature requires cookies to work. If you do not want this site to store cookies on your machine, you can turn them off in your browser settings';

        document.cookie = `accepted-cookies=true; expires=${date}; path=/`;
    }

    document.cookie = `${name}=${checked}; expires=${date}; path=/`;
}
