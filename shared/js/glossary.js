
let pageGlossary = undefined;

let req = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
req.onreadystatechange = res => {
    if (res.target.readyState == 4 && res.target.status == 200) {
        let glossary = JSON.parse(res.target.responseText.replace(
            /(\W)`([^`]+)`(\W)/g,
            '$1<span class=\\"inline-hljs\\"><pre><code>$2</code></pre></span>$3'
        ).replace(/(\W)\*(\w[^*]*?\w|\w{1,2})\*(\W)/g, '$1<i>$2</i>$3'));
        pageGlossary = glossary;
        if (document.readyState === 'complete') appendContent(glossary);
        else document.onreadystatechange = () => {
            if (document.readyState === 'complete') appendContent(glossary);
        };
    }
}
req.open('GET', '../glossary/glossary.json', true);
req.send();

// This is not supported in all browsers, can safely be removed.
const html = (a, ...keys) => a.reduce((acc, val) => acc + keys.shift() + val);

function appendContent(glossary) {
    const docs = document.getElementById('docs');

    let filter = '';
    const matchFilter = window.location.href.match(/[&?]load=([\w\d]+)([;&]|$)/);
    if (matchFilter) {
        console.log(matchFilter[1]);
        filter = matchFilter[1];
    }

    const temp = document.createElement('template');
    for (const type in glossary) {
        let elms = [];
        for (const elm of glossary[type]) {
            if (filter && filter !== elm.key) continue;
    
            let properties = glsParse(elm);

            elms.push(`
                <div class="${type} doc" id="${elm.key}">
                    ${properties}
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

    hljs.initHighlightingOnLoad();
}

function glsParse(elm, used = []) {

    const special = {
        syntax: (elm, prop) => ({
            skip: elm[prop] === (elm.hasOwnProperty('def') ? elm.def : elm.key),
            val: html`<span class="inline-hljs"><pre><code>${elm[prop]}</code></pre></span>`
        }),
        key: (elm, prop) => ({
            html: html`<div class="name">${elm.hasOwnProperty('def') ? elm.def : elm.key}</div>`,
            skip: true
        }),
        def: (elm, prop) => ({ skip: true }),
        desc: (elm, props) => ({ title: `Description:`, class: 'block' }),
        examples: (elm, props) => ({
            title: elm[props].length < 2 && 'Example:',
            val: elm[props].map(s => html`<pre><code>${s}</pre></code>`)
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
                properties += html`
                    <div class="${prop} ${addClass}">
                        <div class="title">${addTitle}</div>
                        ${elm[prop]}
                    </div>
                `.trim();
                break;
            case 'object':
                if (Array.isArray(elm[prop])) {
                    if (!elm[prop].length) break;
                    properties += html`
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
