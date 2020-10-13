
let pageGlossary = undefined;

// Load glossary.json for searching
let req = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
req.onreadystatechange = res => {
    if (res.target.readyState == 4 && res.target.status == 200) {
        let glossary = JSON.parse(res.target.responseText.replace(
            /(\W)`([^`]+)`(\W)/g,
            '$1<span class=\\"inline-hljs\\"><pre><code>$2</code></pre></span>$3'
        ).replace(/(\W)\*(\w[^*]*?\w|\w{1,2})\*(\W)/g, '$1<i>$2</i>$3'));
        pageSearchLibrary = glossary;
        pageCompareProp = 'key';
    }
}
req.open('GET', '../glossary/glossary.json', true);
req.send();

function glossaryInit() {
    // Filter
    const matchFilter = window.location.href.match(/[&?]load=([\w\d]+)([;&]|$)/);
    const searchFilter = window.location.href.match(/[&?]search=([\w\d]+)([;&]|$)/);

    let filter = {
        key: matchFilter ? matchFilter[1] : null,
        search: searchFilter ? searchFilter[1] : null
    };

    if (filter.search !== null) {
        const searchBar = document.getElementById("search_docs");
        searchBar.value = filter.search;
    }

    Array.from(document.querySelectorAll('#docs .doc')).forEach(doc => {
        const elmKey = doc.id;
        console.log(elmKey);
        if ((filter.key && elmKey !== filter.key) ||
            (filter.search && !~elmKey.toLowerCase().indexOf(filter.search))
        ) {
            doc.style = 'display: none; visibility: hidden;';
        }
    });


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
