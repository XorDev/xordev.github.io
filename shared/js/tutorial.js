function getTutorial(tutorials, index) {
    let tut = tutorials[index];
    for (let elm in tut) {
        if (typeof tut[elm] === 'string') {
            tut[elm] = tut[elm].replace(/\*(\w.*?)\*/g, '<i>$1</i>');
        } else if (elm === "date") {
            let date = new Date(tut[elm] * 1000);
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            tut[elm] = `${date.getDate()} ${months[date.getMonth()]}, ${date.getFullYear()}`;
        }
    }
    return tut;
}

// Cache tutorial data in localStorage with timestamp
function loadTutorials() {
    // Check if we have cached data and it's less than 1 day old
    const cachedData = localStorage.getItem('tutorialData');
    const cacheTimestamp = localStorage.getItem('tutorialTimestamp');
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    
    // Use cached data if available and fresh
    if (cachedData && cacheTimestamp && (now - parseInt(cacheTimestamp)) < oneDay) {
        try {
            const tuts = JSON.parse(cachedData);
            processTutorialData(tuts);
            return;
        } catch (e) {
            // If parsing fails, fetch fresh data
            console.warn('Cached tutorial data invalid, fetching fresh data...');
        }
    }
    
    // Fetch fresh data
    const req = window.XMLHttpRequest ?
        new XMLHttpRequest() :
        new ActiveXObject('Microsoft.XMLHTTP');
        
    req.onreadystatechange = res => {
        if (res.target.readyState == 4) {
            if (res.target.status == 200) {
                try {
                    const tuts = JSON.parse(res.target.responseText);
                    
                    // Update cache
                    localStorage.setItem('tutorialData', res.target.responseText);
                    localStorage.setItem('tutorialTimestamp', now.toString());
                    
                    processTutorialData(tuts);
                } catch (e) {
                    console.error('Error parsing tutorial data:', e);
                }
            } else {
                console.error('Failed to load tutorial data, status:', res.target.status);
                // Try to use cached data even if it's old as a fallback
                const oldCachedData = localStorage.getItem('tutorialData');
                if (oldCachedData) {
                    try {
                        const tuts = JSON.parse(oldCachedData);
                        processTutorialData(tuts);
                        console.info('Using outdated cached tutorial data as fallback');
                    } catch (e) {
                        console.error('Could not use cached data:', e);
                    }
                }
            }
        }
    }
    
    req.open('GET', '../tutorials.json', true);
    req.send();
}

function processTutorialData(tuts) {
    pageSearchLibrary = tuts;
    pageCompareProp = 'name';
    
    if (document.readyState === 'complete') {
        appendContent(tuts);
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            appendContent(tuts);
        });
    }
}

function appendContent(tuts) {
    const pagename = window.location.pathname.match(/\/?([^/]+)\/?$/);
    if (!pagename) return;
    
    const currentPageName = pagename[1];
    const curTutInd = tuts.shaders.findIndex(t => t.pagename === currentPageName);
    if (curTutInd === -1) return;

    const bnavElms = document.getElementsByClassName('navigate-end');
    if (!bnavElms.length) return;

    // Build navigation HTML only once
    let bnav = '';
    if (curTutInd > 0) {
        const prevTut = tuts.shaders[curTutInd - 1];
        bnav += `
        <div class="previous">
            <div class="title">Previous tutorial:</div>
            <a href="../${prevTut.pagename}/">${prevTut.name}</a>
            <div class="desc">${prevTut.description}</div>
        </div>`;
    }
    
    bnav += `<div class="middle"></div>`;
    
    if (curTutInd < tuts.shaders.length - 1) {
        const nextTut = tuts.shaders[curTutInd + 1];
        bnav += `
        <div class="next">
            <div class="title">Next tutorial:</div>
            <a href="../${nextTut.pagename}/">${nextTut.name}</a>
            <div class="desc">${nextTut.description}</div>
        </div>`;
    }

    // Use document fragment for better performance when updating multiple elements
    const fragment = document.createDocumentFragment();
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = bnav;
    
    while (tempDiv.firstChild) {
        fragment.appendChild(tempDiv.firstChild);
    }

    for (let i = 0; i < bnavElms.length; i++) {
        bnavElms[i].innerHTML = '';
        bnavElms[i].appendChild(fragment.cloneNode(true));
    }
}

// Start loading tutorials
loadTutorials();
