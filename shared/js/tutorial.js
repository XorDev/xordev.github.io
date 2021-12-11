
requestTutorials();

function requestTutorials() {
    let req = window.XMLHttpRequest ?
        new XMLHttpRequest() :
        new ActiveXObject('Microsoft.XMLHTTP');
    req.onreadystatechange = res => {
        if (res.target.readyState == 4 && res.target.status == 200) {
            let tuts = JSON.parse(res.target.responseText);
            pageSearchLibrary = tuts;
            pageCompareProp = 'name';
            if (document.readyState === 'complete') appendContent(tuts);
            else document.onreadystatechange = () => {
                if (document.readyState === 'complete') appendContent(tuts);
            };
        }
    }
    req.open('GET', '../tutorials.json', true);
    req.send();
}

function getTutorial(tutorials, index) {
    let tut = tutorials[index];
    for (let elm in tut) {
        if (typeof tut[elm] === 'string') {
            tut[elm] = tut[elm].replace(/\*(\w.*?)\*/g, '<i>$1</i>');
        } else if (elm === "date") {
            let date = new Date(tut[elm] * 1000);
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            tut[elm] = `${date.getDate()} / ${
                months[date.getMonth()]} / ${date.getFullYear()}`;
        }
    }
    return tut;
}

function appendContent(tuts) {
    let pagename = window.location.pathname.match(/\/?([^/]+)\/?$/);
    if (!pagename) return;
    pagename = pagename[1];
    let curTutInd = tuts.shaders.findIndex(t => t.pagename === pagename);

    appendNavigateEnd(tuts.shaders, curTutInd);

    // HLSL <-> GLSL conversion controlls
    appendConversionControlls();
}

function convertCode(elmId, language) {
    document.getElementById(elmId).innerText = language;
}

function appendConversionControlls() {
    const codeElms = document.querySelectorAll('pre > code');

    let counter = 0;
    for (const codeElm of codeElms) {
        const id = counter++;
        const elmId = `codewrapper-${id}`;
        const codeWrapper = document.createElement('div');

        codeWrapper.setAttribute('id', elmId);
        codeWrapper.innerHTML = `
            <div class="controlls">
                <button onClick="convertCode('${elmId}', 'hlsl')" class='hlsl'>HLSL</button>
                <button onClick="convertCode('${elmId}', 'glsl')" class='glsl'>GLSL ES</button>
            </div>
        `;

        // Put <pre> inside wrapper
        const preElm = codeElm.parentElement;
        preElm.parentElement.insertBefore(codeWrapper, preElm);
        preElm.parentElement.removeChild(preElm);
        codeWrapper.append(preElm);
    }
}

function appendNavigateEnd(tutorials, index) {
    const bnavElm = document.getElementsByClassName('navigate-end')[0];

    if (!bnavElm) throw new Error('No element with the "navigate-end" class exists in this document');

    const prevTutorial = tutorials[index - 1];
    const nextTutorial = tutorials[index + 1];

    let bnav = '';
    if (index > 0) {
        bnav += `
            <div class="previous">
                <div class="title">Previous tutorial:</div>
                <a href="../${prevTutorial.pagename}/">${prevTutorial.name}</a>
                <div class="desc">${prevTutorial.description}</div>
            </div>
        `;
    }

    bnav += `<div class="middle"></div>`;

    if (index < tutorials.length - 1) {
        bnav += `
            <div class="next">
                <div class="title">Next tutorial:</div>
                <a href="../${nextTutorial.pagename}/">${nextTutorial.name}</a>
                <div class="desc">${nextTutorial.description}</div>
            </div>
        `;
    }

    bnavElm.innerHTML = bnav;
}
