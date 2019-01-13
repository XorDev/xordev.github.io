
let pageGlossary = undefined;

let req = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
req.onreadystatechange = res => {
    if (res.target.readyState == 4 && res.target.status == 200) {
        let glossary = JSON.parse(res.target.responseText.replace(
            /(\W)`([^`]+)`(\W)/g,
            '$1<span class=\\"inline-hljs\\"><pre><code>$2</code></pre></span>$3'
        ).replace(/(\W)\*(\w[^*]*?\w|\w{1,2})\*(\W)/g, '$1<i>$2</i>$3'));
        pageSearchLibrary = glossary;
        pageCompareProp = 'key';
        if (document.readyState === 'complete') appendContent(glossary);
        else document.onreadystatechange = () => {
            if (document.readyState === 'complete') appendContent(glossary);
        };
    }
}
req.open('GET', '../glossary/glossary.json', true);
req.send();

function appendContent(glossary) {
    const docs = document.getElementById('docs');

    const matchFilter = window.location.href.match(/[&?]load=([\w\d]+)([;&]|$)/);
    const searchFilter = window.location.href.match(/[&?]search=([\w\d]+)([;&]|$)/);

    let filter = {
        key: matchFilter ? matchFilter[1] : null,
        search: searchFilter ? searchFilter[1] : null
    };

    console.log(filter);

    const temp = document.createElement('template');
    for (const type in glossary) {
        let elms = [];
        for (const elm of glossary[type]) {
            if (
                filter.key    && (elm.key !== filter.key) ||
                filter.search && (!~elm.key.toLowerCase().indexOf(filter.search))
            ) continue;

            let properties = glsParse(elm);

            elms.push(`
                <div class="${type} doc" id="${elm.key}">
                    <div class="link" onclick="creacopURL(this, '${elm.key}')">Create link</div>
                    <div class="content">
                        ${properties}
                    </div>
                </div>
            `.trim());
        }
        if (elms.length) {
            temp.innerHTML += `<div id="${type}" class="type-title"><span>${type}</span></div>` +
                elms.join('');
        }
    }
    docs.append(temp.content);

    // Apply code specs
    const hljsElms = document.querySelectorAll('pre>code');
    for (let elm of hljsElms) {
        let meta = elm.innerText.match(/^{\w+:.+?}/);
        if (meta) {
            elm.innerText = elm.innerText.slice(meta[0].length);
            let keys = meta[0].match(/\w+:/g);
            let vals = meta[0].match(/:[^,}]+/g);
            let spec = {};

            for (let i = 0; i < keys.length; i++) {
                spec[keys[i].slice(0, -1)] = vals[i].slice(1);
            }

            if (spec.hasOwnProperty('lang')) elm.classList.add(spec.lang);
        }
    }

    hljs.initHighlighting();
}

function creacopURL(elm, key) {
    const link = `${window.location.href.match(/(.+?)(?:\?|$)/)[1]}?load=${key}`;

    if (elm.innerText === 'Create link')
        elm.innerText = link;

    const input = document.createElement('input');
        input.setAttribute('type', 'text');
        input.setAttribute('value', link);
    document.body.append(input);

    input.select();
    document.execCommand("copy");

    document.body.removeChild(input);

    let doc = document.documentElement;
    let top = (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);
    let div = document.createElement('div');
        div.setAttribute('class', 'cheese');
        div.setAttribute('style', `top:${Math.floor(elm.getBoundingClientRect().top + top + 24)}px;left:${Math.floor(elm.getBoundingClientRect().left + 32)}px;`);
        div.innerHTML = `Copied link to clipboard`;
    document.body.append(div);
    loadunload(div, 60, 3000);
}

function loadunload(div, startTime, endTime) {
    let clas = div.getAttribute('class');
    if (clas.match(/\bload\b/)) {
        div.setAttribute('class', clas.replace(/\s*\bload\b\s*/, ' '));
        setTimeout(() => { div.parentElement.removeChild(div); }, endTime / 2);

    } else setTimeout(() => {
        div.setAttribute('class', clas + ' load');
        setTimeout(() => { loadunload(div, startTime, endTime); }, endTime);
    }, '', startTime);
}

function glsParse(elm, used = []) {

    const special = {
        syntax: (elm, prop) => ({
            skip: elm[prop] === (elm.hasOwnProperty('def') ? elm.def : elm.key),
            val: `<span class="inline-hljs"><pre><code>${elm[prop]}</code></pre></span>`
        }),
        key: (elm, prop) => ({
            html: `<div class="name">${elm.hasOwnProperty('def') ? elm.def : elm.key}</div>`,
            skip: true
        }),
        def: (elm, prop) => ({ skip: true }),
        desc: (elm, props) => ({ title: `Description:`, class: 'block' }),
        examples: (elm, props) => ({
            title: elm[props].length < 2 && 'Example:',
            val: elm[props].map(s => `<pre><code>${s}</pre></code>`)
        })
    };

    let properties = '';
    for (const prop in elm) {
        if (!!~used.indexOf(prop)) continue;
        used.push(prop);

        let addTitle = '';
        let addClass = '';

        if (special.hasOwnProperty(prop)) {
            const test = special[prop](elm, prop);
            const testIs = prop => test.hasOwnProperty(prop) && test[prop];
            const testHas = prop => test.hasOwnProperty(prop);

            if (testHas('val')) elm[prop] = test.val;
            if (testHas('html')) properties += test.html;
            if (testHas('title')) addTitle = test.title;
            if (testHas('class')) addClass = test.class;
            if (testIs('skip')) continue;
        }

        if (!addTitle) addTitle = prop.slice(0, 1).toUpperCase() + prop.slice(1) + ':'

        switch (typeof elm[prop]) {
            case 'string':
                properties += `
                    <div class="${prop} ${addClass}">
                        <div class="title">${addTitle}</div>
                        ${elm[prop]}
                    </div>
                `.trim();
                break;
            case 'object':
                if (Array.isArray(elm[prop])) {
                    if (!elm[prop].length) break;
                    properties += `
                        <div class="${prop} ${addClass}">
                            <div class="title">${addTitle}</div>
                            <ul><li>${elm[prop].map(val => typeof val == 'object' ? glsParse(val) : val ).reduce((acc, val) =>
                                acc + `</li><li>${val}`
                            )}</li></ul>
                        </div>
                    `.trim();
                } else {
                    properties += glsParse(elm[prop]);
                }
                break;
        }
    }
    return properties.trim();
}
