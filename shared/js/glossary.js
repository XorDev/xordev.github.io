
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


function appendContent(glossary) {
    console.log(glossary);

    const docs = document.getElementById('docs');

    // Sorry about this, it's just for syntax highlighting,
    // this WILL break in multiple browsers. Fix before release
    const html = a => String(a);

    const template = html`
        <div class="$TYPE doc" id="$NAME">
            <div class="key">$NAME</div>
            <div class="desc">$DESC</div>
        </div>
    `;

    const functions = glossary.functions;
    const variables = glossary.variables;
    const accessors = glossary.accessors;

    for (const type in glossary) {
        const tdoc = template.replace(/\$TYPE/g, type);
        for (const elm of glossary[type]) {
            let doc = tdoc.replace(/\$NAME/g, elm.hasOwnProperty('def') ? elm.def : elm.key);
            doc = doc.replace(/\$DESC/g, elm.desc);

            let used = ['key', 'desc', 'def'];

            const temp = document.createElement('template');
            temp.innerHTML = doc.trim();
            console.log(doc);
            docs.append(temp.content.firstChild);
        }
    }

    hljs.initHighlightingOnLoad();
}
