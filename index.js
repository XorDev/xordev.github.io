
if (document.cookie.match('theme-white=true')) {
    const link = document.createElement('link');
        link.setAttribute('href', `./white.css`);
        link.setAttribute('rel', `stylesheet`);
        link.setAttribute('class', `theme`);
    document.head.append(link);
}

function initialize() {
    const tab = document.getElementById('tutorials-tab');
    const options = document.getElementById('options');

    tab.addEventListener('click', () => {
        document.getElementsByClassName('current')[0]
            .classList.remove('current');
        tab.classList.add('current');
    });

    options.addEventListener('click', () => {
        const existingMenu = document.getElementById('options-menu');

        if (!existingMenu) {
            const rect = options.getBoundingClientRect();
            const loadedTheme = document.querySelector('link.theme');
            const menu = document.createElement('div');
                menu.classList.add('floating-menu');
                menu.setAttribute('id', 'options-menu');
                menu.innerHTML = `
                    <div class="title">Options</div>
                    <div class="option" onclick="changeTheme(this, 'white')">
                        White theme
                        <label class="switch">
                            <input type="checkbox"${loadedTheme ? 'checked' : ''}>
                            <span class="slider"></span>
                        </label>
                    </div>
                    <div class="option message"></div>`;
                console.log(rect.right);
                menu.style=`top:calc(${rect.bottom}px - 2.3rem);right:calc(${window.innerWidth - rect.right}px - 1rem)`;

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
            link.setAttribute('href', `./${theme}.css`);
            link.setAttribute('rel', `stylesheet`);
            link.setAttribute('class', `theme`);
        document.head.append(link);

    } else if (!checked && loadedTheme) {
        loadedTheme.parentElement.removeChild(loadedTheme);
    }
}
