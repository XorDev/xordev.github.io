
let req = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
req.onreadystatechange = res => {
    if (res.target.readyState == 4 && res.target.status == 200) {
        let glossary = JSON.parse(res.target.responseText.replace(
            /(\W)`([^`]+)`(\W)/g,
            '$1<span class=\\"inline-hljs\\"><pre><code>$2</code></pre></span>$3'
        ));
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
    console.log(glossary);

    const docs = document.getElementById('docs');

    const functions = glossary.functions;
    const variables = glossary.variables;
    const accessors = glossary.accessors;

    for (const type in glossary) {
        for (const elm of glossary[type]) {

            let properties = glsParse(elm);

            const temp = document.createElement('template');
            temp.innerHTML = html`
                <div class="${type} doc" id="${elm.key}">
                    ${properties}
                </div>
            `.trim();
            docs.append(temp.content.firstChild);
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
                    console.log(`array prop: ${prop}, val: ${elm[prop].length}`)
                    properties += html`
                        <div class="${prop} ${addClass}">
                            <div class="title">${addTitle}</div>
                            <ul><li>${elm[prop].map(val => typeof val == 'object' ? glsParse(val) : val ).reduce((acc, val) =>
                                acc + `</li><li>${val}`
                            )}</li></ul>
                        </div>
                    `.trim();
                } else {
                    console.log(`object: ${prop}`);
                    properties += glsParse(elm[prop]);
                }
                break;
        }
    }
    return properties.trim();
}
