
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

            const name = elm.hasOwnProperty('def') ? elm.def : elm.key;

            //let used = ['key', 'desc', 'def'];
            let properties = glossParse(elm);

            // TODO: Prevent redundant info, and special treamtment for some info

            const temp = document.createElement('template');
            temp.innerHTML = html`
                <div class="${type} doc" id="${elm.key}">
                    <div class="name">${name}</div>
                    ${properties}
                    <div class="desc"><div class="title">Description:</div>${elm.desc}</div>
                </div>
            `.trim();
            docs.append(temp.content.firstChild);
        }
    }

    hljs.initHighlightingOnLoad();
}

function glossParse(elm) {
    let properties = '';
    for (const prop in elm) {
        switch (typeof elm[prop]) {
            case 'string':
                properties += html`
                    <div class="${prop}">
                        <div class="title">${prop.slice(0, 1).toUpperCase() + prop.slice(1)}:</div>
                        ${elm[prop]}
                    </div>
                `.trim();
                break;
            case 'object':
                if (Array.isArray(elm[prop])) {
                    if (!elm[prop].length) break;
                    properties += html`
                        <div class="${prop}">
                            <div class="title">${prop.slice(0, 1).toUpperCase() + prop.slice(1)}:</div>
                            <ul><li>${elm[prop].reduce((acc, val) =>
                                acc + `</li><li>${glossParse(val)}`
                            )}</li></ul>
                        </div>
                    `.trim();
                } else {
                    properties += glossParse(elm[prop]);
                }
                break;
        }
    }
    return properties;
}
