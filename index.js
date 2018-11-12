
if (document.cookie.match('theme-white=true')) {
    const link = document.createElement('link');
        link.setAttribute('href', root + `white.css`);
        link.setAttribute('rel', `stylesheet`);
        link.setAttribute('class', `theme`);
    document.head.append(link);
}

window.addEventListener('focus', () => {
    const loadedTheme = document.querySelector('link.theme');
    let checked = !!document.cookie.match('theme-white=true');

    if (checked && !loadedTheme) {
        const link = document.createElement('link');
            link.setAttribute('href', `${root}white.css`);
            link.setAttribute('rel', `stylesheet`);
            link.setAttribute('class', `theme`);
        document.head.append(link);

    } else if (!checked && loadedTheme) {
        loadedTheme.parentElement.removeChild(loadedTheme);
    }
});

function initialize() {
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
                        Background image
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
}

function changeTheme(elm, theme) {
    const toggle = elm.querySelector('input');
    const checked = toggle.checked;
    const loadedTheme = document.querySelector('link.theme');

    let date = new Date();
        date.setFullYear(date.getFullYear() + 1);

    if (!document.cookie.match('accepted-cookies')) {
        const output = document.querySelector('#options-menu .message');
            output.innerText = 'This feature requires cookies to work. If you do not agree to our use of cookies, you can turn them off in your browser settings';

        document.cookie = `accepted-cookies=true; expires=${date}; path=/`;
    }

    document.cookie = `theme-white=${checked}; expires=${date}; path=/`;

    if (checked && !loadedTheme) {
        const link = document.createElement('link');
            link.setAttribute('href', `${root + theme}.css`);
            link.setAttribute('rel', `stylesheet`);
            link.setAttribute('class', `theme`);
        document.head.append(link);

    } else if (!checked && loadedTheme) {
        loadedTheme.parentElement.removeChild(loadedTheme);
    }
}
