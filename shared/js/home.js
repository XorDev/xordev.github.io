
function getTutorial(tutorials, index) {
    let tut = Object.assign({}, tutorials[index]);
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

// Fetch tutorials JSON with cache-busting
let req = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
req.onreadystatechange = function() {
    if (req.readyState == 4 && req.status == 200) {
        try {
            let tuts = JSON.parse(req.responseText);
            pageSearchLibrary = tuts;
            pageCompareProp = 'name';
            onDOMReady(function() { appendContent(tuts); });
        } catch(e) {
            console.error('Failed to parse tutorials.json:', e);
        }
    }
}
req.open('GET', 'tutorials/tutorials.json?v=3', true);
req.send();

function onDOMReady(fn) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', fn);
    } else {
        fn();
    }
}

function appendContent(tuts) {
    // Find latest tutorial across all categories
    let latestTut = null;
    let latestDate = 0;
    for (let cat in tuts) {
        let catTuts = tuts[cat];
        for (let i = 0; i < catTuts.length; i++) {
            if (catTuts[i].date > latestDate) {
                latestDate = catTuts[i].date;
                latestTut = { cat: cat, index: i };
            }
        }
    }

    // Render showcase
    let show = document.getElementById('showcase');
    if (latestTut && show) {
        let raw = tuts[latestTut.cat][latestTut.index];
        let tut = getTutorial(tuts[latestTut.cat], latestTut.index);
        let href = raw.url || ('./tutorials/' + tut.pagename + '/');
        let isExternal = !!raw.url;
        show.innerHTML =
            '<div class="showcase-card">' +
                '<div class="showcase-label">Latest Tutorial</div>' +
                '<a href="' + href + '"' + (isExternal ? ' target="_blank"' : '') + '>' +
                    '<div class="showcase-title">' + tut.name + (isExternal ? ' <i class="fas fa-external-link-alt showcase-ext"></i>' : '') + '</div>' +
                '</a>' +
                '<div class="showcase-desc">' + tut.description + '</div>' +
                '<span class="showcase-date">' + tut.date + '</span>' +
            '</div>';
    }

    // Build category tabs and content
    var categories = Object.keys(tuts);
    var tabsContainer = document.getElementById('category-tabs');
    var contentContainer = document.getElementById('tutorials-content');

    // Fallback: if new HTML structure isn't present, try old structure
    if (!contentContainer) {
        contentContainer = document.querySelector('#tutorials .grid');
        if (contentContainer) {
            // Old HTML structure - render flat grid like before
            renderFlatGrid(tuts, contentContainer);
            return;
        }
        console.error('Could not find tutorials container');
        return;
    }

    // Count totals
    var totalCount = 0;
    for (var c = 0; c < categories.length; c++) totalCount += tuts[categories[c]].length;

    // Add "All" tab
    if (tabsContainer) {
        var allTab = document.createElement('button');
        allTab.className = 'cat-tab active';
        allTab.setAttribute('data-category', 'all');
        allTab.innerHTML = 'All <span class="cat-count">' + totalCount + '</span>';
        allTab.addEventListener('click', function() { filterCategory('all'); });
        tabsContainer.appendChild(allTab);

        // Add a tab per category
        for (var c = 0; c < categories.length; c++) {
            (function(cat) {
                var tab = document.createElement('button');
                tab.className = 'cat-tab';
                tab.setAttribute('data-category', cat);
                tab.innerHTML = cat + ' <span class="cat-count">' + tuts[cat].length + '</span>';
                tab.addEventListener('click', function() { filterCategory(cat); });
                tabsContainer.appendChild(tab);
            })(categories[c]);
        }
    }

    // Render all tutorials grouped by category
    for (var c = 0; c < categories.length; c++) {
        var cat = categories[c];
        var catTuts = tuts[cat];

        // Category section container
        var section = document.createElement('div');
        section.className = 'category-section';
        section.setAttribute('data-category', cat);

        // Category heading
        var heading = document.createElement('div');
        heading.className = 'category-heading';
        heading.textContent = cat;
        section.appendChild(heading);

        // Render all tutorials in a unified grid
        var grid = document.createElement('div');
        grid.className = 'grid';
        for (var i = 0; i < catTuts.length; i++) {
            var tut = getTutorial(catTuts, i);
            var raw = catTuts[i];
            var a = document.createElement('a');

            if (raw.url) {
                // External tutorial (Substack)
                a.setAttribute('href', raw.url);
                a.setAttribute('target', '_blank');
                a.className = 'tutorial-link';
                var imgSrc = raw.image || '';
                a.innerHTML =
                    '<div class="item">' +
                        (imgSrc ? '<img src="' + imgSrc + '" alt="' + tut.name + '" loading="lazy">' : '<div class="item-placeholder"></div>') +
                        '<span>' + tut.name + ' <i class="fas fa-external-link-alt item-ext"></i></span>' +
                    '</div>';
            } else {
                // Local tutorial
                a.setAttribute('href', './tutorials/' + tut.pagename + '/');
                a.className = 'tutorial-link';
                a.innerHTML =
                    '<div class="item">' +
                        '<img src="./tutorials/' + tut.pagename + '/thumbnail.png" alt="' + tut.name + '" loading="lazy">' +
                        '<span>' + tut.name + '</span>' +
                    '</div>';
            }
            grid.appendChild(a);
        }
        section.appendChild(grid);

        contentContainer.appendChild(section);
    }
}

// Fallback for old HTML structure (backwards compatibility)
function renderFlatGrid(tuts, grid) {
    var count = 0;
    for (var type in tuts) {
        var typtuts = tuts[type];
        count += typtuts.length;
        for (var i = 0; i < typtuts.length; i++) {
            var tut = getTutorial(typtuts, i);
            var raw = typtuts[i];
            var a = document.createElement('a');
            if (raw.url) {
                a.setAttribute('href', raw.url);
                a.setAttribute('target', '_blank');
            } else {
                a.setAttribute('href', './tutorials/' + tut.pagename + '/');
            }
            if (raw.pagename) {
                a.innerHTML =
                    '<div class="item">' +
                        '<img src="./tutorials/' + tut.pagename + '/thumbnail.png">' +
                        '<span>' + tut.name + '</span>' +
                    '</div>';
            } else {
                a.innerHTML =
                    '<div class="item">' +
                        '<span>' + tut.name + '</span>' +
                    '</div>';
            }
            grid.appendChild(a);
        }
    }
}

function filterCategory(category) {
    // Update active tab
    var tabs = document.querySelectorAll('.cat-tab');
    for (var i = 0; i < tabs.length; i++) {
        if (tabs[i].getAttribute('data-category') === category) {
            tabs[i].classList.add('active');
        } else {
            tabs[i].classList.remove('active');
        }
    }

    // Show/hide category sections
    var sections = document.querySelectorAll('#tutorials-content .category-section');
    for (var i = 0; i < sections.length; i++) {
        if (category === 'all') {
            sections[i].style.display = '';
        } else {
            sections[i].style.display = sections[i].getAttribute('data-category') === category ? '' : 'none';
        }
    }
}
