
function getTutorial(tutorials, index) {
    let tut = tutorials[index];
    for (let elm in tut) {
        if (typeof tut[elm] === 'string') {
            tut[elm] = tut[elm].replace(/\*(\w.*?)\*/g, '<i>$1</i>');
        } else if (elm === "date") {
            let date = new Date(tut[elm] * 1000);
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            tut[elm] = `${date.getDate()} / ${months[date.getMonth()]} / ${date.getFullYear()}`;
        }
    }
    return tut;
}

let req = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
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
req.open('GET', 'tutorials/tutorials.json', true);
req.send();

function appendContent(tuts) {
    let show = document.getElementById('showcase');

    let tut = getTutorial(tuts.shaders, tuts.shaders.length - 1);

    show.innerHTML = `
        <div class="colon">Latest tutorial:</div>
        <div class="content">
            <div class="left">
                <a href="./tutorials/${tut.pagename}/"><div class="title">${tut.name}</div></a>
                <div class="description">${tut.description}</div>
            </div>
        </div>
        <div class="date">${tut.date}</div>`;

    const grid = document.querySelector('#tutorials .grid');
    let count = 0;

    for (let type in tuts) {
        let typtuts = tuts[type];
        count += typtuts.length;
        for (let i = 0; i < typtuts.length; i++) {
            let tut = getTutorial(typtuts, i);

            let a = document.createElement('a');
                a.setAttribute('href', `./tutorials/${tut.pagename}/`);
                a.innerHTML = `
                    <div class="item">
                        <img src="./tutorials/${tut.pagename}/thumbnail.png">
                        <span>${tut.name}</span>
                    </div>`;

            grid.appendChild(a);
        }
    }

    // Handle odd lists
    if (count % 2 === 1) {
        let div = document.createElement('div');
        div.classList.add('invisible');
        grid.appendChild(div);
    }
}
