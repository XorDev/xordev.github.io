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

function appendContent(tuts) {
    let pagename = window.location.pathname.match(/\/?([^/]+)\/?$/);
    if (!pagename) return;
    pagename = pagename[1];
    let curTutInd = tuts.shaders.findIndex(t => t.pagename === pagename);

    const bnavElms = document.getElementsByClassName('navigate-end');

    let bnav = '';
    if (curTutInd > 0) bnav += `
        <div class="previous">
            <div class="title">Previous tutorial:</div>
            <a href="../${tuts.shaders[curTutInd - 1].pagename}/">${tuts.shaders[curTutInd - 1].name}</a>
            <div class="desc">${tuts.shaders[curTutInd - 1].description}</div>
        </div>`;
    bnav += `<div class="middle"></div>`;
    if (curTutInd < tuts.shaders.length - 1) bnav += `
        <div class="next">
            <div class="title">Next tutorial:</div>
            <a href="../${tuts.shaders[curTutInd + 1].pagename}/">${tuts.shaders[curTutInd + 1].name}</a>
            <div class="desc">${tuts.shaders[curTutInd + 1].description}</div>
        </div>`;

    for (let bnavElm of bnavElms) {
        bnavElm.innerHTML = bnav;
    }

}
