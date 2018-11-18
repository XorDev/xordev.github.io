
let req = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');
req.onreadystatechange = res => {
    if (res.target.readyState == 4 && res.target.status == 200) {
        let glossary = JSON.parse(res.target.responseText);
        if (document.readyState === 'complete') appendContent(glossary);
        else document.onreadystatechange = () => {
            if (document.readyState === 'complete') appendContent(glossary);
        };
    }
}
req.open('GET', 'glossary/glossary.json', true);
req.send();

function appendContent(glossary) {

}
