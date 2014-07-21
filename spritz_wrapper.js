// spritz.js
// A JavaScript Speed Reader
// rich@gun.io
// https://github.com/Miserlou/OpenSpritz

// Please don't abuse this.
// var readability_token = '172b057cd7cfccf27b60a36f16b1acde12783893';
var diffbot_token = '2efef432c72b5a923408e04353c39a7c';

function create_spritz(){

    spritz_loader = function() {
        //getURL("https://rawgithub.com/Miserlou/OpenSpritz/master/spritz.html", function(data){

        //getURL("https://rawgithub.com/Miserlou/OpenSpritz/dev/spritz.html", function(data){

        // This won't work in Firefox because an old bug and won't work in Chrome because of security stuff:
        //getURL("spritz.html", function(data){

        //getURL("https://rawgithub.com/Miserlou/OpenSpritz/dev/spritz.html", function(data){

        // RawGit's CDN usage:
        // "Since files are not refreshed after the first request,
        // it's best to use a specific tag or commit URL, not a branch URL."
        getURL("https://rawgit.com/smielke/OpenSpritz/experimental/spritz.html", function(data){
            var spritzContainer = document.getElementById("spritz_container");

            if (!spritzContainer) {
                var ele = document.createElement("div");
                data = data.replace(/(\r\n|\n|\r)/gm,"");
                ele.innerHTML = data;
                document.body.insertBefore(ele, document.body.firstChild);
                document.getElementById("spritz_toggle").style.display = "none";
                document.getElementById("spritz_toggle").onclick = function(){open_spritz.toggle()};
                open_spritz.onstart = function(){
                    document.getElementById("spritz_toggle").style.display = "block";
                    document.getElementById("spritz_toggle").textContent = "Pause";
                };
                open_spritz.onstop = function(){
                    document.getElementById("spritz_toggle").textContent = "Play";
                };
                open_spritz.assignElement(document.getElementById("spritz_result"));
                open_spritz.onupdate = function(){
                    var progressBar = document.getElementById("spritz_progress_bar");
                    progressBar.style.width = (100 - ((open_spritz.getPosition() / progressBar.max) * 100)) + "%";
                }
            }

            document.getElementById("spritz_selector").addEventListener("change", function() {
                var wpm = parseInt(document.getElementById("spritz_selector").value, 10);
                open_spritz.setWPM(wpm);
                if(open_spritz.getPosition() == open_spritz.getLength())
                    spritz();
            });
        });
    };

    spritz_loader();
}

function getURL(url, callback) {
    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            callback(xmlhttp.responseText);
        }
    };

    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

// Get the currently selected text, if any.
// Shameless pinched from StackOverflow.
function getSelectionText() {
    var text = "";
    if (typeof window.getSelection != "undefined") {
        var sel = window.getSelection();
        if (sel.rangeCount) {
            var container = document.createElement("div");
            for (var i = 0, len = sel.rangeCount; i < len; ++i) {
                container.appendChild(sel.getRangeAt(i).cloneContents());
            }
            text = container.innerText || container.textContent;
        }
    } else if (typeof document.selection != "undefined") {
        if (document.selection.type == "Text") {
            text = document.selection.createRange().text;
        }
    }
    if(text === ""){
        return false;
    }
    else{
        return text;
    }
}

// Uses the Readability API to get the juicy content of the current page.
function spritzifyURL(){
    var url = document.URL;

    //getURL("https://www.readability.com/api/content/v1/parser?url="+ encodeURIComponent(url) +"&token=" + readability_token +"&callback=?",
    getURL("https://api.diffbot.com/v2/article?url="+ encodeURIComponent(url) +"&token=" + diffbot_token, // +"&callback=?",
        function(data) {

            data = JSON.parse(data);

            if(data.error){
                document.getElementById("spritz_result").innerText = "Article extraction failed. Try selecting text instead.";
                return;
            }

            var title = '';
            if(data.title !== ""){
                title = data.title + ". ";
            }

            var author = '';
            if(data.author !== undefined){
                author = "By " + data.author + ". ";
            }

            var body = data.text;
            body = body.trim(); // Trim trailing and leading whitespace.
            body = body.replace(/\s+/g, ' '); // Shrink long whitespaces.

            var text_content = title + author + body;
            text_content = text_content.replace(/\./g, '. '); // Make sure punctuation is apprpriately spaced.
            text_content = text_content.replace(/\?/g, '? ');
            text_content = text_content.replace(/\!/g, '! ');
            open_spritz.spritzify( text_content );
            document.getElementById("spritz_progress_bar").max = open_spritz.getLength();
        });

}

// Entry point to the beef.
// Gets the WPM and the selected text, if any.
function spritz(){
    var selection = getSelectionText();
    if(selection){
        open_spritz.spritzify(selection);
        document.getElementById("spritz_progress_bar").max = open_spritz.getLength();
    }
    else{
        spritzifyURL();
    }
}