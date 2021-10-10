const fs = require('fs').promises;

const inlineHighlightJS = [/(\W)`([^`]+)`(\W)/g, '$1<span class=\\"inline-hljs\\"><pre><code>$2</code></pre></span>$3'];
const italics = [/(\W)\*(\w[^*]*?\w|\w{1,2})\*(\W)/g, '$1<i>$2</i>$3'];

fs.readFile('./glossary.json')
    .catch(err => console.error('Can\'t find file "GMshaders/glossary/glossary.json". Aborting operaion.'))
    .then(data => data.toString())
    .then(data => data.replace(...inlineHighlightJS))
    .then(data => data.replace(...italics))
    .then(JSON.parse)
    .then(generateGlossary);

async function generateGlossary(json) {
    const source = await fs.readFile('./index.html.source')
        .catch(err => console.error('Can\'t find file "GMshaders/glossary/index.html.source". Aborting operaion.'))
        .then(data => data.toString());

    fs.writeFile('./index.html', source.replace('{{DOCS}}', glossaryToString(json)));
    console.log('Successfully generated "GMshaders/glossary/index.html"');
}

function glossaryToString(glossary) {
    let temp = '';

    for (const type in glossary) {
        const elms = [];
        for (const elm of glossary[type]) {
            const properties = glsParse(elm);

            elms.push(`
                <div class="${type} doc" id="${elm.key}">
                    <div class="link" onclick="creacopURL(this, '${elm.key}')">Copy link</div>
                    <div class="content">
                        ${properties}
                    </div>
                </div>
            `.trim());
        }

        if (elms.length) {
            temp += `<div id="${type}" class="type-title"><span>${type}</span></div>` + elms.join('');
        }
    }

    return temp;
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
            val: elm[props].map(s => s && `<pre><code>${s}</pre></code>`)
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
